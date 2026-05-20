"use client"

import * as React from "react"
import {
  RiAlertLine,
  RiImageLine,
  RiCheckLine,
  RiCloseLine,
  RiZoomInLine,
  RiFileTextLine,
  RiMoneyDollarCircleLine,
  RiShieldCheckLine,
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { Badge } from "@/registry/dash/ui/badge"
import { Label } from "@/registry/dash/ui/label"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * mitra-dispute-flow — canonical block for mitra (driver) dispute submission.
 *
 * WHY this block exists:
 *  - Mitra dispute is legal-sensitive (delivery proof, payment, suspension). Tribes
 *    were rolling ad-hoc forms; this block enforces the audit-trail contract end-to-end.
 *  - Voice: formal "Anda" — mitra-facing per dash-ai-rules.md § Voice +
 *    `feedback_dash_mobile_voice_formal`. No casual softeners ("yaa", "lewatin").
 *  - Evidence display + reason picker + escalation toggle are bundled so the
 *    consumer's only job is to (1) upload the audit row and (2) escalate.
 *
 * Implementation notes:
 *  - useState only (no RHF/zod — see § Banned Imports).
 *  - Two-step UX: Form modal → Confirm modal → Success state. Success keeps the
 *    modal open so the mitra can read the dispute ID (and screenshot for
 *    reference) before dismissing.
 *  - Image evidence opens an inline zoom overlay. No external image lib.
 *  - The audit payload exactly matches `t_disputes_audit_log` row shape — the
 *    consumer just relays it.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DisputeEvidence = {
  type: "image" | "text" | "amount"
  label: string // "Bukti pengambilan", "Jumlah pembayaran"
  value: string // url, string, or numeric-as-string
  timestamp: string // ISO
}

export type DisputeReason = {
  value: string // "foto-tidak-jelas" / "tidak-sesuai-fakta" / "amount-salah" / "lainnya"
  label: string // formal Indonesian
}

export type MitraDisputeFlowProps = {
  caseId: string // delivery/payment/maintenance id
  caseType: "delivery" | "payment" | "suspension" | "maintenance"
  evidence: DisputeEvidence[]
  mitraId: string
  /**
   * Submit dispute. Caller MUST log to `t_disputes_audit_log` and trigger
   * escalation routing inside this resolver. Block toasts on resolve/reject.
   */
  onSubmit: (payload: {
    caseId: string
    caseType: string
    mitraId: string
    reason: string
    detail: string
    requestEscalation: boolean
    timestamp: string
  }) => Promise<{ disputeId: string }>
  onCancel: () => void
  reasonOptions?: DisputeReason[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_REASON_OPTIONS: DisputeReason[] = [
  { value: "foto-tidak-jelas", label: "Foto bukti tidak jelas" },
  { value: "tidak-sesuai-fakta", label: "Tidak sesuai fakta di lapangan" },
  { value: "amount-salah", label: "Jumlah pembayaran tidak sesuai" },
  { value: "waktu-tidak-akurat", label: "Waktu pencatatan tidak akurat" },
  { value: "lainnya", label: "Lainnya" },
]

const MIN_DETAIL_CHARS = 20
const MAX_DETAIL_CHARS = 1000

const TITLE_BY_CASE: Record<MitraDisputeFlowProps["caseType"], string> = {
  delivery: "Ajukan keberatan pengantaran",
  payment: "Ajukan keberatan pembayaran",
  suspension: "Ajukan keberatan suspensi",
  maintenance: "Ajukan keberatan maintenance",
}

const CASE_BADGE_LABEL: Record<MitraDisputeFlowProps["caseType"], string> = {
  delivery: "Pengantaran",
  payment: "Pembayaran",
  suspension: "Suspensi",
  maintenance: "Maintenance",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type View = "form" | "confirm" | "success"

export function MitraDisputeFlow({
  caseId,
  caseType,
  evidence,
  mitraId,
  onSubmit,
  onCancel,
  reasonOptions = DEFAULT_REASON_OPTIONS,
}: MitraDisputeFlowProps) {
  const [view, setView] = React.useState<View>("form")
  const [reason, setReason] = React.useState("")
  const [detail, setDetail] = React.useState("")
  const [requestEscalation, setRequestEscalation] = React.useState(false)
  const [zoomUrl, setZoomUrl] = React.useState<string | null>(null)

  const [reasonError, setReasonError] = React.useState<string | undefined>(undefined)
  const [detailError, setDetailError] = React.useState<string | undefined>(undefined)

  const [submitting, setSubmitting] = React.useState(false)
  const [disputeId, setDisputeId] = React.useState<string | null>(null)

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------
  const validate = (): boolean => {
    let ok = true
    if (!reason) {
      setReasonError("Mohon pilih alasan keberatan.")
      ok = false
    }
    const trimmed = detail.trim()
    if (trimmed.length < MIN_DETAIL_CHARS) {
      setDetailError(
        `Penjelasan wajib diisi minimum ${MIN_DETAIL_CHARS} karakter (saat ini ${trimmed.length}).`,
      )
      ok = false
    } else if (trimmed.length > MAX_DETAIL_CHARS) {
      setDetailError(`Penjelasan terlalu panjang. Maksimum ${MAX_DETAIL_CHARS} karakter.`)
      ok = false
    }
    return ok
  }

  const handleNext = () => {
    setReasonError(undefined)
    setDetailError(undefined)
    if (!validate()) return
    setView("confirm")
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const reasonLabel = reasonOptions.find((r) => r.value === reason)?.label ?? reason
      const { disputeId: id } = await onSubmit({
        caseId,
        caseType,
        mitraId,
        reason: reasonLabel,
        detail: detail.trim(),
        requestEscalation,
        timestamp: new Date().toISOString(),
      })
      setDisputeId(id)
      setView("success")
      toast.success("Keberatan Anda berhasil dikirim.")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Pengiriman gagal. Mohon coba beberapa saat lagi.",
      )
      setView("form")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelGuarded = () => {
    if (view === "success") {
      onCancel()
      return
    }
    const dirty = Boolean(reason) || detail.trim().length > 0 || requestEscalation
    if (dirty) {
      if (
        typeof window !== "undefined" &&
        !window.confirm(
          "Apakah Anda yakin ingin menutup? Keberatan yang belum dikirim akan hilang.",
        )
      ) {
        return
      }
    }
    onCancel()
  }

  // -------------------------------------------------------------------------
  // Render — Image zoom overlay (inline, no extra modal stack)
  // -------------------------------------------------------------------------
  const zoomOverlay = zoomUrl ? (
    <div
      role="dialog"
      aria-label="Pratinjau bukti"
      onClick={() => setZoomUrl(null)}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-strong-950/80 p-4"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={zoomUrl}
        alt="Bukti zoom"
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
      />
    </div>
  ) : null

  return (
    <>
      <Modal
        open
        onOpenChange={(o) => {
          if (!o) handleCancelGuarded()
        }}
      >
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <div className="flex items-center gap-2">
              <RiAlertLine aria-hidden className="size-5 text-warning-base" />
              <ModalTitle>
                {view === "success" ? "Keberatan terkirim" : TITLE_BY_CASE[caseType]}
              </ModalTitle>
            </div>
            <ModalDescription>
              {view === "success"
                ? "Tim kami akan menindaklanjuti dalam 1×24 jam."
                : "Mohon tinjau bukti yang tercatat, lalu jelaskan keberatan Anda secara spesifik. Keberatan ini akan dicatat di audit log."}
            </ModalDescription>
          </ModalHeader>

          {view === "form" ? (
            <FormView
              caseId={caseId}
              caseType={caseType}
              evidence={evidence}
              reason={reason}
              detail={detail}
              requestEscalation={requestEscalation}
              reasonError={reasonError}
              detailError={detailError}
              reasonOptions={reasonOptions}
              onReasonChange={(v) => {
                setReason(v)
                if (reasonError) setReasonError(undefined)
              }}
              onDetailChange={(v) => {
                setDetail(v)
                if (detailError) setDetailError(undefined)
              }}
              onEscalationChange={setRequestEscalation}
              onZoom={setZoomUrl}
            />
          ) : view === "confirm" ? (
            <ConfirmView
              caseType={caseType}
              reasonLabel={
                reasonOptions.find((r) => r.value === reason)?.label ?? reason
              }
              detail={detail.trim()}
              requestEscalation={requestEscalation}
            />
          ) : (
            <SuccessView disputeId={disputeId ?? "-"} caseId={caseId} />
          )}

          <ModalFooter>
            {view === "form" ? (
              <>
                <Button
                  type="button"
                  tone="neutral"
                  style="stroke"
                  leftIcon={<RiCloseLine />}
                  onClick={handleCancelGuarded}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  tone="primary"
                  style="filled"
                  onClick={handleNext}
                  disabled={submitting}
                >
                  Lanjutkan
                </Button>
              </>
            ) : view === "confirm" ? (
              <>
                <Button
                  type="button"
                  tone="neutral"
                  style="stroke"
                  onClick={() => setView("form")}
                  disabled={submitting}
                >
                  Kembali
                </Button>
                <Button
                  type="button"
                  tone="primary"
                  style="filled"
                  leftIcon={<RiCheckLine />}
                  loading={submitting}
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? "Mengirim..." : "Ya, kirim keberatan"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                tone="primary"
                style="filled"
                onClick={onCancel}
              >
                Tutup
              </Button>
            )}
            <span className="sr-only">Mitra: {mitraId}</span>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {zoomOverlay}
    </>
  )
}

// ---------------------------------------------------------------------------
// Sub-views
// ---------------------------------------------------------------------------

function FormView({
  caseId,
  caseType,
  evidence,
  reason,
  detail,
  requestEscalation,
  reasonError,
  detailError,
  reasonOptions,
  onReasonChange,
  onDetailChange,
  onEscalationChange,
  onZoom,
}: {
  caseId: string
  caseType: MitraDisputeFlowProps["caseType"]
  evidence: DisputeEvidence[]
  reason: string
  detail: string
  requestEscalation: boolean
  reasonError?: string
  detailError?: string
  reasonOptions: DisputeReason[]
  onReasonChange: (v: string) => void
  onDetailChange: (v: string) => void
  onEscalationChange: (v: boolean) => void
  onZoom: (url: string) => void
}) {
  return (
    <ModalBody className="space-y-5">
      {/* Case meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-sub-600">
        <Badge status="neutral" appearance="lighter">
          {CASE_BADGE_LABEL[caseType]}
        </Badge>
        <span>Kasus #{caseId}</span>
      </div>

      {/* Evidence list */}
      <section aria-label="Bukti tercatat" className="space-y-2">
        <Label>Bukti tercatat</Label>
        {evidence.length === 0 ? (
          <p className="text-xs text-text-soft-400">
            Tidak ada bukti yang tercatat untuk kasus ini.
          </p>
        ) : (
          <ul className="divide-y divide-stroke-soft-200 rounded-lg border border-stroke-soft-200">
            {evidence.map((ev, i) => (
              <EvidenceRow key={`${ev.label}-${i}`} evidence={ev} onZoom={onZoom} />
            ))}
          </ul>
        )}
      </section>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="dispute-reason">
          Alasan keberatan <span className="text-error-base">*</span>
        </Label>
        <Select value={reason} onValueChange={onReasonChange}>
          <SelectTrigger id="dispute-reason" aria-invalid={Boolean(reasonError)}>
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
        {reasonError ? (
          <p className="text-xs text-error-base">{reasonError}</p>
        ) : null}
      </div>

      {/* Detail */}
      <div className="space-y-2">
        <Label htmlFor="dispute-detail">
          Penjelasan keberatan <span className="text-error-base">*</span>
        </Label>
        <Textarea
          id="dispute-detail"
          rows={5}
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          placeholder="Mohon jelaskan keberatan Anda secara spesifik. Sertakan fakta di lapangan, waktu kejadian, dan dampak yang Anda alami."
          invalid={Boolean(detailError)}
          aria-describedby="dispute-detail-help"
        />
        <div className="flex items-center justify-between text-xs">
          {detailError ? (
            <p className="text-error-base">{detailError}</p>
          ) : (
            <p id="dispute-detail-help" className="text-text-soft-400">
              Minimum {MIN_DETAIL_CHARS} karakter. Penjelasan akan dicatat di audit log.
            </p>
          )}
          <span
            className={
              detail.trim().length > MAX_DETAIL_CHARS
                ? "text-error-base"
                : "text-text-soft-400"
            }
          >
            {detail.trim().length}/{MAX_DETAIL_CHARS}
          </span>
        </div>
      </div>

      {/* Escalation toggle */}
      <label className="flex items-start gap-3 rounded-lg border border-stroke-soft-200 p-3 cursor-pointer">
        <Checkbox
          checked={requestEscalation}
          onCheckedChange={(v) => onEscalationChange(v === true)}
          aria-label="Minta escalation ke supervisor"
          className="mt-0.5"
        />
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text-strong-950">
            Minta escalation ke supervisor
          </span>
          <p className="text-xs text-text-sub-600">
            Centang jika Anda merasa keberatan ini perlu ditinjau langsung oleh supervisor
            tribe. Kami akan tetap memproses, hanya jalur tinjauannya berbeda.
          </p>
        </div>
      </label>
    </ModalBody>
  )
}

function ConfirmView({
  caseType,
  reasonLabel,
  detail,
  requestEscalation,
}: {
  caseType: MitraDisputeFlowProps["caseType"]
  reasonLabel: string
  detail: string
  requestEscalation: boolean
}) {
  return (
    <ModalBody className="space-y-4">
      <div className="rounded-lg border border-warning-base/40 bg-warning-lighter/40 p-4 text-sm text-text-strong-950">
        <p className="font-medium">Apakah Anda yakin ingin mengajukan keberatan?</p>
        <p className="mt-1 text-text-sub-600">
          Setelah dikirim, keberatan Anda akan tercatat di audit log dan tidak dapat
          ditarik kembali. Tim kami akan menghubungi Anda dalam 1×24 jam.
        </p>
      </div>

      <dl className="space-y-2 text-sm">
        <Row label="Jenis kasus">{CASE_BADGE_LABEL[caseType]}</Row>
        <Row label="Alasan">{reasonLabel}</Row>
        <Row label="Penjelasan">
          <span className="whitespace-pre-line">{detail}</span>
        </Row>
        <Row label="Escalation">
          {requestEscalation ? "Ya — diarahkan ke supervisor" : "Tidak"}
        </Row>
      </dl>
    </ModalBody>
  )
}

function SuccessView({ disputeId, caseId }: { disputeId: string; caseId: string }) {
  return (
    <ModalBody className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-success-base/30 bg-success-lighter/40 p-4">
        <RiShieldCheckLine aria-hidden className="mt-0.5 size-5 text-success-base" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-strong-950">
            Keberatan Anda berhasil dikirim.
          </p>
          <p className="text-xs text-text-sub-600">
            Tim kami akan menindaklanjuti dalam 1×24 jam. Mohon simpan nomor tiket di
            bawah untuk referensi Anda.
          </p>
        </div>
      </div>

      <dl className="space-y-2 text-sm">
        <Row label="Nomor tiket keberatan">
          <code className="rounded bg-bg-weak-50 px-1.5 py-0.5 font-mono text-xs">
            {disputeId}
          </code>
        </Row>
        <Row label="Kasus terkait">
          <code className="rounded bg-bg-weak-50 px-1.5 py-0.5 font-mono text-xs">
            {caseId}
          </code>
        </Row>
      </dl>
    </ModalBody>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-3">
      <dt className="text-text-soft-400">{label}</dt>
      <dd className="text-text-strong-950">{children}</dd>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Evidence row
// ---------------------------------------------------------------------------

function EvidenceRow({
  evidence,
  onZoom,
}: {
  evidence: DisputeEvidence
  onZoom: (url: string) => void
}) {
  const ts = formatTimestamp(evidence.timestamp)
  if (evidence.type === "image") {
    return (
      <li className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => onZoom(evidence.value)}
          className="group relative size-14 shrink-0 overflow-hidden rounded-md border border-stroke-soft-200 bg-bg-weak-50"
          aria-label={`Perbesar ${evidence.label}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={evidence.value}
            alt={evidence.label}
            className="size-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-bg-strong-950/0 transition group-hover:bg-bg-strong-950/40">
            <RiZoomInLine
              aria-hidden
              className="size-4 text-bg-white-0 opacity-0 transition group-hover:opacity-100"
            />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-text-strong-950">
            <RiImageLine aria-hidden className="size-4 text-text-sub-600" />
            <span className="truncate">{evidence.label}</span>
          </div>
          <p className="text-xs text-text-soft-400">{ts}</p>
        </div>
      </li>
    )
  }

  if (evidence.type === "amount") {
    return (
      <li className="flex items-center gap-3 p-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-alpha-10 text-primary-base">
          <RiMoneyDollarCircleLine aria-hidden className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-strong-950">{evidence.label}</p>
          <p className="text-xs text-text-soft-400">{ts}</p>
        </div>
        <span className="font-mono text-sm font-semibold text-text-strong-950">
          {formatAmount(evidence.value)}
        </span>
      </li>
    )
  }

  // text
  return (
    <li className="flex items-start gap-3 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-bg-weak-50 text-text-sub-600">
        <RiFileTextLine aria-hidden className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-strong-950">{evidence.label}</p>
        <p className="mt-0.5 text-sm text-text-sub-600 whitespace-pre-line">
          {evidence.value}
        </p>
        <p className="mt-1 text-xs text-text-soft-400">{ts}</p>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  // Mitra-facing: "20 Mei 2026, 14:32 WIB" — formal locale-id.
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const date = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d)
    const time = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d)
    return `${date}, ${time} WIB`
  } catch {
    return iso
  }
}

function formatAmount(raw: string): string {
  // raw is numeric-as-string; render as IDR currency. Fall back to raw on parse fail.
  const n = Number(raw)
  if (Number.isNaN(n)) return raw
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return raw
  }
}
