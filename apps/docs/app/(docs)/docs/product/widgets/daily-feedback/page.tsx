"use client"

import * as React from "react"
import { RiChatSmile2Line as ChatIcon } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
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
 * Daily Feedback widget — Figma 1:1 (re-verified 2026-05-19).
 *   3449:24209   Daily Feedback — input state (Empty=Off): step badge "01" +
 *                "Question 1/4" right counter + question + subtitle + 5-emoji
 *                row + "Tell us why!" textarea + Next Question CTA.
 *   3871:19209   Daily Feedback — empty state (Empty=On): illustration +
 *                "No records of feedback yet. Please check back later."
 *
 * The semi-arc gauge appears in Work Hour Analysis / Time Off etc., not in
 * Daily Feedback's canonical input state — it is retained below as a
 * reusable building block.
 *
 * Earlier draft had these IDs but they belong to other families:
 *   3871:18316 → Time Off (Empty=On)
 *   3871:18714 → Current Project (Empty=On)
 *   3871:19192 → Status Tracker (Empty=On)
 *   2950:6345  → Status Tracker (Empty=Off)
 */
export default function DailyFeedbackWidgetPage() {
  const [picked, setPicked] = React.useState<number | null>(null)
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Daily Feedback"
        description="Single-question mood pulse. A 5-emoji rating row collects a response; once a streak builds up, the body switches to a semi-arc gauge that visualises sentiment out of 20 datapoints."
      />

      <DocsSection title="Full widget — input state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default state (Figma node 3449:24209). Title bar carries a chat glyph
          and a right-aligned <code>Question 1/4</code> counter. Body opens with
          a purple step badge, the question prompt + subtitle, the 5-emoji
          rating row, a <em>Tell us why!</em> textarea, and a full-width
          stroke <em>Next Question</em> CTA.
        </p>
        <DocsExample
          title="Input"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={
                  <span className="inline-flex items-center gap-1.5">
                    <ChatIcon className="size-4 text-icon-sub-600" />
                    Daily Feedback
                  </span>
                }
                trailing={<span className="text-xs text-text-soft-400">Question 1/4</span>}
              >
                <div className="text-center space-y-3 py-2">
                  <StepBadge step={1} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-text-strong-950">How would you rate your mood today?</p>
                    <p className="text-xs text-text-sub-600">Share your mood to help us understand.</p>
                  </div>
                  <MoodRow value={picked} onChange={setPicked} />
                  <textarea
                    className="w-full min-h-16 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 text-xs text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-(--primary-alpha-24) resize-none"
                    placeholder="Tell us why!"
                  />
                  <Button style="stroke" tone="neutral" size="sm" className="w-full">Next Question</Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title={<><ChatIcon /> Daily Feedback</>} trailing="Question 1/4">
  <StepBadge step={1} />
  <p>How would you rate your mood today?</p>
  <p className="subtitle">Share your mood to help us understand.</p>
  <MoodRow value={picked} onChange={setPicked} />
  <textarea placeholder="Tell us why!" />
  <Button style="stroke" tone="neutral" className="w-full">Next Question</Button>
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          When no responses have been logged for the period (Figma node 3871:19209).
          Body is replaced by a centred illustration + helper copy.
        </p>
        <DocsExample
          title="No records"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={
                  <span className="inline-flex items-center gap-1.5">
                    <ChatIcon className="size-4 text-icon-sub-600" />
                    Daily Feedback
                  </span>
                }
              >
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <EmptyStateIllustration kind="daily-feedback" />
                  <p className="text-xs text-text-sub-600">
                    No records of feedback yet.<br />Please check back later.
                  </p>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title={<><ChatIcon /> Daily Feedback</>}>
  <EmptyState illustration="📋" lines={["No records of feedback yet.", "Please check back later."]} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Full widget — aggregate state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Results state. Once responses accumulate, the body swaps to a semi-arc
          gauge with the aggregate sentiment score.
        </p>
        <DocsExample
          title="Aggregate"
          preview={
            <div className="max-w-sm">
              <WidgetShell title="Daily Feedback" seeAll>
                <div className="text-center space-y-2 py-2">
                  <FeedbackGauge value={15} max={20} unit="OUT OF 20" />
                  <p className="text-xs text-text-sub-600">15 of 20 teammates rated their mood positively.</p>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title="Daily Feedback" seeAll>
  <FeedbackGauge value={15} max={20} unit="OUT OF 20" />
  <p className="text-xs text-text-sub-600">15 of 20 teammates rated their mood positively.</p>
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Mood rating row">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Five emoji buttons — Bad, Meh, Okay, Good, Great. Hover scales the
          glyph; the active selection adds a primary-alpha-10 disc behind the
          emoji.
        </p>
        <DocsExample
          title="5 ratings"
          preview={
            <div className="max-w-sm">
              <MoodRow value={picked} onChange={setPicked} />
            </div>
          }
          code={`<MoodRow value={picked} onChange={setPicked} />`}
        />
      </DocsSection>

      <DocsSection title="Gauge fills">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Reusable semi-arc gauge — fills at 0% / 25% / 50% / 75% / 100%.
        </p>
        <DocsExample
          title="0 / 5 / 10 / 15 / 20 of 20"
          preview={
            <div className="flex flex-wrap items-end gap-4">
              {[0, 5, 10, 15, 20].map((v) => (
                <FeedbackGauge key={v} value={v} max={20} unit="OUT OF 20" />
              ))}
            </div>
          }
          code={`<FeedbackGauge value={10} max={20} unit="OUT OF 20" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "MoodRow.value", type: "number | null", description: "Selected rating index 0..4 (Bad..Great). Null = unselected." },
            { name: "MoodRow.onChange", type: "(v: number) => void", description: "Fires when an emoji is tapped." },
            { name: "FeedbackGauge.value", type: "number", description: "Current value." },
            { name: "FeedbackGauge.max", type: "number", defaultValue: "20", description: "Total scale (denominator)." },
            { name: "FeedbackGauge.unit", type: "string", defaultValue: '"OUT OF 20"', description: "Micro-uppercase label beneath the value." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Question prompt</strong> — sm body, text-strong-950, centred above the rating row.</li>
          <li><strong>Mood row</strong> — 5 emoji buttons, gap-2, 2xl emoji size. Active disc = primary-alpha-10.</li>
          <li><strong>Submit CTA</strong> — filled primary Button (sm). Disabled when value is null.</li>
          <li><strong>Gauge</strong> — semi-arc 100×50 viewBox, primary-base stroke, stroke-soft-200 track. Value + unit centred under the arc.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Usage">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Stage one question per session; don&apos;t chain &gt; 3 questions a day.</li>
          <li>Roll over to aggregate state only once your team has at least 5 responses for the period.</li>
          <li>Preserve emoji order — left-to-right intensity grows. Do not localise or swap glyphs without research.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ============================================================================ */

function WidgetShell({
  title,
  seeAll,
  trailing,
  children,
  className,
}: {
  title: React.ReactNode
  seeAll?: boolean
  trailing?: React.ReactNode
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
      <div className="flex items-center gap-2 pb-2 border-b border-stroke-soft-200">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {trailing}
        {seeAll ? <LinkButton size="sm">See All</LinkButton> : null}
      </div>
      {children}
    </div>
  )
}

function StepBadge({ step }: { step: number }) {
  return (
    <div className="mx-auto inline-flex size-10 items-center justify-center rounded-full bg-(--primary-alpha-10) text-sm font-semibold text-(--primary-base)">
      {String(step).padStart(2, "0")}
    </div>
  )
}

const MOODS = ["😟", "😐", "🙂", "😀", "🤩"] as const

function MoodRow({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {MOODS.map((emoji, i) => {
        const active = value === i
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(i)}
            aria-label={`Rate mood ${i + 1} of 5`}
            aria-pressed={active}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full text-2xl transition-transform",
              active ? "bg-(--primary-alpha-10) scale-110" : "hover:scale-110",
            )}
          >
            {emoji}
          </button>
        )
      })}
    </div>
  )
}

function FeedbackGauge({
  value,
  max,
  unit,
}: {
  value: number
  max: number
  unit: string
}) {
  const ratio = Math.max(0, Math.min(1, value / max))
  const circumference = Math.PI * 35
  const offset = circumference * (1 - ratio)
  return (
    <div className="relative w-36 h-20">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <path
          d="M10 45 A35 35 0 1 1 90 45"
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M10 45 A35 35 0 1 1 90 45"
          fill="none"
          stroke="var(--primary-base)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <div className={cn("text-xl font-semibold tabular-nums", value === 0 ? "text-text-soft-400" : "text-text-strong-950")}>
          {value}
        </div>
        <div className="text-[9px] uppercase tracking-wider text-text-soft-400">{unit}</div>
      </div>
    </div>
  )
}
