"use client"

import * as React from "react"
import { RiSpeedUpLine, RiAddLine } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
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
 * Finance Widget — Credit Score. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-credit-score.tsx + score-track-chart.tsx (d3).
 *
 * Track replicates the d3 `ScoreTrackChart`: 36 bars × 22h, 4px gap.
 * Filled count = round((value − min) / (max − min) × count). Source default value = 72.
 */

export default function FinanceCreditScoreWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="Credit Score"
        description="Headline credit score sentence + emoji medallion, plus a 36-segment fill-track that visualises the 0–100 score band. Source ships 710 / Excellent at 72% on a 36-bar track."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="710 — Excellent"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiSpeedUpLine className="size-4 text-icon-sub-600" /> Credit Score</>}
                action={<Button tone="neutral" style="stroke" size="xs">Details</Button>}
              >
                <Divider />
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex-1">
                    <p className="text-lg text-text-sub-600">
                      Your <span className="font-medium text-text-strong-950">credit score</span> is{" "}
                      <span className="font-medium text-text-strong-950">710</span>
                    </p>
                    <p className="mt-1 text-xs text-text-sub-600">This score is considered to be Excellent.</p>
                  </div>
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-warning-lighter text-xl">
                    😎
                  </div>
                </div>
                <div className="pt-4">
                  <ScoreTrack value={72} />
                </div>
              </WidgetShell>
            </div>
          }
          code={`<CreditScore value={710} max={850} band="Excellent" emoji="😎" trackValue={72} />`}
        />
      </DocsSection>

      <DocsSection title="Score bands">
        <DocsExample
          title="Track fill at 4 thresholds"
          preview={
            <div className="space-y-3 max-w-md">
              {[
                { label: "Poor — 320 (15%)", value: 15 },
                { label: "Fair — 580 (40%)", value: 40 },
                { label: "Good — 660 (60%)", value: 60 },
                { label: "Excellent — 710 (72%)", value: 72 },
              ].map((b) => (
                <div key={b.label} className="space-y-1">
                  <div className="text-xs text-text-sub-600">{b.label}</div>
                  <ScoreTrack value={b.value} />
                </div>
              ))}
            </div>
          }
          code={`<ScoreTrack value={15} /> // Poor
<ScoreTrack value={40} /> // Fair
<ScoreTrack value={60} /> // Good
<ScoreTrack value={72} /> // Excellent`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No history yet"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiSpeedUpLine className="size-4 text-icon-sub-600" /> Credit Score</>}
                action={<Button tone="neutral" style="stroke" size="xs"><RiAddLine /> Apply</Button>}
              >
                <Divider />
                <div className="pt-4">
                  <p className="text-lg text-text-soft-400">
                    Your <span className="font-medium text-text-sub-600">credit score</span> is{" "}
                    <span className="font-medium text-text-sub-600">0</span>
                  </p>
                  <p className="mt-1 text-xs text-text-soft-400">Feel free to build your credit history to see your score.</p>
                </div>
                <div className="pt-4">
                  <ScoreTrack value={0} />
                </div>
              </WidgetShell>
            </div>
          }
          code={`<CreditScoreEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "number", description: "Numeric score (e.g. 710)." },
            { name: "max", type: "number", defaultValue: "850", description: "Top of the scale." },
            { name: "band", type: "string", description: "Friendly label — Poor · Fair · Good · Excellent." },
            { name: "emoji", type: "string", description: "Single-char tone glyph rendered in warning-lighter bubble." },
            { name: "trackValue", type: "number", defaultValue: "72", description: "0–100 fill percent for the 36-bar ScoreTrack." },
            { name: "count", type: "number", defaultValue: "36", description: "Number of bars on the track." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Headline line</strong> — paragraph-lg sub-600 with <em>credit score</em> + numeric in strong-950.</li>
          <li><strong>Caption</strong> — paragraph-xs sub-600 (band qualifier).</li>
          <li><strong>Emoji medallion</strong> — 44px circle, bg-warning-lighter background, single emoji glyph.</li>
          <li><strong>ScoreTrack</strong> — 36 equal-width bars, 22px tall, 4px gap. Filled bars = success-base (green), empty = bg-soft-200.</li>
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
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2 min-h-8 mb-3">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function ScoreTrack({ value, count = 36, min = 0, max = 100 }: { value: number; count?: number; min?: number; max?: number }) {
  const filled = Math.round(((value - min) / (max - min)) * count)
  return (
    <div className="flex w-full items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("h-[22px] flex-1 rounded-[2px]", i < filled ? "bg-(--state-success-base)" : "bg-bg-soft-200")}
        />
      ))}
    </div>
  )
}
