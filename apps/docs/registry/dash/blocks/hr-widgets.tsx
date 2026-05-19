"use client"

/**
 * HR Widgets — Dash block bundle.
 *
 * Figma parity: Widgets [HR Management] [1.1] — id 3851:32690.
 * Ported 6 most-common widget patterns:
 *   - <ScheduleWidget />          (Type=📅 Schedule)
 *   - <TimeOffWidget />           (Type=⏰ Time Off)
 *   - <EmployeeSpotlightWidget /> (Type=👩‍💻 Employee Spotlight)
 *   - <TimeTrackerWidget />       (Type=🕐 Time Tracker)
 *   - <NotesWidget />             (Type=📙 Notes)
 *   - <StatusTrackerWidget />     (Type=💻 Status Tracker)
 *
 * Each widget wraps `<Card>` and accepts an `items`/`data` prop with sensible
 * defaults mirroring Figma's content. Tree-shake friendly — each is named-export.
 */

import * as React from "react"
import { RiCalendar2Line as CalendarDays, RiPlayLine as Play, RiPauseLine as Pause, RiAddLine as Plus, RiMoreLine as MoreHorizontal, RiShareLine as Share2, RiTimeLine as Clock } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { StatusBadge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
import { ProgressBar } from "@/registry/dash/ui/progress-bar"
import { cn } from "@/registry/dash/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Shared widget header                                                       */
/* -------------------------------------------------------------------------- */

function WidgetHeader({
  title,
  action,
  onAction,
  actionLabel = "See All",
}: {
  title: React.ReactNode
  action?: React.ReactNode
  onAction?: () => void
  actionLabel?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-label-medium text-text-strong-950">{title}</h3>
      {action ?? (
        <button
          type="button"
          onClick={onAction}
          className="text-label-small text-text-sub-600 hover:text-text-strong-950"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Schedule                                                                   */
/* -------------------------------------------------------------------------- */

export type ScheduleEvent = {
  id: string
  title: string
  time: string
  via?: string
  attendees?: number
  tag?: "Marketing" | "Product Manager" | "Partnership" | "Engineering"
}

const tagTint: Record<NonNullable<ScheduleEvent["tag"]>, string> = {
  Marketing: "bg-(--dash-purple-50) text-(--dash-purple-700)",
  "Product Manager": "bg-(--dash-blue-50) text-(--dash-blue-700)",
  Partnership: "bg-(--dash-green-50) text-(--dash-green-700)",
  Engineering: "bg-(--dash-orange-50) text-(--dash-orange-700)",
}

const scheduleDefaults: ScheduleEvent[] = [
  { id: "e1", title: "Meeting with James Brown", time: "8:00 - 8:45 AM (UTC)", via: "On Google Meet", attendees: 4, tag: "Marketing" },
  { id: "e2", title: "Meeting with Laura Perez", time: "9:00 - 9:45 AM (UTC)", via: "On Zoom", attendees: 2, tag: "Product Manager" },
  { id: "e3", title: "Meeting with Arthur Taylor", time: "10:00 - 11:00 AM (UTC)", via: "On Slack", tag: "Partnership" },
]

export function ScheduleWidget({
  events = scheduleDefaults,
  month = "January 2024",
  className,
}: {
  events?: ScheduleEvent[]
  month?: string
  className?: string
}) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <WidgetHeader title="Schedule" />
        <div className="flex items-center gap-2 text-label-small text-text-sub-600">
          <CalendarDays className="size-4" />
          {month}
        </div>
        <ul className="space-y-2">
          {events.map((ev) => (
            <li key={ev.id} className="rounded-lg border border-stroke-soft-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-label-small text-text-strong-950 truncate">{ev.title}</div>
                  <div className="mt-0.5 text-paragraph-x-small text-text-sub-600">{ev.time}</div>
                  {ev.via ? (
                    <div className="text-paragraph-x-small text-text-soft-400">{ev.via}</div>
                  ) : null}
                </div>
                {ev.tag ? (
                  <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-paragraph-x-small font-medium", tagTint[ev.tag])}>
                    {ev.tag}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Time Off                                                                   */
/* -------------------------------------------------------------------------- */

export type TimeOffEntry = {
  id: string
  date: string
  kind: string
  status: "Pending" | "Confirmed" | "Rejected"
}

const timeOffDefaults: TimeOffEntry[] = [
  { id: "t1", date: "Jan 15, 2024", kind: "(Casual)", status: "Pending" },
  { id: "t2", date: "Feb 12, 2024", kind: "(Casual)", status: "Confirmed" },
  { id: "t3", date: "Mar 03, 2024", kind: "(Sick)",   status: "Rejected" },
]

export function TimeOffWidget({
  used = 10,
  total = 20,
  entries = timeOffDefaults,
  className,
}: {
  used?: number
  total?: number
  entries?: TimeOffEntry[]
  className?: string
}) {
  const pct = Math.min(100, Math.round((used / total) * 100))
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <WidgetHeader title="Time Off" />
        <div className="flex items-baseline gap-2">
          <span className="text-title-h3 text-text-strong-950">{used}</span>
          <span className="text-label-x-small uppercase tracking-wider text-text-soft-400">
            out of {total}
          </span>
        </div>
        <ProgressBar value={pct} />
        <Divider />
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-label-small text-text-strong-950">{e.date}</div>
                <div className="text-paragraph-x-small text-text-sub-600">{e.kind}</div>
              </div>
              <StatusBadge
                status={
                  e.status === "Confirmed"
                    ? "success"
                    : e.status === "Rejected"
                    ? "error"
                    : "warning"
                }
              >
                {e.status}
              </StatusBadge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Employee Spotlight                                                         */
/* -------------------------------------------------------------------------- */

export function EmployeeSpotlightWidget({
  name = "Matthew Johnson",
  role = "Software Engineer",
  caption = "Top-performing employee of January!",
  avatarSrc,
  initials = "MJ",
  className,
}: {
  name?: string
  role?: string
  caption?: string
  avatarSrc?: string
  initials?: string
  className?: string
}) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label-medium text-text-strong-950">Employee Spotlight</h3>
          <Button tone="neutral" style="ghost" size="xs">
            <Share2 className="size-4" />
            Share
          </Button>
        </div>
        <div className="flex flex-col items-center gap-2 py-2">
          <Avatar size="3xl">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt={name} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <div className="text-label-medium text-text-strong-950">{name}</div>
            <div className="text-paragraph-small text-text-sub-600">{role}</div>
          </div>
          <p className="mt-1 text-paragraph-small text-text-soft-400 text-center">
            {caption}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Time Tracker                                                               */
/* -------------------------------------------------------------------------- */

export type TimeTrackerTask = {
  id: string
  label: string
  duration: string
}

const trackerDefaults: TimeTrackerTask[] = [
  { id: "p1", label: "Loom Rebranding", duration: "1:23:05" },
  { id: "p2", label: "Evernote App Redesign", duration: "3:14:26" },
]

export function TimeTrackerWidget({
  current = "Monday.com Redesign",
  currentStatus = "Awaiting",
  elapsed = "00:00:00",
  running: runningProp,
  onToggle,
  previous = trackerDefaults,
  className,
}: {
  current?: string
  currentStatus?: string
  elapsed?: string
  running?: boolean
  onToggle?: (next: boolean) => void
  previous?: TimeTrackerTask[]
  className?: string
}) {
  const [running, setRunning] = React.useState(!!runningProp)
  React.useEffect(() => { if (runningProp !== undefined) setRunning(runningProp) }, [runningProp])
  const toggle = () => {
    const next = !running
    setRunning(next)
    onToggle?.(next)
  }
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <WidgetHeader title="Time Tracker" actionLabel="History" />
        <div className="rounded-lg bg-bg-weak-50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-label-small text-text-strong-950 truncate">{current}</div>
              <div className="text-paragraph-x-small text-text-soft-400">{currentStatus}</div>
            </div>
            <span className="text-label-large text-text-strong-950 tabular-nums">{elapsed}</span>
          </div>
          <Button tone="primary" style="filled" size="md" className="w-full" onClick={toggle}>
            {running ? <Pause /> : <Play />}
            {running ? "Pause Time Tracker" : "Start Time Tracker"}
          </Button>
        </div>
        <div className="space-y-2">
          <div className="text-label-x-small uppercase tracking-wider text-text-soft-400">Previous Tasks</div>
          <ul className="space-y-2">
            {previous.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-label-small">
                <span className="text-text-strong-950 truncate">{t.label}</span>
                <span className="tabular-nums text-text-sub-600">{t.duration}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Notes                                                                      */
/* -------------------------------------------------------------------------- */

export type NoteEntry = {
  id: string
  date: string
  group?: "Today" | "Yesterday" | "Earlier"
  tag?: "To-do" | "Meeting" | "Important" | "Idea"
  title: string
  body?: string
}

const noteTagTint: Record<NonNullable<NoteEntry["tag"]>, string> = {
  "To-do":     "bg-(--dash-blue-50) text-(--dash-blue-700)",
  Meeting:     "bg-(--dash-purple-50) text-(--dash-purple-700)",
  Important:   "bg-(--dash-red-50) text-(--dash-red-700)",
  Idea:        "bg-(--dash-yellow-50) text-(--dash-yellow-700)",
}

const noteDefaults: NoteEntry[] = [
  { id: "n1", group: "Today",     date: "Aug 03", tag: "To-do",     title: "Text Inputs for Design System", body: "Search for inspiration to provide a rich content of text inputs for the design system." },
  { id: "n2", group: "Today",     date: "Aug 03", tag: "Meeting",   title: "Meeting with Arthur Taylor", body: "Discuss the MVP version of Apex Mobile and Desktop app." },
  { id: "n3", group: "Yesterday", date: "Aug 02", tag: "Important", title: "Check neutral and state colors", body: "Button components will be revised and designed again due to a few errors." },
]

export function NotesWidget({
  notes = noteDefaults,
  className,
  onAddNote,
}: {
  notes?: NoteEntry[]
  className?: string
  onAddNote?: () => void
}) {
  // Group by group label, preserving order
  const groups = React.useMemo(() => {
    const m = new Map<string, NoteEntry[]>()
    for (const n of notes) {
      const k = n.group ?? "Earlier"
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(n)
    }
    return Array.from(m.entries())
  }, [notes])

  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label-medium text-text-strong-950">Notes</h3>
          <Button tone="primary" style="ghost" size="xs" onClick={onAddNote}>
            <Plus /> Add Note
          </Button>
        </div>
        <div className="space-y-3">
          {groups.map(([label, items]) => (
            <div key={label} className="space-y-2">
              <div className="text-label-x-small uppercase tracking-wider text-text-soft-400">{label}</div>
              {items.map((n) => (
                <div key={n.id} className="rounded-lg border border-stroke-soft-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {n.tag ? (
                        <span className={cn("rounded px-1.5 py-0.5 text-paragraph-x-small font-medium", noteTagTint[n.tag])}>
                          {n.tag}
                        </span>
                      ) : null}
                      <span className="text-paragraph-x-small text-text-soft-400">{n.date}</span>
                    </div>
                    <IconButton size="xs" tone="neutral" style="ghost" aria-label="More">
                      <MoreHorizontal />
                    </IconButton>
                  </div>
                  <div className="mt-1.5 text-label-small text-text-strong-950">{n.title}</div>
                  {n.body ? (
                    <p className="mt-0.5 text-paragraph-x-small text-text-sub-600 line-clamp-2">{n.body}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Status Tracker                                                             */
/* -------------------------------------------------------------------------- */

export type StatusEntry = {
  id: string
  name: string
  initials?: string
  avatarSrc?: string
  team?: string
  status: "Absent" | "Away" | "On Break" | "Active"
  note?: string
  duration?: string
}

const statusTint: Record<StatusEntry["status"], string> = {
  Absent:   "bg-(--state-error-lighter) text-(--state-error-base)",
  Away:     "bg-(--state-warning-lighter) text-(--state-warning-base)",
  "On Break": "bg-(--dash-orange-50) text-(--dash-orange-700)",
  Active:   "bg-(--state-success-lighter) text-(--state-success-base)",
}

const statusDefaults: StatusEntry[] = [
  { id: "s1", name: "James Brown",     initials: "JB", team: "Synergy", status: "Absent", note: "Replaced by Arthur T." },
  { id: "s2", name: "Sophia Williams", initials: "SW", team: "Synergy", status: "Away",   duration: "25m" },
  { id: "s3", name: "Arthur Taylor",   initials: "AT", team: "Apex",    status: "On Break", duration: "12m" },
  { id: "s4", name: "Emma Wright",     initials: "EW", team: "Pulse",   status: "Active",   duration: "8m" },
]

export function StatusTrackerWidget({
  entries = statusDefaults,
  className,
}: {
  entries?: StatusEntry[]
  className?: string
}) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <WidgetHeader title="Status Tracker" />
        <ul className="space-y-2.5">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center gap-3">
              <Avatar size="md">
                {e.avatarSrc ? <AvatarImage src={e.avatarSrc} alt={e.name} /> : null}
                <AvatarFallback>{e.initials ?? e.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-label-small text-text-strong-950 truncate">{e.name}</span>
                  {e.team ? (
                    <span className="text-paragraph-x-small text-text-soft-400">· {e.team}</span>
                  ) : null}
                </div>
                {e.note ? (
                  <div className="text-paragraph-x-small text-text-sub-600 truncate">{e.note}</div>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("rounded px-1.5 py-0.5 text-paragraph-x-small font-medium", statusTint[e.status])}>
                  {e.status}
                </span>
                {e.duration ? (
                  <span className="inline-flex items-center gap-1 text-paragraph-x-small text-text-soft-400">
                    <Clock className="size-3" />
                    {e.duration}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
