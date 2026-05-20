import { describe, it, expect } from "vitest"
import { pickScaffold, slugify } from "../scaffold-picker.js"

describe("pickScaffold", () => {
  it("returns image-editor scaffold for image keywords", () => {
    const sc = pickScaffold("no image-editor for proof upload")
    expect(sc.name).toBe("image-editor-with-audit")
    expect(sc.category).toBe("block")
  })

  it("returns signature-pad for signature keywords", () => {
    const sc = pickScaffold("need tanda tangan pad for kontrak")
    expect(sc.name).toBe("signature-pad-with-audit")
  })

  it("returns payment-form for payout keywords", () => {
    const sc = pickScaffold("payout form for mitra rekening")
    expect(sc.name).toBe("payment-form-with-audit")
  })

  it("returns kyc-uploader for KTP keywords", () => {
    const sc = pickScaffold("KTP document uploader")
    expect(sc.name).toBe("kyc-uploader")
  })

  it("falls back to generic block when no keywords match", () => {
    const sc = pickScaffold("misc settings widget panel")
    expect(sc.name).toBe("misc-settings-widget-panel")
    expect(sc.category).toBe("block")
  })

  it("scaffold stub source includes useState + Dash primitive import", () => {
    const sc = pickScaffold("image proof editor")
    expect(sc.stubSource).toContain("useState")
    expect(sc.stubSource).toContain("@/registry/dash/ui/button")
  })
})

describe("slugify", () => {
  it("lowercases and replaces non-alphanumerics with dashes", () => {
    expect(slugify("Image Editor For Proof!")).toBe("image-editor-for-proof")
  })

  it("trims leading/trailing dashes", () => {
    expect(slugify("---widget---")).toBe("widget")
  })

  it("truncates to 40 chars", () => {
    expect(slugify("a".repeat(100))).toHaveLength(40)
  })
})
