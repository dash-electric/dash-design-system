"use client"

import * as React from "react"
import {
  RiArrowDownSLine as ChevronDown,
  RiLineChartLine as LineChartIcon,
  RiRefreshLine as Refresh,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"
import { EmptyStateIllustration } from "@/registry/dash/ui/empty-state-illustration"

/**
 * Stock Market Tracker widget — Figma verified 2026-05-19.
 *
 *   3963:8455    Stock Market Tracker — Empty State=On (feed unavailable)
 *   (loaded variant synthesized — Figma reference Empty State=Off lives on parent
 *    widgets/page.tsx, not split out as standalone node id)
 *
 * Drift notes: 3912:37821 + 3963:8666 in original task were INVALID
 * (My Cards + Saved Actions families respectively).
 */

const RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const
type Range = (typeof RANGES)[number]

const SERIES: Record<Range, number[]> = {
  "1D": [38, 42, 36, 45, 40, 48, 44, 52, 49, 55, 50, 58],
  "1W": [40, 36, 48, 42, 50, 44, 52, 47, 55, 50, 58, 54],
  "1M": [25, 38, 30, 45, 36, 50, 42, 55, 48, 60, 54, 62],
  "3M": [20, 35, 28, 42, 50, 36, 48, 60, 52, 65, 58, 70],
  "1Y": [10, 30, 22, 45, 35, 55, 40, 60, 45, 70, 55, 80],
}

export default function StockMarketTrackerWidgetPage() {
  const [range, setRange] = React.useState<Range>("1Y")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Stock Market Tracker"
        description="Single-ticker tracker — dropdown trigger, 5-segment range picker (1D / 1W / 1M / 3M / 1Y), headline price + change badge, sparkline with hover tooltip, and Open / High / Low pill row. Falls back to empty state with refresh CTA when the market feed is unavailable."
      />

      <DocsSection title="Loaded state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default render — ACME ticker selected, range pinned to 1Y, tooltip pinned to a mid-chart sample point.
          Range switches the sparkline shape live.
        </p>
        <DocsExample
          title="Full widget"
          preview={
            <div className="max-w-sm">
              <StockMarketTrackerLoaded range={range} onRangeChange={(r) => setRange(r as Range)} />
            </div>
          }
          code={`<StockMarketTracker range="1Y" ticker="ACME" price="$440,364.20" change="+0.48%" />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Renders when the upstream feed errors or returns no data. Header, ticker dropdown, and range picker remain
          interactive; only the chart body collapses to the empty illustration + Refresh CTA.
        </p>
        <DocsExample
          title="Feed unavailable"
          preview={
            <div className="max-w-sm">
              <StockMarketTrackerEmpty />
            </div>
          }
          code={`<StockMarketTracker state="empty" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "ticker", type: "string", defaultValue: '"ACME"', description: "Active stock symbol shown in the dropdown trigger." },
            { name: "range", type: '"1D" | "1W" | "1M" | "3M" | "1Y"', defaultValue: '"1Y"', description: "Selected segment in the range picker." },
            { name: "price", type: "string", description: "Formatted headline price (currency + thousands separator)." },
            { name: "change", type: "string", description: 'Percent delta over selected range — sign + value (e.g. "+0.48%").' },
            { name: "tone", type: '"success" | "error"', defaultValue: '"success"', description: "Drives the change badge color." },
            { name: "tooltipPrice", type: "string?", description: "Optional pinned hover tooltip value displayed over the sparkline." },
            { name: "state", type: '"loaded" | "empty"', defaultValue: '"loaded"', description: "Loaded shows the chart body; empty swaps to the unavailable illustration + Refresh." },
            { name: "onRefresh", type: "() => void", description: "Triggered by the Refresh button in the empty state." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Header</strong> — title with line-chart icon + ACME ticker dropdown (stroke button, chevron-down).</li>
          <li><strong>Range picker</strong> — full-width SegmentedControl (sm) with 5 fixed items.</li>
          <li><strong>Headline</strong> — large tabular-nums price + lighter success badge (change %).</li>
          <li><strong>Sparkline</strong> — SVG polyline, 56px tall; optional pinned tooltip ($439,82.21 reference).</li>
          <li><strong>OHL row</strong> — single text line "Open · High · Low" with tabular-nums values, separated by middots.</li>
          <li><strong>Subtitle</strong> — company name + ticker in soft caption ("Acme Tech Inc. (ACME)").</li>
          <li><strong>Empty</strong> — circular illustration + 2-line message + Refresh stroke button.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ---------------------------------------------------------------------------- */

function WidgetShell({
  title,
  trailing,
  children,
  className,
}: {
  title: React.ReactNode
  trailing?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1 inline-flex items-center gap-1.5">
          {title}
        </div>
        {trailing}
      </div>
      {children}
    </div>
  )
}

function StockMarketTrackerLoaded({
  range,
  onRangeChange,
}: {
  range: Range
  onRangeChange: (r: string) => void
}) {
  const data = SERIES[range]
  const width = 240
  const height = 60
  const max = Math.max(...data)
  const min = Math.min(...data)
  const step = width / (data.length - 1)
  const points = data
    .map((v, i) => {
      const x = i * step
      const y = height - ((v - min) / (max - min || 1)) * (height - 6) - 3
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  // tooltip anchored to mid-chart
  const tipIdx = Math.floor(data.length / 2) - 1
  const tipX = tipIdx * step
  const tipY = height - ((data[tipIdx] - min) / (max - min || 1)) * (height - 6) - 3

  return (
    <WidgetShell
      title={
        <>
          <LineChartIcon className="size-4 text-icon-sub-600" />
          Stock Market Tracker
        </>
      }
      trailing={
        <Button style="stroke" tone="neutral" size="xs">
          ACME
          <ChevronDown className="size-3" />
        </Button>
      }
    >
      <SegmentedControl
        size="sm"
        value={range}
        onValueChange={onRangeChange}
        className="w-full"
      >
        {RANGES.map((r) => (
          <SegmentedItem key={r} size="sm" value={r} className="flex-1">
            {r}
          </SegmentedItem>
        ))}
      </SegmentedControl>

      <div className="flex items-baseline gap-2 pt-1">
        <div className="text-xl font-semibold tabular-nums text-text-strong-950">
          $440,364.20
        </div>
        <Badge size="sm" appearance="lighter" status="success">
          +0.48%
        </Badge>
      </div>
      <div className="text-[11px] text-text-soft-400 -mt-1">Acme Tech Inc. (ACME)</div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14">
          <polyline
            fill="none"
            stroke="var(--primary-base)"
            strokeWidth="1.5"
            points={points}
          />
          <circle cx={tipX} cy={tipY} r="3" fill="var(--primary-base)" />
        </svg>
        <div
          className="absolute -translate-x-1/2 -translate-y-full rounded-md bg-bg-strong-950 px-2 py-1 text-[10px] font-medium text-white shadow-sm tabular-nums"
          style={{ left: `${(tipX / width) * 100}%`, top: `${(tipY / height) * 100}%` }}
        >
          $439,82.21
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-sub-600 pt-1">
        {[
          { label: "Open", value: "439,59" },
          { label: "High", value: "442,23" },
          { label: "Low", value: "438,11" },
        ].map((p, i) => (
          <React.Fragment key={p.label}>
            <span>
              {p.label}{" "}
              <span className="font-medium tabular-nums text-text-strong-950">{p.value}</span>
            </span>
            {i < 2 ? <span className="text-text-soft-400" aria-hidden>·</span> : null}
          </React.Fragment>
        ))}
      </div>
    </WidgetShell>
  )
}

function StockMarketTrackerEmpty() {
  return (
    <WidgetShell
      title={
        <>
          <LineChartIcon className="size-4 text-icon-sub-600" />
          Stock Market Tracker
        </>
      }
      trailing={
        <Button style="stroke" tone="neutral" size="xs" disabled>
          ACME
          <ChevronDown className="size-3" />
        </Button>
      }
    >
      <SegmentedControl size="sm" defaultValue="1Y" className="w-full">
        {RANGES.map((r) => (
          <SegmentedItem key={r} size="sm" value={r} className="flex-1">
            {r}
          </SegmentedItem>
        ))}
      </SegmentedControl>

      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <EmptyStateIllustration kind="stock-market-tracker" />
        <div className="text-xs text-text-sub-600 max-w-[28ch] leading-relaxed">
          Stock market is unavailable now.
          <br />
          Please check back later.
        </div>
        <Button style="stroke" tone="neutral" size="xs">
          <Refresh className="size-3.5" />
          Refresh
        </Button>
      </div>
    </WidgetShell>
  )
}
