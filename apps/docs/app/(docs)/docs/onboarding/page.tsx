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

export default function OnboardingPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started · Wave 5 Pilot"
        title="PE Onboarding Playbook"
        description="Step-by-step onboarding for the first 3 Product Engineers piloting Dash DS. Target: laptop → first DS component in your repo → first vibe-coded screen, all under 45 minutes. Pair this page with the 1Password Bearer token DM you received from Irfan."
        status="beta"
        kind="composite"
      />

      <DocsWorkflowDiagram
        steps={[
          { label: "Pre-flight", sub: "5 min — read & confirm scope" },
          { label: "Install CLI", sub: "10 min — pnpm + login" },
          { label: "Wire AI editor", sub: "10 min — Claude / Cursor MCP" },
          { label: "First component", sub: "15 min — dash add button" },
          { label: "Vibe-code mode", sub: "15 min — describe a screen" },
          { label: "Report gaps", sub: "ongoing — dash gap report" },
        ]}
      />

      <DocsSection
        title="A. Pre-flight (5 min)"
        description="Read once before opening a terminal. Sets expectations and confirms you are the right pilot audience."
      >
        <DocsPrinciples
          items={[
            {
              title: "What is Dash DS",
              body: "Internal sovereign design system for 10+ PE at Dash. You pull components by name via the dash CLI; the AI editor knows the registry through MCP + a Skill that teaches Dash conventions.",
            },
            {
              title: "Who this is for",
              body: "Wave 5 = the first 3 PE on Ride tribe. Logistic, Travel, Marketplace pilots roll later. You should be comfortable shipping Next.js + Tailwind features and using Claude Code or Cursor daily.",
            },
            {
              title: "Time commitment",
              body: "30–45 minutes for onboarding. ~1 hour for your first real ticket. ~15 min/week giving feedback in #dash-ds-pilot. Pilot runs 1 week.",
            },
            {
              title: "What you can do after",
              body: "Install components via dash add, prompt your editor to build Dash-themed screens that respect tokens + voice + audit-trail rules, and report gaps when DS doesn't cover what you need.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="B. Install (10 min)"
        description="Prerequisites: Node 20+, pnpm, and either Claude Code or Cursor. Steps are idempotent — safe to re-run."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Install the dash CLI globally"
            description="One-time machine setup. The dash binary lives on your $PATH after this."
            code={`pnpm install -g dash

# Verify
dash --version`}
            output={`dash@1.0.0
Registry: https://ds.dash.com/r/`}
            imagePlaceholder="Screenshot pending — see Quick Start once captured. Terminal showing pnpm install + dash --version output."
            imageHeight="sm"
          />

          <DocsStep
            number={2}
            title="Get your Bearer token from 1Password"
            description="Look for the vault entry 'Dash DS Registry Token' — Irfan shared it with you via 1Password before this onboarding. The token is personal — do NOT share or paste in Slack."
            imagePlaceholder="Screenshot pending — 1Password item titled 'Dash DS Registry Token' with the masked Bearer value and Copy button."
            imageHeight="sm"
          >
            <p className="text-sm text-text-sub-600">
              If you don&apos;t see the vault entry, ping{" "}
              <strong>@Irfan</strong> in <code className="text-xs">#dash-ds-pilot</code>.
              Tokens are rotatable — say so if you suspect a leak.
            </p>
          </DocsStep>

          <DocsStep
            number={3}
            title="Log in"
            description="Writes the token to ~/.config/dash/auth.json. dash add will read it for every install."
            code={`dash login --token <paste-from-1password>`}
            output={`✔ Token validated
✔ Saved to ~/.config/dash/auth.json
ℹ You can now run dash add inside any Dash repo.`}
            imagePlaceholder="Screenshot pending — dash login success output with green checkmarks."
            imageHeight="sm"
          />

          <DocsStep
            number={4}
            title="Run dash doctor"
            description="Sanity check — confirms Node version, pnpm, token validity, network reachability to the registry, and MCP capability."
            code={`dash doctor`}
            output={`✔ Node 20.11.0
✔ pnpm 9.x
✔ Bearer token valid (registry reachable)
✔ MCP server installable via npx
ℹ All green — you're ready to add components.`}
            imagePlaceholder="Screenshot pending — dash doctor full output, all green."
            imageHeight="sm"
          />

          <DocsStep
            number={5}
            title="Common install issues"
            description="If any of step 1–4 failed, scan the list below before pinging the channel."
            imagePlaceholder="Screenshot pending — example error output for each common issue (EACCES, 401, MCP probe fail)."
            imageHeight="sm"
          >
            <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
              <li>
                <strong>pnpm EACCES / permission denied</strong> — your global
                bin folder isn&apos;t writable. Fix with{" "}
                <code className="text-xs">pnpm setup</code> or prefix the install
                with the correct user (avoid <code className="text-xs">sudo</code>).
              </li>
              <li>
                <strong>401 Unauthorized on dash login</strong> — token typo on
                paste (leading/trailing space is the usual culprit). Re-copy
                from 1Password.
              </li>
              <li>
                <strong>dash doctor: MCP probe failed</strong> — usually means
                npx can&apos;t reach the registry. Check VPN / corporate proxy.
                Retry; if it persists, ping the channel with the full output.
              </li>
              <li>
                <strong>dash: command not found</strong> — pnpm global bin not
                on PATH. Run <code className="text-xs">pnpm bin -g</code> and
                add that path to your shell rc.
              </li>
            </ul>
          </DocsStep>
        </DocsStepList>
      </DocsSection>

      <DocsSection
        title="C. Connect your AI editor (10 min)"
        description="Pick Claude Code (recommended) or Cursor. Both read the same MCP block — paste it once, restart the editor, verify."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Option A — Claude Code"
            description="Edit ~/.claude/settings.json. If the file doesn't exist, create it. Merge the dash-ds block under mcpServers."
            codeLanguage="json"
            code={`{
  "mcpServers": {
    "dash-ds": {
      "command": "npx",
      "args": ["-y", "@dash/mcp-server"],
      "env": {
        "DASH_REGISTRY_TOKEN": "<your-bearer-from-1password>"
      }
    }
  }
}`}
            imagePlaceholder="Screenshot pending — Claude Code /mcp panel showing dash-ds connected with green dot and 6 tools listed."
            imageHeight="sm"
          />

          <DocsStep
            number={2}
            title="Option B — Cursor"
            description="Same JSON block, different file: ~/.cursor/mcp.json. Cursor reads it on startup; no Settings UI step needed for our case."
            codeLanguage="json"
            code={`{
  "mcpServers": {
    "dash-ds": {
      "command": "npx",
      "args": ["-y", "@dash/mcp-server"],
      "env": {
        "DASH_REGISTRY_TOKEN": "<your-bearer-from-1password>"
      }
    }
  }
}`}
            imagePlaceholder="Screenshot pending — Cursor MCP indicator (status bar) showing dash-ds connected."
            imageHeight="sm"
          />

          <DocsStep
            number={3}
            title="Restart your editor"
            description="MCP servers don't hot-reload config. Fully quit (Cmd+Q on macOS) and reopen."
            imagePlaceholder="Screenshot pending — editor splash on cold start."
            imageHeight="sm"
          />

          <DocsStep
            number={4}
            title="Verify"
            description="Open a new chat in your AI editor and ask the question below. You should see a short list of Dash DS atoms / blocks — not a generic shadcn answer."
            codeLanguage="markdown"
            code={`What Dash DS components are available for building a mitra
detail page?`}
            output={`Expected: short list referencing the @dash registry —
e.g. Button, Input, DataTable, FilterBar, EmptyState, plus
a suggestion to scaffold via dash add.

If you get a generic answer or "I don't have access to your
DS" — MCP didn't connect. Recheck step 1 or 2.`}
            imagePlaceholder="Screenshot pending — AI editor response listing Dash atoms with @dash registry references."
            imageHeight="sm"
          />
        </DocsStepList>
      </DocsSection>

      <DocsSection
        title="D. Your first component (15 min)"
        description="Pull Button into a real Dash repo. You'll own the source — no version pinning."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Open a Dash repo"
            description="Open the repo assigned to you in the pilot brief — typically next-portal-v2-web or halo-dash-fe."
            code={`cd ~/Dash/next-portal-v2-web
# or whichever repo you were assigned`}
            imagePlaceholder="Screenshot pending — terminal pwd inside a Dash repo."
            imageHeight="sm"
          />

          <DocsStep
            number={2}
            title="Browse the component catalog"
            description="Open https://ds.dash.com/docs/components in your browser. Skim the atoms first — Button, Input, Modal, Table — so you know what's there."
            imagePlaceholder="Screenshot pending — components index page on ds.dash.com."
            imageHeight="sm"
          />

          <DocsStep
            number={3}
            title="Add Button to your repo"
            description="The CLI writes button.tsx to src/components/ui/ (or the equivalent path detected from your components.json)."
            code={`dash add button`}
            output={`✔ Resolved button (4 deps)
✔ Wrote src/components/ui/button.tsx
✔ Wrote src/lib/utils.ts (already up to date)
ℹ Import: import { Button } from "@/components/ui/button"`}
            imagePlaceholder="Screenshot pending — dash add button success output."
            imageHeight="sm"
          />

          <DocsStep
            number={4}
            title="Use it on a page"
            description="Standard React import. tone='primary' picks up the Dash purple token automatically."
            codeLanguage="tsx"
            code={`import { Button } from "@/components/ui/button"

export default function MitraDetailPage() {
  return (
    <div className="p-6 space-y-3">
      <Button tone="primary">Simpan perubahan</Button>
      <Button tone="ghost">Batal</Button>
    </div>
  )
}`}
            imagePlaceholder="Screenshot pending — browser preview showing the Dash primary purple button + ghost button."
            imageHeight="md"
          />

          <DocsStep
            number={5}
            title="Commit + push"
            description="Branch + commit + open a PR. The auto-attached dash audit will check tokens + anatomy + voice."
            code={`git checkout -b pilot/wave5-first-button
git add -A
git commit -m "chore: pilot wave5 — add Dash Button"
git push -u origin HEAD`}
            imagePlaceholder="Screenshot pending — terminal after push showing PR-create hint."
            imageHeight="sm"
          />
        </DocsStepList>
      </DocsSection>

      <DocsSection
        title="E. Vibe-code mode (15 min)"
        description="Now describe a screen in plain language. Skill v2 will steer the AI to use Dash patterns — useState (no RHF/zod), formal 'Anda', tokens not hex."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Prompt the AI editor"
            description="Open chat, ask for a real screen. Pick something mitra-facing if you can — that exercises voice + audit-trail rules."
            codeLanguage="markdown"
            code={`Tambah modal konfirmasi suspend mitra di halaman
/mitra/[id]. Required: dropdown alasan (Reservasi, KYC,
Pelanggaran), text area catatan opsional, dan audit trail
(siapa, kapan, alasan). Pakai Dash DS.`}
            imagePlaceholder="Screenshot pending — chat prompt sent in Claude Code or Cursor."
            imageHeight="sm"
          />

          <DocsStep
            number={2}
            title="Review the generated diff"
            description="The AI should: import from @dash, use useState for form state (not react-hook-form), use 'Anda' (not 'kamu'), use semantic tokens (bg-bg-weak-50, text-text-strong-950 — not raw hex). Confirm before saving."
            imagePlaceholder="Screenshot pending — diff view in editor showing Dash imports + useState + audit log object."
            imageHeight="md"
          />

          <DocsStep
            number={3}
            title="Spot drift early"
            description="If the AI suggests any of the patterns below, that's drift. Flag it in #dash-ds-pilot with the prompt + the diff so we can tighten Skill v2."
            imagePlaceholder="Screenshot pending — example drift output (react-hook-form import being suggested)."
            imageHeight="sm"
          >
            <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
              <li>
                <code className="text-xs">react-hook-form</code>,{" "}
                <code className="text-xs">zod</code>,{" "}
                <code className="text-xs">@hookform/resolvers</code> — banned
              </li>
              <li>
                <code className="text-xs">@tanstack/react-query</code>,{" "}
                <code className="text-xs">swr</code> — banned
              </li>
              <li>Raw hex (e.g. #5e2aac) instead of token names</li>
              <li>
                Casual <em>&ldquo;kamu&rdquo;</em> in mitra-facing copy
              </li>
              <li>
                Missing audit-trail fields on suspend / payment / KYC actions
              </li>
            </ul>
          </DocsStep>
        </DocsStepList>
      </DocsSection>

      <DocsSection
        title="F. Reporting gaps"
        description="The whole point of Wave 5 is to find what the DS doesn't cover. Don't work around — report."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Log a gap locally"
            description="Run dash gap report with a one-line description. Quick form — name, repo, what you were trying to build, what was missing."
            code={`dash gap report "no Dash component for inline OTP \
input with 6 boxes — needed in mitra phone re-verify flow"`}
            output={`✔ Logged to ~/.config/dash/gaps.local.json
ℹ Run \`dash gap sync\` to push to the CEO dashboard.`}
            imagePlaceholder="Screenshot pending — dash gap report output."
            imageHeight="sm"
          />

          <DocsStep
            number={2}
            title="Sync to the dashboard"
            description="When you're online and ready, push your queue. Each gap becomes a card on the CEO triage view."
            code={`dash gap sync`}
            output={`✔ Synced 1 gap to ds.dash.com/admin/gaps
ℹ You'll get a Slack ping when triage happens.`}
            imagePlaceholder="Screenshot pending — admin gap board with new card in Triage column."
            imageHeight="sm"
          />

          <DocsStep
            number={3}
            title="What happens next"
            description="No fixed SLA during pilot. Some gaps are reviewed by Irfan and slotted as a vendor request; others may get auto-drafted by a Hermes worker — when that happens you'll get a Slack ping. If urgent, build a one-off in your repo and tag it for later DS-port."
            imagePlaceholder="Screenshot pending — Slack notification of gap status change."
            imageHeight="sm"
          />
        </DocsStepList>
      </DocsSection>

      <DocsSection
        title="G. Feedback channels"
        description="Three places, by intent."
      >
        <DocsPrinciples
          items={[
            {
              title: "#dash-ds-pilot (Slack)",
              body: "Default channel. Fast / informal — drift sightings, broken docs, weird AI behavior, screenshots. Don't worry about polish.",
            },
            {
              title: "GitHub issues",
              body: "github.com/irfanputra-design/dash/issues — for reproducible bugs in the CLI / MCP / registry. Repro steps + expected vs actual.",
            },
            {
              title: "Direct ping @Irfan",
              body: "Use sparingly — for blockers in your daily work or anything sensitive (token rotation, vault access). Irfan is the sole DS owner today (bus factor = 1, see KILL-CRITERIA).",
            },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="H. What you're helping with"
        description="Honest critique > polite agreement."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>
            <strong>Adoption signal</strong> — does the workflow stick after
            day 2, or do you fall back to copy-paste?
          </li>
          <li>
            <strong>Gap surfacing</strong> — every missing component or
            unclear doc you log shapes Wave 6 + GA scope.
          </li>
          <li>
            <strong>AI behavior under real prompts</strong> — when does the
            Skill steer correctly, when does it drift?
          </li>
          <li>
            <strong>Kill criteria input</strong> — see{" "}
            <code className="text-xs">KILL-CRITERIA.md</code> at repo root. If
            you find a reason to kill or re-scope the DS, that&apos;s a
            valuable finding, not a failure.
          </li>
        </ul>
      </DocsSection>

      <DocsSection
        title="I. Out of scope (don't do)"
        description="A few hard lines to keep the pilot honest."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>
            <strong>Don&apos;t modify Dash production code via DS.</strong> The
            DS is purely additive — components arrive in your repo as source you
            own, but they ship alongside existing code, not replacing it.
          </li>
          <li>
            <strong>Don&apos;t share your Bearer token.</strong> Not in Slack,
            not in screenshots, not in commits. Rotate via 1Password if it
            leaks.
          </li>
          <li>
            <strong>Don&apos;t bypass dash add.</strong> No copy-pasting
            components from other Dash repos. The CLI keeps deps + audit gates
            consistent.
          </li>
          <li>
            <strong>Don&apos;t modify production Dash repos under
            /Users/&hellip;/Dash/*</strong> — they are READ-ONLY references for
            the DS work.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Cross-references">
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>
            <Link
              className="text-(--dash-purple-600) underline-offset-4 hover:underline"
              href="/docs/quick-start"
            >
              Quick Start
            </Link>{" "}
            — the developer-flavored 8-step version of this same flow.
          </li>
          <li>
            <Link
              className="text-(--dash-purple-600) underline-offset-4 hover:underline"
              href="/docs/components"
            >
              Components
            </Link>{" "}
            — the full atom + block catalog.
          </li>
          <li>
            <Link
              className="text-(--dash-purple-600) underline-offset-4 hover:underline"
              href="/docs/tools/cli"
            >
              Dash CLI reference
            </Link>{" "}
            — every command + flag.
          </li>
          <li>
            <Link
              className="text-(--dash-purple-600) underline-offset-4 hover:underline"
              href="/docs/tools/ai-rules"
            >
              AI Rules
            </Link>{" "}
            — what the Skill is enforcing.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
