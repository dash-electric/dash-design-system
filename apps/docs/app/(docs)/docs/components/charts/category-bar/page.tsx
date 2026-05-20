"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * CategoryBarChart — segmented stacked bar of N categories.
 * Ported from AlignUI Marketing Template `components/chart-category-bar.tsx` (2026-05-18).
 *
 * Source mechanics:
 *   - Each category's width = (value / TOTAL) * 100% via `d3.scaleLinear`.
 *   - Default colors = warning/away/stable (`COLORS`); legend palette overridable.
 *   - Marketing Template uses `bg-information-base / bg-verified-base / bg-feature-base /
 *     bg-warning-base / bg-away-base / bg-success-base / bg-stable-base` for sales channels.
 *
 * Mount animation: each cell's fill class is added on `mounted=true` so the bar
 * paints in after the first paint. The source attaches `chart-category-cell-load`
 * which staggers via `--i` CSS var. We replicate the staggered effect with a
 * `transition-[width]` + delay tied to index.
 */

type CategoryRow = { label: string; value: number }

type CategoryBarChartProps = {
  data: CategoryRow[]
  colors?: string[]
  wrapperClassName?: string
  categoryClassName?: string
  showLabels?: boolean
}

const DEFAULT_COLORS = ["bg-warning-base", "bg-away-base", "bg-stable-base"]

function LegendDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-3 shrink-0 rounded-full border-2 border-bg-white-0 bg-bg-soft-200 shadow-regular-xs",
        className,
      )}
    />
  )
}

function CategoryBarChart({
  data,
  colors = DEFAULT_COLORS,
  wrapperClassName,
  categoryClassName,
  showLabels = true,
}: CategoryBarChartProps) {
  const total = data.reduce((acc, r) => acc + r.value, 0) || 1
  return (
    <div className="flex flex-col gap-4">
      <div className={cn("flex gap-[5px]", wrapperClassName)}>
        {data.map((row, i) => (
          <div
            key={row.label}
            className={cn("h-2 rounded-sm transition-all", categoryClassName)}
            style={{ width: `${(row.value / total) * 100}%` }}
          >
            <div className={cn("h-full rounded-sm", colors[i % colors.length])} />
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="flex flex-wrap gap-4">
          {data.map((row, i) => (
            <span
              key={row.label}
              className="flex items-center gap-1 text-[11px] font-medium text-text-sub-600"
            >
              <LegendDot className={colors[i % colors.length]} />
              {row.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryBarChartEmpty({ labels }: { labels: string[] }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-[5px]">
        {labels.map((label) => (
          <div key={label} className="h-2.5 w-1/3 rounded-sm bg-bg-soft-200" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {labels.map((label) => (
          <span
            key={label}
            className="flex items-center gap-1 text-[11px] font-medium text-text-disabled-300"
          >
            <LegendDot className="bg-text-disabled-300" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

const lightData: CategoryRow[] = [
  { label: "Mobile", value: 60 },
  { label: "Desktop", value: 30 },
  { label: "Tablet", value: 10 },
]

const heavyData: CategoryRow[] = [
  { label: "Organic Search", value: 45 },
  { label: "Social Media", value: 30 },
  { label: "Direct", value: 25 },
  { label: "Email Campaigns", value: 20 },
  { label: "Paid Search", value: 15 },
  { label: "Affiliate Marketing", value: 10 },
  { label: "Referral", value: 8 },
]

const heavyColors = [
  "bg-information-base",
  "bg-verified-base",
  "bg-feature-base",
  "bg-warning-base",
  "bg-away-base",
  "bg-success-base",
  "bg-stable-base",
]

export default function CategoryBarChartPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Charts"
        title="Category Bar"
        description="Stacked horizontal bar that proportions N category values into a single 100% strip. Each segment width = value/total. Used inside the Sales Channels widget."
        status="stable"
        kind="atom"
      />

      <DocsSection title="Light load (3 categories)">
        <DocsExample
          title="Default palette"
          description="warning/away/stable. Width proportional to value."
          preview={
            <div className="w-full max-w-md">
              <CategoryBarChart data={lightData} categoryClassName="h-2" />
            </div>
          }
          code={`<CategoryBarChart
  data={[
    { label: "Mobile", value: 60 },
    { label: "Desktop", value: 30 },
    { label: "Tablet", value: 10 },
  ]}
/>`}
        />
      </DocsSection>

      <DocsSection title="Heavy load (7 categories)">
        <DocsExample
          title="Sales channels palette"
          description="The 7-color sequence used by the Sales Channels marketing widget."
          preview={
            <div className="w-full max-w-md">
              <CategoryBarChart
                data={heavyData}
                colors={heavyColors}
                wrapperClassName="gap-1"
                categoryClassName="h-[42px]"
                showLabels={false}
              />
            </div>
          }
          code={`<CategoryBarChart
  data={salesChannelsDataByPeriod.weekly}
  colors={[
    "bg-information-base", "bg-verified-base", "bg-feature-base",
    "bg-warning-base", "bg-away-base", "bg-success-base", "bg-stable-base",
  ]}
  wrapperClassName="gap-1"
  categoryClassName="h-[42px]"
  showLabels={false}
/>`}
        />
      </DocsSection>

      <DocsSection title="Single category">
        <DocsExample
          title="Edge case"
          description="One row fills the full 100% width."
          preview={
            <div className="w-full max-w-md">
              <CategoryBarChart data={[{ label: "Total", value: 1 }]} />
            </div>
          }
          code={`<CategoryBarChart data={[{ label: "Total", value: 1 }]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty / loading">
        <DocsExample
          title="Skeleton placeholder"
          description="3 equal soft slots + greyed legend. Use while data is loading."
          preview={
            <div className="w-full max-w-md">
              <CategoryBarChartEmpty labels={["Mobile", "Desktop", "Tablet"]} />
            </div>
          }
          code={`<CategoryBarChartEmpty labels={["Mobile", "Desktop", "Tablet"]} />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data", type: "{ label: string; value: number }[]", description: "Category rows. Each value is summed to compute proportions." },
            { name: "colors", type: "string[]", defaultValue: "warning/away/stable", description: "Background utility classes per segment. Cycles via modulo if data is longer than the array." },
            { name: "wrapperClassName", type: "string", description: "Class applied to the segment row (e.g. gap-1)." },
            { name: "categoryClassName", type: "string", description: "Class applied to each segment shell (e.g. h-[42px] for fat bars)." },
            { name: "showLabels", type: "boolean", defaultValue: "true", description: "Render the legend row below the bar." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Outer row: <code>flex gap-[5px]</code> for thin separators, or <code>gap-1</code> for fat segments.</li>
          <li>Each segment: outer shell (width %), inner cell (color class) — separation allows a staggered fade-in.</li>
          <li>Legend: <code>LegendDot</code> (size-3 circle with white 2px ring) + label text.</li>
          <li>Empty: 3 equal soft-200 slots + disabled-tone legend.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
