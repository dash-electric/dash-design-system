/**
 * Theme preview — `logistic` × Card
 * Accent applied to queue counter + status pill. Surface stays neutral.
 */
import * as React from "react"
import { Card } from "@/registry/dash/ui/card"

export function LogisticCardPreview() {
  return (
    <Card variant="stroke" padding="md" className="max-w-sm gap-3">
      <div className="flex items-center justify-between">
        <span className="text-label-md text-text-strong-950">
          AWB-882104
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "var(--theme-accent-light)",
            color: "var(--theme-accent-dark)",
          }}
        >
          Menunggu pickup
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-semibold tabular-nums"
          style={{ color: "var(--theme-accent-dark)" }}
        >
          12
        </span>
        <span className="text-paragraph-sm text-text-sub-600">paket di antrian</span>
      </div>
    </Card>
  )
}
