import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { runMigrate } from "../migrate.js"
import { MIGRATIONS, getMigration } from "../../migrations/index.js"

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dash-migrate-test-"))
}

describe("migrate command", () => {
  let tmp: string
  let logSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>
  let exitSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    tmp = mkTmp()
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`exit(${code})`)
    }) as never)
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
    logSpy.mockRestore()
    errSpy.mockRestore()
    exitSpy.mockRestore()
  })

  it("--list prints all available migrations", async () => {
    await runMigrate({ list: true, cwd: tmp })
    const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n")
    expect(output).toContain("Available migrations")
    for (const m of MIGRATIONS) {
      expect(output).toContain(m.name)
    }
  })

  it("with no name and no --list, lists migrations", async () => {
    await runMigrate({ cwd: tmp })
    const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n")
    expect(output).toContain("Available migrations")
  })

  it("unknown migration name exits with error", async () => {
    await expect(
      runMigrate({ name: "does-not-exist", yes: true, cwd: tmp }),
    ).rejects.toThrow(/exit\(1\)/)
    const errOutput = errSpy.mock.calls.map((c) => c.join(" ")).join("\n")
    expect(errOutput).toContain("Migration not found")
  })

  it("registry has at least 2 migrations (rhf-to-vanilla + icon-rename)", () => {
    expect(MIGRATIONS.length).toBeGreaterThanOrEqual(2)
    expect(getMigration("rhf-to-vanilla")).toBeDefined()
    expect(getMigration("icon-rename")).toBeDefined()
  })

  it("rhf-to-vanilla scan reports files with RHF imports", async () => {
    const target = path.join(tmp, "src", "MyForm.tsx")
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(
      target,
      `import { useForm } from "react-hook-form"\nexport const Foo = () => null\n`,
    )

    await runMigrate({ name: "rhf-to-vanilla", yes: true, cwd: tmp })
    const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n")
    expect(output).toContain("MyForm.tsx")
    expect(output).toContain("Files scanned")
    // Scan-only — no writes
    expect(fs.readFileSync(target, "utf-8")).toContain('"react-hook-form"')
  })

  it("rhf-to-vanilla reports clean when no RHF imports found", async () => {
    const target = path.join(tmp, "src", "Clean.tsx")
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, `import { useState } from "react"\n`)

    await runMigrate({ name: "rhf-to-vanilla", yes: true, cwd: tmp })
    const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n")
    expect(output).toContain("No changes needed")
  })

  it("icon-rename --dry-run reports without writing", async () => {
    const target = path.join(tmp, "src", "Icon.tsx")
    fs.mkdirSync(path.dirname(target), { recursive: true })
    const original = `import { RiHome } from "remixicon-react"\n`
    fs.writeFileSync(target, original)

    await runMigrate({
      name: "icon-rename",
      dryRun: true,
      yes: true,
      cwd: tmp,
    })
    // File untouched
    expect(fs.readFileSync(target, "utf-8")).toBe(original)
  })

  it("icon-rename --yes rewrites legacy imports", async () => {
    const target = path.join(tmp, "src", "Icon.tsx")
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, `import { RiHome } from "remixicon-react"\n`)

    await runMigrate({ name: "icon-rename", yes: true, cwd: tmp })
    const result = fs.readFileSync(target, "utf-8")
    expect(result).toContain('"@remixicon/react"')
    expect(result).not.toContain('"remixicon-react"')
  })

  it("icon-rename is idempotent (re-running does nothing)", async () => {
    const target = path.join(tmp, "src", "Icon.tsx")
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, `import { RiHome } from "@remixicon/react"\n`)

    await runMigrate({ name: "icon-rename", yes: true, cwd: tmp })
    const result = fs.readFileSync(target, "utf-8")
    expect(result).toContain('"@remixicon/react"')
    const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n")
    expect(output).toContain("No changes needed")
  })

  it("ignores node_modules and dist directories", async () => {
    const ignored = path.join(tmp, "node_modules", "x", "y.tsx")
    fs.mkdirSync(path.dirname(ignored), { recursive: true })
    fs.writeFileSync(
      ignored,
      `import { useForm } from "react-hook-form"\n`,
    )

    await runMigrate({ name: "rhf-to-vanilla", yes: true, cwd: tmp })
    const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n")
    // node_modules path should NOT appear
    expect(output).not.toContain("node_modules")
  })
})
