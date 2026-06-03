"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function RegistryJsonPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Registry"
        title="registry.json"
        description="The manifest at the design-system repo root. Lists every item Dash ships, with type, deps, source files, and CSS vars. dashkit build reads this and emits per-item JSON to public/r/."
      />

      <DocsSection title="Top-level shape">
        <DocsCode
          language="json"
          code={`{
  "$schema": "https://ds.dash.com/schema/registry.json",
  "name": "@dash",
  "homepage": "https://ds.dash.com",
  "items": [
    { /* item 1 */ },
    { /* item 2 */ }
  ]
}`}
        />
        <DocsPropsTable
          rows={[
            { name: "$schema",  type: "string",  description: "JSON schema URL for autocomplete in IDE." },
            { name: "name",     type: "string",  description: "Namespace key. Dash uses @dash." },
            { name: "homepage", type: "string",  description: "Public docs URL — surfaces in CLI help." },
            { name: "items",    type: "Item[]",  description: "Every registry item." },
          ]}
        />
      </DocsSection>

      <DocsSection title="items[i] schema">
        <DocsPropsTable
          rows={[
            { name: "name",                 type: "string",          description: "Slug, kebab-case. CLI argument to dashkit add." },
            { name: "type",                 type: "RegistryItemType", description: "registry:ui | registry:lib | registry:hook | registry:page | registry:block | registry:theme | registry:file." },
            { name: "title",                type: "string",          description: "Human label. Renders in dashkit list and dashkit search." },
            { name: "description",          type: "string",          description: "One-liner. Also used by AI rules + search index." },
            { name: "categories",           type: "string[]",        defaultValue: "[]", description: "Optional tags (forms, layout, mitra, etc)." },
            { name: "dependencies",         type: "string[]",        defaultValue: "[]", description: "npm packages to install on the consumer." },
            { name: "registryDependencies", type: "string[]",        defaultValue: "[]", description: "Other registry items required (e.g. button → utils)." },
            { name: "files",                type: "FileEntry[]",     description: "Source files to ship. See registry-item.json doc." },
            { name: "cssVars",              type: "CssVarsBlock",    defaultValue: "{}", description: "CSS variables merged into globals.css under guard comments." },
            { name: "meta",                 type: "Record<string,any>", defaultValue: "{}", description: "Free-form. Dash uses meta.figma for Code Connect mappings." },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="Example — button entry"
        description="Real entry copy-pasted from Dash registry.json (truncated content field)."
      >
        <DocsCode
          language="json"
          code={`{
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "Primary action component. 5 variants (primary, neutral, error, ghost, link) × 4 sizes.",
  "categories": ["actions"],
  "dependencies": [
    "@radix-ui/react-slot",
    "class-variance-authority"
  ],
  "registryDependencies": ["utils"],
  "files": [
    {
      "path": "registry/dash/ui/button.tsx",
      "type": "registry:ui",
      "target": "@/registry/dash/ui/button.tsx",
      "content": "/* full TSX baked in at build time */"
    }
  ],
  "cssVars": {
    "theme": {
      "--radius-button": "0.625rem"
    }
  },
  "meta": {
    "figma": "https://figma.com/file/xxx?node-id=42:7"
  }
}`}
        />
      </DocsSection>

      <DocsSection
        title="Example — base-theme entry"
        description="Theme items inject CSS variables only, no TSX. Always installed first via dashkit init."
      >
        <DocsCode
          language="json"
          code={`{
  "name": "base-theme",
  "type": "registry:theme",
  "title": "Dash Base Theme",
  "description": "11 color scales + 4-tier semantic tokens + radius/shadow/motion variables.",
  "files": [],
  "cssVars": {
    "theme": {
      "--dash-purple-500": "#5e2aac",
      "--primary-base":    "var(--dash-purple-500)"
    },
    "light": {
      "--bg-white-0":   "var(--dash-neutral-0)",
      "--text-strong-950": "var(--dash-neutral-950)"
    },
    "dark": {
      "--bg-white-0":   "var(--dash-neutral-950)",
      "--text-strong-950": "var(--dash-neutral-0)"
    }
  }
}`}
        />
      </DocsSection>

      <DocsSection title="Build pipeline">
        <DocsCode
          language="bash"
          code={`# in the design-system repo
pnpm registry:build
# → reads registry.json
# → resolves each item.files[].path → reads file content into memory
# → writes public/r/<name>.json (one per item)
# → writes public/r/index.json (list endpoint for dashkit list/search)`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Dash currently runs this on pre-commit + on the deploy step. Consumer-facing CDN cache TTL
          is 60s for individual items, 0s for index.json.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
