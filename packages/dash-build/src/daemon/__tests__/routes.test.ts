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

  // Bug A regression (2026-05-28): /workspace/:runId used to render two tab
  // strips stacked — one from workspace.ts (`db-workspace-tabs`) and one
  // from preview-panel.ts (`db-preview-tablist`). The panel now owns only
  // the tabpanels; the strip lives on the workspace shell. Assert exactly
  // one strip is present.
  it("GET /workspace/:runId renders exactly one tab strip", async () => {
    const r = await fetch(`${baseUrl}/workspace/run-abc`)
    const html = await r.text()
    const workspaceTabsMatches = html.match(/db-workspace-tabs/g) ?? []
    const previewTabListMatches = html.match(/db-preview-tablist/g) ?? []
    // One occurrence per nav element (class attribute). Two would mean the
    // strip is duplicated. Zero means the workspace tab strip was deleted
    // entirely (regression in the other direction).
    expect(workspaceTabsMatches.length).toBe(1)
    expect(previewTabListMatches.length).toBe(0)
    // Sandpack mount is still present so preview-mount.js has something to
    // hydrate.
    expect(html).toContain('id="db-preview-sandpack"')
  })

  // Tier 2 #5 (2026-05-28): the static app.js bundle must ship the
  // workspace tab + viewport hash-persistence handlers. Routes test asserts
  // the wiring is reachable from /static/app.js so the workspace shell
  // doesn't silently drop the click handler.
  it("static app.js ships workspace tab + viewport handlers", async () => {
    const r = await fetch(`${baseUrl}/static/app.js`)
    expect(r.status).toBe(200)
    const body = await r.text()
    // Click delegate keyed on data-workspace-tab.
    expect(body).toContain("data-workspace-tab")
    expect(body).toContain("hookWorkspaceTabs")
    // Viewport toggle + hash persistence helpers.
    expect(body).toContain("data-viewport-size")
    expect(body).toContain("setWorkspaceViewport")
    expect(body).toContain("writeWorkspaceHash")
  })

  // Tier 2 #2.12: workspace must render the viewport toggle UI buttons.
  it("GET /workspace/:runId renders the viewport toggle (Desktop/Tablet/Mobile)", async () => {
    const r = await fetch(`${baseUrl}/workspace/run-abc`)
    const html = await r.text()
    expect(html).toContain("data-viewport-toggle")
    expect(html).toContain('data-viewport-size="desktop"')
    expect(html).toContain('data-viewport-size="tablet"')
    expect(html).toContain('data-viewport-size="mobile"')
    // Frame wrapper carries the data-viewport attr the JS handler flips.
    expect(html).toContain('class="db-preview-viewport-frame"')
    expect(html).toContain('data-viewport="desktop"')
  })

  // Tier 2 #4: Diff tab placeholder still ships on cold load when no
  // artifact is on disk. The richer rendering with real patches is covered
  // by the preview-initial.test.ts unit suite.
  it("GET /workspace/:runId renders the Diff tabpanel even without artifact", async () => {
    const r = await fetch(`${baseUrl}/workspace/run-abc`)
    const html = await r.text()
    expect(html).toContain('id="db-preview-panel-diff"')
    // No artifact ⇒ placeholder body present.
    expect(html).toContain("No diff captured yet")
  })

  // Tier 2 #6 (2026-05-28): /dashboard now 302-redirects to the Lovable
  // home (`/`). The legacy classic dashboard is still reachable behind
  // ?legacy=1 for the owner-page "Build" tab fallback + the internal
  // soft-refresh fetcher in client/app.ts.
  it("GET /dashboard 302-redirects to home", async () => {
    const r = await fetch(`${baseUrl}/dashboard`, { redirect: "manual" })
    expect(r.status).toBe(302)
    expect(r.headers.get("location")).toBe("/")
  })

  it("GET /dashboard?legacy=1 still returns the classic dashboard HTML", async () => {
    const r = await fetch(`${baseUrl}/dashboard?legacy=1`)
    expect(r.status).toBe(200)
    expect(r.headers.get("content-type")).toMatch(/text\/html/)
    const html = await r.text()
    expect(html).toContain("Dash Build")
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

  it("Bug 6: POST /api/prompts/:id/cancel marks the prompt cancelled", async () => {
    const created = await fetch(`${baseUrl}/api/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "cancel me please" }),
    })
    const { id } = await created.json()
    const r = await fetch(`${baseUrl}/api/prompts/${id}/cancel`, {
      method: "POST",
    })
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.id).toBe(id)
    expect(body.status).toBe("cancelled")
    expect(daemon.store.getPrompt(id)?.status).toBe("cancelled")
  })

  it("Bug 6: POST /api/prompts/:id/cancel 404s for an unknown id", async () => {
    const r = await fetch(`${baseUrl}/api/prompts/prm_unknown/cancel`, {
      method: "POST",
    })
    expect(r.status).toBe(404)
  })

  it("Bug 6: GET /api/prompts/:id/cancel is method-not-allowed", async () => {
    const created = await fetch(`${baseUrl}/api/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "cancel route method check" }),
    })
    const { id } = await created.json()
    const r = await fetch(`${baseUrl}/api/prompts/${id}/cancel`, {
      method: "GET",
    })
    expect(r.status).toBe(405)
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
    // Tier 2 #6: /dashboard 302s to home — use the legacy escape hatch to
    // assert the classic prompt-input still renders.
    const r = await fetch(`${baseUrl}/dashboard?legacy=1`)
    expect(r.status).toBe(200)
    const html = await r.text()
    expect(html).toContain("db-prompt-input")
    expect(html).not.toContain("Install the Dash Build GitHub App")
  })

  // Tier 3 #12 — Mobile responsive workspace. The dashboard CSS bundle must
  // ship the <=768px media block so phone viewports stack chat above canvas
  // instead of starving the canvas down to ~40px wide.
  it("static app.css ships mobile responsive workspace breakpoint", async () => {
    const r = await fetch(`${baseUrl}/static/app.css`)
    expect(r.status).toBe(200)
    const css = await r.text()
    // Tier 3 #12 media query present.
    expect(css).toMatch(/@media\s*\(max-width:\s*768px\)/)
    // Locate the breakpoint block + assert the workspace rules live inside it.
    // We can't trivially regex over CSS curly braces in a non-balanced way, so
    // slice from "max-width: 768px" up to the next top-level @media or EOF
    // and assert the targeted selectors + declarations are present.
    const mobileStart = css.indexOf("@media (max-width: 768px)")
    expect(mobileStart).toBeGreaterThan(0)
    const narrowStart = css.indexOf("@media (max-width: 480px)", mobileStart)
    expect(narrowStart).toBeGreaterThan(mobileStart)
    const mobileBlock = css.slice(mobileStart, narrowStart)
    // Workspace split collapses to single column on mobile.
    expect(mobileBlock).toContain(".db-workspace-split")
    expect(mobileBlock).toMatch(/grid-template-columns:\s*1fr/)
    // Tabs allow horizontal scroll on mobile instead of wrapping.
    expect(mobileBlock).toContain(".db-workspace-tabs")
    expect(mobileBlock).toMatch(/overflow-x:\s*auto/)
    // Context-list footer stacks vertically + drops the ellipsis truncation.
    expect(mobileBlock).toContain(".db-preview-context-list")
    expect(mobileBlock).toMatch(/white-space:\s*normal/)
    // Thread crumb segment hidden on phones.
    expect(mobileBlock).toContain(".db-workspace-crumb-thread")
  })

  // Tier 2 #5 (bug) — Agent D's tab handler only listened to click events,
  // so `location.hash = "#tab=audit"` silently failed to switch the active
  // tab. Bundle must now also wire a hashchange listener that re-applies
  // the tab + viewport from the parsed hash.
  it("static app.js wires hashchange → applyHashTab for tab switching", async () => {
    const r = await fetch(`${baseUrl}/static/app.js`)
    expect(r.status).toBe(200)
    const js = await r.text()
    // Helper function name surfaces in the bundle (no minifier in dev tsup).
    expect(js).toContain("applyHashTab")
    // hashchange listener wired to the window.
    expect(js).toContain("hashchange")
    // Idempotency guard so HMR / double-boot doesn't stack duplicate listeners.
    expect(js).toContain("data-workspace-hash-wired")
  })

  // Tier 2 #2.10 — GitHub PR wiring. Without GitHub App env vars the install
  // route must return a structured 503 (not the legacy `?stub=1` redirect)
  // so the dashboard can surface a helpful "set up GitHub App" message
  // instead of silently swallowing the click.
  it("POST /api/auth/github returns 503 with setup hint when app env missing", async () => {
    // Belt-and-suspenders: clear any stray env that could enable the path.
    const saved = {
      appId: process.env.DASH_BUILD_GITHUB_APP_ID,
      pk: process.env.DASH_BUILD_GITHUB_PRIVATE_KEY,
      cid: process.env.DASH_BUILD_GITHUB_CLIENT_ID,
      cs: process.env.DASH_BUILD_GITHUB_CLIENT_SECRET,
    }
    delete process.env.DASH_BUILD_GITHUB_APP_ID
    delete process.env.DASH_BUILD_GITHUB_PRIVATE_KEY
    delete process.env.DASH_BUILD_GITHUB_CLIENT_ID
    delete process.env.DASH_BUILD_GITHUB_CLIENT_SECRET
    try {
      const r = await fetch(`${baseUrl}/api/auth/github`, { method: "POST" })
      expect(r.status).toBe(503)
      const body = await r.json()
      expect(body.ok).toBe(false)
      expect(body.error).toBe("github_app_not_configured")
      expect(body.setupUrl).toBe("https://github.com/settings/apps")
      // Hint references the README setup section so devs find the doc.
      expect(body.message).toMatch(/DASH_BUILD_GITHUB_APP_ID/)
    } finally {
      if (saved.appId !== undefined) process.env.DASH_BUILD_GITHUB_APP_ID = saved.appId
      if (saved.pk !== undefined) process.env.DASH_BUILD_GITHUB_PRIVATE_KEY = saved.pk
      if (saved.cid !== undefined) process.env.DASH_BUILD_GITHUB_CLIENT_ID = saved.cid
      if (saved.cs !== undefined) process.env.DASH_BUILD_GITHUB_CLIENT_SECRET = saved.cs
    }
  })

  // Tier 2 #2.10 — Callback path mirror. When unconfigured the callback
  // still returns the legacy stub shape (200 + connected:false) so any
  // older UI handler keeps working, but the new field `connected: false`
  // tells fresh clients to surface the setup prompt.
  it("GET /api/auth/github/callback without config returns legacy stub payload", async () => {
    const r = await fetch(`${baseUrl}/api/auth/github/callback`)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.ok).toBe(true)
    expect(body.provider).toBe("github")
    expect(body.connected).toBe(false)
    expect(body.message).toMatch(/stub/i)
  })
})
