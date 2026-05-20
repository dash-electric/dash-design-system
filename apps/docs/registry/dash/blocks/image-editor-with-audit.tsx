"use client"

import * as React from "react"
import {
  RiCropLine,
  RiClockwiseLine,
  RiCheckLine,
  RiCloseLine,
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
import { IconButton } from "@/registry/dash/ui/icon-button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Label } from "@/registry/dash/ui/label"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * image-editor-with-audit — canonical block for POD/POP/KYC/vehicle-condition
 * image edits with the Dash audit trail baked in.
 *
 * WHY this block exists:
 *  - The image-action.template.tsx scaffold leaves the crop/rotate domain
 *    logic as a placeholder. Every tribe has independently re-implemented it,
 *    usually by reaching for `react-easy-crop` or `cropperjs` — both banned
 *    by the External Library Policy (see dash-ai-rules.md). This block is
 *    the canonical "no external image lib, audit-first" reference.
 *  - The audit payload shape (originalUrl + editReason + crop rect + rotation)
 *    matches `t_<entity>_audit_log` 1:1 — the consumer just relays it.
 *  - Voice is formal "Anda" because POD/POP edits appear in mitra-facing
 *    audit history. See dash-ai-rules.md § Voice.
 *
 * Implementation notes:
 *  - Canvas API only — no external image manipulation lib. Crop is drawn as a
 *    selection rectangle over an HTMLCanvasElement; on save we render the
 *    rotated source clipped to the crop rect into an offscreen canvas and
 *    call `toBlob()`.
 *  - State is vanilla useState (no RHF, no zod). The validation is two-line:
 *    reason present + at least one mutation.
 *  - Drag handles are absolutely-positioned divs over the canvas, sized in
 *    *display* pixels and translated to *image* pixels at save-time using a
 *    single scale factor. This keeps the drag math reactive to container
 *    width without ever touching the canvas during a drag (no per-frame
 *    re-render).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImageEditorAuditEntry = {
  editorId: string
  editedAt: string // ISO
  editReason: string // non-empty
  originalUrl: string
  editedUrl: string // returned after upload by consumer
}

export type ImageEditorCrop = {
  x: number
  y: number
  width: number
  height: number
}

export type ImageEditorSavePayload = {
  editedBlob: Blob
  crop: ImageEditorCrop
  rotation: number
  editReason: string
}

export type ImageEditorReasonOption = {
  value: string
  label: string
}

export type ImageEditorWithAuditProps = {
  /** Current proof image URL (POD/POP/KYC/vehicle photo). */
  proofUrl: string
  /** Domain tag, surfaced in the modal copy and in the audit consumer. */
  proofType: "pickup" | "delivery" | "kyc" | "vehicle-condition" | string
  /** Current editor UUID — caller pulls from session. Logged to audit row. */
  editorId: string
  /**
   * Called after the user accepts. Consumer is responsible for uploading the
   * blob to `proof-edited/<entity-id>/` and persisting the audit row, then
   * returning the resulting URL + edit metadata. See § Audit Trail.
   */
  onSave: (params: ImageEditorSavePayload) => Promise<ImageEditorAuditEntry>
  /** Close handler (parent owns open/closed state). */
  onCancel: () => void
  /**
   * Reason dropdown options. Defaults to the 4 standard buckets + "Lainnya"
   * (which expands a free-text textarea). Override to scope per domain.
   */
  reasonOptions?: ImageEditorReasonOption[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_REASON_OPTIONS: ImageEditorReasonOption[] = [
  { value: "orientasi-salah", label: "Orientasi salah" },
  { value: "kurang-terang-blur", label: "Kurang terang / blur" },
  { value: "crop-tidak-pas", label: "Crop tidak pas" },
  { value: "object-ga-jelas", label: "Object ga jelas" },
  { value: "lainnya", label: "Lainnya" },
]

const OTHER_VALUE = "lainnya"

/** Minimum crop rect in image pixels — guards against zero-area blobs. */
const MIN_CROP_PX = 16

// Drag-state discriminator. "move" pans the whole rect; "nw"/"ne"/"sw"/"se"
// drag a corner. Stored in a ref so per-frame mousemove updates never trigger
// a React re-render (the box is repositioned via direct style writes via
// state setter; the state itself is the source of truth at drag-end).
type DragMode = "move" | "nw" | "ne" | "sw" | "se" | null

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImageEditorWithAudit({
  proofUrl,
  proofType,
  editorId,
  onSave,
  onCancel,
  reasonOptions = DEFAULT_REASON_OPTIONS,
}: ImageEditorWithAuditProps) {
  // Image natural dimensions are stable once loaded.
  const [imgDims, setImgDims] = React.useState<{ w: number; h: number } | null>(
    null,
  )
  const [loadError, setLoadError] = React.useState<string | undefined>(undefined)

  // Rotation is multiples of 90° (0 / 90 / 180 / 270). Display-only counter
  // — translated to a canvas transform at save-time.
  const [rotation, setRotation] = React.useState(0)

  // Crop rect in IMAGE pixels (always rotated-space — see toBlobRect).
  // We seed to "full image" on load so a user who only wants to rotate
  // doesn't have to touch the crop handles. Stored in image-pixel space,
  // not display-pixel space, so resizing the modal doesn't lose the crop.
  const [crop, setCrop] = React.useState<ImageEditorCrop | null>(null)

  // Reason fields. `reasonValue` is the dropdown choice; `reasonText` is the
  // free-text override (only required when reasonValue === "lainnya").
  const [reasonValue, setReasonValue] = React.useState("")
  const [reasonText, setReasonText] = React.useState("")
  const [reasonError, setReasonError] = React.useState<string | undefined>(
    undefined,
  )
  const [mutationError, setMutationError] = React.useState<string | undefined>(
    undefined,
  )

  const [saving, setSaving] = React.useState(false)

  const imgElRef = React.useRef<HTMLImageElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  // Persist the source image for canvas draw at save-time (separate from
  // <img> render — keeps DOM image as the displayed surface, this one as
  // the pixel source).
  const sourceImgRef = React.useRef<HTMLImageElement | null>(null)

  // -------------------------------------------------------------------------
  // Image load
  // -------------------------------------------------------------------------
  React.useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      sourceImgRef.current = img
      setImgDims({ w: img.naturalWidth, h: img.naturalHeight })
      // Seed crop to full image so "rotate-only" edits pass the validator.
      setCrop({ x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      setLoadError(
        "Gambar gagal dimuat. Mohon periksa koneksi Anda dan coba beberapa saat lagi.",
      )
    }
    img.src = proofUrl
  }, [proofUrl])

  // -------------------------------------------------------------------------
  // Derived: rotated image dimensions in image pixels
  // -------------------------------------------------------------------------
  const rotatedDims = React.useMemo(() => {
    if (!imgDims) return null
    const swap = rotation === 90 || rotation === 270
    return {
      w: swap ? imgDims.h : imgDims.w,
      h: swap ? imgDims.w : imgDims.h,
    }
  }, [imgDims, rotation])

  // When rotation changes, reset the crop to the new full-frame bounds.
  // Reason: keeping a stale rect across rotation produces invalid coords
  // and a worse UX than the user re-cropping after rotating.
  const lastRotationRef = React.useRef(rotation)
  React.useEffect(() => {
    if (lastRotationRef.current !== rotation && rotatedDims) {
      setCrop({ x: 0, y: 0, width: rotatedDims.w, height: rotatedDims.h })
      lastRotationRef.current = rotation
    }
  }, [rotation, rotatedDims])

  // -------------------------------------------------------------------------
  // Display scale (image pixels ↔ container pixels)
  // -------------------------------------------------------------------------
  const [containerWidth, setContainerWidth] = React.useState(0)
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setContainerWidth(el.clientWidth)
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [imgDims])

  const displayScale = React.useMemo(() => {
    if (!rotatedDims || !containerWidth) return 1
    return containerWidth / rotatedDims.w
  }, [rotatedDims, containerWidth])

  // -------------------------------------------------------------------------
  // Drag handlers — manipulate `crop` in image-pixel space
  // -------------------------------------------------------------------------
  const dragRef = React.useRef<{
    mode: DragMode
    startClientX: number
    startClientY: number
    startCrop: ImageEditorCrop
  } | null>(null)

  const beginDrag = (mode: Exclude<DragMode, null>) =>
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!crop) return
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      dragRef.current = {
        mode,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startCrop: crop,
      }
    }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d || !rotatedDims) return
    const dx = (e.clientX - d.startClientX) / displayScale
    const dy = (e.clientY - d.startClientY) / displayScale
    let { x, y, width, height } = d.startCrop
    if (d.mode === "move") {
      x = clamp(x + dx, 0, rotatedDims.w - width)
      y = clamp(y + dy, 0, rotatedDims.h - height)
    } else {
      // Corner drag — adjust the affected edge then clamp.
      if (d.mode === "nw") {
        const nx = clamp(x + dx, 0, x + width - MIN_CROP_PX)
        const ny = clamp(y + dy, 0, y + height - MIN_CROP_PX)
        width = width + (x - nx)
        height = height + (y - ny)
        x = nx
        y = ny
      } else if (d.mode === "ne") {
        const nw = clamp(width + dx, MIN_CROP_PX, rotatedDims.w - x)
        const ny = clamp(y + dy, 0, y + height - MIN_CROP_PX)
        height = height + (y - ny)
        width = nw
        y = ny
      } else if (d.mode === "sw") {
        const nx = clamp(x + dx, 0, x + width - MIN_CROP_PX)
        const nh = clamp(height + dy, MIN_CROP_PX, rotatedDims.h - y)
        width = width + (x - nx)
        x = nx
        height = nh
      } else if (d.mode === "se") {
        width = clamp(width + dx, MIN_CROP_PX, rotatedDims.w - x)
        height = clamp(height + dy, MIN_CROP_PX, rotatedDims.h - y)
      }
    }
    setCrop({ x, y, width, height })
    if (mutationError) setMutationError(undefined)
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        // pointer wasn't captured — ignore.
      }
    }
    dragRef.current = null
  }

  // -------------------------------------------------------------------------
  // Rotate
  // -------------------------------------------------------------------------
  const rotateClockwise = () => {
    setRotation((r) => (r + 90) % 360)
    if (mutationError) setMutationError(undefined)
  }

  // -------------------------------------------------------------------------
  // Derived: was anything actually edited?
  // -------------------------------------------------------------------------
  const hasMutation = React.useMemo(() => {
    if (rotation !== 0) return true
    if (!crop || !rotatedDims) return false
    return (
      crop.x !== 0 ||
      crop.y !== 0 ||
      crop.width !== rotatedDims.w ||
      crop.height !== rotatedDims.h
    )
  }, [rotation, crop, rotatedDims])

  // -------------------------------------------------------------------------
  // Save flow
  // -------------------------------------------------------------------------
  const resolveReason = (): string | null => {
    if (!reasonValue) return null
    if (reasonValue === OTHER_VALUE) {
      const t = reasonText.trim()
      return t.length >= 3 ? t : null
    }
    return reasonOptions.find((o) => o.value === reasonValue)?.label ?? null
  }

  const handleSave = async () => {
    setReasonError(undefined)
    setMutationError(undefined)

    const reason = resolveReason()
    if (!reason) {
      setReasonError(
        reasonValue === OTHER_VALUE
          ? 'Alasan wajib diisi (minimum 3 karakter) ketika memilih "Lainnya".'
          : "Mohon pilih alasan perubahan.",
      )
      return
    }
    if (!hasMutation) {
      setMutationError(
        "Belum ada perubahan. Mohon crop atau rotasi gambar terlebih dahulu.",
      )
      return
    }
    if (!sourceImgRef.current || !imgDims || !crop || !rotatedDims) {
      toast.error("Gambar belum siap. Mohon coba beberapa saat lagi.")
      return
    }

    const blob = await renderEditedBlob({
      source: sourceImgRef.current,
      sourceDims: imgDims,
      rotation,
      crop,
    })
    if (!blob) {
      toast.error("Gagal memproses gambar. Mohon coba lagi.")
      return
    }

    setSaving(true)
    try {
      await onSave({ editedBlob: blob, crop, rotation, editReason: reason })
      toast.success(SUCCESS_MESSAGE[proofType] ?? "Bukti ter-update")
      onCancel()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.")
    } finally {
      setSaving(false)
    }
  }

  // -------------------------------------------------------------------------
  // Cancel flow — confirm if there are pending changes
  // -------------------------------------------------------------------------
  const handleCancel = () => {
    if (hasMutation || reasonValue || reasonText) {
      if (
        typeof window !== "undefined" &&
        !window.confirm("Buang perubahan? Perubahan yang belum disimpan akan hilang.")
      ) {
        return
      }
    }
    onCancel()
  }

  // -------------------------------------------------------------------------
  // Keyboard: Esc = cancel, Enter = save (when not focused inside textarea)
  // -------------------------------------------------------------------------
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      handleCancel()
      return
    }
    if (e.key === "Enter" && !e.shiftKey) {
      const tag = (e.target as HTMLElement).tagName
      if (tag !== "TEXTAREA") {
        e.preventDefault()
        void handleSave()
      }
    }
  }

  // -------------------------------------------------------------------------
  // Render — crop overlay in display pixels
  // -------------------------------------------------------------------------
  const overlay = crop && rotatedDims && displayScale > 0
    ? {
        left: crop.x * displayScale,
        top: crop.y * displayScale,
        width: crop.width * displayScale,
        height: crop.height * displayScale,
      }
    : null

  return (
    <Modal open onOpenChange={(o) => { if (!o) handleCancel() }}>
      <ModalContent className="max-w-3xl" onKeyDown={onKeyDown}>
        <ModalHeader>
          <ModalTitle>{TITLE_MESSAGE[proofType] ?? "Edit bukti"}</ModalTitle>
          <ModalDescription>
            Perubahan akan dicatat di audit log. Gambar asli tetap tersimpan
            dan tidak akan ditimpa.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {loadError ? (
            <div
              role="alert"
              className="rounded-lg border border-error-base bg-error-lighter p-3 text-sm text-error-base"
            >
              {loadError}
            </div>
          ) : null}

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-text-sub-600">
              <RiCropLine aria-hidden className="size-4" />
              <span>
                Geser sudut untuk memotong area. Tombol rotasi memutar 90°.
              </span>
            </div>
            <IconButton
              type="button"
              size="sm"
              tone="neutral"
              style="stroke"
              aria-label="Rotasi 90 derajat searah jarum jam"
              onClick={rotateClockwise}
              disabled={!imgDims || saving}
            >
              <RiClockwiseLine />
            </IconButton>
          </div>

          {/* Canvas + crop overlay */}
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-weak-50 select-none"
            style={{ touchAction: "none" }}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* Display image (rotated via CSS — purely visual). Save renders
                its own pixel-perfect canvas off-screen. */}
            {imgDims ? (
              <img
                ref={imgElRef}
                src={proofUrl}
                alt={`Bukti ${proofType}`}
                draggable={false}
                className="block w-full h-auto pointer-events-none"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  // Reserve the post-rotation height so the container reflows.
                  // We size width to 100% and let height follow naturally for
                  // 0/180°. For 90/270° we swap aspect at the container level
                  // by sizing the container's aspectRatio.
                }}
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-text-sub-600">
                Memuat gambar...
              </div>
            )}

            {/* Aspect ratio shim — keeps the container the right shape after
                rotation so overlay coordinates line up. */}
            {imgDims && rotatedDims ? (
              <div
                aria-hidden
                className="pointer-events-none"
                style={{
                  position: "absolute",
                  inset: 0,
                  aspectRatio: `${rotatedDims.w} / ${rotatedDims.h}`,
                }}
              />
            ) : null}

            {/* Dark mask outside the crop rect */}
            {overlay ? (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0 bg-bg-strong-950/40 pointer-events-none"
                  style={{
                    clipPath: `polygon(
                      0 0, 100% 0, 100% 100%, 0 100%,
                      0 ${overlay.top}px,
                      ${overlay.left}px ${overlay.top}px,
                      ${overlay.left}px ${overlay.top + overlay.height}px,
                      ${overlay.left + overlay.width}px ${overlay.top + overlay.height}px,
                      ${overlay.left + overlay.width}px ${overlay.top}px,
                      0 ${overlay.top}px
                    )`,
                  }}
                />
                <div
                  role="group"
                  aria-label="Area crop"
                  className="absolute border-2 border-primary-base"
                  style={{
                    left: overlay.left,
                    top: overlay.top,
                    width: overlay.width,
                    height: overlay.height,
                    cursor: "move",
                  }}
                  onPointerDown={beginDrag("move")}
                >
                  <CropHandle position="nw" onPointerDown={beginDrag("nw")} />
                  <CropHandle position="ne" onPointerDown={beginDrag("ne")} />
                  <CropHandle position="sw" onPointerDown={beginDrag("sw")} />
                  <CropHandle position="se" onPointerDown={beginDrag("se")} />
                </div>
              </>
            ) : null}
          </div>

          {mutationError ? (
            <p className="text-xs text-error-base">{mutationError}</p>
          ) : null}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="edit-reason-select">
              Alasan perubahan <span className="text-error-base">*</span>
            </Label>
            <Select
              value={reasonValue}
              onValueChange={(v) => {
                setReasonValue(v)
                if (reasonError) setReasonError(undefined)
              }}
            >
              <SelectTrigger id="edit-reason-select" aria-invalid={Boolean(reasonError)}>
                <SelectValue placeholder="Pilih alasan" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {reasonValue === OTHER_VALUE ? (
              <Textarea
                aria-label="Alasan perubahan (lainnya)"
                value={reasonText}
                onChange={(e) => {
                  setReasonText(e.target.value)
                  if (reasonError) setReasonError(undefined)
                }}
                placeholder="Tuliskan alasan perubahan secara spesifik."
                rows={3}
                invalid={Boolean(reasonError)}
              />
            ) : null}

            {reasonError ? (
              <p className="text-xs text-error-base">{reasonError}</p>
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
            leftIcon={<RiCloseLine />}
            onClick={handleCancel}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            type="button"
            tone="primary"
            style="filled"
            leftIcon={<RiCheckLine />}
            onClick={handleSave}
            loading={saving}
            disabled={saving || Boolean(loadError)}
          >
            {saving ? "Menyimpan..." : "Simpan perubahan"}
          </Button>
          {/* Hidden helper text for editorId — surfaces in audit row only. */}
          <span className="sr-only">Editor: {editorId}</span>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CropHandle({
  position,
  onPointerDown,
}: {
  position: "nw" | "ne" | "sw" | "se"
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
}) {
  const pos: React.CSSProperties = {
    position: "absolute",
    width: 14,
    height: 14,
    cursor:
      position === "nw" || position === "se" ? "nwse-resize" : "nesw-resize",
  }
  if (position === "nw") {
    pos.left = -7
    pos.top = -7
  } else if (position === "ne") {
    pos.right = -7
    pos.top = -7
  } else if (position === "sw") {
    pos.left = -7
    pos.bottom = -7
  } else {
    pos.right = -7
    pos.bottom = -7
  }
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={`Crop handle ${position}`}
      onPointerDown={onPointerDown}
      style={pos}
      className="rounded-sm bg-bg-white-0 border-2 border-primary-base"
    />
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number) {
  if (max < min) return min
  return Math.min(Math.max(v, min), max)
}

/**
 * Render the rotated + cropped image into an offscreen canvas and resolve as
 * a PNG Blob. The `crop` is in rotated-image-pixel space; we apply rotation
 * to the source then take a sub-rect.
 */
async function renderEditedBlob({
  source,
  sourceDims,
  rotation,
  crop,
}: {
  source: HTMLImageElement
  sourceDims: { w: number; h: number }
  rotation: number
  crop: ImageEditorCrop
}): Promise<Blob | null> {
  // Step 1: draw rotated full image into an intermediate canvas sized to the
  // rotated bounding box. Step 2: clip out the crop rect.
  const rotW = rotation === 90 || rotation === 270 ? sourceDims.h : sourceDims.w
  const rotH = rotation === 90 || rotation === 270 ? sourceDims.w : sourceDims.h

  const intermediate = document.createElement("canvas")
  intermediate.width = rotW
  intermediate.height = rotH
  const ictx = intermediate.getContext("2d")
  if (!ictx) return null
  ictx.save()
  ictx.translate(rotW / 2, rotH / 2)
  ictx.rotate((rotation * Math.PI) / 180)
  ictx.drawImage(source, -sourceDims.w / 2, -sourceDims.h / 2)
  ictx.restore()

  const out = document.createElement("canvas")
  out.width = Math.max(1, Math.round(crop.width))
  out.height = Math.max(1, Math.round(crop.height))
  const octx = out.getContext("2d")
  if (!octx) return null
  octx.drawImage(
    intermediate,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    out.width,
    out.height,
  )

  return new Promise<Blob | null>((resolve) =>
    out.toBlob((b) => resolve(b), "image/png"),
  )
}

const TITLE_MESSAGE: Record<string, string> = {
  pickup: "Edit bukti pengambilan",
  delivery: "Edit bukti pengantaran",
  kyc: "Edit dokumen KYC",
  "vehicle-condition": "Edit foto kondisi kendaraan",
}

const SUCCESS_MESSAGE: Record<string, string> = {
  pickup: "Bukti pengambilan ter-update",
  delivery: "Bukti pengantaran ter-update",
  kyc: "Dokumen KYC ter-update",
  "vehicle-condition": "Foto kondisi kendaraan ter-update",
}
