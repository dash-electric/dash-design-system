"use client"

import * as React from "react"
import {
  RiRefreshLine as Refresh,
  RiFileCopyLine as Copy,
  RiCheckLine as Check,
} from "@remixicon/react"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * use-code-field — single-purpose 6-character alphanumeric "use code" field.
 *
 * WHY this exists as a pattern (not a primitive):
 *  - Use-codes are a Dash domain concept (1 code per delivery / per referral,
 *    frontend-generated, validated server-side). They are NOT a generic input
 *    shape — they carry business rules (length, charset, regen affordance,
 *    copy-to-share).
 *  - Engineers tend to reinvent this every screen. Anchoring it as a single
 *    canonical pattern means refactor prompts can say "swap to use-code-field"
 *    instead of re-deriving the generator + clipboard + validation each time.
 *
 * SPEC (verified from real Dash usage — Phase 1.5 AGENTS.md + portal signup):
 *  - 6-character alphanumeric, **CASE-SENSITIVE**.
 *  - Portal sends `referralCode.trim()` verbatim to
 *    `POST /client-user/v1/auth/signup` as `aff`. NO uppercase forcing, NO
 *    normalization. A code like `aB3xY9` is DISTINCT from `AB3XY9`.
 *  - DB column on `policy_one_time_codes.code` (owned by nodejs-core-service)
 *    is also case-sensitive — unique per `(provider_id, code)`.
 *    Auto-uppercase would collapse the keyspace and break already-issued codes.
 *  - Charset includes upper + lower + digits (no special chars). Ambiguous
 *    glyphs (0/O/1/I/L) are NOT excluded from validation — the BE accepts them.
 *  - Earlier Phase 1 assumption "uppercase, exclude ambiguous chars" was
 *    INCORRECT. Confirmed wrong against portal source.
 *
 * WHY this file ships ZERO banned deps (no react-hook-form, no zod):
 *  - Dash hard-bans RHF + zod across all 5 FE repos (portal-v2, backoffice,
 *    halo-dash, basecamp, fleet-mgmt). Earlier versions of this pattern
 *    leaked `useFormContext` + a zod-shaped JSDoc example — users running
 *    `dash add use-code-field` would have inherited a self-contradiction.
 *  - The canonical shape is now: `useCodeField()` hook with
 *    `{ value, setValue, error, isValid, regenerate, copy, copied }` —
 *    drops straight into the native `useState` form pattern every Dash FE
 *    already uses. Component variant `<UseCodeField />` is a thin wrapper.
 *  - Hand-rolled validation = single regex test against `USE_CODE_REGEX`.
 *    No schema library, no resolver, no FormProvider required.
 *
 * WHY the generator lives in this file (not lib/):
 *  - The function is intentionally trivial — co-locating with the field keeps
 *    AI agents from inventing new generators when they don't see one nearby.
 *  - If you move it to lib/ later, update dash-ai-rules.md so the rules point
 *    to the new path; agents follow rules, not file history.
 */

/** 6-character alphanumeric, case-SENSITIVE (mixed upper/lower/digits). */
const USE_CODE_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
export const USE_CODE_REGEX = /^[A-Za-z0-9]{6}$/

export function genUseCode(): string {
  // WHY crypto.getRandomValues over Math.random: predictable seeds in some
  // SSR contexts cause duplicate codes across tabs; the cost is negligible.
  const bytes = new Uint8Array(6)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  let out = ""
  for (let i = 0; i < 6; i++)
    out += USE_CODE_CHARSET[bytes[i] % USE_CODE_CHARSET.length]
  return out
}

/**
 * Hand-rolled validator. Returns Bahasa error string when invalid, `null`
 * when valid. Inline-callable from any submit handler:
 *
 *   const err = validateUseCode(form.useCode)
 *   if (err) return setErrors({ useCode: err })
 *
 * Case is preserved verbatim — no `.toUpperCase()`, no `.trim()` beyond
 * what the caller chose to do. The BE compares trimmed value byte-for-byte.
 */
export function validateUseCode(value: string): string | null {
  if (!value) return "Use code wajib diisi"
  if (value.length !== 6) return "Use code harus 6 karakter"
  if (!USE_CODE_REGEX.test(value)) return "Use code hanya boleh huruf & angka"
  return null
}

export type UseCodeFieldState = {
  value: string
  /** Pass either a raw string or a React change event — same shape consumers write. */
  setValue: (next: string | React.ChangeEvent<HTMLInputElement>) => void
  /** Inline validation error message in Bahasa. `null` when valid or untouched. */
  error: string | null
  /** Convenience: `error === null && value !== ""`. */
  isValid: boolean
  /** Generate a fresh code, mark touched, clear stale error. */
  regenerate: () => void
  /** Copy current value to clipboard + toast. Noop on empty. */
  copy: () => Promise<void>
  /** True for ~1.5s after a successful copy — bind to icon swap. */
  copied: boolean
  /** Forces a validation pass + sets `error`. Call before submit. */
  validate: () => string | null
}

type UseCodeFieldOptions = {
  /** Seed value (e.g. when editing an existing delivery). */
  initialValue?: string
  /** Auto-fill an empty field on mount. Default true. */
  autoGenerate?: boolean
}

/**
 * useCodeField — vanilla `useState` hook. Drop into any Dash FE repo
 * without RHF / zod / FormProvider. Mirrors the per-repo guidance in
 * dash-ai-rules.md (portal: native useState, backoffice: same, halo: same,
 * basecamp: same, fleet-mgmt: same).
 *
 * Usage in a submit handler:
 *
 *   const code = useCodeField()
 *   const onSubmit = () => {
 *     if (code.validate()) return            // sets `error`, halts submit
 *     await axios.post("/client-user/v1/...", { aff: code.value })
 *   }
 */
export function useCodeField({
  initialValue = "",
  autoGenerate = true,
}: UseCodeFieldOptions = {}): UseCodeFieldState {
  const [value, setValueRaw] = React.useState<string>(initialValue)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [touched, setTouched] = React.useState(initialValue !== "")

  // WHY initial-only autogenerate: avoid overwriting a parent-seeded value
  // (matches old useEffect empty-check behavior, just rewired for useState).
  React.useEffect(() => {
    if (!autoGenerate) return
    if (initialValue) return
    setValueRaw(genUseCode())
    setTouched(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setValue: UseCodeFieldState["setValue"] = (next) => {
    const raw =
      typeof next === "string" ? next : next.target.value
    // WHY no .toUpperCase(): case is significant per spec. The BE compares
    // the trimmed value verbatim. Visual deception (CSS uppercase) would
    // mislead users into thinking case doesn't matter — banned in the
    // component variant too.
    setValueRaw(raw)
    setTouched(true)
    // Live-clear error once the value becomes valid; do NOT live-set error
    // on every keystroke (would flash "wajib diisi" while typing first char).
    if (error && validateUseCode(raw) === null) setError(null)
  }

  const validate = React.useCallback(() => {
    const err = validateUseCode(value)
    setError(err)
    return err
  }, [value])

  const regenerate = React.useCallback(() => {
    const next = genUseCode()
    setValueRaw(next)
    setTouched(true)
    setError(null)
    setCopied(false)
  }, [])

  const copy = React.useCallback(async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`Use code ${value} copied`)
      // Reset icon after a tick so the affordance stays discoverable.
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Gagal menyalin use code")
    }
  }, [value])

  const isValid = touched && error === null && USE_CODE_REGEX.test(value)

  return {
    value,
    setValue,
    error,
    isValid,
    regenerate,
    copy,
    copied,
    validate,
  }
}

type UseCodeFieldProps = {
  /** Stable name for label/htmlFor wiring (NOT an RHF field path). */
  name?: string
  label?: React.ReactNode
  description?: React.ReactNode
  /** Auto-fill an empty field on mount. Default true. */
  autoGenerate?: boolean
  /** Seed value (e.g. when editing an existing delivery). */
  initialValue?: string
  /** Fires on every keystroke + regenerate. Parent owns the value. */
  onChange?: (next: string) => void
}

/**
 * UseCodeField — component wrapper around `useCodeField`. Renders the
 * input + regenerate + copy affordances. Uncontrolled by default; pass
 * `initialValue` + `onChange` to thread the value into your form state.
 *
 * Caller is responsible for placing this inside their own native-`useState`
 * form (or Jotai atom in portal-v2). No FormProvider / RHF / zod required.
 *
 * WHY a wrapper exists at all: many consumer screens just want a drop-in field
 * without writing the hook glue. The hook stays the canonical primitive for
 * cases where the value needs to flow into a larger form object (e.g.
 * `useFieldArray`-style multi-row delivery list).
 */
export function UseCodeField({
  name = "useCode",
  label = "Use code",
  description = "6-character code given to the mitra at pickup. Case-sensitive.",
  autoGenerate = true,
  initialValue,
  onChange,
}: UseCodeFieldProps) {
  const field = useCodeField({ initialValue, autoGenerate })

  // Propagate value changes up. WHY useEffect over inline: parents that
  // setState in onChange would re-render us before we finish ours, causing
  // duplicate generator calls during the autogenerate effect.
  React.useEffect(() => {
    onChange?.(field.value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value])

  const id = `${name}-input`
  const errorId = `${name}-error`
  const descriptionId = `${name}-description`

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-text-strong-950"
      >
        {label}
      </label>
      <InputRoot>
        <Input
          id={id}
          name={name}
          value={field.value}
          onChange={field.setValue}
          maxLength={6}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={field.error != null}
          aria-describedby={
            field.error ? errorId : description ? descriptionId : undefined
          }
          // WHY font-mono + tracking: codes are case-sensitive so we
          // intentionally do NOT apply CSS `uppercase` — that would
          // visually deceive users into thinking case doesn't matter.
          className="font-mono tracking-[0.3em]"
        />
        <IconButton
          type="button"
          size="xs"
          aria-label="Regenerate use code"
          onClick={field.regenerate}
        >
          <Refresh />
        </IconButton>
        <IconButton
          type="button"
          size="xs"
          aria-label="Copy use code"
          onClick={field.copy}
        >
          {field.copied ? <Check /> : <Copy />}
        </IconButton>
      </InputRoot>
      {field.error ? (
        <p id={errorId} className="text-xs text-error-base">
          {field.error}
        </p>
      ) : description ? (
        <p id={descriptionId} className="text-xs text-text-sub-600">
          {description}
        </p>
      ) : null}
    </div>
  )
}
