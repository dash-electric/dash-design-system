"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPrinciples,
} from "@/components/docs/page-shell"
import {
  DocsStep,
  DocsStepList,
  DocsWorkflowDiagram,
} from "@/components/docs/docs-step"

/**
 * /docs/getting-started — CANONICAL entry page.
 *
 * Consolidates four previously-overlapping entry points (Installation,
 * Quick Start, Onboarding, Testing Locally) into a single 10-minute path:
 *   1. Install CLI → 2. Initialize repo → 3. Add component →
 *   4. Use in code → 5. Wire AI editor
 *
 * The other four pages still exist as deep references and link back here
 * via a banner at the top. This is the page every new mitra / PE / pilot
 * should land on first.
 */
export default function GettingStartedPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started"
        title="From zero to first Dash component"
        description="Install the CLI, initialize your repo, add a component, wire your AI editor. Ten minutes, five steps — then ship."
        status="stable"
      />

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 01 · Hero metric + workflow diagram                              */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Time to first component"
      >
        <div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-[0.18em] text-text-soft-400">
              Estimated time
            </div>
            <div className="text-4xl md:text-5xl font-semibold tracking-tight text-text-strong-950">
              ~10 minutes
            </div>
            <p className="text-sm text-text-sub-600 max-w-md">
              Fresh laptop to first <code className="text-xs">{`<Button />`}</code>{" "}
              rendering Dash purple on your dev server. Skip ahead with the diagram
              below or follow the five steps in order.
            </p>
          </div>
          <div className="h-px md:h-24 w-full md:w-px bg-stroke-soft-200" />
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <li className="text-text-sub-600">
              <span className="font-semibold text-text-strong-950">Step 1–2</span>{" "}
              · ~3 min setup
            </li>
            <li className="text-text-sub-600">
              <span className="font-semibold text-text-strong-950">Step 3–4</span>{" "}
              · ~3 min component
            </li>
            <li className="text-text-sub-600">
              <span className="font-semibold text-text-strong-950">Step 5</span>{" "}
              · ~4 min AI editor
            </li>
            <li className="text-text-sub-600">
              <span className="font-semibold text-text-strong-950">Total</span>{" "}
              · ~10 min end-to-end
            </li>
          </ul>
        </div>

        <DocsWorkflowDiagram
          steps={[
            { label: "Install CLI", sub: "pnpm i -g dash" },
            { label: "Initialize repo", sub: "dash init" },
            { label: "Add component", sub: "dash add button" },
            { label: "Use in code", sub: "<Button />" },
            { label: "Wire AI editor", sub: "dash mcp init" },
          ]}
        />
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* 02 · Prerequisites                                               */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Prerequisites"
        description="Confirm your environment hits these versions before you start."
      >
        <DocsPrinciples
          items={[
            {
              title: "Node 20+",
              body: (
                <>
                  Check: <code className="text-xs">node --version</code>. If older,
                  install via <code className="text-xs">nvm</code> or download from
                  nodejs.org.
                </>
              ),
            },
            {
              title: "pnpm 9+",
              body: (
                <>
                  Check: <code className="text-xs">pnpm --version</code>. Install:{" "}
                  <code className="text-xs">npm i -g pnpm</code>. npm / yarn / bun
                  also work, but pnpm is the team default.
                </>
              ),
            },
            {
              title: "Bearer token",
              body: (
                <>
                  Pull <code className="text-xs">DASH_REGISTRY_TOKEN</code> from
                  the Dash 1Password vault → &ldquo;Dash DS Bearer Tokens&rdquo;.
                  Ping <code className="text-xs">#dash-ds</code> if you don&apos;t
                  have access yet.
                </>
              ),
            },
          ]}
        />
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* The 5-step walkthrough                                           */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="The 5-step walkthrough"
        description="Each step is independent — you can stop after step 4 with a working component, or push through step 5 to unlock the full AI-first workflow."
      >
        <DocsStepList>
          {/* ── Step 1 ────────────────────────────────────────────────── */}
          <DocsStep
            number={1}
            title="Install the dash CLI"
            description="One-time machine setup. Installs the dash binary globally so every Dash repo can call dash init / dash add."
            code={`pnpm i -g dash

# Verify
dash --version`}
            output={`✔ Installed dash@1.0.0 to /usr/local/bin/dash
✔ Registry: https://ds.dash.com/r/
ℹ Run \`dash init\` inside any Dash repo to wire it up.`}
            imagePlaceholder="Terminal after pnpm i -g dash — green install banner and version output."
          >
            <div className="rounded-lg border border-warning-light bg-warning-lighter px-4 py-3 text-sm text-text-strong-950">
              <span className="font-semibold">Gotcha:</span>{" "}
              <code className="text-xs">EACCES</code> on macOS Homebrew Node?
              Run <code className="text-xs">sudo chown -R $(whoami) $(npm config get prefix)</code>{" "}
              once, then re-install.
            </div>
          </DocsStep>

          {/* ── Step 2 ────────────────────────────────────────────────── */}
          <DocsStep
            number={2}
            title="Initialize your repo"
            description="One-time per Dash consumer repo. Writes components.json, .env.local, AGENTS.md, merges the @dash tailwind preset. Idempotent — safe to re-run."
            code={`cd ~/halo-dash
dash init --token $DASH_REGISTRY_TOKEN`}
            output={`✔ Detected Next.js 15 (App Router) + Tailwind v4
✔ Wrote components.json
✔ Wrote .env.local (DASH_REGISTRY_TOKEN)
✔ Wrote AGENTS.md (universal AI rules)
✔ Imported @dash/tokens into app/globals.css
✔ Extended tailwind.config.ts with @dash preset
ℹ Next: dash add button`}
            imagePlaceholder="Terminal after dash init — six green checkmarks confirming the scaffold."
          >
            <div className="rounded-lg border border-warning-light bg-warning-lighter px-4 py-3 text-sm text-text-strong-950">
              <span className="font-semibold">Gotcha:</span> Anda menjalankan{" "}
              <code className="text-xs">dash init</code> di repo lama yang sudah
              punya <code className="text-xs">components.json</code>? CLI akan
              prompt sebelum overwrite — pilih <strong>Merge</strong> agar tetap
              aman.
            </div>
          </DocsStep>

          {/* ── Step 3 ────────────────────────────────────────────────── */}
          <DocsStep
            number={3}
            title="Add your first component"
            description="Pulls button source into registry/dash/ui/button.tsx — you own the file, no version pinning. Re-run anytime to refresh."
            code={`dash add button`}
            output={`✔ Resolved button (4 deps)
✔ Wrote registry/dash/ui/button.tsx
✔ Wrote registry/dash/ui/button.stories.tsx
✔ Wrote registry/dash/lib/utils.ts (already up to date)
ℹ Import: import { Button } from "@/registry/dash/ui/button"`}
            imagePlaceholder="dash add button output — files written list plus the suggested import path."
          >
            <div className="rounded-lg border border-warning-light bg-warning-lighter px-4 py-3 text-sm text-text-strong-950">
              <span className="font-semibold">Gotcha:</span> Need to find the
              component name first? Use <code className="text-xs">dash search modal</code>{" "}
              or <code className="text-xs">dash list</code> to browse the 214+
              registry items.
            </div>
          </DocsStep>

          {/* ── Step 4 ────────────────────────────────────────────────── */}
          <DocsStep
            number={4}
            title="Use it in code"
            description="Standard React import. Variants and sizes come from Dash design tokens — no className overrides needed for the common cases."
            codeLanguage="tsx"
            code={`import { Button } from "@/registry/dash/ui/button"

export default function MitraPage() {
  return (
    <div className="p-6 space-y-3">
      <Button variant="primary">Suspend mitra</Button>
      <Button variant="ghost">Batalkan</Button>
    </div>
  )
}`}
            imagePlaceholder="Mitra page in the browser — primary purple Suspend button and a ghost Batalkan button rendered in Dash brand."
          >
            <div className="rounded-lg border border-warning-light bg-warning-lighter px-4 py-3 text-sm text-text-strong-950">
              <span className="font-semibold">Gotcha:</span> Button renders
              transparent / grey? Your{" "}
              <code className="text-xs">tailwind.config.ts</code> is missing the{" "}
              <code className="text-xs">@dash</code> preset — re-run{" "}
              <code className="text-xs">dash init</code> or import the preset
              manually.
            </div>
          </DocsStep>

          {/* ── Step 5 ────────────────────────────────────────────────── */}
          <DocsStep
            number={5}
            title="Wire your AI editor"
            description="Lets Claude Code / Cursor query the Dash registry by name during chat. After init, restart your editor and verify the MCP connection."
            code={`dash mcp init`}
            output={`✔ Wrote ~/.claude/mcp.json
✔ Wrote ~/.cursor/mcp.json
ℹ Restart Claude Code to pick up the new server.
ℹ Verify with /mcp once Claude is back online.`}
            imagePlaceholder="Claude Code /mcp panel showing dash-ds as a connected MCP server."
            imageHeight="lg"
          >
            <div className="rounded-lg border border-warning-light bg-warning-lighter px-4 py-3 text-sm text-text-strong-950">
              <span className="font-semibold">Gotcha:</span> MCP server shows
              &ldquo;disconnected&rdquo;? Check{" "}
              <code className="text-xs">DASH_REGISTRY_TOKEN</code> in{" "}
              <code className="text-xs">~/.claude/mcp.json</code> and confirm
              Claude was fully restarted (Cmd+Q, not just window close).
            </div>
          </DocsStep>
        </DocsStepList>
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Verify it works                                                  */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Verify it works"
        description="Sixty seconds of sanity checks. If any of these fail, jump to the deep references in the next section — they cover every edge case we&apos;ve hit so far."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-6 space-y-2 max-w-2xl">
          <li>
            <code className="text-xs">dash list</code> prints 200+ items grouped
            by category (components, blocks, templates).
          </li>
          <li>
            <code className="text-xs">dash audit</code> exits 0 — no banned imports,
            no raw hex, no missing audit-trail fields.
          </li>
          <li>
            <code className="text-xs">pnpm dev</code> serves a page with the Dash
            purple <code className="text-xs">#5e2aac</code> button — not generic
            blue, not transparent.
          </li>
          <li>
            Claude Code <code className="text-xs">/mcp</code> shows{" "}
            <code className="text-xs">dash-ds</code> with a green dot.
          </li>
          <li>
            Asking Claude for &ldquo;a Dash mitra list page&rdquo; triggers a{" "}
            <code className="text-xs">dash add</code> call, not a from-scratch
            Tailwind div.
          </li>
        </ul>
      </DocsSection>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Going deeper                                                     */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Going deeper"
        description="The four pages below cover the same ground in greater depth — pick the one that matches your role."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/docs/installation"
            className="group rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 hover:border-(--dash-purple-400) hover:shadow-sm transition"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-text-soft-400 mb-2">
              Reference
            </div>
            <div className="text-base font-semibold tracking-tight text-text-strong-950 group-hover:text-(--dash-purple-700)">
              Installation reference →
            </div>
            <p className="text-sm text-text-sub-600 leading-relaxed mt-2">
              Six-step deep dive with every flag explained, manual fallback for
              when <code className="text-xs">dash init</code> can&apos;t auto-detect.
            </p>
          </Link>

          <Link
            href="/docs/quick-start"
            className="group rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 hover:border-(--dash-purple-400) hover:shadow-sm transition"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-text-soft-400 mb-2">
              Reference
            </div>
            <div className="text-base font-semibold tracking-tight text-text-strong-950 group-hover:text-(--dash-purple-700)">
              User Quick Start (8 steps) →
            </div>
            <p className="text-sm text-text-sub-600 leading-relaxed mt-2">
              Longer eight-step walkthrough that includes Skill install, AI tool
              cheat-sheet, and a Troubleshooting section per editor.
            </p>
          </Link>

          <Link
            href="/docs/getting-started/testing-locally"
            className="group rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 hover:border-(--dash-purple-400) hover:shadow-sm transition"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-text-soft-400 mb-2">
              Pilot
            </div>
            <div className="text-base font-semibold tracking-tight text-text-strong-950 group-hover:text-(--dash-purple-700)">
              Pilot testing playbook →
            </div>
            <p className="text-sm text-text-sub-600 leading-relaxed mt-2">
              Built for the first three Wave-5 pilot users — clones the docs
              repo locally, runs the registry on{" "}
              <code className="text-xs">localhost:3000</code>, full end-to-end
              dogfood loop.
            </p>
          </Link>

          <Link
            href="/docs/onboarding"
            className="group rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 hover:border-(--dash-purple-400) hover:shadow-sm transition"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-text-soft-400 mb-2">
              Team
            </div>
            <div className="text-base font-semibold tracking-tight text-text-strong-950 group-hover:text-(--dash-purple-700)">
              New-team-member onboarding →
            </div>
            <p className="text-sm text-text-sub-600 leading-relaxed mt-2">
              Wider 45-minute onboarding playbook with pre-flight scope reading,
              gap-reporting, and vibe-code mode. Read this on day 1 if Anda baru
              join Dash.
            </p>
          </Link>
        </div>
      </DocsSection>
    </DocsPageShell>
  )
}
