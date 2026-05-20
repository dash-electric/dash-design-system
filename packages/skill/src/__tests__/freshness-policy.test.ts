import { describe, expect, it } from "vitest"
import {
  DEFAULT_CACHE_TTL_MS,
  describeFreshness,
  shouldRefresh,
} from "../lib/freshness-policy.js"
import type { CachedSnapshot } from "../lib/snapshot-cache.js"

function fakeCache(overrides: Partial<CachedSnapshot> = {}): CachedSnapshot {
  return {
    schemaVersion: 1,
    cachedAt: Date.now(),
    fingerprint: "fp-1",
    dsVersion: "0.0.1",
    cwd: "/x",
    snapshot: {
      schemaVersion: 1,
      project: { framework: "next", typescript: true, packageManager: "pnpm", rootPath: "/x" },
      aliases: {},
      dash: { registryUrl: "", hasToken: false, installedItems: [] },
      customHooks: [],
      apiBaseUrl: null,
    },
    ...overrides,
  }
}

describe("shouldRefresh", () => {
  it("forceRefresh wins regardless of cache state", () => {
    const d = shouldRefresh({
      cache: fakeCache(),
      currentFingerprint: "fp-1",
      forceRefresh: true,
    })
    expect(d.refresh).toBe(true)
    expect(d.reason).toBe("forced")
  })

  it("no cache → refresh with reason no-cache", () => {
    const d = shouldRefresh({ cache: null, currentFingerprint: "fp-1" })
    expect(d.refresh).toBe(true)
    expect(d.reason).toBe("no-cache")
  })

  it("valid cache + same fingerprint + fresh TTL → no refresh", () => {
    const d = shouldRefresh({
      cache: fakeCache({ cachedAt: Date.now() - 60_000 }),
      currentFingerprint: "fp-1",
    })
    expect(d.refresh).toBe(false)
    expect(d.reason).toBe("valid-cache")
  })

  it("fingerprint mismatch → refresh", () => {
    const d = shouldRefresh({
      cache: fakeCache({ fingerprint: "fp-OLD" }),
      currentFingerprint: "fp-NEW",
    })
    expect(d.refresh).toBe(true)
    expect(d.reason).toBe("fingerprint-changed")
  })

  it("TTL expired → refresh", () => {
    const d = shouldRefresh({
      cache: fakeCache({ cachedAt: Date.now() - (DEFAULT_CACHE_TTL_MS + 1) }),
      currentFingerprint: "fp-1",
    })
    expect(d.refresh).toBe(true)
    expect(d.reason).toBe("ttl-expired")
  })

  it("custom ttlMs respected", () => {
    const d = shouldRefresh({
      cache: fakeCache({ cachedAt: Date.now() - 5_000 }),
      currentFingerprint: "fp-1",
      ttlMs: 1_000, // 1s
    })
    expect(d.refresh).toBe(true)
    expect(d.reason).toBe("ttl-expired")
  })

  it("describeFreshness produces human strings for every reason", () => {
    expect(describeFreshness({ refresh: false, reason: "valid-cache", ageMs: 60_000 })).toMatch(/fresh/)
    expect(describeFreshness({ refresh: true, reason: "no-cache", ageMs: 0 })).toMatch(/no cache yet/)
    expect(
      describeFreshness({ refresh: true, reason: "fingerprint-changed", ageMs: 120_000 }),
    ).toMatch(/STALE/)
    expect(
      describeFreshness({ refresh: true, reason: "ttl-expired", ageMs: 99999999 }),
    ).toMatch(/TTL expired/)
    expect(describeFreshness({ refresh: true, reason: "forced", ageMs: 0 })).toMatch(/force-refresh/)
  })
})
