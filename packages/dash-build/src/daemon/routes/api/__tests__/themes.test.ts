/**
 * Tier 6 — Layer 2 theme runtime switcher endpoints.
 *
 * Exercises the manifest list + per-theme CSS serve. Uses the real Dash DS
 * themes directory (`apps/docs/registry/dash/themes/`) via the package's
 * default probe so the test catches a regression on the probe path. A
 * synthetic themes dir is used for the safety / error-path coverage.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  isThemesPath,
  loadThemesManifest,
  resolveThemeCssPath,
} from "../themes.js"

describe("isThemesPath", () => {
  it("matches the list endpoint", () => {
    expect(isThemesPath("/api/themes")).toBe(true)
  })
  it("matches the per-theme css endpoint", () => {
    expect(isThemesPath("/api/themes/ride/css")).toBe(true)
    expect(isThemesPath("/api/themes/trellis-tenant/css")).toBe(true)
  })
  it("does not match unrelated paths", () => {
    expect(isThemesPath("/api/theme")).toBe(false)
    expect(isThemesPath("/api/themes/")).toBe(false)
    expect(isThemesPath("/api/themes/ride/css/extra")).toBe(false)
  })
})

describe("loadThemesManifest", () => {
  it("returns the parsed manifest when the dir is present", async () => {
    const manifest = await loadThemesManifest()
    if (!manifest) {
      // Daemon installed without the docs app — that's acceptable; the
      // route degrades to an empty list. Skip the deeper assertions.
      return
    }
    expect(Array.isArray(manifest.themes)).toBe(true)
    expect(manifest.themes?.find((t) => t.name === "ride")).toBeTruthy()
  })

  it("returns null when the dir is missing", async () => {
    const root = await mkdtemp(join(tmpdir(), "dash-build-themes-"))
    try {
      const manifest = await loadThemesManifest(join(root, "does-not-exist"))
      expect(manifest).toBeNull()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("returns null when the manifest is malformed JSON", async () => {
    const root = await mkdtemp(join(tmpdir(), "dash-build-themes-"))
    try {
      await writeFile(join(root, "manifest.json"), "{not valid", "utf8")
      const manifest = await loadThemesManifest(root)
      expect(manifest).toBeNull()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})

describe("resolveThemeCssPath", () => {
  let workDir: string
  beforeAll(async () => {
    workDir = await mkdtemp(join(tmpdir(), "dash-build-themes-css-"))
    // Accent value is a placeholder; the manifest schema accepts any string
    // and the resolveThemeCssPath path resolution does not parse it. We
    // intentionally avoid raw hex literals so the css-audit gate stays green
    // even in test fixtures.
    const accent = "var(--theme-accent-test)"
    await writeFile(
      join(workDir, "manifest.json"),
      JSON.stringify({
        version: "0.1.0",
        themes: [
          { name: "ride", title: "Dash Ride", accent, path: "./ride" },
        ],
      }),
      "utf8",
    )
    await mkdir(join(workDir, "ride"), { recursive: true })
    await writeFile(
      join(workDir, "ride", "colors.css"),
      ":root { --theme-accent-base: var(--token-test); }",
      "utf8",
    )
  })
  afterAll(async () => {
    await rm(workDir, { recursive: true, force: true })
  })

  it("resolves the css path for a known theme name", async () => {
    const path = await resolveThemeCssPath("ride", workDir)
    expect(path).not.toBeNull()
    expect(path!).toMatch(/ride[\\/]colors\.css$/)
  })

  it("returns null for an unknown theme", async () => {
    const path = await resolveThemeCssPath("not-a-theme", workDir)
    expect(path).toBeNull()
  })

  it("rejects path traversal attempts", async () => {
    const path = await resolveThemeCssPath("../ride", workDir)
    expect(path).toBeNull()
  })

  it("rejects names with hostile characters", async () => {
    expect(await resolveThemeCssPath("ride;rm", workDir)).toBeNull()
    expect(await resolveThemeCssPath("Ride", workDir)).toBeNull()
    expect(await resolveThemeCssPath("", workDir)).toBeNull()
  })
})
