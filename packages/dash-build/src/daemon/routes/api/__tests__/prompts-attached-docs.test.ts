/**
 * Open WebUI `#` adoption — Sub-task 3 tests.
 *
 * Confirms composePromptWithAttachedDocs hydrates ids into a referenced-docs
 * block prepended to the user prompt, and the failure path falls back to the
 * original text so a stale id never blocks generation.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { composePromptWithAttachedDocs } from "../prompts.js"
import { queryDocs, resetDocIndexCache } from "../../../../services/doc-index.js"

let workDir: string
let originalEnv: string | undefined

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-prompts-attach-"))
  await mkdir(join(workDir, "prd"), { recursive: true })
  await writeFile(
    join(workDir, "prd", "mitra-prd.md"),
    "# Mitra PRD\n\nMitra suspension rules: 3 dispatch missed = 1h suspend.\n",
    "utf8",
  )
  await writeFile(
    join(workDir, "audit.md"),
    "# Audit trail\n\nLog original + edited + editor + reason.\n",
    "utf8",
  )
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

describe("composePromptWithAttachedDocs", () => {
  it("returns the original text when no docs are attached", async () => {
    const out = await composePromptWithAttachedDocs("Build a thing", undefined)
    expect(out).toBe("Build a thing")
    const out2 = await composePromptWithAttachedDocs("Build a thing", [])
    expect(out2).toBe("Build a thing")
  })

  it("prepends a referenced-docs block when ids resolve", async () => {
    const list = await queryDocs({ q: "mitra" })
    const id = list[0]!.id
    const out = await composePromptWithAttachedDocs("Tambahin chart", [id])
    expect(out).toContain("## Referenced documents")
    expect(out).toContain("3 dispatch missed")
    expect(out).toContain("## User prompt")
    expect(out).toContain("Tambahin chart")
    // User prompt MUST come after the doc block.
    expect(out.indexOf("## Referenced documents")).toBeLessThan(
      out.indexOf("## User prompt"),
    )
  })

  it("silently drops unknown ids but keeps the prompt + valid docs", async () => {
    const list = await queryDocs({ q: "mitra" })
    const id = list[0]!.id
    const out = await composePromptWithAttachedDocs("Test prompt", [id, "deadbeefdeadbeef"])
    expect(out).toContain("## Referenced documents")
    expect(out).toContain("3 dispatch missed")
    expect(out).toContain("Test prompt")
  })

  it("falls back to original text when EVERY id is unknown", async () => {
    const out = await composePromptWithAttachedDocs("Pure text", ["deadbeefdeadbeef"])
    // renderReferencedDocsBlock returns "" for zero hydrated docs, so the
    // composer falls back to the bare prompt.
    expect(out).toBe("Pure text")
  })
})
