import { describe, it, expect } from "vitest"
import {
  RegistryItemSchema,
  RegistryItemFileSchema,
  RegistryItemMetaSchema,
  RegistrySchema,
  RegistryItemTypeSchema,
} from "../zod-schemas.js"

describe("RegistryItemTypeSchema", () => {
  it("accepts known registry kinds", () => {
    for (const k of [
      "registry:ui",
      "registry:block",
      "registry:hook",
      "registry:lib",
      "registry:theme",
      "registry:page",
    ]) {
      expect(RegistryItemTypeSchema.safeParse(k).success).toBe(true)
    }
  })

  it("rejects unknown kinds", () => {
    expect(RegistryItemTypeSchema.safeParse("registry:bogus").success).toBe(false)
    expect(RegistryItemTypeSchema.safeParse("ui").success).toBe(false)
  })
})

describe("RegistryItemFileSchema", () => {
  it("accepts minimal file with path + type", () => {
    const r = RegistryItemFileSchema.safeParse({
      path: "ui/button.tsx",
      type: "registry:ui",
    })
    expect(r.success).toBe(true)
  })

  it("rejects empty path", () => {
    const r = RegistryItemFileSchema.safeParse({ path: "", type: "registry:ui" })
    expect(r.success).toBe(false)
  })

  it("rejects missing type", () => {
    const r = RegistryItemFileSchema.safeParse({ path: "ui/x.tsx" })
    expect(r.success).toBe(false)
  })
})

describe("RegistryItemMetaSchema", () => {
  it("accepts layered architecture fields", () => {
    const r = RegistryItemMetaSchema.safeParse({
      layer: 1,
      theme: "ride",
      product: "dispatch",
      status: "stable",
    })
    expect(r.success).toBe(true)
  })

  it("rejects invalid layer", () => {
    const r = RegistryItemMetaSchema.safeParse({ layer: 4 })
    expect(r.success).toBe(false)
  })

  it("preserves extra fields via passthrough", () => {
    const r = RegistryItemMetaSchema.safeParse({
      layer: 1,
      customVendorField: "vendor-x",
      version: "1.2.3",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect((r.data as Record<string, unknown>).customVendorField).toBe("vendor-x")
      expect((r.data as Record<string, unknown>).version).toBe("1.2.3")
    }
  })
})

describe("RegistryItemSchema", () => {
  const VALID = {
    name: "button",
    type: "registry:ui",
    title: "Button",
    description: "Primary button",
    files: [{ path: "ui/button.tsx", type: "registry:ui" }],
  }

  it("accepts a minimal valid item", () => {
    expect(RegistryItemSchema.safeParse(VALID).success).toBe(true)
  })

  it("rejects missing name", () => {
    const r = RegistryItemSchema.safeParse({ ...VALID, name: undefined })
    expect(r.success).toBe(false)
  })

  it("rejects empty name", () => {
    const r = RegistryItemSchema.safeParse({ ...VALID, name: "" })
    expect(r.success).toBe(false)
  })

  it("rejects invalid type", () => {
    const r = RegistryItemSchema.safeParse({ ...VALID, type: "not-a-type" })
    expect(r.success).toBe(false)
  })

  it("rejects non-array files", () => {
    const r = RegistryItemSchema.safeParse({ ...VALID, files: "ui/button.tsx" })
    expect(r.success).toBe(false)
  })

  it("accepts rich item with deps, cssVars, meta", () => {
    const r = RegistryItemSchema.safeParse({
      ...VALID,
      registryDependencies: ["utils"],
      dependencies: ["clsx"],
      devDependencies: ["@types/react"],
      categories: ["form"],
      cssVars: { light: { "--accent": "270 70% 40%" } },
      meta: { layer: 1, theme: "ride", status: "stable" },
    })
    expect(r.success).toBe(true)
  })

  it("survives JSON serialize / parse roundtrip", () => {
    const roundtripped = JSON.parse(JSON.stringify(VALID))
    expect(RegistryItemSchema.safeParse(roundtripped).success).toBe(true)
  })
})

describe("RegistrySchema", () => {
  it("accepts a registry with one item", () => {
    const r = RegistrySchema.safeParse({
      name: "dash",
      homepage: "https://ds.dash.com",
      items: [
        {
          name: "button",
          type: "registry:ui",
          files: [{ path: "ui/button.tsx", type: "registry:ui" }],
        },
      ],
    })
    expect(r.success).toBe(true)
  })

  it("rejects when items is not an array", () => {
    const r = RegistrySchema.safeParse({
      name: "dash",
      homepage: "https://ds.dash.com",
      items: { name: "button" },
    })
    expect(r.success).toBe(false)
  })
})
