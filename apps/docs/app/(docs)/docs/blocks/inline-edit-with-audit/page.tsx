"use client"

import * as React from "react"
import {
  InlineEditWithAudit,
  type InlineEditAuditPayload,
} from "@/registry/dash/blocks/inline-edit-with-audit"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function InlineEditWithAuditDocsPage() {
  // Three independent demos so each preview is self-contained.
  const [displayName, setDisplayName] = React.useState("Budi Santoso")
  const [outletPhone, setOutletPhone] = React.useState("+62 812-3456-7890")
  const [vehicleDesc, setVehicleDesc] = React.useState(
    "Honda Beat 2022, plat hitam, helm tersedia.",
  )

  // Stub onSave — in real usage the consumer writes the entity column +
  // inserts the audit row in a transaction. Throwing surfaces a toast and
  // keeps the user in edit mode.
  const makeOnSave =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    async (p: InlineEditAuditPayload) => {
      await new Promise((r) => setTimeout(r, 500))
      // eslint-disable-next-line no-console
      console.log("[audit log]", p)
      setter(p.newValue)
    }

  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Form"
        title="Inline Edit with Audit Trail"
        description="Click-to-edit single-field block. Save/cancel, optional reason, validation, char cap, custom read renderer. Audit payload mandatory at the type level — caller can't ship without wiring it."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add inline-edit-with-audit`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Mitra display name (cosmetic — no reason required)"
          description="Click the row to edit. Press Enter to save, Esc to cancel. A brief checkmark confirms persistence."
          preview={
            <div className="w-full max-w-md space-y-3">
              <div className="text-[11px] uppercase tracking-wide text-text-soft-400">
                Nama tampilan
              </div>
              <InlineEditWithAudit
                fieldName="mitra.display_name"
                fieldLabel="Nama tampilan"
                initialValue={displayName}
                editorId="00000000-0000-0000-0000-000000000001"
                onSave={makeOnSave(setDisplayName)}
                maxLength={64}
                validate={(v) =>
                  v.trim().length < 2 ? "Minimal 2 karakter." : null
                }
              />
            </div>
          }
          code={`<InlineEditWithAudit
  fieldName="mitra.display_name"
  fieldLabel="Nama tampilan"
  initialValue={mitra.displayName}
  editorId={session.user.id}
  onSave={saveAndAudit}
  maxLength={64}
  validate={(v) => v.trim().length < 2 ? "Minimal 2 karakter." : null}
/>`}
        />

        <DocsExample
          title="Outlet contact (tel + custom read renderer)"
          description="Renders as a clickable tel: link in read mode. Uses inputType=tel for mobile keypad."
          preview={
            <div className="w-full max-w-md space-y-3">
              <div className="text-[11px] uppercase tracking-wide text-text-soft-400">
                Telepon outlet
              </div>
              <InlineEditWithAudit
                fieldName="outlet.contact_phone"
                fieldLabel="Telepon outlet"
                initialValue={outletPhone}
                editorId="00000000-0000-0000-0000-000000000001"
                onSave={makeOnSave(setOutletPhone)}
                inputType="tel"
                renderRead={(v) => (
                  <a
                    href={`tel:${v.replace(/\s/g, "")}`}
                    className="text-primary-base hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {v}
                  </a>
                )}
              />
            </div>
          }
          code={`<InlineEditWithAudit
  fieldName="outlet.contact_phone"
  fieldLabel="Telepon outlet"
  initialValue={outlet.phone}
  editorId={session.user.id}
  onSave={saveAndAudit}
  inputType="tel"
  renderRead={(v) => <a href={\`tel:\${v}\`}>{v}</a>}
/>`}
        />

        <DocsExample
          title="Vehicle description (requireReason — audit-heavy)"
          description="When the field can affect dispatch/safety decisions, set requireReason. Save is disabled until reason is non-empty."
          preview={
            <div className="w-full max-w-md space-y-3">
              <div className="text-[11px] uppercase tracking-wide text-text-soft-400">
                Deskripsi kendaraan
              </div>
              <InlineEditWithAudit
                fieldName="vehicle.description"
                fieldLabel="Deskripsi kendaraan"
                initialValue={vehicleDesc}
                editorId="00000000-0000-0000-0000-000000000001"
                onSave={makeOnSave(setVehicleDesc)}
                requireReason
                maxLength={160}
              />
            </div>
          }
          code={`<InlineEditWithAudit
  fieldName="vehicle.description"
  fieldLabel="Deskripsi kendaraan"
  initialValue={vehicle.description}
  editorId={session.user.id}
  onSave={saveAndAudit}
  requireReason
  maxLength={160}
/>`}
        />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`// Caller persists + writes audit row in a transaction.
const onSave = async (p: InlineEditAuditPayload) => {
  await tx(async (q) => {
    await q.insert("t_mitra_audit_log", {
      mitra_id: mitra.id,
      field_name: p.fieldName,
      original_value: p.originalValue,
      new_value: p.newValue,
      edit_reason: p.editReason ?? null,
      editor_id: p.editorId,
      created_at: p.timestamp,
    })
    await q.update("t_mitra", { display_name: p.newValue }).where({ id: mitra.id })
  })
}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "fieldName", type: "string", description: "Stable machine name (e.g. 'mitra.display_name'). Logged to audit row." },
            { name: "fieldLabel", type: "string", description: "Visible label in edit mode + aria-label for the read row." },
            { name: "initialValue", type: "string", description: "Current persisted value. Diffed for hasMutation." },
            { name: "onSave", type: "(p: InlineEditAuditPayload) => Promise<void>", description: "Caller persists + inserts audit row. Throw to surface a toast and keep edit mode." },
            { name: "editorId", type: "string", description: "Current user UUID. Logged to audit row." },
            { name: "requireReason", type: "boolean", description: "Default false. Set true for fields with legal/dispatch/safety weight." },
            { name: "validate", type: "(v: string) => string | null", description: "Per-field validator. Return error string or null. Runs live; Save stays disabled while invalid." },
            { name: "maxLength", type: "number", description: "Optional. Renders a character counter." },
            { name: "inputType", type: '"text" | "email" | "tel" | "url"', description: "Drives mobile keyboard + browser hints. Default 'text'." },
            { name: "renderRead", type: "(v: string) => ReactNode", description: "Custom read-mode renderer (e.g. tel: / mailto: link). Default renders plain text." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <pre className="rounded-lg bg-bg-weak-50 p-4 text-xs leading-relaxed text-text-sub-600 overflow-x-auto">
{`READ MODE
┌─────────────────────────────────────────────┐
│  Budi Santoso                          ✎    │  ← row is button, hover shows ✎
└─────────────────────────────────────────────┘   ↑ tap anywhere to edit (44px min)

EDIT MODE
  Nama tampilan
  ┌────────────────────────────────┐  ┌──┐ ┌──┐
  │  Budi Santoso                  │  │ ✓│ │ ✕│
  └────────────────────────────────┘  └──┘ └──┘
                              42/64
  Alasan perubahan *                          ← only if requireReason
  ┌────────────────────────────────────────┐
  │                                        │
  └────────────────────────────────────────┘
  Wajib diisi untuk field ini.`}
        </pre>
      </DocsSection>

      <DocsSection title="Audit trail contract">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The block is FE-only — it does not persist anything. Consumer is
          responsible for the audit-write transaction. Mandatory flow per
          dash-ai-rules.md § Audit Trail (applies to ALL user-editable fields,
          not just legal/financial):
        </p>
        <ol className="mt-3 text-sm text-text-sub-600 space-y-1.5 list-decimal pl-6">
          <li>Receive <code>onSave</code> payload — fieldName + originalValue + newValue + editReason + editorId + timestamp.</li>
          <li>Insert <code>t_&lt;entity&gt;_audit_log</code> row BEFORE updating the entity column.</li>
          <li>Update the entity row's column in the same transaction.</li>
          <li>Resolve the promise — block flips to read mode + shows a brief checkmark.</li>
          <li>Throw on failure — block stays in edit mode so the user can retry without re-typing.</li>
        </ol>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> for low-risk single-field text edits: mitra display name, outlet contact, vehicle description, internal notes.</li>
          <li><strong>Use</strong> with <code>requireReason</code> for fields that affect dispatch, safety, or pricing — even if the field itself looks cosmetic.</li>
          <li><strong>Don't</strong> use for multi-field forms — wire up a proper form block instead.</li>
          <li><strong>Don't</strong> use for legal/financial values (rate cards, KYC, signatures) — those need the heavier modal-based audit blocks.</li>
          <li><strong>Don't</strong> bypass <code>onSave</code> to write the value directly. The audit row MUST land before the column update.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Do / Don't">
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Do</strong> log <code>fieldName</code> + <code>originalValue</code> + <code>newValue</code> + <code>editorId</code> in the audit row.</p>
                <p><strong>Do</strong> set <code>requireReason</code> whenever the field can be challenged by a mitra.</p>
                <p><strong>Do</strong> wrap audit insert + entity update in a single transaction.</p>
              </div>
            ),
            caption: "Audit trail is non-negotiable for any user-editable field carrying weight.",
          }}
          dont={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Don't</strong> persist <code>newValue</code> outside of <code>onSave</code>.</p>
                <p><strong>Don't</strong> wire up react-hook-form or zod for one field — useState is the canonical pattern.</p>
                <p><strong>Don't</strong> reuse this block for multi-field forms.</p>
              </div>
            ),
            caption: "External form libs are banned; multi-field forms have their own scaffold.",
          }}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Read row is <code>role="button"</code> + <code>tabIndex=0</code> with <code>Enter</code> / <code>Space</code> entering edit mode.</li>
          <li>44px minimum tap target on the read row — no hover-only affordance.</li>
          <li>Keyboard inside edit form: <kbd>Enter</kbd> saves (when valid), <kbd>Esc</kbd> cancels (with confirmation when changes pending).</li>
          <li>Errors render with <code>role="alert"</code> + <code>aria-live="polite"</code> + <code>aria-describedby</code> wired to the input.</li>
          <li>Input flips <code>aria-invalid</code> automatically when a validator returns an error.</li>
          <li>The saved-checkmark uses <code>aria-live</code> so screen readers announce the success.</li>
          <li>Voice: neutral by default. Use formal <em>Anda</em> in <code>fieldLabel</code> for mitra-facing flows.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
