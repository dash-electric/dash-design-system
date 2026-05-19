"use client"

import * as React from "react"
import {
  RiTimeLine,
  RiTimeFill,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiCalendarLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * HR Widget — Time Off. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-time-off.tsx
 */
const VALUE = 10
const MAX = 20

const REQUESTS = [
  { date: "Jan 15, 2024", type: "Casual", state: "pending" },
  { date: "Jan 15, 2024", type: "Casual", state: "confirmed" },
  { date: "Jan 15, 2024", type: "Casual", state: "rejected" },
] as const

export default function HRTimeOffWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Time Off"
        description="Vacation balance + recent request log. Big semi-arc gauge centres balance vs cap; below it, leading-icon rows list confirmed / pending / rejected requests."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="10 / 20 — 3 recent requests"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={<><RiTimeLine className="size-4 text-icon-sub-600" /> Time Off</>}
                action={<Button tone="neutral" style="stroke" size="xs">See All</Button>}
              >
                <Divider />
                <div className="py-6">
                  <Gauge value={VALUE} max={MAX} />
                </div>
                <Divider />
                <div className="space-y-4 pt-4">
                  {REQUESTS.map((r, i) => (
                    <React.Fragment key={i}>
                      <RequestRow {...r} />
                      {i < REQUESTS.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </div>
              </WidgetShell>
            </div>
          }
          code={`<Gauge value={10} max={20} />
{REQUESTS.map((r) => <RequestRow {...r} />)}`}
        />
      </DocsSection>

      <DocsSection title="Gauge fills">
        <DocsExample
          title="0 / 5 / 10 / 15 / 20 of 20"
          preview={
            <div className="flex flex-wrap items-end gap-6">
              {[0, 5, 10, 15, 20].map((v) => <Gauge key={v} value={v} max={MAX} />)}
            </div>
          }
          code={`<Gauge value={10} max={20} />`}
        />
      </DocsSection>

      <DocsSection title="Request states">
        <DocsExample
          title="Pending / Confirmed / Rejected"
          preview={
            <div className="space-y-3 max-w-sm">
              {REQUESTS.map((r, i) => <RequestRow key={i} {...r} />)}
            </div>
          }
          code={`<RequestRow state="pending" date="Jan 15, 2024" type="Casual" />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="0 of 20"
          preview={
            <div className="max-w-sm">
              <WidgetShell title={<><RiTimeLine className="size-4 text-icon-sub-600" /> Time Off</>}>
                <Divider />
                <div className="py-6">
                  <Gauge value={0} max={MAX} empty />
                </div>
                <Divider />
                <div className="flex flex-col items-center gap-3 py-6">
                  <RiCalendarLine className="size-8 text-text-soft-400" />
                  <p className="text-center text-sm text-text-soft-400">No records of tracked time yet.</p>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<EmptyState />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "number", description: "Current days taken." },
            { name: "max", type: "number", defaultValue: "20", description: "Yearly cap." },
            { name: "requests[]", type: "{ date, type, state }[]", description: "Recent request log." },
            { name: "state", type: '"pending" | "confirmed" | "rejected"', description: "Drives icon + badge tone." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Gauge</strong> — 208px semi-arc, primary-base stroke, value + "OUT OF N" centred.</li>
          <li><strong>Request row</strong> — leading icon (warning/success/error fill) + date + type in parens + tone badge.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function Gauge({ value, max, empty }: { value: number; max: number; empty?: boolean }) {
  const ratio = Math.max(0, Math.min(1, value / max))
  const circumference = Math.PI * 80
  const offset = circumference * (1 - ratio)
  return (
    <div className="relative mx-auto w-[208px] h-[120px]">
      <svg viewBox="0 0 208 110" className="w-full h-full">
        <path
          d="M14 100 A80 80 0 1 1 194 100"
          fill="none"
          stroke="var(--bg-soft-200)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {!empty && (
          <path
            d="M14 100 A80 80 0 1 1 194 100"
            fill="none"
            stroke="var(--primary-base)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <div className={cn("text-3xl font-semibold tabular-nums", empty ? "text-text-soft-400" : "text-text-strong-950")}>
          {value}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-text-soft-400">OUT OF {max}</div>
      </div>
    </div>
  )
}

function RequestRow({ date, type, state }: { date: string; type: string; state: "pending" | "confirmed" | "rejected" }) {
  const icon = state === "pending" ? <RiTimeFill className="size-5 text-(--state-warning-base)" />
    : state === "confirmed" ? <RiCheckboxCircleFill className="size-5 text-(--state-success-base)" />
    : <RiCloseCircleFill className="size-5 text-(--state-error-base)" />
  const status = state === "pending" ? "warning" : state === "confirmed" ? "success" : "error"
  const label = state.charAt(0).toUpperCase() + state.slice(1)
  return (
    <div className="flex items-center gap-1">
      {icon}
      <div className="flex flex-1 items-center gap-0.5 text-sm">
        {date}
        <span className="text-xs text-text-soft-400">({type})</span>
      </div>
      <Badge status={status as "warning" | "success" | "error"} appearance="lighter">{label}</Badge>
    </div>
  )
}

function WidgetShell({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2 h-9 mb-2">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}
