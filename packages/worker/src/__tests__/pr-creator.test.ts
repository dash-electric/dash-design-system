import { describe, it, expect } from "vitest"
import {
  buildBranchName,
  buildPrBody,
  buildPrTitle,
  createPr,
} from "../pr-creator.js"
import { loadConfig } from "../config.js"
import type { GapEntry } from "../gap-queue.js"
import type { ValidationResult } from "../types.js"

function gap(): GapEntry {
  return {
    id: "abc12345-def6-7890-1111-222233334444",
    created_at: new Date().toISOString(),
    description: "no image-editor in DS",
    severity: "high",
    repo: "halo-dash-fe",
    prompt: null,
    generated_block_path: null,
    status: "pending",
  }
}

function validation(score: number): ValidationResult {
  return {
    score,
    criteria: [
      { id: "dash-primitives", weight: 30, passed: true, note: "ok" },
      { id: "dash-tokens", weight: 20, passed: true, note: "ok" },
    ],
    typecheckPassed: true,
    testsPassed: true,
    auditClean: true,
  }
}

describe("buildBranchName / buildPrTitle / buildPrBody", () => {
  it("builds branch with short id", () => {
    expect(buildBranchName(gap())).toBe("hermes/abc12345")
  })

  it("includes block name in title", () => {
    const t = buildPrTitle({
      gap: gap(),
      blockName: "image-editor-with-audit",
      blockPath: "/tmp/x.tsx",
      validation: validation(92),
      draft: false,
    })
    expect(t).toContain("image-editor-with-audit")
    expect(t).toContain("Hermes")
  })

  it("body contains score, install hint, criteria", () => {
    const body = buildPrBody({
      gap: gap(),
      blockName: "image-editor-with-audit",
      blockPath: "/tmp/x.tsx",
      validation: validation(92),
      draft: false,
    })
    expect(body).toContain("92 / 100")
    expect(body).toContain("dashkit add image-editor-with-audit")
    expect(body).toContain("dash-primitives")
  })

  it("body notes draft vs auto-merge state", () => {
    const draftBody = buildPrBody({
      gap: gap(),
      blockName: "x",
      blockPath: "/tmp/x.tsx",
      validation: validation(70),
      draft: true,
    })
    expect(draftBody).toContain("draft")
    const liveBody = buildPrBody({
      gap: gap(),
      blockName: "x",
      blockPath: "/tmp/x.tsx",
      validation: validation(92),
      draft: false,
    })
    expect(liveBody).toContain("ready-to-merge")
  })
})

describe("createPr", () => {
  it("returns a stub when dryRun is true (no fetch call)", async () => {
    const config = loadConfig({ env: { GITHUB_TOKEN: "ghp" }, dryRun: true })
    let calls = 0
    const result = await createPr(
      {
        gap: gap(),
        blockName: "x",
        blockPath: "/tmp/x.tsx",
        validation: validation(92),
        draft: false,
      },
      config,
      {
        fetch: async () => {
          calls++
          return { ok: true, status: 201, json: async () => ({}), text: async () => "" }
        },
      },
    )
    expect(result.stubbed).toBe(true)
    expect(calls).toBe(0)
  })

  it("returns a stub when token is missing", async () => {
    const config = loadConfig({ env: {} })
    const result = await createPr(
      {
        gap: gap(),
        blockName: "x",
        blockPath: "/tmp/x.tsx",
        validation: validation(92),
        draft: false,
      },
      config,
    )
    expect(result.stubbed).toBe(true)
  })

  it("calls the GitHub API when token + fetch are present", async () => {
    const config = loadConfig({ env: { GITHUB_TOKEN: "ghp_fake" } })
    let calledUrl = ""
    let calledBody = ""
    const fetchImpl = async (url: string, init?: { body?: string }) => {
      calledUrl = url
      calledBody = init?.body ?? ""
      return {
        ok: true,
        status: 201,
        json: async () => ({ html_url: "https://github.com/foo/pull/1", number: 1 }),
        text: async () => "",
      }
    }
    const result = await createPr(
      {
        gap: gap(),
        blockName: "image-editor",
        blockPath: "/tmp/x.tsx",
        validation: validation(92),
        draft: false,
      },
      config,
      { fetch: fetchImpl },
    )
    expect(calledUrl).toContain("/repos/irfanputra-design/dash/pulls")
    expect(calledBody).toContain("hermes/abc12345")
    expect(result.url).toBe("https://github.com/foo/pull/1")
    expect(result.number).toBe(1)
    expect(result.stubbed).toBe(false)
  })

  it("downgrades to stub when GitHub returns non-ok", async () => {
    const config = loadConfig({ env: { GITHUB_TOKEN: "ghp_fake" } })
    const result = await createPr(
      {
        gap: gap(),
        blockName: "x",
        blockPath: "/tmp/x.tsx",
        validation: validation(92),
        draft: false,
      },
      config,
      {
        fetch: async () => ({
          ok: false,
          status: 422,
          json: async () => ({}),
          text: async () => "",
        }),
      },
    )
    expect(result.stubbed).toBe(true)
    expect(result.url).toBeNull()
  })
})
