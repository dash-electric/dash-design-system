/**
 * HTTP routes for sandboxed preview.
 *
 *   GET    /preview/:promptId            → HTML shell (renderShell)
 *   GET    /preview/:promptId/bundle.js  → bundled JS from temp dir
 *   DELETE /preview/:promptId            → cleanup temp dir
 *
 * Wire from `router.ts`:
 *
 *   if (pathname.startsWith("/preview/")) {
 *     return handlePreviewRoute(req, res, pathname)
 *   }
 *
 * All responses set the CSP header in addition to the shell's meta tag —
 * double-layer because some browsers honor only one when same-origin.
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import { promises as fs } from "node:fs"
import { buildCsp } from "./csp.js"
import { renderShell } from "./shell-renderer.js"
import { bundlePathFor } from "./bundler.js"
import { cleanupOne } from "./temp-dir.js"

function parsePath(pathname: string): { id: string; rest: string } | null {
  if (!pathname.startsWith("/preview/")) return null
  const rest = pathname.slice("/preview/".length)
  if (rest.length === 0) return null
  const slash = rest.indexOf("/")
  if (slash === -1) return { id: rest, rest: "" }
  return { id: rest.slice(0, slash), rest: rest.slice(slash + 1) }
}

export interface PreviewRouteDeps {
  /** Override temp root (tests). */
  rootDir?: string
}

export async function handlePreviewRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  deps: PreviewRouteDeps = {},
): Promise<void> {
  const parts = parsePath(pathname)
  if (!parts) {
    return send404(res)
  }

  // GET /preview/:id — shell HTML
  if (parts.rest === "") {
    if (req.method === "DELETE") {
      await cleanupOne(parts.id, deps.rootDir)
      res.writeHead(204, { "Cache-Control": "no-store" })
      res.end()
      return
    }
    if (req.method !== "GET") {
      return sendMethodNotAllowed(res)
    }
    const html = renderShell({ promptId: parts.id })
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": Buffer.byteLength(html),
      "Content-Security-Policy": buildCsp(),
      "X-Frame-Options": "SAMEORIGIN",
      "Cache-Control": "no-store",
    })
    res.end(html)
    return
  }

  // GET /preview/:id/bundle.js — bundled JS
  if (parts.rest === "bundle.js") {
    if (req.method !== "GET") {
      return sendMethodNotAllowed(res)
    }
    const file = bundlePathFor(parts.id, deps.rootDir)
    try {
      const buf = await fs.readFile(file)
      res.writeHead(200, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Content-Length": buf.length,
        "Content-Security-Policy": buildCsp(),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      })
      res.end(buf)
    } catch {
      return send404(res)
    }
    return
  }

  return send404(res)
}

function send404(res: ServerResponse): void {
  const body = JSON.stringify({ ok: false, error: "not_found" })
  res.writeHead(404, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  })
  res.end(body)
}

function sendMethodNotAllowed(res: ServerResponse): void {
  const body = JSON.stringify({ ok: false, error: "method_not_allowed" })
  res.writeHead(405, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  })
  res.end(body)
}
