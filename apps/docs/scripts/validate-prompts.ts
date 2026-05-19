/**
 * Dash DS — Prompt Fixture Validator
 *
 * Reads all fixtures in tests/prompts/*.json and prints:
 *   1. A markdown table suitable for pasting into DEMO-CHEATSHEET.md
 *   2. A coverage summary (categories A:4 B:4 C:2 D:2)
 *   3. Duplicate-prompt + missing-category errors (exit 1 if any)
 *
 * Usage:
 *   pnpm tsx scripts/validate-prompts.ts
 */
import fs from "node:fs"
import path from "node:path"

type Category = "A" | "B" | "C" | "D"
type Fixture = {
  prompt: string
  category: Category
  expectedSignals: string[]
  antiSignals: string[]
}

const FIXTURE_DIR = path.join(process.cwd(), "tests", "prompts")
const REQUIRED = { A: 4, B: 4, C: 2, D: 2 } as const

function loadAll(): Array<Fixture & { id: string }> {
  const files = fs
    .readdirSync(FIXTURE_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(FIXTURE_DIR, f), "utf-8")
    const fx = JSON.parse(raw) as Fixture
    return { ...fx, id: f.replace(/\.json$/, "") }
  })
}

function truncate(s: string, n = 80): string {
  if (s.length <= n) return s
  return s.slice(0, n - 1) + "…"
}

function main() {
  const fixtures = loadAll()
  const errors: string[] = []

  // Coverage
  const counts: Record<Category, number> = { A: 0, B: 0, C: 0, D: 0 }
  for (const fx of fixtures) counts[fx.category]++
  for (const cat of ["A", "B", "C", "D"] as Category[]) {
    if (counts[cat] !== REQUIRED[cat]) {
      errors.push(
        `category ${cat}: expected ${REQUIRED[cat]} fixtures, got ${counts[cat]}`,
      )
    }
  }

  // Duplicates
  const seen = new Map<string, string>()
  for (const fx of fixtures) {
    const key = fx.prompt.trim().toLowerCase()
    const prev = seen.get(key)
    if (prev) errors.push(`duplicate prompt: ${prev} ↔ ${fx.id}`)
    seen.set(key, fx.id)
  }

  // Markdown table
  console.log("## Prompt fixtures — auto-generated")
  console.log("")
  console.log("| ID | Category | Prompt | Expected (sample) | Anti (sample) |")
  console.log("|---|---|---|---|---|")
  for (const fx of fixtures) {
    const exp = fx.expectedSignals.slice(0, 3).join(", ")
    const anti = fx.antiSignals.slice(0, 3).join(", ")
    console.log(
      `| ${fx.id} | ${fx.category} | ${truncate(fx.prompt)} | \`${exp}\` | \`${anti}\` |`,
    )
  }

  console.log("")
  console.log(
    `Coverage: A:${counts.A} · B:${counts.B} · C:${counts.C} · D:${counts.D}  (required A:4 B:4 C:2 D:2)`,
  )
  console.log(`Total fixtures: ${fixtures.length}`)

  if (errors.length) {
    console.error("\n✗ validation errors:")
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }
  console.log("\n✓ all fixtures valid")
}

main()
