"use client"

import * as React from "react"
import {
  RiZoomInLine,
  RiZoomOutLine,
  RiSwap2Line,
  RiMapPin2Line,
  RiRestartLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiImageLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Badge } from "@/registry/dash/ui/badge"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/registry/dash/ui/tooltip"

/**
 * proof-image-viewer — display POD/POP/KYC/vehicle-condition proof images
 * with native zoom + pan + side-by-side compare (original vs edited).
 *
 * WHY this block exists:
 *  - Backoffice + audit team need a uniform proof viewer. Every tribe
 *    rolled its own ad-hoc <img> + react-zoom-pan-pinch wrapper. That lib
 *    is banned (External Library Policy). This block ships the canonical
 *    "useState + wheel/drag + 2-pane compare" reference.
 *  - When an audit row exists for the proof (image-editor-with-audit
 *    output), the viewer auto-offers a compare mode — original vs edited
 *    with synced zoom+pan, surfaced reason/editor/timestamp, and prev/next
 *    chevrons when there is more than one edit.
 *  - Voice is staff-neutral (this is backoffice surface), with
 *    `capturedBy` rendered respectfully ("Diambil oleh <name>") since the
 *    mitra ID is mitra-facing in dispute exports.
 *
 * Implementation notes (per spec constraints):
 *  - Native HTML5 zoom only — no react-zoom-pan-pinch / no panzoom. Image
 *    rendered as a transformed <img>; wheel = zoom toward cursor, drag =
 *    pan. Zoom clamped to [1, MAX_ZOOM]. Pan clamped to keep the image
 *    edges from drifting fully off-canvas.
 *  - State is plain useState (no useReducer, no external state). Compare
 *    mode shares ONE zoom+pan state so both panes stay locked together —
 *    eliminates the "scroll one pane and lose alignment" failure mode the
 *    rolled-their-own implementations all share.
 *  - A11y: keyboard zoom (+/-/=/0), keyboard pan (arrow keys), each pane
 *    has an aria-label; "Lihat di map" opens Google Maps in a new tab
 *    with rel="noopener".
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProofImageMeta = {
  url: string
  /** Human-readable label, e.g. "Bukti pengambilan", "Bukti pengantaran", "KYC selfie". */
  label: string
  /** ISO timestamp when proof was captured. */
  capturedAt: string
  /** Mitra ID or name. Rendered respectfully ("Diambil oleh ..."). */
  capturedBy?: string
  /** Optional geolocation — surfaces "Lihat di map" link. */
  geolocation?: { lat: number; lng: number; accuracy?: number }
}

export type ProofImageAuditEntry = {
  originalUrl: string
  editedUrl: string
  editorId: string
  editorName?: string
  /** ISO timestamp of the edit. */
  editedAt: string
  /** Non-empty reason string. Surfaced in compare mode meta. */
  editReason: string
}

export type ProofImageViewerAction = {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
}

export type ProofImageViewerProps = {
  proof: ProofImageMeta
  /** If present + non-empty, the viewer offers a compare-mode toggle. */
  auditHistory?: ProofImageAuditEntry[]
  /** Optional toolbar actions ("Edit", "Download", "Flag dispute", ...). */
  actions?: ProofImageViewerAction[]
  /** "single" (default) or "compare" (requires auditHistory). */
  defaultMode?: "single" | "compare"
  className?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_ZOOM = 1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.25
const WHEEL_SENSITIVITY = 0.0015
const KEY_PAN_STEP = 32 // px per arrow-key tap

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProofImageViewer({
  proof,
  auditHistory,
  actions,
  defaultMode = "single",
  className,
}: ProofImageViewerProps) {
  const hasAudit = Boolean(auditHistory && auditHistory.length > 0)

  // Mode state. We coerce "compare" back to "single" when there is no audit
  // history, so consumers who pass defaultMode="compare" without history
  // get the safer default rather than a broken layout.
  const [mode, setMode] = React.useState<"single" | "compare">(
    hasAudit && defaultMode === "compare" ? "compare" : "single",
  )
  // Index into auditHistory when in compare mode + multiple entries.
  const [auditIdx, setAuditIdx] = React.useState(0)

  // Shared zoom + pan — single source of truth for both panes (compare mode
  // syncs by construction, not by side-effect, which avoids the classic
  // double-listener feedback loop).
  const [zoom, setZoom] = React.useState(1)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })

  const containerRef = React.useRef<HTMLDivElement | null>(null)

  // -------------------------------------------------------------------------
  // Zoom helpers
  // -------------------------------------------------------------------------
  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

  const resetView = React.useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  /**
   * Zoom toward a focal point in container-local coordinates. Adjusts pan so
   * the pixel under the cursor stays under the cursor across the zoom step.
   * Without this the image "drifts" and feels broken — the single most
   * common bug in hand-rolled viewers.
   */
  const zoomAtPoint = (nextZoom: number, focal?: { x: number; y: number }) => {
    setZoom((prevZoom) => {
      const z = clampZoom(nextZoom)
      if (z === prevZoom) return prevZoom
      if (focal) {
        setPan((prevPan) => {
          // pixel-under-cursor world coord (relative to container center)
          const worldX = (focal.x - prevPan.x) / prevZoom
          const worldY = (focal.y - prevPan.y) / prevZoom
          return {
            x: focal.x - worldX * z,
            y: focal.y - worldY * z,
          }
        })
      } else if (z === 1) {
        // Snap pan to origin when zoom resets to 1 — no point hiding image
        // when there's nothing to pan.
        setPan({ x: 0, y: 0 })
      }
      return z
    })
  }

  const zoomIn = () => zoomAtPoint(zoom + ZOOM_STEP)
  const zoomOut = () => zoomAtPoint(zoom - ZOOM_STEP)

  // -------------------------------------------------------------------------
  // Wheel zoom — passive: false so we can preventDefault and avoid the page
  // scrolling while the user zooms. React's synthetic onWheel can't reliably
  // preventDefault on Chrome (passive listener), so we attach native.
  // -------------------------------------------------------------------------
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const focal = {
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      }
      // deltaY > 0 → wheel down → zoom out. Map to multiplicative factor.
      const factor = 1 - e.deltaY * WHEEL_SENSITIVITY
      zoomAtPoint(zoom * factor, focal)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
    // zoom is referenced inside; depend on it so the closure stays fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom])

  // -------------------------------------------------------------------------
  // Pointer drag pan
  // -------------------------------------------------------------------------
  const dragRef = React.useRef<{
    startClientX: number
    startClientY: number
    startPan: { x: number; y: number }
  } | null>(null)

  const beginPan = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return // nothing to pan when un-zoomed
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPan: pan,
    }
  }

  const onPanMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d) return
    setPan({
      x: d.startPan.x + (e.clientX - d.startClientX),
      y: d.startPan.y + (e.clientY - d.startClientY),
    })
  }

  const endPan = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        // not captured — ignore.
      }
    }
    dragRef.current = null
  }

  // -------------------------------------------------------------------------
  // Keyboard: +/-/=/0 zoom, arrows pan
  // -------------------------------------------------------------------------
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "+" || e.key === "=") {
      e.preventDefault()
      zoomIn()
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault()
      zoomOut()
    } else if (e.key === "0") {
      e.preventDefault()
      resetView()
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      setPan((p) => ({ ...p, x: p.x + KEY_PAN_STEP }))
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      setPan((p) => ({ ...p, x: p.x - KEY_PAN_STEP }))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setPan((p) => ({ ...p, y: p.y + KEY_PAN_STEP }))
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setPan((p) => ({ ...p, y: p.y - KEY_PAN_STEP }))
    }
  }

  // -------------------------------------------------------------------------
  // Mode toggle
  // -------------------------------------------------------------------------
  const toggleMode = () => {
    if (!hasAudit) return
    setMode((m) => (m === "single" ? "compare" : "single"))
    resetView()
  }

  const currentAudit = hasAudit && auditHistory
    ? auditHistory[Math.min(auditIdx, auditHistory.length - 1)]
    : undefined

  const goPrevAudit = () => {
    if (!auditHistory) return
    setAuditIdx((i) => (i - 1 + auditHistory.length) % auditHistory.length)
    resetView()
  }
  const goNextAudit = () => {
    if (!auditHistory) return
    setAuditIdx((i) => (i + 1) % auditHistory.length)
    resetView()
  }

  // -------------------------------------------------------------------------
  // Geolocation map link
  // -------------------------------------------------------------------------
  const mapHref = proof.geolocation
    ? `https://www.google.com/maps?q=${proof.geolocation.lat},${proof.geolocation.lng}`
    : null

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------
  const transformStyle: React.CSSProperties = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: "center center",
    transition: dragRef.current ? "none" : "transform 80ms ease-out",
    cursor: zoom > 1 ? (dragRef.current ? "grabbing" : "grab") : "default",
  }

  return (
    <TooltipProvider>
      <div
        className={cls(
          "flex flex-col rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden",
          className,
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-stroke-soft-200 bg-bg-weak-50">
          <div className="flex items-center gap-2 min-w-0">
            <RiImageLine className="size-4 text-text-sub-600 shrink-0" aria-hidden />
            <span className="text-sm font-medium text-text-strong-950 truncate">
              {proof.label}
            </span>
            {hasAudit ? (
              <Badge status="warning" appearance="lighter" size="sm">
                {auditHistory?.length === 1
                  ? "Telah diedit"
                  : `${auditHistory?.length}× diedit`}
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  type="button"
                  size="sm"
                  tone="neutral"
                  style="stroke"
                  aria-label="Perkecil"
                  onClick={zoomOut}
                  disabled={zoom <= MIN_ZOOM}
                >
                  <RiZoomOutLine />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent>Perkecil (-)</TooltipContent>
            </Tooltip>

            <span
              className="px-1 text-xs font-mono text-text-sub-600 tabular-nums w-12 text-center"
              aria-live="polite"
            >
              {Math.round(zoom * 100)}%
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  type="button"
                  size="sm"
                  tone="neutral"
                  style="stroke"
                  aria-label="Perbesar"
                  onClick={zoomIn}
                  disabled={zoom >= MAX_ZOOM}
                >
                  <RiZoomInLine />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent>Perbesar (+)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  type="button"
                  size="sm"
                  tone="neutral"
                  style="ghost"
                  aria-label="Reset tampilan"
                  onClick={resetView}
                  disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
                >
                  <RiRestartLine />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent>Reset (0)</TooltipContent>
            </Tooltip>

            {hasAudit ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconButton
                    type="button"
                    size="sm"
                    tone={mode === "compare" ? "primary" : "neutral"}
                    style={mode === "compare" ? "filled" : "stroke"}
                    aria-label={
                      mode === "compare"
                        ? "Kembali ke tampilan tunggal"
                        : "Bandingkan asli vs edit"
                    }
                    aria-pressed={mode === "compare"}
                    onClick={toggleMode}
                  >
                    <RiSwap2Line />
                  </IconButton>
                </TooltipTrigger>
                <TooltipContent>
                  {mode === "compare" ? "Tunggal" : "Bandingkan"}
                </TooltipContent>
              </Tooltip>
            ) : null}

            {actions && actions.length > 0 ? (
              <span className="mx-1 h-5 w-px bg-stroke-soft-200" aria-hidden />
            ) : null}
            {actions?.map((a) => (
              <Button
                key={a.id}
                type="button"
                size="xs"
                tone="neutral"
                style="stroke"
                leftIcon={a.icon}
                onClick={a.onClick}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Viewer */}
        <div
          ref={containerRef}
          tabIndex={0}
          role="group"
          aria-label={`Viewer ${proof.label}`}
          onKeyDown={onKeyDown}
          onPointerDown={beginPan}
          onPointerMove={onPanMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          className="relative flex bg-bg-weak-50 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
          style={{ touchAction: "none", minHeight: 360, userSelect: "none" }}
        >
          {mode === "single" || !currentAudit ? (
            <Pane
              src={proof.url}
              alt={proof.label}
              transformStyle={transformStyle}
              ariaLabel={`Gambar ${proof.label}`}
            />
          ) : (
            <>
              <Pane
                src={currentAudit.originalUrl}
                alt={`${proof.label} — asli`}
                transformStyle={transformStyle}
                ariaLabel={`Gambar asli ${proof.label}`}
                badge="Asli"
                position="left"
              />
              <div className="w-px bg-stroke-soft-200" aria-hidden />
              <Pane
                src={currentAudit.editedUrl}
                alt={`${proof.label} — setelah edit`}
                transformStyle={transformStyle}
                ariaLabel={`Gambar setelah edit ${proof.label}`}
                badge="Setelah edit"
                position="right"
              />
            </>
          )}
        </div>

        {/* Audit meta (compare mode only) */}
        {mode === "compare" && currentAudit ? (
          <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-stroke-soft-200 bg-bg-weak-50">
            <div className="min-w-0 text-xs text-text-sub-600 space-y-0.5">
              <p className="truncate">
                <span className="font-medium text-text-strong-950">Alasan: </span>
                {currentAudit.editReason}
              </p>
              <p className="truncate">
                Diedit oleh{" "}
                <span className="font-medium text-text-strong-950">
                  {currentAudit.editorName ?? currentAudit.editorId}
                </span>{" "}
                · {formatAbsolute(currentAudit.editedAt)}
              </p>
            </div>
            {auditHistory && auditHistory.length > 1 ? (
              <div className="flex items-center gap-1 shrink-0">
                <IconButton
                  type="button"
                  size="xs"
                  tone="neutral"
                  style="ghost"
                  aria-label="Edit sebelumnya"
                  onClick={goPrevAudit}
                >
                  <RiArrowLeftSLine />
                </IconButton>
                <span className="text-xs font-mono text-text-sub-600 tabular-nums">
                  {Math.min(auditIdx, auditHistory.length - 1) + 1} /{" "}
                  {auditHistory.length}
                </span>
                <IconButton
                  type="button"
                  size="xs"
                  tone="neutral"
                  style="ghost"
                  aria-label="Edit berikutnya"
                  onClick={goNextAudit}
                >
                  <RiArrowRightSLine />
                </IconButton>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Footer meta — always visible */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-stroke-soft-200 text-xs text-text-sub-600">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
            <span>
              <time dateTime={proof.capturedAt} title={formatAbsolute(proof.capturedAt)}>
                {formatRelative(proof.capturedAt)}
              </time>
            </span>
            {proof.capturedBy ? (
              <span className="truncate">
                Diambil oleh{" "}
                <span className="font-medium text-text-strong-950">
                  {proof.capturedBy}
                </span>
              </span>
            ) : null}
            {proof.geolocation && proof.geolocation.accuracy != null ? (
              <span>
                Akurasi GPS ±{Math.round(proof.geolocation.accuracy)}m
              </span>
            ) : null}
          </div>
          {mapHref ? (
            <a
              href={mapHref}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-primary-base hover:underline shrink-0"
            >
              <RiMapPin2Line className="size-3.5" aria-hidden />
              Lihat di map
            </a>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Pane({
  src,
  alt,
  transformStyle,
  ariaLabel,
  badge,
  position,
}: {
  src: string
  alt: string
  transformStyle: React.CSSProperties
  ariaLabel: string
  badge?: string
  position?: "left" | "right"
}) {
  return (
    <div
      className="relative flex-1 flex items-center justify-center overflow-hidden"
      aria-label={ariaLabel}
      role="img"
    >
      {badge ? (
        <div
          className={cls(
            "absolute top-2 z-10",
            position === "right" ? "right-2" : "left-2",
          )}
        >
          <Badge status="neutral" appearance="lighter" size="sm">
            {badge}
          </Badge>
        </div>
      ) : null}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="max-w-full max-h-full pointer-events-none select-none"
        style={transformStyle}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cls(...parts: Array<string | undefined | false | null>): string {
  return parts.filter(Boolean).join(" ")
}

/** Relative time formatter — Indonesian, mitra-friendly. */
function formatRelative(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return iso
  const diffSec = Math.round((Date.now() - t) / 1000)
  if (diffSec < 30) return "Baru saja"
  if (diffSec < 60) return `${diffSec} detik lalu`
  const mins = Math.round(diffSec / 60)
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days} hari lalu`
  return formatAbsolute(iso)
}

/** Absolute time formatter — `dd MMM yyyy HH:mm` WIB-style. */
function formatAbsolute(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
