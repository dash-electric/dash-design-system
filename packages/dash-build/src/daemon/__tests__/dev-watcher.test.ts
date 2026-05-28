import { promises as fs, type FSWatcher } from "node:fs"
import os from "node:os"
import path from "node:path"
import { EventEmitter } from "node:events"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  DEFAULT_WATCH_FILES,
  DevWatcher,
  isWatcherEnabled,
} from "../dev-watcher.js"

type WatchListener = (eventType: string, filename: string | null) => void

interface FakeWatcher extends FSWatcher {
  fire: (eventType: string) => void
  closed: boolean
}

function fakeWatchFactory(): {
  watchImpl: ReturnType<typeof vi.fn>
  instances: FakeWatcher[]
} {
  const instances: FakeWatcher[] = []
  const watchImpl = vi.fn((...args: unknown[]) => {
    // Real fs.watch signature: (path, options?, listener?). We accept either
    // arity to keep the test honest.
    const listener = args[args.length - 1] as WatchListener
    const emitter = new EventEmitter() as FakeWatcher
    emitter.closed = false
    emitter.fire = (eventType: string) => listener(eventType, null)
    emitter.close = () => {
      emitter.closed = true
    }
    instances.push(emitter)
    return emitter
  })
  return { watchImpl, instances }
}

let tmpRoot: string

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "dash-dev-watcher-"))
})

afterEach(async () => {
  await fs.rm(tmpRoot, { recursive: true, force: true })
})

describe("DevWatcher", () => {
  it("attaches one watcher per file in the list", async () => {
    // Create the watched files so the real fs.watch wouldn't throw, but we
    // still inject a fake watchImpl to keep the test hermetic.
    await fs.writeFile(path.join(tmpRoot, "a.ts"), "// a")
    await fs.writeFile(path.join(tmpRoot, "b.ts"), "// b")
    const { watchImpl, instances } = fakeWatchFactory()
    const broadcaster = { broadcast: vi.fn() }
    const w = new DevWatcher({
      broadcaster,
      files: ["a.ts", "b.ts"],
      rootDir: tmpRoot,
      watchImpl,
    })
    w.start()
    expect(watchImpl).toHaveBeenCalledTimes(2)
    expect(w.watcherCount()).toBe(2)
    expect(instances).toHaveLength(2)
    w.stop()
    expect(instances.every((i) => i.closed)).toBe(true)
    expect(w.watcherCount()).toBe(0)
  })

  it("broadcasts static:refresh after a change event", () => {
    const { watchImpl } = fakeWatchFactory()
    const broadcaster = { broadcast: vi.fn() }
    const w = new DevWatcher({
      broadcaster,
      files: ["dashboard.ts"],
      rootDir: tmpRoot,
      debounceMs: 0,
      watchImpl,
    })
    w.start()
    w.onChange("dashboard.ts")
    w.flush()
    expect(broadcaster.broadcast).toHaveBeenCalledTimes(1)
    const [event, detail] = broadcaster.broadcast.mock.calls[0]
    expect(event).toBe("static:refresh")
    expect(detail.source).toBe("dashboard.ts")
    expect(typeof detail.ts).toBe("number")
    w.stop()
  })

  it("debounces a burst of change events into a single broadcast", () => {
    const { watchImpl } = fakeWatchFactory()
    const broadcaster = { broadcast: vi.fn() }
    const w = new DevWatcher({
      broadcaster,
      files: ["dashboard.ts"],
      rootDir: tmpRoot,
      debounceMs: 50,
      watchImpl,
    })
    w.start()
    // Simulate an editor burst — 3 raw events in rapid succession.
    w.onChange("dashboard.ts")
    w.onChange("dashboard.ts")
    w.onChange("dashboard.ts")
    expect(broadcaster.broadcast).not.toHaveBeenCalled()
    w.flush()
    expect(broadcaster.broadcast).toHaveBeenCalledTimes(1)
    w.stop()
  })

  it("stop() clears the pending debounce so no broadcast escapes", () => {
    vi.useFakeTimers()
    try {
      const { watchImpl } = fakeWatchFactory()
      const broadcaster = { broadcast: vi.fn() }
      const w = new DevWatcher({
        broadcaster,
        files: ["dashboard.ts"],
        rootDir: tmpRoot,
        debounceMs: 100,
        watchImpl,
      })
      w.start()
      w.onChange("dashboard.ts")
      w.stop()
      vi.advanceTimersByTime(500)
      expect(broadcaster.broadcast).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it("watches the canonical CSS + shell templates by default", () => {
    expect(DEFAULT_WATCH_FILES).toContain("daemon/templates/styles/dashboard.ts")
    expect(DEFAULT_WATCH_FILES).toContain("daemon/templates/styles/tokens.ts")
    expect(DEFAULT_WATCH_FILES).toContain("daemon/templates/workspace.ts")
  })

  it("survives a watchImpl throwing per-file (e.g. ENOENT)", () => {
    const broadcaster = { broadcast: vi.fn() }
    const errSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const watchImpl = vi.fn((_p: string) => {
      throw new Error("ENOENT")
    })
    const w = new DevWatcher({
      broadcaster,
      files: ["missing.ts"],
      rootDir: tmpRoot,
      watchImpl: watchImpl as unknown as typeof import("node:fs").watch,
    })
    w.start()
    expect(w.watcherCount()).toBe(0)
    expect(errSpy).toHaveBeenCalled()
    errSpy.mockRestore()
  })

  it("ignores fs events that aren't 'change' or 'rename'", () => {
    const { watchImpl, instances } = fakeWatchFactory()
    const broadcaster = { broadcast: vi.fn() }
    const w = new DevWatcher({
      broadcaster,
      files: ["dashboard.ts"],
      rootDir: tmpRoot,
      debounceMs: 0,
      watchImpl,
    })
    w.start()
    instances[0]?.fire("close")
    instances[0]?.fire("error")
    w.flush()
    expect(broadcaster.broadcast).not.toHaveBeenCalled()
    w.stop()
  })
})

describe("isWatcherEnabled", () => {
  it("returns false when DASH_BUILD_WATCH is unset", () => {
    expect(isWatcherEnabled({})).toBe(false)
  })

  it("returns true for canonical truthy values", () => {
    expect(isWatcherEnabled({ DASH_BUILD_WATCH: "1" })).toBe(true)
    expect(isWatcherEnabled({ DASH_BUILD_WATCH: "true" })).toBe(true)
    expect(isWatcherEnabled({ DASH_BUILD_WATCH: "YES" })).toBe(true)
  })

  it("returns false for anything else", () => {
    expect(isWatcherEnabled({ DASH_BUILD_WATCH: "0" })).toBe(false)
    expect(isWatcherEnabled({ DASH_BUILD_WATCH: "off" })).toBe(false)
    expect(isWatcherEnabled({ DASH_BUILD_WATCH: "" })).toBe(false)
  })
})
