import { describe, expect, it } from "vitest"
import { renderLivePreviewPane } from "../live-preview-pane.js"
import type {
  RepoPreviewInfo,
  RepoPreviewSourceMode,
} from "../../../repo-preview.js"

interface FixtureOpts {
  authMode: RepoPreviewInfo["metadata"]["auth"]["mode"]
  sourceMode?: RepoPreviewSourceMode
  url?: string
  port?: number
  onlineUrl?: string | null
}

function makeRepoPreview(opts: FixtureOpts | RepoPreviewInfo["metadata"]["auth"]["mode"]): RepoPreviewInfo {
  const normalized: FixtureOpts =
    typeof opts === "string" ? { authMode: opts } : opts
  const sourceMode = normalized.sourceMode ?? "online-default"
  const port = normalized.port ?? 3101
  const url = normalized.url ?? "http://127.0.0.1:3101/delivery"
  const onlineUrl =
    normalized.onlineUrl !== undefined
      ? normalized.onlineUrl
      : "https://stg-back-office.dashelectric.co"
  return {
    repo: "dash/backoffice",
    dir: "/tmp/backoffice",
    port,
    url,
    installCommand: "npm install",
    startCommand: `npm run dev -- -p ${port}`,
    sourceMode,
    status: "running",
    message: "Local dev server is running.",
    metadata: {
      id: "dash/backoffice",
      label: "Backoffice",
      surface: "Internal operations console",
      audience: "Dash operations",
      theme: "ride",
      previewMode: "local-dev",
      defaultRoute: "/delivery",
      baselineDescription: "Internal admin shell.",
      localDirEnv: "DASH_BUILD_BACKOFFICE_PATH",
      localDirName: "next-backoffice-web",
      portEnv: "DASH_BUILD_BACKOFFICE_PORT",
      defaultPort: 3101,
      onlineUrl,
      onlineUrlEnv: "DASH_BUILD_BACKOFFICE_ONLINE_URL",
      auth: {
        mode: normalized.authMode,
        summary: "Protected pages require a session.",
        sessionKeys: ["localStorage token"],
        routes: ["/delivery"],
        unblockPlan: ["Use preview harness."],
      },
      shell: {
        title: "Backoffice baseline",
        nav: ["Dashboard", "Mitra"],
        primaryAction: "Open ops workspace",
        contentHints: ["Internal workflow"],
      },
    },
    baseline: {
      repo: "dash/backoffice",
      label: "Backoffice",
      surface: "Internal operations console",
      audience: "Dash operations",
      theme: "ride",
      previewMode: "local-dev",
      defaultRoute: "/delivery",
      description: "Internal admin shell.",
      shell: {
        title: "Backoffice baseline",
        nav: ["Dashboard", "Mitra"],
        primaryAction: "Open ops workspace",
        contentHints: ["Internal workflow"],
      },
    },
  }
}

describe("renderLivePreviewPane baseline auth handling", () => {
  it("renders auth-gated running repos via real iframe with an honest auth note", () => {
    // Phase D online URL refactor: when the dev server (or staging URL) is up
    // we ALWAYS render the real iframe — auth gates are surfaced as an honest
    // signal (login redirect = real app) rather than masked by a harness.
    // The harness fallback only applies when status !== "running".
    const html = renderLivePreviewPane({
      state: "baseline",
      repoPreview: makeRepoPreview("preview-harness-required"),
    })

    expect(html).toContain("<iframe")
    expect(html).toContain("Open real app")
    // Auth callout still surfaces so the operator knows protected pages may
    // hit a login wall in the iframe.
    expect(html).toContain("Preview harness required")
    // We are NOT hiding behind the synthetic harness anymore.
    expect(html).not.toContain('data-preview-harness="dash/backoffice"')
    expect(html).not.toContain("Auth-safe canvas")
  })

  it("keeps iframe rendering for running repos without auth gates", () => {
    const html = renderLivePreviewPane({
      state: "baseline",
      repoPreview: makeRepoPreview("none"),
    })

    expect(html).toContain("<iframe")
    expect(html).not.toContain("Auth-safe canvas")
    expect(html).not.toContain("Preview harness required")
  })

  it("sandbox-clone mode renders clone ribbon + drops auth note", () => {
    // F2: when the resolver picks the local clone dev server (state.json
    // clone_running + devServerPort), the auth-bypass shim is active so the
    // pane must:
    //   1. Point the iframe at 127.0.0.1:<port>, NOT the staging URL.
    //   2. Drop the yellow `db-baseline-auth-note` (no auth wall to warn about).
    //   3. Swap the ribbon to the success-toned `--clone` variant.
    //   4. Still expose an "Open real app ↗" link back to staging for compare.
    const html = renderLivePreviewPane({
      state: "baseline",
      repoPreview: makeRepoPreview({
        authMode: "preview-harness-required",
        sourceMode: "sandbox-clone",
        url: "http://127.0.0.1:3101/delivery",
        port: 3101,
      }),
    })

    // Iframe points at the local clone, not staging.
    expect(html).toMatch(/<iframe[^>]+src="http:\/\/127\.0\.0\.1:3101/)
    expect(html).not.toContain('src="https://stg-back-office')

    // No yellow auth note — the shim handles auth, the operator shouldn't be
    // warned about a login wall that won't appear.
    expect(html).not.toContain("db-baseline-auth-note")

    // Clone ribbon variant + data-attr for client refresh hooks.
    expect(html).toContain("db-baseline-ribbon--clone")
    expect(html).toContain('data-clone-preview="dash/backoffice"')
    expect(html).toContain("Clone preview")
    expect(html).toContain("127.0.0.1:3101")

    // "Open real app ↗" link still falls back to the manifest's onlineUrl
    // so the operator can sanity-check against production shape.
    expect(html).toContain("Open real app")
    expect(html).toContain("stg-back-office.dashelectric.co")
  })

  it("sandbox-clone with no manifest onlineUrl hides the real-app link", () => {
    // portal-v2 ships `onlineUrl: null`. In that case we should NOT emit a
    // dead anchor — the ribbon just drops the link slot.
    const html = renderLivePreviewPane({
      state: "baseline",
      repoPreview: makeRepoPreview({
        authMode: "none",
        sourceMode: "sandbox-clone",
        url: "http://127.0.0.1:3100/en/deliveries",
        port: 3100,
        onlineUrl: null,
      }),
    })

    expect(html).toContain("db-baseline-ribbon--clone")
    expect(html).not.toContain("Open real app")
  })

  it("sandbox-clone surfaces port-shift hint when port differs from manifest default", () => {
    // F1 — when Workspace.startDevServer found :3101 busy and shifted to
    // :3102, the ribbon must explain the drift so the user doesn't think
    // the dashboard is buggy.
    const html = renderLivePreviewPane({
      state: "baseline",
      repoPreview: makeRepoPreview({
        authMode: "preview-harness-required",
        sourceMode: "sandbox-clone",
        url: "http://127.0.0.1:3102/delivery",
        port: 3102, // manifest defaultPort is 3101
      }),
    })

    expect(html).toContain("data-port-shifted=\"true\"")
    expect(html).toContain("port shifted from :3101")
    expect(html).toContain("127.0.0.1:3102")
    expect(html).toContain("title=\"Dev server moved off :3101")
  })

  it("sandbox-clone hides port-shift hint when port matches manifest default", () => {
    const html = renderLivePreviewPane({
      state: "baseline",
      repoPreview: makeRepoPreview({
        authMode: "preview-harness-required",
        sourceMode: "sandbox-clone",
        url: "http://127.0.0.1:3101/delivery",
        port: 3101,
      }),
    })

    expect(html).not.toContain("data-port-shifted")
    expect(html).not.toContain("port shifted from")
  })
})

describe("renderLivePreviewPane state coverage", () => {
  it("idle state shows the empty card without iframe", () => {
    const html = renderLivePreviewPane({ state: "idle" })
    expect(html).toContain('data-state="idle"')
    expect(html).toContain("Live preview")
    expect(html).not.toContain("<iframe")
  })

  it("running state renders pipeline steps", () => {
    const html = renderLivePreviewPane({
      state: "running",
      steps: [
        { id: "dash-prd", label: "dash-prd", state: "done" },
        { id: "skill", label: "Skill v3", state: "active" },
        { id: "codex", label: "Codex", state: "pending" },
      ],
    })
    expect(html).toContain('data-state="running"')
    expect(html).toContain("Generating…")
    expect(html).toContain('data-step="dash-prd"')
    expect(html).toContain('db-pipeline-step-icon--done')
    expect(html).toContain('db-pipeline-step-icon--active')
  })

  it("ready state renders generated iframe with foundation score badge", () => {
    const html = renderLivePreviewPane({
      state: "ready",
      previewUrl: "/preview/prm_test",
      score: 92,
    })
    expect(html).toContain('data-state="ready"')
    expect(html).toContain("92/100")
    expect(html).toContain("db-foundation-badge--good")
    expect(html).toContain("<iframe")
  })

  it("error state surfaces the message in an alert", () => {
    const html = renderLivePreviewPane({
      state: "error",
      errorMessage: "Codex timed out after 30s.",
    })
    expect(html).toContain('data-state="error"')
    expect(html).toContain("role=\"alert\"")
    expect(html).toContain("Codex timed out after 30s.")
  })

  it("baseline state with no repoPreview shows the 'Select a repo' empty card", () => {
    const html = renderLivePreviewPane({ state: "baseline", repoPreview: null })
    expect(html).toContain('data-state="baseline"')
    expect(html).toContain("Select a repo")
    expect(html).not.toContain("<iframe")
  })
})
