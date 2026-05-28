/**
 * Doc Index Service tests — Open WebUI `#` adoption.
 *
 * Hermetic: every describe block runs against a temp directory written via
 * `mkdtemp` so the real Obsidian vault + repo docs never interfere.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  buildDocIndex,
  queryDocs,
  readDocBodies,
  readDocBody,
  renderReferencedDocsBlock,
  resetDocIndexCache,
  resolveDocRoots,
} from "../doc-index.js"

let workDir: string
let originalEnv: string | undefined

async function seedDocs(root: string): Promise<void> {
  await mkdir(join(root, "prd"), { recursive: true })
  await mkdir(join(root, "specs"), { recursive: true })
  await writeFile(
    join(root, "prd", "mitra-prd.md"),
    "# Mitra PRD\n\nMitra suspension rules: 3 dispatch missed = 1 hour suspend.\n",
    "utf8",
  )
  await writeFile(
    join(root, "prd", "payroll-prd.md"),
    "# Payroll PRD\n\nWeekly payroll cycle every Friday.\n",
    "utf8",
  )
  await writeFile(
    join(root, "specs", "audit-trail.md"),
    "---\ntitle: Audit Trail\n---\n\n# Audit Trail Spec\n\nLog original + edited + editor + reason.\n",
    "utf8",
  )
  await writeFile(
    join(root, "README.md"),
    "# Repo readme\n\nRepository overview.\n",
    "utf8",
  )
  // A non-md file must be skipped.
  await writeFile(join(root, "ignored.txt"), "noise", "utf8")
  // A dotfile must be skipped (the walker drops dotfiles entirely).
  await writeFile(join(root, ".hidden.md"), "secret", "utf8")
}

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-doc-index-"))
  await seedDocs(workDir)
  originalEnv = process.env.DASH_BUILD_DOC_ROOTS
  process.env.DASH_BUILD_DOC_ROOTS = workDir
  resetDocIndexCache()
})

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true })
  if (originalEnv === undefined) {
    delete process.env.DASH_BUILD_DOC_ROOTS
  } else {
    process.env.DASH_BUILD_DOC_ROOTS = originalEnv
  }
  resetDocIndexCache()
})

describe("resolveDocRoots", () => {
  it("honours an explicit roots override", () => {
    const roots = resolveDocRoots({ roots: [workDir] })
    expect(roots).toEqual([workDir])
  })

  it("drops nonexistent paths from the env without throwing", () => {
    process.env.DASH_BUILD_DOC_ROOTS = `${workDir},/no/such/path`
    const roots = resolveDocRoots()
    expect(roots).toEqual([workDir])
  })

  it("refuses relative paths in the env override", () => {
    process.env.DASH_BUILD_DOC_ROOTS = "./relative-only"
    const roots = resolveDocRoots()
    // Falls through to defaults — the test environment may or may not have
    // any of the default roots, so we only assert the relative was dropped.
    expect(roots).not.toContain("./relative-only")
  })
})

describe("buildDocIndex", () => {
  it("indexes every .md / .mdx file under the configured roots", async () => {
    const entries = await buildDocIndex({ roots: [workDir] })
    const names = entries.map((e) => e.name).sort()
    expect(names).toEqual(["README", "audit-trail", "mitra-prd", "payroll-prd"])
  })

  it("skips dotfiles, dotted directories, and non-md extensions", async () => {
    const entries = await buildDocIndex({ roots: [workDir] })
    expect(entries.some((e) => e.name === ".hidden")).toBe(false)
    expect(entries.some((e) => e.name === "ignored")).toBe(false)
  })

  it("re-uses the in-process cache when TTL has not elapsed", async () => {
    const first = await buildDocIndex({ roots: [workDir] })
    // Add a new file then re-query — the cached result should NOT include it.
    await writeFile(join(workDir, "new-doc.md"), "# new", "utf8")
    const second = await buildDocIndex({ roots: [workDir] })
    expect(second).toBe(first) // identity = same reference, not just equal
  })

  it("rebuilds when forced", async () => {
    const first = await buildDocIndex({ roots: [workDir] })
    await writeFile(join(workDir, "fresh-doc.md"), "# fresh", "utf8")
    const second = await buildDocIndex({ roots: [workDir] }, true)
    expect(second).not.toBe(first)
    expect(second.some((e) => e.name === "fresh-doc")).toBe(true)
  })
})

describe("queryDocs", () => {
  it("returns prefix matches ahead of substring matches", async () => {
    const docs = await queryDocs({ q: "p", options: { roots: [workDir] } })
    // "payroll-prd" + "mitra-prd" both contain "p"; "payroll-prd" starts with it.
    expect(docs[0]?.name).toBe("payroll-prd")
  })

  it("honours the limit parameter and caps at 50", async () => {
    const limited = await queryDocs({ limit: 1, options: { roots: [workDir] } })
    expect(limited).toHaveLength(1)
    // Sanity: the function ignores absurd limits silently — does not throw.
    const sane = await queryDocs({ limit: 9999, options: { roots: [workDir] } })
    expect(sane.length).toBeLessThanOrEqual(50)
  })

  it("returns head of index when query is empty", async () => {
    const docs = await queryDocs({ options: { roots: [workDir] } })
    expect(docs.length).toBeGreaterThan(0)
    // Sorted alphabetically by name (locale-aware) — confirm every seeded
    // doc name is reachable rather than asserting on a specific head.
    const names = docs.map((d) => d.name)
    expect(names).toContain("README")
    expect(names).toContain("mitra-prd")
  })

  it("fills excerpts from the first non-heading line and strips frontmatter", async () => {
    const docs = await queryDocs({ q: "audit", options: { roots: [workDir] } })
    expect(docs[0]?.excerpt).toContain("Log original")
    // Frontmatter values must NOT leak into the excerpt.
    expect(docs[0]?.excerpt).not.toContain("title: Audit Trail")
  })
})

describe("readDocBody", () => {
  it("returns the full body for a known id", async () => {
    const list = await queryDocs({ q: "mitra", options: { roots: [workDir] } })
    expect(list.length).toBeGreaterThan(0)
    const doc = await readDocBody(list[0]!.id)
    expect(doc).not.toBeNull()
    expect(doc!.body).toContain("3 dispatch missed")
    expect(doc!.path).toContain("mitra-prd")
  })

  it("rejects malformed ids", async () => {
    expect(await readDocBody("not-a-hex-id")).toBeNull()
    expect(await readDocBody("")).toBeNull()
    expect(await readDocBody("../../etc/passwd")).toBeNull()
  })

  it("returns null for unknown but well-formed ids", async () => {
    expect(await readDocBody("deadbeefdeadbeef")).toBeNull()
  })
})

describe("readDocBodies + renderReferencedDocsBlock", () => {
  it("hydrates a batch of doc ids and renders a markdown block", async () => {
    const list = await queryDocs({ options: { roots: [workDir] } })
    const ids = list.slice(0, 2).map((e) => e.id)
    const docs = await readDocBodies(ids)
    expect(docs).toHaveLength(2)
    const block = renderReferencedDocsBlock(docs)
    expect(block).toContain("## Referenced documents")
    // Each doc renders with a level-3 heading + fenced markdown body.
    expect(block).toContain("### ")
    expect(block).toContain("```markdown")
    // Each doc's name should appear in the block.
    for (const d of docs) {
      expect(block).toContain(d.name)
    }
  })

  it("silently drops unknown ids in batch fetch", async () => {
    const list = await queryDocs({ options: { roots: [workDir] } })
    const ids = [list[0]!.id, "deadbeefdeadbeef"]
    const docs = await readDocBodies(ids)
    expect(docs).toHaveLength(1)
  })

  it("returns an empty string when no docs are passed to the renderer", () => {
    expect(renderReferencedDocsBlock([])).toBe("")
  })
})
