import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { collectInfo, INFO_SCHEMA_VERSION } from "../info.js"
import type { RegistryIndex } from "../../lib/schema.js"

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dash-info-test-"))
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

const FIXTURE_INDEX: RegistryIndex = {
  name: "@dash",
  homepage: "https://ds.dash.com",
  items: [
    { name: "button", type: "registry:ui", title: "Button", description: "btn" },
    { name: "card", type: "registry:ui", title: "Card", description: "card" },
    { name: "ai-rules", type: "registry:file", title: "AI", description: "rules" },
  ],
}

describe("dash info — collectInfo", () => {
  let tmp: string

  beforeEach(() => {
    tmp = mkTmp()
    delete process.env.DASH_REGISTRY_TOKEN
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("detects framework=next + typescript + pnpm from package.json + lockfile", async () => {
    writeJson(path.join(tmp, "package.json"), {
      name: "consumer",
      dependencies: { next: "15.0.0", react: "19.0.0" },
      devDependencies: { typescript: "5.5.0" },
    })
    fs.writeFileSync(path.join(tmp, "pnpm-lock.yaml"), "lockfileVersion: 9.0\n")
    writeJson(path.join(tmp, "tsconfig.json"), { compilerOptions: {} })

    const snap = await collectInfo({ cwd: tmp, _index: null })
    expect(snap.schemaVersion).toBe(INFO_SCHEMA_VERSION)
    expect(snap.project.framework).toBe("next")
    expect(snap.project.typescript).toBe(true)
    expect(snap.project.packageManager).toBe("pnpm")
    expect(snap.project.rootPath).toBe(tmp)
  })

  it("falls back to framework=unknown when nothing matches", async () => {
    writeJson(path.join(tmp, "package.json"), { name: "x", dependencies: {} })
    const snap = await collectInfo({ cwd: tmp, _index: null })
    expect(snap.project.framework).toBe("unknown")
    expect(snap.project.packageManager).toBe("unknown")
  })

  it("reads aliases + registry URL from components.json", async () => {
    writeJson(path.join(tmp, "components.json"), {
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
        ui: "@/components/ui",
      },
      registries: {
        "@dash": { url: "https://ds.dash.com" },
      },
    })

    const snap = await collectInfo({ cwd: tmp, _index: null })
    expect(snap.dash.registryUrl).toBe("https://ds.dash.com")
    expect(snap.aliases.components).toBe("@/components")
    expect(snap.aliases.ui).toBe("@/components/ui")
  })

  it("hides token but reports hasToken=true when .env.local has DASH_REGISTRY_TOKEN", async () => {
    fs.writeFileSync(
      path.join(tmp, ".env.local"),
      "DASH_REGISTRY_TOKEN=dash_pat_SECRET_xyz\nOTHER=1\n",
    )
    const snap = await collectInfo({ cwd: tmp, _index: null })
    expect(snap.dash.hasToken).toBe(true)
    // never expose the token value anywhere in the snapshot
    const serialized = JSON.stringify(snap)
    expect(serialized).not.toContain("dash_pat_SECRET_xyz")
  })

  it("finds installed registry items by scanning aliased component dirs", async () => {
    writeJson(path.join(tmp, "components.json"), {
      aliases: {
        components: "@/components",
        ui: "@/components/ui",
      },
      registries: { "@dash": { url: "https://ds.dash.com" } },
    })
    const uiDir = path.join(tmp, "components", "ui")
    fs.mkdirSync(uiDir, { recursive: true })
    fs.writeFileSync(path.join(uiDir, "button.tsx"), "export const Button = () => null")
    fs.writeFileSync(path.join(uiDir, "card.tsx"), "export const Card = () => null")

    const snap = await collectInfo({ cwd: tmp, _index: FIXTURE_INDEX })
    const names = snap.dash.installedItems.map((i) => i.name).sort()
    expect(names).toEqual(["button", "card"])
    expect(snap.dash.installedItems[0].path).toMatch(/components\/ui/)
  })

  it("detects custom hooks and api base URL, excludes @dash hooks", async () => {
    writeJson(path.join(tmp, "components.json"), {
      aliases: { hooks: "@/hooks" },
      registries: { "@dash": { url: "https://ds.dash.com" } },
    })
    const hooksDir = path.join(tmp, "hooks")
    fs.mkdirSync(hooksDir, { recursive: true })
    fs.writeFileSync(path.join(hooksDir, "useAuth.ts"), "export function useAuth() {}")
    fs.writeFileSync(path.join(hooksDir, "useDelivery.ts"), "export function useDelivery() {}")
    fs.writeFileSync(path.join(hooksDir, "notAHook.ts"), "export const x = 1")
    fs.writeFileSync(
      path.join(tmp, ".env.local"),
      "NEXT_PUBLIC_API_URL=https://api.dash-express.com/v1\n",
    )

    const snap = await collectInfo({ cwd: tmp, _index: FIXTURE_INDEX })
    expect(snap.customHooks.sort()).toEqual(["useAuth", "useDelivery"])
    expect(snap.apiBaseUrl).toBe("https://api.dash-express.com/v1")
  })
})
