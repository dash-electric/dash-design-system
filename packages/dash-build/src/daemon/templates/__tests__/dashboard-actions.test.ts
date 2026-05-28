/**
 * Big Bug 4 (2026-05-28) — dashboard `artifactToActions` translator tests.
 *
 * The dashboard turns a `GenerationArtifact` into a Claude Code-style
 * action stream that the chat thread renders verbatim. These tests verify
 * the translation is faithful (counts, tones, expandable detail bodies)
 * and that low-signal lines are dropped (e.g. no "Read context" when the
 * artifact has no contextPack).
 */

import { describe, expect, it } from "vitest"
import { artifactToActions } from "../dashboard.js"
import type { GenerationArtifact } from "../../../pipeline/types.js"

function makeArtifact(
  overrides: Partial<GenerationArtifact> = {},
): GenerationArtifact {
  return {
    promptId: "prm_test",
    files: [
      {
        kind: "file",
        path: "src/components/Foo.tsx",
        language: "tsx",
        content: "x".repeat(8800),
      },
    ],
    explanation: "Generated foo.",
    validation: {
      passed: true,
      score: 92,
      errors: [],
      warnings: [],
    },
    generatedAt: "2026-05-28T12:00:00.000Z",
    previewMode: "component",
    ...overrides,
  }
}

describe("artifactToActions — happy path", () => {
  it("emits generate + validate + preview + status for a minimal artifact", () => {
    const actions = artifactToActions(makeArtifact())
    const kinds = actions.map((a) => a.kind)
    expect(kinds).toEqual(["generate", "validate", "preview", "status"])
    expect(actions[0].summary).toContain("Generated 1 new file")
    expect(actions[0].summary).toContain("8.6 KB")
    expect(actions[1].summary).toContain("Validation passed")
    expect(actions[1].summary).toContain("92/100")
    expect(actions[1].tone).toBe("success")
    expect(actions[2].summary).toBe("Preview: ready")
    expect(actions[3].summary).toContain("Done")
  })

  it("expands the generate action body with one line per file (path · size)", () => {
    const artifact = makeArtifact({
      files: [
        { kind: "file", path: "a.tsx", language: "tsx", content: "y".repeat(512) },
        { kind: "file", path: "b.tsx", language: "tsx", content: "z".repeat(2048) },
      ],
    })
    const actions = artifactToActions(artifact)
    const gen = actions.find((a) => a.kind === "generate")!
    expect(gen.summary).toContain("Generated 2 new files")
    expect(gen.detail).toContain("a.tsx · 512 B")
    expect(gen.detail).toContain("b.tsx · 2.0 KB")
  })
})

describe("artifactToActions — edits / patches", () => {
  it("emits an `edit` action with +X/-Y line counts when patches are present", () => {
    const artifact = makeArtifact({
      files: [],
      patches: [
        {
          kind: "patch",
          path: "src/index.js",
          language: "js",
          patchContent: [
            "--- a/src/index.js",
            "+++ b/src/index.js",
            "@@",
            "+import { Foo } from './Foo'",
            "+const a = 1",
            "-const a = 0",
          ].join("\n"),
        },
      ],
    })
    const actions = artifactToActions(artifact)
    const edit = actions.find((a) => a.kind === "edit")
    expect(edit).toBeDefined()
    expect(edit!.summary).toContain("Edited 1 file")
    expect(edit!.summary).toContain("+2 / -1 lines")
    // Detail carries the raw diff so power users can expand + read it.
    expect(edit!.detail).toContain("src/index.js")
    expect(edit!.detail).toContain("+import { Foo }")
  })

  it("excludes diff header lines (---/+++) from the LoC counter", () => {
    const artifact = makeArtifact({
      files: [],
      patches: [
        {
          kind: "patch",
          path: "x.ts",
          language: "ts",
          patchContent: "--- a/x.ts\n+++ b/x.ts\n@@\n+foo\n-bar",
        },
      ],
    })
    const edit = artifactToActions(artifact).find((a) => a.kind === "edit")!
    expect(edit.summary).toContain("+1 / -1")
  })
})

describe("artifactToActions — context + validation states", () => {
  it("adds a `scan` Read-context action when contextPack is present", () => {
    const artifact = makeArtifact({
      contextPack: {
        selectedRepo: "dash/backoffice",
        repoSlug: "backoffice",
        theme: "shared",
        audience: "ops",
        surface: "mitra detail",
        existingShell: true,
        requiresNavOrRoute: false,
        defaultRoute: "/driver",
        targetRoute: "/driver/[slug]",
        targetNavLabel: "Drivers",
        existingNavItems: ["Drivers", "Routes"],
        routeRequirement: null,
        integrationContract: "",
      } as never,
    })
    const actions = artifactToActions(artifact)
    expect(actions[0].kind).toBe("scan")
    expect(actions[0].summary).toContain("Read context")
    expect(actions[0].summary).toContain("backoffice")
    expect(actions[0].summary).toContain("/driver/[slug]")
    expect(actions[0].detail).toContain("Nav: Drivers")
  })

  it("flips validate tone to `warn` when validation does not pass", () => {
    const artifact = makeArtifact({
      validation: {
        passed: false,
        score: 64,
        errors: [{ message: "banned-import: react-hook-form" } as never],
        warnings: ["coverage low"],
      },
    })
    const validate = artifactToActions(artifact).find((a) => a.kind === "validate")!
    expect(validate.tone).toBe("warn")
    expect(validate.summary).toContain("needs review")
    expect(validate.detail).toContain("banned-import: react-hook-form")
    expect(validate.detail).toContain("coverage low")
  })

  it("marks preview as `warn` when fallback shell is used and no .tsx file exists", () => {
    // Post-pivot behavior: when there's a renderable .tsx/.jsx file in the
    // artifact, Sandpack mounts client-side regardless of legacy iframe
    // bundler result → "ready". Fallback warn only applies when there's
    // genuinely no renderable file to mount.
    const artifact = makeArtifact({
      previewMode: "fallback",
      files: [{ path: "patches.json", content: "[]", bytes: 2 }],
    })
    const preview = artifactToActions(artifact).find((a) => a.kind === "preview")!
    expect(preview.tone).toBe("warn")
    expect(preview.summary).toContain("fallback")
  })

  it("marks preview as `ready` when a .tsx file exists even if legacy iframe bundler said fallback", () => {
    const artifact = makeArtifact({
      previewMode: "fallback",
      files: [{ path: "preview.tsx", content: "export default () => null", bytes: 30 }],
    })
    const preview = artifactToActions(artifact).find((a) => a.kind === "preview")!
    expect(preview.summary).toBe("Preview: ready")
  })
})
