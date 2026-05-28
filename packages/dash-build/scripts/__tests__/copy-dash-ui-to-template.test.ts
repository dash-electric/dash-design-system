import { promises as fs } from "node:fs"
import { existsSync, readFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  applyPlan,
  planCopy,
  renderBarrel,
  // @ts-expect-error — ESM module without type defs (.mjs)
} from "../copy-dash-ui-to-template.mjs"

let tmpDir: string
let atomsDir: string
let outputDir: string

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dash-copy-ui-"))
  atomsDir = path.join(tmpDir, "ui")
  outputDir = path.join(tmpDir, "dash-ui")
  await fs.mkdir(atomsDir, { recursive: true })
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

async function writeAtom(name: string, body: string): Promise<void> {
  await fs.writeFile(path.join(atomsDir, `${name}.tsx`), body, "utf8")
}

const SIMPLE_ATOM = `import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"
export const Foo: React.FC = () => <span className={cn("x")} />
`

const ATOM_WITH_SIBLING = `import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"
import { Foo } from "@/registry/dash/ui/foo"
export const Bar: React.FC = () => <Foo />
`

const ATOM_WITH_BANNED = `import * as React from "react"
import { useForm } from "react-hook-form"
export const Bad: React.FC = () => null
`

const ATOM_WITH_HEAVY = `import * as React from "react"
import * as RechartsPrimitive from "recharts"
export const Chart: React.FC = () => <RechartsPrimitive.PieChart />
`

const ATOM_WITH_NON_SLOT_RADIX = `import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
export const D = Dialog.Root
`

describe("copy-dash-ui-to-template", () => {
  describe("planCopy", () => {
    it("includes safe atoms with only library deps", async () => {
      await writeAtom("foo", SIMPLE_ATOM)
      const plan = planCopy({ atomsDir })
      expect(plan.included.map((a: { slug: string }) => a.slug)).toEqual(["foo"])
      expect(plan.skipped).toEqual([])
    })

    it("rewrites `@/registry/dash/lib/utils` to relative `./lib/utils`", async () => {
      await writeAtom("foo", SIMPLE_ATOM)
      const plan = planCopy({ atomsDir })
      expect(plan.included[0].rewritten).toContain('from "./lib/utils"')
      expect(plan.included[0].rewritten).not.toContain("@/registry")
    })

    it("rewrites sibling atom imports to relative `./<name>`", async () => {
      await writeAtom("foo", SIMPLE_ATOM)
      await writeAtom("bar", ATOM_WITH_SIBLING)
      const plan = planCopy({ atomsDir })
      const bar = plan.included.find(
        (a: { slug: string }) => a.slug === "bar",
      )
      expect(bar).toBeDefined()
      expect(bar.rewritten).toContain('from "./foo"')
      expect(bar.rewritten).not.toContain("@/registry")
    })

    it("skips atoms importing a banned package (react-hook-form / zod / …)", async () => {
      await writeAtom("bad", ATOM_WITH_BANNED)
      const plan = planCopy({ atomsDir })
      expect(plan.included).toEqual([])
      expect(plan.skipped[0].slug).toBe("bad")
      expect(plan.skipped[0].reason).toBe("banned-or-heavy-external")
    })

    it("skips atoms importing heavy / non-resolvable deps (recharts, etc)", async () => {
      await writeAtom("chart", ATOM_WITH_HEAVY)
      const plan = planCopy({ atomsDir })
      expect(plan.included).toEqual([])
      expect(plan.skipped[0].slug).toBe("chart")
    })

    it("skips atoms using non-allowlisted @radix-ui packages", async () => {
      await writeAtom("d", ATOM_WITH_NON_SLOT_RADIX)
      const plan = planCopy({ atomsDir })
      expect(plan.included).toEqual([])
    })

    it("transitively prunes atoms whose sibling deps were skipped", async () => {
      // `bar` depends on `foo` but `foo` is skipped → `bar` is also dropped.
      await writeAtom("foo", ATOM_WITH_BANNED)
      await writeAtom("bar", ATOM_WITH_SIBLING)
      const plan = planCopy({ atomsDir })
      expect(plan.included).toEqual([])
      const barSkip = plan.skipped.find(
        (s: { slug: string }) => s.slug === "bar",
      )
      expect(barSkip.reason).toBe("transitive-skip")
    })
  })

  describe("renderBarrel", () => {
    it("emits one `export * from` line per included slug", () => {
      const barrel = renderBarrel(["badge", "button"])
      expect(barrel).toContain('export * from "./badge"')
      expect(barrel).toContain('export * from "./button"')
    })

    it("includes the AUTO-GENERATED header so editors don't hand-edit", () => {
      const barrel = renderBarrel(["badge"])
      expect(barrel).toContain("AUTO-GENERATED")
      expect(barrel).toContain("do NOT edit")
    })
  })

  describe("applyPlan", () => {
    it("writes the lib/utils helper + barrel + every included atom", async () => {
      await writeAtom("foo", SIMPLE_ATOM)
      const plan = planCopy({ atomsDir })
      applyPlan(plan, { outputDir })
      expect(existsSync(path.join(outputDir, "foo.tsx"))).toBe(true)
      expect(existsSync(path.join(outputDir, "index.tsx"))).toBe(true)
      expect(existsSync(path.join(outputDir, "lib", "utils.tsx"))).toBe(true)
      const barrel = readFileSync(path.join(outputDir, "index.tsx"), "utf8")
      expect(barrel).toContain('export * from "./foo"')
    })

    it("wipes stale files on re-run so dropped atoms never linger", async () => {
      await writeAtom("foo", SIMPLE_ATOM)
      applyPlan(planCopy({ atomsDir }), { outputDir })
      // First run shipped foo. Now drop it.
      await fs.unlink(path.join(atomsDir, "foo.tsx"))
      await writeAtom("bar", SIMPLE_ATOM.replace(/Foo/g, "Bar"))
      applyPlan(planCopy({ atomsDir }), { outputDir })
      expect(existsSync(path.join(outputDir, "foo.tsx"))).toBe(false)
      expect(existsSync(path.join(outputDir, "bar.tsx"))).toBe(true)
    })
  })
})
