"use client"

import * as React from "react"
import {
  RiCalendarLine,
  RiDiscussLine,
  RiCalendarEventLine,
  RiSuitcase2Line,
  RiSearch2Line,
  RiFilter3Fill,
  RiMapPin2Fill,
  RiUser6Fill,
  RiArrowDownSLine,
  RiAddLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/registry/dash/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import type { Status } from "@/registry/dash/ui/badge"
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
 * HR Widget — Schedule. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-schedule.tsx
 *
 * 3 tabs — Meetings (people + platform), Events (location + quota), Holiday (emoji + break badge).
 */
type Meeting = {
  id: string
  title: string
  date: string
  platform: string
  people: { alt: string; img: string; initials: string }[]
  badge: { label: string; status: Status }
}

type EventItem = {
  id: string
  title: string
  date: string
  location: string
  by: string
  quota: { current: number; max: number }
}

type Holiday = {
  id: string
  title: string
  date: string
  message: string
  emoji: string
  category: string
  badge: { label: string; status: Status }
}

const MEETINGS: Meeting[] = [
  {
    id: "1",
    title: "Meeting with James Brown",
    date: "8:00 - 8:45 AM (UTC)",
    platform: "On Google Meet",
    people: [
      { alt: "Emma", img: "/images/avatar/illustration/emma.png", initials: "EW" },
      { alt: "Sophia", img: "/images/avatar/illustration/sophia.png", initials: "SW" },
      { alt: "James", img: "/images/avatar/illustration/james.png", initials: "JB" },
      { alt: "Arthur", img: "/images/avatar/illustration/arthur.png", initials: "AT" },
      { alt: "Wei", img: "/images/avatar/illustration/wei.png", initials: "WC" },
    ],
    badge: { label: "Marketing", status: "warning" },
  },
  {
    id: "2",
    title: "Meeting with Laura Perez",
    date: "9:00 - 9:45 AM (UTC)",
    platform: "On Zoom",
    people: [
      { alt: "James", img: "/images/avatar/illustration/james.png", initials: "JB" },
      { alt: "Arthur", img: "/images/avatar/illustration/arthur.png", initials: "AT" },
      { alt: "Sophia", img: "/images/avatar/illustration/sophia.png", initials: "SW" },
      { alt: "Emma", img: "/images/avatar/illustration/emma.png", initials: "EW" },
      { alt: "Wei", img: "/images/avatar/illustration/wei.png", initials: "WC" },
    ],
    badge: { label: "Product Manager", status: "information" },
  },
  {
    id: "3",
    title: "Meeting with Arthur Taylor",
    date: "10:00 - 11:00 AM (UTC)",
    platform: "On Slack",
    people: [
      { alt: "Wei", img: "/images/avatar/illustration/wei.png", initials: "WC" },
      { alt: "Emma", img: "/images/avatar/illustration/emma.png", initials: "EW" },
      { alt: "Arthur", img: "/images/avatar/illustration/arthur.png", initials: "AT" },
      { alt: "Sophia", img: "/images/avatar/illustration/sophia.png", initials: "SW" },
      { alt: "James", img: "/images/avatar/illustration/james.png", initials: "JB" },
    ],
    badge: { label: "Partnership", status: "feature" },
  },
]

const EVENTS: EventItem[] = [
  { id: "1", title: "Tesla 4th year Celebration Party", date: "7:00 - 11:00 PM (UTC)", location: "341 Windy Ridge Road, LA", by: "by Sofia Williams", quota: { current: 16, max: 25 } },
  { id: "2", title: "Designing Camp for AlignUI", date: "9:00 AM - 10:00 PM (UTC)", location: "928 Bagwell Avenue, FL", by: "by Matthew Johnson", quota: { current: 12, max: 15 } },
  { id: "3", title: "AlignUI Launch Party", date: "8:00 - 12:00 PM (UTC)", location: "148 Harley Brook Lane, VA", by: "by Emma Wright", quota: { current: 25, max: 40 } },
]

const HOLIDAYS: Holiday[] = [
  { id: "1", title: "Christmas Holiday", date: "DEC 25 - DEC 27", message: "Happy Christmas!", emoji: "🎄", category: "Religious Holiday", badge: { label: "2-days break", status: "feature" } },
  { id: "2", title: "Woman's Day", date: "MAR 08", message: "Happy Women's Day!", emoji: "🌸", category: "International Holiday", badge: { label: "1-day break", status: "highlighted" } },
  { id: "3", title: "Workers' Day", date: "MAY 01", message: "Happy Workers' Day!", emoji: "🧑‍💻", category: "International Holiday", badge: { label: "1-day break", status: "warning" } },
]

const PIN_COLORS = ["text-(--state-error-base)", "text-(--state-verified-base)", "text-(--state-success-base)"]
const DAYS = ["MON 28", "TUE 29", "WED 30", "THU 31", "FRI 01", "SAT 02", "SUN 03"]

export default function HRScheduleWidgetPage() {
  const [day, setDay] = React.useState(3)
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Schedule"
        description="Weekly planner. Horizontal day picker + search + 3-tab segmented (Meetings / Events / Holiday). Each tab renders an accordion list of cards."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Meetings tab — 3 entries"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiCalendarLine className="size-4 text-icon-sub-600" /> Schedule</>}
                action={<Button tone="neutral" style="stroke" size="xs">See All</Button>}
              >
                <DayPicker value={day} onChange={setDay} />
                <SearchInput />
                <ScheduleTabs />
              </WidgetShell>
            </div>
          }
          code={`<Schedule><DayPicker /><SearchInput /><ScheduleTabs /></Schedule>`}
        />
      </DocsSection>

      <DocsSection title="Day picker">
        <DocsExample
          title="7-day strip"
          preview={<DayPicker value={day} onChange={setDay} />}
          code={`<DayPicker value={day} onChange={setDay} />`}
        />
      </DocsSection>

      <DocsSection title="Meetings tab">
        <DocsExample
          title="Meeting cards (5-avatar stack + platform + badge)"
          preview={
            <div className="space-y-2 max-w-md">
              {MEETINGS.map((m) => <MeetingCard key={m.id} meeting={m} />)}
            </div>
          }
          code={`{MEETINGS.map((m) => <MeetingCard key={m.id} meeting={m} />)}`}
        />
      </DocsSection>

      <DocsSection title="Events tab">
        <DocsExample
          title="Event cards (location + quota)"
          preview={
            <div className="space-y-2 max-w-md">
              {EVENTS.map((e, i) => <EventCard key={e.id} event={e} pin={PIN_COLORS[i % PIN_COLORS.length]} />)}
            </div>
          }
          code={`{EVENTS.map((e) => <EventCard event={e} />)}`}
        />
      </DocsSection>

      <DocsSection title="Holiday tab">
        <DocsExample
          title="Holiday cards (emoji + break badge)"
          preview={
            <div className="space-y-2 max-w-md">
              {HOLIDAYS.map((h) => <HolidayCard key={h.id} holiday={h} />)}
            </div>
          }
          code={`{HOLIDAYS.map((h) => <HolidayCard holiday={h} />)}`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No meetings yet"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiCalendarLine className="size-4 text-icon-sub-600" /> Schedule</>}>
                <div className="flex flex-col items-center justify-center gap-4 py-14">
                  <EmptyStateIllustration kind="schedule-meetings" />
                  <p className="text-center text-sm text-text-soft-400">
                    No records of meetings yet.<br /> Please check back later.
                  </p>
                  <Button tone="neutral" style="stroke" size="xs" leftIcon={<RiAddLine className="size-3.5" />}>Request</Button>
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
            { name: "selectedDay", type: "number", description: "Index 0-6 into the visible day strip." },
            { name: "meetings[]", type: "Meeting[]", description: "Title, date range, platform, people stack, badge." },
            { name: "events[]", type: "Event[]", description: "Title, date, location, organiser, quota." },
            { name: "holidays[]", type: "Holiday[]", description: "Title, date, emoji, category, break-length badge." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>DayPicker</strong> — 7 columns. Active = primary disc + white text, inactive = stroke pill.</li>
          <li><strong>Search</strong> — medium Input + Cmd1 kbd + filter button.</li>
          <li><strong>Tabs</strong> — 3 horizontal tabs with leading icon and equal flex.</li>
          <li><strong>Card</strong> — bg-weak-50 rounded-xl, accordion chevron, content slot reveals avatars/location/etc.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function ScheduleTabs() {
  return (
    <Tabs defaultValue="meetings">
      <TabsList variant="line" className="w-full grid grid-cols-3 mt-2">
        <TabsTrigger value="meetings"><RiDiscussLine className="size-4 mr-1" />Meetings</TabsTrigger>
        <TabsTrigger value="events"><RiCalendarEventLine className="size-4 mr-1" />Events</TabsTrigger>
        <TabsTrigger value="holidays"><RiSuitcase2Line className="size-4 mr-1" />Holiday</TabsTrigger>
      </TabsList>
      <TabsContent value="meetings" className="space-y-2 pt-4">
        {MEETINGS.map((m) => <MeetingCard key={m.id} meeting={m} />)}
      </TabsContent>
      <TabsContent value="events" className="space-y-2 pt-4">
        {EVENTS.map((e, i) => <EventCard key={e.id} event={e} pin={PIN_COLORS[i % PIN_COLORS.length]} />)}
      </TabsContent>
      <TabsContent value="holidays" className="space-y-2 pt-4">
        {HOLIDAYS.map((h) => <HolidayCard key={h.id} holiday={h} />)}
      </TabsContent>
    </Tabs>
  )
}

function DayPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {DAYS.map((d, i) => {
        const [dow, num] = d.split(" ")
        const active = i === value
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg py-2 text-xs transition-colors",
              active
                ? "bg-primary text-static-white"
                : "border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50",
            )}
          >
            <span className={cn("text-[10px] uppercase", active ? "text-static-white/80" : "text-text-soft-400")}>{dow}</span>
            <span className="text-sm font-medium tabular-nums">{num}</span>
          </button>
        )
      })}
    </div>
  )
}

function SearchInput() {
  return (
    <div className="py-4">
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0">
        <RiSearch2Line className="size-4 text-text-soft-400" />
        <span className="flex-1 text-sm text-text-soft-400">Search...</span>
        <kbd className="text-[10px] px-1 rounded bg-bg-weak-50 border border-stroke-soft-200">⌘ 1</kbd>
        <button type="button" aria-label="Filter">
          <RiFilter3Fill className="size-5 text-text-soft-400" />
        </button>
      </div>
    </div>
  )
}

function CardShell({ title, date, right, children }: { title: string; date: string; right?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-bg-weak-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-text-strong-950">{title}</div>
          <div className="text-xs text-text-sub-600 uppercase tracking-wide">{date}</div>
        </div>
        {right}
      </div>
      {children && <div className="pt-3.5">{children}</div>}
    </div>
  )
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <CardShell
      title={meeting.title}
      date={meeting.date}
      right={
        <button className="size-6 rounded-full bg-bg-white-0 inline-flex items-center justify-center" aria-label="Toggle">
          <RiArrowDownSLine className="size-4 text-text-sub-600" />
        </button>
      }
    >
      <div className="space-y-3.5">
        <AvatarGroup size="xs" spacing="tight">
          {meeting.people.slice(0, 3).map((p) => (
            <Avatar key={p.alt}><AvatarImage src={p.img} /><AvatarFallback>{p.initials}</AvatarFallback></Avatar>
          ))}
          {meeting.people.length > 3 && <AvatarGroupCount value={meeting.people.length - 3} />}
        </AvatarGroup>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-sub-600">{meeting.platform}</span>
          <Badge status={meeting.badge.status} appearance="lighter">{meeting.badge.label}</Badge>
        </div>
      </div>
    </CardShell>
  )
}

function EventCard({ event, pin }: { event: EventItem; pin: string }) {
  return (
    <CardShell
      title={event.title}
      date={event.date}
      right={
        <button className="size-6 rounded-full bg-bg-white-0 inline-flex items-center justify-center" aria-label="Toggle">
          <RiArrowDownSLine className="size-4 text-text-sub-600" />
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-bg-white-0 border border-stroke-soft-200">
            <RiMapPin2Fill className={cn("size-4", pin)} />
          </div>
          <div className="text-sm text-text-strong-950">{event.location}</div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-sub-600">{event.by}</span>
          <div className="flex items-center gap-1 text-xs text-text-sub-600">
            <RiUser6Fill className="size-4" />
            {event.quota.current}/{event.quota.max}
          </div>
        </div>
      </div>
    </CardShell>
  )
}

function HolidayCard({ holiday }: { holiday: Holiday }) {
  return (
    <div className="space-y-4 rounded-xl bg-bg-weak-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-text-strong-950">{holiday.title}</div>
          <div className="text-xs text-text-sub-600 uppercase tracking-wide">{holiday.date}</div>
        </div>
        <Badge status={holiday.badge.status} appearance="lighter">{holiday.badge.label}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-bg-white-0 text-sm border border-stroke-soft-200">{holiday.emoji}</div>
        <div className="text-sm text-text-strong-950">{holiday.message}</div>
      </div>
      <div className="text-xs text-text-sub-600">{holiday.category}</div>
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
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm space-y-3", className)}>
      <div className="flex items-center gap-2 h-9">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}
