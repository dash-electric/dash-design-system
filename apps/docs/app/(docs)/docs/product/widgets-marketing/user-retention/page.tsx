"use client"

import * as React from "react"
import { RiInformationFill } from "@remixicon/react"
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
 * Marketing Widget — User Retention. Ported from AlignUI Marketing Template (2026-05-18).
 * Source: components/widgets/widget-user-retention.tsx
 *
 * Cohort retention heatmap. Triangle shape because newer cohorts have less history.
 * 12 rows (cohorts) × up to 12 columns (months since signup). Color intensity = retention %.
 */

// Deterministic retention data — newer cohorts (higher rowIndex) start lower.
const RETENTION = Array.from({ length: 12 }, (_, row) => {
  const cols = 12 - row
  const baseValue = Math.max(60, 100 - row * 5)
  return Array.from({ length: cols }, (_, col) => {
    // Pseudo-random but stable: hash row+col into [0..20] subtractor
    const noise = ((row * 31 + col * 17) % 21)
    return Math.round(baseValue - noise)
  })
})

export default function UserRetentionWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="User Retention"
        description="Cohort retention heatmap — each row tracks how a signup cohort retains over 12 months. Color intensity encodes retention %. Triangle shape reflects newer cohorts having less history."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Default"
          preview={
            <WidgetShell tone="warning-soft" className="max-w-sm">
              <HeaderRow value="24%" delta="+2.0%" up />
              <RetentionHeatmap data={RETENTION} />
              <FooterNote />
            </WidgetShell>
          }
          code={`<WidgetShell>
  <HeaderRow value="24%" delta="+2.0%" up />
  <RetentionHeatmap data={RETENTION} />
  <FooterNote text="Last 12 months data updated at 1:51 PM." />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <DocsExample
          title="Lower overall retention"
          preview={
            <WidgetShell tone="error-soft" className="max-w-sm">
              <HeaderRow value="12%" delta="-3.4%" up={false} />
              <RetentionHeatmap data={RETENTION.map((row) => row.map((v) => Math.round(v * 0.5)))} />
              <FooterNote />
            </WidgetShell>
          }
          code={`<HeaderRow value="12%" delta="-3.4%" up={false} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No cohort data yet"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="0%" delta="0%" up />
              <div className="flex h-[194px] items-center justify-center rounded-lg border border-dashed border-stroke-soft-200">
                <EmptyIllustration illustration={EmptyChart} text="No cohort data available." />
              </div>
              <FooterNote />
            </WidgetShell>
          }
          code={`<EmptyState text="No cohort data available." />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Overall retention rate ('24%')." },
            { name: "delta", type: "string", description: "Period-over-period change." },
            { name: "up", type: "boolean", description: "Trend direction." },
            { name: "data", type: "number[][]", description: "Jagged 2D array. data[row][col] = retention % (0-100)." },
            { name: "footerText", type: "string", description: "Update timestamp shown in info pill." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Card shell with standard header.</li>
          <li>Heatmap grid: 194px tall. Each row = 1 cohort. Each cell = primary-base with opacity = value/100.</li>
          <li>Empty cells right-pad shorter rows so the grid stays aligned.</li>
          <li>X-axis numeric labels (1..12) below.</li>
          <li>Info pill footer: ringed bg-white-0, info icon + timestamp.</li>
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
        <div className="text-xs text-text-sub-600">User Retention</div>
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

function RetentionHeatmap({ data }: { data: number[][] }) {
  const totalCols = 12
  return (
    <div>
      <table className="-m-px h-[194px] w-full border-collapse" cellPadding={0}>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((v, colIndex) => (
                <td key={colIndex} className="p-px" data-value={v}>
                  <div
                    className="h-full w-full rounded-[1px] bg-(--primary-base)"
                    style={{ opacity: Math.max(0, Math.min(1, v / 100)) }}
                  />
                </td>
              ))}
              {Array.from({ length: totalCols - row.length }).map((_, i) => (
                <td key={`empty-${i}`} className="p-px">
                  <div className="h-full w-full rounded-[1px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex w-full gap-0.5 pt-3 text-center text-[10px] text-text-soft-400">
        {Array.from({ length: totalCols }).map((_, i) => (
          <div key={i} className="flex-1">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}

function FooterNote() {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-bg-white-0 p-1.5 ring-1 ring-inset ring-stroke-soft-200">
      <RiInformationFill className="size-4 shrink-0 text-text-disabled-300" />
      <div className="text-xs text-text-sub-600">Last 12 months data updated at 1:51 PM.</div>
    </div>
  )
}
