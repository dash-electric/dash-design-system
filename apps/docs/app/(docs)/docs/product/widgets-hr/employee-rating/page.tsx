"use client"

import * as React from "react"
import { RiUserStarLine, RiStarFill, RiStarLine, RiInformationFill } from "@remixicon/react"
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
 * HR Widget — Employee Rating. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-employee-rating.tsx
 */
const CHART = [
  500, 700, 2600, 900, 800, 1100, 1200, 2000, 1300, 1900, 2700, 2900, 600, 800, 2100,
]

export default function HREmployeeRatingWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Employee Rating"
        description="Aggregate rating snapshot. Star + score + cohort average, paired with a 15-point sparkline trend and an info caption."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="3.6 / 5 — overall 4.5"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiUserStarLine className="size-4 text-icon-sub-600" /> Employee Rating</>}
                action={<Button tone="neutral" style="stroke" size="xs">Details</Button>}
              >
                <Divider />
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-text-soft-400">Total Rating</div>
                      <div className="flex min-w-[172px] items-center gap-1.5 whitespace-nowrap">
                        <RiStarFill className="size-6 text-yellow-500" />
                        <span className="text-lg font-medium text-text-strong-950">3.6/5</span>
                        <span className="text-xs text-text-soft-400">(Overall 4.5)</span>
                      </div>
                    </div>
                    <Sparkline data={CHART} className="ml-auto" />
                  </div>
                  <InfoCallout text="Total work hours include extra hours." />
                </div>
              </WidgetShell>
            </div>
          }
          code={`<EmployeeRating value={3.6} max={5} overall={4.5} trend={[...]} />`}
        />
      </DocsSection>

      <DocsSection title="Sparkline trend">
        <DocsExample
          title="15 datapoints (2000-2014)"
          preview={
            <div className="bg-bg-white-0 rounded-lg p-3 border border-stroke-soft-200 inline-block">
              <Sparkline data={CHART} />
            </div>
          }
          code={`<Sparkline data={[500, 700, 2600, ...]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="0.0 / 0"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiUserStarLine className="size-4 text-icon-sub-600" /> Employee Rating</>}>
                <Divider />
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-text-soft-400">Total Rating</div>
                      <div className="flex min-w-[172px] items-center gap-1.5 whitespace-nowrap">
                        <RiStarLine className="size-6 text-stroke-soft-200" />
                        <span className="text-lg font-medium text-text-soft-400">0.0/0</span>
                        <span className="text-xs text-text-soft-400">(Overall 0)</span>
                      </div>
                    </div>
                    <div className="ml-auto h-0.5 w-[136px] bg-bg-soft-200" />
                  </div>
                  <InfoCallout text="No records of employee rating yet." muted />
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
            { name: "value", type: "number", description: "Headline score (e.g. 3.6)." },
            { name: "max", type: "number", defaultValue: "5", description: "Score scale." },
            { name: "overall", type: "number", description: "Cohort/company average shown in parens." },
            { name: "trend", type: "number[]", description: "Sparkline series." },
            { name: "footnote", type: "string", description: "Caption rendered in the info callout." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Star + score</strong> — yellow-500 RiStarFill + label-lg score + xs sub-400 overall.</li>
          <li><strong>Sparkline</strong> — 136×40 area chart, primary-base stroke + alpha-16 fill.</li>
          <li><strong>Footnote pill</strong> — boxed micro-caption with leading info icon (soft-400 in normal, disabled in empty).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 136
  const h = 40
  const min = Math.min(...data)
  const max = Math.max(...data)
  const stepX = w / (data.length - 1)
  const norm = (v: number) => h - ((v - min) / (max - min)) * (h - 4) - 2
  const points = data.map((v, i) => `${i * stepX},${norm(v)}`).join(" ")
  const areaPoints = `0,${h} ${points} ${w},${h}`
  return (
    <svg width={w} height={h} className={cn("block", className)} viewBox={`0 0 ${w} ${h}`}>
      <polygon points={areaPoints} fill="var(--primary-alpha-10)" />
      <polyline points={points} fill="none" stroke="var(--primary-base)" strokeWidth="1.5" />
    </svg>
  )
}

function InfoCallout({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <div className="flex gap-1 rounded-md bg-bg-white-0 p-1 border border-stroke-soft-200">
      <span className={cn("flex-1 pl-1.5 text-xs", muted ? "text-text-soft-400" : "text-text-sub-600")}>{text}</span>
      <RiInformationFill className={cn("size-4 shrink-0", muted ? "text-text-soft-400" : "text-text-soft-400")} />
    </div>
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
