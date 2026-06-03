import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { isAuthorized, unauthorized } from "@/app/api/registry/_auth"

/**
 * GET /api/admin/pilot
 *
 * Bearer-gated pilot dashboard summary. Aggregates from three local
 * sources (same JSONL-append pattern as /api/admin/usage):
 *
 *   1. `registry-audit.jsonl` — install events from the registry.
 *      Used to derive per-user component-install counts. User identity is
 *      mapped through `pilot-cohort.json` (hashed-client → user name).
 *   2. `pilot-feedback.jsonl` — feedback entries synced from users via
 *      `dashkit feedback sync`. Drives the feedback feed.
 *   3. `pilot-cohort.json` — declares the 3 users in this pilot. If
 *      missing, returns 3 placeholder users so the dashboard renders.
 *
 * Response shape (stable contract — page.tsx + pilot-dashboard.tsx
 * depend on it):
 *   {
 *     pilot: { name, day, status: "active"|"frozen", startedAt|null },
 *     cohort: [{ pe, components, gaps, daysActive, onboardingStep, status }],
 *     thresholds: { t11: {target, actual, pct}, t12: {...}, t13: {...} },
 *     feedback: [FeedbackEntry, …]  // newest-first, capped at 50
 *   }
 *
 * Privacy: user names come from local pilot-cohort.json which is
 * gitignored — never leaves the host. No emails, no IPs.
 */

const FEEDBACK_FILE = path.join(process.cwd(), "pilot-feedback.jsonl")
const COHORT_FILE = path.join(process.cwd(), "pilot-cohort.json")
const KILL_SWITCH_FILE = path.join(process.cwd(), "pilot-frozen")
const AUDIT_FILE = path.join(process.cwd(), "registry-audit.jsonl")

type FeedbackEntryLike = {
  id?: string
  timestamp?: string
  pilot?: string
  pe?: string
  category?: string
  text?: string
  severity?: string
  context?: { command?: string; component?: string; repo?: string }
  status?: string
}

type AuditLine = {
  ts?: string
  op?: string
  ok?: boolean
  item?: string
}

type CohortFile = {
  name?: string
  startedAt?: string | null
  members?: Array<{ pe: string; onboardingStep?: number }>
}

function parseJsonl<T>(buf: string): T[] {
  const out: T[] = []
  for (const line of buf.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      out.push(JSON.parse(trimmed) as T)
    } catch {
      /* skip malformed */
    }
  }
  return out
}

async function loadCohort(): Promise<CohortFile> {
  try {
    const raw = await fs.readFile(COHORT_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object") return parsed as CohortFile
  } catch {
    /* fall through */
  }
  return {
    name: "wave-5",
    startedAt: null,
    members: [
      { pe: "[User-A]", onboardingStep: 0 },
      { pe: "[User-B]", onboardingStep: 0 },
      { pe: "[User-C]", onboardingStep: 0 },
    ],
  }
}

async function loadFeedback(): Promise<FeedbackEntryLike[]> {
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, "utf-8")
    return parseJsonl<FeedbackEntryLike>(raw)
  } catch {
    return []
  }
}

async function loadAudit(): Promise<AuditLine[]> {
  try {
    const raw = await fs.readFile(AUDIT_FILE, "utf-8")
    return parseJsonl<AuditLine>(raw).filter(
      (r) => r.op === "registry.fetch_item" && r.ok === true,
    )
  } catch {
    return []
  }
}

async function isFrozen(): Promise<boolean> {
  try {
    await fs.access(KILL_SWITCH_FILE)
    return true
  } catch {
    return false
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) return unauthorized()

  const [cohort, feedback, audit, frozen] = await Promise.all([
    loadCohort(),
    loadFeedback(),
    loadAudit(),
    isFrozen(),
  ])

  const members = cohort.members ?? []
  const startedAt = cohort.startedAt ?? null

  const day = startedAt
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(startedAt).getTime()) / (24 * 60 * 60 * 1000),
        ) + 1,
      )
    : 0

  // Per-user counts. Component-install count is derived from feedback context
  // (when a user logs `dashkit add X` as feedback) OR from audit when we add an
  // explicit user field to the audit line (future). For now: count distinct
  // components per user via feedback context.command + context.component.
  const perPe = members.map((m) => {
    const peFeedback = feedback.filter((f) => f.pe === m.pe)
    const componentSet = new Set<string>()
    for (const f of peFeedback) {
      if (f.context?.component) componentSet.add(f.context.component)
      if (typeof f.context?.command === "string") {
        const match = /dashkit add\s+(\S+)/.exec(f.context.command)
        if (match) componentSet.add(match[1])
      }
    }
    const gaps = peFeedback.filter(
      (f) => f.category === "missing" || f.category === "drift",
    ).length
    const days = new Set(
      peFeedback
        .map((f) => (typeof f.timestamp === "string" ? f.timestamp.slice(0, 10) : ""))
        .filter(Boolean),
    ).size

    const stepEntries = peFeedback
      .filter((f) => typeof f.text === "string" && /step\s*\d+/i.test(f.text))
      .sort((a, b) => (a.timestamp! < b.timestamp! ? 1 : -1))
    const latestStepMatch = stepEntries.length
      ? /step\s*(\d+)/i.exec(stepEntries[0].text ?? "")
      : null
    const onboardingStep = latestStepMatch
      ? Number.parseInt(latestStepMatch[1], 10)
      : m.onboardingStep ?? 0

    return {
      pe: m.pe,
      components: componentSet.size,
      gaps,
      daysActive: days,
      onboardingStep,
      status: onboardingStep >= 9 ? "onboarded" : onboardingStep > 0 ? "in-progress" : "not-started",
    }
  })

  // Threshold progress.
  const T11_TARGET = 3
  const T11_ACTUAL = perPe.filter((p) => p.status === "onboarded").length

  const T12_TARGET = 30 // 30% PR penetration target. Until we wire a per-PR
                       // analysis pipeline, surface install-density as a proxy:
                       // share of users who installed ≥3 components.
  const T12_ACTUAL = perPe.length
    ? Math.round(
        (perPe.filter((p) => p.components >= 3).length / perPe.length) * 100,
      )
    : 0

  const T13_TARGET = 20 // 20% drift reduction target.
  const T13_ACTUAL = 0 // placeholder until BASELINE-DRIFT pipeline is wired

  // Feedback feed — newest first, capped.
  const sortedFeedback = [...feedback]
    .filter((f) => typeof f.timestamp === "string")
    .sort((a, b) => (a.timestamp! < b.timestamp! ? 1 : -1))
    .slice(0, 50)

  return NextResponse.json(
    {
      pilot: {
        name: cohort.name ?? "wave-5",
        day,
        status: frozen ? "frozen" : "active",
        startedAt,
      },
      cohort: perPe,
      thresholds: {
        t11: { target: T11_TARGET, actual: T11_ACTUAL, label: "Users onboarded" },
        t12: { target: T12_TARGET, actual: T12_ACTUAL, label: "% users with ≥3 components (PR proxy)" },
        t13: { target: T13_TARGET, actual: T13_ACTUAL, label: "% drift reduction (placeholder)" },
      },
      feedback: sortedFeedback,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
