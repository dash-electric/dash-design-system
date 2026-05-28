/**
 * Bug B regression (2026-05-28): cold-load /workspace/:runId previously left
 * Sandpack stuck at the placeholder because the SSE component:updated event
 * only fires during an active orchestrator run. The fix reads the persisted
 * artifact off disk and injects it inline via window.__DASH_PREVIEW_INIT so
 * the client mount script can hydrate on first paint.
 *
 * These tests cover the helper + the template integration. The full HTTP
 * round-trip is implicitly covered by routes.test.ts (no-tab-duplicate
 * regression).
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  loadInitialPreview,
  renderInitialPreviewScript,
} from "../preview-initial.js"
import { resolveRunDir } from "../../runs/artifact-store.js"
import { renderWorkspace } from "../templates/workspace.js"
import { Store } from "../state/store.js"

let root: string
let store: Store

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "dash-build-preview-init-"))
  // Synthetic store — no persisted state needed; loadInitialPreview is
  // disk-only and renderWorkspace just needs a Store with the new APIs.
  store = await Store.load({ path: join(root, "state.json") })
})

afterAll(async () => {
  await rm(root, { recursive: true, force: true })
})

/** Seed `<root>/runs/<runId>/files/<path>` with `content`. */
async function seedArtifact(
  runId: string,
  files: Array<{ path: string; content: string }>,
): Promise<void> {
  const runDir = resolveRunDir(runId, join(root, "runs"))
  const filesDir = join(runDir, "files")
  await mkdir(filesDir, { recursive: true })
  for (const file of files) {
    const dest = join(filesDir, file.path)
    await mkdir(join(dest, ".."), { recursive: true })
    await writeFile(dest, file.content, "utf8")
  }
}

describe("loadInitialPreview", () => {
  it("returns null when runId is missing", async () => {
    const blob = await loadInitialPreview(null, join(root, "runs"))
    expect(blob).toBeNull()
  })

  it("returns null when no artifact dir exists", async () => {
    const blob = await loadInitialPreview("does-not-exist", join(root, "runs"))
    expect(blob).toBeNull()
  })

  it("picks preview.tsx when present", async () => {
    await seedArtifact("run-pref-1", [
      { path: "other.tsx", content: "export default function Other() { return null }" },
      {
        path: "src/preview.tsx",
        content:
          "export default function Preview() { return <div>preview</div> }",
      },
    ])
    const blob = await loadInitialPreview("run-pref-1", join(root, "runs"))
    expect(blob).not.toBeNull()
    expect(blob!.componentId).toBe("run-pref-1")
    expect(blob!.componentSource).toContain("preview")
    expect(blob!.contextMap.landsAt).toBe("src/preview.tsx")
  })

  it("falls back to first tsx with export default", async () => {
    await seedArtifact("run-pref-2", [
      { path: "helper.tsx", content: "export function helper() {}" },
      {
        path: "Component.tsx",
        content: "export default function C() { return <div>x</div> }",
      },
    ])
    const blob = await loadInitialPreview("run-pref-2", join(root, "runs"))
    expect(blob).not.toBeNull()
    expect(blob!.contextMap.landsAt).toBe("Component.tsx")
  })

  it("returns null for patch-only artifact (no tsx/jsx)", async () => {
    await seedArtifact("run-patch-only", [
      { path: "README.md", content: "# nothing" },
      { path: "config.json", content: "{}" },
    ])
    const blob = await loadInitialPreview(
      "run-patch-only",
      join(root, "runs"),
    )
    expect(blob).toBeNull()
  })

  it("refuses to ship banned-import source (defense in depth)", async () => {
    await seedArtifact("run-banned", [
      {
        path: "Component.tsx",
        content:
          "import { useForm } from 'react-hook-form'\nexport default function X() { return null }",
      },
    ])
    const blob = await loadInitialPreview("run-banned", join(root, "runs"))
    expect(blob).toBeNull()
  })

  it("resolves a truncated runId prefix to the full on-disk id", async () => {
    // Real bug: URL `/workspace/prm_20cb` carried the truncated display badge
    // id; disk dir was `prm_20cb094a-ac2`. loadInitialPreview must walk the
    // runs root and resolve the unique prefix match, returning the canonical
    // id in the blob so the workspace template can sync DOM attributes.
    await seedArtifact("prm_20cb094a-ac2", [
      {
        path: "Component.tsx",
        content: "export default function C() { return <div>x</div> }",
      },
    ])
    const blob = await loadInitialPreview("prm_20cb", join(root, "runs"))
    expect(blob).not.toBeNull()
    expect(blob!.componentId).toBe("prm_20cb094a-ac2")
  })

  // Tier 2 #4 (2026-05-28) — Diff tab cold-load. When the run dir holds a
  // patches.json alongside generated tsx files, loadInitialPreview must
  // surface both via blob.diffSnapshot so the workspace template renders a
  // meaningful diff view without going back through the orchestrator.
  it("emits diffSnapshot mixing persisted patches + synthetic new-file entry", async () => {
    await seedArtifact("run-diff-mix", [
      {
        path: "Hello.tsx",
        content: "export default function H() { return <div>hi</div> }",
      },
    ])
    // Patches live at <runDir>/patches.json. Shape matches readRunPatches.
    const runDir = resolveRunDir("run-diff-mix", join(root, "runs"))
    await writeFile(
      join(runDir, "patches.json"),
      JSON.stringify([
        {
          kind: "patch",
          path: "pages/api/foo.ts",
          language: "diff",
          patchContent:
            "--- a/pages/api/foo.ts\n+++ b/pages/api/foo.ts\n@@ -1,1 +1,2 @@\n hello\n+world\n",
        },
      ]),
      "utf8",
    )
    const blob = await loadInitialPreview("run-diff-mix", join(root, "runs"))
    expect(blob).not.toBeNull()
    expect(blob!.diffSnapshot).toBeDefined()
    expect(blob!.diffSnapshot!.length).toBe(2)
    // Patch first (more interesting), new-file second.
    expect(blob!.diffSnapshot![0]!.kind).toBe("patch")
    expect(blob!.diffSnapshot![0]!.path).toBe("pages/api/foo.ts")
    expect(blob!.diffSnapshot![0]!.body).toContain("+world")
    expect(blob!.diffSnapshot![1]!.kind).toBe("new-file")
    expect(blob!.diffSnapshot![1]!.path).toBe("Hello.tsx")
  })

  it("emits diffSnapshot with only the new-file entry when patches.json is missing", async () => {
    await seedArtifact("run-diff-newonly", [
      {
        path: "Solo.tsx",
        content: "export default function S() { return null }",
      },
    ])
    const blob = await loadInitialPreview(
      "run-diff-newonly",
      join(root, "runs"),
    )
    expect(blob).not.toBeNull()
    expect(blob!.diffSnapshot!.length).toBe(1)
    expect(blob!.diffSnapshot![0]!.kind).toBe("new-file")
    expect(blob!.diffSnapshot![0]!.path).toBe("Solo.tsx")
  })

  it("returns null when a runId prefix is ambiguous", async () => {
    await seedArtifact("prm_ambi0001-aaa", [
      {
        path: "A.tsx",
        content: "export default function A() { return null }",
      },
    ])
    await seedArtifact("prm_ambi0002-bbb", [
      {
        path: "B.tsx",
        content: "export default function B() { return null }",
      },
    ])
    // Two dirs share `prm_ambi` — refuse to guess.
    const blob = await loadInitialPreview("prm_ambi", join(root, "runs"))
    expect(blob).toBeNull()
  })
})

describe("renderInitialPreviewScript", () => {
  it("returns empty string for null blob", () => {
    expect(renderInitialPreviewScript(null)).toBe("")
  })

  it("emits a script tag with the blob as JSON", () => {
    const out = renderInitialPreviewScript({
      componentId: "run-x",
      componentSource: "export default () => null",
      contextMap: { landsAt: "x.tsx", uses: [], be: [], audit: null },
    })
    expect(out).toContain("<script>")
    expect(out).toContain("window.__DASH_PREVIEW_INIT")
    expect(out).toContain('"componentId":"run-x"')
    expect(out).toContain("</script>")
  })

  it("escapes </script> sequences inside source", () => {
    const out = renderInitialPreviewScript({
      componentId: "run-x",
      componentSource: "// </script><script>alert(1)</script>",
      contextMap: { landsAt: null, uses: [], be: [], audit: null },
    })
    // Exactly one closing </script> — the trailing tag. The embedded one
    // must be defanged via the backslash escape.
    const closes = out.match(/<\/script>/gi) ?? []
    expect(closes.length).toBe(1)
    expect(out).toContain("<\\/script>")
  })
})

describe("renderWorkspace embeds the init script when given a blob", () => {
  it("injects window.__DASH_PREVIEW_INIT when initialPreview matches runId", () => {
    const html = renderWorkspace(store, {
      runId: "run-zzz",
      initialPreview: {
        componentId: "run-zzz",
        componentSource:
          "export default function Hello() { return <div>hi</div> }",
        contextMap: {
          landsAt: "Hello.tsx",
          uses: ["@dash/ui"],
          be: [],
          audit: null,
        },
      },
    })
    expect(html).toContain("window.__DASH_PREVIEW_INIT")
    expect(html).toContain('"componentId":"run-zzz"')
    expect(html).toContain('id="db-preview-sandpack"')
  })

  it("omits the init script when no blob is provided", () => {
    const html = renderWorkspace(store, { runId: "run-cold" })
    expect(html).not.toContain("window.__DASH_PREVIEW_INIT")
    // Sandpack mount must still be present so SSE refresh has a target.
    expect(html).toContain('id="db-preview-sandpack"')
  })

  it("uses the blob's canonical componentId when URL runId is a truncated prefix", () => {
    // Real scenario: URL `/workspace/prm_20cb` carries the display badge id,
    // disk holds `prm_20cb094a-ac2`. loadInitialPreview resolves to the full
    // id; the workspace must trust the blob so the DOM data-component-id and
    // the injected __DASH_PREVIEW_INIT.componentId line up.
    const html = renderWorkspace(store, {
      runId: "prm_20cb",
      initialPreview: {
        componentId: "prm_20cb094a-ac2",
        componentSource: "export default () => null",
        contextMap: { landsAt: null, uses: [], be: [], audit: null },
      },
    })
    expect(html).toContain("window.__DASH_PREVIEW_INIT")
    expect(html).toContain("prm_20cb094a-ac2")
    expect(html).toContain('data-component-id="prm_20cb094a-ac2"')
  })
})
