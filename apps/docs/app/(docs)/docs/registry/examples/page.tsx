"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function RegistryExamplesPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Registry"
        title="Examples"
        description="Three real registry items walked end-to-end: a lib utility (cn), a component (badge), and a theme (base-theme). Plus a note on running your own custom registry beyond @dash."
      />

      <DocsSection
        title="Example 1 — registry:lib (cn helper)"
        description="The smallest possible item. No deps. One file. Used by every component."
      >
        <DocsCode
          language="json"
          code={`{
  "name": "utils",
  "type": "registry:lib",
  "title": "cn helper",
  "description": "Tailwind-aware classname merger built on clsx + tailwind-merge.",
  "dependencies": ["clsx", "tailwind-merge"],
  "registryDependencies": [],
  "files": [
    {
      "path": "registry/dash/lib/utils.ts",
      "type": "registry:lib",
      "target": "@/registry/dash/lib/utils.ts",
      "content": "import { clsx, type ClassValue } from \\"clsx\\"\\nimport { twMerge } from \\"tailwind-merge\\"\\n\\nexport function cn(...inputs: ClassValue[]) {\\n  return twMerge(clsx(inputs))\\n}\\n"
    }
  ],
  "cssVars": {}
}`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          <code className="text-xs">dashkit add utils</code> installs the two npm deps and
          writes one TS file. Zero registry dependencies — this is a leaf.
        </p>
      </DocsSection>

      <DocsSection
        title="Example 2 — registry:ui (badge)"
        description="A component item with both npm and registry dependencies. CLI resolves utils first, then writes badge.tsx."
      >
        <DocsCode
          language="json"
          code={`{
  "name": "badge",
  "type": "registry:ui",
  "title": "Badge",
  "description": "Status pill with 8 semantic states × 2 appearances (solid, light).",
  "categories": ["data-display"],
  "dependencies": ["class-variance-authority"],
  "registryDependencies": ["utils"],
  "files": [
    {
      "path":    "registry/dash/ui/badge.tsx",
      "type":    "registry:ui",
      "target":  "@/registry/dash/ui/badge.tsx",
      "content": "/* TSX */"
    }
  ],
  "cssVars": {}
}`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          When you run <code className="text-xs">dashkit add badge</code>:
        </p>
        <ol className="text-sm text-text-sub-600 list-decimal pl-5 space-y-1 mt-2">
          <li>CLI fetches <code className="text-xs">/r/badge.json</code>.</li>
          <li>Sees <code className="text-xs">registryDependencies: [&quot;utils&quot;]</code> — fetches <code className="text-xs">/r/utils.json</code> too.</li>
          <li>Topo-sorts: utils → badge.</li>
          <li>Installs npm deps for both (deduped).</li>
          <li>Writes both files at their target paths.</li>
        </ol>
      </DocsSection>

      <DocsSection
        title="Example 3 — registry:theme (base-theme)"
        description="A pure-CSS item. files=[], all the value is in cssVars. Always installed by dashkit init."
      >
        <DocsCode
          language="json"
          code={`{
  "name": "base-theme",
  "type": "registry:theme",
  "title": "Dash Base Theme",
  "description": "11 color scales, 4-tier semantic tokens, radius / shadow / motion variables.",
  "files": [],
  "cssVars": {
    "theme": {
      "--dash-purple-500": "#5e2aac",
      "--dash-purple-600": "#4f1d97",
      "--primary-base":    "var(--dash-purple-500)",
      "--radius-12":       "0.75rem",
      "--shadow-card-md":  "0 16px 32px -12px #0e121b1a"
    },
    "light": {
      "--bg-white-0":      "var(--dash-neutral-0)",
      "--text-strong-950": "var(--dash-neutral-950)",
      "--stroke-soft-200": "var(--dash-neutral-200)"
    },
    "dark": {
      "--bg-white-0":      "var(--dash-neutral-950)",
      "--text-strong-950": "var(--dash-neutral-0)",
      "--stroke-soft-200": "var(--dash-neutral-800)"
    }
  }
}`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          The CLI merges <code className="text-xs">theme</code> block into the{" "}
          <code className="text-xs">@theme inline</code> directive,{" "}
          <code className="text-xs">light</code> into <code className="text-xs">:root</code>,{" "}
          <code className="text-xs">dark</code> into <code className="text-xs">.dark</code>.
          All wrapped in <code className="text-xs">{`/* @dash:start base-theme */`}</code> guard comments
          so reinstalls are idempotent.
        </p>
      </DocsSection>

      <DocsSection
        title="Custom registries beyond @dash"
        description="Roadmap Day 8+. Lets a single consumer pull from multiple registries in one components.json."
      >
        <p className="text-sm text-text-sub-600 mb-3">
          The CLI&apos;s <code className="text-xs">registries</code> field accepts more than
          one namespace. Use it for a per-team layer on top of @dash (e.g. <code className="text-xs">@halo-dash</code>{" "}
          for support-only blocks, <code className="text-xs">@phase7</code> for trading dashboards):
        </p>
        <DocsCode
          language="json"
          code={`{
  "registries": {
    "@dash": {
      "url": "https://ds.dash.com/r/{name}.json",
      "headers": { "Authorization": "Bearer \${DASH_REGISTRY_TOKEN}" }
    },
    "@halo-dash": {
      "url": "https://halo.internal.dash.com/r/{name}.json",
      "headers": { "Authorization": "Bearer \${HALO_REGISTRY_TOKEN}" }
    }
  }
}`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Then: <code className="text-xs">dashkit add @halo-dash/ticket-detail-pane</code>.
          Bare names like <code className="text-xs">button</code> still resolve against the
          first configured registry (@dash).
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
