"use client"

import * as React from "react"
import {
  RiCheckLine as Approve,
  RiCloseLine as Reject,
  RiArrowGoBackLine as Rollback,
} from "@remixicon/react"
import { Card, CardContent, CardHeader, CardFooter } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Label } from "@/registry/dash/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import {
  StepIndicator,
  Step,
  type StepStatus,
} from "@/registry/dash/ui/step-indicator"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * @template multi-stage
 * @placeholder STAGES           — ordered list of approval stages. The template
 *                                  drives status / approver / comment per stage.
 * @placeholder APPROVER_FETCHER — async fn returning the user(s) eligible to
 *                                  approve a given stage. Caller injects.
 * @placeholder ON_STAGE_CHANGE  — async POST when stage advances / rolls back.
 *                                  Receives next stage + decision + comment.
 *
 * WHY this template:
 *  - Multi-approver workflows are everywhere in Dash (maintenance approval,
 *    repossession escalation, mitra reinstate, payment adjustment >Rp 1M).
 *    Teams keep modelling them as ad-hoc booleans (`isApprovedByLevel1`,
 *    `isApprovedByLevel2`...) which leaks into the schema and is impossible
 *    to reorder without a migration.
 *  - This scaffold treats stages as ORDERED DATA + a state machine
 *    (pending / approved / rejected). Each stage carries its own comment
 *    thread and assignee — same shape regardless of how many levels.
 *  - StepIndicator (Figma-canonical) gives free a11y + visual progress.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StageDecision = "pending" | "approved" | "rejected"

export type StageApprover = {
  id: string
  name: string
  avatarUrl?: string
  role?: string
}

export type StageComment = {
  id: string
  authorName: string
  authorAvatarUrl?: string
  text: string
  createdAt: string // ISO timestamp
}

export type WorkflowStage = {
  /** Stable key — used to look up next/prev stage. */
  id: string
  /** Human-readable label in the step indicator. */
  label: string
  /** Optional secondary line under the label. */
  description?: string
  decision: StageDecision
  /** Approver(s) eligible to act on this stage. */
  approvers: StageApprover[]
  /** Comment thread for this stage — append-only. */
  comments: StageComment[]
  /** Stage owner (currently selected approver), null = unassigned. */
  assignedTo?: StageApprover | null
}

export type StageChangePayload = {
  fromStage: WorkflowStage
  toStage: WorkflowStage
  decision: Exclude<StageDecision, "pending">
  comment: string
}

export type MultiStageTemplateProps = {
  /** Ordered list of stages. First = entry point. */
  stages: WorkflowStage[]
  /** Index of the stage currently focused in the UI. */
  currentStageIndex: number
  /** Editor (current user) ID — used as authorId on new comments. */
  editorId: string
  editorName: string
  editorAvatarUrl?: string
  /** Fetch approvers eligible for a given stage. Caller injects. */
  // @placeholder APPROVER_FETCHER (signature anchored; AI fills the body)
  approverFetcher?: (stage: WorkflowStage) => Promise<StageApprover[]>
  /** Called when the user approves / rejects / rolls back. */
  // @placeholder ON_STAGE_CHANGE (signature anchored; AI fills the body)
  onStageChange: (payload: StageChangePayload) => Promise<void>
  /** Optional title / heading. */
  title?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MultiStageTemplate({
  stages,
  currentStageIndex,
  editorId,
  editorName,
  editorAvatarUrl,
  onStageChange,
  title = "Persetujuan",
}: MultiStageTemplateProps) {
  const [comment, setComment] = React.useState("")
  const [commentError, setCommentError] = React.useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = React.useState(false)

  const currentStage = stages[currentStageIndex]
  if (!currentStage) {
    // Defensive — empty stages array would render nothing useful. Avoid
    // a runtime crash by surfacing a clear empty state.
    return (
      <Card>
        <CardContent className="py-6 text-sm text-text-sub-600">
          Workflow belum dikonfigurasi.
        </CardContent>
      </Card>
    )
  }

  // Derive step indicator status from decision + position. WHY derive (not
  // store): a single decision change should propagate to the visual rail
  // without a separate sync field.
  const stepStatusFor = (index: number): StepStatus => {
    const stage = stages[index]
    if (!stage) return "upcoming"
    if (stage.decision === "approved") return "completed"
    if (stage.decision === "rejected") {
      // Rejection halts the rail at that stage — downstream stages reset
      // to upcoming. The current stage is marked as "current" so the
      // reviewer sees where the block happened.
      return index === currentStageIndex ? "current" : "upcoming"
    }
    if (index === currentStageIndex) return "current"
    if (index < currentStageIndex) return "completed"
    return "upcoming"
  }

  const transition = async (decision: Exclude<StageDecision, "pending">) => {
    setCommentError(undefined)

    // Comment is REQUIRED on rejection. Approve can be silent (matches
    // the existing maintenance approval flow), but reject MUST justify.
    if (decision === "rejected" && comment.trim().length < 3) {
      setCommentError("Alasan penolakan wajib diisi (minimum 3 karakter).")
      return
    }

    // Find the next stage on approve, the previous stage on reject-rollback.
    // WHY rollback (not just halt): rejected stages need to bounce the
    // request back to the prior approver to fix and re-submit, not dead-end.
    const targetIndex =
      decision === "approved"
        ? Math.min(currentStageIndex + 1, stages.length - 1)
        : Math.max(currentStageIndex - 1, 0)
    const targetStage = stages[targetIndex]
    if (!targetStage) {
      toast.error("Tidak ada tahap berikutnya.")
      return
    }

    setSubmitting(true)
    try {
      await onStageChange({
        fromStage: currentStage,
        toStage: targetStage,
        decision,
        comment: comment.trim(),
      })
      setComment("")
      toast.success(
        decision === "approved"
          ? "Tahap disetujui."
          : "Tahap ditolak dan dikembalikan ke approver sebelumnya.",
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan."
      toast.error(`Gagal memperbarui tahap: ${message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-text-strong-950">{title}</h2>

        {/*
          @placeholder STAGES
          -------------------------------------------------------------------
          AI: stages are DATA, not markup. The template renders them via the
          StepIndicator below. If the workflow needs custom per-stage chrome
          (e.g. icon per stage), extend WorkflowStage with `icon?: ReactNode`
          and forward to the Step component.
          -------------------------------------------------------------------
        */}
        <StepIndicator orientation="horizontal" className="overflow-x-auto">
          {stages.map((stage, index) => (
            <Step
              key={stage.id}
              status={stepStatusFor(index)}
              index={index + 1}
              label={stage.label}
              description={stage.description}
              withConnector={index < stages.length - 1}
              orientation="horizontal"
            />
          ))}
        </StepIndicator>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current-stage detail */}
        <div className="space-y-3 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-strong-950">
                {currentStage.label}
              </p>
              {currentStage.description ? (
                <p className="text-xs text-text-sub-600">
                  {currentStage.description}
                </p>
              ) : null}
            </div>
            <span className="text-xs uppercase tracking-wider text-text-soft-400">
              {currentStage.decision === "rejected" ? "Ditolak" : "Menunggu"}
            </span>
          </div>

          {currentStage.assignedTo ? (
            <div className="flex items-center gap-2">
              <Avatar size="md">
                {currentStage.assignedTo.avatarUrl ? (
                  <AvatarImage
                    src={currentStage.assignedTo.avatarUrl}
                    alt={currentStage.assignedTo.name}
                  />
                ) : null}
                <AvatarFallback>
                  {currentStage.assignedTo.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-text-strong-950">
                  {currentStage.assignedTo.name}
                </p>
                {currentStage.assignedTo.role ? (
                  <p className="text-xs text-text-sub-600">
                    {currentStage.assignedTo.role}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-soft-400">
              Belum ada approver yang ditugaskan.
            </p>
          )}
        </div>

        {/* Comment thread */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-strong-950">
            Diskusi tahap ini
          </p>
          {currentStage.comments.length === 0 ? (
            <p className="text-xs text-text-soft-400">Belum ada komentar.</p>
          ) : (
            <ul className="space-y-2">
              {currentStage.comments.map((c) => (
                <li
                  key={c.id}
                  className="flex gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3"
                >
                  <Avatar size="md">
                    {c.authorAvatarUrl ? (
                      <AvatarImage src={c.authorAvatarUrl} alt={c.authorName} />
                    ) : null}
                    <AvatarFallback>
                      {c.authorName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-strong-950">
                      {c.authorName}
                    </p>
                    <p className="text-sm text-text-sub-600">{c.text}</p>
                    <p className="mt-1 text-xs text-text-soft-400">{c.createdAt}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-1">
            <Label htmlFor="stage-comment">Tambah komentar</Label>
            <Textarea
              id="stage-comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value)
                if (commentError) setCommentError(undefined)
              }}
              placeholder={`Komentar dari ${editorName}...`}
              rows={3}
              aria-invalid={Boolean(commentError)}
              aria-describedby={commentError ? "stage-comment-error" : undefined}
            />
            {commentError ? (
              <p id="stage-comment-error" className="text-xs text-error-base">
                {commentError}
              </p>
            ) : (
              <p className="text-xs text-text-soft-400">
                Wajib diisi jika menolak. Opsional jika menyetujui.
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button
          type="button"
          tone="neutral"
          style="stroke"
          leftIcon={<Rollback />}
          onClick={() => transition("rejected")}
          loading={submitting}
          disabled={currentStageIndex === 0}
        >
          Tolak & kembalikan
        </Button>
        <Button
          type="button"
          tone="destructive"
          style="stroke"
          leftIcon={<Reject />}
          onClick={() => transition("rejected")}
          loading={submitting}
        >
          Tolak
        </Button>
        <Button
          type="button"
          tone="primary"
          style="filled"
          leftIcon={<Approve />}
          onClick={() => transition("approved")}
          loading={submitting}
        >
          Setujui
        </Button>
      </CardFooter>

      {/* editorId / editorAvatarUrl are referenced here to keep them in
          scope for AI extensions that wire optimistic comment append.
          They're typed as required so callers can't omit them by accident. */}
      <span hidden data-editor-id={editorId} data-editor-avatar={editorAvatarUrl} />
    </Card>
  )
}
