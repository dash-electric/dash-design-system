"use client"

import * as React from "react"
import {
  RiCheckLine as Approve,
  RiCloseLine as Reject,
  RiSkipRightLine as Skip,
  RiArrowGoBackLine as Rollback,
  RiLockLine as Lock,
} from "@remixicon/react"
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Badge, type Status } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import {
  StepIndicator,
  Step,
} from "@/registry/dash/ui/step-indicator"
import { toast } from "@/registry/dash/ui/toaster"
import { cn } from "@/registry/dash/lib/utils"

/**
 * MultiStageApproval — N-stage approval workflow (sequential or parallel,
 * single approver per stage). Built on top of the canonical multi-stage
 * scaffold (`scaffolds/multi-stage.template.tsx`).
 *
 * Use cases:
 *  - Tribe-Express maintenance approval (Mekanik → Fleet Manager → Finance)
 *  - Repossession escalation (Field Ops → Legal → Director)
 *  - Mitra reinstate (Ops → Tribe Lead → Compliance)
 *  - Any workflow where stages are ORDERED DATA, not a hard-coded boolean ladder.
 *
 * State machine per stage:
 *   pending → in_progress → (approved | rejected | skipped)
 *
 * Reject behavior:
 *   - `rollback` (default): rejection sets the previous stage back to
 *     `in_progress`, so the prior approver can fix and re-advance. The
 *     rejected stage itself stays marked as "rejected" on the rail.
 *   - `dead-end`: rejection terminates the workflow ("closed-denied").
 *     No further transitions are allowed; rail freezes at the rejection point.
 *
 * Audit trail (per Dash AI Rules § Audit Trail):
 *  - Every transition payload to `onTransition` carries stageId + action +
 *    optional comment. The caller is responsible for persisting the row in
 *    `t_<entity>_audit_log` with editor + timestamp metadata.
 *  - `MultiStageApproval` does NOT mutate stages locally; status changes are
 *    driven by the caller re-passing updated `stages` after the BE write
 *    succeeds. This keeps the source-of-truth single-rooted (BE row),
 *    matches the Dash optimistic-update policy.
 *
 * Authorization gate:
 *  - Only the user whose id matches `stages[current].assignedTo.id` (and
 *    equals `currentUserId`) can act on the current stage. Other viewers
 *    see the comment thread + status read-only.
 *
 * Voice: neutral staff/ops (Indonesian formal "Anda"-tier copy).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ApprovalStageStatus =
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected"
  | "skipped"

export type ApprovalAction = "approve" | "reject" | "skip"

export type ApprovalStage = {
  /** Stable key — required for lookup + key prop. */
  id: string
  /** Human-readable label rendered in the step rail and detail card. */
  label: string
  /** Role title of the approver (e.g. "Fleet Manager"). */
  approverRole: string
  /** Concrete assignee — only this user can act when stage is current. */
  assignedTo?: { id: string; name: string }
  status: ApprovalStageStatus
  /** Last action comment (free text). */
  comment?: string
  /** ISO8601 timestamp of the last transition on this stage. */
  timestamp?: string
}

export type MultiStageApprovalProps = {
  stages: ApprovalStage[]
  /** id of the stage currently in flight. Must exist in `stages`. */
  currentStageId: string
  /**
   * Persist a status change. Caller is responsible for writing the audit row
   * and re-fetching `stages` so the component reflects the new state.
   */
  onTransition: (
    stageId: string,
    action: ApprovalAction,
    comment?: string,
  ) => Promise<void>
  /**
   * Reject behavior. `rollback` bounces back to the previous stage (default,
   * matches Maintenance + Repossession flows). `dead-end` terminates the
   * workflow on the rejected stage.
   */
  rejectBehavior?: "rollback" | "dead-end"
  /** Acting user id — gates the Approve/Reject/Skip buttons. */
  currentUserId: string
  /** Optional heading copy. */
  title?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Status → presentation maps
// ---------------------------------------------------------------------------

const STATUS_BADGE_TEXT: Record<ApprovalStageStatus, string> = {
  pending: "Menunggu",
  in_progress: "Berlangsung",
  approved: "Disetujui",
  rejected: "Ditolak",
  skipped: "Dilewati",
}

const STATUS_BADGE_TONE: Record<ApprovalStageStatus, Status> = {
  pending: "faded",
  in_progress: "information",
  approved: "success",
  rejected: "error",
  skipped: "warning",
}

const stepStatusFor = (
  stage: ApprovalStage,
  isCurrent: boolean,
): "completed" | "current" | "upcoming" => {
  if (stage.status === "approved" || stage.status === "skipped") return "completed"
  if (stage.status === "rejected") return "current"
  if (isCurrent) return "current"
  if (stage.status === "in_progress") return "current"
  return "upcoming"
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "?"

// ---------------------------------------------------------------------------
// Sub-component: collapsed history row (previous + skipped/rejected stages)
// ---------------------------------------------------------------------------

function HistoryRow({ stage }: { stage: ApprovalStage }) {
  return (
    <li
      data-slot="multi-stage-approval-history-row"
      className="flex flex-col gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-strong-950">
            {stage.label}
          </p>
          <p className="truncate text-xs text-text-sub-600">
            {stage.approverRole}
            {stage.assignedTo ? ` · ${stage.assignedTo.name}` : ""}
          </p>
        </div>
        <Badge
          status={STATUS_BADGE_TONE[stage.status]}
          appearance="lighter"
          size="sm"
        >
          {STATUS_BADGE_TEXT[stage.status]}
        </Badge>
      </div>
      {stage.comment ? (
        <p className="line-clamp-2 text-xs text-text-sub-600">
          &ldquo;{stage.comment}&rdquo;
        </p>
      ) : null}
      {stage.timestamp ? (
        <p className="text-xs text-text-soft-400">
          <time dateTime={stage.timestamp}>
            {new Date(stage.timestamp).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>
        </p>
      ) : null}
    </li>
  )
}

// ---------------------------------------------------------------------------
// Sub-component: future (locked) stage row
// ---------------------------------------------------------------------------

function FutureRow({ stage }: { stage: ApprovalStage }) {
  return (
    <li
      data-slot="multi-stage-approval-future-row"
      className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-stroke-soft-200 bg-bg-weak-50 p-3 opacity-70"
    >
      <div className="min-w-0">
        <p className="truncate text-sm text-text-sub-600">{stage.label}</p>
        <p className="truncate text-xs text-text-soft-400">{stage.approverRole}</p>
      </div>
      <Lock aria-hidden className="size-4 text-text-soft-400" />
    </li>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function MultiStageApproval({
  stages,
  currentStageId,
  onTransition,
  rejectBehavior = "rollback",
  currentUserId,
  title = "Persetujuan",
  className,
}: MultiStageApprovalProps) {
  const [comment, setComment] = React.useState("")
  const [commentError, setCommentError] = React.useState<string | undefined>(
    undefined,
  )
  const [submittingAction, setSubmittingAction] =
    React.useState<ApprovalAction | null>(null)

  const currentIndex = stages.findIndex((s) => s.id === currentStageId)
  const currentStage = currentIndex >= 0 ? stages[currentIndex] : undefined

  // Workflow terminated when current stage is approved (terminal stage) or
  // rejected in dead-end mode. We still render the rail + history so auditors
  // can read the final state, but suppress action buttons.
  const isTerminal =
    !currentStage ||
    (currentStage.status === "rejected" && rejectBehavior === "dead-end") ||
    (currentStage.status === "approved" && currentIndex === stages.length - 1)

  const canAct =
    !!currentStage &&
    !isTerminal &&
    currentStage.assignedTo?.id === currentUserId &&
    (currentStage.status === "pending" ||
      currentStage.status === "in_progress")

  // ---- Empty state -----------------------------------------------------
  if (stages.length === 0 || !currentStage) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-sm text-text-sub-600">
          Workflow belum dikonfigurasi.
        </CardContent>
      </Card>
    )
  }

  // ---- Transition handler ---------------------------------------------
  // We accept the action argument explicitly (rather than reading from
  // local state) so the comment validation rule can be precise per action:
  //  - approve: comment optional
  //  - reject:  comment REQUIRED (min 3 chars after trim)
  //  - skip:    comment REQUIRED (min 3 chars after trim) — skipping a
  //             mandated approver demands a paper trail
  const handle = async (action: ApprovalAction) => {
    setCommentError(undefined)
    const trimmed = comment.trim()
    if ((action === "reject" || action === "skip") && trimmed.length < 3) {
      setCommentError(
        action === "reject"
          ? "Alasan penolakan wajib diisi (minimum 3 karakter)."
          : "Alasan melewati tahap wajib diisi (minimum 3 karakter).",
      )
      return
    }

    setSubmittingAction(action)
    try {
      await onTransition(currentStage.id, action, trimmed || undefined)
      setComment("")
      toast.success(
        action === "approve"
          ? "Tahap disetujui."
          : action === "reject"
            ? rejectBehavior === "rollback"
              ? "Tahap ditolak. Dikembalikan ke approver sebelumnya."
              : "Tahap ditolak. Workflow ditutup."
            : "Tahap dilewati.",
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui."
      toast.error(`Gagal memperbarui tahap: ${message}`)
    } finally {
      setSubmittingAction(null)
    }
  }

  const submitting = submittingAction !== null

  // ---- Render ----------------------------------------------------------
  return (
    <Card className={className} data-slot="multi-stage-approval">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-strong-950">{title}</h2>
          <Badge
            status={STATUS_BADGE_TONE[currentStage.status]}
            appearance="lighter"
            size="md"
          >
            {STATUS_BADGE_TEXT[currentStage.status]}
          </Badge>
        </div>

        <StepIndicator orientation="horizontal" className="overflow-x-auto">
          {stages.map((stage, idx) => (
            <Step
              key={stage.id}
              status={stepStatusFor(stage, idx === currentIndex)}
              index={idx + 1}
              label={stage.label}
              description={stage.approverRole}
              withConnector={idx < stages.length - 1}
              orientation="horizontal"
            />
          ))}
        </StepIndicator>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current stage detail */}
        <section
          aria-labelledby="multi-stage-approval-current"
          className="space-y-3 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                id="multi-stage-approval-current"
                className="text-sm font-medium text-text-strong-950"
              >
                {currentStage.label}
              </p>
              <p className="text-xs text-text-sub-600">
                {currentStage.approverRole}
              </p>
            </div>
            {currentStage.assignedTo ? (
              <div className="flex items-center gap-2">
                <Avatar size="md">
                  <AvatarFallback>
                    {initials(currentStage.assignedTo.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm text-text-strong-950">
                    {currentStage.assignedTo.name}
                  </p>
                  <p className="truncate text-xs text-text-sub-600">
                    {currentStage.assignedTo.id === currentUserId
                      ? "Anda"
                      : "Approver"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-soft-400">Belum ditugaskan.</p>
            )}
          </div>

          {/* Comment input — only when the viewer can act. Otherwise we
              render the latest comment read-only so other viewers see
              context without an editable surface. */}
          {canAct ? (
            <div className="space-y-1">
              <label
                htmlFor="multi-stage-approval-comment"
                className="text-xs font-medium text-text-strong-950"
              >
                Komentar
              </label>
              <Textarea
                id="multi-stage-approval-comment"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value)
                  if (commentError) setCommentError(undefined)
                }}
                placeholder="Catatan untuk audit trail..."
                rows={3}
                aria-invalid={Boolean(commentError)}
                aria-describedby={
                  commentError ? "multi-stage-approval-comment-error" : undefined
                }
                disabled={submitting}
              />
              {commentError ? (
                <p
                  id="multi-stage-approval-comment-error"
                  className="text-xs text-error-base"
                >
                  {commentError}
                </p>
              ) : (
                <p className="text-xs text-text-soft-400">
                  Wajib diisi untuk Tolak dan Lewati. Opsional untuk Setujui.
                </p>
              )}
            </div>
          ) : currentStage.comment ? (
            <p className="rounded-md bg-bg-white-0 p-2 text-xs text-text-sub-600">
              &ldquo;{currentStage.comment}&rdquo;
            </p>
          ) : null}

          {!canAct && currentStage.assignedTo && !isTerminal ? (
            <p className="text-xs text-text-soft-400">
              Hanya {currentStage.assignedTo.name} ({currentStage.approverRole})
              yang dapat melakukan aksi pada tahap ini.
            </p>
          ) : null}
        </section>

        {/* History — previous stages (completed/rejected/skipped) */}
        {currentIndex > 0 ? (
          <section className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-text-soft-400">
              Riwayat
            </p>
            <ul className="space-y-2">
              {stages.slice(0, currentIndex).map((s) => (
                <HistoryRow key={s.id} stage={s} />
              ))}
            </ul>
          </section>
        ) : null}

        {/* Future stages — locked preview */}
        {currentIndex < stages.length - 1 ? (
          <section className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-text-soft-400">
              Tahap berikutnya
            </p>
            <ul className="space-y-2">
              {stages.slice(currentIndex + 1).map((s) => (
                <FutureRow key={s.id} stage={s} />
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>

      {canAct ? (
        <CardFooter className={cn("flex flex-wrap justify-end gap-2")}>
          <Button
            type="button"
            tone="neutral"
            style="stroke"
            leftIcon={<Skip />}
            onClick={() => handle("skip")}
            loading={submittingAction === "skip"}
            disabled={submitting && submittingAction !== "skip"}
          >
            Lewati
          </Button>
          <Button
            type="button"
            tone="destructive"
            style="stroke"
            leftIcon={
              rejectBehavior === "rollback" ? <Rollback /> : <Reject />
            }
            onClick={() => handle("reject")}
            loading={submittingAction === "reject"}
            disabled={submitting && submittingAction !== "reject"}
          >
            {rejectBehavior === "rollback" ? "Tolak & kembalikan" : "Tolak"}
          </Button>
          <Button
            type="button"
            tone="primary"
            style="filled"
            leftIcon={<Approve />}
            onClick={() => handle("approve")}
            loading={submittingAction === "approve"}
            disabled={submitting && submittingAction !== "approve"}
          >
            Setujui
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
