"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function DashCliDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Tools / CLI"
        title="dash CLI"
        description="Sovereign command-line tool for the Dash Design System registry. Install components, scaffold projects, search the registry, build distribution JSON — all branded for @dash."
      />

      <DocsSection title="Install">
        <DocsCode
          language="bash"
          code={`# inside your Next.js / Vite / Remix repo
pnpm add -D dash

# or globally
pnpm add -g dash`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Requires Node 18.17+. Works with pnpm, yarn, npm, and bun consumers — the CLI auto-detects
          your package manager from the lockfile.
        </p>
      </DocsSection>

      <DocsSection
        title="dashkit init"
        description="Scaffold a consumer project so it can talk to the @dash registry."
      >
        <DocsCode
          language="bash"
          code={`# interactive — prompts for registry URL, token, framework
dashkit init

# non-interactive
dashkit init --yes --token sk-xxxx --registry https://ds.dash.com/r/{name}.json`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Writes <code className="text-xs">components.json</code>, appends{" "}
          <code className="text-xs">DASH_REGISTRY_TOKEN</code> to{" "}
          <code className="text-xs">.env.local</code>, then auto-runs{" "}
          <code className="text-xs">dashkit add base-theme utils</code>.
        </p>
        <DocsPropsTable
          rows={[
            { name: "--yes", type: "boolean", description: "Skip prompts; use sensible defaults." },
            { name: "--token", type: "string", description: "Bearer token for the @dash registry." },
            {
              name: "--registry",
              type: "string",
              defaultValue: "http://localhost:3000/r/{name}.json",
              description: "Registry URL template. {name} placeholder optional.",
            },
            {
              name: "--framework",
              type: "next | vite | remix",
              description: "Framework hint. Auto-detected from package.json by default.",
            },
            { name: "--cwd", type: "string", defaultValue: "process.cwd()", description: "Project directory." },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="dashkit add <names…>"
        description="Install one or more registry items. Resolves registryDependencies recursively, dedupes, topo-sorts, then writes files and installs npm deps."
      >
        <DocsCode
          language="bash"
          code={`dashkit add button
dashkit add @dash/button                       # explicit @dash prefix
dashkit add https://example.com/foo.json       # full URL also works
dashkit add card avatar popover                # multiple at once
dashkit add form --overwrite                   # force overwrite existing files
dashkit add data-table --dry-run               # plan only — no writes`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Bare names like <code className="text-xs">button</code> resolve against the first
          configured registry (usually <code className="text-xs">@dash</code>).{" "}
          <code className="text-xs">cssVars</code> from each item are idempotently merged
          into <code className="text-xs">app/globals.css</code> using{" "}
          <code className="text-xs">{`/* @dash:start <name> */`}</code> marker comments.
        </p>
        <DocsPropsTable
          rows={[
            { name: "--yes", type: "boolean", description: "Auto-decline overwrite prompts (unless --overwrite is set)." },
            { name: "--overwrite", type: "boolean", description: "Overwrite existing files without prompting." },
            { name: "--dry-run", type: "boolean", description: "Print planned writes; no changes." },
            { name: "--cwd", type: "string", defaultValue: "process.cwd()", description: "Project directory." },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="dashkit build"
        description="Build distribution JSON from a source registry.json. Drop-in for scripts/build-registry.ts."
      >
        <DocsCode
          language="bash"
          code={`# default: registry.json → public/r/
dashkit build

dashkit build --registry custom.json --output dist/r`}
        />
        <DocsPropsTable
          rows={[
            { name: "--registry", type: "string", defaultValue: "registry.json", description: "Path to source registry.json." },
            { name: "--output", type: "string", defaultValue: "public/r", description: "Output directory." },
            { name: "--cwd", type: "string", defaultValue: "process.cwd()", description: "Project root." },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="dashkit list"
        description="List available registry items."
      >
        <DocsCode
          language="bash"
          code={`dashkit list                                       # uses components.json registry
dashkit list --type component                      # filter by type
dashkit list --registry file:///path/to/public/r   # ad-hoc registry (no components.json)`}
        />
        <DocsPropsTable
          rows={[
            {
              name: "--type",
              type: "component | theme | hook | page | block | file | lib",
              description: "Filter results to a single item type.",
            },
            { name: "--registry", type: "string", description: "Override the configured registry URL." },
            { name: "--token", type: "string", description: "Bearer token (defaults to $DASH_REGISTRY_TOKEN)." },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="dashkit search <query>"
        description="Full-text search the registry index by name, title, and description (case-insensitive)."
      >
        <DocsCode
          language="bash"
          code={`dashkit search button
dashkit search "data table"`}
        />
      </DocsSection>

      <DocsSection
        title="dash --version / dash --help"
        description="Print the CLI version or the help screen."
      >
        <DocsCode language="bash" code={`dash --version    # → 0.1.0
dash --help`} />
      </DocsSection>

      <DocsSection title="components.json shape">
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
      "url": "http://localhost:3000/r/{name}.json",
      "headers": { "Authorization": "Bearer \${DASH_REGISTRY_TOKEN}" }
    }
  }
}`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          <code className="text-xs">{`\${DASH_REGISTRY_TOKEN}`}</code> is interpolated from{" "}
          <code className="text-xs">process.env</code> at request time. Missing env vars
          resolve to an empty string.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
