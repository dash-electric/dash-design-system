/**
 * Tier 6 — NPM publish prep tests.
 *
 * Hard-pin the package.json contract that drives `npm pack` / `pnpm publish`.
 * Catches accidental regressions like dropping the LICENSE entry from the
 * `files` whitelist or downgrading `engines.node` below the supported
 * minimum.
 *
 * These assertions are deliberately tight — bump them deliberately when the
 * publish contract changes.
 */

import { describe, expect, it } from "vitest"
import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = fileURLToPath(new URL(".", import.meta.url))
const PKG_ROOT = join(HERE, "..", "..")

async function readPkg(): Promise<Record<string, unknown>> {
  const raw = await readFile(join(PKG_ROOT, "package.json"), "utf8")
  return JSON.parse(raw)
}

describe("@dash/build publish prep", () => {
  it("declares an MIT license + named author", async () => {
    const pkg = await readPkg()
    expect(pkg.license).toBe("MIT")
    expect(typeof pkg.author).toBe("string")
    expect(pkg.author).toMatch(/Dash/i)
  })

  it("ships a LICENSE file at the package root", () => {
    expect(existsSync(join(PKG_ROOT, "LICENSE"))).toBe(true)
  })

  it("ships an .npmignore so dev-only files do not leak", () => {
    expect(existsSync(join(PKG_ROOT, ".npmignore"))).toBe(true)
  })

  it("files whitelist contains the required publish artefacts", async () => {
    const pkg = await readPkg()
    const files = pkg.files as string[]
    expect(files).toContain("dist")
    expect(files).toContain("preview-template")
    expect(files).toContain("scripts/probe-sandpack-cdn.mjs")
    expect(files).toContain("README.md")
    expect(files).toContain("CHANGELOG.md")
    expect(files).toContain("LICENSE")
  })

  it("declares a `bin` entry pointing into dist/", async () => {
    const pkg = await readPkg()
    const bin = pkg.bin as Record<string, string>
    expect(bin).toEqual({ "dash-build": "./dist/bin.js" })
  })

  it("requires Node >= 18 (we ship ESM + top-level await wrappers)", async () => {
    const pkg = await readPkg()
    const engines = pkg.engines as Record<string, string>
    expect(engines.node).toMatch(/>=\s*\d+/)
    const m = engines.node.match(/(\d+)/)
    expect(m).not.toBeNull()
    if (m) expect(Number(m[1])).toBeGreaterThanOrEqual(18)
  })

  it("publishes under a beta-track version while interfaces stabilise", async () => {
    const pkg = await readPkg()
    expect(typeof pkg.version).toBe("string")
    // 0.x.y (with optional pre-release) — explicitly NOT 1.0.0 yet.
    expect(pkg.version as string).toMatch(/^0\.\d+\.\d+(?:[-+].*)?$/)
  })

  it("declares a repository + homepage so npm registry pages link out", async () => {
    const pkg = await readPkg()
    expect(pkg.repository).toBeDefined()
    expect(pkg.homepage).toBeDefined()
  })
})
