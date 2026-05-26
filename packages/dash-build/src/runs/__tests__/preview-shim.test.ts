import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, rm, writeFile, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { spawn } from "node:child_process"
import {
  BACKOFFICE_SHIM_V1,
  BACKOFFICE_SHIM_V2,
  PORTAL_V2_SHIM_V1,
  PORTAL_V2_SHIM_V2,
  applyShim,
  getShimForRepo,
  readShimFile,
  shimCommitMessage,
  verifyShimNotInBranch,
} from "../preview-shim.js"

let workDir: string

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "dash-build-shim-"))
})

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 })
})

interface RunResult {
  stdout: string
  stderr: string
  code: number
}

async function run(bin: string, args: string[], cwd: string): Promise<RunResult> {
  return await new Promise<RunResult>((resolveProc) => {
    const child = spawn(bin, args, { cwd, stdio: ["ignore", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (d) => {
      stdout += d.toString("utf8")
    })
    child.stderr.on("data", (d) => {
      stderr += d.toString("utf8")
    })
    child.on("close", (code) => {
      resolveProc({ stdout, stderr, code: code ?? 1 })
    })
  })
}

async function initRepo(): Promise<void> {
  await run("git", ["init", "-q", "-b", "main"], workDir)
  await run("git", ["config", "user.email", "test@dashbuild.local"], workDir)
  await run("git", ["config", "user.name", "Dash Build Test"], workDir)
  await run("git", ["config", "commit.gpgsign", "false"], workDir)
  // Seed an initial commit so HEAD exists.
  await writeFile(join(workDir, "README.md"), "# seed\n", "utf8")
  await run("git", ["add", "README.md"], workDir)
  await run("git", ["commit", "-q", "-m", "seed"], workDir)
}

describe("preview-shim registry", () => {
  it("returns V2 for dash/backoffice (F3 — active shim)", () => {
    const s = getShimForRepo("dash/backoffice")
    expect(s).toBe(BACKOFFICE_SHIM_V2)
    expect(s?.version).toBe(2)
  })

  it("returns V2 for dash/portal-v2 (F3 — active shim)", () => {
    const s = getShimForRepo("dash/portal-v2")
    expect(s).toBe(PORTAL_V2_SHIM_V2)
    expect(s?.version).toBe(2)
  })

  it("returns null for unknown repo", () => {
    expect(getShimForRepo("dash/unknown")).toBeNull()
  })

  it("filesAffected matches patchContent paths (all versions)", () => {
    for (const shim of [
      BACKOFFICE_SHIM_V1,
      BACKOFFICE_SHIM_V2,
      PORTAL_V2_SHIM_V1,
      PORTAL_V2_SHIM_V2,
    ]) {
      expect(shim.filesAffected).toEqual(shim.patchContent.map((p) => p.path))
    }
  })

  it("v1 commit message follows exact contract (backward compat)", () => {
    expect(shimCommitMessage(BACKOFFICE_SHIM_V1)).toBe(
      "preview-shim apply v1 [DO NOT MERGE]",
    )
  })

  it("v2 commit message bumps to v2", () => {
    expect(shimCommitMessage(BACKOFFICE_SHIM_V2)).toBe(
      "preview-shim apply v2 [DO NOT MERGE]",
    )
    expect(shimCommitMessage(PORTAL_V2_SHIM_V2)).toBe(
      "preview-shim apply v2 [DO NOT MERGE]",
    )
  })
})

describe("F3 — V2 axios mock interceptor", () => {
  function getAxiosStubContent(shim: typeof BACKOFFICE_SHIM_V2): string {
    const op = shim.patchContent.find(
      (p) => p.path === "src/utils/axios.js" || p.path === "src/services/apiService.js",
    )
    if (!op) throw new Error("axios/apiService stub not found in shim")
    return op.content
  }

  it("V2 backoffice axios stub embeds a 401-catching response interceptor", () => {
    const src = getAxiosStubContent(BACKOFFICE_SHIM_V2)
    expect(src).toMatch(/interceptors\.response\.use/)
    expect(src).toMatch(/error\.response\.status === 401/)
    expect(src).toMatch(/_previewMock: true/)
    expect(src).toMatch(/generatePreviewMockResponse/)
    // Must be gated by the preview flag so prod bundles never see mocks.
    expect(src).toMatch(/NEXT_PUBLIC_DASH_BUILD_PREVIEW/)
  })

  it("V2 portal apiService stub embeds the same interceptor + flag gate", () => {
    const src = getAxiosStubContent(PORTAL_V2_SHIM_V2)
    expect(src).toMatch(/interceptors\.response\.use/)
    expect(src).toMatch(/error\.response\.status === 401/)
    expect(src).toMatch(/_previewMock: true/)
    expect(src).toMatch(/generatePreviewMockResponse/)
    expect(src).toMatch(/NEXT_PUBLIC_DASH_BUILD_PREVIEW/)
  })

  it("V1 backoffice stub is NOT updated with the interceptor (snapshot preserved)", () => {
    const src = getAxiosStubContent(BACKOFFICE_SHIM_V1)
    expect(src).not.toMatch(/_previewMock: true/)
    expect(src).not.toMatch(/generatePreviewMockResponse/)
  })

  /**
   * Execute the embedded `generatePreviewMockResponse` helper standalone
   * and verify per-URL fixture shape. We extract just the function source
   * so we don't need to evaluate the entire axios module (which imports
   * `axios` + `uuid` that aren't bundled in the test process).
   */
  function evalMockHelper(): (url: string, config?: unknown) => unknown {
    const src = getAxiosStubContent(BACKOFFICE_SHIM_V2)
    const start = src.indexOf("function generatePreviewMockResponse")
    expect(start).toBeGreaterThan(-1)
    // Walk forward to find the matching closing brace by counting depth.
    let depth = 0
    let foundBody = false
    let i = start
    for (; i < src.length; i++) {
      const ch = src[i]
      if (ch === "{") {
        depth++
        foundBody = true
      } else if (ch === "}") {
        depth--
        if (foundBody && depth === 0) {
          i++
          break
        }
      }
    }
    const fnSrc = src.slice(start, i)
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return new Function(`${fnSrc}\nreturn generatePreviewMockResponse;`)() as (
      url: string,
      config?: unknown,
    ) => unknown
  }

  it("generatePreviewMockResponse returns mitra fixtures for /v3/drivers", () => {
    const gen = evalMockHelper()
    const out = gen("/v3/drivers?limit=20") as Array<{ uid: string; name: string }>
    expect(Array.isArray(out)).toBe(true)
    expect(out.length).toBeGreaterThanOrEqual(3)
    expect(out[0]).toHaveProperty("uid")
    expect(out[0]).toHaveProperty("name")
  })

  it("generatePreviewMockResponse returns deliveries for /v1/deliveries", () => {
    const gen = evalMockHelper()
    const out = gen("/v1/deliveries") as Array<{ id: string }>
    expect(Array.isArray(out)).toBe(true)
    expect(out.length).toBeGreaterThanOrEqual(1)
    expect(out[0]).toHaveProperty("id")
  })

  it("generatePreviewMockResponse returns orders for /v3/orders", () => {
    const gen = evalMockHelper()
    const out = gen("/v3/orders") as Array<{ id: string; customer: string }>
    expect(Array.isArray(out)).toBe(true)
    expect(out[0]).toHaveProperty("customer")
  })

  it("generatePreviewMockResponse returns { ok: true } for /health", () => {
    const gen = evalMockHelper()
    const out = gen("/health") as { ok: boolean; mock?: boolean }
    expect(out.ok).toBe(true)
    expect(out.mock).toBe(true)
  })

  it("generatePreviewMockResponse returns empty array for unknown list endpoints", () => {
    const gen = evalMockHelper()
    const out = gen("/v3/unknown-list")
    // Default branch: empty object (not a list-shaped URL).
    expect(out).toEqual({})
  })
})

describe("applyShim", () => {
  it("fails fast when workspace dir is missing", async () => {
    const res = await applyShim("/nonexistent/path/xyz", BACKOFFICE_SHIM_V1)
    expect(res.ok).toBe(false)
    expect(res.error).toMatch(/workspace not found/)
  })

  it("fails when not a git repo", async () => {
    const res = await applyShim(workDir, BACKOFFICE_SHIM_V1)
    expect(res.ok).toBe(false)
    expect(res.error).toMatch(/not a git repo/)
  })

  it("creates parent dirs and writes patch files", async () => {
    await initRepo()
    // Don't pre-create src/lib/ etc — shim should mkdir -p
    const res = await applyShim(workDir, BACKOFFICE_SHIM_V1)
    expect(res.ok).toBe(true)
    expect(res.commitSha).toMatch(/^[0-9a-f]{40}$/)

    for (const op of BACKOFFICE_SHIM_V1.patchContent) {
      const written = await readFile(join(workDir, op.path), "utf8")
      expect(written).toBe(op.content)
    }
  })

  it("commit subject matches shimCommitMessage()", async () => {
    await initRepo()
    const res = await applyShim(workDir, BACKOFFICE_SHIM_V1)
    expect(res.ok).toBe(true)
    const log = await run("git", ["log", "-1", "--format=%s"], workDir)
    expect(log.stdout.trim()).toBe(shimCommitMessage(BACKOFFICE_SHIM_V1))
  })

  it("returns SHA that is the new HEAD", async () => {
    await initRepo()
    const res = await applyShim(workDir, BACKOFFICE_SHIM_V1)
    expect(res.ok).toBe(true)
    const head = await run("git", ["rev-parse", "HEAD"], workDir)
    expect(head.stdout.trim()).toBe(res.commitSha)
  })

  it("rejects shim patch paths attempting traversal", async () => {
    await initRepo()
    const malicious = {
      repoSlug: "dash/test",
      version: 99,
      patchContent: [{ path: "../../etc/passwd", content: "nope" }],
      filesAffected: ["../../etc/passwd"],
    }
    const res = await applyShim(workDir, malicious)
    expect(res.ok).toBe(false)
    expect(res.error).toMatch(/unsafe shim path/)
  })

  it("readShimFile rejects path traversal", async () => {
    await initRepo()
    expect(await readShimFile(workDir, "../../etc/passwd")).toBeNull()
  })
})

describe("verifyShimNotInBranch", () => {
  it("returns true on a clean branch (no shim commit)", async () => {
    await initRepo()
    expect(await verifyShimNotInBranch(workDir)).toBe(true)
    expect(await verifyShimNotInBranch(workDir, "main")).toBe(true)
  })

  it("returns false after applyShim", async () => {
    await initRepo()
    await applyShim(workDir, BACKOFFICE_SHIM_V1)
    expect(await verifyShimNotInBranch(workDir)).toBe(false)
  })

  it("returns true for a branch that excludes the shim commit", async () => {
    await initRepo()
    const baseSha = (await run("git", ["rev-parse", "HEAD"], workDir)).stdout.trim()
    await applyShim(workDir, BACKOFFICE_SHIM_V1)
    // Create a branch from the pre-shim commit (simulates D2's publish branch
    // built via cherry-pick exclude).
    await run("git", ["branch", "publish-clean", baseSha], workDir)
    expect(await verifyShimNotInBranch(workDir, "publish-clean")).toBe(true)
    expect(await verifyShimNotInBranch(workDir, "main")).toBe(false)
  })

  it("returns true for a missing ref (caller will surface own error)", async () => {
    await initRepo()
    expect(await verifyShimNotInBranch(workDir, "nonexistent-branch")).toBe(true)
  })

  it("detects shim commits across version bumps", async () => {
    await initRepo()
    // Hand-craft a v2 shim commit using --allow-empty.
    await mkdir(join(workDir, "src", "lib"), { recursive: true })
    await writeFile(join(workDir, "src", "lib", "firebase.js"), "// v2 stub", "utf8")
    await run("git", ["add", "."], workDir)
    await run(
      "git",
      ["commit", "-q", "-m", "preview-shim apply v2 [DO NOT MERGE]"],
      workDir,
    )
    expect(await verifyShimNotInBranch(workDir)).toBe(false)
  })
})
