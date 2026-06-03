"use client"

import * as React from "react"
import {
  MultiStageApproval,
  type ApprovalStage,
  type ApprovalAction,
} from "@/registry/dash/blocks/multi-stage-approval"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

// Demo data — Tribe-Express maintenance approval ladder.
// Mechanic submits → Fleet Manager → Finance Lead → Director. We park the
// demo on stage 2 (Fleet Manager review) so the preview exercises the
// "current stage" panel with full history + future stages.
const DEMO_STAGES_INITIAL: ApprovalStage[] = [
  {
    id: "stg-mekanik",
    label: "Pengajuan Mekanik",
    approverRole: "Mekanik",
    assignedTo: { id: "u-mek-01", name: "Wahyu Pratama" },
    status: "approved",
    comment: "Sparepart rem belakang aus, butuh penggantian segera.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "stg-fleet",
    label: "Verifikasi Fleet",
    approverRole: "Fleet Manager",
    assignedTo: { id: "u-fleet-22", name: "Siti Nurhaliza" },
    status: "in_progress",
  },
  {
    id: "stg-finance",
    label: "Persetujuan Finance",
    approverRole: "Finance Lead",
    assignedTo: { id: "u-fin-09", name: "Bayu Saputra" },
    status: "pending",
  },
  {
    id: "stg-director",
    label: "Final Director",
    approverRole: "Operations Director",
    assignedTo: { id: "u-dir-01", name: "Reza Tamara" },
    status: "pending",
  },
]

// Demo data variant for the dead-end behavior example.
const DEMO_STAGES_DEAD_END: ApprovalStage[] = [
  {
    id: "stg-fo",
    label: "Field Ops",
    approverRole: "Field Officer",
    assignedTo: { id: "u-fo-12", name: "Andi Wijaya" },
    status: "approved",
    comment: "Mitra terverifikasi tidak aktif 14 hari, sudah dihubungi 3×.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "stg-legal",
    label: "Review Legal",
    approverRole: "Legal Counsel",
    assignedTo: { id: "u-leg-04", name: "Maya Damayanti" },
    status: "in_progress",
  },
  {
    id: "stg-director-2",
    label: "Approval Direktur",
    approverRole: "Director",
    assignedTo: { id: "u-dir-01", name: "Reza Tamara" },
    status: "pending",
  },
]

function InteractiveDemo({
  initial,
  rejectBehavior,
  currentUserId,
}: {
  initial: ApprovalStage[]
  rejectBehavior: "rollback" | "dead-end"
  currentUserId: string
}) {
  const [stages, setStages] = React.useState<ApprovalStage[]>(initial)
  const currentStageId =
    stages.find((s) => s.status === "in_progress")?.id ?? stages[0]!.id

  // Local mutation only — production callers should POST and re-fetch. This
  // mirrors the BE round-trip pattern but stays in-memory for the docs demo.
  const onTransition = async (
    stageId: string,
    action: ApprovalAction,
    comment?: string,
  ) => {
    await new Promise((r) => setTimeout(r, 450)) // simulate latency
    setStages((prev) => {
      const idx = prev.findIndex((s) => s.id === stageId)
      if (idx === -1) return prev
      const next = prev.map((s) => ({ ...s }))
      const ts = new Date().toISOString()

      if (action === "approve") {
        next[idx]!.status = "approved"
        next[idx]!.comment = comment
        next[idx]!.timestamp = ts
        if (idx + 1 < next.length) next[idx + 1]!.status = "in_progress"
      } else if (action === "skip") {
        next[idx]!.status = "skipped"
        next[idx]!.comment = comment
        next[idx]!.timestamp = ts
        if (idx + 1 < next.length) next[idx + 1]!.status = "in_progress"
      } else {
        next[idx]!.status = "rejected"
        next[idx]!.comment = comment
        next[idx]!.timestamp = ts
        if (rejectBehavior === "rollback" && idx - 1 >= 0) {
          next[idx - 1]!.status = "in_progress"
          // Mark the rejected stage as pending so it can be re-attempted
          // once the previous approver re-advances.
          next[idx]!.status = "pending"
          // Note: the rejection comment is preserved on the stage so the
          // history row still surfaces the bounce-back reason.
        }
      }
      return next
    })
  }

  return (
    <MultiStageApproval
      stages={stages}
      currentStageId={currentStageId}
      onTransition={onTransition}
      rejectBehavior={rejectBehavior}
      currentUserId={currentUserId}
    />
  )
}

export default function MultiStageApprovalDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Workflow"
        kind="composite"
        status="beta"
        title="Multi-Stage Approval"
        description="N-stage approval workflow with sequential gating, role-based action lock, and rollback-on-reject. Use for Maintenance, Repossession, Mitra-reinstate, or any multi-approver flow that previously leaked into ad-hoc boolean ladders."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add multi-stage-approval`} />
      </DocsSection>

      <DocsSection title="Preview (rollback, viewer = assigned approver)">
        <DocsExample
          title="Maintenance Request MNT-2241 — Fleet Manager review"
          description="You are Siti Nurhaliza (Fleet Manager). Stage 1 already approved by the Mekanik. Approve to advance to Finance, reject to bounce back to the Mekanik with a comment, or skip if the verification is moot."
          preview={
            <div className="w-full max-w-2xl">
              <InteractiveDemo
                initial={DEMO_STAGES_INITIAL}
                rejectBehavior="rollback"
                currentUserId="u-fleet-22"
              />
            </div>
          }
          code={`<MultiStageApproval
  stages={stages}
  currentStageId="stg-fleet"
  currentUserId={session.user.id}
  rejectBehavior="rollback"
  onTransition={async (stageId, action, comment) => {
    await api.post(\`/maintenance/\${id}/transitions\`, {
      stageId,
      action,
      comment,
    })
    await refetch()
  }}
/>`}
        />
      </DocsSection>

      <DocsSection title="Preview (read-only, viewer is NOT the approver)">
        <DocsExample
          title="Same workflow — viewer is the Mekanik"
          description="A non-approver sees the same workflow rail, history, and future stages, but Approve/Reject/Skip buttons disappear. The current-stage comment field is replaced with a read-only context line."
          preview={
            <div className="w-full max-w-2xl">
              <InteractiveDemo
                initial={DEMO_STAGES_INITIAL}
                rejectBehavior="rollback"
                currentUserId="u-mek-01"
              />
            </div>
          }
          code={`<MultiStageApproval
  stages={stages}
  currentStageId={currentStageId}
  currentUserId="u-mek-01" // not the assigned approver for current stage
  onTransition={onTransition}
/>`}
        />
      </DocsSection>

      <DocsSection title="Preview (dead-end rejection — Repossession)">
        <DocsExample
          title="Repossession REPO-1108 — Legal review"
          description="Rejection here closes the workflow as 'closed-denied' rather than bouncing back. Choose dead-end for irreversible policy decisions like Repossession or Mitra termination — rollback is wrong because the trigger context will not repeat."
          preview={
            <div className="w-full max-w-2xl">
              <InteractiveDemo
                initial={DEMO_STAGES_DEAD_END}
                rejectBehavior="dead-end"
                currentUserId="u-leg-04"
              />
            </div>
          }
          code={`<MultiStageApproval
  stages={stages}
  currentStageId="stg-legal"
  currentUserId={session.user.id}
  rejectBehavior="dead-end"
  onTransition={persistTransition}
/>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            Header — title + status <code>Badge</code> reflecting the current
            stage state (pending / in_progress / approved / rejected / skipped).
          </li>
          <li>
            Step rail — <code>StepIndicator</code> with one <code>Step</code>{" "}
            per stage. Approved + skipped = completed; rejected + in_progress =
            current; pending = upcoming.
          </li>
          <li>
            Current-stage card — label, role, assigned <code>Avatar</code> + name,
            comment <code>Textarea</code> (only when viewer can act), action
            buttons in the footer.
          </li>
          <li>
            History — collapsed list of previous stages with status{" "}
            <code>Badge</code> + truncated comment + relative timestamp.
          </li>
          <li>
            Future stages — locked list (dashed border + lock icon), surfaces
            who the next approvers will be without exposing actions.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="State machine">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Each stage carries its own status. The component does not mutate
          stages locally — every transition flows through{" "}
          <code>onTransition</code>, the caller persists, and the component
          re-renders against the updated <code>stages</code> prop.
        </p>
        <DocsCode
          language="text"
          code={`pending ─┐
         ├─► in_progress ─┬─► approved (terminal-or-advance)
         │                ├─► rejected ─► (rollback → previous = in_progress)
         │                │              (dead-end → workflow closed-denied)
         │                └─► skipped  (advance to next stage)
         └─► (skipped / rejected via cascade)`}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            <strong>Use</strong> for any workflow with 2+ ordered approvers
            (Maintenance, Repossession, Mitra-reinstate, payment-adjustment
            &gt;Rp 1M, KYC override, signature dispute).
          </li>
          <li>
            <strong>Use</strong> <code>rejectBehavior=&quot;rollback&quot;</code>{" "}
            when the prior approver can fix and resubmit (Maintenance, payment
            adjustment).
          </li>
          <li>
            <strong>Use</strong> <code>rejectBehavior=&quot;dead-end&quot;</code>{" "}
            when rejection is a policy decision (Repossession denial, Mitra
            termination, fraud KYC).
          </li>
          <li>
            <strong>Don&apos;t</strong> use for single-approver toggles — reach
            for an <code>InlineEdit</code> + audit log instead.
          </li>
          <li>
            <strong>Don&apos;t</strong> hard-code stage status as separate boolean
            columns on the entity row — store stages as ordered data in{" "}
            <code>t_&lt;entity&gt;_approval_stage</code>.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "stages",
              type: "ApprovalStage[]",
              description:
                "Ordered list of approval stages. Each stage carries id, label, approverRole, optional assignedTo, status, comment, timestamp.",
            },
            {
              name: "currentStageId",
              type: "string",
              description:
                "id of the stage currently in flight. Must exist in `stages`.",
            },
            {
              name: "onTransition",
              type: "(stageId, action, comment?) => Promise<void>",
              description:
                "Called when the approver acts. Caller persists the audit row + re-fetches stages. Component does NOT mutate locally.",
            },
            {
              name: "rejectBehavior",
              type: '"rollback" | "dead-end"',
              description:
                "rollback (default) bounces to the previous stage. dead-end terminates the workflow as closed-denied.",
            },
            {
              name: "currentUserId",
              type: "string",
              description:
                "Acting user id. Only matches against `stages[current].assignedTo.id` unlock the action buttons.",
            },
            {
              name: "title",
              type: "string",
              description: 'Optional header copy. Defaults to "Persetujuan".',
            },
            {
              name: "className",
              type: "string",
              description: "Outer Card wrapper className.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Audit trail contract">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          The component does not write the audit row — the caller does, inside{" "}
          <code>onTransition</code>. Per Dash AI Rules § Audit Trail, every
          transition for a legal/financial entity MUST persist:
        </p>
        <ul className="text-sm text-text-sub-600 space-y-1 list-disc pl-6 max-w-3xl">
          <li>
            <code>stageId</code> + <code>action</code> (approve / reject / skip)
          </li>
          <li>
            <code>comment</code> (required for reject/skip; optional for approve)
          </li>
          <li>
            <code>editorId</code> + <code>editorRole</code> (server-side from session)
          </li>
          <li>
            <code>editedAt</code> ISO timestamp (server-side)
          </li>
          <li>
            <code>ipHash</code> (sha256, forensic-only)
          </li>
        </ul>
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Surface the history later via{" "}
          <code>AuditHistoryTable</code> on a dedicated tab. The two blocks
          are designed as a pair.
        </p>
      </DocsSection>

      <DocsSection title="Authorization">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Client-side gating (<code>currentUserId</code> vs{" "}
          <code>assignedTo.id</code>) is a UX safeguard only — the BE MUST
          re-check on every transition POST. Treat the disabled state as a
          courtesy; never as security.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <span className="text-xs text-text-sub-600">
                BE re-validates approver role + stage on every transition.
              </span>
            ),
            caption:
              "Server re-checks role + stage. Client gate is only to avoid wasted requests + misleading UI.",
          }}
          dont={{
            preview: (
              <span className="text-xs text-text-sub-600">
                Trust the client to enforce who can approve.
              </span>
            ),
            caption:
              "Don't ship without a server-side ACL — a curl request would bypass the disabled button entirely.",
          }}
        />
      </DocsSection>

      <DocsSection title="Voice">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Copy is staff-neutral Indonesian formal ("Anda"-tier). The block is
          NOT designed for mitra-facing surfaces — repossession denials, for
          instance, are communicated to the mitra through a separate driver-app
          notification that softens tone. Don&apos;t reuse this card on the
          mitra side without a copy rewrite.
        </p>
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import {
  MultiStageApproval,
  type ApprovalStage,
} from "@/registry/dash/blocks/multi-stage-approval"

const stages: ApprovalStage[] = await api.get(
  \`/maintenance/\${id}/approval-stages\`,
)
const currentStageId = stages.find(s => s.status === "in_progress")?.id

return (
  <MultiStageApproval
    stages={stages}
    currentStageId={currentStageId!}
    currentUserId={session.user.id}
    rejectBehavior="rollback"
    onTransition={async (stageId, action, comment) => {
      await api.post(\`/maintenance/\${id}/transitions\`, {
        stageId,
        action,
        comment,
      })
      // Caller is responsible for re-fetching the latest stages.
      await mutate(\`/maintenance/\${id}/approval-stages\`)
    }}
  />
)`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
