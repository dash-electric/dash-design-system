import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { scanBeCatalog } from "../be-endpoint-catalog.js"

let repoRoot: string

function w(filePath: string, content: string) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, "utf-8")
}

beforeEach(() => {
  repoRoot = mkdtempSync(path.join(tmpdir(), "dash-be-cat-"))
})

afterEach(() => {
  try {
    rmSync(repoRoot, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
})

describe("scanBeCatalog — empty repo", () => {
  it("returns an empty catalog with framework=none", async () => {
    const catalog = await scanBeCatalog(repoRoot)
    expect(catalog.endpoints).toEqual([])
    expect(catalog.framework).toBe("none")
    expect(catalog.totalEndpoints).toBe(0)
  })
})

describe("scanBeCatalog — Next Pages Router", () => {
  it("detects a single Pages Router endpoint with default GET method", async () => {
    w(
      path.join(repoRoot, "src/pages/api/health.ts"),
      `export default async function handler(req, res) {
  res.json({ ok: true })
}`,
    )
    const catalog = await scanBeCatalog(repoRoot)
    expect(catalog.framework).toBe("next-pages")
    expect(catalog.endpoints).toHaveLength(1)
    expect(catalog.endpoints[0]).toMatchObject({
      method: "GET",
      path: "/api/health",
      framework: "next-pages",
      handlerExport: "handler",
    })
  })

  it("enumerates multiple methods detected via req.method guards", async () => {
    w(
      path.join(repoRoot, "src/pages/api/drivers/[id].ts"),
      `export default async function handler(req, res) {
  if (req.method === "GET") { return res.json({}) }
  if (req.method === "POST") { return res.json({}) }
  if (req.method === "DELETE") { return res.status(204).end() }
}`,
    )
    const catalog = await scanBeCatalog(repoRoot)
    const methods = catalog.endpoints.map((e) => e.method).sort()
    expect(methods).toEqual(["DELETE", "GET", "POST"])
    expect(catalog.endpoints[0]!.path).toBe("/api/drivers/:id")
  })

  it("recognises catch-all routes via [...slug]", async () => {
    w(
      path.join(repoRoot, "src/pages/api/files/[...slug].ts"),
      `export default function handler(_req, res) { res.end() }`,
    )
    const catalog = await scanBeCatalog(repoRoot)
    expect(catalog.endpoints[0]!.path).toBe("/api/files/:slug")
  })
})

describe("scanBeCatalog — Next App Router", () => {
  it("detects per-method named exports", async () => {
    w(
      path.join(repoRoot, "src/app/api/users/route.ts"),
      `export async function GET() { return Response.json([]) }
export async function POST() { return Response.json({ id: 1 }) }`,
    )
    const catalog = await scanBeCatalog(repoRoot)
    expect(catalog.framework).toBe("next-app")
    expect(catalog.endpoints).toHaveLength(2)
    const paths = new Set(catalog.endpoints.map((e) => `${e.method} ${e.path}`))
    expect(paths).toContain("GET /api/users")
    expect(paths).toContain("POST /api/users")
  })

  it("strips route-groups from the URL", async () => {
    w(
      path.join(repoRoot, "src/app/(public)/api/login/route.ts"),
      `export async function POST() { return Response.json({}) }`,
    )
    const catalog = await scanBeCatalog(repoRoot)
    expect(catalog.endpoints[0]!.path).toBe("/api/login")
  })
})

describe("scanBeCatalog — Express", () => {
  it("detects router method calls", async () => {
    w(
      path.join(repoRoot, "src/routes/drivers.ts"),
      `import { Router } from "express"
const router = Router()

router.get("/drivers", listDrivers)
router.post("/drivers", createDriver)
router.put('/drivers/:id', updateDriver)
router.delete(\`/drivers/:id\`, deleteDriver)

export default router`,
    )
    const catalog = await scanBeCatalog(repoRoot)
    expect(catalog.framework).toBe("express")
    expect(catalog.endpoints.length).toBeGreaterThanOrEqual(4)
    const handlers = catalog.endpoints.map((e) => e.handlerExport).filter(Boolean)
    expect(handlers).toContain("listDrivers")
  })

  it("tolerates app.<method> calls in routes/ folder", async () => {
    w(
      path.join(repoRoot, "routes/index.js"),
      `app.post("/login", (req, res) => res.json({}))`,
    )
    const catalog = await scanBeCatalog(repoRoot)
    expect(catalog.endpoints).toHaveLength(1)
    expect(catalog.endpoints[0]!.method).toBe("POST")
  })
})

describe("scanBeCatalog — mixed + edge", () => {
  it("returns framework=mixed when more than one is present", async () => {
    w(
      path.join(repoRoot, "src/pages/api/ping.ts"),
      `export default function (_, res) { res.end() }`,
    )
    w(
      path.join(repoRoot, "src/app/api/pong/route.ts"),
      `export async function GET() { return Response.json({}) }`,
    )
    const catalog = await scanBeCatalog(repoRoot)
    expect(catalog.framework).toBe("mixed")
    expect(catalog.totalEndpoints).toBe(2)
  })

  it("skips node_modules + .next + dist", async () => {
    w(
      path.join(repoRoot, "node_modules/foo/src/pages/api/x.ts"),
      `export default () => null`,
    )
    w(
      path.join(repoRoot, ".next/src/app/api/y/route.ts"),
      `export async function GET() {}`,
    )
    const catalog = await scanBeCatalog(repoRoot)
    expect(catalog.framework).toBe("none")
  })

  it("handles malformed files without throwing", async () => {
    w(
      path.join(repoRoot, "src/pages/api/broken.ts"),
      "this is { not valid typescript {{{",
    )
    const catalog = await scanBeCatalog(repoRoot)
    // File still indexed (filename → URL works), method defaults to GET.
    expect(catalog.endpoints).toHaveLength(1)
    expect(catalog.endpoints[0]!.method).toBe("GET")
  })
})
