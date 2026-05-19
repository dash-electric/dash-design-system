"use client"

import * as React from "react"
import {
  RiMacbookLine,
  RiIndeterminateCircleFill,
  RiUserLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarImage, AvatarFallback, AvatarIndicator } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
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
 * HR Widget — Status Tracker. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-status-tracker.tsx
 *
 * Two groups — Absent / Away. Available / Busy / In-Meeting / Offline tones
 * available via the TimePickerStatus pattern.
 */
type Person = {
  name: string
  img: string
  initials: string
  caption: string
  status: "online" | "away" | "busy" | "offline"
  badge: { label: string; tone: "neutral" | "warning" | "success" | "error" }
}

const ABSENT: Person[] = [
  {
    name: "James Brown 🧠",
    img: "/images/avatar/illustration/james.png",
    initials: "JB",
    caption: "Replaced by Arthur T.",
    status: "offline",
    badge: { label: "Absent", tone: "neutral" },
  },
]

const AWAY: Person[] = [
  { name: "Sophia Williams 🧠", img: "/images/avatar/illustration/sophia.png", initials: "SW", caption: "Synergy", status: "away", badge: { label: "25m", tone: "warning" } },
  { name: "Arthur Taylor 🧠", img: "/images/avatar/illustration/arthur.png", initials: "AT", caption: "Apex", status: "away", badge: { label: "12m", tone: "warning" } },
  { name: "Emma Wright 🧠", img: "/images/avatar/illustration/emma.png", initials: "EW", caption: "Pulse", status: "away", badge: { label: "8m", tone: "warning" } },
]

const STATUS_OPTIONS = [
  { value: "available", label: "Available", color: "bg-(--state-success-base)" },
  { value: "busy", label: "Busy", color: "bg-(--state-error-base)" },
  { value: "in-meeting", label: "In-Meeting", color: "bg-(--state-feature-base)" },
  { value: "offline", label: "Offline", color: "bg-(--state-faded-base)" },
] as const

export default function HRStatusTrackerWidgetPage() {
  const [picked, setPicked] = React.useState<string>("available")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Status Tracker"
        description="Team presence list. Grouped by Absent / Away with avatar status dot + caption + lighter tone duration badge. Pairs with the TimePickerStatus picker for setting your own state."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="1 absent · 3 away"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiMacbookLine className="size-4 text-icon-sub-600" /> Status Tracker</>}
                action={<Button tone="neutral" style="stroke" size="xs">See All</Button>}
              >
                <Divider />
                <div className="space-y-4 pt-4">
                  <Group label="Absent">
                    {ABSENT.map((p) => <PersonRow key={p.name} person={p} />)}
                  </Group>
                  <Divider />
                  <Group label="Away">
                    {AWAY.map((p) => <PersonRow key={p.name} person={p} />)}
                  </Group>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<Group label="Away">{AWAY.map((p) => <PersonRow person={p} />)}</Group>`}
        />
      </DocsSection>

      <DocsSection title="TimePickerStatus">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Self-status picker. 4 options — Available, Busy, In-Meeting, Offline. Tonal dot leads
          each option; selected = filled background.
        </p>
        <DocsExample
          title="Set your status"
          preview={
            <div className="max-w-xs">
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-1 space-y-0.5">
                {STATUS_OPTIONS.map((opt) => {
                  const active = picked === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPicked(opt.value)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active ? "bg-bg-weak-50 text-text-strong-950" : "text-text-sub-600 hover:bg-bg-weak-50",
                      )}
                    >
                      <span className={cn("size-2 rounded-full", opt.color)} />
                      <span className="flex-1 text-left">{opt.label}</span>
                      {active && <span className="size-1.5 rounded-full bg-primary" />}
                    </button>
                  )
                })}
              </div>
            </div>
          }
          code={`{STATUS_OPTIONS.map(opt => <StatusOption value={opt.value} />)}`}
        />
      </DocsSection>

      <DocsSection title="Avatar status dots">
        <DocsExample
          title="online / away / busy / offline"
          preview={
            <div className="flex gap-4">
              {(["online", "away", "busy", "offline"] as const).map((s) => (
                <div key={s} className="text-center space-y-1">
                  <Avatar size="md">
                    <AvatarImage src="/images/avatar/illustration/arthur.png" />
                    <AvatarFallback>A</AvatarFallback>
                    <AvatarIndicator tone={s} />
                  </Avatar>
                  <div className="text-xs text-text-sub-600">{s}</div>
                </div>
              ))}
            </div>
          }
          code={`<Avatar><AvatarIndicator tone="online" /></Avatar>`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No statuses yet"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiMacbookLine className="size-4 text-icon-sub-600" /> Status Tracker</>}>
                <Divider />
                <div className="flex flex-col items-center justify-center gap-4 py-14">
                  <EmptyStateIllustration kind="status-tracker" />
                  <p className="text-center text-sm text-text-soft-400">
                    No records of statuses yet.<br /> Please check back later.
                  </p>
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
            { name: "groups[]", type: "{ label, people }[]", description: "Section header + person rows." },
            { name: "person.status", type: '"online" | "away" | "busy" | "offline"', description: "Drives the avatar indicator tone." },
            { name: "person.badge", type: "{ label, tone }", description: "Lighter-tone duration / absence badge." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Group label</strong> — paragraph-xs sub-600.</li>
          <li><strong>Person row</strong> — 40px avatar w/ status indicator + name (label-sm) + caption (xs sub-600) + duration badge.</li>
          <li><strong>Badges</strong> — gray for Absent, orange for Away minutes.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-text-sub-600">{label}</p>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function PersonRow({ person }: { person: Person }) {
  const badgeStatus = person.badge.tone === "neutral" ? "neutral" : person.badge.tone === "warning" ? "warning" : person.badge.tone === "success" ? "success" : "error"
  return (
    <div className="flex items-center gap-3.5">
      <Avatar size="md">
        <AvatarImage src={person.img} />
        <AvatarFallback>{person.initials}</AvatarFallback>
        <AvatarIndicator tone={person.status} />
      </Avatar>
      <div className="grow space-y-0.5">
        <div className="text-sm font-medium text-text-strong-950">{person.name}</div>
        <div className="text-xs text-text-sub-600">{person.caption}</div>
      </div>
      <Badge status={badgeStatus} appearance="lighter" type="left-icon" icon={<RiIndeterminateCircleFill />}>
        {person.badge.label}
      </Badge>
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
