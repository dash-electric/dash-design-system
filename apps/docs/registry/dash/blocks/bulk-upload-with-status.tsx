"use client"

import * as React from "react"
import {
  RiUploadCloud2Line as UploadCloud,
  RiCheckLine as Check,
  RiCloseLine as X,
  RiRefreshLine as Retry,
  RiFileLine as FileIcon,
  RiImageLine as ImageIcon,
  RiLoader4Line as Loader,
  RiErrorWarningLine as AlertCircle,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { StatusBadge } from "@/registry/dash/ui/badge"
import { toast } from "@/registry/dash/ui/toaster"
import { formatBytes } from "@/registry/dash/ui/file-upload"
import { cn } from "@/registry/dash/lib/utils"

/**
 * bulk-upload-with-status — N-file batch upload with parallel concurrency
 * limit, per-file status state machine, retry-per-file, and end-of-run
 * summary toast.
 *
 * WHY this is its own block (not just bulk-submit + file-upload glued):
 *  - File uploads have *two* failure surfaces (client-side validation BEFORE
 *    dispatch + HTTP failure DURING dispatch). bulk-submit assumes inputs are
 *    already valid; here we have to reject oversized / wrong-mime files at the
 *    drop boundary before they ever enter the row state.
 *  - Concurrency: real uploads saturate browser connection limits (~6/origin)
 *    long before the row count does. Promise.all-everything (bulk-submit's
 *    approach) overwhelms the network on a 20-file batch; we run a fixed-size
 *    queue (default 3) so the user sees steady progress instead of all rows
 *    pending for 60s then all completing in a burst.
 *  - Preview generation: image rows need a data URL the moment they're
 *    dropped, before any upload starts. Plumbing that through bulk-submit
 *    would warp its API.
 *
 * The uploadFile fn is INJECTED — this block owns:
 *   - Drop zone + click-to-select (inline, no react-dropzone)
 *   - Validation (size + mime + count) with toast.error per rejection
 *   - Per-file state machine (idle → uploading → success | error)
 *   - Concurrency queue (configurable, default 3)
 *   - Per-file retry on error
 *   - End-of-run summary toast
 *   - Optimistic mark + rollback on failure (status flip)
 *
 * Voice: neutral staff/ops Indonesian. For mitra-facing surfaces (formal),
 * wrap with your own messages — keep copy here neutral so this block ships
 * to both audiences unchanged.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BulkUploadFileStatus = "idle" | "uploading" | "success" | "error"

export type BulkUploadFile = {
  /** Local UUID — stable across status transitions. */
  id: string
  file: File
  /** Data URL for image previews. Undefined for non-image files. */
  preview?: string
  status: BulkUploadFileStatus
  error?: string
  /** Returned URL after a successful upload. */
  uploadedUrl?: string
}

export type BulkUploadWithStatusProps = {
  /**
   * Inject the upload function. The block owns parallelization + retry.
   * Throw or reject to mark the row as errored.
   */
  uploadFile: (file: File) => Promise<{ url: string }>
  /** Per-file size limit in bytes. Default 10 MB. */
  maxFileSize?: number
  /** HTML accept attribute. Default "image/*,application/pdf". */
  accept?: string
  /** Max concurrent uploads in flight. Default 3. */
  maxConcurrent?: number
  /** Called once all files reach a terminal state (success or error). */
  onComplete?: (results: BulkUploadFile[]) => void
  /** Cap total queued files. Default 20. */
  maxFiles?: number
  /** Optional className for the outer wrapper. */
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024
const DEFAULT_ACCEPT = "image/*,application/pdf"
const DEFAULT_CONCURRENCY = 3
const DEFAULT_MAX_FILES = 20

function uid(): string {
  // WHY not crypto.randomUUID: it's not on the SSR boundary for some Next
  // configs. Math.random + timestamp is collision-safe for in-session row IDs.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function isImage(file: File): boolean {
  return file.type.startsWith("image/")
}

function readPreview(file: File): Promise<string | undefined> {
  if (!isImage(file)) return Promise.resolve(undefined)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : undefined)
    reader.onerror = () => resolve(undefined)
    reader.readAsDataURL(file)
  })
}

/**
 * Best-effort mime match against an HTML `accept` attribute. Returns true if
 * the file passes, false otherwise. Handles wildcard ("image/*"), exact mime
 * ("application/pdf"), and dotted extensions (".pdf").
 */
function matchesAccept(file: File, accept: string): boolean {
  if (!accept || accept === "*" || accept === "*/*") return true
  const patterns = accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (patterns.length === 0) return true
  const mime = (file.type || "").toLowerCase()
  const name = file.name.toLowerCase()
  return patterns.some((p) => {
    if (p.startsWith(".")) return name.endsWith(p)
    if (p.endsWith("/*")) return mime.startsWith(p.slice(0, -1)) // "image/" prefix match
    return mime === p
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkUploadWithStatus({
  uploadFile,
  maxFileSize = DEFAULT_MAX_BYTES,
  accept = DEFAULT_ACCEPT,
  maxConcurrent = DEFAULT_CONCURRENCY,
  onComplete,
  maxFiles = DEFAULT_MAX_FILES,
  className,
}: BulkUploadWithStatusProps) {
  const [files, setFiles] = React.useState<BulkUploadFile[]>([])
  const [running, setRunning] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // WHY a ref mirror of state: the concurrency queue's worker loop reads the
  // latest file list without re-subscribing each tick. State copy alone would
  // bind stale snapshots in the async closure.
  const filesRef = React.useRef(files)
  filesRef.current = files

  const setFileStatus = React.useCallback(
    (id: string, patch: Partial<BulkUploadFile>) => {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
    },
    [],
  )

  // -------------------------------------------------------------------------
  // Validation + add
  // -------------------------------------------------------------------------

  const addFiles = React.useCallback(
    async (incoming: File[]) => {
      if (incoming.length === 0) return
      const current = filesRef.current
      const remainingSlots = Math.max(0, maxFiles - current.length)
      if (remainingSlots === 0) {
        toast.error(`Maksimum ${maxFiles} file. Hapus salah satu untuk menambah lagi.`)
        return
      }

      const accepted: BulkUploadFile[] = []
      const rejectedMime: string[] = []
      const rejectedSize: string[] = []
      const truncated = incoming.length > remainingSlots

      const slice = incoming.slice(0, remainingSlots)
      for (const file of slice) {
        if (!matchesAccept(file, accept)) {
          rejectedMime.push(file.name)
          continue
        }
        if (file.size > maxFileSize) {
          rejectedSize.push(file.name)
          continue
        }
        // WHY await preview before push: the row should never render an empty
        // image placeholder that pops in mid-frame.
        const preview = await readPreview(file)
        accepted.push({ id: uid(), file, preview, status: "idle" })
      }

      if (rejectedMime.length > 0) {
        toast.error(
          `${rejectedMime.length} file ditolak — format tidak didukung (${rejectedMime[0]}${
            rejectedMime.length > 1 ? ` +${rejectedMime.length - 1}` : ""
          }).`,
        )
      }
      if (rejectedSize.length > 0) {
        toast.error(
          `${rejectedSize.length} file ditolak — melebihi ${formatBytes(maxFileSize)} (${rejectedSize[0]}${
            rejectedSize.length > 1 ? ` +${rejectedSize.length - 1}` : ""
          }).`,
        )
      }
      if (truncated) {
        toast.error(`Hanya ${remainingSlots} file ditambahkan — batas ${maxFiles} file tercapai.`)
      }
      if (accepted.length === 0) return

      setFiles((prev) => [...prev, ...accepted])
    },
    [accept, maxFileSize, maxFiles],
  )

  // -------------------------------------------------------------------------
  // Remove
  // -------------------------------------------------------------------------

  const removeFile = React.useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  // -------------------------------------------------------------------------
  // Single-file upload
  // -------------------------------------------------------------------------

  const runOne = React.useCallback(
    async (id: string): Promise<boolean> => {
      const target = filesRef.current.find((f) => f.id === id)
      if (!target) return false

      setFileStatus(id, { status: "uploading", error: undefined })
      try {
        const res = await uploadFile(target.file)
        setFileStatus(id, { status: "success", uploadedUrl: res.url })
        return true
      } catch (err) {
        // WHY catch-all: a thrown network error and a rejected promise should
        // reach the user the same way. Developers shouldn't have to think about which.
        setFileStatus(id, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload gagal.",
        })
        return false
      }
    },
    [setFileStatus, uploadFile],
  )

  // -------------------------------------------------------------------------
  // Concurrency queue
  // -------------------------------------------------------------------------

  const runAll = React.useCallback(async () => {
    const pending = filesRef.current.filter(
      (f) => f.status === "idle" || f.status === "error",
    )
    if (pending.length === 0) return

    setRunning(true)

    // WHY a fixed-size worker pool (not Promise.all): real uploads hit
    // ~6 concurrent connections/origin in the browser. Promise.all on 20
    // files queues them at the network layer with no user feedback. A
    // worker pool surfaces steady progress and lets the user retry mid-run
    // without contending with a flood of in-flight requests.
    const queue = [...pending]
    const workerCount = Math.min(maxConcurrent, queue.length)

    const worker = async () => {
      while (queue.length > 0) {
        const next = queue.shift()
        if (!next) return
        await runOne(next.id)
      }
    }

    await Promise.all(Array.from({ length: workerCount }, () => worker()))

    setRunning(false)

    // Read final state once for the summary — filesRef.current is fresh.
    const final = filesRef.current
    const succeeded = final.filter((f) => f.status === "success").length
    const failed = final.filter((f) => f.status === "error").length
    const total = succeeded + failed

    if (failed === 0) {
      toast.success(`${succeeded} dari ${total} file berhasil di-upload.`)
    } else {
      toast.error(
        `${succeeded} dari ${total} file berhasil di-upload. ${failed} gagal — klik tombol ulang per baris.`,
      )
    }
    onComplete?.(final)
  }, [maxConcurrent, onComplete, runOne])

  // -------------------------------------------------------------------------
  // Drop zone handlers
  // -------------------------------------------------------------------------

  const handleSelect = (list: FileList | null) => {
    if (!list || list.length === 0) return
    void addFiles(Array.from(list))
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!running) setDragOver(true)
  }
  const onDragLeave = () => setDragOver(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (running) return
    handleSelect(e.dataTransfer.files)
  }

  // -------------------------------------------------------------------------
  // Derived counts
  // -------------------------------------------------------------------------

  const counts = React.useMemo(() => {
    const c = { idle: 0, uploading: 0, success: 0, error: 0 }
    for (const f of files) c[f.status] += 1
    return c
  }, [files])

  const pendingCount = counts.idle + counts.error
  const canUpload = !running && pendingCount > 0

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className={cn("space-y-4", className)}>
      {/*
        WHY label-as-dropzone (not div + onClick): a real <label> wired to a
        hidden <input type="file"> gives us click-to-select + keyboard select
        (Enter/Space focus the input) + screen-reader announcement for free.
        Matches the file-upload primitive's a11y contract.
      */}
      <label
        data-slot="bulk-upload-dropzone"
        data-state={dragOver ? "active" : running ? "disabled" : "idle"}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-bg-white-0 p-8 text-center min-h-[200px] cursor-pointer",
          "transition-colors duration-(--duration-fast) ease-(--ease-out)",
          "focus-within:ring-4 focus-within:ring-(--primary-alpha-10)",
          dragOver
            ? "border-(--primary-base) bg-(--primary-alpha-10)"
            : "border-stroke-sub-300 hover:bg-bg-weak-50",
          running ? "opacity-60 pointer-events-none" : "",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          disabled={running}
          className="sr-only"
          onChange={(e) => {
            handleSelect(e.target.files)
            // Reset value so re-selecting the same file re-fires onChange.
            e.currentTarget.value = ""
          }}
          aria-label="Pilih file untuk di-upload"
        />
        <UploadCloud aria-hidden strokeWidth={1.5} className="size-6 text-icon-sub-600" />
        <div className="space-y-1.5">
          <div className="text-sm font-medium text-text-strong-950">
            Tarik & lepas file di sini, atau klik untuk pilih
          </div>
          <div className="text-xs text-text-sub-600">
            Maks {formatBytes(maxFileSize)} per file · maks {maxFiles} file · format: {accept}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-sm font-medium text-text-sub-600">
          Pilih file
        </span>
        {/*
          A11y live region: announces additions + status changes to AT users
          without a visual hit. polite = wait for idle, not interrupt.
        */}
        <span aria-live="polite" className="sr-only">
          {files.length} file siap di-upload. {counts.success} berhasil, {counts.error} gagal,
          {" "}
          {counts.uploading} sedang berjalan.
        </span>
      </label>

      {files.length > 0 ? (
        <div className="space-y-2" role="list" aria-label="Daftar file">
          {files.map((f) => (
            <FileRow
              key={f.id}
              entry={f}
              onRetry={() => void runOne(f.id)}
              onRemove={() => removeFile(f.id)}
              busy={running}
            />
          ))}
        </div>
      ) : null}

      {files.length > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-4 py-3">
          <div className="text-xs text-text-sub-600">
            <span className="font-medium text-text-strong-950">{files.length}</span> file ·{" "}
            {counts.success} berhasil · {counts.error} gagal · {counts.uploading} berjalan
          </div>
          <Button
            type="button"
            tone="primary"
            style="filled"
            loading={running}
            onClick={() => void runAll()}
            disabled={!canUpload}
          >
            Upload {pendingCount > 0 ? pendingCount : ""} file
          </Button>
        </div>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

function FileRow({
  entry,
  onRetry,
  onRemove,
  busy,
}: {
  entry: BulkUploadFile
  onRetry: () => void
  onRemove: () => void
  busy: boolean
}) {
  const { file, preview, status, error } = entry
  const isErr = status === "error"
  const isUploading = status === "uploading"
  const canRemove = status === "idle" || status === "success" || status === "error"

  return (
    <div
      role="listitem"
      data-status={status}
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border bg-bg-white-0 px-4 py-3",
        isErr ? "border-(--state-error-base)" : "border-stroke-soft-200",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail / icon */}
        <div
          className={cn(
            "relative size-10 shrink-0 overflow-hidden rounded-md border border-stroke-sub-300 bg-bg-weak-50",
            "flex items-center justify-center",
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : isImage(file) ? (
            <ImageIcon aria-hidden strokeWidth={1.5} className="size-5 text-icon-sub-600" />
          ) : (
            <FileIcon aria-hidden strokeWidth={1.5} className="size-5 text-icon-sub-600" />
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium text-text-strong-950 truncate">{file.name}</div>
            <RowStatusBadge status={status} />
          </div>
          <div className="text-xs text-text-sub-600 tabular-nums">{formatBytes(file.size)}</div>
          {isErr ? (
            <div className="inline-flex items-center gap-1 text-xs text-(--state-error-base)">
              <AlertCircle aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
              <span className="truncate">{error ?? "Upload gagal."}</span>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isErr ? (
            <IconButton
              type="button"
              size="xs"
              aria-label={`Coba ulang upload ${file.name}`}
              onClick={onRetry}
              disabled={busy}
            >
              <Retry />
            </IconButton>
          ) : null}
          {canRemove ? (
            <IconButton
              type="button"
              size="xs"
              aria-label={`Hapus ${file.name}`}
              onClick={onRemove}
              disabled={isUploading}
            >
              <X />
            </IconButton>
          ) : null}
        </div>
      </div>

      {/* Indeterminate progress while uploading.
          WHY indeterminate (not %): caller's uploadFile is a single promise
          with no progress hook. A fake 0→100 estimate would lie to the user.
          A pulsing bar is honest: "we're working, we don't know how far". */}
      {isUploading ? (
        <div
          className="h-1.5 rounded-full bg-stroke-soft-200 overflow-hidden"
          role="progressbar"
          aria-label={`Uploading ${file.name}`}
        >
          <div className="h-full w-1/3 bg-(--state-information-base) animate-pulse" />
        </div>
      ) : null}
    </div>
  )
}

function RowStatusBadge({ status }: { status: BulkUploadFileStatus }) {
  if (status === "uploading") {
    return (
      <StatusBadge status="information" variant="icon-light" size="sm" icon={<Loader className="animate-spin" />}>
        Mengupload
      </StatusBadge>
    )
  }
  if (status === "success") {
    return (
      <StatusBadge status="success" variant="icon-light" size="sm" icon={<Check />}>
        Berhasil
      </StatusBadge>
    )
  }
  if (status === "error") {
    return (
      <StatusBadge status="error" variant="icon-light" size="sm" icon={<X />}>
        Gagal
      </StatusBadge>
    )
  }
  return (
    <StatusBadge status="neutral" variant="dot-stroke" size="sm">
      Siap
    </StatusBadge>
  )
}
