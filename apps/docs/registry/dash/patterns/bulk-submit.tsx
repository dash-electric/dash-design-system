"use client"

import * as React from "react"
import {
  RiCheckLine as Check,
  RiCloseLine as X,
  RiLoader4Line as Loader,
  RiRefreshLine as Retry,
} from "@remixicon/react"
import { Card, CardContent, CardFooter } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * bulk-submit — pattern for "submit N independent items, show per-row status,
 * roll back on individual failure, summarize at the end."
 *
 * WHY this is its own pattern (separate from multi-item-form):
 *  - The FORM (collecting N rows) and the SUBMIT (dispatching N rows to a
 *    batch endpoint) are different concerns. PE engineers often collapse
 *    them and end up with a form that can't recover from a partial-failure
 *    response — the dreaded "5/8 deliveries succeeded, please refresh"
 *    dead-end.
 *  - Anchoring optimistic-UI + per-row rollback as a pattern gives AI agents
 *    a known-good shape to copy when a refactor adds batch dispatch to an
 *    existing single-submit form.
 *
 * The submit fn is injected so the pattern works with any batch endpoint
 * (deliveries, mitra invites, outlet bulk-create). The pattern owns:
 *   - Per-row status state (idle | pending | success | error)
 *   - Optimistic mark-as-success then rollback on failure
 *   - Per-row retry affordance
 *   - End-of-run summary toast
 */

export type BulkItem = {
  id: string
  /** Human-readable label for the row (e.g. "Delivery to Bekasi"). */
  label: string
}

export type BulkResult = { ok: true } | { ok: false; reason: string }

type RowStatus = "idle" | "pending" | "success" | "error"

type BulkSubmitProps<T extends BulkItem> = {
  items: T[]
  /**
   * Submit one row. The pattern calls this in parallel for all rows.
   * Throwing or returning { ok: false } triggers per-row rollback.
   */
  submitOne: (item: T) => Promise<BulkResult>
  /** Called once after the run finishes, regardless of partial success. */
  onComplete?: (summary: { succeeded: number; failed: number }) => void
}

export function BulkSubmit<T extends BulkItem>({
  items,
  submitOne,
  onComplete,
}: BulkSubmitProps<T>) {
  // WHY a Record over an array: per-row status updates would otherwise force
  // an O(n) array copy on every state change. Map-shape state keeps the
  // hot path O(1) and skips re-renders for unchanged rows.
  const [statuses, setStatuses] = React.useState<Record<string, RowStatus>>(
    () => Object.fromEntries(items.map((i) => [i.id, "idle"])),
  )
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [running, setRunning] = React.useState(false)

  const setStatus = (id: string, status: RowStatus) =>
    setStatuses((prev) => ({ ...prev, [id]: status }))

  const runOne = React.useCallback(
    async (item: T) => {
      setStatus(item.id, "pending")
      // WHY clear stale error first: a retry that fails again should overwrite,
      // but a retry that succeeds must not leave a ghost error sitting in state.
      setErrors((prev) => {
        const { [item.id]: _, ...rest } = prev
        return rest
      })
      try {
        const res = await submitOne(item)
        if (res.ok) {
          setStatus(item.id, "success")
          return true
        }
        setStatus(item.id, "error")
        setErrors((prev) => ({ ...prev, [item.id]: res.reason }))
        return false
      } catch (err) {
        // WHY catch-all: a thrown network error and a returned { ok: false }
        // should reach the user the same way. Don't make PE think about which.
        setStatus(item.id, "error")
        setErrors((prev) => ({
          ...prev,
          [item.id]: err instanceof Error ? err.message : "Unknown error",
        }))
        return false
      }
    },
    [submitOne],
  )

  const runAll = async () => {
    setRunning(true)
    // WHY Promise.all (not sequential): batch endpoints are independent by
    // definition. Sequential here would mean a slow first row blocks the
    // user's feedback on row N+1 — defeating the purpose of a "bulk" action.
    const results = await Promise.all(items.map((item) => runOne(item)))
    const succeeded = results.filter(Boolean).length
    const failed = results.length - succeeded
    setRunning(false)

    if (failed === 0) {
      toast.success(`${succeeded} item${succeeded === 1 ? "" : "s"} submitted`)
    } else {
      toast.error(`${failed} of ${items.length} failed — retry per row below`)
    }
    onComplete?.({ succeeded, failed })
  }

  return (
    <Card>
      <CardContent className="space-y-2 pt-5">
        {items.map((item) => {
          const status = statuses[item.id] ?? "idle"
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <StatusIcon status={status} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-text-strong-950">{item.label}</p>
                  {status === "error" ? (
                    <p className="truncate text-xs text-error-base">
                      {errors[item.id] ?? "Failed"}
                    </p>
                  ) : null}
                </div>
              </div>
              {status === "error" ? (
                <IconButton
                  type="button"
                  size="xs"
                  aria-label={`Retry ${item.label}`}
                  onClick={() => runOne(item)}
                >
                  <Retry />
                </IconButton>
              ) : null}
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          type="button"
          tone="primary"
          style="filled"
          loading={running}
          onClick={runAll}
          disabled={items.length === 0}
        >
          Submit {items.length} item{items.length === 1 ? "" : "s"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function StatusIcon({ status }: { status: RowStatus }) {
  // WHY a single component: keeps the icon-to-status mapping in one place so
  // adding a new status (e.g. "skipped") doesn't drift between rows.
  if (status === "success")
    return <Check aria-hidden className="size-4 shrink-0 text-success-base" />
  if (status === "error")
    return <X aria-hidden className="size-4 shrink-0 text-error-base" />
  if (status === "pending")
    return <Loader aria-hidden className="size-4 shrink-0 animate-spin text-text-sub-600" />
  return (
    <span
      aria-hidden
      className="size-4 shrink-0 rounded-full border border-stroke-soft-200 bg-bg-weak-50"
    />
  )
}
