"use client"

import * as React from "react"
import { RiFileChartLine, RiTimeFill, RiInformationFill, RiLineChartLine } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * HR Widget — Work Hour Analysis. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-work-hour-analysis.tsx
 *
 * Total work hours headline + range button group + step-line trend chart.
 */
const RAW = [
  { date: "2024-11-04", hours: 1 },
  { date: "2024-11-05", hours: 3.5 },
  { date: "2024-11-06", hours: 6 },
  { date: "2024-11-07", hours: 3.33 },
  { date: "2024-11-08", hours: 7 },
  { date: "2024-11-09", hours: 2.75 },
  { date: "2024-11-10", hours: 5 },
]

const RANGES = ["5D", "2W", "1M", "6M", "1Y"] as const

export default function HRWorkHourAnalysisWidgetPage() {
  const [range, setRange] = React.useState<typeof RANGES[number]>("5D")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Work Hour Analysis"
        description="Long-form work-hour breakdown. Headline total + 5-button range picker (5D / 2W / 1M / 6M / 1Y) + step-line trend chart with hover tooltip."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="38h 12m — last 7 days"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiFileChartLine className="size-4 text-icon-sub-600" /> Work Hour Analysis</>}
                action={<Button tone="neutral" style="stroke" size="xs">See All</Button>}
              >
                <Divider />
                <div className="space-y-5 pt-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--primary-alpha-10)">
                      <RiTimeFill className="size-5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] uppercase tracking-wider text-text-soft-400">Total Work</div>
                      <div className="text-lg font-medium text-text-strong-950">38 hours · 12 mins</div>
                    </div>
                  </div>
                  <RangePicker value={range} onChange={setRange} />
                  <StepLineChart data={RAW} />
                  <div className="flex items-center gap-1">
                    <RiInformationFill className="size-4 text-text-soft-400" />
                    <span className="text-xs text-text-soft-400">Total work hours include extra hours.</span>
                  </div>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<StepLineChart data={RAW} />`}
        />
      </DocsSection>

      <DocsSection title="Range picker">
        <DocsExample
          title="5D / 2W / 1M / 6M / 1Y"
          preview={<div className="max-w-md"><RangePicker value={range} onChange={setRange} /></div>}
          code={`<RangePicker value={range} onChange={setRange} />`}
        />
      </DocsSection>

      <DocsSection title="Step-line chart">
        <DocsExample
          title="7-day work hour trend"
          preview={
            <div className="bg-bg-white-0 border border-stroke-soft-200 rounded-lg p-3">
              <StepLineChart data={RAW} />
            </div>
          }
          code={`<StepLineChart data={[{date, hours}, ...]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="0h 0m"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiFileChartLine className="size-4 text-icon-sub-600" /> Work Hour Analysis</>}>
                <Divider />
                <div className="space-y-5 pt-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-10 items-center justify-center rounded-full bg-bg-white-0 border border-stroke-soft-200">
                      <RiTimeFill className="size-5 text-text-sub-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] uppercase tracking-wider text-text-soft-400">Total Work</div>
                      <div className="text-lg font-medium text-text-strong-950">0 hours · 0 mins</div>
                    </div>
                  </div>
                  <RangePicker value={range} onChange={setRange} />
                  <div className="flex flex-col items-center gap-3 py-10">
                    <RiLineChartLine className="size-8 text-text-soft-400" />
                    <p className="text-center text-sm text-text-soft-400">
                      No records of work hours yet.<br /> Please check back later.
                    </p>
                  </div>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<EmptyState />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data[]", type: "{ date: ISOString, hours: number }[]", description: "Time series — drives the step-line chart." },
            { name: "range", type: '"5D" | "2W" | "1M" | "6M" | "1Y"', description: "Active range. Caller refetches `data` on change." },
            { name: "total", type: "string", description: "Headline total time string." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Headline</strong> — 40px primary-tinted circle + RiTimeFill + total label.</li>
          <li><strong>Range picker</strong> — 5-segment button group, xxs size, equal flex.</li>
          <li><strong>Chart</strong> — step-line series with primary-base stroke + primary-alpha-10 fill underneath.</li>
          <li><strong>Footnote</strong> — info icon + xs soft-400 caption.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function RangePicker({ value, onChange }: { value: typeof RANGES[number]; onChange: (v: typeof RANGES[number]) => void }) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-0.5 rounded-lg bg-bg-weak-50 p-0.5">
      {RANGES.map((r) => {
        const active = r === value
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={cn(
              "h-6 text-xs font-medium rounded-md transition-colors",
              active ? "bg-bg-white-0 text-text-strong-950 shadow-sm" : "text-text-sub-600 hover:text-text-strong-950",
            )}
          >
            {r}
          </button>
        )
      })}
    </div>
  )
}

function StepLineChart({ data }: { data: { date: string; hours: number }[] }) {
  const w = 300
  const h = 120
  const max = Math.max(...data.map((d) => d.hours))
  const stepX = w / data.length
  const norm = (v: number) => h - (v / max) * (h - 8) - 4

  // Step-line: horizontal-vertical-horizontal pattern
  let path = `M 0 ${norm(data[0].hours)}`
  data.forEach((d, i) => {
    const x = (i + 1) * stepX
    const y = norm(d.hours)
    path += ` L ${i * stepX + stepX / 2} ${y} L ${x} ${y}`
  })

  let area = path + ` L ${w} ${h} L 0 ${h} Z`

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
      <path d={area} fill="var(--primary-alpha-10)" />
      <path d={path} fill="none" stroke="var(--primary-base)" strokeWidth="2" />
      {data.map((d, i) => {
        const x = i * stepX + stepX / 2
        const y = norm(d.hours)
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--primary-base)" />
      })}
    </svg>
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
      <div className="flex items-center gap-2 h-9 mb-2">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}
