"use client"

import * as React from "react"
import { RiAddLine as Plus } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Credit Score widget — Figma 1:1 (re-verified 2026-05-19).
 *
 *   3963:5442    Credit Score — loaded ("Your credit score is 710" + Excellent
 *                copy + 30-tick gauge bar + sunglasses emoji avatar + "Details" CTA)
 *   3963:12015   Credit Score — empty ("Your credit score is 0" + neutral copy
 *                + ghosted gauge ticks + "+ Apply" CTA)
 *
 * Real Figma anatomy: header title + trailing stroke button ("Details" loaded,
 * "+ Apply" empty). Body = inline "Your credit score is **N**" headline + 1-line
 * supporting sentence + 30-tick horizontal fuel-gauge bar that fills proportional
 * to score. Loaded variant adds a sunglasses-emoji avatar on the right of the copy.
 */

const TIERS = [
  { label: "Poor", min: 300, max: 579, tone: "error" as const, copy: "is considered to be Poor" },
  { label: "Fair", min: 580, max: 669, tone: "error" as const, copy: "is considered to be Fair" },
  { label: "Good", min: 670, max: 739, tone: "warning" as const, copy: "is considered to be Good" },
  { label: "Very Good", min: 740, max: 799, tone: "success" as const, copy: "is considered to be Very Good" },
  { label: "Excellent", min: 800, max: 850, tone: "success" as const, copy: "is considered to be Excellent" },
]

function tierFor(score: number) {
  if (score >= 740) return TIERS[4]
  if (score >= 670) return TIERS[3]
  if (score >= 580) return TIERS[2]
  if (score >= 300) return TIERS[1]
  return TIERS[0]
}

export default function CreditScoreWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Credit Score"
        description="Snapshot card surfacing the user's credit score with a 30-tick fuel-gauge bar. Inline headline reads 'Your credit score is N' with a single supporting sentence under it. Empty state swaps the Details trigger for an Apply CTA and ghosts the gauge."
      />

      <DocsSection title="Loaded — score 710 (Excellent peer)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Figma node 3963:5442. Gauge ticks fill green up to the current score; remaining ticks render soft-200. Right
          rail shows a sunglasses-emoji avatar — celebratory affordance.
        </p>
        <DocsExample
          title="710 · Excellent"
          preview={
            <div className="max-w-sm">
              <CreditScoreLoaded score={710} />
            </div>
          }
          code={`<CreditScore score={710} />`}
        />
      </DocsSection>

      <DocsSection title="Loaded — score variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Same shell across the FICO tier ladder. Bar fill ratio = (score - 300) / 550. Tone is informational only —
          the supporting sentence carries the verdict, gauge stays primary tint.
        </p>
        <DocsExample
          title="Poor / Fair / Good / Very Good / Excellent"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              {[450, 620, 700, 760, 820].map((s) => (
                <CreditScoreLoaded key={s} score={s} />
              ))}
            </div>
          }
          code={`<CreditScore score={450} />
<CreditScore score={620} />
<CreditScore score={700} />
<CreditScore score={760} />
<CreditScore score={820} />`}
        />
      </DocsSection>

      <DocsSection title="Empty">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Figma node 3963:12015. Score = 0, ghosted gauge, header swaps Details for "+ Apply".
        </p>
        <DocsExample
          title="No credit history"
          preview={
            <div className="max-w-sm">
              <CreditScoreEmpty />
            </div>
          }
          code={`<CreditScore state="empty" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "score", type: "number", description: "Credit score headline (300–850). Drives gauge fill + verdict copy." },
            { name: "state", type: '"loaded" | "empty"', defaultValue: '"loaded"', description: "Loaded shows score + Details; empty zeros the gauge + shows Apply." },
            { name: "onDetails", type: "() => void", description: "Header CTA — opens the credit history report." },
            { name: "onApply", type: "() => void", description: "Empty-state CTA — starts the application flow." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Header</strong> — title + trailing stroke button (Details or + Apply).</li>
          <li><strong>Headline</strong> — "Your credit score is" sub copy + bold tabular-nums score, inline on one line.</li>
          <li><strong>Subtitle</strong> — single sentence with the tier verdict ("is considered to be Excellent").</li>
          <li><strong>Gauge</strong> — 30 narrow ticks, success-base fill up to score, soft-200 for remainder.</li>
          <li><strong>Loaded avatar</strong> — sunglasses-emoji 🤩 on the right of the headline row.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function WidgetShell({
  title,
  trailing,
  children,
  className,
}: {
  title: React.ReactNode
  trailing?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2", className)}>
      <div className="flex items-center gap-2 pb-2 border-b border-stroke-soft-200">
        <div className="text-sm font-medium text-text-strong-950 flex-1 inline-flex items-center gap-1.5">
          {title}
        </div>
        {trailing}
      </div>
      {children}
    </div>
  )
}

function GaugeTicks({ score, max = 850, empty = false }: { score: number; max?: number; empty?: boolean }) {
  const total = 30
  const ratio = empty ? 0 : Math.max(0, Math.min(1, (score - 300) / (max - 300)))
  const filled = Math.round(total * ratio)
  return (
    <div className="flex items-end gap-[2px]" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-4 w-1 rounded-sm",
            i < filled ? "bg-success-base" : "bg-bg-soft-200",
          )}
        />
      ))}
    </div>
  )
}

function CreditScoreLoaded({ score }: { score: number }) {
  const tier = tierFor(score)
  return (
    <WidgetShell
      title="Credit Score"
      trailing={
        <Button style="stroke" tone="neutral" size="xs">
          Details
        </Button>
      }
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-text-strong-950">
            Your <span className="font-semibold">credit score</span> is{" "}
            <span className="text-xl font-semibold tabular-nums">{score}</span>
          </div>
          <div className="text-xs text-text-sub-600">
            This score {tier.copy}.
          </div>
        </div>
        <span
          className="inline-flex size-9 items-center justify-center rounded-full bg-warning-lighter text-base"
          aria-hidden
        >
          🤩
        </span>
      </div>
      <GaugeTicks score={score} />
    </WidgetShell>
  )
}

function CreditScoreEmpty() {
  return (
    <WidgetShell
      title="Credit Score"
      trailing={
        <Button style="stroke" tone="neutral" size="xs">
          <Plus className="size-3.5" />
          Apply
        </Button>
      }
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-text-sub-600">
            Your <span className="font-semibold text-text-strong-950">credit score</span> is{" "}
            <span className="text-xl font-semibold tabular-nums text-text-strong-950">0</span>
          </div>
          <div className="text-xs text-text-sub-600">
            Feel free to build your credit history to see your score.
          </div>
        </div>
      </div>
      <GaugeTicks score={0} empty />
    </WidgetShell>
  )
}
