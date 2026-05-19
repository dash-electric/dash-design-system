"use client"

import * as React from "react"
import { RiInformationLine } from "@remixicon/react"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Marketing Widget — Campaign Data.
 * Ported from AlignUI Marketing Template (widget-campaign-data.tsx, 2026-05-18).
 *
 * Structure:
 *   - Header: title + tooltip, "$1,750" + Badge "Last 15 days", Details button.
 *   - Body: 2-column grid (86px h, top border faded-lighter).
 *       Left  = area chart (primary stroke + fill).
 *       Right = "45%" headline + "$32.9K used" caption, separated by a 2px primary border-left.
 */

// 18-point fixed series (matches source: 18 months starting 2023-06-01,
// values ∈ [20, 50]).
const SERIES = [
  35, 28, 42, 30, 45, 33, 25, 48, 32, 38, 24, 46, 29, 41, 36, 27, 50, 31,
]

function AreaSpark({ values, width = 200, height = 86 }: { values: number[]; width?: number; height?: number }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const stepX = width / (values.length - 1)
  const pts = values.map((v, i) => `${i * stepX},${height - ((v - min) / span) * (height - 6) - 3}`)
  const linePath = `M ${pts.join(" L ")}`
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      <path d={areaPath} fill="var(--primary-alpha-10)" />
      <path d={linePath} fill="none" stroke="var(--primary-base)" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  )
}

function CampaignDataWidget() {
  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex items-start gap-2 p-5 pb-4">
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-text-sub-600">Campaign Data</span>
            <RiInformationLine className="size-5 text-text-disabled-300" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight text-text-strong-950">$1,750</span>
            <Badge status="success" appearance="lighter" size="md">
              Last 15 days
            </Badge>
          </div>
        </div>
        <Button size="xs" style="stroke" tone="neutral">
          Details
        </Button>
      </div>

      <div className="grid h-[86px] grid-cols-2 border-t border-stroke-soft-200/60">
        <AreaSpark values={SERIES} />
        <div className="flex flex-col items-start justify-end border-l-2 border-(--primary-base) px-4 pb-4">
          <div className="text-sm font-semibold text-text-strong-950">45%</div>
          <div className="text-[11px] text-text-soft-400">$32.9K used</div>
        </div>
      </div>
    </div>
  )
}

export default function CampaignDataWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Campaign Data"
        description="Spend pacing — header with running total + window badge, paired with a half-card area sparkline (primary stroke + primary-alpha-10 fill) and a usage call-out separated by a 2px primary rule."
        status="shipped"
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="$1,750 over 15 days"
          preview={
            <div className="max-w-md mx-auto w-full">
              <CampaignDataWidget />
            </div>
          }
          code={`<CampaignDataWidget />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No campaign running"
          preview={
            <div className="max-w-md mx-auto rounded-2xl bg-bg-white-0 p-5 ring-1 ring-inset ring-stroke-soft-200">
              <div className="text-sm font-medium text-text-sub-600">Campaign Data</div>
              <div className="mt-2 text-xs text-text-soft-400">No active campaign — start one to see daily spend.</div>
            </div>
          }
          code={`{!campaign ? <Empty/> : <CampaignDataWidget/>}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "spend", type: "number", description: "Header value (e.g. 1750)." },
            { name: "windowLabel", type: "ReactNode", defaultValue: '"Last 15 days"', description: "Right of KPI — uses Badge variant=lighter status=success." },
            { name: "series", type: "number[]", description: "Daily/weekly values driving the area sparkline. 18 points in source." },
            { name: "usedPercent", type: "number", defaultValue: "45", description: "Right-pane headline number." },
            { name: "usedAmount", type: "string", defaultValue: '"$32.9K used"', description: "Right-pane caption." },
            { name: "onDetails", type: "() => void", description: "Click handler for the top-right Details button." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Card: rounded-2xl, overflow-hidden (clips chart edges), shadow-regular-xs ring stroke-soft-200.</li>
          <li>Header pad: 20/20/16/20, KPI 24px + lighter success Badge "Last 15 days", neutral-stroke 28px Details button.</li>
          <li>Chart pane: 86px h, 2-column grid split by faded-lighter top border.</li>
          <li>Right call-out: 2px primary-base left border, pb-4 pl-4, 16px figure + 11px caption.</li>
          <li>Area fill = primary-alpha-10, stroke = primary-base (2px), no dots.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
