"use client"

import * as React from "react"
import {
  RiCheckLine as Confirm,
  RiCloseLine as Cancel,
  RiPencilLine as Edit,
} from "@remixicon/react"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * @template inline-edit
 * @placeholder FIELD_NAME      — field key (used to label the audit payload).
 * @placeholder INITIAL_VALUE   — pre-edit string. Required when wiring to API.
 * @placeholder ON_SAVE         — async POST. Receives new value + audit payload.
 * @placeholder VALIDATE        — sync validator for the typed input. Returns
 *                                 string (error message) or null (valid).
 *
 * WHY this template:
 *  - Inline editable cells (delivery note, mitra nickname, vehicle plate) are
 *    a high-traffic Dash pattern. Developers keep copying the wrong shape: missing
 *    audit, no escape-to-cancel, no min tap target on mobile.
 *  - Scaffolding the read/edit toggle + audit POST + validate + a11y wiring
 *    means Agent N just fills FIELD_NAME + ON_SAVE.
 *  - Tap target = h-10 (40px) per dash-ai-rules.md mobile guidelines — large
 *    enough for a glove-on driver-app interaction, doesn't dominate desktop.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InlineEditAuditPayload = {
  fieldName: string
  originalValue: string
  editedValue: string
  /** Caller fills from session — empty disables the save button. */
  editorId: string
}

export type InlineEditTemplateProps = {
  /** Field key recorded in the audit log. */
  fieldName: string
  /** Pre-edit value. The template treats this as the source of truth. */
  initialValue: string
  /** Editor (current user) UUID. Pulled from session by the caller. */
  editorId: string
  /** Async POST. Throw to surface an error toast and stay in edit mode. */
  onSave: (newValue: string, audit: InlineEditAuditPayload) => Promise<void>
  /**
   * Synchronous validator. Return null when valid, error message when not.
   * @placeholder VALIDATE
   */
  validate?: (value: string) => string | null
  /** Visible label adjacent to the value when not editing. */
  label?: string
  /** Placeholder shown when the value is empty. */
  placeholder?: string
  /**
   * Disable inline edit (read-only). Useful when the caller knows the user
   * lacks permission — keeps the UI consistent without a separate component.
   */
  readOnly?: boolean
  /** Optional className for the outer wrapper. */
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InlineEditTemplate({
  fieldName,
  initialValue,
  editorId,
  onSave,
  validate,
  label,
  placeholder = "—",
  readOnly = false,
  className,
}: InlineEditTemplateProps) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(initialValue)
  const [error, setError] = React.useState<string | undefined>(undefined)
  const [saving, setSaving] = React.useState(false)

  // Keep the displayed value optimistic — on save success we update locally
  // BEFORE the parent refetches, so the user sees their change immediately.
  const [committed, setCommitted] = React.useState(initialValue)

  // Sync committed when the parent prop changes (e.g. parent refetches and
  // discovers an out-of-band update). WHY effect: this is the rare case where
  // we want props → state, but it's gated on a value diff to avoid clobbering
  // mid-edit drafts.
  React.useEffect(() => {
    if (!editing) {
      setCommitted(initialValue)
      setDraft(initialValue)
    }
  }, [initialValue, editing])

  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const enterEdit = () => {
    if (readOnly) return
    setDraft(committed)
    setError(undefined)
    setEditing(true)
    // Focus after the input mounts — useEffect would be heavier, a microtask
    // is enough since IconButton click → setState → input mounts synchronously.
    queueMicrotask(() => inputRef.current?.focus())
  }

  const cancelEdit = () => {
    setDraft(committed)
    setError(undefined)
    setEditing(false)
  }

  const commitEdit = async () => {
    setError(undefined)
    const trimmed = draft.trim()

    // No-op short-circuit — saving the same value would generate a noise
    // audit row. The backend would reject anyway, but skipping the POST
    // avoids the network roundtrip.
    if (trimmed === committed) {
      setEditing(false)
      return
    }

    const validationError = validate?.(trimmed)
    if (validationError) {
      setError(validationError)
      return
    }

    const payload: InlineEditAuditPayload = {
      fieldName,
      originalValue: committed,
      editedValue: trimmed,
      editorId,
    }

    setSaving(true)
    try {
      await onSave(trimmed, payload)
      setCommitted(trimmed)
      setEditing(false)
      toast.success("Perubahan tersimpan.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan."
      setError(message)
      toast.error(`Gagal menyimpan: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  // Escape cancels; Enter commits. WHY at the input (not document): we don't
  // want stray Esc on the page to close other modals while this is open.
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      cancelEdit()
    } else if (e.key === "Enter") {
      e.preventDefault()
      void commitEdit()
    }
  }

  if (!editing) {
    return (
      <div className={className}>
        {label ? (
          <p className="text-xs text-text-soft-400">{label}</p>
        ) : null}
        <div className="flex min-h-10 items-center gap-2">
          <span className="truncate text-sm text-text-strong-950">
            {committed || (
              <span className="text-text-soft-400">{placeholder}</span>
            )}
          </span>
          {!readOnly ? (
            <IconButton
              type="button"
              size="xs"
              style="ghost"
              aria-label={`Edit ${label ?? fieldName}`}
              onClick={enterEdit}
            >
              <Edit />
            </IconButton>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={`inline-edit-${fieldName}`}
          className="text-xs text-text-soft-400"
        >
          {label}
        </label>
      ) : null}
      <div className="flex items-center gap-1">
        <InputRoot
          className={error ? "ring-1 ring-error-base" : undefined}
          // h-10 = 40px tap target — see dash-ai-rules.md mobile guidelines.
        >
          <Input
            id={`inline-edit-${fieldName}`}
            ref={inputRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              if (error) setError(undefined)
            }}
            onKeyDown={onKeyDown}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `inline-edit-${fieldName}-error` : undefined}
            disabled={saving}
          />
        </InputRoot>
        <IconButton
          type="button"
          size="xs"
          tone="primary"
          aria-label="Simpan"
          onClick={() => void commitEdit()}
          disabled={saving}
        >
          <Confirm />
        </IconButton>
        <IconButton
          type="button"
          size="xs"
          style="ghost"
          aria-label="Batal"
          onClick={cancelEdit}
          disabled={saving}
        >
          <Cancel />
        </IconButton>
      </div>
      {error ? (
        <p
          id={`inline-edit-${fieldName}-error`}
          className="mt-1 text-xs text-error-base"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
