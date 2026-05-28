"use client"

import * as React from "react"
import {
  RiCheckLine,
  RiInformationLine,
  RiLoader4Line,
  RiTimeLine,
} from "@remixicon/react"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/dash/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Marketing Widget — Support Analytics.
 * Ported from AlignUI Marketing Template (widget-support-analytics.tsx, 2026-05-18).
 *
 * Three stacked panes:
 *   1. Header — title + tooltip, 2450 KPI + "+5.4% total tickets" sub, period Select
 *      Then a row of category pills (Technical / Billing / Account / Product).
 *   2. Bar chart pane (h=116) with target indicator (faded-dark label + dashed connector).
 *      The active bar gets primary-base fill; others get faded-light.
 *      Day labels under the chart (Mon-Sun for daily / W## for weekly / Mmm for monthly).
 *   3. Tabs: All Tickets / Open Tickets / Solved Tickets — 3-row table inside All Tickets.
 *   4. Recent Tickets — 3 ticket rows (avatar + name + priority + status + 12/19/48m + #TKT-…).
 */

const DAILY = [
  { date: "2023-12-04", label: "Mon", value: 16 },
  { date: "2023-12-05", label: "Tue", value: 32 },
  { date: "2023-12-06", label: "Wed", value: 18 },
  { date: "2023-12-07", label: "Thu", value: 10 },
  { date: "2023-12-08", label: "Fri", value: 25, active: true },
  { date: "2023-12-09", label: "Sat", value: 15 },
  { date: "2023-12-10", label: "Sun", value: 15 },
]
const DAILY_TARGET = 20
const BAR_H = 116

type CategoryPill = "technical" | "billing" | "account" | "product"

function SupportAnalyticsWidget() {
  const [period, setPeriod] = React.useState("daily")
  const [cat, setCat] = React.useState<CategoryPill>("technical")
  const max = Math.max(...DAILY.map((d) => d.value)) || 1
  const heightOf = (v: number) => (v / max) * BAR_H
  const targetTop = BAR_H - (DAILY_TARGET / max) * BAR_H

  return (
    <div className="relative flex w-full flex-col rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      {/* Header */}
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-text-sub-600">Support Analytics</span>
              <RiInformationLine className="size-5 text-text-disabled-300" />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold tracking-tight text-text-strong-950">2450</span>
              <span className="text-xs text-text-sub-600">
                <span className="text-success-base">+5.4%</span> total tickets
              </span>
            </div>
          </div>
          <Select value={period} onValueChange={setPeriod}>
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

        <div className="flex flex-wrap gap-1.5">
          {(["technical", "billing", "account", "product"] as CategoryPill[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setCat(v)}
              className={cn(
                "flex h-7 items-center justify-center rounded-lg bg-bg-weak-50 px-2.5 text-xs font-medium text-text-sub-600 transition-colors capitalize",
                cat === v && "bg-(--primary-alpha-10) text-(--primary-base)",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-stroke-soft-200" />

      {/* Bar chart with target indicator */}
      <div className="px-4 pt-4">
        <div className="relative">
          <div className="grid grid-flow-col auto-cols-fr items-end gap-1.5" style={{ height: BAR_H }}>
            {DAILY.map((p, i) => (
              <div
                key={i}
                className={cn("origin-bottom rounded-md", p.active ? "bg-(--primary-base)" : "bg-(--state-faded-light)")}
                style={{ height: heightOf(p.value) }}
              />
            ))}
          </div>
          <div
            className="absolute left-0 z-10 flex w-full -translate-y-1/2 items-center gap-2"
            style={{ top: targetTop }}
          >
            <div className="flex items-stretch">
              <span className="rounded-l-md bg-(--state-faded-dark) py-1 pl-2 text-[10px] text-white">
                Target : {DAILY_TARGET}m
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 15 24"
                className="h-6"
              >
                <path
                  className="fill-(--state-faded-dark)"
                  d="M13.172 9.172l-8-8A4 4 0 002.343 0H0v24h2.343a4 4 0 002.829-1.172l8-8a4 4 0 000-5.656z"
                />
              </svg>
            </div>
            <div
              className="flex flex-1 items-center justify-between text-(--state-faded-dark) before:size-1.5 before:rounded-full before:bg-(--state-faded-dark) after:size-1.5 after:rounded-full after:bg-(--state-faded-dark)"
              style={{
                background: "linear-gradient(90deg, currentColor 5px, transparent 5px) 0 50% / 10px 1px repeat no-repeat",
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-flow-col auto-cols-fr gap-1.5 px-4 py-3">
        {DAILY.map((p) => (
          <div
            key={p.date}
            className={cn(
              "flex h-5 items-center justify-center rounded text-center text-[11px] text-text-soft-400",
              p.active && "text-(--primary-base) bg-(--primary-alpha-16)",
            )}
          >
            {p.label}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all-tickets">
        <TabsList variant="line" className="px-6">
          <TabsTrigger value="all-tickets">All Tickets</TabsTrigger>
          <TabsTrigger value="open-tickets" disabled>
            Open Tickets
          </TabsTrigger>
          <TabsTrigger value="solved-tickets" disabled>
            Solved Tickets
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all-tickets" className="mt-0 px-6 py-4">
          <table className="w-full">
            <thead className="text-left">
              <tr>
                <th className="text-[11px] text-text-soft-400 font-medium">Channels</th>
                <th className="text-[11px] text-text-soft-400 font-medium">Actual</th>
                <th className="text-[11px] text-text-soft-400 font-medium w-0">Avg.</th>
              </tr>
            </thead>
            <tbody>
              <tr aria-hidden><td colSpan={3} className="h-3" /></tr>
              <TicketRow channel="First response time" sub="Below SLA" actual="15m" avg="+22%" avgTone="success" />
              <tr aria-hidden><td colSpan={3} className="h-3" /></tr>
              <TicketRow channel="Avg Resolution Time" sub="Meeting SLA" actual="48m" avg="+18%" avgTone="success" />
              <tr aria-hidden><td colSpan={3} className="h-3" /></tr>
              <TicketRow channel="CSAT Score" sub="Above Target" actual="4.8/5" avg="-0.3%" avgTone="error" />
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="open-tickets" className="mt-0 px-6 py-4 text-sm text-text-sub-600">
          Open Tickets content
        </TabsContent>
        <TabsContent value="solved-tickets" className="mt-0 px-6 py-4 text-sm text-text-sub-600">
          Solved Tickets content
        </TabsContent>
      </Tabs>

      <div className="border-t border-stroke-soft-200" />

      {/* Recent Tickets */}
      <div className="p-6 pt-4">
        <div className="text-[11px] text-text-soft-400">Recent Tickets</div>
        <div className="mt-4 flex flex-col gap-4">
          <TicketCard name="James Brown" priority="High" status="solved" time="48m" id="#TKT-98744" avatarLetter="J" />
          <TicketCard name="Sophia Williams" priority="Medium" status="in-progress" time="19m" id="#TKT-98743" avatarLetter="S" />
          <TicketCard name="Matthew Johnson" priority="Low" status="pending" time="12m" id="#TKT-98745" avatarLetter="M" />
        </div>
      </div>
    </div>
  )
}

function TicketRow({
  channel,
  sub,
  actual,
  avg,
  avgTone,
}: {
  channel: string
  sub: string
  actual: string
  avg: string
  avgTone: "success" | "error"
}) {
  return (
    <tr>
      <td>
        <div className="text-sm font-medium text-text-strong-950">{channel}</div>
        <div className="mt-1 text-[11px] text-text-soft-400">{sub}</div>
      </td>
      <td className="text-sm text-text-sub-600">{actual}</td>
      <td className={cn("text-sm", avgTone === "success" ? "text-success-base" : "text-error-base")}>{avg}</td>
    </tr>
  )
}

function TicketCard({
  name,
  priority,
  status,
  time,
  id,
  avatarLetter,
}: {
  name: string
  priority: "High" | "Medium" | "Low"
  status: "solved" | "in-progress" | "pending"
  time: string
  id: string
  avatarLetter: string
}) {
  const meta =
    status === "solved"
      ? { color: "text-success-base", Icon: RiCheckLine, label: "Solved" }
      : status === "in-progress"
        ? { color: "text-warning-base", Icon: RiLoader4Line, label: "In-progress" }
        : { color: "text-away-base", Icon: RiTimeLine, label: "Pending" }
  return (
    <div className="flex items-center gap-3">
      <Avatar size="md">
        <AvatarFallback>{avatarLetter}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="text-sm font-medium text-text-strong-950">{name}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-text-soft-400">{priority}</span>
          <span className="text-text-soft-400">·</span>
          <span className={cn("inline-flex items-center gap-[4px]", meta.color)}>
            <meta.Icon className="size-3" />
            {meta.label}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-text-strong-950">{time}</div>
        <div className="mt-1 text-[11px] text-text-soft-400">{id}</div>
      </div>
    </div>
  )
}

export default function SupportAnalyticsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Support Analytics"
        description="Helpdesk dashboard — KPI header, category pills, a 116px bar chart with dashed target indicator, tab table (First response / Resolution / CSAT), and 3 Recent Tickets rows."
        status="shipped"
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Daily volume with target line"
          preview={
            <div className="max-w-md mx-auto w-full">
              <SupportAnalyticsWidget />
            </div>
          }
          code={`<SupportAnalyticsWidget />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No tickets yet"
          preview={
            <div className="max-w-md mx-auto rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200 text-center">
              <div className="text-sm font-medium text-text-strong-950">Support Analytics</div>
              <div className="mt-2 text-xs text-text-sub-600">No support tickets in this window.</div>
            </div>
          }
          code={`{total === 0 ? <Empty/> : <SupportAnalyticsWidget/>}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data", type: "Record<period, { date, value, active? }[]>", description: "Bar values per period. active marks the highlighted bar (primary-base)." },
            { name: "target", type: "number", description: "Drives the horizontal dashed target indicator (faded-dark label + arrow + dashed line)." },
            { name: "category", type: '"technical" | "billing" | "account" | "product"', description: "Active pill above the chart." },
            { name: "metrics", type: "{ firstResponse, resolution, csat }", description: "Three rows in the All Tickets tab." },
            { name: "tickets", type: "{ name, priority, status, time, id }[]", description: "Recent Tickets cards. status drives icon + color." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Header: KPI (24px) + 12px sub-line + period select. Pill row sits below.</li>
          <li>Chart: 116px tall, active bar primary-base, inactive faded-light, gap 1.5.</li>
          <li>Target: faded-dark label + 24px SVG arrow tail + dashed connector to the right edge.</li>
          <li>Day labels: 20px tall, active label pill = primary-alpha-16 + primary-base text.</li>
          <li>Tabs: line variant. Open/Solved disabled in source — UI only.</li>
          <li>Recent Tickets: 3 cards, 32px avatar, status maps to success/warning/away.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
