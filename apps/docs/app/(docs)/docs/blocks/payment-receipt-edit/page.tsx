"use client"

import * as React from "react"
import {
  PaymentReceiptEdit,
  type PaymentReceiptEditPayload,
  type PaymentReceiptEditResult,
} from "@/registry/dash/blocks/payment-receipt-edit"
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

const STUB_APPROVERS = [
  { id: "fm-001", name: "Aditya Brahmana (FM Jakarta Selatan)" },
  { id: "fm-002", name: "Sigit Prasetyo (FM Jakarta Pusat)" },
  { id: "fm-003", name: "Maya Dewanti (FM Bandung)" },
]

export default function PaymentReceiptEditDocsPage() {
  const [open, setOpen] = React.useState(false)

  // Stub onSave — in real usage consumer inserts t_payment_audit_log row +
  // updates t_payment.amount_cents in a transaction, returns audit_id.
  const onSave = async (
    p: PaymentReceiptEditPayload,
  ): Promise<PaymentReceiptEditResult> => {
    await new Promise((r) => setTimeout(r, 600))
    // eslint-disable-next-line no-console
    console.log("[payment-receipt-edit:onSave]", p)
    return { auditId: `pay_audit_${Date.now()}` }
  }

  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Form"
        title="Payment Receipt Edit"
        description="Edit payment amount on an existing receipt/transaction with mandatory audit + Fleet Manager approver gate above threshold. IDR-cents internally, formatted-as-you-type input."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add payment-receipt-edit`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Edit nominal — transfer Rp 1.250.000"
          description="Click the trigger to open the editor. Try changing the amount by more than Rp 500.000 to see the approver gate fire. Confirm modal shows side-by-side before/after."
          preview={
            <div className="flex items-center justify-center w-full p-4">
              <Button
                type="button"
                tone="primary"
                style="filled"
                onClick={() => setOpen(true)}
              >
                Buka editor
              </Button>
              {open ? (
                <PaymentReceiptEdit
                  receiptId="RCP-2026-05-20-0142"
                  currentAmount={1_250_000 * 100}
                  currentNote=""
                  paymentMethod="transfer"
                  editorId="00000000-0000-0000-0000-000000000001"
                  onSave={onSave}
                  onCancel={() => setOpen(false)}
                  approvers={STUB_APPROVERS}
                />
              ) : null}
            </div>
          }
          code={`<PaymentReceiptEdit
  receiptId={receipt.id}
  currentAmount={receipt.amountCents}
  currentNote={receipt.note}
  paymentMethod={receipt.method}
  editorId={session.user.id}
  approvers={fleetManagers}
  onSave={updateAndAudit}
  onCancel={() => setOpen(false)}
/>`}
        />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`// 3-line PE-friendly snippet
const [open, setOpen] = useState(false)
return open ? (
  <PaymentReceiptEdit
    receiptId={r.id}
    currentAmount={r.amountCents}
    paymentMethod={r.method}
    editorId={uid}
    approvers={fleetManagers}
    onSave={save}
    onCancel={() => setOpen(false)}
  />
) : null`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "receiptId",
              type: "string",
              description:
                "Receipt / transaction ID. Echoed back in the audit row.",
            },
            {
              name: "currentAmount",
              type: "number",
              description:
                "Current amount IN IDR CENTS (1 IDR = 100 cents). Display: divided by 100, formatted id-ID.",
            },
            {
              name: "currentNote",
              type: "string?",
              description:
                "Optional pre-existing free-text note. Pre-fills the detail textarea.",
            },
            {
              name: "paymentMethod",
              type: '"cash" | "transfer" | "qris" | "ewallet"',
              description:
                "Payment rail. Drives the badge color + label in the header card.",
            },
            {
              name: "onSave",
              type: "(p: PaymentReceiptEditPayload) => Promise<{ auditId: string }>",
              description:
                "Caller persists the edit + audit row in a transaction and returns the new audit_id. Block toasts the audit_id on success.",
            },
            {
              name: "onCancel",
              type: "() => void",
              description:
                "Close the modal. Confirmation prompt fires automatically when there are unsaved changes.",
            },
            {
              name: "editorId",
              type: "string",
              description:
                "Current user UUID. Logged to the audit row.",
            },
            {
              name: "requiresApprovalThreshold",
              type: "number",
              description:
                "Abs(newAmount − currentAmount) > threshold forces Fleet Manager approval. Default: 50_000_000 cents (Rp 500.000).",
            },
            {
              name: "approvers",
              type: "{ id: string; name: string }[]",
              description:
                "Approver list. Required when diff > threshold; ignored otherwise.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <pre className="rounded-lg bg-bg-weak-50 p-4 text-xs leading-relaxed text-text-sub-600 overflow-x-auto">
{`┌───────────────────────────────────────────────┐
│  Edit nominal receipt                          │  ← ModalHeader
│  Perubahan akan dicatat di audit log...        │
├───────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐  │
│  │  Nominal sekarang     [💳 Transfer]     │  │  ← Current amount +
│  │  Rp 1.250.000                            │  │     payment-method Badge
│  │  RCP-2026-05-20-0142                     │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  Nominal baru *                                │
│  ┌─────────────────────────────────────────┐  │
│  │ Rp │ 750.000                            │  │  ← Formatted-as-you-type
│  └─────────────────────────────────────────┘  │
│                                                │
│  ⚠ Selisih −Rp 500.001 — perlu approval FM    │  ← Threshold banner
│                                                │
│  Alasan perubahan *                            │
│  [Refund parsial ▾]                            │
│                                                │
│  Detail *                                      │
│  [                                       ]     │  ← min 20 char
│  20/20                                         │
│                                                │
│  Approver Fleet Manager *                      │  ← only when over
│  [Aditya Brahmana (FM Jaksel) ▾]              │     threshold
├───────────────────────────────────────────────┤
│        [Batal]      [✓ Lanjut review]         │
└───────────────────────────────────────────────┘

    → Confirm modal opens with before/after side-by-side
      + reason/detail/approver summary + audit warning.`}
        </pre>
      </DocsSection>

      <DocsSection title="Audit trail contract">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The block is FE-only — it does not persist anything. Consumer is
          responsible for the audit-write transaction. Mandatory flow per
          dash-ai-rules.md § Audit Trail:
        </p>
        <ol className="mt-3 text-sm text-text-sub-600 space-y-1.5 list-decimal pl-5">
          <li>
            Receive <code>onSave</code> payload — receiptId, originalAmount,
            newAmount, editReason, note, editorId, timestamp, approverId.
          </li>
          <li>
            Insert <code>t_payment_audit_log</code> row BEFORE updating the
            payment row — in a transaction.
          </li>
          <li>
            Update <code>t_payment.amount_cents</code> on the receipt row.
          </li>
          <li>
            When <code>approverId</code> is set, also insert the approval row
            (<code>t_payment_approval</code>) referencing the audit row.
          </li>
          <li>
            Return <code>{`{ auditId }`}</code> so the block can toast the new
            audit ID for ops traceability.
          </li>
        </ol>
      </DocsSection>

      <DocsSection title="Approval gate UX">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The approval gate is INLINE, not modal-on-modal. As the user types,
          the diff banner updates live; once <code>|new − current| &gt; threshold</code>
          {" "}the approver dropdown appears and becomes required. This keeps
          the consequence visible during input rather than ambushing the user
          at submit-time.
        </p>
        <ul className="mt-3 text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>
            Default threshold: <strong>Rp 500.000</strong> (50_000_000 cents).
            Override per-tribe via <code>requiresApprovalThreshold</code>.
          </li>
          <li>
            <strong>Direction-agnostic</strong>: uses <code>Math.abs(diff)</code>.
            A −Rp 600.000 refund triggers the gate the same as a +Rp 600.000
            top-up.
          </li>
          <li>
            If the approver list is empty, the dropdown still renders with a
            warning hint ("Hubungi admin"). The submit is blocked by the
            empty-value validator.
          </li>
          <li>
            The confirm modal includes the approver name in the summary so
            ops can sanity-check before audit-write.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Use</strong> for any backoffice/ops correction to a payment
            receipt amount — refund parsial, salah input, penyesuaian.
          </li>
          <li>
            <strong>Use</strong> as the canonical reference for any
            financial-field edit pattern (the audit + approver shape is the
            template).
          </li>
          <li>
            <strong>Don&apos;t</strong> use to CREATE a new payment — this is
            edit-only. Creation lives in the receipt-entry scaffold.
          </li>
          <li>
            <strong>Don&apos;t</strong> bypass <code>onSave</code> to mutate
            the amount directly. The audit row MUST land in the same
            transaction.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Do / Don't">
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p>
                  <strong>Do</strong> pass amounts in IDR <em>cents</em>.
                  100-IDR-per-cent — 1.250.000 IDR = 125_000_000.
                </p>
                <p>
                  <strong>Do</strong> wrap audit-insert + amount-update in a
                  DB transaction.
                </p>
                <p>
                  <strong>Do</strong> require Fleet Manager approval for any
                  diff &gt; Rp 500.000 (default).
                </p>
              </div>
            ),
            caption:
              "Audit + approver gate are non-negotiable for finance fields.",
          }}
          dont={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p>
                  <strong>Don&apos;t</strong> pass amounts in rupiah (float).
                  Use cents to avoid drift.
                </p>
                <p>
                  <strong>Don&apos;t</strong> skip the detail field — &lt;20
                  char fails reconciliation later.
                </p>
                <p>
                  <strong>Don&apos;t</strong> raise the threshold above Rp 1jt
                  without finance-lead sign-off.
                </p>
              </div>
            ),
            caption:
              "Reconciliation requires a complete, unambiguous audit chain.",
          }}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>
            All required inputs marked with <code>*</code> in the label and{" "}
            <code>aria-invalid</code> on error.
          </li>
          <li>
            Error messages associated via <code>aria-describedby</code>.
          </li>
          <li>
            Threshold warning banner is <code>role=&quot;alert&quot;</code> so
            screen readers announce it the moment it appears.
          </li>
          <li>
            Numeric input uses <code>inputMode=&quot;numeric&quot;</code> for
            mobile keypads.
          </li>
          <li>
            Voice: neutral Indonesian (staff/ops UI — not mitra-facing). No
            slang, no softener.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
