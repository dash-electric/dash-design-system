"use client"

import * as React from "react"
import { RiArrowLeftDownLine } from "@remixicon/react"
import { Badge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Finance Widget — Total Expenses. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-total-expenses.tsx + chart-spark-line.tsx
 *
 * Compact card: 40px icon avatar (top-left) + 120×40 sparkline (top-right) + Total Expenses label + $6,240.28 + red −2% Badge.
 * Series (12 weeks): 500, 700, 1600, 900, 800, 1100, 1200, 1600, 1300, 800, 645, 900.
 */

const SERIES = [500, 700, 1600, 900, 800, 1100, 1200, 1600, 1300, 800, 645, 900]

export default function FinanceTotalExpensesWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="Total Expenses"
        description="178px tall summary card with a leading down-arrow avatar, a 120×40 sparkline in the upper-right, and the headline expenses ($6,240.28) + red −2% Badge anchored to the bottom."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="$6,240.28 · −2%"
          preview={
            <div className="max-w-sm">
              <TotalExpensesCard />
            </div>
          }
          code={`<TotalExpenses amount={6240.28} delta={-2} series={[500,700,1600,...]} />`}
        />
      </DocsSection>

      <DocsSection title="Sparkline">
        <DocsExample
          title="12-week trend"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 inline-block">
              <Sparkline data={SERIES} width={240} height={64} />
            </div>
          }
          code={`<Sparkline data={[500,700,1600,...]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="$0.00"
          preview={
            <div className="max-w-sm">
              <div className="relative flex h-[178px] flex-col rounded-2xl bg-bg-white-0 p-5 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
                <div className="flex size-10 items-center justify-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
                  <RiArrowLeftDownLine className="size-5 text-text-sub-600" />
                </div>
                <div className="absolute right-6 top-8 h-10 w-[120px]">
                  <div className="h-0.5 w-full bg-stroke-soft-200" />
                </div>
                <div className="mt-auto">
                  <div className="text-xs text-text-sub-600">Total Expenses</div>
                  <div className="mt-1 text-2xl font-medium tabular-nums">$0.00</div>
                </div>
              </div>
            </div>
          }
          code={`<TotalExpensesEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "amount", type: "number", defaultValue: "6240.28", description: "Total expenses headline." },
            { name: "delta", type: "number", defaultValue: "-2", description: "Period % delta — red Badge when negative." },
            { name: "series", type: "number[]", description: "Sparkline trend (source = 12 weeks)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Container</strong> — 178px tall rounded-2xl card; only padding/shadow differ from TotalBalance.</li>
          <li><strong>Avatar</strong> — top-left 40px circular icon ring (RiArrowLeftDownLine in sub-600).</li>
          <li><strong>Sparkline</strong> — absolute top-right, 120×40 area chart with a single colored stroke + light fill.</li>
          <li><strong>Footer</strong> — mt-auto sticks to bottom: label + title-h4 amount + red Badge.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function TotalExpensesCard() {
  return (
    <div className="relative flex h-[178px] flex-col rounded-2xl bg-gradient-to-br from-error-lighter to-bg-white-0 p-5 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex size-10 items-center justify-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
        <RiArrowLeftDownLine className="size-5 text-text-sub-600" />
      </div>
      <div className="absolute right-6 top-8 h-10 w-[120px]">
        <Sparkline data={SERIES} width={120} height={40} />
      </div>
      <div className="mt-auto">
        <div className="text-xs text-text-sub-600">Total Expenses</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-2xl font-medium tabular-nums text-text-strong-950">$6,240.28</div>
          <Badge status="error" appearance="lighter">−2%</Badge>
        </div>
      </div>
    </div>
  )
}

function Sparkline({ data, width, height, className }: { data: number[]; width: number; height: number; className?: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const stepX = width / (data.length - 1)
  const norm = (v: number) => height - ((v - min) / Math.max(1, max - min)) * (height - 4) - 2
  const pts = data.map((v, i) => `${i * stepX},${norm(v)}`).join(" ")
  const area = `0,${height} ${pts} ${width},${height}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("block", className)}>
      <polygon points={area} fill="var(--dash-red-alpha-10, rgba(239,68,68,0.1))" />
      <polyline points={pts} fill="none" stroke="var(--state-error-base, #EF4444)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
