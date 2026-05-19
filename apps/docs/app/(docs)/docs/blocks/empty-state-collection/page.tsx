"use client"

import { EmptyStateCollection } from "@/registry/dash/blocks/empty-state-collection"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function EmptyStateCollectionDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Feedback"
        title="Empty State Collection"
        description="Reference gallery of Dash empty states — no dispatch, no mitra, no flagged accounts, search no-results. Use as a starting palette; copy whichever pattern matches your route."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add empty-state-collection`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="All Dash empty patterns"
          description="Each card is a self-contained empty state — visual + headline + body + CTA."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <EmptyStateCollection />
            </div>
          }
          code={`<EmptyStateCollection />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Each state uses an <code>EmptyState</code> primitive: icon + heading + description + optional CTA.</li>
          <li>Covers: zero results, no mitra in tribe, no flagged suspensions, search miss, broken filter, first-time-empty.</li>
          <li>Copy is Dash-domain — "Belum ada dispatch hari ini", "Tribe-Express kosong di region ini".</li>
          <li>Pull individual variants by copying the JSX you want into your own route.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> as a palette during design — pick the closest pattern, adapt copy.</li>
          <li><strong>Use</strong> when you need a Dash-flavored empty state that matches existing tone.</li>
          <li><strong>Don't</strong> render the whole collection in production — only copy the variants you need.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
