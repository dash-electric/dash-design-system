"use client"

import * as React from "react"
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

/**
 * Marketing Widget — Product Performance.
 * Ported from AlignUI Marketing Template (widget-product-performance.tsx, 2026-05-18).
 *
 * Structure:
 *   - Header: "Product Performance" label, 22.8% KPI + "+8.4%" success badge, Details button.
 *   - 5-segment ButtonGroup: 1D / 1W / 1M / 3M / 1Y (1W default selected).
 *   - 5 colored bars (A–E), warning-base fill, height scaled linearly between
 *     BAR_MIN_HEIGHT=52 and BAR_MAX_HEIGHT=158 from the period's max.
 *   - Each bar shows "X%" at the top and the letter label at the bottom.
 *   - Footer trio: Avg Rating 4.7 · Satisfaction 92% · Return Rate 4.2%, divided by vertical hairlines.
 */

type Range = "1d" | "1w" | "1m" | "3m" | "1y"
type Row = { value: number; label: string }

const DATA: Record<Range, Row[]> = {
  "1d": [
    { value: 50, label: "A" },
    { value: 80, label: "B" },
    { value: 100, label: "C" },
    { value: 60, label: "D" },
    { value: 40, label: "E" },
  ],
  "1w": [
    { value: 30, label: "A" },
    { value: 70, label: "B" },
    { value: 80, label: "C" },
    { value: 20, label: "D" },
    { value: 60, label: "E" },
  ],
  "1m": [
    { value: 70, label: "A" },
    { value: 10, label: "B" },
    { value: 100, label: "C" },
    { value: 80, label: "D" },
    { value: 0, label: "E" },
  ],
  "3m": [
    { value: 25, label: "A" },
    { value: 45, label: "B" },
    { value: 60, label: "C" },
    { value: 80, label: "D" },
    { value: 40, label: "E" },
  ],
  "1y": [
    { value: 50, label: "A" },
    { value: 80, label: "B" },
    { value: 70, label: "C" },
    { value: 88, label: "D" },
    { value: 55, label: "E" },
  ],
}

const BAR_MAX = 158
const BAR_MIN = 52

function ProductPerformanceWidget() {
  const [range, setRange] = React.useState<Range>("1w")
  const rows = DATA[range]
  const max = Math.max(...rows.map((r) => r.value)) || 1
  const heightOf = (v: number) => BAR_MIN + (v / max) * (BAR_MAX - BAR_MIN)
  const pctOf = (v: number) => Math.round((v / max) * 100)

  return (
    <div className="relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <span className="text-sm font-medium text-text-sub-600">Product Performance</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight text-text-strong-950">22.8%</span>
            <Badge status="success" appearance="lighter" size="md">
              +8.4%
            </Badge>
          </div>
        </div>
        <Button size="xs" style="stroke" tone="neutral">
          Details
        </Button>
      </div>

      <SegmentedControl value={range} onValueChange={(v: string) => v && setRange(v as Range)} size="sm" className="grid grid-cols-5 w-full">
        {(["1d", "1w", "1m", "3m", "1y"] as Range[]).map((r) => (
          <SegmentedItem key={r} value={r} size="sm" className="px-0">
            {r.toUpperCase()}
          </SegmentedItem>
        ))}
      </SegmentedControl>

      <div className="grid grid-flow-col auto-cols-fr items-end gap-2.5" style={{ height: BAR_MAX }}>
        {rows.map(({ value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-between rounded-lg bg-warning-base py-2 text-center text-[11px] text-white transition-all duration-500"
            style={{ height: heightOf(value), transitionTimingFunction: "cubic-bezier(.6,.6,0,1)" }}
          >
            <span>{pctOf(value)}%</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Trio value="4.7" label="Avg. Rating" />
        <span className="self-stretch w-px bg-stroke-soft-200" />
        <Trio value="92%" label="Satisfaction" />
        <span className="self-stretch w-px bg-stroke-soft-200" />
        <Trio value="4.2%" label="Return Rate" />
      </div>
    </div>
  )
}

function Trio({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <span className="text-sm font-medium text-text-sub-600">{value}</span>
      <span className="mt-0.5 text-[11px] text-text-soft-400">{label}</span>
    </div>
  )
}

export default function ProductPerformanceWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Product Performance"
        description="5-bar performance grid (A–E) with a 5-segment range picker (1D/1W/1M/3M/1Y) and a footer trio: Avg. Rating, Satisfaction, Return Rate."
        status="shipped"
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="22.8% with 1W selected"
          preview={
            <div className="max-w-sm mx-auto w-full">
              <ProductPerformanceWidget />
            </div>
          }
          code={`<ProductPerformanceWidget />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No products to score"
          preview={
            <div className="max-w-sm mx-auto rounded-2xl bg-bg-white-0 p-5 ring-1 ring-inset ring-stroke-soft-200">
              <div className="text-sm font-medium text-text-sub-600">Product Performance</div>
              <div className="mt-3 grid grid-cols-5 gap-2.5 h-40">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-bg-soft-200" style={{ height: 52 + i * 10 }} />
                ))}
              </div>
              <div className="mt-4 text-xs text-text-soft-400 text-center">Add products to start tracking.</div>
            </div>
          }
          code={`{rows.length === 0 ? <Empty/> : <ProductPerformanceWidget/>}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data", type: "Record<Range, { value, label }[]>", description: "Per-range product rows (5 entries: A–E)." },
            { name: "range", type: '"1d" | "1w" | "1m" | "3m" | "1y"', defaultValue: '"1w"', description: "Selected range — controls which row set renders." },
            { name: "kpi", type: "string", defaultValue: '"22.8%"', description: "Header KPI." },
            { name: "delta", type: "ReactNode", defaultValue: '+8.4%', description: 'Success badge in the header.' },
            { name: "footer", type: "{ rating, satisfaction, returnRate }", description: "Bottom trio values." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Card: rounded-2xl, gap-5, padding-5, ring stroke-soft-200, shadow-regular-xs.</li>
          <li>Range picker: 5-segment <code>SegmentedControl</code> (1D/1W/1M/3M/1Y).</li>
          <li>Bars: 158px max h, 52px min h, warning-base fill, 8px radius, 10px gap.</li>
          <li>Bar labels: % at top, letter at bottom — both 11px static-white.</li>
          <li>Footer trio: 3 equal columns separated by 1px stroke-soft-200 vertical rules.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
