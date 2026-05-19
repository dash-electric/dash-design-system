import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { detectFramework, scaffoldFor } from "../framework-detector.js"

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dash-fw-test-"))
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function touch(file: string, content = ""): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

describe("detectFramework", () => {
  let tmp: string

  beforeEach(() => {
    tmp = mkTmp()
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("detects next-app from next dep + app/layout.tsx", () => {
    writeJson(path.join(tmp, "package.json"), {
      dependencies: { next: "15.0.0", react: "19.0.0" },
    })
    touch(path.join(tmp, "app", "layout.tsx"), "export default function L(){}")
    expect(detectFramework(tmp)).toBe("next-app")
  })

  it("detects next-pages from next dep + pages/_app.tsx", () => {
    writeJson(path.join(tmp, "package.json"), {
      dependencies: { next: "14.0.0", react: "18.0.0" },
    })
    touch(path.join(tmp, "pages", "_app.tsx"), "export default function A(){}")
    expect(detectFramework(tmp)).toBe("next-pages")
  })

  it("detects vite from vite + react deps", () => {
    writeJson(path.join(tmp, "package.json"), {
      dependencies: { react: "18.2.0" },
      devDependencies: { vite: "5.0.0", "@vitejs/plugin-react": "4.0.0" },
    })
    touch(path.join(tmp, "vite.config.ts"), "export default {}")
    expect(detectFramework(tmp)).toBe("vite")
  })

  it("detects remix from @remix-run/react (not vite even if remix uses vite)", () => {
    writeJson(path.join(tmp, "package.json"), {
      dependencies: {
        "@remix-run/react": "2.0.0",
        "@remix-run/node": "2.0.0",
        react: "18.2.0",
      },
      devDependencies: { "@remix-run/dev": "2.0.0", vite: "5.0.0" },
    })
    expect(detectFramework(tmp)).toBe("remix")
  })

  it("detects astro from astro dep", () => {
    writeJson(path.join(tmp, "package.json"), {
      dependencies: { astro: "4.0.0" },
    })
    expect(detectFramework(tmp)).toBe("astro")
  })

  it("detects cra from react-scripts + craco (mimics react-fleet-management-web)", () => {
    writeJson(path.join(tmp, "package.json"), {
      dependencies: {
        react: "18.2.0",
        "react-scripts": "5.0.1",
        "@craco/craco": "7.1.0",
      },
    })
    touch(path.join(tmp, "craco.config.js"), "module.exports = {}")
    expect(detectFramework(tmp)).toBe("cra")
  })

  it("detects plain react when no framework markers are present", () => {
    writeJson(path.join(tmp, "package.json"), {
      dependencies: { react: "18.2.0", "react-dom": "18.2.0" },
    })
    expect(detectFramework(tmp)).toBe("react")
  })

  it("returns unknown when package.json missing entirely", () => {
    expect(detectFramework(tmp)).toBe("unknown")
  })

  it("returns unknown when no react / framework deps", () => {
    writeJson(path.join(tmp, "package.json"), {
      dependencies: { lodash: "4.0.0" },
    })
    expect(detectFramework(tmp)).toBe("unknown")
  })
})

describe("scaffoldFor", () => {
  it("uses @/ alias for next-app + app/globals.css", () => {
    const s = scaffoldFor("next-app")
    expect(s.aliasPrefix).toBe("@/")
    expect(s.globalsCss).toBe("app/globals.css")
    expect(s.rsc).toBe(true)
  })

  it("uses ~/ alias for remix + app/tailwind.css", () => {
    const s = scaffoldFor("remix")
    expect(s.aliasPrefix).toBe("~/")
    expect(s.globalsCss).toBe("app/tailwind.css")
    expect(s.aliasComponents).toBe("~/components")
    expect(s.rsc).toBe(false)
  })

  it("uses src/index.css for vite", () => {
    expect(scaffoldFor("vite").globalsCss).toBe("src/index.css")
  })

  it("uses src/index.css for cra (matches react-fleet-management-web layout)", () => {
    expect(scaffoldFor("cra").globalsCss).toBe("src/index.css")
  })

  it("uses src/styles/global.css for astro", () => {
    expect(scaffoldFor("astro").globalsCss).toBe("src/styles/global.css")
  })

  it("uses styles/globals.css for next-pages", () => {
    expect(scaffoldFor("next-pages").globalsCss).toBe("styles/globals.css")
  })

  it("falls back to next-app layout for unknown", () => {
    const s = scaffoldFor("unknown")
    expect(s.globalsCss).toBe("app/globals.css")
    expect(s.aliasPrefix).toBe("@/")
  })
})
