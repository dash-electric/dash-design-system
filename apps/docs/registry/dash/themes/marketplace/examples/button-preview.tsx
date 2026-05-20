/**
 * Theme preview — `marketplace` × Button
 * Note: yellow uses black text-on-accent (--theme-accent-on resolves to #1c1c1c).
 */
import * as React from "react"
import { Button } from "@/registry/dash/ui/button"

export function MarketplaceButtonPreview() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Button tone="primary">Beli sekarang</Button>
      <Button
        tone="neutral"
        className="bg-[var(--theme-accent-400)] text-[var(--theme-accent-on)] border-[var(--theme-accent-dark)]"
      >
        Tambahkan ke keranjang
      </Button>
      <Button
        tone="neutral"
        className="bg-[var(--theme-accent-light)] text-[var(--theme-accent-darker)]"
      >
        Lihat promo
      </Button>
    </div>
  )
}
