import { describe, expect, it } from "vitest"
import {
  composeSystemPrompt,
  inferRepoContextPack,
  type ComposeInput,
} from "../prompt-composer.js"
import { resolvePlacement } from "../output-mode-detector.js"
import type {
  DesignContext,
  ExistingFilesContext,
  PRDEval,
  SkillContext,
} from "../types.js"

// ---------------------------------------------------------------------------
// Minimal builders — only the fields composeSystemPrompt reads.
// ---------------------------------------------------------------------------

function prd(): PRDEval {
  return {
    needsClarification: false,
    questions: [],
    summary: "Add a filter to the existing provider page.",
    sectionsTouched: 1,
    confidence: 80,
  }
}

function design(): DesignContext {
  return {
    designContract: "",
    cardinalRules: "",
    voiceRules: "",
    manifest: null,
    layeredArchitecture: "Layer 1 atoms first.",
    loadedSources: [],
    missingSources: [],
  }
}

function skill(): SkillContext {
  return {
    systemAppend: "",
    sources: [],
    detectedRepoStack: null,
    schemaVersion: 4,
  }
}

function existingFiles(): ExistingFilesContext {
  return {
    resolutions: [
      {
        filePath: "/repo/src/pages/provider/index.tsx",
        route: "/provider",
        confidence: 0.9,
        reason: "route match",
      },
    ],
    files: [
      {
        filePath: "/repo/src/pages/provider/index.tsx",
        language: "tsx",
        content: "export default function Provider() { return null }",
        truncated: false,
        fullSize: 50,
      },
    ],
  }
}

function baseInput(): ComposeInput {
  return {
    prd: prd(),
    design: design(),
    skill: skill(),
    repoContext: inferRepoContextPack({
      prompt: "tambah filter di /provider yang existing",
      selectedRepo: "dash/backoffice",
      detectedRepo: "backoffice",
      detectedLayer: "ride",
      repoPath: null,
    }),
    existingFiles: existingFiles(),
  }
}

describe("composeSystemPrompt — deterministic placement (P14)", () => {
  it("instructs placement under the resolved file's directory", () => {
    const prompt = composeSystemPrompt(baseInput())
    // New files MUST be told to land in the SAME directory as the resolved
    // reference file — src/pages/provider — not a parallel components dir.
    expect(prompt).toContain("/repo/src/pages/provider/")
    expect(prompt).toContain("SAME directory")
  })

  it("biases toward patching the surfaced index instead of a parallel route", () => {
    const prompt = composeSystemPrompt(baseInput())
    expect(prompt).toContain("/repo/src/pages/provider/index.tsx")
    expect(prompt.toLowerCase()).toContain("patch")
    // The directive must explicitly forbid a parallel route file.
    expect(prompt.toLowerCase()).toContain("parallel")
  })

  it("is deterministic: identical inputs produce identical prompts", () => {
    const a = composeSystemPrompt(baseInput())
    const b = composeSystemPrompt(baseInput())
    expect(a).toBe(b)
  })

  it("resolves placement deterministically regardless of array order", () => {
    const ctxA = existingFiles()
    const ctxB: ExistingFilesContext = {
      // Reverse-ordered resolutions with an extra lower-confidence entry.
      resolutions: [
        {
          filePath: "/repo/src/components/provider/Filter.tsx",
          route: "/provider",
          confidence: 0.4,
          reason: "weak component match",
        },
        ...ctxA.resolutions,
      ],
      files: ctxA.files,
    }
    const pa = resolvePlacement(ctxA)
    const pb = resolvePlacement(ctxB)
    expect(pa.directory).toBe("/repo/src/pages/provider")
    expect(pb.directory).toBe("/repo/src/pages/provider")
    expect(pb.patchTarget).toBe("/repo/src/pages/provider/index.tsx")
  })

  it("emits no placement directive when no files surfaced", () => {
    const input = baseInput()
    input.existingFiles = { resolutions: [], files: [] }
    const prompt = composeSystemPrompt(input)
    expect(prompt).not.toContain("FILE PLACEMENT (deterministic")
  })
})
