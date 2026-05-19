"use client"

import * as React from "react"
import {
  RiTimeLine as Clock,
  RiCheckLine as Check,
  RiCloseLine as Close,
} from "@remixicon/react"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"
import { EmptyStateIllustration } from "@/registry/dash/ui/empty-state-illustration"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Time Off widget — Figma 1:1 (6 nodes verified 2026-05-18).
 *   3851:32331   Full widget — data state (gauge 10/20 + 3 request rows)
 *   3851:32562   Full widget — empty state (gauge 0/20 + illustration)
 *   3525:3699    Time-off request row anatomy (status icon + date + type + badge)
 *   3871:18932   Empty state illustration — calendar w/ sleepy face
 *   3871:19598   "No records of tracked time yet." micro-copy
 *   3871:21533   Header chrome (Time Off label + clock icon + See All)
 */
export default function TimeOffWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Time Off"
        description="At-a-glance leave tracker. A semi-arc gauge shows used PTO days versus the annual cap, paired with the three most recent leave requests and their approval status."
      />

      <DocsSection title="Full widget — with data">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default state. Gauge fills to current usage; request rows list the
          three most recent submissions with status badges.
        </p>
        <DocsExample
          title="Data"
          preview={
            <div className="max-w-sm">
              <WidgetShell title={<HeaderTitle />} seeAll>
                <div className="space-y-3">
                  <div className="flex items-center justify-center py-1">
                    <FeedbackGauge value={10} max={20} unit="OUT OF 20" />
                  </div>
                  <ul className="divide-y divide-stroke-soft-200">
                    <RequestRow status="pending"   date="Jan 15, 2024" type="Casual" />
                    <RequestRow status="approved"  date="Jan 15, 2024" type="Casual" />
                    <RequestRow status="rejected"  date="Feb 12, 2024" type="Casual" />
                  </ul>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title={<HeaderTitle />} seeAll>
  <FeedbackGauge value={10} max={20} unit="OUT OF 20" />
  <RequestRow status="pending"   date="Jan 15, 2024" type="Casual" />
  <RequestRow status="approved"  date="Jan 15, 2024" type="Casual" />
  <RequestRow status="rejected"  date="Feb 12, 2024" type="Casual" />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Full widget — empty">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Empty state. Gauge ghosted to 0; body falls back to a reassuring
          illustration and copy.
        </p>
        <DocsExample
          title="Empty"
          preview={
            <div className="max-w-sm">
              <WidgetShell title={<HeaderTitle />} seeAll>
                <div className="space-y-3">
                  <div className="flex items-center justify-center py-1">
                    <FeedbackGauge value={0} max={20} unit="OUT OF 20" />
                  </div>
                  <div className="flex flex-col items-center gap-2 py-4 text-center border-t border-stroke-soft-200 pt-4">
                    <EmptyStateIllustration kind="time-off" size={96} />
                    <p className="text-xs text-text-sub-600 max-w-[24ch]">
                      No records of tracked time yet.
                    </p>
                  </div>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title={<HeaderTitle />} seeAll>
  <FeedbackGauge value={0} max={20} unit="OUT OF 20" />
  <EmptyState text="No records of tracked time yet." />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Request row states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Three lifecycle states. Leading icon + tint match the status badge tone
          for redundancy.
        </p>
        <DocsExample
          title="Pending / Approved / Rejected"
          preview={
            <ul className="divide-y divide-stroke-soft-200 max-w-sm">
              <RequestRow status="pending"  date="Jan 15, 2024" type="Casual" />
              <RequestRow status="approved" date="Jan 15, 2024" type="Casual" />
              <RequestRow status="rejected" date="Feb 12, 2024" type="Casual" />
            </ul>
          }
          code={`<RequestRow status="pending"  date="Jan 15, 2024" type="Casual" />
<RequestRow status="approved" date="Jan 15, 2024" type="Casual" />
<RequestRow status="rejected" date="Feb 12, 2024" type="Casual" />`}
        />
      </DocsSection>

      <DocsSection title="Gauge fills">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Reusable semi-arc gauge — also shared with Daily Feedback. Fills at
          0%, 25%, 50%, 75%, and 100% match the days-used scale.
        </p>
        <DocsExample
          title="0 / 5 / 10 / 15 / 20 of 20"
          preview={
            <div className="flex flex-wrap items-end gap-4">
              {[0, 5, 10, 15, 20].map((v) => (
                <FeedbackGauge key={v} value={v} max={20} unit="DAYS USED" />
              ))}
            </div>
          }
          code={`<FeedbackGauge value={10} max={20} unit="DAYS USED" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "RequestRow.status", type: '"pending" | "approved" | "rejected"', description: "Drives leading icon tint and trailing badge tone." },
            { name: "RequestRow.date", type: "string", description: "Pre-formatted submission date." },
            { name: "RequestRow.type", type: "string", description: "Leave type label (Casual / Sick / Annual)." },
            { name: "FeedbackGauge.value", type: "number", description: "Current usage." },
            { name: "FeedbackGauge.max", type: "number", defaultValue: "20", description: "Total scale (denominator)." },
            { name: "FeedbackGauge.unit", type: "string", description: "Micro-uppercase label beneath the value." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Header</strong> — clock icon + Time Off label + See All link.</li>
          <li><strong>Gauge</strong> — semi-arc 100×50 viewBox, primary stroke, soft-200 track. Value + unit centred.</li>
          <li><strong>Request row</strong> — circular status icon + date (sm strong) + type (sm sub) + Badge tone matching the status.</li>
          <li><strong>Empty state</strong> — bg-weak-50 disc + calendar icon + "No records…" micro-copy.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Usage">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Cap the list at 3 rows — direct deeper queries to the full Time Off log via See&nbsp;All.</li>
          <li>Sort newest-first; status tone tells the story, not row order.</li>
          <li>When usage exceeds 80% of the cap, consider escalating the gauge stroke to warning-base in the consuming dashboard.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ============================================================================ */

function WidgetShell({
  title,
  seeAll,
  children,
  className,
}: {
  title: React.ReactNode
  seeAll?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {seeAll ? <LinkButton size="sm">See All</LinkButton> : null}
      </div>
      {children}
    </div>
  )
}

function HeaderTitle() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Clock className="size-3.5 text-icon-sub-600" />
      Time Off
    </span>
  )
}

function RequestRow({
  status,
  date,
  type,
}: {
  status: "pending" | "approved" | "rejected"
  date: string
  type: string
}) {
  const meta = {
    pending:  { icon: Clock,  iconCls: "bg-warning-base text-white",  badge: "warning" as const, label: "Pending"   },
    approved: { icon: Check,  iconCls: "bg-success-base text-white",  badge: "success" as const, label: "Confirmed" },
    rejected: { icon: Close,  iconCls: "bg-error-base text-white",    badge: "error"   as const, label: "Rejected"  },
  }[status]
  const Icon = meta.icon
  return (
    <li className="flex items-center gap-2 py-2 text-sm">
      <span className={cn("inline-flex size-5 items-center justify-center rounded-full", meta.iconCls)}>
        <Icon className="size-3" />
      </span>
      <span className="font-medium text-text-strong-950 tabular-nums">{date}</span>
      <span className="text-text-sub-600">({type})</span>
      <span className="ml-auto">
        <Badge size="sm" appearance="lighter" status={meta.badge}>
          {meta.label}
        </Badge>
      </span>
    </li>
  )
}

function FeedbackGauge({
  value,
  max,
  unit,
}: {
  value: number
  max: number
  unit: string
}) {
  const ratio = Math.max(0, Math.min(1, value / max))
  const circumference = Math.PI * 35
  const offset = circumference * (1 - ratio)
  return (
    <div className="relative w-36 h-20">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <path
          d="M10 45 A35 35 0 1 1 90 45"
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M10 45 A35 35 0 1 1 90 45"
          fill="none"
          stroke="var(--primary-base)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <div className={cn("text-xl font-semibold tabular-nums", value === 0 ? "text-text-soft-400" : "text-text-strong-950")}>
          {value}
        </div>
        <div className="text-[9px] uppercase tracking-wider text-text-soft-400">{unit}</div>
      </div>
    </div>
  )
}
