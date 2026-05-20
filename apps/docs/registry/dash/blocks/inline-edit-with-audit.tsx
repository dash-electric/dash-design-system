"use client"

import * as React from "react"
import {
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
} from "@remixicon/react"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * inline-edit-with-audit — canonical block for low-risk single-field edits
 * (mitra display name, vehicle description, outlet contact, etc.) that still
 * carry an audit-trail obligation.
 *
 * WHY this block exists:
 *  - Full image-editor-with-audit modal is overkill for one-line text tweaks.
 *  - Every tribe re-rolls a click-to-edit pattern, usually with no audit hook.
 *    This block forces the audit payload at the type level — caller can't ship
 *    without wiring it.
 *  - The audit payload shape (originalValue + newValue + editReason + editor)
 *    matches `t_<entity>_audit_log` 1:1 — the consumer just relays it.
 *  - `requireReason` defaults to false because the typical use case is
 *    cosmetic (display name typo). Legal/financial fields MUST set it true.
 *
 * Voice: neutral by default. Callers wrapping mitra-facing flows should pass
 * formal "Anda" labels via `fieldLabel`.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InlineEditAuditPayload = {
  fieldName: string
  originalValue: string
  newValue: string
  editReason?: string
  editorId: string
  timestamp: string // ISO
}

export type InlineEditWithAuditProps = {
  /** Stable machine name. Logged to audit. e.g. "mitra.display_name". */
  fieldName: string
  /** Visible label shown above the input in edit mode + as aria-label. */
  fieldLabel: string
  /** Current persisted value. The block diffs against this for hasMutation. */
  initialValue: string
  /**
   * Persistence handler. Caller writes the entity column + inserts the
   * audit row in a transaction. Throw to surface a toast and keep the user
   * in edit mode.
   */
  onSave: (payload: InlineEditAuditPayload) => Promise<void>
  /** Current user UUID. Logged to audit row. */
  editorId: string
  /** True for legal/financial fields. False (default) for cosmetic. */
  requireReason?: boolean
  /** Per-field validation. Return error string or null when valid. */
  validate?: (value: string) => string | null
  /** Optional char cap. Renders counter when set. */
  maxLength?: number
  /** Input semantic type — drives mobile keyboard + browser validation. */
  inputType?: "text" | "email" | "tel" | "url"
  /** Custom read-mode renderer (e.g. wrap in <a> for email/url). */
  renderRead?: (value: string) => React.ReactNode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Mode = "read" | "edit"

export function InlineEditWithAudit({
  fieldName,
  fieldLabel,
  initialValue,
  onSave,
  editorId,
  requireReason = false,
  validate,
  maxLength,
  inputType = "text",
  renderRead,
}: InlineEditWithAuditProps) {
  const [mode, setMode] = React.useState<Mode>("read")
  const [draft, setDraft] = React.useState(initialValue)
  const [reason, setReason] = React.useState("")
  const [validationError, setValidationError] = React.useState<string | null>(null)
  const [reasonError, setReasonError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [justSaved, setJustSaved] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement | null>(null)
  // Stable ID for label↔input + aria-live wiring across renders.
  const idRef = React.useRef(
    `inline-edit-${Math.random().toString(36).slice(2, 9)}`,
  )
  const inputId = idRef.current
  const errorId = `${inputId}-error`
  const reasonId = `${inputId}-reason`
  const reasonErrorId = `${inputId}-reason-error`

  // If the upstream initialValue changes (e.g. parent refetches), and we're
  // not actively editing, mirror it. Prevents drift between source-of-truth
  // and the read display.
  React.useEffect(() => {
    if (mode === "read") {
      setDraft(initialValue)
    }
  }, [initialValue, mode])

  // Focus + select on enter-edit so users can type-to-replace immediately.
  React.useEffect(() => {
    if (mode === "edit") {
      // Defer to next frame so the input is mounted.
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [mode])

  // Checkmark animation auto-clears after 1.5s so it doesn't linger.
  React.useEffect(() => {
    if (!justSaved) return
    const t = setTimeout(() => setJustSaved(false), 1500)
    return () => clearTimeout(t)
  }, [justSaved])

  // -------------------------------------------------------------------------
  // Derived flags
  // -------------------------------------------------------------------------
  const hasMutation = draft !== initialValue
  // Validation runs eagerly on `draft` so the Save button reflects current
  // state without requiring a blur event.
  const liveValidationError = React.useMemo(() => {
    if (!validate) return null
    return validate(draft)
  }, [draft, validate])

  const canSave =
    hasMutation &&
    !liveValidationError &&
    (!requireReason || reason.trim().length > 0) &&
    !saving

  // -------------------------------------------------------------------------
  // Mode transitions
  // -------------------------------------------------------------------------
  const enterEdit = () => {
    if (mode === "edit") return
    setDraft(initialValue)
    setReason("")
    setValidationError(null)
    setReasonError(null)
    setMode("edit")
  }

  const discardAndExit = () => {
    setMode("read")
    setDraft(initialValue)
    setReason("")
    setValidationError(null)
    setReasonError(null)
  }

  const handleCancel = () => {
    const pending = hasMutation || reason.trim().length > 0
    if (pending) {
      if (
        typeof window !== "undefined" &&
        !window.confirm("Buang perubahan? Perubahan yang belum disimpan akan hilang.")
      ) {
        return
      }
    }
    discardAndExit()
  }

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    setValidationError(null)
    setReasonError(null)

    // Re-validate at submit-time even though canSave already gates the button
    // (paranoia + handles Enter-key bypass).
    if (validate) {
      const err = validate(draft)
      if (err) {
        setValidationError(err)
        return
      }
    }
    if (!hasMutation) return
    if (requireReason && reason.trim().length === 0) {
      setReasonError("Alasan perubahan wajib diisi.")
      return
    }

    setSaving(true)
    try {
      await onSave({
        fieldName,
        originalValue: initialValue,
        newValue: draft,
        editReason: reason.trim() ? reason.trim() : undefined,
        editorId,
        timestamp: new Date().toISOString(),
      })
      setMode("read")
      setReason("")
      setJustSaved(true)
    } catch (err) {
      // Stay in edit mode so the user can retry without re-typing.
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
  // Keyboard: Enter = save, Esc = cancel (only when inside the edit form)
  // -------------------------------------------------------------------------
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      handleCancel()
      return
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (canSave) void handleSave()
    }
  }

  // -------------------------------------------------------------------------
  // READ MODE
  // -------------------------------------------------------------------------
  if (mode === "read") {
    const display = renderRead
      ? renderRead(initialValue)
      : initialValue.length > 0
        ? initialValue
        : <span className="text-text-soft-400 italic">(kosong)</span>

    return (
      <div
        // 44px min target — mobile tap-friendly. Whole row is the hit area
        // so users don't have to aim at the pencil icon.
        role="button"
        tabIndex={0}
        aria-label={`Edit ${fieldLabel}`}
        onClick={enterEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            enterEdit()
          }
        }}
        className="group flex items-center justify-between gap-2 min-h-[44px] px-2 -mx-2 rounded-md cursor-text hover:bg-bg-weak-50 focus:bg-bg-weak-50 focus:outline-none focus:ring-2 focus:ring-primary-base/40 transition-colors"
      >
        <span className="text-sm text-text-strong-950 break-words">{display}</span>
        <span className="flex items-center gap-1.5 shrink-0">
          {justSaved ? (
            <span
              aria-live="polite"
              className="inline-flex items-center justify-center size-7 rounded-full bg-success-lighter text-success-base animate-in fade-in zoom-in duration-200"
            >
              <RiCheckLine className="size-4" aria-hidden />
              <span className="sr-only">Tersimpan</span>
            </span>
          ) : (
            <RiEditLine
              aria-hidden
              className="size-4 text-icon-soft-400 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity"
            />
          )}
        </span>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // EDIT MODE
  // -------------------------------------------------------------------------
  const displayedError = validationError ?? liveValidationError

  return (
    <div className="space-y-2" onKeyDown={onKeyDown}>
      <label
        htmlFor={inputId}
        className="block text-xs font-medium text-text-sub-600"
      >
        {fieldLabel}
      </label>
      <div className="flex items-stretch gap-2">
        <div className="flex-1 min-w-0">
          <InputRoot invalid={Boolean(displayedError)}>
            <Input
              id={inputId}
              ref={inputRef}
              type={inputType}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                if (validationError) setValidationError(null)
              }}
              maxLength={maxLength}
              aria-label={fieldLabel}
              aria-invalid={Boolean(displayedError)}
              aria-describedby={displayedError ? errorId : undefined}
              disabled={saving}
              autoComplete="off"
            />
          </InputRoot>
          {maxLength ? (
            <div className="mt-1 flex items-center justify-end text-[10px] text-text-soft-400 tabular-nums">
              {draft.length}/{maxLength}
            </div>
          ) : null}
        </div>
        {/* Min-44px tap targets on mobile via IconButton size="md". */}
        <IconButton
          type="button"
          size="md"
          tone="primary"
          style="filled"
          aria-label="Simpan perubahan"
          onClick={handleSave}
          disabled={!canSave}
        >
          {saving ? (
            <span
              aria-hidden
              className="size-4 rounded-full border-2 border-bg-white-0/40 border-t-bg-white-0 animate-spin"
            />
          ) : (
            <RiCheckLine />
          )}
        </IconButton>
        <IconButton
          type="button"
          size="md"
          tone="neutral"
          style="stroke"
          aria-label="Batal"
          onClick={handleCancel}
          disabled={saving}
        >
          <RiCloseLine />
        </IconButton>
      </div>

      {displayedError ? (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-xs text-error-base"
        >
          {displayedError}
        </p>
      ) : null}

      {requireReason ? (
        <div className="space-y-1.5">
          <label
            htmlFor={reasonId}
            className="block text-xs font-medium text-text-sub-600"
          >
            Alasan perubahan <span className="text-error-base">*</span>
          </label>
          <InputRoot invalid={Boolean(reasonError)}>
            <Input
              id={reasonId}
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (reasonError) setReasonError(null)
              }}
              placeholder="Singkat — akan dicatat di audit log."
              aria-invalid={Boolean(reasonError)}
              aria-describedby={reasonError ? reasonErrorId : undefined}
              disabled={saving}
            />
          </InputRoot>
          {reasonError ? (
            <p
              id={reasonErrorId}
              role="alert"
              aria-live="polite"
              className="text-xs text-error-base"
            >
              {reasonError}
            </p>
          ) : (
            <p className="text-[11px] text-text-soft-400">
              Wajib diisi untuk field ini. Akan tampil di riwayat audit.
            </p>
          )}
        </div>
      ) : null}

      {/* Hidden helper — surfaces editor id in audit row only. */}
      <span className="sr-only">Editor: {editorId} · Field: {fieldName}</span>
    </div>
  )
}
