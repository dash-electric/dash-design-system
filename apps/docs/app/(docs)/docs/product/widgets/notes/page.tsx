"use client"

import * as React from "react"
import {
  RiCheckLine as Check,
  RiCalendarLine as CalendarI,
} from "@remixicon/react"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Notes widget — Figma 1:1 (2 nodes verified 2026-05-18).
 *   3872:24016   Note row — active (unchecked + filled status tags)
 *   3872:24015   Note row — completed (checked + strikethrough + muted tags)
 */
export default function NotesWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Notes"
        description="Checklist widget for short-form to-dos with status tags + due date. Each row carries a completion state that mutes the entire row when checked off."
      />

      <DocsSection title="Widget shell">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Notes widget assembles two or more note rows inside the standard widget
          shell (title + See All link). Each row composes a checkbox, title +
          description, status tag pair, and date.
        </p>
        <DocsExample
          title="Full widget — 2 rows"
          preview={
            <div className="max-w-md">
              <WidgetShell title="Notes" seeAll>
                <div className="space-y-2">
                  <NoteRow
                    done={false}
                    title="Quarterly report prep"
                    desc="Compile Q3 numbers."
                    tags={["Today", "Waiting Feedback"]}
                    date="Aug 02"
                  />
                  <NoteRow
                    done
                    title="Update onboarding deck"
                    desc="Refresh team slides."
                    tags={["Today", "Waiting Feedback"]}
                    date="Aug 02"
                  />
                </div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title="Notes" seeAll>
  <NoteRow title="..." desc="..." tags={["Today", "Waiting Feedback"]} date="Aug 02" />
  <NoteRow done title="..." desc="..." tags={["Today", "Waiting Feedback"]} date="Aug 02" />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Note row states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two states drive every Notes row. Active rows surface coloured status
          tags; completed rows mute everything to 60% opacity and strike through
          the title — guiding the eye to outstanding work first.
        </p>
        <DocsExample
          title="Active (default)"
          preview={
            <div className="max-w-md">
              <NoteRow
                done={false}
                title="Insert note title here."
                desc="Insert note description here."
                tags={["Today", "Waiting Feedback"]}
                date="Aug 02"
              />
            </div>
          }
          code={`<NoteRow
  done={false}
  title="Insert note title here."
  desc="Insert note description here."
  tags={["Today", "Waiting Feedback"]}
  date="Aug 02"
/>`}
        />
        <DocsExample
          title="Completed"
          preview={
            <div className="max-w-md">
              <NoteRow
                done
                title="Insert note title here."
                desc="Insert note description here."
                tags={["Today", "Waiting Feedback"]}
                date="Aug 02"
              />
            </div>
          }
          code={`<NoteRow
  done
  title="Insert note title here."
  desc="Insert note description here."
  tags={["Today", "Waiting Feedback"]}
  date="Aug 02"
/>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "done", type: "boolean", defaultValue: "false", description: "Checks the leading circle (success-base fill), mutes title/desc/date to soft-400, and converts tag fills into stroke-only outline chips." },
            { name: "title", type: "string", description: "Short note headline. Truncates on overflow." },
            { name: "desc", type: "string", description: "Secondary description line." },
            { name: "tags", type: "string[]", description: "Up to two short status tags. First tag uses an error tint (overdue / today), the second uses warning (waiting feedback)." },
            { name: "date", type: "string", description: "Trailing due date, paired with a calendar icon." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Leading checkbox</strong> — 16×16 circle, success-base fill when done, soft stroke when active.</li>
          <li><strong>Title + description</strong> — 14/12 type pair. Both mute to soft-400 on completion (no strikethrough — Figma 3872:24015).</li>
          <li><strong>Trailing date</strong> — calendar icon + short month/day text, sub-600 tone (soft-400 on done).</li>
          <li><strong>Tag pair</strong> — left-indented under the title (pl-6), Today (error tint) + Waiting Feedback (warning tint). Both become stroke-only outline chips when the row is complete.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Usage">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Cap the widget at 3–4 rows in the dashboard — link to a fuller list via See&nbsp;All.</li>
          <li>Sort active items above completed; let completed fade beneath the fold.</li>
          <li>Reserve the first tag slot for urgency (Today / Overdue), second slot for status.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ============================================================================ */

function WidgetShell({
  title,
  seeAll,
  children,
  className,
}: {
  title: React.ReactNode
  seeAll?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {seeAll ? <LinkButton size="sm">See All</LinkButton> : null}
      </div>
      {children}
    </div>
  )
}

function NoteRow({
  done,
  title,
  desc,
  tags,
  date,
}: {
  done: boolean
  title: string
  desc: string
  tags: string[]
  date: string
}) {
  return (
    <div className="rounded-lg p-2.5 space-y-1.5">
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-full border mt-0.5",
            done
              ? "bg-success-base border-success-base text-white"
              : "border-stroke-soft-200",
          )}
        >
          {done ? <Check className="size-2.5" /> : null}
        </span>
        <div className="flex-1 min-w-0">
          <div className={cn("text-sm font-medium", done ? "text-text-soft-400" : "text-text-strong-950")}>
            {title}
          </div>
          <div className={cn("text-xs", done ? "text-text-soft-400" : "text-text-sub-600")}>{desc}</div>
        </div>
        <div className={cn("text-xs inline-flex items-center gap-1", done ? "text-text-soft-400" : "text-text-sub-600")}>
          <CalendarI className="size-3" />
          {date}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 pl-6">
        {tags.map((t, i) => (
          <span
            key={t}
            className={cn(
              "inline-flex items-center rounded-full px-2 h-5 text-[10px]",
              done
                ? "border border-stroke-soft-200 text-text-soft-400"
                : i === 0
                  ? "bg-error-lighter text-error-darker"
                  : "bg-warning-lighter text-warning-darker",
            )}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
