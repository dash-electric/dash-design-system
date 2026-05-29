import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { runAdd, stampDashHeader } from "../add.js"
import type { RegistryFile, RegistryItem } from "../../lib/schema.js"

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dash-add-theme-"))
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

/**
 * Stub global fetch so `runAdd` can resolve a tiny one-item registry without
 * touching the network. The registry GET pattern is `/<name>.json`.
 */
function stubRegistry(item: RegistryItem): () => void {
  const original = global.fetch
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString()
    if (url.endsWith(`/${item.name}.json`) || url.endsWith(`/r/${item.name}.json`)) {
      return new Response(JSON.stringify(item), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    }
    return new Response("not found", { status: 404 })
  }) as typeof global.fetch
  return () => {
    global.fetch = original
  }
}

const ITEM: RegistryItem = {
  name: "button",
  type: "registry:ui",
  title: "Button",
  description: "btn",
  files: [
    {
      path: "ui/button.tsx",
      type: "registry:ui",
      content: "export const Button = () => null\n",
    },
  ],
  meta: { version: "1.0.0" },
}

describe("dashkit add — theme integration", () => {
  let tmp: string
  let restore: () => void

  beforeEach(() => {
    tmp = mkTmp()
    restore = stubRegistry(ITEM)
  })

  afterEach(() => {
    restore()
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("stamps @dash theme into the header when theme is supplied", () => {
    const file: RegistryFile = {
      path: "ui/button.tsx",
      type: "registry:ui",
      content: "export const X = 1\n",
    }
    const stamped = stampDashHeader(file, "button", "1.0.0", "logistic")
    expect(stamped.content).toMatch(/@dash version 1\.0\.0/)
    expect(stamped.content).toMatch(/@dash theme logistic/)
  })

  it("omits @dash theme when no theme passed (back-compat)", () => {
    const file: RegistryFile = {
      path: "ui/button.tsx",
      type: "registry:ui",
      content: "export const X = 1\n",
    }
    const stamped = stampDashHeader(file, "button", "1.0.0")
    expect(stamped.content).toMatch(/@dash version 1\.0\.0/)
    expect(stamped.content).not.toMatch(/@dash theme/)
  })

  it("writes theme css to styles/dash-theme-<name>.css when --theme is used", async () => {
    writeJson(path.join(tmp, "components.json"), {
      aliases: { ui: "@/components/ui" },
      registries: { "@dash": { url: "http://stub.invalid" } },
    })
    await runAdd({
      names: ["button"],
      yes: true,
      cwd: tmp,
      registryUrl: "http://stub.invalid",
      theme: "logistic",
      noCache: true,
    })
    const themeCss = path.join(tmp, "styles", "dash-theme-logistic.css")
    expect(fs.existsSync(themeCss)).toBe(true)
    expect(fs.readFileSync(themeCss, "utf-8")).toMatch(/--theme-accent-500/)
  })

  it("uses default theme=ride when no flag and no components.json field", async () => {
    writeJson(path.join(tmp, "components.json"), {
      aliases: { ui: "@/components/ui" },
      registries: { "@dash": { url: "http://stub.invalid" } },
    })
    await runAdd({
      names: ["button"],
      yes: true,
      cwd: tmp,
      registryUrl: "http://stub.invalid",
      noCache: true,
    })
    const themeCss = path.join(tmp, "styles", "dash-theme-ride.css")
    expect(fs.existsSync(themeCss)).toBe(true)
  })

  it("auto-detects theme from components.json dashTheme field", async () => {
    writeJson(path.join(tmp, "components.json"), {
      aliases: { ui: "@/components/ui" },
      registries: { "@dash": { url: "http://stub.invalid" } },
      dashTheme: "marketplace",
    })
    await runAdd({
      names: ["button"],
      yes: true,
      cwd: tmp,
      registryUrl: "http://stub.invalid",
      noCache: true,
    })
    expect(
      fs.existsSync(path.join(tmp, "styles", "dash-theme-marketplace.css")),
    ).toBe(true)
    // ensure no stale ride css was written
    expect(
      fs.existsSync(path.join(tmp, "styles", "dash-theme-ride.css")),
    ).toBe(false)
  })
})
