/**
 * Component Preview HTTP routes.
 *
 *   POST /api/preview/component
 *     Body: { componentSource, dependencies?, mockData?, promptId? }
 *     200:  ComponentPreviewResponse  (Sandpack bundle ready to mount)
 *     400:  ComponentPreviewError     (banned import, missing source, etc)
 *
 *   GET  /api/preview/template/:id
 *     Serves a single template asset (id ∈ {App.tsx, index.tsx, dash-tokens.css,
 *     mocks.json, Component.tsx.placeholder}). Mostly for debugging — the
 *     POST endpoint already inlines these into the Sandpack `files` map.
 *
 * Wired from `router.ts`:
 *
 *   if (isPreviewApiPath(pathname)) {
 *     return handlePreviewApiRoute(req, res, pathname)
 *   }
 */

import type { IncomingMessage, ServerResponse } from "node:http"
import { promises as fs } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  badRequest,
  methodNotAllowed,
  notFound,
  readJsonBody,
  sendJson,
} from "../_helpers.js"
import {
  MAX_SOURCE_BYTES,
  renderComponentPreview,
  type ComponentPreviewRequest,
} from "../../../services/component-preview.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TEMPLATE_DIR = resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "preview-template",
)

const ALLOWED_TEMPLATE_FILES = new Set([
  "App.tsx",
  "index.tsx",
  "dash-tokens.css",
  "mocks.json",
  "Component.tsx.placeholder",
])

const TEMPLATE_MIME: Record<string, string> = {
  ".tsx": "text/plain; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".placeholder": "text/plain; charset=utf-8",
}

export function isPreviewApiPath(pathname: string): boolean {
  return (
    pathname === "/api/preview/component" ||
    pathname.startsWith("/api/preview/template/")
  )
}

export async function handlePreviewApiRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<void> {
  if (pathname === "/api/preview/component") {
    return handleComponentRender(req, res)
  }

  if (pathname.startsWith("/api/preview/template/")) {
    return handleTemplateAsset(req, res, pathname)
  }

  return notFound(res)
}

async function handleComponentRender(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== "POST") return methodNotAllowed(res)

  let body: ComponentPreviewRequest
  try {
    body = await readJsonBody<ComponentPreviewRequest>(
      req,
      MAX_SOURCE_BYTES + 8 * 1024,
    )
  } catch (err) {
    const msg = (err as Error).message
    if (msg === "payload_too_large") {
      return sendJson(res, 413, { ok: false, error: "payload_too_large" })
    }
    if (msg === "invalid_json") {
      return badRequest(res, "invalid_json")
    }
    return badRequest(res, msg)
  }

  if (!body || typeof body.componentSource !== "string") {
    return badRequest(res, "component_source_required")
  }

  const result = await renderComponentPreview(body)
  if (!result.ok) {
    const status = result.error === "payload_too_large" ? 413 : 400
    return sendJson(res, status, result)
  }
  return sendJson(res, 200, result)
}

async function handleTemplateAsset(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<void> {
  if (req.method !== "GET") return methodNotAllowed(res)
  const id = pathname.slice("/api/preview/template/".length)
  if (!id || id.includes("/") || id.includes("..")) {
    return notFound(res)
  }
  if (!ALLOWED_TEMPLATE_FILES.has(id)) {
    return notFound(res)
  }

  const filePath = join(TEMPLATE_DIR, id)
  try {
    const buf = await fs.readFile(filePath)
    const ext = id.slice(id.lastIndexOf("."))
    res.writeHead(200, {
      "Content-Type": TEMPLATE_MIME[ext] ?? "application/octet-stream",
      "Content-Length": buf.length,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    })
    res.end(buf)
  } catch {
    return notFound(res)
  }
}
