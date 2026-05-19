"use client"

import * as React from "react"
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiFocus2Line,
  RiInformationFill,
  RiTimeLine,
  RiUser6Line,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/dash/ui/tooltip"
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
 * Marketing Widget — Marketing Channels. Ported from AlignUI Marketing Template (2026-05-18).
 * Source: components/widgets/marketing-channels.tsx
 *
 * Two surfaces:
 *  - MarketingChannels (bare, inside a parent panel)
 *  - WidgetMarketingChannels (card surface)
 */

const SLICES = [
  { label: "Organic Search", value: 45 },
  { label: "Social Media", value: 40 },
  { label: "Direct", value: 15 },
]

const METRICS = [
  { icon: RiUser6Line, label: "Acquisition", value: "$38.25", delta: "+5.2%", up: true },
  { icon: RiTimeLine, label: "Conversion", value: "4.2 days", delta: "+3.8%", up: false },
  { icon: RiFocus2Line, label: "ROI", value: "324%", delta: "+4.5%", up: true },
]

export default function MarketingChannelsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Marketing Channels"
        description="Channel performance widget — 3-color category bar over a 3-row metric table (Acquisition cost / Conversion time / ROI). Used to summarize marketing efficiency."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Card surface"
          preview={
            <WidgetShell card className="max-w-sm">
              <HeaderRow value="82%" delta="+2.1%" up />
              <CategoryBar slices={SLICES} />
              <DashedDivider />
              <MetricsTable rows={METRICS} />
              <Button style="stroke" tone="neutral" size="sm" className="w-full">
                View reports
              </Button>
            </WidgetShell>
          }
          code={`<WidgetShell card>
  <HeaderRow value="82%" delta="+2.1%" up />
  <CategoryBar slices={SLICES} />
  <DashedDivider />
  <MetricsTable rows={METRICS} />
  <Button>View reports</Button>
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <DocsExample
          title="Bare (no card)"
          description="MarketingChannels variant — embedded inside a parent panel without the rounded card surface."
          preview={
            <div className="max-w-sm">
              <WidgetShell card={false}>
                <HeaderRow value="82%" delta="+2.1%" up />
                <CategoryBar slices={SLICES} />
                <DashedDivider />
                <MetricsTable rows={METRICS} />
                <Button style="stroke" tone="neutral" size="sm" className="w-full">
                  View reports
                </Button>
              </WidgetShell>
            </div>
          }
          code={`<MarketingChannels />`}
        />

        <DocsExample
          title="Negative trend"
          preview={
            <WidgetShell card className="max-w-sm">
              <HeaderRow value="64%" delta="-3.2%" up={false} />
              <CategoryBar slices={SLICES} />
              <DashedDivider />
              <MetricsTable rows={METRICS.map((m) => ({ ...m, up: !m.up }))} />
              <Button style="stroke" tone="neutral" size="sm" className="w-full">
                View reports
              </Button>
            </WidgetShell>
          }
          code={`<HeaderRow value="64%" delta="-3.2%" up={false} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No channel performance data"
          preview={
            <WidgetShell card className="max-w-sm">
              <HeaderRow value="0%" delta="0%" up />
              <div className="h-2 w-full rounded-full bg-bg-weak-50" />
              <DashedDivider />
              <div className="flex h-32 items-center justify-center">
                <EmptyIllustration illustration={EmptyChart} text="No channel metrics yet." />
              </div>
            </WidgetShell>
          }
          code={`<EmptyState text="No channel metrics yet." />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "card", type: "boolean", defaultValue: "true", description: "Render card surface (rounded-2xl ring shell). False = bare embed." },
            { name: "value", type: "string", description: "Hero KPI ('82%')." },
            { name: "delta", type: "string", description: "Period-over-period change." },
            { name: "up", type: "boolean", description: "Trend direction." },
            { name: "slices", type: "{ label; value }[]", description: "Category bar slices." },
            { name: "rows", type: "MetricRow[]", description: "3-row metric table." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Header: label + tooltip info icon + KPI + "+2.1% vs last week" copy + Details button.</li>
          <li>3-color category bar (Organic Search 45 / Social Media 40 / Direct 15).</li>
          <li>Dashed divider.</li>
          <li>Metrics table: icon + label / numeric metric / delta arrow.</li>
          <li>Footer: full-width "View reports" stroke neutral button.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ---------------- helpers ---------------- */

function WidgetShell({
  card,
  className,
  children,
}: {
  card: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col gap-5",
        card && "rounded-2xl bg-bg-white-0 p-5 shadow-sm ring-1 ring-inset ring-stroke-soft-200",
        className,
      )}
    >
      {children}
    </div>
  )
}

function HeaderRow({ value, delta, up }: { value: string; delta: string; up: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <div className="text-xs text-text-sub-600">Marketing Channels</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label="What is this">
                  <RiInformationFill className="size-4 text-text-disabled-300" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-80">
                Overview of your marketing channel performance metrics, including customer acquisition cost, conversion time and ROI.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-2xl font-semibold tracking-tight tabular-nums text-text-strong-950">{value}</div>
          <div className="text-xs text-text-sub-600">
            <span className={up ? "text-success-base" : "text-error-base"}>{delta}</span> vs last week
          </div>
        </div>
      </div>
      <Button style="stroke" tone="neutral" size="xs">
        Details
      </Button>
    </div>
  )
}

function DashedDivider() {
  return (
    <div className="h-px w-full" style={{ backgroundImage: "repeating-linear-gradient(to right, hsl(var(--stroke-soft-200)) 0 4px, transparent 4px 8px)" }} />
  )
}

const SLICE_BG = ["bg-(--primary-base)", "bg-(--state-feature-base)", "bg-(--state-away-base)"]

function CategoryBar({ slices }: { slices: { label: string; value: number }[] }) {
  return (
    <div className="flex w-full gap-1.5">
      {slices.map((s, i) => (
        <div key={s.label} className="flex flex-col gap-2" style={{ flex: s.value }}>
          <div className={cn("h-3 w-full rounded-full", SLICE_BG[i % SLICE_BG.length])} />
          <div className="text-xs text-text-sub-600">
            {s.label} <span className="text-text-soft-400">{s.value}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MetricsTable({
  rows,
}: {
  rows: { icon: React.ElementType; label: string; value: string; delta: string; up: boolean }[]
}) {
  return (
    <table className="w-full" cellPadding={0}>
      <thead className="text-left">
        <tr>
          <th className="pb-3 text-[10px] uppercase tracking-wider text-text-soft-400">Channels</th>
          <th className="pb-3 text-[10px] uppercase tracking-wider text-text-soft-400">Metric</th>
          <th className="pb-3 text-[10px] uppercase tracking-wider text-text-soft-400">Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <React.Fragment key={r.label}>
            <tr>
              <td className="py-2">
                <div className="flex items-center gap-1.5 text-xs text-text-sub-600">
                  <r.icon className="size-5 shrink-0 text-text-soft-400" />
                  {r.label}
                </div>
              </td>
              <td className="py-2 text-xs text-text-sub-600">{r.value}</td>
              <td className="py-2">
                <div className="flex items-center gap-0.5 text-xs text-text-sub-600">
                  {r.up ? (
                    <RiArrowUpLine className="size-5 shrink-0 text-success-base" />
                  ) : (
                    <RiArrowDownLine className="size-5 shrink-0 text-error-base" />
                  )}
                  {r.delta}
                </div>
              </td>
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
