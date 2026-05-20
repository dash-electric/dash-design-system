/**
 * Integration tests for `dash add` namespace dispatch.
 *
 * Verifies:
 *   - `dash add button` (bare) hits the @dash registry URL
 *   - `dash add @dash/button` (explicit) hits the same URL → backward compat
 *   - `dash add @trellis/x` hits the per-namespace URL from components.json
 *   - Unknown namespace throws RegistryError with namespace list suggestion
 *   - cross-namespace `dash add @dash/a @trellis/b` fans out to BOTH URLs
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { runAdd } from "../add.js"
import { RegistryError } from "../../lib/registry-fetch.js"
import { cacheClear } from "../../lib/cache.js"
import type { RegistryItem } from "../../lib/schema.js"

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dash-add-ns-"))
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

const BUTTON: RegistryItem = {
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

const TENANT_BLOCK: RegistryItem = {
  name: "tenant-block",
  type: "registry:block",
  title: "Tenant Block",
  description: "trellis tenant block",
  files: [
    {
      path: "blocks/tenant-block.tsx",
      type: "registry:block",
      content: "export const TenantBlock = () => null\n",
    },
  ],
  meta: { version: "1.0.0" },
}

/**
 * Spy fetch that records every requested URL and replies based on host.
 * Returns the URL log so each test can assert the dispatch was correct.
 */
function spyDispatchFetch(): { urls: string[]; restore: () => void } {
  const urls: string[] = []
  const original = global.fetch
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString()
    urls.push(url)
    if (url.includes("/button.json")) {
      return new Response(JSON.stringify(BUTTON), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    }
    if (url.includes("/tenant-block.json")) {
      return new Response(JSON.stringify(TENANT_BLOCK), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    }
    return new Response("not found", { status: 404 })
  }) as typeof global.fetch
  return {
    urls,
    restore: () => {
      global.fetch = original
    },
  }
}

describe("dash add — namespace dispatch", () => {
  let tmp: string
  let spy: { urls: string[]; restore: () => void }

  beforeEach(() => {
    cacheClear()
    tmp = mkTmp()
    spy = spyDispatchFetch()
    // Minimal components.json with TWO registry entries
    writeJson(path.join(tmp, "components.json"), {
      style: "default",
      tsx: true,
      rsc: true,
      tailwind: {
        config: "",
        css: "app/globals.css",
        baseColor: "neutral",
        cssVariables: true,
      },
      aliases: {
        components: "@/components",
        ui: "@/components/ui",
        lib: "@/lib",
        utils: "@/lib/utils",
        hooks: "@/hooks",
      },
      registries: {
        "@dash": { url: "https://ds.dash.example" },
        "@trellis": { url: "https://trellis.example" },
      },
    })
    // Stub theme css read to avoid filesystem lookup
    fs.mkdirSync(path.join(tmp, "styles"), { recursive: true })
  })

  afterEach(() => {
    spy.restore()
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("bare name `button` dispatches to the @dash registry URL", async () => {
    await runAdd({ names: ["button"], yes: true, cwd: tmp, dryRun: true, noCache: true })
    expect(spy.urls.some((u) => u.startsWith("https://ds.dash.example"))).toBe(
      true,
    )
    expect(spy.urls.some((u) => u.startsWith("https://trellis.example"))).toBe(
      false,
    )
  })

  it("explicit @dash/button matches bare name behavior (backward compat)", async () => {
    await runAdd({
      names: ["@dash/button"],
      yes: true,
      cwd: tmp,
      dryRun: true,
      noCache: true,
    })
    expect(spy.urls.some((u) => u.startsWith("https://ds.dash.example"))).toBe(
      true,
    )
  })

  it("@trellis/tenant-block dispatches to the @trellis registry URL", async () => {
    await runAdd({
      names: ["@trellis/tenant-block"],
      yes: true,
      cwd: tmp,
      dryRun: true,
      noCache: true,
    })
    expect(spy.urls.some((u) => u.startsWith("https://trellis.example"))).toBe(
      true,
    )
    expect(
      spy.urls.some((u) => u.startsWith("https://ds.dash.example")),
    ).toBe(false)
  })

  it("mixed `@dash/button @trellis/tenant-block` fans out to BOTH URLs", async () => {
    await runAdd({
      names: ["@dash/button", "@trellis/tenant-block"],
      yes: true,
      cwd: tmp,
      dryRun: true,
      noCache: true,
    })
    expect(spy.urls.some((u) => u.startsWith("https://ds.dash.example"))).toBe(
      true,
    )
    expect(spy.urls.some((u) => u.startsWith("https://trellis.example"))).toBe(
      true,
    )
  })

  it("unknown namespace throws RegistryError with suggestion", async () => {
    const err = await runAdd({
      names: ["@nonexistent/x"],
      yes: true,
      cwd: tmp,
      dryRun: true,
      noCache: true,
    }).catch((e) => e)
    // The catch may unwrap or rethrow; allow either
    if (err && err.message && /Resolve failed/.test(err.message)) {
      // wrapper error from spinner — surface inner
      expect(err.message).toMatch(/Unknown namespace/)
      return
    }
    expect(err).toBeInstanceOf(RegistryError)
    expect((err as RegistryError).message).toMatch(/Unknown namespace/)
  })
})
