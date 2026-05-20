"use client"

import * as React from "react"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import type { GapEntry } from "@/lib/dashboard-data"
import { RequestModal } from "./request-modal"
import { severityTone, statusTone, shortId, formatAge } from "./shared"

export type ActionStatus = {
  kind: "ok" | "pending" | "error"
  message: string
}

type Props = {
  entries: GapEntry[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onClearSelection: () => void
  /** Base URL for action endpoints; null when Agent L not deployed. */
  apiBaseUrl: string | null
}

/**
 * Client-side wrapper around the request table — owns the modal,
 * selection state for "Merge similar", and per-row action dispatch.
 *
 * Selection is multi-row checkbox driven so merge can pin one primary
 * and fold N siblings into it in a single API call. The merge button
 * only enables when ≥2 rows are checked.
 *
 * All action calls go through `dispatch()` which either hits the
 * Agent L endpoint or returns a synthetic "pending deployment" toast
 * so the UI never crashes when the API is absent.
 */
export function RequestTable({
  entries,
  selectedIds,
  onToggleSelect,
  onClearSelection,
  apiBaseUrl,
}: Props) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [mergePending, setMergePending] = React.useState(false)
  const [topBanner, setTopBanner] = React.useState<ActionStatus | null>(null)

  const active = entries.find((e) => e.id === activeId) ?? null
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds])

  const dispatch = React.useCallback(
    async (
      id: string,
      action: "generate" | "regenerate" | "decline",
      payload?: { reason?: string },
    ): Promise<ActionStatus> => {
      if (!apiBaseUrl) {
        return {
          kind: "pending",
          message: "Pending Agent L deployment — action recorded locally only.",
        }
      }

      const url = `${apiBaseUrl}/api/dashboard/requests/${encodeURIComponent(id)}${
        action === "decline" ? "" : `/${action}`
      }`
      const init: RequestInit =
        action === "decline"
          ? {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "declined", reason: payload?.reason ?? "" }),
            }
          : { method: "POST" }

      try {
        const res = await fetch(url, init)
        if (!res.ok) {
          return { kind: "error", message: `API returned ${res.status}` }
        }
        return {
          kind: "ok",
          message:
            action === "generate"
              ? "Vendoring queued — Agent N will pick it up."
              : action === "regenerate"
                ? "Regeneration queued."
                : "Marked as declined.",
        }
      } catch (e) {
        return {
          kind: "error",
          message: e instanceof Error ? e.message : "Network error",
        }
      }
    },
    [apiBaseUrl],
  )

  const handleMerge = async () => {
    if (selectedIds.length < 2) return
    setMergePending(true)
    try {
      if (!apiBaseUrl) {
        setTopBanner({
          kind: "pending",
          message: "Pending Agent L deployment — merge cannot persist yet.",
        })
        return
      }
      const [primary, ...rest] = selectedIds
      const res = await fetch(`${apiBaseUrl}/api/dashboard/requests/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary_id: primary, merge_ids: rest }),
      })
      if (!res.ok) {
        setTopBanner({ kind: "error", message: `Merge failed: ${res.status}` })
        return
      }
      setTopBanner({
        kind: "ok",
        message: `Merged ${rest.length} entries into ${shortId(primary)}.`,
      })
      onClearSelection()
    } catch (e) {
      setTopBanner({
        kind: "error",
        message: e instanceof Error ? e.message : "Merge network error",
      })
    } finally {
      setMergePending(false)
    }
  }

  return (
    <div className="space-y-3">
      {topBanner ? (
        <div
          className={
            topBanner.kind === "ok"
              ? "rounded-md border border-(--state-success-light) bg-(--state-success-lighter)/40 px-3 py-2 text-sm text-(--state-success-dark)"
              : topBanner.kind === "pending"
                ? "rounded-md border border-(--state-warning-light) bg-(--state-warning-lighter)/40 px-3 py-2 text-sm text-(--state-warning-dark)"
                : "rounded-md border border-(--state-error-light) bg-(--state-error-lighter)/40 px-3 py-2 text-sm text-(--state-error-dark)"
          }
        >
          {topBanner.message}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-text-soft-400">
          {selectedIds.length > 0
            ? `${selectedIds.length} selected`
            : `${entries.length} request${entries.length === 1 ? "" : "s"}`}
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 ? (
            <Button
              tone="neutral"
              style="stroke"
              size="xs"
              onClick={onClearSelection}
              disabled={mergePending}
            >
              Clear selection
            </Button>
          ) : null}
          <Button
            tone="primary"
            style="lighter"
            size="xs"
            disabled={selectedIds.length < 2 || mergePending}
            onClick={handleMerge}
          >
            {mergePending ? "Merging…" : "Merge similar"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
        <table className="w-full text-sm">
          <thead className="bg-bg-weak-50">
            <tr className="text-left">
              <th className="w-8 px-3 py-2.5" />
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                ID
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Severity
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Repo
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Description
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Age
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Status
              </th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-10 text-center text-sm text-text-sub-600"
                >
                  No requests match the current filters.
                </td>
              </tr>
            ) : (
              entries.map((e) => {
                const selected = selectedSet.has(e.id)
                return (
                  <tr
                    key={e.id}
                    className="border-t border-stroke-soft-200/60 hover:bg-bg-weak-50/40"
                  >
                    <td className="px-3 py-2.5 align-top">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(e.id)}
                        aria-label={`Select ${shortId(e.id)}`}
                        className="size-4 rounded border-stroke-soft-200 text-primary focus:ring-(--primary-alpha-16)"
                      />
                    </td>
                    <td className="px-3 py-2.5 align-top font-mono text-xs text-text-strong-950">
                      {shortId(e.id)}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <Badge appearance="lighter" status={severityTone(e.severity)}>
                        {e.severity}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 align-top text-xs text-text-sub-600">
                      {e.repo ?? <span className="text-text-soft-400">—</span>}
                    </td>
                    <td className="px-3 py-2.5 align-top text-sm text-text-strong-950 max-w-[420px]">
                      <button
                        type="button"
                        onClick={() => setActiveId(e.id)}
                        className="text-left hover:underline focus:underline focus:outline-none"
                      >
                        {e.description}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 align-top text-xs text-text-sub-600 whitespace-nowrap">
                      {formatAge(e.created_at)}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <Badge appearance="lighter" status={statusTone(e.status)}>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <Button
                        tone="neutral"
                        style="ghost"
                        size="xs"
                        onClick={() => setActiveId(e.id)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <RequestModal
        entry={active}
        onClose={() => setActiveId(null)}
        apiAvailable={apiBaseUrl !== null}
        onAction={dispatch}
      />
    </div>
  )
}
