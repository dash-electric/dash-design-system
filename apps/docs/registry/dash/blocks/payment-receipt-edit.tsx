"use client"

import * as React from "react"
import {
  RiAlertLine,
  RiArrowRightLine,
  RiBankCardLine,
  RiCheckLine,
  RiCloseLine,
  RiMoneyDollarCircleLine,
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
import { Input, InputRoot, InputAffix } from "@/registry/dash/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Badge } from "@/registry/dash/ui/badge"
import { Label } from "@/registry/dash/ui/label"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * payment-receipt-edit — canonical block for editing payment amount on an
 * existing receipt/transaction with mandatory audit and an approver gate for
 * high-delta edits.
 *
 * WHY this block exists:
 *  - Payment edit is a HIGH-stakes financial field. Mitra-disputable and
 *    finance-reconcile-critical. Every tribe that needs amount-correction
 *    flow MUST land on the same audit shape (t_payment_audit_log) and the
 *    same approver gate above threshold — otherwise reconciliation diverges.
 *  - The audit payload (receiptId + originalAmount + newAmount + editReason
 *    + free-text note + editorId + timestamp) maps 1:1 to t_payment_audit_log.
 *    Consumer just relays it; the block does not persist.
 *  - Voice is neutral (staff/ops UI — backoffice, finance pic). Not mitra-
 *    facing, so the formal "Anda" mandate from dash-ai-rules.md § Voice is
 *    relaxed; we still use polite Indonesian, no slang.
 *
 * Implementation notes:
 *  - All amounts are passed/returned in IDR CENTS (number). The block uses
 *    cents internally and only formats to display rupiah at the edges. This
 *    avoids float drift on large rupiah amounts. (1 IDR = 100 cents per the
 *    project convention — see dash-domain-glossary.md.)
 *  - No form library. Vanilla useState + a 5-rule synchronous validator.
 *  - The amount input formats on input ("Rp 1.234.567"). Internal state is
 *    a parsed integer; the formatter is single-source for both display and
 *    the diff calculation.
 *  - Threshold gate fires ONCE diff > threshold; approver dropdown becomes
 *    required. We surface the gate inline (banner) NOT via a separate modal
 *    so the user sees the consequence as they type — fewer surprises.
 *  - The confirm modal is a second Modal layered on top of the edit modal.
 *    The edit modal stays mounted under it so cancel returns the user to
 *    their entered values (no lost work). This matches mitra-dispute-flow
 *    + multi-stage-approval conventions.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaymentMethod = "cash" | "transfer" | "qris" | "ewallet"

export type PaymentReceiptApprover = {
  id: string
  name: string
}

export type PaymentReceiptEditPayload = {
  receiptId: string
  originalAmount: number
  newAmount: number
  editReason: string
  note: string
  editorId: string
  timestamp: string
  /** Set only when diff > threshold. */
  approverId?: string
}

export type PaymentReceiptEditResult = {
  auditId: string
}

export type PaymentReceiptEditProps = {
  /** Receipt / transaction ID being edited. Echoed back in the audit row. */
  receiptId: string
  /** Current amount IN IDR CENTS. Display: divided by 100, formatted id-ID. */
  currentAmount: number
  /** Optional pre-existing free-text note. Pre-fills the detail textarea. */
  currentNote?: string
  /** Payment rail — drives the badge color + label. */
  paymentMethod: PaymentMethod
  /**
   * Caller persists the edit and the audit row in a transaction. Must return
   * the resulting audit_id. See § Audit Trail contract in the doc page.
   */
  onSave: (payload: PaymentReceiptEditPayload) => Promise<PaymentReceiptEditResult>
  /** Close handler (parent owns open/closed state). */
  onCancel: () => void
  /** Current user UUID — logged to the audit row. */
  editorId: string
  /**
   * Abs(newAmount - currentAmount) > threshold forces Fleet Manager approval.
   * Default: Rp 500.000 = 50_000_000 cents.
   */
  requiresApprovalThreshold?: number
  /** Approver list. Required when diff > threshold; otherwise unused. */
  approvers?: PaymentReceiptApprover[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_THRESHOLD_CENTS = 500_000 * 100 // Rp 500.000

const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: "salah-input", label: "Salah input" },
  { value: "refund-parsial", label: "Refund parsial" },
  { value: "penyesuaian", label: "Penyesuaian" },
  { value: "lainnya", label: "Lainnya" },
]

const OTHER_VALUE = "lainnya"

const MIN_DETAIL_LENGTH = 20

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  qris: "QRIS",
  ewallet: "E-Wallet",
}

// Filled status maps Badge component to its accent palette.
const PAYMENT_METHOD_STATUS: Record<
  PaymentMethod,
  "information" | "success" | "feature" | "verified"
> = {
  cash: "information",
  transfer: "success",
  qris: "feature",
  ewallet: "verified",
}

// ---------------------------------------------------------------------------
// IDR formatter
// ---------------------------------------------------------------------------

/**
 * Format IDR cents as a display string (no "Rp" prefix — the prefix is an
 * Input affix). Example: 123_456_700 → "1.234.567".
 *
 * We DON'T use Intl.NumberFormat("id-ID", { style: "currency" }) because that
 * produces "Rp 1.234.567,00" with mandatory cents — for a payments app where
 * receipts are always whole rupiah, the cents tail is noise.
 */
function formatRupiahFromCents(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) return "0"
  const rupiah = Math.floor(cents / 100)
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
    rupiah,
  )
}

/** Format with the leading "Rp " — used in banners, confirm dialog, toasts. */
function formatRupiahWithPrefix(cents: number): string {
  return `Rp ${formatRupiahFromCents(cents)}`
}

/**
 * Parse a user-entered string into IDR cents. Strips everything that isn't
 * a digit, treats the result as whole rupiah, multiplies by 100. Returns
 * `null` for empty/zero input (so the validator can flag it).
 */
function parseRupiahInputToCents(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "")
  if (!digits) return null
  const rupiah = Number(digits)
  if (!Number.isFinite(rupiah) || rupiah <= 0) return null
  return rupiah * 100
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentReceiptEdit({
  receiptId,
  currentAmount,
  currentNote,
  paymentMethod,
  onSave,
  onCancel,
  editorId,
  requiresApprovalThreshold = DEFAULT_THRESHOLD_CENTS,
  approvers,
}: PaymentReceiptEditProps) {
  // Display string in the amount input — formatted as the user types.
  const [amountDisplay, setAmountDisplay] = React.useState("")
  const [reasonValue, setReasonValue] = React.useState("")
  const [detail, setDetail] = React.useState(currentNote ?? "")
  const [approverId, setApproverId] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  // Field-level error map. We surface errors at submit, but clear them on
  // edit so the user gets immediate positive feedback.
  const [errors, setErrors] = React.useState<{
    amount?: string
    reason?: string
    detail?: string
    approver?: string
  }>({})

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------

  const newAmount = React.useMemo(
    () => parseRupiahInputToCents(amountDisplay),
    [amountDisplay],
  )

  const diff = React.useMemo(
    () => (newAmount == null ? 0 : Math.abs(newAmount - currentAmount)),
    [newAmount, currentAmount],
  )

  const requiresApproval = diff > requiresApprovalThreshold

  const reasonLabel = React.useMemo(
    () => REASON_OPTIONS.find((r) => r.value === reasonValue)?.label ?? "",
    [reasonValue],
  )

  const direction: "up" | "down" | "same" = React.useMemo(() => {
    if (newAmount == null) return "same"
    if (newAmount > currentAmount) return "up"
    if (newAmount < currentAmount) return "down"
    return "same"
  }, [newAmount, currentAmount])

  // -------------------------------------------------------------------------
  // Input handlers
  // -------------------------------------------------------------------------

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cents = parseRupiahInputToCents(e.target.value)
    if (cents == null) {
      setAmountDisplay("")
    } else {
      setAmountDisplay(formatRupiahFromCents(cents))
    }
    if (errors.amount) setErrors((p) => ({ ...p, amount: undefined }))
  }

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  const validate = (): boolean => {
    const next: typeof errors = {}

    if (newAmount == null || newAmount <= 0) {
      next.amount = "Nominal harus lebih dari Rp 0."
    } else if (newAmount === currentAmount) {
      next.amount =
        "Nominal baru sama dengan nominal sekarang. Tidak ada perubahan untuk disimpan."
    }

    if (!reasonValue) {
      next.reason = "Mohon pilih alasan perubahan."
    }

    const trimmedDetail = detail.trim()
    if (trimmedDetail.length < MIN_DETAIL_LENGTH) {
      next.detail = `Detail wajib minimum ${MIN_DETAIL_LENGTH} karakter (saat ini ${trimmedDetail.length}).`
    }

    if (requiresApproval && !approverId) {
      next.approver =
        "Approver Fleet Manager wajib dipilih karena selisih melebihi ambang batas."
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  // -------------------------------------------------------------------------
  // Save flow
  // -------------------------------------------------------------------------

  const handleAttemptSave = () => {
    if (!validate()) return
    setConfirmOpen(true)
  }

  const handleConfirmSave = async () => {
    if (newAmount == null) return // validate() guarantees non-null but TS
    setSaving(true)
    try {
      const result = await onSave({
        receiptId,
        originalAmount: currentAmount,
        newAmount,
        editReason: reasonLabel || reasonValue,
        note: detail.trim(),
        editorId,
        timestamp: new Date().toISOString(),
        approverId: requiresApproval ? approverId : undefined,
      })
      toast.success(`Receipt ter-update. Audit ID: ${result.auditId}`)
      setConfirmOpen(false)
      onCancel()
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan perubahan. Mohon coba lagi.",
      )
    } finally {
      setSaving(false)
    }
  }

  // -------------------------------------------------------------------------
  // Cancel — confirm if there's pending input
  // -------------------------------------------------------------------------

  const hasPendingInput =
    amountDisplay !== "" || reasonValue !== "" || detail !== (currentNote ?? "")

  const handleCancel = () => {
    if (saving) return
    if (
      hasPendingInput &&
      typeof window !== "undefined" &&
      !window.confirm(
        "Buang perubahan? Perubahan yang belum disimpan akan hilang.",
      )
    ) {
      return
    }
    onCancel()
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      <Modal
        open
        onOpenChange={(o) => {
          if (!o) handleCancel()
        }}
      >
        <ModalContent className="max-w-xl">
          <ModalHeader>
            <ModalTitle>Edit nominal receipt</ModalTitle>
            <ModalDescription>
              Perubahan akan dicatat di audit log. Nominal asli tetap tersimpan.
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="space-y-5">
            {/* Current amount + payment method */}
            <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-text-sub-600">
                    Nominal sekarang
                  </div>
                  <div className="mt-0.5 text-lg font-semibold text-text-strong-950 tabular-nums">
                    {formatRupiahWithPrefix(currentAmount)}
                  </div>
                  <div className="mt-0.5 text-xs text-text-soft-400 font-mono">
                    {receiptId}
                  </div>
                </div>
                <Badge
                  type="left-icon"
                  appearance="lighter"
                  size="md"
                  status={PAYMENT_METHOD_STATUS[paymentMethod]}
                  icon={<RiBankCardLine />}
                >
                  {PAYMENT_METHOD_LABEL[paymentMethod]}
                </Badge>
              </div>
            </div>

            {/* New amount input */}
            <div className="space-y-1.5">
              <Label htmlFor="new-amount-input">
                Nominal baru <span className="text-error-base">*</span>
              </Label>
              <InputRoot invalid={Boolean(errors.amount)}>
                <InputAffix>Rp</InputAffix>
                <Input
                  id="new-amount-input"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0"
                  value={amountDisplay}
                  onChange={handleAmountChange}
                  aria-invalid={Boolean(errors.amount)}
                  aria-describedby={errors.amount ? "new-amount-error" : undefined}
                />
              </InputRoot>
              {errors.amount ? (
                <p id="new-amount-error" className="text-xs text-error-base">
                  {errors.amount}
                </p>
              ) : (
                <p className="text-xs text-text-soft-400">
                  Masukkan angka rupiah. Pemformatan otomatis.
                </p>
              )}
            </div>

            {/* Diff preview + approval banner */}
            {newAmount != null && newAmount !== currentAmount ? (
              <div
                className={
                  requiresApproval
                    ? "rounded-lg border border-warning-base bg-warning-lighter p-3"
                    : "rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3"
                }
                role={requiresApproval ? "alert" : undefined}
              >
                <div className="flex items-center gap-3 text-sm">
                  <RiMoneyDollarCircleLine
                    aria-hidden
                    className="size-4 shrink-0 text-text-sub-600"
                  />
                  <span className="text-text-sub-600">
                    Selisih{" "}
                    <strong
                      className={
                        direction === "up"
                          ? "text-success-base tabular-nums"
                          : "text-error-base tabular-nums"
                      }
                    >
                      {direction === "up" ? "+" : "−"}
                      {formatRupiahWithPrefix(diff)}
                    </strong>{" "}
                    ({direction === "up" ? "naik" : "turun"} dari nominal lama)
                  </span>
                </div>
                {requiresApproval ? (
                  <div className="mt-2 flex items-start gap-2 text-xs text-warning-dark">
                    <RiAlertLine
                      aria-hidden
                      className="size-4 shrink-0 mt-0.5"
                    />
                    <span>
                      Selisih melebihi{" "}
                      {formatRupiahWithPrefix(requiresApprovalThreshold)} —
                      perlu approval Fleet Manager.
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Reason dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-reason-select">
                Alasan perubahan <span className="text-error-base">*</span>
              </Label>
              <Select
                value={reasonValue}
                onValueChange={(v) => {
                  setReasonValue(v)
                  if (errors.reason) {
                    setErrors((p) => ({ ...p, reason: undefined }))
                  }
                }}
              >
                <SelectTrigger
                  id="edit-reason-select"
                  aria-invalid={Boolean(errors.reason)}
                >
                  <SelectValue placeholder="Pilih alasan" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reason ? (
                <p className="text-xs text-error-base">{errors.reason}</p>
              ) : null}
            </div>

            {/* Detail textarea (always required, even when reason != "Lainnya") */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-detail-textarea">
                Detail <span className="text-error-base">*</span>
              </Label>
              <Textarea
                id="edit-detail-textarea"
                value={detail}
                onChange={(e) => {
                  setDetail(e.target.value)
                  if (errors.detail) {
                    setErrors((p) => ({ ...p, detail: undefined }))
                  }
                }}
                placeholder={
                  reasonValue === OTHER_VALUE
                    ? "Tuliskan alasan perubahan secara spesifik..."
                    : "Tuliskan konteks tambahan untuk audit log..."
                }
                rows={4}
                invalid={Boolean(errors.detail)}
                aria-describedby="edit-detail-help"
              />
              <div className="flex items-center justify-between gap-2">
                <p
                  id="edit-detail-help"
                  className={
                    errors.detail ? "text-xs text-error-base" : "text-xs text-text-soft-400"
                  }
                >
                  {errors.detail ??
                    `Minimum ${MIN_DETAIL_LENGTH} karakter. Akan ditampilkan di riwayat audit.`}
                </p>
                <p
                  className={
                    detail.trim().length >= MIN_DETAIL_LENGTH
                      ? "text-xs text-success-base tabular-nums"
                      : "text-xs text-text-soft-400 tabular-nums"
                  }
                >
                  {detail.trim().length}/{MIN_DETAIL_LENGTH}
                </p>
              </div>
            </div>

            {/* Approver dropdown — only when over threshold */}
            {requiresApproval ? (
              <div className="space-y-1.5">
                <Label htmlFor="approver-select">
                  Approver Fleet Manager{" "}
                  <span className="text-error-base">*</span>
                </Label>
                <Select
                  value={approverId}
                  onValueChange={(v) => {
                    setApproverId(v)
                    if (errors.approver) {
                      setErrors((p) => ({ ...p, approver: undefined }))
                    }
                  }}
                >
                  <SelectTrigger
                    id="approver-select"
                    aria-invalid={Boolean(errors.approver)}
                  >
                    <SelectValue placeholder="Pilih approver" />
                  </SelectTrigger>
                  <SelectContent>
                    {(approvers ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.approver ? (
                  <p className="text-xs text-error-base">{errors.approver}</p>
                ) : !approvers || approvers.length === 0 ? (
                  <p className="text-xs text-warning-dark">
                    Belum ada approver yang tersedia. Hubungi admin untuk
                    menambahkan Fleet Manager aktif.
                  </p>
                ) : (
                  <p className="text-xs text-text-soft-400">
                    Approver yang dipilih akan menerima notifikasi untuk
                    me-review perubahan.
                  </p>
                )}
              </div>
            ) : null}
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
              onClick={handleAttemptSave}
              disabled={saving}
            >
              Lanjut review
            </Button>
            <span className="sr-only">Editor: {editorId}</span>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm modal — second layer */}
      <Modal
        open={confirmOpen}
        onOpenChange={(o) => {
          if (!o && !saving) setConfirmOpen(false)
        }}
      >
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Konfirmasi perubahan</ModalTitle>
            <ModalDescription>
              Setelah disimpan, perubahan akan tercatat di audit log dan tidak
              dapat dibatalkan.
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="space-y-4">
            {/* Before / After */}
            <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs text-text-sub-600">Sebelum</div>
                  <div className="mt-0.5 text-base font-semibold text-text-strong-950 tabular-nums">
                    {formatRupiahWithPrefix(currentAmount)}
                  </div>
                </div>
                <RiArrowRightLine
                  aria-hidden
                  className="size-4 shrink-0 text-text-soft-400"
                />
                <div className="flex-1 text-right">
                  <div className="text-xs text-text-sub-600">Sesudah</div>
                  <div className="mt-0.5 text-base font-semibold text-primary-base tabular-nums">
                    {newAmount != null
                      ? formatRupiahWithPrefix(newAmount)
                      : "—"}
                  </div>
                </div>
              </div>
              {newAmount != null ? (
                <div className="mt-2 text-xs text-text-sub-600">
                  Selisih{" "}
                  <strong
                    className={
                      direction === "up"
                        ? "text-success-base tabular-nums"
                        : "text-error-base tabular-nums"
                    }
                  >
                    {direction === "up" ? "+" : "−"}
                    {formatRupiahWithPrefix(diff)}
                  </strong>
                </div>
              ) : null}
            </div>

            {/* Summary list */}
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-text-sub-600">Receipt ID</dt>
                <dd className="font-mono text-text-strong-950">{receiptId}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-sub-600">Metode</dt>
                <dd className="text-text-strong-950">
                  {PAYMENT_METHOD_LABEL[paymentMethod]}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-sub-600">Alasan</dt>
                <dd className="text-text-strong-950">{reasonLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-sub-600 shrink-0">Detail</dt>
                <dd className="text-text-strong-950 text-right break-words max-w-[60%]">
                  {detail.trim()}
                </dd>
              </div>
              {requiresApproval ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-sub-600">Approver</dt>
                  <dd className="text-text-strong-950">
                    {approvers?.find((a) => a.id === approverId)?.name ?? "—"}
                  </dd>
                </div>
              ) : null}
            </dl>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              tone="neutral"
              style="stroke"
              onClick={() => setConfirmOpen(false)}
              disabled={saving}
            >
              Kembali
            </Button>
            <Button
              type="button"
              tone="primary"
              style="filled"
              leftIcon={<RiCheckLine />}
              onClick={handleConfirmSave}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan & catat audit"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
