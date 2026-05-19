"use client"

import * as React from "react"
import { RiBarChartBoxLine } from "@remixicon/react"
import { Divider } from "@/registry/dash/ui/divider"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/registry/dash/ui/tooltip"
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
 * Finance Widget — Major Expenses. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-major-expenses.tsx + vertical-bar-chart.tsx
 *
 * Horizontal bar chart, 3 rows (Housing 10256.50 / Utilities 6438.82 / Food 2045.75).
 * Period select: Weekly / Monthly / Yearly.
 */

const DATA = [
  { id: "housing", name: "Housing", value: 10256.5, color: "var(--state-information-base, #3F6FFF)" },
  { id: "utilities", name: "Utilities", value: 6438.82, color: "var(--state-verified-base, #22C55E)" },
  { id: "food", name: "Food", value: 2045.75, color: "var(--state-feature-base, #7C3AED)" },
]

const PERIODS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

export default function FinanceMajorExpensesWidgetPage() {
  return (
    <TooltipProvider>
      <DocsPageShell>
        <DocsHeader
          category="Product Components / Widgets / Finance (deep)"
          title="Major Expenses"
          description="Compact horizontal bar chart of the top 3 categories. Source ships Housing ($10,256.50), Utilities ($6,438.82), Food ($2,045.75)."
        />

        <DocsSection title="Full widget">
          <DocsExample
            title="Weekly — 3 categories"
            preview={
              <div className="max-w-md">
                <WidgetShell
                  title={<><RiBarChartBoxLine className="size-4 text-icon-sub-600" /> Major Expenses</>}
                  action={
                    <Select defaultValue="weekly">
                      <SelectTrigger className="h-7 px-2 text-xs gap-1 w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  }
                >
                  <Divider />
                  <HBarChart data={DATA} />
                </WidgetShell>
              </div>
            }
            code={`<MajorExpenses data={[
  { id: 'housing', name: 'Housing', value: 10256.50 },
  { id: 'utilities', name: 'Utilities', value: 6438.82 },
  { id: 'food', name: 'Food', value: 2045.75 },
]} period="weekly" />`}
          />
        </DocsSection>

        <DocsSection title="Tooltip on hover">
          <DocsExample
            title="Currency-formatted tooltip"
            preview={
              <div className="max-w-md">
                <HBarChart data={DATA} showTooltipNotes />
              </div>
            }
            code={`<Tooltip content="$10,256.50" />`}
          />
        </DocsSection>

        <DocsSection title="Empty state">
          <DocsExample
            title="No expenses yet"
            preview={
              <div className="max-w-md">
                <WidgetShell
                  title={<><RiBarChartBoxLine className="size-4 text-icon-sub-600" /> Major Expenses</>}
                  action={
                    <Select defaultValue="weekly" disabled>
                      <SelectTrigger className="h-7 px-2 text-xs gap-1 w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  }
                >
                  <Divider />
                  <div className="flex h-[180px] flex-col items-center justify-center gap-2 text-center">
                    <EmptyStateIllustration kind="major-expenses" />
                    <p className="text-xs text-text-sub-600 max-w-[28ch]">No records of expenses yet. Please check back later.</p>
                  </div>
                </WidgetShell>
              </div>
            }
            code={`<MajorExpensesEmpty />`}
          />
        </DocsSection>

        <DocsSection title="API">
          <DocsPropsTable
            rows={[
              { name: "data", type: "Array<{ id, name, value, color? }>", description: "Up to 3 rows, sorted by value desc in source." },
              { name: "period", type: '"weekly" | "monthly" | "yearly"', defaultValue: '"weekly"', description: "Select-driven dataset switcher." },
              { name: "chartConfig", type: "Record<id, { color }>", description: "Per-id fill color." },
            ]}
          />
        </DocsSection>

        <DocsSection title="Anatomy">
          <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
            <li><strong>Horizontal bars</strong> — 16px bar size, 48px Y-axis label rail, 2px radius. Source uses ResponsiveContainer @ 86px height.</li>
            <li><strong>X axis</strong> — bottom ticks, compact number formatter (no axis line).</li>
            <li><strong>Hover</strong> — dot anchor at bar end + dark tooltip showing currency value.</li>
            <li><strong>Period Select</strong> — compact xsmall, end-aligned content.</li>
          </ul>
        </DocsSection>
      </DocsPageShell>
    </TooltipProvider>
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

function HBarChart({ data, showTooltipNotes }: { data: typeof DATA; showTooltipNotes?: boolean }) {
  const max = Math.max(...data.map((d) => d.value))
  const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)
  return (
    <div className="flex flex-col gap-3 pt-3">
      {data.map((d) => {
        const pct = (d.value / max) * 100
        const bar = (
          <div className="h-4 flex-1 rounded-[2px] bg-bg-weak-50 overflow-hidden">
            <div className="h-full rounded-[2px]" style={{ width: `${pct}%`, background: d.color }} />
          </div>
        )
        return (
          <div key={d.id} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-text-strong-950">{d.name}</span>
            {showTooltipNotes ? (
              <Tooltip>
                <TooltipTrigger asChild><div className="flex-1">{bar}</div></TooltipTrigger>
                <TooltipContent appearance="dark">{fmt(d.value)}</TooltipContent>
              </Tooltip>
            ) : bar}
            <span className="w-16 shrink-0 text-right text-[10px] tabular-nums text-text-soft-400">
              {Intl.NumberFormat("en", { notation: "compact" }).format(d.value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
