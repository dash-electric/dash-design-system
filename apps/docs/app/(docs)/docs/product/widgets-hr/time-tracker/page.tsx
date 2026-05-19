"use client"

import * as React from "react"
import {
  RiTimerFlashLine,
  RiHistoryLine,
  RiArrowDownSLine,
  RiMore2Line,
  RiPlayCircleFill,
  RiPauseCircleFill,
  RiStopCircleFill,
  RiBriefcaseLine,
} from "@remixicon/react"
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
 * HR Widget — Time Tracker. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-time-tracker.tsx
 *
 * Live tracker for the active project + history of previous tasks.
 */
const HISTORY = [
  { brand: "L", title: "Loom Rebranding", time: "1:23:05" },
  { brand: "E", title: "Evernote App Redesign", time: "3:14:26" },
]

export default function HRTimeTrackerWidgetPage() {
  const [isOngoing, setIsOngoing] = React.useState(false)
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Time Tracker"
        description="Live Pomodoro / billable-hours timer scoped to a project, paired with a previous-tasks history list. Two states — Awaiting (start CTA) and Ongoing (pause / stop split)."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Active project + history"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={<><RiTimerFlashLine className="size-4 text-icon-sub-600" /> Time Tracker</>}
                action={<Button tone="neutral" style="stroke" size="xs" leftIcon={<RiHistoryLine className="size-3.5" />}>History</Button>}
              >
                <div className="space-y-4">
                  <TrackerCard ongoing={isOngoing} onToggle={() => setIsOngoing((p) => !p)} />
                  <div className="text-[10px] uppercase tracking-wider text-text-soft-400">Previous Tasks</div>
                  {HISTORY.map((h) => <HistoryRow key={h.title} {...h} />)}
                </div>
              </WidgetShell>
            </div>
          }
          code={`<TrackerCard ongoing={isOngoing} onToggle={setIsOngoing} />`}
        />
      </DocsSection>

      <DocsSection title="Tracker states">
        <DocsExample
          title="Awaiting / Ongoing"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <TrackerCard ongoing={false} />
              <TrackerCard ongoing={true} />
            </div>
          }
          code={`<TrackerCard ongoing={false} />
<TrackerCard ongoing={true} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No tracked time yet"
          preview={
            <div className="max-w-sm">
              <WidgetShell title={<><RiTimerFlashLine className="size-4 text-icon-sub-600" /> Time Tracker</>}>
                <div className="space-y-4">
                  <TrackerCard ongoing={false} />
                  <div className="flex flex-col items-center gap-3 py-6">
                    <RiHistoryLine className="size-8 text-text-soft-400" />
                    <p className="text-center text-sm text-text-soft-400">No records of tracked time yet.</p>
                  </div>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<EmptyState />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "project", type: "string", description: "Currently selected project label." },
            { name: "ongoing", type: "boolean", description: "Awaiting (false) vs Ongoing (true) state." },
            { name: "onStart / onPause / onResume / onStop", type: "(time?: number) => void", description: "Wire to your state machine. Stop reports elapsed ms." },
            { name: "history[]", type: "{ brand, title, time }[]", description: "Previous-task rows." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Project picker</strong> — brand glyph + project name + chevron, h-8, rounded-t-10, bg-weak-50.</li>
          <li><strong>Body</strong> — state label (Awaiting / Ongoing, micro-uppercase) + mono clock 02:44:22 + action row.</li>
          <li><strong>Awaiting action</strong> — primary text "Start Time Tracker" with Play icon.</li>
          <li><strong>Ongoing action</strong> — Pause + Stop split with hairline divider; Stop is error-base.</li>
          <li><strong>History row</strong> — 40px ring-stroke brand badge + title + duration + more menu.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function TrackerCard({ ongoing, onToggle }: { ongoing: boolean; onToggle?: () => void }) {
  return (
    <div>
      <button
        type="button"
        className="group flex h-8 w-full items-center gap-2 rounded-t-[10px] bg-bg-weak-50 border border-stroke-soft-200 pl-3 pr-2.5 text-left transition-colors hover:bg-bg-white-0"
      >
        <RiBriefcaseLine className="size-4 text-icon-sub-600" />
        <div className="flex-1 text-sm text-text-sub-600">Monday.com Redesign</div>
        <RiArrowDownSLine className="size-4 text-text-sub-600" />
      </button>
      <div className="rounded-b-[10px] border border-t-0 border-stroke-soft-200 p-4">
        <div className="text-center text-[10px] uppercase tracking-wider text-text-soft-400 mb-2">
          {ongoing ? "Ongoing" : "Awaiting"}
        </div>
        <div className="font-mono text-2xl font-medium tabular-nums text-center text-text-strong-950">
          {ongoing ? "02:44" : "00:00"}
          <span className="text-text-soft-400">:{ongoing ? "22" : "00"}</span>
        </div>
        {ongoing ? (
          <div className="flex items-center justify-center gap-3 mt-2">
            <button onClick={onToggle} className="inline-flex items-center gap-1 text-sm text-text-strong-950" aria-label="Pause">
              <RiPauseCircleFill className="size-4" /> Pause
            </button>
            <span className="text-text-soft-400" aria-hidden>|</span>
            <button onClick={onToggle} className="inline-flex items-center gap-1 text-sm text-(--state-error-base)" aria-label="Stop">
              <RiStopCircleFill className="size-4" /> Stop
            </button>
          </div>
        ) : (
          <button onClick={onToggle} className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-2 w-full justify-center" aria-label="Start">
            <RiPlayCircleFill className="size-4" /> Start Time Tracker
          </button>
        )}
      </div>
    </div>
  )
}

function HistoryRow({ brand, title, time }: { brand: string; title: string; time: string }) {
  return (
    <div className="flex w-full items-start gap-2.5">
      <div className="flex size-10 items-center justify-center rounded-full bg-bg-white-0 border border-stroke-soft-200 text-sm font-bold text-text-strong-950">{brand}</div>
      <div className="flex-1 space-y-0.5">
        <div className="text-sm text-text-strong-950">{title}</div>
        <div className="text-xs text-text-sub-600 font-mono tabular-nums">{time}</div>
      </div>
      <button className="size-7 rounded-md hover:bg-bg-weak-50 inline-flex items-center justify-center text-text-sub-600">
        <RiMore2Line className="size-4" />
      </button>
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
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm space-y-3", className)}>
      <div className="flex items-center gap-2 h-9">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      <Divider />
      {children}
    </div>
  )
}
