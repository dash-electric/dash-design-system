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
 * @template bulk-action
 * @placeholder ROW_RENDERER  — custom row layout (avatar, secondary metadata).
 *                              Default renderer shows the row label + status only.
 * @placeholder ACTION_FN     — per-item async work (suspend, approve, dispatch).
 * @placeholder ACTION_LABEL  — verb shown on the primary button ("Suspend",
 *                              "Approve", "Dispatch"). Default = "Process".
 *
 * WHY this template (vs the existing bulk-submit pattern):
 *  - bulk-submit is locked to "submit" semantics — the verb is baked into the
 *    button copy and the toast text. Real Dash flows reuse the same SHAPE for
 *    suspend / unsuspend / approve / dispatch / withdraw.
 *  - Generalising the verb + row renderer turns a single pattern into a
 *    workhorse Hermes can drop into any "process N items in parallel" gap.
 *  - State machine + optimistic mark + per-row retry are the load-bearing
 *    pieces; everything else is presentational and gets the placeholder.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BulkActionItem = {
  id: string
  /** Human-readable label rendered when no custom ROW_RENDERER is supplied. */
  label: string
  /** Optional metadata payload — passed to ROW_RENDERER and ACTION_FN. */
  meta?: Record<string, unknown>
}

export type BulkActionResult = { ok: true } | { ok: false; reason: string }

type RowStatus = "idle" | "pending" | "success" | "error"

export type BulkActionTemplateProps<T extends BulkActionItem> = {
  items: T[]
  /**
   * Per-item async worker. Throw or return `{ ok: false }` to mark row as
   * errored. The template handles retry + summary toast on top.
   */
  // @placeholder ACTION_FN (signature anchored; AI fills the body in caller site)
  actionFn: (item: T) => Promise<BulkActionResult>
  /** Verb shown on the action button. Mitra-facing UI = formal voice. */
  actionLabel?: string
  /** Optional custom row content. Receives item + status. */
  renderRow?: (item: T, status: RowStatus) => React.ReactNode
  /** End-of-run callback regardless of partial success. */
  onComplete?: (summary: { succeeded: number; failed: number }) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkActionTemplate<T extends BulkActionItem>({
  items,
  actionFn,
  actionLabel = "Process",
  renderRow,
  onComplete,
}: BulkActionTemplateProps<T>) {
  // WHY Record-keyed status (not array): per-row updates avoid O(n) array
  // copies and keep unchanged rows from re-rendering. See bulk-submit pattern
  // for the same shape.
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
      // Clear stale error narrowly — a retry that succeeds must not leave a
      // ghost error message behind.
      setErrors((prev) => {
        const { [item.id]: _, ...rest } = prev
        return rest
      })
      try {
        const res = await actionFn(item)
        if (res.ok) {
          setStatus(item.id, "success")
          return true
        }
        setStatus(item.id, "error")
        setErrors((prev) => ({ ...prev, [item.id]: res.reason }))
        return false
      } catch (err) {
        setStatus(item.id, "error")
        setErrors((prev) => ({
          ...prev,
          [item.id]: err instanceof Error ? err.message : "Terjadi kesalahan.",
        }))
        return false
      }
    },
    [actionFn],
  )

  const runAll = async () => {
    setRunning(true)
    // Promise.all is correct here — batch actions are independent. Sequential
    // would defeat the bulk affordance.
    const results = await Promise.all(items.map((item) => runOne(item)))
    const succeeded = results.filter(Boolean).length
    const failed = results.length - succeeded
    setRunning(false)

    if (failed === 0) {
      toast.success(
        `${succeeded} item${succeeded === 1 ? "" : "s"} berhasil diproses.`,
      )
    } else {
      toast.error(
        `${failed} dari ${items.length} gagal. Mohon coba ulang per baris.`,
      )
    }
    onComplete?.({ succeeded, failed })
  }

  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        {items.map((item) => {
          const status = statuses[item.id] ?? "idle"
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <StatusIcon status={status} />
                {/*
                  @placeholder ROW_RENDERER
                  ----------------------------------------------------------
                  AI: replace this fallback with feature-specific row content.
                  Examples:
                    - Mitra suspend: avatar + name + last-dispatch timestamp
                    - Delivery dispatch: pickup→dropoff arrow + use-code
                    - Document approve: file icon + filename + size
                  Keep the StatusIcon to the LEFT so the run state stays the
                  scannable column.
                  ----------------------------------------------------------
                */}
                {renderRow ? (
                  renderRow(item, status)
                ) : (
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text-strong-950">{item.label}</p>
                    {status === "error" ? (
                      <p className="truncate text-xs text-error-base">
                        {errors[item.id] ?? "Gagal."}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
              {status === "error" ? (
                <IconButton
                  type="button"
                  size="xs"
                  aria-label={`Coba ulang ${item.label}`}
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
          {actionLabel} {items.length} item{items.length === 1 ? "" : "s"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function StatusIcon({ status }: { status: RowStatus }) {
  if (status === "success")
    return <Check aria-hidden className="size-4 shrink-0 text-success-base" />
  if (status === "error")
    return <X aria-hidden className="size-4 shrink-0 text-error-base" />
  if (status === "pending")
    return (
      <Loader aria-hidden className="size-4 shrink-0 animate-spin text-text-sub-600" />
    )
  return (
    <span
      aria-hidden
      className="size-4 shrink-0 rounded-full border border-stroke-soft-200 bg-bg-weak-50"
    />
  )
}
