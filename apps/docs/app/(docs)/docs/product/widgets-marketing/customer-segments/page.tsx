"use client"

import * as React from "react"
import { RiInformationFill } from "@remixicon/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/dash/ui/tooltip"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Marketing Widget — Customer Segments. Ported from AlignUI Marketing Template (2026-05-18).
 * Source: components/widgets/customer-segments.tsx
 *
 * Donut chart of customer types + 3-row legend (Premium / Regular / New). Others shown only in chart.
 */

type Segment = {
  id: string
  name: string
  value: number
  share: number // designed pct (Figma) — drives both arc length and legend %
  arcCls: string
  dotCls: string
}

// Values + percentages match Figma source (22:8790) verbatim. Figma's
// designed values + percentages are not perfectly reconciled; we honour
// the displayed labels rather than recompute. The donut arcs read from
// `share` (designed weight) so visuals match the Figma render.
const SEGMENTS: Segment[] = [
  { id: "premium", name: "Premium", value: 9450, share: 32, arcCls: "stroke-warning-base", dotCls: "bg-warning-base" },
  { id: "regular", name: "Regular", value: 8320, share: 46, arcCls: "stroke-(--state-away-base)", dotCls: "bg-(--state-away-base)" },
  { id: "new", name: "New", value: 3280, share: 20, arcCls: "stroke-success-base", dotCls: "bg-success-base" },
  { id: "others", name: "Others", value: 0, share: 2, arcCls: "stroke-bg-weak-50", dotCls: "bg-bg-weak-50" },
]

const TOTAL = SEGMENTS.reduce((s, x) => s + x.value, 0)

export default function CustomerSegmentsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Customer Segments"
        description="Donut chart of customer types — Premium / Regular / New / Others. Legend lists the three primary segments with currency value and share %. 'Others' is rendered only in the chart."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Card surface"
          preview={
            <WidgetShell card className="max-w-sm">
              <HeaderRow delta="+5.8%" up />
              <div className="mt-5 flex items-center gap-6">
                <DonutChart data={SEGMENTS} circleSize={98} />
                <Legend rows={SEGMENTS.filter((s) => s.id !== "others")} total={TOTAL} />
              </div>
            </WidgetShell>
          }
          code={`<WidgetShell card>
  <HeaderRow delta="+5.8%" up />
  <DonutChart data={SEGMENTS} />
  <Legend rows={SEGMENTS.filter((s) => s.id !== "others")} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <DocsExample
          title="Bare (no card)"
          preview={
            <div className="max-w-sm">
              <WidgetShell card={false}>
                <HeaderRow delta="+5.8%" up />
                <div className="mt-6 flex items-center gap-6">
                  <DonutChart data={SEGMENTS} circleSize={112} />
                  <Legend rows={SEGMENTS.filter((s) => s.id !== "others")} total={TOTAL} />
                </div>
              </WidgetShell>
            </div>
          }
          code={`<CustomerSegments />`}
        />

        <DocsExample
          title="Negative trend"
          preview={
            <WidgetShell card className="max-w-sm">
              <HeaderRow delta="-3.4%" up={false} />
              <div className="mt-5 flex items-center gap-6">
                <DonutChart data={SEGMENTS} circleSize={98} />
                <Legend rows={SEGMENTS.filter((s) => s.id !== "others")} total={TOTAL} />
              </div>
            </WidgetShell>
          }
          code={`<HeaderRow delta="-3.4%" up={false} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No segments yet"
          preview={
            <WidgetShell card className="max-w-sm">
              <HeaderRow delta="0%" up />
              <div className="mt-5 flex items-center justify-center h-[112px] rounded-lg border border-dashed border-stroke-soft-200 text-xs text-text-soft-400">
                No customer segments yet.
              </div>
            </WidgetShell>
          }
          code={`<EmptyState text="No customer segments yet." />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "card", type: "boolean", defaultValue: "true", description: "Render card surface." },
            { name: "data", type: "Segment[]", description: "Segments with id, name, value, color tokens." },
            { name: "circleSize", type: "number", defaultValue: "98", description: "Donut outer diameter in px." },
            { name: "delta", type: "string", description: "Period-over-period change ('+5.8%')." },
            { name: "up", type: "boolean", description: "Trend direction; flips delta color." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Header: label + tooltip info icon + "+5.8% vs last week" delta copy (no Details button).</li>
          <li>Donut chart: 98px diameter (card) / 112px (bare). Arcs proportional to value.</li>
          <li>Legend: 3 rows (Premium / Regular / New). Each: dot + name + USD value + share %.</li>
          <li>'Others' segment renders in chart only; legend filters it out.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ---------------- helpers ---------------- */

function WidgetShell({
  card,
  className,
  children,
}: {
  card: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col",
        card && "rounded-2xl bg-bg-white-0 p-5 shadow-sm ring-1 ring-inset ring-stroke-soft-200",
        className,
      )}
    >
      {children}
    </div>
  )
}

function HeaderRow({ delta, up }: { delta: string; up: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <div className="text-xs text-text-sub-600">Customer Segments</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label="What is this">
                  <RiInformationFill className="size-4 text-text-disabled-300" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-80">
                Overview of customer types based on their purchasing behavior and value to the business.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="text-xs text-text-sub-600">
        <span className={up ? "text-success-base" : "text-error-base"}>{delta}</span> vs last week
      </div>
    </div>
  )
}

function DonutChart({ data, circleSize = 98 }: { data: Segment[]; circleSize?: number }) {
  // Render each arc on a single ring with proportional dashes. Stroke width ~14.
  // Arc length follows `share` (Figma-designed pct), not raw value.
  const totalShare = data.reduce((s, d) => s + d.share, 0)
  const size = circleSize
  const stroke = Math.round(size * 0.14)
  const r = (size - stroke) / 2
  const C = 2 * Math.PI * r
  let offset = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
      {data.map((seg) => {
        const frac = seg.share / totalShare
        const len = C * frac
        const gap = C - len
        const dasharray = `${len} ${gap}`
        const dashoffset = -offset
        offset += len
        return (
          <circle
            key={seg.id}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            className={seg.arcCls}
          />
        )
      })}
    </svg>
  )
}

function Legend({ rows }: { rows: Segment[]; total: number }) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v)
  return (
    <div className="flex flex-1 flex-col gap-[13px]">
      {rows.map((s) => {
        const pct = s.share
        return (
          <div key={s.id} className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2 text-xs text-text-sub-600">
              <span className={cn("size-2 rounded-full", s.dotCls)} />
              {s.name}
            </div>
            <div className="flex items-center gap-1.5 tabular-nums">
              <div className="text-xs text-text-sub-600">{fmt(s.value)}</div>
              <div className="text-xs text-text-disabled-300">·</div>
              <div className="text-xs text-text-soft-400">{pct}%</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
