"use client"

import * as React from "react"
import {
  RiAddLine,
  RiCalendarScheduleLine,
  RiMore2Line,
  RiArrowRightSLine,
  RiVideoLine,
  RiTimerLine,
  RiFlagLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge, StatusBadge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { Divider } from "@/registry/dash/ui/divider"
import { ProgressBar } from "@/registry/dash/ui/progress-bar"
import { cn } from "@/registry/dash/lib/utils"
import {
  HrAppShell,
  HrHeader,
} from "@/registry/dash/templates/_internal/hr-app-shell"

/* -------------------------------------------------------------------------- *
 *  HR Dashboard (Deep) — full Synergy HR home preview                        *
 *  Mirrors `template-hr-master/app/(main)/page.tsx` widget grid 1:1:        *
 *    Row 1: Time Off · Current Project · Schedule (row-span 2)              *
 *    Row 2: Status Tracker · Notes · {Course Progress + Daily Work Hours}   *
 *    Row 3: Daily Feedback · Employee Spotlight                              *
 *    Row 4: Courses (col-span 2) · Time Tracker                              *
 *    Row 5: {Employee Rating + Training Analysis} · Work Hour Analysis       *
 *                                                                            *
 *  Each widget renders as a structured placeholder w/ the verbatim source   *
 *  headline + key data so layout is true 1:1.                                *
 * -------------------------------------------------------------------------- */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

function WidgetCard({
  title,
  cta,
  className,
  children,
}: {
  title: string
  cta?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        {cta ?? (
          <button
            type="button"
            className="text-text-soft-400 hover:text-text-sub-600"
            aria-label="More"
          >
            <RiMore2Line className="size-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function WidgetTimeOff() {
  return (
    <WidgetCard title="Time Off">
      <div className="flex items-end gap-4">
        <div className="relative grid size-24 place-items-center rounded-full bg-bg-weak-50">
          <div className="text-2xl font-semibold text-text-strong-950">10</div>
          <div className="absolute bottom-1 text-[10px] text-text-soft-400">
            / 20 days
          </div>
        </div>
        <div className="flex-1 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-sub-600">Pending</span>
            <span className="font-medium text-text-strong-950">2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-sub-600">Confirmed</span>
            <span className="font-medium text-text-strong-950">5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-sub-600">Rejected</span>
            <span className="font-medium text-text-strong-950">1</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}

function WidgetCurrentProject() {
  const stats = [
    { label: "Tasks", value: "24" },
    { label: "In progress", value: "8" },
    { label: "In review", value: "4" },
    { label: "Completed", value: "12" },
  ]
  return (
    <WidgetCard title="Current Project">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-full bg-(--dash-purple-500) text-static-white text-sm font-semibold">
          L
        </div>
        <div>
          <div className="text-sm font-medium text-text-strong-950">
            Loom Mobile App
          </div>
          <div className="text-xs text-text-sub-600">Sprint 24 · Synergy</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg bg-bg-weak-50 p-2 text-center"
          >
            <div className="text-base font-semibold text-text-strong-950">
              {s.value}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-text-soft-400">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-sub-600">Sprint progress</span>
          <span className="font-medium text-text-strong-950">68%</span>
        </div>
        <ProgressBar value={68} />
      </div>
    </WidgetCard>
  )
}

const scheduleEvents = [
  {
    title: "Weekly Team Meeting",
    time: "9:00 - 9:30 AM",
    via: "Zoom",
    tag: "Meeting",
  },
  {
    title: "Workshop: Mastering Design Thinking",
    time: "11:45 AM - 1:00 PM",
    via: "XYZ Center",
    tag: "Event",
  },
  {
    title: "1:1 w/ James Brown",
    time: "2:00 - 2:30 PM",
    via: "Google Meet",
    tag: "Meeting",
  },
  {
    title: "Brainstorming Session",
    time: "3:00 - 4:00 PM",
    via: "Zoom",
    tag: "Meeting",
  },
  {
    title: "Independence Day (Holiday)",
    time: "All day",
    tag: "Holiday",
  },
]

function WidgetSchedule() {
  return (
    <WidgetCard
      title="Today's Schedule"
      className="row-span-2"
      cta={
        <button
          type="button"
          className="text-xs text-text-sub-600 hover:text-text-strong-950"
        >
          View all
        </button>
      }
    >
      {/* Week strip */}
      <div className="flex justify-between rounded-lg bg-bg-weak-50 p-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
          <div
            key={d}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-md px-2 py-1",
              i === 0 && "bg-bg-strong-950 text-static-white",
            )}
          >
            <span className="text-[10px] uppercase">{d}</span>
            <span className="text-xs font-semibold">{i + 4}</span>
          </div>
        ))}
      </div>
      {/* Events list */}
      <div className="space-y-3">
        {scheduleEvents.map((e) => (
          <div
            key={e.title}
            className="flex items-start gap-3 rounded-lg p-2 hover:bg-bg-weak-50"
          >
            <div
              className={cn(
                "mt-1 size-2 shrink-0 rounded-full",
                e.tag === "Meeting" && "bg-(--dash-purple-500)",
                e.tag === "Event" && "bg-(--state-information-base)",
                e.tag === "Holiday" && "bg-(--state-warning-base)",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-text-strong-950">
                {e.title}
              </div>
              <div className="mt-0.5 text-xs text-text-sub-600">
                {e.time}
                {e.via ? ` · ${e.via}` : ""}
              </div>
            </div>
            {e.tag === "Meeting" ? (
              <RiVideoLine className="size-4 text-text-soft-400" />
            ) : null}
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

const absent = [
  {
    name: "James Brown",
    reason: "Sick · replaced by Arthur T.",
    duration: "25m",
    initials: "JB",
  },
]
const away = [
  { name: "Sophia Williams", duration: "25m", initials: "SW" },
  { name: "Arthur Taylor", duration: "1h", initials: "AT" },
  { name: "Emma Wright", duration: "2h", initials: "EW" },
]

function WidgetStatusTracker() {
  return (
    <WidgetCard title="Status Tracker">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-text-strong-950">
            Absent ({absent.length})
          </span>
          <button className="text-text-sub-600 hover:text-text-strong-950">
            See all
          </button>
        </div>
        {absent.map((u) => (
          <div key={u.name} className="flex items-center gap-3 py-1.5">
            <Avatar size="md">
              <AvatarFallback>{u.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-text-strong-950">
                {u.name}
              </div>
              <div className="truncate text-xs text-text-sub-600">
                {u.reason}
              </div>
            </div>
            <span className="text-xs text-text-soft-400">{u.duration}</span>
          </div>
        ))}
      </div>
      <Divider />
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-text-strong-950">
            Away ({away.length})
          </span>
          <button className="text-text-sub-600 hover:text-text-strong-950">
            See all
          </button>
        </div>
        <div className="space-y-2">
          {away.map((u) => (
            <div key={u.name} className="flex items-center gap-3">
              <Avatar size="md">
                <AvatarFallback>{u.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate text-sm text-text-strong-950">
                {u.name}
              </div>
              <span className="text-xs text-text-soft-400">{u.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  )
}

const notes = [
  {
    label: "Today",
    color: "warning" as const,
    body: "Review Q4 hiring funnel before stand-up.",
  },
  {
    label: "Meeting",
    color: "information" as const,
    body: "Prep slides for the all-hands on Wednesday.",
  },
  {
    label: "Important",
    color: "error" as const,
    body: "Send updated PTO policy to legal by EOD.",
  },
]

function WidgetNotes() {
  return (
    <WidgetCard
      title="Notes"
      cta={
        <Button size="sm" style="ghost" tone="neutral">
          <RiAddLine className="size-4" />
        </Button>
      }
    >
      <div className="space-y-2.5">
        {notes.map((n) => (
          <div
            key={n.body}
            className="space-y-1.5 rounded-lg bg-bg-weak-50 p-3"
          >
            <Badge status={n.color} appearance="lighter" size="sm">
              {n.label}
            </Badge>
            <div className="text-xs leading-relaxed text-text-strong-950">
              {n.body}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

function WidgetCourseProgress() {
  return (
    <WidgetCard title="Course Progress">
      <div className="flex items-center gap-3">
        <div className="relative grid size-14 place-items-center">
          <svg className="size-14 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              className="fill-none stroke-bg-weak-50"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              className="fill-none stroke-primary"
              strokeWidth="3"
              strokeDasharray="100.5"
              strokeDashoffset="35"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-sm font-semibold text-text-strong-950">
            65%
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-text-strong-950">
            Advanced React
          </div>
          <div className="text-xs text-text-sub-600">
            6 of 9 modules complete
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}

function WidgetDailyWorkHours() {
  return (
    <WidgetCard title="Daily Work Hours">
      <div className="flex items-end gap-1.5">
        {[55, 80, 65, 90, 70, 40, 30].map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-(--dash-purple-500)"
              style={{ height: `${h}%`, minHeight: 6 }}
            />
            <span className="text-[10px] text-text-soft-400">
              {["M", "T", "W", "T", "F", "S", "S"][i]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-sub-600">This week</span>
        <span className="font-medium text-text-strong-950">38h 22m</span>
      </div>
    </WidgetCard>
  )
}

function WidgetDailyFeedback() {
  return (
    <WidgetCard title="Daily Feedback">
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <div className="flex gap-1.5">
          {["😞", "😕", "🙂", "😊", "🤩"].map((e, i) => (
            <button
              key={i}
              className={cn(
                "grid size-9 place-items-center rounded-full text-lg ring-1 ring-stroke-soft-200 hover:bg-bg-weak-50",
                i === 3 && "bg-(--dash-purple-50)",
              )}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="text-xs text-text-sub-600">
          How was your day today?
        </div>
      </div>
    </WidgetCard>
  )
}

function WidgetEmployeeSpotlight() {
  return (
    <WidgetCard title="Employee Spotlight">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar size="xl" className="bg-(--dash-yellow-100)">
          <AvatarFallback>MJ</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-medium text-text-strong-950">
            Matthew Johnson
          </div>
          <div className="text-xs text-text-sub-600">
            Data Software Engineer
          </div>
        </div>
        <Badge status="feature" appearance="lighter">
          ⭐ Employee of the Month
        </Badge>
      </div>
    </WidgetCard>
  )
}

const courses = [
  { name: "Mastering UI Animation", progress: 72, lessons: "18 / 25" },
  { name: "TypeScript Deep Dive", progress: 40, lessons: "8 / 20" },
  { name: "Leadership Foundations", progress: 88, lessons: "22 / 25" },
]

function WidgetCourses({ className }: { className?: string }) {
  return (
    <WidgetCard
      title="Courses"
      className={className}
      cta={
        <Button size="sm" style="ghost" tone="neutral">
          See all
          <RiArrowRightSLine className="size-4" />
        </Button>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        {courses.map((c) => (
          <div
            key={c.name}
            className="space-y-2 rounded-lg bg-bg-weak-50 p-3"
          >
            <div className="text-xs font-medium text-text-strong-950">
              {c.name}
            </div>
            <ProgressBar value={c.progress} />
            <div className="flex items-center justify-between text-[10px] text-text-sub-600">
              <span>{c.lessons} lessons</span>
              <span>{c.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

function WidgetTimeTracker() {
  return (
    <WidgetCard title="Time Tracker">
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-full bg-(--state-success-lighter) text-(--state-success-dark)">
          <RiTimerLine className="size-6" />
        </div>
        <div className="flex-1">
          <div className="text-2xl font-semibold tabular-nums text-text-strong-950">
            04:32:18
          </div>
          <div className="text-xs text-text-sub-600">Mobile App — UI work</div>
        </div>
        <Button size="sm" tone="primary">
          Pause
        </Button>
      </div>
    </WidgetCard>
  )
}

function WidgetEmployeeRating() {
  return (
    <WidgetCard title="Employee Rating">
      <div className="space-y-2.5">
        {[
          { name: "Sophia W.", score: 92 },
          { name: "James B.", score: 88 },
          { name: "Emma W.", score: 84 },
          { name: "Matthew J.", score: 80 },
        ].map((row) => (
          <div key={row.name} className="flex items-center gap-3">
            <span className="w-24 text-xs text-text-strong-950">
              {row.name}
            </span>
            <div className="flex-1">
              <ProgressBar value={row.score} />
            </div>
            <span className="w-8 text-right text-xs font-medium text-text-strong-950">
              {row.score}
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

function WidgetTrainingAnalysis() {
  return (
    <WidgetCard title="Training Analysis">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Completed", value: "124" },
          { label: "Active", value: "48" },
          { label: "Hours", value: "1,820" },
          { label: "Compliance", value: "96%" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-bg-weak-50 p-3">
            <div className="text-lg font-semibold text-text-strong-950">
              {s.value}
            </div>
            <div className="text-[11px] text-text-sub-600">{s.label}</div>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

function WidgetWorkHourAnalysis({ className }: { className?: string }) {
  return (
    <WidgetCard
      title="Work Hour Analysis"
      className={className}
      cta={
        <div className="flex items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-1 text-[11px] text-text-sub-600">
          This month
        </div>
      }
    >
      <div className="flex items-end gap-1.5 h-32">
        {Array.from({ length: 30 }).map((_, i) => {
          const h = 30 + Math.abs(((i * 17) % 60) - 30) + 20
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-sm",
                i % 7 === 5 || i % 7 === 6
                  ? "bg-bg-weak-50"
                  : "bg-(--dash-purple-500)",
              )}
              style={{ height: `${h}%`, minHeight: 4 }}
            />
          )
        })}
      </div>
      <div className="flex items-center gap-4 text-xs text-text-sub-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-(--dash-purple-500)" />
          Worked
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-bg-weak-50 ring-1 ring-stroke-soft-200" />
          Weekend
        </span>
        <span className="ml-auto font-medium text-text-strong-950">
          168h / 176h
        </span>
      </div>
    </WidgetCard>
  )
}

function HrDashboardPreview() {
  return (
    <HrAppShell active="dashboard">
      <HrHeader
        icon={
          <Avatar size="xl" className="bg-(--dash-yellow-100)">
            <AvatarFallback>SW</AvatarFallback>
          </Avatar>
        }
        title="Sophia Williams"
        description="Welcome back to Synergy 👋🏻"
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
      <div className="flex flex-col gap-6 px-8 pb-8">
        <div className="grid grid-cols-3 items-start gap-6">
          <WidgetTimeOff />
          <WidgetCurrentProject />
          <WidgetSchedule />
          <WidgetStatusTracker />
          <WidgetNotes />
          <div className="grid gap-6">
            <WidgetCourseProgress />
            <WidgetDailyWorkHours />
          </div>
          <WidgetDailyFeedback />
          <WidgetEmployeeSpotlight />
          <WidgetCourses className="col-span-2" />
          <WidgetTimeTracker />
          <div className="col-span-3 grid grid-cols-6 gap-6">
            <div className="col-span-3 grid gap-6">
              <WidgetEmployeeRating />
              <WidgetTrainingAnalysis />
            </div>
            <WidgetWorkHourAnalysis className="col-span-3" />
          </div>
        </div>
      </div>
    </HrAppShell>
  )
}

export default function HrDashboardDeepDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR"
        title="HR Dashboard (Deep)"
        description="Full Synergy HR home with 272px sidebar, top header, and the complete 14-widget grid ported 1:1 from the template-hr-master source — including Time Off gauge, Current Project, Today's Schedule, Status Tracker, Notes, Course Progress, Daily Work Hours, Daily Feedback, Employee Spotlight, Courses, Time Tracker, Employee Rating, Training Analysis, and Work Hour Analysis."
      />

      <DocsSection title="Full preview">
        <DocsTemplatePreview>
          <HrDashboardPreview />
        </DocsTemplatePreview>
      </DocsSection>

      <DocsSection
        title="Anatomy"
        description="Three-zone layout. The 272px sidebar is fixed; the right column flexes from the 88px header into a 3-column widget grid that spans up to ~1280px before the outer container handles overflow."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            <strong>Sidebar (272px)</strong> — Company Switch (Synergy HR · Pro Plan)
            → Main nav (Dashboard active, Calendar, Time Off, Projects, Teams,
            Integrations, Benefits, Documents) → Favs (Loom Mobile App, Monday
            Redesign, Udemy Courses w/ ⌘1-3) → Settings / Support → User card.
          </li>
          <li>
            <strong>Top Header</strong> — 48px Sophia avatar + greeting +
            "Welcome back to Synergy 👋🏻" + Search (⌘K), bell, Schedule,
            Create Request actions.
          </li>
          <li>
            <strong>Widget grid</strong> — 3 columns × ~5 rows. Schedule
            spans 2 rows. Courses spans 2 columns. Work Hour Analysis spans 3.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Avatar / AvatarFallback</strong> — Sophia avatar, sidebar user card, status rows, spotlight.</li>
          <li><strong>Badge, StatusBadge</strong> — Note category pills, employee-of-the-month pill.</li>
          <li><strong>Button</strong> — Schedule, Create Request, See all, Pause.</li>
          <li><strong>Divider</strong> — Inside Status Tracker, sidebar separators.</li>
          <li><strong>ProgressBar</strong> — Sprint progress, course progress, employee rating bars.</li>
          <li><strong>Kbd</strong> — ⌘K search hint, Favs shortcuts.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
