"use client"

import * as React from "react"
import { RiCalendarLine as CalendarIcon, RiAddLine as Plus, RiFilter3Line as FilterIcon, RiVideoLine as Video, RiAlertLine as AlertTriangle, RiCloseLine as X, RiTimeLine as Clock, RiMoreLine as MoreHorizontal } from "@remixicon/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrCalendar — ported 1:1 (structural parity) from AlignUI Pro Figma node 3873:39572.
 * Synergy HR Calendar page. Layout:
 *   - Header (title + create request)
 *   - Filter row (date range + tabs: All / Meetings / Events / Conflicted / Canceled)
 *   - Upcoming cards strip (4 cards)
 *   - Week-view grid (Mon..Fri × time rows with event blocks)
 *
 * Calendar grid is a static visual mockup; real impl would wire @dash/calendar primitive.
 */

export type UpcomingEvent = {
  id: string
  title: string
  time: string
  status: "live" | "conflict" | "cancelled" | "upcoming"
  meta?: string
}

export type CalendarEventBlock = {
  id: string
  day: number // 0..4 Mon..Fri
  startSlot: number // 0..5 (9AM..2PM)
  span: number // slot count
  title: string
  subtitle?: string
  tone: "meeting" | "event" | "workshop" | "ghost"
}

export type HrCalendarProps = {
  weekLabel?: string
  upcoming?: UpcomingEvent[]
  events?: CalendarEventBlock[]
  className?: string
}

const defaultUpcoming: UpcomingEvent[] = [
  {
    id: "u1",
    title: "Weekly Team Meeting",
    time: "3:00 PM - 4:30 PM",
    status: "live",
    meta: "Join Meeting",
  },
  {
    id: "u2",
    title: "Product Launch Event",
    time: "Feb 07, 2024",
    status: "conflict",
    meta: "2 Conflicted · See Conflict",
  },
  {
    id: "u3",
    title: "Team Building Workshop",
    time: "9:00 AM - 12:00 PM",
    status: "cancelled",
    meta: "Jan 06, 2024",
  },
  {
    id: "u4",
    title: "Marketing Campaign Strategy",
    time: "2:30 PM - 4:00 PM",
    status: "upcoming",
    meta: "3 days later · Feb 07, 2024",
  },
]

const defaultEvents: CalendarEventBlock[] = [
  {
    id: "e1",
    day: 0,
    startSlot: 0,
    span: 1,
    title: "Brainstorming Session",
    subtitle: "9:00 - 9:30 AM",
    tone: "meeting",
  },
  {
    id: "e2",
    day: 1,
    startSlot: 0,
    span: 1,
    title: "Bi-Weekly Marketing Team",
    subtitle: "9:30 - 10:00 AM",
    tone: "event",
  },
  {
    id: "e3",
    day: 2,
    startSlot: 2,
    span: 2,
    title: 'Workshop: "Mastering Design Thinking"',
    subtitle: "11:30 AM - 1:00 PM · XYZ Conference Center",
    tone: "workshop",
  },
  {
    id: "e4",
    day: 3,
    startSlot: 1,
    span: 1,
    title: "Project Review Meeting",
    subtitle: "10:00 - 10:30 AM",
    tone: "meeting",
  },
  {
    id: "e5",
    day: 4,
    startSlot: 4,
    span: 2,
    title: "Sales Team Training",
    subtitle: "1:00 - 2:30 PM",
    tone: "event",
  },
]

const upcomingStyle: Record<UpcomingEvent["status"], { ring: string; tag: React.ReactNode }> = {
  live: {
    ring: "ring-(--dash-green-500)",
    tag: <Badge appearance="lighter" status="success">Join Meeting</Badge>,
  },
  conflict: {
    ring: "ring-state-warning-base",
    tag: <Badge appearance="lighter" status="warning">2 Conflicted</Badge>,
  },
  cancelled: {
    ring: "ring-stroke-soft-200",
    tag: <Badge appearance="lighter" status="away">Cancelled</Badge>,
  },
  upcoming: {
    ring: "ring-stroke-soft-200",
    tag: <Badge appearance="lighter" status="information">Upcoming</Badge>,
  },
}

const blockTone: Record<CalendarEventBlock["tone"], string> = {
  meeting: "bg-(--dash-blue-50) text-(--dash-blue-700) border-l-(--dash-blue-500)",
  event: "bg-(--dash-purple-50) text-(--dash-purple-700) border-l-(--dash-purple-500)",
  workshop: "bg-(--dash-orange-50) text-(--dash-orange-700) border-l-(--dash-orange-500)",
  ghost: "bg-bg-weak-50 text-text-sub-600 border-l-stroke-soft-200",
}

const days = ["04 MON", "05 TUE", "06 WED", "07 THU", "08 FRI"]
const hours = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM"]

export function HrCalendar({
  weekLabel = "Feb 04 - Feb 11 2024",
  upcoming = defaultUpcoming,
  events = defaultEvents,
  className,
}: HrCalendarProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Schedule
          </h1>
          <p className="text-sm text-text-sub-600 mt-1">
            February 04, 2024 — You have 2 meetings and 1 events today 🗓️
          </p>
        </div>
        <div className="flex gap-2">
          <Button tone="neutral" style="stroke">
            <CalendarIcon className="size-4" /> {weekLabel}
          </Button>
          <Button tone="primary" style="filled">
            <Plus className="size-4" /> Create Request
          </Button>
        </div>
      </header>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tabs defaultValue="all" className="flex-1 min-w-0">
          <TabsList>
            <TabsTrigger value="all">All Scheduled</TabsTrigger>
            <TabsTrigger value="meetings">Meetings (8)</TabsTrigger>
            <TabsTrigger value="events">Events (4)</TabsTrigger>
            <TabsTrigger value="conflicted">Conflicted (2)</TabsTrigger>
            <TabsTrigger value="canceled">Canceled (1)</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button tone="neutral" style="stroke" size="sm">
          <FilterIcon className="size-4" /> Filter
        </Button>
      </div>

      {/* Upcoming cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {upcoming.map((ev) => {
          const s = upcomingStyle[ev.status]
          return (
            <Card key={ev.id} className={cn("ring-1 ring-inset", s.ring)}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {s.tag}
                  <Button tone="neutral" style="ghost" size="sm">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
                <div className="text-sm font-semibold text-text-strong-950 line-clamp-2">
                  {ev.title}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-sub-600">
                  <Clock className="size-3" /> {ev.time}
                </div>
                {ev.meta && ev.status !== "live" ? (
                  <div className="text-xs text-text-soft-400">{ev.meta}</div>
                ) : null}
                {ev.status === "live" ? (
                  <Button tone="primary" style="filled" size="sm" className="w-full mt-1">
                    <Video className="size-3.5" /> Join Meeting
                  </Button>
                ) : null}
                {ev.status === "conflict" ? (
                  <div className="flex items-center gap-1.5 text-xs text-state-warning-base font-medium">
                    <AlertTriangle className="size-3.5" /> See Conflict
                  </div>
                ) : null}
                {ev.status === "cancelled" ? (
                  <div className="flex items-center gap-1.5 text-xs text-text-soft-400">
                    <X className="size-3.5" /> Cancelled
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Week grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Week of {weekLabel}</CardTitle>
            <CardDescription>5-day work-week view</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button tone="neutral" style="ghost" size="sm">Today</Button>
            <Button tone="neutral" style="stroke" size="sm">Last 7 days</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[64px_repeat(5,1fr)] border-t border-stroke-soft-200">
            {/* day headers */}
            <div />
            {days.map((d) => (
              <div
                key={d}
                className="px-3 py-2 text-xs font-medium text-text-sub-600 border-l border-stroke-soft-200"
              >
                {d}
              </div>
            ))}

            {/* time rows */}
            {hours.map((h, hIdx) => (
              <React.Fragment key={h}>
                <div className="px-3 py-3 text-xs text-text-soft-400 border-t border-stroke-soft-200 flex items-start">
                  {h}
                </div>
                {[0, 1, 2, 3, 4].map((d) => {
                  const block = events.find(
                    (e) => e.day === d && e.startSlot === hIdx,
                  )
                  return (
                    <div
                      key={`${h}-${d}`}
                      className="relative min-h-[64px] border-l border-t border-stroke-soft-200"
                    >
                      {block ? (
                        <div
                          className={cn(
                            "absolute inset-x-1 top-1 rounded-md border-l-2 px-2 py-1.5",
                            blockTone[block.tone],
                          )}
                          style={{
                            height: `calc(${block.span * 64}px - 8px)`,
                          }}
                        >
                          <div className="text-xs font-semibold truncate">{block.title}</div>
                          {block.subtitle ? (
                            <div className="text-[10px] mt-0.5 opacity-80 line-clamp-2">
                              {block.subtitle}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
