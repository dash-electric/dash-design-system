import { describe, it, expect } from "vitest"
import {
  composeUserPrompt,
  extractTsx,
  generateBlock,
  resolveRegistryPath,
  type AnthropicClient,
} from "../generator.js"
import { loadConfig } from "../config.js"
import { pickScaffold } from "../scaffold-picker.js"
import type { GapEntry } from "../gap-queue.js"

function gap(overrides: Partial<GapEntry> = {}): GapEntry {
  return {
    id: "gap_test_image_1",
    created_at: new Date().toISOString(),
    description: "no image-editor in DS",
    severity: "high",
    repo: "halo-dash-fe",
    prompt: "build a proof edit modal",
    generated_block_path: null,
    status: "pending",
    ...overrides,
  }
}

describe("composeUserPrompt", () => {
  it("includes gap description, severity, scaffold name, and rules", () => {
    const sc = pickScaffold("no image-editor for proof")
    const prompt = composeUserPrompt(
      gap({ description: "no image-editor for proof" }),
      sc,
    )
    expect(prompt).toContain("image-editor-with-audit")
    expect(prompt).toContain("Use `@/registry/dash/*` primitives")
    expect(prompt).toContain("severity: high")
    expect(prompt).toContain("repo: halo-dash-fe")
  })
})

describe("extractTsx", () => {
  it("returns concatenated text blocks unchanged", () => {
    const out = extractTsx({
      content: [
        { type: "text", text: "export function X() { return null }" },
      ],
    })
    expect(out).toContain("export function X")
  })

  it("strips fenced ```tsx blocks", () => {
    const out = extractTsx({
      content: [
        { type: "text", text: "```tsx\nexport function X() { return null }\n```" },
      ],
    })
    expect(out).toBe("export function X() { return null }")
  })
})

describe("resolveRegistryPath", () => {
  it("places blocks under <root>/blocks/<name>.tsx", () => {
    const config = loadConfig({ env: { REGISTRY_ROOT: "/tmp/dash/registry" } })
    const sc = pickScaffold("image proof editor")
    const p = resolveRegistryPath(config, sc)
    expect(p).toBe("/tmp/dash/registry/blocks/image-editor-with-audit.tsx")
  })
})

describe("generateBlock", () => {
  it("returns stub source when dryRun is true (no client used)", async () => {
    const config = loadConfig({ env: {}, dryRun: true })
    const result = await generateBlock(gap(), config)
    expect(result.stubbed).toBe(true)
    expect(result.source).toContain("ImageEditorWithAudit")
    expect(result.writtenTo).toBeNull()
  })

  it("returns stub when no client passed even with API key set", async () => {
    const config = loadConfig({ env: { ANTHROPIC_API_KEY: "sk-fake" } })
    const writes: Array<{ path: string; contents: string }> = []
    const result = await generateBlock(gap(), config, {
      writeFile: async (path, contents) => {
        writes.push({ path, contents })
      },
    })
    expect(result.stubbed).toBe(true)
    expect(writes.length).toBe(1)
  })

  it("invokes the client + skill loader when both are wired", async () => {
    const config = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-fake",
        REGISTRY_ROOT: "/tmp/dash/registry",
      },
    })
    let receivedSystem = ""
    let receivedUser = ""
    const fakeClient: AnthropicClient = {
      messages: {
        create: async ({ system, messages }) => {
          receivedSystem = system
          receivedUser = messages[0]?.content ?? ""
          return {
            content: [
              {
                type: "text",
                text: "```tsx\nexport function ImageEditorWithAudit() { return null }\n```",
              },
            ],
            usage: { input_tokens: 100, output_tokens: 50 },
          }
        },
      },
    }
    const writes: Array<{ path: string; contents: string }> = []
    const result = await generateBlock(gap(), config, {
      client: fakeClient,
      skill: async () => ({ systemAppend: "# Dash project context\n## Pinned" }),
      writeFile: async (path, contents) => {
        writes.push({ path, contents })
      },
    })
    expect(result.stubbed).toBe(false)
    expect(result.source).toBe("export function ImageEditorWithAudit() { return null }")
    expect(receivedSystem).toContain("Pinned")
    expect(receivedUser).toContain("image-editor-with-audit")
    expect(result.usage.inputTokens).toBe(100)
    expect(writes[0].path).toContain("/blocks/image-editor-with-audit.tsx")
  })
})
