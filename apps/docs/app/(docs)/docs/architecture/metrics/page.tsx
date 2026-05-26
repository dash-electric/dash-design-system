"use client"

/* -------------------------------------------------------------------------- */
/*  /docs/architecture/metrics                                                */
/*                                                                            */
/*  Presentation-ready scoreboard for Head of Design briefings.               */
/*  All numbers verified against repo state on 2026-05-20:                    */
/*   - 200 registry items     ← `grep -c '"name":' apps/docs/registry.json`   */
/*   - 17 workflow blocks     ← 11 shared + 3 ride + 3 logistic               */
/*   - 4+1 themes             ← registry/dash/themes/{ride,logistic,travel,   */
/*                              marketplace,trellis-tenant}                   */
/*   - 30 AI fixtures         ← registry/rules/fixtures/*.json                */
/*   - 13 audit rules         ← packages/cli/src/lib/audit-rules.ts           */
/*                              (5 banned imports + 2 style + 6 layer)        */
/*   - 337 test cases         ← `*.test.ts(x)` across cli / skill / worker    */
/*   - 14 CLI commands        ← packages/cli/src/commands/*.ts                */
/*   - v3 skill               ← packages/skill (prompt-builder.v3)            */
/*   - 10 drift baseline repos← BASELINE-DRIFT-2026-05-20.md (5 FE + 5 BE)    */
/* -------------------------------------------------------------------------- */

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"

/* ---------- Section 1 — Hero scoreboard ----------------------------------- */

type Metric = {
  value: string
  label: string
  context: string
  accent?: string
}

const heroMetrics: Metric[] = [
  {
    value: "200",
    label: "Registry items",
    context: "atoms + blocks + templates + patterns",
    accent: "var(--state-feature-base)",
  },
  {
    value: "17",
    label: "Workflow blocks",
    context: "11 shared + 3 ride + 3 logistic",
    accent: "var(--state-feature-base)",
  },
  {
    value: "4",
    label: "Architecture layers",
    context: "foundation → primitives → themes → blocks",
    accent: "var(--state-information-base)",
  },
  {
    value: "4 + 1",
    label: "Product themes",
    context: "Ride · Logistic · Travel · Marketplace + Trellis tenants",
    accent: "var(--state-information-base)",
  },
  {
    value: "30",
    label: "AI fixtures",
    context: "validation across 5 FE stacks",
    accent: "var(--state-success-base)",
  },
  {
    value: "13",
    label: "Audit rules",
    context: "5 banned-import + 2 style + 6 layer",
    accent: "var(--state-success-base)",
  },
  {
    value: "337",
    label: "Test cases",
    context: "CLI · Skill · Worker · components",
    accent: "var(--state-success-base)",
  },
  {
    value: "14",
    label: "CLI commands",
    context: "end-to-end developer surface",
    accent: "var(--state-warning-base)",
  },
  {
    value: "v3",
    label: "Skill version",
    context: "priority-pinned · per-repo · multi-tenant",
    accent: "var(--state-warning-base)",
  },
  {
    value: "10",
    label: "Drift-baseline repos",
    context: "5 FE + 5 BE scanned 2026-05-20",
    accent: "var(--state-warning-base)",
  },
]

/* ---------- Section 2 — Capability matrix --------------------------------- */

type Capability = { dash: string; incumbent: string }

const capabilities: Capability[] = [
  {
    dash: "Multi-product foundation across tenants (Ride · Logistic · Travel · Marketplace · Trellis)",
    incumbent: "Greenfield-only — no concept of multi-product theming",
  },
  {
    dash: "Brownfield additive — existing Dash code untouched, opt-in via dash add",
    incumbent: "Requires rewrite to their template or framework",
  },
  {
    dash: "Indonesian voice (formal Anda, mitra-facing register)",
    incumbent: "English-templated, no local register",
  },
  {
    dash: "Audit trail mandatory for legal/financial fields (CI-gated)",
    incumbent: "No compliance scaffold; per-field audit is on you",
  },
  {
    dash: "BYO LLM key — sovereign, no vendor-locked compute",
    incumbent: "Locked to their inference + their pricing",
  },
  {
    dash: "Hermes autonomous deputy (E2E smoke verified, scheduled gap-vendor pipeline)",
    incumbent: "Manual maintenance only",
  },
  {
    dash: "Layered Architecture (Layer 0-3) with locked-vs-flexible contract",
    incumbent: "Flat component library, no divergence model",
  },
  {
    dash: "Canonical token contract (CSS var, no hex) enforced by dash audit",
    incumbent: "Inline hex tolerated; drift creeps silently",
  },
]

/* ---------- Section 3 — Operational readiness ----------------------------- */

type Status = {
  state: "ready" | "pending"
  label: string
  detail: string
}

const readiness: Status[] = [
  {
    state: "ready",
    label: "Foundation shipped",
    detail: "Layer 0-3 deployed: tokens, primitives, themes, workflow blocks",
  },
  {
    state: "ready",
    label: "Pilot infrastructure",
    detail: "3 users ready to invite — CLI + Skill + onboarding playbook live",
  },
  {
    state: "ready",
    label: "Audit enforcement",
    detail: "13 rules CI-gateable via dash audit (banned imports + style + layer)",
  },
  {
    state: "ready",
    label: "Hermes autonomous loop",
    detail: "E2E smoke verified — gap detect → vendor → PR pipeline tested",
  },
  {
    state: "ready",
    label: "Documentation",
    detail:
      "LAYERED-ARCHITECTURE · ONBOARDING-PLAYBOOK · KILL-CRITERIA · BASELINE-DRIFT",
  },
  {
    state: "pending",
    label: "Pilot execution",
    detail: "Awaiting user invite — Wave 5 staged this week",
  },
  {
    state: "pending",
    label: "Live AI validation",
    detail: "Pending real session test against 30 fixture envelope",
  },
  {
    state: "pending",
    label: "Production deploy",
    detail: "Railway / Fly.io configs ready, awaiting trigger",
  },
]

/* ---------- Section 4 — Strategic positioning timeline -------------------- */

type Phase = { when: string; title: string; detail: string }

const timeline: Phase[] = [
  {
    when: "Today",
    title: "Dash Ride live + DS foundation shipped",
    detail:
      "200 registry items consumable. Ride is the proof tenant; theme registered, blocks online.",
  },
  {
    when: "Q3 2026",
    title: "Dash Logistic launches DS-powered Day 1",
    detail:
      "Logistic theme + 3 workflow blocks already in registry. No re-foundation needed.",
  },
  {
    when: "Q4 2026",
    title: "Dash Travel launch",
    detail: "Travel theme manifest stubbed. Re-uses 100% of Layer 0-1 contract.",
  },
  {
    when: "2027",
    title: "Marketplace + 5 paying Trellis tenants",
    detail:
      "External SaaS distribution via trellis-{tenantId} scope. Revenue path opens.",
  },
  {
    when: "Endpoint",
    title: "Dash Platform = Indonesian-built design infrastructure for SEA",
    detail: "Sovereign, multi-tenant, brownfield-friendly. Not a single-product DS.",
  },
]

/* ---------- Section 6 — What's next --------------------------------------- */

const nextSteps: string[] = [
  "Wave 5 pilot (3 users this week) — validate adoption hypothesis under real load",
  "Hermes Railway deploy — autonomous gap-vendor pipeline live",
  "Dash Logistic theme buildout when launch nears",
  "Trellis Phase 1 — first external tenant onboarding post-pilot success",
  "Open source the meta-framework — community moat play",
]

/* -------------------------------------------------------------------------- */

export default function MetricsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Architecture"
        title="Dash DS — Metrics & Readiness"
        description="Scoreboard for the platform behind Dash Ride, Logistic, Travel, Marketplace, and Trellis tenants. Numbers verified against the repo on 2026-05-20."
        status="new"
      />

      {/* ============ Section 1 — Hero scoreboard ============================== */}
      <DocsSection
        title="Scoreboard"
        description="Hero numbers — what the platform is, today. Scan in 60 seconds."
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {heroMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5"
              style={{
                borderTopWidth: 3,
                borderTopColor: m.accent ?? "var(--state-feature-base)",
              }}
            >
              <div
                className="text-4xl font-semibold leading-none text-text-strong-950 tabular-nums"
                style={{ letterSpacing: "-0.02em" }}
              >
                {m.value}
              </div>
              <div className="mt-2 text-sm font-medium text-text-strong-950">
                {m.label}
              </div>
              <div className="mt-1 text-xs text-text-soft-400">{m.context}</div>
            </div>
          ))}
        </div>
      </DocsSection>

      {/* ============ Section 2 — Capability matrix ============================ */}
      <DocsSection
        title="Capability matrix — Dash DS vs incumbents"
        description="What Dash DS does that Lovable / v0 / Cursor templates structurally don't."
      >
        <div className="overflow-hidden rounded-xl border border-stroke-soft-200">
          <div className="grid grid-cols-[1fr_1fr] bg-bg-weak-50 text-[11px] uppercase tracking-wider text-text-soft-400">
            <div className="px-4 py-3 border-r border-stroke-soft-200">
              Dash DS does
            </div>
            <div className="px-4 py-3">Incumbents don&apos;t</div>
          </div>
          {capabilities.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr] border-t border-stroke-soft-200 bg-bg-white-0 text-sm"
            >
              <div className="px-4 py-3 border-r border-stroke-soft-200 text-text-strong-950 flex gap-2 items-start">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white shrink-0"
                  style={{ background: "var(--state-success-base)" }}
                >
                  ✓
                </span>
                <span>{c.dash}</span>
              </div>
              <div className="px-4 py-3 text-text-sub-600 flex gap-2 items-start">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white shrink-0"
                  style={{ background: "var(--state-error-base)" }}
                >
                  ✕
                </span>
                <span>{c.incumbent}</span>
              </div>
            </div>
          ))}
        </div>
      </DocsSection>

      {/* ============ Section 3 — Operational readiness ======================== */}
      <DocsSection
        title="Operational readiness"
        description="What's shipped today, what's queued. Eight gates — five green, three on deck."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {readiness.map((s) => {
            const tone =
              s.state === "ready"
                ? "var(--state-success-base)"
                : "var(--state-warning-base)"
            return (
              <div
                key={s.label}
                className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 flex gap-3"
              >
                <span
                  aria-hidden
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: tone }}
                >
                  {s.state === "ready" ? "✓" : "⏸"}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-strong-950">
                      {s.label}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        background: "var(--bg-weak-50)",
                        color: "var(--text-soft-400)",
                      }}
                    >
                      {s.state === "ready" ? "shipped" : "queued"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-text-sub-600">{s.detail}</div>
                </div>
              </div>
            )
          })}
        </div>
      </DocsSection>

      {/* ============ Section 4 — Strategic positioning ======================== */}
      <DocsSection
        title="Strategic positioning"
        description="The thesis underneath every number on this page."
      >
        <div
          className="rounded-xl p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, var(--dash-purple-600) 0%, var(--dash-purple-700, #4b1c8c) 100%)",
          }}
        >
          <div className="text-xs uppercase tracking-wider text-white/70">
            Thesis
          </div>
          <div className="mt-2 text-2xl font-semibold text-white leading-tight">
            Dash = platform company, not single product.
          </div>
          <div className="mt-2 text-sm text-white/80">
            One foundation, four products, N external tenants, zero drift.
          </div>
        </div>

        <div className="relative pl-6">
          <div
            aria-hidden
            className="absolute left-[10px] top-2 bottom-2 w-px"
            style={{ background: "var(--stroke-soft-200)" }}
          />
          <ol className="space-y-4">
            {timeline.map((p, i) => (
              <li key={p.when} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-6 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{
                    background:
                      i === 0
                        ? "var(--state-success-base)"
                        : i === timeline.length - 1
                          ? "var(--dash-purple-600)"
                          : "var(--state-information-base)",
                  }}
                >
                  {i + 1}
                </span>
                <div className="text-[11px] uppercase tracking-wider text-text-soft-400">
                  {p.when}
                </div>
                <div className="text-sm font-semibold text-text-strong-950">
                  {p.title}
                </div>
                <div className="mt-0.5 text-xs text-text-sub-600">{p.detail}</div>
              </li>
            ))}
          </ol>
        </div>
      </DocsSection>

      {/* ============ Section 5 — Spotlight (the lu story) ===================== */}
      <DocsSection title="Spotlight" description="The shape of the curator role.">
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
          <p className="text-sm text-text-sub-600 leading-relaxed">
            Dash DS was architected by a Product Designer inside Dash — not bought,
            not contracted, not outsourced. That foundation now sits visibly across
            every current and future Dash product. The role going forward is{" "}
            <span className="font-medium text-text-strong-950">curator</span>: keep
            Layer 0 coherent, keep the contract crisp, keep each product&apos;s
            personality intact.
          </p>
          <div
            className="mt-5 border-l-4 pl-4 italic text-base font-medium text-text-strong-950"
            style={{ borderLeftColor: "var(--dash-purple-600)" }}
          >
            &ldquo;Same foundation, different product face.&rdquo;
          </div>
        </div>
      </DocsSection>

      {/* ============ Section 6 — What's next ================================== */}
      <DocsSection
        title="What's next"
        description="Five moves between today and the platform-company endpoint."
      >
        <ol className="space-y-2">
          {nextSteps.map((step, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-4 py-3"
            >
              <span
                aria-hidden
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ background: "var(--dash-purple-600)" }}
              >
                {i + 1}
              </span>
              <span className="text-sm text-text-strong-950">{step}</span>
            </li>
          ))}
        </ol>
      </DocsSection>

      {/* ============ Cross-links ============================================== */}
      <DocsSection title="Deeper context">
        <ul className="text-sm text-text-sub-600 space-y-2 list-disc pl-5">
          <li>
            <Link
              className="text-(--dash-purple-600) underline-offset-4 hover:underline"
              href="/docs/architecture/layered"
            >
              Layered Architecture
            </Link>{" "}
            — the 4-layer contract (foundation → primitives → themes → blocks).
          </li>
          <li>
            <Link
              className="text-(--dash-purple-600) underline-offset-4 hover:underline"
              href="/docs/architecture/themes"
            >
              Theme gallery
            </Link>{" "}
            — the 4 + 1 manifests in detail (Ride, Logistic, Travel, Marketplace,
            Trellis).
          </li>
          <li>
            <Link
              className="text-(--dash-purple-600) underline-offset-4 hover:underline"
              href="/docs/onboarding"
            >
              User Onboarding Playbook
            </Link>{" "}
            — how a Dash user goes from clone to first <code className="text-xs">dash add</code>.
          </li>
          <li>
            <Link
              className="text-(--dash-purple-600) underline-offset-4 hover:underline"
              href="https://github.com/dash-electric/express-design-system/blob/main/docs/strategy/KILL-CRITERIA.md"
            >
              <code className="text-xs">KILL-CRITERIA.md</code>
            </Link>{" "}
            — pre-committed conditions under which we shut the project down.
          </li>
          <li>
            <Link
              className="text-(--dash-purple-600) underline-offset-4 hover:underline"
              href="https://github.com/dash-electric/express-design-system/blob/main/docs/strategy/BASELINE-DRIFT-2026-05-20.md"
            >
              <code className="text-xs">BASELINE-DRIFT-2026-05-20.md</code>
            </Link>{" "}
            — pre-DS drift snapshot across 10 production repos.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
