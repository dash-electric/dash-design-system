"use client"

import * as React from "react"
import {
  MitraDisputeFlow,
  type DisputeEvidence,
} from "@/registry/dash/blocks/mitra-dispute-flow"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const PREVIEW_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
      <rect width='400' height='300' fill='#1f1133'/>
      <text x='200' y='150' fill='#fff' font-family='Inter, sans-serif' font-size='20' text-anchor='middle' dy='.3em'>POD Sample</text>
    </svg>`,
  )

const SAMPLE_EVIDENCE: DisputeEvidence[] = [
  {
    type: "image",
    label: "Bukti pengambilan",
    value: PREVIEW_IMG,
    timestamp: "2026-05-20T07:32:00+07:00",
  },
  {
    type: "image",
    label: "Bukti pengantaran",
    value: PREVIEW_IMG,
    timestamp: "2026-05-20T08:14:00+07:00",
  },
  {
    type: "amount",
    label: "Jumlah pembayaran tercatat",
    value: "47500",
    timestamp: "2026-05-20T08:18:00+07:00",
  },
  {
    type: "text",
    label: "Catatan dispatcher",
    value: "Mitra menyampaikan paket diterima resepsionis pukul 08:14. Bukti foto dilampirkan.",
    timestamp: "2026-05-20T08:20:00+07:00",
  },
]

export default function MitraDisputeFlowDocsPage() {
  const [open, setOpen] = React.useState(false)

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    return { disputeId: "DSP-2026-05-20-0001" }
  }

  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Composite"
        title="Mitra Dispute Flow"
        description="Mitra (driver) dispute submission flow. Bundles evidence display + reason picker + free-text detail + supervisor escalation + confirm-modal + audit-trail payload."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add mitra-dispute-flow`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Ajukan keberatan pengantaran"
          description="Click the trigger to open. Pick a reason, type ≥20 characters of detail, optionally request supervisor escalation, then submit. The Preview stub resolves with a fake dispute ID."
          preview={
            <div className="flex items-center justify-center w-full p-4">
              <Button type="button" tone="primary" style="filled" onClick={() => setOpen(true)}>
                Ajukan keberatan
              </Button>
              {open ? (
                <MitraDisputeFlow
                  caseId="DLV-2026-05-20-1842"
                  caseType="delivery"
                  evidence={SAMPLE_EVIDENCE}
                  mitraId="00000000-0000-0000-0000-000000000001"
                  onSubmit={onSubmit}
                  onCancel={() => setOpen(false)}
                />
              ) : null}
            </div>
          }
          code={`<MitraDisputeFlow
  caseId={delivery.id}
  caseType="delivery"
  evidence={evidence}
  mitraId={session.user.id}
  onSubmit={submitDisputeAndAudit}
  onCancel={() => setOpen(false)}
/>`}
        />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`// Developer-friendly snippet — consumer owns the audit-row write inside onSubmit
const [open, setOpen] = useState(false)
return open ? (
  <MitraDisputeFlow
    caseId={delivery.id}
    caseType="delivery"
    evidence={evidence}
    mitraId={mitra.id}
    onSubmit={async (payload) => {
      // 1. Insert t_disputes_audit_log row
      // 2. Trigger escalation routing if payload.requestEscalation
      const { id } = await api.post('/disputes', payload)
      return { disputeId: id }
    }}
    onCancel={() => setOpen(false)}
  />
) : null`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "caseId", type: "string", description: "Delivery/payment/maintenance/suspension id under dispute. Echoed back in the audit payload + success view." },
            { name: "caseType", type: '"delivery" | "payment" | "suspension" | "maintenance"', description: "Drives modal title + case badge label." },
            { name: "evidence", type: "DisputeEvidence[]", description: "Evidence rows. Image rows open inline zoom; amount rows render as IDR currency; text rows render multiline." },
            { name: "mitraId", type: "string", description: "Mitra UUID. Logged to audit row + rendered sr-only for screen-reader audit context." },
            { name: "onSubmit", type: "(payload) => Promise<{ disputeId: string }>", description: "Caller logs to t_disputes_audit_log + triggers escalation routing inside this resolver. Block toasts on resolve/reject. Block does NOT persist anything." },
            { name: "onCancel", type: "() => void", description: "Close the modal. Confirmation prompt fires automatically when the form is dirty." },
            { name: "reasonOptions", type: "DisputeReason[]", description: "Override the 5-option default dropdown. Labels are formal Indonesian." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <pre className="rounded-lg bg-bg-weak-50 p-4 text-xs leading-relaxed text-text-sub-600 overflow-x-auto">
{`┌─────────────────────────────────────────────┐
│ ⚠  Ajukan keberatan pengantaran             │  ← ModalHeader (warning icon)
│ Mohon tinjau bukti yang tercatat...         │
├─────────────────────────────────────────────┤
│ [Pengantaran] · Kasus #DLV-...               │  ← case meta
│                                              │
│ Bukti tercatat                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 🖼  Bukti pengambilan      07:32 WIB     │ │  ← image (zoom on click)
│ │ 🖼  Bukti pengantaran      08:14 WIB     │ │
│ │ 💲 Jumlah pembayaran    Rp 47.500       │ │  ← amount (IDR)
│ │ 📄 Catatan dispatcher  "Mitra ..."      │ │  ← text
│ └─────────────────────────────────────────┘ │
│                                              │
│ Alasan keberatan * [ Foto bukti tidak... ▾] │
│ Penjelasan keberatan * [ textarea ]         │
│ ☑ Minta escalation ke supervisor            │
├─────────────────────────────────────────────┤
│           [Batal]      [Lanjutkan]          │
└─────────────────────────────────────────────┘
                  ▼
          [Confirm view: "Apakah Anda yakin..."]
                  ▼
          [Success view: dispute ID + 1×24h notice]`}
        </pre>
      </DocsSection>

      <DocsSection title="Audit trail contract">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The block is FE-only. The consumer's <code>onSubmit</code> MUST persist
          the full payload to <code>t_disputes_audit_log</code> per
          dash-ai-rules.md § Audit Trail:
        </p>
        <ol className="mt-3 text-sm text-text-sub-600 space-y-1.5 list-decimal pl-5">
          <li>Receive the payload: <code>caseId</code> + <code>caseType</code> + <code>mitraId</code> + <code>reason</code> + <code>detail</code> + <code>requestEscalation</code> + <code>timestamp</code>.</li>
          <li>Insert a row in <code>t_disputes_audit_log</code> with the full payload (the snapshot of evidence URLs at submission time is the caller's responsibility — pass <code>evidence</code> through if you need it logged).</li>
          <li>Generate a dispute ticket id (e.g. <code>DSP-YYYY-MM-DD-####</code>) and return it as <code>{`{ disputeId }`}</code>.</li>
          <li>If <code>requestEscalation</code> is true, route to the supervisor queue; otherwise the standard tribe-ops queue.</li>
          <li>Notify the mitra via in-app + WhatsApp/SMS that follow-up will occur within 1×24h (the modal also displays this).</li>
        </ol>
      </DocsSection>

      <DocsSection title="Mitra voice samples (formal Anda)">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>"Apakah Anda yakin ingin mengajukan keberatan?"</li>
          <li>"Mohon jelaskan keberatan Anda secara spesifik."</li>
          <li>"Keberatan Anda berhasil dikirim."</li>
          <li>"Tim kami akan menindaklanjuti dalam 1×24 jam."</li>
          <li>"Mohon simpan nomor tiket di bawah untuk referensi Anda."</li>
        </ul>
        <p className="mt-2 text-xs text-text-soft-400">
          Per <code>feedback_dash_mobile_voice_formal</code>: no "kamu/yaa/lewatin/bakal" softeners. Dignified, formal-functional.
        </p>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for any mitra-initiated dispute against a recorded event: delivery proof, payment amount, suspension trigger, or maintenance charge.</li>
          <li><strong>Use</strong> as the canonical reference — tribes should not roll their own dispute form.</li>
          <li><strong>Don't</strong> use for backoffice-initiated investigations (different flow — internal audit, not mitra-facing).</li>
          <li><strong>Don't</strong> bypass <code>onSubmit</code>. The audit row MUST land before the dispute is considered submitted.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Do / Don't">
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Do</strong> log the full payload to <code>t_disputes_audit_log</code> in a transaction.</p>
                <p><strong>Do</strong> preserve evidence URLs as a snapshot at submit time.</p>
                <p><strong>Do</strong> route escalation requests to the supervisor queue, not the general queue.</p>
              </div>
            ),
            caption: "Audit trail is non-negotiable for legal-sensitive mitra disputes.",
          }}
          dont={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Don't</strong> swap formal "Anda" for casual "kamu" — this is mitra-facing.</p>
                <p><strong>Don't</strong> resolve <code>onSubmit</code> without inserting the audit row.</p>
                <p><strong>Don't</strong> add <code>react-hook-form</code> / <code>zod</code> — banned.</p>
              </div>
            ),
            caption: "Voice + audit + stack policy all converge here.",
          }}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Two-step submit (form → confirm) prevents accidental dispute submission.</li>
          <li>Image evidence opens in <code>role="dialog"</code> with click-to-dismiss.</li>
          <li>Errors surface inline with <code>aria-invalid</code> on the reason trigger + textarea.</li>
          <li>Character counter on the detail textarea announces over/under min limit.</li>
          <li>Modal dismiss prompts confirmation when the form is dirty.</li>
          <li>All copy formal "Anda" — never casual "kamu". Per Dash voice rule.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
