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

export default function QuickStartPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started"
        title="User Quick Start"
        description="From a fresh laptop to a shipped Dash-themed page in eight steps. Follow the visual walkthrough — each step shows the command, the expected output, and the resulting UI."
        status="new"
      />

      {/* Hero workflow diagram — at-a-glance view of the journey */}
      <DocsWorkflowDiagram
        steps={[
          { label: "Install CLI", sub: "pnpm i -g dash" },
          { label: "Initialize repo", sub: "dash init" },
          { label: "Add component", sub: "dash add button" },
          { label: "Use in code", sub: "<Button />" },
          { label: "Wire MCP", sub: "dash mcp init" },
          { label: "Install skill", sub: "dash skill add" },
          { label: "Ask Claude", sub: "Build me a page" },
          { label: "Ship PR", sub: "Verify + merge" },
        ]}
      />

      <DocsSection
        title="Who this is for"
        description="The 10 Product Engineers across Reservasi, Express, Eats, Halo, Mitra, Finance, HR, Marketing, Growth, and Platform tribes. Read this once on day 1, then refer back when wiring up a new repo or AI tool."
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
        title="The 8-step walkthrough"
        description="Each step is independent — you can stop after step 4 and have a working component, or push through to step 8 for the full AI-first workflow."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Install the dash CLI"
            description="One-time machine setup. Installs the dash binary globally so every Dash repo can call dash init / dash add."
            code={`# Once published to npm
pnpm i -g dash

# Verify
dash --version
# → dash@1.x.x`}
            output={`✔ Installed dash@1.0.0 to /usr/local/bin/dash
✔ Registry: https://ds.dash.com/r/
ℹ Run \`dash init\` inside any Dash repo to wire it up.`}
            imagePlaceholder="Terminal showing successful global install of dash CLI and version output."
          />

          <DocsStep
            number={2}
            title="Initialize the repo"
            description="One-time per Dash repo. Writes components.json, .env.local, AGENTS.md, and merges the @dash tailwind preset. Idempotent — safe to re-run."
            code={`cd ~/halo-dash
dash init --token sk-dash-xxxx`}
            output={`✔ Detected Next.js 15 (App Router) + Tailwind v4
✔ Wrote components.json
✔ Wrote .env.local (DASH_REGISTRY_TOKEN)
✔ Wrote AGENTS.md (universal AI rules)
✔ Wrote .cursorrules (re-exports AGENTS.md)
✔ Imported @dash/tokens into app/globals.css
✔ Extended tailwind.config.ts with @dash preset
ℹ Next: dash add button`}
            imagePlaceholder="Terminal after dash init — six green checkmarks confirming the scaffold, plus the next-step hint."
          />

          <DocsStep
            number={3}
            title="Install your first component"
            description="Pulls the button source into registry/dash/ui/button.tsx — you own the file, no version pinning. Re-run anytime to refresh."
            code={`dash add button`}
            output={`✔ Resolved button (4 deps)
✔ Wrote registry/dash/ui/button.tsx
✔ Wrote registry/dash/ui/button.stories.tsx
✔ Wrote registry/dash/lib/utils.ts (already up to date)
ℹ Import: import { Button } from "@/registry/dash/ui/button"`}
            imagePlaceholder="Terminal output of dash add button — files written list and the suggested import path."
          />

          <DocsStep
            number={4}
            title="Use it in your code"
            description="Standard React import. Variants and sizes come from the Dash design tokens — no className overrides needed for the common cases."
            codeLanguage="tsx"
            code={`import { Button } from "@/registry/dash/ui/button"

export default function MitraPage() {
  return (
    <div className="p-6 space-y-3">
      <Button variant="primary">Suspend mitra</Button>
      <Button variant="ghost">Cancel</Button>
    </div>
  )
}`}
            imagePlaceholder="Mitra page in the browser with a primary purple Suspend button and a ghost Cancel button — Dash brand styling applied."
          />

          <DocsStep
            number={5}
            title="Wire the MCP server"
            description="Lets Claude Code / Cursor query the Dash registry by name during chat. After init, restart Claude and run /mcp — you should see dash-ds connected."
            code={`dash mcp init

# Writes ~/.claude/mcp.json:
# {
#   "mcpServers": {
#     "dash-ds": {
#       "command": "npx",
#       "args": ["-y", "@dash/mcp-server"],
#       "env": { "DASH_REGISTRY_TOKEN": "sk-dash-xxxx" }
#     }
#   }
# }`}
            output={`✔ Wrote ~/.claude/mcp.json
✔ Wrote ~/.cursor/mcp.json
ℹ Restart Claude Code to pick up the new server.
ℹ Verify with /mcp once Claude is back online.`}
            imagePlaceholder="Claude Code /mcp panel showing dash-ds as a connected MCP server with 4 tools listed (search, get, list, install)."
          />

          <DocsStep
            number={6}
            title="Install the Dash skill"
            description="Skills are the prompt-engineering layer — they teach Claude when to use which Dash template, which anatomy to pick, and how to phrase prompts back to you."
            code={`dash skill add dash-ds-pe`}
            output={`✔ Resolved dash-ds-pe (skill v1.4.0)
✔ Wrote .claude/skills/dash-ds-pe/SKILL.md
✔ Wrote .claude/skills/dash-ds-pe/templates.md
✔ Wrote .claude/skills/dash-ds-pe/anatomy-rules.md
ℹ Claude will auto-load this skill when the prompt mentions Dash.`}
            imagePlaceholder="File tree showing .claude/skills/dash-ds-pe/ with SKILL.md, templates.md, and anatomy-rules.md highlighted."
          />

          <DocsStep
            number={7}
            title="Ask Claude to build a page"
            description="Now describe the screen in plain Indonesian or English. Claude reads AGENTS.md, queries MCP, runs dash add for missing pieces, and writes the route — you only review the diff."
            codeLanguage="markdown"
            code={`> Halo-dash repo. Tambah halaman trip history di route
> /mitra/[id]/trips. Pakai Dash DS — table data, filter
> tanggal + status + tribe, empty state, pagination 20/halaman.
> Dummy data dulu pakai 30 row di mocks/trips.json.`}
            output={`Claude:
1. Reads AGENTS.md → confirms Dash DS rules
2. Queries MCP: dash_registry_lookup "list-detail with filters"
3. Plan: template=list-detail-page, blocks=[data-table, filter-bar, empty-state, pagination]
4. Runs: dash add list-detail-page data-table filter-bar empty-state pagination
5. Writes app/(internal)/mitra/[id]/trips/page.tsx (~80 LOC)
6. Writes mocks/trips.json (30 rows)
7. Reports diff for your review.

Estimated time: ~3 hours → ~25 min (prompt → review → ship).`}
            imagePlaceholder="Claude Code split view — left: user prompt in chat, right: generated page.tsx diff with green additions highlighted."
            imageHeight="lg"
          />

          <DocsStep
            number={8}
            title="Ship it"
            description="Review the diff, run pnpm dev to eyeball the page, push, open PR. The auto-attached brand audit checks spacing / color / anatomy / semantic tokens for you."
            code={`pnpm dev
# → http://localhost:3000/mitra/9412/trips

# happy with it?
git add -A && git commit -m "feat(halo): trip history page (Dash DS)"
git push -u origin feat/halo-trip-history
gh pr create --fill`}
            output={`✓ Dash brand audit — 0 issues
  ✓ Spacing: tokens only (no raw px)
  ✓ Color: semantic tokens only (no raw hex)
  ✓ Anatomy: list-detail-page template
  ✓ Semantic Dash tokens used
✓ Ready to merge`}
            imagePlaceholder="GitHub PR view — Dash brand audit check passing with 4 green ticks, diff stats showing +218 / -0 lines."
            imageHeight="lg"
          />
        </DocsStepList>
      </DocsSection>

      <DocsSection
        title="AI tool configuration cheat-sheet"
        description="All three editors read the same source of truth — AGENTS.md — and all query the same MCP server. Pick your primary, the rest fall into place."
      >
        <DocsPrinciples
          items={[
            {
              title: "Claude Code (recommended)",
              body: "Best MCP integration, longest context. dash mcp init writes ~/.claude/mcp.json. Verify with /mcp.",
            },
            {
              title: "Cursor",
              body: ".cursorrules at repo root re-exports AGENTS.md. MCP added via Settings → Features → MCP → paste the dash-ds block.",
            },
            {
              title: "Codex / OpenAI agents",
              body: "Codex CLI auto-reads AGENTS.md. For raw API integration, expose the registry as a tool (dash_registry_lookup).",
            },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="Troubleshooting"
        description="The four pain points we saw in dogfood week. Read this before pinging #dash-ds in Slack."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Claude doesn't query Dash MCP automatically"
            description="Symptom: Claude proposes raw Tailwind divs instead of running dash add. Usually one of four causes — MCP not connected, token missing, prompt unclear, or stale Claude session."
            imagePlaceholder="Claude /mcp output showing dash-ds in 'connected' state with green dot — what success looks like."
            imageHeight="sm"
          >
            <ol className="text-sm text-text-sub-600 list-decimal pl-5 space-y-1">
              <li>
                Check <code className="text-xs">/mcp</code> in Claude Code. Is{" "}
                <code className="text-xs">dash-ds</code> listed?
              </li>
              <li>
                If not connected — verify <code className="text-xs">~/.claude/mcp.json</code>{" "}
                is valid JSON and <code className="text-xs">DASH_REGISTRY_TOKEN</code> is set.
              </li>
              <li>
                If connected but Claude ignores it — add{" "}
                <em>&ldquo;Use Dash DS&rdquo;</em> to your prompt, or move that rule into{" "}
                <code className="text-xs">AGENTS.md</code>.
              </li>
              <li>Restart Claude Code. MCP servers don&apos;t hot-reload config.</li>
            </ol>
          </DocsStep>

          <DocsStep
            number={2}
            title="dash add fails (network / auth / version)"
            description="The CLI prints a clear error code — match it to the table below."
            imagePlaceholder="Terminal showing a 401 Unauthorized error from dash add — with the highlighted line for token mismatch."
            imageHeight="sm"
          >
            <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
              <li>
                <strong>401 Unauthorized</strong> — Token expired or wrong. Re-export{" "}
                <code className="text-xs">DASH_REGISTRY_TOKEN</code> or ping #dash-ds for a fresh one.
              </li>
              <li>
                <strong>ECONNRESET / ETIMEDOUT</strong> — Registry is hosted on Vercel and usually transient. Retry.
              </li>
              <li>
                <strong>Schema mismatch</strong> — CLI older than registry. Run{" "}
                <code className="text-xs">pnpm i -g dash@latest</code>.
              </li>
              <li>
                <strong>Peer dep conflict</strong> — Repo on Next 14, Dash needs Next 15+. Upgrade Next first.
              </li>
            </ul>
          </DocsStep>

          <DocsStep
            number={3}
            title="Tailwind config conflicts with @dash tokens"
            description="Symptom: bg-bg-weak-50 renders transparent. Cause: your tailwind.config.ts doesn't extend the @dash preset."
            codeLanguage="ts"
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
            imagePlaceholder="Side-by-side: broken page on the left (gray boxes, no Dash purple) vs fixed page after preset import on the right."
          />

          <DocsStep
            number={4}
            title="Component already exists in target repo"
            description="dash add prompts before overwriting. Three options — pick the one that matches your migration mode."
            imagePlaceholder="dash add prompt showing the three-option dialog: Overwrite / Skip / Rename (with arrow keys hint)."
            imageHeight="sm"
          >
            <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
              <li>
                <strong>Overwrite</strong> — accept the Dash version, port repo-specific logic on top in a follow-up commit.
              </li>
              <li>
                <strong>Skip</strong> — keep your version, but flag it in the next brand audit.
              </li>
              <li>
                <strong>Rename</strong> — <code className="text-xs">dash add button --as legacy-button</code>{" "}
                keeps both side-by-side during migration.
              </li>
            </ul>
          </DocsStep>
        </DocsStepList>
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
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/components/form">
              Forms → vanilla useState
            </Link>{" "}
            — wire a mitra create/edit form (RHF/zod banned per Dash rules)
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
