"use client"

import * as React from "react"
import { RiFacebookCircleFill, RiInstagramLine, RiGoogleFill } from "@remixicon/react"
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
 * Marketing Widget — Visitor Channels. Ported from AlignUI Marketing Template (2026-05-18).
 * Source: components/widgets/widget-visitor-channels.tsx
 */

const SLICES = [
  { label: "Organic Search", value: 45, color: "bg-(--state-away-base)" },
  { label: "Referral", value: 40, color: "bg-sky-500" },
  { label: "Direct", value: 15, color: "bg-(--state-feature-base)" },
]

const ROWS = [
  { icon: RiFacebookCircleFill, brand: "Facebook", color: "text-[#1877F2]", pct: "28%", total: "6,958" },
  { icon: RiInstagramLine, brand: "Instagram", color: "text-[#E1306C]", pct: "23%", total: "5,716" },
  { icon: RiGoogleFill, brand: "Google", color: "text-[#4285F4]", pct: "32%", total: "7,952" },
]

export default function VisitorChannelsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Visitor Channels"
        description="Acquisition mix widget — 3-color category bar plus per-channel table with brand glyph, share %, and visitor count."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Default"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="78%" delta="-0.4%" up={false} />
              <CategoryBar slices={SLICES} />
              <Divider />
              <ChannelTable rows={ROWS} />
              <Button style="stroke" tone="neutral" size="sm" className="w-full">
                View reports
              </Button>
            </WidgetShell>
          }
          code={`<WidgetShell>
  <HeaderRow value="78%" delta="-0.4%" up={false} />
  <CategoryBar slices={SLICES} />
  <Divider />
  <ChannelTable rows={ROWS} />
  <Button style="stroke" tone="neutral">View reports</Button>
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <DocsExample
          title="Positive trend"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="92%" delta="+5.6%" up />
              <CategoryBar slices={SLICES} />
              <Divider />
              <ChannelTable rows={ROWS} />
              <Button style="stroke" tone="neutral" size="sm" className="w-full">
                View reports
              </Button>
            </WidgetShell>
          }
          code={`<HeaderRow value="92%" delta="+5.6%" up />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No channels recorded"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow value="0%" delta="0%" up />
              <div className="h-2 w-full rounded-full bg-bg-weak-50" />
              <Divider />
              <div className="flex h-32 items-center justify-center">
                <EmptyIllustration illustration={EmptyChart} text="No channel data available." />
              </div>
            </WidgetShell>
          }
          code={`<EmptyState text="No channel data available." />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "slices", type: "{ label; value; color }[]", description: "Category bar slices summing to 100." },
            { name: "rows", type: "ChannelRow[]", description: "Per-channel table rows with brand glyph + %, total." },
            { name: "value", type: "string", description: "Hero KPI ('78%')." },
            { name: "delta", type: "string", description: "Period-over-period change." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Card shell with header (label + KPI + Badge + Details button).</li>
          <li>CategoryBarChart — 3 colored segments separated by 5px gaps.</li>
          <li>Line divider.</li>
          <li>Table with 3 columns (Channels / Percent / Total). 16px row spacers.</li>
          <li>Footer: full-width "View reports" stroke neutral button.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ---------------- helpers ---------------- */

function WidgetShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative flex w-full flex-col gap-6 rounded-2xl bg-bg-white-0 p-6 shadow-sm ring-1 ring-inset ring-stroke-soft-200", className)}>
      {children}
    </div>
  )
}

function HeaderRow({ value, delta, up }: { value: string; delta: string; up: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="text-xs text-text-sub-600">Visitors Channels</div>
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

function CategoryBar({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  return (
    <div className="flex w-full gap-1.5">
      {slices.map((s) => (
        <div key={s.label} className="flex flex-col gap-2" style={{ flex: s.value }}>
          <div className={cn("h-2 w-full rounded-full", s.color)} />
          <div className="text-xs text-text-sub-600">
            {s.label} <span className="text-text-soft-400">{s.value}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChannelTable({
  rows,
}: {
  rows: { icon: React.ElementType; brand: string; color: string; pct: string; total: string }[]
}) {
  return (
    <table className="w-full" cellPadding={0}>
      <thead className="text-left">
        <tr>
          <th className="pb-3 text-[10px] uppercase tracking-wider text-text-soft-400">Channels</th>
          <th className="pb-3 text-[10px] uppercase tracking-wider text-text-soft-400">Percent</th>
          <th className="w-12 pb-3 text-[10px] uppercase tracking-wider text-text-soft-400">Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <React.Fragment key={r.brand}>
            <tr>
              <td className="py-2">
                <div className="flex items-center gap-2 text-xs text-text-sub-600">
                  <r.icon className={cn("size-5 shrink-0", r.color)} />
                  {r.brand}
                </div>
              </td>
              <td className="py-2 text-xs text-text-sub-600">{r.pct}</td>
              <td className="py-2 text-xs tabular-nums text-text-sub-600">{r.total}</td>
            </tr>
            {i < rows.length - 1 && (
              <tr aria-hidden>
                <td colSpan={3} className="h-2" />
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )
}
