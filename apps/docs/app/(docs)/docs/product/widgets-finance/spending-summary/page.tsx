"use client"

import * as React from "react"
import {
  RiPieChartLine,
  RiShoppingBag3Line,
  RiFileListLine,
  RiMoneyDollarCircleLine,
  RiInformationFill,
} from "@remixicon/react"
import { Divider } from "@/registry/dash/ui/divider"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Finance Widget — Spending Summary. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-spending-summary.tsx + spending-summary-pie-chart.tsx
 *
 * Pie chart data: Shopping 400 / Utilities 300 / Others 300 (= 1000 total ratio, displayed total $1,800.00).
 * Footer: 3-up category row $900 / $600 / $900 + weekly limit info ($2,000).
 */

const CHART = [
  { id: "shopping", name: "Shopping", value: 400, color: "var(--state-information-base, #3F6FFF)", icon: RiShoppingBag3Line, ringBg: "bg-information-lighter", iconCls: "text-information-base", total: 900 },
  { id: "utilities", name: "Utilities", value: 300, color: "var(--state-verified-base, #22C55E)", icon: RiFileListLine, ringBg: "bg-verified-lighter", iconCls: "text-verified-base", total: 600 },
  { id: "others", name: "Others", value: 300, color: "var(--state-faded-base, #94A3B8)", icon: RiMoneyDollarCircleLine, ringBg: "bg-faded-lighter", iconCls: "text-faded-base", total: 900 },
]

const PERIODS = [
  { value: "3-months", label: "3 Months" },
  { value: "6-months", label: "6 Months" },
  { value: "last-year", label: "Last Year" },
  { value: "all", label: "All Time" },
]

export default function FinanceSpendingSummaryWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="Spending Summary"
        description="Donut-pie chart with centered SPEND label ($1,800.00) + 3-up category footer + weekly limit info pill ($2,000). Source slices: Shopping 400 (blue) / Utilities 300 (green) / Others 300 (gray)."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Last Year — $1,800.00"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiPieChartLine className="size-4 text-icon-sub-600" /> Spending Summary</>}
                action={
                  <Select defaultValue="last-year">
                    <SelectTrigger className="h-7 px-2 text-xs gap-1 w-[110px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                }
              >
                <Divider />
                <div className="flex justify-center pt-3">
                  <DonutChart data={CHART} centerLabel="SPEND" centerValue="$1,800.00" />
                </div>
                <Divider />
                <div className="grid grid-cols-3 divide-x divide-stroke-soft-200 mt-3">
                  {CHART.map((c) => (
                    <div key={c.id} className="flex flex-col items-center gap-2 px-2 text-center">
                      <div className={cn("flex size-8 items-center justify-center rounded-full", c.ringBg)}>
                        <c.icon className={cn("size-5", c.iconCls)} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[11px] text-text-sub-600">{c.name}</div>
                        <div className="text-sm font-medium tabular-nums">${c.total.toFixed(2).replace(/\.00$/, ".00")}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 rounded-md bg-bg-white-0 py-1.5 pl-2.5 pr-1.5 ring-1 ring-inset ring-stroke-soft-200">
                  <span className="flex-1 text-xs text-text-sub-600">
                    Your weekly spending limit is{" "}
                    <span className="font-medium text-text-strong-950">$2,000</span>.
                  </span>
                  <RiInformationFill className="size-4 text-text-disabled-300" />
                </div>
              </WidgetShell>
            </div>
          }
          code={`<SpendingSummary data={[
  { id: 'shopping', name: 'Shopping', value: 400 },
  { id: 'utilities', name: 'Utilities', value: 300 },
  { id: 'others', name: 'Others', value: 300 },
]} total={1800} limit={2000} />`}
        />
      </DocsSection>

      <DocsSection title="Donut breakdown">
        <DocsExample
          title="Slices · 400 / 300 / 300"
          preview={
            <div className="flex flex-wrap items-center gap-6">
              <DonutChart data={CHART} centerLabel="SPEND" centerValue="$1,800" size={160} />
              <ul className="space-y-2 text-sm">
                {CHART.map((c) => (
                  <li key={c.id} className="flex items-center gap-2">
                    <span className="size-3 rounded-sm" style={{ background: c.color }} />
                    <span className="text-text-strong-950">{c.name}</span>
                    <span className="text-text-soft-400 tabular-nums">— {c.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          }
          code={`<DonutChart data={chartData} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No records"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiPieChartLine className="size-4 text-icon-sub-600" /> Spending Summary</>}>
                <Divider />
                <div className="flex flex-col items-center gap-3 p-6 pt-8">
                  <RiPieChartLine className="size-10 text-icon-soft-400" />
                  <p className="text-center text-sm text-text-soft-400">No records of spendings yet.<br />Please check back later.</p>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<SpendingSummaryEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data", type: "Slice[]", description: "Donut slices — { id, name, value, color? }." },
            { name: "total", type: "number", defaultValue: "1800", description: "Centered headline (formatted as USD)." },
            { name: "limit", type: "number", defaultValue: "2000", description: "Weekly spending cap surfaced in the footer pill." },
            { name: "period", type: '"3-months" | "6-months" | "last-year" | "all"', defaultValue: '"last-year"', description: "Range Select." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Donut chart</strong> — outer ring with 4-color slices. Center stack = uppercase SPEND caption + title-h5 amount.</li>
          <li><strong>Category row</strong> — 3-up grid divided by vertical dividers; each cell = 32px tinted bubble + name + amount.</li>
          <li><strong>Info pill</strong> — boxed paragraph-xs caption with trailing info icon (disabled-300 tone).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function WidgetShell({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2 min-h-8 mb-3">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function DonutChart({
  data,
  centerLabel,
  centerValue,
  size = 200,
}: {
  data: typeof CHART
  centerLabel?: string
  centerValue?: string
  size?: number
}) {
  const r = size / 2
  const stroke = size / 5
  const innerR = r - stroke / 2
  const c = 2 * Math.PI * innerR
  const total = data.reduce((s, d) => s + d.value, 0)
  let offset = 0
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={r} cy={r} r={innerR} fill="none" stroke="var(--bg-weak-50)" strokeWidth={stroke} />
        {data.map((d) => {
          const len = (d.value / total) * c
          const dashArr = `${len - 2} ${c - len + 2}`
          const el = (
            <circle
              key={d.id}
              cx={r}
              cy={r}
              r={innerR}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={dashArr}
              strokeDashoffset={-offset}
            />
          )
          offset += len
          return el
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        {centerLabel && <span className="text-[10px] uppercase tracking-wider text-text-sub-600">{centerLabel}</span>}
        {centerValue && <span className="text-lg font-medium text-text-strong-950 tabular-nums">{centerValue}</span>}
      </div>
    </div>
  )
}
