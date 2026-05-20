import { describe, expect, it } from "vitest"
import { extractText, isSafePath, parseResponse } from "../response-parser.js"

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
    expect(parseResponse("")).toEqual({ files: [], explanation: "" })
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
