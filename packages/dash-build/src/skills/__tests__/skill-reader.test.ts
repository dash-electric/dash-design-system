import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { beforeEach, describe, expect, it } from "vitest"
import {
  readGstackSkill,
  stripPreamble,
  type GstackSkillName,
} from "../skill-reader.js"

// ---------------------------------------------------------------------------
// Fixtures — mimic the on-disk SKILL.md shape (frontmatter + preamble + the
// load-bearing reasoning section). The reader must strip everything but the
// allow-listed section.
// ---------------------------------------------------------------------------

const OFFICE_HOURS_FIXTURE = `---
name: office-hours
version: 2.0.0
description: |
  YC Office Hours.
---
<!-- AUTO-GENERATED -->

## Preamble (run first)

Boilerplate that must be stripped.

## Skill Invocation During Plan Mode

More boilerplate.

### The Six Forcing Questions

Ask these ONE AT A TIME.

#### Q1: Demand Reality

The strongest evidence someone wants this.

#### Q4: Narrowest Wedge

The smallest version someone would pay for this week.

## Telemetry (run last)

Trailing boilerplate that must also be stripped.
`

const CEO_FIXTURE = `---
name: plan-ceo-review
version: 1.0.0
---
## Preamble (run first)

Strip me.

## Step 0: Nuclear Scope Challenge + Mode Selection

### 0A. Premise Challenge

Is this the right problem?

### 0F. Mode Selection

SCOPE EXPANSION / SELECTIVE EXPANSION / HOLD SCOPE / SCOPE REDUCTION.

## Review Sections

Trailing boilerplate.
`

let workDir: string

/** Write `<root>/skills/<name>/SKILL.md` (the vendored layout under packageRoot). */
function writeVendored(root: string, name: string, content: string) {
  writeAt(path.join(root, "skills", name), content)
}

/** Write `<baseDir>/<name>/SKILL.md` (used for the ~/.claude/* fallback layouts). */
function writeUnder(baseDir: string, name: string, content: string) {
  writeAt(path.join(baseDir, name), content)
}

function writeAt(dir: string, content: string) {
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, "SKILL.md"), content, "utf-8")
}

beforeEach(() => {
  workDir = mkdtempSync(path.join(tmpdir(), "dash-skill-reader-"))
})

describe("stripPreamble", () => {
  it("keeps only the allow-listed section and its nested subsections", () => {
    const out = stripPreamble(OFFICE_HOURS_FIXTURE, ["the six forcing questions"])
    expect(out).toContain("### The Six Forcing Questions")
    expect(out).toContain("#### Q1: Demand Reality")
    expect(out).toContain("#### Q4: Narrowest Wedge")
    // Preamble + trailing boilerplate dropped.
    expect(out).not.toContain("## Preamble")
    expect(out).not.toContain("Skill Invocation")
    expect(out).not.toContain("## Telemetry")
    expect(out).not.toContain("Trailing boilerplate")
  })

  it("captures a parent heading's whole sub-tree (Step 0 + its 0A/0F)", () => {
    const out = stripPreamble(CEO_FIXTURE, ["philosophy", "step 0"])
    expect(out).toContain("## Step 0: Nuclear Scope Challenge")
    expect(out).toContain("### 0A. Premise Challenge")
    expect(out).toContain("### 0F. Mode Selection")
    expect(out).not.toContain("## Preamble")
    expect(out).not.toContain("## Review Sections")
  })

  it("returns empty string when no section matches", () => {
    expect(stripPreamble(OFFICE_HOURS_FIXTURE, ["nonexistent heading"])).toBe("")
  })

  it("handles CRLF line endings", () => {
    const crlf = OFFICE_HOURS_FIXTURE.replace(/\n/g, "\r\n")
    const out = stripPreamble(crlf, ["the six forcing questions"])
    expect(out).toContain("The Six Forcing Questions")
    expect(out).not.toContain("## Preamble")
  })

  it("handles content with no frontmatter", () => {
    const noFm = "## Step 0\n\nbody\n"
    expect(stripPreamble(noFm, ["step 0"])).toContain("## Step 0")
  })
})

describe("readGstackSkill", () => {
  it("resolves the vendored copy first (over the ~/.claude fallback)", async () => {
    writeVendored(workDir, "office-hours", OFFICE_HOURS_FIXTURE)
    // Also plant a ~/.claude/skills/gstack copy with DIFFERENT marker content.
    const fakeHome = path.join(workDir, "fakehome")
    writeUnder(
      path.join(fakeHome, ".claude", "skills", "gstack"),
      "office-hours",
      OFFICE_HOURS_FIXTURE.replace("Ask these ONE AT A TIME.", "FALLBACK MARKER"),
    )

    const result = await readGstackSkill("office-hours", {
      packageRoot: workDir,
      home: fakeHome,
    })

    expect(result).not.toBeNull()
    expect(result!.source).toBe(path.join(workDir, "skills", "office-hours", "SKILL.md"))
    expect(result!.body).toContain("Ask these ONE AT A TIME.")
    expect(result!.body).not.toContain("FALLBACK MARKER")
    expect(result!.body).toContain("### The Six Forcing Questions")
  })

  it("falls back to the ~/.claude/skills/gstack path when vendored is missing", async () => {
    const fakeHome = path.join(workDir, "fakehome")
    const gstackBase = path.join(fakeHome, ".claude", "skills", "gstack")
    writeUnder(gstackBase, "plan-ceo-review", CEO_FIXTURE)
    // No vendored copy under packageRoot.

    const result = await readGstackSkill("plan-ceo-review", {
      packageRoot: path.join(workDir, "empty-package"),
      home: fakeHome,
    })

    expect(result).not.toBeNull()
    expect(result!.source).toBe(path.join(gstackBase, "plan-ceo-review", "SKILL.md"))
    expect(result!.body).toContain("## Step 0: Nuclear Scope Challenge")
  })

  it("falls back to the flat ~/.claude/skills path when gstack namespace is missing", async () => {
    const fakeHome = path.join(workDir, "fakehome")
    const flatBase = path.join(fakeHome, ".claude", "skills")
    writeUnder(flatBase, "office-hours", OFFICE_HOURS_FIXTURE)

    const result = await readGstackSkill("office-hours", {
      packageRoot: path.join(workDir, "empty-package"),
      home: fakeHome,
    })

    expect(result).not.toBeNull()
    expect(result!.source).toBe(path.join(flatBase, "office-hours", "SKILL.md"))
  })

  it("returns null (never throws) when all candidates miss", async () => {
    const result = await readGstackSkill("office-hours", {
      packageRoot: path.join(workDir, "nope"),
      home: path.join(workDir, "no-home"),
    })
    expect(result).toBeNull()
  })

  it("returns null for an unknown skill name", async () => {
    writeVendored(workDir, "made-up", "## Step 0\nbody\n")
    const result = await readGstackSkill("made-up" as GstackSkillName, {
      packageRoot: workDir,
      home: workDir,
    })
    expect(result).toBeNull()
  })

  it("sets truncated:true and caps the body past maxChars", async () => {
    // Build a fixture whose extracted section is much larger than the cap.
    const big = `---
name: office-hours
---
## Preamble

drop

### The Six Forcing Questions

${"x".repeat(20000)}
`
    writeVendored(workDir, "office-hours", big)

    const result = await readGstackSkill("office-hours", {
      packageRoot: workDir,
      home: workDir,
      maxChars: 500,
    })

    expect(result).not.toBeNull()
    expect(result!.truncated).toBe(true)
    expect(result!.body).toContain("[...truncated to 500 chars")
    // head (500) + truncation note; well under the 20k source.
    expect(result!.body.length).toBeLessThan(700)
  })

  it("leaves truncated:false for bodies under the cap", async () => {
    writeVendored(workDir, "office-hours", OFFICE_HOURS_FIXTURE)
    const result = await readGstackSkill("office-hours", {
      packageRoot: workDir,
      home: workDir,
    })
    expect(result).not.toBeNull()
    expect(result!.truncated).toBe(false)
  })

  it("falls back to default maxChars for non-finite / non-positive overrides", async () => {
    writeVendored(workDir, "office-hours", OFFICE_HOURS_FIXTURE)
    const result = await readGstackSkill("office-hours", {
      packageRoot: workDir,
      home: workDir,
      maxChars: -10,
    })
    expect(result).not.toBeNull()
    expect(result!.truncated).toBe(false)
  })
})
