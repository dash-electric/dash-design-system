"use client"

import * as React from "react"
import {
  ImageEditorWithAudit,
  type ImageEditorAuditEntry,
  type ImageEditorSavePayload,
} from "@/registry/dash/blocks/image-editor-with-audit"
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

// 1×1 transparent PNG placeholder — Preview avoids hitting the network.
const PREVIEW_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'>
      <rect width='800' height='600' fill='#1f1133'/>
      <text x='400' y='300' fill='#fff' font-family='Inter, sans-serif' font-size='32' text-anchor='middle' dy='.3em'>POD Sample 800×600</text>
    </svg>`,
  )

export default function ImageEditorWithAuditDocsPage() {
  const [open, setOpen] = React.useState(false)

  // Stub onSave — in real usage the consumer uploads the blob to
  // `proof-edited/<delivery-id>/` and inserts the audit row in a transaction.
  const onSave = async (
    p: ImageEditorSavePayload,
  ): Promise<ImageEditorAuditEntry> => {
    await new Promise((r) => setTimeout(r, 600))
    return {
      editorId: "agent-uuid-stub",
      editedAt: new Date().toISOString(),
      editReason: p.editReason,
      originalUrl: PREVIEW_URL,
      editedUrl: "https://proof-edited.example.com/sample.png",
    }
  }

  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Composite"
        title="Image Editor with Audit Trail"
        description="Canvas-based crop + rotate for POD/POP/KYC/vehicle-condition proof images. Audit trail built in — no external image-edit lib."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add image-editor-with-audit`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Edit bukti pengambilan (POP)"
          description="Click the trigger to open the editor. Drag any corner to crop, ↻ to rotate, pick a reason, then save. The Preview stub resolves after 600ms."
          preview={
            <div className="flex items-center justify-center w-full p-4">
              <Button type="button" tone="primary" style="filled" onClick={() => setOpen(true)}>
                Buka editor
              </Button>
              {open ? (
                <ImageEditorWithAudit
                  proofUrl={PREVIEW_URL}
                  proofType="pickup"
                  editorId="00000000-0000-0000-0000-000000000001"
                  onSave={onSave}
                  onCancel={() => setOpen(false)}
                />
              ) : null}
            </div>
          }
          code={`<ImageEditorWithAudit
  proofUrl={delivery.pickupProofUrl}
  proofType="pickup"
  editorId={session.user.id}
  onSave={uploadAndAudit}
  onCancel={() => setOpen(false)}
/>`}
        />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`// 3-line developer-friendly snippet
const [open, setOpen] = useState(false)
return open ? <ImageEditorWithAudit proofUrl={url} proofType="pickup" editorId={uid} onSave={save} onCancel={() => setOpen(false)} /> : null`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "proofUrl", type: "string", description: "Current image URL (POD/POP/KYC/vehicle-condition)." },
            { name: "proofType", type: '"pickup" | "delivery" | "kyc" | "vehicle-condition" | string', description: "Domain tag. Drives modal title + success toast copy. Open string so tribes can extend." },
            { name: "editorId", type: "string", description: "Current user UUID. Logged to audit row." },
            { name: "onSave", type: "(p: ImageEditorSavePayload) => Promise<ImageEditorAuditEntry>", description: "Receives blob + crop + rotation + reason. Consumer uploads + inserts audit row, returns audit entry with editedUrl." },
            { name: "onCancel", type: "() => void", description: "Close the modal. Confirmation prompt fires automatically when there are unsaved changes." },
            { name: "reasonOptions", type: "{ value: string; label: string }[]", description: "Override the default 5-option dropdown. The reserved value 'lainnya' triggers the free-text textarea." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <pre className="rounded-lg bg-bg-weak-50 p-4 text-xs leading-relaxed text-text-sub-600 overflow-x-auto">
{`┌───────────────────────────────────────────────┐
│  Edit bukti pengambilan                        │  ← ModalHeader
│  Perubahan akan dicatat di audit log...        │
├───────────────────────────────────────────────┤
│  [crop hint]              [↻ rotate 90°]      │  ← Toolbar
│  ┌────────────────────────────────────────┐   │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  │░░░╭─────────────────╮░░░░░░░░░░░░░░░░░│   │  ← Image + crop overlay
│  │░░░│      crop       │░░░░░░░░░░░░░░░░░│   │     (4 corner handles)
│  │░░░╰─────────────────╯░░░░░░░░░░░░░░░░░│   │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  └────────────────────────────────────────┘   │
│  Alasan perubahan *                           │
│  ┌─────────────────────────────────────────┐  │  ← Reason Select +
│  │ Crop tidak pas ▾                        │  │     conditional Textarea
│  └─────────────────────────────────────────┘  │     (when "Lainnya")
├───────────────────────────────────────────────┤
│            [Batal]        [✓ Simpan]          │  ← ModalFooter
└───────────────────────────────────────────────┘`}
        </pre>
      </DocsSection>

      <DocsSection title="Audit trail contract">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The block is FE-only — it does not persist anything. Consumer is
          responsible for the audit-write transaction. Mandatory flow per
          dash-ai-rules.md § Audit Trail:
        </p>
        <ol className="mt-3 text-sm text-text-sub-600 space-y-1.5 list-decimal pl-6">
          <li>Receive <code>onSave</code> payload — blob + crop + rotation + reason.</li>
          <li>Upload blob to <code>proof-edited/&lt;entity-id&gt;/&lt;file&gt;</code> (NEVER overwrite <code>proof-original/</code>).</li>
          <li>Insert <code>t_&lt;entity&gt;_audit_log</code> row BEFORE updating the entity row — in a transaction.</li>
          <li>Update the entity row's <code>*_proof_url</code> column.</li>
          <li>Return <code>ImageEditorAuditEntry</code> so the block can resolve + toast.</li>
        </ol>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> for any mitra-disputable image edit: POD, POP, KYC re-submission, vehicle condition photo.</li>
          <li><strong>Use</strong> as the canonical example when a tribe asks "how do I add image-edit to my flow?" — point at this block before they reach for <code>react-easy-crop</code>.</li>
          <li><strong>Don't</strong> use for free-form drawing / annotation — that's a different scaffold (DOMAIN_RENDER=annotate).</li>
          <li><strong>Don't</strong> bypass <code>onSave</code> to write the URL directly. The audit row MUST land before the URL update.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Do / Don't">
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Do</strong> log <code>editReason</code> + <code>originalUrl</code> + <code>editorId</code> in the audit row.</p>
                <p><strong>Do</strong> preserve the original blob at <code>proof-original/</code>.</p>
                <p><strong>Do</strong> wrap upload + audit insert + entity update in a transaction.</p>
              </div>
            ),
            caption: "Audit trail is non-negotiable for mitra-disputable fields.",
          }}
          dont={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Don't</strong> reach for <code>react-easy-crop</code>, <code>cropperjs</code>, or <code>fabric.js</code>.</p>
                <p><strong>Don't</strong> overwrite the original URL — keep both paths.</p>
                <p><strong>Don't</strong> ship without the edit-reason field.</p>
              </div>
            ),
            caption: "External image libs trip the bundle gate AND bypass the audit hooks.",
          }}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Keyboard: <kbd>Esc</kbd> cancels (with confirmation when changes pending); <kbd>Enter</kbd> saves when focus is outside the textarea.</li>
          <li>Each crop handle is <code>role="slider"</code> with <code>aria-label</code> identifying its corner.</li>
          <li>Crop area is a labelled <code>role="group"</code> ("Area crop") for screen-reader context.</li>
          <li>Errors surface inline with <code>aria-invalid</code> on the trigger/textarea.</li>
          <li>Image load errors render in a <code>role="alert"</code> banner.</li>
          <li>Mitra-facing copy uses formal "Anda" — never casual "kamu".</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
