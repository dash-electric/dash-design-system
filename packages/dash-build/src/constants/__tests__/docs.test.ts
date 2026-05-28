/**
 * Tier 6 — Surface 1 Docs integration. Docs URL builder + surface link
 * builder. Tests run against a synthetic env so they don't depend on the
 * developer's shell.
 */

import { describe, expect, it } from "vitest"
import {
  DEFAULT_DASH_DOCS_URL,
  buildSurfaceDocsUrl,
  getDashDocsUrl,
} from "../docs.js"

describe("getDashDocsUrl", () => {
  it("falls back to the dev-server default when env is empty", () => {
    expect(getDashDocsUrl({})).toBe(DEFAULT_DASH_DOCS_URL)
    expect(getDashDocsUrl({ DASH_DOCS_URL: "" })).toBe(DEFAULT_DASH_DOCS_URL)
  })

  it("uses DASH_DOCS_URL when provided", () => {
    expect(getDashDocsUrl({ DASH_DOCS_URL: "https://ds.dash.com" })).toBe(
      "https://ds.dash.com",
    )
  })

  it("trims trailing slashes from the configured value", () => {
    expect(getDashDocsUrl({ DASH_DOCS_URL: "https://ds.dash.com/" })).toBe(
      "https://ds.dash.com",
    )
    expect(getDashDocsUrl({ DASH_DOCS_URL: "https://ds.dash.com///" })).toBe(
      "https://ds.dash.com",
    )
  })
})

describe("buildSurfaceDocsUrl", () => {
  it("builds /docs/surfaces/<slug> for known surfaces", () => {
    expect(
      buildSurfaceDocsUrl("backoffice", { DASH_DOCS_URL: "https://ds.dash.com" }),
    ).toBe("https://ds.dash.com/docs/surfaces/backoffice")
    expect(
      buildSurfaceDocsUrl("portal-v2", { DASH_DOCS_URL: "https://ds.dash.com" }),
    ).toBe("https://ds.dash.com/docs/surfaces/portal-v2")
  })

  it("normalises mixed-case surface names to lowercase", () => {
    expect(
      buildSurfaceDocsUrl("Backoffice", { DASH_DOCS_URL: "https://ds.dash.com" }),
    ).toBe("https://ds.dash.com/docs/surfaces/backoffice")
  })

  it("falls back to the docs root for empty / hostile surface values", () => {
    const env = { DASH_DOCS_URL: "https://ds.dash.com" }
    expect(buildSurfaceDocsUrl(null, env)).toBe("https://ds.dash.com")
    expect(buildSurfaceDocsUrl("", env)).toBe("https://ds.dash.com")
    expect(buildSurfaceDocsUrl("../etc/passwd", env)).toBe(
      "https://ds.dash.com",
    )
    expect(buildSurfaceDocsUrl("has space", env)).toBe("https://ds.dash.com")
    expect(buildSurfaceDocsUrl("a/b", env)).toBe("https://ds.dash.com")
  })
})
