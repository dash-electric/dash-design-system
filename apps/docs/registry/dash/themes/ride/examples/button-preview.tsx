/**
 * Theme preview — `ride` × Button
 *
 * Demonstrates Layer 2 (theme accent) cascading into Layer 1 (Button primitive)
 * via CSS variable indirection. Imports the canonical Dash Button — does NOT
 * fork or restyle. Theme cascade only.
 *
 * Run the page that imports this AFTER `@/registry/dash/themes/ride/colors.css`.
 */
import * as React from "react"
import { Button } from "@/registry/dash/ui/button"

export function RideButtonPreview() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Primary CTA — uses Dash Purple (--primary-base), unchanged by theme. */}
      <Button tone="primary">Terima permintaan</Button>

      {/* Accent affordance — colored via Layer 2 theme var. */}
      <Button
        tone="neutral"
        className="bg-[var(--theme-accent-base)] text-[var(--theme-accent-on)] border-[var(--theme-accent-dark)]"
      >
        Lanjutkan trip
      </Button>

      {/* Subtle accent — tint surface. */}
      <Button
        tone="neutral"
        className="bg-[var(--theme-accent-light)] text-[var(--theme-accent-dark)]"
      >
        Tampilkan rute
      </Button>
    </div>
  )
}
