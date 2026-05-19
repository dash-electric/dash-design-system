/**
 * Dash DS — Prompt Harness (PRE-FLIGHT only)
 *
 * Validates fixture STRUCTURE for the 12 demo prompts.
 * Actual AI invocation is run manually post-deploy against Claude / Cursor
 * with the @dash registry + dash-ai-rules.md installed.
 *
 * Each fixture must:
 *   - Be valid JSON with required shape
 *   - Belong to one of category A | B | C | D
 *   - Have ≥1 expectedSignals and ≥1 antiSignals
 *   - Have no overlap between expected and anti signals
 *
 * Distribution requirement (DEMO-CHEATSHEET §coverage):
 *   - A (cold-start): 4
 *   - B (refactor-existing): 4
 *   - C (domain-specific): 2
 *   - D (anti-pattern): 2
 */
import { describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"

type Category = "A" | "B" | "C" | "D"
type Fixture = {
  prompt: string
  category: Category
  expectedSignals: string[]
  antiSignals: string[]
}

const FIXTURE_DIR = path.join(__dirname)
const FIXTURE_IDS = [
  "A1-discovery",
  "A2-decision-tree",
  "A3-install",
  "A4-end-to-end",
  "B1-multi-item-refactor",
  "B2-add-filter",
  "B3-wrap-with-modal",
  "B4-migrate-tailwind",
  "C1-use-code-field",
  "C2-mitra-status",
  "D1-refuse-hardcode",
  "D2-refuse-rebuild",
] as const

const EXPECTED_DISTRIBUTION: Record<Category, number> = {
  A: 4,
  B: 4,
  C: 2,
  D: 2,
}

function loadFixture(id: string): Fixture {
  const file = path.join(FIXTURE_DIR, `${id}.json`)
  const raw = fs.readFileSync(file, "utf-8")
  return JSON.parse(raw) as Fixture
}

describe("prompt harness (pre-flight)", () => {
  it("loads all 12 fixtures", () => {
    expect(FIXTURE_IDS).toHaveLength(12)
    for (const id of FIXTURE_IDS) {
      const fx = loadFixture(id)
      expect(fx, `${id} missing`).toBeDefined()
    }
  })

  for (const id of FIXTURE_IDS) {
    it(`${id}: shape is valid`, () => {
      const fx = loadFixture(id)
      expect(typeof fx.prompt, "prompt is string").toBe("string")
      expect(fx.prompt.length, "prompt non-empty").toBeGreaterThan(10)
      expect(["A", "B", "C", "D"]).toContain(fx.category)
      expect(Array.isArray(fx.expectedSignals)).toBe(true)
      expect(Array.isArray(fx.antiSignals)).toBe(true)
      expect(fx.expectedSignals.length).toBeGreaterThan(0)
      expect(fx.antiSignals.length).toBeGreaterThan(0)
    })

    it(`${id}: category matches filename prefix`, () => {
      const fx = loadFixture(id)
      expect(fx.category).toBe(id[0])
    })

    it(`${id}: no overlap between expected and anti signals`, () => {
      const fx = loadFixture(id)
      const expected = new Set(fx.expectedSignals.map((s) => s.toLowerCase()))
      const overlap = fx.antiSignals.filter((s) => expected.has(s.toLowerCase()))
      expect(overlap, `overlap: ${overlap.join(", ")}`).toEqual([])
    })
  }

  it("category distribution matches A:4 B:4 C:2 D:2", () => {
    const counts: Record<Category, number> = { A: 0, B: 0, C: 0, D: 0 }
    for (const id of FIXTURE_IDS) {
      const fx = loadFixture(id)
      counts[fx.category]++
    }
    expect(counts).toEqual(EXPECTED_DISTRIBUTION)
  })

  it("no duplicate prompts", () => {
    const seen = new Set<string>()
    for (const id of FIXTURE_IDS) {
      const fx = loadFixture(id)
      const key = fx.prompt.trim().toLowerCase()
      expect(seen.has(key), `duplicate: ${id}`).toBe(false)
      seen.add(key)
    }
  })
})
