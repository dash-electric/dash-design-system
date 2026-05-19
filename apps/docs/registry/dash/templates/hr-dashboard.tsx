"use client"

import * as React from "react"
import { RiCalendarLine as CalendarIcon, RiTimeLine as Clock, RiCheckboxCircleLine as CheckCircle2, RiAddLine as Plus, RiMoreLine as MoreHorizontal, RiArrowRightSLine as ChevronRight, RiVideoLine as Video } from "@remixicon/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Divider } from "@/registry/dash/ui/divider"
import { ProgressBar } from "@/registry/dash/ui/progress-bar"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrDashboard — ported 1:1 (structural parity) from AlignUI Pro Figma node 3715:42065.
 * Synergy HR Management dashboard. 5 widgets in a 3-col grid:
 *   - Status Tracker (Absent / Away employees)
 *   - Notes
 *   - Today's Schedule (events list)
 *   - Time Off (gauge + Pending/Confirmed/Rejected)
 *   - Current Project
 *
 * Visual polish + animations land Phase 5.
 */

export type AbsentEmployee = {
  id: string
  name: string
  reason?: string
  replacedBy?: string
  team: string
  duration: string
  initials?: string
}

export type ScheduleEvent = {
  id: string
  title: string
  time: string
  via?: "Google Meet" | "Zoom" | "Slack" | "In Person"
  tag: "Meetings" | "Events" | "Holiday"
  attendeesExtra?: number
}

export type TimeOffRequest = {
  id: string
  label: string
  date: string
  type: "Pending" | "Confirmed" | "Rejected"
}

export type HrDashboardProps = {
  userName?: string
  date?: string
  absent?: AbsentEmployee[]
  away?: AbsentEmployee[]
  schedule?: ScheduleEvent[]
  timeOff?: TimeOffRequest[]
  className?: string
}

const defaultAbsent: AbsentEmployee[] = [
  {
    id: "u1",
    name: "James Brown",
    reason: "Sick",
    replacedBy: "Arthur T.",
    team: "Synergy",
    duration: "25m",
    initials: "JB",
  },
]

const defaultAway: AbsentEmployee[] = [
  { id: "u2", name: "Sophia Williams", team: "Synergy", duration: "25m", initials: "SW" },
  { id: "u3", name: "Arthur Taylor", team: "Apex", duration: "12m", initials: "AT" },
  { id: "u4", name: "Emma Wright", team: "Pulse", duration: "8m", initials: "EW" },
]

const defaultSchedule: ScheduleEvent[] = [
  {
    id: "ev1",
    title: "Meeting with James Brown",
    time: "8:00 - 8:45 AM (UTC)",
    via: "Google Meet",
    tag: "Meetings",
    attendeesExtra: 4,
  },
  {
    id: "ev2",
    title: "Meeting with Laura Perez",
    time: "9:00 - 9:45 AM (UTC)",
    via: "Zoom",
    tag: "Meetings",
    attendeesExtra: 2,
  },
  {
    id: "ev3",
    title: "Product Manager",
    time: "10:00 - 11:00 AM (UTC)",
    via: "Slack",
    tag: "Events",
  },
]

const defaultTimeOff: TimeOffRequest[] = [
  { id: "to1", label: "Jan 15, 2024 (Casual)", date: "Jan 15, 2024", type: "Pending" },
  { id: "to2", label: "Feb 12, 2024", date: "Feb 12, 2024", type: "Confirmed" },
  { id: "to3", label: "Feb 12, 2024", date: "Feb 12, 2024", type: "Rejected" },
]

const tagStyle: Record<ScheduleEvent["tag"], string> = {
  Meetings: "bg-bg-weak-50 text-text-sub-600",
  Events: "bg-(--dash-purple-50) text-(--dash-purple-700)",
  Holiday: "bg-(--dash-orange-50) text-(--dash-orange-700)",
}

const timeOffStatus = {
  Pending: { dot: "bg-state-warning-base", text: "text-state-warning-base" },
  Confirmed: { dot: "bg-state-success-base", text: "text-state-success-base" },
  Rejected: { dot: "bg-state-error-base", text: "text-state-error-base" },
}

export function HrDashboard({
  userName = "Sophia",
  date = "February 04, 2024",
  absent = defaultAbsent,
  away = defaultAway,
  schedule = defaultSchedule,
  timeOff = defaultTimeOff,
  className,
}: HrDashboardProps) {
  const timeOffUsed = 10
  const timeOffTotal = 20
  const timeOffPct = Math.round((timeOffUsed / timeOffTotal) * 100)

  return (
    <div className={cn("space-y-6", className)}>
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-sm text-text-sub-600 mt-1">
            {date} — You have 2 meetings and 1 events today 🗓️
          </p>
        </div>
        <div className="flex gap-2">
          <Button tone="neutral" style="stroke">
            <CalendarIcon className="size-4" /> Schedule
          </Button>
          <Button tone="primary" style="filled">
            <Plus className="size-4" /> Create Request
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Tracker */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Status Tracker</CardTitle>
            <Button tone="neutral" style="ghost" size="sm">See All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <section>
              <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400 mb-2">
                Absent
              </div>
              <ul className="space-y-3">
                {absent.map((u) => (
                  <li key={u.id} className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>{u.initials ?? u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-strong-950 truncate">{u.name}</div>
                      <div className="text-xs text-text-sub-600 truncate">
                        {u.reason ? `🧠 Replaced by ${u.replacedBy}` : u.team}
                      </div>
                    </div>
                    <span className="text-xs text-text-soft-400">{u.duration}</span>
                  </li>
                ))}
              </ul>
            </section>

            <Divider />

            <section>
              <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400 mb-2">
                Away
              </div>
              <ul className="space-y-3">
                {away.map((u) => (
                  <li key={u.id} className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>{u.initials ?? u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-strong-950 truncate">{u.name}</div>
                      <div className="text-xs text-text-sub-600">{u.team}</div>
                    </div>
                    <span className="text-xs text-text-soft-400">{u.duration}</span>
                  </li>
                ))}
              </ul>
            </section>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Notes</CardTitle>
            <Button tone="neutral" style="ghost" size="sm">
              <Plus className="size-3.5" /> Add Note
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <article className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge appearance="lighter" status="information">Today</Badge>
                <Badge appearance="lighter" status="warning">To-do</Badge>
                <span className="text-xs text-text-soft-400 ml-auto">Aug 03</span>
              </div>
              <div className="text-sm font-medium text-text-strong-950">
                Text Inputs for Design System
              </div>
              <p className="text-xs text-text-sub-600 leading-relaxed">
                Search for inspiration to provide a rich content of text inputs for the design system.
              </p>
            </article>

            <Divider />

            <article className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge appearance="lighter" status="feature">Meeting</Badge>
                <span className="text-xs text-text-soft-400 ml-auto">Aug 02</span>
              </div>
              <div className="text-sm font-medium text-text-strong-950">
                Meeting with Arthur Taylor
              </div>
              <p className="text-xs text-text-sub-600 leading-relaxed">
                Discuss the MVP version of Apex Mobile and Desktop app.
              </p>
            </article>

            <Divider />

            <article className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge appearance="lighter" status="error">Important</Badge>
                <span className="text-xs text-text-soft-400 ml-auto">Aug 01</span>
              </div>
              <div className="text-sm font-medium text-text-strong-950">
                Check neutral and state colors
              </div>
              <p className="text-xs text-text-sub-600 leading-relaxed">
                Button components will be revised and designed again due to a few errors.
              </p>
            </article>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>January 2024 · Today</CardDescription>
            </div>
            <Button tone="neutral" style="ghost" size="sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {/* week strip */}
            <div className="px-6 pb-3 grid grid-cols-5 gap-1 text-center text-xs">
              {[
                { d: "Fri", n: "31" },
                { d: "Sat", n: "01" },
                { d: "Sun", n: "02" },
                { d: "Mon", n: "03", active: true },
                { d: "Tue", n: "04" },
              ].map((d) => (
                <div
                  key={d.n}
                  className={cn(
                    "rounded-lg py-1.5",
                    d.active
                      ? "bg-(--primary-base) text-text-white-0"
                      : "text-text-sub-600",
                  )}
                >
                  <div className="text-[10px] uppercase tracking-wider opacity-80">{d.d}</div>
                  <div className="font-semibold mt-0.5">{d.n}</div>
                </div>
              ))}
            </div>

            <Divider />

            <ul className="divide-y divide-stroke-soft-200">
              {schedule.map((ev) => (
                <li key={ev.id} className="px-6 py-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md",
                        tagStyle[ev.tag],
                      )}
                    >
                      {ev.tag}
                    </span>
                    {ev.attendeesExtra ? (
                      <span className="text-xs text-text-soft-400">
                        +{ev.attendeesExtra}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm font-medium text-text-strong-950">{ev.title}</div>
                  <div className="flex items-center gap-2 text-xs text-text-sub-600">
                    <Clock className="size-3" /> {ev.time}
                    {ev.via ? (
                      <>
                        <span aria-hidden>·</span>
                        <Video className="size-3" /> {ev.via}
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Off */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Time Off</CardTitle>
            <Button tone="neutral" style="ghost" size="sm">See All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-text-strong-950">
                  {timeOffUsed}
                </span>
                <span className="text-sm text-text-soft-400 uppercase tracking-wider">
                  out of {timeOffTotal}
                </span>
              </div>
              <ProgressBar value={timeOffPct} className="mt-3" />
            </div>

            <Divider />

            <ul className="space-y-2.5">
              {timeOff.map((r) => {
                const s = timeOffStatus[r.type]
                return (
                  <li key={r.id} className="flex items-center gap-2.5 text-sm">
                    <span className={cn("size-2 rounded-full shrink-0", s.dot)} />
                    <span className="flex-1 text-text-strong-950 truncate">{r.label}</span>
                    <span className={cn("text-xs font-medium", s.text)}>{r.type}</span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        {/* Current Project */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Project</CardTitle>
              <CardDescription>Monday.com Redesign</CardDescription>
            </div>
            <Button tone="neutral" style="stroke" size="sm">
              Open <ChevronRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Tasks", value: "84", tone: "text-text-strong-950" },
                { label: "In progress", value: "23", tone: "text-(--dash-blue-600)" },
                { label: "Completed", value: "47", tone: "text-state-success-base" },
                { label: "Blocked", value: "3", tone: "text-state-error-base" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-stroke-soft-200 px-4 py-3"
                >
                  <div className="text-xs text-text-sub-600">{m.label}</div>
                  <div className={cn("text-xl font-semibold tracking-tight mt-0.5", m.tone)}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-stroke-soft-200 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-text-strong-950">Sprint progress</span>
                <span className="text-text-sub-600">68%</span>
              </div>
              <ProgressBar value={68} />
              <div className="flex items-center gap-2 text-xs text-text-sub-600">
                <CheckCircle2 className="size-3.5 text-state-success-base" />
                47 of 70 tasks shipped this sprint
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
