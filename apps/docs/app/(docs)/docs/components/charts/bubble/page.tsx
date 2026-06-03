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
 * BubbleChart — proportional-area packed bubbles.
 * Ported from AlignUI Marketing Template `components/bubble-chart.tsx` (2026-05-18).
 *
 * Source mechanics:
 *   - `maxRadius = height * 0.45`. Radius scales linearly: `r = (p/maxP) * maxRadius`.
 *   - Bubbles are sorted descending by percentage, then placed by rank:
 *       index 0 (largest) → right of center  (cx + r*0.5, cy)
 *       index 1 (medium)  → bottom-left      (cx - r*1.4, cy + r*0.4)
 *       index 2 (smallest) → top-left        (cx - r*1.4, cy - r*1.4)
 *       index 3+          → orbit around (angle 2πk/(n-2), distance 2r)
 *   - Each bubble renders the percentage as a centered text label sized at r/2.
 *   - `letterSpacing=-1`, `dominantBaseline=middle`, weight 500.
 */

type SalesData = {
  category: string
  percentage: number
  color: string
  textColor: string
}

type BubbleChartProps = {
  width?: number
  height?: number
  data: SalesData[]
}

function BubbleChart({ width = 600, height = 400, data }: BubbleChartProps) {
  const maxRadius = height * 0.45
  const maxPercentage = Math.max(...data.map((d) => d.percentage)) || 1
  const sorted = [...data].sort((a, b) => b.percentage - a.percentage)

  const bubbles = sorted.map((item, index) => {
    const radius = (item.percentage / maxPercentage) * maxRadius
    let x = width / 2
    let y = height / 2
    if (index === 0) {
      x = width / 2 + radius * 0.5
      y = height / 2
    } else if (index === 1) {
      x = width / 2 - radius * 1.4
      y = height / 2 + radius * 0.4
    } else if (index === 2) {
      x = width / 2 - radius * 1.4
      y = height / 2 - radius * 1.4
    } else {
      const angle = (2 * Math.PI * (index - 2)) / Math.max(1, data.length - 2)
      x += Math.cos(angle) * radius * 2
      y += Math.sin(angle) * radius * 2
    }
    return { ...item, radius, x, y }
  })

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Bubble chart">
      {bubbles.map((b) => (
        <g key={b.category}>
          <circle cx={b.x} cy={b.y} r={b.radius} fill={b.color} />
          <text
            x={b.x}
            y={b.y}
            fill={b.textColor}
            textAnchor="middle"
            fontSize={`${b.radius / 2}px`}
            fontWeight={500}
            dominantBaseline="middle"
            letterSpacing="-1"
            dy=".05em"
          >
            {`${b.percentage}%`}
          </text>
        </g>
      ))}
    </svg>
  )
}

const salesData: SalesData[] = [
  { category: "Direct", percentage: 60, color: "var(--primary-base)", textColor: "white" },
  { category: "Affiliate", percentage: 25, color: "var(--state-warning-base)", textColor: "white" },
  { category: "Referral", percentage: 15, color: "var(--state-information-base)", textColor: "white" },
]

const fourBubbles: SalesData[] = [
  { category: "Email", percentage: 45, color: "var(--primary-base)", textColor: "white" },
  { category: "Search", percentage: 28, color: "var(--state-warning-base)", textColor: "white" },
  { category: "Social", percentage: 18, color: "var(--state-information-base)", textColor: "white" },
  { category: "Other", percentage: 9, color: "var(--state-success-base)", textColor: "white" },
]

const singleBubble: SalesData[] = [
  { category: "Direct", percentage: 100, color: "var(--primary-base)", textColor: "white" },
]

export default function BubbleChartPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Charts"
        title="Bubble"
        description="Proportional-area bubbles, ranked by percentage. Largest sits right-of-center, mid bottom-left, smallest top-left; extras orbit. Used for share-of-mix call-outs."
        status="stable"
        kind="atom"
      />

      <DocsSection title="3-bubble (canonical)">
        <DocsExample
          title="Direct / Affiliate / Referral"
          description="The exact layout used in the marketing template — three bubbles, ranked by percentage. Largest sits right-of-center."
          preview={
            <div className="flex items-center justify-center bg-bg-weak-50 rounded-xl p-4">
              <BubbleChart width={420} height={280} data={salesData} />
            </div>
          }
          code={`<BubbleChart
  width={420}
  height={280}
  data={[
    { category: "Direct",   percentage: 60, color: "var(--primary-base)",          textColor: "white" },
    { category: "Affiliate", percentage: 25, color: "var(--state-warning-base)",   textColor: "white" },
    { category: "Referral", percentage: 15, color: "var(--state-information-base)", textColor: "white" },
  ]}
/>`}
        />
      </DocsSection>

      <DocsSection title="4+ bubbles (orbit layout)">
        <DocsExample
          title="Extras orbit the largest"
          description="Index 3+ are placed on a circle of radius 2r around the main cluster at angle 2π·k/(n−2)."
          preview={
            <div className="flex items-center justify-center bg-bg-weak-50 rounded-xl p-4">
              <BubbleChart width={420} height={280} data={fourBubbles} />
            </div>
          }
          code={`<BubbleChart width={420} height={280} data={fourBubbles} />`}
        />
      </DocsSection>

      <DocsSection title="Single bubble">
        <DocsExample
          title="100% — one category dominates"
          preview={
            <div className="flex items-center justify-center bg-bg-weak-50 rounded-xl p-4">
              <BubbleChart width={300} height={220} data={singleBubble} />
            </div>
          }
          code={`<BubbleChart data={[{ category: "Direct", percentage: 100, color: "var(--primary-base)", textColor: "white" }]} />`}
        />
      </DocsSection>

      <DocsSection title="Loading">
        <DocsExample
          title="Skeleton circles"
          description="3 muted circles matching the canonical positions while data loads."
          preview={
            <div className="flex items-center justify-center bg-bg-weak-50 rounded-xl p-4">
              <svg width={420} height={280} viewBox="0 0 420 280">
                <circle cx={273} cy={140} r={108} fill="var(--bg-soft-200)" className="animate-pulse" />
                <circle cx={147} cy={158} r={45} fill="var(--bg-soft-200)" className="animate-pulse" />
                <circle cx={196} cy={113} r={27} fill="var(--bg-soft-200)" className="animate-pulse" />
              </svg>
            </div>
          }
          code={`// 3 placeholder circles at the same x/y positions as the loaded chart.`}
        />
      </DocsSection>

      <DocsSection title="Empty">
        <DocsExample
          title="Empty state"
          preview={
            <div className="flex items-center justify-center bg-bg-weak-50 rounded-xl p-10">
              <span className="text-sm text-text-soft-400">No traffic data yet</span>
            </div>
          }
          code={`{data.length === 0 ? <EmptyState /> : <BubbleChart data={data} />}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data", type: "{ category, percentage, color, textColor }[]", description: "Categories. Bubble radius = (percentage / maxPercentage) × (height × 0.45)." },
            { name: "width", type: "number", defaultValue: "600", description: "SVG width." },
            { name: "height", type: "number", defaultValue: "400", description: "SVG height. Drives maxRadius (height × 0.45)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Sort data descending by percentage before placement.</li>
          <li>Rank-based positioning — largest right-of-center, mid bottom-left, smallest top-left.</li>
          <li>Label is the percentage value, font-size = radius / 2, centered both axes.</li>
          <li>SVG is hand-rendered with <code>&lt;circle&gt;</code> and <code>&lt;text&gt;</code> — no recharts dependency.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
