"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function RegistryItemJsonPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Registry"
        title="registry-item.json"
        description="Per-item output written by dashkit build. This is what dashkit add fetches from ds.dash.com/r/<name>.json. Same shape as one entry in registry.json, but with file contents baked in."
      />

      <DocsSection title="Schema reference">
        <DocsPropsTable
          rows={[
            { name: "name",                 type: "string",           description: "kebab-case slug, matches the JSON filename." },
            { name: "type",                 type: "RegistryItemType", description: "Same as registry.json item." },
            { name: "title",                type: "string",           description: "Human label." },
            { name: "description",          type: "string",           description: "One-liner used in dashkit list / dashkit search." },
            { name: "dependencies",         type: "string[]",         description: "npm packages the CLI installs." },
            { name: "registryDependencies", type: "string[]",         description: "Other registry items to fetch + install first." },
            { name: "files",                type: "FileEntry[]",      description: "Source files with content baked in. See below." },
            { name: "cssVars",              type: "CssVarsBlock",     description: "Variables to merge into app/globals.css." },
            { name: "meta",                 type: "object",           description: "Free-form metadata (figma node ID, author, etc)." },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="Item types"
        description="The type field controls how the CLI handles the item — where files land, what gets installed, whether deps are required."
      >
        <DocsPropsTable
          rows={[
            { name: "registry:ui",    type: "type", description: "A component. Lands in @/registry/dash/ui/. May have dependencies + registryDependencies." },
            { name: "registry:lib",   type: "type", description: "A utility module. Lands in @/registry/dash/lib/. Example: cn." },
            { name: "registry:hook",  type: "type", description: "A React hook. Lands in @/registry/dash/hooks/. Example: use-mobile, use-debounce." },
            { name: "registry:page",  type: "type", description: "A page-level template (Halo-dash 3-pane, mitra-suspend-page). Lands in @/registry/dash/templates/." },
            { name: "registry:block", type: "type", description: "A composite block (data-table, transactions-table, settings-team). Lands in @/registry/dash/blocks/." },
            { name: "registry:theme", type: "type", description: "CSS-only payload. files=[]. Drops cssVars into globals.css. Example: base-theme." },
            { name: "registry:file",  type: "type", description: "Arbitrary file (e.g. dash-ai-rules.md). target overrides default landing path." },
          ]}
        />
      </DocsSection>

      <DocsSection title="files[i] anatomy">
        <DocsCode
          language="json"
          code={`{
  "path":    "registry/dash/ui/button.tsx",
  "type":    "registry:ui",
  "target":  "@/registry/dash/ui/button.tsx",
  "content": "\\"use client\\"\\n\\nimport * as React from \\"react\\"\\n...\\n"
}`}
        />
        <DocsPropsTable
          rows={[
            { name: "path",    type: "string", description: "Source path in the design-system repo. Used for build introspection only." },
            { name: "type",    type: "string", description: "Mirrors the parent item type. Multi-file items can mix (e.g. a block with a hook)." },
            { name: "target",  type: "string", defaultValue: "auto", description: "Alias path on the consumer. Resolves against components.json aliases." },
            { name: "content", type: "string", description: "Full file contents, JSON-escaped. The CLI writes this byte-for-byte." },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="cssVars structure"
        description="3 optional blocks. theme = always applied. light/dark = mode-scoped."
      >
        <DocsCode
          language="json"
          code={`{
  "cssVars": {
    "theme": {
      "--radius-button": "0.625rem",
      "--shadow-button": "0 1px 2px rgb(0 0 0 / 0.04)"
    },
    "light": {
      "--button-fg": "var(--text-white-0)"
    },
    "dark": {
      "--button-fg": "var(--text-strong-950)"
    }
  }
}`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          The CLI merges each block under guard comments:{" "}
          <code className="text-xs">{`/* @dash:start <name>:theme */`}</code> in the{" "}
          <code className="text-xs">@theme inline</code> block,{" "}
          <code className="text-xs">{`/* @dash:start <name>:light */`}</code> in{" "}
          <code className="text-xs">:root</code>, and{" "}
          <code className="text-xs">{`/* @dash:start <name>:dark */`}</code> in{" "}
          <code className="text-xs">.dark</code>.
        </p>
      </DocsSection>

      <DocsSection title="Full mitra-suspend-page example">
        <DocsCode
          language="json"
          code={`{
  "name": "mitra-suspend-page",
  "type": "registry:page",
  "title": "Mitra Suspend Page",
  "description": "Halo-dash Auto-Suspend rule builder with mitra preview, threshold inputs, dry-run mode.",
  "categories": ["dash-custom", "halo-dash"],
  "dependencies": [
    "react-hook-form",
    "zod",
    "@hookform/resolvers"
  ],
  "registryDependencies": [
    "form",
    "input",
    "select",
    "button",
    "badge",
    "data-table",
    "list-detail-page"
  ],
  "files": [
    {
      "path":    "registry/dash/templates/mitra-suspend-page.tsx",
      "type":    "registry:page",
      "target":  "@/registry/dash/templates/mitra-suspend-page.tsx",
      "content": "/* baked TSX */"
    }
  ],
  "cssVars": {},
  "meta": {
    "figma": "https://figma.com/file/xxx?node-id=88:12",
    "owner": "Halo-dash team"
  }
}`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
