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
 * /docs/getting-started/testing-locally
 *
 * User-facing testing playbook. Built for Irfan + the first three Wave 5
 * pilot users to test the Dash Design System end-to-end on their own Mac
 * without any hand-holding. Read top-to-bottom — every section is
 * self-contained so you can stop after the Quick Start if that's all you
 * need today.
 */
export default function TestingLocallyPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started"
        title="Testing Dash DS locally"
        description="Comprehensive self-serve playbook for testing the Dash Design System on your Mac. From cloning the repo to shipping a real feature with AI assistance — every command verified against the current CLI."
        status="beta"
      />

      {/* Hero metric callout */}
      <section
        aria-label="Hero metric"
        className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8"
      >
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.18em] font-medium text-text-soft-400">
            Time to first component
          </div>
          <div className="text-3xl md:text-4xl font-semibold tracking-tight text-text-strong-950">
            ~10 minutes
          </div>
          <p className="text-sm text-text-sub-600 max-w-md leading-relaxed">
            From a fresh <code className="text-xs">git clone</code> to a
            Dash-themed button rendering in your test repo. Reserve ~30 minutes
            for the full walkthrough including AI tooling.
          </p>
        </div>
        <div className="hidden md:block w-px h-16 bg-stroke-soft-200" />
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">5 min</strong> · Quick Start
          </li>
          <li>
            <strong className="text-text-strong-950">15 min</strong> · 10-step walkthrough
          </li>
          <li>
            <strong className="text-text-strong-950">5 min</strong> · Smoke checks
          </li>
          <li>
            <strong className="text-text-strong-950">10 min</strong> · AI tool wiring
          </li>
        </ul>
      </section>

      <DocsWorkflowDiagram
        steps={[
          { label: "Prereqs", sub: "node + pnpm + git" },
          { label: "Quick start", sub: "clone + install" },
          { label: "Install CLI", sub: "pnpm i -g dash" },
          { label: "Init repo", sub: "dash init" },
          { label: "Add component", sub: "dash add button" },
          { label: "Smoke check", sub: "audit + doctor" },
          { label: "Try POD demo", sub: "image-editor-with-audit" },
          { label: "Wire AI", sub: "dash mcp init" },
          { label: "Report bugs", sub: "dash feedback log" },
        ]}
      />

      {/* ─────────────────────────── 1. Before you start */}
      <DocsSection
        title="1. Before you start"
        description="Hardware, software, and access you need before the clone command. Five-minute checklist — confirm each box before moving on."
      >
        <DocsPrinciples
          items={[
            {
              title: "Hardware",
              body: "macOS Intel or Apple Silicon — both work. Any laptop from the last 5 years is enough; Dash DS is just Node + a docs site. Linux + Windows WSL also work but the pilot focuses on macOS first.",
            },
            {
              title: "Software (verify with versions)",
              body: "Node 20+ (node --version), pnpm 9+ (pnpm --version), Git 2.40+ (git --version). Plus Claude Code OR Cursor — one is enough, you do not need both.",
            },
            {
              title: "Access (ask Irfan if missing)",
              body: "GitHub read access to irfanputra-design/dash and DASH_REGISTRY_TOKEN from the Dash 1Password vault ('Dash DS — Registry Token' item). Both stored in 1Password — no token, no install.",
            },
          ]}
        />
        <div className="mt-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5">
          <div className="text-xs uppercase tracking-[0.16em] font-medium text-text-soft-400 mb-2">
            Pre-flight check
          </div>
          <pre className="text-xs leading-relaxed text-text-strong-950 font-mono whitespace-pre-wrap">
            {`# Paste this block into your terminal — all four should print versions.
node --version    # → v20.x or higher
pnpm --version    # → 9.x or higher
git --version     # → 2.40+
claude --version  # → optional; or check Cursor app is installed`}
          </pre>
        </div>
      </DocsSection>

      {/* ─────────────────────────── 2. Quick Start */}
      <DocsSection
        title="2. Quick start — 5-minute happy path"
        description="If you just want to see the docs site running locally, this is the entire flow. No CLI install, no token. Stop here if browsing the docs is all you need."
      >
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-5 space-y-4">
          <pre className="text-xs leading-relaxed text-text-strong-950 font-mono whitespace-pre-wrap">
            {`# 1. Clone the repo (HTTPS or SSH — your choice)
git clone https://github.com/irfanputra-design/dash.git
cd dash

# 2. Install workspace deps (pnpm uses lockfile, ~2 min on first run)
pnpm install

# 3. Run the docs site locally
pnpm dev

# → Opens http://localhost:3000
# → Browse /docs to read everything you're about to do below.`}
          </pre>
          <p className="text-sm text-text-sub-600 leading-relaxed">
            Done. The docs site at <code className="text-xs">http://localhost:3000</code>{" "}
            is the same one you read on{" "}
            <code className="text-xs">ds.dash.com</code> — except now you can
            see your local changes live. Hit <kbd className="text-xs">Ctrl+C</kbd>{" "}
            to stop.
          </p>
        </div>
      </DocsSection>

      {/* ─────────────────────────── 3. Detailed walkthrough */}
      <DocsSection
        title="3. Detailed walkthrough — 10 steps"
        description="The full flow: install the CLI, initialize a separate test repo, install components, and verify everything works. Aim for ~15 minutes."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Install the Dash CLI globally"
            description="One-time machine setup. Installs the dash binary so any consumer repo can call dash init / dash add. We will publish to npm at GA; until then, install from the local workspace."
            code={`# Recommended path (once published to npm)
pnpm install -g dash

# If pnpm misbehaves, npm is a working fallback
npm install -g dash

# Bleeding-edge / pre-publish — link the workspace package
cd ~/dash-ds/packages/cli
pnpm link --global`}
            output={`+ dash 1.x.x
added 1 package in 4s
ℹ Run \`dash init\` inside any project to wire it up.`}
            imagePlaceholder="Terminal showing pnpm install -g dash succeeding with version output."
          />

          <DocsStep
            number={2}
            title="Verify the CLI"
            description="A sanity check before you trust anything else. If this fails, every later step will fail — sort it now."
            code={`dash --version
dash --help`}
            output={`dash@1.x.x

Usage: dash [options] [command]

Commands:
  init       Initialize Dash in your project
  add        Install one or more registry items
  list       List all available registry items
  search     Search registry items
  audit      Scan consumer repo for drift
  doctor     End-to-end health check
  mcp        MCP server integration
  feedback   Capture Wave 5 pilot signal
  skill      Manage @dash/skill v4 snapshot cache
  ...`}
            imagePlaceholder="Terminal output of dash --version and dash --help showing the command list."
          />

          <DocsStep
            number={3}
            title="Make a throwaway test repo"
            description="Isolate the test so you don't dirty a real project. We use a Next.js 15 starter because Dash defaults to App Router — any framework that dash init supports will also work."
            code={`# Pick any tmp location
cd ~/tmp
mkdir test-dash-ds && cd test-dash-ds

# Spin up a Next.js 15 + TS + Tailwind v4 starter
pnpm create next-app@latest . \\
  --typescript --tailwind --app --src-dir=false --eslint --import-alias "@/*"`}
            output={`✔ Initialized Next.js 15 (App Router) + TypeScript + Tailwind v4
✔ Created .git
✔ Installed 312 packages in 18s
ℹ cd test-dash-ds && pnpm dev`}
            imagePlaceholder="Terminal showing pnpm create next-app finishing with the standard Next.js 15 success banner."
          />

          <DocsStep
            number={4}
            title="Initialize Dash inside the test repo"
            description="Wires the project up to the Dash registry. Writes components.json, .env.local with your token, AGENTS.md, .cursorrules, and merges the @dash Tailwind preset. Idempotent — safe to re-run if you change something."
            code={`# Token comes from the Dash 1Password vault — never paste it into Slack
dash init --token sk-dash-xxxxxxxxxxxx

# Or with prompts (CLI asks for framework, token, etc.)
dash init`}
            output={`✔ Detected Next.js 15 (App Router) + Tailwind v4
✔ Wrote components.json
✔ Wrote .env.local (DASH_REGISTRY_TOKEN)
✔ Wrote AGENTS.md (universal AI rules)
✔ Wrote .cursorrules (re-exports AGENTS.md)
✔ Imported @dash/tokens into app/globals.css
✔ Extended tailwind.config.ts with @dash preset
ℹ Next: dash add button`}
            imagePlaceholder="Terminal after dash init showing six green checkmarks confirming the scaffold."
          />

          <DocsStep
            number={5}
            title="Confirm files written"
            description="A 30-second visual check. Open the repo in your editor and tick each file off. If anything is missing, run dash init again with --yes to overwrite."
            codeLanguage="text"
            code={`test-dash-ds/
├── components.json        ← Dash project manifest
├── .env.local             ← DASH_REGISTRY_TOKEN (do not commit)
├── AGENTS.md              ← Rules for any AI tool (Claude, Cursor, Codex)
├── .cursorrules           ← Cursor-specific (just re-exports AGENTS.md)
├── tailwind.config.ts     ← Now extends @dash/tailwind-preset
├── app/globals.css        ← Imports @dash/tokens
└── (everything else untouched)`}
            imagePlaceholder="VS Code file tree showing the five new/modified files highlighted in green."
          />

          <DocsStep
            number={6}
            title="Install your first component"
            description="dash add pulls the button source into your repo at registry/dash/ui/button.tsx — you own the file, no version pinning. Re-run anytime to refresh."
            code={`dash add button`}
            output={`✔ Resolved button (4 deps)
✔ Wrote registry/dash/ui/button.tsx
✔ Wrote registry/dash/ui/button.stories.tsx
✔ Wrote registry/dash/lib/utils.ts
ℹ Import: import { Button } from "@/registry/dash/ui/button"`}
            imagePlaceholder="Terminal output of dash add button — files written list and the suggested import path."
          />

          <DocsStep
            number={7}
            title="Use it in your code"
            description="Standard React import. Variants and sizes come from Dash tokens — no className overrides needed for the common cases. Voice is formal 'Anda' for mitra-facing copy."
            codeLanguage="tsx"
            code={`// app/page.tsx
import { Button } from "@/registry/dash/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-screen p-10 space-y-3 bg-bg-white-0">
      <h1 className="text-2xl font-semibold text-text-strong-950">
        Halo Dash DS
      </h1>
      <div className="flex gap-3">
        <Button variant="primary">Suspend mitra</Button>
        <Button variant="ghost">Batalkan</Button>
      </div>
    </main>
  )
}

// Then:
//   pnpm dev → http://localhost:3000`}
            imagePlaceholder="Browser at localhost:3000 — primary purple Suspend button and a ghost Batalkan button rendered with Dash brand styling."
          />

          <DocsStep
            number={8}
            title="Run dash audit"
            description="On a fresh repo this must pass clean — zero HIGH-severity drift. If it doesn't, file a bug (Section 9) before doing anything else."
            code={`dash audit`}
            output={`Scanning test-dash-ds/ …
✔ Imports         0 issues
✔ Style tokens    0 issues
✔ Layer rules     0 issues
✔ Banned libs     0 issues
ℹ 0 HIGH · 0 MED · 0 LOW
✓ Ready to ship`}
            imagePlaceholder="Terminal showing dash audit with four green ticks across import / style / layer / banned-lib categories."
            imageHeight="sm"
          />

          <DocsStep
            number={9}
            title="Run dash doctor"
            description="End-to-end health check across registry, token, MCP, framework, env. Reports each subsystem as green / yellow / red. Run this any time something feels off."
            code={`dash doctor`}
            output={`Dash Doctor
─────────────────────────────────────────
✔ CLI version          1.x.x (latest)
✔ Registry             reachable (https://ds.dash.com/r/)
✔ Token                valid (DASH_REGISTRY_TOKEN set)
✔ Framework            next-app (15.x) + Tailwind v4
✔ AGENTS.md            present
✔ MCP config           ~/.claude/mcp.json — dash-ds wired
✔ Skill cache          fresh (last refresh 2 min ago)
─────────────────────────────────────────
0 errors · 0 warnings`}
            imagePlaceholder="Terminal output of dash doctor with seven green checkmarks across the subsystem matrix."
            imageHeight="md"
          />

          <DocsStep
            number={10}
            title="Check skill v4 cache"
            description="Skill v4 caches a snapshot of dash info --json per cwd so Claude doesn't re-scan on every prompt. 'no cache' on first run is normal — Claude will populate it on first Dash-related prompt."
            code={`dash skill status

# Force refresh if you just installed new components
dash skill refresh

# Wipe everything if cache acts up
dash skill clear --all`}
            output={`Skill snapshot for /Users/you/tmp/test-dash-ds
─────────────────────────────────────────
status        fresh
last refresh  2 minutes ago
items cached  214 registry entries + 3 installed (@dash/ui/button, …)
prompt hint   "Use Dash DS" picked up via AGENTS.md`}
            imagePlaceholder="Terminal output of dash skill status showing fresh cache with item counts."
            imageHeight="sm"
          />
        </DocsStepList>
      </DocsSection>

      {/* ─────────────────────────── 4. Smoke checks */}
      <DocsSection
        title="4. Verify it works — smoke checks"
        description="Five-minute battery of checks to confirm the install is healthy before you write real code. If any check fails, go to Troubleshooting (Section 8)."
      >
        <ul className="text-sm text-text-sub-600 list-none pl-0 space-y-3">
          <li className="flex gap-3 items-start">
            <span className="text-(--dash-purple-600) font-bold">✓</span>
            <div>
              <code className="text-xs">dash list</code> prints the registry
              catalog (~214 items: ui, blocks, templates, patterns). If empty,
              token is bad.
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-(--dash-purple-600) font-bold">✓</span>
            <div>
              <code className="text-xs">dash search button</code> returns
              metadata for the Button atom (name, type, deps, description).
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-(--dash-purple-600) font-bold">✓</span>
            <div>
              File <code className="text-xs">registry/dash/ui/button.tsx</code>{" "}
              exists after step 6 and is valid TypeScript.
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-(--dash-purple-600) font-bold">✓</span>
            <div>
              <code className="text-xs">pnpm typecheck</code> (or{" "}
              <code className="text-xs">tsc --noEmit</code>) passes with the
              new Button import wired in.
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-(--dash-purple-600) font-bold">✓</span>
            <div>
              <code className="text-xs">dash audit</code> reports{" "}
              <strong>0 HIGH</strong> on the freshly initialized repo.
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-(--dash-purple-600) font-bold">✓</span>
            <div>
              <code className="text-xs">pnpm dev</code> renders the Button with
              the canonical Dash purple (<code className="text-xs">#5e2aac</code>)
              — not a generic blue or gray.
            </div>
          </li>
        </ul>
      </DocsSection>

      {/* ─────────────────────────── 5. Real-feature dry run */}
      <DocsSection
        title="5. Try a real feature — POD image editor"
        description="The 'edit pickup proof image' use case from the Wave 5 spec. This is the highest-leverage demo: it exercises audit-trail rules, the useState ban, the Indonesian formal voice, and the canvas-API constraint all at once."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Ask Claude (or Cursor) for the feature"
            description="Type the prompt below verbatim. The point is to see how the AI tool consults Dash DS context — not to invent a new feature."
            codeLanguage="markdown"
            code={`> In the backoffice repo, add a modal that lets ops edit a pickup-proof
> (POD) image. Crop and rotate are required. Log every edit with an audit
> trail (original blob + edited blob + editor name + reason). Voice is
> formal Anda. No external libraries — use the Canvas API and useState.`}
            imagePlaceholder="Claude Code chat window with the POD edit prompt entered, awaiting response."
            imageHeight="sm"
          />

          <DocsStep
            number={2}
            title="Expected AI behaviour"
            description="If the skill + MCP are wired correctly, Claude should not propose a hand-rolled component. It should consult the Dash registry first and propose an existing block."
            output={`Claude:
1. Loads Skill v4 snapshot for this cwd (cached).
2. Reads AGENTS.md → confirms Dash DS + audit-trail + useState rules.
3. Queries MCP: dash_registry_search "image edit audit"
4. Suggests: dash add image-editor-with-audit
5. Asks: "OK to install? Will write registry/dash/blocks/image-editor-with-audit.tsx (~220 LOC) and patch app/(internal)/pod/[id]/page.tsx."
6. Waits for your approval before running dash add.`}
            imagePlaceholder="Claude response in chat — bullet list summarizing the registry lookup and proposed install plan."
            imageHeight="md"
          />

          <DocsStep
            number={3}
            title="Run the suggested install"
            description="Approve and let Claude run dash add. Watch the file tree — the block lands under registry/dash/blocks/, not registry/dash/ui/."
            code={`dash add image-editor-with-audit`}
            output={`✔ Resolved image-editor-with-audit (8 deps)
✔ Wrote registry/dash/blocks/image-editor-with-audit.tsx
✔ Wrote registry/dash/blocks/image-editor-with-audit.stories.tsx
✔ Updated registry/dash/lib/canvas-utils.ts
ℹ Import: import { ImageEditorWithAudit } from "@/registry/dash/blocks/image-editor-with-audit"`}
            imagePlaceholder="Terminal output of dash add image-editor-with-audit, with file paths under registry/dash/blocks/ highlighted."
            imageHeight="sm"
          />

          <DocsStep
            number={4}
            title="Inspect the generated code"
            description="Open the new file. Check the four rules manually — if any fail, file a critical bug. The whole point of Dash DS is that these are guaranteed."
            imagePlaceholder="Split-pane editor showing the block source with audit-trail logging, useState hook, formal 'Anda' copy, and Canvas API usage all annotated."
            imageHeight="lg"
          >
            <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
              <li>
                <strong>useState only</strong> — no{" "}
                <code className="text-xs">useForm</code>,{" "}
                <code className="text-xs">zodResolver</code>, or RHF helpers.
              </li>
              <li>
                <strong>Audit trail logs</strong> all four fields: original
                blob, edited blob, editor name, reason string.
              </li>
              <li>
                <strong>Voice is formal Anda</strong> — labels like{" "}
                <em>&ldquo;Masukkan alasan edit&rdquo;</em>, not{" "}
                <em>&ldquo;Tulis alasan kamu&rdquo;</em>.
              </li>
              <li>
                <strong>Canvas API only</strong> — no{" "}
                <code className="text-xs">react-easy-crop</code>,{" "}
                <code className="text-xs">react-image-crop</code>, or similar
                runtime dep.
              </li>
            </ul>
          </DocsStep>
        </DocsStepList>
      </DocsSection>

      {/* ─────────────────────────── 6. Claude Code wiring */}
      <DocsSection
        title="6. Connect Claude Code (recommended)"
        description="Claude has the best MCP integration and the longest context window of the three tools — start here. Five-minute setup."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Run dash mcp init"
            description="Writes ~/.claude/mcp.json with a dash-ds server entry pointing to @dash/mcp-server. Token reads from your env automatically."
            code={`# Wire Claude Code only (default if Claude is detected)
dash mcp init --claude-code

# Or pass the token explicitly
dash mcp init --claude-code --token sk-dash-xxxx`}
            output={`✔ Detected Claude Code at /Applications/Claude.app
✔ Wrote ~/.claude/mcp.json
✔ Server: dash-ds (bearer-gated, 6 tools)
ℹ Restart Claude Code to pick up the new server.`}
            imagePlaceholder="Terminal output of dash mcp init --claude-code with the config path and tool count."
            imageHeight="sm"
          />

          <DocsStep
            number={2}
            title="Restart Claude Code"
            description="MCP servers do not hot-reload. Quit Claude Code (cmd-Q) and reopen — without this, the server stays disconnected."
            imagePlaceholder="macOS dock with Claude Code icon being right-clicked → Quit, then relaunched."
            imageHeight="sm"
          />

          <DocsStep
            number={3}
            title="Verify with /mcp"
            description="Inside Claude Code, type /mcp and hit enter. You should see dash-ds with a green dot and six tools listed (search, get, list, install, audit, info)."
            imagePlaceholder="Claude Code /mcp panel showing dash-ds in 'connected' state with green dot and the six MCP tools enumerated."
            imageHeight="md"
          />

          <DocsStep
            number={4}
            title="Test the integration"
            description="Ask Claude a Dash-specific question. If MCP is live, Claude will query the registry instead of guessing — you'll see a small badge in the chat trace."
            codeLanguage="markdown"
            code={`> What Dash components exist for image editing? Which one
> includes audit-trail logging?`}
            output={`Claude:
[Querying dash-ds MCP — tool: dash_registry_search …]

Found 2 matches in the Dash registry:
1. image-editor-with-audit (block)
   — Canvas-based crop + rotate, logs original/edited/editor/reason.
2. image-uploader (ui)
   — Drag-drop uploader, NO editing capability.

For the POD audit-trail use case, install #1: dash add image-editor-with-audit`}
            imagePlaceholder="Claude Code chat showing the MCP tool-call trace badge and Claude's response listing the two matching components."
            imageHeight="md"
          />
        </DocsStepList>
      </DocsSection>

      {/* ─────────────────────────── 7. Cursor wiring */}
      <DocsSection
        title="7. Connect Cursor (alternative)"
        description="If your daily driver is Cursor, swap the editor flag. You can also wire both at once for parity testing."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Run dash mcp init for Cursor"
            description="Same command, different flag. Writes ~/.cursor/mcp.json. Use --both to wire Claude Code and Cursor in one shot."
            code={`# Cursor only
dash mcp init --cursor

# Both editors at once
dash mcp init --both`}
            output={`✔ Detected Cursor at /Applications/Cursor.app
✔ Wrote ~/.cursor/mcp.json
✔ Server: dash-ds (bearer-gated, 6 tools)
ℹ Restart Cursor to pick up the new server.`}
            imagePlaceholder="Terminal output of dash mcp init --cursor with the Cursor config path."
            imageHeight="sm"
          />

          <DocsStep
            number={2}
            title="Restart Cursor and verify"
            description="Cmd-Q Cursor and reopen. In the chat panel, the @ menu should auto-complete @dash-ds — that confirms the MCP server is reachable."
            imagePlaceholder="Cursor chat panel with the @ menu open, showing @dash-ds as an autocomplete suggestion."
            imageHeight="md"
          />

          <DocsStep
            number={3}
            title="Confirm AGENTS.md is honoured"
            description=".cursorrules at the repo root re-exports AGENTS.md so Cursor reads the same source of truth as Claude. If Cursor proposes raw Tailwind divs, the .cursorrules file is missing or empty."
            code={`# Sanity check from the repo root
cat .cursorrules
# → Should reference AGENTS.md

cat AGENTS.md | head -20
# → Should mention Dash DS, useState rule, audit trail, voice "Anda"`}
            imagePlaceholder="Terminal output of cat .cursorrules showing the AGENTS.md include directive."
            imageHeight="sm"
          />
        </DocsStepList>
      </DocsSection>

      {/* ─────────────────────────── 8. Troubleshooting */}
      <DocsSection
        title="8. Troubleshooting"
        description="The eight failure modes we hit in dogfood week, plus the fix for each. Scan the Error column — if your error isn't here, go to Section 9."
      >
        <div className="overflow-x-auto rounded-xl border border-stroke-soft-200">
          <table className="w-full text-sm">
            <thead className="bg-bg-weak-50 text-left">
              <tr className="border-b border-stroke-soft-200">
                <th className="px-4 py-3 font-semibold text-text-strong-950 w-[28%]">
                  Error
                </th>
                <th className="px-4 py-3 font-semibold text-text-strong-950 w-[28%]">
                  Cause
                </th>
                <th className="px-4 py-3 font-semibold text-text-strong-950">
                  Fix
                </th>
              </tr>
            </thead>
            <tbody className="text-text-sub-600">
              <tr className="border-b border-stroke-soft-200">
                <td className="px-4 py-3 align-top">
                  <code className="text-xs">command not found: dash</code>
                </td>
                <td className="px-4 py-3 align-top">CLI not on PATH after global install.</td>
                <td className="px-4 py-3 align-top">
                  Add <code className="text-xs">~/.npm-global/bin</code> (or your
                  pnpm global bin) to PATH, or use{" "}
                  <code className="text-xs">npx dash &lt;cmd&gt;</code> as a
                  workaround.
                </td>
              </tr>
              <tr className="border-b border-stroke-soft-200">
                <td className="px-4 py-3 align-top">
                  <code className="text-xs">401 Unauthorized</code> on{" "}
                  <code className="text-xs">dash add</code>
                </td>
                <td className="px-4 py-3 align-top">
                  Token missing, expired, or wrong.
                </td>
                <td className="px-4 py-3 align-top">
                  Re-check the token in 1Password ('Dash DS — Registry Token'),
                  then run{" "}
                  <code className="text-xs">dash login --token sk-dash-xxxx</code>{" "}
                  to save it to <code className="text-xs">~/.dash/credentials.json</code>.
                </td>
              </tr>
              <tr className="border-b border-stroke-soft-200">
                <td className="px-4 py-3 align-top">
                  <code className="text-xs">ECONNRESET</code> /{" "}
                  <code className="text-xs">ETIMEDOUT</code>
                </td>
                <td className="px-4 py-3 align-top">
                  Registry (ds.dash.com) offline OR local docs server not running.
                </td>
                <td className="px-4 py-3 align-top">
                  Retry once (Vercel cold start). Still failing? Run{" "}
                  <code className="text-xs">pnpm dev</code> inside the dash-ds
                  repo and re-init with{" "}
                  <code className="text-xs">--registry-url http://localhost:3000/r</code>.
                </td>
              </tr>
              <tr className="border-b border-stroke-soft-200">
                <td className="px-4 py-3 align-top">
                  <code className="text-xs">tsc</code> fails after{" "}
                  <code className="text-xs">dash add</code>
                </td>
                <td className="px-4 py-3 align-top">
                  Missing peer dep that the registry item declares.
                </td>
                <td className="px-4 py-3 align-top">
                  Run <code className="text-xs">pnpm install</code> again. Peer
                  deps are added to <code className="text-xs">package.json</code>{" "}
                  by <code className="text-xs">dash add</code> but you still
                  need a fresh install.
                </td>
              </tr>
              <tr className="border-b border-stroke-soft-200">
                <td className="px-4 py-3 align-top">
                  <code className="text-xs">Cannot find module &apos;@/registry/dash/ui/button&apos;</code>
                </td>
                <td className="px-4 py-3 align-top">
                  Path alias missing from <code className="text-xs">tsconfig.json</code>.
                </td>
                <td className="px-4 py-3 align-top">
                  Verify <code className="text-xs">paths</code> includes{" "}
                  <code className="text-xs">&quot;@/*&quot;: [&quot;./*&quot;]</code>{" "}
                  (or your equivalent). <code className="text-xs">dash init</code>{" "}
                  writes this — re-run it.
                </td>
              </tr>
              <tr className="border-b border-stroke-soft-200">
                <td className="px-4 py-3 align-top">
                  <code className="text-xs">bg-bg-weak-50</code> renders transparent
                </td>
                <td className="px-4 py-3 align-top">
                  <code className="text-xs">tailwind.config.ts</code> doesn&apos;t
                  extend the @dash preset.
                </td>
                <td className="px-4 py-3 align-top">
                  Add{" "}
                  <code className="text-xs">presets: [require(&quot;@dash/tailwind-preset&quot;)]</code>{" "}
                  to your tailwind config. <code className="text-xs">dash init</code>{" "}
                  handles this — re-run it if the file was overwritten by{" "}
                  <code className="text-xs">create-next-app</code>.
                </td>
              </tr>
              <tr className="border-b border-stroke-soft-200">
                <td className="px-4 py-3 align-top">
                  <code className="text-xs">dash skill status</code> shows{" "}
                  <em>&ldquo;no cache&rdquo;</em>
                </td>
                <td className="px-4 py-3 align-top">
                  First run, no AI prompt has populated the snapshot yet.
                </td>
                <td className="px-4 py-3 align-top">
                  Normal — ask Claude any Dash-related question and the cache
                  builds. Force-populate with{" "}
                  <code className="text-xs">dash skill refresh</code>.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">
                  Claude proposes raw <code className="text-xs">&lt;div&gt;</code>{" "}
                  instead of Dash blocks
                </td>
                <td className="px-4 py-3 align-top">
                  MCP not connected, or AGENTS.md not picked up after restart.
                </td>
                <td className="px-4 py-3 align-top">
                  Run <code className="text-xs">/mcp</code> inside Claude — is
                  dash-ds green? If not, repeat Section 6. If yes, add{" "}
                  <em>&ldquo;Use Dash DS&rdquo;</em> as the first line of your
                  prompt.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      {/* ─────────────────────────── 9. Reporting bugs */}
      <DocsSection
        title="9. When things break — how to report"
        description="Two-channel reporting. Use dash feedback log for quick signal (no GitHub login, syncs to the pilot dashboard). Use GitHub issues for reproducible bugs that need maintainer attention."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Log via the CLI (fastest)"
            description="The CLI captures user, repo, and command context automatically. Use --severity to flag urgency. Entries land in ~/.dash/feedback-log.jsonl and sync to the admin dashboard when you run dash feedback sync."
            code={`# Quick signal — one-liner
dash feedback log "dash add image-editor-with-audit failed: peer dep tsx missing" \\
  --category bug \\
  --severity high \\
  --command "dash add" \\
  --component image-editor-with-audit

# Sync to the pilot dashboard
dash feedback sync`}
            output={`✔ Logged entry (id: fb_8f2c3a4d)
ℹ category: bug · severity: high · pilot: wave-5
ℹ Run \`dash feedback sync\` to push to admin dashboard.`}
            imagePlaceholder="Terminal output of dash feedback log + sync confirming the entry id and pilot tag."
            imageHeight="sm"
          />

          <DocsStep
            number={2}
            title="File a GitHub issue (for repros)"
            description="If the bug is reproducible and a maintainer needs to read your full repo state, open an issue. Always include the four fields below — without them, the issue cannot be triaged."
            codeLanguage="markdown"
            code={`URL: https://github.com/irfanputra-design/dash/issues/new

Required fields in the issue body:
1. dash --version    (paste the version line)
2. Steps to reproduce (copy-paste commands you ran)
3. Expected vs actual (one sentence each)
4. Screenshot       (drag-drop into the issue body)

Tag the area with one of:
  @cli @mcp @blocks @docs @skill @audit`}
            imagePlaceholder="GitHub new-issue form with the four required fields filled in and an area tag selected."
            imageHeight="md"
          />

          <DocsStep
            number={3}
            title="Triage SLA"
            description="Severity HIGH gets a same-day reply. MED/LOW are batched weekly. If it's blocking your pilot work, also drop a line in #dash-ds-pilot Slack — the bot pings the maintainer."
            imagePlaceholder="Slack #dash-ds-pilot channel with a bot message: '@irfan — new HIGH severity feedback from @user-y, see fb_8f2c3a4d.'"
            imageHeight="sm"
          />
        </DocsStepList>
      </DocsSection>

      {/* ─────────────────────────── 10. What's next */}
      <DocsSection
        title="10. What's next after testing"
        description="If everything above worked, you're ready to use Dash DS in real work. Here's where pilot users go from here."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-2">
          <li>
            Join the <strong className="text-text-strong-950">#dash-ds-pilot</strong>{" "}
            Slack channel (ask Irfan for the invite if you can&apos;t see it).
          </li>
          <li>
            Daily 15-minute pilot stand-up — sync feedback, blockers, surprise
            wins. Calendar invite from Irfan.
          </li>
          <li>
            Goal:{" "}
            <strong className="text-text-strong-950">
              ship one Dash-DS-built feature per day
            </strong>{" "}
            in your real repo for 2 weeks. Volume, not perfection.
          </li>
          <li>
            File feedback liberally —{" "}
            <code className="text-xs">dash feedback log</code> for CLI signal,
            Slack for nuance, GitHub for repros.
          </li>
        </ul>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/docs/onboarding"
            className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 hover:bg-bg-weak-50 transition-colors"
          >
            <div className="text-xs uppercase tracking-[0.16em] font-medium text-text-soft-400 mb-1">
              Wave 5 pilot
            </div>
            <div className="text-sm font-semibold text-text-strong-950">
              User onboarding playbook →
            </div>
            <p className="text-xs text-text-sub-600 mt-1 leading-relaxed">
              The full onboarding spec — what the pilot expects from you and
              what we promise back.
            </p>
          </Link>
          <Link
            href="/docs/architecture/layered"
            className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 hover:bg-bg-weak-50 transition-colors"
          >
            <div className="text-xs uppercase tracking-[0.16em] font-medium text-text-soft-400 mb-1">
              Architecture
            </div>
            <div className="text-sm font-semibold text-text-strong-950">
              Layered architecture →
            </div>
            <p className="text-xs text-text-sub-600 mt-1 leading-relaxed">
              How Layer 0 (foundation) / Layer 1 (atoms) / Layer 2 (theme) /
              Layer 3 (blocks) plug together across products.
            </p>
          </Link>
          <Link
            href="/docs/architecture/theme-studio"
            className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 hover:bg-bg-weak-50 transition-colors"
          >
            <div className="text-xs uppercase tracking-[0.16em] font-medium text-text-soft-400 mb-1">
              Architecture
            </div>
            <div className="text-sm font-semibold text-text-strong-950">
              Theme Studio →
            </div>
            <p className="text-xs text-text-sub-600 mt-1 leading-relaxed">
              Edit Layer-2 themes in the browser. Useful for spinning up a new
              tenant or product variant.
            </p>
          </Link>
          <Link
            href="/docs/quick-start"
            className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 hover:bg-bg-weak-50 transition-colors"
          >
            <div className="text-xs uppercase tracking-[0.16em] font-medium text-text-soft-400 mb-1">
              Getting started
            </div>
            <div className="text-sm font-semibold text-text-strong-950">
              User Quick Start →
            </div>
            <p className="text-xs text-text-sub-600 mt-1 leading-relaxed">
              Eight-step happy path for shipping a Dash-themed page in a real
              consumer repo (Halo, portal-v2, backoffice, …).
            </p>
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-5">
          <div className="text-xs uppercase tracking-[0.16em] font-medium text-text-soft-400 mb-2">
            Pilot transparency
          </div>
          <p className="text-sm text-text-sub-600 leading-relaxed">
            We publish the kill criteria for the Wave 5 pilot so you know
            exactly when the project would be paused or scrapped. Read{" "}
            <a
              href="https://github.com/irfanputra-design/dash/blob/main/KILL-CRITERIA.md"
              className="text-(--dash-purple-600) underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              KILL-CRITERIA.md
            </a>{" "}
            in the repo root. Honest feedback against those thresholds is the
            single most valuable thing you can give back.
          </p>
        </div>
      </DocsSection>
    </DocsPageShell>
  )
}
