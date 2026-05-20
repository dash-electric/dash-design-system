"use client"

import * as React from "react"
import {
  RepossessionActionSheet,
  REPO_LEGAL_ACTIONS,
  type RepoStatus,
  type RepoAction,
  type RepoActorRole,
  type RepoActionPayload,
} from "@/registry/dash/blocks/repossession-action-sheet"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

// ---------------------------------------------------------------------------
// Demo wrapper — pick a status + role from a small toolbar, then open the
// sheet to interact with the role-aware action list.
// ---------------------------------------------------------------------------

const STATUSES: RepoStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "FOUND",
  "POTENTIAL_LOSS",
  "PENDING_APPROVAL",
  "WRITTEN_OFF",
  "CLOSED",
]

const ROLES: RepoActorRole[] = ["field-ops", "fleet-manager", "finance", "viewer"]

// Per-role permission matrix. In production this lives server-side; surfaced
// here to make the demo legible.
const ROLE_PERMISSIONS: Record<RepoActorRole, RepoAction[]> = {
  "field-ops": ["mark_found", "mark_potential_loss"],
  "fleet-manager": [
    "mark_found",
    "mark_potential_loss",
    "request_approval",
    "close",
    "reopen",
  ],
  finance: ["approve_writeoff", "reject_writeoff", "close", "reopen"],
  viewer: [],
}

function InteractiveDemo() {
  const [status, setStatus] = React.useState<RepoStatus>("IN_PROGRESS")
  const [role, setRole] = React.useState<RepoActorRole>("fleet-manager")
  const [open, setOpen] = React.useState(false)
  const [log, setLog] = React.useState<
    { action: RepoAction; at: string; note: string; photos: number; gps: boolean }[]
  >([])

  // Intersection of role permissions and state-machine-legal actions.
  const availableActions = React.useMemo(() => {
    const roleSet = new Set(ROLE_PERMISSIONS[role])
    return REPO_LEGAL_ACTIONS[status].filter((a) => roleSet.has(a))
  }, [status, role])

  const onAction = async (action: RepoAction, payload: RepoActionPayload) => {
    // Simulated BE latency.
    await new Promise((r) => setTimeout(r, 450))
    setLog((prev) => [
      {
        action,
        at: new Date().toLocaleTimeString(),
        note: payload.note,
        photos: payload.photos?.length ?? 0,
        gps: !!payload.location,
      },
      ...prev,
    ])
    // Optimistic-style status advance for demo purposes only. Production
    // callers MUST re-fetch from the BE.
    if (action === "mark_found") setStatus("FOUND")
    else if (action === "mark_potential_loss") setStatus("POTENTIAL_LOSS")
    else if (action === "request_approval") setStatus("PENDING_APPROVAL")
    else if (action === "approve_writeoff") setStatus("WRITTEN_OFF")
    else if (action === "reject_writeoff") setStatus("IN_PROGRESS")
    else if (action === "close") setStatus("CLOSED")
    else if (action === "reopen") setStatus("IN_PROGRESS")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-text-sub-600 w-16 shrink-0 self-center">Status</span>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={
                s === status
                  ? "rounded-md border border-primary bg-(--primary-alpha-10) text-primary px-2 py-1 text-xs"
                  : "rounded-md border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 px-2 py-1 text-xs hover:bg-bg-weak-50"
              }
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-text-sub-600 w-16 shrink-0 self-center">Role</span>
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={
                r === role
                  ? "rounded-md border border-primary bg-(--primary-alpha-10) text-primary px-2 py-1 text-xs"
                  : "rounded-md border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 px-2 py-1 text-xs hover:bg-bg-weak-50"
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-sub-600">Repo #REPO-1108 · KB-1234-XYZ</span>
          <Badge status="information" appearance="lighter" type="dot">
            {status}
          </Badge>
        </div>
        <Button size="md" style="filled" tone="primary" onClick={() => setOpen(true)}>
          Buka Action Sheet
        </Button>
      </div>

      <RepossessionActionSheet
        repoId="REPO-1108"
        vehicleId="KB-1234-XYZ"
        currentStatus={status}
        availableActions={availableActions}
        currentUserRole={role}
        open={open}
        onClose={() => setOpen(false)}
        onAction={onAction}
      />

      {log.length > 0 ? (
        <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs">
          <div className="text-text-strong-950 font-medium mb-2">Audit Log (demo only)</div>
          <ul className="flex flex-col gap-1.5">
            {log.map((row, i) => (
              <li key={i} className="text-text-sub-600">
                <span className="font-mono">{row.at}</span> · {row.action} · note:{" "}
                <span className="italic">&ldquo;{row.note.slice(0, 40)}&hellip;&rdquo;</span> ·
                photos: {row.photos} · gps: {row.gps ? "yes" : "no"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default function RepossessionActionSheetDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Workflow"
        kind="composite"
        status="beta"
        title="Repossession Action Sheet"
        description="Mobile-first bottom drawer that drives the 7-state repossession workflow from a single role-aware surface. Pairs with MultiStageApproval (PENDING_APPROVAL → WRITTEN_OFF) and AuditHistoryTable (history tab)."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add repossession-action-sheet`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="REPO-1108 — adjust status + role to see the action list shift"
          description="Toggle status to walk the state machine, toggle role to see how the same surface filters actions per actor. Field-ops sees only mark_found / mark_potential_loss; finance sees approve_writeoff / reject_writeoff at PENDING_APPROVAL."
          preview={
            <div className="w-full max-w-md">
              <InteractiveDemo />
            </div>
          }
          code={`<RepossessionActionSheet
  repoId="REPO-1108"
  vehicleId="KB-1234-XYZ"
  currentStatus={status}
  availableActions={availableActions}
  currentUserRole={session.user.role}
  open={open}
  onClose={() => setOpen(false)}
  onAction={async (action, payload) => {
    await api.post(\`/repossession/\${id}/transitions\`, {
      action,
      note: payload.note,
      photos: payload.photos,
      location: payload.location,
    })
    await mutate(\`/repossession/\${id}\`)
  }}
/>`}
        />
      </DocsSection>

      <DocsSection title="State machine">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          The component does not advance status locally. <code>currentStatus</code>{" "}
          is the BE truth, <code>availableActions</code> is the BE-computed
          permission list, and <code>onAction</code> persists the next
          transition. The component re-renders after the caller re-fetches.
        </p>
        <DocsCode
          language="text"
          code={`OPEN ──► IN_PROGRESS ──┬─► FOUND ────────────────────────────► CLOSED
                       ├─► POTENTIAL_LOSS ─► PENDING_APPROVAL ─┬─► WRITTEN_OFF ─► CLOSED
                       │                                       └─► (rejected → IN_PROGRESS)
                       └─► reopen (any non-terminal node ↻ IN_PROGRESS)`}
        />
        <p className="text-sm text-text-sub-600 max-w-3xl">
          The component exports <code>REPO_LEGAL_ACTIONS</code> — a{" "}
          <code>Record&lt;RepoStatus, RepoAction[]&gt;</code> map you can use
          server-side to compute the canonical permission intersection. The
          component also re-applies the same map defensively before rendering,
          so an over-eager BE list cannot show illegal actions.
        </p>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>
            Bottom <code>Drawer</code> (<code>side=&quot;bottom&quot;</code>,{" "}
            <code>size=&quot;xl&quot;</code>) — designed to coexist with the
            underlying map / vehicle photo.
          </li>
          <li>
            Header — <code>repoId</code> + <code>vehicleId</code> + status{" "}
            <code>Badge</code> reflecting <code>currentStatus</code>.
          </li>
          <li>
            Action list — stacked tap targets (44px+), each labelled with
            tone-coloured icon + reversible/permanent caption.
          </li>
          <li>
            Action form — required <code>Textarea</code> note (≥10 char),
            optional <code>FileUploadDropzone</code> (1–3 photos), optional GPS
            capture trigger that respects browser-permission flow.
          </li>
          <li>
            <code>AlertDialog</code> confirm — only on <code>approve_writeoff</code>{" "}
            and <code>close</code>. Cancel-by-default; destructive tone for
            write-off.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Role × action matrix (reference only)">
        <DocsCode
          language="text"
          code={`field-ops      → mark_found, mark_potential_loss
fleet-manager  → mark_found, mark_potential_loss, request_approval, close, reopen
finance        → approve_writeoff, reject_writeoff, close, reopen
viewer         → ∅ (read-only — empty-state copy rendered)`}
        />
        <p className="text-sm text-text-sub-600 max-w-3xl">
          This is the demo permission map. Production callers MUST compute
          this server-side per request (role + entity-state + tribe-policy)
          and pass the result as <code>availableActions</code>.
        </p>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Use</strong> on the Tribe-Express repossession detail
            screen (mobile field-ops app + fleet-manager backoffice).
          </li>
          <li>
            <strong>Use</strong> with{" "}
            <code>MultiStageApproval</code> for the PENDING_APPROVAL leg of
            the workflow — this sheet hands off to that block once the case
            enters approval routing.
          </li>
          <li>
            <strong>Don&apos;t</strong> use for mitra-facing notifications —
            voice is staff-formal &quot;Anda&quot;, not the mitra-driver-app
            tone. Hand off to the driver-app notification block.
          </li>
          <li>
            <strong>Don&apos;t</strong> use as the only audit surface — pair
            with <code>AuditHistoryTable</code> on a separate tab.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "repoId",
              type: "string",
              description: "Repossession case identifier (display + audit row foreign key).",
            },
            {
              name: "vehicleId",
              type: "string",
              description: "Plate or asset tag for the repo'd vehicle (display only).",
            },
            {
              name: "currentStatus",
              type: "RepoStatus",
              description:
                "BE-authoritative status. Drives the badge + filters legal actions via the state machine guard.",
            },
            {
              name: "availableActions",
              type: "RepoAction[]",
              description:
                "Role-scoped action list from the BE. Intersected with the state-machine legal set before rendering.",
            },
            {
              name: "currentUserRole",
              type: '"field-ops" | "fleet-manager" | "finance" | "viewer"',
              description:
                "Acting role. Drives empty-state copy when no actions are available; voice tier is consistent across roles.",
            },
            {
              name: "onAction",
              type: "(action, { note, photos?, location? }) => Promise<void>",
              description:
                "Persists the transition + audit row on the BE. The component awaits this promise; throw to surface an error toast.",
            },
            {
              name: "onClose",
              type: "() => void",
              description:
                "Called when the user dismisses the drawer (close button, overlay click, ESC, or after a successful action).",
            },
            {
              name: "open",
              type: "boolean",
              description: "Controlled visibility flag.",
            },
            {
              name: "title",
              type: "string",
              description:
                'Optional header override. Defaults to "Repo #<repoId> · Kendaraan <vehicleId>".',
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Audit trail contract">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Per Dash AI Rules § Audit Trail, every transition for a
          legal/financial entity MUST persist a row in{" "}
          <code>t_repossession_audit_log</code>:
        </p>
        <ul className="text-sm text-text-sub-600 space-y-1 list-disc pl-5 max-w-3xl">
          <li>
            <code>action</code> (<code>RepoAction</code>) + previous +{" "}
            <code>next</code> status
          </li>
          <li>
            <code>note</code> (required, ≥10 char — enforced client-side, re-check on BE)
          </li>
          <li>
            <code>photoUrls</code> (uploaded to object storage by the BE, signed URLs returned)
          </li>
          <li>
            <code>geoLat</code> + <code>geoLng</code> (optional; null when operator skipped GPS capture)
          </li>
          <li>
            <code>actorId</code> + <code>actorRole</code> + <code>actedAt</code> (server-side from session)
          </li>
          <li>
            <code>ipHash</code> (sha256 of remote IP, forensic-only)
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Authorization">
        <DocsDoDont
          do={{
            preview: (
              <span className="text-xs text-text-sub-600">
                BE computes <code>availableActions</code> per request from
                role + entity state + tribe policy. Component re-applies the
                state-machine guard defensively.
              </span>
            ),
            caption:
              "Always compute availableActions server-side. The client guard is a UX safeguard, never security.",
          }}
          dont={{
            preview: (
              <span className="text-xs text-text-sub-600">
                Hard-code action lists in the page component or trust a stale
                permission cache. A curl request would bypass the disabled
                button entirely.
              </span>
            ),
            caption:
              "Don't ship without a server-side ACL — every transition POST re-validates role + state + tribe policy.",
          }}
        />
      </DocsSection>

      <DocsSection title="Voice">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Copy is staff-neutral Indonesian formal (&quot;Anda&quot;-tier). The
          sheet is NOT designed for mitra-facing surfaces — repossession
          notifications to the mitra go through the driver-app notification
          block which softens tone. Don&apos;t reuse this sheet on the mitra
          side without a copy rewrite.
        </p>
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import {
  RepossessionActionSheet,
  type RepoStatus,
  type RepoAction,
} from "@/registry/dash/blocks/repossession-action-sheet"

function RepoDetailMobile({ repo }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Aksi Repossession</Button>
      <RepossessionActionSheet
        repoId={repo.id}
        vehicleId={repo.vehicleId}
        currentStatus={repo.status}
        availableActions={repo.availableActions} // from BE per role
        currentUserRole={session.user.role}
        open={open}
        onClose={() => setOpen(false)}
        onAction={async (action, payload) => {
          const fd = new FormData()
          fd.set("action", action)
          fd.set("note", payload.note)
          payload.photos?.forEach((p, i) => fd.set(\`photo_\${i}\`, p))
          if (payload.location) {
            fd.set("lat", String(payload.location.lat))
            fd.set("lng", String(payload.location.lng))
          }
          await api.post(\`/repossession/\${repo.id}/transitions\`, fd)
          await mutate(\`/repossession/\${repo.id}\`)
        }}
      />
    </>
  )
}`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
