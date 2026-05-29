"use client"

import * as React from "react"
import { SpinnerLoader } from "@/registry/dash/ui/spinner-loader"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * SpinnerLoader — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/loader/SpinnerLoader.tsx
 *
 * Page-level overlay spinner — 8 dots rotating around a centre point with a
 * staggered opacity fade. Differs from the inline `Spinner` primitive: this one
 * owns its own backdrop and is meant for full-screen route-transition / suspense
 * boundaries where you want something a touch richer than a single ring.
 */

export default function SpinnerLoaderDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Loaders"
        title="Spinner Loader"
        description="Page-level overlay spinner — 8 dots, staggered fade, on a solid backdrop. For route transitions and suspense fallbacks. For inline use, prefer the bare Spinner primitive."
        status="beta"
        kind="specialized"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add spinner-loader`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`{routeLoading && <SpinnerLoader />}`}
        />
      </DocsSection>

      <DocsSection title="Live (inline)">
        <DocsExample
          title="Inline preview"
          preview={<SpinnerLoader inline />}
          code={`<SpinnerLoader inline />`}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Route transitions where Skeleton would be too aggressive.</li>
          <li>Suspense fallbacks above the fold.</li>
          <li>Server actions that should block the entire page.</li>
          <li>For button loading state — use <code>Button loading</code> prop.</li>
          <li>For inline content — use <code>Spinner</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "inline", type: "boolean", defaultValue: "false", description: "Renders in a sized container instead of fixed-inset. For tests/docs." },
            { name: "className", type: "string", description: "Forwarded to the outer wrapper — useful for overriding the backdrop colour." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
