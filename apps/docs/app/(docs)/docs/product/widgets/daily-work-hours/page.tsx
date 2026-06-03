"use client"

import * as React from "react"
import { RiTimeLine as Clock } from "@remixicon/react"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Daily Work Hours widget — Figma 1:1 (re-verified 2026-05-19).
 *   3860:4298    Work Hour Analysis card — Total Work + range switcher + line
 *   3871:19644   Work Hour Analysis — Empty=On (no records placeholder)
 *
 * Earlier draft listed these IDs but they belong to other families:
 *   3449:24209 → Daily Feedback (Empty=Off, input state)
 *   3871:18488 → Employee Spotlight (Empty=On)
 *   3871:19209 → Daily Feedback (Empty=On)
 * Bar-chart variants (compact + labeled) are render-only — no dedicated
 * Figma node ID is published; they were synthesised from the Work Hour
 * Analysis line variants in parent widgets/page.tsx.
 */
export default function DailyWorkHoursWidgetPage() {
  const [range, setRange] = React.useState("5d")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Daily Work Hours"
        description="Weekly bar chart of hours worked per day (M / T / W / T / F / S / S). Stacked single-color bars + headline total + optional range switcher (5D / 2W / 1M / 6M / 1Y)."
      />

      <DocsSection title="Bar chart (compact)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default dashboard tile — 7 bars sized by hours, labeled by weekday initial. No axis, no values. Render-only variant (no dedicated Figma node).
        </p>
        <DocsExample
          title="7-day bars"
          preview={
            <div className="max-w-xs">
              <WidgetShell title="Daily Work Hours" seeAll>
                <DailyWorkHoursBars values={[40, 60, 80, 50, 70, 90, 30]} />
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title="Daily Work Hours" seeAll>
  <DailyWorkHoursBars values={[40, 60, 80, 50, 70, 90, 30]} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Labeled / tooltip bar">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Same bars w/ active-bar emphasis + floating value tooltip on hover. Render-only variant; Figma node 3871:19644 covers the Work Hour Analysis empty state, not this bar chart.
        </p>
        <DocsExample
          title="Active bar w/ tooltip"
          preview={
            <div className="max-w-xs">
              <WidgetShell title="Daily Work Hours" seeAll>
                <DailyWorkHoursBars values={[40, 60, 80, 50, 70, 90, 30]} activeIndex={5} tooltip="Sat · 9h" />
              </WidgetShell>
            </div>
          }
          code={`<DailyWorkHoursBars values={[40, 60, 80, 50, 70, 90, 30]} activeIndex={5} tooltip="Sat · 9h" />`}
        />
      </DocsSection>

      <DocsSection title="Work Hour Analysis (line + range)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Larger card variant — total hours headline + range switcher + line chart w/ hovered-day marker. Figma node 3860:4298.
        </p>
        <DocsExample
          title="Line variant"
          preview={
            <div className="max-w-sm">
              <WidgetShell title={
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-icon-sub-600" />
                  Work Hour Analysis
                </span>
              } seeAll>
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-(--primary-alpha-10) text-(--primary-base)">
                    <Clock className="size-4" />
                  </span>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-text-soft-400">Total Work</div>
                    <div className="text-base font-semibold text-text-strong-950 tabular-nums">38 hours · 12 mins</div>
                  </div>
                </div>
                <SegmentedControl size="sm" value={range} onValueChange={setRange} className="w-full mt-2">
                  {["5d", "2w", "1m", "6m", "1y"].map((r) => (
                    <SegmentedItem key={r} size="sm" value={r} className="flex-1 uppercase">{r}</SegmentedItem>
                  ))}
                </SegmentedControl>
                <WorkHourLine />
                <p className="text-[10px] text-text-soft-400">Total work hours include extra hours.</p>
              </WidgetShell>
            </div>
          }
          code={`<WorkHourLine />
<SegmentedControl value={range} onValueChange={setRange}>
  <SegmentedItem value="5d">5D</SegmentedItem>
  <SegmentedItem value="2w">2W</SegmentedItem>
  <SegmentedItem value="1m">1M</SegmentedItem>
  <SegmentedItem value="6m">6M</SegmentedItem>
  <SegmentedItem value="1y">1Y</SegmentedItem>
</SegmentedControl>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "values", type: "number[]", description: "Bar heights 0–100. Defaults to a 7-day week (M..S)." },
            { name: "labels", type: "string[]", defaultValue: '["M","T","W","T","F","S","S"]', description: "Per-bar weekday labels." },
            { name: "activeIndex", type: "number", description: "Highlights one bar (full primary), the rest mute to primary-alpha-24." },
            { name: "tooltip", type: "string", description: "Floating tooltip rendered above the active bar." },
            { name: "range", type: '"5d" | "2w" | "1m" | "6m" | "1y"', defaultValue: '"5d"', description: "Range switcher state for the line-chart variant." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><span className="font-medium">Shell</span> — `WidgetShell` (title + See All). Bar variant fits in 4-up grid.</li>
          <li><span className="font-medium">Bars</span> — 7 columns, gap 6px, baseline aligned. Active bar `bg-(--primary-base)`, rest `bg-(--primary-alpha-24)`.</li>
          <li><span className="font-medium">Labels</span> — `text-[9px] text-text-soft-400` weekday initial under each bar.</li>
          <li><span className="font-medium">Headline (line variant)</span> — total hours `text-base font-semibold tabular-nums` + uppercase eyebrow.</li>
          <li><span className="font-medium">Tooltip</span> — 1-line `rounded-md border bg-bg-white-0 shadow-sm` floating above active bar.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* helpers */
function WidgetShell({ title, seeAll, children, className }: { title: React.ReactNode; seeAll?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {seeAll && <LinkButton size="sm">See All</LinkButton>}
      </div>
      {children}
    </div>
  )
}

function DailyWorkHoursBars({
  values,
  labels = ["M", "T", "W", "T", "F", "S", "S"],
  activeIndex,
  tooltip,
}: {
  values: number[]
  labels?: string[]
  activeIndex?: number
  tooltip?: string
}) {
  return (
    <div className="relative grid grid-cols-7 gap-1.5 h-24 items-end">
      {values.map((v, i) => {
        const active = activeIndex === i
        return (
          <div key={i} className="relative flex flex-col items-center gap-1 h-full justify-end">
            {active && tooltip ? (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-stroke-soft-200 bg-bg-white-0 px-1.5 py-0.5 text-[10px] text-text-strong-950 shadow-sm">
                {tooltip}
              </span>
            ) : null}
            <div
              className={cn(
                "w-full rounded-t-sm",
                active ? "bg-(--primary-base)" : "bg-(--primary-alpha-24)",
              )}
              style={{ height: `${v}%` }}
            />
            <div className="text-[9px] text-text-soft-400">{labels[i]}</div>
          </div>
        )
      })}
    </div>
  )
}

function WorkHourLine() {
  return (
    <svg viewBox="0 0 240 80" className="w-full h-20">
      <polyline
        fill="none"
        stroke="var(--primary-base)"
        strokeWidth="1.5"
        points="0,60 24,42 48,30 72,55 96,40 120,52 144,28 168,18 192,42 216,28 240,20"
      />
      <circle cx="120" cy="52" r="3" fill="var(--primary-base)" />
    </svg>
  )
}
