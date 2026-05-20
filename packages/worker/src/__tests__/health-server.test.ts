import { describe, expect, it } from "vitest"
import http from "node:http"
import {
  evaluateHealth,
  startHealthServer,
  type HealthState,
} from "../health-server.js"

function fetchJson(
  port: number,
  path: string,
): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: "127.0.0.1", port, path, method: "GET" },
      (res) => {
        let raw = ""
        res.on("data", (c) => (raw += c.toString()))
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode ?? 0,
              body: JSON.parse(raw || "{}") as Record<string, unknown>,
            })
          } catch (e) {
            reject(e)
          }
        })
      },
    )
    req.on("error", reject)
    req.end()
  })
}

describe("evaluateHealth", () => {
  const base: HealthState = {
    lastPoll: null,
    pendingGaps: 0,
    processedToday: 0,
    pollIntervalMs: 60_000,
    startedAt: 0,
  }

  it("reports starting during initial grace period (no poll yet)", () => {
    const now = 30_000 // 30s after start, well under 2× poll interval
    const v = evaluateHealth({ ...base, startedAt: 0 }, now)
    expect(v.status).toBe("starting")
    expect(v.httpStatus).toBe(200)
  })

  it("reports stuck after grace period elapses with no poll", () => {
    const now = 60_000 * 5 // 5 minutes
    const v = evaluateHealth({ ...base, startedAt: 0 }, now)
    expect(v.status).toBe("stuck")
    expect(v.httpStatus).toBe(503)
  })

  it("reports ok when last poll is fresh", () => {
    const v = evaluateHealth(
      { ...base, lastPoll: 100_000, startedAt: 0 },
      110_000,
    )
    expect(v.status).toBe("ok")
    expect(v.httpStatus).toBe(200)
  })

  it("reports stuck when last poll is older than 2× interval", () => {
    const v = evaluateHealth(
      { ...base, lastPoll: 100_000, startedAt: 0 },
      100_000 + 60_000 * 3,
    )
    expect(v.status).toBe("stuck")
    expect(v.httpStatus).toBe(503)
  })
})

describe("startHealthServer", () => {
  it("serves /health and reflects recordPoll updates", async () => {
    const srv = startHealthServer({ port: 0, pollIntervalMs: 60_000 })
    try {
      await srv.ready
      const port = srv.port()
      const r1 = await fetchJson(port, "/health")
      expect(r1.status).toBe(200) // starting grace
      expect(r1.body.status).toBe("starting")

      srv.recordPoll(3)
      srv.incrementProcessed(2)
      const r2 = await fetchJson(port, "/health")
      expect(r2.status).toBe(200)
      expect(r2.body.status).toBe("ok")
      expect(r2.body.pendingGaps).toBe(3)
      expect(r2.body.processedToday).toBe(2)
    } finally {
      await srv.close()
    }
  })

  it("returns 404 for unknown routes", async () => {
    const srv = startHealthServer({ port: 0, pollIntervalMs: 60_000 })
    try {
      await srv.ready
      const r = await fetchJson(srv.port(), "/nope")
      expect(r.status).toBe(404)
    } finally {
      await srv.close()
    }
  })
})
