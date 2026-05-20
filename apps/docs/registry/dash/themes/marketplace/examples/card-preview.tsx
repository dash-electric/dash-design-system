/**
 * Theme preview — `marketplace` × Card
 * Product price card. Accent applied to "Promo" badge + price highlight.
 * Uses --theme-accent-dark for text-on-white to pass WCAG AA.
 */
import * as React from "react"
import { Card } from "@/registry/dash/ui/card"

export function MarketplaceCardPreview() {
  return (
    <Card variant="stroke" padding="md" className="max-w-sm gap-3">
      <div className="flex items-center justify-between">
        <span className="text-label-md text-text-strong-950">
          Helm SNI Premium
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: "var(--theme-accent-400)",
            color: "var(--theme-accent-on)",
          }}
        >
          Promo
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-2xl font-semibold tabular-nums"
          style={{ color: "var(--theme-accent-dark)" }}
        >
          Rp 245.000
        </span>
        <span className="text-paragraph-sm line-through text-text-sub-600 tabular-nums">
          Rp 320.000
        </span>
      </div>
      <p className="text-paragraph-sm text-text-sub-600">
        Hemat Rp 75.000 dengan promo bulan ini.
      </p>
    </Card>
  )
}
