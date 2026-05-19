"use client"

import * as React from "react"
import { Badge } from "@/registry/dash/ui/badge"
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
 * Finance Widget — Total Balance. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-total-balance.tsx + chart-step-line.tsx
 *
 * Headline: $14,480.24 + +5% green Badge.
 * Series (6 months): 100 / 1000 / 500 / 50 / 1000 / 500 — rendered as step line.
 */

const SERIES = [
  { date: "Jan", value: 100 },
  { date: "Feb", value: 1000 },
  { date: "Mar", value: 500 },
  { date: "Apr", value: 50 },
  { date: "May", value: 1000 },
  { date: "Jun", value: 500 },
]

const CURRENCIES = ["USD", "EUR", "TRY", "JPY"]

export default function FinanceTotalBalanceWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="Total Balance"
        description="178px tall summary card: total ($14,480.24) + green +5% delta Badge + currency Select + 6-month step-line chart."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="USD · $14,480.24"
          preview={
            <div className="max-w-md">
              <TotalBalanceCard />
            </div>
          }
          code={`<TotalBalance amount={14480.24} delta={+5} currency="USD" series={chartData} />`}
        />
      </DocsSection>

      <DocsSection title="Step line">
        <DocsExample
          title="6-month series"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 max-w-md">
              <StepLine data={SERIES} />
            </div>
          }
          code={`<StepLine data={[100, 1000, 500, 50, 1000, 500]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="$0.00"
          preview={
            <div className="max-w-md">
              <div className="relative flex h-[178px] flex-col rounded-2xl bg-bg-white-0 p-5 pb-4 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-text-sub-600">Total Balance</div>
                    <div className="mt-1 text-xl font-medium text-text-strong-950 tabular-nums">$0.00</div>
                  </div>
                  <Select defaultValue="USD" disabled>
                    <SelectTrigger className="h-7 px-2 text-xs gap-1 w-[70px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-text-soft-400">You do not have any data.</p>
                </div>
              </div>
            </div>
          }
          code={`<TotalBalanceEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "amount", type: "number", defaultValue: "14480.24", description: "Headline balance." },
            { name: "delta", type: "number", defaultValue: "5", description: "Period % change, rendered as Badge (green +, red −)." },
            { name: "currency", type: '"USD" | "EUR" | "TRY" | "JPY"', defaultValue: '"USD"', description: "Currency Select." },
            { name: "series", type: "Array<{ date, value }>", description: "Step-line data, 6 monthly buckets in source." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Container</strong> — 178px tall rounded-2xl card, ring-stroke-soft-200, shadow-sm.</li>
          <li><strong>Header</strong> — 2-line label/amount (title-h5) + green +5% Badge + compact Currency Select on the right.</li>
          <li><strong>Step line</strong> — 6 monthly steps, MMM tick formatter. Source uses ChartStepLine (recharts).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function TotalBalanceCard() {
  return (
    <div className="relative flex h-[178px] flex-col rounded-2xl bg-gradient-to-br from-success-lighter to-bg-white-0 p-5 pb-4 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-text-sub-600">Total Balance</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-xl font-medium text-text-strong-950 tabular-nums">$14,480.24</div>
              <Badge status="success" appearance="lighter">+5%</Badge>
            </div>
          </div>
          <Select defaultValue="USD">
            <SelectTrigger className="h-7 px-2 text-xs gap-1 w-[70px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <StepLine data={SERIES} />
      </div>
    </div>
  )
}

function StepLine({ data }: { data: typeof SERIES }) {
  const w = 360
  const h = 70
  const padX = 12
  const padY = 6
  const innerW = w - padX * 2
  const innerH = h - padY * 2 - 14 // reserve y label area
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))
  const stepX = innerW / (data.length - 1)
  const norm = (v: number) => padY + innerH - ((v - min) / Math.max(1, max - min)) * innerH

  // Step path: horizontal then vertical between points
  let d = `M ${padX} ${norm(data[0].value)}`
  for (let i = 1; i < data.length; i++) {
    const x = padX + stepX * i
    const yPrev = norm(data[i - 1].value)
    const y = norm(data[i].value)
    d += ` L ${x} ${yPrev} L ${x} ${y}`
  }

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <path d={d} fill="none" stroke="var(--state-information-base, #3F6FFF)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((p, i) => {
        const x = padX + stepX * i
        return (
          <g key={i}>
            <circle cx={x} cy={norm(p.value)} r={2} fill="var(--state-information-base, #3F6FFF)" />
            <text x={x} y={h - 2} textAnchor="middle" className="fill-text-soft-400 text-[10px]">
              {p.date.toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
