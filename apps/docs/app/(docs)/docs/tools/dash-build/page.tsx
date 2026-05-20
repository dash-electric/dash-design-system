"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsVariantTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { DocsStep, DocsStepList } from "@/components/docs/docs-step"

/**
 * /docs/tools/dash-build — Dash Build (Lovable-for-Dash internal builder).
 *
 * Browser-based AI workflow shipped Day 1-3 (2026-05-21). Any team member
 * (PM, finance ops, designer, dev) can install once via terminal, then
 * prompt-to-PR from the browser at localhost:7777.
 *
 * Status: beta. Wave-5 pilot validation pending alongside Skill v3 +
 * the rest of the Dash DS stack.
 */
export default function DashBuildDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Tools / Dash Build"
        title="Dash Build"
        description="Lovable for Dash internal. Browser-based AI builder anyone on the team can run — install once via terminal, then prompt-to-PR entirely from localhost:7777."
        status="beta"
        showStatus
      />

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* What is Dash Build?                                              */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection title="What is Dash Build?">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-3xl">
          Dash Build is the internal &ldquo;Lovable for Dash&rdquo; — a
          browser-based AI workflow that lets any team member at Dash (PM,
          finance ops, designer, dev) ship a real PR without leaving the
          browser. Install once via{" "}
          <code className="text-xs">npm i -g @dash/build</code>, then open{" "}
          <code className="text-xs">http://localhost:7777</code> from your
          browser for daily use. Anda tidak perlu sentuh terminal lagi setelah
          install pertama.
        </p>
        <p className="text-base text-text-sub-600 leading-relaxed max-w-3xl">
          Bedanya dengan Lovable / v0 / bolt: Dash Build sadar konteks
          brownfield Dash &mdash; ia hidup di repo asli Anda, mengikuti aturan
          Skill v3, dan menerbitkan PR real ke GitHub bukan sandbox throwaway.
        </p>
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* How it differs                                                   */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="How it differs from Lovable / v0 / bolt"
        description="Same intent (prompt-to-app), different paradigm. Dash Build is team-aware, brownfield-aware, and brand-aware."
      >
        <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-weak-50">
              <tr className="text-left">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400 w-1/4">
                  Aspect
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  Lovable / v0 / bolt
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  Dash Build
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-soft-200">
              {[
                ["Player mode", "Solo", "Team-aware"],
                ["Codebase", "Greenfield only", "Brownfield (your real repo)"],
                ["Brand awareness", "Generic templates", "Dash DS-aware via MCP"],
                ["Auth", "API key / credit billing", "Subscription OAuth (Anthropic Pro/Team)"],
                ["PR creation", "None — sandbox export", "Real GitHub PR via Dash Build App"],
                ["Audit trail", "None", "Built-in per cardinal rules"],
              ].map(([aspect, lovable, dash]) => (
                <tr key={aspect} className="align-top">
                  <td className="px-4 py-3 font-semibold text-text-strong-950">
                    {aspect}
                  </td>
                  <td className="px-4 py-3 text-text-sub-600 leading-relaxed">
                    {lovable}
                  </td>
                  <td className="px-4 py-3 text-text-sub-600 leading-relaxed">
                    {dash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Install                                                          */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Install"
        description="One-line install via npm. Requires Node 20+."
      >
        <DocsCode
          language="bash"
          code={`npm i -g @dash/build && dash-build`}
        />
        <p className="text-sm text-text-sub-600 mt-3 max-w-2xl">
          Setelah install pertama, Anda tidak perlu balik ke terminal untuk
          daily use &mdash; cukup buka browser ke{" "}
          <code className="text-xs">http://localhost:7777</code>. CLI
          auto-detects pnpm / yarn / npm dari lockfile di repo target.
        </p>
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 5-step setup walkthrough                                         */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Setup walkthrough"
        description="Five steps from fresh laptop to first PR shipped — about 5 minutes."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Install"
            description="Pull the CLI globally from npm. Works on macOS, Linux, and WSL."
            code={`npm i -g @dash/build`}
            imagePlaceholder="Terminal showing successful npm install of @dash/build"
            imageHeight="sm"
          />
          <DocsStep
            number={2}
            title="Choose Web UI"
            description="Run dash-build and pick Web UI from the interactive menu. Terminal hands off to your browser at localhost:7777 — every daily action happens there."
            code={`dash-build

? Choose your interface: (Use arrow keys)
❯ Web UI (Open in Browser)
  Terminal UI (Interactive CLI)
  Hide to Tray (Background)
  Exit`}
            imagePlaceholder="Interactive menu listing Web UI, Terminal UI, Tray, Exit"
            imageHeight="sm"
          />
          <DocsStep
            number={3}
            title="Connect Claude Pro"
            description="OAuth via Anthropic Pro / Team subscription. Zero API key, zero double-billing — Dash Build uses your existing Claude subscription."
            imagePlaceholder="Browser OAuth screen — Anthropic consent dialog"
            imageHeight="md"
          />
          <DocsStep
            number={4}
            title="Install Dash Build GitHub App"
            description="Second OAuth in browser. Grants Dash Build permission to open PRs against the repos you select. Scoped per-repo so a finance ops user only sees finance repos."
            imagePlaceholder="GitHub App install screen — pick repos"
            imageHeight="md"
          />
          <DocsStep
            number={5}
            title="Pick first repo + prompt → ship"
            description="Pick the target repo, type your prompt in plain Indonesian or English. AI generates Dash-compliant code, live-previews it in a sandboxed iframe, then opens the PR when you click Open PR."
            imagePlaceholder="Dash Build dashboard — prompt input + live preview + Open PR button"
            imageHeight="lg"
          />
        </DocsStepList>
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Example use case                                                 */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Example use case · finance ops"
        description="Real prompt from a finance ops team member who has never opened VS Code."
      >
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 space-y-4 max-w-3xl">
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-soft-400">
            Prompt
          </div>
          <p className="text-base text-text-strong-950 leading-relaxed italic">
            &ldquo;Saya butuh halaman untuk approve refund mitra. Tampilin
            daftar request pending, button approve dan reject, alasan wajib,
            audit trail. Voice formal Anda.&rdquo;
          </p>
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-soft-400 pt-2">
            Dash Build response
          </div>
          <ul className="text-sm text-text-sub-600 leading-relaxed space-y-1.5 list-disc pl-5">
            <li>Skill chain consults <code className="text-xs">dash-prd</code> for spec scaffolding</li>
            <li>Foundation match: 92/100 against existing <code className="text-xs">refund-approval-list</code> block</li>
            <li>One clarification: &ldquo;Should reject require approver role?&rdquo;</li>
            <li>Generates page + audit log table + voice-formal copy</li>
            <li>Opens PR <code className="text-xs">feat: finance refund approval page</code> on a new branch</li>
          </ul>
        </div>
        <figure
          className="relative w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50 h-[400px] flex items-center justify-center"
          data-image-placeholder="Dash Build dashboard — finance refund approval generation in progress"
        >
          <div className="text-sm text-text-soft-400">
            Screenshot · finance refund approval generation
          </div>
        </figure>
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Architecture                                                     */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Architecture"
        description="Local-only stack. Code never leaves your machine; only AI prompts hit Anthropic's API."
      >
        <DocsCode
          language="text"
          code={`┌──────────────────────────────────────────────────────────┐
│  Browser  ·  http://localhost:7777                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Dash Build UI  (React + Dash DS)                  │  │
│  │  ┌──────────────┐  ┌──────────────────────────────┐│  │
│  │  │ Prompt input │  │ Live preview (sandboxed)     ││  │
│  │  └──────┬───────┘  │   iframe + esbuild           ││  │
│  │         │          └──────────────────────────────┘│  │
│  └─────────┼──────────────────────────────────────────┘  │
└────────────┼─────────────────────────────────────────────┘
             │ HTTP
┌────────────▼─────────────────────────────────────────────┐
│  Dash Build daemon  ·  Node (your laptop)                │
│  • Skill chain:  dash-prd → design → Skill v3            │
│  • Foundation match score (0–100)                        │
│  • Clarification gate (multi-turn)                       │
│  • Audit trail enforcement                               │
└─────┬──────────────────────────────────┬─────────────────┘
      │                                  │
      ▼                                  ▼
┌──────────────────┐               ┌────────────────────┐
│ Anthropic API    │               │ GitHub             │
│ (subscription    │               │ (Dash Build App    │
│  OAuth)          │               │  PR creation)      │
└──────────────────┘               └────────────────────┘`}
          copy={false}
        />
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* FAQ                                                              */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="FAQ"
        description="The five questions every Wave-5 pilot user has asked so far."
      >
        <DocsVariantTable
          nameHeader="Question"
          descHeader="Answer"
          rows={[
            {
              name: "Do I need an API key?",
              description:
                "No. Dash Build authenticates via Anthropic Pro / Team OAuth and uses your existing subscription — zero extra billing.",
            },
            {
              name: "Can finance / PM use this?",
              description:
                "Yes. After the one-time terminal install, everything is in the browser at localhost:7777. No VS Code, no git CLI knowledge required.",
            },
            {
              name: "What if I don't have Claude Pro?",
              description: (
                <>
                  BYO API key fallback in <code className="text-xs">Settings → Auth</code>.
                  Useful for short-term pilots; subscription OAuth is the
                  recommended path for daily use.
                </>
              ),
            },
            {
              name: "Where do my prompts go?",
              description:
                "Prompts stay on your laptop and only the prompt text hits Anthropic's API. Your repo source code never leaves the machine — the daemon reads it locally for context.",
            },
            {
              name: "Does it work with our existing repos?",
              description: (
                <>
                  Yes. Brownfield-first. The Skill v3 stack chain auto-detects{" "}
                  <code className="text-xs">portal-v2</code>,{" "}
                  <code className="text-xs">backoffice</code>,{" "}
                  <code className="text-xs">halo-dash-fe</code>,{" "}
                  <code className="text-xs">basecamp</code>, and{" "}
                  <code className="text-xs">react-fleet</code>.
                </>
              ),
            },
          ]}
        />
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* What's next                                                      */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="What's next"
        description="Dash Build is beta. Wave-5 pilot validation runs alongside Skill v3 — kill-criteria gates apply."
      >
        <ul className="text-base text-text-sub-600 leading-relaxed space-y-2 max-w-2xl">
          <li>
            <span className="font-semibold text-text-strong-950">GitHub repo:</span>{" "}
            <code className="text-xs">packages/dash-build/</code> &mdash;
            source + README + architecture.
          </li>
          <li>
            <span className="font-semibold text-text-strong-950">Slack:</span>{" "}
            <code className="text-xs">#dash-build</code> &mdash; pilot users,
            friction reports, AI behavior feedback.
          </li>
          <li>
            <span className="font-semibold text-text-strong-950">
              Related docs:
            </span>{" "}
            <Link
              href="/docs/tools/skill"
              className="underline decoration-stroke-soft-200 underline-offset-4 hover:decoration-(--dash-purple-600)"
            >
              Skill v3
            </Link>
            {", "}
            <Link
              href="/docs/tools/ai-rules"
              className="underline decoration-stroke-soft-200 underline-offset-4 hover:decoration-(--dash-purple-600)"
            >
              AI Rules
            </Link>
            {", "}
            <Link
              href="/docs/tools/mcp"
              className="underline decoration-stroke-soft-200 underline-offset-4 hover:decoration-(--dash-purple-600)"
            >
              MCP Server
            </Link>
            .
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
