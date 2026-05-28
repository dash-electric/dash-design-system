"use client"

import * as React from "react"
import {
  RiStickyNoteLine,
  RiAddLine,
  RiCalendarLine,
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleFill,
  RiFileTextLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
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
 * HR Widget — Notes. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-notes.tsx
 */
type NoteItem = {
  title: string
  description: string
  date: string
  badges: { label: string; status: Status }[]
}

const NOTES: NoteItem[] = [
  {
    title: "Text Inputs for Design System",
    description: "Search for inspiration to provide a rich content of text inputs for the design system.",
    date: "Aug 03",
    badges: [
      { label: "Today", status: "error" },
      { label: "To-do", status: "warning" },
    ],
  },
  {
    title: "Meeting with Arthur Taylor",
    description: "Discuss the MVP version of Apex Mobile and Desktop app.",
    date: "Aug 02",
    badges: [
      { label: "Today", status: "error" },
      { label: "Meeting", status: "information" },
    ],
  },
  {
    title: "Check neutral and state colors",
    description: "Button components will be revised and designed again due to a few errors.",
    date: "Aug 01",
    badges: [
      { label: "Yesterday", status: "warning" },
      { label: "Important", status: "feature" },
    ],
  },
]

export default function HRNotesWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Notes"
        description="Personal to-do feed. Each note = check toggle + title + 1-line description + status badges + date stamp. Header carries an Add Note CTA."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="3 notes — 2 active, 1 done"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiStickyNoteLine className="size-4 text-icon-sub-600" /> Notes</>}
                action={<Button tone="neutral" style="stroke" size="xs" leftIcon={<RiAddLine className="size-3.5" />}>Add Note</Button>}
              >
                <Divider />
                <div className="space-y-3 pt-4">
                  {NOTES.map((note, i) => (
                    <React.Fragment key={note.title}>
                      <NoteRow note={note} defaultChecked={i === 2} />
                      {i < NOTES.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </div>
              </WidgetShell>
            </div>
          }
          code={`<NoteRow note={{ title, description, date, badges }} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No notes yet"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiStickyNoteLine className="size-4 text-icon-sub-600" /> Notes</>}>
                <Divider />
                <div className="flex flex-col items-center justify-center gap-4 py-14">
                  <EmptyStateIllustration kind="notes" />
                  <p className="text-center text-sm text-text-soft-400">
                    There are no records of notes yet.<br /> Please check back later.
                  </p>
                  <Button tone="neutral" style="stroke" size="xs" leftIcon={<RiAddLine className="size-3.5" />}>Add Note</Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<EmptyState title="No records of notes yet" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "note.title", type: "string", description: "Headline (label-sm). Gets muted when checked." },
            { name: "note.description", type: "string", description: "1-line blurb truncated overflow." },
            { name: "note.date", type: "string | Date", description: "Right-side date stamp formatted MMM dd." },
            { name: "note.badges", type: "{ label, status }[]", description: "Lighter-tone badges (Today, To-do, Meeting, Important...)." },
            { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Fires on circle tap." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Check toggle</strong> — circle-line ↔ check-circle-fill. Success-base when checked. Animates 200ms.</li>
          <li><strong>Body</strong> — title (label-sm) + description (sm sub-600). Strikethrough state muted to soft-400.</li>
          <li><strong>Badges row</strong> — wrapped row of lighter badges. Disabled tone when note is checked.</li>
          <li><strong>Date</strong> — RiCalendarLine + MMM dd in xs soft-400.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function NoteRow({ note, defaultChecked }: { note: NoteItem; defaultChecked?: boolean }) {
  const [checked, setChecked] = React.useState(!!defaultChecked)
  return (
    <button
      type="button"
      onClick={() => setChecked((p) => !p)}
      className="group flex w-full items-start gap-2.5 text-left"
      aria-pressed={checked}
    >
      <div className="grid shrink-0 mt-0.5">
        {checked ? (
          <RiCheckboxCircleFill className="size-6 text-(--state-success-base)" />
        ) : (
          <RiCheckboxBlankCircleLine className="size-6 text-text-soft-400" />
        )}
      </div>
      <div className="w-full min-w-0 space-y-2">
        <div className="space-y-1">
          <div className={cn("text-sm font-medium", checked ? "text-text-soft-400 line-through" : "text-text-strong-950")}>
            {note.title}
          </div>
          <div className={cn("truncate text-sm", checked ? "text-text-soft-400" : "text-text-sub-600")}>
            {note.description}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {note.badges.map((b, i) => (
              <Badge key={i} status={b.status} appearance="lighter" disabled={checked}>{b.label}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-text-soft-400">
            <RiCalendarLine className="size-4" />
            {note.date}
          </div>
        </div>
      </div>
    </button>
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
