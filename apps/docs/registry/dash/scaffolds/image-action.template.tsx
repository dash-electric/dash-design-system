"use client"

import * as React from "react"
import {
  RiCloseLine as X,
  RiSave3Line as Save,
} from "@remixicon/react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/registry/dash/ui/modal"
import { Button } from "@/registry/dash/ui/button"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Label } from "@/registry/dash/ui/label"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * @template image-action
 * @placeholder DOMAIN_LOGIC       — image-specific manipulation handlers (crop coords,
 *                                    rotation degrees, annotation paths, redaction boxes).
 * @placeholder DOMAIN_VALIDATION  — per-image field rules (min crop size, max rotation
 *                                    multiple, required annotation when redacting).
 * @placeholder DOMAIN_RENDER      — the canvas / preview surface specific to the action
 *                                    (crop overlay, annotation toolbar, rotate handle).
 *
 * WHY this template exists:
 *  - Image edits on Dash carry MITRA DISPUTE WEIGHT (POD/POP proof of delivery, KYC
 *    photo). Every edit MUST go through the audit pipeline — original blob preserved
 *    at `proof-original/`, edited blob at `proof-edited/`, audit row inserted BEFORE
 *    the UPDATE. See dash-ai-rules.md § Audit Trail.
 *  - Without a scaffold, AI-generated image editors keep skipping the edit-reason
 *    field or stashing it in a tooltip. Locking it as a required Textarea in the
 *    modal footer eliminates that class of bug.
 *  - Canvas API is mandated over react-easy-crop / fabric.js / konva — external
 *    image libs trip the bundle-size gate and bypass our audit hooks. See rules
 *    § External Library Policy.
 */

// ---------------------------------------------------------------------------
// Types — exported so Agent N can extend without re-typing the surface.
// ---------------------------------------------------------------------------

/** Identifies the entity whose image is being edited. Consumer supplies these. */
export type ImageActionEntity = {
  /** UUID of the parent row (delivery, mitra, kyc submission). */
  entityId: string
  /** Audit table convention: `t_<entityType>_audit_log`. */
  entityType: string
  /** Storage path of the ORIGINAL blob — never overwritten. */
  originalUrl: string
  /** Field name in the audit schema (e.g. "pickup_proof_url"). */
  fieldName: string
}

/** Audit payload shape — mirrors the BE schema (Drizzle + Prisma). */
export type ImageActionAuditPayload = {
  entityId: string
  entityType: string
  fieldName: string
  originalValue: string
  editedValue: string
  editReason: string
  /** Editor (mitra | admin | agent) UUID injected by caller from session. */
  editorId: string
}

/** Result of an edit operation — the BE responds with auditId + edited URL. */
export type ImageActionResult = {
  auditId: string
  editedUrl: string
}

export type ImageActionTemplateProps = {
  /** Open / close controlled by the parent so it composes with row actions. */
  open: boolean
  onOpenChange: (open: boolean) => void

  entity: ImageActionEntity

  /** Editor UUID — caller pulls from session. Required for audit row. */
  editorId: string

  /**
   * Save handler — injected so the template works for ANY image-edit endpoint.
   * MUST be transactional on the BE side: insert audit row → upload edited blob
   * → respond with `{ auditId, editedUrl }`. See rules § Audit Trail rule #4.
   */
  onSave: (payload: ImageActionAuditPayload, editedBlob: Blob) => Promise<ImageActionResult>

  /** Optional human label for the action — appears in the modal title. */
  actionLabel?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImageActionTemplate({
  open,
  onOpenChange,
  entity,
  editorId,
  onSave,
  actionLabel = "Edit gambar",
}: ImageActionTemplateProps) {
  // WHY canvas ref (not state): the pixel buffer mutates on every drag — useState
  // would re-render the entire modal on each frame. Ref + manual draw is the only
  // ergonomic option without pulling in a heavy lib.
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  // Edit reason is REQUIRED — see dash-ai-rules.md § Audit Trail rule #2.
  // Empty string blocks save at FE; BE also validates and returns 400.
  const [editReason, setEditReason] = React.useState("")
  const [reasonError, setReasonError] = React.useState<string | undefined>(undefined)
  const [saving, setSaving] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | undefined>(undefined)
  // Loading flag — covers the gap between modal open and `img.onload` so the
  // canvas pane shows a skeleton instead of a blank rectangle (design.md A8
  // — every async surface needs loading + empty + error + success branches).
  const [loadingImage, setLoadingImage] = React.useState(false)

  // @placeholder DOMAIN_LOGIC
  // -------------------------------------------------------------------------
  // AI: declare image-specific state here. Examples:
  //   const [cropBox, setCropBox] = React.useState({ x: 0, y: 0, w: 0, h: 0 })
  //   const [rotation, setRotation] = React.useState(0)
  //   const [annotations, setAnnotations] = React.useState<Annotation[]>([])
  // Keep all draw/transform logic in functions, not effects — easier to test
  // and easier for the reviewer to trace the audit payload back to user input.
  // -------------------------------------------------------------------------

  // Load original image into canvas on open.
  React.useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      setLoadError("Browser tidak mendukung canvas. Mohon gunakan browser lain.")
      return
    }
    setLoadingImage(true)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
      setLoadingImage(false)
    }
    img.onerror = () => {
      // Mitra-facing voice: formal "Anda", no slang. See rules § Voice.
      setLoadError("Gambar gagal dimuat. Mohon coba beberapa saat lagi.")
      setLoadingImage(false)
    }
    img.src = entity.originalUrl
  }, [open, entity.originalUrl])

  // Reset state when the modal closes — otherwise a stale reason leaks into
  // the next entity's audit row, which is exactly the kind of cross-record
  // contamination the audit trail rules are designed to prevent.
  React.useEffect(() => {
    if (!open) {
      setEditReason("")
      setReasonError(undefined)
      setLoadError(undefined)
      setLoadingImage(false)
    }
  }, [open])

  const handleSave = async () => {
    setReasonError(undefined)

    // @placeholder DOMAIN_VALIDATION
    // -----------------------------------------------------------------------
    // AI: validate image-specific fields here BEFORE the reason check. Examples:
    //   if (cropBox.w < 20 || cropBox.h < 20) {
    //     toast.error("Area crop terlalu kecil. Mohon perbesar.")
    //     return
    //   }
    //   if (rotation % 90 !== 0) { ... }
    // -----------------------------------------------------------------------

    // Mitra-facing voice — formal, no diminutive.
    if (editReason.trim().length < 3) {
      setReasonError("Alasan perubahan wajib diisi (minimum 3 karakter).")
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      toast.error("Canvas belum siap. Mohon tutup dan buka ulang.")
      return
    }

    // Convert the edited canvas to a Blob — the parent's onSave receives both
    // the audit payload (text fields) and the binary blob (for upload to
    // `proof-edited/<entity-id>/`). Splitting them keeps the BE contract clear.
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png"),
    )
    if (!blob) {
      toast.error("Gagal memproses gambar. Mohon coba lagi.")
      return
    }

    const payload: ImageActionAuditPayload = {
      entityId: entity.entityId,
      entityType: entity.entityType,
      fieldName: entity.fieldName,
      originalValue: entity.originalUrl,
      // editedValue is unknown FE-side — BE returns the URL after upload.
      // We send a sentinel; BE will overwrite with the actual `proof-edited/` URL.
      editedValue: "<pending-upload>",
      editReason: editReason.trim(),
      editorId,
    }

    setSaving(true)
    try {
      const result = await onSave(payload, blob)
      toast.success(`Perubahan tersimpan. Audit ID: ${result.auditId}`)
      onOpenChange(false)
    } catch (err) {
      // Catch-all: thrown network error and BE 4xx surface identically to caller.
      const message = err instanceof Error ? err.message : "Terjadi kesalahan."
      toast.error(`Gagal menyimpan perubahan: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>{actionLabel}</ModalTitle>
          <ModalDescription>
            Perubahan akan dicatat di audit log. Gambar asli tetap tersimpan dan
            tidak akan ditimpa.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {loadError ? (
            <div className="rounded-lg border border-error-base bg-error-lighter p-3 text-sm text-error-base">
              {loadError}
            </div>
          ) : null}

          {/*
            @placeholder DOMAIN_RENDER
            ---------------------------------------------------------------
            AI: render the action-specific overlay here. Examples:
              - Crop: absolute-positioned drag handles over the canvas
              - Rotate: a horizontal slider 0-360 with snap points at 90° intervals
              - Annotate: a toolbar with pen / eraser / color buttons
              - Redact: a "draw box" mode that fills with bg-strong-950 on save
            The canvas below is the shared draw surface — DOMAIN_RENDER chrome
            sits on top, never replaces it.
            ---------------------------------------------------------------
          */}
          <div className="relative overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-weak-50">
            <canvas
              ref={canvasRef}
              className="block h-auto w-full"
              aria-label={`Editor gambar untuk ${entity.fieldName}`}
            />
            {/* Loading skeleton — overlays canvas until img.onload fires. */}
            {loadingImage ? (
              <div
                role="status"
                aria-live="polite"
                aria-label="Memuat gambar"
                className="absolute inset-0 flex min-h-[200px] items-center justify-center bg-bg-weak-50"
              >
                <div className="size-8 animate-spin rounded-full border-2 border-stroke-soft-200 border-t-primary-base" />
                <span className="sr-only">Memuat gambar...</span>
              </div>
            ) : null}
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-reason">
              Alasan perubahan <span className="text-error-base">*</span>
            </Label>
            <Textarea
              id="edit-reason"
              value={editReason}
              onChange={(e) => {
                setEditReason(e.target.value)
                if (reasonError) setReasonError(undefined)
              }}
              placeholder="Contoh: gambar sebelumnya buram, mitra meminta foto ulang."
              rows={3}
              aria-invalid={Boolean(reasonError)}
              aria-describedby={reasonError ? "edit-reason-error" : undefined}
            />
            {reasonError ? (
              <p id="edit-reason-error" className="text-xs text-error-base">
                {reasonError}
              </p>
            ) : (
              <p className="text-xs text-text-soft-400">
                Wajib diisi. Akan ditampilkan ke mitra di riwayat audit.
              </p>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            tone="neutral"
            style="stroke"
            leftIcon={<X />}
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            type="button"
            tone="primary"
            style="filled"
            leftIcon={<Save />}
            onClick={handleSave}
            disabled={saving || Boolean(loadError)}
          >
            {saving ? "Menyimpan..." : "Simpan perubahan"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
