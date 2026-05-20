"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import {
  DocsStep,
  DocsStepList,
  DocsWorkflowDiagram,
} from "@/components/docs/docs-step"

export default function InstallationPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started"
        title="Installation"
        description="Wire your project to the Dash registry, install the base theme, and ship your first list page in under five minutes. Walk through six visual steps — or jump to the Quick install at the top."
      />

      {/* Redirect banner — points new users to the canonical entry page */}
      <div
        role="note"
        className="rounded-xl border border-information-light bg-information-lighter px-4 py-3 text-sm text-text-strong-950"
      >
        <span className="font-semibold">Deep reference.</span> New here? Start with
        the{" "}
        <Link
          href="/docs/getting-started"
          className="text-(--dash-purple-600) underline underline-offset-4"
        >
          10-minute Getting Started
        </Link>{" "}
        — this page is the full reference for every flag and edge case.
      </div>

      {/* At-a-glance install flow */}
      <DocsWorkflowDiagram
        steps={[
          { label: "Check prerequisites", sub: "Next 15, Tailwind v4" },
          { label: "Run dash init", sub: "scaffold + token" },
          { label: "Wire components.json", sub: "registry pointer" },
          { label: "Install base theme", sub: "dash add base-theme" },
          { label: "Verify", sub: "dash list" },
          { label: "Add first component", sub: "dash add button" },
        ]}
      />

      <DocsSection
        title="Prerequisites"
        description="Confirm your environment hits these versions before you start. Most issues we triage in #dash-ds are version mismatches caught at this step."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>Next.js 15+ (App Router), Vite, or Remix consumer project</li>
          <li>
            Tailwind CSS v4 (uses <code className="text-xs">@theme inline</code> directive)
          </li>
          <li>pnpm 9+ (recommended) — npm, yarn, and bun also supported</li>
          <li>Node 18.17+</li>
          <li>A registry bearer token from the Dash platform team</li>
        </ul>
      </DocsSection>

      <DocsSection
        title="Visual walkthrough"
        description="Six steps from a fresh repo to a working Dash button. Every step shows the command, the expected stdout, and a screenshot of the result so you can sanity-check as you go."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Quick install with dash init"
            description="One command — Dash CLI scaffolds components.json, writes .env.local, and pulls the base theme. Auto-detects your framework from package.json."
            code={`pnpm dlx dash@latest init --token sk-dash-xxxx`}
            output={`✔ Detected Next.js 15 + Tailwind v4
✔ Wrote components.json
✔ Wrote .env.local (DASH_REGISTRY_TOKEN)
✔ Wrote registry/dash/lib/utils.ts
✔ Imported @dash/tokens into app/globals.css
ℹ Run \`pnpm dlx dash add button\` to verify the wire-up.`}
            imagePlaceholder="Terminal output of dash init — five green checkmarks confirming scaffold, plus the suggested first-add command."
          />

          <DocsStep
            number={2}
            title="Inspect components.json"
            description="If you prefer manual setup, or you're wiring a non-standard workspace, you can write this file by hand. The aliases section is the contract for where each registry kind lands."
            codeLanguage="json"
            code={`{
  "$schema": "https://ds.dash.com/schema/components.json",
  "style": "dash",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/registry/dash",
    "utils": "@/registry/dash/lib/utils",
    "ui": "@/registry/dash/ui",
    "lib": "@/registry/dash/lib",
    "hooks": "@/registry/dash/hooks",
    "templates": "@/registry/dash/templates",
    "blocks": "@/registry/dash/blocks"
  },
  "registries": {
    "@dash": {
      "url": "https://ds.dash.com/r/{name}.json",
      "headers": { "Authorization": "Bearer \${DASH_REGISTRY_TOKEN}" }
    }
  }
}`}
            imagePlaceholder="components.json open in VSCode with the aliases and registries blocks highlighted."
            imageHeight="lg"
          />

          <DocsStep
            number={3}
            title="Set your registry token"
            description="Bearer token authorizes your CLI against the private @dash registry. Never commit this — it's in .gitignore by default but double-check."
            code={`# .env.local
DASH_REGISTRY_TOKEN=sk-dash-xxxx`}
            imagePlaceholder=".env.local file in editor with the token line visible and a tooltip showing the .gitignore status."
            imageHeight="sm"
          />

          <DocsStep
            number={4}
            title="Install the base theme + utils"
            description="Drops the token system into app/globals.css (between markers, so updates are idempotent) and writes the cn() helper at registry/dash/lib/utils.ts."
            code={`pnpm dlx dash add base-theme utils`}
            output={`✔ Resolved base-theme (12 token groups)
✔ Wrote registry/dash/lib/utils.ts
✔ Updated app/globals.css (between @dash:start/end markers)
ℹ Run \`pnpm dlx dash list\` to see all available components.`}
            imagePlaceholder="Diff view of app/globals.css showing the @dash:start/end markers wrapping the new CSS variable block."
          />

          <DocsStep
            number={5}
            title="Verify the registry connection"
            description="dash list hits the registry with your token and returns the available items. If you see 0 items, your token is bad — check the troubleshooting tips below."
            code={`pnpm dlx dash list
# → 181 items available: button, card, data-table, dashboard-shell, …`}
            output={`@dash registry · 181 items
  ui          92 components
  blocks      42 patterns
  pages       41 docs
  templates    9 page shells
  hooks        2 utilities
  lib          2 helpers`}
            imagePlaceholder="Terminal output of dash list showing categorized counts for ui / blocks / templates / hooks / forms / charts."
          />

          <DocsStep
            number={6}
            title="Add your first component"
            description="Pulls button source into registry/dash/ui/button.tsx — you own the file. Now you can import it anywhere in your app and ship."
            code={`pnpm dlx dash add button`}
            output={`✔ Resolved button (4 deps)
✔ Wrote registry/dash/ui/button.tsx
ℹ Import: import { Button } from "@/registry/dash/ui/button"`}
            imagePlaceholder="Browser preview of a page rendering a primary Dash button and a ghost button with hover state."
          />
        </DocsStepList>
      </DocsSection>

      <DocsSection
        title="Troubleshooting"
        description="If dash list returns 0 items: check that the bearer token isn't URL-encoded, your registry URL matches https://ds.dash.com/r/{name}.json, and your shell environment exports the token (not just the .env.local file — Next.js loads .env.local, but the CLI reads process.env)."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>
            <code className="text-xs">echo $DASH_REGISTRY_TOKEN</code> — confirms shell env
          </li>
          <li>
            <code className="text-xs">curl -H &quot;Authorization: Bearer $DASH_REGISTRY_TOKEN&quot; https://ds.dash.com/r/index.json</code>{" "}
            — confirms network + token
          </li>
          <li>
            Token rotated? Ping platform team in #dash-ds for a fresh one.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Next steps">
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/quick-start">
              Quick Start
            </Link>{" "}
            — ship your first Dash-themed page in 5 minutes
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/installation/cli">
              CLI install detail
            </Link>{" "}
            — every install method (pnpm, npm, brew, Verdaccio), Bearer auth setup
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/components/button">
              Components → Button
            </Link>{" "}
            — first component reference
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/tools/ai-rules">
              AI Rules
            </Link>{" "}
            — drop the <code className="text-xs">dash-ai-rules.md</code> into Cursor/Claude/Windsurf for autocomplete that respects Dash naming
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
