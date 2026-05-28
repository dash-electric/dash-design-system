import type { Store } from "../state/store.js"
import type { Orchestrator } from "../../pipeline/orchestrator.js"
import type { PromptRecord } from "../state/types.js"
import { renderLayout } from "./layout.js"
import { renderAuthChip } from "./components/auth-chip.js"
import { renderBranchInput } from "./components/branch-input.js"
import { renderOpenAIConnectForm } from "./components/anthropic-connect.js"
import { renderOpenAIReconnectCard } from "./components/openai-reconnect-card.js"
import { renderPromptCard, renderPromptList } from "./components/prompt-card.js"
import { renderPromptInput } from "./components/prompt-input.js"
import { renderRepoSelect } from "./components/repo-select.js"
import {
  renderChatThread,
  type ChatAction,
  type ChatMessage,
} from "./components/chat-thread.js"
import {
  renderLivePreviewPane,
  DEFAULT_PIPELINE_STEPS,
  type PreviewPaneState,
  type PipelineStep,
} from "./components/live-preview-pane.js"
import { renderCodePanel } from "./components/code-panel.js"
import { renderAnchorBar } from "./components/anchor-bar.js"
import { renderProgressStrip } from "./components/progress-strip.js"
import { renderRunHistoryList } from "./components/run-history-list.js"
import type { RepoPreviewInfo } from "../repo-preview.js"
import { resolveRepoManifest } from "../repo-preview.js"
import type { GenerationArtifact } from "../../pipeline/types.js"

/**
 * Dashboard composition.
 *
 * Two render paths are available:
 *
 *  - `renderChatDashboard` (default) — builder-style split pane: chat
 *    thread on the left, live preview on the right.
 *  - `renderClassicDashboard` — original single-column "build feature" card.
 *    Kept callable for tests and as a fallback.
 *
 * The default export (`renderDashboard`) is the chat layout.
 */

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildRepoList(authRepos: string[]): { full_name: string }[] {
  const repos =
    authRepos.length > 0
      ? authRepos
      : ["dash/portal-v2", "dash/backoffice"]
  return repos.map((full_name) => ({ full_name }))
}

// ─────────────────────────────────────────────────────────────────────────
// Phase D3 — sandbox mode badge
// ─────────────────────────────────────────────────────────────────────────

/**
 * Shape of the sandbox snapshot expected from Store. Duck-typed so D1's
 * extension can land independently — when `getSandboxState` is missing or
 * returns null, the badge silently hides.
 */
interface SandboxBadgeSnapshot {
  state:
    | "clean"
    | "cloned"
    | "shim_applied"
    | "idle"
    | "generating"
    | "preview_ready"
    | "publishing"
    | "sweep"
    | "stale"
    | "failed"
    | "cloning"
    | "clone_running"
  baseCommit?: string | null
  shimVersion?: string | null
  shimCommitSha?: string | null
  lastSync?: string | null
  /** F3 — dev-server diagnostics surfaced via WS lifecycle events. The
   *  Store may or may not have learned about these yet; the renderer is
   *  defensive against both fields being absent.  */
  devServerPort?: number | null
  devServerStatus?: "starting" | "ready" | "failed" | null
  devServerError?: string | null
  /** F3 — last sandbox lifecycle action (raw broadcast tag). When set to
   *  `dev_server_starting` the badge renders a primary-pulse loading
   *  variant; `dev_server_failed` renders an error tone with a retry hint. */
  lastAction?: string | null
}

interface SandboxStoreLike {
  getSandboxState?: (repo: string) => SandboxBadgeSnapshot | null | undefined
}

const SANDBOX_TONE: Record<SandboxBadgeSnapshot["state"], "good" | "primary" | "mute" | "warn" | "error"> = {
  clean: "mute",
  cloned: "warn",
  shim_applied: "warn",
  cloning: "warn",
  idle: "good",
  clone_running: "good",
  preview_ready: "good",
  generating: "primary",
  publishing: "primary",
  sweep: "mute",
  stale: "mute",
  failed: "error",
}

function formatAgo(iso: string | null | undefined, nowMs: number = Date.now()): string {
  if (!iso) return "never"
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return "never"
  const diff = Math.max(0, nowMs - t)
  const sec = Math.round(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  return `${day}d ago`
}

export function renderSandboxBadge(
  store: SandboxStoreLike,
  repo: string | null,
): string {
  if (!repo) return ""
  const getter = store.getSandboxState
  if (typeof getter !== "function") return ""
  let snap: SandboxBadgeSnapshot | null | undefined
  try {
    snap = getter.call(store, repo)
  } catch {
    return ""
  }
  if (!snap) return ""

  // F3 — derive loading + retry variants. Priority (highest wins):
  //   1. state === "clone_running"       → success/green, "Clone live · :<port>"
  //   2. lastAction === "dev_server_starting" (state still idle) → primary pulse
  //   3. lastAction === "dev_server_failed"   (state still idle) → error tone + retry
  //   4. otherwise: legacy tone-by-state.
  const port = typeof snap.devServerPort === "number" ? snap.devServerPort : null
  const startingFromAction =
    snap.state === "idle" &&
    (snap.lastAction === "dev_server_starting" ||
      snap.devServerStatus === "starting")
  const failedFromAction =
    snap.state === "idle" &&
    (snap.lastAction === "dev_server_failed" ||
      snap.devServerStatus === "failed")

  let tone: "good" | "primary" | "mute" | "warn" | "error"
  let label: string
  let loading = false
  let retry = false
  const attrs: Array<[string, string]> = [
    ["data-state", snap.state],
  ]

  if (snap.state === "clone_running") {
    tone = "good"
    label = port ? `Clone live · :${port}` : "Clone live"
  } else if (startingFromAction) {
    tone = "primary"
    label = "Starting dev server…"
    loading = true
    attrs.push(["data-action", "dev_server_starting"])
  } else if (failedFromAction) {
    tone = "error"
    label = "Dev server failed (click to retry)"
    retry = true
    attrs.push(["data-action", "dev_server_failed"])
  } else {
    tone = SANDBOX_TONE[snap.state] ?? "mute"
    const stateLabel = snap.state.replace(/_/g, " ")
    label = `Clone · ${stateLabel}`
  }

  if (loading) attrs.push(["data-loading", "true"])
  if (retry) attrs.push(["data-sandbox-restart-dev", repo])
  attrs.push(["data-tone", tone])

  const baseCommit = (snap.baseCommit ?? "").slice(0, 7) || "—"
  const shimVer = snap.shimVersion ?? snap.shimCommitSha?.slice(0, 7) ?? "—"
  const sync = formatAgo(snap.lastSync)
  const meta = `main @${baseCommit} · shim v${shimVer} · sync ${sync}`

  const attrStr = attrs
    .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
    .join(" ")
  const tag = retry ? "button" : "span"
  const role = retry ? ` type="button"` : ""
  const title = retry
    ? ` title="Click to restart the dev server"`
    : ` title="Sandbox state"`

  return (
    `<${tag} class="db-sandbox-badge"${role} ${attrStr}${title}>` +
    `<span class="db-sandbox-badge-dot" aria-hidden="true"></span>` +
    `<span class="db-sandbox-badge-label">${escapeAttr(label)}</span>` +
    `<span class="db-sandbox-badge-meta">${escapeAttr(meta)}</span>` +
    `</${tag}>`
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Chat ↔ prompt-record adaptation
// ─────────────────────────────────────────────────────────────────────────

function promptToChatMessages(
  prompt: PromptRecord,
  resolveArtifact?: (id: string) => GenerationArtifact | undefined,
): ChatMessage[] {
  const out: ChatMessage[] = []
  out.push({
    role: "user",
    content: prompt.text,
    timestamp: prompt.createdAt,
    promptId: prompt.id,
  })

  let status: ChatMessage["status"] = "ok"
  let body: string
  let actions: ChatAction[] | undefined
  let rejectedPatches: ChatMessage["rejectedPatches"]

  switch (prompt.status) {
    case "queued":
      status = "running"
      body = "Queued — picking up shortly."
      break
    case "clarifying":
      status = "ok"
      body = "Clarification needed — answer the card on the right."
      break
    case "generating":
      status = "running"
      body = "Generating files…"
      break
    case "awaiting_approval": {
      status = "ok"
      const artifact = resolveArtifact?.(prompt.id)
      if (artifact?.rejectedPatches?.length) {
        rejectedPatches = artifact.rejectedPatches.map((r) => ({
          path: r.path,
          summary: humanizeRejection(r.reason),
          hint: r.details,
        }))
      }
      // Big Bug 4 (2026-05-28) — Claude Code action stream replaces the
      // wall-of-text review card. When we have an artifact, the body is
      // empty (action lines do the talking) and a final `status` action
      // closes with the next-step hint.
      if (artifact) {
        actions = artifactToActions(artifact)
        body = ""
      } else {
        body =
          "Done. Review the preview. GitHub is only needed when you want to open a PR."
      }
      break
    }
    case "pr_created":
      status = "ok"
      body = prompt.prUrl ? `PR opened — ${prompt.prUrl}` : "PR opened."
      break
    case "completed":
      status = "ok"
      body = "Completed."
      break
    case "failed":
      status = "error"
      body = prompt.error ?? "Generation failed."
      break
    case "cancelled":
      status = "ok"
      body = "Cancelled."
      break
    default:
      status = "ok"
      body = ""
  }

  out.push({
    role: "builder",
    content: body,
    status,
    timestamp: prompt.updatedAt,
    promptId: prompt.id,
    actions,
    rejectedPatches,
  })
  return out
}

/**
 * Translate a `GenerationArtifact` into a Claude Code-style action stream.
 *
 * Six possible action lines, all collapsed by default:
 *   1. ✓ Read context        (repo + route + nav surface, when available)
 *   2. ✓ Generated N files   (expandable: per-file path + size)
 *   3. ✓ Edited N files      (expandable: per-patch unified diff)
 *   4. ✓ Validation passed   (expandable: foundation score + warnings)
 *   5. 🎨 Preview ready      (or ⚠ Fallback preview)
 *   6. → Done. Review preview. Create PR when ready.  (terminal status)
 *
 * Lines 1, 3, 4 are skipped when there's nothing meaningful to show
 * (e.g. patch-less generation skips "Edited", failed validation flips
 * line 4 to warn tone, etc.). This keeps the stream tight — no zero-state
 * filler.
 */
export function artifactToActions(artifact: GenerationArtifact): ChatAction[] {
  const out: ChatAction[] = []

  // 1. Read context — only show when we actually have a context pack.
  if (artifact.contextPack) {
    const ctx = artifact.contextPack
    const route =
      ctx.targetRoute ?? ctx.defaultRoute ?? null
    const surfaceLine = `${ctx.surface}${ctx.theme ? ` (${ctx.theme})` : ""}`
    const detail = [
      `Repo: ${ctx.repoSlug}`,
      `Surface: ${surfaceLine}`,
      route ? `Route: ${route}` : null,
      ctx.targetNavLabel ? `Nav: ${ctx.targetNavLabel}` : null,
    ]
      .filter(Boolean)
      .join("\n")
    out.push({
      kind: "scan",
      summary: `Read context · ${ctx.repoSlug}${route ? ` · ${route}` : ""}`,
      detail,
    })
  }

  // 2. Generated files — every artifact has at least one ParsedFile in
  // happy-path generation, but patch-only runs can be empty.
  if (artifact.files.length > 0) {
    const totalBytes = artifact.files.reduce(
      (sum, f) => sum + f.content.length,
      0,
    )
    const sizeLabel = formatBytes(totalBytes)
    const fileList = artifact.files
      .map((f) => `${f.path} · ${formatBytes(f.content.length)}`)
      .join("\n")
    const noun = artifact.files.length === 1 ? "file" : "files"
    out.push({
      kind: "generate",
      summary: `Generated ${artifact.files.length} new ${noun} · ${sizeLabel}`,
      detail: fileList,
    })
  }

  // 3. Edited files (patches) — Sprint 2B unified diffs. Each patch ships
  // raw diff text, so we render it inside <details> with monospace.
  const patches = artifact.patches ?? []
  if (patches.length > 0) {
    const noun = patches.length === 1 ? "file" : "files"
    const loc = patches.map((p) => countDiffLoc(p.patchContent))
    const added = loc.reduce((s, l) => s + l.added, 0)
    const removed = loc.reduce((s, l) => s + l.removed, 0)
    const detail = patches
      .map((p) => `--- ${p.path}\n${p.patchContent}`)
      .join("\n\n")
    out.push({
      kind: "edit",
      summary: `Edited ${patches.length} ${noun} · +${added} / -${removed} lines`,
      detail,
    })
  }

  // 4. Validation — always show; tone shifts with pass/fail.
  const v = artifact.validation
  const validateDetail = [
    `Foundation score: ${v.score}/100`,
    `Status: ${v.passed ? "PASS" : "REVIEW"}`,
    v.errors.length > 0
      ? `Errors:\n${v.errors.map((e) => `  - ${describeValidationError(e)}`).join("\n")}`
      : null,
    v.warnings.length > 0
      ? `Warnings:\n${v.warnings.map((w) => `  - ${w}`).join("\n")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n")
  const checkCount = v.errors.length + v.warnings.length
  const passSummary = v.passed
    ? checkCount === 0
      ? `Validation passed · ${v.score}/100`
      : `Validation passed with ${v.warnings.length} warning${v.warnings.length === 1 ? "" : "s"} · ${v.score}/100`
    : `Validation needs review · ${v.score}/100`
  out.push({
    kind: "validate",
    summary: passSummary,
    detail: validateDetail,
    tone: v.passed ? "success" : "warn",
  })

  // 5. Preview — Sandpack mounts client-side via SSE component:updated, so
  // any artifact with a .tsx/.jsx file is "ready" regardless of the legacy
  // iframe bundler result (artifact.previewMode is a pre-pivot field from
  // the abandoned full-app iframe path; component-focused preview pivot
  // uses Sandpack browser bundler instead).
  const hasRenderableFile = (artifact.files ?? []).some((f) =>
    /\.(tsx|jsx)$/i.test(f.path),
  )
  const previewMode =
    artifact.previewMode ?? (artifact.bundleResult ? "component" : "fallback")
  if (hasRenderableFile) {
    out.push({
      kind: "preview",
      summary: "Preview: ready",
    })
  } else if (previewMode === "fallback") {
    out.push({
      kind: "preview",
      summary: "Preview: fallback shell (component bundle skipped)",
      tone: "warn",
    })
  } else {
    out.push({
      kind: "preview",
      summary: "Preview: ready",
    })
  }

  // 6. Terminal status line — replaces the wall-of-text "Done. Review the
  // preview…" bubble so the action stream itself closes the loop.
  out.push({
    kind: "status",
    summary: "Done. Review the preview. Create a PR when you're ready.",
  })

  return out
}

/** Format bytes as a short label ("1.2 KB", "8.6 KB", "320 B"). */
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  const kb = n / 1024
  if (kb < 1024) return `${kb >= 10 ? kb.toFixed(0) : kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`
}

/**
 * Count `+` / `-` lines in a unified-diff body. Header lines (`+++`, `---`,
 * `@@`) are excluded so the totals match `git diff --stat` semantics.
 */
function countDiffLoc(patch: string): { added: number; removed: number } {
  let added = 0
  let removed = 0
  for (const raw of patch.split(/\r?\n/)) {
    if (raw.startsWith("+++") || raw.startsWith("---")) continue
    if (raw.startsWith("+")) added++
    else if (raw.startsWith("-")) removed++
  }
  return { added, removed }
}

/** Best-effort one-line summary for a ValidationError. Shape varies. */
function describeValidationError(err: unknown): string {
  if (typeof err === "string") return err
  if (err && typeof err === "object") {
    const anyErr = err as Record<string, unknown>
    const msg = anyErr.message ?? anyErr.detail ?? anyErr.rule ?? anyErr.code
    if (typeof msg === "string") return msg
    try {
      return JSON.stringify(err)
    } catch {
      return String(err)
    }
  }
  return String(err)
}

/** Friendly label for the rejected-patches panel. Mirrors
 *  patch-validator.summarizeRejection but kept colocated with the dashboard
 *  to avoid pulling pipeline imports into the template module. */
function humanizeRejection(reason: string): string {
  switch (reason) {
    case "modifies-existing-logic":
      return "modifies existing logic"
    case "renames-identifier":
      return "renames an identifier"
    case "deletes-code":
      return "deletes existing code"
    case "removes-export":
      return "removes a public export"
    case "touches-protected-path":
      return "touches a protected path"
    case "malformed-patch":
      return "is not a valid unified diff"
    default:
      return reason
  }
}

function pickActivePrompt(
  prompts: PromptRecord[],
  selectedRepo: string | null,
): PromptRecord | undefined {
  // Pick the latest prompt for the selected repo so switching repos reveals
  // that repo's baseline instead of pinning the canvas to old generated work.
  const scoped = selectedRepo
    ? prompts.filter((p) => p.repo === selectedRepo)
    : prompts
  const live = scoped.find((p) =>
    ["queued", "clarifying", "generating", "awaiting_approval"].includes(
      p.status,
    ),
  )
  return live ?? scoped[0]
}

function pipelineStepsFor(prompt: PromptRecord | undefined): PipelineStep[] {
  if (!prompt) return DEFAULT_PIPELINE_STEPS
  const set = (id: string, state: PipelineStep["state"]): PipelineStep => {
    const base = DEFAULT_PIPELINE_STEPS.find((s) => s.id === id)!
    return { ...base, state }
  }
  const status = prompt.status
  if (status === "queued") {
    return [
      { ...set("dash-prd", "active"), detail: "shape scope" },
      set("design", "pending"),
      set("skill-v3", "pending"),
      set("codex", "pending"),
      set("validate", "pending"),
      set("preview", "pending"),
    ]
  }
  if (status === "clarifying") {
    return [
      { ...set("dash-prd", "active"), detail: "collect context" },
      set("design", "pending"),
      set("skill-v3", "pending"),
      set("codex", "pending"),
      set("validate", "pending"),
      set("preview", "pending"),
    ]
  }
  if (status === "generating") {
    return [
      { ...set("dash-prd", "done"), detail: "scope locked" },
      { ...set("design", "done"), detail: "context pack" },
      { ...set("skill-v3", "active"), detail: "compose files" },
      set("codex", "pending"),
      set("validate", "pending"),
      set("preview", "pending"),
    ]
  }
  if (
    status === "awaiting_approval" ||
    status === "pr_created" ||
    status === "completed"
  ) {
    return [
      { ...set("dash-prd", "done"), detail: "scope locked" },
      { ...set("design", "done"), detail: "rules applied" },
      { ...set("skill-v3", "done"), detail: "files ready" },
      { ...set("codex", "done"), detail: "generated" },
      { ...set("validate", "done"), detail: "checked" },
      { ...set("preview", "done"), detail: "mounted" },
    ]
  }
  if (status === "failed") {
    return [
      set("dash-prd", "done"),
      set("design", "done"),
      set("skill-v3", "done"),
      set("codex", "error"),
      set("validate", "pending"),
      set("preview", "pending"),
    ]
  }
  return DEFAULT_PIPELINE_STEPS
}

function previewStateFor(prompt: PromptRecord | undefined): PreviewPaneState {
  if (!prompt) return "idle"
  if (prompt.status === "failed") return "error"
  if (prompt.status === "clarifying") return "clarifying"
  if (
    prompt.status === "awaiting_approval" ||
    prompt.status === "pr_created" ||
    prompt.status === "completed"
  ) {
    return "ready"
  }
  if (
    prompt.status === "queued" ||
    prompt.status === "generating"
  ) {
    return "running"
  }
  return "idle"
}

// ─────────────────────────────────────────────────────────────────────────
// Chat dashboard (NEW DEFAULT)
// ─────────────────────────────────────────────────────────────────────────

export function renderChatDashboard(
  store: Store,
  orchestrator?: Orchestrator,
  opts: {
    codexCliInstalled?: boolean
    codexCliAuthenticated?: boolean
    codexCliVersion?: string | null
    openAIMode?: "codex-cli" | "byo-key" | "none"
    openAIUser?: string | null
    repoPreview?: RepoPreviewInfo | null
    previewBundleAvailable?: boolean
  } = {},
): string {
  const auth = store.getAuth()
  const workspace = store.getWorkspace()
  const prompts = store.getPrompts(20)
  const resolveArtifact = orchestrator
    ? (id: string) => orchestrator.getArtifact(id)
    : undefined

  const repos = buildRepoList(auth.github.repos)
  const selectedRepo = workspace.activeRepo ?? repos[0]?.full_name ?? null
  const githubDetail = auth.github.connected
    ? `${auth.github.repos.length || repos.length} repos`
    : "optional for PR"
  const openAIConnected =
    opts.openAIMode === "codex-cli" ||
    opts.openAIMode === "byo-key" ||
    auth.openai.connected
  const openAIDetail =
    opts.openAIUser ??
    (opts.openAIMode === "codex-cli" ? "ChatGPT" : auth.openai.user ?? undefined)
  // Sprint 1B — when the live probe (opts.openAIMode === "none") disagrees
  // with the persisted state (auth.openai.connected === true) we surface the
  // reconnect card above the connect form. Two common triggers: Codex CLI
  // session expired, or daemon was restarted while BYO key was still on disk.
  const openAIPreviouslyConnected =
    opts.openAIMode === "none" && auth.openai.connected
  const previousOpenAIMode: "codex-cli" | "byo-key" | "none" =
    auth.openai.user === "ChatGPT"
      ? "codex-cli"
      : auth.openai.user === "byo-key"
        ? "byo-key"
        : "none"

  // Resolve P1.0 context: active project (matches selected repo), the most
  // recent thread inside it, and the active run/prompt picked below. Falls
  // back gracefully when no project exists yet (e.g. fresh install).
  //
  // Sprint 1A fix: kalau project untuk selectedRepo belum ada (mis. user
  // switched repo via dropdown tanpa pernah submit prompt), seed-create the
  // Project so the topbar pill mirrors the repo immediately instead of
  // stuck di "No project". Pull theme dari repo manifest kalau ada.
  let activeProject =
    store
      .getProjects()
      .find((p) => (p.repoFullName ?? "__unassigned__") === (selectedRepo ?? "__unassigned__")) ??
    null
  if (!activeProject && selectedRepo) {
    const manifest = resolveRepoManifest(selectedRepo)
    activeProject = store.ensureProject(selectedRepo, { theme: manifest?.theme })
  }
  const projectThreads = activeProject ? store.getThreads(activeProject.id) : []
  const activeThread = projectThreads[0] ?? null
  const threadRuns = activeThread ? store.getRuns(activeThread.id) : []
  const runSeq = (runId: string | null | undefined): number | null => {
    if (!runId) return null
    const idx = threadRuns.findIndex((r) => r.id === runId)
    if (idx < 0) return null
    return threadRuns.length - idx
  }

  // Auth + branch selector live in a hidden compat region — Lovable-style
  // shell exposes auth via topbar chips and repo selector via the topbar.
  // Keep DOM ids stable so existing status-driven refresh + tests keep working.
  // Phase B1: `db-repo-select` moved into the topbar (Cluster A) so users can
  // switch repos directly. Branch input stays hidden — it is rarely changed
  // and will surface via a Settings menu in Phase P2.
  const authCompat = `<div hidden id="db-auth-region" aria-hidden="true">
    ${renderBranchInput({ value: workspace.activeBranch })}
    ${renderAuthChip({ provider: "openai", connected: openAIConnected, detail: openAIDetail })}
    ${renderAuthChip({ provider: "github", connected: auth.github.connected, detail: githubDetail })}
  </div>`

  const needsOpenAI = !openAIConnected
  const active =
    needsOpenAI
      ? undefined
      : pickActivePrompt(prompts, selectedRepo)

  // Hidden compat region for status-poll refresher + tests.
  const compatRegions = `<div hidden id="db-prompts-region" aria-hidden="true">
    ${renderPromptList(prompts, resolveArtifact)}
  </div>`

  // Right pane — live preview keyed off the active prompt.
  const inferredPreviewState = active
    ? previewStateFor(active)
    : selectedRepo
      ? "baseline"
      : "idle"
  const previewState =
    inferredPreviewState === "ready" && opts.previewBundleAvailable === false
      ? "error"
      : inferredPreviewState
  const score = (active as unknown as { score?: number })?.score
  const activeArtifact = active ? resolveArtifact?.(active.id) : undefined
  const previewPane = renderLivePreviewPane({
    state: previewState,
    promptId: active?.id,
    steps: pipelineStepsFor(active),
    score:
      activeArtifact?.validation.score ??
      (typeof score === "number" ? score : undefined),
    previewMode: activeArtifact?.previewMode,
    errorMessage:
      inferredPreviewState === "ready" && opts.previewBundleAvailable === false
        ? "Generated files are ready, but the iframe bundle could not be built for this output. Review the file list on the left."
        : undefined,
    repoPreview: opts.repoPreview,
  })

  // R4: when active prompt is clarifying, surface a structured card slot
  // above the preview pane. Client-side `hydrateInlineClarifications` will
  // mount the actual form here (preferring the card slot over the legacy
  // chat-bubble target).
  const activeSeq = runSeq(active?.id)
  const clarifyCard =
    active?.status === "clarifying"
      ? `<aside class="db-clarify-card" data-clarify-mount="${escapeAttr(active.id)}">
          <header class="db-clarify-card-head">
            <span class="db-clarify-card-kicker">Clarification needed</span>
            <h3 class="db-clarify-card-title">Answer to continue</h3>
            ${activeSeq ? `<span class="db-run-tag">Run #${activeSeq}</span>` : ""}
          </header>
          <p class="db-clarify-card-loading" aria-live="polite">Loading question…</p>
        </aside>`
      : ""

  const codePanel = renderCodePanel({
    promptId: active?.id,
    files: activeArtifact?.files ?? [],
    explanation: activeArtifact?.explanation,
  })
  const fileCount = activeArtifact?.files.length ?? 0
  const codeCountChip = fileCount > 0
    ? `<span class="db-canvas-tab-count">${fileCount}</span>`
    : ""

  // P1.2B: Lovable-style shell.
  //   Single top bar (project meta · mode tabs · route chip · auth/share)
  //   Vertical split: dark left rail (chat + composer) | light canvas
  //   Canvas = full-bleed preview/code panel (no internal tab strip)

  const route = activeArtifact?.contextPack?.targetRoute ?? activeArtifact?.contextPack?.defaultRoute ?? null
  const routeNav = activeArtifact?.contextPack?.targetNavLabel ?? null
  const projectName = activeProject?.name ?? "No project"
  const projectTheme = activeProject?.theme ?? ""
  const threadTitle = activeThread?.title ?? "New thread"
  const activeSeqLabel = activeSeq != null ? `Run #${activeSeq}` : "No run yet"

  // Phase B1: topbar gets a visible repo selector (Cluster A right side, after
  // project pill) and Lovable-style icon-only mode tabs (Preview / Code /
  // History). History defers wire-up to Phase B2 — placeholder click is inert.
  // Branch badge surfaces read-only in Cluster C alongside the route chip.
  const branchLabel = workspace.activeBranch ?? "main"

  // Phase D3: sandbox mode badge. Hidden when the active repo has no sandbox
  // bootstrap yet. Read defensively so D1's Store extension can land later
  // without breaking the dashboard.
  const sandboxBadge = renderSandboxBadge(store, selectedRepo)

  // Sprint 1A: surface a "Bootstrap workspace" trigger in the topbar when the
  // active repo has no sandbox state yet (null) OR is sitting in the initial
  // "clean" lifecycle stage. Disappears once the workspace lands in any
  // non-clean state (cloned / shim_applied / idle / generating / …).
  const rawSandboxState = (() => {
    if (!selectedRepo) return null
    try {
      const get = (store as unknown as { getSandboxState?: (r: string) => unknown }).getSandboxState
      if (typeof get !== "function") return null
      return get.call(store, selectedRepo) as { state?: string } | null
    } catch {
      return null
    }
  })()
  // F3 — adaptive bootstrap button. State machine drives label so users
  // can re-enter the bootstrap at the next missing step instead of seeing
  // a flat "Activate clone preview" forever:
  //   null               → "▶ Activate clone preview"   (initial)
  //   cloned             → "▶ Continue setup (install + dev server)"
  //   shim_applied       → "▶ Continue setup (install + dev server)"
  //   idle               → "▶ Start dev server"  (clone ready, no server)
  //   clone_running      → button hidden (badge takes over)
  //   clean              → "▶ Activate clone preview"   (treated as null)
  const sandboxStateKey = rawSandboxState?.state ?? null
  const sandboxBtnLabel = ((): string | null => {
    if (sandboxStateKey === "clone_running") return null
    if (sandboxStateKey === null || sandboxStateKey === "clean")
      return "Activate clone preview"
    if (sandboxStateKey === "cloned" || sandboxStateKey === "shim_applied")
      return "Continue setup (install + dev server)"
    if (sandboxStateKey === "idle") return "Start dev server"
    return null
  })()
  const showBootstrapBtn = !!selectedRepo && sandboxBtnLabel !== null
  const sandboxBootstrapBtn = showBootstrapBtn
    ? `<button
        type="button"
        class="db-topbar-bootstrap-btn"
        data-sandbox-bootstrap="${escapeAttr(selectedRepo!)}"
        title="Clone the repo locally, apply the preview shim, and start the dev server so generated changes can render against the real codebase."
        aria-label="${escapeAttr(sandboxBtnLabel!)} for ${escapeAttr(selectedRepo!)}"
      >
        <span class="db-topbar-bootstrap-btn-icon" aria-hidden="true">▶</span>
        <span class="db-topbar-bootstrap-btn-label">${escapeAttr(sandboxBtnLabel!)}</span>
      </button>`
    : ""
  const topbar = `<header class="db-topbar" role="banner">
    <div class="db-topbar-cluster-a">
      <div class="db-topbar-project">
        <span class="db-topbar-project-dot" aria-hidden="true"></span>
        <div class="db-topbar-project-id">
          <span class="db-topbar-project-name">${escapeAttr(projectName)}${projectTheme ? ` <span class="db-topbar-project-theme">${escapeAttr(projectTheme)}</span>` : ""}</span>
          <span class="db-topbar-project-sub">${escapeAttr(threadTitle)} · ${escapeAttr(activeSeqLabel)}</span>
        </div>
      </div>
      <div class="db-topbar-repo" title="Active repository">
        <span class="db-topbar-repo-icon" aria-hidden="true">📁</span>
        ${renderRepoSelect({ repos, active: selectedRepo })}
      </div>
    </div>
    <nav class="db-topbar-tabs" role="tablist" aria-label="Workspace view">
      <button type="button" class="db-topbar-tab db-topbar-tab--active" role="tab" data-tab="preview" aria-selected="true" title="Preview">
        <span class="db-topbar-tab-icon" aria-hidden="true">◐</span>
        <span class="db-topbar-tab-label">Preview</span>
      </button>
      <button type="button" class="db-topbar-tab" role="tab" data-tab="code" aria-selected="false" title="Code">
        <span class="db-topbar-tab-icon" aria-hidden="true">&lt;/&gt;</span>
        <span class="db-topbar-tab-label">Code${codeCountChip}</span>
      </button>
      <button type="button" class="db-topbar-tab" role="tab" data-tab="history" aria-selected="false" title="History">
        <span class="db-topbar-tab-icon" aria-hidden="true">🕒</span>
        <span class="db-topbar-tab-label">History</span>
      </button>
      <a class="db-topbar-tab db-topbar-tab--surface" role="tab" data-tab="owner" href="/owner" aria-selected="false" title="Owner dashboard">
        <span class="db-topbar-tab-icon" aria-hidden="true">⚙</span>
        <span class="db-topbar-tab-label">Owner</span>
      </a>
    </nav>
    <div class="db-topbar-route" title="Target route">
      ${route ? `<code class="db-topbar-route-code">${escapeAttr(route)}</code>${routeNav ? `<span class="db-topbar-route-nav">${escapeAttr(routeNav)}</span>` : ""}` : `<span class="db-topbar-route-empty">no route</span>`}
      <span class="db-topbar-branch-chip" title="Active branch (edit via Settings)">
        <span class="db-topbar-branch-chip-icon" aria-hidden="true">⎇</span>
        <span class="db-topbar-branch-chip-label">${escapeAttr(branchLabel)}</span>
      </span>
      ${sandboxBadge}
      ${sandboxBootstrapBtn}
    </div>
    <div class="db-topbar-actions" id="db-topbar-actions">
      ${renderAuthChip({ provider: "openai", connected: openAIConnected, detail: openAIDetail })}
      ${renderAuthChip({ provider: "github", connected: auth.github.connected, detail: githubDetail })}
    </div>
  </header>`

  // Rail content — conversation + composer. Chat thread is RESTORED as the
  // primary anchor surface (P1.2B fix vs P1.2A over-correction).
  //
  // Phase B2: the rail can swap between two view modes — `chat` (default,
  // the message thread) and `history` (a list of past runs in this thread).
  // Both render server-side; the active mode is controlled client-side via
  // `data-view-mode` on `.db-rail-history` (toggled by topbar history/chat
  // tab clicks). The chat sub-tree keeps its `#db-chat-thread` test selector
  // even when hidden, so existing tests + the WS refresh stay green.
  const chronological = [...prompts].reverse()
  const messages: ChatMessage[] = []
  for (const p of chronological) {
    for (const m of promptToChatMessages(p, resolveArtifact)) messages.push(m)
  }
  const reconnectCard = openAIPreviouslyConnected
    ? renderOpenAIReconnectCard({ previousMode: previousOpenAIMode })
    : ""
  const railThread = needsOpenAI
    ? `<div class="db-rail-empty">
        ${reconnectCard}
        ${renderOpenAIConnectForm({
          codexCliInstalled: opts.codexCliInstalled,
          codexCliVersion: opts.codexCliVersion,
          activeMode: opts.openAIMode === "byo-key" ? "byo-key" : opts.codexCliAuthenticated ? "codex-cli" : "none",
        })}
      </div>`
    : renderChatThread({
        messages,
        emptyHint: "Describe a feature. Dash Build will evaluate scope, ask follow-ups if needed, then preview locally.",
      })

  const railHistoryList = renderRunHistoryList({
    runs: threadRuns,
    activeRunId: active?.id ?? null,
    threadTitle: activeThread?.title ?? null,
  })

  const thinkingInline = active && ["queued", "generating"].includes(active.status)
    ? `<div class="db-rail-thinking" aria-live="polite"><span class="db-rail-thinking-dot" aria-hidden="true"></span>Thinking…</div>`
    : active?.status === "clarifying"
      ? `<div class="db-rail-thinking db-rail-thinking--clarify" aria-live="polite">Awaiting your answer</div>`
      : ""

  // Phase B2 composer toolbar — Lovable-style row UNDER the textarea with a
  // disabled attach button + mode dropdown on the left, and Reset + an
  // icon-only Generate (↑) on the right. The hidden `<label>` keeps the
  // existing test selector + a11y label intact while the visual chip becomes
  // an arrow. Cmd+Enter hint sits inline next to the button.
  const composerToolbar = `<div class="db-composer-toolbar" role="toolbar" aria-label="Composer actions">
    <div class="db-composer-toolbar-left">
      <button
        type="button"
        class="db-composer-tool-btn db-composer-tool-btn--icon"
        data-composer-attach
        disabled
        aria-disabled="true"
        title="Attach coming soon"
        aria-label="Attach (coming soon)"
      >
        <span aria-hidden="true">+</span>
      </button>
      <button
        type="button"
        class="db-composer-tool-btn db-composer-tool-btn--mode"
        data-composer-mode
        disabled
        aria-disabled="true"
        title="Mode selection coming soon"
        aria-label="Mode: Build (coming soon)"
      >
        <span class="db-composer-tool-btn-label">Build</span>
        <span class="db-composer-tool-btn-caret" aria-hidden="true">▾</span>
      </button>
    </div>
    <div class="db-composer-toolbar-right">
      <span class="db-composer-toolbar-hint" aria-hidden="true">⌘↵ to send</span>
      <button
        id="db-local-run-reset"
        class="db-button db-button-ghost db-button-compact"
        type="button"
        aria-label="Reset local run history"
        ${active?.status === "clarifying" ? "disabled" : ""}
      >Reset</button>
      <button
        id="db-prompt-submit"
        class="db-button db-button-primary db-composer-send"
        type="button"
        aria-label="Generate feature from prompt"
        title="Generate (⌘↵)"
        ${active?.status === "clarifying" ? "disabled" : ""}
      >
        <span class="db-button-label sr-only">Generate</span>
        <span class="db-composer-send-arrow" aria-hidden="true">↑</span>
      </button>
    </div>
  </div>`

  const railComposer = needsOpenAI
    ? `<div class="db-rail-composer db-rail-composer--disabled" aria-disabled="true">
        <p class="db-muted db-body-sm">Connect OpenAI to start.</p>
      </div>`
    : `<div class="db-rail-composer">
        <div class="db-rail-composer-input">${renderPromptInput({
          disabled: active?.status === "clarifying",
          hideFooter: true,
        })}</div>
        ${composerToolbar}
      </div>`

  const canvasArea = `<div class="db-canvas-v2" data-active-tab="preview">
    <div class="db-canvas-stage" data-active-tab="preview">
      <div class="db-canvas-panel" data-tab-panel="preview" role="tabpanel" aria-label="Preview">
        ${clarifyCard}
        ${previewPane}
      </div>
      <div class="db-canvas-panel" data-tab-panel="code" role="tabpanel" aria-label="Generated code" hidden>
        ${codePanel}
      </div>
    </div>
  </div>`

  const body = `<section class="db-shell">
    ${topbar}
    <div class="db-split" id="db-split">
      <aside class="db-rail" aria-label="Conversation">
        <div class="db-rail-history" id="db-chat-scroll" data-view-mode="chat">
          <div class="db-rail-view db-rail-view--chat" data-rail-view="chat">
            ${railThread}
            ${thinkingInline}
          </div>
          <div class="db-rail-view db-rail-view--history" data-rail-view="history" hidden>
            ${railHistoryList}
          </div>
        </div>
        ${railComposer}
      </aside>
      <div
        class="db-split-resizer"
        id="db-split-resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize chat rail. Drag to adjust width, or use left/right arrow keys."
        aria-controls="db-split"
        tabindex="0"
      ></div>
      <main class="db-canvas-region" aria-label="Generate canvas">
        ${canvasArea}
      </main>
    </div>
    ${authCompat}
    ${compatRegions}
  </section>`

  return renderLayout({
    title: "Dashboard",
    body,
    authIndicator:
      openAIConnected ? "ok" : "pending",
    version: store.getVersion(),
  })
}

// ─────────────────────────────────────────────────────────────────────────
// Classic dashboard (LEGACY / FALLBACK)
// ─────────────────────────────────────────────────────────────────────────

export function renderClassicDashboard(
  store: Store,
  orchestrator?: Orchestrator,
  opts: {
    codexCliInstalled?: boolean
    codexCliAuthenticated?: boolean
    codexCliVersion?: string | null
    openAIMode?: "codex-cli" | "byo-key" | "none"
    openAIUser?: string | null
  } = {},
): string {
  const auth = store.getAuth()
  const workspace = store.getWorkspace()
  const prompts = store.getPrompts(10)
  const resolveArtifact = orchestrator
    ? (id: string) => orchestrator.getArtifact(id)
    : undefined

  const repos = buildRepoList(auth.github.repos)

  const githubDetail = auth.github.connected
    ? `${auth.github.repos.length || repos.length} repos`
    : "optional for PR"
  const openAIConnected =
    opts.openAIMode === "codex-cli" ||
    opts.openAIMode === "byo-key" ||
    auth.openai.connected
  const openAIDetail =
    opts.openAIUser ??
    (opts.openAIMode === "codex-cli" ? "ChatGPT" : auth.openai.user ?? undefined)

  const workspaceCard = `<section class="db-card" aria-labelledby="db-workspace-title">
    <header class="db-card-header">
      <h2 class="db-card-title" id="db-workspace-title">Target workspace</h2>
      <span class="db-card-subtitle">${escapeAttr(workspace.activeRepo ?? "no repo selected")}</span>
    </header>
    <div class="db-workspace">
      <div class="db-workspace-field">
        <label class="db-label" for="db-repo-select">Repository</label>
        ${renderRepoSelect({ repos, active: workspace.activeRepo })}
      </div>
      <div class="db-workspace-field">
        <label class="db-label" for="db-branch-input">Branch</label>
        ${renderBranchInput({ value: workspace.activeBranch })}
      </div>
    </div>
    <div class="db-workspace-auth" id="db-auth-region">
      ${renderAuthChip({ provider: "openai", connected: openAIConnected, detail: openAIDetail })}
      ${renderAuthChip({ provider: "github", connected: auth.github.connected, detail: githubDetail })}
    </div>
  </section>`

  const needsOpenAI = !openAIConnected
  let buildBody: string
  if (needsOpenAI) {
    buildBody = renderOpenAIConnectForm({
      codexCliInstalled: opts.codexCliInstalled,
      codexCliVersion: opts.codexCliVersion,
      activeMode: opts.openAIMode === "byo-key" ? "byo-key" : opts.codexCliAuthenticated ? "codex-cli" : "none",
    })
  } else {
    buildBody = renderPromptInput({})
  }

  const buildCard = `<section class="db-card" aria-labelledby="db-build-title">
    <header class="db-card-header">
      <h2 class="db-card-title" id="db-build-title">Build feature</h2>
      <span class="db-card-subtitle">Ctrl/Cmd + Enter to submit</span>
    </header>
    ${buildBody}
  </section>`

  const promptsBody =
    needsOpenAI
      ? `<div class="db-empty-state"><p class="db-empty-body">Connect OpenAI above to see prompts.</p></div>`
      : prompts.length === 0
        ? renderPromptList([], resolveArtifact)
        : renderPromptList(prompts, resolveArtifact)

  const promptsCard = `<section class="db-card" aria-labelledby="db-prompts-title">
    <header class="db-card-header">
      <h2 class="db-card-title" id="db-prompts-title">Active prompts</h2>
      <span class="db-card-subtitle">${prompts.length} recent</span>
    </header>
    <div id="db-prompts-region">${promptsBody}</div>
  </section>`

  const body = `
    <div class="db-page-head">
      <h1 class="db-title-lg">What do you want to build today?</h1>
      <p class="db-body db-muted">Lovable-for-Dash. Describe a feature, get a PR.</p>
    </div>
    ${workspaceCard}
    ${buildCard}
    ${promptsCard}
  `

  return renderLayout({
    title: "Dashboard",
    body,
    authIndicator:
      openAIConnected ? "ok" : "pending",
    version: store.getVersion(),
  })
}

/**
 * Opts threaded through to both chat + classic dashboards. Used by the
 * connect form to know whether the Codex subprocess
 * path is ready (binary on PATH) — keeps the render sync while still
 * showing accurate state. The probe runs in the dashboard route handler.
 */
export interface RenderDashboardOptions {
  codexCliInstalled?: boolean
  codexCliAuthenticated?: boolean
  codexCliVersion?: string | null
  openAIMode?: "codex-cli" | "byo-key" | "none"
  openAIUser?: string | null
  repoPreview?: RepoPreviewInfo | null
  previewBundleAvailable?: boolean
}

// Default export — the chat-style dashboard.
export function renderDashboard(
  store: Store,
  orchestrator?: Orchestrator,
  opts: RenderDashboardOptions = {},
): string {
  return renderChatDashboard(store, orchestrator, opts)
}

// Re-export legacy helpers so existing callers (e.g. WS tests) keep working.
export { renderPromptCard, renderPromptList }
