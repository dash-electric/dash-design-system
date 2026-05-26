"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"

export type CohortMember = {
  pe: string
  components: number
  gaps: number
  daysActive: number
  onboardingStep: number
  status: "not-started" | "in-progress" | "onboarded"
}

export type Threshold = {
  target: number
  actual: number
  label: string
}

export type PilotFeedback = {
  id: string
  timestamp: string
  pilot: string
  pe: string
  category: string
  text: string
  severity?: string
  context?: { command?: string; component?: string; repo?: string }
  status?: string
}

export type PilotData = {
  pilot: {
    name: string
    day: number
    status: "active" | "frozen"
    startedAt: string | null
  }
  cohort: CohortMember[]
  thresholds: {
    t11: Threshold
    t12: Threshold
    t13: Threshold
  }
  feedback: PilotFeedback[]
}

const CATEGORY_COLOR: Record<string, string> = {
  bug: "bg-error-lighter text-error-dark border-error-light",
  drift: "bg-(--dash-purple-50) text-(--dash-purple-700) border-(--dash-purple-200)",
  missing: "bg-warning-lighter/50 text-warning-dark border-warning-light",
  praise: "bg-success-lighter/50 text-success-dark border-success-light",
  ux: "bg-information-lighter/50 text-information-dark border-information-light",
  other: "bg-bg-weak-50 text-text-sub-600 border-stroke-soft-200",
}

const STATUS_COLOR: Record<CohortMember["status"], string> = {
  onboarded: "bg-success-lighter/50 text-success-dark border-success-light",
  "in-progress": "bg-warning-lighter/50 text-warning-dark border-warning-light",
  "not-started": "bg-bg-weak-50 text-text-soft-400 border-stroke-soft-200",
}

function pctClamped(actual: number, target: number): number {
  if (target <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((actual / target) * 100)))
}

function ThresholdBar({
  id,
  threshold,
  unit,
}: {
  id: string
  threshold: Threshold
  unit?: string
}) {
  const pct = pctClamped(threshold.actual, threshold.target)
  const passed = threshold.actual >= threshold.target
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
            {id}
          </div>
          <div className="text-sm text-text-strong-950">{threshold.label}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tracking-tight text-text-strong-950">
            {threshold.actual}
            {unit ?? ""}
          </div>
          <div className="text-xs text-text-soft-400">
            target {threshold.target}
            {unit ?? ""}
          </div>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-bg-weak-50">
        <div
          className={
            passed
              ? "h-full rounded-full bg-success-base"
              : "h-full rounded-full bg-(--dash-purple-500)"
          }
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function PilotDashboard({
  data,
  error,
}: {
  data: PilotData
  error?: string
}) {
  const [killing, setKilling] = React.useState(false)
  const [killStatus, setKillStatus] = React.useState<string | null>(null)

  const onKill = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Freeze Wave 5 pilot? Registry installs will be blocked cohort-wide. Unfreeze by re-running this with action=unfreeze on the server.",
      )
    ) {
      return
    }
    setKilling(true)
    setKillStatus(null)
    try {
      const res = await fetch("/api/admin/pilot/kill-switch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "freeze",
          reason: "manual freeze via /docs/admin/pilot",
        }),
      })
      if (res.ok) {
        setKillStatus("Pilot frozen. Reload to confirm status.")
      } else {
        setKillStatus(`Failed: ${res.status}`)
      }
    } catch (e) {
      setKillStatus(`Network error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setKilling(false)
    }
  }

  return (
    <DocsPageShell>
      <DocsHeader
        category="Admin / Pilot"
        title="Wave 5 Pilot"
        description="3-user smoke test of the Dash DS adoption hypothesis. Tracks T1.1 onboarding floor, T1.2 PR-penetration proxy, T1.3 drift placeholder, plus per-user activity and feedback feed."
        status="wip"
      />

      {error ? (
        <div className="rounded-xl border border-warning-light bg-warning-lighter/50 px-4 py-3 text-sm text-warning-dark">
          <strong>Pilot API unavailable:</strong> {error}. Showing empty
          state. Configure <code className="text-xs">DASH_REGISTRY_TOKEN</code>{" "}
          and ensure <code className="text-xs">pilot-cohort.json</code> exists
          at the repo root.
        </div>
      ) : null}

      <DocsSection
        title="Pilot status"
        description={`Day ${data.pilot.day} of 7. Status: ${data.pilot.status === "frozen" ? "FROZEN (kill switch active)" : "active"}.`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={
              data.pilot.status === "frozen"
                ? "rounded-md border border-error-light bg-error-lighter px-2.5 py-1 text-xs font-medium text-error-dark"
                : "rounded-md border border-success-light bg-success-lighter/50 px-2.5 py-1 text-xs font-medium text-success-dark"
            }
          >
            {data.pilot.status.toUpperCase()}
          </span>
          <span className="text-sm text-text-sub-600">
            Pilot: <strong className="text-text-strong-950">{data.pilot.name}</strong>
            {data.pilot.startedAt
              ? ` · started ${data.pilot.startedAt.slice(0, 10)}`
              : " · not yet started"}
          </span>
        </div>
      </DocsSection>

      <DocsSection
        title="Threshold progress"
        description="Kill criteria from KILL-CRITERIA.md. T1.1 is the only one that fully kills the pilot. T1.2 and T1.3 review at Week 8 / Quarter 1 — early indicators only."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <ThresholdBar id="T1.1" threshold={data.thresholds.t11} />
          <ThresholdBar id="T1.2" threshold={data.thresholds.t12} unit="%" />
          <ThresholdBar id="T1.3" threshold={data.thresholds.t13} unit="%" />
        </div>
      </DocsSection>

      <DocsSection
        title="Per-user activity"
        description="Status, onboarding step, component install count, and gap reports per cohort member. User names are read from local pilot-cohort.json (gitignored)."
      >
        <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-weak-50">
              <tr className="text-left">
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  User
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  Status
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  Onboarding
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  Components
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  Gaps
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  Days active
                </th>
              </tr>
            </thead>
            <tbody>
              {data.cohort.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-text-sub-600"
                  >
                    No cohort members yet. Populate pilot-cohort.json.
                  </td>
                </tr>
              ) : (
                data.cohort.map((m) => (
                  <tr key={m.pe} className="border-t border-stroke-soft-200/60">
                    <td className="px-3 py-2.5 font-mono text-xs text-text-strong-950">
                      {m.pe}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${STATUS_COLOR[m.status]}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-text-strong-950">
                      {m.onboardingStep} / 9
                    </td>
                    <td className="px-3 py-2.5 text-text-strong-950">
                      {m.components}
                    </td>
                    <td className="px-3 py-2.5 text-text-strong-950">{m.gaps}</td>
                    <td className="px-3 py-2.5 text-text-sub-600">
                      {m.daysActive}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection
        title="Feedback feed"
        description="Last 50 entries from dash feedback log + sync. Newest first. Filter via CLI: `dash feedback list --category bug`."
      >
        {data.feedback.length === 0 ? (
          <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-6 text-center text-sm text-text-sub-600">
            No feedback yet. Users submit via <code>dash feedback log "&lt;text&gt;"</code> →{" "}
            <code>dash feedback sync</code>.
          </div>
        ) : (
          <ul className="space-y-2">
            {data.feedback.map((f) => (
              <li
                key={f.id}
                className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${CATEGORY_COLOR[f.category] ?? CATEGORY_COLOR.other}`}
                    >
                      {f.category}
                    </span>
                    {f.severity ? (
                      <span className="text-[11px] uppercase tracking-wide text-text-soft-400">
                        {f.severity}
                      </span>
                    ) : null}
                    <span className="text-xs text-text-sub-600">{f.pe}</span>
                  </div>
                  <span className="font-mono text-[11px] text-text-soft-400">
                    {f.timestamp.slice(5, 16).replace("T", " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-strong-950">{f.text}</p>
                {f.context?.command || f.context?.component || f.context?.repo ? (
                  <p className="mt-1 font-mono text-[11px] text-text-soft-400">
                    {f.context?.repo ? `repo=${f.context.repo}` : ""}
                    {f.context?.component ? ` · component=${f.context.component}` : ""}
                    {f.context?.command ? ` · ${f.context.command}` : ""}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </DocsSection>

      <DocsSection
        title="Retro template"
        description="Run at Day +7. See WAVE-5-PILOT.md § F for the full template."
      >
        <a
          href="https://github.com/dash-electric/express-design-system/blob/main/docs/pilot/WAVE-5-PILOT.md"
          className="inline-flex items-center gap-2 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm font-medium text-text-strong-950 hover:bg-bg-weak-50"
        >
          Open WAVE-5-PILOT.md →
        </a>
      </DocsSection>

      <DocsSection
        title="Kill switch"
        description="Freezes registry installs cohort-wide. Reversible — clear pilot-frozen on the server to resume."
      >
        <div className="rounded-xl border border-error-light bg-error-lighter/30 p-4">
          <p className="text-sm text-text-strong-950">
            Triggering the kill switch will block all <code>dash add</code>{" "}
            installs for the pilot cohort. Use only if § A failure criterion
            trips and you've escalated to PM Dash + Head of Design first.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onKill}
              disabled={killing || data.pilot.status === "frozen"}
              className="rounded-md border border-error-base bg-error-base px-3 py-1.5 text-xs font-semibold text-text-white-0 hover:bg-error-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {data.pilot.status === "frozen"
                ? "Already frozen"
                : killing
                  ? "Freezing…"
                  : "Trigger kill switch"}
            </button>
            {killStatus ? (
              <span className="text-xs text-text-sub-600">{killStatus}</span>
            ) : null}
          </div>
        </div>
      </DocsSection>
    </DocsPageShell>
  )
}
