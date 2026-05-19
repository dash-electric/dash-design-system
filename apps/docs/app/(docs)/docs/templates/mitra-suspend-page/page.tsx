"use client"

import { MitraSuspendPage } from "@/registry/dash/templates/mitra-suspend-page"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MitraSuspendPageDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Custom"
        title="Mitra Suspend Page"
        description="Halo-dash Ops master/detail untuk flagged mitra. Composes ListDetailPage + Modal (manual override) + AlertDialog (suspend permanen). Aligns 1:1 with PRD Auto Suspend Mitra (3-miss-per-day rule)."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add mitra-suspend-page`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="5 flagged mitra · Trump-2 era"
          description="Default render with mtr-4421 (Andi W., Tangerang, 3 misses) selected. Destructive actions wired to AlertDialog confirmation."
          preview={
            <DocsTemplatePreview>
              <MitraSuspendPage />
            </DocsTemplatePreview>
          }
          code={`<MitraSuspendPage
  mitras={[/* FlaggedMitra[] */]}
  defaultSelected="mtr-4421"
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="A vertical product surface composed from generic primitives — proves the @dash kit can express Dash-specific PRDs."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>ListDetailPage</code> — resizable horizontal split (35/65 default).</li>
          <li><strong>List pane</strong> — search + filter sticky toolbar, mitra rows showing miss count, tribe, region.</li>
          <li><strong>Detail pane</strong> — header (avatar + suspend status badge), flag-reason card, KPI tiles (last 7-day misses, total dispatch, accept rate), 7-day history list, action footer.</li>
          <li><code>Modal</code> — manual override flow with internal-note textarea (audit-logged).</li>
          <li><code>AlertDialog</code> — permanent-suspend confirmation with destructive tone.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> as-is for the Auto Suspend Mitra screen in Halo-dash.</li>
          <li><strong>Use</strong> as a reference for any rule-driven flag-and-act workflow (fraud review, fee dispute, KYC challenge).</li>
          <li><strong>Use</strong> when the audit trail matters — the action footer is designed to record reason + reviewer.</li>
          <li><strong>Don't</strong> use for routine mitra browsing — that's <code>ListDetailPage</code> with a softer detail pane.</li>
          <li><strong>Don't</strong> use for bulk operations — destructive flows belong to single-target review, not bulk.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "mitras", type: "FlaggedMitra[]", description: "{ id, name, tribe, region, missCount, flagReason, flaggedAt, lastDispatch }." },
            { name: "defaultSelected", type: "string", description: "Mitra id selected on first render." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
