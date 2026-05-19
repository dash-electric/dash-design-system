"use client"

import * as React from "react"
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiFacebookCircleLine,
  RiInstagramLine,
  RiStore2Line,
} from "@remixicon/react"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"
import { EmptyIllustration, EmptyChart } from "../../widgets/_lib/empty-illustrations"

/**
 * Marketing Widget — Total Sales. Ported from AlignUI Marketing Template (2026-05-18).
 * Source: components/widgets/widget-total-sales.tsx
 */

// Weekly sales sample series — 7 days, smoothly mounded.
const WEEKLY_SALES = [
  { date: "Mon", value: 18 },
  { date: "Tue", value: 24 },
  { date: "Wed", value: 19 },
  { date: "Thu", value: 32 },
  { date: "Fri", value: 28 },
  { date: "Sat", value: 36 },
  { date: "Sun", value: 30 },
]

const CHANNELS = [
  { icon: RiStore2Line, label: "Online Store", value: "$52.12", delta: "+4.5%", up: true },
  { icon: RiFacebookCircleLine, label: "Facebook", value: "$38.45", delta: "-2.8%", up: false },
  { icon: RiInstagramLine, label: "Instagram", value: "$37.75", delta: "+3.2%", up: true },
]

const RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const

export default function TotalSalesWidgetPage() {
  const [range, setRange] = React.useState("1w")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Total Sales"
        description="Sales overview widget with KPI hero, range switcher, sparkline trend, and per-channel breakdown. Used as the top-left tile on a marketing dashboard."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Default — 1W range"
          preview={
            <WidgetShell tone="success-soft" className="max-w-sm">
              <HeaderRow value="$128.32" delta="+2%" up cta="Report" />
              <SegmentedControl size="sm" value={range} onValueChange={setRange} className="w-full">
                {RANGES.map((r) => (
                  <SegmentedItem key={r} size="sm" value={r.toLowerCase()} className="flex-1">
                    {r}
                  </SegmentedItem>
                ))}
              </SegmentedControl>
              <Sparkline data={WEEKLY_SALES} />
              <ChannelList rows={CHANNELS} />
            </WidgetShell>
          }
          code={`<WidgetShell>
  <HeaderRow value="$128.32" delta="+2%" up cta="Report" />
  <SegmentedControl value={range} onValueChange={setRange}>
    {RANGES.map((r) => <SegmentedItem value={r.toLowerCase()}>{r}</SegmentedItem>)}
  </SegmentedControl>
  <Sparkline data={WEEKLY_SALES} />
  <ChannelList rows={CHANNELS} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <DocsExample
          title="Negative trend"
          preview={
            <WidgetShell tone="error-soft" className="max-w-sm">
              <HeaderRow value="$96.04" delta="-3.4%" up={false} cta="Report" />
              <SegmentedControl size="sm" defaultValue="1m" className="w-full">
                {RANGES.map((r) => (
                  <SegmentedItem key={r} size="sm" value={r.toLowerCase()} className="flex-1">
                    {r}
                  </SegmentedItem>
                ))}
              </SegmentedControl>
              <Sparkline data={[...WEEKLY_SALES].reverse()} stroke="var(--state-error-base)" />
              <ChannelList rows={CHANNELS.map((c) => ({ ...c, up: !c.up }))} />
            </WidgetShell>
          }
          code={`<HeaderRow value="$96.04" delta="-3.4%" up={false} cta="Report" />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No sales recorded yet"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="$0.00" delta="0%" up cta="Report" />
              <SegmentedControl size="sm" defaultValue="1w" className="w-full">
                {RANGES.map((r) => (
                  <SegmentedItem key={r} size="sm" value={r.toLowerCase()} className="flex-1">
                    {r}
                  </SegmentedItem>
                ))}
              </SegmentedControl>
              <div className="flex h-[108px] items-center justify-center rounded-lg border border-dashed border-stroke-soft-200">
                <EmptyIllustration illustration={EmptyChart} text="No sales data yet." />
              </div>
            </WidgetShell>
          }
          code={`<EmptyState text="No sales data yet." />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Hero KPI ($128.32)." },
            { name: "delta", type: "string", description: "Period-over-period change ('+2%')." },
            { name: "up", type: "boolean", description: "Trend direction; flips badge tone + arrow." },
            { name: "range", type: '"1d" | "1w" | "1m" | "3m" | "1y"', defaultValue: '"1w"', description: "Active range." },
            { name: "data", type: "{ date; value }[]", description: "Sparkline series." },
            { name: "channels", type: "ChannelRow[]", description: "Per-channel breakdown rows." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Card shell: rounded-2xl + ring stroke-soft-200 + p-5 + gap-5.</li>
          <li>Header row: label "Total Sales" + title-h5 amount + trend Badge + neutral "Report" button.</li>
          <li>Range switcher: 5-segment SegmentedControl (1D / 1W / 1M / 3M / 1Y).</li>
          <li>Sparkline: 108px height, primary-base stroke, no dots, no axes.</li>
          <li>Channel rows: 20px icon + label (flex-1) + amount + delta with arrow.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ---------------- helpers ---------------- */

type WidgetTone = "primary-soft" | "success-soft" | "warning-soft" | "error-soft" | "info-soft" | "neutral"

const TONE_BG: Record<WidgetTone, string> = {
  "primary-soft": "bg-gradient-to-br from-(--primary-alpha-10) to-bg-white-0",
  "success-soft": "bg-gradient-to-br from-success-lighter to-bg-white-0",
  "warning-soft": "bg-gradient-to-br from-warning-lighter to-bg-white-0",
  "error-soft":   "bg-gradient-to-br from-error-lighter to-bg-white-0",
  "info-soft":    "bg-gradient-to-br from-information-lighter to-bg-white-0",
  "neutral":      "bg-bg-white-0",
}

function WidgetShell({ className, children, tone = "neutral" }: { className?: string; children: React.ReactNode; tone?: WidgetTone }) {
  return (
    <div className={cn("relative flex w-full flex-col gap-5 rounded-2xl p-5 shadow-sm ring-1 ring-inset ring-stroke-soft-200", TONE_BG[tone], className)}>
      {children}
    </div>
  )
}

function HeaderRow({
  value,
  delta,
  up,
  cta,
  label = "Total Sales",
}: {
  value: string
  delta: string
  up: boolean
  cta: string
  label?: string
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="text-xs text-text-sub-600">{label}</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-2xl font-semibold tracking-tight tabular-nums text-text-strong-950">{value}</div>
          <Badge size="sm" appearance="lighter" status={up ? "success" : "error"}>
            {delta}
          </Badge>
        </div>
      </div>
      <Button style="stroke" tone="neutral" size="xs">
        {cta}
      </Button>
    </div>
  )
}

function Sparkline({ data, stroke = "var(--primary-base)" }: { data: { date: string; value: number }[]; stroke?: string }) {
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))
  const range = max - min || 1
  const W = 280
  const H = 108
  const step = W / Math.max(1, data.length - 1)
  const points = data
    .map((d, i) => {
      const x = i * step
      const y = H - 12 - ((d.value - min) / range) * (H - 24)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={0} y1={(H / 4) * i + 6} x2={W} y2={(H / 4) * i + 6} stroke="hsl(var(--stroke-soft-200))" strokeDasharray="4 4" />
      ))}
      <polyline fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" points={points} />
    </svg>
  )
}

function ChannelList({
  rows,
}: {
  rows: { icon: React.ElementType; label: string; value: string; delta: string; up: boolean }[]
}) {
  return (
    <div className="flex w-full flex-col gap-4">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-1.5">
          <div className="flex flex-1 items-center gap-1.5">
            <r.icon className="size-5 shrink-0 text-text-soft-400" />
            <div className="text-xs text-text-sub-600">{r.label}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="min-w-16 text-sm tabular-nums text-text-sub-600">{r.value}</div>
            <div className="flex min-w-16 items-center justify-end gap-0.5 pl-1 text-right tabular-nums">
              {r.up ? (
                <RiArrowUpLine className="size-5 shrink-0 text-success-base" />
              ) : (
                <RiArrowDownLine className="size-5 shrink-0 text-error-base" />
              )}
              <div className="text-sm text-text-sub-600">{r.delta}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
