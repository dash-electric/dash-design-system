import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { startDaemon, type RunningDaemon } from "../server.js"

let daemon: RunningDaemon
let baseUrl: string
let workDir: string
let oldDashRoot: string | undefined

beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-routes-"))
  oldDashRoot = process.env.DASH_BUILD_DASH_ROOT
  process.env.DASH_BUILD_DASH_ROOT = workDir
  daemon = await startDaemon({
    port: 0, // OS-assigned free port
    host: "127.0.0.1",
    statePath: join(workDir, "state.json"),
    writePid: false,
    enablePipeline: false,
  })
  const addr = daemon.server.address()
  const port =
    typeof addr === "object" && addr ? addr.port : daemon.port
  baseUrl = `http://127.0.0.1:${port}`
})

afterAll(async () => {
  await daemon.close()
  await rm(workDir, { recursive: true, force: true })
  if (oldDashRoot === undefined) {
    delete process.env.DASH_BUILD_DASH_ROOT
  } else {
    process.env.DASH_BUILD_DASH_ROOT = oldDashRoot
  }
})

describe("HTTP routes", () => {
  it("GET /health returns 200 with ok=true", async () => {
    const r = await fetch(`${baseUrl}/health`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(typeof body.uptime).toBe("number")
    expect(body.version).toBeTruthy()
  })

  it("GET /api/status returns auth + workspace + prompts shape", async () => {
    const r = await fetch(`${baseUrl}/api/status`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.auth).toBeDefined()
    expect(body.workspace).toBeDefined()
    expect(Array.isArray(body.prompts.recent)).toBe(true)
  })

  it("GET / renders the Lovable home shell", async () => {
    const r = await fetch(`${baseUrl}/`)
    expect(r.status).toBe(200)
    expect(r.headers.get("content-type")).toMatch(/text\/html/)
    const html = await r.text()
    expect(html).toContain("db-sidebar")
    expect(html).toContain("db-home-shell")
    expect(html).toContain("Let's build something")
  })

  it("GET /workspace/:runId renders the chat workspace + preview mount", async () => {
    const r = await fetch(`${baseUrl}/workspace/run-abc`)
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain("db-workspace-shell")
    // Integration step 2026-05-28: hand-written placeholder swapped for
    // renderPreviewPanel — exposes db-preview-panel wrapper + db-preview-sandpack
    // mount consumed by client preview-mount.js.
    expect(html).toContain('id="db-preview-panel"')
    expect(html).toContain('id="db-preview-sandpack"')
    expect(html).toContain('data-component-id="run-abc"')
  })

  it("GET /dashboard returns HTML", async () => {
    const r = await fetch(`${baseUrl}/dashboard`)
    expect(r.status).toBe(200)
    expect(r.headers.get("content-type")).toMatch(/text\/html/)
    const html = await r.text()
    expect(html).toContain("Dash Build")
    // Dashboard chrome always renders, regardless of auth state.
    expect(html).toContain("db-ws-indicator")
    expect(html).toContain("db-prompts-region")
  })

  it("GET /static/app.css returns CSS", async () => {
    const r = await fetch(`${baseUrl}/static/app.css`)
    expect(r.status).toBe(200)
    expect(r.headers.get("content-type")).toMatch(/text\/css/)
  })

  it("GET /static/app.js returns JS", async () => {
    const r = await fetch(`${baseUrl}/static/app.js`)
    expect(r.status).toBe(200)
    expect(r.headers.get("content-type")).toMatch(/javascript/)
  })

  it("GET /unknown returns 404 JSON", async () => {
    const r = await fetch(`${baseUrl}/totally-unknown`)
    expect(r.status).toBe(404)
    const body = await r.json()
    expect(body.ok).toBe(false)
  })

  it("POST /api/prompt creates a prompt and echoes id", async () => {
    const r = await fetch(`${baseUrl}/api/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "add chart payroll backoffice" }),
    })
    expect(r.status).toBe(201)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.id).toMatch(/^prm_/)
    expect(body.status).toBe("queued")
  })

  it("POST /api/prompt without text returns 400", async () => {
    const r = await fetch(`${baseUrl}/api/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    expect(r.status).toBe(400)
  })

  it("POST /api/prompts/reset clears local prompt history and keeps workspace", async () => {
    await daemon.store.setActiveRepo("dash/backoffice", "main")
    const created = await fetch(`${baseUrl}/api/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "temporary reset test" }),
    })
    expect(created.status).toBe(201)
    expect(daemon.store.getPrompts(10).length).toBeGreaterThan(0)

    const r = await fetch(`${baseUrl}/api/prompts/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keepWorkspace: true }),
    })
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.removed).toBeGreaterThan(0)
    expect(daemon.store.getPrompts(10)).toEqual([])
    expect(daemon.store.getWorkspace()).toMatchObject({
      activeRepo: "dash/backoffice",
      activeBranch: "main",
    })
  })

  it("GET /api/repos returns repo list", async () => {
    const r = await fetch(`${baseUrl}/api/repos`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(Array.isArray(body.repos)).toBe(true)
    expect(body.repos[0]?.full_name).toBeTruthy()
    expect(body.mode).toBe("local-test")
    expect(body.repos.map((repo: { full_name: string }) => repo.full_name)).toEqual([
      "dash/portal-v2",
      "dash/backoffice",
    ])
    expect(body.repos[0]).toMatchObject({
      id: "dash/portal-v2",
      label: "Portal v2",
      surface: "Consumer ride portal",
      theme: "ride",
      defaultRoute: "/en/deliveries",
    })
  })

  it("GET /api/repos filters unsupported GitHub repo outliers", async () => {
    await daemon.store.setAuth("github", {
      connected: true,
      repos: ["dash/halo-dash-fe", "dash/portal-v2", "dash/backoffice"],
    })
    try {
      const r = await fetch(`${baseUrl}/api/repos`)
      expect(r.status).toBe(200)
      const body = await r.json()
      expect(body.mode).toBe("github-app")
      expect(body.repos.map((repo: { full_name: string }) => repo.full_name)).toEqual([
        "dash/portal-v2",
        "dash/backoffice",
      ])
    } finally {
      await daemon.store.setAuth("github", { connected: false, repos: [] })
    }
  })

  it("POST /api/repos persists active local test repo", async () => {
    const r = await fetch(`${baseUrl}/api/repos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo: "dash/backoffice", branch: "main" }),
    })
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(daemon.store.getWorkspace().activeRepo).toBe("dash/backoffice")
  })

  it("POST /api/repos rejects unsupported repos", async () => {
    const r = await fetch(`${baseUrl}/api/repos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo: "dash/halo-dash-fe", branch: "main" }),
    })
    expect(r.status).toBe(400)
  })

  it("GET /api/repo-preview returns structured baseline backed by the default online URL", async () => {
    // Phase D online URL refactor: backoffice ships an `onlineUrl` default
    // pointing at staging, so the preview short-circuits to status="running"
    // with sourceMode="online-default" instead of probing the local dev
    // server. The metadata + baseline shell stay the same — only the
    // resolved status changes.
    const r = await fetch(`${baseUrl}/api/repo-preview?repo=dash/backoffice`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.preview.status).toBe("running")
    expect(body.preview.sourceMode).toBe("online-default")
    expect(body.preview.metadata).toMatchObject({
      id: "dash/backoffice",
      label: "Backoffice",
      surface: "Internal operations console",
      theme: "ride",
      defaultRoute: "/delivery",
      auth: expect.objectContaining({
        mode: "preview-harness-required",
      }),
    })
    expect(body.preview.baseline).toMatchObject({
      repo: "dash/backoffice",
      label: "Backoffice",
      previewMode: "local-dev",
    })
    expect(body.preview.baseline.shell.nav).toContain("Mitra")
    // Real-iframe path: rendered HTML embeds the staging URL + honest auth
    // note instead of the synthetic baseline-shell fallback.
    expect(body.html).toContain("<iframe")
    expect(body.html).toContain("stg-back-office.dashelectric.co")
    expect(body.html).toContain("Preview harness required")
  })

  it("GET /api/repo-preview rejects unsupported repos", async () => {
    const r = await fetch(`${baseUrl}/api/repo-preview?repo=dash/halo-dash-fe`)
    expect(r.status).toBe(404)
    const body = await r.json()
    expect(body.ok).toBe(false)
    expect(body.preview).toBeNull()
  })

  it("GET /api/repo-preview returns sandbox-clone when state=clone_running", async () => {
    // F2 resolver priority: sandbox-clone outranks env / manifest onlineUrl
    // / local-dev. When the workspace bootstrap (F1) reports clone_running
    // with a live devServerPort, the resolver must point the canvas at the
    // local clone so the auth-bypass shim takes effect.
    //
    // We monkey-patch the store's getSandboxState so we don't need to import
    // F1's not-yet-landed `clone_running` state value or `devServerPort`
    // field. The resolver duck-types both, so any record matching the shape
    // takes precedence regardless of the persisted SandboxStateValue enum.
    const originalGetSandboxState = (
      daemon.store as unknown as { getSandboxState?: unknown }
    ).getSandboxState
    ;(daemon.store as unknown as Record<string, unknown>).getSandboxState = (
      slug: string,
    ) =>
      slug === "dash/backoffice"
        ? { state: "clone_running", devServerPort: 3101 }
        : null

    try {
      const r = await fetch(`${baseUrl}/api/repo-preview?repo=dash/backoffice`)
      expect(r.status).toBe(200)
      const body = await r.json()
      expect(body.ok).toBe(true)
      expect(body.preview.status).toBe("running")
      expect(body.preview.sourceMode).toBe("sandbox-clone")
      expect(body.preview.url).toBe("http://127.0.0.1:3101/delivery")
      expect(body.preview.port).toBe(3101)
      // Rendered HTML drops the yellow auth note (shim bypasses auth) and
      // swaps to the success-toned clone ribbon variant.
      expect(body.html).toContain("db-baseline-ribbon--clone")
      expect(body.html).toContain('data-clone-preview="dash/backoffice"')
      expect(body.html).not.toContain("db-baseline-auth-note")
      // Iframe points at the local clone, not staging.
      expect(body.html).toContain("127.0.0.1:3101")
      expect(body.html).not.toContain('src="https://stg-back-office')
    } finally {
      if (originalGetSandboxState === undefined) {
        delete (daemon.store as unknown as Record<string, unknown>).getSandboxState
      } else {
        ;(daemon.store as unknown as Record<string, unknown>).getSandboxState =
          originalGetSandboxState
      }
    }
  })

  it("dashboard allows local generation with OpenAI only", async () => {
    await daemon.store.setAuth("openai", { connected: true, user: "byo-key" })
    const r = await fetch(`${baseUrl}/dashboard`)
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain("db-prompt-input")
    expect(html).not.toContain("Install the Dash Build GitHub App")
  })
})
