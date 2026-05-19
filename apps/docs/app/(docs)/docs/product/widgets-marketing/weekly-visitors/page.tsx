"use client"

import * as React from "react"
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
import { EmptyIllustration, EmptyChart } from "../../widgets/_lib/empty-illustrations"

/**
 * Marketing Widget — Weekly Visitors. Ported from AlignUI Marketing Template (2026-05-18).
 * Source: components/widgets/widget-weekly-visitors.tsx
 *
 * Radar chart comparing New vs Returning visitors across 8 emotion-keyed axes.
 */

const AXES = [
  { subject: "Happiness", A: 70, B: 110 },
  { subject: "Sadness", A: 66, B: 90 },
  { subject: "Anger", A: 86, B: 50 },
  { subject: "Fear", A: 99, B: 65 },
  { subject: "Surprise", A: 44, B: 77 },
  { subject: "Disgust", A: 65, B: 85 },
  { subject: "Love", A: 25, B: 120 },
  { subject: "Excitement", A: 75, B: 35 },
]

const MAX = 130

export default function WeeklyVisitorsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Weekly Visitors"
        description="Radar chart widget comparing New vs Returning visitors across 8 affinity axes (Happiness, Sadness, Anger, Fear, Surprise, Disgust, Love, Excitement)."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Default"
          preview={
            <WidgetShell tone="warning-soft" className="max-w-sm">
              <HeaderRow value="16,008" delta="+1.1%" up />
              <Legend />
              <RadarChart axes={AXES} />
            </WidgetShell>
          }
          code={`<WidgetShell>
  <HeaderRow value="16,008" delta="+1.1%" up />
  <Legend />
  <RadarChart axes={AXES} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <DocsExample
          title="Negative trend"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="12,420" delta="-4.6%" up={false} />
              <Legend />
              <RadarChart axes={AXES} />
            </WidgetShell>
          }
          code={`<HeaderRow value="12,420" delta="-4.6%" up={false} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No data"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="0" delta="0%" up />
              <Legend />
              <div className="flex h-[224px] items-center justify-center rounded-lg border border-dashed border-stroke-soft-200">
                <EmptyIllustration illustration={EmptyChart} text="No visitor data available." />
              </div>
            </WidgetShell>
          }
          code={`<EmptyState text="No visitor data available." />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Hero KPI ('16,008')." },
            { name: "delta", type: "string", description: "Period-over-period change." },
            { name: "up", type: "boolean", description: "Trend direction." },
            { name: "axes", type: "{ subject; A; B }[]", description: "Radar dataset. A = New visitors, B = Returning." },
            { name: "max", type: "number", defaultValue: "130", description: "Outer ring maximum." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Card shell with standard header.</li>
          <li>Ringed legend pill: warning-base dot (New) | divider | success-base dot (Returning).</li>
          <li>Radar: 4 concentric polygonal rings, axes labeled with rounded chip outlines.</li>
          <li>Series A = warning-base stroke + orange-alpha fill.</li>
          <li>Series B = success-base stroke + green-alpha fill.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ---------------- helpers ---------------- */

type WidgetTone = "primary-soft" | "success-soft" | "warning-soft" | "error-soft" | "info-soft" | "neutral"

const TONE_BG: Record<WidgetTone, string> = {
  "primary-soft": "bg-gradient-to-br from-(--primary-alpha-10) to-bg-white-0",
  "success-soft": "bg-gradient-to-br from-success-lighter to-bg-white-0",
  "warning-soft": "bg-gradient-to-br from-warning-lighter to-bg-white-0",
  "error-soft":   "bg-gradient-to-br from-error-lighter to-bg-white-0",
  "info-soft":    "bg-gradient-to-br from-information-lighter to-bg-white-0",
  "neutral":      "bg-bg-white-0",
}

function WidgetShell({ className, children, tone = "neutral" }: { className?: string; children: React.ReactNode; tone?: WidgetTone }) {
  return (
    <div className={cn("relative flex w-full flex-col gap-4 rounded-2xl p-5 shadow-sm ring-1 ring-inset ring-stroke-soft-200", TONE_BG[tone], className)}>
      {children}
    </div>
  )
}

function HeaderRow({ value, delta, up }: { value: string; delta: string; up: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="text-xs text-text-sub-600">Weekly Visitors</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-2xl font-semibold tracking-tight tabular-nums text-text-strong-950">{value}</div>
          <Badge size="sm" appearance="lighter" status={up ? "success" : "error"}>
            {delta}
          </Badge>
        </div>
      </div>
      <Button style="stroke" tone="neutral" size="xs">
        Details
      </Button>
    </div>
  )
}

function Legend() {
  return (
    <div className="flex w-full gap-1.5 rounded-lg bg-bg-white-0 py-1.5 ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex flex-1 items-center justify-center gap-1">
        <span className="size-2 rounded-full bg-warning-base" />
        <span className="text-[10px] text-text-sub-600">New visitors</span>
      </div>
      <div className="w-px self-stretch bg-stroke-soft-200" />
      <div className="flex flex-1 items-center justify-center gap-1">
        <span className="size-2 rounded-full bg-success-base" />
        <span className="text-[10px] text-text-sub-600">Returning visitors</span>
      </div>
    </div>
  )
}

function RadarChart({ axes }: { axes: { subject: string; A: number; B: number }[] }) {
  const W = 320
  const H = 224
  const cx = W / 2
  const cy = H / 2
  const r = Math.min(W, H) * 0.37
  const n = axes.length
  const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2

  const ringPoints = (radius: number) =>
    Array.from({ length: n }, (_, i) => {
      const x = cx + radius * Math.cos(angle(i))
      const y = cy + radius * Math.sin(angle(i))
      return `${x.toFixed(1)},${y.toFixed(1)}`
    }).join(" ")

  const seriesPoints = (key: "A" | "B") =>
    axes
      .map((d, i) => {
        const radius = (d[key] / MAX) * r
        const x = cx + radius * Math.cos(angle(i))
        const y = cy + radius * Math.sin(angle(i))
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} aria-hidden>
      {/* concentric polygon rings */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ringPoints(r * f)} fill="none" stroke="hsl(var(--stroke-soft-200))" />
      ))}
      {/* spokes */}
      {axes.map((_, i) => {
        const x = cx + r * Math.cos(angle(i))
        const y = cy + r * Math.sin(angle(i))
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--stroke-soft-200))" />
      })}
      {/* B (Returning) — success */}
      <polygon points={seriesPoints("B")} fill="var(--green-alpha-10, rgba(34,197,94,0.1))" stroke="var(--success-base)" strokeWidth={1.5} />
      {axes.map((d, i) => {
        const radius = (d.B / MAX) * r
        const x = cx + radius * Math.cos(angle(i))
        const y = cy + radius * Math.sin(angle(i))
        return <circle key={`B${i}`} cx={x} cy={y} r={3} fill="hsl(var(--bg-white-0))" stroke="var(--success-base)" strokeWidth={1.5} />
      })}
      {/* A (New) — warning */}
      <polygon points={seriesPoints("A")} fill="var(--orange-alpha-10, rgba(251,146,60,0.1))" stroke="var(--warning-base)" strokeWidth={1.5} />
      {axes.map((d, i) => {
        const radius = (d.A / MAX) * r
        const x = cx + radius * Math.cos(angle(i))
        const y = cy + radius * Math.sin(angle(i))
        return <circle key={`A${i}`} cx={x} cy={y} r={3} fill="hsl(var(--bg-white-0))" stroke="var(--warning-base)" strokeWidth={1.5} />
      })}
      {/* axis labels with chip outlines */}
      {axes.map((d, i) => {
        const lr = r + 18
        const x = cx + lr * Math.cos(angle(i))
        const y = cy + lr * Math.sin(angle(i))
        const w = d.subject.length * 6 + 12
        return (
          <g key={`label-${d.subject}`}>
            <rect x={x - w / 2} y={y - 9} width={w} height={18} rx={6} fill="none" stroke="hsl(var(--stroke-soft-200))" />
            <text x={x} y={y + 3.5} textAnchor="middle" className="fill-text-sub-600" style={{ fontSize: 10 }}>
              {d.subject}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
