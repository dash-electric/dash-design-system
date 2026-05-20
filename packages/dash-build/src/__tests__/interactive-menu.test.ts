import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock @inquirer/prompts before importing the menu
vi.mock("@inquirer/prompts", () => ({
  select: vi.fn(),
}))

import { select } from "@inquirer/prompts"
import { runInteractiveMenu, type MenuChoice } from "../menu/interactive-menu.js"

const mockedSelect = vi.mocked(select)

describe("runInteractiveMenu", () => {
  beforeEach(() => {
    mockedSelect.mockReset()
    // Silence console.log during tests
    vi.spyOn(console, "log").mockImplementation(() => {})
  })

  it("returns the selected choice", async () => {
    mockedSelect.mockResolvedValueOnce("web-ui" as never)
    const choice = await runInteractiveMenu({ port: 7777 })
    expect(choice).toBe("web-ui")
  })

  it("passes default value 'web-ui' to select", async () => {
    mockedSelect.mockResolvedValueOnce("web-ui" as never)
    await runInteractiveMenu({ port: 7777 })
    const call = mockedSelect.mock.calls[0]?.[0] as { default?: MenuChoice }
    expect(call.default).toBe("web-ui")
  })

  it("offers all 4 menu choices", async () => {
    mockedSelect.mockResolvedValueOnce("exit" as never)
    await runInteractiveMenu({ port: 7777 })
    const call = mockedSelect.mock.calls[0]?.[0] as {
      choices: Array<{ value: MenuChoice }>
    }
    const values = call.choices.map((c) => c.value)
    expect(values).toEqual(["web-ui", "terminal-ui", "tray", "exit"])
  })

  it.each<MenuChoice>(["web-ui", "terminal-ui", "tray", "exit"])(
    "round-trips choice %s",
    async (target) => {
      mockedSelect.mockResolvedValueOnce(target as never)
      const result = await runInteractiveMenu({ port: 7777 })
      expect(result).toBe(target)
    },
  )

  it("uses custom version when provided", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    mockedSelect.mockResolvedValueOnce("exit" as never)
    await runInteractiveMenu({ port: 8080, version: "9.9.9" })
    const logged = logSpy.mock.calls.flat().join("\n")
    expect(logged).toContain("9.9.9")
    expect(logged).toContain("8080")
  })
})
