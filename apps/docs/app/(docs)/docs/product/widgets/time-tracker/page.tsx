"use client"

import * as React from "react"
import {
  RiArrowDownSLine as ChevronDown,
  RiArrowUpSLine as ChevronUp,
  RiPlayCircleFill as Play,
  RiPauseCircleFill as Pause,
  RiStopCircleFill as Stop,
  RiBriefcaseLine as Briefcase,
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
 * Time Tracker widget — Figma 1:1 (6 nodes verified 2026-05-18).
 *   3849:32127   Project picker — closed (default)
 *   3849:32153   Project picker — hover / focused outline
 *   3849:32164   Project picker — open (chevron up)
 *   3849:32181   Project picker — alt project state
 *   3849:32207   Tracker body — Awaiting (00:00:00 + Start CTA)
 *   3849:32210   Tracker body — Ongoing (running clock + Pause / Stop)
 */
export default function TimeTrackerWidgetPage() {
  const [project, setProject] = React.useState("Monday.com Redesign")
  const [state, setState] = React.useState<"awaiting" | "ongoing">("awaiting")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Time Tracker"
        description="Project-scoped Pomodoro / billable-hours timer. Header surfaces a project picker; body switches between Awaiting and Ongoing states with mono digit clock + action button row."
      />

      <DocsSection title="Full widget">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Header replaces the standard widget title with a Project Picker control.
          The body switches between Awaiting (00:00:00 + Start CTA) and Ongoing
          (running clock + Pause / Stop) states.
        </p>
        <DocsExample
          title="Awaiting + Ongoing"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <WidgetShell title={<ProjectPicker value={project} onChange={setProject} />}>
                <TimeTracker state="awaiting" />
              </WidgetShell>
              <WidgetShell title={<ProjectPicker value={project} onChange={setProject} />}>
                <TimeTracker state="ongoing" />
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title={<ProjectPicker value={project} onChange={setProject} />}>
  <TimeTracker state="awaiting" />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Project picker">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Replaces the widget title slot. Renders a brand icon + project name +
          chevron. Toggle the open state to reveal a future dropdown of projects.
        </p>
        <DocsExample
          title="Closed / open"
          preview={
            <div className="space-y-2 max-w-xs">
              <ProjectPicker value="Monday.com Redesign" />
              <ProjectPicker value="Monday.com Redesign" open />
            </div>
          }
          code={`<ProjectPicker value="Monday.com Redesign" />
<ProjectPicker value="Monday.com Redesign" open />`}
        />
      </DocsSection>

      <DocsSection title="Tracker states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two body states. Awaiting keeps everything muted to invite a Start.
          Ongoing flips the seconds segment to soft-400 to draw the eye onto the
          live minute count.
        </p>
        <DocsExample
          title="Awaiting"
          preview={
            <div className="max-w-xs">
              <TimeTracker state="awaiting" onToggle={() => setState("ongoing")} />
            </div>
          }
          code={`<TimeTracker state="awaiting" />`}
        />
        <DocsExample
          title="Ongoing"
          preview={
            <div className="max-w-xs">
              <TimeTracker state="ongoing" onToggle={() => setState("awaiting")} />
            </div>
          }
          code={`<TimeTracker state="ongoing" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "TimeTracker.state", type: '"awaiting" | "ongoing"', defaultValue: '"awaiting"', description: "Toggle the body — 00:00:00 + Start CTA vs running clock + Pause / Stop pair." },
            { name: "TimeTracker.onToggle", type: "() => void", description: "Fires when Start, Pause, or Stop is clicked. Caller drives the state machine." },
            { name: "ProjectPicker.value", type: "string", description: "Currently selected project label." },
            { name: "ProjectPicker.onChange", type: "(v: string) => void", description: "Fires when a new project is picked from the dropdown." },
            { name: "ProjectPicker.open", type: "boolean", defaultValue: "false", description: "Controlled open state — flips the chevron." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Project picker</strong> — brand glyph (rounded square) + name + chevron. Sits in the widget header slot.</li>
          <li><strong>State label</strong> — micro-uppercase "Awaiting" / "ongoing" above the clock.</li>
          <li><strong>Clock</strong> — font-mono, 24px, tabular-nums. Seconds segment muted to text-soft-400.</li>
          <li><strong>Action row</strong> — Awaiting shows a single primary-tinted Start. Ongoing shows Pause + Stop split by a hairline divider.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Usage">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Drive the state from the parent — never let the widget self-toggle in unit tests.</li>
          <li>Keep the clock visually anchored: do not animate the seconds digit width as it ticks.</li>
          <li>If no project is selected, render the picker placeholder ("Select a project") and disable Start.</li>
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

function ProjectPicker({
  value,
  onChange,
  open,
}: {
  value: string
  onChange?: (v: string) => void
  open?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(value)}
      className="inline-flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2.5 h-9 w-full text-sm"
    >
      <span className="inline-flex size-5 items-center justify-center rounded-md bg-white">
        <Briefcase className="size-3.5 text-icon-sub-600" />
      </span>
      <span className="flex-1 text-left truncate text-text-strong-950">{value}</span>
      {open ? (
        <ChevronUp className="size-3.5 text-text-soft-400" />
      ) : (
        <ChevronDown className="size-3.5 text-text-soft-400" />
      )}
    </button>
  )
}

function TimeTracker({
  state = "awaiting",
  onToggle,
}: {
  state?: "awaiting" | "ongoing"
  onToggle?: () => void
}) {
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 text-center">
      <div className="text-xs text-text-soft-400 mb-1.5">
        {state === "ongoing" ? "ongoing" : "Awaiting"}
      </div>
      <div className="font-mono text-2xl font-medium tabular-nums text-text-strong-950">
        {state === "ongoing" ? "02:44" : "00:00"}
        <span className="text-text-soft-400">:{state === "ongoing" ? "22" : "00"}</span>
      </div>
      {state === "awaiting" ? (
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-1 text-(--primary-base) font-medium text-sm mt-2"
          aria-label="Start time tracker"
        >
          <Play className="size-4" /> Start Time Tracker
        </button>
      ) : (
        <div className="flex items-center justify-center gap-3 mt-2">
          <button
            onClick={onToggle}
            className="inline-flex items-center gap-1 text-sm text-text-strong-950"
            aria-label="Pause time tracker"
          >
            <Pause className="size-4" /> Pause
          </button>
          <span className="text-text-soft-400" aria-hidden>
            |
          </span>
          <button
            onClick={onToggle}
            className="inline-flex items-center gap-1 text-error-base text-sm"
            aria-label="Stop time tracker"
          >
            <Stop className="size-4" /> Stop
          </button>
        </div>
      )}
    </div>
  )
}
