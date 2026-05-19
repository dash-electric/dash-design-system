import { describe, it, expect } from "vitest"
import { validateRegistryItem } from "./schema.js"

describe("validateRegistryItem", () => {
  it("accepts a minimal valid item", () => {
    const item = {
      name: "button",
      type: "registry:ui",
      title: "Button",
      description: "A button component.",
    }
    expect(() => validateRegistryItem(item)).not.toThrow()
  })

  it("rejects non-object input", () => {
    expect(() => validateRegistryItem(null)).toThrow(/not an object/)
    expect(() => validateRegistryItem("string")).toThrow(/not an object/)
  })

  it("rejects missing name", () => {
    expect(() =>
      validateRegistryItem({ type: "registry:ui", title: "x", description: "y" }),
    ).toThrow(/name required/)
  })

  it("rejects missing type", () => {
    expect(() =>
      validateRegistryItem({ name: "button", title: "x", description: "y" }),
    ).toThrow(/type required/)
  })

  it("rejects missing title or description", () => {
    expect(() =>
      validateRegistryItem({ name: "button", type: "registry:ui", description: "y" }),
    ).toThrow(/title required/)
    expect(() =>
      validateRegistryItem({ name: "button", type: "registry:ui", title: "x" }),
    ).toThrow(/description required/)
  })
})
