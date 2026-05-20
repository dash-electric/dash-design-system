"use client"

import * as React from "react"
import {
  RiUploadCloud2Line as UploadCloud,
  RiMapPin2Line as MapPin,
  RiCloseLine as XIcon,
  RiCheckLine as CheckIcon,
  RiFileLine as FileIcon,
  RiImageLine as ImageIcon,
  RiAlertLine as AlertIcon,
  RiErrorWarningLine as ErrorIcon,
  RiLoader4Line as Loader,
  RiRefreshLine as Retry,
} from "@remixicon/react"

import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Input, InputRoot } from "@/registry/dash/ui/input"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Label } from "@/registry/dash/ui/label"
import { Field, FieldGroup, FieldDescription } from "@/registry/dash/ui/field"
import { RadioGroup, RadioItem } from "@/registry/dash/ui/radio"
import { StatusBadge } from "@/registry/dash/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/dash/ui/select"
import { toast } from "@/registry/dash/ui/toaster"
import { formatBytes } from "@/registry/dash/ui/file-upload"
import { cn } from "@/registry/dash/lib/utils"

/**
 * incident-form-with-attach — incident report form for Dash backoffice ops +
 * mitra mobile. Handles 4-state incident lifecycle (OPEN → IN_MAINTENANCE →
 * MAINTENANCE_COMPLETED → CLOSED) at the OPEN-creation surface only.
 *
 * WHY this is its own block (not bulk-upload + form glued):
 *  - Voice mode flips on `reporterRole`: mitra → formal "Anda" + apologetic
 *    severity copy; ops/client → neutral operator tone. Caller shouldn't have
 *    to manage two parallel forms.
 *  - Severity carries color semantics that must stay consistent across the
 *    state machine (RED critical = pages on-call, GREEN low = email digest).
 *    Encoded once here so consumers can't drift.
 *  - Geolocation is browser-API gated — async permission flow, with toast on
 *    denial. Wrapping it inline keeps the field row honest about its real cost.
 *  - Audit log row generated in payload (reporterId/role/occurredAt) is
 *    mandatory per CLAUDE.md cardinal rule #3. Cannot be opt-out.
 *
 * Attachments use the same drop-zone pattern as bulk-upload-with-status
 * (Wave 4.5) but constrained to 5 files × 10MB and validated inline — no
 * separate concurrency queue because incident reports are user-paced
 * (one-at-a-time review before submit).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IncidentType =
  | "vehicle-accident"
  | "mitra-injury"
  | "customer-complaint"
  | "vehicle-damage"
  | "theft"
  | "other"

export type IncidentSeverity = "low" | "medium" | "high" | "critical"

export type IncidentAttachment = {
  id: string
  name: string
  url: string
  mimeType: string
}

export type IncidentFormPayload = {
  type: IncidentType
  severity: IncidentSeverity
  title: string
  description: string
  occurredAt: string
  location?: { address: string; lat?: number; lng?: number }
  vehicleId?: string
  mitraId?: string
  attachments: IncidentAttachment[]
  reporterId: string
  reporterRole: "mitra" | "ops" | "client"
}

export type IncidentFormProps = {
  reporterId: string
  reporterRole: "mitra" | "ops" | "client"
  /** Restrict the type dropdown — useful for role-gated reports. */
  visibleTypes?: IncidentType[]
  /**
   * Caller persists the payload + uploaded attachments. Return `incidentId` so
   * the success state can show it. Throw to surface a retry toast.
   *
   * The `attachments` field here is `File[]` (raw browser files) when no
   * `uploadAttachment` prop is provided — caller handles the upload + persist
   * in one shot. When `uploadAttachment` IS provided, this block uploads first
   * and passes already-resolved URLs.
   */
  onSubmit: (
    payload: Omit<IncidentFormPayload, "attachments"> & { attachments: File[] | IncidentAttachment[] },
  ) => Promise<{ incidentId: string }>
  onCancel: () => void
  initialVehicleId?: string
  initialMitraId?: string
  /**
   * Optional. If provided, block uploads each file BEFORE submit and forwards
   * resolved `IncidentAttachment[]` to onSubmit. If absent, raw `File[]` is
   * forwarded — caller does the upload as part of their persist.
   */
  uploadAttachment?: (file: File) => Promise<{ url: string }>
  className?: string
}

// ---------------------------------------------------------------------------
// Voice + label maps (formal "Anda" for mitra-facing)
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<IncidentType, string> = {
  "vehicle-accident": "Kecelakaan kendaraan",
  "mitra-injury": "Cedera mitra",
  "customer-complaint": "Keluhan pelanggan",
  "vehicle-damage": "Kerusakan kendaraan",
  theft: "Kehilangan / pencurian",
  other: "Lainnya",
}

const SEVERITY_META: Record<
  IncidentSeverity,
  { label: string; hint: string; dot: string }
> = {
  low: {
    label: "Rendah",
    hint: "Tidak ada cedera, tidak menghambat operasional.",
    dot: "bg-success-base",
  },
  medium: {
    label: "Sedang",
    hint: "Operasional terganggu sementara, butuh tindak lanjut < 24 jam.",
    dot: "bg-warning-base",
  },
  high: {
    label: "Tinggi",
    hint: "Cedera ringan atau kerusakan signifikan, perlu tim ops sekarang.",
    dot: "bg-(--state-warning-base)",
  },
  critical: {
    label: "Kritis",
    hint: "Cedera serius, kebakaran, atau total loss — eskalasi on-call.",
    dot: "bg-error-base",
  },
}

function copyForRole(role: IncidentFormProps["reporterRole"]) {
  const formal = role === "mitra"
  return {
    title: formal ? "Laporkan kejadian" : "Catat insiden",
    subtitle: formal
      ? "Mohon isi data sejelas mungkin agar tim kami dapat menindaklanjuti laporan Anda."
      : "Lengkapi data insiden untuk audit + tindak lanjut tim ops.",
    titleField: formal ? "Judul singkat" : "Ringkasan insiden",
    descField: formal ? "Cerita lengkap" : "Deskripsi kejadian",
    descHint: formal
      ? "Jelaskan kejadian: lokasi, waktu, pihak terlibat, dan kondisi sekarang."
      : "Detail kronologis, kerusakan, korban (jika ada), dan tindakan awal yang sudah diambil.",
    submit: formal ? "Kirim laporan" : "Simpan insiden",
    cancel: "Batal",
    locationCta: formal ? "Pakai lokasi saat ini" : "Pakai GPS",
    successHeader: formal ? "Laporan Anda diterima" : "Insiden tersimpan",
    successBody: (id: string) =>
      formal
        ? `Tim kami akan menindaklanjuti laporan #${id}. Anda akan dihubungi jika dibutuhkan keterangan tambahan.`
        : `Insiden tercatat sebagai #${id} (OPEN). Akan masuk antrian tim ops.`,
  }
}

// ---------------------------------------------------------------------------
// Attachment validation
// ---------------------------------------------------------------------------

const MAX_FILES = 5
const MAX_BYTES = 10 * 1024 * 1024 // 10MB
const ACCEPT = "image/*,application/pdf"

type AttachmentRow = {
  id: string
  file: File
  preview?: string
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function isImage(file: File): boolean {
  return file.type.startsWith("image/")
}

function matchesAccept(file: File): boolean {
  const mime = (file.type || "").toLowerCase()
  return mime.startsWith("image/") || mime === "application/pdf"
}

function readPreview(file: File): Promise<string | undefined> {
  if (!isImage(file)) return Promise.resolve(undefined)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : undefined)
    reader.onerror = () => resolve(undefined)
    reader.readAsDataURL(file)
  })
}

// ---------------------------------------------------------------------------
// occurredAt helpers — datetime-local <input> format is "YYYY-MM-DDTHH:mm"
// ---------------------------------------------------------------------------

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

function fromLocalInput(s: string): Date | null {
  // datetime-local parses as LOCAL time, not UTC — preserve user's wall clock.
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IncidentFormWithAttach({
  reporterId,
  reporterRole,
  visibleTypes,
  onSubmit,
  onCancel,
  initialVehicleId,
  initialMitraId,
  uploadAttachment,
  className,
}: IncidentFormProps) {
  const copy = React.useMemo(() => copyForRole(reporterRole), [reporterRole])

  const typeOptions = React.useMemo<IncidentType[]>(() => {
    const all: IncidentType[] = [
      "vehicle-accident",
      "mitra-injury",
      "customer-complaint",
      "vehicle-damage",
      "theft",
      "other",
    ]
    if (visibleTypes && visibleTypes.length > 0) {
      return all.filter((t) => visibleTypes.includes(t))
    }
    // Role-based default gating: mitra cannot file customer-complaint
    // (channel mismatch — complaints route via support); client cannot file
    // mitra-injury (privacy). Caller can override with visibleTypes prop.
    if (reporterRole === "mitra") return all.filter((t) => t !== "customer-complaint")
    if (reporterRole === "client") return all.filter((t) => t !== "mitra-injury" && t !== "theft")
    return all
  }, [visibleTypes, reporterRole])

  // -------------------------------------------------------------------------
  // Form state
  // -------------------------------------------------------------------------

  const [type, setType] = React.useState<IncidentType | "">("")
  const [severity, setSeverity] = React.useState<IncidentSeverity>("medium")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [occurredAt, setOccurredAt] = React.useState<string>(() =>
    toLocalInput(new Date()),
  )
  const [address, setAddress] = React.useState("")
  const [geo, setGeo] = React.useState<{ lat: number; lng: number } | null>(null)
  const [vehicleId, setVehicleId] = React.useState(initialVehicleId ?? "")
  const [mitraId, setMitraId] = React.useState(initialMitraId ?? "")
  const [attachments, setAttachments] = React.useState<AttachmentRow[]>([])
  const [dragOver, setDragOver] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [geoLoading, setGeoLoading] = React.useState(false)
  const [successId, setSuccessId] = React.useState<string | null>(null)

  // Per-field errors
  const [errors, setErrors] = React.useState<Record<string, string | undefined>>({})
  const clearError = (k: string) =>
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev))

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // -------------------------------------------------------------------------
  // Attachments
  // -------------------------------------------------------------------------

  const addFiles = React.useCallback(
    async (incoming: File[]) => {
      if (incoming.length === 0) return
      const remaining = MAX_FILES - attachments.length
      if (remaining === 0) {
        toast.error(`Maksimum ${MAX_FILES} lampiran. Hapus salah satu untuk menambah lagi.`)
        return
      }
      const slice = incoming.slice(0, remaining)
      const accepted: AttachmentRow[] = []
      const rejectedMime: string[] = []
      const rejectedSize: string[] = []
      for (const f of slice) {
        if (!matchesAccept(f)) {
          rejectedMime.push(f.name)
          continue
        }
        if (f.size > MAX_BYTES) {
          rejectedSize.push(f.name)
          continue
        }
        const preview = await readPreview(f)
        accepted.push({ id: uid(), file: f, preview })
      }
      if (rejectedMime.length > 0) {
        toast.error(
          `${rejectedMime.length} file ditolak — format tidak didukung (hanya gambar atau PDF).`,
        )
      }
      if (rejectedSize.length > 0) {
        toast.error(
          `${rejectedSize.length} file ditolak — melebihi ${formatBytes(MAX_BYTES)}.`,
        )
      }
      if (incoming.length > remaining) {
        toast.error(`Hanya ${remaining} file ditambahkan — batas ${MAX_FILES} file tercapai.`)
      }
      if (accepted.length === 0) return
      setAttachments((prev) => [...prev, ...accepted])
      clearError("attachments")
    },
    [attachments.length],
  )

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!submitting) setDragOver(true)
  }
  const onDragLeave = () => setDragOver(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (submitting) return
    if (e.dataTransfer.files?.length) void addFiles(Array.from(e.dataTransfer.files))
  }

  // -------------------------------------------------------------------------
  // Geolocation — async, opt-in
  // -------------------------------------------------------------------------

  const useCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Browser Anda tidak mendukung geolokasi.")
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoLoading(false)
        toast.success(
          `Koordinat tercatat (${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}).`,
        )
      },
      (err) => {
        setGeoLoading(false)
        // WHY differentiate: denial is a USER choice; we shouldn't badger.
        // Failure is a fixable error and deserves a louder toast.
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Izin lokasi ditolak. Anda dapat mengetik alamat manual.")
        } else {
          toast.error("Gagal mengambil koordinat. Coba lagi atau isi alamat manual.")
        }
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  function validate(): boolean {
    const next: Record<string, string | undefined> = {}
    if (!type) next.type = "Pilih jenis insiden."
    if (title.trim().length < 5)
      next.title = "Minimal 5 karakter."
    if (description.trim().length < 20)
      next.description = "Minimal 20 karakter — bantu tim memahami konteks."
    if (description.length > 1000)
      next.description = "Maksimum 1000 karakter."
    const occ = fromLocalInput(occurredAt)
    if (!occ) {
      next.occurredAt = "Tanggal-waktu tidak valid."
    } else if (occ.getTime() > Date.now() + 60 * 1000) {
      // Allow 1 min skew for clock drift, but no future incidents.
      next.occurredAt = "Tanggal kejadian tidak boleh di masa depan."
    }
    if (attachments.length === 0)
      next.attachments = "Lampirkan minimal 1 foto / dokumen sebagai bukti."
    setErrors(next)
    return Object.values(next).every((v) => !v)
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!validate()) {
      toast.error("Periksa kembali isian yang ditandai merah.")
      return
    }

    setSubmitting(true)
    try {
      const occ = fromLocalInput(occurredAt)!
      const basePayload = {
        type: type as IncidentType,
        severity,
        title: title.trim(),
        description: description.trim(),
        occurredAt: occ.toISOString(),
        location: address.trim()
          ? { address: address.trim(), lat: geo?.lat, lng: geo?.lng }
          : undefined,
        vehicleId: vehicleId.trim() || undefined,
        mitraId: mitraId.trim() || undefined,
        reporterId,
        reporterRole,
      }

      // Optionally upload first so onSubmit gets resolved URLs.
      let attachField: File[] | IncidentAttachment[]
      if (uploadAttachment) {
        const uploaded: IncidentAttachment[] = []
        for (const a of attachments) {
          const { url } = await uploadAttachment(a.file)
          uploaded.push({
            id: a.id,
            name: a.file.name,
            url,
            mimeType: a.file.type || "application/octet-stream",
          })
        }
        attachField = uploaded
      } else {
        attachField = attachments.map((a) => a.file)
      }

      const { incidentId } = await onSubmit({
        ...basePayload,
        attachments: attachField,
      })
      setSuccessId(incidentId)
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Gagal mengirim laporan. Coba lagi.",
        {
          description: "Data isian Anda masih tersimpan. Periksa koneksi dan coba kembali.",
        },
      )
    } finally {
      setSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Success state
  // -------------------------------------------------------------------------

  if (successId) {
    return (
      <div
        data-slot="incident-form-success"
        className={cn(
          "rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 space-y-4",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "inline-flex items-center justify-center size-10 rounded-full",
              "bg-success-lighter text-success-base",
            )}
          >
            <CheckIcon className="size-5" aria-hidden />
          </span>
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-text-strong-950">
              {copy.successHeader}
            </h3>
            <p className="text-sm text-text-sub-600">{copy.successBody(successId)}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" tone="neutral" style="stroke" onClick={onCancel}>
            Tutup
          </Button>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      data-slot="incident-form"
      data-role={reporterRole}
      className={cn(
        "rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 space-y-6",
        className,
      )}
    >
      <header className="space-y-1">
        <h2 className="text-lg font-medium text-text-strong-950">{copy.title}</h2>
        <p className="text-sm text-text-sub-600">{copy.subtitle}</p>
      </header>

      <FieldGroup>
        {/* Type ------------------------------------------------------------ */}
        <Field>
          <Label htmlFor="incident-type">
            Jenis insiden <span className="text-error-base">*</span>
          </Label>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v as IncidentType)
              clearError("type")
            }}
          >
            <SelectTrigger
              id="incident-type"
              aria-invalid={Boolean(errors.type)}
              disabled={submitting}
            >
              <SelectValue placeholder="Pilih jenis insiden" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type ? (
            <p className="text-xs text-error-base">{errors.type}</p>
          ) : null}
        </Field>

        {/* Severity -------------------------------------------------------- */}
        <Field>
          <Label>
            Tingkat keparahan <span className="text-error-base">*</span>
          </Label>
          <RadioGroup
            value={severity}
            onValueChange={(v) => setSeverity(v as IncidentSeverity)}
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {(Object.keys(SEVERITY_META) as IncidentSeverity[]).map((s) => {
              const meta = SEVERITY_META[s]
              const id = `severity-${s}`
              const checked = severity === s
              return (
                <label
                  key={s}
                  htmlFor={id}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border p-3 cursor-pointer transition-colors",
                    checked
                      ? "border-(--primary-base) bg-(--primary-alpha-10)"
                      : "border-stroke-soft-200 hover:bg-bg-weak-50",
                  )}
                >
                  <RadioItem
                    id={id}
                    value={s}
                    disabled={submitting}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={cn("inline-block size-2 rounded-full", meta.dot)}
                      />
                      <span className="text-sm font-medium text-text-strong-950">
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-sub-600 leading-relaxed">
                      {meta.hint}
                    </p>
                  </div>
                </label>
              )
            })}
          </RadioGroup>
        </Field>

        {/* Title ----------------------------------------------------------- */}
        <Field>
          <Label htmlFor="incident-title">
            {copy.titleField} <span className="text-error-base">*</span>
          </Label>
          <InputRoot invalid={Boolean(errors.title)}>
            <Input
              id="incident-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) clearError("title")
              }}
              placeholder="Misal: Tabrakan ringan di Jl. Sudirman"
              disabled={submitting}
              maxLength={120}
            />
          </InputRoot>
          {errors.title ? (
            <p className="text-xs text-error-base">{errors.title}</p>
          ) : (
            <FieldDescription>Minimal 5 karakter.</FieldDescription>
          )}
        </Field>

        {/* Description ---------------------------------------------------- */}
        <Field>
          <Label htmlFor="incident-description">
            {copy.descField} <span className="text-error-base">*</span>
          </Label>
          <Textarea
            id="incident-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (errors.description) clearError("description")
            }}
            placeholder={copy.descHint}
            rows={5}
            disabled={submitting}
            invalid={Boolean(errors.description)}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            {errors.description ? (
              <p className="text-xs text-error-base">{errors.description}</p>
            ) : (
              <FieldDescription>Minimal 20 karakter, maksimum 1000.</FieldDescription>
            )}
            <span className="text-xs text-text-soft-400 tabular-nums">
              {description.length}/1000
            </span>
          </div>
        </Field>

        {/* Occurred at ----------------------------------------------------- */}
        <Field>
          <Label htmlFor="incident-occurred-at">
            Waktu kejadian <span className="text-error-base">*</span>
          </Label>
          {/*
            WHY native datetime-local (not <DatePicker>): DatePicker is date-only.
            Incident timestamps need wall-clock minutes precision and the user
            most often picks "few minutes ago" — native input has the best
            mobile keyboard ergonomics for that (iOS spins straight to now).
          */}
          <InputRoot invalid={Boolean(errors.occurredAt)}>
            <Input
              id="incident-occurred-at"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => {
                setOccurredAt(e.target.value)
                if (errors.occurredAt) clearError("occurredAt")
              }}
              disabled={submitting}
              max={toLocalInput(new Date())}
            />
          </InputRoot>
          {errors.occurredAt ? (
            <p className="text-xs text-error-base">{errors.occurredAt}</p>
          ) : (
            <FieldDescription>Default: sekarang. Sesuaikan jika terlambat melapor.</FieldDescription>
          )}
        </Field>

        {/* Location -------------------------------------------------------- */}
        <Field>
          <Label htmlFor="incident-address">Lokasi</Label>
          <InputRoot>
            <Input
              id="incident-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat atau patokan terdekat"
              disabled={submitting}
            />
          </InputRoot>
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              size="xs"
              tone="neutral"
              style="stroke"
              leftIcon={<MapPin />}
              loading={geoLoading}
              disabled={submitting || geoLoading}
              onClick={useCurrentLocation}
            >
              {copy.locationCta}
            </Button>
            {geo ? (
              <StatusBadge status="success" variant="dot-stroke" size="sm">
                {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
              </StatusBadge>
            ) : (
              <FieldDescription className="mt-0">Opsional.</FieldDescription>
            )}
          </div>
        </Field>

        {/* Vehicle + Mitra refs ------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="incident-vehicle-id">ID Kendaraan</Label>
            <InputRoot>
              <Input
                id="incident-vehicle-id"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                placeholder="Misal: V-09421"
                disabled={submitting}
              />
            </InputRoot>
            <FieldDescription>Opsional. Isi jika kendaraan terlibat.</FieldDescription>
          </Field>
          <Field>
            <Label htmlFor="incident-mitra-id">ID Mitra</Label>
            <InputRoot>
              <Input
                id="incident-mitra-id"
                value={mitraId}
                onChange={(e) => setMitraId(e.target.value)}
                placeholder="Misal: M-3340012"
                disabled={submitting}
              />
            </InputRoot>
            <FieldDescription>Opsional. Isi jika mitra terlibat.</FieldDescription>
          </Field>
        </div>

        {/* Attachments ----------------------------------------------------- */}
        <Field>
          <Label>
            Lampiran foto / dokumen <span className="text-error-base">*</span>
          </Label>
          <label
            data-slot="incident-attach-dropzone"
            data-state={dragOver ? "active" : submitting ? "disabled" : "idle"}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-bg-white-0 p-6 text-center min-h-[140px] cursor-pointer",
              "transition-colors duration-(--duration-fast) ease-(--ease-out)",
              "focus-within:ring-4 focus-within:ring-(--primary-alpha-10)",
              dragOver
                ? "border-(--primary-base) bg-(--primary-alpha-10)"
                : errors.attachments
                  ? "border-error-base"
                  : "border-stroke-sub-300 hover:bg-bg-weak-50",
              submitting ? "opacity-60 pointer-events-none" : "",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              multiple
              disabled={submitting}
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) void addFiles(Array.from(e.target.files))
                e.currentTarget.value = ""
              }}
              aria-label="Pilih lampiran"
            />
            <UploadCloud aria-hidden strokeWidth={1.5} className="size-6 text-icon-sub-600" />
            <div className="space-y-1">
              <div className="text-sm font-medium text-text-strong-950">
                Tarik & lepas, atau klik untuk pilih file
              </div>
              <div className="text-xs text-text-sub-600">
                Maks {MAX_FILES} file · {formatBytes(MAX_BYTES)} per file · gambar atau PDF
              </div>
            </div>
          </label>
          {errors.attachments ? (
            <p className="text-xs text-error-base">{errors.attachments}</p>
          ) : null}
          {attachments.length > 0 ? (
            <ul
              className="space-y-2 mt-1"
              role="list"
              aria-label="Daftar lampiran terpilih"
            >
              {attachments.map((a) => (
                <AttachmentRowView
                  key={a.id}
                  entry={a}
                  onRemove={() => removeAttachment(a.id)}
                  busy={submitting}
                />
              ))}
            </ul>
          ) : null}
        </Field>
      </FieldGroup>

      {/* Footer ---------------------------------------------------------- */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke-soft-200">
        <Button
          type="button"
          tone="neutral"
          style="stroke"
          onClick={onCancel}
          disabled={submitting}
        >
          {copy.cancel}
        </Button>
        <Button
          type="submit"
          tone="primary"
          style="filled"
          loading={submitting}
          disabled={submitting}
        >
          {copy.submit}
        </Button>
      </div>
    </form>
  )
}

IncidentFormWithAttach.displayName = "IncidentFormWithAttach"

// ---------------------------------------------------------------------------
// Attachment row
// ---------------------------------------------------------------------------

function AttachmentRowView({
  entry,
  onRemove,
  busy,
}: {
  entry: AttachmentRow
  onRemove: () => void
  busy: boolean
}) {
  const { file, preview } = entry
  return (
    <li
      role="listitem"
      className="flex items-start gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5"
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-stroke-sub-300 bg-bg-weak-50 flex items-center justify-center">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-cover" />
        ) : isImage(file) ? (
          <ImageIcon aria-hidden strokeWidth={1.5} className="size-5 text-icon-sub-600" />
        ) : (
          <FileIcon aria-hidden strokeWidth={1.5} className="size-5 text-icon-sub-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-strong-950 truncate">{file.name}</div>
        <div className="text-xs text-text-sub-600 tabular-nums">{formatBytes(file.size)}</div>
      </div>
      <IconButton
        type="button"
        size="xs"
        aria-label={`Hapus ${file.name}`}
        onClick={onRemove}
        disabled={busy}
      >
        <XIcon />
      </IconButton>
    </li>
  )
}
