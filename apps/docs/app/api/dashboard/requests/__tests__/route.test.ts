/**
 * Vitest suite for /api/dashboard/requests endpoints.
 *
 * We invoke the route handlers directly (no Next dev server) by importing
 * the exported HTTP-method functions and feeding them a minimal NextRequest
 * stub. This keeps the tests fast and dependency-free.
 *
 * Isolation: each suite gets its own tmpdir via `DASH_DASHBOARD_DATA_DIR`
 * so the file backend writes to scratch space, not the repo's actual data/.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { NextRequest } from "next/server"
import { resetStoreForTests } from "@/lib/dashboard-store"

const VALID_TOKEN = "test-ceo-token-abc123"

let tmpDir: string
let origCwd: string
let origToken: string | undefined
let origBackend: string | undefined
let origDataDir: string | undefined

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dash-dashboard-test-"))
  origCwd = process.cwd()
  origToken = process.env.DASH_CEO_TOKEN
  origBackend = process.env.DASH_STORE_BACKEND
  origDataDir = process.env.DASH_DASHBOARD_DATA_DIR
  // Setting DASH_CEO_TOKEN forces auth in all NODE_ENVs (dev bypass only
  // applies when the token is unset), so we don't need to touch NODE_ENV.
  process.env.DASH_CEO_TOKEN = VALID_TOKEN
  process.env.DASH_STORE_BACKEND = "file"
  process.env.DASH_DASHBOARD_DATA_DIR = tmpDir
  resetStoreForTests()
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
  if (origToken === undefined) delete process.env.DASH_CEO_TOKEN
  else process.env.DASH_CEO_TOKEN = origToken
  if (origBackend === undefined) delete process.env.DASH_STORE_BACKEND
  else process.env.DASH_STORE_BACKEND = origBackend
  if (origDataDir === undefined) delete process.env.DASH_DASHBOARD_DATA_DIR
  else process.env.DASH_DASHBOARD_DATA_DIR = origDataDir
  resetStoreForTests()
  process.chdir(origCwd)
})

function req(
  url: string,
  init: { method?: string; body?: unknown; token?: string | null } = {},
): NextRequest {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  }
  if (init.token !== null) {
    headers["authorization"] = `Bearer ${init.token ?? VALID_TOKEN}`
  }
  const reqInit: { method: string; headers: Record<string, string>; body?: string } = {
    method: init.method ?? "GET",
    headers,
  }
  if (init.body !== undefined) {
    reqInit.body = typeof init.body === "string" ? init.body : JSON.stringify(init.body)
  }
  return new NextRequest(new URL(url, "http://localhost"), reqInit)
}

describe("GET /api/dashboard/requests", () => {
  it("returns empty array on empty queue", async () => {
    const { GET } = await import("../route")
    const res = await GET(req("/api/dashboard/requests"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.entries).toEqual([])
    expect(body.count).toBe(0)
  })

  it("returns 401 when Authorization header missing", async () => {
    const { GET } = await import("../route")
    const res = await GET(req("/api/dashboard/requests", { token: null }))
    expect(res.status).toBe(401)
  })

  it("returns 401 when token is wrong", async () => {
    const { GET } = await import("../route")
    const res = await GET(
      req("/api/dashboard/requests", { token: "wrong-token" }),
    )
    expect(res.status).toBe(401)
  })

  it("filters by status", async () => {
    const { POST, GET } = await import("../route")
    await POST(
      req("/api/dashboard/requests", {
        method: "POST",
        body: { description: "missing image editor", severity: "high" },
      }),
    )
    await POST(
      req("/api/dashboard/requests", {
        method: "POST",
        body: { description: "missing toast variant", status: "synced" },
      }),
    )
    const res = await GET(req("/api/dashboard/requests?status=synced"))
    const body = await res.json()
    expect(body.count).toBe(1)
    expect(body.entries[0].description).toBe("missing toast variant")
  })
})

describe("POST /api/dashboard/requests", () => {
  it("201 on valid single create and persists the entry", async () => {
    const { POST, GET } = await import("../route")
    const res = await POST(
      req("/api/dashboard/requests", {
        method: "POST",
        body: { description: "no canvas component", severity: "medium" },
      }),
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.entry.id).toBeTruthy()
    expect(body.entry.description).toBe("no canvas component")
    expect(body.entry.status).toBe("pending")

    const listRes = await GET(req("/api/dashboard/requests"))
    const listBody = await listRes.json()
    expect(listBody.count).toBe(1)
  })

  it("400 on missing description", async () => {
    const { POST } = await import("../route")
    const res = await POST(
      req("/api/dashboard/requests", {
        method: "POST",
        body: { severity: "high" },
      }),
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/description/i)
  })

  it("400 on invalid severity", async () => {
    const { POST } = await import("../route")
    const res = await POST(
      req("/api/dashboard/requests", {
        method: "POST",
        body: { description: "foo", severity: "critical" },
      }),
    )
    expect(res.status).toBe(400)
  })

  it("supports bulk create via { entries: [...] }", async () => {
    const { POST, GET } = await import("../route")
    const res = await POST(
      req("/api/dashboard/requests", {
        method: "POST",
        body: {
          entries: [
            { description: "one", severity: "low" },
            { description: "two", severity: "medium" },
            { description: "three", severity: "high" },
          ],
        },
      }),
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.count).toBe(3)
    const listRes = await GET(req("/api/dashboard/requests"))
    const listBody = await listRes.json()
    expect(listBody.count).toBe(3)
  })

  it("401 when token missing", async () => {
    const { POST } = await import("../route")
    const res = await POST(
      req("/api/dashboard/requests", {
        method: "POST",
        body: { description: "x" },
        token: null,
      }),
    )
    expect(res.status).toBe(401)
  })
})

describe("GET/PATCH /api/dashboard/requests/[id]", () => {
  it("404 on non-existent id", async () => {
    const { GET } = await import("../[id]/route")
    const res = await GET(
      req("/api/dashboard/requests/missing"),
      { params: Promise.resolve({ id: "missing" }) },
    )
    expect(res.status).toBe(404)
  })

  it("PATCH updates status", async () => {
    const create = await import("../route")
    const created = await create.POST(
      req("/api/dashboard/requests", {
        method: "POST",
        body: { description: "patch me", severity: "low" },
      }),
    )
    const createdBody = await created.json()
    const id: string = createdBody.entry.id

    const { PATCH } = await import("../[id]/route")
    const res = await PATCH(
      req(`/api/dashboard/requests/${id}`, {
        method: "PATCH",
        body: { status: "vendored", notes: "shipped in DS v0.3" },
      }),
      { params: Promise.resolve({ id }) },
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.entry.status).toBe("vendored")
    expect(body.entry.notes).toBe("shipped in DS v0.3")
  })

  it("PATCH 404 on non-existent id", async () => {
    const { PATCH } = await import("../[id]/route")
    const res = await PATCH(
      req("/api/dashboard/requests/nope", {
        method: "PATCH",
        body: { status: "declined" },
      }),
      { params: Promise.resolve({ id: "nope" }) },
    )
    expect(res.status).toBe(404)
  })
})

describe("DELETE /api/dashboard/requests (bulk)", () => {
  it("removes the specified ids and returns count", async () => {
    const { POST, DELETE, GET } = await import("../route")
    const ids: string[] = []
    for (const desc of ["a", "b", "c"]) {
      const r = await POST(
        req("/api/dashboard/requests", {
          method: "POST",
          body: { description: desc, severity: "low" },
        }),
      )
      const b = await r.json()
      ids.push(b.entry.id)
    }
    const delRes = await DELETE(
      req("/api/dashboard/requests", {
        method: "DELETE",
        body: { ids: [ids[0], ids[2]] },
      }),
    )
    expect(delRes.status).toBe(200)
    const delBody = await delRes.json()
    expect(delBody.removed).toBe(2)

    const listRes = await GET(req("/api/dashboard/requests"))
    const listBody = await listRes.json()
    expect(listBody.count).toBe(1)
    expect(listBody.entries[0].id).toBe(ids[1])
  })

  it("400 on empty ids array", async () => {
    const { DELETE } = await import("../route")
    const res = await DELETE(
      req("/api/dashboard/requests", {
        method: "DELETE",
        body: { ids: [] },
      }),
    )
    expect(res.status).toBe(400)
  })
})

describe("POST /api/dashboard/requests/[id]/generate", () => {
  it("flips status to processing and returns 202", async () => {
    const { POST: createPost } = await import("../route")
    const created = await createPost(
      req("/api/dashboard/requests", {
        method: "POST",
        body: { description: "generate me", severity: "high" },
      }),
    )
    const { entry } = await created.json()

    const { POST } = await import("../[id]/generate/route")
    const res = await POST(
      req(`/api/dashboard/requests/${entry.id}/generate`, {
        method: "POST",
      }),
      { params: Promise.resolve({ id: entry.id }) },
    )
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body.entry.status).toBe("processing")
    expect(body.queued).toBe(true)

    // Sidecar pending file should now list the id.
    const pendingPath = path.join(tmpDir, "pending-generation.json")
    expect(fs.existsSync(pendingPath)).toBe(true)
    const pending = JSON.parse(fs.readFileSync(pendingPath, "utf-8")) as string[]
    expect(pending).toContain(entry.id)
  })

  it("404 on non-existent id", async () => {
    const { POST } = await import("../[id]/generate/route")
    const res = await POST(
      req("/api/dashboard/requests/nope/generate", { method: "POST" }),
      { params: Promise.resolve({ id: "nope" }) },
    )
    expect(res.status).toBe(404)
  })
})

describe("POST /api/dashboard/requests/merge", () => {
  it("keeps one, deletes duplicates", async () => {
    const { POST: createPost } = await import("../route")
    const ids: string[] = []
    for (const desc of ["dup1", "dup2", "dup3"]) {
      const r = await createPost(
        req("/api/dashboard/requests", {
          method: "POST",
          body: { description: desc, severity: "medium" },
        }),
      )
      const b = await r.json()
      ids.push(b.entry.id)
    }
    const { POST } = await import("../merge/route")
    const res = await POST(
      req("/api/dashboard/requests/merge", {
        method: "POST",
        body: { keepId: ids[0], duplicateIds: [ids[1], ids[2]] },
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.kept.id).toBe(ids[0])
    expect(body.mergedCount).toBe(2)
  })
})

describe("audit log", () => {
  it("appends a JSONL line per request", async () => {
    const { GET } = await import("../route")
    await GET(req("/api/dashboard/requests"))
    await GET(req("/api/dashboard/requests", { token: "wrong" }))

    const logPath = path.join(tmpDir, "audit-log.jsonl")
    expect(fs.existsSync(logPath)).toBe(true)
    const lines = fs
      .readFileSync(logPath, "utf-8")
      .trim()
      .split("\n")
      .filter(Boolean)
    expect(lines.length).toBeGreaterThanOrEqual(2)
    const parsed = lines.map((l) => JSON.parse(l))
    expect(parsed.some((p) => p.ok === true)).toBe(true)
    expect(parsed.some((p) => p.ok === false && p.status === 401)).toBe(true)
  })
})
