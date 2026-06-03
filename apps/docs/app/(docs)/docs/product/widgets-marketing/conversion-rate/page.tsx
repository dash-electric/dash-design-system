"use client"

import * as React from "react"
import { RiArrowDownLine, RiArrowUpLine } from "@remixicon/react"
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
 * Marketing Widget — Conversion Rate. Ported from AlignUI Marketing Template (2026-05-18).
 * Source: components/widgets/widget-conversion-rate.tsx
 */

const STEPS = [
  { label: "Added to Cart", value: "3,842", delta: "+1.8%", up: true },
  { label: "Reached Checkout", value: "1,256", delta: "-1.2%", up: false },
  { label: "Purchased", value: "649", delta: "+2.4%", up: true },
]

// 18-point stacked area sample (value1 < value2)
const SERIES = Array.from({ length: 18 }, (_, i) => {
  const base = 18 + Math.round(20 * Math.sin(i * 0.5) + 15 * Math.cos(i * 0.3))
  const value1 = Math.max(8, base)
  const value2 = value1 + 20 + Math.round(8 * Math.sin(i * 0.7))
  return { i, value1, value2 }
})

export default function ConversionRateWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Conversion Rate"
        description="Funnel widget showing 3 conversion steps (Cart → Checkout → Purchased) plus a stacked area chart trend. Used to track checkout drop-off."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Default"
          preview={
            <WidgetShell tone="success-soft" className="max-w-sm">
              <HeaderRow value="16.9%" delta="+2.1%" up />
              <Divider />
              <StepsList steps={STEPS} />
              <StackedAreaChart data={SERIES} />
            </WidgetShell>
          }
          code={`<WidgetShell>
  <HeaderRow value="16.9%" delta="+2.1%" up />
  <Divider />
  <StepsList steps={STEPS} />
  <StackedAreaChart data={SERIES} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <DocsExample
          title="Negative trend"
          preview={
            <WidgetShell tone="error-soft" className="max-w-sm">
              <HeaderRow value="9.4%" delta="-3.6%" up={false} />
              <Divider />
              <StepsList steps={STEPS.map((s) => ({ ...s, up: !s.up }))} />
              <StackedAreaChart data={SERIES} />
            </WidgetShell>
          }
          code={`<HeaderRow value="9.4%" delta="-3.6%" up={false} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No funnel data"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="0%" delta="0%" up />
              <Divider />
              <div className="flex flex-col gap-3 text-xs text-text-soft-400">
                {STEPS.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span>{s.label}</span>
                    <span>—</span>
                  </div>
                ))}
              </div>
              <div className="flex h-[136px] items-center justify-center rounded-lg border border-dashed border-stroke-soft-200">
                <EmptyIllustration illustration={EmptyChart} text="No conversions yet." />
              </div>
            </WidgetShell>
          }
          code={`<EmptyState text="No conversions yet." />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Hero KPI ('16.9%')." },
            { name: "delta", type: "string", description: "Period-over-period change." },
            { name: "up", type: "boolean", description: "Trend direction." },
            { name: "steps", type: "FunnelStep[]", description: "Funnel steps with label/value/delta." },
            { name: "data", type: "{ value1; value2 }[]", description: "Stacked area series — value1 fill, value2 background fill." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Card shell + line divider.</li>
          <li>Header: label + percent + Badge + Details button.</li>
          <li>3 funnel rows: label (flex-1) + numeric count + signed delta with arrow.</li>
          <li>Stacked area chart: 112px tall, primary-base fill + primary-alpha-16 outer fill.</li>
          <li>Chart sits in a rounded-lg framed surface with grid lines.</li>
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
    <div className={cn("relative flex w-full flex-col gap-6 rounded-2xl p-6 shadow-sm ring-1 ring-inset ring-stroke-soft-200", TONE_BG[tone], className)}>
      {children}
    </div>
  )
}

function HeaderRow({ value, delta, up }: { value: string; delta: string; up: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="text-xs text-text-sub-600">Conversion Rate</div>
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

function Divider() {
  return <div className="h-px w-full bg-stroke-soft-200" />
}

function StepsList({ steps }: { steps: { label: string; value: string; delta: string; up: boolean }[] }) {
  return (
    <div className="flex w-full flex-col gap-3">
      {steps.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <div className="flex-1 text-xs text-text-sub-600">{s.label}</div>
          <div className="flex items-center gap-1.5">
            <div className="min-w-16 text-xs tabular-nums text-text-sub-600">{s.value}</div>
            <div className="flex min-w-16 items-center justify-end gap-0.5 pl-1 text-right tabular-nums">
              {s.up ? (
                <RiArrowUpLine className="size-5 shrink-0 text-success-base" />
              ) : (
                <RiArrowDownLine className="size-5 shrink-0 text-error-base" />
              )}
              <div className="text-sm text-text-sub-600">{s.delta}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StackedAreaChart({ data }: { data: { i: number; value1: number; value2: number }[] }) {
  const W = 280
  const H = 112
  const max = Math.max(...data.map((d) => d.value2))
  const step = W / Math.max(1, data.length - 1)
  const toPath = (key: "value1" | "value2") => {
    const pts = data.map((d, i) => {
      const x = i * step
      const y = H - (d[key] / max) * (H - 8) - 4
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    return `M ${pts.join(" L ")} L ${W},${H} L 0,${H} Z`
  }
  return (
    <div className="relative w-full overflow-hidden rounded-lg ring-1 ring-inset ring-stroke-soft-200 bg-bg-white-0" style={{ height: H }}>
      {/* grid */}
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
        {[1, 2, 3].map((i) => (
          <line key={`h${i}`} x1={0} y1={(H / 4) * i} x2={W} y2={(H / 4) * i} stroke="hsl(var(--stroke-soft-200))" />
        ))}
        {[1, 2, 3, 4, 5].map((i) => (
          <line key={`v${i}`} x1={(W / 6) * i} y1={0} x2={(W / 6) * i} y2={H} stroke="hsl(var(--stroke-soft-200))" />
        ))}
        <path d={toPath("value2")} fill="var(--primary-alpha-16)" />
        <path d={toPath("value1")} fill="var(--primary-base)" />
      </svg>
    </div>
  )
}
