"use client"

import * as React from "react"
import { Button } from "@/registry/dash/ui/button"
import { UploadCard } from "@/registry/dash/ui/upload-card"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * UploadCard — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/custom-card/upload-card.tsx
 *
 * Per-file row in an upload list. Three states — uploading (ProgressBar +
 * cancel), completed (filename + delete), failed (red border + retry link).
 * Different from FileUpload (which is the drop-zone): UploadCard is the row
 * that appears once a file is picked.
 */

export default function UploadCardDocsPage() {
  const [progress, setProgress] = React.useState(35)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Files"
        title="Upload Card"
        description="Per-file row for an upload list. Three states: uploading (progress + cancel), completed (delete), failed (red border + retry). Pair with FileUpload (drop zone)."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add upload-card`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`<UploadCard
  fileName="invoice-march.pdf"
  fileSizeKB={350}
  totalSizeKB={500}
  status="uploading"
  progress={70}
  onCancel={() => abortUpload(fileId)}
/>`}
        />
      </DocsSection>

      <DocsSection title="Live: all 3 states">
        <DocsExample
          title="Uploading · Completed · Failed"
          preview={
            <div className="flex w-full max-w-lg flex-col gap-3">
              <UploadCard
                fileName="invoice-march.pdf"
                fileSizeKB={Math.round((progress / 100) * 500)}
                totalSizeKB={500}
                status="uploading"
                progress={progress}
                onCancel={() => {}}
              />
              <UploadCard
                fileName="contract-2026.pdf"
                fileSizeKB={1240}
                totalSizeKB={1240}
                status="completed"
                onDelete={() => {}}
              />
              <UploadCard
                fileName="kyc-photo.jpg"
                fileSizeKB={0}
                totalSizeKB={2400}
                status="failed"
                onDelete={() => {}}
                onRetry={() => {}}
              />
              <Button
                tone="neutral"
                style="stroke"
                size="sm"
                onClick={() => setProgress((p) => (p >= 95 ? 10 : p + 15))}
              >
                Advance progress
              </Button>
            </div>
          }
          code={`<UploadCard status="uploading" progress={70} ... />
<UploadCard status="completed" ... />
<UploadCard status="failed" onRetry={...} ... />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          UploadCard = per-file row dengan 3 state jelas. Uploading butuh progress + cancel. Failed butuh retry inline. Completed butuh delete option. State harus visual berbeda supaya user scan cepat.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-col gap-2 w-full max-w-sm">
                <UploadCard
                  fileName="ktp-mtr-9412.jpg"
                  fileSizeKB={1240}
                  totalSizeKB={1240}
                  status="completed"
                  onDelete={() => {}}
                />
                <UploadCard
                  fileName="sim-mtr-9412.jpg"
                  fileSizeKB={0}
                  totalSizeKB={2400}
                  status="failed"
                  onRetry={() => {}}
                />
              </div>
            ),
            caption: "Completed (KTP) + Failed (SIM dengan Retry inline). User langsung tahu file mana sukses, mana gagal, dan cara fix tanpa pindah page.",
          }}
          dont={{
            preview: (
              <div className="flex flex-col gap-2 w-full max-w-sm text-xs">
                <div className="rounded border border-stroke-soft-200 bg-bg-white-0 p-2">ktp-mtr-9412.jpg — uploaded</div>
                <div className="rounded border border-stroke-soft-200 bg-bg-white-0 p-2">sim-mtr-9412.jpg — error</div>
              </div>
            ),
            caption: "Text-only list tanpa visual state diff + tanpa retry button = user tidak bisa scan cepat, harus pindah modal untuk retry.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <UploadCard
                fileName="laporan-payroll-mei-2026.pdf"
                fileSizeKB={350}
                totalSizeKB={500}
                status="uploading"
                progress={70}
                onCancel={() => {}}
              />
            ),
            caption: "Uploading state dengan ProgressBar real + cancel button. User control: lihat kemajuan, abort kalau salah upload file.",
          }}
          dont={{
            preview: (
              <UploadCard
                fileName="report.pdf"
                fileSizeKB={0}
                totalSizeKB={500}
                status="uploading"
                progress={0}
              />
            ),
            caption: "Uploading state tanpa onCancel = user terjebak kalau salah pilih file. Wajib provide escape (cancel) untuk async operation.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "fileName", type: "string", description: "Truncated with ellipsis when long." },
            { name: "fileSizeKB", type: "number", description: "Bytes uploaded so far (uploading) or total file size (completed)." },
            { name: "totalSizeKB", type: "number", description: "Reference total for the 'X of Y' label." },
            { name: "status", type: '"uploading" | "completed" | "failed"', description: "Drives layout — progress bar, delete, retry link." },
            { name: "progress", type: "number", defaultValue: "0", description: "0-100. Only meaningful when status='uploading'." },
            { name: "onCancel", type: "() => void", description: "Uploading-only X button." },
            { name: "onDelete", type: "() => void", description: "Completed/failed trash button." },
            { name: "onRetry", type: "() => void", description: "Failed-only 'Try again' link." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>File icon tile (40 sq) — swap to format-specific glyphs (PDF/CSV/JPG) for clarity.</li>
          <li>Filename + metaline (X KB of Y KB · status suffix).</li>
          <li>Trailing action — cancel / delete (icon-button ghost).</li>
          <li>Progress bar — visible only while uploading.</li>
          <li>Retry link — only when failed.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
