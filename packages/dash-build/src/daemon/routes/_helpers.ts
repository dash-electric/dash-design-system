import type { IncomingMessage, ServerResponse } from "node:http"

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
  })
  res.end(payload)
}

export function sendHtml(res: ServerResponse, status: number, html: string): void {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(html),
    "Cache-Control": "no-store",
  })
  res.end(html)
}

export function sendText(res: ServerResponse, status: number, text: string): void {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(text),
  })
  res.end(text)
}

export function sendRedirect(res: ServerResponse, location: string): void {
  res.writeHead(302, { Location: location })
  res.end()
}

export function notFound(res: ServerResponse): void {
  sendJson(res, 404, { ok: false, error: "not_found" })
}

export function methodNotAllowed(res: ServerResponse): void {
  sendJson(res, 405, { ok: false, error: "method_not_allowed" })
}

export function badRequest(res: ServerResponse, message: string): void {
  sendJson(res, 400, { ok: false, error: message })
}

/** Parse JSON body from a request, with a size cap to avoid abuse. */
export async function readJsonBody<T = unknown>(
  req: IncomingMessage,
  maxBytes = 1024 * 64,
): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    const chunks: Buffer[] = []
    let total = 0
    req.on("data", (chunk: Buffer) => {
      total += chunk.length
      if (total > maxBytes) {
        reject(new Error("payload_too_large"))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8")
      if (!raw) return resolve({} as T)
      try {
        resolve(JSON.parse(raw) as T)
      } catch {
        reject(new Error("invalid_json"))
      }
    })
    req.on("error", reject)
  })
}
