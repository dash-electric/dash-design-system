/**
 * P7 (2026-05-29) — Home composer repo picker.
 *
 * THE BUG: the hero "Start building" flow POSTed `{ text }` with NO repo, so
 * the orchestrator's `shouldClone` was false → intake scanned dash-build's
 * own dir → greenfield/standalone generation (the Lovable-clone failure the
 * product rejects). The verified "respect existing + fePatterns + BE reach"
 * wins only fire when a real repo is selected. The fix adds a repo picker to
 * the home composer that defaults to a real repo and carries `{ text, repo }`.
 *
 * Coverage:
 *   1. Home composer renders repo options from the preview manifest.
 *   2. Picker defaults to last-used repo, else backoffice.
 *   3. A blank "No repo (new product)" escape hatch exists.
 *   4. hookHomePrompt reads the picker + includes `repo` in the POST payload
 *      (DASHBOARD_JS substring assertions).
 *   5. A no-repo selection still works (blank-product) — empty value is omitted.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Store } from "../state/store.js"
import { renderHome } from "../templates/home.js"
import { DASHBOARD_JS } from "../templates/client/app.js"
import { listRepoPreviewManifests } from "../repo-preview.js"

let root: string
let store: Store

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "dash-build-home-repo-"))
  store = await Store.load({ path: join(root, "state.json") })
})

afterEach(async () => {
  await store.flush()
  await rm(root, { recursive: true, force: true })
})

describe("P7 — home composer renders repo options from manifest", () => {
  it("renders a repo <select> with every manifest repo as an option", () => {
    const html = renderHome(store, {})
    expect(html).toContain('id="db-home-repo-select"')
    for (const m of listRepoPreviewManifests()) {
      expect(html).toContain(`value="${m.id}"`)
      expect(html).toContain(m.label)
    }
  })

  it("includes a blank 'No repo (new product)' escape-hatch option", () => {
    const html = renderHome(store, {})
    expect(html).toContain('value=""')
    expect(html).toContain("No repo (new product)")
  })

  it("defaults to backoffice when no repo has been used yet", () => {
    const html = renderHome(store, {})
    // The backoffice option carries the `selected` attribute.
    expect(html).toMatch(/value="dash\/backoffice"\s+selected/)
  })

  it("defaults to the last-used repo when one is persisted", async () => {
    await store.setActiveRepo("dash/portal-v2")
    const html = renderHome(store, {})
    expect(html).toMatch(/value="dash\/portal-v2"\s+selected/)
    // backoffice is no longer the selected default.
    expect(html).not.toMatch(/value="dash\/backoffice"\s+selected/)
  })

  it("falls back to backoffice when the persisted repo is not a known manifest id", async () => {
    await store.setActiveRepo("dash/unknown-repo")
    const html = renderHome(store, {})
    expect(html).toMatch(/value="dash\/backoffice"\s+selected/)
  })
})

describe("P7 — hookHomePrompt includes repo in POST payload", () => {
  it("reads the picker value and adds it to the payload when non-empty", () => {
    expect(DASHBOARD_JS).toContain("function hookHomePrompt")
    expect(DASHBOARD_JS).toContain('getElementById("db-home-repo-select")')
    expect(DASHBOARD_JS).toContain("payload.repo = selectedRepo")
  })

  it("posts the payload to /api/prompt as JSON (text + repo)", () => {
    expect(DASHBOARD_JS).toContain('fetch("/api/prompt"')
    expect(DASHBOARD_JS).toContain("JSON.stringify(payload)")
    expect(DASHBOARD_JS).toContain("var payload = { text: raw }")
  })

  it("only attaches repo when a value is selected (blank-product still works)", () => {
    // Guarded behind a truthy check so the empty 'No repo' option omits `repo`,
    // keeping the orchestrator's greenfield path available on demand.
    expect(DASHBOARD_JS).toContain("if (selectedRepo) {")
  })
})
