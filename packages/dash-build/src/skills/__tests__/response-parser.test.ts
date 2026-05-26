import { describe, expect, it } from "vitest"
import {
  extractText,
  isSafePath,
  parseFenceHeader,
  parseResponse,
} from "../response-parser.js"

describe("isSafePath", () => {
  it("accepts relative POSIX paths", () => {
    expect(isSafePath("src/components/x.tsx")).toBe(true)
  })

  it("rejects absolute paths", () => {
    expect(isSafePath("/etc/passwd")).toBe(false)
  })

  it("rejects path traversal", () => {
    expect(isSafePath("../../etc/passwd")).toBe(false)
  })

  it("rejects empty paths", () => {
    expect(isSafePath("")).toBe(false)
  })
})

describe("parseResponse", () => {
  it("returns empty result for empty input", () => {
    // Sprint 2B added an empty `patches` array to the schema; both shapes
    // are valid because callers iterate either field.
    const r = parseResponse("")
    expect(r.files).toEqual([])
    expect(r.patches ?? []).toEqual([])
    expect(r.explanation).toBe("")
  })

  it("extracts a single fenced file block with bracketed path", () => {
    const raw = [
      "Here is the file:",
      "",
      "```tsx [src/components/button.tsx]",
      "export const Button = () => <button>x</button>",
      "```",
      "",
      "Done.",
    ].join("\n")
    const r = parseResponse(raw)
    expect(r.files).toHaveLength(1)
    expect(r.files[0]).toMatchObject({
      path: "src/components/button.tsx",
      language: "tsx",
    })
    expect(r.files[0].content).toContain("export const Button")
    expect(r.explanation).toContain("Done.")
    expect(r.explanation).toContain("Here is the file")
  })

  it("extracts multiple file blocks", () => {
    const raw = [
      "```tsx [a.tsx]",
      "A",
      "```",
      "And",
      "```ts [b.ts]",
      "B",
      "```",
    ].join("\n")
    const r = parseResponse(raw)
    expect(r.files.map((f) => f.path)).toEqual(["a.tsx", "b.ts"])
  })

  it("ignores code blocks without a bracketed path", () => {
    const raw = [
      "```tsx",
      "inline example",
      "```",
      "```tsx [real.tsx]",
      "real",
      "```",
    ].join("\n")
    const r = parseResponse(raw)
    expect(r.files).toHaveLength(1)
    expect(r.files[0].path).toBe("real.tsx")
  })

  it("rejects unsafe paths", () => {
    const raw = "```tsx [../../etc/passwd]\nbad\n```"
    const r = parseResponse(raw)
    expect(r.files).toHaveLength(0)
  })

  it("defaults language to text when absent", () => {
    const raw = "``` [README]\nhi\n```"
    const r = parseResponse(raw)
    expect(r.files[0].language).toBe("text")
  })

  it("strips file blocks from explanation", () => {
    const raw = ["before", "```ts [x.ts]", "code", "```", "after"].join("\n")
    const r = parseResponse(raw)
    expect(r.explanation).not.toContain("code")
    expect(r.explanation).toContain("before")
    expect(r.explanation).toContain("after")
  })
})

describe("parseFenceHeader (Sprint 2B)", () => {
  it("classifies legacy language tokens as new-file", () => {
    expect(parseFenceHeader("tsx")).toEqual({ mode: "new-file", language: "tsx" })
    expect(parseFenceHeader("ts")).toEqual({ mode: "new-file", language: "ts" })
  })

  it("classifies mode=new-file fence header", () => {
    expect(parseFenceHeader("mode=new-file")).toEqual({
      mode: "new-file",
      language: "text",
    })
  })

  it("classifies mode=patch fence header with default language=diff", () => {
    expect(parseFenceHeader("mode=patch")).toEqual({
      mode: "patch",
      language: "diff",
    })
  })

  it("classifies mode=new-file:tsx as new-file + tsx language", () => {
    expect(parseFenceHeader("mode=new-file:tsx")).toEqual({
      mode: "new-file",
      language: "tsx",
    })
  })

  it("classifies mode=patch:tsx as patch with tsx language hint", () => {
    expect(parseFenceHeader("mode=patch:tsx")).toEqual({
      mode: "patch",
      language: "tsx",
    })
  })
})

describe("parseResponse (Sprint 2B mode= variants)", () => {
  it("parses a mode=new-file block as a regular file", () => {
    const raw = [
      "```mode=new-file [src/foo.tsx]",
      "export const Foo = () => null",
      "```",
    ].join("\n")
    const r = parseResponse(raw)
    expect(r.files).toHaveLength(1)
    expect(r.files[0]).toMatchObject({
      path: "src/foo.tsx",
      content: "export const Foo = () => null",
    })
    expect(r.patches ?? []).toHaveLength(0)
  })

  it("parses a mode=patch block into ParsedPatch", () => {
    const patchBody = [
      "@@ -10,3 +10,4 @@",
      " existing line",
      "+new line",
      " another existing line",
    ].join("\n")
    const raw = ["```mode=patch [src/foo.tsx]", patchBody, "```"].join("\n")
    const r = parseResponse(raw)
    expect(r.files).toHaveLength(0)
    expect(r.patches).toHaveLength(1)
    expect(r.patches![0]).toMatchObject({
      kind: "patch",
      path: "src/foo.tsx",
      language: "diff",
    })
    expect(r.patches![0].patchContent).toContain("@@ -10,3 +10,4 @@")
    expect(r.patches![0].patchContent).toContain("+new line")
  })

  it("supports mixed output (new-file + patch in one response)", () => {
    const raw = [
      "```mode=new-file [src/new.tsx]",
      "export const N = () => null",
      "```",
      "",
      "```mode=patch [src/existing.tsx]",
      "@@ -1,1 +1,2 @@",
      " old",
      "+added",
      "```",
    ].join("\n")
    const r = parseResponse(raw)
    expect(r.files.map((f) => f.path)).toEqual(["src/new.tsx"])
    expect((r.patches ?? []).map((p) => p.path)).toEqual(["src/existing.tsx"])
  })

  it("strips patch blocks from explanation text", () => {
    const raw = [
      "before patch",
      "```mode=patch [a.ts]",
      "@@ -1,1 +1,2 @@",
      " x",
      "+y",
      "```",
      "after patch",
    ].join("\n")
    const r = parseResponse(raw)
    expect(r.explanation).toContain("before patch")
    expect(r.explanation).toContain("after patch")
    expect(r.explanation).not.toContain("@@ -1,1")
  })

  it("rejects unsafe patch paths same as new-file paths", () => {
    const raw = "```mode=patch [../../etc/passwd]\n@@ -1,1 +1,2 @@\n a\n+b\n```"
    const r = parseResponse(raw)
    expect(r.files).toHaveLength(0)
    expect(r.patches ?? []).toHaveLength(0)
  })
})

describe("extractText", () => {
  it("concats text blocks", () => {
    const t = extractText({
      content: [
        { type: "text", text: "hello" },
        { type: "text", text: "world" },
      ],
    })
    expect(t).toBe("hello\nworld")
  })

  it("skips non-text blocks", () => {
    const t = extractText({
      content: [
        { type: "tool_use" } as { type: string; text?: string },
        { type: "text", text: "ok" },
      ],
    })
    expect(t).toBe("ok")
  })
})
