"use client"

import * as React from "react"
import {
  RiBankCardLine as CardIcon,
  RiSignalWifiLine as Wifi,
  RiArrowLeftSLine as ChevronLeft,
  RiArrowRightSLine as ChevronRight,
  RiCheckLine as Check,
  RiAddLine as Plus,
} from "@remixicon/react"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Bank Cards widget — Figma verified 2026-05-19.
 *   3027:8985      Virtual variant — light surface, "Savings Card" + $16,058.94
 *                  + Active badge + carousel chevrons
 *   3027:9154      Physical variant — dark surface, chip glyph + "Cardholder Name"
 *                  + Arthur Taylor headline
 *
 * Note: node 3027:5568 is actually Stock Market Tracker (mis-attributed earlier).
 * 3931:6337 / 3931:6351 = My Cards panel container + detail rows; retained as
 * the panel composition matches the rendered layout.
 */
const APEX_BLUE = "#3F6FFF"

export default function BankCardsWidgetPage() {
  const [tab, setTab] = React.useState<"virtual" | "physical">("virtual")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Bank Cards"
        description="Two-variant payment card surface — Virtual (light, balance forward) and Physical (dark, named cardholder). Used in the My Cards segmented panel with details beneath."
      />

      <DocsSection title="Variants">
        <DocsExample
          title="Virtual + Physical"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <BankCard variant="virtual" />
              <BankCard variant="physical" />
            </div>
          }
          code={`<BankCard variant="virtual" />
<BankCard variant="physical" />`}
        />
      </DocsSection>

      <DocsSection title="My Cards panel">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Segmented switcher (Virtual count + Physical) above the card surface and a 2-column detail list (Card Number, Expiry, CVC, Spending Limit).
        </p>
        <DocsExample
          title="2-tab panel"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title="My Cards"
                headerExtra={
                  <Button style="stroke" tone="neutral" size="xs">
                    <Plus className="size-3" />
                    Add Card
                  </Button>
                }
              >
                <SegmentedControl size="sm" value={tab} onValueChange={(v: string) => setTab(v as "virtual" | "physical")} className="w-full mb-2">
                  <SegmentedItem size="sm" value="virtual" className="flex-1">
                    Virtual <span className="text-text-soft-400 ml-1">(2)</span>
                  </SegmentedItem>
                  <SegmentedItem size="sm" value="physical" className="flex-1">
                    Physical
                  </SegmentedItem>
                </SegmentedControl>
                <BankCard variant={tab} />
                <CardDetails variant={tab} />
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title="My Cards">
  <SegmentedControl value={tab} onValueChange={setTab}>
    <SegmentedItem value="virtual">Virtual (2)</SegmentedItem>
    <SegmentedItem value="physical">Physical</SegmentedItem>
  </SegmentedControl>
  <BankCard variant={tab} />
  <CardDetails variant={tab} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "BankCard.variant", type: '"virtual" | "physical"', description: "Light surface w/ balance vs. dark surface w/ cardholder name." },
            { name: "CardDetails.variant", type: '"virtual" | "physical"', description: "Switches the 4 detail rows shown beneath the card." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Top row — chip glyph or brand mark, contactless wifi, Active badge (virtual only), Mastercard cluster.</li>
          <li>Bottom row — caption (Savings Card / Cardholder Name) + headline (balance / name).</li>
          <li>Virtual carousel — paginate between owned virtual cards via chevron buttons.</li>
          <li>Detail list — Card Number masked, Expiry MM/YY, CVC dotted, Spending Limit currency.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function WidgetShell({
  title,
  seeAll,
  headerExtra,
  children,
  className,
}: {
  title: React.ReactNode
  seeAll?: boolean
  headerExtra?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {headerExtra}
        {seeAll && <LinkButton size="sm">See All</LinkButton>}
      </div>
      {children}
    </div>
  )
}

function ChipGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 24" className="size-8" aria-hidden>
      <rect x="1" y="1" width="30" height="22" rx="4" fill={color} stroke="#000" strokeOpacity="0.1" />
      <rect x="6" y="6" width="20" height="12" rx="2" fill="none" stroke="#000" strokeOpacity="0.2" />
      <line x1="6" y1="12" x2="26" y2="12" stroke="#000" strokeOpacity="0.2" />
      <line x1="16" y1="6" x2="16" y2="18" stroke="#000" strokeOpacity="0.2" />
    </svg>
  )
}

function BankCard({ variant = "virtual" }: { variant?: "virtual" | "physical" }) {
  const dark = variant === "physical"
  return (
    <div
      className={cn(
        "relative h-40 rounded-2xl border p-3 overflow-hidden",
        dark ? "bg-bg-strong-950 text-white border-bg-strong-950" : "bg-bg-white-0 border-stroke-soft-200",
      )}
    >
      <div className="flex items-center gap-2">
        {dark ? (
          <ChipGlyph color="#FBBF24" />
        ) : (
          <span className="inline-flex size-9 items-center justify-center rounded-full" style={{ background: APEX_BLUE }}>
            <CardIcon className="size-5 text-white" />
          </span>
        )}
        <Wifi className={cn("size-3.5", dark ? "text-white/60" : "text-text-soft-400")} />
        {!dark ? (
          <Badge size="sm" appearance="lighter" status="success">
            <Check className="size-3" />
            Active
          </Badge>
        ) : null}
        <div className="ml-auto flex gap-0.5">
          <span className="inline-block size-5 rounded-full bg-[#EB001B]" />
          <span className="inline-block size-5 rounded-full bg-[#F79E1B] -ml-2" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3">
        <div className={cn("text-xs", dark ? "text-white/60" : "text-text-sub-600")}>
          {dark ? "Cardholder Name" : "Savings Card"}
        </div>
        <div className="text-xl font-semibold tabular-nums">{dark ? "Arthur Taylor" : "$16,058.94"}</div>
      </div>
      {!dark ? (
        <div className="absolute bottom-3 right-3 flex gap-1">
          <button aria-label="Previous card" className="inline-flex size-5 items-center justify-center rounded-full border border-stroke-soft-200">
            <ChevronLeft className="size-3 text-icon-soft-400" />
          </button>
          <button aria-label="Next card" className="inline-flex size-5 items-center justify-center rounded-full border border-stroke-soft-200">
            <ChevronRight className="size-3 text-icon-soft-400" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

function CardDetails({ variant }: { variant: "virtual" | "physical" }) {
  const rows = variant === "virtual"
    ? [
        { label: "Card Number", value: "•••• 1234" },
        { label: "Expiry Date", value: "06/27" },
        { label: "CVC", value: "•••" },
        { label: "Spending Limit", value: "$12,000.00" },
      ]
    : [
        { label: "Card Number", value: "•••• 3456" },
        { label: "Expiry Date", value: "08/28" },
        { label: "CVC", value: "•••" },
        { label: "Spending Limit", value: "$24,000.00" },
      ]
  return (
    <ul className="divide-y divide-stroke-soft-200 text-xs mt-2">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center justify-between py-2">
          <span className="text-text-sub-600">{r.label}</span>
          <span className="font-medium tabular-nums text-text-strong-950">{r.value}</span>
        </li>
      ))}
    </ul>
  )
}
