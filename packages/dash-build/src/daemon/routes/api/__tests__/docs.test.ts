/**
 * Doc autocomplete + body endpoint tests.
 *
 * Exercises the route surface (path matcher + GET handler) without booting
 * the full HTTP server. Uses a hermetic temp doc dir so the real vault is
 * never scanned.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { IncomingMessage, ServerResponse } from "node:http"
import { handleDocsRoute, isDocsApiPath } from "../docs.js"
import { queryDocs, resetDocIndexCache } from "../../../../services/doc-index.js"

let workDir: string
let originalEnv: string | undefined

interface ResponseSpy extends ServerResponse {
  __status?: number
  __body?: string
}

function mockResponse(): ResponseSpy {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, unknown>,
    writeHead(status: number, headers?: Record<string, unknown>) {
      this.__status = status
      if (headers) this.headers = headers
      return this
    },
    end(body?: string | Buffer) {
      this.__body = typeof body === "string" ? body : body?.toString("utf8")
    },
  } as unknown as ResponseSpy
  return res
}

function mockRequest(method: string): IncomingMessage {
  return { method } as IncomingMessage
}

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-docs-api-"))
  await mkdir(join(workDir, "specs"), { recursive: true })
  await writeFile(
    join(workDir, "specs", "mitra-prd.md"),
    "# Mitra PRD\n\nMitra suspension rules: 3 dispatch missed.\n",
    "utf8",
  )
  await writeFile(
    join(workDir, "payroll.md"),
    "# Payroll\n\nWeekly payroll cycle.\n",
    "utf8",
  )
  originalEnv = process.env.DASH_BUILD_DOC_ROOTS
  process.env.DASH_BUILD_DOC_ROOTS = workDir
  resetDocIndexCache()
})

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true })
  if (originalEnv === undefined) {
    delete process.env.DASH_BUILD_DOC_ROOTS
  } else {
    process.env.DASH_BUILD_DOC_ROOTS = originalEnv
  }
  resetDocIndexCache()
})

describe("isDocsApiPath", () => {
  it("matches the list endpoint", () => {
    expect(isDocsApiPath("/api/docs")).toBe(true)
  })

  it("matches the body endpoint with a valid hex id", () => {
    expect(isDocsApiPath("/api/docs/abcdef0123456789")).toBe(true)
  })

  it("rejects malformed body endpoints", () => {
    expect(isDocsApiPath("/api/docs/")).toBe(false)
    expect(isDocsApiPath("/api/docs/short")).toBe(false)
    expect(isDocsApiPath("/api/docs/abc!def")).toBe(false)
    expect(isDocsApiPath("/api/docs/abcdef0123456789/extra")).toBe(false)
  })

  it("does not match unrelated paths", () => {
    expect(isDocsApiPath("/api/doc")).toBe(false)
    expect(isDocsApiPath("/api/docsx")).toBe(false)
  })
})

describe("handleDocsRoute — GET /api/docs", () => {
  it("returns the autocomplete list filtered by q", async () => {
    const res = mockResponse()
    await handleDocsRoute(mockRequest("GET"), res, "/api/docs", "/api/docs?q=mitra")
    expect(res.__status).toBe(200)
    const parsed = JSON.parse(res.__body!)
    expect(parsed.ok).toBe(true)
    expect(parsed.docs.length).toBeGreaterThan(0)
    expect(parsed.docs[0].name).toContain("mitra")
    // The response shape must NOT leak the absolute path.
    expect(parsed.docs[0].absPath).toBeUndefined()
    expect(parsed.docs[0].rootIndex).toBeUndefined()
  })

  it("honours the limit query param", async () => {
    const res = mockResponse()
    await handleDocsRoute(mockRequest("GET"), res, "/api/docs", "/api/docs?limit=1")
    const parsed = JSON.parse(res.__body!)
    expect(parsed.docs).toHaveLength(1)
  })

  it("returns an empty list when nothing matches", async () => {
    const res = mockResponse()
    await handleDocsRoute(mockRequest("GET"), res, "/api/docs", "/api/docs?q=zzznomatch")
    const parsed = JSON.parse(res.__body!)
    expect(parsed.ok).toBe(true)
    expect(parsed.docs).toEqual([])
  })

  it("returns 405 for non-GET methods", async () => {
    const res = mockResponse()
    await handleDocsRoute(mockRequest("POST"), res, "/api/docs", "/api/docs")
    expect(res.__status).toBe(405)
  })
})

describe("handleDocsRoute — GET /api/docs/:id", () => {
  it("returns the full body for a known id", async () => {
    const list = await queryDocs({ q: "mitra" })
    const id = list[0]!.id
    const res = mockResponse()
    await handleDocsRoute(mockRequest("GET"), res, `/api/docs/${id}`, `/api/docs/${id}`)
    expect(res.__status).toBe(200)
    const parsed = JSON.parse(res.__body!)
    expect(parsed.ok).toBe(true)
    expect(parsed.doc.body).toContain("3 dispatch missed")
    expect(parsed.doc.path).toContain("mitra-prd")
  })

  it("returns 404 for unknown but well-formed ids", async () => {
    const res = mockResponse()
    await handleDocsRoute(
      mockRequest("GET"),
      res,
      "/api/docs/deadbeefdeadbeef",
      "/api/docs/deadbeefdeadbeef",
    )
    expect(res.__status).toBe(404)
  })

  it("returns 404 for malformed paths (caught by router matcher)", async () => {
    const res = mockResponse()
    // We bypass the matcher to confirm the handler defends in depth.
    await handleDocsRoute(mockRequest("GET"), res, "/api/docs/!!!", "/api/docs/!!!")
    expect(res.__status).toBe(404)
  })
})
