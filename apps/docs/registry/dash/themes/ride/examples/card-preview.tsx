/**
 * Theme preview — `ride` × Card
 *
 * Card primitive stays neutral; theme accent is applied to a status pill
 * and an accent border. Pattern: theme tints affordances inside neutral
 * surfaces, never repaints the surface itself.
 */
import * as React from "react"
import { Card } from "@/registry/dash/ui/card"

export function RideCardPreview() {
  return (
    <Card variant="stroke" padding="md" className="max-w-sm gap-3">
      <div className="flex items-center justify-between">
        <span className="text-label-md text-text-strong-950">
          Trip aktif
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "var(--theme-accent-light)",
            color: "var(--theme-accent-dark)",
          }}
        >
          Berjalan
        </span>
      </div>
      <div
        className="h-1 w-full rounded-full"
        style={{ backgroundColor: "var(--theme-accent-base)" }}
        aria-hidden
      />
      <p className="text-paragraph-sm text-text-sub-600">
        Mitra menuju titik penjemputan. ETA 4 menit.
      </p>
    </Card>
  )
}
