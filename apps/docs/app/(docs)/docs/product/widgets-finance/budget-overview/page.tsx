"use client"

import * as React from "react"
import {
  RiFileChartLine,
  RiArrowLeftDownFill,
  RiArrowRightUpFill,
  RiCalendarCheckFill,
  RiAddLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
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
 * Finance Widget — Budget Overview. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-budget-overview.tsx + budget-overview-stack-bar-chart.tsx
 *
 * Stack order top→bottom: Scheduled (feature/purple) · Expenses (verified/green) · Income (information/blue).
 * Chart fills the top of each column with a `bg-weak-50` cap so all bars hit the same height ceiling.
 */

const CHART_DATA = [
  { month: "January", income: 18600, expenses: 8000, scheduled: 15000 },
  { month: "February", income: 3050, expenses: 20000, scheduled: 12000 },
  { month: "March", income: 23700, expenses: 12000, scheduled: 17000 },
  { month: "April", income: 7300, expenses: 19000, scheduled: 9000 },
  { month: "May", income: 20900, expenses: 13000, scheduled: 5000 },
  { month: "June", income: 21400, expenses: 14000, scheduled: 7000 },
  { month: "July", income: 21400, expenses: 14000, scheduled: 8000 },
  { month: "August", income: 12000, expenses: 14000, scheduled: 14000 },
  { month: "September", income: 10000, expenses: 11000, scheduled: 13000 },
  { month: "October", income: 7000, expenses: 15000, scheduled: 16000 },
  { month: "November", income: 19000, expenses: 14000, scheduled: 12000 },
  { month: "December", income: 17000, expenses: 16000, scheduled: 20000 },
]

const PERIODS = [
  { value: "3-months", label: "3 Months" },
  { value: "6-months", label: "6 Months" },
  { value: "last-year", label: "Last Year" },
  { value: "all", label: "All Time" },
]

const COLORS = {
  income: "var(--state-information-base, #3F6FFF)",
  expenses: "var(--state-verified-base, #22C55E)",
  scheduled: "var(--state-feature-base, #7C3AED)",
}

export default function FinanceBudgetOverviewWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="Budget Overview"
        description="Income · Expenses · Scheduled snapshot with KPI row, range filter, and a 12-month stacked-bar chart. The stack reads bottom-to-top: Income (blue), Expenses (green), Scheduled (purple), with a soft cap so all columns terminate at the same y-ceiling."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Last Year — 12 months"
          preview={
            <div className="max-w-3xl">
              <WidgetShell
                title={<><RiFileChartLine className="size-4 text-icon-sub-600" /> Budget Overview</>}
                action={
                  <div className="flex items-center gap-4">
                    <Legend />
                    <Select defaultValue="last-year">
                      <SelectTrigger className="h-7 px-2 text-xs gap-1 w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                }
              >
                <Divider />
                <KpiRow />
                <Divider />
                <StackedBarChart data={CHART_DATA} />
              </WidgetShell>
            </div>
          }
          code={`<BudgetOverview data={chartData} period="last-year" />`}
        />
      </DocsSection>

      <DocsSection title="Range variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Range selector reshapes the dataset. Source ships Monthly (12), Weekly (7), Bi-month (6), Quarterly (4).
        </p>
        <DocsExample
          title="4 ranges side-by-side"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["monthly", "weekly", "bimonth", "quarterly"] as const).map((range) => (
                <div key={range} className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400">{range}</div>
                  <StackedBarChart data={resampleByRange(range)} compact />
                </div>
              ))}
            </div>
          }
          code={`<StackedBarChart range="monthly" /> // 12 cols
<StackedBarChart range="weekly" />  // 7 cols
<StackedBarChart range="bimonth" /> // 6 cols
<StackedBarChart range="quarterly" /> // 4 cols`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No cards yet"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiFileChartLine className="size-4 text-icon-sub-600" /> Budget Overview</>}>
                <Divider />
                <div className="flex h-[284px] flex-col items-center justify-center gap-3 p-5">
                  <RiFileChartLine className="size-10 text-icon-soft-400" />
                  <p className="text-center text-sm text-text-soft-400">
                    You do not have any cards yet.<br />Click the button to add one.
                  </p>
                  <Button tone="neutral" style="stroke" size="xs"><RiAddLine /> Add Card</Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<BudgetOverviewEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data", type: "Array<{ month, income, expenses, scheduled }>", description: "Series; one entry per column." },
            { name: "period", type: '"3-months" | "6-months" | "last-year" | "all"', defaultValue: '"last-year"', description: "Range filter, drives the dataset re-sample." },
            { name: "income", type: "number", description: "KPI total — green +5% badge in source." },
            { name: "expenses", type: "number", description: "KPI total — red −3% badge in source." },
            { name: "scheduled", type: "number", description: "KPI total — no badge in source." },
            { name: "onPeriodChange", type: "(v: string) => void", description: "Range select callback." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>KPI row</strong> — 3 columns separated by vertical dividers (lg). Each = 40px circular icon ring + uppercase 2xs caption + label-md amount + colored Badge delta.</li>
          <li><strong>Range Select</strong> — `compact` `xsmall`, end-aligned content, defaults to <em>Last Year</em>.</li>
          <li><strong>Legend</strong> — three 8px dots, lg+ only inline next to the Select; on mobile they re-render under the chart.</li>
          <li><strong>Stacked bars</strong> — 12 columns at 212px height. <code>scheduled</code> (top/purple) → <code>expenses</code> (mid/green) → <code>income</code> (bottom/blue). 2px GAP between segments; the top segment is filled with bg-weak-50 up to the y-ceiling.</li>
          <li><strong>X axis</strong> — single-letter month tick (J F M A …). Y axis — compact number formatter (e.g. 20K).</li>
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
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm space-y-4", className)}>
      <div className="flex items-center gap-2 min-h-8">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Legend() {
  return (
    <div className="hidden lg:flex items-center gap-4 text-xs">
      <LegendDot color={COLORS.scheduled} label="Scheduled" />
      <LegendDot color={COLORS.expenses} label="Expenses" />
      <LegendDot color={COLORS.income} label="Income" />
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-text-sub-600">
      <span className="inline-block size-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

function KpiRow() {
  return (
    <div className="flex flex-col divide-y divide-stroke-soft-200 lg:flex-row lg:divide-x lg:divide-y-0">
      <KpiCell
        icon={<RiArrowLeftDownFill className="size-5 text-(--state-information-base)" />}
        label="INCOME"
        amount="$96,000.00"
        badge={<Badge status="success" appearance="lighter">+5%</Badge>}
      />
      <KpiCell
        icon={<RiArrowRightUpFill className="size-5 text-(--state-verified-base)" />}
        label="EXPENSES"
        amount="$24,000.00"
        badge={<Badge status="error" appearance="lighter">−3%</Badge>}
      />
      <KpiCell
        icon={<RiCalendarCheckFill className="size-5 text-(--state-feature-base)" />}
        label="SCHEDULED"
        amount="$14,000.00"
      />
    </div>
  )
}

function KpiCell({
  icon,
  label,
  amount,
  badge,
}: {
  icon: React.ReactNode
  label: string
  amount: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex w-full min-w-0 gap-3 py-3 lg:px-6 lg:py-0 lg:first:pl-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-inset ring-stroke-soft-200">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-wider text-text-soft-400">{label}</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tabular-nums">{amount}</span>
          {badge}
        </div>
      </div>
    </div>
  )
}

function StackedBarChart({ data, compact }: { data: typeof CHART_DATA; compact?: boolean }) {
  const w = 720
  const h = compact ? 120 : 212
  const padL = 32
  const padB = 20
  const padR = 8
  const padT = 4
  const innerW = w - padL - padR
  const innerH = h - padB - padT
  const max = Math.max(...data.map((d) => d.income + d.expenses + d.scheduled))
  const colW = innerW / data.length
  const barW = Math.max(4, colW * 0.55)
  const gap = 2

  const ticks = 4
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => Math.round((max / ticks) * i))

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
      {/* Y axis labels */}
      {yTicks.map((t, i) => {
        const y = padT + innerH - (t / max) * innerH
        return (
          <text key={i} x={padL - 6} y={y + 3} textAnchor="end" className="fill-text-soft-400 text-[10px]">
            {t >= 1000 ? `${(t / 1000).toFixed(0)}K` : t}
          </text>
        )
      })}
      {data.map((d, i) => {
        const x = padL + colW * i + (colW - barW) / 2
        const total = d.income + d.expenses + d.scheduled
        const incH = (d.income / max) * innerH
        const expH = (d.expenses / max) * innerH
        const schH = (d.scheduled / max) * innerH
        const stackTop = padT + innerH - (total / max) * innerH
        // bottom: income | mid: expenses | top: scheduled | cap: bg-weak-50 above
        let cursor = padT + innerH
        const incY = cursor - incH
        cursor = incY
        const expY = cursor - expH - gap
        cursor = expY
        const schY = cursor - schH - gap
        return (
          <g key={i}>
            {/* cap to ceiling */}
            <rect x={x} y={padT} width={barW} height={Math.max(0, stackTop - padT - gap)} className="fill-bg-weak-50" />
            <rect x={x} y={incY} width={barW} height={incH} fill={COLORS.income} />
            <rect x={x} y={expY} width={barW} height={expH} fill={COLORS.expenses} />
            <rect x={x} y={schY} width={barW} height={schH} fill={COLORS.scheduled} rx={2} />
            <text
              x={x + barW / 2}
              y={h - 4}
              textAnchor="middle"
              className="fill-text-soft-400 text-[10px]"
            >
              {d.month.slice(0, 1)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function resampleByRange(range: "monthly" | "weekly" | "bimonth" | "quarterly") {
  if (range === "monthly") return CHART_DATA
  if (range === "weekly") {
    return ["M", "T", "W", "T", "F", "S", "S"].map((m, i) => ({
      month: m,
      income: 4000 + i * 600,
      expenses: 2500 + i * 400,
      scheduled: 1500 + i * 250,
    }))
  }
  if (range === "bimonth") {
    return ["Jan-Feb", "Mar-Apr", "May-Jun", "Jul-Aug", "Sep-Oct", "Nov-Dec"].map((m, i) => ({
      month: m,
      income: 18000 + i * 1500,
      expenses: 13000 + i * 1000,
      scheduled: 8000 + i * 1200,
    }))
  }
  return ["Q1", "Q2", "Q3", "Q4"].map((m, i) => ({
    month: m,
    income: 45000 + i * 5000,
    expenses: 38000 + i * 2500,
    scheduled: 26000 + i * 3000,
  }))
}
