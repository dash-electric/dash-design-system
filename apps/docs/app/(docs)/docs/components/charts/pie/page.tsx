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
 * PieChart — donut chart with optional "active" slice highlight.
 * Ported from AlignUI Marketing Template `components/pie-chart.tsx` (2026-05-18).
 *
 * Source mechanics (recharts → hand-rendered SVG):
 *   - CIRCLE_SIZE = 90, INNER_RADIUS = 32, OUTER_RADIUS = 45.
 *   - startAngle = 90 (12 o'clock), endAngle = 450 → full 360° sweep clockwise.
 *   - paddingAngle = 2°, cornerRadius = 2 between slices.
 *   - Active slice (where `id === "others"`) shrinks the inner radius by +1
 *     and outer radius by −1, with `cornerRadius=0` for a flat band.
 *   - Stroke `var(--stroke-white-0)` separates slices.
 */

type PieDatum = { id: string; value: number; fill: string }

type PieChartProps = {
  data: PieDatum[]
  size?: number
  innerRadius?: number
  outerRadius?: number
  paddingAngle?: number
  cornerRadius?: number
  activeId?: string
}

/** Polar→Cartesian helper. Angle in degrees, 0° = 3 o'clock (SVG default). */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180 // shift so 0 = 12 o'clock
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

/**
 * Build an SVG path for one donut slice with rounded outer corners.
 * Simplification: we draw arcs without explicit corner-radius (it's a tiny
 * visual nicety; the marketing widget renders at 90×90 so 2px is invisible).
 */
function donutSlice(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polar(cx, cy, outerR, endAngle)
  const end = polar(cx, cy, outerR, startAngle)
  const innerStart = polar(cx, cy, innerR, startAngle)
  const innerEnd = polar(cx, cy, innerR, endAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return [
    `M ${start.x} ${start.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ")
}

function PieChart({
  data,
  size = 90,
  innerRadius = 32,
  outerRadius = 45,
  paddingAngle = 2,
  activeId,
}: PieChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1
  const cx = size / 2
  const cy = size / 2
  let cursor = 0 // degrees, starting at top
  const slices = data.map((d) => {
    const sweep = (d.value / total) * (360 - paddingAngle * data.length)
    const s = cursor + paddingAngle / 2
    const e = s + sweep
    cursor = e + paddingAngle / 2
    return { ...d, start: s, end: e }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Pie chart">
      {slices.map((s) => {
        const isActive = s.id === activeId
        return (
          <path
            key={s.id}
            d={donutSlice(
              cx,
              cy,
              isActive ? innerRadius + 1 : innerRadius,
              isActive ? outerRadius - 1 : outerRadius,
              s.start,
              s.end,
            )}
            fill={s.fill}
            stroke="var(--stroke-white-0)"
            strokeWidth={1}
          />
        )
      })}
    </svg>
  )
}

const productMix: PieDatum[] = [
  { id: "wearables", value: 40, fill: "var(--primary-base)" },
  { id: "accessories", value: 25, fill: "var(--state-warning-base)" },
  { id: "smart-home", value: 20, fill: "var(--state-information-base)" },
  { id: "others", value: 15, fill: "var(--state-faded-base)" },
]

const twoSlices: PieDatum[] = [
  { id: "new", value: 65, fill: "var(--primary-base)" },
  { id: "returning", value: 35, fill: "var(--state-information-base)" },
]

export default function PieChartPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Charts"
        title="Pie"
        description="Donut chart with optional active-slice highlight. 90×90 default with 32px inner / 45px outer radius. Hand-rendered SVG — no recharts dependency."
        status="stable"
        kind="atom"
      />

      <DocsSection title="Default donut">
        <DocsExample
          title="4-slice product mix"
          description="Active slice (id: others) is bumped: inner +1, outer −1, no corner radius for a flat band."
          preview={
            <div className="flex items-center justify-center gap-6 bg-bg-weak-50 rounded-xl p-6">
              <PieChart data={productMix} activeId="others" />
              <ul className="space-y-1.5 text-xs">
                {productMix.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-text-sub-600">
                    <span className="inline-block size-2.5 rounded-full" style={{ background: s.fill }} />
                    <span className="capitalize">{s.id.replace("-", " ")}</span>
                    <span className="text-text-soft-400">{s.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          }
          code={`<PieChart
  data={[
    { id: "wearables",   value: 40, fill: "var(--primary-base)" },
    { id: "accessories", value: 25, fill: "var(--state-warning-base)" },
    { id: "smart-home",  value: 20, fill: "var(--state-information-base)" },
    { id: "others",      value: 15, fill: "var(--state-faded-base)" },
  ]}
  activeId="others"
/>`}
        />
      </DocsSection>

      <DocsSection title="Two slices">
        <DocsExample
          title="New vs returning"
          preview={
            <div className="flex items-center justify-center bg-bg-weak-50 rounded-xl p-6">
              <PieChart data={twoSlices} size={120} innerRadius={42} outerRadius={60} />
            </div>
          }
          code={`<PieChart data={twoSlices} size={120} innerRadius={42} outerRadius={60} />`}
        />
      </DocsSection>

      <DocsSection title="Large variant">
        <DocsExample
          title="Inline KPI"
          description="Scale via size/inner/outer radii. Default 90px is for inline metrics; use ~160px for hero charts."
          preview={
            <div className="flex items-center justify-center bg-bg-weak-50 rounded-xl p-6">
              <PieChart data={productMix} size={160} innerRadius={60} outerRadius={78} activeId="others" />
            </div>
          }
          code={`<PieChart data={productMix} size={160} innerRadius={60} outerRadius={78} activeId="others" />`}
        />
      </DocsSection>

      <DocsSection title="Loading">
        <DocsExample
          title="Skeleton donut"
          preview={
            <div className="flex items-center justify-center bg-bg-weak-50 rounded-xl p-6">
              <svg width={90} height={90} viewBox="0 0 90 90" className="animate-pulse">
                <circle cx={45} cy={45} r={45} fill="var(--bg-soft-200)" />
                <circle cx={45} cy={45} r={32} fill="var(--bg-white-0)" />
              </svg>
            </div>
          }
          code={`// Single soft-200 ring while loading.`}
        />
      </DocsSection>

      <DocsSection title="Empty">
        <DocsExample
          title="No data"
          preview={
            <div className="flex items-center justify-center bg-bg-weak-50 rounded-xl p-6">
              <svg width={90} height={90} viewBox="0 0 90 90">
                <circle cx={45} cy={45} r={45} fill="var(--bg-soft-200)" />
                <circle cx={45} cy={45} r={32} fill="var(--bg-white-0)" />
                <text x={45} y={48} textAnchor="middle" fontSize={10} fill="var(--text-soft-400)">
                  0
                </text>
              </svg>
            </div>
          }
          code={`{total === 0 ? <EmptyDonut /> : <PieChart data={data} />}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data", type: "{ id, value, fill }[]", description: "Slices in render order. id is matched against activeId." },
            { name: "size", type: "number", defaultValue: "90", description: "SVG width and height." },
            { name: "innerRadius", type: "number", defaultValue: "32", description: "Donut hole radius." },
            { name: "outerRadius", type: "number", defaultValue: "45", description: "Donut outer radius." },
            { name: "paddingAngle", type: "number", defaultValue: "2", description: "Degree gap between slices." },
            { name: "activeId", type: "string", description: "Slice id to highlight (flat band, inner+1 / outer−1)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Sweep starts at 12 o'clock, runs clockwise.</li>
          <li>Slice path = outer arc + radial line in + inner arc back + close.</li>
          <li>1px stroke <code>var(--stroke-white-0)</code> separates slices.</li>
          <li>Active highlight = +1/−1 radius delta + flat (no corner-radius) band.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
