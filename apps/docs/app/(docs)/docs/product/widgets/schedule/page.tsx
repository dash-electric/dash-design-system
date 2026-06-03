"use client"

import * as React from "react"
import {
  RiArrowDownSLine as ChevronDown,
  RiMapPinFill as MapPin,
  RiUser3Line as UserI,
  RiChat3Line as VideoChat,
  RiCalendarEventLine as CalendarEvent,
  RiBriefcase4Line as Briefcase,
  RiAddLine as Plus,
} from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { EmptyStateIllustration, type EmptyStateKind } from "@/registry/dash/ui/empty-state-illustration"

/**
 * Schedule widget — Figma 1:1 (12 nodes verified 2026-05-18).
 *   3521:3087    Meeting card — Marketing badge
 *   3521:3088    Meeting card — Product Manager badge
 *   3521:3089    Meeting card — Partnership badge
 *   3521:3163    Event card — Tesla Celebration
 *   3521:3261    Event card — Designing Camp
 *   3521:3297    Event card — AlignUI Launch
 *   3523:3334    Holiday card — Christmas (2-days break)
 *   3524:3372    Holiday card — Woman's Day
 *   3524:3404    Holiday card — Workers' Day
 *   3710:12438   Schedule widget — Meetings tab w/ data
 *   3710:12760   Schedule widget — Events tab w/ data
 *   3710:13026   Schedule widget — Holiday tab w/ data
 */
export default function ScheduleWidgetPage() {
  const [tab, setTab] = React.useState("meetings")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Schedule"
        description="Tabbed agenda widget — Meetings / Events / Holiday. Each tab renders a stack of typed cards (Meeting · Event · Holiday). Falls back to an empty state per tab."
      />

      <DocsSection title="Tabbed widget">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Underline Tabs swap the body between Meetings, Events, and Holiday cards. Figma nodes 3710:12438 + 3710:12760 + 3710:13026.
        </p>
        <DocsExample
          title="3 tabs"
          preview={
            <div className="max-w-sm">
              <WidgetShell title="Schedule" seeAll>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="w-full justify-stretch">
                    <TabsTrigger value="meetings" className="flex-1"><VideoChat className="size-3.5" /> Meetings</TabsTrigger>
                    <TabsTrigger value="events" className="flex-1"><CalendarEvent className="size-3.5" /> Events</TabsTrigger>
                    <TabsTrigger value="holiday" className="flex-1"><Briefcase className="size-3.5" /> Holiday</TabsTrigger>
                  </TabsList>
                  <TabsContent value="meetings" className="space-y-2 pt-2">
                    <MeetingCard title="Meeting with James Brown" time="8:00 - 8:45 AM (UTC)" channel="On Google Meet" avatars={["jb", "lp", "at", "x1", "x2", "x3", "x4"]} badge={{ label: "Marketing", tone: "warning" }} />
                  </TabsContent>
                  <TabsContent value="events" className="space-y-2 pt-2">
                    <EventCard title="Tesla 4th year Celebration Party" time="7:00 - 11:00 PM (UTC)" location="341 Windy Ridge Road, LA" organizer="by Sofia Williams" attendees="16/25" pinTone="error" />
                  </TabsContent>
                  <TabsContent value="holiday" className="space-y-2 pt-2">
                    <HolidayCard title="Christmas Holiday" time="DEC 25 – DEC 27" emoji="🎄" description="Happy Christmas!" subtitle="Religious Holiday" badge={{ label: "2-days break", tone: "purple" }} />
                  </TabsContent>
                </Tabs>
              </WidgetShell>
            </div>
          }
          code={`<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="meetings">Meetings</TabsTrigger>
    <TabsTrigger value="events">Events</TabsTrigger>
    <TabsTrigger value="holiday">Holiday</TabsTrigger>
  </TabsList>
  <TabsContent value="meetings"><MeetingCard ... /></TabsContent>
  <TabsContent value="events"><EventCard ... /></TabsContent>
  <TabsContent value="holiday"><HolidayCard ... /></TabsContent>
</Tabs>`}
        />
      </DocsSection>

      <DocsSection title="Meeting card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Title + UTC time + attendee avatars (max 3 + overflow pill) + channel + colored badge. Figma nodes 3521:3087..3089.
        </p>
        <DocsExample
          title="3 badge tones"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
              <MeetingCard title="Meeting with James Brown" time="8:00 - 8:45 AM (UTC)" channel="On Google Meet" avatars={["jb", "lp", "at", "x1", "x2", "x3", "x4"]} badge={{ label: "Marketing", tone: "warning" }} />
              <MeetingCard title="Meeting with Laura Perez" time="9:00 - 9:45 AM (UTC)" channel="On Zoom" avatars={["lp", "mp", "at", "y1", "y2"]} badge={{ label: "Product Manager", tone: "information" }} />
              <MeetingCard title="Meeting with Arthur Taylor" time="10:00 - 11:00 AM (UTC)" channel="On Slack" avatars={["at", "mj", "lp", "z1", "z2"]} badge={{ label: "Partnership", tone: "purple" }} />
            </div>
          }
          code={`<MeetingCard
  title="Meeting with James Brown"
  time="8:00 - 8:45 AM (UTC)"
  channel="On Google Meet"
  avatars={["jb", "lp", "at"]}
  badge={{ label: "Marketing", tone: "warning" }}
/>`}
        />
      </DocsSection>

      <DocsSection title="Event card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Title + time + location pin + organizer + attendees count. Figma nodes 3521:3163, 3521:3261, 3521:3297.
        </p>
        <DocsExample
          title="3 examples"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
              <EventCard title="Tesla 4th year Celebration Party" time="7:00 - 11:00 PM (UTC)" location="341 Windy Ridge Road, LA" organizer="by Sofia Williams" attendees="16/25" pinTone="error" />
              <EventCard title="Designing Camp for AlignUI" time="9:00 AM - 10:00 PM (UTC)" location="928 Bagwell Avenue, FL" organizer="by Matthew Johnson" attendees="12/15" pinTone="information" />
              <EventCard title="AlignUI Launch Party" time="8:00 - 12:00 PM (UTC)" location="148 Harley Brook Lane, VA" organizer="by Emma Wright" attendees="18/25" pinTone="success" />
            </div>
          }
          code={`<EventCard
  title="AlignUI Launch Party"
  time="8:00 - 12:00 PM (UTC)"
  location="148 Harley Brook Lane, VA"
  organizer="by Emma Wright"
  attendees="18/25"
/>`}
        />
      </DocsSection>

      <DocsSection title="Holiday card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Title + date range + n-days-break badge + emoji greeting + subtitle. Figma nodes 3523:3334, 3524:3372, 3524:3404.
        </p>
        <DocsExample
          title="3 examples"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
              <HolidayCard title="Christmas Holiday" time="DEC 25 – DEC 27" emoji="🎄" description="Happy Christmas!" subtitle="Religious Holiday" badge={{ label: "2-days break", tone: "purple" }} />
              <HolidayCard title="Woman's Day" time="mar 08" emoji="🌸" description="Happy Women's Day!" subtitle="International Holiday" badge={{ label: "1-days break", tone: "pink" }} />
              <HolidayCard title="Workers' Day" time="MAY 01" emoji="👷" description="Happy Workers' Day!" subtitle="International Holiday" badge={{ label: "1-days break", tone: "warning" }} />
            </div>
          }
          code={`<HolidayCard
  title="Christmas Holiday"
  time="DEC 25 – DEC 27"
  emoji="🎄"
  description="Happy Christmas!"
  subtitle="Religious Holiday"
  badge={{ label: "2-days break", tone: "purple" }}
/>`}
        />
      </DocsSection>

      <DocsSection title="Empty states (per tab)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Each tab renders an illustration + reassurance line + optional Request CTA when there are no records.
        </p>
        <DocsExample
          title="3 empty tabs"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
              {[
                { kind: "schedule-meetings" as EmptyStateKind, label: "meetings" },
                { kind: "schedule-events" as EmptyStateKind, label: "events" },
                { kind: "schedule-holiday" as EmptyStateKind, label: "holiday" },
              ].map((s) => (
                <WidgetShell key={s.label} title={`Schedule · ${s.label}`} seeAll>
                  <ScheduleEmpty kind={s.kind} text={`No records of ${s.label} yet. Please check back later.`} cta="Request" />
                </WidgetShell>
              ))}
            </div>
          }
          code={`<ScheduleEmpty
  icon={Briefcase}
  text="No records of holiday yet. Please check back later."
  cta="Request"
/>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "MeetingCard.avatars", type: "string[]", description: "Avatar seeds — max 3 shown, overflow rendered as a +N pill." },
            { name: "MeetingCard.channel", type: "string", description: 'Sub-line, e.g. "On Google Meet".' },
            { name: "MeetingCard.badge", type: '{ label, tone: "warning" | "information" | "purple" | "success" | "error" }', description: "Trailing badge — meeting category. Rendered bottom-right of card, alongside channel." },
            { name: "EventCard.location", type: "string", description: "Address line, prefixed by map pin." },
            { name: "EventCard.pinTone", type: '"information" | "success" | "error" | "warning"', defaultValue: '"error"', description: "Map-pin colour — Figma uses red/blue/green per event." },
            { name: "EventCard.attendees", type: "string", description: 'e.g. "16/25" — current / capacity.' },
            { name: "HolidayCard.emoji", type: "string", description: "Leading emoji, rendered inside a small white disc with hairline border." },
            { name: "HolidayCard.badge.tone", type: '"purple" | "pink" | "warning"', description: "Break-length badge color — purple multi-day, pink Woman’s Day, warning Workers’ Day." },
            { name: "ScheduleEmpty.cta", type: "string", description: 'Optional CTA label, e.g. "Request".' },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><span className="font-medium">Card</span> — `rounded-lg border bg-bg-white-0 p-2.5 space-y-1.5`.</li>
          <li><span className="font-medium">Header</span> — title `text-sm font-medium` + time `text-xs text-text-sub-600` stacked; badge or chevron right-aligned.</li>
          <li><span className="font-medium">Avatars</span> — `flex -space-x-1.5`, xs avatars, overflow pill `+N` border-2 white.</li>
          <li><span className="font-medium">Meta row</span> — channel / location / organizer / attendees in `text-xs text-text-sub-600`, location/attendees prefixed with mono icon.</li>
          <li><span className="font-medium">Empty</span> — `flex-col items-center gap-2 py-6 text-center`, soft icon chip + reassurance + optional CTA Button stroke neutral xs.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* helpers */
function WidgetShell({ title, seeAll, children, className }: { title: React.ReactNode; seeAll?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {seeAll && <LinkButton size="sm">See All</LinkButton>}
      </div>
      {children}
    </div>
  )
}

type BadgeTone = "warning" | "information" | "purple" | "success" | "pink" | "error"
const BADGE_CLS: Record<BadgeTone, string> = {
  warning: "bg-warning-lighter text-warning-darker",
  information: "bg-information-lighter text-information-darker",
  purple: "bg-(--primary-alpha-10) text-(--primary-base)",
  success: "bg-success-lighter text-success-darker",
  pink: "bg-(--dash-pink-50, #fce7f3) text-(--dash-pink-700, #be185d)",
  error: "bg-error-lighter text-error-darker",
}
const PIN_CLS: Record<"information" | "success" | "error" | "warning", string> = {
  information: "text-information-base",
  success: "text-success-base",
  error: "text-error-base",
  warning: "text-warning-base",
}

function CardShell({
  title,
  time,
  badge,
  showChevron = true,
  children,
}: {
  title: string
  time: string
  badge?: { label: string; tone: BadgeTone }
  showChevron?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2.5 space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-text-strong-950 truncate">{title}</div>
          <div className="text-xs text-text-sub-600">{time}</div>
        </div>
        {badge && !showChevron ? (
          <span className={cn("inline-flex items-center rounded-full px-2 h-5 text-[10px] shrink-0", BADGE_CLS[badge.tone])}>
            {badge.label}
          </span>
        ) : (
          <CompactButton variant="ghost" size="sm" aria-label="Toggle"><ChevronDown /></CompactButton>
        )}
      </div>
      {children}
    </div>
  )
}

function MeetingCard({
  title,
  time,
  avatars,
  channel,
  badge,
}: {
  title: string
  time: string
  avatars: string[]
  channel: string
  badge: { label: string; tone: BadgeTone }
}) {
  return (
    <CardShell title={title} time={time}>
      <div className="flex -space-x-1.5">
        {avatars.slice(0, 3).map((a) => (
          <Avatar key={a} size="xs" className="ring-2 ring-bg-white-0">
            <AvatarImage src={`https://i.pravatar.cc/40?u=${encodeURIComponent(a)}`} />
            <AvatarFallback>{a.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
        ))}
        {avatars.length > 3 ? (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-bg-weak-50 text-[10px] text-text-sub-600 ring-2 ring-bg-white-0">
            +{avatars.length - 3}
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-text-sub-600">{channel}</span>
        <span className={cn("inline-flex items-center rounded-full px-2 h-5 text-[10px] shrink-0", BADGE_CLS[badge.tone])}>
          {badge.label}
        </span>
      </div>
    </CardShell>
  )
}

function EventCard({
  title,
  time,
  location,
  organizer,
  attendees,
  pinTone = "error",
}: {
  title: string
  time: string
  location: string
  organizer: string
  attendees: string
  pinTone?: "information" | "success" | "error" | "warning"
}) {
  return (
    <CardShell title={title} time={time}>
      <div className="text-xs text-text-strong-950 inline-flex items-center gap-1.5">
        <MapPin className={cn("size-3.5", PIN_CLS[pinTone])} />
        {location}
      </div>
      <div className="flex items-center justify-between text-xs text-text-sub-600">
        <span>{organizer}</span>
        <span className="inline-flex items-center gap-1"><UserI className="size-3" />{attendees}</span>
      </div>
    </CardShell>
  )
}

function HolidayCard({
  title,
  time,
  emoji,
  description,
  subtitle,
  badge,
}: {
  title: string
  time: string
  emoji: string
  description: string
  subtitle: string
  badge: { label: string; tone: BadgeTone }
}) {
  return (
    <CardShell title={title} time={time} badge={badge} showChevron={false}>
      <div className="text-xs text-text-strong-950 inline-flex items-center gap-1.5">
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-bg-white-0 border border-stroke-soft-200 text-[10px]">
          {emoji}
        </span>
        {description}
      </div>
      <div className="text-xs text-text-sub-600">{subtitle}</div>
    </CardShell>
  )
}

function ScheduleEmpty({ kind, text, cta }: { kind: EmptyStateKind; text: string; cta?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <EmptyStateIllustration kind={kind} />
      <p className="text-xs text-text-sub-600 max-w-[24ch]">{text}</p>
      {cta ? (
        <Button style="stroke" tone="neutral" size="xs">
          <Plus className="size-3" />{cta}
        </Button>
      ) : null}
    </div>
  )
}
