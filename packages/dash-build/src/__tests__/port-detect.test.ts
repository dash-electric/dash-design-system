import { describe, it, expect, afterEach } from "vitest"
import { createServer, type Server } from "node:net"
import { detectPort, isPortFree } from "../menu/port-detect.js"

const openedServers: Server[] = []

function occupyPort(port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once("error", reject)
    server.listen(port, "127.0.0.1", () => {
      openedServers.push(server)
      resolve(server)
    })
  })
}

afterEach(async () => {
  await Promise.all(
    openedServers.splice(0).map(
      (s) =>
        new Promise<void>((resolve) => {
          s.close(() => resolve())
        }),
    ),
  )
})

describe("isPortFree", () => {
  it("returns true for a likely-free high port", async () => {
    const port = 49152 + Math.floor(Math.random() * 10_000)
    const free = await isPortFree(port)
    expect(typeof free).toBe("boolean")
  })

  it("returns false when port is occupied", async () => {
    const port = 51234
    await occupyPort(port)
    const free = await isPortFree(port)
    expect(free).toBe(false)
  })
})

describe("detectPort", () => {
  it("returns the start port when free", async () => {
    // Pick a high uncommon port to avoid system clashes
    const start = 52001
    const port = await detectPort(start, 5)
    expect(port).toBeGreaterThanOrEqual(start)
    expect(port).toBeLessThan(start + 5)
  })

  it("falls back to next port when start is occupied", async () => {
    const start = 53001
    await occupyPort(start)
    const port = await detectPort(start, 5)
    expect(port).toBeGreaterThan(start)
    expect(port).toBeLessThan(start + 5)
  })

  it("throws when no free port in range", async () => {
    const start = 54001
    await Promise.all([
      occupyPort(start),
      occupyPort(start + 1),
      occupyPort(start + 2),
    ])
    await expect(detectPort(start, 3)).rejects.toThrow(/No free port/)
  })
})
