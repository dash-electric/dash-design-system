/**
 * Clarification session store.
 *
 * In-memory primary with atomic JSON persistence to disk at
 *   ~/.dash-build/sessions/<promptId>.json
 *
 * Lifecycle: create → answer (one or many) → answered (all required filled)
 *                                          ↘ expire (TTL exceeded)
 *
 * Daemon (Agent B) holds a single SessionStore instance and injects it into
 * the HTTP routes (api-routes.ts).
 */

import { existsSync } from "node:fs"
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import type {
  ClarificationAnswer,
  ClarificationQuestion,
  ClarificationSession,
} from "./types.js"

const DEFAULT_SESSION_DIR = join(homedir(), ".dash-build", "sessions")

export interface SessionStoreOptions {
  /** Override storage directory (tests). */
  dir?: string
}

export class SessionStore {
  private sessions: Map<string, ClarificationSession> = new Map()
  private readonly dir: string

  constructor(opts: SessionStoreOptions = {}) {
    this.dir = opts.dir ?? DEFAULT_SESSION_DIR
  }

  /** Get the on-disk directory for inspection (tests / debug). */
  getDir(): string {
    return this.dir
  }

  async create(
    promptId: string,
    originalPrompt: string,
    questions: ClarificationQuestion[],
  ): Promise<ClarificationSession> {
    const session: ClarificationSession = {
      promptId,
      originalPrompt,
      questions,
      answers: {},
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    this.sessions.set(promptId, session)
    await this.persist(session)
    return session
  }

  async answer(
    promptId: string,
    questionId: string,
    answer: ClarificationAnswer,
  ): Promise<ClarificationSession> {
    const session = await this.requireSession(promptId)
    const question = session.questions.find((q) => q.id === questionId)
    if (!question) {
      throw new Error(`Unknown question id "${questionId}" in session ${promptId}`)
    }
    session.answers[questionId] = answer

    const allRequiredAnswered = session.questions
      .filter((q) => q.required)
      .every((q) => session.answers[q.id] !== undefined)

    if (allRequiredAnswered && session.status === "pending") {
      session.status = "answered"
    }

    await this.persist(session)
    return session
  }

  async get(promptId: string): Promise<ClarificationSession | null> {
    if (this.sessions.has(promptId)) {
      return this.sessions.get(promptId)!
    }
    // Try loading from disk (daemon restart case)
    const file = this.fileFor(promptId)
    if (!existsSync(file)) return null
    try {
      const raw = await readFile(file, "utf8")
      const session = JSON.parse(raw) as ClarificationSession
      this.sessions.set(promptId, session)
      return session
    } catch {
      return null
    }
  }

  /**
   * Expire pending sessions older than maxAgeMs. Default 30 minutes.
   * Returns the number of sessions transitioned to "expired".
   */
  async expire(maxAgeMs: number = 30 * 60_000): Promise<number> {
    const now = Date.now()
    let count = 0
    for (const session of this.sessions.values()) {
      if (session.status !== "pending") continue
      const age = now - new Date(session.createdAt).getTime()
      if (age > maxAgeMs) {
        session.status = "expired"
        await this.persist(session)
        count++
      }
    }
    return count
  }

  /** Forget a session (in-memory + disk). Used after generation completes. */
  async delete(promptId: string): Promise<void> {
    this.sessions.delete(promptId)
    const file = this.fileFor(promptId)
    if (existsSync(file)) {
      try {
        await unlink(file)
      } catch {
        // ignore — best-effort cleanup
      }
    }
  }

  /** Reload all session files from disk into memory (daemon boot). */
  async reload(): Promise<number> {
    if (!existsSync(this.dir)) return 0
    const entries = await readdir(this.dir)
    let loaded = 0
    for (const entry of entries) {
      if (!entry.endsWith(".json")) continue
      try {
        const raw = await readFile(join(this.dir, entry), "utf8")
        const session = JSON.parse(raw) as ClarificationSession
        this.sessions.set(session.promptId, session)
        loaded++
      } catch {
        // skip malformed file
      }
    }
    return loaded
  }

  private async requireSession(promptId: string): Promise<ClarificationSession> {
    const session = await this.get(promptId)
    if (!session) throw new Error(`No session ${promptId}`)
    return session
  }

  private fileFor(promptId: string): string {
    // Defensive: prevent path traversal via promptId
    const safe = promptId.replace(/[^A-Za-z0-9_-]/g, "_")
    return join(this.dir, `${safe}.json`)
  }

  private async persist(session: ClarificationSession): Promise<void> {
    await mkdir(this.dir, { recursive: true })
    const file = this.fileFor(session.promptId)
    const tmp = `${file}.tmp`
    await writeFile(tmp, JSON.stringify(session, null, 2), "utf8")
    await rename(tmp, file)
  }
}
