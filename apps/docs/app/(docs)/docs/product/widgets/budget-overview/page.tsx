"use client"

import * as React from "react"
import {
  RiArrowDownSLine as ChevronDown,
  RiPieChartLine as PieChart,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import { cn } from "@/registry/dash/lib/utils"
import { EmptyStateIllustration } from "@/registry/dash/ui/empty-state-illustration"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Budget Overview widget — Figma 1:1 (re-verified 2026-05-19).
 *
 *   3963:7179    Budget Overview — loaded (header: title + 3-dot legend
 *                Income/Expenses/Scheduled + "Last Year" dropdown; 3 metric
 *                tiles Income $96,000 +5% / Expenses $24,000 -3% / Scheduled
 *                $14,000; 12 stacked monthly bars J–D w/ 20k/15k/10k/0 Y-axis).
 *   3963:11119   Budget Overview — empty ("You do not have any cards yet. Click
 *                the button to add one." + "+ Add Card" CTA).
 *   3963:6855    "12-bar" variant  · 3963:6946 "7-bar" · 3963:7002 "6-bar" ·
 *                3963:7051 "4-bar" — switchable column counts.
 *   3963:6848..6853  Atomic single-bar primitives (Income / Expenses / Scheduled
 *                × Default/Hover) — building blocks, rendered inline in the stack.
 */
export default function BudgetOverviewWidgetPage() {
  const [range, setRange] = React.useState("monthly")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Budget Overview"
        description="3-color stacked bar chart with range switcher (Monthly / Weekly / Bi-monthly / Quarterly). Three category dots above the chart sum the period spend."
      />

      <DocsSection title="Loaded + empty">
        <DocsExample
          title="Loaded (Last Year · 12 months · Income/Expenses/Scheduled)"
          preview={
            <div className="max-w-2xl">
              <WidgetShell
                title="Budget Overview"
                headerExtra={
                  <>
                    <LegendDots />
                    <Button style="stroke" tone="neutral" size="xs">
                      Last Year <ChevronDown className="size-3" />
                    </Button>
                  </>
                }
              >
                <MetricTiles />
                <StackedBars range={range} onRangeChange={setRange} hideSegment />
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title="Budget Overview" headerExtra={<><LegendDots /><RangeMenu /></>}>
  <MetricTiles />
  <StackedBars range="monthly" />
</WidgetShell>`}
        />
        <DocsExample
          title="Empty"
          preview={
            <div className="max-w-2xl">
              <WidgetShell
                title="Budget Overview"
                headerExtra={
                  <Button style="stroke" tone="neutral" size="xs" disabled>
                    Last Year <ChevronDown className="size-3" />
                  </Button>
                }
              >
                <BudgetEmpty />
              </WidgetShell>
            </div>
          }
          code={`<BudgetEmpty />`}
        />
      </DocsSection>

      <DocsSection title="4 ranges">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Switching range collapses or expands the column count: 12 (Monthly J-D) / 7 (Weekly M-S) / 6 (Bi-month) / 4 (Quarterly).
        </p>
        <DocsExample
          title="Range switcher"
          preview={
            <div className="space-y-3 max-w-2xl">
              <SegmentedControl size="sm" value={range} onValueChange={setRange}>
                <SegmentedItem size="sm" value="monthly">Monthly</SegmentedItem>
                <SegmentedItem size="sm" value="weekly">Weekly</SegmentedItem>
                <SegmentedItem size="sm" value="bimonth">Bi-month</SegmentedItem>
                <SegmentedItem size="sm" value="quarterly">Quarterly</SegmentedItem>
              </SegmentedControl>
              <StackedBars range={range} onRangeChange={setRange} hideSegment />
            </div>
          }
          code={`<StackedBars range="monthly" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "range", type: '"monthly" | "weekly" | "bimonth" | "quarterly"', description: "Column count + labels." },
            { name: "onRangeChange", type: "(r: string) => void", description: "Range tab switcher callback." },
            { name: "hideSegment", type: "boolean", description: "Render bars only — caller owns the range control." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Header — title + 3-dot legend (Income · Expenses · Scheduled) + range trigger (Last Year / Monthly / …).</li>
          <li>Metric tiles — 3-column row, each tile = icon avatar + uppercase label + amount + optional delta pill.</li>
          <li>Column stack — bottom purple (Scheduled), middle cyan (Expenses), top blue (Income); rounded outer corners.</li>
          <li>Axis labels — single-letter month / day or quarter shorthand under each column.</li>
          <li>Empty — circular illustration + 2-line copy + "+ Add Card" stroke button; header dropdown ghosted.</li>
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
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-3", className)}>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-sm font-medium text-text-strong-950 mr-auto">{title}</div>
        {headerExtra}
        {seeAll && <LinkButton size="sm">See All</LinkButton>}
      </div>
      {children}
    </div>
  )
}

function LegendDots() {
  return (
    <div className="flex items-center gap-3 text-xs text-text-sub-600">
      <KVDot color="#3F6FFF" label="Income" />
      <KVDot color="#5BC0EB" label="Expenses" />
      <KVDot color="#7C3AED" label="Scheduled" />
    </div>
  )
}

function KVDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block size-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </span>
  )
}

function MetricTiles() {
  const tiles = [
    { label: "INCOME", value: "$96,000.00", delta: "+5%", deltaTone: "bg-success-lighter text-success-base", iconBg: "bg-(--primary-alpha-10) text-(--primary-base)", arrow: "↙" },
    { label: "EXPENSES", value: "$24,000.00", delta: "-3%", deltaTone: "bg-error-lighter text-error-base", iconBg: "bg-information-lighter text-information-base", arrow: "↗" },
    { label: "SCHEDULED", value: "$14,000.00", delta: null, iconBg: "bg-(--primary-alpha-10) text-(--primary-base)", arrow: "📅" },
  ] as const
  return (
    <div className="grid grid-cols-3 gap-2 pb-2 border-b border-stroke-soft-200">
      {tiles.map((t) => (
        <div key={t.label} className="flex items-center gap-2">
          <span className={`inline-flex size-8 items-center justify-center rounded-full ${t.iconBg} text-xs`} aria-hidden>
            {t.arrow}
          </span>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-text-soft-400">{t.label}</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tabular-nums text-text-strong-950 truncate">{t.value}</span>
              {t.delta ? (
                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${t.deltaTone}`}>
                  {t.delta}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StackedBars({
  range,
  onRangeChange,
  hideSegment,
}: {
  range: string
  onRangeChange?: (r: string) => void
  hideSegment?: boolean
}) {
  const cols = range === "monthly" ? 12 : range === "weekly" ? 7 : range === "bimonth" ? 6 : 4
  const labels =
    range === "monthly"
      ? ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
      : range === "weekly"
        ? ["M", "T", "W", "T", "F", "S", "S"]
        : range === "bimonth"
          ? ["Jan-Feb", "Mar-Apr", "May-Jun", "Jul-Aug", "Sep-Oct", "Nov-Dec"]
          : ["Q1", "Q2", "Q3", "Q4"]
  return (
    <div className="space-y-1.5">
      {!hideSegment && onRangeChange ? (
        <SegmentedControl size="sm" value={range} onValueChange={onRangeChange}>
          <SegmentedItem size="sm" value="monthly">Monthly</SegmentedItem>
          <SegmentedItem size="sm" value="weekly">Weekly</SegmentedItem>
          <SegmentedItem size="sm" value="bimonth">Bi-month</SegmentedItem>
          <SegmentedItem size="sm" value="quarterly">Quarterly</SegmentedItem>
        </SegmentedControl>
      ) : null}
      <div className="grid gap-1 h-16 items-end" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex flex-col-reverse gap-0.5 h-full">
            <div className="bg-[#7C3AED] rounded-b-sm" style={{ height: "10%" }} />
            <div className="bg-[#5BC0EB]" style={{ height: "30%" }} />
            <div className="bg-[#3F6FFF] rounded-t-sm" style={{ height: "55%" }} />
          </div>
        ))}
      </div>
      <div className="grid gap-1 text-[10px] text-text-soft-400" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {labels.map((l, i) => (
          <span key={`${l}-${i}`} className="text-center truncate">{l}</span>
        ))}
      </div>
    </div>
  )
}

function BudgetEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <EmptyStateIllustration kind="budget-overview" />
      <p className="text-xs text-text-sub-600 max-w-[28ch] leading-relaxed">
        You do not have any cards yet.
        <br />
        Click the button to add one.
      </p>
      <Button style="stroke" tone="neutral" size="xs">
        + Add Card
      </Button>
    </div>
  )
}
