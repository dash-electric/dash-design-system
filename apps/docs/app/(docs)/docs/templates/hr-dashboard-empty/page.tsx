"use client"

import * as React from "react"
import {
  RiAddLine,
  RiCalendarScheduleLine,
  RiMore2Line,
  RiArrowRightSLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { cn } from "@/registry/dash/lib/utils"
import {
  HrAppShell,
  HrHeader,
} from "@/registry/dash/templates/_internal/hr-app-shell"

/* -------------------------------------------------------------------------- *
 *  HR Dashboard (Empty States) — first-run variant                           *
 *  Mirrors `template-hr-master/app/(main)/home-empty-states/page.tsx`.      *
 *  Same 14-widget grid, every widget rendered in its empty-state form:     *
 *    illustration / icon + headline + body + CTA.                            *
 * -------------------------------------------------------------------------- */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

function EmptyShape({ kind = "doc" }: { kind?: "doc" | "calendar" | "chart" | "ring" | "people" | "list" }) {
  // Lightweight inline illustration placeholders that mimic the
  // empty-state SVG family in `components/empty-state-illustrations/`.
  return (
    <div className="relative grid h-20 w-20 place-items-center">
      <div className="absolute inset-0 rounded-2xl bg-bg-weak-50" />
      <div
        className={cn(
          "relative size-12 rounded-xl bg-bg-white-0 ring-1 ring-stroke-soft-200",
          kind === "ring" && "rounded-full",
          kind === "calendar" && "border-t-4 border-t-(--dash-purple-500)",
        )}
      />
      <div className="absolute -bottom-1 -right-1 size-6 rounded-md bg-(--dash-purple-100) ring-1 ring-stroke-soft-200" />
    </div>
  )
}

function EmptyWidget({
  title,
  headline,
  body,
  cta,
  shape = "doc",
  className,
}: {
  title: string
  headline: string
  body: string
  cta: string
  shape?: React.ComponentProps<typeof EmptyShape>["kind"]
  className?: string
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
        <RiMore2Line className="size-4 text-text-soft-400" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
        <EmptyShape kind={shape} />
        <div className="space-y-1">
          <div className="text-sm font-medium text-text-strong-950">
            {headline}
          </div>
          <div className="mx-auto max-w-[240px] text-xs text-text-sub-600 leading-relaxed">
            {body}
          </div>
        </div>
        <Button size="sm" style="stroke" tone="neutral">
          <RiAddLine className="size-4" />
          {cta}
        </Button>
      </div>
    </div>
  )
}

function HrDashboardEmptyPreview() {
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
          <EmptyWidget
            title="Time Off"
            headline="No requests yet"
            body="Request time off and we'll track your balance against the 20-day allowance."
            cta="Request Time Off"
            shape="ring"
          />
          <EmptyWidget
            title="Current Project"
            headline="No active project"
            body="Pin a sprint or project to see live tasks, KPIs, and burn-down here."
            cta="Pin Project"
            shape="doc"
          />
          <EmptyWidget
            title="Today's Schedule"
            headline="Nothing scheduled"
            body="Connect your calendar to surface meetings, events, and holidays."
            cta="Connect Calendar"
            shape="calendar"
            className="row-span-2"
          />
          <EmptyWidget
            title="Status Tracker"
            headline="Everyone's here"
            body="No teammates are currently absent or away — enjoy the green dashboard."
            cta="View Team"
            shape="people"
          />
          <EmptyWidget
            title="Notes"
            headline="No notes yet"
            body="Capture quick reminders, follow-ups, or context for your day."
            cta="Add Note"
            shape="list"
          />
          <div className="grid gap-6">
            <EmptyWidget
              title="Course Progress"
              headline="Pick a course"
              body="Track your learning journey across enrolled courses."
              cta="Browse Courses"
              shape="ring"
            />
            <EmptyWidget
              title="Daily Work Hours"
              headline="No hours logged"
              body="Start the timer or import last week's entries."
              cta="Start Timer"
              shape="chart"
            />
          </div>
          <EmptyWidget
            title="Daily Feedback"
            headline="Share how you feel"
            body="Pulse surveys help your manager support you at the right time."
            cta="Give Feedback"
            shape="doc"
          />
          <EmptyWidget
            title="Employee Spotlight"
            headline="No spotlight yet"
            body="Nominate a teammate whose work made an impact this month."
            cta="Nominate"
            shape="people"
          />
          <EmptyWidget
            title="Courses"
            headline="No enrolled courses"
            body="Explore the learning library to start your next course."
            cta="Browse Library"
            shape="doc"
            className="col-span-2"
          />
          <EmptyWidget
            title="Time Tracker"
            headline="Timer is off"
            body="Pick a project and start tracking the time you spend today."
            cta="Start Tracking"
            shape="ring"
          />
          <div className="col-span-3 grid grid-cols-6 gap-6">
            <div className="col-span-3 grid gap-6">
              <EmptyWidget
                title="Employee Rating"
                headline="No reviews yet"
                body="Performance reviews will show ratings across your team here."
                cta="Start Review"
                shape="list"
              />
              <EmptyWidget
                title="Training Analysis"
                headline="No training data"
                body="Once trainings start landing we'll surface completion, compliance, and hours."
                cta="Plan Training"
                shape="chart"
              />
            </div>
            <EmptyWidget
              title="Work Hour Analysis"
              headline="Track hours to see trends"
              body="Daily entries will roll up into weekly and monthly views."
              cta="Log Hours"
              shape="chart"
              className="col-span-3"
            />
          </div>
        </div>
      </div>
    </HrAppShell>
  )
}

export default function HrDashboardEmptyDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR"
        title="HR Dashboard (Empty)"
        description="First-run variant of the HR home — same 14-widget grid and shell, every widget shown in its empty state with illustration + headline + body + CTA. Mirrors home-empty-states/page.tsx in the source template."
      />

      <DocsSection title="Full preview">
        <DocsTemplatePreview>
          <HrDashboardEmptyPreview />
        </DocsTemplatePreview>
      </DocsSection>

      <DocsSection
        title="Anatomy"
        description="Empty states share the same WidgetCard frame as the populated dashboard, replacing the data region with illustration + 1 headline line + 2 lines of body copy + a primary action."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            <strong>Illustration zone</strong> — 80×80 stack of bg-weak-50
            shape + central card + accent dot. Maps to the `empty-state-illustrations/`
            SVG family in the source (calendar, chart, ring, people, list, doc).
          </li>
          <li>
            <strong>Headline</strong> — single line, text-strong-950, medium weight,
            describes the absence ("No requests yet").
          </li>
          <li>
            <strong>Body</strong> — 2 lines text-sub-600 explaining how the widget
            becomes useful and the action that fills it.
          </li>
          <li>
            <strong>CTA</strong> — Button stroke + neutral + size sm + leading <code>+</code>
            icon, mirrors the source <code>CreateRequestButton</code> tone.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Avatar / AvatarFallback</strong> — Sophia avatar in header + sidebar user card.</li>
          <li><strong>Button</strong> — Schedule, Create Request (header) + each widget CTA.</li>
          <li><strong>Kbd</strong> — ⌘K search hint, sidebar fav shortcuts.</li>
          <li><strong>EmptyShape</strong> — inline illustration placeholder used per widget. Swap for the source SVG when ported.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> on first login, after data reset, or when a feature has not yet been connected.</li>
          <li><strong>Use</strong> as a copy-deck reference for empty-state voice across HR modules.</li>
          <li><strong>Don&apos;t</strong> use partial empty states — keep the entire dashboard in one mode for predictability.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
