"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AiRulesDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Tools / AI"
        title="Dash AI Rules"
        description="Single markdown file that teaches Claude / Cursor / Copilot the Dash naming conventions, decision tree, token system, anti-patterns. Install once into your repo's CLAUDE.md."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add dash-ai-rules`} />
        <p className="text-sm text-text-sub-600 mt-3">
          Writes <code className="text-xs">CLAUDE.md</code> at your repo root. AI tools
          will auto-discover it. Pair with <code className="text-xs">AGENTS.md</code> or
          <code className="text-xs">.cursorrules</code> by copy-renaming if needed.
        </p>
      </DocsSection>

      <DocsSection title="What it teaches AI">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Query Dash registry FIRST before generating UI primitives</li>
          <li>• Use <code className="text-xs">dashkit add &lt;name&gt;</code> — never hand-copy</li>
          <li>• Use semantic tokens (<code className="text-xs">bg-bg-white-0</code>, <code className="text-xs">text-text-strong-950</code>) — never raw colors</li>
          <li>• Forms = RHF + zod pattern blocks as canonical reference. Adaptation Layer translates per-repo (Jotai for portal-v2, useState for backoffice/halo/fleet-mgmt, Zustand for basecamp).</li>
          <li>• Page layouts = pick from <code className="text-xs">@dash/templates/*</code> first</li>
          <li>• 8 naming divergences vs shadcn (Modal/Divider/Radio/ProgressBar/Toaster/Tag + Button anatomy + Input anatomy)</li>
          <li>• Decision tree for ~180 primitives organized by use case</li>
          <li>• Dash domain copy patterns (mitra, tribe, dispatch, Halo-dash, BMKG)</li>
        </ul>
      </DocsSection>

      <DocsSection title="Manual install (if you don't use Dash CLI yet)">
        <DocsCode
          language="bash"
          code={`# Pull the markdown directly with curl (with Bearer auth)
curl -H "Authorization: Bearer $DASH_REGISTRY_TOKEN" \\
  https://ds.dash.com/r/dash-ai-rules.json | jq -r '.files[0].content' > CLAUDE.md`}
        />
      </DocsSection>

      <DocsSection title="Coverage">
        <p className="text-sm text-text-sub-600 leading-relaxed">
          The file covers all 181 registry items as of v1.0. Updated whenever new primitives ship.
          Pin your version by checking <code className="text-xs">registry/rules/dash-ai-rules.md</code> in
          the Dash DS repo for the latest. AI assistants in Dash repos should respect this file as
          overriding default shadcn knowledge — Dash names differ.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
