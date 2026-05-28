"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function RegistryPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Registry"
        title="Registry"
        description="How Dash distributes components to consumer projects. Source files in registry/dash/, manifest in registry.json, built JSON in public/r/, served via Bearer-auth API to the dash CLI."
      />

      <DocsSection
        title="What is registry-item.json"
        description="One JSON file per component / hook / block / template / theme. The CLI fetches these on demand."
      >
        <p className="text-sm text-text-sub-600 mb-3">
          Each item ships its file contents inline (so consumers don&apos;t need a git clone), its npm
          dependencies, and any registry dependencies. The CLI flattens the graph, dedupes, topo-sorts,
          then writes to the consumer&apos;s aliased paths.
        </p>
        <DocsCode
          language="json"
          code={`{
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "Primary action component with 5 variants and 4 sizes.",
  "dependencies": ["@radix-ui/react-slot"],
  "registryDependencies": ["utils"],
  "files": [
    {
      "path": "registry/dash/ui/button.tsx",
      "type": "registry:ui",
      "target": "@/registry/dash/ui/button.tsx",
      "content": "// ... full TSX ..."
    }
  ]
}`}
        />
      </DocsSection>

      <DocsSection
        title="How distribution works"
        description="One round trip per item, Bearer-auth gated. Users pull JSON from ds.dash.com and write files locally."
      >
        <DocsCode
          language="text"
          code={`design   →  registry/dash/ui/button.tsx          (source TSX)
         →  registry.json item entry              (manifest)
                  │
                  │   pnpm registry:build
                  ▼
                public/r/button.json                (distribution)
                  │
                  │   GET https://ds.dash.com/r/button.json
                  │   Authorization: Bearer <token>
                  ▼
              dash add button                       (CLI on user machine)
                  │
                  ▼
              registry/dash/ui/button.tsx           (consumer copy)`}
        />
      </DocsSection>

      <DocsSection
        title="Authoring workflow"
        description="The 4-step loop every contributor runs."
      >
        <ol className="text-sm text-text-sub-600 list-decimal pl-6 space-y-2">
          <li>
            <strong className="text-text-strong-950">Design</strong> the component in Figma + write
            the TSX under <code className="text-xs">registry/dash/ui/&lt;name&gt;.tsx</code>.
          </li>
          <li>
            <strong className="text-text-strong-950">Register</strong> by appending an entry to{" "}
            <code className="text-xs">registry.json</code> with{" "}
            <code className="text-xs">name</code>, <code className="text-xs">type</code>,
            <code className="text-xs">files</code>, deps, and any{" "}
            <code className="text-xs">cssVars</code>.
          </li>
          <li>
            <strong className="text-text-strong-950">Build</strong> with{" "}
            <code className="text-xs">pnpm registry:build</code>. Output lands in{" "}
            <code className="text-xs">public/r/&lt;name&gt;.json</code>.
          </li>
          <li>
            <strong className="text-text-strong-950">Verify</strong> by running{" "}
            <code className="text-xs">dash add &lt;name&gt;</code> in a scratch consumer
            project.
          </li>
        </ol>
      </DocsSection>

      <DocsSection title="Deep dives">
        <ul className="text-sm text-text-sub-600 list-disc pl-6 space-y-1">
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/registry/registry-json">
              registry.json
            </Link>{" "}
            — manifest schema, every field
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/registry/registry-item-json">
              registry-item.json
            </Link>{" "}
            — per-item output shape
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/registry/authentication">
              Authentication
            </Link>{" "}
            — Bearer token mint + rotation
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/registry/examples">
              Examples
            </Link>{" "}
            — utility, component, theme item walkthroughs
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
