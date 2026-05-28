"use client"

import * as React from "react"
import {
  RiAddLine as Add,
  RiDeleteBinLine as Trash,
  RiRefreshLine as Refresh,
} from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import {
  USE_CODE_REGEX,
  genUseCode,
} from "@/registry/dash/patterns/use-code-field"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * multi-item-form — canonical reference for "add/remove rows + batch submit".
 *
 * WHY this pattern is anchored as a registry block (not docs prose):
 *  - The "delivery creation page jadi multi-order" refactor case keeps re-
 *    appearing (Dash Express, Bulk, Halo). Anchoring as code means AI agents
 *    can copy this exact shape via `dash add multi-item-form` instead of
 *    re-deriving the array-of-rows wiring (which they get wrong ~half the
 *    time).
 *  - The row shape + validator live in the same file as the form so agents
 *    can't mismatch the schema with the array name. A single source of truth
 *    defeats the most common refactor bug.
 *
 * STACK NOTES (per dash-ai-rules.md):
 *  - Forms: vanilla `useState` — NEVER react-hook-form.
 *  - Validation: hand-rolled inline in the submit handler — NEVER zod/joi.
 *  - Submit fn is intentionally inline here; for batch dispatch with per-row
 *    rollback see `@dash/patterns/bulk-submit` (its `submitOne` injection
 *    point pairs cleanly with the array this form produces).
 */

// WHY one row type per file: keeps the row shape next to the form that uses
// it — agents searching for "delivery item" land in the right place.
export type DeliveryItem = {
  pickupAddress: string
  dropoffAddress: string
  useCode: string
}

/** Per-row error map. Key matches field name; undefined = no error. */
export type DeliveryItemErrors = Partial<Record<keyof DeliveryItem, string>>

/** Factory for a blank row. Centralized so add-row stays in sync with shape. */
const blankItem = (): DeliveryItem => ({
  pickupAddress: "",
  dropoffAddress: "",
  useCode: genUseCode(),
})

/**
 * Hand-rolled per-row validator. Returns an error map; an empty object means
 * the row is valid. WHY a pure function (not an effect): submit is the only
 * place validation should fire — on-change validation creates flicker and
 * trains users to ignore red text before they've finished typing.
 */
function validateItem(item: DeliveryItem): DeliveryItemErrors {
  const errors: DeliveryItemErrors = {}
  if (item.pickupAddress.trim().length < 3) {
    errors.pickupAddress = "Pickup address is required"
  }
  if (item.dropoffAddress.trim().length < 3) {
    errors.dropoffAddress = "Dropoff address is required"
  }
  if (!USE_CODE_REGEX.test(item.useCode)) {
    errors.useCode = "Use code must be 6 alphanumeric chars"
  }
  return errors
}

type MultiItemFormProps = {
  /**
   * Submit handler. Called with the validated array of rows. Inject your
   * batch endpoint here — the pattern owns add/remove/validate, you own the
   * network call. For per-row rollback on partial failure, hand the result
   * to `<BulkSubmit>` instead of awaiting here.
   */
  onSubmit?: (items: DeliveryItem[]) => void | Promise<void>
}

export function MultiItemForm({ onSubmit }: MultiItemFormProps = {}) {
  // WHY one default row: an empty array would render nothing, leaving the
  // user staring at a lone "Add" button. Seed one row so the affordance
  // is obvious from first paint.
  const [items, setItems] = React.useState<DeliveryItem[]>(() => [blankItem()])

  // WHY indexed error map (not array-aligned): rows can be removed; aligning
  // errors by index would mean stale errors slide onto neighbor rows after a
  // remove. Keying by row index but rebuilding on submit avoids that drift.
  const [errors, setErrors] = React.useState<Record<number, DeliveryItemErrors>>({})
  const [formError, setFormError] = React.useState<string | undefined>(undefined)

  const updateItem = <K extends keyof DeliveryItem>(
    index: number,
    key: K,
    value: DeliveryItem[K],
  ) => {
    setItems((prev) => {
      const next = prev.slice()
      next[index] = { ...next[index], [key]: value }
      return next
    })
    // WHY clear the specific field error on edit: keeping it would punish the
    // user for fixing it. Clear narrowly so other untouched fields keep their
    // messages.
    setErrors((prev) => {
      const rowErrors = prev[index]
      if (!rowErrors || rowErrors[key] === undefined) return prev
      const { [key]: _, ...rest } = rowErrors
      return { ...prev, [index]: rest }
    })
  }

  const addItem = () => {
    setItems((prev) => [...prev, blankItem()])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
    // WHY rebuild the error map by index: removing a row shifts subsequent
    // indices down by one. Without remapping, row 3's old errors would
    // suddenly attach to row 2.
    setErrors((prev) => {
      const next: Record<number, DeliveryItemErrors> = {}
      Object.entries(prev).forEach(([key, value]) => {
        const i = Number(key)
        if (i === index) return
        next[i > index ? i - 1 : i] = value
      })
      return next
    })
  }

  const regenerateUseCode = (index: number) => {
    updateItem(index, "useCode", genUseCode())
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(undefined)

    // WHY validate at submit (not on change): see validateItem rationale.
    // We collect all row errors before deciding to short-circuit so the user
    // sees every problem at once instead of fixing them whack-a-mole.
    const nextErrors: Record<number, DeliveryItemErrors> = {}
    items.forEach((item, index) => {
      const rowErrors = validateItem(item)
      if (Object.keys(rowErrors).length > 0) nextErrors[index] = rowErrors
    })

    // WHY form-level "min 1": a multi-item form with zero rows is just a
    // broken empty form. We block removal of the last row, but a future
    // refactor could open that gap — defense in depth.
    if (items.length < 1) {
      setFormError("Add at least one delivery")
      setErrors(nextErrors)
      return
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    if (onSubmit) {
      await onSubmit(items)
    } else {
      // Default demo behaviour — replace via the `onSubmit` prop.
      toast.success(`${items.length} deliveries queued for dispatch`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {items.map((item, index) => {
          const rowErrors = errors[index] ?? {}
          return (
            <Card key={index}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-text-soft-400">
                    Delivery #{index + 1}
                  </span>
                  <IconButton
                    type="button"
                    size="xs"
                    tone="destructive"
                    style="ghost"
                    aria-label={`Remove delivery ${index + 1}`}
                    // WHY disable when items.length === 1: the form requires
                    // at least one row, so removing the last would leave the
                    // user with nothing to recover from.
                    disabled={items.length === 1}
                    onClick={() => removeItem(index)}
                  >
                    <Trash />
                  </IconButton>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor={`pickup-${index}`}
                    className="text-sm font-medium text-text-strong-950"
                  >
                    Pickup
                  </label>
                  <InputRoot className={rowErrors.pickupAddress ? "ring-1 ring-error-base" : undefined}>
                    <Input
                      id={`pickup-${index}`}
                      placeholder="Outlet or address"
                      value={item.pickupAddress}
                      onChange={(e) =>
                        updateItem(index, "pickupAddress", e.target.value)
                      }
                    />
                  </InputRoot>
                  {rowErrors.pickupAddress ? (
                    <p className="text-xs text-error-base">
                      {rowErrors.pickupAddress}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor={`dropoff-${index}`}
                    className="text-sm font-medium text-text-strong-950"
                  >
                    Dropoff
                  </label>
                  <InputRoot className={rowErrors.dropoffAddress ? "ring-1 ring-error-base" : undefined}>
                    <Input
                      id={`dropoff-${index}`}
                      placeholder="Recipient address"
                      value={item.dropoffAddress}
                      onChange={(e) =>
                        updateItem(index, "dropoffAddress", e.target.value)
                      }
                    />
                  </InputRoot>
                  {rowErrors.dropoffAddress ? (
                    <p className="text-xs text-error-base">
                      {rowErrors.dropoffAddress}
                    </p>
                  ) : null}
                </div>

                {/*
                  Per-row use-code, rendered inline so this pattern stays
                  RHF-free. genUseCode + USE_CODE_REGEX are imported from the
                  use-code-field pattern (pure exports, vanilla-state friendly).
                  WHY font-mono + tracking + no uppercase CSS: codes are
                  CASE-SENSITIVE per dash-ai-rules.md — visual uppercase would
                  deceive users into thinking case doesn't matter.
                */}
                <div className="space-y-1">
                  <label
                    htmlFor={`use-code-${index}`}
                    className="text-sm font-medium text-text-strong-950"
                  >
                    Use code
                  </label>
                  <InputRoot className={rowErrors.useCode ? "ring-1 ring-error-base" : undefined}>
                    <Input
                      id={`use-code-${index}`}
                      value={item.useCode}
                      maxLength={6}
                      autoComplete="off"
                      spellCheck={false}
                      className="font-mono tracking-[0.3em]"
                      onChange={(e) =>
                        updateItem(index, "useCode", e.target.value)
                      }
                    />
                    <IconButton
                      type="button"
                      size="xs"
                      aria-label={`Regenerate use code for delivery ${index + 1}`}
                      onClick={() => regenerateUseCode(index)}
                    >
                      <Refresh />
                    </IconButton>
                  </InputRoot>
                  {rowErrors.useCode ? (
                    <p className="text-xs text-error-base">{rowErrors.useCode}</p>
                  ) : (
                    <p className="text-xs text-text-soft-400">
                      6-character code given to the mitra at pickup. Case-sensitive.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {formError ? (
        <p className="text-sm text-error-base">{formError}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          tone="neutral"
          style="stroke"
          leftIcon={<Add />}
          onClick={addItem}
        >
          Add delivery
        </Button>
        <Button type="submit" tone="primary" style="filled">
          Submit {items.length} {items.length === 1 ? "delivery" : "deliveries"}
        </Button>
      </div>
    </form>
  )
}
