import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPrinciples,
  DocsVariantTable,
} from "@/components/docs/page-shell"
import { DocsStep, DocsStepList } from "@/components/docs/docs-step"
import { DocsCode } from "@/components/docs/code-block"

/**
 * /docs/admin/pilot-detail — Wave 5 pilot operations manual (CEO playbook).
 *
 * Complement to /docs/admin/pilot (the live dashboard). The dashboard shows
 * what; this page shows how to read it, what to do daily, and when to pull
 * the kill switch. Read once before pilot Day 1; refer back daily.
 *
 * Bearer auth: the underlying /api/admin/pilot endpoint is Bearer-gated via
 * apps/docs/app/api/registry/_auth.ts (`isAuthorized`). This URL itself is
 * not route-gated — anyone can read the playbook — but the dashboard data
 * and kill-switch action are protected server-side. Same model as
 * /docs/admin/usage and the dashboard page.
 */

export const dynamic = "force-static"

export default function PilotDetailPage() {
  return (
    <DocsPageShell>
      <div className="rounded-lg border border-warning-base/40 bg-warning-lighter/40 px-4 py-3 mb-6 text-sm">
        <div className="font-semibold text-warning-dark mb-0.5">
          Moved to dash-dashboard
        </div>
        <div className="text-text-sub-600">
          This page will be removed from <code className="text-xs">dash-ds</code> on{" "}
          <strong>2026-06-10</strong>. The control-tower version lives at{" "}
          <a
            href="https://dashboard.dash.com/admin/pilot-detail"
            className="underline text-(--primary-base) font-medium"
          >
            dashboard.dash.com/admin/pilot-detail
          </a>{" "}
          (private, NextAuth-gated). Update your bookmarks.
        </div>
      </div>

      <DocsHeader
        category="Admin"
        title="Pilot ops manual"
        description="Wave 5 pilot operations manual. Read once before pilot Day 1. Refer back daily."
        status="beta"
      />

      {/* 1 — What this page is */}
      <DocsSection
        title="What this page is"
        description="Operational playbook for running the Wave 5 pilot (3 Dash Ride developers). Companion to the live dashboard at /docs/admin/pilot."
      >
        <div className="rounded-xl border border-(--dash-purple-200) bg-(--dash-purple-50) p-4">
          <p className="text-sm text-text-strong-950 leading-relaxed">
            <span className="font-semibold">Bearer-gated.</span> The dashboard
            data and kill-switch endpoint require{" "}
            <code className="text-xs">DASH_REGISTRY_TOKEN</code> server-side via{" "}
            <code className="text-xs">isAuthorized()</code> in{" "}
            <code className="text-xs">apps/docs/app/api/registry/_auth.ts</code>.
            This playbook URL is readable by anyone with the docs link —
            sensitive numbers stay behind the API.
          </p>
        </div>
      </DocsSection>

      {/* 2 — Daily 5-min check */}
      <DocsSection
        title="Daily 5-min check"
        description="Run this every morning during pilot weeks 1-12. Five steps, five minutes."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Open the pilot dashboard"
            description="Navigate to /docs/admin/pilot. Bearer-gated — the page renders an empty cohort + configure-token hint if DASH_REGISTRY_TOKEN is missing from server env."
            code="open https://dash-ds.vercel.app/docs/admin/pilot"
            imagePlaceholder="Pilot dashboard hero with 3-developer cohort row + threshold meters"
          />
          <DocsStep
            number={2}
            title="Read the three threshold meters"
            description="T1.1 Adoption (Week 4), T1.2 PR penetration (Week 8), T1.3 Brand drift (Quarter 1). Each meter renders target vs actual. Red = below floor, amber = on track, green = exceeded."
            imagePlaceholder="Threshold meters T1.1, T1.2, T1.3 with progress bars"
          />
          <DocsStep
            number={3}
            title="Scan feedback feed"
            description="Newest 10 entries. Look for bug (red) and ux (yellow) skew. Severity is encoded in left border thickness — thick = high, thin = medium, none = low."
            imagePlaceholder="Feedback feed list with color-coded rows"
          />
          <DocsStep
            number={4}
            title="Check Hermes worker health"
            description="Hit the worker health endpoint. Expect 200 + queue length. If queue depth grows monotonically across 3 days, the gap-filler is stuck — escalate."
            code="curl -s https://dash-ds.vercel.app/api/hermes/health | jq"
            output='{"status":"ok","queue":12,"lastFlushed":"2026-05-20T03:14:22Z"}'
            imagePlaceholder="Hermes worker health JSON response"
          />
          <DocsStep
            number={5}
            title="Note red flags → DM developer"
            description="Any bug-severity-high, repeat ux complaint from same developer, or T1.1 trajectory drift → DM the developer directly. Don't wait for weekly retro."
            imagePlaceholder="DM template for red-flag follow-up"
          />
        </DocsStepList>
      </DocsSection>

      {/* 3 — Threshold meters explained */}
      <DocsSection
        title="Three threshold meters"
        description="Quantitative go/no-go gates for the pilot. Each meter has a numerator, denominator, and decision rule. Baselines locked 2026-05-20."
      >
        <DocsVariantTable
          nameHeader="Meter"
          descHeader="Formula + decision"
          rows={[
            {
              name: "T1.1 — Adoption floor (Week 4)",
              description: (
                <div className="space-y-1.5">
                  <div>
                    <span className="font-medium text-text-strong-950">Numerator:</span>{" "}
                    developers who installed ≥1 component via{" "}
                    <code className="text-xs">dashkit add</code>
                  </div>
                  <div>
                    <span className="font-medium text-text-strong-950">Denominator:</span>{" "}
                    3 invited developers
                  </div>
                  <div className="text-text-strong-950 font-medium">
                    Decision: if N/3 &lt; 3 by Week 4 → pivot or kill.
                  </div>
                </div>
              ),
            },
            {
              name: "T1.2 — PR penetration (Week 8)",
              description: (
                <div className="space-y-1.5">
                  <div>
                    <span className="font-medium text-text-strong-950">Numerator:</span>{" "}
                    new UI PRs using{" "}
                    <code className="text-xs">@dash/</code> component
                  </div>
                  <div>
                    <span className="font-medium text-text-strong-950">Denominator:</span>{" "}
                    total new UI PRs across 10 Dash repos
                  </div>
                  <div className="text-text-strong-950 font-medium">
                    Decision: if % &lt; 30 by Week 8 → freeze active build.
                  </div>
                </div>
              ),
            },
            {
              name: "T1.3 — Brand drift reduction (Q1)",
              description: (
                <div className="space-y-1.5">
                  <div>
                    <span className="font-medium text-text-strong-950">Numerator:</span>{" "}
                    drift count reduction vs baseline
                  </div>
                  <div>
                    <span className="font-medium text-text-strong-950">Denominator:</span>{" "}
                    2026-05-20 baseline (1,913 hex backoffice; 2,028 hex basecamp; per{" "}
                    <code className="text-xs">BASELINE-DRIFT-2026-05-20.md</code>)
                  </div>
                  <div className="text-text-strong-950 font-medium">
                    Decision: if reduction &lt; 20% by Q1 → kill or pivot.
                  </div>
                </div>
              ),
            },
          ]}
        />
      </DocsSection>

      {/* 4 — Feedback feed reading */}
      <DocsSection
        title="Reading the feedback feed"
        description="How to triage entries fast. Color = category, border = severity, click = full detail."
      >
        <DocsVariantTable
          nameHeader="Category"
          descHeader="Color + meaning"
          rows={[
            { name: "bug", description: <span><span className="inline-block size-3 rounded-full bg-error-base mr-2 align-middle" />Red — component broken, install fails, runtime crash.</span> },
            { name: "ux", description: <span><span className="inline-block size-3 rounded-full bg-warning-base mr-2 align-middle" />Yellow — confusing API, missing affordance, friction.</span> },
            { name: "missing", description: <span><span className="inline-block size-3 rounded-full bg-(--dash-purple-500) mr-2 align-middle" />Purple — coverage gap → Hermes gap-queue candidate.</span> },
            { name: "praise", description: <span><span className="inline-block size-3 rounded-full bg-success-base mr-2 align-middle" />Green — positive signal, log for retention narrative.</span> },
            { name: "drift", description: <span><span className="inline-block size-3 rounded-full bg-warning-dark mr-2 align-middle" />Orange — token bypass, hard-coded hex spotted.</span> },
            { name: "other", description: <span><span className="inline-block size-3 rounded-full bg-text-soft-400 mr-2 align-middle" />Gray — process, comms, off-topic.</span> },
          ]}
        />

        <DocsPrinciples
          items={[
            {
              title: "Severity",
              body: "high = thick left border, medium = thin border, low = no border. Triage all high within 24h.",
            },
            {
              title: "Expand row",
              body: "Click a row to reveal full details: reporter, timestamp, repo, free-text body, suggested fix.",
            },
            {
              title: "Action options",
              body: "Acknowledge, Fix-now-promise, Defer, Decline (requires written reason logged to audit trail).",
            },
          ]}
        />
      </DocsSection>

      {/* 5 — Decision tree per checkpoint */}
      <DocsSection
        title="Decision tree per checkpoint"
        description="What to decide and when. Each checkpoint has a clear binary action."
      >
        <DocsPrinciples
          items={[
            {
              title: "Week 1 — daily",
              body: "Issue rate > 2/day per developer = escalate. DM the developer + co-debug in 1:1.",
            },
            {
              title: "Week 2 — mid-pilot",
              body: "Feedback skew (1 developer > 70% of all reports) = check engagement of the other two. Silent ≠ happy.",
            },
            {
              title: "Week 4 — T1.1 review",
              body: "All 3 onboarded? Approve expansion (next 10). Decline → diagnose adoption blocker, extend or kill.",
            },
            {
              title: "Week 8 — T1.2 review",
              body: "PR penetration ≥ 30%? Extend pilot to 10 devs. < 30% → kill or pivot to integrator-only mode.",
            },
            {
              title: "Quarter 1 — T1.3 review",
              body: "Drift reduction ≥ 20%? GA launch (Wave 6+). < 20% → kill; the DS isn't moving the needle.",
            },
            {
              title: "Anytime — crisis",
              body: "Data leak, mitra-facing UI bug from generated code, legal exposure → kill switch immediately, postmortem later.",
            },
          ]}
        />
      </DocsSection>

      {/* 6 — Kill switch usage */}
      <DocsSection
        title="Kill switch usage"
        description="Freeze the registry into read-only mode. Reversible. Use when in doubt; cost of a brief freeze is low vs cost of a runaway bad release."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Open the admin dashboard"
            description="Go to /docs/admin/pilot. The Kill Switch button lives bottom-right of the threshold meters row."
            imagePlaceholder="Dashboard with Kill Switch button highlighted bottom-right"
          />
          <DocsStep
            number={2}
            title="Click Kill Switch"
            description="A confirm dialog appears. To prevent accidental freezes, you must type FREEZE in caps to enable the confirm button."
            imagePlaceholder="Confirm dialog with FREEZE text input"
          />
          <DocsStep
            number={3}
            title="Wait 60 seconds for propagation"
            description="The API writes a pilot-frozen marker file (apps/docs/registry-frozen). The registry middleware reads this marker on every fetch and returns 423 Locked. Vercel edge caching takes up to 60s to invalidate."
            code='curl -s https://dash-ds.vercel.app/api/registry/manifest -i | head -1'
            output="HTTP/2 423"
            imagePlaceholder="Curl response showing 423 Locked status"
          />
          <DocsStep
            number={4}
            title="Verify with dashkit add from any consumer"
            description="From any Dash consumer repo, attempt an install. Expect a friendly read-only mode error message — not a stack trace."
            code="dashkit add button"
            output="Error: Registry frozen, read-only mode. Reason: <your-reason>. Contact @irfan."
            imagePlaceholder="CLI showing Registry frozen, read-only mode error"
          />
          <DocsStep
            number={5}
            title="Reversal — Unfreeze"
            description="Same button now reads Unfreeze. Confirm dialog requires no typed code (lower friction for recovery). API deletes the marker file. Resume normal ops."
            imagePlaceholder="Unfreeze confirm dialog"
          />
          <DocsStep
            number={6}
            title="Emergency override (dashboard unreachable)"
            description="If the docs site itself is down, manually set DASH_REGISTRY_FROZEN=true env var on Vercel and redeploy. See RUNBOOK.md (root of repo, if present) for the exact CLI invocation."
            code="vercel env add DASH_REGISTRY_FROZEN production"
            imagePlaceholder="Vercel CLI env-var override flow"
          />
        </DocsStepList>
      </DocsSection>

      {/* 7 — Weekly retro template */}
      <DocsSection
        title="Weekly retro template"
        description="Friday EOD. 15 minutes. Save markdown to vault path below; commit to journal."
      >
        <DocsCode
          language="markdown"
          code={`# Wave 5 Pilot — Week <N> Retro

Date: <YYYY-MM-DD>
Author: irfan

## 1. What worked?
- …

## 2. What broke?
- …

## 3. What's blocking adoption?
- …

## 4. Threshold status
- T1.1 (Adoption floor):  <N>/3   ·  target Week 4
- T1.2 (PR penetration): <N>%    ·  target Week 8 ≥ 30%
- T1.3 (Drift reduction): <N>%    ·  target Q1     ≥ 20%

## 5. Action for next week
- …
`}
        />
        <p className="text-sm text-text-sub-600 leading-relaxed">
          Save to vault:{" "}
          <code className="text-xs">
            02-Projects/Product-Design/Dash/Dash-Design-System/Pilot-Retros/W&lt;N&gt;.md
          </code>
        </p>
      </DocsSection>

      {/* 8 — Escalation paths */}
      <DocsSection
        title="Escalation paths"
        description="Where each class of problem goes. Don't let issues drift uncategorized."
      >
        <DocsVariantTable
          nameHeader="Problem class"
          descHeader="Route"
          rows={[
            {
              name: "Tech issue",
              description: "CLI breaks, MCP down, registry 500/423 unexpectedly → @irfan + open GitHub issue with repro.",
            },
            {
              name: "Adoption issue",
              description: "Developer disengaged for > 5 days → @irfan + schedule 1:1 within 48h.",
            },
            {
              name: "Strategic decision",
              description: "Extend pilot, expand scope, paid plan → @irfan + design lead sync.",
            },
            {
              name: "Crisis",
              description: "Data leak, mitra dispute from generated code, legal exposure → pull kill switch first, escalate to @irfan + legal second.",
            },
          ]}
        />
      </DocsSection>

      {/* 9 — Files + paths */}
      <DocsSection
        title="Files + paths to know"
        description="Where the pilot's data physically lives. Useful for forensics, backup, and bug repros."
      >
        <DocsVariantTable
          nameHeader="Artifact"
          descHeader="Path"
          rows={[
            {
              name: "Feedback queue (local)",
              description: <code className="text-xs">~/.dash/feedback-log.jsonl</code>,
            },
            {
              name: "Feedback queue (synced)",
              description: "Vercel KV — read via /api/admin/pilot (Bearer-gated).",
            },
            {
              name: "Audit log",
              description: <code className="text-xs">apps/docs/registry-audit.jsonl</code>,
            },
            {
              name: "Skill cache (per consumer)",
              description: <code className="text-xs">~/.dash/skill-cache/&lt;key&gt;.json</code>,
            },
            {
              name: "Hermes queue",
              description: <code className="text-xs">~/.dash/gap-queue.json</code>,
            },
            {
              name: "Kill-switch marker",
              description: <code className="text-xs">apps/docs/registry-frozen</code>,
            },
            {
              name: "Drift baseline",
              description: <code className="text-xs">BASELINE-DRIFT-2026-05-20.md</code>,
            },
            {
              name: "Kill criteria spec",
              description: <code className="text-xs">KILL-CRITERIA.md</code>,
            },
          ]}
        />
      </DocsSection>

      {/* 10 — Post-pilot transitions */}
      <DocsSection
        title="Post-pilot transitions"
        description="Three terminal states. Each has a defined next action so the cohort isn't left in limbo."
      >
        <DocsPrinciples
          items={[
            {
              title: "PASS → expand",
              body: "All thresholds met. Week 9: open invites to next 10 developers. Carry the 3 pilot devs forward as informal champions.",
            },
            {
              title: "PIVOT → strategy session",
              body: "Mixed signal (e.g. adoption OK but PR penetration weak). Hold a half-day strategy session per KILL-CRITERIA.md — re-scope, then either extend or kill cleanly.",
            },
            {
              title: "KILL → archive + migrate",
              body: "Below floor on a hard gate. Archive the plan, write a 1-page migration guide for the 3 developers (how to detach @dash deps), open a postmortem.",
            },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
