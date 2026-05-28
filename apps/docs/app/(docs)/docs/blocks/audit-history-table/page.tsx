"use client"

import {
  AuditHistoryTable,
  type AuditEntry,
} from "@/registry/dash/blocks/audit-history-table"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

// Demo data — Tribe-Express dispatch audit trail. Mirrors a realistic
// `t_dispatch_audit_log` payload.
const DEMO_ENTRIES: AuditEntry[] = [
  {
    id: "aud-1042",
    fieldName: "pickup_proof_url",
    originalValue: "https://cdn.dash.id/proof/orig/dsp-9412-pickup.jpg",
    editedValue: "https://cdn.dash.id/proof/edit/dsp-9412-pickup-v2.jpg",
    editorId: "u-9281",
    editorName: "Wei Chen",
    editedAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    editReason:
      "Foto awal blur dan tidak menunjukkan nomor unit kendaraan. Mitra mengirim ulang foto yang sesuai dengan SOP pickup.",
    ipHash: "a3f9b2c1d8e4f6a7b9c2d3e1f4a5b6c7",
  },
  {
    id: "aud-1041",
    fieldName: "payment_amount",
    originalValue: "Rp 1.240.000",
    editedValue: "Rp 1.180.000",
    editorId: "u-7012",
    editorName: "Maya Damayanti",
    editedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    editReason:
      "Penyesuaian biaya tol akhir setelah verifikasi e-toll log — selisih Rp 60.000.",
  },
  {
    id: "aud-1040",
    fieldName: "mitra_status",
    originalValue: "active",
    editedValue: "suspended",
    editorId: "u-3145",
    editorName: "Reza Tamara",
    editedAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    editReason: "Mitra menolak 3 dispatch dalam 24 jam (auto-suspend rule).",
  },
  {
    id: "aud-1039",
    fieldName: "kyc_document_url",
    originalValue: "https://cdn.dash.id/kyc/orig/mtr-4421-ktp.pdf",
    editedValue: "https://cdn.dash.id/kyc/edit/mtr-4421-ktp-v3.pdf",
    editorId: "u-5512",
    editedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    editReason: "KTP versi sebelumnya buram pada bagian NIK.",
  },
  {
    id: "aud-1038",
    fieldName: "signature_blob",
    originalValue: "data:image/png;base64,iVBORw0KGgo...AB1",
    editedValue: "data:image/png;base64,iVBORw0KGgo...XYZ",
    editorId: "u-9281",
    editorName: "Wei Chen",
    editedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    editReason: "Tanda tangan customer ulang setelah dispute COD.",
  },
  {
    id: "aud-1037",
    fieldName: "payment_amount",
    originalValue: "Rp 285.000",
    editedValue: "Rp 320.000",
    editorId: "u-7012",
    editorName: "Maya Damayanti",
    editedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    editReason: "Tambahan biaya waiting time 30 menit di lokasi pickup.",
  },
]

const FIELD_LABELS: Record<string, string> = {
  pickup_proof_url: "Bukti pickup",
  payment_amount: "Nilai pembayaran",
  mitra_status: "Status mitra",
  kyc_document_url: "Dokumen KYC",
  signature_blob: "Tanda tangan",
}

function renderValue(fieldName: string, value: string) {
  if (fieldName.endsWith("_url") && /^https?:\/\//.test(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-2 text-primary-base hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="inline-block size-8 rounded border border-stroke-soft-200 bg-bg-weak-50 shrink-0" />
        <span className="truncate max-w-[140px] font-mono text-xs">
          {value.split("/").pop()}
        </span>
      </a>
    )
  }
  if (fieldName === "signature_blob") {
    return (
      <span className="font-mono text-xs text-text-sub-600 break-all">
        {value.slice(0, 24)}…
      </span>
    )
  }
  return null
}

export default function AuditHistoryTableDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Tables"
        kind="composite"
        status="beta"
        title="Audit History Table"
        description="Render edit history for any user-editable legal/financial field. Sortable headers, editor + field filters, paginated, click-row to expand. Per Dash audit-trail rule, every entity with mitra-disputable fields MUST surface its t_<entity>_audit_log via this block."
      />

      <DocsSection title="Install">
        <DocsCode
          language="bash"
          code={`dash add audit-history-table`}
        />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Dispatch DSP-9412 — edit history"
          description="Realistic Tribe-Express audit trail. Click any row to expand full before/after values + editor metadata."
          preview={
            <div className="w-full">
              <AuditHistoryTable
                entries={DEMO_ENTRIES}
                fieldLabels={FIELD_LABELS}
                renderValue={renderValue}
              />
            </div>
          }
          code={`<AuditHistoryTable
  entries={auditEntries}
  fieldLabels={{
    pickup_proof_url: "Bukti pickup",
    payment_amount: "Nilai pembayaran",
  }}
  renderValue={(field, value) => {
    if (field.endsWith("_url")) return <ProofThumbnail url={value} />
    return null
  }}
  editorLookup={async (id) => fetchUserName(id)}
/>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            Filter bar — search (editor name, 350ms debounce) + field
            multi-select (auto-hides when only one field present) + date range
            + result counter.
          </li>
          <li>
            Header row — sortable columns (Field, Editor, Edited) with{" "}
            <code>aria-sort</code>; non-sortable cells (Before / After /
            Reason).
          </li>
          <li>
            Body row — field <code>Badge</code> · before <code>Cell</code> ·
            after <code>Cell</code> · editor <code>Avatar</code> + name (with
            skeleton during async lookup) · truncated reason (tooltip on
            hover) · relative time (tooltip = absolute).
          </li>
          <li>
            Expanded row — full before/after blocks + complete reason +
            editor id + absolute timestamp + truncated IP hash.
          </li>
          <li>Pagination — page numbers + prev/next when entries exceed page size.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            <strong>Use</strong> on any entity that mutates legal/financial
            fields — proof images (POD/POP), payment amounts, signatures,
            KYC docs, mitra status, driver approval ladder.
          </li>
          <li>
            <strong>Use</strong> as the "Edit history" tab inside a dispatch
            detail panel, payout detail page, or mitra profile.
          </li>
          <li>
            <strong>Don't</strong> use for narrative event streams (logins,
            page views) — reach for <code>ActivityTimeline</code>.
          </li>
          <li>
            <strong>Don't</strong> use mitra-facing as-is — voice is
            staff-neutral. Compose a stripped variant if the mitra needs to
            see their own edits.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "entries",
              type: "AuditEntry[]",
              description:
                "Audit rows. Each entry must carry id, fieldName, originalValue, editedValue, editorId, editedAt (ISO), editReason (non-empty per BE contract).",
            },
            {
              name: "fieldLabels",
              type: "Record<string, string>",
              description:
                "Optional. Maps raw fieldName → human-readable label. Fallback humanizes snake_case → Title Case.",
            },
            {
              name: "renderValue",
              type: "(fieldName, value) => ReactNode",
              description:
                "Optional. Renders custom previews per value (image thumbnail for URLs, formatted money, etc). Return null to use the default mono-font fallback.",
            },
            {
              name: "editorLookup",
              type: "(editorId) => Promise<string>",
              description:
                "Optional. Async resolver for editor names when only editorId is on the entry. Loading + cache handled internally.",
            },
            {
              name: "emptyMessage",
              type: "string",
              description:
                'Optional. Overrides the "Belum ada riwayat edit." default.',
            },
            {
              name: "pageSize",
              type: "number",
              description: "Page size. Defaults to 10.",
            },
            {
              name: "className",
              type: "string",
              description: "Outer wrapper class.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import {
  AuditHistoryTable,
  type AuditEntry,
} from "@/registry/dash/blocks/audit-history-table"

const entries: AuditEntry[] = await api.get(
  \`/dispatches/\${id}/audit-log\`,
)

return (
  <AuditHistoryTable
    entries={entries}
    fieldLabels={{
      pickup_proof_url: "Bukti pickup",
      payment_amount: "Nilai pembayaran",
      mitra_status: "Status mitra",
    }}
    renderValue={(field, value) => {
      if (field === "payment_amount") {
        return <span className="font-medium">{formatIDR(value)}</span>
      }
      if (field.endsWith("_url")) {
        return <ProofThumbnail url={value} />
      }
      return null
    }}
    editorLookup={async (id) => {
      const { data } = await api.get(\`/users/\${id}\`)
      return data.fullName
    }}
  />
)`}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            Sortable headers expose <code>aria-sort</code> with{" "}
            <code>ascending</code> / <code>descending</code> / <code>none</code>.
          </li>
          <li>
            Expand toggle exposes <code>aria-expanded</code> and an
            <code> aria-label</code> that swaps between &quot;Buka detail&quot;
            and &quot;Tutup detail&quot;.
          </li>
          <li>
            Pagination buttons are keyboard-reachable; current page sets{" "}
            <code>aria-current=&quot;page&quot;</code>.
          </li>
          <li>
            Relative time renders inside a <code>&lt;time&gt;</code> element
            with <code>dateTime</code> set to the ISO; tooltip surfaces the
            absolute form for low-vision users.
          </li>
          <li>Editor avatar fallback initials are computed from the resolved name; the editorId is exposed in the expanded row for screen-reader users to read fully.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Empty state placement">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          When the entity has never been edited, render the empty state
          inline (matches the table footprint). Don&apos;t replace the whole
          panel — the audit tab still needs to look reachable to staff.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-10 text-center">
                <p className="text-sm text-text-sub-600">
                  Belum ada riwayat edit.
                </p>
              </div>
            ),
            caption:
              "Empty state keeps the bordered card shape and the same surface as the populated table.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md text-sm text-text-soft-400 italic">
                — no audit log —
              </div>
            ),
            caption:
              "Don't collapse to a bare line. Staff cannot tell whether the audit feature is broken or the entity is genuinely clean.",
          }}
        />
      </DocsSection>

      <DocsSection title="Reason truncation">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Truncate the reason at 60 characters with a tooltip for the full
          string; the expanded row shows the full reason without
          truncation. Don&apos;t silently drop content.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <span className="text-xs text-text-sub-600">
                Foto awal blur dan tidak menunjukkan nomor unit kendar...
              </span>
            ),
            caption:
              "Truncation at 60ch with dotted underline + tooltip on hover, full reason visible after row-expand.",
          }}
          dont={{
            preview: (
              <span className="text-xs text-text-sub-600">
                Foto awal blur.
              </span>
            ),
            caption:
              "Don't hard-cut the reason at the API layer — auditors lose the full justification trail.",
          }}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
