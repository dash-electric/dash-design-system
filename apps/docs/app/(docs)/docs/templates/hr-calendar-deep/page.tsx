"use client"

import * as React from "react"
import {
  RiCalendarLine,
  RiAddLine,
  RiCalendarScheduleLine,
  RiArrowDownSLine,
  RiSearch2Line,
  RiFilter3Fill,
  RiSettings2Line,
  RiLayoutGridLine,
  RiDiscussLine,
  RiCalendarEventLine,
  RiSpamLine,
  RiCloseCircleLine,
  RiTimeFill,
  RiSpamFill,
  RiVideoLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { Divider } from "@/registry/dash/ui/divider"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Kbd } from "@/registry/dash/ui/kbd"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/registry/dash/ui/tabs"
import { cn } from "@/registry/dash/lib/utils"
import {
  HrAppShell,
  HrHeader,
} from "@/registry/dash/templates/_internal/hr-app-shell"

/* -------------------------------------------------------------------------- *
 *  HR Calendar (Deep) — Synergy HR Big Calendar page                         *
 *  Mirrors `template-hr-master/app/(main)/calendar/{page,filters,tabs}.tsx`. *
 *  Layout:                                                                   *
 *    Header (Feb 04, 2024 · 2 meetings, 1 event)                             *
 *    Filters row (Today + Last 7 days + date range + search + filter + cog) *
 *    Tabs row (All Scheduled · Meetings (8) · Events (4) ·                  *
 *              Conflicted (2) · Canceled (1)) with 4 event cards            *
 *    Big Calendar: Mon Nov 04 – Sun Nov 10 week view, 9 AM – 1 PM rows,     *
 *      event blocks w/ verbatim source titles + attendees + Zoom/Meet tags  *
 * -------------------------------------------------------------------------- */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

function CalendarFilters() {
  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-3">
      <div className="flex gap-3">
        <Button size="sm" style="stroke" tone="neutral">
          Today
        </Button>
        <div className="flex items-center overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-sm">
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 px-3 text-text-sub-600 hover:bg-bg-weak-50"
          >
            Last 7 days
            <RiArrowDownSLine className="size-4" />
          </button>
          <span className="h-9 w-px bg-stroke-soft-200" />
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 px-3 text-text-sub-600 hover:bg-bg-weak-50"
          >
            <RiCalendarLine className="size-4" />
            Feb 04 - Feb 11 2024
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <InputRoot size="sm" className="w-[300px]">
          <InputIcon>
            <RiSearch2Line className="size-4" />
          </InputIcon>
          <Input placeholder="Search…" />
          <Kbd size="sm">⌘1</Kbd>
        </InputRoot>
        <Button size="sm" style="stroke" tone="neutral">
          <RiFilter3Fill className="size-4" />
          Filter
        </Button>
        <Button size="sm" style="stroke" tone="neutral">
          <RiSettings2Line className="size-4" />
        </Button>
      </div>
    </div>
  )
}

const upcomingEvents = [
  {
    title: "Weekly Team Meeting",
    time: "3:00 PM - 4:30 PM",
    status: "success" as const,
    text: "Today",
    cta: "Join Meeting",
    Icon: RiTimeFill,
  },
  {
    title: "Product Launch Event",
    time: "3:00 PM - 4:30 PM",
    status: "warning" as const,
    text: "2 Conflicted",
    cta: "See Conflict",
    Icon: RiSpamFill,
  },
  {
    title: "Team Building Workshop",
    time: "9:00 AM - 12:00 PM",
    status: "error" as const,
    text: "Cancelled",
    date: "Jan 06, 2024",
    Icon: RiTimeFill,
  },
  {
    title: "Marketing Campaign Strategy",
    time: "2:30 PM - 4:00 PM",
    status: "neutral" as const,
    text: "3 days later",
    date: "Jan 06, 2024",
    Icon: RiTimeFill,
  },
]

function EventItem({
  event,
}: {
  event: (typeof upcomingEvents)[number]
}) {
  const Icon = event.Icon
  return (
    <div className="flex w-[264px] shrink-0 flex-col rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200">
      <div className="text-sm font-medium text-text-strong-950">
        {event.title}
      </div>
      <div className="mt-1 text-xs text-text-sub-600">{event.time}</div>
      <div
        className={cn(
          "-mx-2 -mb-2 mt-3 flex items-center gap-1.5 rounded-lg p-2 pr-3",
          event.status === "success" && "bg-(--state-success-lighter)",
          event.status === "warning" && "bg-(--state-warning-lighter)",
          event.status === "error" && "bg-(--state-error-lighter)",
          event.status === "neutral" && "bg-bg-weak-50",
        )}
      >
        <Icon
          className={cn(
            "size-4",
            event.status === "success" && "text-(--state-success-base)",
            event.status === "warning" && "text-(--state-warning-base)",
            event.status === "error" && "text-(--state-error-base)",
            event.status === "neutral" && "text-text-sub-600",
          )}
        />
        <div className="flex-1 text-xs font-medium text-text-strong-950">
          {event.text}
        </div>
        {event.cta ? (
          <LinkButton size="sm" tone="muted" underline="always">
            {event.cta}
          </LinkButton>
        ) : null}
        {event.date ? (
          <span className="text-xs text-text-sub-600">{event.date}</span>
        ) : null}
      </div>
    </div>
  )
}

function CalendarTabs() {
  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="relative">
        <TabsList className="flex w-full gap-6 overflow-x-auto border-b border-stroke-soft-200">
          <TabsTrigger value="all" variant="line">
            <RiLayoutGridLine className="size-4" />
            All Scheduled
          </TabsTrigger>
          <TabsTrigger value="meetings" variant="line">
            <RiDiscussLine className="size-4" />
            Meetings (8)
          </TabsTrigger>
          <TabsTrigger value="events" variant="line">
            <RiCalendarEventLine className="size-4" />
            Events (4)
          </TabsTrigger>
          <TabsTrigger value="conflicted" variant="line">
            <RiSpamLine className="size-4" />
            Conflicted (2)
          </TabsTrigger>
          <TabsTrigger value="canceled" variant="line">
            <RiCloseCircleLine className="size-4" />
            Canceled (1)
          </TabsTrigger>
        </TabsList>
        <div className="absolute right-0 top-2">
          <CompactButton
            variant="stroke"
            size="md"
            fullRadius
            aria-label="Collapse upcoming events"
          >
            <RiArrowDownSLine className="size-4" />
          </CompactButton>
        </div>
      </div>
      <TabsContent value="all">
        <div className="flex gap-4 overflow-x-auto">
          {upcomingEvents.map((e) => (
            <EventItem key={e.title} event={e} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="meetings">
        <div className="flex gap-4 overflow-x-auto">
          {[upcomingEvents[2], upcomingEvents[0]].map((e) => (
            <EventItem key={e.title} event={e} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="events">
        <div className="flex gap-4 overflow-x-auto">
          {[upcomingEvents[1], upcomingEvents[3]].map((e) => (
            <EventItem key={e.title} event={e} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="conflicted">
        <div className="flex gap-4 overflow-x-auto">
          {[upcomingEvents[2], upcomingEvents[1]].map((e) => (
            <EventItem key={e.title} event={e} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="canceled">
        <div className="flex gap-4 overflow-x-auto">
          <EventItem event={upcomingEvents[2]} />
        </div>
      </TabsContent>
    </Tabs>
  )
}

/* -------------------------------------------------------------------------- *
 *  Big Calendar — week view                                                  *
 *  5 weekdays Mon–Fri (Nov 04 – Nov 08, 2024) + Sat / Sun disabled.         *
 *  9 AM → 1 PM rows. Events placed by relative grid offsets.                *
 * -------------------------------------------------------------------------- */

type EventBlock = {
  dayIdx: number // 0 = Mon ... 4 = Fri
  startMin: number // minutes from 9:00 AM
  durationMin: number
  title: string
  type: "meeting" | "event"
  meta?: string
  people?: number
  link?: string
  disabled?: boolean
}

const events: EventBlock[] = [
  {
    dayIdx: 0,
    startMin: 0,
    durationMin: 15,
    title: "Brainstorming Session",
    type: "meeting",
  },
  {
    dayIdx: 0,
    startMin: 15,
    durationMin: 30,
    title: "Bi-Weekly Marketing Team Meeting",
    type: "meeting",
  },
  {
    dayIdx: 0,
    startMin: 165,
    durationMin: 75,
    title: 'Workshop: "Mastering Design Thinking"',
    type: "event",
    meta: "Venue: XYZ Conference Center",
  },
  {
    dayIdx: 1,
    startMin: 0,
    durationMin: 30,
    title: "Project Review Meeting",
    type: "meeting",
  },
  {
    dayIdx: 1,
    startMin: 60,
    durationMin: 90,
    title: "Sales Team Training Session — Improving Sales Techniques",
    type: "meeting",
    people: 5,
    meta: "on Zoom",
  },
  {
    dayIdx: 1,
    startMin: 180,
    durationMin: 30,
    title: "Quarterly Financial Review — Analyzing Revenue Growth",
    type: "meeting",
  },
  {
    dayIdx: 1,
    startMin: 210,
    durationMin: 30,
    title: "Sales Performance Review",
    type: "meeting",
  },
  {
    dayIdx: 2,
    startMin: 30,
    durationMin: 30,
    title: "Marketing Strategy Discussion",
    type: "meeting",
  },
  {
    dayIdx: 2,
    startMin: 120,
    durationMin: 30,
    title: "Strategy Planning for Company Expansion",
    type: "meeting",
  },
  {
    dayIdx: 2,
    startMin: 150,
    durationMin: 90,
    title: "New Feature Implementation and Roadmap Discussion",
    type: "meeting",
    people: 4,
    meta: "on Zoom",
  },
  {
    dayIdx: 3,
    startMin: 0,
    durationMin: 60,
    title: "Customer Feedback Analysis",
    type: "meeting",
    people: 4,
    meta: "on Meet",
  },
  {
    dayIdx: 3,
    startMin: 150,
    durationMin: 90,
    title: 'Webinar: "Digital Marketing Trends for 2023"',
    type: "event",
    link: "www.examplewebinar.com",
  },
  {
    dayIdx: 4,
    startMin: 0,
    durationMin: 300,
    title: "",
    type: "meeting",
    disabled: true,
  },
]

function BigCalendar() {
  const dayLabels = [
    { name: "Mon", num: "04" },
    { name: "Tue", num: "05" },
    { name: "Wed", num: "06" },
    { name: "Thu", num: "07" },
    { name: "Fri", num: "08" },
  ]
  const hours = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM"]
  const SLOT_HEIGHT = 64 // px per hour
  const PX_PER_MIN = SLOT_HEIGHT / 60

  return (
    <div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0">
      {/* Header row */}
      <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-stroke-soft-200 bg-bg-weak-50/60">
        <div className="flex items-center justify-center border-r border-stroke-soft-200 py-3 text-xs text-text-soft-400">
          GMT+02
        </div>
        {dayLabels.map((d) => (
          <div
            key={d.name}
            className="flex items-center justify-center gap-2 border-r border-stroke-soft-200 py-3 last:border-r-0"
          >
            <span className="text-xs uppercase text-text-soft-400">
              {d.name}
            </span>
            <span className="text-sm font-semibold text-text-strong-950">
              {d.num}
            </span>
          </div>
        ))}
      </div>
      {/* Hours grid */}
      <div className="relative grid grid-cols-[80px_repeat(5,1fr)]">
        {/* Gutter labels */}
        <div className="flex flex-col">
          {hours.map((h) => (
            <div
              key={h}
              style={{ height: SLOT_HEIGHT }}
              className="flex justify-end border-r border-t border-stroke-soft-200 px-2 pt-1 text-[10px] text-text-soft-400 first:border-t-0"
            >
              {h}
            </div>
          ))}
        </div>
        {/* Day columns */}
        {dayLabels.map((_, dayIdx) => (
          <div
            key={dayIdx}
            className="relative border-r border-stroke-soft-200 last:border-r-0"
            style={{ height: hours.length * SLOT_HEIGHT }}
          >
            {hours.map((_, hi) => (
              <div
                key={hi}
                style={{ height: SLOT_HEIGHT }}
                className="border-t border-stroke-soft-200 first:border-t-0"
              />
            ))}
            {events
              .filter((e) => e.dayIdx === dayIdx)
              .map((e, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute inset-x-1 overflow-hidden rounded-md px-2 py-1 text-[11px] leading-tight ring-1",
                    e.disabled &&
                      "bg-bg-weak-50/60 ring-stroke-soft-200 [background-image:repeating-linear-gradient(135deg,transparent,transparent_6px,var(--stroke-soft-200)_6px,var(--stroke-soft-200)_7px)]",
                    !e.disabled &&
                      e.type === "meeting" &&
                      "bg-(--dash-purple-50) text-(--dash-purple-700) ring-(--dash-purple-200)",
                    !e.disabled &&
                      e.type === "event" &&
                      "bg-(--state-information-lighter) text-(--state-information-dark) ring-(--state-information-light)",
                  )}
                  style={{
                    top: e.startMin * PX_PER_MIN,
                    height: Math.max(e.durationMin * PX_PER_MIN - 2, 18),
                  }}
                >
                  {e.disabled ? null : (
                    <>
                      <div className="line-clamp-2 font-medium">{e.title}</div>
                      {e.meta ? (
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] opacity-80">
                          {e.type === "meeting" ? (
                            <RiVideoLine className="size-3" />
                          ) : null}
                          {e.meta}
                        </div>
                      ) : null}
                      {e.people ? (
                        <div className="mt-0.5 flex -space-x-1.5">
                          {Array.from({ length: e.people }).map((_, k) => (
                            <div
                              key={k}
                              className="size-4 rounded-full bg-bg-white-0 ring-2 ring-bg-white-0"
                              style={{
                                background: [
                                  "var(--dash-blue-200)",
                                  "var(--dash-yellow-200)",
                                  "var(--dash-purple-200)",
                                  "var(--dash-pink-200)",
                                  "var(--dash-red-200)",
                                ][k % 5],
                              }}
                            />
                          ))}
                        </div>
                      ) : null}
                      {e.link ? (
                        <div className="mt-0.5 text-[10px] underline opacity-80">
                          {e.link}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function HrCalendarPreview() {
  return (
    <HrAppShell active="calendar">
      <HrHeader
        icon={
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
            <RiCalendarLine className="size-6 text-text-sub-600" />
          </div>
        }
        title="February 04, 2024"
        description="You have 2 meetings and 1 events today 🗓️"
        actions={
          <>
            <Button style="stroke" tone="neutral" size="sm">
              <RiCalendarScheduleLine className="size-4" />
              Schedule
            </Button>
            <Button size="sm">
              <RiAddLine className="size-4" />
              Create Request
            </Button>
          </>
        }
      />
      <div className="px-8">
        <Divider />
      </div>
      <div className="flex flex-col gap-5 px-8 pb-8 pt-4">
        <CalendarFilters />
        <CalendarTabs />
        <BigCalendar />
      </div>
    </HrAppShell>
  )
}

export default function HrCalendarDeepDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR"
        title="HR Calendar (Deep)"
        description="Synergy HR Calendar page — sticky sidebar + header + Today/Last 7 days filter row + 5 horizontal tabs (All / Meetings / Events / Conflicted / Canceled) with 4 upcoming event cards + full week view (Mon Nov 04 – Fri Nov 08) with 13 event blocks ported verbatim from the source `calendarData` array."
      />

      <DocsSection title="Full preview">
        <DocsTemplatePreview>
          <HrCalendarPreview />
        </DocsTemplatePreview>
      </DocsSection>

      <DocsSection
        title="Anatomy"
        description="Four stacked zones inside the content column. Header is divided from the body by a full-width Divider — the source pattern across Calendar / Teams / Integrations."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Header</strong> — circular calendar-icon avatar + bold date
            "February 04, 2024" + subheading "You have 2 meetings and 1 events
            today 🗓️".
          </li>
          <li>
            <strong>Filter row</strong> — Today button · Last 7 days dropdown + date-range
            button group · Search (⌘1) · Filter · Settings icon.
          </li>
          <li>
            <strong>Tabs strip</strong> — 5 line-tabs with counts; collapsible chevron on the right.
            Tab content is a horizontally-scrolling row of 264px event cards.
          </li>
          <li>
            <strong>Week grid</strong> — 80px hour gutter + 5 day columns (Mon-Fri),
            9 AM – 1 PM (4 hourly rows × 64px). Meetings render purple, events
            information-blue, disabled slots get a hatched pattern.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Button</strong> — Schedule, Create Request, Today, Filter, settings icon-only.</li>
          <li><strong>InputRoot / Input / InputIcon</strong> — search 300px w/ kbd hint.</li>
          <li><strong>Kbd</strong> — ⌘1 search hint.</li>
          <li><strong>Tabs / TabsList / TabsTrigger / TabsContent</strong> — line-tabs with icons.</li>
          <li><strong>CompactButton</strong> — collapse chevron on right of tab row.</li>
          <li><strong>LinkButton</strong> — "Join Meeting" / "See Conflict" inside event cards.</li>
          <li><strong>Divider</strong> — between header and content.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
