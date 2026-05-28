"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function DashSkillPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Tools"
        title="Dash Skill"
        description="A Claude Agent Skill package bundling Dash naming conventions, the decision tree, and project-aware introspection. AI assistants load it once and gain Dash fluency for the rest of the session. Phase 2 scaffold shipped — content pending pilot."
        status="wip"
      />

      <DocsSection
        title="What it does"
        description="Skills are versioned knowledge packs. Dash Skill installs into Claude Code / Cursor / Windsurf and teaches the AI:"
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-6 space-y-1">
          <li><strong className="text-text-strong-950">Naming conventions</strong> — when to say Field vs FormField, IconButton vs Button, etc.</li>
          <li><strong className="text-text-strong-950">Decision tree</strong> — &quot;need a status badge → use Badge with status prop, not raw bg-color&quot;.</li>
          <li><strong className="text-text-strong-950">Token discipline</strong> — semantic over raw, dark-mode pitfalls, custom override patterns.</li>
          <li><strong className="text-text-strong-950">Project introspection</strong> — runs <code className="text-xs">dash info --json</code> in the workspace to detect installed items, alias paths, registry token health.</li>
          <li><strong className="text-text-strong-950">Dash-domain examples</strong> — mitra, dispatch, tribe, Halo-dash, Phase7 patterns the AI can drop in.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Install">
        <DocsCode
          language="bash"
          code={`# Phase 2 scaffold shipped in the repo as @dash/skill
claude skill install @dash/skill

# or via dash CLI
dash skill install`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Installs to <code className="text-xs">~/.claude/skills/dash/</code> (Claude Code)
          and pushes a manifest entry that auto-activates when the AI detects a Dash project (i.e.{" "}
          <code className="text-xs">components.json</code> with{" "}
          <code className="text-xs">style: &quot;dash&quot;</code>).
        </p>
      </DocsSection>

      <DocsSection title="dash info --json shape">
        <DocsCode
          language="bash"
          code={`dash info --json
# →
# {
#   "version": "1.0.0",
#   "registries": ["@dash"],
#   "installed": {
#     "button": "1.0.0",
#     "card": "1.0.0",
#     "data-table": "1.0.0",
#     "mitra-suspend-page": "1.0.0"
#   },
#   "tokenHealth": "ok",
#   "darkMode": "enabled",
#   "framework": "next-15"
# }`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          The skill calls this on every session start to know what&apos;s available without asking the user.
        </p>
      </DocsSection>

      <DocsSection title="Roadmap">
        <ul className="text-sm text-text-sub-600 list-disc pl-6 space-y-1">
          <li><strong className="text-text-strong-950">WK01</strong> — Skill Phase 2 scaffold shipped as <code className="text-xs">@dash/skill</code> (SKILL.md + frontmatter, content pending pilot).</li>
          <li><strong className="text-text-strong-950">WK02</strong> — <code className="text-xs">dash info --json</code> introspection wired into the scaffold.</li>
          <li><strong className="text-text-strong-950">WK03</strong> — beta with 2 internal teams (Halo-dash + Express), measure correct &quot;reach for X&quot; rate.</li>
          <li><strong className="text-text-strong-950">WK04</strong> — 5 user scale pilot, cross-validate with MCP server.</li>
          <li><strong className="text-text-strong-950">WK05</strong> — full rollout. Deploy ETA: this week 2026-05-21+.</li>
        </ul>
        <p className="text-sm text-text-sub-600 mt-3">
          Pilot content still maturing — fall back on the static rules via <code className="text-xs">dash add ai-rules</code>
          and reference <code className="text-xs">@registry/rules/dash-ai-rules.md</code> in your AI tool&apos;s context.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
