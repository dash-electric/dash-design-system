"use client"

import * as React from "react"
import { RiDiscussLine, RiChat3Line } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
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
 * HR Widget — Daily Feedback. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-daily-feedback.tsx
 */
const MOODS = ["😔", "😕", "😐", "🙂", "😄"] as const

export default function HRDailyFeedbackWidgetPage() {
  const [rating, setRating] = React.useState<number | null>(null)
  const [text, setText] = React.useState("")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Daily Feedback"
        description="Single-question pulse. Numbered step badge + prompt, 5-emoji rating row, optional textarea reveal, and a Next Question advance CTA. Tracks `Question N/4`."
      />

      <DocsSection title="Full widget — Question 1/4">
        <DocsExample
          title="Mood prompt"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={<><RiDiscussLine className="size-4 text-icon-sub-600" /> Daily Feedback</>}
                action={<div className="text-xs text-text-soft-400">Question 1/4</div>}
              >
                <Divider />
                <div className="space-y-4 pt-4">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-(--primary-alpha-16) text-sm font-medium text-primary">
                      01
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-text-strong-950">How would you rate your mood today?</div>
                      <div className="text-xs text-text-sub-600">Share your mood to help us understand.</div>
                    </div>
                  </div>
                  <RatingBarWithTextarea
                    value={rating}
                    onChange={setRating}
                    text={text}
                    onText={setText}
                  />
                  <Button tone="neutral" style="stroke" size="sm" className="w-full">Next Question</Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<RatingBarWithTextarea value={rating} onChange={setRating} text={text} onText={setText} />`}
        />
      </DocsSection>

      <DocsSection title="Rating bar — emoji row">
        <DocsExample
          title="5 mood emojis"
          preview={
            <div className="max-w-sm">
              <RatingBarWithTextarea value={rating} onChange={setRating} text={text} onText={setText} />
            </div>
          }
          code={`<RatingBarWithTextarea value={rating} onChange={setRating} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No records of feedback yet"
          preview={
            <div className="max-w-sm">
              <WidgetShell title={<><RiDiscussLine className="size-4 text-icon-sub-600" /> Daily Feedback</>}>
                <Divider />
                <div className="flex flex-col items-center justify-center gap-4 py-14">
                  <EmptyStateIllustration kind="daily-feedback" />
                  <p className="text-center text-sm text-text-soft-400">
                    No records of feedback yet.<br /> Please check back later.
                  </p>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<EmptyState title="No records of feedback yet" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "number | null", description: "Picked emoji index (1-5) or null." },
            { name: "onChange", type: "(v: string) => void", description: "Fires when emoji tapped." },
            { name: "text", type: "string", description: "Optional textarea body." },
            { name: "onText", type: "(v: string) => void", description: "Fires on textarea change." },
            { name: "questionIndex", type: "number", description: "Current step (1-4) drives the badge and `N/4` label." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Header</strong> — RiDiscussLine + "Daily Feedback" + "Question N/4" micro-label.</li>
          <li><strong>Step badge</strong> — 40px disc, primary-alpha-16 fill, "01" mono.</li>
          <li><strong>Prompt</strong> — sm-medium title + xs sub-600 helper.</li>
          <li><strong>Rating row</strong> — 5 emoji buttons + textarea reveal on selection ("Tell us why" placeholder).</li>
          <li><strong>Footer</strong> — neutral-stroke full-width Button "Next Question".</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function RatingBarWithTextarea({
  value,
  onChange,
  text,
  onText,
}: {
  value: number | null
  onChange: (v: number) => void
  text: string
  onText: (v: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-1">
        {MOODS.map((emoji, i) => {
          const idx = i + 1
          const active = value === idx
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(idx)}
              aria-pressed={active}
              className={cn(
                "inline-flex size-12 items-center justify-center rounded-full text-3xl transition-all",
                active ? "bg-(--primary-alpha-10) scale-110" : "hover:bg-bg-weak-50 hover:scale-105",
              )}
            >
              {emoji}
            </button>
          )
        })}
      </div>
      {value !== null && (
        <textarea
          value={text}
          onChange={(e) => onText(e.target.value)}
          placeholder="Tell us why"
          rows={3}
          className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-(--primary-alpha-10)"
        />
      )}
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
