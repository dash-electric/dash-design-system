/**
 * Open WebUI #A4 — cold-load support for A/B variants.
 *
 * Verifies that when a run dir has a persisted variants manifest + per-variant
 * component-source.txt, `loadInitialPreview` ships a `variantsSnapshot` so
 * the workspace template can render the split-view on first paint without
 * waiting for SSE.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { loadInitialPreview } from "../preview-initial.js"
import { renderWorkspace } from "../templates/workspace.js"
import {
  resolveRunDir,
  resolveVariantDir,
} from "../../runs/artifact-store.js"
import { Store } from "../state/store.js"

let root: string
let store: Store

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "dash-build-preview-init-variants-"))
  store = await Store.load({ path: join(root, "state.json") })
})

afterAll(async () => {
  await rm(root, { recursive: true, force: true })
})

async function seedAbRun(
  runId: string,
  opts?: { activeId?: string; missingBSource?: boolean },
): Promise<void> {
  const runDir = resolveRunDir(runId, join(root, "runs"))
  const filesDir = join(runDir, "files")
  await mkdir(filesDir, { recursive: true })
  // Canonical winner mirror — needed by the existing pickComponentFile branch.
  await writeFile(
    join(filesDir, "preview.tsx"),
    "export default function Winner(){return null}",
    "utf8",
  )
  // Variant A
  const aDir = resolveVariantDir(runId, "a", join(root, "runs"))
  await mkdir(join(aDir, "files"), { recursive: true })
  await writeFile(
    join(aDir, "files", "preview.tsx"),
    "export default function A(){return null}",
    "utf8",
  )
  await writeFile(
    join(aDir, "component-source.txt"),
    "export default function A(){return null}",
    "utf8",
  )
  await writeFile(
    join(aDir, "meta.json"),
    JSON.stringify({
      variantId: "a",
      componentPath: "preview.tsx",
      score: 70,
      passed: true,
      explanation: "Variant A",
      temperature: 0.7,
    }),
    "utf8",
  )
  // Variant B
  const bDir = resolveVariantDir(runId, "b", join(root, "runs"))
  await mkdir(join(bDir, "files"), { recursive: true })
  await writeFile(
    join(bDir, "files", "preview.tsx"),
    "export default function B(){return null}",
    "utf8",
  )
  if (!opts?.missingBSource) {
    await writeFile(
      join(bDir, "component-source.txt"),
      "export default function B(){return null}",
      "utf8",
    )
  }
  await writeFile(
    join(bDir, "meta.json"),
    JSON.stringify({
      variantId: "b",
      componentPath: "preview.tsx",
      score: 88,
      passed: true,
      explanation: "Variant B",
      temperature: 0.9,
    }),
    "utf8",
  )

  await writeFile(
    join(runDir, "variants.json"),
    JSON.stringify({
      active: opts?.activeId ?? "b",
      list: [
        {
          id: "a",
          summary: "Variant A summary",
          score: 70,
          passed: true,
          fileCount: 1,
          componentPath: "preview.tsx",
          temperature: 0.7,
        },
        {
          id: "b",
          summary: "Variant B summary",
          score: 88,
          passed: true,
          fileCount: 1,
          componentPath: "preview.tsx",
          temperature: 0.9,
        },
      ],
      updatedAt: new Date().toISOString(),
    }),
    "utf8",
  )
}

describe("loadInitialPreview variants (#A4)", () => {
  it("returns variantsSnapshot when variants.json + per-variant sources exist", async () => {
    await seedAbRun("run-ab-1")
    const blob = await loadInitialPreview("run-ab-1", join(root, "runs"))
    expect(blob).not.toBeNull()
    expect(blob!.variantsSnapshot).toBeDefined()
    expect(blob!.variantsSnapshot!.active).toBe("b")
    expect(blob!.variantsSnapshot!.list.length).toBe(2)
    const a = blob!.variantsSnapshot!.list.find((v) => v.id === "a")
    expect(a?.componentSource).toContain("function A")
    expect(a?.summary).toBe("Variant A summary")
    expect(a?.temperature).toBe(0.7)
  })

  it("omits a variant entry when its component-source.txt is missing", async () => {
    await seedAbRun("run-ab-2", { missingBSource: true })
    const blob = await loadInitialPreview("run-ab-2", join(root, "runs"))
    expect(blob).not.toBeNull()
    // 'b' had no source — falls out of the snapshot
    expect(blob!.variantsSnapshot).toBeDefined()
    expect(blob!.variantsSnapshot!.list.length).toBe(1)
    expect(blob!.variantsSnapshot!.list[0].id).toBe("a")
  })

  it("returns no variantsSnapshot for runs without variants.json", async () => {
    // Seed canonical files only (no variants dir / manifest).
    const runDir = resolveRunDir("run-single", join(root, "runs"))
    await mkdir(join(runDir, "files"), { recursive: true })
    await writeFile(
      join(runDir, "files", "preview.tsx"),
      "export default function Single(){return null}",
      "utf8",
    )
    const blob = await loadInitialPreview("run-single", join(root, "runs"))
    expect(blob).not.toBeNull()
    expect(blob!.variantsSnapshot).toBeUndefined()
  })
})

describe("renderWorkspace branches on variantsSnapshot (#A4)", () => {
  it("renders the split-view markup when initialPreview carries variantsSnapshot", () => {
    const html = renderWorkspace(store, {
      runId: "run-ab-3",
      initialPreview: {
        componentId: "run-ab-3",
        componentSource: "export default function W(){return null}",
        contextMap: { landsAt: "W.tsx", uses: [], be: [], audit: null },
        variantsSnapshot: {
          active: "a",
          list: [
            {
              id: "a",
              summary: "A summary",
              score: 80,
              passed: true,
              fileCount: 1,
              componentPath: "W.tsx",
              temperature: 0.7,
              componentSource: "export default function VA(){return null}",
            },
            {
              id: "b",
              summary: "B summary",
              score: 75,
              passed: true,
              fileCount: 1,
              componentPath: "W.tsx",
              temperature: 0.9,
              componentSource: "export default function VB(){return null}",
            },
          ],
        },
      },
    })
    expect(html).toContain("data-variants-split")
    expect(html).toContain('data-active-variant="a"')
    expect(html).toContain("Variant A")
    expect(html).toContain("Variant B")
    expect(html).toContain('data-variant-pick="a"')
    expect(html).toContain('data-variant-pick="b"')
    // The init script still ships both sources so the client mount can hydrate.
    expect(html).toContain("variantsSnapshot")
    expect(html).toContain("VA")
    expect(html).toContain("VB")
  })

  it("falls back to single mount when variantsSnapshot is absent", () => {
    const html = renderWorkspace(store, {
      runId: "run-single-2",
      initialPreview: {
        componentId: "run-single-2",
        componentSource: "export default function S(){return null}",
        contextMap: { landsAt: "S.tsx", uses: [], be: [], audit: null },
      },
    })
    expect(html).toContain('id="db-preview-sandpack"')
    expect(html).not.toContain("data-variants-split")
  })
})
