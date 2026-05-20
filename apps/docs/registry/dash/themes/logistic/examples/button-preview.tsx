/**
 * Theme preview — `logistic` × Button
 * Theme accent cascades via CSS vars into the canonical Button primitive.
 */
import * as React from "react"
import { Button } from "@/registry/dash/ui/button"

export function LogisticButtonPreview() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Button tone="primary">Konfirmasi batch</Button>
      <Button
        tone="neutral"
        className="bg-[var(--theme-accent-base)] text-[var(--theme-accent-on)] border-[var(--theme-accent-dark)]"
      >
        Scan paket
      </Button>
      <Button
        tone="neutral"
        className="bg-[var(--theme-accent-light)] text-[var(--theme-accent-dark)]"
      >
        Lihat antrian
      </Button>
    </div>
  )
}
