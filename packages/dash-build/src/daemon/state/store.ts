import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { randomBytes, randomUUID } from "node:crypto"
import {
  type AuthProvider,
  type AuthUpdate,
  type DaemonState,
  type Project,
  type PromptRecord,
  type PromptStatus,
  type Run,
  type SandboxStatePersisted,
  type SandboxStateValue,
  type Thread,
  type ThreadStatus,
  createInitialState,
  normalizeDaemonState,
} from "./types.js"

/**
 * Phase D1 — staleness threshold mirrored from src/runs/sandbox-state.ts.
 * Kept inline so the store module has zero cross-module dependency. If you
 * change one, change both.
 */
const SANDBOX_STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000

const DEFAULT_DIR = join(homedir(), ".dash-build")
const DEFAULT_FILE = join(DEFAULT_DIR, "state.json")

export interface StoreOptions {
  path?: string
}

/**
 * In-memory daemon state with atomic JSON persistence.
 *
 * Writes are atomic (write to .tmp then rename) so a crash mid-write cannot
 * corrupt the file. On load, if the file is corrupted or missing, we fall
 * back to a fresh initial state instead of throwing — the daemon should
 * still come up.
 */
export class Store {
  private state: DaemonState
  private readonly filePath: string
  /**
   * Serialize persist calls so concurrent mutations cannot interleave their
   * tmp-write + rename steps. Without this two callers in the same ms tick
   * race on `state.json.tmp-PID-TS` paths.
   */
  private persistChain: Promise<void> = Promise.resolve()

  private constructor(state: DaemonState, filePath: string) {
    this.state = state
    this.filePath = filePath
  }

  static async load(opts: StoreOptions = {}): Promise<Store> {
    const filePath = opts.path ?? DEFAULT_FILE
    await mkdir(dirname(filePath), { recursive: true })

    if (!existsSync(filePath)) {
      const fresh = createInitialState()
      const store = new Store(fresh, filePath)
      await store.persist()
      return store
    }

    try {
      const raw = await readFile(filePath, "utf8")
      const parsed = normalizeDaemonState(JSON.parse(raw))
      // Light shape validation — fall back to fresh if missing required keys
      if (!parsed.auth || !parsed.prompts || !parsed.workspace) {
        throw new Error("invalid state shape")
      }
      // Phase D1: flip stale sandboxes on boot. Anything in idle/preview_ready
      // older than 7d gets marked stale so the D3 sweeper can later reclaim it.
      flipStaleSandboxesOnBoot(parsed)
      return new Store(parsed, filePath)
    } catch {
      const fresh = createInitialState()
      const store = new Store(fresh, filePath)
      await store.persist()
      return store
    }
  }

  /** Snapshot the current state (defensive copy). */
  snapshot(): DaemonState {
    return JSON.parse(JSON.stringify(this.state)) as DaemonState
  }

  /** Atomic persist — write to .tmp then rename. Serialized via persistChain. */
  async persist(): Promise<void> {
    const next = this.persistChain.then(async () => {
      await mkdir(dirname(this.filePath), { recursive: true })
      const tmp = `${this.filePath}.tmp-${process.pid}-${Date.now()}-${randomBytes(4).toString("hex")}`
      await writeFile(tmp, JSON.stringify(this.state, null, 2), "utf8")
      await rename(tmp, this.filePath)
    })
    // Swallow on the chain so one failure doesn't poison subsequent persists.
    this.persistChain = next.catch(() => {})
    return next
  }

  getAuth() {
    return this.state.auth
  }

  async setAuth<P extends AuthProvider>(provider: P, update: AuthUpdate<P>): Promise<void> {
    if (provider === "openai") {
      const u = update as AuthUpdate<"openai">
      this.state.auth.openai = {
        ...this.state.auth.openai,
        ...u,
      }
    } else {
      const u = update as AuthUpdate<"github">
      this.state.auth.github = {
        ...this.state.auth.github,
        ...u,
      }
    }
    await this.persist()
  }

  addPrompt(input: {
    text: string
    repo?: string | null
    branch?: string | null
  }): PromptRecord {
    const now = new Date().toISOString()
    const repo = input.repo ?? this.state.workspace.activeRepo
    const branch = input.branch ?? this.state.workspace.activeBranch
    const record: PromptRecord = {
      id: `prm_${randomUUID().slice(0, 12)}`,
      text: input.text,
      repo,
      branch,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      prUrl: null,
      error: null,
    }
    this.state.prompts.unshift(record)
    // Mirror into Project / Thread / Run wrapping (P1.0). Same id reused as run id.
    const project = this.ensureProjectInternal(repo, now)
    const thread = this.ensureActiveThreadInternal(project.id, input.text, now)
    this.createRunInternal({
      runId: record.id,
      threadId: thread.id,
      projectId: project.id,
      prompt: input.text,
      repo,
      branch,
      createdAt: now,
    })
    // Persist is fire-and-forget but we swallow errors so a transient FS
    // hiccup (e.g. tmp dir removed mid-test) doesn't crash the daemon.
    this.persist().catch(() => {
      /* ignore — next mutation will retry */
    })
    return record
  }

  getPrompt(id: string): PromptRecord | null {
    return this.state.prompts.find((p) => p.id === id) ?? null
  }

  getPrompts(limit = 10): PromptRecord[] {
    return this.state.prompts.slice(0, limit)
  }

  async clearPrompts(): Promise<PromptRecord[]> {
    const removed = this.state.prompts
    this.state.prompts = []
    // Also clear thread/run linkage; keep projects so the user can return.
    this.state.runs = []
    for (const t of this.state.threads) {
      t.activeRunId = null
      t.status = "planning"
    }
    await this.persist()
    return removed
  }

  async updatePromptStatus(
    id: string,
    status: PromptStatus,
    patch: Partial<Pick<PromptRecord, "prUrl" | "error">> = {},
  ): Promise<PromptRecord | null> {
    const prompt = this.state.prompts.find((p) => p.id === id)
    if (!prompt) return null
    const now = new Date().toISOString()
    prompt.status = status
    prompt.updatedAt = now
    if (patch.prUrl !== undefined) prompt.prUrl = patch.prUrl
    if (patch.error !== undefined) prompt.error = patch.error

    // Mirror into the Run + Thread wrappers so the workspace view stays in sync.
    const run = this.state.runs.find((r) => r.id === id)
    if (run) {
      run.status = status
      run.updatedAt = now
      if (patch.prUrl !== undefined) run.prUrl = patch.prUrl
      if (patch.error !== undefined) run.error = patch.error
      const thread = this.state.threads.find((t) => t.id === run.threadId)
      if (thread) {
        thread.status = mapStatusToThread(status, thread.status)
        thread.updatedAt = now
      }
    }
    await this.persist()
    return prompt
  }

  async setActiveRepo(repo: string | null, branch: string | null = null): Promise<void> {
    this.state.workspace.activeRepo = repo
    this.state.workspace.activeBranch = branch
    if (repo) {
      // Make sure a Project exists for the newly active repo so Home/Inspector
      // can list it before any prompt lands.
      this.ensureProjectInternal(repo, new Date().toISOString())
    }
    await this.persist()
  }

  getWorkspace() {
    return this.state.workspace
  }

  getStartedAt(): string {
    return this.state.startedAt
  }

  getVersion(): string {
    return this.state.version
  }

  // ── Project / Thread / Run accessors (P1.0) ──────────────────────────────

  getProjects(): Project[] {
    return this.state.projects.slice()
  }

  getProject(id: string): Project | null {
    return this.state.projects.find((p) => p.id === id) ?? null
  }

  ensureProject(
    repo: string | null,
    opts: { theme?: string } = {},
  ): Project {
    const project = this.ensureProjectInternal(repo, new Date().toISOString())
    if (opts.theme && project.theme !== opts.theme) {
      project.theme = opts.theme
    }
    this.persist().catch(() => {})
    return project
  }

  getThreads(projectId: string): Thread[] {
    return this.state.threads.filter((t) => t.projectId === projectId)
  }

  getThread(id: string): Thread | null {
    return this.state.threads.find((t) => t.id === id) ?? null
  }

  openThread(projectId: string, titleHint?: string): Thread {
    const thread = this.openThreadInternal(
      projectId,
      titleHint,
      new Date().toISOString(),
    )
    this.persist().catch(() => {})
    return thread
  }

  getRuns(threadId: string): Run[] {
    return this.state.runs.filter((r) => r.threadId === threadId)
  }

  getRun(id: string): Run | null {
    return this.state.runs.find((r) => r.id === id) ?? null
  }

  /** Patch artifact bookkeeping after the orchestrator persists files to disk. */
  async setRunArtifact(
    runId: string,
    patch: {
      artifactDir?: string | null
      contextPackRef?: string | null
      validationScore?: number | null
    },
  ): Promise<Run | null> {
    const run = this.state.runs.find((r) => r.id === runId)
    if (!run) return null
    if (patch.artifactDir !== undefined) run.artifactDir = patch.artifactDir
    if (patch.contextPackRef !== undefined) run.contextPackRef = patch.contextPackRef
    if (patch.validationScore !== undefined) run.validationScore = patch.validationScore
    run.updatedAt = new Date().toISOString()
    await this.persist()
    return run
  }

  // ── Sandbox state (Phase D1) ─────────────────────────────────────────────

  /**
   * Return the persisted sandbox snapshot for a repoSlug, or null if none.
   * Returns a defensive copy so callers can mutate freely without affecting
   * Store internals.
   */
  getSandboxState(repoSlug: string): SandboxStatePersisted | null {
    const found = this.state.sandboxState[repoSlug]
    if (!found) return null
    return JSON.parse(JSON.stringify(found)) as SandboxStatePersisted
  }

  /** All persisted sandbox snapshots (e.g. for the topbar overview). */
  listSandboxStates(): SandboxStatePersisted[] {
    return Object.values(this.state.sandboxState).map(
      (s) => JSON.parse(JSON.stringify(s)) as SandboxStatePersisted,
    )
  }

  /**
   * Patch-merge a sandbox state record. Creates the entry if missing. Always
   * bumps `lastActivity` to "now" so the stale detector reflects real usage.
   */
  async updateSandboxState(
    repoSlug: string,
    patch: Partial<Omit<SandboxStatePersisted, "repoSlug">>,
  ): Promise<SandboxStatePersisted> {
    const now = new Date().toISOString()
    const existing = this.state.sandboxState[repoSlug]
    const next: SandboxStatePersisted = {
      repoSlug,
      state: patch.state ?? existing?.state ?? "clean",
      history: patch.history ?? existing?.history ?? [],
      lastActivity: patch.lastActivity ?? now,
      runId: patch.runId !== undefined ? patch.runId : existing?.runId ?? null,
      clonePath: patch.clonePath ?? existing?.clonePath ?? "",
      shimCommitSha:
        patch.shimCommitSha !== undefined
          ? patch.shimCommitSha
          : existing?.shimCommitSha ?? null,
    }
    this.state.sandboxState[repoSlug] = next
    await this.persist()
    return JSON.parse(JSON.stringify(next)) as SandboxStatePersisted
  }

  /** Force-set the sandbox state value. Used by workspace bootstrap. */
  async setSandboxStateValue(
    repoSlug: string,
    state: SandboxStateValue,
  ): Promise<SandboxStatePersisted> {
    return this.updateSandboxState(repoSlug, { state })
  }

  /** Drop a sandbox entry (after teardown / clone deletion). */
  async deleteSandboxState(repoSlug: string): Promise<boolean> {
    if (!this.state.sandboxState[repoSlug]) return false
    delete this.state.sandboxState[repoSlug]
    await this.persist()
    return true
  }

  // ── Internals ────────────────────────────────────────────────────────────

  private ensureProjectInternal(repo: string | null, when: string): Project {
    const key = projectKey(repo)
    const existing = this.state.projects.find(
      (p) => projectKey(p.repoFullName) === key,
    )
    if (existing) return existing
    const project: Project = {
      id: `proj_${randomUUID().slice(0, 12)}`,
      workspaceId: "local",
      name: deriveProjectName(repo),
      mode: "existing-repo",
      repoFullName: repo,
      defaultBranch: "main",
      theme: "shared",
      status: "active",
      createdAt: when,
    }
    this.state.projects.unshift(project)
    return project
  }

  private ensureActiveThreadInternal(
    projectId: string,
    titleHint: string | undefined,
    when: string,
  ): Thread {
    const existing = this.state.threads.find(
      (t) =>
        t.projectId === projectId &&
        t.status !== "published" &&
        t.status !== "failed",
    )
    if (existing) return existing
    return this.openThreadInternal(projectId, titleHint, when)
  }

  private openThreadInternal(
    projectId: string,
    titleHint: string | undefined,
    when: string,
  ): Thread {
    const thread: Thread = {
      id: `thr_${randomUUID().slice(0, 12)}`,
      projectId,
      title: (titleHint ?? "Untitled thread").trim().slice(0, 60) || "Untitled thread",
      activeRunId: null,
      status: "planning",
      createdAt: when,
      updatedAt: when,
    }
    this.state.threads.unshift(thread)
    return thread
  }

  private createRunInternal(input: {
    runId: string
    threadId: string
    projectId: string
    prompt: string
    repo: string | null
    branch: string | null
    createdAt: string
  }): Run {
    const run: Run = {
      id: input.runId,
      threadId: input.threadId,
      projectId: input.projectId,
      prompt: input.prompt,
      status: "queued",
      repo: input.repo,
      branch: input.branch,
      contextPackRef: null,
      artifactDir: null,
      validationScore: null,
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
      error: null,
      prUrl: null,
    }
    this.state.runs.unshift(run)
    const thread = this.state.threads.find((t) => t.id === input.threadId)
    if (thread) {
      thread.activeRunId = run.id
      thread.updatedAt = input.createdAt
    }
    return run
  }
}

function projectKey(repo: string | null | undefined): string {
  return repo ?? "__unassigned__"
}

function deriveProjectName(repo: string | null | undefined): string {
  if (!repo) return "Unassigned"
  const tail = repo.split("/").pop() ?? repo
  const cleaned = tail
    .replace(/^next-/, "")
    .replace(/-(web|fe|backoffice)$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
  return cleaned || repo
}

function mapStatusToThread(
  promptStatus: PromptStatus,
  current: ThreadStatus,
): ThreadStatus {
  switch (promptStatus) {
    case "queued":
    case "clarifying":
      return current === "published" ? current : "planning"
    case "generating":
      return "generating"
    case "awaiting_approval":
    case "completed":
      return "preview_ready"
    case "pr_created":
      return "published"
    case "failed":
      return "failed"
    case "cancelled":
      return current
    default:
      return current
  }
}

export const STATE_FILE_PATH = DEFAULT_FILE

/**
 * Phase D1 — flip any sandboxState entry from {idle, preview_ready} to
 * `stale` if it has not seen activity for ≥ 7d. Run inline on boot so the
 * dashboard never shows a fresh "idle" badge for a sandbox the daemon hasn't
 * touched in a week.
 */
function flipStaleSandboxesOnBoot(state: DaemonState): void {
  const nowMs = Date.now()
  for (const [slug, entry] of Object.entries(state.sandboxState)) {
    if (entry.state !== "idle" && entry.state !== "preview_ready") continue
    const last = Date.parse(entry.lastActivity)
    if (!Number.isFinite(last)) continue
    if (nowMs - last < SANDBOX_STALE_THRESHOLD_MS) continue
    const transition = {
      from: entry.state,
      to: "stale" as SandboxStateValue,
      at: new Date(nowMs).toISOString(),
    }
    state.sandboxState[slug] = {
      ...entry,
      state: "stale",
      history: [...entry.history, transition].slice(-20),
      lastActivity: new Date(nowMs).toISOString(),
    }
  }
}
