"use client"

import * as React from "react"
import { RiTimerLine, RiTimerFlashLine } from "@remixicon/react"
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
 * HR Widget — Daily Work Hours. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-daily-work-hours.tsx
 *
 * 3 segments — Pause Time, Active Time, Extra Time (minutes).
 */
const DATA: { label: string; minutes: number; color: string }[] = [
  { label: "Pause Time", minutes: 3 * 60 + 51, color: "bg-(--state-warning-base)" },
  { label: "Active Time", minutes: 6 * 60 + 27, color: "bg-(--state-success-base)" },
  { label: "Extra Time", minutes: 2 * 60 + 23, color: "bg-(--state-information-base)" },
]

const TOTAL = DATA.reduce((acc, c) => acc + c.minutes, 0)

export default function HRDailyWorkHoursWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Daily Work Hours"
        description="Single-day work breakdown across Pause / Active / Extra time. Headline total + horizontal stacked category bar with a legend underneath."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="12h 41m total — 3 segments"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiTimerLine className="size-4 text-icon-sub-600" /> Daily Work Hours</>}
                action={<Button tone="neutral" style="stroke" size="xs">Details</Button>}
              >
                <Divider />
                <div className="space-y-4 pt-4">
                  <div className="text-sm text-text-sub-600">
                    <span className="text-text-strong-950 font-medium">{Math.floor(TOTAL / 60)}</span> hours{" "}
                    <span className="text-text-strong-950 font-medium">{TOTAL % 60}</span> minutes in total ⏳
                  </div>
                  <CategoryBar />
                </div>
              </WidgetShell>
            </div>
          }
          code={`<CategoryBar data={[
  { label: "Pause Time", minutes: 231 },
  { label: "Active Time", minutes: 387 },
  { label: "Extra Time", minutes: 143 },
]} />`}
        />
      </DocsSection>

      <DocsSection title="Category bar — segment fill">
        <DocsExample
          title="3-segment stacked bar"
          preview={<CategoryBar />}
          code={`<CategoryBar />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No tracked hours"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiTimerLine className="size-4 text-icon-sub-600" /> Daily Work Hours</>}>
                <Divider />
                <div className="space-y-4 pt-4">
                  <div className="text-sm text-text-soft-400">
                    <span className="text-text-sub-600 font-medium">0</span> hours{" "}
                    <span className="text-text-sub-600 font-medium">0</span> minutes in total ⏳
                  </div>
                  <div className="h-2 rounded-full bg-bg-soft-200" />
                  <div className="flex flex-wrap gap-3">
                    {DATA.map((d) => (
                      <div key={d.label} className="flex items-center gap-1.5 text-xs text-text-soft-400">
                        <span className="size-2 rounded-full bg-bg-soft-200" />
                        {d.label}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <RiTimerFlashLine className="size-8 text-text-soft-400" />
                    <p className="text-center text-sm text-text-soft-400">No tracked time yet.</p>
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
            { name: "data[].label", type: "string", description: "Segment label rendered in the legend." },
            { name: "data[].minutes", type: "number", description: "Segment length in minutes. Sum drives the headline total." },
            { name: "data[].color", type: "string", description: "Tailwind bg class for the segment." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Headline</strong> — total time string with bold numerals + tag emoji.</li>
          <li><strong>Bar</strong> — 8px stacked horizontal segments, rounded-full ends. Hairline 1px gap between segments.</li>
          <li><strong>Legend</strong> — dot + label triplet (warning / success / information dot colors).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function CategoryBar() {
  return (
    <div className="space-y-3">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-bg-soft-200">
        {DATA.map((d, i) => {
          const pct = (d.minutes / TOTAL) * 100
          return <div key={i} className={cn("h-full", d.color)} style={{ width: `${pct}%` }} />
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        {DATA.map((d) => {
          const h = Math.floor(d.minutes / 60)
          const m = d.minutes % 60
          return (
            <div key={d.label} className="flex items-center gap-1.5 text-xs text-text-sub-600">
              <span className={cn("size-2 rounded-full", d.color)} />
              <span className="text-text-strong-950 font-medium">{d.label}</span>
              <span className="text-text-soft-400 tabular-nums">{h}h {m}m</span>
            </div>
          )
        })}
      </div>
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
