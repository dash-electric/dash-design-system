"use client"

import * as React from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/registry/dash/ui/modal"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { Textarea } from "@/registry/dash/ui/textarea"
import type { GapEntry } from "@/lib/dashboard-data"
import type { ActionStatus } from "./request-row"
import { severityTone, statusTone, shortId, formatAge } from "./shared"

type Props = {
  entry: GapEntry | null
  onClose: () => void
  /** Whether action endpoints are wired (Agent L deployed). */
  apiAvailable: boolean
  /**
   * Action handler — the parent calls the API (or fakes a toast) and
   * returns a status string we render below the action row.
   */
  onAction: (
    id: string,
    action: "generate" | "regenerate" | "decline",
    payload?: { reason?: string },
  ) => Promise<ActionStatus>
}

/**
 * Preview modal for a single gap entry. Shows full description, repo,
 * prompt, generated block path (if Agent N produced one), and the
 * foundation-match score (reserved field, hidden when null).
 *
 * The three primary actions live in the footer so they're always
 * visible regardless of scroll. Decline opens an inline reason field
 * because requiring a reason is the whole point of an audit trail.
 */
export function RequestModal({ entry, onClose, apiAvailable, onAction }: Props) {
  const [declineMode, setDeclineMode] = React.useState(false)
  const [declineReason, setDeclineReason] = React.useState("")
  const [pending, setPending] = React.useState<
    "generate" | "regenerate" | "decline" | null
  >(null)
  const [status, setStatus] = React.useState<ActionStatus | null>(null)

  // Reset transient UI state whenever the selected entry changes.
  React.useEffect(() => {
    setDeclineMode(false)
    setDeclineReason("")
    setPending(null)
    setStatus(null)
  }, [entry?.id])

  if (!entry) return null

  const run = async (action: "generate" | "regenerate" | "decline") => {
    setPending(action)
    try {
      const result = await onAction(
        entry.id,
        action,
        action === "decline" ? { reason: declineReason.trim() } : undefined,
      )
      setStatus(result)
    } finally {
      setPending(null)
    }
  }

  return (
    <Modal open={entry !== null} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-2xl">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-soft-400">
              {shortId(entry.id)}
            </span>
            <Badge appearance="lighter" status={severityTone(entry.severity)}>
              {entry.severity}
            </Badge>
            <Badge appearance="lighter" status={statusTone(entry.status)}>
              {entry.status}
            </Badge>
          </div>
          <ModalTitle className="text-left text-xl font-semibold tracking-tight text-text-strong-950">
            {entry.description}
          </ModalTitle>
          <ModalDescription className="text-left text-sm text-text-sub-600">
            Logged {formatAge(entry.created_at)} ago
            {entry.repo ? (
              <>
                {" · "}from <code className="text-xs">{entry.repo}</code>
              </>
            ) : null}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {entry.prompt ? (
            <section className="space-y-1.5">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Original prompt
              </h4>
              <pre className="max-h-40 overflow-auto rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap text-text-strong-950">
                {entry.prompt}
              </pre>
            </section>
          ) : null}

          <section className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Generated block
              </div>
              <div className="text-xs text-text-strong-950">
                {entry.generated_block_path ? (
                  <code>{entry.generated_block_path}</code>
                ) : (
                  <span className="text-text-soft-400">
                    Not generated yet (Agent N pending)
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Foundation match
              </div>
              <div className="text-xs text-text-strong-950">
                {typeof entry.foundation_match === "number" ? (
                  <>{Math.round(entry.foundation_match * 100)}%</>
                ) : (
                  <span className="text-text-soft-400">TBD (Agent N)</span>
                )}
              </div>
            </div>
          </section>

          {entry.decline_reason ? (
            <section className="space-y-1.5">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Decline reason
              </h4>
              <p className="rounded-md border border-(--state-error-light) bg-(--state-error-lighter)/30 px-3 py-2 text-sm text-(--state-error-dark)">
                {entry.decline_reason}
              </p>
            </section>
          ) : null}

          {declineMode ? (
            <section className="space-y-1.5">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                Why decline?
              </h4>
              <Textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Out of scope, duplicate, low impact, etc."
                className="min-h-[80px]"
              />
            </section>
          ) : null}

          {status ? (
            <div
              className={
                status.kind === "ok"
                  ? "rounded-md border border-(--state-success-light) bg-(--state-success-lighter)/40 px-3 py-2 text-sm text-(--state-success-dark)"
                  : status.kind === "pending"
                    ? "rounded-md border border-(--state-warning-light) bg-(--state-warning-lighter)/40 px-3 py-2 text-sm text-(--state-warning-dark)"
                    : "rounded-md border border-(--state-error-light) bg-(--state-error-lighter)/40 px-3 py-2 text-sm text-(--state-error-dark)"
              }
            >
              {status.message}
            </div>
          ) : null}
        </ModalBody>

        <ModalFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-text-soft-400">
            {apiAvailable
              ? "Actions hit the live Agent L API."
              : "API not wired — actions will queue locally."}
          </div>
          <div className="flex items-center gap-2">
            {declineMode ? (
              <>
                <Button
                  tone="neutral"
                  style="stroke"
                  size="sm"
                  onClick={() => {
                    setDeclineMode(false)
                    setDeclineReason("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  tone="destructive"
                  style="filled"
                  size="sm"
                  disabled={pending !== null || declineReason.trim().length === 0}
                  onClick={() => run("decline")}
                >
                  {pending === "decline" ? "Declining…" : "Confirm decline"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  tone="neutral"
                  style="stroke"
                  size="sm"
                  disabled={pending !== null}
                  onClick={() => setDeclineMode(true)}
                >
                  Decline
                </Button>
                <Button
                  tone="neutral"
                  style="stroke"
                  size="sm"
                  disabled={pending !== null || !entry.generated_block_path}
                  onClick={() => run("regenerate")}
                >
                  {pending === "regenerate" ? "Regenerating…" : "Regenerate"}
                </Button>
                <Button
                  tone="primary"
                  style="filled"
                  size="sm"
                  disabled={pending !== null}
                  onClick={() => run("generate")}
                >
                  {pending === "generate" ? "Vendoring…" : "Generate & Vendor"}
                </Button>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
