/**
 * Cross-platform path handling sanity checks.
 *
 * These tests assert that the modules touching the filesystem use
 * `path.join` / `homedir()` rather than hard-coded `/` separators or
 * `~/` shorthand, so the package behaves correctly on Windows.
 *
 * Actual Windows runtime verification still requires a Windows CI job —
 * these tests are a static-style guard that exercises the public API
 * with paths that *would* work on either platform.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdtemp, rm, readFile } from "node:fs/promises"
import { tmpdir, homedir } from "node:os"
import path from "node:path"
import { writePidFile, readPidFile, deletePidFile } from "../daemon/pid-file.js"
import { Store } from "../daemon/state/store.js"
import { SessionStore } from "../clarification/session-store.js"
import { AnthropicTokenStore } from "../auth/anthropic/token-store.js"
import { GitHubTokenStore } from "../integrations/github/token-store.js"
import {
  DEFAULT_PREVIEW_ROOT,
  resolvePreviewDir,
  prepareTempDir,
} from "../preview/temp-dir.js"

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "dash-build-winpath-"))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

describe("default paths use homedir() + path.join (no `~` shorthand)", () => {
  it("preview root resolves under homedir() and contains '.dash-build'", () => {
    expect(DEFAULT_PREVIEW_ROOT.startsWith(homedir())).toBe(true)
    expect(DEFAULT_PREVIEW_ROOT).not.toContain("~")
    // Path segments must be platform-correct, not literal '/'
    expect(DEFAULT_PREVIEW_ROOT).toBe(
      path.join(homedir(), ".dash-build", "preview"),
    )
  })

  it("anthropic token store default path lives under homedir()", () => {
    const store = new AnthropicTokenStore()
    expect(store.filePath.startsWith(homedir())).toBe(true)
    expect(store.filePath).not.toContain("~")
    expect(store.filePath).toBe(
      path.join(homedir(), ".dash-build", "auth", "anthropic.json"),
    )
  })

  it("github token store default path lives under homedir()", () => {
    const store = new GitHubTokenStore()
    expect(store.path.startsWith(homedir())).toBe(true)
    expect(store.path).not.toContain("~")
    expect(store.path).toBe(
      path.join(homedir(), ".dash-build", "auth", "github.json"),
    )
  })
})

describe("pid-file works with nested path.join paths", () => {
  it("round-trips through a deeply nested platform-correct path", async () => {
    // Use path.join — never literal '/' — to exercise the same code path
    // a Windows process would take.
    const pidPath = path.join(tmpDir, "deeply", "nested", "daemon.pid")
    await writePidFile(31337, { path: pidPath })
    expect(await readPidFile({ path: pidPath })).toBe(31337)
    await deletePidFile({ path: pidPath })
    expect(await readPidFile({ path: pidPath })).toBeNull()
  })
})

describe("Store persists with platform separators", () => {
  it("writes state.json using path.join, not '/' concat", async () => {
    const filePath = path.join(tmpDir, "subdir", "state.json")
    const store = await Store.load({ path: filePath })
    store.addPrompt({ text: "hello windows" })
    // Wait a tick for fire-and-forget persist
    await store.persist()
    const raw = await readFile(filePath, "utf8")
    const parsed = JSON.parse(raw)
    expect(parsed.prompts).toHaveLength(1)
    expect(parsed.prompts[0].text).toBe("hello windows")
  })
})

describe("SessionStore sanitizes promptId, then uses path.join", () => {
  it("persists to <dir>/<safe>.json with platform separator", async () => {
    const dir = path.join(tmpDir, "sessions")
    const store = new SessionStore({ dir })
    const session = await store.create("prm_winpath", "build a thing", [])
    expect(session.promptId).toBe("prm_winpath")
    // File should be under dir, using OS separator
    const expected = path.join(dir, "prm_winpath.json")
    const raw = await readFile(expected, "utf8")
    expect(JSON.parse(raw).promptId).toBe("prm_winpath")
  })

  it("rejects path-traversal in promptId via sanitization", async () => {
    const dir = path.join(tmpDir, "sessions2")
    const store = new SessionStore({ dir })
    // Promise: even with `../` this stays inside `dir`
    await store.create("../escape", "x", [])
    // Sanitized to '___escape' — written inside dir, not outside
    const sanitized = path.join(dir, "___escape.json")
    const raw = await readFile(sanitized, "utf8")
    expect(JSON.parse(raw).promptId).toBe("../escape")
  })
})

describe("preview temp-dir uses path.join + sep", () => {
  it("resolvePreviewDir composes via path.join", () => {
    const root = path.join(tmpDir, "preview-root")
    const dir = resolvePreviewDir("abc123", root)
    expect(dir).toBe(path.join(root, "abc123"))
    // Must not contain stray forward slashes on Windows
    if (process.platform === "win32") {
      expect(dir).not.toMatch(/\/[^/]/)
    }
  })

  it("prepareTempDir creates the directory using platform separator", async () => {
    const root = path.join(tmpDir, "preview-prep")
    const dir = await prepareTempDir("p1", root)
    expect(dir).toBe(path.join(root, "p1"))
  })
})

describe("path.sep is used where a literal separator is needed", () => {
  it("path.sep matches platform expectation", () => {
    if (process.platform === "win32") {
      expect(path.sep).toBe("\\")
    } else {
      expect(path.sep).toBe("/")
    }
  })
})
