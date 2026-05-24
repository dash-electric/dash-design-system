import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { randomBytes, randomUUID } from "node:crypto"
import {
  type AuthProvider,
  type AuthUpdate,
  type DaemonState,
  type PromptRecord,
  type PromptStatus,
  createInitialState,
  normalizeDaemonState,
} from "./types.js"

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
    const record: PromptRecord = {
      id: `prm_${randomUUID().slice(0, 12)}`,
      text: input.text,
      repo: input.repo ?? this.state.workspace.activeRepo,
      branch: input.branch ?? this.state.workspace.activeBranch,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      prUrl: null,
      error: null,
    }
    this.state.prompts.unshift(record)
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
    prompt.status = status
    prompt.updatedAt = new Date().toISOString()
    if (patch.prUrl !== undefined) prompt.prUrl = patch.prUrl
    if (patch.error !== undefined) prompt.error = patch.error
    await this.persist()
    return prompt
  }

  async setActiveRepo(repo: string | null, branch: string | null = null): Promise<void> {
    this.state.workspace.activeRepo = repo
    this.state.workspace.activeBranch = branch
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
}

export const STATE_FILE_PATH = DEFAULT_FILE
