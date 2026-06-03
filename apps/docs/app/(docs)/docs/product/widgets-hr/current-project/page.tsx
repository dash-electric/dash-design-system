"use client"

import * as React from "react"
import {
  RiFlashlightLine,
  RiCalendarLine,
  RiPencilLine,
  RiTimeFill,
  RiFolderOpenLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
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
 * HR Widget — Current Project. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-current-project.tsx
 */
export default function HRCurrentProjectWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Current Project"
        description="Single-project overview card: brand glyph + status, project manager + design lead, team avatar stack, timeline, and 1-line description."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Monday.com Redesign"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiFlashlightLine className="size-4 text-icon-sub-600" /> Current Project</>}
                action={<Button tone="neutral" style="stroke" size="xs">See All</Button>}
              >
                <Divider />
                <div className="space-y-3.5 pt-4 pb-1.5">
                  <Row label="Project Name">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-flex size-6 items-center justify-center rounded-md bg-bg-weak-50 text-xs font-bold">m</span>
                      Monday.com Redesign
                      <Badge status="warning" appearance="lighter" type="left-icon" icon={<RiTimeFill />}>In Progress</Badge>
                    </div>
                  </Row>
                  <div className="flex gap-4">
                    <Row label="Project Manager" className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Avatar size="xs"><AvatarImage src="/images/avatar/illustration/laura.png" /><AvatarFallback>LP</AvatarFallback></Avatar>
                        Laura P.
                      </div>
                    </Row>
                    <Row label="Design Lead" className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Avatar size="xs"><AvatarImage src="/images/avatar/illustration/arthur.png" /><AvatarFallback>AG</AvatarFallback></Avatar>
                        Arthur G.
                      </div>
                    </Row>
                  </div>
                  <Row label="Team">
                    <div className="flex items-center gap-2">
                      <AvatarGroup size="xs" spacing="tight">
                        <Avatar><AvatarImage src="/images/avatar/illustration/james.png" /><AvatarFallback>JB</AvatarFallback></Avatar>
                        <Avatar><AvatarImage src="/images/avatar/illustration/sophia.png" /><AvatarFallback>SW</AvatarFallback></Avatar>
                        <Avatar><AvatarImage src="/images/avatar/illustration/arthur.png" /><AvatarFallback>AT</AvatarFallback></Avatar>
                        <Avatar><AvatarImage src="/images/avatar/illustration/emma.png" /><AvatarFallback>EW</AvatarFallback></Avatar>
                      </AvatarGroup>
                      <span className="text-xs text-text-sub-600">+8 people</span>
                    </div>
                  </Row>
                  <Row label="Timeline">
                    <div className="flex items-center gap-2 text-sm">
                      <RiCalendarLine className="size-5 text-text-sub-600" />
                      <span className="truncate">12/10/2022 ∙ 01/04/2023</span>
                    </div>
                  </Row>
                  <Row label="Description">
                    <div className="flex items-center gap-2 text-sm">
                      <RiPencilLine className="size-5 text-text-sub-600" />
                      <span className="truncate">Mobile and desktop app design for the new look of the brand.</span>
                    </div>
                  </Row>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title="Current Project">
  <Row label="Project Name">Monday.com Redesign</Row>
  <Row label="Project Manager">Laura P.</Row>
  ...
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No records of projects yet"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiFlashlightLine className="size-4 text-icon-sub-600" /> Current Project</>}>
                <Divider />
                <div className="flex flex-col items-center justify-center gap-4 py-14">
                  <EmptyStateIllustration kind="current-project" />
                  <p className="text-center text-sm text-text-soft-400">
                    No records of projects yet.<br /> Please check back later.
                  </p>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<EmptyState title="No records of projects yet" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "project.name", type: "string", description: "Project display name." },
            { name: "project.status", type: '"in-progress" | "blocked" | "review"', description: "Drives the warning/error/info badge." },
            { name: "project.manager", type: "Person", description: "PM avatar + initials." },
            { name: "project.designLead", type: "Person", description: "Design lead avatar + initials." },
            { name: "project.team", type: "Person[]", description: "Avatar stack — overflow rendered as `+N people` micro-label." },
            { name: "project.timeline", type: "string", description: "Free-form date range. Ships ISO + en-dash by convention." },
            { name: "project.description", type: "string", description: "One-liner blurb — single line truncated." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>5 labelled rows</strong> — paragraph-xs sub-600 label above each value row.</li>
          <li><strong>Row 1</strong> — brand glyph + project name + status Badge (lighter warning).</li>
          <li><strong>Row 2</strong> — 50/50 split: PM / Design Lead.</li>
          <li><strong>Row 3</strong> — 24px AvatarGroup + "+N people" overflow.</li>
          <li><strong>Rows 4-5</strong> — Calendar / Pencil leading icon (sub-600) + body text.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function Row({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="text-xs text-text-sub-600">{label}</div>
      {children}
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
