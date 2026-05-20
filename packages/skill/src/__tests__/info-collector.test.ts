import { describe, it, expect, vi } from "vitest"
import { collectDashInfo, type DashInfoSnapshot } from "../info-collector.js"

const validSnapshot: DashInfoSnapshot = {
  schemaVersion: 1,
  project: {
    framework: "next",
    typescript: true,
    packageManager: "pnpm",
    rootPath: "/tmp/proj",
  },
  aliases: { components: "@/components" },
  dash: {
    registryUrl: "https://registry.example.com",
    hasToken: false,
    installedItems: [{ name: "button", type: "registry:ui", path: "components/ui/button.tsx" }],
  },
  customHooks: [],
  apiBaseUrl: null,
}

describe("collectDashInfo", () => {
  it("returns ok:true with parsed snapshot when CLI succeeds", async () => {
    const exec = vi.fn().mockReturnValue(JSON.stringify(validSnapshot))
    const result = await collectDashInfo("/tmp/proj", { exec })

    expect(exec).toHaveBeenCalledWith(
      "dash info --json",
      expect.objectContaining({ cwd: "/tmp/proj", encoding: "utf8" }),
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.snapshot.project.framework).toBe("next")
      expect(result.snapshot.dash.installedItems).toHaveLength(1)
    }
  })

  it("accepts Buffer output and decodes it", async () => {
    const exec = vi.fn().mockReturnValue(Buffer.from(JSON.stringify(validSnapshot)))
    const result = await collectDashInfo("/tmp/proj", { exec })
    expect(result.ok).toBe(true)
  })

  it("returns ok:false with reason when CLI throws (not on PATH)", async () => {
    const exec = vi.fn().mockImplementation(() => {
      throw new Error("spawn dash ENOENT")
    })
    const result = await collectDashInfo("/tmp/proj", { exec })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toMatch(/dash info failed/)
      expect(result.reason).toMatch(/ENOENT/)
    }
  })

  it("returns ok:false when output is not valid JSON", async () => {
    const exec = vi.fn().mockReturnValue("not-json{{{")
    const result = await collectDashInfo("/tmp/proj", { exec })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toMatch(/JSON parse failed/)
    }
  })

  it("returns ok:false when JSON is missing required keys", async () => {
    const exec = vi.fn().mockReturnValue(JSON.stringify({ foo: "bar" }))
    const result = await collectDashInfo("/tmp/proj", { exec })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toMatch(/missing required keys/)
    }
  })

  it("defaults cwd to process.cwd() when omitted", async () => {
    const exec = vi.fn().mockReturnValue(JSON.stringify(validSnapshot))
    await collectDashInfo(undefined, { exec })
    expect(exec).toHaveBeenCalledWith(
      "dash info --json",
      expect.objectContaining({ cwd: process.cwd() }),
    )
  })
})
