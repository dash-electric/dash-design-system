/**
 * Type definitions for the dash-build daemon state store.
 *
 * The store is the single source of truth for runtime state — auth status,
 * pending prompts, active workspace. Persisted atomically to
 * ~/.dash-build/state.json on every mutation.
 */

export type AuthProvider = "openai" | "github"

export interface OpenAIAuthState {
  connected: boolean
  user: string | null
}

export interface GithubAuthState {
  connected: boolean
  repos: string[]
}

export interface AuthState {
  openai: OpenAIAuthState
  github: GithubAuthState
}

export type PromptStatus =
  | "queued"
  | "clarifying"
  | "generating"
  | "awaiting_approval"
  | "pr_created"
  | "completed"
  | "failed"
  | "cancelled"

export interface PromptRecord {
  id: string
  text: string
  repo: string | null
  branch: string | null
  status: PromptStatus
  createdAt: string
  updatedAt: string
  prUrl: string | null
  error: string | null
}

export interface WorkspaceState {
  activeRepo: string | null
  activeBranch: string | null
}

// ──────────────────────────────────────────────────────────────────────────
// P1.0 Workspace shape — additive Project / Thread / Run wrapping over the
// existing PromptRecord pipeline. The legacy `prompts[]` array stays as the
// canonical store for status transitions; `runs[]` is a 1:1 mirror plus
// project/thread linkage so the UI can return to a project later.
// ──────────────────────────────────────────────────────────────────────────

export type ProjectMode = "existing-repo"
export type ProjectStatus = "active" | "archived"

export interface Project {
  id: string
  workspaceId: "local"
  name: string
  mode: ProjectMode
  repoFullName: string | null
  defaultBranch: string
  theme: string
  status: ProjectStatus
  createdAt: string
}

export type ThreadStatus =
  | "planning"
  | "generating"
  | "preview_ready"
  | "published"
  | "failed"

export interface Thread {
  id: string
  projectId: string
  title: string
  activeRunId: string | null
  status: ThreadStatus
  createdAt: string
  updatedAt: string
}

export interface Run {
  /** Same id as the underlying PromptRecord (no separate identity yet). */
  id: string
  threadId: string
  projectId: string
  prompt: string
  status: PromptStatus
  repo: string | null
  branch: string | null
  /** Path to context.json on disk if persisted, else null. */
  contextPackRef: string | null
  /** Path to run artifact dir on disk if persisted, else null. */
  artifactDir: string | null
  /** Foundation match score (0-100) once validation finishes. */
  validationScore: number | null
  createdAt: string
  updatedAt: string
  error: string | null
  prUrl: string | null
}

// ──────────────────────────────────────────────────────────────────────────
// Phase D1 — Sandbox state persisted per consumer repo (clone lifecycle).
// `sandboxState` is keyed by repoSlug (e.g. "dash/backoffice"). The state
// machine lives in src/runs/sandbox-state.ts; this is its disk shape.
// ──────────────────────────────────────────────────────────────────────────

export type SandboxStateValue =
  | "clean"
  | "cloned"
  | "shim_applied"
  | "idle"
  // F1 — dev server spawned + port listening; the resolver flips the canvas
  // iframe to http://127.0.0.1:<devServerPort> while the sandbox stays in
  // this state. Persisted across reloads so the canvas survives a daemon
  // restart while the long-lived dev server keeps running.
  | "clone_running"
  | "generating"
  | "preview_ready"
  | "publishing"
  | "sweep"
  | "stale"
  // F3 — terminal failure from a bootstrap/dev-server crash. Surfaced in the
  // badge with an error tone + click-to-retry. Persisted so a daemon restart
  // doesn't silently mask a broken workspace.
  | "failed"

export interface SandboxTransitionRecord {
  from: SandboxStateValue
  to: SandboxStateValue
  at: string
}

export interface SandboxStatePersisted {
  repoSlug: string
  state: SandboxStateValue
  history: SandboxTransitionRecord[]
  /** ISO timestamp of the last meaningful change (boot, transition, sync). */
  lastActivity: string
  /** Active run id when state ∈ {generating, preview_ready, publishing}, else null. */
  runId: string | null
  /** Absolute path to the clone dir, e.g. ~/Work/dash-build-clones/dash__backoffice. */
  clonePath: string
  /** SHA of the preview-shim apply commit on the current main, or null. */
  shimCommitSha: string | null
  /**
   * F1 — port the dev server is listening on (may differ from manifest
   * default if there was a collision and Workspace auto-incremented).
   * Populated when state === "clone_running"; persisted so the resolver can
   * keep picking the live clone after a daemon restart.
   */
  devServerPort?: number | null
  /**
   * F3 — last raw lifecycle action broadcast (`dev_server_starting`,
   * `dev_server_ready`, `dev_server_failed`, `dev_server_crashed`). Drives
   * the badge loading/error variants when state hasn't moved yet.
   */
  lastAction?: string | null
  /** F3 — human-readable error message from the most recent failure. */
  devServerError?: string | null
}

export interface DaemonState {
  version: string
  startedAt: string
  auth: AuthState
  prompts: PromptRecord[]
  workspace: WorkspaceState
  projects: Project[]
  threads: Thread[]
  runs: Run[]
  /** Phase D1 — sandbox lifecycle per repoSlug. Empty on first boot. */
  sandboxState: Record<string, SandboxStatePersisted>
}

export interface AuthUpdateOpenAI {
  connected?: boolean
  user?: string | null
}

export interface AuthUpdateGithub {
  connected?: boolean
  repos?: string[]
}

export type AuthUpdate<P extends AuthProvider> = P extends "openai"
  ? AuthUpdateOpenAI
  : AuthUpdateGithub

export const DAEMON_VERSION = "0.1.0"

export function createInitialState(): DaemonState {
  return {
    version: DAEMON_VERSION,
    startedAt: new Date().toISOString(),
    auth: {
      openai: { connected: false, user: null },
      github: { connected: false, repos: [] },
    },
    prompts: [],
    workspace: { activeRepo: null, activeBranch: null },
    projects: [],
    threads: [],
    runs: [],
    sandboxState: {},
  }
}

function deriveProjectName(repo: string | null | undefined): string {
  if (!repo) return "Unassigned"
  const tail = repo.split("/").pop() ?? repo
  return tail
    .replace(/^next-/, "")
    .replace(/-(web|fe|backoffice)$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || repo
}

function migrateLegacyToRuns(
  prompts: PromptRecord[],
  existingProjects: Project[],
  existingThreads: Thread[],
): { projects: Project[]; threads: Thread[]; runs: Run[] } {
  const projects = [...existingProjects]
  const threads = [...existingThreads]
  const runs: Run[] = []
  const projectKey = (repo: string | null) => repo ?? "__unassigned__"

  const ensureProjectFor = (repo: string | null, when: string): Project => {
    const key = projectKey(repo)
    const found = projects.find((p) => projectKey(p.repoFullName) === key)
    if (found) return found
    const p: Project = {
      id: `proj_legacy_${projects.length + 1}`,
      workspaceId: "local",
      name: deriveProjectName(repo),
      mode: "existing-repo",
      repoFullName: repo,
      defaultBranch: "main",
      theme: "shared",
      status: "active",
      createdAt: when,
    }
    projects.unshift(p)
    return p
  }

  const ensureThreadFor = (projectId: string, when: string): Thread => {
    const found = threads.find((t) => t.projectId === projectId)
    if (found) return found
    const t: Thread = {
      id: `thr_legacy_${threads.length + 1}`,
      projectId,
      title: "Legacy import",
      activeRunId: null,
      status: "planning",
      createdAt: when,
      updatedAt: when,
    }
    threads.unshift(t)
    return t
  }

  // Oldest first so activeRunId on thread ends pointing at the most recent.
  const ordered = [...prompts].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )
  for (const p of ordered) {
    const project = ensureProjectFor(p.repo, p.createdAt)
    const thread = ensureThreadFor(project.id, p.createdAt)
    const run: Run = {
      id: p.id,
      threadId: thread.id,
      projectId: project.id,
      prompt: p.text,
      status: p.status,
      repo: p.repo,
      branch: p.branch,
      contextPackRef: null,
      artifactDir: null,
      validationScore: null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      error: p.error,
      prUrl: p.prUrl,
    }
    runs.push(run)
    thread.activeRunId = run.id
    thread.updatedAt = run.updatedAt
  }

  // Match the unshift order used elsewhere — newest first.
  runs.reverse()
  return { projects, threads, runs }
}

export function normalizeDaemonState(input: unknown): DaemonState {
  const base = createInitialState()
  const parsed = (input && typeof input === "object" ? input : {}) as Partial<DaemonState> & {
    auth?: {
      openai?: Partial<OpenAIAuthState>
      anthropic?: Partial<OpenAIAuthState>
      github?: Partial<GithubAuthState>
    }
    workspace?: Partial<WorkspaceState>
  }

  const prompts = Array.isArray(parsed.prompts) ? parsed.prompts : base.prompts
  const hasWorkspaceShape =
    Array.isArray(parsed.projects) &&
    Array.isArray(parsed.threads) &&
    Array.isArray(parsed.runs)

  const { projects, threads, runs } = hasWorkspaceShape
    ? {
        projects: parsed.projects as Project[],
        threads: parsed.threads as Thread[],
        runs: parsed.runs as Run[],
      }
    : migrateLegacyToRuns(prompts, [], [])

  const sandboxState = normalizeSandboxStateMap(
    (parsed as { sandboxState?: unknown }).sandboxState,
  )

  return {
    version: typeof parsed.version === "string" ? parsed.version : base.version,
    startedAt:
      typeof parsed.startedAt === "string" ? parsed.startedAt : base.startedAt,
    auth: {
      openai: {
        connected:
          parsed.auth?.openai?.connected ??
          parsed.auth?.anthropic?.connected ??
          base.auth.openai.connected,
        user:
          parsed.auth?.openai?.user ??
          parsed.auth?.anthropic?.user ??
          base.auth.openai.user,
      },
      github: {
        connected: parsed.auth?.github?.connected ?? base.auth.github.connected,
        repos: Array.isArray(parsed.auth?.github?.repos)
          ? parsed.auth!.github!.repos.filter((repo): repo is string => typeof repo === "string")
          : base.auth.github.repos,
      },
    },
    prompts,
    workspace: {
      activeRepo:
        parsed.workspace?.activeRepo === undefined
          ? base.workspace.activeRepo
          : parsed.workspace.activeRepo,
      activeBranch:
        parsed.workspace?.activeBranch === undefined
          ? base.workspace.activeBranch
          : parsed.workspace.activeBranch,
    },
    projects,
    threads,
    runs,
    sandboxState,
  }
}

const VALID_SANDBOX_STATES: ReadonlySet<SandboxStateValue> = new Set([
  "clean",
  "cloned",
  "shim_applied",
  "idle",
  // F1 + F3 — see SandboxStateValue for semantics. Must stay in sync with
  // the union above so normalizeSandboxStateMap doesn't silently drop these
  // entries on daemon reboot.
  "clone_running",
  "generating",
  "preview_ready",
  "publishing",
  "sweep",
  "stale",
  "failed",
])

function normalizeSandboxStateMap(
  input: unknown,
): Record<string, SandboxStatePersisted> {
  if (!input || typeof input !== "object") return {}
  const out: Record<string, SandboxStatePersisted> = {}
  for (const [key, raw] of Object.entries(input as Record<string, unknown>)) {
    if (typeof key !== "string" || !key) continue
    if (!raw || typeof raw !== "object") continue
    const entry = raw as Partial<SandboxStatePersisted>
    if (!entry.state || !VALID_SANDBOX_STATES.has(entry.state)) continue
    const history = Array.isArray(entry.history)
      ? entry.history.filter(
          (h): h is SandboxTransitionRecord =>
            !!h &&
            typeof h === "object" &&
            typeof (h as SandboxTransitionRecord).at === "string" &&
            VALID_SANDBOX_STATES.has((h as SandboxTransitionRecord).from) &&
            VALID_SANDBOX_STATES.has((h as SandboxTransitionRecord).to),
        )
      : []
    out[key] = {
      repoSlug: typeof entry.repoSlug === "string" ? entry.repoSlug : key,
      state: entry.state,
      history,
      lastActivity:
        typeof entry.lastActivity === "string"
          ? entry.lastActivity
          : new Date(0).toISOString(),
      runId: typeof entry.runId === "string" ? entry.runId : null,
      clonePath: typeof entry.clonePath === "string" ? entry.clonePath : "",
      shimCommitSha:
        typeof entry.shimCommitSha === "string" ? entry.shimCommitSha : null,
      // F1/F3 — defensive parse. Older state.json files don't carry these
      // fields; default them so the dashboard doesn't blow up on undefined
      // access.
      devServerPort:
        typeof entry.devServerPort === "number" && Number.isFinite(entry.devServerPort)
          ? entry.devServerPort
          : null,
      lastAction: typeof entry.lastAction === "string" ? entry.lastAction : null,
      devServerError:
        typeof entry.devServerError === "string" ? entry.devServerError : null,
    }
  }
  return out
}
