import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  parseItemName,
  resolveRegistryUrl,
  resolveRegistryToken,
  listKnownNamespaces,
  DEFAULT_NAMESPACE,
  BUILT_IN_REGISTRY_URLS,
} from "../namespace-dispatch.js"
import { RegistryError } from "../registry-fetch.js"
import type { ComponentsJson } from "../schema.js"

describe("parseItemName", () => {
  it("treats a bare name as the default @dash namespace", () => {
    const r = parseItemName("button")
    expect(r.namespace).toBe(DEFAULT_NAMESPACE)
    expect(r.item).toBe("button")
    expect(r.explicit).toBe(false)
  })

  it("parses an explicit @dash/button namespace + item", () => {
    const r = parseItemName("@dash/button")
    expect(r.namespace).toBe("dash")
    expect(r.item).toBe("button")
    expect(r.explicit).toBe(true)
  })

  it("parses a tenant namespace @trellis/some-tenant-block", () => {
    const r = parseItemName("@trellis/some-tenant-block")
    expect(r.namespace).toBe("trellis")
    expect(r.item).toBe("some-tenant-block")
  })

  it("lowercases the namespace segment", () => {
    const r = parseItemName("@LOGISTIC/route-planner")
    expect(r.namespace).toBe("logistic")
    expect(r.item).toBe("route-planner")
  })

  it("preserves the item case (component names may be PascalCase)", () => {
    const r = parseItemName("@dash/DataTable")
    expect(r.item).toBe("DataTable")
  })

  it("throws RegistryError on `@foo` without a slash", () => {
    expect(() => parseItemName("@foo")).toThrow(RegistryError)
  })

  it("throws on `@/item` (empty namespace)", () => {
    expect(() => parseItemName("@/item")).toThrow(/empty namespace/)
  })

  it("throws on `@dash/` (empty item)", () => {
    expect(() => parseItemName("@dash/")).toThrow(/empty item/)
  })
})

describe("resolveRegistryUrl", () => {
  const ORIGINAL_ENV = { ...process.env }
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it("returns built-in default for @dash when no config given", () => {
    const url = resolveRegistryUrl("dash")
    expect(url).toBe(BUILT_IN_REGISTRY_URLS.dash)
  })

  it("returns built-in default for @trellis when no config given", () => {
    const url = resolveRegistryUrl("trellis")
    expect(url).toBe(BUILT_IN_REGISTRY_URLS.trellis)
  })

  it("returns built-in default for @logistic when no config given", () => {
    const url = resolveRegistryUrl("logistic")
    expect(url).toBe(BUILT_IN_REGISTRY_URLS.logistic)
  })

  it("prefers components.json @<ns> entry over built-ins", () => {
    const config: ComponentsJson = {
      registries: {
        "@trellis": { url: "https://custom.trellis.example/r" },
      },
    }
    expect(resolveRegistryUrl("trellis", config)).toBe(
      "https://custom.trellis.example/r",
    )
  })

  it("uses <NS>_REGISTRY_URL env var for an otherwise-unknown namespace", () => {
    process.env.ACME_REGISTRY_URL = "https://acme.example/r"
    expect(resolveRegistryUrl("acme")).toBe("https://acme.example/r")
  })

  it("config entry overrides built-in even when env var is also set", () => {
    process.env.TRELLIS_REGISTRY_URL = "https://env.trellis.example/r"
    const config: ComponentsJson = {
      registries: {
        "@trellis": { url: "https://config.trellis.example/r" },
      },
    }
    expect(resolveRegistryUrl("trellis", config)).toBe(
      "https://config.trellis.example/r",
    )
  })

  it("throws RegistryError with namespace suggestion list when unknown", () => {
    const err = (() => {
      try {
        resolveRegistryUrl("nonexistent-ns")
      } catch (e) {
        return e as RegistryError
      }
    })()
    expect(err).toBeInstanceOf(RegistryError)
    expect(err?.message).toMatch(/Unknown namespace/)
    expect(err?.suggestion).toMatch(/@dash/)
    expect(err?.suggestion).toMatch(/@trellis/)
  })
})

describe("resolveRegistryToken", () => {
  const ORIGINAL_ENV = { ...process.env }
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it("returns undefined when components.json has no entry", () => {
    expect(resolveRegistryToken("dash", null)).toBeUndefined()
  })

  it("strips `Bearer ` prefix from Authorization header", () => {
    const config: ComponentsJson = {
      registries: {
        "@trellis": {
          url: "https://x",
          headers: { Authorization: "Bearer literal-token-123" },
        },
      },
    }
    expect(resolveRegistryToken("trellis", config)).toBe("literal-token-123")
  })

  it("interpolates ${ENV_VAR} references in the header", () => {
    process.env.TRELLIS_REGISTRY_TOKEN = "from-env-456"
    const config: ComponentsJson = {
      registries: {
        "@trellis": {
          url: "https://x",
          headers: { Authorization: "Bearer ${TRELLIS_REGISTRY_TOKEN}" },
        },
      },
    }
    expect(resolveRegistryToken("trellis", config)).toBe("from-env-456")
  })
})

describe("listKnownNamespaces", () => {
  it("returns the built-in set when no config given", () => {
    const ns = listKnownNamespaces()
    expect(ns).toContain("dash")
    expect(ns).toContain("trellis")
    expect(ns).toContain("logistic")
  })

  it("merges built-ins with components.json registries field", () => {
    const config: ComponentsJson = {
      registries: {
        "@dash": { url: "https://x" },
        "@acme": { url: "https://y" },
      },
    }
    const ns = listKnownNamespaces(config)
    expect(ns).toContain("acme")
    expect(ns).toContain("dash")
  })

  it("returns a sorted list (deterministic for error messages)", () => {
    const ns = listKnownNamespaces()
    const sorted = [...ns].sort()
    expect(ns).toEqual(sorted)
  })
})
