"use client"

import * as React from "react"
import {
  RiBook3Line,
  RiSearch2Line,
  RiCheckboxCircleFill,
  RiTimeFill,
  RiMore2Line,
  RiBookOpenLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { ProgressBar } from "@/registry/dash/ui/progress-bar"
import { cn } from "@/registry/dash/lib/utils"
import { EmptyStateIllustration } from "@/registry/dash/ui/empty-state-illustration"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

type Row = {
  id: string
  instructor: { name: string; img: string; title: string; initials: string }
  course: { name: string; date: string }
  progress: number
  status: "completed" | "pending"
}

const rows: Row[] = [
  { id: "a", instructor: { name: "Nuray Aksoy", img: "/images/avatar/illustration/nuray.png", title: "Product Manager", initials: "NA" }, course: { name: "Time Management", date: "Aug 21 - Sep 04" }, progress: 30, status: "pending" },
  { id: "b", instructor: { name: "Arthur Taylor", img: "/images/avatar/illustration/arthur.png", title: "Entreprenur / CEO", initials: "AT" }, course: { name: "Leadership Skills", date: "Aug 02 - Aug 18" }, progress: 70, status: "pending" },
  { id: "c", instructor: { name: "Wei Chen", img: "/images/avatar/illustration/wei.png", title: "Operations Manager", initials: "WC" }, course: { name: "Diversity Training", date: "June 24 - July 03" }, progress: 100, status: "completed" },
  { id: "d", instructor: { name: "Lena Müller", img: "/images/avatar/illustration/lena.png", title: "Marketing Manager", initials: "LM" }, course: { name: "Efficiency at Work", date: "June 04 - June 28" }, progress: 100, status: "completed" },
]

/**
 * HR Widget — Courses. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-courses.tsx
 */
export default function HRCoursesWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Courses"
        description="Full table of enrolled courses. 4 columns — Instructor, Course Name, Progress, Status — plus a row action menu. Header carries a search input and See All escape."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="4 enrolled courses (2 in progress, 2 completed)"
          preview={
            <WidgetShell
              title={<><RiBook3Line className="size-4 text-icon-sub-600" /> Courses</>}
              action={
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-2 h-7 px-2.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-soft-400 w-[260px]">
                    <RiSearch2Line className="size-3.5" />
                    <span className="flex-1">Search...</span>
                    <kbd className="text-[10px] px-1 rounded bg-bg-weak-50 border border-stroke-soft-200">⌘ 1</kbd>
                  </div>
                  <Button tone="neutral" style="stroke" size="xs">See All</Button>
                </div>
              }
            >
              <CoursesTable rows={rows} />
            </WidgetShell>
          }
          code={`<CoursesTable rows={rows} />`}
        />
      </DocsSection>

      <DocsSection title="Row states">
        <DocsExample
          title="Pending vs Completed"
          preview={
            <WidgetShell title={<><RiBook3Line className="size-4 text-icon-sub-600" /> Courses</>}>
              <CoursesTable rows={rows.slice(0, 2)} />
            </WidgetShell>
          }
          code={`<CoursesTable rows={[pendingRow, completedRow]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No records of courses yet"
          preview={
            <WidgetShell title={<><RiBook3Line className="size-4 text-icon-sub-600" /> Courses</>}>
              <div className="flex flex-col items-center justify-center gap-4 py-14">
                <EmptyStateIllustration kind="courses" />
                <p className="text-center text-sm text-text-soft-400">
                  There are no records of courses yet.<br /> Please check back later.
                </p>
              </div>
            </WidgetShell>
          }
          code={`<EmptyState title="No records of courses yet" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "rows[].instructor", type: "{ name, img, title, initials }", description: "Avatar + name + role." },
            { name: "rows[].course", type: "{ name, date }", description: "Course name + date range." },
            { name: "rows[].progress", type: "number (0-100)", description: "Completion bar fill." },
            { name: "rows[].status", type: '"completed" | "pending"', description: "Drives StatusBadge tone + icon." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Header</strong> — RiBook3Line + "Courses" + 260px search input (with ⌘1 kbd) + See All.</li>
          <li><strong>Table</strong> — 4 columns + row action ghost icon button. Min progress column width 144px.</li>
          <li><strong>Status</strong> — Pending = warning tone + RiTimeFill, Completed = success tone + RiCheckboxCircleFill.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function CoursesTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-text-sub-600 border-b border-stroke-soft-200">
            <th className="font-medium py-2 pr-4">Instructor</th>
            <th className="font-medium py-2 pr-4">Course Name</th>
            <th className="font-medium py-2 pr-4 min-w-36">Progress</th>
            <th className="font-medium py-2 pr-4">Status</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-stroke-soft-200 last:border-0">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <Avatar size="md">
                    <AvatarImage src={r.instructor.img} alt="" />
                    <AvatarFallback>{r.instructor.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-text-strong-950 font-medium">{r.instructor.name}</div>
                    <div className="text-xs text-text-sub-600">{r.instructor.title}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">
                <div className="text-text-strong-950">{r.course.name}</div>
                <div className="text-xs text-text-sub-600">{r.course.date}</div>
              </td>
              <td className="py-3 pr-4 min-w-36">
                <div className="flex items-center gap-2">
                  <ProgressBar value={r.progress} className="flex-1" />
                  <span className="text-xs text-text-sub-600 tabular-nums">{r.progress}%</span>
                </div>
              </td>
              <td className="py-3 pr-4">
                {r.status === "completed" ? (
                  <Badge status="success" appearance="stroke" type="left-icon" icon={<RiCheckboxCircleFill />}>Completed</Badge>
                ) : (
                  <Badge status="warning" appearance="stroke" type="left-icon" icon={<RiTimeFill />}>In Progress</Badge>
                )}
              </td>
              <td className="py-3">
                <button className="size-7 rounded-md hover:bg-bg-weak-50 inline-flex items-center justify-center text-text-sub-600">
                  <RiMore2Line className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
