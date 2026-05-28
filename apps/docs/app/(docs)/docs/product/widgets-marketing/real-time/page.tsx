"use client"

import * as React from "react"
import { RiArrowDownLine, RiArrowUpLine } from "@remixicon/react"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
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
 * Marketing Widget — Real-time Visitors. Ported from AlignUI Marketing Template (2026-05-18).
 * Source: components/widgets/widget-real-time.tsx
 *
 * Bubble chart packing 3 regions (Europe / Asia / Americas) with per-region totals + trend rows.
 */

type Region = {
  category: string
  percentage: number
  visitors: string
  delta: string
  up: boolean
  // SVG bubble color + label color (token references)
  fillCls: string
  textCls: string
  dotCls: string
}

const REGIONS: Region[] = [
  { category: "Europe", percentage: 48, visitors: "15.8M", delta: "+4.7%", up: true, fillCls: "fill-warning-base/30", textCls: "fill-warning-dark", dotCls: "bg-warning-base" },
  { category: "Asia", percentage: 32, visitors: "10.2M", delta: "-6.2%", up: false, fillCls: "fill-(--state-away-base)/30", textCls: "fill-(--state-away-dark, #92400E)", dotCls: "bg-(--state-away-base)" },
  { category: "Americas", percentage: 20, visitors: "6.6M", delta: "+3.8%", up: true, fillCls: "fill-success-base/30", textCls: "fill-success-dark", dotCls: "bg-success-base" },
]

export default function RealTimeVisitorsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Real-time Visitors"
        description="Live visitor breakdown by region. Bubble chart packs 3 region circles sized by share %, followed by a legend table with visitor count and trend."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Default"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="32.6M" delta="+8.4%" up />
              <div className="flex justify-center">
                <BubbleChart data={REGIONS} />
              </div>
              <Legend rows={REGIONS} />
            </WidgetShell>
          }
          code={`<WidgetShell>
  <HeaderRow value="32.6M" delta="+8.4%" up />
  <BubbleChart data={REGIONS} />
  <Legend rows={REGIONS} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <DocsExample
          title="Negative trend"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="21.4M" delta="-5.1%" up={false} />
              <div className="flex justify-center">
                <BubbleChart data={REGIONS} />
              </div>
              <Legend rows={REGIONS.map((r) => ({ ...r, up: !r.up }))} />
            </WidgetShell>
          }
          code={`<HeaderRow value="21.4M" delta="-5.1%" up={false} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No live visitors"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="0" delta="0%" up />
              <div className="flex h-[156px] items-center justify-center rounded-lg border border-dashed border-stroke-soft-200">
                <EmptyIllustration illustration={EmptyChart} text="Waiting for live traffic…" />
              </div>
            </WidgetShell>
          }
          code={`<EmptyState text="Waiting for live traffic…" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Hero KPI ('32.6M')." },
            { name: "delta", type: "string", description: "Period-over-period change." },
            { name: "up", type: "boolean", description: "Trend direction." },
            { name: "data", type: "Region[]", description: "Regions w/ category, percentage, visitors, delta." },
            { name: "region.fillCls", type: "string", description: "SVG bubble fill class (token reference)." },
            { name: "region.dotCls", type: "string", description: "Legend dot color class." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Card shell with standard header.</li>
          <li>Bubble chart 312×156: 3 packed circles sized by share %, region name inside, percentage below.</li>
          <li>Legend rows: colored dot + region name + visitor count + trend arrow + delta.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ---------------- helpers ---------------- */

function WidgetShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative flex w-full flex-col gap-6 rounded-2xl bg-bg-white-0 p-6 shadow-sm ring-1 ring-inset ring-stroke-soft-200", className)}>
      {children}
    </div>
  )
}

function HeaderRow({ value, delta, up }: { value: string; delta: string; up: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="text-xs text-text-sub-600">Real-time Visitors</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-2xl font-semibold tracking-tight tabular-nums text-text-strong-950">{value}</div>
          <Badge size="sm" appearance="lighter" status={up ? "success" : "error"}>
            {delta}
          </Badge>
        </div>
      </div>
      <Button style="stroke" tone="neutral" size="xs">
        Details
      </Button>
    </div>
  )
}

function BubbleChart({ data }: { data: Region[] }) {
  const W = 312
  const H = 156
  // Manually positioned/packed bubbles matching source visual (Europe largest center, Asia right, Americas left small).
  const total = data.reduce((s, d) => s + d.percentage, 0)
  // Areas proportional to percentage. Largest radius ~66.
  const maxR = 66
  const placements = [
    { cx: W * 0.42, cy: H * 0.5 }, // Europe
    { cx: W * 0.78, cy: H * 0.5 }, // Asia
    { cx: W * 0.18, cy: H * 0.65 }, // Americas
  ]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[312px]" style={{ height: H }} aria-hidden>
      {data.map((d, i) => {
        const r = maxR * Math.sqrt(d.percentage / total) * 1.4
        const p = placements[i]
        return (
          <g key={d.category}>
            <circle cx={p.cx} cy={p.cy} r={r} className={d.fillCls} />
            <text x={p.cx} y={p.cy - 3} textAnchor="middle" className={cn("font-medium", d.textCls)} style={{ fontSize: 12 }}>
              {d.category}
            </text>
            <text x={p.cx} y={p.cy + 12} textAnchor="middle" className={d.textCls} style={{ fontSize: 11 }}>
              {d.percentage}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Legend({ rows }: { rows: Region[] }) {
  return (
    <div className="flex w-full flex-col gap-3.5">
      {rows.map((r) => (
        <div key={r.category} className="flex items-center gap-1.5">
          <div className="flex size-5 shrink-0 items-center justify-center">
            <span className={cn("size-2 rounded-full", r.dotCls)} />
          </div>
          <div className="flex-1 text-xs text-text-sub-600">{r.category}</div>
          <div className="flex items-center gap-2">
            <div className="min-w-[44px] text-xs text-text-sub-600">{r.visitors}</div>
            <div className="text-xs text-text-disabled-300">·</div>
            <div className="flex min-w-16 items-center justify-end gap-1 pl-0.5 text-right">
              {r.up ? (
                <RiArrowUpLine className="size-3 text-success-base" />
              ) : (
                <RiArrowDownLine className="size-3 text-error-base" />
              )}
              <div className="text-xs text-text-sub-600">{r.delta}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
