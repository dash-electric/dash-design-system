"use client"

import * as React from "react"
import { RiInformationLine } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/dash/ui/select"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Marketing Widget — Sales Channels.
 * Ported from AlignUI Marketing Template (widget-sales-channels.tsx, 2026-05-18).
 *
 * Structure:
 *   - Header: title + tooltip, total (sum of values), "+2.1% vs last week", period Select.
 *   - Date range row: start / end pulled from the local date − period offset.
 *   - 42px-tall stacked CategoryBar (7 channels, distinct base colors per channel).
 *
 * Channel order:
 *   Organic Search · Social Media · Direct · Email Campaigns ·
 *   Paid Search · Affiliate Marketing · Referral
 *
 * Colors (7-stop sequence):
 *   information / verified / feature / warning / away / success / stable.
 */

type Period = "daily" | "weekly" | "monthly"

const dataByPeriod: Record<Period, { label: string; value: number }[]> = {
  daily: [
    { label: "Organic Search", value: 6 },
    { label: "Social Media", value: 4 },
    { label: "Direct", value: 3 },
    { label: "Email Campaigns", value: 2 },
    { label: "Paid Search", value: 1 },
    { label: "Affiliate Marketing", value: 1 },
    { label: "Referral", value: 0.5 },
  ],
  weekly: [
    { label: "Organic Search", value: 45 },
    { label: "Social Media", value: 30 },
    { label: "Direct", value: 25 },
    { label: "Email Campaigns", value: 20 },
    { label: "Paid Search", value: 15 },
    { label: "Affiliate Marketing", value: 10 },
    { label: "Referral", value: 8 },
  ],
  monthly: [
    { label: "Organic Search", value: 190 },
    { label: "Social Media", value: 110 },
    { label: "Direct", value: 90 },
    { label: "Email Campaigns", value: 70 },
    { label: "Paid Search", value: 50 },
    { label: "Affiliate Marketing", value: 40 },
    { label: "Referral", value: 32 },
  ],
}

const colors = [
  "bg-information-base",
  "bg-verified-base",
  "bg-feature-base",
  "bg-warning-base",
  "bg-away-base",
  "bg-success-base",
  "bg-stable-base",
]

function dateRange(period: Period) {
  const today = new Date()
  const end = new Date(today)
  const start = new Date(today)
  if (period === "daily") start.setDate(today.getDate() - 1)
  else if (period === "weekly") start.setDate(today.getDate() - 7)
  else start.setMonth(today.getMonth() - 1)
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return { start: fmt(start), end: fmt(end) }
}

function SalesChannelsWidget() {
  const [period, setPeriod] = React.useState<Period>("weekly")
  const current = dataByPeriod[period]
  const { start, end } = dateRange(period)
  const total = current.reduce((a, b) => a + b.value, 0)

  return (
    <div className="relative flex w-full flex-col gap-4 rounded-2xl bg-bg-white-0 p-6 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-text-sub-600">Sales Channels</span>
            <RiInformationLine className="size-5 text-text-disabled-300" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight text-text-strong-950">{total}</span>
            <span className="text-xs text-text-sub-600">
              <span className="text-success-base">+2.1%</span> vs last week
            </span>
          </div>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger size="sm" className="h-7 w-auto gap-2 px-2.5 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-text-soft-400">{start}</span>
          <span className="text-[11px] text-text-soft-400">{end}</span>
        </div>
        <div className="flex gap-1">
          {current.map((row, i) => (
            <div
              key={row.label}
              className={cn("rounded-sm transition-all", colors[i % colors.length])}
              style={{
                width: `${(row.value / total) * 100}%`,
                height: 42,
              }}
              title={`${row.label}: ${row.value}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {current.map((row, i) => (
            <span
              key={row.label}
              className="inline-flex items-center gap-1.5 text-[11px] text-text-sub-600"
            >
              <span
                className={cn("size-2.5 rounded-full border-2 border-bg-white-0 shadow-regular-xs", colors[i % colors.length])}
              />
              {row.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SalesChannelsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Sales Channels"
        description="Channel mix — 7 categories rendered as a fat stacked bar (42px), sized by share of total. Header carries total + week-on-week delta and a period selector."
        status="shipped"
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Weekly mix"
          preview={
            <div className="max-w-md mx-auto w-full">
              <SalesChannelsWidget />
            </div>
          }
          code={`<SalesChannelsWidget />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No channels yet"
          preview={
            <div className="max-w-md mx-auto rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200 space-y-3">
              <div className="text-sm font-medium text-text-sub-600">Sales Channels</div>
              <div className="flex gap-1">
                {[1, 1, 1].map((_, i) => (
                  <div key={i} className="h-[42px] flex-1 rounded-sm bg-bg-soft-200" />
                ))}
              </div>
              <div className="text-xs text-text-soft-400">Connect a channel to see the mix.</div>
            </div>
          }
          code={`{data.length === 0 ? <Empty/> : <SalesChannelsWidget/>}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "dataByPeriod", type: "Record<Period, { label, value }[]>", description: "Channel rows per period. Sum drives the header KPI; share drives bar width." },
            { name: "colors", type: "string[]", description: "7-stop palette. Default = information / verified / feature / warning / away / success / stable." },
            { name: "delta", type: "ReactNode", description: 'Sub-line copy, e.g. "+2.1% vs last week".' },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Card: rounded-2xl, padding 20, ring stroke-soft-200, shadow-regular-xs.</li>
          <li>Header: 14px label + info icon, 24px KPI + sub-line delta, period Select on the right.</li>
          <li>Range row: start / end dates pulled from period offset (today – 1d / 7d / 1mo).</li>
          <li>Stacked bar: 42px tall, 4px gap between segments, rounded 2px corners.</li>
          <li>Legend: optional row of dot + label pairs below the bar (size-3 dot, white 2px ring).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
