"use client"

import * as React from "react"
import { RiSave3Line as Save } from "@remixicon/react"
import { Card, CardContent, CardFooter, CardHeader } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Label } from "@/registry/dash/ui/label"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * @template form-with-audit
 * @placeholder FIELDS        — feature-specific form fields (amount, signature URL,
 *                              status, payment ref). The template owns the audit
 *                              reason + before/after diff; AI fills the rest.
 * @placeholder VALIDATE_FN   — synchronous field validation. Returns a partial
 *                              error map. Empty object = valid. See validateForm
 *                              shape below.
 * @placeholder SUBMIT_FN     — async POST handler. Receives the form values AND
 *                              the audit payload (original snapshot + edit reason).
 *
 * WHY this template:
 *  - High-stakes field edits (payment amounts, status changes, signature URLs)
 *    are the most audited surface in Dash. AI keeps generating these forms with
 *    react-hook-form + zod (banned), and keeps forgetting to capture the
 *    edit reason. Locking the reason field + the before-save snapshot in the
 *    scaffold makes both impossible to omit.
 *  - Vanilla useState + hand-rolled validation per dash-ai-rules.md §
 *    Banned Imports. The validateForm signature is intentionally callable so
 *    AI can paste rules without thinking about hooks.
 *  - When `initialValues` is supplied, the template treats the form as EDIT
 *    mode and requires `editReason`. When omitted (new record), the reason
 *    field hides automatically.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Generic field-error map. Key = field name, value = human-readable message. */
export type FormErrors<TValues> = Partial<Record<keyof TValues, string>>

/** Audit snapshot — sent to the BE alongside the form values. */
export type FormAuditSnapshot<TValues> = {
  /** Pre-edit values, taken at mount. null = create mode (no original). */
  originalValues: TValues | null
  /** Per-field old → new diff, only entries that changed. */
  changedFields: Array<{
    fieldName: keyof TValues & string
    originalValue: unknown
    editedValue: unknown
  }>
  /** Required when editing an existing record (originalValues != null). */
  editReason: string
}

export type FormWithAuditTemplateProps<TValues extends Record<string, unknown>> = {
  /** Form title shown in the card header. */
  title: string
  /** Initial values. Omit for CREATE mode (audit reason hidden). */
  initialValues?: TValues
  /** Blank values used to seed CREATE mode. Required when no initialValues. */
  blankValues: TValues
  /** Synchronous validation. Called on submit. */
  validate: (values: TValues) => FormErrors<TValues>
  /** Async POST. Receives the values + a fully-built audit snapshot. */
  onSubmit: (values: TValues, audit: FormAuditSnapshot<TValues>) => Promise<void>
  /** AI fills this with the field markup. Receives the form helpers. */
  children: (helpers: FormFieldHelpers<TValues>) => React.ReactNode
  /** Optional descriptor placed under the title. */
  description?: string
}

/** Helpers passed to the FIELDS render prop. AI uses these to wire each input. */
export type FormFieldHelpers<TValues> = {
  values: TValues
  errors: FormErrors<TValues>
  setValue: <K extends keyof TValues>(key: K, value: TValues[K]) => void
  /** Convenience for inputs: returns id + aria-invalid + aria-describedby + handler. */
  getFieldProps: <K extends keyof TValues & string>(
    key: K,
  ) => {
    id: string
    value: TValues[K]
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    "aria-invalid": boolean
    "aria-describedby": string | undefined
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FormWithAuditTemplate<TValues extends Record<string, unknown>>({
  title,
  initialValues,
  blankValues,
  validate,
  onSubmit,
  children,
  description,
}: FormWithAuditTemplateProps<TValues>) {
  const isEditMode = initialValues !== undefined

  const [values, setValues] = React.useState<TValues>(
    () => initialValues ?? blankValues,
  )
  const [errors, setErrors] = React.useState<FormErrors<TValues>>({})
  const [editReason, setEditReason] = React.useState("")
  const [reasonError, setReasonError] = React.useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | undefined>(undefined)

  // WHY snapshot the original at mount (not on every render): if the values
  // mutate during the edit, the audit diff must compare against the pristine
  // pre-edit state. Re-snapshotting on each render would always show "no diff".
  const originalSnapshot = React.useRef<TValues | null>(
    initialValues !== undefined ? structuredClone(initialValues) : null,
  )

  const setValue = React.useCallback(
    <K extends keyof TValues>(key: K, value: TValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }))
      // Clear the specific field error on edit — narrow clear so other fields
      // keep their messages. Same shape as multi-item-form.
      setErrors((prev) => {
        if (prev[key] === undefined) return prev
        const { [key]: _, ...rest } = prev
        return rest as FormErrors<TValues>
      })
    },
    [],
  )

  const getFieldProps = <K extends keyof TValues & string>(key: K) => ({
    id: `field-${key}`,
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // The cast is intentional — TValues is a record over unknown, but the
      // input always yields a string at this layer.
      setValue(key, e.target.value as unknown as TValues[K])
    },
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `field-${key}-error` : undefined,
  })

  const buildAuditSnapshot = (): FormAuditSnapshot<TValues> => {
    const original = originalSnapshot.current
    if (!original) {
      return { originalValues: null, changedFields: [], editReason: editReason.trim() }
    }
    const changed: FormAuditSnapshot<TValues>["changedFields"] = []
    ;(Object.keys(values) as Array<keyof TValues & string>).forEach((key) => {
      // Shallow equality — sufficient for primitive form fields. Deep diffs
      // belong in a wrapper if the form holds JSON blobs.
      if (original[key] !== values[key]) {
        changed.push({
          fieldName: key,
          originalValue: original[key],
          editedValue: values[key],
        })
      }
    })
    return {
      originalValues: original,
      changedFields: changed,
      editReason: editReason.trim(),
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(undefined)
    setReasonError(undefined)

    // @placeholder VALIDATE_FN
    // -----------------------------------------------------------------------
    // AI: the actual rules live in the caller's `validate` prop. This is the
    // dispatch point — DON'T inline rules here; keep them in the caller so
    // they're testable in isolation.
    // -----------------------------------------------------------------------
    const nextErrors = validate(values)

    // Edit-mode requires non-empty reason. See dash-ai-rules.md § Audit Trail
    // rule #2: empty reason is REFUSED at FE + BE.
    if (isEditMode) {
      const snapshot = buildAuditSnapshot()
      if (snapshot.changedFields.length === 0) {
        setFormError("Tidak ada perubahan untuk disimpan.")
        setErrors(nextErrors)
        return
      }
      if (editReason.trim().length < 3) {
        setReasonError("Alasan perubahan wajib diisi (minimum 3 karakter).")
        setErrors(nextErrors)
        return
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    setErrors({})

    setSubmitting(true)
    try {
      await onSubmit(values, buildAuditSnapshot())
      toast.success("Berhasil disimpan.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan."
      setFormError(message)
      toast.error(`Gagal menyimpan: ${message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-text-strong-950">{title}</h2>
          {description ? (
            <p className="text-sm text-text-sub-600">{description}</p>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-4">
          {/*
            @placeholder FIELDS
            -----------------------------------------------------------------
            AI: render the feature's form fields here via the `children`
            render-prop. Each field should use `getFieldProps(key)` and pull
            its error from `errors[key]` for consistent a11y wiring.

            Example structure for one field:

              <div className="space-y-1">
                <Label htmlFor="field-amount">Nominal</Label>
                <InputRoot className={errors.amount ? "ring-1 ring-error-base" : undefined}>
                  <Input {...getFieldProps("amount")} type="number" />
                </InputRoot>
                {errors.amount ? (
                  <p id="field-amount-error" className="text-xs text-error-base">
                    {errors.amount}
                  </p>
                ) : null}
              </div>
            -----------------------------------------------------------------
          */}
          {children({ values, errors, setValue, getFieldProps })}

          {isEditMode ? (
            <div className="space-y-1 border-t border-stroke-soft-200 pt-4">
              <Label htmlFor="audit-edit-reason">
                Alasan perubahan <span className="text-error-base">*</span>
              </Label>
              <Textarea
                id="audit-edit-reason"
                value={editReason}
                onChange={(e) => {
                  setEditReason(e.target.value)
                  if (reasonError) setReasonError(undefined)
                }}
                placeholder="Contoh: koreksi nominal sesuai persetujuan finance."
                rows={3}
                aria-invalid={Boolean(reasonError)}
                aria-describedby={reasonError ? "audit-edit-reason-error" : undefined}
              />
              {reasonError ? (
                <p
                  id="audit-edit-reason-error"
                  className="text-xs text-error-base"
                >
                  {reasonError}
                </p>
              ) : (
                <p className="text-xs text-text-soft-400">
                  Wajib diisi. Tersimpan di audit log dan terlihat oleh auditor.
                </p>
              )}
            </div>
          ) : null}

          {formError ? (
            <div className="rounded-lg border border-error-base bg-error-lighter p-3 text-sm text-error-base">
              {formError}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            type="submit"
            tone="primary"
            style="filled"
            leftIcon={<Save />}
            loading={submitting}
          >
            Simpan
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Re-exports — keep `InputRoot`, `Input`, `Label` available so AI fills don't
// have to add duplicate imports in the consumer block.
// ---------------------------------------------------------------------------

export { InputRoot, Input, Label }
