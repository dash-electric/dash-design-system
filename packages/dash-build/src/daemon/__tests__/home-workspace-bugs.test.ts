/**
 * Regression tests for the 2026-05-29 home→workspace prompt-flow bug cluster.
 *
 *   Bug 1+2 — the workspace must mount already showing the submitted prompt
 *             bubble (+ in-flight builder state) for the active runId, instead
 *             of the empty "What do you want to build today?" composer.
 *   Bug 3+4 — phantom / Unassigned (repo-less) projects must NOT surface on the
 *             home "My projects" grid or the sidebar Recents.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store } from "../state/store.js"
import { renderHome } from "../templates/home.js"
import { renderWorkspace } from "../templates/workspace.js"

let root: string
let store: Store

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "dash-build-home-ws-"))
  store = await Store.load({ path: join(root, "state.json") })
})

afterEach(async () => {
  // Let any fire-and-forget persists settle before removing the temp dir,
  // else a tmp-write + rename can land between readdir and rmdir → ENOTEMPTY.
  await store.flush()
  await rm(root, { recursive: true, force: true })
})

describe("Bug 3+4 — phantom projects filtered from home grid", () => {
  it("does not render an Unassigned (repo-less) project card on the home grid", () => {
    // Bare prompt → auto-created "Unassigned" phantom project.
    store.addPrompt({ text: "bare prompt no repo" })
    const html = renderHome(store, {})
    // The grid should show the empty state, not a phantom card.
    expect(html).not.toContain(">Unassigned<")
    expect(html).toContain("No projects yet")
    // Count badge reflects the filtered set (0 projects).
    expect(html).toContain("0 projects")
  })

  it("renders a real repo-backed project card but hides the phantom alongside it", () => {
    store.addPrompt({ text: "build dashboard", repo: "dash/backoffice" })
    store.addPrompt({ text: "bare prompt no repo" })
    const html = renderHome(store, {})
    // Repo-backed project surfaces (name derived from repo tail).
    expect(html).toContain("Backoffice")
    expect(html).toContain("dash/backoffice")
    // The phantom does not.
    expect(html).not.toContain(">Unassigned<")
    expect(html).toContain("1 project")
  })

  it("excludes phantom projects from the sidebar Recents", () => {
    store.addPrompt({ text: "bare prompt no repo" })
    const html = renderHome(store, {})
    // Recents should be empty (the only project is a phantom).
    expect(html).toContain("No recent projects yet.")
  })
})

describe("Bug 1+2 — workspace hydrates the active run's prompt", () => {
  it("seeds the chat thread with the submitted prompt bubble for the runId", () => {
    const prompt = store.addPrompt({
      text: "Add a payroll chart to backoffice",
      repo: "dash/backoffice",
    })
    const html = renderWorkspace(store, { runId: prompt.id })
    // The user prompt is server-rendered as a chat bubble — NOT the empty state.
    expect(html).toContain("Add a payroll chart to backoffice")
    expect(html).not.toContain("What do you want to build today?")
    // The bubble carries the runId so client-side updates can target it.
    expect(html).toContain(`data-prompt-id="${prompt.id}"`)
  })

  it("renders the generating in-flight state for a queued/generating run", async () => {
    const prompt = store.addPrompt({
      text: "Build a settings page",
      repo: "dash/backoffice",
    })
    await store.updatePromptStatus(prompt.id, "generating")
    const html = renderWorkspace(store, { runId: prompt.id })
    // Builder bubble should show the typing/running affordance.
    expect(html).toContain('data-status="running"')
    expect(html).toContain("db-chat-typing")
  })

  it("falls back to the empty state when the runId is unknown", () => {
    const html = renderWorkspace(store, { runId: "prm_does_not_exist" })
    expect(html).toContain("What do you want to build today?")
  })
})

describe("P21 — empty /workspace/ never surfaces the Unassigned phantom", () => {
  it("shows the clean Untitled workspace state, not the Unassigned phantom, when only a phantom project exists", () => {
    // Bare prompt → auto-created repo-less "Unassigned" phantom project. With
    // no runId, projectId, or activeRepo, pickProject() previously returned
    // projects[0] (the phantom) and the crumb read "Unassigned".
    store.addPrompt({ text: "bare prompt no repo" })
    const html = renderWorkspace(store, {})
    expect(html).not.toContain("Unassigned")
    // Clean empty/new state: crumb falls back to the neutral title.
    expect(html).toContain("Untitled workspace")
  })

  it("prefers a real repo-backed project over a phantom in the fallback", () => {
    store.addPrompt({ text: "build dashboard", repo: "dash/backoffice" })
    store.addPrompt({ text: "bare prompt no repo" })
    const html = renderWorkspace(store, {})
    // The real project wins the fallback; the phantom never shows.
    expect(html).toContain("Backoffice")
    expect(html).not.toContain("Unassigned")
  })
})
