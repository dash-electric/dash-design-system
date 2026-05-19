"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function InstallationPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started"
        title="Installation"
        description="Wire your project to the Dash Design System registry, install the base theme, and ship your first mitra-9412 list page in under five minutes."
      />

      <DocsSection title="Prerequisites">
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>Next.js 15+ (App Router), Vite, or Remix consumer project</li>
          <li>Tailwind CSS v4 (uses <code className="text-xs">@theme inline</code> directive)</li>
          <li>pnpm 9+ (recommended) — npm, yarn, and bun also supported</li>
          <li>Node 18.17+</li>
          <li>A registry bearer token from the Dash platform team</li>
        </ul>
      </DocsSection>

      <DocsSection
        title="Quick install"
        description="One command — Dash CLI scaffolds components.json, writes .env.local, and pulls the base theme."
      >
        <DocsCode
          language="bash"
          code={`pnpm dlx dash@latest init --token sk-dash-xxxx`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          The CLI prompts for your framework if it can&apos;t auto-detect from{" "}
          <code className="text-xs">package.json</code>. After init runs, you have:
        </p>
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1 mt-2">
          <li><code className="text-xs">components.json</code> with the <code className="text-xs">@dash</code> registry wired</li>
          <li><code className="text-xs">.env.local</code> with <code className="text-xs">DASH_REGISTRY_TOKEN</code></li>
          <li><code className="text-xs">registry/dash/lib/utils.ts</code> (cn helper) + base theme CSS variables in <code className="text-xs">app/globals.css</code></li>
        </ul>
      </DocsSection>

      <DocsSection
        title="Manual install"
        description="If you prefer to wire the registry by hand — useful for monorepo or custom build setups."
      >
        <p className="text-sm text-text-sub-600 mb-3">1. Create <code className="text-xs">components.json</code> at the project root:</p>
        <DocsCode
          language="json"
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
        />
        <p className="text-sm text-text-sub-600 mt-4 mb-3">2. Add your token to <code className="text-xs">.env.local</code>:</p>
        <DocsCode language="bash" code={`DASH_REGISTRY_TOKEN=sk-dash-xxxx`} />
        <p className="text-sm text-text-sub-600 mt-4 mb-3">3. Install the base theme and utilities:</p>
        <DocsCode language="bash" code={`pnpm dlx dash add base-theme utils`} />
        <p className="text-sm text-text-sub-600 mt-3">
          This drops the token system into <code className="text-xs">app/globals.css</code>{" "}
          (between <code className="text-xs">{`/* @dash:start base-theme */`}</code>{" "}
          and <code className="text-xs">{`/* @dash:end base-theme */`}</code> markers, so
          subsequent updates are idempotent) and writes the <code className="text-xs">cn()</code>{" "}
          helper at <code className="text-xs">registry/dash/lib/utils.ts</code>.
        </p>
      </DocsSection>

      <DocsSection title="Verify">
        <DocsCode
          language="bash"
          code={`pnpm dlx dash list
# → 112 items available: button, card, data-table, dashboard-shell, …`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          If the list returns 0 items, double-check your bearer token, registry URL, and that the
          token isn&apos;t URL-encoded.
        </p>
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
            — every install method (pnpm, npm, brew, Verdaccio), Bearer auth setup, troubleshooting
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
