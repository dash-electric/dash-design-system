import { describe, expect, it } from "vitest"
import {
  detectMode,
  type ModeDetectionInput,
  type ModeDetectionResult,
  type ProjectMode,
} from "../mode-detector.js"

// Small builder so each test only specifies the fields it cares about.
function input(over: Partial<ModeDetectionInput>): ModeDetectionInput {
  return {
    prompt: "",
    selectedRepo: null,
    ...over,
  }
}

describe("detectMode — existing-repo (precedence 1: selected known repo)", () => {
  it("returns existing-repo at 0.95 with no clarify when a known repo is selected", () => {
    const r = detectMode(
      input({
        prompt: "tweak the spacing on the dashboard",
        selectedRepo: "dash/backoffice",
        repoIsKnownDashRepo: true,
      }),
    )
    expect(r.mode).toBe("existing-repo")
    expect(r.confidence).toBe(0.95)
    expect(r.needsClarify).toBeUndefined()
  })

  it("selectedRepo OVERRIDES new-product wording — a new module inside backoffice is still existing-repo", () => {
    const r = detectMode(
      input({
        prompt: "add a brand-new module from scratch to backoffice",
        selectedRepo: "dash/backoffice",
        repoIsKnownDashRepo: true,
      }),
    )
    expect(r.mode).toBe("existing-repo")
    expect(r.confidence).toBe(0.95)
    expect(r.needsClarify).toBeUndefined()
  })

  it("selectedRepo OVERRIDES design-system wording — editing tokens inside a repo is existing-repo", () => {
    const r = detectMode(
      input({
        prompt: "swap the accent color token and add a new variant",
        selectedRepo: "dash/portal-v2",
        repoIsKnownDashRepo: true,
      }),
    )
    expect(r.mode).toBe("existing-repo")
    // Known repo path wins at 0.95.
    expect(r.confidence).toBe(0.95)
  })

  it("design-system keywords BUT a repo selected (unknown repo) → existing-repo wins", () => {
    const r = detectMode(
      input({
        prompt: "ganti tema jadi tema baru",
        selectedRepo: "dash/some-repo",
        repoIsKnownDashRepo: false,
      }),
    )
    expect(r.mode).toBe("existing-repo")
    expect(r.confidence).toBe(0.7)
  })
})

describe("detectMode — existing-repo (precedence 2: resolved files)", () => {
  it("returns existing-repo at 0.85 when files resolved (no repo selected)", () => {
    const r = detectMode(
      input({
        prompt: "improve the mitra list page",
        selectedRepo: null,
        resolvedExistingFiles: ["src/pages/mitra/list.tsx"],
      }),
    )
    expect(r.mode).toBe("existing-repo")
    expect(r.confidence).toBe(0.85)
  })

  it("resolved files beat design-system keywords", () => {
    const r = detectMode(
      input({
        prompt: "change the theme of this component",
        selectedRepo: null,
        resolvedExistingFiles: ["src/components/Button.tsx"],
      }),
    )
    expect(r.mode).toBe("existing-repo")
    expect(r.confidence).toBe(0.85)
  })
})

describe("detectMode — design-system (precedence 3)", () => {
  it("returns design-system at 0.7 with clarify for DS keywords + no repo", () => {
    const r = detectMode(
      input({
        prompt: "swap color of the accent and add a new variant to the component library",
        selectedRepo: null,
      }),
    )
    expect(r.mode).toBe("design-system")
    expect(r.confidence).toBe(0.7)
    expect(r.needsClarify).toBeTruthy()
    expect(r.clarifyOptions).toHaveLength(3)
  })

  it("Indonesian: 'ganti warna jadi biru' → design-system", () => {
    const r = detectMode(input({ prompt: "ganti warna jadi biru", selectedRepo: null }))
    expect(r.mode).toBe("design-system")
    expect(r.confidence).toBe(0.7)
  })

  it("'rebrand the foundation tokens' → design-system", () => {
    const r = detectMode(input({ prompt: "rebrand the foundation tokens", selectedRepo: null }))
    expect(r.mode).toBe("design-system")
  })
})

describe("detectMode — blank-product (precedence 4)", () => {
  it("returns blank-product at 0.7 with clarify for greenfield wording + no repo/files", () => {
    const r = detectMode(
      input({ prompt: "build a brand new app from scratch", selectedRepo: null }),
    )
    expect(r.mode).toBe("blank-product")
    expect(r.confidence).toBe(0.7)
    expect(r.needsClarify).toBeTruthy()
    expect(r.clarifyOptions).toHaveLength(3)
  })

  it("Indonesian: 'bikin produk baru dari nol' → blank-product", () => {
    const r = detectMode(input({ prompt: "bikin produk baru dari nol", selectedRepo: null }))
    expect(r.mode).toBe("blank-product")
    expect(r.confidence).toBe(0.7)
  })

  it("'greenfield project, start fresh' → blank-product", () => {
    const r = detectMode(input({ prompt: "greenfield project, start fresh", selectedRepo: null }))
    expect(r.mode).toBe("blank-product")
  })
})

describe("detectMode — ambiguous (precedence 5)", () => {
  it("bare prompt with no signal → ambiguous at 0.3 with needsClarify + clarifyOptions", () => {
    const r = detectMode(input({ prompt: "make it better", selectedRepo: null }))
    expect(r.mode).toBe("ambiguous")
    expect(r.confidence).toBe(0.3)
    expect(r.needsClarify).toBeTruthy()
    expect(r.clarifyOptions).toEqual([
      "Repo existing (improve yang udah live)",
      "Produk baru (dari nol)",
      "Design system (token/tema)",
    ])
  })

  it("empty prompt → ambiguous at confidence 0", () => {
    const r = detectMode(input({ prompt: "", selectedRepo: null }))
    expect(r.mode).toBe("ambiguous")
    expect(r.confidence).toBe(0)
    expect(r.needsClarify).toBeTruthy()
  })

  it("whitespace-only prompt → ambiguous at confidence 0 (never throws)", () => {
    const r = detectMode(input({ prompt: "   \n\t  ", selectedRepo: null }))
    expect(r.mode).toBe("ambiguous")
    expect(r.confidence).toBe(0)
  })
})

describe("detectMode — Indonesian existing-repo addition", () => {
  it("'tambahin tab di backoffice' with selected known repo → existing-repo", () => {
    const r = detectMode(
      input({
        prompt: "tambahin tab di backoffice",
        selectedRepo: "dash/backoffice",
        repoIsKnownDashRepo: true,
      }),
    )
    expect(r.mode).toBe("existing-repo")
    expect(r.confidence).toBe(0.95)
  })
})

describe("detectMode — robustness", () => {
  it("does not throw on empty selectedRepo string (treated as null)", () => {
    const r = detectMode(input({ prompt: "build a new product from scratch", selectedRepo: "" }))
    expect(r.mode).toBe("blank-product")
  })

  it("does not throw when optional fields omitted entirely", () => {
    const r = detectMode({ prompt: "ganti tema", selectedRepo: null })
    expect(r.mode).toBe("design-system")
  })

  it("confidence ordering: known-repo (0.95) > resolved-files (0.85) > soft modes (0.7) > ambiguous (0.3)", () => {
    const known = detectMode(
      input({ prompt: "x", selectedRepo: "dash/backoffice", repoIsKnownDashRepo: true }),
    )
    const files = detectMode(
      input({ prompt: "x", selectedRepo: null, resolvedExistingFiles: ["a.tsx"] }),
    )
    const ds = detectMode(input({ prompt: "ganti tema", selectedRepo: null }))
    const blank = detectMode(input({ prompt: "from scratch", selectedRepo: null }))
    const amb = detectMode(input({ prompt: "hello", selectedRepo: null }))
    expect(known.confidence).toBeGreaterThan(files.confidence)
    expect(files.confidence).toBeGreaterThan(ds.confidence)
    expect(ds.confidence).toBe(blank.confidence)
    expect(blank.confidence).toBeGreaterThan(amb.confidence)
  })

  it("result type shape is satisfied for every mode", () => {
    const r: ModeDetectionResult = detectMode(input({ prompt: "make it better", selectedRepo: null }))
    const mode: ProjectMode = r.mode
    expect(["existing-repo", "blank-product", "design-system", "ambiguous"]).toContain(mode)
  })
})
