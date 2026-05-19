"use client"

import * as React from "react"
import {
  RiRefreshLine as Refresh,
  RiFileCopyLine as Copy,
  RiCheckLine as Check,
} from "@remixicon/react"
import { useFormContext } from "react-hook-form"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/registry/dash/ui/form"
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
 *  - PE engineers tend to reinvent this every screen. Anchoring it as a single
 *    canonical pattern means refactor prompts can say "swap to use-code-field"
 *    instead of re-deriving the generator + clipboard + validation each time.
 *
 * SPEC (verified from real Dash usage — Phase 1.5 AGENTS.md + portal signup):
 *  - 6-character alphanumeric, **CASE-SENSITIVE**.
 *  - Portal sends `referralCode.trim()` verbatim to
 *    `POST /client-user/v1/auth/signup` as `aff`. NO uppercase forcing, NO
 *    normalization. A code like `aB3xY9` is DISTINCT from `AB3XY9`.
 *  - DB column `PolicyOneTimeCode.code` is also case-sensitive — unique per
 *    `(provider_id, code)`. Auto-uppercase would collapse the keyspace and
 *    break already-issued codes.
 *  - Charset includes upper + lower + digits (no special chars). Ambiguous
 *    glyphs (0/O/1/I/L) are NOT excluded from validation — the BE accepts them.
 *  - Earlier Phase 1 assumption "uppercase, exclude ambiguous chars" was
 *    INCORRECT. Confirmed wrong against portal source.
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

type UseCodeFieldProps = {
  /** RHF field name. Default "useCode" — override when nested inside arrays. */
  name?: string
  label?: React.ReactNode
  description?: React.ReactNode
  /** Auto-fill an empty field on mount. Default true. */
  autoGenerate?: boolean
}

/**
 * UseCodeField — drop-in RHF field. Caller is responsible for putting it
 * inside <FormProvider> (Dash <Form>) with a zod schema that uses
 * USE_CODE_REGEX for validation. Example:
 *
 *   const schema = z.object({ useCode: z.string().regex(USE_CODE_REGEX) })
 *
 * Adaptation: on Dash repos that ban RHF/zod (portal, backoffice, halo),
 * see the Adaptation Layer in dash-ai-rules.md — use Jotai atom or useState
 * + hand-rolled validator `(v) => USE_CODE_REGEX.test(v)` instead.
 *
 * WHY we expose `name` as a prop: this same field gets reused inside
 * useFieldArray rows (e.g. `items.0.useCode`) — hardcoding the name would
 * defeat the pattern's main use case (multi-order delivery with per-row codes).
 */
export function UseCodeField({
  name = "useCode",
  label = "Use code",
  description = "6-character code given to the mitra at pickup. Case-sensitive.",
  autoGenerate = true,
}: UseCodeFieldProps) {
  const { setValue, getValues } = useFormContext()
  const [copied, setCopied] = React.useState(false)

  // WHY useEffect with empty-check: avoid overwriting a value the parent
  // pre-seeded (e.g. when editing an existing delivery).
  React.useEffect(() => {
    if (!autoGenerate) return
    const current = getValues(name)
    if (!current) setValue(name, genUseCode(), { shouldValidate: false })
  }, [autoGenerate, getValues, name, setValue])

  const handleRegenerate = () => {
    setValue(name, genUseCode(), { shouldValidate: true, shouldDirty: true })
    setCopied(false)
  }

  const handleCopy = async () => {
    const code = getValues(name)
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success(`Use code ${code} copied`)
    // Reset icon after a tick so the affordance stays discoverable.
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <InputRoot>
              <Input
                {...field}
                value={field.value ?? ""}
                maxLength={6}
                autoComplete="off"
                spellCheck={false}
                // WHY font-mono + tracking: codes are case-sensitive so we
                // intentionally do NOT apply CSS `uppercase` — that would
                // visually deceive users into thinking case doesn't matter.
                className="font-mono tracking-[0.3em]"
                // WHY no .toUpperCase() in onChange: case is significant per
                // spec. The BE compares the trimmed value verbatim.
                onChange={(e) => field.onChange(e.target.value)}
              />
              <IconButton
                type="button"
                size="xs"
                aria-label="Regenerate use code"
                onClick={handleRegenerate}
              >
                <Refresh />
              </IconButton>
              <IconButton
                type="button"
                size="xs"
                aria-label="Copy use code"
                onClick={handleCopy}
              >
                {copied ? <Check /> : <Copy />}
              </IconButton>
            </InputRoot>
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
