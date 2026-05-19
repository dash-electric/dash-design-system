"use client"

import * as React from "react"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Promo Cards widget — Figma verified 2026-05-19 (9 brand variants).
 *   3946:16802  Apple Music        3946:16806  Spotify            3946:16839  Grove Shark
 *   3946:16856  YouTube Music      3946:16864  Netflix            3946:16872  Microsoft Office
 *   3946:17105  Creative Cloud     3946:17113  Twitch             3946:17121  Mailchimp
 */

const PROMOS: { brand: string; color: string }[] = [
  { brand: "Apple Music", color: "#4285F4" },
  { brand: "Spotify", color: "#1DB954" },
  { brand: "Grove Shark", color: "#FF5500" },
  { brand: "YouTube Music", color: "#FF0000" },
  { brand: "Netflix", color: "#E50914" },
  { brand: "Microsoft Office", color: "#EA3E23" },
  { brand: "Creative Cloud", color: "#FA0F00" },
  { brand: "Twitch", color: "#9146FF" },
  { brand: "Mailchimp", color: "#FFE01B" },
]

export default function PromoCardsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Promo Cards"
        description="Brand discount cards — corner artwork in brand color, brand mark, headline (“50% discount on X”), price ($4.99 per month), and Learn More link."
      />

      <DocsSection title="9-card grid">
        <DocsExample
          title="All promos"
          preview={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PROMOS.map((p) => (
                <DiscountCard key={p.brand} brand={p.brand} color={p.color} />
              ))}
            </div>
          }
          code={`<DiscountCard brand="Spotify" color="#1DB954" />`}
        />
      </DocsSection>

      <DocsSection title="Single card">
        <DocsExample
          title="Netflix"
          preview={
            <div className="max-w-xs">
              <DiscountCard brand="Netflix" color="#E50914" />
            </div>
          }
          code={`<DiscountCard brand="Netflix" color="#E50914" price="$4.99" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "brand", type: "string", description: "Brand name. First letter is used as the inline avatar mark." },
            { name: "color", type: "string", description: "Brand accent — drives the corner artwork and the avatar fill." },
            { name: "discount", type: "string", defaultValue: '"50%"', description: "Headline percentage prefix." },
            { name: "price", type: "string", defaultValue: '"$4.99 per month"', description: "Subline price/term." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Two soft circles in the top-right corner — 20%/40% brand opacity for layered glow.</li>
          <li>Round avatar mark using the brand’s first letter, full-opacity brand fill.</li>
          <li>Headline copy + Learn More LinkButton.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function DiscountCard({
  brand,
  color,
  discount = "50%",
  price = "$4.99 per month",
}: {
  brand: string
  color: string
  discount?: string
  price?: string
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3")}>
      {/* Corner artwork — large brand-color shape anchored top-right (Figma 2026-05-19) */}
      <div
        className="pointer-events-none absolute -top-6 -right-6 size-24 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      <span
        className="relative inline-flex size-7 items-center justify-center rounded-full text-white text-xs font-bold"
        style={{ background: color }}
      >
        {brand[0]}
      </span>
      <div className="relative text-sm font-medium text-text-strong-950 mt-2">
        {discount} discount on {brand}
      </div>
      <div className="text-xs text-text-sub-600">
        For only {price}! <LinkButton size="sm">Learn More</LinkButton>
      </div>
    </div>
  )
}
