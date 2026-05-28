/**
 * Tier 6 — Owner runtime config tests.
 */

import { describe, expect, it } from "vitest"
import {
  DEFAULT_OWNER_HEALTH_PATH,
  loadOwnerRuntimeConfig,
} from "../owner.js"

describe("loadOwnerRuntimeConfig", () => {
  it("returns null root url when env is empty", () => {
    const cfg = loadOwnerRuntimeConfig({})
    expect(cfg.ownerRootUrl).toBeNull()
    expect(cfg.ownerHealthPath).toBe(DEFAULT_OWNER_HEALTH_PATH)
  })

  it("reads DASH_BUILD_OWNER_ROOT_URL", () => {
    const cfg = loadOwnerRuntimeConfig({
      DASH_BUILD_OWNER_ROOT_URL: "https://owner.dash.com",
    })
    expect(cfg.ownerRootUrl).toBe("https://owner.dash.com")
  })

  it("trims whitespace and treats blank as unset", () => {
    const cfg = loadOwnerRuntimeConfig({
      DASH_BUILD_OWNER_ROOT_URL: "   ",
    })
    expect(cfg.ownerRootUrl).toBeNull()
  })

  it("respects DASH_BUILD_OWNER_HEALTH_PATH override", () => {
    const cfg = loadOwnerRuntimeConfig({
      DASH_BUILD_OWNER_HEALTH_PATH: "/admin/owner-health",
    })
    expect(cfg.ownerHealthPath).toBe("/admin/owner-health")
  })
})
