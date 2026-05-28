"use client"

import {
  ProofImageViewer,
  type ProofImageMeta,
  type ProofImageAuditEntry,
} from "@/registry/dash/blocks/proof-image-viewer"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { RiDownloadLine, RiFlagLine, RiEditLine } from "@remixicon/react"

// Demo data — POD scenario for Tribe-Express dispatch.
const DEMO_PROOF: ProofImageMeta = {
  url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=70",
  label: "Bukti pengantaran",
  capturedAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  capturedBy: "Mitra · Bagus Pratama",
  geolocation: { lat: -6.1944, lng: 106.8229, accuracy: 12 },
}

const DEMO_AUDIT: ProofImageAuditEntry[] = [
  {
    originalUrl:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=70",
    editedUrl:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=80&sat=-30",
    editorId: "u-9281",
    editorName: "Wei Chen",
    editedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    editReason:
      "Crop tidak pas — objek paket terpotong di kanan. Foto direvisi sesuai SOP POD.",
  },
  {
    originalUrl:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=70&sat=-30",
    editedUrl:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=90",
    editorId: "u-7012",
    editorName: "Maya Damayanti",
    editedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    editReason: "Tingkat kontras dinaikkan agar nomor unit kendaraan terbaca.",
  },
]

// KYC scenario — single mode, no audit.
const DEMO_KYC: ProofImageMeta = {
  url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=70",
  label: "KYC selfie",
  capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  capturedBy: "Calon Mitra · MTR-4421",
}

export default function ProofImageViewerDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Composite"
        kind="composite"
        status="beta"
        title="Proof Image Viewer"
        description="Backoffice + audit viewer for proof images. Native zoom + pan, side-by-side compare for edited proofs, audit history cycling, geolocation map link, full keyboard a11y. No external zoom lib (per External Library Policy)."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add proof-image-viewer`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="POD with audit trail"
          description="Dispatch DSP-9412 — proof has been edited twice. Toggle Compare to see original vs edited side-by-side with synced zoom + pan. Use wheel to zoom, drag to pan, arrows + (+/-/0) on keyboard. Cycle multiple edits via the chevrons in the footer."
          preview={
            <div className="w-full">
              <ProofImageViewer
                proof={DEMO_PROOF}
                auditHistory={DEMO_AUDIT}
                actions={[
                  {
                    id: "edit",
                    label: "Edit",
                    icon: <RiEditLine />,
                    onClick: () => {},
                  },
                  {
                    id: "download",
                    label: "Unduh",
                    icon: <RiDownloadLine />,
                    onClick: () => {},
                  },
                  {
                    id: "flag",
                    label: "Tandai sengketa",
                    icon: <RiFlagLine />,
                    onClick: () => {},
                  },
                ]}
              />
            </div>
          }
          code={`<ProofImageViewer
  proof={{
    url: pod.imageUrl,
    label: "Bukti pengantaran",
    capturedAt: pod.timestamp,
    capturedBy: \`Mitra · \${pod.mitraName}\`,
    geolocation: pod.geo,
  }}
  auditHistory={pod.auditEntries}
  actions={[
    { id: "edit", label: "Edit", icon: <RiEditLine />, onClick: openEditor },
    { id: "download", label: "Unduh", icon: <RiDownloadLine />, onClick: download },
    { id: "flag", label: "Tandai sengketa", icon: <RiFlagLine />, onClick: flagDispute },
  ]}
/>`}
        />
      </DocsSection>

      <DocsSection title="Preview — single mode (no audit)">
        <DocsExample
          title="KYC selfie — never edited"
          description="When `auditHistory` is empty or omitted, the compare toggle hides itself and the footer collapses to capture metadata only."
          preview={
            <div className="w-full max-w-2xl">
              <ProofImageViewer proof={DEMO_KYC} />
            </div>
          }
          code={`<ProofImageViewer proof={kycSelfie} />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            Toolbar — label + "telah diedit" badge (if audit), zoom -/% /+,
            reset, compare toggle (when audit present), custom actions.
          </li>
          <li>
            Viewer — focusable container; wheel zoom (toward cursor), drag
            to pan (only when zoomed in), arrow-key pan, +/-/0 zoom controls.
          </li>
          <li>
            Compare panes — left "Asli" / right "Setelah edit"; one shared
            zoom + pan state (locked by construction, not by listener pairs).
          </li>
          <li>
            Audit meta — reason, editor (name fallback editorId), absolute
            timestamp. Prev/next chevrons appear when more than one edit.
          </li>
          <li>
            Footer — relative time (with absolute on hover via <code>title</code>
            ), <code>capturedBy</code> rendered respectfully, GPS accuracy,
            "Lihat di map" link opening Google Maps in a new tab.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            <strong>Use</strong> in backoffice dispatch detail panels, KYC
            review queues, vehicle condition inspection screens, claim
            review surfaces — anywhere staff needs to inspect proof.
          </li>
          <li>
            <strong>Use</strong> when the proof has an audit history — the
            block surfaces compare-mode automatically.
          </li>
          <li>
            <strong>Don&apos;t</strong> use mitra-facing as-is. Voice is
            staff-neutral; mitra-facing surfaces should compose a stripped
            variant (no editor IDs, no IP/geo, no audit chevrons).
          </li>
          <li>
            <strong>Don&apos;t</strong> wrap in a Modal for read-only paths
            — render inline in the detail panel. Modal is appropriate only
            when paired with <code>image-editor-with-audit</code>.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "proof",
              type: "ProofImageMeta",
              description:
                "Proof to display. Carries url, label, capturedAt (ISO), optional capturedBy + geolocation.",
            },
            {
              name: "auditHistory",
              type: "ProofImageAuditEntry[]",
              description:
                "Optional. Each entry pairs originalUrl + editedUrl + editor + reason + timestamp. Compare-mode auto-enabled when length > 0. Order is oldest → newest by convention.",
            },
            {
              name: "actions",
              type: "Array<{ id, label, icon?, onClick }>",
              description:
                "Optional toolbar actions (Edit, Download, Flag dispute, ...). Rendered after the zoom/compare controls.",
            },
            {
              name: "defaultMode",
              type: '"single" | "compare"',
              description:
                'Optional. Default "single". "compare" is coerced to "single" when auditHistory is empty — safer default than rendering a broken layout.',
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
  ProofImageViewer,
  type ProofImageMeta,
  type ProofImageAuditEntry,
} from "@/registry/dash/blocks/proof-image-viewer"

const proof: ProofImageMeta = {
  url: dispatch.podImageUrl,
  label: "Bukti pengantaran",
  capturedAt: dispatch.podCapturedAt,
  capturedBy: \`Mitra · \${dispatch.mitra.fullName}\`,
  geolocation: dispatch.podGeo,
}

const auditHistory: ProofImageAuditEntry[] = dispatch.auditLog
  .filter((row) => row.fieldName === "pod_image_url")
  .map((row) => ({
    originalUrl: row.originalValue,
    editedUrl: row.editedValue,
    editorId: row.editorId,
    editorName: row.editorName,
    editedAt: row.editedAt,
    editReason: row.editReason,
  }))

return (
  <ProofImageViewer
    proof={proof}
    auditHistory={auditHistory}
    actions={[
      { id: "edit", label: "Edit", icon: <RiEditLine />, onClick: openEditor },
      { id: "flag", label: "Tandai sengketa", icon: <RiFlagLine />, onClick: openDisputeFlow },
    ]}
  />
)`}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            Viewer is a focusable <code>role=&quot;group&quot;</code> with an{" "}
            <code>aria-label</code> mirroring the proof label.
          </li>
          <li>
            Keyboard zoom: <kbd>+</kbd> / <kbd>=</kbd> in, <kbd>-</kbd> out,{" "}
            <kbd>0</kbd> reset. Keyboard pan: arrow keys (32px steps).
          </li>
          <li>
            Zoom percent is <code>aria-live=&quot;polite&quot;</code> so screen
            readers announce changes from wheel/keyboard.
          </li>
          <li>
            Compare toggle exposes <code>aria-pressed</code>. Each pane is{" "}
            <code>role=&quot;img&quot;</code> with its own aria-label.
          </li>
          <li>
            Map link uses <code>target=&quot;_blank&quot;</code> +{" "}
            <code>rel=&quot;noreferrer noopener&quot;</code>. Time elements
            carry <code>dateTime</code> for assistive tech to read absolute
            ISO.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Voice & content">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The viewer is a backoffice surface, so the visible copy is
          staff-neutral. But the <code>capturedBy</code> field surfaces a
          mitra identifier that can appear in dispute exports shown to the
          mitra, so the block renders it as &quot;Diambil oleh{" "}
          <em>&lt;name&gt;</em>&quot; — never bare ID, never a casual prefix.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <span className="text-xs text-text-sub-600">
                Diambil oleh{" "}
                <span className="font-medium text-text-strong-950">
                  Mitra · Bagus Pratama
                </span>
              </span>
            ),
            caption:
              'Respectful framing. Mitra prefix communicates role; full name retained for staff context.',
          }}
          dont={{
            preview: (
              <span className="text-xs text-text-sub-600">By: mitra_4421</span>
            ),
            caption:
              "Don't render bare IDs or English prefixes in user-facing copy. The audit export may surface this to the mitra later.",
          }}
        />
      </DocsSection>

      <DocsSection title="Compare-mode safety">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          A single zoom + pan state drives both panes. Don&apos;t fork the
          state per pane and try to keep them in sync via effects — that
          path causes the classic feedback loop where one pane keeps
          fighting the other after a wheel event.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs font-mono text-text-sub-600">
                useState&lt;ZoomPan&gt;() · transform applied to both{" "}
                <code>&lt;img&gt;</code>
              </div>
            ),
            caption:
              "One state, two consumers. Sync is structural — there is no second source of truth to drift.",
          }}
          dont={{
            preview: (
              <div className="text-xs font-mono text-text-sub-600">
                leftZoom + rightZoom + useEffect(syncLeftToRight)…
              </div>
            ),
            caption:
              "Don't split state per pane. The cascading effects produce jitter and lose alignment on fast wheel scrolls.",
          }}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
