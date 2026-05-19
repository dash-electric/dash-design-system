"use client"

import * as React from "react"
import { RiArrowLeftDownLine, RiArrowRightUpLine } from "@remixicon/react"
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
 * Marketing Widget — Total Visitors. Ported from AlignUI Marketing Template (2026-05-18).
 * Source: components/widgets/widget-total-visitors.tsx
 */

const SEGMENTS = [
  { label: "Desktop", value: "27%", delta: "-3.2%", up: false, bar: "bg-(--state-away-base)" },
  { label: "Tablet", value: "12%", delta: "-6.4%", up: false, bar: "bg-(--state-verified-base)" },
  { label: "Mobile", value: "61%", delta: "+0.8%", up: true, bar: "bg-(--state-feature-base)" },
]

export default function TotalVisitorsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Total Visitors"
        description="Visitor traffic widget with 3 device-class columns (Desktop / Tablet / Mobile). Each column shows share %, trend, and a token-colored bar."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Default"
          preview={
            <WidgetShell tone="primary-soft" className="max-w-sm">
              <HeaderRow value="237,456" delta="-1.4%" up={false} cta="Report" />
              <Divider />
              <DeviceGrid segments={SEGMENTS} />
            </WidgetShell>
          }
          code={`<WidgetShell>
  <HeaderRow value="237,456" delta="-1.4%" up={false} cta="Report" />
  <Divider />
  <DeviceGrid segments={SEGMENTS} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <DocsExample
          title="Positive trend"
          preview={
            <WidgetShell tone="success-soft" className="max-w-sm">
              <HeaderRow value="284,109" delta="+12.6%" up cta="Report" />
              <Divider />
              <DeviceGrid segments={SEGMENTS.map((s) => ({ ...s, up: true, delta: s.delta.replace("-", "+") }))} />
            </WidgetShell>
          }
          code={`<HeaderRow value="284,109" delta="+12.6%" up />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No visitors yet"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="0" delta="0%" up cta="Report" />
              <Divider />
              <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-stroke-soft-200">
                <EmptyIllustration illustration={EmptyChart} text="No traffic data available." />
              </div>
            </WidgetShell>
          }
          code={`<EmptyState text="No traffic data available." />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Hero KPI ('237,456')." },
            { name: "delta", type: "string", description: "Period-over-period change." },
            { name: "up", type: "boolean", description: "Trend direction." },
            { name: "segments", type: "DeviceSegment[]", description: "3 device columns (Desktop/Tablet/Mobile)." },
            { name: "segment.bar", type: "string", description: "Bar color token class." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Card shell: rounded-2xl + ring stroke-soft-200 + p-5 + gap-5.</li>
          <li>Header: label "Total Visitors" + title amount + trend Badge + Report button.</li>
          <li>Line divider between header and grid.</li>
          <li>3 columns separated by dashed vertical dividers. Each column: label + % value + delta + 8px colored bar.</li>
          <li>Column colors: Desktop=away, Tablet=verified, Mobile=feature.</li>
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
    <div className={cn("relative flex w-full flex-col gap-5 rounded-2xl p-5 shadow-sm ring-1 ring-inset ring-stroke-soft-200", TONE_BG[tone], className)}>
      {children}
    </div>
  )
}

function HeaderRow({ value, delta, up, cta }: { value: string; delta: string; up: boolean; cta: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="text-xs text-text-sub-600">Total Visitors</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-2xl font-semibold tracking-tight tabular-nums text-text-strong-950">{value}</div>
          <Badge size="sm" appearance="lighter" status={up ? "success" : "error"}>
            {delta}
          </Badge>
        </div>
      </div>
      <Button style="stroke" tone="neutral" size="xs">
        {cta}
      </Button>
    </div>
  )
}

function Divider() {
  return <div className="h-px w-full bg-stroke-soft-200" />
}

function DashedVertical() {
  return (
    <div className="w-px self-stretch" style={{ backgroundImage: "repeating-linear-gradient(to bottom, hsl(var(--stroke-soft-200)) 0 4px, transparent 4px 8px)" }} />
  )
}

function DeviceGrid({
  segments,
}: {
  segments: { label: string; value: string; delta: string; up: boolean; bar: string }[]
}) {
  return (
    <div className="flex gap-4">
      {segments.map((s, i) => (
        <React.Fragment key={s.label}>
          <div className="flex h-60 flex-1 flex-col gap-4">
            <div className="w-full flex-1">
              <div className="text-xs text-text-soft-400">{s.label}</div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-text-strong-950">{s.value}</div>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="text-xs text-text-sub-600">{s.delta}</div>
              {s.up ? (
                <RiArrowRightUpLine className="size-5 text-success-base" />
              ) : (
                <RiArrowLeftDownLine className="size-5 text-error-base" />
              )}
            </div>
            <div className={cn("h-2 w-full rounded-sm", s.bar)} />
          </div>
          {i < segments.length - 1 && <DashedVertical />}
        </React.Fragment>
      ))}
    </div>
  )
}
