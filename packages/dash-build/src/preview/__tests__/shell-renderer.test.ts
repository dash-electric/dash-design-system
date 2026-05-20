import { describe, expect, it } from "vitest"
import { renderShell } from "../shell-renderer.js"

describe("preview/shell-renderer", () => {
  it("includes CSP meta tag with frame-ancestors locked", () => {
    const html = renderShell({ promptId: "abc" })
    expect(html).toMatch(/<meta http-equiv="Content-Security-Policy"/)
    expect(html).toMatch(/frame-ancestors 'self'/)
    expect(html).toMatch(/connect-src 'none'/)
  })

  it("references the bundle.js path with the sanitized promptId", () => {
    const html = renderShell({ promptId: "../evil/id" })
    // sanitized: ".." → "__" and "/" → "_", "evil" stays, "/" → "_", "id" stays
    expect(html).toMatch(/<script src="\/preview\/___evil_id\/bundle\.js"><\/script>/)
    // raw traversal must NOT appear
    expect(html).not.toMatch(/\.\.\/evil/)
  })

  it("preconnects to Google Fonts and loads Plus Jakarta Sans", () => {
    const html = renderShell({ promptId: "ok" })
    expect(html).toMatch(/<link rel="preconnect" href="https:\/\/fonts.googleapis.com">/)
    expect(html).toMatch(/Plus\+Jakarta\+Sans/)
  })

  it("includes an error handler script that surfaces runtime errors", () => {
    const html = renderShell({ promptId: "ok" })
    expect(html).toMatch(/window.addEventListener\("error"/)
    expect(html).toMatch(/unhandledrejection/)
    expect(html).toMatch(/dash-preview-error/)
  })
})
