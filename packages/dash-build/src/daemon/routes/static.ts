import type { ServerResponse } from "node:http"
import { DASHBOARD_CSS } from "../templates/styles/dashboard.js"
import { DASHBOARD_JS } from "../templates/client/app.js"
import { PREVIEW_MOUNT_JS } from "../templates/client/preview-mount.js"
import { notFound } from "./_helpers.js"

/**
 * Static assets — CSS + client JS, served inline (no FS reads, no bundler).
 *
 * Bodies live in TS source so they're tree-shaken alongside the daemon and
 * ship as one binary. Cache-Control: no-store because the dashboard is a
 * single-user dev tool, not a CDN edge.
 */
export function handleStatic(res: ServerResponse, pathname: string): void {
  if (pathname === "/static/app.css") {
    res.writeHead(200, {
      "Content-Type": "text/css; charset=utf-8",
      "Content-Length": Buffer.byteLength(DASHBOARD_CSS),
      "Cache-Control": "no-store",
    })
    res.end(DASHBOARD_CSS)
    return
  }
  if (pathname === "/static/app.js") {
    res.writeHead(200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Content-Length": Buffer.byteLength(DASHBOARD_JS),
      "Cache-Control": "no-store",
    })
    res.end(DASHBOARD_JS)
    return
  }
  // Component preview mount (Sandpack browser bundler). Workspace pages
  // include this via <script src="/static/preview-mount.js" defer>.
  if (pathname === "/static/preview-mount.js") {
    res.writeHead(200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Content-Length": Buffer.byteLength(PREVIEW_MOUNT_JS),
      "Cache-Control": "no-store",
    })
    res.end(PREVIEW_MOUNT_JS)
    return
  }
  notFound(res)
}
