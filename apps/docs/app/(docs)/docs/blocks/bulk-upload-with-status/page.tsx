"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import {
  BulkUploadWithStatus,
  type BulkUploadFile,
} from "@/registry/dash/blocks/bulk-upload-with-status"

// WHY a deterministic fake uploader: doc preview must reliably show all four
// states (idle/uploading/success/error) without depending on a backend. We
// reject any file whose name contains "fail" to make the error path
// observable for testers + screen-reader walkthroughs.
const fakeUpload = (file: File): Promise<{ url: string }> =>
  new Promise((resolve, reject) => {
    window.setTimeout(
      () => {
        if (/fail|error/i.test(file.name)) {
          reject(new Error("Server menolak file — coba ulang."))
        } else {
          resolve({ url: `https://cdn.example.com/${encodeURIComponent(file.name)}` })
        }
      },
      800 + Math.random() * 1200,
    )
  })

export default function BulkUploadWithStatusDocsPage() {
  const [results, setResults] = React.useState<BulkUploadFile[] | null>(null)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Forms"
        title="Bulk Upload with Per-File Status"
        description="N-file batch upload with parallel concurrency limit, per-file status state machine, retry per file, and end-of-run summary toast. Common Dash use: delivery proof batch, mitra KYC docs, vehicle inspection photos."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add bulk-upload-with-status`} />
      </DocsSection>

      <DocsSection
        title="When to use"
        description="Reach for this block when one user task produces N file artifacts that must all be uploaded, but each can fail independently."
      >
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Mitra uploads delivery proof photos for an Express batch</li>
          <li>Ops uploads KYC document set (KTP + SKCK + STNK + foto) per mitra</li>
          <li>Vehicle inspection photo upload (4-side view + odometer + battery)</li>
          <li>Reservasi outlet onboarding asset upload (banner + menu + sertifikat)</li>
        </ul>
        <p className="text-sm text-text-sub-600">
          For single-file uploads, reach for{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/file-upload</code> instead. For N
          non-file items (suspend mitra, dispatch orders), use{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/bulk-submit</code>.
        </p>
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Drag, drop, upload"
          description={
            <>
              Drop a few files (images or PDFs). Name a file{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">fail.jpg</code> to see the error +
              retry path.
            </>
          }
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 space-y-3">
              <BulkUploadWithStatus
                uploadFile={fakeUpload}
                maxFiles={10}
                maxConcurrent={3}
                onComplete={setResults}
              />
              {results ? (
                <p className="text-xs text-text-sub-600">
                  Run complete · {results.filter((r) => r.status === "success").length}/{results.length} berhasil.
                </p>
              ) : null}
            </div>
          }
          code={`<BulkUploadWithStatus
  uploadFile={async (file) => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    if (!res.ok) throw new Error(await res.text())
    return res.json() as Promise<{ url: string }>
  }}
  maxFileSize={10 * 1024 * 1024}
  accept="image/*,application/pdf"
  maxConcurrent={3}
  maxFiles={20}
  onComplete={(results) => {
    const urls = results.filter((r) => r.status === "success").map((r) => r.uploadedUrl!)
    saveDeliveryProof({ urls })
  }}
/>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "uploadFile",
              type: "(file: File) => Promise<{ url: string }>",
              description:
                "Per-file uploader. Throw or reject to mark the row as errored. Block owns parallelization + retry.",
            },
            {
              name: "maxFileSize",
              type: "number",
              defaultValue: "10485760 (10 MB)",
              description: "Per-file size cap in bytes. Oversized files rejected at drop boundary with toast.",
            },
            {
              name: "accept",
              type: "string",
              defaultValue: '"image/*,application/pdf"',
              description:
                "HTML accept attribute. Mime check runs against this list (wildcard, exact mime, or .ext).",
            },
            {
              name: "maxConcurrent",
              type: "number",
              defaultValue: "3",
              description:
                "Concurrent uploads in flight. Tune up for fast networks, down for mobile / unreliable links.",
            },
            {
              name: "maxFiles",
              type: "number",
              defaultValue: "20",
              description: "Total queued files cap. Drops beyond this surface a toast.",
            },
            {
              name: "onComplete",
              type: "(results: BulkUploadFile[]) => void",
              description: "Fires once all files reach a terminal state (success or error).",
            },
            {
              name: "className",
              type: "string",
              description: "Outer wrapper class.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="Anatomy"
        description="The uploadFile function is injected so the block works against any upload endpoint (S3 presigned, Cloudinary, internal Dash media gateway)."
      >
        <ol className="list-decimal pl-6 space-y-2 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Drop zone</strong> — Real{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;label&gt;</code> wrapping a hidden
            file input. Click-to-select + keyboard (Enter/Space) + drag-drop, all one element.
          </li>
          <li>
            <strong className="text-text-strong-950">Per-file state machine</strong> —{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">idle → uploading → success | error</code>.
            Rows transition independently; one row's failure never blocks another's success.
          </li>
          <li>
            <strong className="text-text-strong-950">Concurrency queue</strong> — Fixed-size worker pool
            (default 3). Avoids saturating the browser's 6-connections-per-origin limit on large batches.
            See{" "}
            <a className="underline" href="#why-not-promise-all">
              "Why not Promise.all"
            </a>.
          </li>
          <li>
            <strong className="text-text-strong-950">Per-file retry</strong> — Each error row exposes a retry
            IconButton. Retry clears the stale error before re-firing so a recovered row leaves no ghost.
          </li>
          <li>
            <strong className="text-text-strong-950">Validation at boundary</strong> — Size + mime + total-count
            checks run before the file enters state. Toast announces rejections so the user knows the file
            never started.
          </li>
          <li>
            <strong className="text-text-strong-950">Summary toast</strong> — One end-of-run toast.
            Full success → success tone. Partial → error tone with success/fail counts.
          </li>
        </ol>
      </DocsSection>

      <DocsSection
        title="Usage — wiring to a real backend"
        description="The caller owns the HTTP layer. Throw to flag an error; return { url } on success."
      >
        <DocsCode
          language="tsx"
          code={`async function uploadToS3(file: File): Promise<{ url: string }> {
  // 1. Ask backend for a presigned URL
  const presign = await fetch("/api/upload/presign", {
    method: "POST",
    body: JSON.stringify({ name: file.name, type: file.type }),
  }).then((r) => r.json() as Promise<{ uploadUrl: string; publicUrl: string }>)

  // 2. PUT direct to S3
  const put = await fetch(presign.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  })
  if (!put.ok) throw new Error(\`Upload gagal (\${put.status})\`)

  return { url: presign.publicUrl }
}

<BulkUploadWithStatus
  uploadFile={uploadToS3}
  accept="image/jpeg,image/png,application/pdf"
  maxFileSize={5 * 1024 * 1024}
  maxConcurrent={2}
  onComplete={(results) => {
    const urls = results
      .filter((r) => r.status === "success" && r.uploadedUrl)
      .map((r) => r.uploadedUrl!)
    // Persist alongside the parent record
    void saveDeliveryProof({ orderId, urls })
  }}
/>`}
        />
      </DocsSection>

      <DocsSection
        title="A11y"
        description="The block ships with the affordances a screen-reader user needs to operate it solo."
      >
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>
            Drop zone is a <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;label&gt;</code> wrapping
            the hidden file input — Enter/Space opens the picker, no JS keyboard handler needed.
          </li>
          <li>
            Live region (<code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">aria-live=&quot;polite&quot;</code>)
            announces add + status changes without interrupting the user.
          </li>
          <li>
            File list is <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">role=&quot;list&quot;</code>; each
            row is <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">role=&quot;listitem&quot;</code>.
          </li>
          <li>
            Retry + remove buttons have file-specific{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">aria-label</code>: &quot;Coba ulang upload
            ktp.jpg&quot; — no ambiguity when multiple rows share status.
          </li>
          <li>
            Indeterminate progress bar has{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">role=&quot;progressbar&quot;</code>; we don&apos;t
            lie with a fake percent.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Why not Promise.all?" id="why-not-promise-all">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Browsers cap concurrent connections per origin (~6 in Chrome). Firing 20 uploads with{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">Promise.all</code> queues 14 of them at
          the network layer with zero user feedback — the UI shows all rows pending for 30 seconds, then a
          burst of completions. A fixed-size worker pool surfaces steady progress and lets the user retry
          mid-run without fighting a flood of in-flight requests.
        </p>
      </DocsSection>

      <DocsSection title="Don't lie about progress">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The injected <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">uploadFile</code> is a single
          promise — there&apos;s no honest byte-level progress to display. We render an indeterminate pulse
          while in flight; if you wire up XHR with{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">onprogress</code> at the call site, surface
          that separately. Never fake a 0→100 estimate.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="text-xs text-text-sub-600">delivery-proof-1.jpg · Mengupload</div>
                <div className="h-1.5 rounded-full bg-stroke-soft-200 overflow-hidden">
                  <div className="h-full w-1/3 bg-(--state-information-base) animate-pulse" />
                </div>
              </div>
            ),
            caption:
              "Indeterminate pulse. Honest about uncertainty — the user knows we're working, not how far.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="text-xs text-text-sub-600">delivery-proof-1.jpg · 73%</div>
                <div className="h-1.5 rounded-full bg-stroke-soft-200 overflow-hidden">
                  <div className="h-full w-[73%] bg-(--state-information-base)" />
                </div>
              </div>
            ),
            caption:
              "Don't fake a percentage you can't measure. A frozen 73% bar at 30s is worse than no bar.",
          }}
        />
      </DocsSection>

      <DocsSection title="Validate at the boundary, not at submit">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Reject oversized + wrong-mime files when they're dropped, with a toast naming the file. Holding
          them in state and failing at submit-time wastes the user's time and hides the cause.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2 text-xs">
                <div className="rounded-md bg-(--state-error-lighter) text-(--state-error-base) px-2 py-1">
                  1 file ditolak — melebihi 10 MB (banner-promo.png).
                </div>
                <div className="text-text-sub-600">3 file siap di-upload.</div>
              </div>
            ),
            caption: "Toast names the rejected file the moment it lands. User can swap it before clicking upload.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2 text-xs">
                <div className="text-text-sub-600">4 file ditambahkan.</div>
                <div className="rounded-md bg-(--state-error-lighter) text-(--state-error-base) px-2 py-1">
                  Upload gagal. Coba ulang.
                </div>
              </div>
            ),
            caption:
              "Don't let bad files sit in the queue and fail per-row at submit. The user re-runs the whole batch trying to figure out which one was bad.",
          }}
        />
      </DocsSection>

      <DocsSection title="Pair with">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/file-upload</code> — single-file
            primitive (Figma-parity dropzone, progress card). Use when N=1.
          </li>
          <li>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/bulk-submit</code> — N non-file
            actions (suspend, approve, dispatch).
          </li>
          <li>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/toaster</code> — must be mounted
            at app root for the summary toast.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
