"use client"

import * as React from "react"
import { RiFolderChartLine, RiBarChartLine } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from "@/registry/dash/ui/avatar"
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
 * HR Widget — Training Analysis. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-training-analysis.tsx
 *
 * Headline (courses completed) + small avatar group + 7-bar sparkline.
 */
const BARS = [
  { day: "Monday", value: 45 },
  { day: "Tuesday", value: 30 },
  { day: "Wednesday", value: 50 },
  { day: "Thursday", value: 40 },
  { day: "Friday", value: 60 },
  { day: "Saturday", value: 70 },
  { day: "Sunday", value: 35 },
]

export default function HRTrainingAnalysisWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Training Analysis"
        description="Quarterly training pulse — courses completed + 26 attendees, summarised next to a 7-bar weekly sparkline."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="12 courses · 26 attended"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiFolderChartLine className="size-4 text-icon-sub-600" /> Training Analysis</>}
                action={<Button tone="neutral" style="stroke" size="xs">Details</Button>}
              >
                <Divider />
                <div className="flex gap-1 pt-4">
                  <div className="flex-1">
                    <div className="text-base font-medium text-text-strong-950">12 courses</div>
                    <div className="text-xs text-text-sub-600">Completed in this quarter</div>
                    <div className="mt-[16px] flex items-center gap-2">
                      <AvatarGroup size="xs" spacing="tight">
                        <Avatar><AvatarImage src="/images/avatar/illustration/james.png" /><AvatarFallback>JB</AvatarFallback></Avatar>
                        <Avatar><AvatarImage src="/images/avatar/illustration/sophia.png" /><AvatarFallback>SW</AvatarFallback></Avatar>
                        <Avatar><AvatarImage src="/images/avatar/illustration/arthur.png" /><AvatarFallback>AT</AvatarFallback></Avatar>
                      </AvatarGroup>
                      <div className="text-xs text-text-sub-600">26 Attended</div>
                    </div>
                  </div>
                  <BarChart bars={BARS} />
                </div>
              </WidgetShell>
            </div>
          }
          code={`<BarChart bars={BARS} />`}
        />
      </DocsSection>

      <DocsSection title="Bar chart">
        <DocsExample
          title="7 days (Mon-Sun)"
          preview={
            <div className="bg-bg-white-0 border border-stroke-soft-200 rounded-lg p-3 inline-block">
              <BarChart bars={BARS} />
            </div>
          }
          code={`<BarChart bars={[45, 30, 50, 40, 60, 70, 35]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="0 courses"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiFolderChartLine className="size-4 text-icon-sub-600" /> Training Analysis</>}>
                <Divider />
                <div className="flex gap-1 pt-4">
                  <div className="flex-1">
                    <div className="text-base font-medium text-text-sub-600">0 courses</div>
                    <div className="text-xs text-text-soft-400">Completed in this quarter</div>
                    <div className="mt-[16px] flex items-center gap-2">
                      <div className="size-6 rounded-full bg-bg-weak-50" />
                      <div className="text-xs text-text-sub-600">No attendance</div>
                    </div>
                  </div>
                  <BarChart bars={BARS.map((b) => ({ ...b, value: 100 }))} disabled />
                </div>
                <div className="flex flex-col items-center gap-3 py-6">
                  <RiBarChartLine className="size-8 text-text-soft-400" />
                  <p className="text-sm text-text-soft-400">No training data yet.</p>
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
            { name: "totalCourses", type: "number", description: "Headline integer above the helper." },
            { name: "attendees", type: "number", description: "Driven by the avatar group + small caption." },
            { name: "bars[]", type: "{ day, value }[]", description: "7-day series. Max value normalised to the tallest bar." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Left column</strong> — label-md headline + xs helper + avatar group + N Attended.</li>
          <li><strong>Bar chart</strong> — 7 vertical bars, 12px wide, 8px gap. Primary-base fills, sub-300 in disabled state.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function BarChart({ bars, disabled }: { bars: { day: string; value: number }[]; disabled?: boolean }) {
  const max = Math.max(...bars.map((b) => b.value))
  const barW = 12
  const gap = 8
  const w = bars.length * barW + (bars.length - 1) * gap
  const h = 60
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      {bars.map((b, i) => {
        const x = i * (barW + gap)
        const bh = (b.value / max) * h
        return (
          <rect
            key={b.day}
            x={x}
            y={h - bh}
            width={barW}
            height={bh}
            rx="3"
            fill={disabled ? "var(--bg-soft-200)" : "var(--primary-base)"}
          />
        )
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
