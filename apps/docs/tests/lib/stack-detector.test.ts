/**
 * dash-stack-detector — Vitest spec
 *
 * Creates ephemeral test repos in os.tmpdir() that mimic each known Dash FE
 * stack signature, then asserts detectDashRepoStack returns the right label.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import {
  detectDashRepoStack,
  type DashRepoStack,
} from "../../registry/dash/lib/stack-detector"

let tmp: string

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dash-stack-"))
})

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true })
})

function writeJson(rel: string, data: unknown) {
  const file = path.join(tmp, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function touch(rel: string, content = "") {
  const file = path.join(tmp, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

function mkdir(rel: string) {
  fs.mkdirSync(path.join(tmp, rel), { recursive: true })
}

describe("detectDashRepoStack", () => {
  it("detects portal-v2 (Next App + TS + jotai + AlignUI)", () => {
    writeJson("package.json", {
      dependencies: { next: "^14.0.0", jotai: "^2.0.0", react: "^18.0.0" },
    })
    writeJson("tsconfig.json", { compilerOptions: {} })
    mkdir("app")
    touch("app/layout.tsx", "")
    touch("components/ui/button.tsx", "export {}\n")

    const res = detectDashRepoStack(tmp)
    expect(res.stack).toBe<DashRepoStack>("portal-v2")
    expect(res.confidence).toBe("high")
    expect(res.signals.join(" ")).toContain("jotai")
  })

  it("detects backoffice (Next Pages + JS + NextAuth + MUI)", () => {
    writeJson("package.json", {
      dependencies: {
        next: "^13.0.0",
        "next-auth": "^4.0.0",
        "@mui/material": "^5.0.0",
        react: "^18.0.0",
      },
    })
    mkdir("pages")
    touch("pages/index.js", "")

    const res = detectDashRepoStack(tmp)
    expect(res.stack).toBe<DashRepoStack>("backoffice")
    expect(res.confidence).toBe("high")
    expect(res.signals.join(" ")).toMatch(/MUI|antd/)
  })

  it("detects halo-fe (Next Pages + JS + AlignUI vendored file:)", () => {
    writeJson("package.json", {
      dependencies: {
        next: "^13.0.0",
        react: "^18.0.0",
        "@halo/align-ui": "file:./vendor/align-ui",
      },
    })
    mkdir("pages")
    touch("pages/index.js", "")

    const res = detectDashRepoStack(tmp)
    expect(res.stack).toBe<DashRepoStack>("halo-fe")
    expect(res.confidence).toBe("high")
    expect(res.signals.join(" ")).toContain("vendored")
  })

  it("detects basecamp (Next App + TS + zustand + Firebase)", () => {
    writeJson("package.json", {
      dependencies: {
        next: "^14.0.0",
        zustand: "^4.0.0",
        firebase: "^10.0.0",
        react: "^18.0.0",
      },
    })
    writeJson("tsconfig.json", { compilerOptions: {} })
    mkdir("app")
    touch("app/layout.tsx", "")

    const res = detectDashRepoStack(tmp)
    expect(res.stack).toBe<DashRepoStack>("basecamp")
    expect(res.confidence).toBe("high")
    expect(res.signals.join(" ")).toContain("zustand")
    expect(res.signals.join(" ")).toContain("firebase")
  })

  it("detects fleet-mgmt (CRA + react-router-dom v7)", () => {
    writeJson("package.json", {
      dependencies: {
        "react-scripts": "5.0.1",
        "react-router-dom": "^7.0.0",
        react: "^18.0.0",
      },
    })

    const res = detectDashRepoStack(tmp)
    expect(res.stack).toBe<DashRepoStack>("fleet-mgmt")
    expect(res.confidence).toBe("high")
    expect(res.signals.join(" ")).toContain("react-scripts")
  })

  it("returns unknown when no profile matches", () => {
    writeJson("package.json", {
      dependencies: {
        // No next, no react-scripts — generic node project.
        express: "^4.0.0",
      },
    })

    const res = detectDashRepoStack(tmp)
    expect(res.stack).toBe<DashRepoStack>("unknown")
    expect(res.confidence).toBe("low")
  })
})
