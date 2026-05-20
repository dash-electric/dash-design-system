/**
 * Theme preview — `travel` × Button
 */
import * as React from "react"
import { Button } from "@/registry/dash/ui/button"

export function TravelButtonPreview() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Button tone="primary">Konfirmasi booking</Button>
      <Button
        tone="neutral"
        className="bg-[var(--theme-accent-base)] text-[var(--theme-accent-on)] border-[var(--theme-accent-dark)]"
      >
        Lihat itinerary
      </Button>
      <Button
        tone="neutral"
        className="bg-[var(--theme-accent-light)] text-[var(--theme-accent-dark)]"
      >
        Detail penerbangan
      </Button>
    </div>
  )
}
