import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm, writeFile, chmod } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { ClaudeCliRunner } from "../runner.js"

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "dash-build-claude-cli-"))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

/**
 * Write a tiny shell script that mimics the `claude` CLI behaviour we care
 * about. Each script writes some output then exits with the requested code.
 */
async function writeShellStub(
  script: string,
  name = "claude-stub.sh",
): Promise<string> {
  const fullPath = path.join(tmpDir, name)
  await writeFile(fullPath, `#!/bin/sh\n${script}\n`, "utf8")
  await chmod(fullPath, 0o700)
  return fullPath
}

describe("ClaudeCliRunner.probe", () => {
  it("returns { installed: false } when binary is missing", async () => {
    const runner = new ClaudeCliRunner({
      binary: "this-binary-does-not-exist-xyz-12345",
    })
    const result = await runner.probe()
    expect(result).toEqual({ installed: false, version: null })
  })

  it("returns { installed: true, version } when stub prints a version", async () => {
    const stub = await writeShellStub('echo "2.1.139 (Claude Code stub)"')
    const runner = new ClaudeCliRunner({ binary: stub })
    const result = await runner.probe()
    expect(result.installed).toBe(true)
    expect(result.version).toBe("2.1.139 (Claude Code stub)")
  })

  it("returns { installed: false } when stub exits non-zero", async () => {
    const stub = await writeShellStub("exit 7", "claude-fail.sh")
    const runner = new ClaudeCliRunner({ binary: stub })
    const result = await runner.probe()
    expect(result.installed).toBe(false)
    expect(result.version).toBeNull()
  })
})

describe("ClaudeCliRunner.complete", () => {
  it("rejects when binary is missing", async () => {
    const runner = new ClaudeCliRunner({
      binary: "this-binary-does-not-exist-xyz-12345",
    })
    await expect(runner.complete({ prompt: "hi" })).rejects.toThrow(
      /Claude CLI not found|spawn/i,
    )
  })

  it("aggregates stdout into content and fires onToken per chunk", async () => {
    // Stub prints 3 lines with small delays so they arrive in separate chunks.
    const stub = await writeShellStub(
      'printf "alpha\\n"\nsleep 0.05\nprintf "beta\\n"\nsleep 0.05\nprintf "gamma\\n"',
    )
    const runner = new ClaudeCliRunner({ binary: stub })
    const chunks: string[] = []
    const result = await runner.complete({
      prompt: "irrelevant",
      onToken: (c) => chunks.push(c),
    })
    expect(result.exitCode).toBe(0)
    expect(result.content).toContain("alpha")
    expect(result.content).toContain("beta")
    expect(result.content).toContain("gamma")
    expect(typeof result.durationMs).toBe("number")
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
    // At least one chunk fired (often 3, but stdout buffering can fuse them).
    expect(chunks.length).toBeGreaterThanOrEqual(1)
    expect(chunks.join("")).toBe(result.content)
  })

  it("honours AbortSignal", async () => {
    // Stub sleeps 10s then prints — we abort after 50ms.
    const stub = await writeShellStub('sleep 10\necho "should never appear"')
    const runner = new ClaudeCliRunner({ binary: stub })
    const ac = new AbortController()
    setTimeout(() => ac.abort(), 50)
    await expect(
      runner.complete({ prompt: "x", signal: ac.signal }),
    ).rejects.toThrow(/aborted/i)
  })

  it("includes stderr in error when stub exits non-zero", async () => {
    const stub = await writeShellStub(
      'echo "boom" >&2\nexit 3',
      "claude-stderr.sh",
    )
    const runner = new ClaudeCliRunner({ binary: stub })
    await expect(runner.complete({ prompt: "x" })).rejects.toThrow(/boom/)
  })

  it("honours custom timeoutMs", async () => {
    const stub = await writeShellStub('sleep 10\necho "no"', "claude-slow.sh")
    const runner = new ClaudeCliRunner({ binary: stub })
    await expect(
      runner.complete({ prompt: "x", timeoutMs: 100 }),
    ).rejects.toThrow(/timed out/i)
  })
})
