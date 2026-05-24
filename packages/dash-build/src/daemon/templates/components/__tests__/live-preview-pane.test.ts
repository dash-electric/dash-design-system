import { describe, expect, it } from "vitest"
import { renderLivePreviewPane } from "../live-preview-pane.js"
import type { RepoPreviewInfo } from "../../../repo-preview.js"

function makeRepoPreview(authMode: RepoPreviewInfo["metadata"]["auth"]["mode"]): RepoPreviewInfo {
  return {
    repo: "dash/backoffice",
    dir: "/tmp/backoffice",
    port: 3101,
    url: "http://127.0.0.1:3101/delivery",
    installCommand: "npm install",
    startCommand: "npm run dev -- -p 3101",
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
      auth: {
        mode: authMode,
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

describe("renderLivePreviewPane baseline auth harness", () => {
  it("renders auth-gated running repos through first-party harness instead of iframe", () => {
    const html = renderLivePreviewPane({
      state: "baseline",
      repoPreview: makeRepoPreview("preview-harness-required"),
    })

    expect(html).toContain('data-preview-harness="dash/backoffice"')
    expect(html).toContain("Auth-safe canvas")
    expect(html).toContain("Open real app")
    expect(html).not.toContain("<iframe")
  })

  it("keeps iframe rendering for running repos without auth gates", () => {
    const html = renderLivePreviewPane({
      state: "baseline",
      repoPreview: makeRepoPreview("none"),
    })

    expect(html).toContain("<iframe")
    expect(html).not.toContain("Auth-safe canvas")
  })
})
