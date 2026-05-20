/**
 * Tests for `dash sync`.
 *
 * Strategy: inject `_snapshot`, `_fetchItem`, and `_answers` so the suite
 * never hits the network or stdin. Every test creates a tmp consumer repo
 * with a `components.json` and a pre-installed file stamped with a
 * `@dash version` header.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { runSync, planSync, type SyncOpts } from "../sync.js"
import type { InfoSnapshot } from "../info.js"
import type { RegistryItem } from "../../lib/schema.js"

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dash-sync-test-"))
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function makeSnap(tmp: string, items: Array<{ name: string; path: string }>): InfoSnapshot {
  return {
    schemaVersion: 1,
    project: {
      framework: "next",
      typescript: true,
      packageManager: "pnpm",
      rootPath: tmp,
    },
    aliases: { components: "@/components", ui: "@/components/ui" },
    dash: {
      registryUrl: "https://ds.dash.test",
      hasToken: false,
      installedItems: items.map((i) => ({
        name: i.name,
        type: "registry:ui",
        path: i.path,
      })),
    },
    customHooks: [],
    apiBaseUrl: null,
  }
}

/** Build a remote item whose single file has the given version + body. */
function remoteItem(name: string, version: string, body: string): RegistryItem {
  const content = `/**\n * @dash version ${version}\n * @dash source registry/dash/ui/${name}.tsx\n * @dash updated 2026-05-20\n */\n${body}`
  return {
    name,
    type: "registry:ui",
    title: name,
    description: `${name} ui`,
    files: [
      {
        path: `registry/dash/ui/${name}.tsx`,
        type: "registry:ui",
        target: `components/ui/${name}.tsx`,
        content,
      },
    ],
  }
}

function writeLocal(
  tmp: string,
  name: string,
  version: string,
  body: string,
): void {
  const target = path.join(tmp, "components", "ui", `${name}.tsx`)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(
    target,
    `/**\n * @dash version ${version}\n * @dash source registry/dash/ui/${name}.tsx\n * @dash updated 2026-04-01\n */\n${body}`,
  )
}

function setupConsumer(tmp: string): void {
  writeJson(path.join(tmp, "components.json"), {
    aliases: {
      components: "@/components",
      ui: "@/components/ui",
    },
    registries: { "@dash": { url: "https://ds.dash.test" } },
  })
}

describe("dash sync — planSync (read-only detection)", () => {
  let tmp: string
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    tmp = mkTmp()
    setupConsumer(tmp)
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
    logSpy.mockRestore()
  })

  it("returns empty report when components.json has no installed items", async () => {
    const snap = makeSnap(tmp, [])
    const { report } = await planSync({
      cwd: tmp,
      _snapshot: snap,
      _fetchItem: async () => {
        throw new Error("should not be called")
      },
    })
    expect(report.total).toBe(0)
    expect(report.drift).toBe(0)
    expect(report.upToDate).toBe(0)
  })

  it("reports up-to-date when local content matches upstream", async () => {
    writeLocal(tmp, "button", "1.0.0", "export const Button = () => null")
    const snap = makeSnap(tmp, [{ name: "button", path: "components/ui/button.tsx" }])
    const { report } = await planSync({
      cwd: tmp,
      _snapshot: snap,
      _fetchItem: async (name) =>
        remoteItem(name, "1.0.0", "export const Button = () => null"),
    })
    expect(report.upToDate).toBe(1)
    expect(report.drift).toBe(0)
    expect(report.items[0].bump).toBe("none")
  })

  it("classifies bump types (patch / minor / major) from header versions", async () => {
    writeLocal(tmp, "button", "1.0.0", "export const Button = () => 1")
    writeLocal(tmp, "card", "1.0.0", "export const Card = () => 1")
    writeLocal(tmp, "dialog", "1.0.0", "export const Dialog = () => 1")
    const snap = makeSnap(tmp, [
      { name: "button", path: "components/ui/button.tsx" },
      { name: "card", path: "components/ui/card.tsx" },
      { name: "dialog", path: "components/ui/dialog.tsx" },
    ])
    const remotes: Record<string, RegistryItem> = {
      button: remoteItem("button", "1.0.1", "export const Button = () => 2"),
      card: remoteItem("card", "1.1.0", "export const Card = () => 2"),
      dialog: remoteItem("dialog", "2.0.0", "export const Dialog = () => 2"),
    }
    const { report } = await planSync({
      cwd: tmp,
      _snapshot: snap,
      _fetchItem: async (name) => remotes[name],
    })
    expect(report.drift).toBe(3)
    const byName = Object.fromEntries(report.items.map((i) => [i.name, i.bump]))
    expect(byName.button).toBe("patch")
    expect(byName.card).toBe("minor")
    expect(byName.dialog).toBe("major")
  })

  it("falls back to checksum compare when version header is missing/corrupt", async () => {
    // Local file has no @dash header.
    const target = path.join(tmp, "components", "ui", "button.tsx")
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, "export const Button = () => 'old'")
    const snap = makeSnap(tmp, [{ name: "button", path: "components/ui/button.tsx" }])
    const { report } = await planSync({
      cwd: tmp,
      _snapshot: snap,
      _fetchItem: async (name) =>
        remoteItem(name, "1.0.0", "export const Button = () => 'new'"),
    })
    expect(report.drift).toBe(1)
    expect(report.items[0].bump).toBe("unknown")
    expect(report.items[0].localChecksum).toBeTruthy()
    expect(report.items[0].remoteChecksum).toBeTruthy()
    expect(report.items[0].localChecksum).not.toBe(report.items[0].remoteChecksum)
  })
})

describe("dash sync — runSync flows", () => {
  let tmp: string
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    tmp = mkTmp()
    setupConsumer(tmp)
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
    logSpy.mockRestore()
  })

  function threeDrifted(): {
    snap: InfoSnapshot
    fetch: NonNullable<SyncOpts["_fetchItem"]>
  } {
    writeLocal(tmp, "button", "1.0.0", "export const Button = () => 1")
    writeLocal(tmp, "card", "1.0.0", "export const Card = () => 1")
    writeLocal(tmp, "dialog", "1.0.0", "export const Dialog = () => 1")
    const remotes: Record<string, RegistryItem> = {
      button: remoteItem("button", "1.0.1", "export const Button = () => 2"),
      card: remoteItem("card", "1.1.0", "export const Card = () => 2"),
      dialog: remoteItem("dialog", "2.0.0", "export const Dialog = () => 2"),
    }
    return {
      snap: makeSnap(tmp, [
        { name: "button", path: "components/ui/button.tsx" },
        { name: "card", path: "components/ui/card.tsx" },
        { name: "dialog", path: "components/ui/dialog.tsx" },
      ]),
      fetch: async (n) => remotes[n],
    }
  }

  it("--check: lists drift table and writes nothing", async () => {
    const { snap, fetch } = threeDrifted()
    const before = fs.readFileSync(path.join(tmp, "components/ui/button.tsx"), "utf-8")
    const report = await runSync({
      cwd: tmp,
      check: true,
      _snapshot: snap,
      _fetchItem: fetch,
    })
    expect(report.drift).toBe(3)
    expect(report.updated).toBe(0)
    const after = fs.readFileSync(path.join(tmp, "components/ui/button.tsx"), "utf-8")
    expect(after).toBe(before)
    expect(fs.existsSync(path.join(tmp, ".dash-backup"))).toBe(false)
  })

  it("--all: updates every drifted item, creates backup, no prompts", async () => {
    const { snap, fetch } = threeDrifted()
    const report = await runSync({
      cwd: tmp,
      all: true,
      _snapshot: snap,
      _fetchItem: fetch,
    })
    expect(report.updated).toBe(3)
    expect(report.skipped).toBe(0)
    const after = fs.readFileSync(path.join(tmp, "components/ui/button.tsx"), "utf-8")
    expect(after).toContain("Button = () => 2")
    expect(fs.existsSync(path.join(tmp, ".dash-backup"))).toBe(true)
    expect(report.backupDir).toBeTruthy()
    // Backup preserves the previous content
    const backed = fs.readFileSync(
      path.join(tmp, report.backupDir!, "components/ui/button.tsx"),
      "utf-8",
    )
    expect(backed).toContain("Button = () => 1")
  })

  it("interactive (mocked answers): respects y / s / n decisions", async () => {
    const { snap, fetch } = threeDrifted()
    const report = await runSync({
      cwd: tmp,
      _snapshot: snap,
      _fetchItem: fetch,
      _answers: ["y", "s", "n"],
    })
    expect(report.updated).toBe(1)
    expect(report.skipped).toBe(2)
    const updated = fs.readFileSync(path.join(tmp, "components/ui/button.tsx"), "utf-8")
    const kept = fs.readFileSync(path.join(tmp, "components/ui/card.tsx"), "utf-8")
    expect(updated).toContain("Button = () => 2")
    expect(kept).toContain("Card = () => 1")
  })

  it("interactive 'd' shows full diff then re-prompts (consumes 2 answers per item)", async () => {
    writeLocal(tmp, "button", "1.0.0", "export const Button = () => 1")
    const snap = makeSnap(tmp, [
      { name: "button", path: "components/ui/button.tsx" },
    ])
    const report = await runSync({
      cwd: tmp,
      _snapshot: snap,
      _fetchItem: async (n) =>
        remoteItem(n, "1.0.1", "export const Button = () => 2"),
      _answers: ["d", "y"],
    })
    expect(report.updated).toBe(1)
  })

  it("positional name arg restricts sync to a single component", async () => {
    const { snap, fetch } = threeDrifted()
    const report = await runSync({
      cwd: tmp,
      all: true,
      names: ["card"],
      _snapshot: snap,
      _fetchItem: fetch,
    })
    expect(report.total).toBe(1)
    expect(report.items[0].name).toBe("card")
    expect(report.updated).toBe(1)
    // button + dialog untouched
    const button = fs.readFileSync(path.join(tmp, "components/ui/button.tsx"), "utf-8")
    expect(button).toContain("Button = () => 1")
  })

  it("--auto-upgrade: applies patches, skips minor + major", async () => {
    const { snap, fetch } = threeDrifted()
    const report = await runSync({
      cwd: tmp,
      autoUpgrade: true,
      all: true,
      _snapshot: snap,
      _fetchItem: fetch,
    })
    expect(report.updated).toBe(1) // only button (patch)
    expect(report.skipped).toBe(2) // card (minor) + dialog (major)
    const card = fs.readFileSync(path.join(tmp, "components/ui/card.tsx"), "utf-8")
    expect(card).toContain("Card = () => 1") // unchanged
  })

  it("emits machine-readable JSON when --json", async () => {
    const { snap, fetch } = threeDrifted()
    const writes: string[] = []
    const stdoutSpy = vi
      .spyOn(process.stdout, "write")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(((chunk: any) => {
        writes.push(typeof chunk === "string" ? chunk : chunk.toString())
        return true
      }) as never)
    try {
      const report = await runSync({
        cwd: tmp,
        json: true,
        _snapshot: snap,
        _fetchItem: fetch,
      })
      expect(report.drift).toBe(3)
      // Should not have written anything to disk under --json.
      const button = fs.readFileSync(
        path.join(tmp, "components/ui/button.tsx"),
        "utf-8",
      )
      expect(button).toContain("Button = () => 1")
      const joined = writes.join("")
      const parsed = JSON.parse(joined)
      expect(parsed.drift).toBe(3)
      expect(parsed.items).toHaveLength(3)
    } finally {
      stdoutSpy.mockRestore()
    }
  })

  it("all-up-to-date exits with updated=0 and no backup dir", async () => {
    writeLocal(tmp, "button", "1.0.0", "export const Button = () => 1")
    const snap = makeSnap(tmp, [
      { name: "button", path: "components/ui/button.tsx" },
    ])
    const report = await runSync({
      cwd: tmp,
      _snapshot: snap,
      _fetchItem: async (n) =>
        remoteItem(n, "1.0.0", "export const Button = () => 1"),
    })
    expect(report.upToDate).toBe(1)
    expect(report.updated).toBe(0)
    expect(report.backupDir).toBeNull()
  })

  it("--dry-run reports planned writes but leaves files + no backup behind", async () => {
    const { snap, fetch } = threeDrifted()
    const report = await runSync({
      cwd: tmp,
      all: true,
      dryRun: true,
      _snapshot: snap,
      _fetchItem: fetch,
    })
    expect(report.updated).toBe(3)
    expect(report.dryRun).toBe(true)
    expect(fs.existsSync(path.join(tmp, ".dash-backup"))).toBe(false)
    const button = fs.readFileSync(
      path.join(tmp, "components/ui/button.tsx"),
      "utf-8",
    )
    expect(button).toContain("Button = () => 1") // not touched
  })
})
