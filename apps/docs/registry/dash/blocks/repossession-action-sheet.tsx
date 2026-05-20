"use client"

import * as React from "react"
import {
  RiCheckLine as Check,
  RiCloseLine as Close,
  RiAlertLine as Alert,
  RiShieldCheckLine as Shield,
  RiArrowGoBackLine as Reopen,
  RiSendPlaneLine as Send,
  RiMapPin2Line as Pin,
  RiCameraLine as Camera,
  RiArrowLeftLine as ArrowLeft,
} from "@remixicon/react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/registry/dash/ui/drawer"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/registry/dash/ui/alert-dialog"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Badge, type Status } from "@/registry/dash/ui/badge"
import { Label } from "@/registry/dash/ui/label"
import { FileUploadDropzone } from "@/registry/dash/ui/file-upload"
import { toast } from "@/registry/dash/ui/toaster"
import { cn } from "@/registry/dash/lib/utils"

/**
 * RepossessionActionSheet — mobile-first bottom drawer for the 7-state
 * repossession workflow (Tribe-Express / fleet ops).
 *
 * State machine (canonical, BE-authoritative):
 *   OPEN ──► IN_PROGRESS ──┬─► FOUND ─────────────────────► CLOSED
 *                          ├─► POTENTIAL_LOSS ─► PENDING_APPROVAL ─┬─► WRITTEN_OFF ─► CLOSED
 *                          │                                       └─► (rejected → IN_PROGRESS)
 *                          └─► (CLOSED is terminal, only via FOUND or WRITTEN_OFF path)
 *
 * Reversible: every non-terminal state can be `reopen`-ed to IN_PROGRESS
 * (subject to role gate). Terminal-irreversible: WRITTEN_OFF, CLOSED — caller
 * MUST gate `reopen` on those server-side (we keep the action available so
 * fleet-manager can correct mistakes within a grace window; finance owns the
 * permanent lock).
 *
 * Component contract:
 *  - Stateless re: status. Caller passes `currentStatus` + the list of
 *    `availableActions` the BE thinks this role can perform. We render only
 *    that intersection — never invent transitions client-side.
 *  - `onAction` MUST persist the audit row server-side (action + note +
 *    photos + location + actor + timestamp). The component does NOT mutate
 *    `currentStatus` locally; the caller re-passes the new status after the
 *    BE write succeeds, identical to MultiStageApproval contract.
 *  - Irreversible actions (approve_writeoff, close) require explicit
 *    confirm-dialog acknowledgement before `onAction` is invoked.
 *
 * Mobile-first:
 *  - `side="bottom"`, `size="xl"` (60vh) so the sheet stops short of the
 *    status bar and the field-ops user can still see the underlying map /
 *    vehicle photo. Tap targets are size="lg" (40px) per Figma mobile
 *    guidance.
 *  - GPS capture is opt-in via a single tap; geolocation prompt fires only
 *    when the operator asks for it (battery-friendly, privacy-respectful).
 *
 * Voice: formal "Anda" (Indonesian) for field-ops + fleet-manager surfaces,
 * staff-neutral for finance + viewer. Mitra-facing messages live in a
 * separate driver-app notification block (intentionally out of scope).
 */

// ---------------------------------------------------------------------------
// Types — also exported for caller use
// ---------------------------------------------------------------------------

export type RepoStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "FOUND"
  | "POTENTIAL_LOSS"
  | "PENDING_APPROVAL"
  | "WRITTEN_OFF"
  | "CLOSED"

export type RepoAction =
  | "mark_found"
  | "mark_potential_loss"
  | "request_approval"
  | "approve_writeoff"
  | "reject_writeoff"
  | "close"
  | "reopen"

export type RepoActorRole =
  | "field-ops"
  | "fleet-manager"
  | "finance"
  | "viewer"

export type RepoActionPayload = {
  note: string
  photos?: File[]
  location?: { lat: number; lng: number }
}

export type RepossessionActionSheetProps = {
  repoId: string
  vehicleId: string
  currentStatus: RepoStatus
  /** Available actions for current user, scoped by BE role + state machine. */
  availableActions: RepoAction[]
  currentUserRole: RepoActorRole
  onAction: (action: RepoAction, payload: RepoActionPayload) => Promise<void>
  onClose: () => void
  open: boolean
  /** Override copy. Default: "Repo #<repoId> · Kendaraan <vehicleId>". */
  title?: string
}

// ---------------------------------------------------------------------------
// State machine guard — single source of truth for which actions are LEGAL
// for a given status. Used to filter `availableActions` defensively even
// when the BE leaks an illegal transition.
// ---------------------------------------------------------------------------

const LEGAL_ACTIONS: Record<RepoStatus, RepoAction[]> = {
  OPEN: ["mark_found", "mark_potential_loss"],
  IN_PROGRESS: ["mark_found", "mark_potential_loss"],
  FOUND: ["close", "reopen"],
  POTENTIAL_LOSS: ["request_approval", "reopen"],
  PENDING_APPROVAL: ["approve_writeoff", "reject_writeoff"],
  WRITTEN_OFF: ["close", "reopen"],
  CLOSED: ["reopen"],
}

/** Irreversible actions — surface a confirm dialog before invoking `onAction`. */
const IRREVERSIBLE: RepoAction[] = ["approve_writeoff", "close"]

// ---------------------------------------------------------------------------
// Display metadata — single source for copy + iconography + badge tone.
// ---------------------------------------------------------------------------

const STATUS_META: Record<RepoStatus, { label: string; status: Status }> = {
  OPEN: { label: "Terbuka", status: "information" },
  IN_PROGRESS: { label: "Proses Lapangan", status: "feature" },
  FOUND: { label: "Ditemukan", status: "success" },
  POTENTIAL_LOSS: { label: "Potensi Hilang", status: "warning" },
  PENDING_APPROVAL: { label: "Menunggu Approval", status: "highlighted" },
  WRITTEN_OFF: { label: "Write-Off", status: "error" },
  CLOSED: { label: "Selesai", status: "neutral" },
}

const ACTION_META: Record<
  RepoAction,
  { label: string; icon: React.ElementType; tone: "primary" | "neutral" | "destructive" }
> = {
  mark_found: { label: "Tandai Ditemukan", icon: Check, tone: "primary" },
  mark_potential_loss: { label: "Tandai Potensi Hilang", icon: Alert, tone: "neutral" },
  request_approval: { label: "Ajukan Approval Write-Off", icon: Send, tone: "primary" },
  approve_writeoff: { label: "Setujui Write-Off", icon: Shield, tone: "destructive" },
  reject_writeoff: { label: "Tolak Write-Off", icon: Close, tone: "neutral" },
  close: { label: "Tutup Kasus", icon: Check, tone: "primary" },
  reopen: { label: "Buka Kembali", icon: Reopen, tone: "neutral" },
}

const NOTE_MIN_LEN = 10

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RepossessionActionSheet({
  repoId,
  vehicleId,
  currentStatus,
  availableActions,
  currentUserRole,
  onAction,
  onClose,
  open,
  title,
}: RepossessionActionSheetProps) {
  const [activeAction, setActiveAction] = React.useState<RepoAction | null>(null)
  const [note, setNote] = React.useState("")
  const [photos, setPhotos] = React.useState<File[]>([])
  const [location, setLocation] = React.useState<{ lat: number; lng: number } | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  // Defensive intersection: BE role-list ∩ state machine legal-list. Never
  // render an action the state machine forbids even if the BE sends it.
  const renderableActions = React.useMemo(() => {
    const legal = new Set(LEGAL_ACTIONS[currentStatus])
    return availableActions.filter((a) => legal.has(a))
  }, [availableActions, currentStatus])

  // Reset transient form state whenever the sheet opens or the action changes.
  React.useEffect(() => {
    if (!open) {
      setActiveAction(null)
      setNote("")
      setPhotos([])
      setLocation(null)
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }, [open])

  const resetForm = () => {
    setActiveAction(null)
    setNote("")
    setPhotos([])
    setLocation(null)
  }

  const noteValid = note.trim().length >= NOTE_MIN_LEN
  const photoCapped = photos.length <= 3 && photos.length >= 0
  const formValid = noteValid && photoCapped

  const handleCaptureLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Perangkat ini tidak mendukung GPS")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        toast.success("Lokasi tercatat")
      },
      () => {
        toast.error("Gagal mengambil lokasi", {
          description: "Izinkan akses GPS pada pengaturan browser/aplikasi.",
        })
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }

  const handlePhotos = (files: File[]) => {
    // Cap to 3 (combined with whatever's already attached) — silently slice
    // and toast so the user sees what happened.
    const next = [...photos, ...files].slice(0, 3)
    if (photos.length + files.length > 3) {
      toast("Maksimal 3 foto", {
        description: "Foto tambahan diabaikan. Hapus salah satu untuk mengganti.",
      })
    }
    setPhotos(next)
  }

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  const submit = async () => {
    if (!activeAction || !formValid) return
    if (IRREVERSIBLE.includes(activeAction) && !confirmOpen) {
      setConfirmOpen(true)
      return
    }
    try {
      setSubmitting(true)
      await onAction(activeAction, {
        note: note.trim(),
        photos: photos.length ? photos : undefined,
        location: location ?? undefined,
      })
      toast.success(`${ACTION_META[activeAction].label} tercatat`)
      resetForm()
      onClose()
    } catch (err) {
      toast.error("Aksi gagal dikirim", {
        description: err instanceof Error ? err.message : "Coba lagi sebentar lagi.",
      })
    } finally {
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }

  const meta = STATUS_META[currentStatus]
  const headerTitle = title ?? `Repo #${repoId} · Kendaraan ${vehicleId}`

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose()
        }}
      >
        <DrawerContent side="bottom" size="xl" className="rounded-t-[20px]">
          <DrawerHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <DrawerTitle className="truncate">{headerTitle}</DrawerTitle>
                <DrawerDescription className="mt-1">
                  Status saat ini menentukan aksi yang dapat Anda lakukan.
                </DrawerDescription>
              </div>
              <Badge status={meta.status} appearance="lighter" type="dot">
                {meta.label}
              </Badge>
            </div>
          </DrawerHeader>

          <DrawerBody className="pb-2">
            {activeAction == null ? (
              <ActionList
                actions={renderableActions}
                role={currentUserRole}
                onPick={(a) => setActiveAction(a)}
              />
            ) : (
              <ActionForm
                action={activeAction}
                note={note}
                noteValid={noteValid}
                photos={photos}
                location={location}
                onNote={setNote}
                onPickPhotos={handlePhotos}
                onRemovePhoto={removePhoto}
                onCaptureLocation={handleCaptureLocation}
                onBack={resetForm}
              />
            )}
          </DrawerBody>

          <DrawerFooter>
            {activeAction == null ? (
              <Button
                size="lg"
                style="stroke"
                tone="neutral"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Tutup
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  style="stroke"
                  tone="neutral"
                  onClick={resetForm}
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  Kembali
                </Button>
                <Button
                  size="lg"
                  style="filled"
                  tone={ACTION_META[activeAction].tone}
                  onClick={submit}
                  loading={submitting}
                  disabled={!formValid || submitting}
                  className="w-full sm:w-auto"
                >
                  Kirim
                </Button>
              </>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!next) setConfirmOpen(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi aksi permanen</AlertDialogTitle>
            <AlertDialogDescription>
              {activeAction === "approve_writeoff"
                ? "Write-off akan mengunci unit ini sebagai kerugian dan tidak dapat dibatalkan tanpa keterlibatan Finance. Lanjutkan?"
                : "Penutupan kasus akan mengarsipkan riwayat repossession ini. Lanjutkan?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button size="md" style="stroke" tone="neutral" disabled={submitting}>
                Batal
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                size="md"
                style="filled"
                tone={activeAction === "approve_writeoff" ? "destructive" : "primary"}
                loading={submitting}
                disabled={submitting}
                onClick={(e) => {
                  e.preventDefault()
                  void submit()
                }}
              >
                Ya, Lanjutkan
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ---------------------------------------------------------------------------
// ActionList — first screen of the drawer body. One stacked button per
// available action, with subtle role-aware copy under each label.
// ---------------------------------------------------------------------------

function ActionList({
  actions,
  role,
  onPick,
}: {
  actions: RepoAction[]
  role: RepoActorRole
  onPick: (a: RepoAction) => void
}) {
  if (role === "viewer" || actions.length === 0) {
    return (
      <div className="text-sm text-text-sub-600 py-4">
        Anda tidak memiliki aksi yang tersedia pada status ini.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {actions.map((a) => {
        const m = ACTION_META[a]
        const Icon = m.icon
        return (
          <button
            key={a}
            type="button"
            onClick={() => onPick(a)}
            className={cn(
              "w-full flex items-center justify-between gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3 text-left",
              "hover:bg-bg-weak-50 active:bg-bg-soft-200 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950",
            )}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-lg",
                  m.tone === "destructive" && "bg-(--state-error-base)/10 text-error-base",
                  m.tone === "primary" && "bg-(--primary-alpha-10) text-primary",
                  m.tone === "neutral" && "bg-bg-weak-50 text-text-sub-600",
                )}
              >
                <Icon strokeWidth={1.75} className="size-5" />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-text-strong-950 truncate">
                  {m.label}
                </span>
                <span className="text-xs text-text-sub-600 truncate">
                  {IRREVERSIBLE.includes(a)
                    ? "Permanen · butuh konfirmasi"
                    : "Reversible · dapat dibuka kembali"}
                </span>
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ActionForm — inline form for the chosen action. Required note, optional
// photos (max 3), optional GPS capture.
// ---------------------------------------------------------------------------

function ActionForm({
  action,
  note,
  noteValid,
  photos,
  location,
  onNote,
  onPickPhotos,
  onRemovePhoto,
  onCaptureLocation,
  onBack,
}: {
  action: RepoAction
  note: string
  noteValid: boolean
  photos: File[]
  location: { lat: number; lng: number } | null
  onNote: (v: string) => void
  onPickPhotos: (files: File[]) => void
  onRemovePhoto: (idx: number) => void
  onCaptureLocation: () => void
  onBack: () => void
}) {
  const meta = ACTION_META[action]
  const Icon = meta.icon

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <IconButton size="sm" style="ghost" tone="neutral" onClick={onBack} aria-label="Kembali">
          <ArrowLeft strokeWidth={1.75} />
        </IconButton>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-text-strong-950">
          <Icon strokeWidth={1.75} className="size-4" />
          {meta.label}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="repo-action-note">
          Catatan <span className="text-error-base">*</span>
        </Label>
        <Textarea
          id="repo-action-note"
          value={note}
          onChange={(e) => onNote(e.target.value)}
          rows={4}
          placeholder="Jelaskan kondisi lapangan secara ringkas dan faktual (minimal 10 karakter)."
          invalid={note.length > 0 && !noteValid}
        />
        <span
          className={cn(
            "text-xs",
            noteValid ? "text-text-sub-600" : "text-error-base",
          )}
        >
          {noteValid
            ? `${note.length} karakter`
            : `${Math.max(0, NOTE_MIN_LEN - note.trim().length)} karakter lagi`}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Foto bukti (opsional, maks. 3)</Label>
        <FileUploadDropzone
          accept="image/*"
          multiple
          size="sm"
          onFiles={onPickPhotos}
          title="Lampirkan foto"
          description="JPG / PNG · maksimal 3 file"
          browseLabel="Pilih foto"
        />
        {photos.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {photos.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 text-xs text-text-sub-600"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Camera strokeWidth={1.75} className="size-4 shrink-0" />
                  <span className="truncate">{f.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemovePhoto(i)}
                  className="text-text-sub-600 hover:text-error-base"
                  aria-label={`Hapus foto ${f.name}`}
                >
                  <Close strokeWidth={1.75} className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Lokasi (opsional)</Label>
        {location ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 text-xs text-text-sub-600">
            <span className="flex items-center gap-2">
              <Pin strokeWidth={1.75} className="size-4 text-success-base" />
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </span>
            <Button size="xs" style="ghost" tone="neutral" onClick={onCaptureLocation}>
              Perbarui
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            style="stroke"
            tone="neutral"
            leftIcon={<Pin strokeWidth={1.75} />}
            onClick={onCaptureLocation}
            className="self-start"
          >
            Tangkap koordinat GPS
          </Button>
        )}
      </div>
    </div>
  )
}

// Re-export the state machine map for callers that want to render
// preview-only action lists without re-implementing the guard.
export { LEGAL_ACTIONS as REPO_LEGAL_ACTIONS }
