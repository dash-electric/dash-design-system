import { describe, expect, it, vi } from "vitest"
import {
  buildProbeUrls,
  loadProbeUrls,
  parseCdnConstants,
  probeUrl,
  probeAll,
  reportResults,
  // @ts-expect-error — ESM module without type defs (.mjs)
} from "../probe-sandpack-cdn.mjs"

const CDN_SOURCE = `
export const SANDPACK_VERSION = "2.19.10"
export const REACT_VERSION = "18.3.1"
export const SANDPACK_CDN_URL = \`https://esm.sh/@codesandbox/sandpack-react@\${SANDPACK_VERSION}\`
`

describe("probe-sandpack-cdn", () => {
  describe("parseCdnConstants + buildProbeUrls", () => {
    it("extracts double-quoted version constants from the TS source", () => {
      const consts = parseCdnConstants(CDN_SOURCE)
      expect(consts.SANDPACK_VERSION).toBe("2.19.10")
      expect(consts.REACT_VERSION).toBe("18.3.1")
    })

    it("templates probe URLs in the canonical esm.sh shape", () => {
      const urls = buildProbeUrls({ SANDPACK_VERSION: "1.0.0", REACT_VERSION: "19.0.0" })
      expect(urls).toEqual([
        "https://esm.sh/@codesandbox/sandpack-react@1.0.0",
        "https://esm.sh/react@19.0.0",
        "https://esm.sh/react-dom@19.0.0/client",
      ])
    })

    it("throws loudly if the constants file shape diverges", () => {
      expect(() => buildProbeUrls({})).toThrow(/SANDPACK_VERSION/)
    })

    it("loadProbeUrls reads + parses via injected readFile", () => {
      const urls = loadProbeUrls({ readFile: () => CDN_SOURCE, path: "ignored" })
      expect(urls).toEqual([
        "https://esm.sh/@codesandbox/sandpack-react@2.19.10",
        "https://esm.sh/react@18.3.1",
        "https://esm.sh/react-dom@18.3.1/client",
      ])
    })
  })

  describe("probeUrl", () => {
    it("returns ok=true on 2xx HEAD", async () => {
      const fakeFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      const result = await probeUrl("https://example.test/x", { fetch: fakeFetch })
      expect(result.ok).toBe(true)
      expect(result.status).toBe(200)
      expect(fakeFetch).toHaveBeenCalledWith(
        "https://example.test/x",
        expect.objectContaining({ method: "HEAD", redirect: "follow" }),
      )
    })

    it("returns ok=false on non-2xx HEAD (e.g. 404)", async () => {
      const fakeFetch = vi.fn().mockResolvedValue({ ok: false, status: 404 })
      const result = await probeUrl("https://example.test/missing", {
        fetch: fakeFetch,
      })
      expect(result.ok).toBe(false)
      expect(result.status).toBe(404)
      expect(result.message).toContain("404")
    })

    it("returns ok=false on network error (no status)", async () => {
      const fakeFetch = vi.fn().mockRejectedValue(new Error("ENOTFOUND"))
      const result = await probeUrl("https://example.test/dead", {
        fetch: fakeFetch,
      })
      expect(result.ok).toBe(false)
      expect(result.status).toBeNull()
      expect(result.message).toContain("ENOTFOUND")
    })
  })

  describe("probeAll + reportResults", () => {
    it("probes every URL in parallel and returns one result per URL", async () => {
      const fakeFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      const results = await probeAll(
        ["https://a.test/", "https://b.test/", "https://c.test/"],
        { fetch: fakeFetch },
      )
      expect(results).toHaveLength(3)
      expect(results.every((r: { ok: boolean }) => r.ok)).toBe(true)
      expect(fakeFetch).toHaveBeenCalledTimes(3)
    })

    it("reportResults returns failed=false when all probes pass", () => {
      const log = vi.fn()
      const errlog = vi.fn()
      const { failed } = reportResults(
        [{ url: "u", ok: true, status: 200, message: "ok" }],
        log,
        errlog,
      )
      expect(failed).toBe(false)
      expect(errlog).not.toHaveBeenCalled()
    })

    it("reportResults returns failed=true and emits diagnostics when a probe fails", () => {
      const log = vi.fn()
      const errlog = vi.fn()
      const { failed } = reportResults(
        [
          { url: "u-good", ok: true, status: 200, message: "ok" },
          { url: "u-bad", ok: false, status: 503, message: "HTTP 503" },
        ],
        log,
        errlog,
      )
      expect(failed).toBe(true)
      const stderrText = errlog.mock.calls.map((c) => c[0]).join("\n")
      expect(stderrText).toContain("u-bad")
      expect(stderrText).toContain("503")
      expect(stderrText).toMatch(/src\/constants\/cdn\.ts/)
    })
  })
})
