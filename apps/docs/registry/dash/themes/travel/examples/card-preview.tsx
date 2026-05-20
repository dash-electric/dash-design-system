/**
 * Theme preview — `travel` × Card
 * Booking confirmation card. Accent applied to status + timeline stroke.
 */
import * as React from "react"
import { Card } from "@/registry/dash/ui/card"

export function TravelCardPreview() {
  return (
    <Card variant="stroke" padding="md" className="max-w-sm gap-3">
      <div className="flex items-center justify-between">
        <span className="text-label-md text-text-strong-950">
          CGK → DPS
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "var(--theme-accent-light)",
            color: "var(--theme-accent-dark)",
          }}
        >
          Terkonfirmasi
        </span>
      </div>
      <div
        className="h-px w-full"
        style={{ backgroundColor: "var(--theme-accent-base)" }}
        aria-hidden
      />
      <p className="text-paragraph-sm text-text-sub-600">
        Voucher Anda dikirim ke email dalam 5 menit.
      </p>
    </Card>
  )
}
