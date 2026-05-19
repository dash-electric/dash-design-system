"use client"

import * as React from "react"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"
// Empty state rendered inline per Figma 3963:11681 — see "Empty (Total Balance)" section.
// Brand illustration available via <EmptyStateIllustration kind="total-balance" /> if needed.

/**
 * Net Balance widget — Figma verified 2026-05-19.
 *
 *   3963:11681   Empty — "Total Balance $0.00" + USD currency chip + dotted grid (0..10k axis)
 *
 * Note: node 3949:25613 (previously cited here) is actually the Quick Transfer
 * widget — see /widgets/quick-transfer. Loaded variant below is a sensible
 * extrapolation of the same shell (headline + change badge + sparkline).
 */

const APEX_BLUE = "#3F6FFF"
const APEX_BLUE_SOFT = "#DCE6FF"

export default function NetBalanceWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Net Balance"
        description="At-a-glance net worth widget — headline balance, period-over-period change badge, and 30-point sparkline. Includes an empty state when balance history is unavailable."
      />

      <DocsSection title="Loaded">
        <DocsExample
          title="$14,460.24 · +5.32%"
          preview={
            <WidgetShell title="Net Balance" seeAll tone="success-soft" className="max-w-sm">
              <div className="flex items-center gap-2">
                <div className="text-xl font-semibold tabular-nums text-text-strong-950">$14,460.24</div>
                <Badge size="sm" appearance="lighter" status="success">+5.32%</Badge>
              </div>
              <Sparkline />
              <div className="flex items-center justify-between text-[10px] text-text-soft-400 pt-1">
                <span>Apr 18</span>
                <span>May 18</span>
              </div>
            </WidgetShell>
          }
          code={`<WidgetShell title="Net Balance" seeAll>
  <div className="flex items-center gap-2">
    <div className="text-xl font-semibold tabular-nums">$14,460.24</div>
    <Badge appearance="lighter" status="success">+5.32%</Badge>
  </div>
  <Sparkline />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Empty (Total Balance)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Matches Figma node 3963:11681 — headline "Total Balance" + zero amount, USD
          currency chip in the corner, and a flat dotted gridline plot with $0…$10k axis.
        </p>
        <DocsExample
          title="$0.00"
          preview={
            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2 max-w-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-text-sub-600">Total Balance</div>
                  <div className="text-2xl font-semibold tabular-nums text-text-strong-950">$0.00</div>
                </div>
                <Button style="stroke" tone="neutral" size="xs">
                  <span aria-hidden>🇺🇸</span> USD
                </Button>
              </div>
              <div className="relative h-16">
                <svg viewBox="0 0 220 60" className="w-full h-full">
                  <line x1={0} y1={20} x2={220} y2={20} stroke="#E5E7EB" strokeWidth="1" />
                  {[15, 25, 35, 45, 55].map((y) => (
                    <line key={y} x1={0} y1={y} x2={220} y2={y} stroke="#F3F4F6" strokeWidth="0.5" strokeDasharray="1 2" />
                  ))}
                </svg>
              </div>
              <div className="grid grid-cols-6 text-[10px] text-text-soft-400 tabular-nums">
                <span>0</span>
                <span>2k</span>
                <span>3k</span>
                <span>4k</span>
                <span>5k</span>
                <span className="text-right">10k</span>
              </div>
            </div>
          }
          code={`<div>
  <div className="text-xs text-text-sub-600">Total Balance</div>
  <div className="text-2xl font-semibold tabular-nums">$0.00</div>
</div>
<DottedGridPlot />`}
        />
      </DocsSection>

      <DocsSection title="Change badge variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Badge color tracks period-over-period delta — success for positive, error for negative, neutral when flat.
        </p>
        <DocsExample
          title="Positive / Negative / Flat"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl">
              {(
                [
                  { value: "$14,460.24", badge: <Badge size="sm" appearance="lighter" status="success">+5.32%</Badge>, trend: "up" as const },
                  { value: "$12,310.66", badge: <Badge size="sm" appearance="lighter" status="error">−3.18%</Badge>, trend: "down" as const },
                  { value: "$10,000.00", badge: <Badge size="sm" appearance="lighter" status="neutral">0.00%</Badge>, trend: "flat" as const },
                ] as const
              ).map((v) => (
                <WidgetShell key={v.value} title="Net Balance" seeAll>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-semibold tabular-nums text-text-strong-950">{v.value}</div>
                    {v.badge}
                  </div>
                  <Sparkline trend={v.trend} />
                </WidgetShell>
              ))}
            </div>
          }
          code={`<Badge appearance="lighter" status="success">+5.32%</Badge>
<Badge appearance="lighter" status="error">−3.18%</Badge>
<Badge appearance="lighter" status="neutral">0.00%</Badge>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "balance", type: "string", description: "Currency-formatted headline balance ($14,460.24)." },
            { name: "change", type: "string", description: "Signed % change ('+5.32%')." },
            { name: "trend", type: '"up" | "down" | "flat"', defaultValue: '"up"', description: "Sparkline curve direction + stroke color." },
            { name: "series", type: "number[]", description: "30-point sparkline data (0..100 normalized)." },
            { name: "isEmpty", type: "boolean", description: "Swap loaded body for empty-state pattern." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Card shell + See All link.</li>
          <li>Headline = 20px semibold tabular-nums balance + small change Badge on the same baseline.</li>
          <li>Sparkline = 1.5px polyline + soft gradient fill, fills the card width.</li>
          <li>Optional date range labels along the X axis (Apr 18 → May 18).</li>
          <li>Empty state replaces sparkline with muted icon + CTA.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

type WidgetTone = "primary-soft" | "success-soft" | "warning-soft" | "error-soft" | "info-soft" | "neutral"

const TONE_BG: Record<WidgetTone, string> = {
  "primary-soft": "bg-gradient-to-br from-(--primary-alpha-10) to-bg-white-0",
  "success-soft": "bg-gradient-to-br from-success-lighter to-bg-white-0",
  "warning-soft": "bg-gradient-to-br from-warning-lighter to-bg-white-0",
  "error-soft":   "bg-gradient-to-br from-error-lighter to-bg-white-0",
  "info-soft":    "bg-gradient-to-br from-information-lighter to-bg-white-0",
  "neutral":      "bg-bg-white-0",
}

function WidgetShell({
  title,
  seeAll,
  children,
  className,
  tone = "neutral",
}: {
  title: React.ReactNode
  seeAll?: boolean
  children: React.ReactNode
  className?: string
  tone?: WidgetTone
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 p-3 shadow-sm space-y-2", TONE_BG[tone], className)}>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {seeAll && <LinkButton size="sm">See All</LinkButton>}
      </div>
      {children}
    </div>
  )
}

function Sparkline({ trend = "up" }: { trend?: "up" | "down" | "flat" }) {
  const points =
    trend === "up"
      ? "0,40 20,38 40,42 60,30 80,32 100,26 120,28 140,22 160,24 180,18 200,20 220,12"
      : trend === "down"
        ? "0,18 20,22 40,20 60,26 80,24 100,30 120,28 140,34 160,32 180,38 200,36 220,42"
        : "0,28 20,30 40,26 60,30 80,28 100,30 120,28 140,30 160,28 180,30 200,28 220,30"
  return (
    <svg viewBox="0 0 220 50" className="w-full h-12">
      <defs>
        <linearGradient id={`grad-${trend}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={APEX_BLUE_SOFT} stopOpacity="0.7" />
          <stop offset="100%" stopColor={APEX_BLUE_SOFT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={APEX_BLUE} strokeWidth="1.5" points={points} />
      <polygon fill={`url(#grad-${trend})`} points={`${points} 220,50 0,50`} />
    </svg>
  )
}
