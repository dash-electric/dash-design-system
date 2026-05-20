import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  fetchRegistryItem,
  fetchRegistryIndex,
  RegistryError,
} from "../registry-fetch.js"

const REGISTRY_URL = "https://ds.test.local"

function stubFetch(handler: (url: string) => Response): () => void {
  const original = globalThis.fetch
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString()
    return handler(url)
  }) as typeof globalThis.fetch
  return () => {
    globalThis.fetch = original
  }
}

describe("fetchRegistryItem — runtime schema validation", () => {
  let restore: () => void

  afterEach(() => {
    restore?.()
  })

  it("returns parsed item for valid payload", async () => {
    restore = stubFetch(() =>
      new Response(
        JSON.stringify({
          name: "button-valid-test",
          type: "registry:ui",
          title: "Button",
          description: "btn",
          files: [{ path: "ui/button.tsx", type: "registry:ui" }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    )
    const item = await fetchRegistryItem("button-valid-test", {
      registryUrl: REGISTRY_URL,
      noCache: true,
    })
    expect(item.name).toBe("button-valid-test")
    expect(item.type).toBe("registry:ui")
  })

  it("throws RegistryError when payload is malformed (missing name)", async () => {
    restore = stubFetch(() =>
      new Response(
        JSON.stringify({ type: "registry:ui", title: "x" }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    )
    await expect(
      fetchRegistryItem("malformed-no-name", {
        registryUrl: REGISTRY_URL,
        noCache: true,
      }),
    ).rejects.toBeInstanceOf(RegistryError)
  })

  it("throws RegistryError when type is unknown", async () => {
    restore = stubFetch(() =>
      new Response(
        JSON.stringify({ name: "x-bad-type", type: "registry:bogus" }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    )
    const err = await fetchRegistryItem("x-bad-type", {
      registryUrl: REGISTRY_URL,
      noCache: true,
    }).catch((e) => e)
    expect(err).toBeInstanceOf(RegistryError)
    expect((err as RegistryError).suggestion).toMatch(/doctor/i)
  })
})

describe("fetchRegistryIndex — runtime schema validation", () => {
  let restore: () => void

  afterEach(() => {
    restore?.()
  })

  it("returns parsed index for valid payload", async () => {
    restore = stubFetch(() =>
      new Response(
        JSON.stringify({
          name: "dash",
          homepage: "https://ds.test.local",
          items: [
            {
              name: "button",
              type: "registry:ui",
              title: "Button",
              description: "btn",
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    )
    const idx = await fetchRegistryIndex({
      registryUrl: REGISTRY_URL + "/valid-index",
      noCache: true,
    })
    expect(idx.items.length).toBe(1)
    expect(idx.items[0].name).toBe("button")
  })

  it("throws RegistryError when index is malformed", async () => {
    restore = stubFetch(() =>
      new Response(
        JSON.stringify({ name: "dash", homepage: "https://x", items: "not-an-array" }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    )
    await expect(
      fetchRegistryIndex({
        registryUrl: REGISTRY_URL + "/bad-index",
        noCache: true,
      }),
    ).rejects.toBeInstanceOf(RegistryError)
  })
})
