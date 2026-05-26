import { describe, expect, it } from "vitest"
import {
  describeOutputMode,
  detectOutputMode,
  shouldEditExisting,
} from "../output-mode-detector.js"
import type { ExistingFileContent, ExistingFilesContext } from "../types.js"

function ctx(
  files: ExistingFileContent[] = [],
  resolutions: ExistingFilesContext["resolutions"] = [],
): ExistingFilesContext {
  return { resolutions, files }
}

function file(filePath: string): ExistingFileContent {
  return {
    filePath,
    language: "tsx",
    content: "export const X = () => null",
    truncated: false,
    fullSize: 30,
  }
}

describe("detectOutputMode", () => {
  it("returns patch when edit verb + existing file present", () => {
    const mode = detectOutputMode({
      prompt: "tambah filter di /provider yang existing",
      existingFiles: ctx([file("/repo/src/pages/provider/index.tsx")], [
        {
          filePath: "/repo/src/pages/provider/index.tsx",
          route: "/provider",
          confidence: 0.9,
          reason: "route match",
        },
      ]),
    })
    expect(mode).toBe("patch")
  })

  it("returns patch on English edit verbs (modify / change / update)", () => {
    for (const verb of ["modify", "change", "update", "edit"]) {
      const mode = detectOutputMode({
        prompt: `${verb} the existing /provider page`,
        existingFiles: ctx([file("/repo/src/pages/provider/index.tsx")]),
      })
      expect(mode, `verb=${verb}`).toBe("patch")
    }
  })

  it("returns new-file when create verb + no confident path match", () => {
    const mode = detectOutputMode({
      prompt: "bikin halaman baru untuk reports",
      existingFiles: ctx([]),
    })
    expect(mode).toBe("new-file")
  })

  it("returns new-file when 'create new page' phrasing with no files", () => {
    const mode = detectOutputMode({
      prompt: "create a new dashboard page for finance ops",
      existingFiles: null,
    })
    expect(mode).toBe("new-file")
  })

  it("returns mixed when both create and edit verbs collide", () => {
    const mode = detectOutputMode({
      prompt: "tambah filter di /provider AND create a brand new modal",
      existingFiles: ctx([file("/repo/src/pages/provider/index.tsx")]),
    })
    expect(mode).toBe("mixed")
  })

  it("returns mixed for ambiguous prompts with neither verb cluster", () => {
    const mode = detectOutputMode({
      prompt: "Mitra dashboard with KPIs",
      existingFiles: ctx([]),
    })
    expect(mode).toBe("mixed")
  })

  it("returns patch when 'yang sudah ada' phrasing fires Indonesian existing hint", () => {
    const mode = detectOutputMode({
      prompt: "rapikan filter di halaman provider yang sudah ada",
      existingFiles: ctx([file("/repo/src/pages/provider.tsx")]),
    })
    expect(mode).toBe("patch")
  })

  it("returns mixed when edit intent but no existing file injected", () => {
    const mode = detectOutputMode({
      prompt: "edit the provider page filter",
      existingFiles: ctx([]),
    })
    expect(mode).toBe("mixed")
  })

  it("returns patch when edit intent + only resolutions (no file content) present", () => {
    // Edge case: resolver surfaced a confident path but content reader skipped
    // the file. Still safe to declare patch — composer will warn instead.
    const mode = detectOutputMode({
      prompt: "edit /provider",
      existingFiles: ctx(
        [],
        [
          {
            filePath: "/repo/src/pages/provider.tsx",
            route: "/provider",
            confidence: 0.95,
            reason: "route",
          },
        ],
      ),
    })
    expect(mode).toBe("patch")
  })
})

describe("shouldEditExisting", () => {
  it("returns true when prompt has edit verb", () => {
    expect(
      shouldEditExisting(file("/repo/src/pages/provider.tsx"), "edit the filter"),
    ).toBe(true)
  })

  it("returns true when prompt mentions the file basename", () => {
    expect(
      shouldEditExisting(file("/repo/src/pages/provider.tsx"), "update provider.tsx"),
    ).toBe(true)
  })

  it("returns false when prompt only has create intent", () => {
    expect(
      shouldEditExisting(file("/repo/src/pages/provider.tsx"), "bikin halaman baru"),
    ).toBe(false)
  })

  it("guards null file gracefully", () => {
    expect(
      shouldEditExisting(
        undefined as unknown as ExistingFileContent,
        "edit this",
      ),
    ).toBe(false)
  })
})

describe("describeOutputMode", () => {
  it("emits patch instruction for patch mode", () => {
    expect(describeOutputMode("patch")).toMatch(/MUST use ```mode=patch/)
  })
  it("emits new-file instruction for new-file mode", () => {
    expect(describeOutputMode("new-file")).toMatch(/mode=new-file/)
  })
  it("emits mixed instruction for mixed mode", () => {
    expect(describeOutputMode("mixed")).toMatch(/MIXED/)
  })
})
