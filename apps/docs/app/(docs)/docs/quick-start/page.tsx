"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPrinciples,
  DocsVariantTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function QuickStartPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started"
        title="PE Quick Start"
        description="Onboarding for the 10 Product Engineers across Dash tribes. One-time machine setup, one-time per-repo setup, then a daily AI-first workflow: PE → Claude Code → dash add → shipped page."
        status="new"
      />

      <DocsSection
        title="Who this is for"
        description="The 10 PE across Reservasi, Express, Eats, Halo, Mitra, Finance, HR, Marketing, Growth, and Platform tribes. Read this once on day 1, then refer back when wiring up a new repo or AI tool."
      >
        <DocsPrinciples
          items={[
            {
              title: "AI-first by default",
              body: "You should be writing prompts more than TSX. Claude / Cursor / Codex query Dash DS through MCP and rules files, then call dash add — you review the diff.",
            },
            {
              title: "Registry, not npm",
              body: "Dash DS ships as a shadcn-style registry under @dash. Components land in your repo as source you own — no version bumps, no peer-dep hell.",
            },
            {
              title: "Brand audit loop",
              body: "Every 2 weeks we run a brand fidelity audit on shipped PRs. Spacing / color / anatomy / semantic tokens all match the DS, or we fix.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="One-time machine setup"
        description="Install the dash CLI globally. CLI v1 is currently in flight at /Users/<you>/dash-cli/ — until the npm publish lands, link locally."
      >
        <DocsCode
          language="bash"
          code={`# Option A — once published to npm
npm i -g @dash/cli

# Option B — local dev (current state, May 2026)
cd ~/dash-cli && pnpm install && pnpm build && npm link
# now \`dash\` is available globally`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Verify with <code className="text-xs">dash --version</code>. You should see{" "}
          <code className="text-xs">dash@1.x.x</code>. If you see &ldquo;command not
          found&rdquo;, your <code className="text-xs">$PATH</code> is missing the npm
          global bin — run <code className="text-xs">npm bin -g</code> and add the
          output to your shell rc file.
        </p>
      </DocsSection>

      <DocsSection
        title="One-time per Dash repo setup"
        description="Run dash init once at the root of every Dash repo (Halo-dash, Tribe-Express, Tribe-Reservasi, etc.). Idempotent — safe to re-run."
      >
        <DocsCode
          language="bash"
          code={`cd ~/halo-dash      # or whichever Dash repo
dash init --token sk-dash-xxxx`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          What this writes:
        </p>
        <DocsVariantTable
          nameHeader="File"
          descHeader="Purpose"
          rows={[
            { name: "components.json", description: "Registry pointer (@dash → https://dash-ds.vercel.app/registry)." },
            { name: ".env.local", description: "DASH_REGISTRY_TOKEN — auth for private registry." },
            { name: "app/globals.css", description: "Imports @dash/tokens base theme (radii, spacing scale, color tokens)." },
            { name: "tailwind.config.ts", description: "Merges @dash preset (semantic tokens like bg-bg-weak-50, text-text-sub-600)." },
            { name: "AGENTS.md", description: "Universal AI rules — Claude, Cursor, Codex all read this." },
            { name: ".cursorrules", description: "Cursor-specific rules file pointing to AGENTS.md." },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="Daily workflow"
        description="The happy path you should aim for on every ticket: chat → AI proposes registry items → dash add → review → commit."
      >
        <ol className="text-sm text-text-sub-600 list-decimal pl-5 space-y-2">
          <li>
            Open the ticket in Linear / Jira. Read the acceptance criteria.
          </li>
          <li>
            In Claude Code (or Cursor), describe the screen in plain Indonesian or
            English. Example:{" "}
            <em>
              &ldquo;Buatin halaman riwayat trip mitra di halo-dash. Filter
              tanggal, status, tribe. Empty state. Pagination 20/halaman.&rdquo;
            </em>
          </li>
          <li>
            The AI queries Dash DS via MCP, proposes a template (e.g.{" "}
            <code className="text-xs">list-detail-page</code>) + blocks (
            <code className="text-xs">data-table</code>,{" "}
            <code className="text-xs">filter-bar</code>,{" "}
            <code className="text-xs">empty-state</code>) + atoms.
          </li>
          <li>
            AI runs <code className="text-xs">dash add list-detail-page data-table filter-bar empty-state</code>.
            Components land in <code className="text-xs">registry/dash/</code> as source.
          </li>
          <li>
            AI wires the page in <code className="text-xs">app/(internal)/mitra/[id]/trips/page.tsx</code>{" "}
            using semantic tokens only.
          </li>
          <li>
            You review the diff, run <code className="text-xs">pnpm dev</code>, screenshot, ship PR.
          </li>
        </ol>
        <p className="text-sm text-text-sub-600 mt-3">
          Target velocity: 1 medium page (table + filter + empty state) in{" "}
          <strong>~20 minutes</strong> from prompt to PR.
        </p>
      </DocsSection>

      <DocsSection
        title="AI Tool Configuration"
        description="Three tools, three config files. They all read the same source of truth — AGENTS.md — and all query the same MCP server."
      >
        <h3 className="text-base font-semibold tracking-tight text-text-strong-950">
          Claude Code
        </h3>
        <p className="text-sm text-text-sub-600">
          Recommended primary. Has the best MCP integration and the longest context window.
        </p>
        <DocsCode
          language="bash"
          code={`# Once dash CLI is installed, run inside your repo:
dash mcp init

# This writes to ~/.claude/mcp.json:
# {
#   "mcpServers": {
#     "dash-ds": {
#       "command": "npx",
#       "args": ["-y", "@dash/mcp-server"],
#       "env": { "DASH_REGISTRY_TOKEN": "sk-dash-xxxx" }
#     }
#   }
# }`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Manual fallback — edit <code className="text-xs">~/.claude/mcp.json</code>{" "}
          yourself with the snippet above. Restart Claude Code. Verify with{" "}
          <code className="text-xs">/mcp</code> — you should see{" "}
          <code className="text-xs">dash-ds</code> listed as connected.
        </p>
        <p className="text-sm text-text-sub-600 mt-3">
          CLAUDE.md installation: at the root of every Dash repo, ensure{" "}
          <code className="text-xs">CLAUDE.md</code> contains a single line
          re-exporting AGENTS.md:
        </p>
        <DocsCode
          language="markdown"
          code={`@AGENTS.md`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Sample prompts that work well:
        </p>
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>
            <em>&ldquo;Use Dash DS. Build a trip history page for mitra detail.&rdquo;</em>
          </li>
          <li>
            <em>&ldquo;Refactor app/(internal)/mitra/page.tsx to use the Dash list-detail-page template.&rdquo;</em>
          </li>
          <li>
            <em>&ldquo;Which Dash component should I use for a multi-step suspend confirmation modal?&rdquo;</em>
          </li>
          <li>
            <em>&ldquo;Check this PR diff against Dash brand audit rules. Flag any raw hex colors or px values.&rdquo;</em>
          </li>
        </ul>

        <h3 className="text-base font-semibold tracking-tight text-text-strong-950 pt-6">
          Cursor
        </h3>
        <p className="text-sm text-text-sub-600">
          Cursor reads <code className="text-xs">.cursorrules</code> at repo root.
          <code className="text-xs">dash init</code> writes a stub that re-exports{" "}
          <code className="text-xs">AGENTS.md</code> so you only maintain one rules file:
        </p>
        <DocsCode
          language="markdown"
          code={`# .cursorrules
# Single source of truth lives in AGENTS.md.
# Read it first, every chat, before proposing code.
@AGENTS.md

# Hard rules (also in AGENTS.md, repeated for emphasis):
# 1. NEVER use raw hex / rgb / px. Always use Dash semantic tokens.
# 2. Always run \`dash add <name>\` before importing anything from @/registry/dash.
# 3. Prefer existing templates (list-detail-page, dashboard-shell) over hand-rolled layouts.`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          MCP in Cursor: Settings → Features → MCP → Add Server. Paste the same{" "}
          <code className="text-xs">dash-ds</code> block from the Claude config.
        </p>

        <h3 className="text-base font-semibold tracking-tight text-text-strong-950 pt-6">
          Codex / OpenAI agents
        </h3>
        <p className="text-sm text-text-sub-600">
          Codex CLI and most OpenAI-based agent runners now read{" "}
          <code className="text-xs">AGENTS.md</code> as the universal rules file. No
          extra config needed beyond what <code className="text-xs">dash init</code>{" "}
          already wrote.
        </p>
        <p className="text-sm text-text-sub-600 mt-3">
          For raw API integration (custom internal tooling), expose the registry as a
          tool:
        </p>
        <DocsCode
          language="ts"
          code={`// tools/dash-ds.ts
export const dashRegistryTool = {
  name: "dash_registry_lookup",
  description: "Search Dash Design System registry for components, blocks, templates.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Natural language query, e.g. 'multi-step form'" },
      kind: { type: "string", enum: ["ui", "blocks", "templates", "all"], default: "all" },
    },
    required: ["query"],
  },
  async execute({ query, kind }) {
    const r = await fetch(
      \`https://dash-ds.vercel.app/api/registry/search?q=\${encodeURIComponent(query)}&kind=\${kind}\`,
      { headers: { Authorization: \`Bearer \${process.env.DASH_REGISTRY_TOKEN}\` } },
    )
    return r.json()
  },
}`}
        />
      </DocsSection>

      <DocsSection
        title="Workflow Cookbook"
        description="Three realistic walkthroughs. Real prompts, real AI behavior, real time saved vs hand-coding."
      >
        <h3 className="text-base font-semibold tracking-tight text-text-strong-950">
          Use case 1 — Build halaman riwayat trip (Halo-dash, existing repo)
        </h3>
        <p className="text-sm text-text-sub-600">
          PE: Yudi (Halo-dash). Ticket: HALO-412. AC: mitra detail page needs a Trip
          History tab — table of last 90 days, filter by tanggal/status/tribe, empty
          state when no trips.
        </p>
        <DocsCode
          language="markdown"
          code={`PE prompt to Claude:
> Halo-dash repo. Tambah halaman trip history di route
> /mitra/[id]/trips. Pakai Dash DS — table data, filter
> tanggal + status + tribe, empty state, pagination 20/halaman.
> Dummy data dulu pakai 30 row di mocks/trips.json.

Claude behavior:
1. Reads AGENTS.md → confirms Dash DS rules
2. Queries MCP: \`dash_registry_lookup query="list-detail with filters and table"\`
3. Returns plan:
   - Template: list-detail-page
   - Blocks: data-table, filter-bar, empty-state, pagination
   - Atoms: badge, button, date-range-picker, select
4. Runs: dash add list-detail-page data-table filter-bar empty-state pagination
5. Writes app/(internal)/mitra/[id]/trips/page.tsx (~80 LOC)
6. Writes mocks/trips.json (30 rows)
7. Reports diff for review

Expected output:
- 1 new route, 1 new mock file
- 0 raw hex / px in the diff (all semantic tokens)
- Empty state hits the canonical Dash illustration

Time saved: ~3 hours → ~25 min (PE review + minor tweaks)`}
        />

        <h3 className="text-base font-semibold tracking-tight text-text-strong-950 pt-6">
          Use case 2 — Refactor mitra-suspend page (existing, drifted from DS)
        </h3>
        <p className="text-sm text-text-sub-600">
          PE: Nadia (Mitra Ops). The page was built pre-DS, uses raw hex colors and
          inline px values. Brand audit caught it. Need to bring it back inside the DS.
        </p>
        <DocsCode
          language="markdown"
          code={`PE prompt to Claude:
> Refactor app/(internal)/mitra/suspend/page.tsx ke Dash DS.
> Audit dulu — apa yang nggak compliant? Lalu apply fix.
> Pertahanin business logic, hanya ganti styling + struktur jadi
> Dash template.

Claude behavior:
1. Reads the existing file. Audits:
   - 7 raw hex values (e.g. #FF5A5F → bg-error-base)
   - 12 px-based spacings (e.g. padding: 16px → p-4)
   - Custom Card div → should use Dash Card atom
   - Hand-rolled stepper → should use Dash stepper block
2. Proposes the diff as 3 atomic commits:
   commit 1: token swap (hex → semantic)
   commit 2: spacing scale swap (px → spacing tokens)
   commit 3: structural refactor to list-detail-page + stepper
3. Runs dash add stepper card
4. Applies. Reports.

Expected output:
- Same visual outcome (or closer to design)
- 0 raw values
- 3 commits, each independently revertable

Time saved: ~4 hours → ~30 min`}
        />

        <h3 className="text-base font-semibold tracking-tight text-text-strong-950 pt-6">
          Use case 3 — Spin up Phase 8 Tribe-Express (new repo)
        </h3>
        <p className="text-sm text-text-sub-600">
          PE: Fayzul (Express). Brand new repo for the Express tribe. From{" "}
          <code className="text-xs">npx create-next-app</code> to first 3 shipped pages.
        </p>
        <DocsCode
          language="markdown"
          code={`PE workflow:

# Terminal
npx create-next-app@latest tribe-express --typescript --tailwind --app
cd tribe-express
dash init --token sk-dash-xxxx

# Now ask Claude:
> Tribe-Express adalah backoffice driver Dash Express. Phase 8.
> Bootstrap 3 halaman: (1) dashboard ops, (2) auto-suspend
> mitra list, (3) settings tribe. Pakai Dash dashboard-shell
> sebagai layout root. Sidebar nav harus include 3 halaman ini.

Claude behavior:
1. Reads AGENTS.md from \`dash init\`
2. Queries MCP for dashboard-shell + 3 page templates
3. Runs: dash add dashboard-shell stats-dashboard list-detail-page settings-page
4. Writes app/layout.tsx with dashboard-shell wrapper + sidebar config
5. Writes 3 route folders, each with seeded mocks
6. Wires sidebar nav-config to all 3 routes
7. Reports: "Ready to dev. Run pnpm dev → http://localhost:3000"

Expected output:
- Fresh repo → 3 functional pages in 1 command
- Dashboard shell auto-wired
- Sidebar nav populated

Time saved: ~1 full day → ~45 min`}
        />
      </DocsSection>

      <DocsSection
        title="Troubleshooting"
        description="The four pain points we've seen in dogfood week. Read this before pinging #dash-ds in Slack."
      >
        <h3 className="text-base font-semibold tracking-tight text-text-strong-950">
          Claude doesn&apos;t query Dash MCP automatically
        </h3>
        <ol className="text-sm text-text-sub-600 list-decimal pl-5 space-y-1">
          <li>
            Check <code className="text-xs">/mcp</code> in Claude Code. Is{" "}
            <code className="text-xs">dash-ds</code> listed?
          </li>
          <li>
            If not connected — verify <code className="text-xs">~/.claude/mcp.json</code>{" "}
            is valid JSON and your <code className="text-xs">DASH_REGISTRY_TOKEN</code>{" "}
            is set.
          </li>
          <li>
            If connected but Claude ignores it — your prompt likely doesn&apos;t
            mention Dash. Add <em>&ldquo;Use Dash DS&rdquo;</em> to the prompt or put
            it in <code className="text-xs">AGENTS.md</code> as a hard rule.
          </li>
          <li>
            Restart Claude Code. MCP servers don&apos;t hot-reload config.
          </li>
        </ol>

        <h3 className="text-base font-semibold tracking-tight text-text-strong-950 pt-6">
          dash add fails (network / auth / version mismatch)
        </h3>
        <DocsVariantTable
          nameHeader="Symptom"
          descHeader="Fix"
          rows={[
            {
              name: "401 Unauthorized",
              description: <>Token expired or wrong. Re-export <code className="text-xs">DASH_REGISTRY_TOKEN</code> from <code className="text-xs">.env.local</code> or ping #dash-ds for a fresh one.</>,
            },
            {
              name: "ECONNRESET / ETIMEDOUT",
              description: <>Registry hosted on Vercel — usually transient. Retry. If persistent, check <Link href="https://dash-ds.vercel.app/status" className="text-(--dash-purple-600) underline-offset-4 hover:underline">status page</Link>.</>,
            },
            {
              name: "Component schema version mismatch",
              description: <>Your CLI is older than the registry. <code className="text-xs">npm i -g @dash/cli@latest</code> (or rebuild local link).</>,
            },
            {
              name: "Peer dep conflict",
              description: <>Repo on Next 14, registry expects Next 15. Upgrade Next first — Dash DS only supports Next 15+.</>,
            },
          ]}
        />

        <h3 className="text-base font-semibold tracking-tight text-text-strong-950 pt-6">
          Tailwind config conflicts with @dash tokens
        </h3>
        <p className="text-sm text-text-sub-600">
          Symptom: <code className="text-xs">bg-bg-weak-50</code> renders as
          transparent / unset. Cause: your repo has a hand-rolled{" "}
          <code className="text-xs">tailwind.config.ts</code> that doesn&apos;t extend
          the <code className="text-xs">@dash/tailwind-preset</code>.
        </p>
        <DocsCode
          language="ts"
          code={`// tailwind.config.ts
import dashPreset from "@dash/tailwind-preset"

export default {
  presets: [dashPreset],          // ← required
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./registry/**/*.{ts,tsx}",   // ← Dash registry source
  ],
  theme: { extend: { /* your overrides */ } },
}`}
        />

        <h3 className="text-base font-semibold tracking-tight text-text-strong-950 pt-6">
          Component already exists in target repo
        </h3>
        <p className="text-sm text-text-sub-600">
          <code className="text-xs">dash add button</code> prompts before overwriting.
          Three options:
        </p>
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>
            <strong>Overwrite</strong> — accept the Dash version, port any
            repo-specific logic on top in a follow-up commit.
          </li>
          <li>
            <strong>Skip</strong> — keep your version, but flag it in the next brand
            audit so we know it&apos;s diverged.
          </li>
          <li>
            <strong>Rename</strong> — <code className="text-xs">dash add button --as legacy-button</code>{" "}
            keeps both side-by-side during a migration.
          </li>
        </ul>
      </DocsSection>

      <DocsSection
        title="Brand Audit Loop"
        description="Every 2 weeks, each tribe runs a brand fidelity audit on the PRs shipped that sprint. The goal: catch drift early so the DS stays the source of truth, not a suggestion."
      >
        <h3 className="text-base font-semibold tracking-tight text-text-strong-950">
          How to run the audit
        </h3>
        <ol className="text-sm text-text-sub-600 list-decimal pl-5 space-y-1">
          <li>Pick the merged PRs from the last 2 weeks in your tribe&apos;s repo.</li>
          <li>
            For each PR, run the audit prompt against the diff (Claude Code with MCP).
          </li>
          <li>
            Log issues in <code className="text-xs">AUDIT-LOG.md</code> at the repo root
            (status: Clean / Minor / Major).
          </li>
          <li>
            Open follow-up tickets for Major issues. Minor goes on the next sprint&apos;s
            polish backlog.
          </li>
        </ol>
        <DocsCode
          language="markdown"
          code={`Audit prompt (copy-paste into Claude):

> Run a Dash DS brand fidelity audit on PRs #412, #418, #423 in this repo.
> For each PR, check:
>   1. Spacing scale match (no raw px, only Dash spacing tokens)
>   2. Color tokens match (no raw hex / rgb, only semantic tokens like
>      bg-bg-weak-50, text-text-sub-600, border-stroke-soft-200)
>   3. Anatomy match (using Dash templates/blocks, not hand-rolled layouts)
>   4. Semantic tokens used (status="completed" not className="bg-green-500")
>
> Output a markdown table: PR | Status | Issues | Recommended fix.
> Save to AUDIT-LOG.md.`}
        />

        <h3 className="text-base font-semibold tracking-tight text-text-strong-950 pt-6">
          Checklist (run this manually for high-stakes PRs)
        </h3>
        <DocsVariantTable
          nameHeader="Dimension"
          descHeader="What to check"
          rows={[
            {
              name: "Spacing scale",
              description: <>No <code className="text-xs">px</code>, <code className="text-xs">rem</code>, or arbitrary <code className="text-xs">[12px]</code> values in className. Only <code className="text-xs">p-2 / p-3 / p-4 / p-6</code> etc.</>,
            },
            {
              name: "Color tokens",
              description: <>No <code className="text-xs">#</code> hex, no <code className="text-xs">rgb()</code>, no Tailwind raw scale (<code className="text-xs">bg-gray-100</code>). Only semantic Dash tokens.</>,
            },
            {
              name: "Anatomy",
              description: <>Page wrapped in a Dash template (list-detail-page, dashboard-shell, settings-page, etc.). No hand-rolled top-level layout divs.</>,
            },
            {
              name: "Semantic Dash tokens",
              description: <>Badge uses <code className="text-xs">status=&quot;completed&quot;</code> prop, not custom <code className="text-xs">className</code>. Button uses <code className="text-xs">variant</code> prop. No styling overrides on primitives.</>,
            },
            {
              name: "Typography",
              description: <>Heading sizes follow the docs scale (<code className="text-xs">text-5xl lg:text-7xl</code> for H1, etc.). No font-weight overrides on body copy.</>,
            },
            {
              name: "Icons",
              description: <>Remix icons via <code className="text-xs">@remixicon/react</code> only. No lucide / heroicons mixed in.</>,
            },
          ]}
        />

        <h3 className="text-base font-semibold tracking-tight text-text-strong-950 pt-6">
          2-weekly cadence template
        </h3>
        <DocsCode
          language="markdown"
          code={`# Brand Audit — Sprint <NN>
Tribe: <Reservasi | Express | Eats | Halo | Mitra | Finance | HR | Marketing | Growth | Platform>
Date: <YYYY-MM-DD>
Auditor: <PE name>

## Scope
PRs reviewed: #<a>, #<b>, #<c>, ...

## Results

| PR  | Status      | Spacing | Color | Anatomy | Sem.Token | Issues | Owner | ETA |
| --- | ----------- | ------- | ----- | ------- | --------- | ------ | ----- | --- |
| #412 | Clean       | ok      | ok    | ok      | ok        | —      | —     | —   |
| #418 | Minor (2)   | ok      | ok    | ok      | drift     | Badge raw className | Yudi | sprint+1 |
| #423 | Major (1)   | drift   | ok    | drift   | ok        | Hand-rolled layout, px spacing | Nadia | sprint+0 |

## Follow-ups
- [ ] HALO-512 — refactor mitra-suspend page anatomy (Nadia, sprint+0)
- [ ] HALO-518 — Badge token sweep (Yudi, sprint+1)

## Trend (last 3 sprints)
- Sprint NN-2: 8 PRs, 1 Major, 3 Minor
- Sprint NN-1: 7 PRs, 0 Major, 2 Minor
- Sprint NN:   9 PRs, 1 Major, 2 Minor   ← this sprint`}
        />
      </DocsSection>

      <DocsSection title="Next steps">
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/components/button">
              Components → Button
            </Link>{" "}
            — first component deep-dive
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/templates/dashboard-shell">
              Templates → Dashboard Shell
            </Link>{" "}
            — full app shell with sidebar + topbar
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/forms/react-hook-form">
              Forms → React Hook Form
            </Link>{" "}
            — wire a mitra create/edit form
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/foundations/color">
              Foundations → Color
            </Link>{" "}
            — token system + scales
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
