"use client"

import * as React from "react"
import {
  IncidentFormWithAttach,
  type IncidentFormPayload,
} from "@/registry/dash/blocks/incident-form-with-attach"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

// Deterministic stubs — the preview must work offline without a backend.
const fakeUpload = (file: File): Promise<{ url: string }> =>
  new Promise((resolve, reject) => {
    window.setTimeout(
      () => {
        if (/fail|error/i.test(file.name)) {
          reject(new Error("Upload lampiran gagal — coba file lain."))
        } else {
          resolve({ url: `https://cdn.example.com/incidents/${encodeURIComponent(file.name)}` })
        }
      },
      400 + Math.random() * 600,
    )
  })

const fakeSubmit = async (
  _payload: Omit<IncidentFormPayload, "attachments"> & {
    attachments: File[] | IncidentFormPayload["attachments"]
  },
): Promise<{ incidentId: string }> => {
  await new Promise((r) => setTimeout(r, 700))
  return { incidentId: `INC-${Math.floor(Math.random() * 90000) + 10000}` }
}

export default function IncidentFormWithAttachDocsPage() {
  const [role, setRole] = React.useState<"mitra" | "ops" | "client">("mitra")
  const [lastSubmit, setLastSubmit] =
    React.useState<{ role: string; ts: string; incidentId?: string } | null>(null)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Forms"
        title="Incident Form with Attachments"
        description="Report vehicle accident, mitra injury, or customer complaint with photo/PDF attachments. Voice flips to formal 'Anda' for mitra-facing surfaces; type dropdown auto-gates by reporter role."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add incident-form-with-attach`} />
      </DocsSection>

      <DocsSection
        title="When to use"
        description="Reach for this block when the OPEN side of the incident state machine (OPEN → IN_MAINTENANCE → MAINTENANCE_COMPLETED → CLOSED) needs a user-facing entry point with proof attachments."
      >
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Mitra mobile app: report vehicle accident with photos before continuing route</li>
          <li>Ops backoffice: log mitra injury escalation with clinic intake form attached</li>
          <li>Client portal: file customer complaint with screenshot of grievance</li>
          <li>Field ops: theft / loss intake with police report PDF</li>
        </ul>
        <p className="text-sm text-text-sub-600">
          For follow-up states (maintenance log, closure note), use a separate state-transition form — this
          block only creates OPEN records. For non-incident file uploads, use{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/bulk-upload-with-status</code>.
        </p>
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Switch reporter role to see voice flip"
          description={
            <>
              Toggle reporter role — mitra surfaces formal &quot;Anda&quot;, ops/client get neutral operator
              copy. Name a file <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">fail.jpg</code> to
              see the attachment-upload error path.
            </>
          }
          preview={
            <div className="w-full space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-sub-600">Reporter role:</span>
                {(["mitra", "ops", "client"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={
                      role === r
                        ? "px-2.5 h-7 rounded-md bg-primary text-static-white text-xs font-medium"
                        : "px-2.5 h-7 rounded-md border border-stroke-soft-200 text-xs text-text-sub-600 hover:bg-bg-weak-50"
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
              <IncidentFormWithAttach
                key={role /* remount on role change so the form clears */}
                reporterId="00000000-0000-0000-0000-000000000001"
                reporterRole={role}
                uploadAttachment={fakeUpload}
                onSubmit={async (p) => {
                  const res = await fakeSubmit(p)
                  setLastSubmit({
                    role: p.reporterRole,
                    ts: new Date().toISOString(),
                    incidentId: res.incidentId,
                  })
                  return res
                }}
                onCancel={() => setLastSubmit({ role, ts: new Date().toISOString() })}
              />
              {lastSubmit?.incidentId ? (
                <p className="text-xs text-text-sub-600">
                  Last submit · role: {lastSubmit.role} · id: {lastSubmit.incidentId}
                </p>
              ) : null}
            </div>
          }
          code={`<IncidentFormWithAttach
  reporterId={session.userId}
  reporterRole="mitra"
  uploadAttachment={async (file) => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/incidents/attach", { method: "POST", body: fd })
    return res.json() as Promise<{ url: string }>
  }}
  onSubmit={async (payload) => {
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json() as Promise<{ incidentId: string }>
  }}
  onCancel={() => router.back()}
/>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "reporterId",
              type: "string",
              description: "Stamped onto the payload for audit. Should be the authenticated user's UUID.",
            },
            {
              name: "reporterRole",
              type: '"mitra" | "ops" | "client"',
              description:
                'Drives voice (mitra = formal "Anda") and default type-dropdown gating (mitra cannot file customer-complaint, client cannot file mitra-injury/theft).',
            },
            {
              name: "visibleTypes",
              type: "IncidentType[]",
              description:
                "Optional whitelist that overrides the role-based default. Use when one surface must expose a non-default subset.",
            },
            {
              name: "onSubmit",
              type: "(payload) => Promise<{ incidentId: string }>",
              description:
                "Persists the record. When `uploadAttachment` is provided, attachments arrive as resolved IncidentAttachment[]; otherwise as raw File[]. Throw to trigger retry toast.",
            },
            {
              name: "uploadAttachment",
              type: "(file: File) => Promise<{ url: string }>",
              description:
                "Optional. If provided, block uploads each file before calling onSubmit. Omit if caller persists incident + uploads in a single multipart request.",
            },
            {
              name: "initialVehicleId",
              type: "string",
              description: "Pre-fills the vehicle ref field — useful when launched from a vehicle detail page.",
            },
            {
              name: "initialMitraId",
              type: "string",
              description: "Pre-fills the mitra ref field — useful when launched from a mitra detail page.",
            },
            {
              name: "onCancel",
              type: "() => void",
              description: "Fired by the Cancel button and by the success-state Close button.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="State machine boundary">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          This block creates incidents in the <strong className="text-text-strong-950">OPEN</strong> state
          only. The full lifecycle (OPEN → IN_MAINTENANCE → MAINTENANCE_COMPLETED → CLOSED) is owned by
          downstream maintenance + closure UIs, which have different audit + authorization shapes (workshop
          assignment, parts inventory, sign-off photo). Mixing those into a single form would balloon the
          field count and force most fields to be conditional — hurting both mitra and ops.
        </p>
      </DocsSection>

      <DocsSection
        title="Voice rules"
        description='Mitra-facing copy is formal "Anda" per Dash voice rule. Ops + client surfaces stay neutral operator tone.'
      >
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-2 text-sm">
                <div className="font-medium text-text-strong-950">Mitra (formal):</div>
                <p className="text-text-sub-600">
                  &quot;Mohon isi data sejelas mungkin agar tim kami dapat menindaklanjuti laporan Anda.&quot;
                </p>
                <p className="text-text-sub-600">
                  &quot;Tim kami akan menindaklanjuti laporan #INC-12345. Anda akan dihubungi jika dibutuhkan
                  keterangan tambahan.&quot;
                </p>
              </div>
            ),
            caption: "Formal pronoun, full sentences, apologetic but not subservient.",
          }}
          dont={{
            preview: (
              <div className="space-y-2 text-sm">
                <div className="font-medium text-text-strong-950">Ops / client (neutral):</div>
                <p className="text-text-sub-600">
                  &quot;Lengkapi data insiden untuk audit + tindak lanjut tim ops.&quot;
                </p>
                <p className="text-text-sub-600">
                  &quot;Insiden tercatat sebagai #INC-12345 (OPEN). Akan masuk antrian tim ops.&quot;
                </p>
              </div>
            ),
            caption: "Operator tone, includes state machine name, optimized for skim.",
          }}
        />
      </DocsSection>

      <DocsSection title="Audit trail">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The submitted payload includes <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">reporterId</code>,{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">reporterRole</code>, and ISO{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">occurredAt</code>. Persist a row in{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">t_incidents_audit_log</code> with this
          metadata and the original (raw) attachment URLs the moment the incident is created — never re-derive
          them later. This is mandatory under CLAUDE.md cardinal rule #3 for any user-editable record
          carrying legal/financial weight.
        </p>
      </DocsSection>

      <DocsSection title="Validation">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Type + severity: required (severity defaults to medium).</li>
          <li>Title: min 5, max 120 characters.</li>
          <li>Description: min 20, max 1000 characters. Live counter visible.</li>
          <li>Occurred at: required, cannot be in the future (1 min clock skew tolerance).</li>
          <li>Attachments: at least 1, max 5, each ≤ 10 MB, image or PDF only.</li>
          <li>Location, vehicle ID, mitra ID: optional. Caller can pre-fill the latter two.</li>
        </ul>
      </DocsSection>

      <DocsSection title="A11y">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>All inputs have explicit <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;Label htmlFor&gt;</code>.</li>
          <li>Required fields marked with both color cue + asterisk.</li>
          <li>Error messages live below each field; <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">aria-invalid</code> set on the control.</li>
          <li>Severity radio cards use real <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;label htmlFor&gt;</code> so the whole card is a click target.</li>
          <li>Attachment dropzone is a <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;label&gt;</code> wrapping a hidden file input — keyboard select works without JS.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
