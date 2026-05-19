"use client"

import * as React from "react"
import { RiBook3Line, RiBookOpenLine } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { ProgressCircle } from "@/registry/dash/ui/progress-circle"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * HR Widget — Course Progress. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-course-progress.tsx
 */
export default function HRCourseProgressWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Course Progress"
        description="Active learning surface. Anchors a single in-flight course with completion ring + title + short blurb + resume CTA."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="In progress — Team Diversity Training (25%)"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={<><RiBook3Line className="size-4 text-icon-sub-600" /> Course Progress</>}
                action={<Button tone="neutral" style="stroke" size="xs">See All</Button>}
              >
                <Divider />
                <div className="pt-4 pb-0.5 flex items-center gap-4">
                  <ProgressCircle value={25} size={80}>25%</ProgressCircle>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-strong-950">Team Diversity Training</div>
                    <p className="mt-1 text-xs text-text-sub-600">
                      Designed to foster inclusivity and leverage diverse perspectives.
                    </p>
                    <LinkButton size="sm" underline="always" className="mt-2">Resume Course</LinkButton>
                  </div>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<ProgressCircle value={25} size="lg">25%</ProgressCircle>
<div className="text-sm font-medium">Team Diversity Training</div>
<LinkButton size="sm" underline>Resume Course</LinkButton>`}
        />
      </DocsSection>

      <DocsSection title="Progress fills">
        <DocsExample
          title="0 / 25 / 50 / 75 / 100"
          preview={
            <div className="flex items-end gap-4">
              {[0, 25, 50, 75, 100].map((v) => (
                <div key={v} className="text-center space-y-1">
                  <ProgressCircle value={v} size={80}>{v}%</ProgressCircle>
                </div>
              ))}
            </div>
          }
          code={`<ProgressCircle value={50} size="lg">50%</ProgressCircle>`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No courses in progress"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={<><RiBook3Line className="size-4 text-icon-sub-600" /> Course Progress</>}
              >
                <Divider />
                <div className="pt-4 pb-0.5 flex items-center gap-4">
                  <ProgressCircle value={0} size={80}>
                    <RiBookOpenLine className="size-5 text-text-soft-400" />
                  </ProgressCircle>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-sub-600">No courses in progress</div>
                    <p className="mt-1 text-xs text-text-soft-400">
                      There&apos;s no progress for any courses yet. Consider applying for one.
                    </p>
                    <LinkButton size="sm" underline="always" className="mt-2">Apply for a Course</LinkButton>
                  </div>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<ProgressCircle value={0} size="lg" />
<LinkButton size="sm" underline>Apply for a Course</LinkButton>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "course.title", type: "string", description: "Course display name." },
            { name: "course.description", type: "string", description: "1-line blurb beneath the title." },
            { name: "course.progress", type: "number (0-100)", description: "Completion ring fill." },
            { name: "resumeLabel", type: "string", defaultValue: '"Resume Course"', description: "CTA label switches to \"Apply for a Course\" in empty state." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Header</strong> — RiBook3Line + "Course Progress" + neutral-stroke "See All" button.</li>
          <li><strong>Ring</strong> — 80px ProgressCircle with % label centred.</li>
          <li><strong>Body</strong> — course title (label-sm), description (paragraph-xs, sub-600), underlined primary LinkButton.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
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
    <div
      className={cn(
        "rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 h-9">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}
