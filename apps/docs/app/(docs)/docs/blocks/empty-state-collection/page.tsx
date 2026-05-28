"use client"

import { EmptyStateCollection } from "@/registry/dash/blocks/empty-state-collection"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Each state uses an <code>EmptyState</code> primitive: icon + heading + description + optional CTA.</li>
          <li>Covers: zero results, no mitra in tribe, no flagged suspensions, search miss, broken filter, first-time-empty.</li>
          <li>Copy is Dash-domain — "Belum ada dispatch hari ini", "Tribe-Express kosong di region ini".</li>
          <li>Pull individual variants by copying the JSX you want into your own route.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
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
      <DocsSection title="Action-oriented empty state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Every empty state should propose a next step. Don't show a sad illustration with no path forward.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-3 text-center p-4">
                <div className="size-12 rounded-full bg-primary-alpha-16 mx-auto flex items-center justify-center text-base text-primary-base">+</div>
                <p className="text-sm font-medium">Belum ada mitra di tim ini</p>
                <p className="text-xs text-text-sub-600">Undang Tono, Sari, atau import dari CSV.</p>
                <div className="flex gap-2 justify-center"><button className="h-7 px-3 rounded-md bg-primary-base text-static-white text-[10px] font-medium">Undang mitra</button><button className="h-7 px-3 rounded-md border border-stroke-soft-200 text-[10px]">Import CSV</button></div>
              </div>
            ),
            caption: "Headline names the absence, body suggests two specific actions, and primary + secondary CTA close the loop.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-3 text-center p-4">
                <div className="text-3xl">😞</div>
                <p className="text-sm font-medium">No data</p>
                <p className="text-xs text-text-sub-600">There's nothing here yet.</p>
              </div>
            ),
            caption: "Don't apologize at the user. A sad emoji + 'no data' leaves them stuck wondering what they did wrong.",
          }}
        />
      </DocsSection>

      <DocsSection title="Tone calibration">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Empty state for a new feature = optimistic, here-to-help. Empty state for filtered search-no-results = neutral, helpful, retain context.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2 text-center p-4">
                <p className="text-sm font-medium">Tidak ada order yang cocok</p>
                <p className="text-xs text-text-sub-600">Filter <strong>status: Gagal</strong> di tanggal <strong>20 Mei</strong> kosong. Coba reset filter.</p>
                <button className="h-7 px-3 rounded-md border border-stroke-soft-200 text-[10px]">Reset filter</button>
              </div>
            ),
            caption: "Tells the user exactly which filters yielded nothing and offers a one-click escape. Retains their work.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2 text-center p-4">
                <p className="text-sm font-medium">Welcome!</p>
                <p className="text-xs text-text-sub-600">Get started by creating something amazing! 🎉</p>
              </div>
            ),
            caption: "Don't use 'Welcome!' tone for filtered-no-results. The user already knows the product — they want their filter back.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
