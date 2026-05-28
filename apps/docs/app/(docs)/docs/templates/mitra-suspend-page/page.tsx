"use client"

import { MitraSuspendPage } from "@/registry/dash/templates/mitra-suspend-page"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><code>ListDetailPage</code> — resizable horizontal split (35/65 default).</li>
          <li><strong>List pane</strong> — search + filter sticky toolbar, mitra rows showing miss count, tribe, region.</li>
          <li><strong>Detail pane</strong> — header (avatar + suspend status badge), flag-reason card, KPI tiles (last 7-day misses, total dispatch, accept rate), 7-day history list, action footer.</li>
          <li><code>Modal</code> — manual override flow with internal-note textarea (audit-logged).</li>
          <li><code>AlertDialog</code> — permanent-suspend confirmation with destructive tone.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
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
      <DocsSection title="Reason summary card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Suspend page leads with the violation pattern card — 3 dispatch terlewat, last 24h. Don't dump the user into a raw event log.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-warning-base bg-warning-lighter/30 p-3 space-y-1"><p className="text-xs font-medium text-warning-dark">Mitra Tono S. otomatis di-suspend</p><p className="text-[10px] text-text-sub-600">3 dispatch terlewat berturut-turut dalam 6 jam terakhir. Status: Tier-3 · Reservasi.</p></div>
            ),
            caption: "Headline pattern + count + window. Ops gets the 'why' before they get the data.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 font-mono text-[10px] space-y-0.5"><p>[14:32] dispatch_skip mitra_id=M-184 order=2841</p><p>[15:01] dispatch_skip mitra_id=M-184 order=2842</p><p>[15:38] dispatch_skip mitra_id=M-184 order=2843</p><p>[15:38] suspend mitra_id=M-184 reason=auto_3skip</p></div>
            ),
            caption: "Don't open with a raw log. Ops has to parse 4 lines to learn what the headline says directly.",
          }}
        />
      </DocsSection>

      <DocsSection title="Reversibility hint">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Suspend is reversible. Surface the un-suspend path next to the suspend confirmation — don't hide it behind 'Restore from audit log'.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-2 text-xs"><p>Mitra Tono S. di-suspend pada 15:38.</p><div className="flex gap-2"><button className="h-7 px-3 rounded-md border border-stroke-soft-200 text-[10px]">Lihat aktivitas</button><button className="h-7 px-3 rounded-md bg-primary-base text-static-white text-[10px]">Aktifkan kembali</button></div></div>
            ),
            caption: "Re-activate button sits next to the suspension state. Ops can reverse a false-positive in one click.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-2 text-xs"><p>Mitra Tono S. di-suspend pada 15:38.</p><p className="text-[10px] text-text-soft-400">Untuk aktifkan kembali, hubungi admin via Slack #ops-support.</p></div>
            ),
            caption: "Don't redirect ops to Slack to undo a suspension. The action surface should expose the inverse action.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
