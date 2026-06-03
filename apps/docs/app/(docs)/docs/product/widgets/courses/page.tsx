"use client"

import * as React from "react"
import {
  RiMore2Line as More,
  RiSearchLine as Search,
  RiTimeLine as ClockI,
  RiCheckLine as CheckI,
} from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
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
 * Courses widget — Figma 1:1 (re-verified 2026-05-19).
 *
 *   3869:16464   Courses — loaded (wide 728×380 table: Instructor / Course Name
 *                / Progress / Status; header search input + See All button)
 *   3871:20766   Courses — empty (table header retained + book illustration +
 *                "There are no records of courses yet. Please check back later.")
 *
 * Real Figma anatomy: WIDE table layout (NOT narrow card). Header = title + full
 * search input + See All. Body = 5-column table:
 *   - Instructor: avatar + (name + role)
 *   - Course Name: title + date range
 *   - Progress: thin bar + % label
 *   - Status: Badge with leading icon (clock = In Progress warning; check = Completed success)
 *   - Trailing: 3-dot kebab
 */
export default function CoursesWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Courses"
        description="Wide table widget — header search + See All, then rows of enrolled instructors with role, course name + date range, progress bar, and status badge (In Progress / Completed). Empty state preserves the table header chrome and renders a centered illustration + reassuring copy."
      />

      <DocsSection title="Loaded — 4 instructors">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Figma node 3869:16464. Status badge leading icon mirrors lifecycle — clock for In Progress, check for Completed.
        </p>
        <DocsExample
          title="Full table"
          preview={
            <div className="max-w-3xl">
              <CoursesLoaded rows={COURSES} />
            </div>
          }
          code={`<Courses rows={[
  { name: "Nuray Aksoy", role: "Product Manager", course: "Time Management", dates: "Aug 21 - Sep 04", progress: 30, status: "in-progress" },
  { name: "Arthur Taylor", role: "Entreprenur / CEO", course: "Leadership Skills", dates: "Aug 02 - Aug 18", progress: 70, status: "in-progress" },
  { name: "Wei Chen", role: "Operations Manager", course: "Diversity Training", dates: "June 24 - July 03", progress: 100, status: "completed" },
  { name: "Lena Müller", role: "Marketing Manager", course: "Efficiency at Work", dates: "June 04 - June 28", progress: 100, status: "completed" },
]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Figma node 3871:20766. Table header ghosted, centered book illustration, "There are no records of courses yet."
        </p>
        <DocsExample
          title="No records"
          preview={
            <div className="max-w-3xl">
              <CoursesEmpty />
            </div>
          }
          code={`<Courses state="empty" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "rows", type: "CourseRow[]", description: "Enrolled instructors — { name, role, course, dates, progress, status }." },
            { name: "row.name", type: "string", description: "Instructor full name." },
            { name: "row.role", type: "string", description: "Sub-line — instructor title or department." },
            { name: "row.course", type: "string", description: "Course title (line 1 of Course Name column)." },
            { name: "row.dates", type: "string", description: "Pre-formatted date range (line 2 of Course Name column)." },
            { name: "row.progress", type: "number", description: "0–100 progress percentage." },
            { name: "row.status", type: '"in-progress" | "completed"', description: "Drives status badge tone + leading icon." },
            { name: "onSearch", type: "(q: string) => void", description: "Search input change handler." },
            { name: "onRowAction", type: "(rowId: string) => void", description: "Fires when a row 3-dot menu is opened." },
            { name: "state", type: '"loaded" | "empty"', defaultValue: '"loaded"', description: "Loaded renders rows; empty renders the illustration." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Header</strong> — title left + search input center + See All stroke button right.</li>
          <li><strong>Column header</strong> — Instructor / Course Name / Progress / Status row in soft-50 background.</li>
          <li><strong>Row</strong> — avatar + (name + role) | (course + dates) | (bar + %) | status badge | 3-dot menu.</li>
          <li><strong>Status</strong> — In Progress = warning lighter w/ clock icon; Completed = success lighter w/ check icon.</li>
          <li><strong>Empty</strong> — column header retained as ghost, centered illustration + reassuring copy.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ============================================================================ */

type CourseStatus = "in-progress" | "completed"
type CourseRow = {
  name: string
  role: string
  course: string
  dates: string
  progress: number
  status: CourseStatus
}

const COURSES: CourseRow[] = [
  { name: "Nuray Aksoy", role: "Product Manager", course: "Time Management", dates: "Aug 21 - Sep 04", progress: 30, status: "in-progress" },
  { name: "Arthur Taylor", role: "Entreprenur / CEO", course: "Leadership Skills", dates: "Aug 02 - Aug 18", progress: 70, status: "in-progress" },
  { name: "Wei Chen", role: "Operations Manager", course: "Diversity Training", dates: "June 24 - July 03", progress: 100, status: "completed" },
  { name: "Lena Müller", role: "Marketing Manager", course: "Efficiency at Work", dates: "June 04 - June 28", progress: 100, status: "completed" },
]

function WidgetShell({
  title,
  children,
  className,
}: {
  title: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-3", className)}>
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-text-strong-950 inline-flex items-center gap-1.5">{title}</div>
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 h-8 text-xs text-text-soft-400">
          <Search className="size-3.5" aria-hidden />
          <span className="flex-1">Search...</span>
          <kbd className="rounded border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.5 text-[10px] text-text-sub-600">
            ⌘1
          </kbd>
        </div>
        <Button style="stroke" tone="neutral" size="xs">
          See All
        </Button>
      </div>
      {children}
    </div>
  )
}

function TableHeader() {
  return (
    <div className="grid grid-cols-[1.5fr_1.5fr_1fr_0.8fr_32px] gap-3 rounded-lg bg-bg-weak-50 px-3 py-2 text-[11px] uppercase tracking-wider text-text-soft-400">
      <div>Instructor</div>
      <div>Course Name</div>
      <div>Progress</div>
      <div>Status</div>
      <div />
    </div>
  )
}

function CourseTableRow({ row }: { row: CourseRow }) {
  const meta =
    row.status === "completed"
      ? { tone: "success" as const, label: "Completed", Icon: CheckI }
      : { tone: "warning" as const, label: "In Progress", Icon: ClockI }
  const Icon = meta.Icon
  return (
    <div className="grid grid-cols-[1.5fr_1.5fr_1fr_0.8fr_32px] items-center gap-3 px-3 py-2.5 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <Avatar size="sm">
          <AvatarImage src={`https://i.pravatar.cc/40?u=${encodeURIComponent(row.name)}`} />
          <AvatarFallback>{row.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-medium truncate text-text-strong-950">{row.name}</div>
          <div className="text-text-sub-600 truncate">{row.role}</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="font-medium truncate text-text-strong-950">{row.course}</div>
        <div className="text-text-sub-600 truncate tabular-nums">{row.dates}</div>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-1 h-1 rounded-full bg-bg-soft-200">
          <div className="h-full rounded-full bg-(--primary-base)" style={{ width: `${row.progress}%` }} />
        </div>
        <span className="tabular-nums font-medium text-text-strong-950">{row.progress}%</span>
      </div>
      <div>
        <Badge size="sm" appearance="lighter" status={meta.tone}>
          <Icon className="size-3" />
          {meta.label}
        </Badge>
      </div>
      <button
        type="button"
        className="inline-flex size-7 items-center justify-center rounded-md text-text-soft-400 hover:bg-bg-weak-50"
        aria-label="More actions"
      >
        <More className="size-4" />
      </button>
    </div>
  )
}

function CoursesLoaded({ rows }: { rows: CourseRow[] }) {
  return (
    <WidgetShell title="Courses">
      <TableHeader />
      <div className="divide-y divide-stroke-soft-200">
        {rows.map((r) => (
          <CourseTableRow key={r.name} row={r} />
        ))}
      </div>
    </WidgetShell>
  )
}

function CoursesEmpty() {
  return (
    <WidgetShell title="Courses">
      <TableHeader />
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <EmptyStateIllustration kind="courses" />
        <p className="text-xs text-text-sub-600 max-w-[32ch] leading-relaxed">
          There are no records of courses yet.
          <br />
          Please check back later.
        </p>
      </div>
    </WidgetShell>
  )
}
