import { describe, expect, it } from "vitest"
import { checkAuditTrailRequired } from "../audit-trail-enforcer.js"

describe("checkAuditTrailRequired — no trigger", () => {
  it("returns required=false for benign prompts", () => {
    const r = checkAuditTrailRequired(
      "Add a tooltip to the export button.",
      ["label", "tooltipText"],
    )
    expect(r.required).toBe(false)
    expect(r.fieldsToLog).toEqual([])
  })
})

describe("checkAuditTrailRequired — financial bucket", () => {
  it("fires on payment-related verbs and uses inline-edit pattern", () => {
    const r = checkAuditTrailRequired(
      "Allow ops to edit mitra topup balance manually.",
      ["balance"],
    )
    expect(r.required).toBe(true)
    expect(r.pattern).toBe("inline-edit-with-audit")
    expect(r.reason).toMatch(/financial/i)
    expect(r.fieldsToLog).toEqual(
      expect.arrayContaining([
        "originalValue",
        "newValue",
        "editor",
        "timestamp",
        "reason",
        "balance",
      ]),
    )
  })

  it("matches Indonesian financial terms", () => {
    const r = checkAuditTrailRequired(
      "Update saldo mitra setelah refund.",
      [],
    )
    expect(r.required).toBe(true)
    expect(r.pattern).toBe("inline-edit-with-audit")
  })
})

describe("checkAuditTrailRequired — image/identity bucket", () => {
  it("promotes pattern to image-editor-with-audit", () => {
    const r = checkAuditTrailRequired(
      "Allow re-uploading the KTP photo for verification.",
      ["ktpUrl"],
    )
    expect(r.required).toBe(true)
    expect(r.pattern).toBe("image-editor-with-audit")
    expect(r.fieldsToLog).toContain("imageUrl")
    expect(r.fieldsToLog).toContain("ktpUrl")
  })

  it("fires on signature/ttd phrasing", () => {
    const r = checkAuditTrailRequired(
      "User can edit the signature on the delivery proof.",
      [],
    )
    expect(r.required).toBe(true)
    expect(r.pattern).toBe("image-editor-with-audit")
  })
})

describe("checkAuditTrailRequired — authority transition bucket", () => {
  it("fires on mitra status edits", () => {
    const r = checkAuditTrailRequired(
      "Add a button to suspend the mitra account.",
      ["status"],
    )
    expect(r.required).toBe(true)
    expect(r.pattern).toBe("inline-edit-with-audit")
    expect(r.reason).toMatch(/authority transition/i)
  })

  it("fires when approval keyword is in an affected field name", () => {
    const r = checkAuditTrailRequired(
      "Add a new column to mark documents.",
      ["approvalStatus"],
    )
    expect(r.required).toBe(true)
  })
})

describe("checkAuditTrailRequired — pattern precedence", () => {
  it("image-bearing match wins over inline when both fire", () => {
    const r = checkAuditTrailRequired(
      "Edit KTP image and the payment balance.",
      [],
    )
    expect(r.required).toBe(true)
    expect(r.pattern).toBe("image-editor-with-audit")
  })
})

describe("checkAuditTrailRequired — false positive guard", () => {
  it("does not fire on substrings that are not whole words", () => {
    // `feed` should not trigger because of `fee` (financial). Whole-word match
    // for single tokens guarantees this.
    const r = checkAuditTrailRequired("Refresh the activity feed.", [])
    expect(r.required).toBe(false)
  })

  it("does not fire on multi-word keywords that are not substrings", () => {
    const r = checkAuditTrailRequired("Edit the user's display name.", [])
    expect(r.required).toBe(false)
  })
})
