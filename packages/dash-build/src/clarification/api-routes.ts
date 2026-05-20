/**
 * HTTP routes for the clarification flow.
 *
 * Designed to be mounted by the daemon (Agent B). The daemon owns the
 * http.Server instance and a single SessionStore; it calls
 *   registerClarificationRoutes(server, store)
 * during boot.
 *
 * Routes:
 *   GET  /api/clarification/:promptId            → session JSON
 *   GET  /api/clarification/:promptId/form       → rendered HTML form
 *   POST /api/clarification/:promptId/answer     → { questionId, answer }
 *   POST /api/clarification/:promptId/skip       → user opts out, generate anyway
 *
 * Plain node:http — no framework dependency added.
 */

import type { IncomingMessage, Server, ServerResponse } from "node:http"
import { renderClarificationForm } from "./form-renderer.js"
import type { SessionStore } from "./session-store.js"
import type { ClarificationAnswer } from "./types.js"

const ROUTE_PREFIX = "/api/clarification/"

export interface RegisterOptions {
  /** Called when a session transitions to answered or skipped. */
  onComplete?: (
    promptId: string,
    outcome: "answered" | "skipped",
  ) => void | Promise<void>
}

export function registerClarificationRoutes(
  server: Server,
  store: SessionStore,
  opts: RegisterOptions = {},
): void {
  server.on("request", async (req, res) => {
    const url = req.url ?? ""
    if (!url.startsWith(ROUTE_PREFIX)) return
    // If a previous listener already responded, bail.
    if (res.headersSent || res.writableEnded) return

    try {
      await handleRequest(req, res, store, opts)
    } catch (err) {
      if (!res.headersSent) {
        sendJson(res, 500, {
          error: "internal",
          message: err instanceof Error ? err.message : String(err),
        })
      }
    }
  })
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  store: SessionStore,
  opts: RegisterOptions,
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://localhost")
  const parts = url.pathname.slice(ROUTE_PREFIX.length).split("/").filter(Boolean)
  const [promptId, action] = parts

  if (!promptId) {
    sendJson(res, 400, { error: "missing_prompt_id" })
    return
  }

  // GET /:promptId → session JSON
  if (req.method === "GET" && !action) {
    const session = await store.get(promptId)
    if (!session) {
      sendJson(res, 404, { error: "not_found" })
      return
    }
    sendJson(res, 200, session)
    return
  }

  // GET /:promptId/form → HTML form
  if (req.method === "GET" && action === "form") {
    const session = await store.get(promptId)
    if (!session) {
      sendHtml(res, 404, "<h1>Session not found</h1>")
      return
    }
    sendHtml(res, 200, renderClarificationForm(session))
    return
  }

  // POST /:promptId/answer → record answer
  if (req.method === "POST" && action === "answer") {
    const body = await readJson<{
      questionId: string
      answer: ClarificationAnswer
    }>(req)
    if (!body || typeof body.questionId !== "string") {
      sendJson(res, 400, { error: "bad_body" })
      return
    }
    const session = await store.answer(promptId, body.questionId, body.answer)
    if (session.status === "answered" && opts.onComplete) {
      await opts.onComplete(promptId, "answered")
    }
    sendJson(res, 200, session)
    return
  }

  // POST /:promptId/skip → mark skipped, generate anyway
  if (req.method === "POST" && action === "skip") {
    const session = await store.get(promptId)
    if (!session) {
      sendJson(res, 404, { error: "not_found" })
      return
    }
    // Skipping doesn't mutate persisted status — daemon decides what to do.
    if (opts.onComplete) await opts.onComplete(promptId, "skipped")
    sendJson(res, 200, { ok: true, skipped: true })
    return
  }

  sendJson(res, 404, { error: "no_route" })
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader("content-type", "application/json; charset=utf-8")
  res.end(JSON.stringify(body))
}

function sendHtml(res: ServerResponse, status: number, body: string): void {
  res.statusCode = status
  res.setHeader("content-type", "text/html; charset=utf-8")
  res.end(body)
}

async function readJson<T>(req: IncomingMessage): Promise<T | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8")
        resolve(raw ? (JSON.parse(raw) as T) : null)
      } catch {
        resolve(null)
      }
    })
    req.on("error", () => resolve(null))
  })
}
