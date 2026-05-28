/**
 * Tier 6 — PPT export for workspace runs.
 *
 * The 2026-05-28 spec (`docs/specs/dash-pptx-output-2026-05-28.md`) proposes
 * `pptxgenjs` for native `.pptx` generation, but adding a binary-emitting
 * dependency conflicts with the "Zero npm/runtime dep" cardinal rule for
 * Dash DS distribution (memory `dash_ds_code_sovereign`). The pivot plan's
 * fallback strategy applies: emit a self-contained `index.html` styled as a
 * 4-slide deck. Opens in any browser and prints to PDF via the browser's
 * built-in dialog. Importable into Keynote/PowerPoint via "Open" → PDF.
 *
 * The 4-slide structure matches the workspace's existing tab model:
 *
 *   Slide 1  Cover         — project name + prompt summary + generated-at
 *   Slide 2  Component     — Sandpack preview placeholder + DS imports list
 *   Slide 3  BE Impact     — endpoints + DB tables touched
 *   Slide 4  Audit         — CR-3 status + audit-call references
 *
 * Plus-Jakarta-Sans + Dash semantic tokens (inlined as CSS variables so the
 * deck is fully portable). No external font fetch at print time.
 *
 * Consumer: `POST /api/runs/:runId/export/pptx` returns the HTML body with
 * `Content-Type: text/html` and a `Content-Disposition: attachment` header.
 */

import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { DEFAULT_RUNS_ROOT, resolveRunDir } from "./artifact-store.js"
import type {
  AuditSnapshot,
  BeImpactSnapshot,
} from "../daemon/templates/components/preview-panel.js"

export interface PptxExportPayload {
  /** Stable run id; matches `<runDir>` on disk. */
  runId: string
  /** Project/run friendly name (defaults to the run id). */
  projectName?: string | null
  /** Prompt text used to generate the run. */
  prompt?: string | null
  /** ISO timestamp the run finished (or now()). */
  generatedAt?: string | null
  /** Surface label ("backoffice", "portal-v2", …). */
  surface?: string | null
  /** Optional cold-load snapshots, sourced from `<runDir>/intake.json`. */
  beImpact?: BeImpactSnapshot | null
  audit?: AuditSnapshot | null
}

export interface PptxExportResult {
  /** "text/html" — the deck format. */
  contentType: string
  /** Filename safe for `Content-Disposition`. */
  filename: string
  /** Rendered deck body. */
  body: string
}

function esc(input: string | null | undefined): string {
  if (input === null || input === undefined) return ""
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function truncate(input: string, max: number): string {
  if (input.length <= max) return input
  return input.slice(0, max - 1).trimEnd() + "…"
}

function sanitizeFilename(input: string): string {
  return input.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 64) || "run"
}

/**
 * Read the on-disk intake snapshot for `runId` and translate the BE Impact
 * portion into the same shape the workspace preview-panel uses. Returns
 * `null` when the snapshot is missing or unreadable — callers degrade
 * gracefully (the corresponding slide shows an empty-state body).
 */
export async function readBeImpactFromIntake(
  runId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<BeImpactSnapshot | null> {
  const file = join(resolveRunDir(runId, root), "intake.json")
  if (!existsSync(file)) return null
  try {
    const raw = JSON.parse(await readFile(file, "utf8")) as {
      scenario?: string
      beEndpoints?: Array<{ method: string; path: string; file: string }>
      dbSchema?: { tables?: string[] }
    }
    return {
      scenario: raw.scenario ?? null,
      existingEndpoints: (raw.beEndpoints ?? []).slice(0, 20),
      dbTables: (raw.dbSchema?.tables ?? []).slice(0, 20).map((name) => ({
        name,
        access: null,
      })),
      requiredEndpoints: [],
    }
  } catch {
    return null
  }
}

/**
 * Read the on-disk intake snapshot for `runId` and project the audit fields
 * into the preview-panel shape. Returns `null` when missing/unreadable.
 */
export async function readAuditFromIntake(
  runId: string,
  root: string = DEFAULT_RUNS_ROOT,
): Promise<AuditSnapshot | null> {
  const file = join(resolveRunDir(runId, root), "intake.json")
  if (!existsSync(file)) return null
  try {
    const raw = JSON.parse(await readFile(file, "utf8")) as {
      audit?: {
        detected?: boolean
        reasonsCode?: string[]
        requiredFields?: string[]
      }
    }
    const detected = Boolean(raw.audit?.detected)
    const requiredFields = raw.audit?.requiredFields ?? []
    return {
      status: detected ? "required" : "pass",
      reason: detected
        ? `Audit trail required for sensitive fields: ${requiredFields.join(", ") || "n/a"}`
        : "No CR-3 audit triggers detected for this run.",
      pattern: raw.audit?.reasonsCode?.[0] ?? null,
      sensitiveFields: requiredFields,
      auditCalls: [],
      validatorChecks: [],
    }
  } catch {
    return null
  }
}

function renderCoverSlide(payload: PptxExportPayload): string {
  const projectName = payload.projectName?.trim() || payload.runId
  const prompt = payload.prompt?.trim()
    ? truncate(payload.prompt.trim(), 280)
    : "(no prompt captured for this run)"
  const date = (payload.generatedAt ?? new Date().toISOString()).slice(0, 10)
  return `<section class="db-slide db-slide--cover" aria-label="Cover">
    <div class="db-slide-inner">
      <p class="db-slide-kicker">Dash Build · Run report</p>
      <h1 class="db-slide-title">${esc(projectName)}</h1>
      <p class="db-slide-prompt">${esc(prompt)}</p>
      <dl class="db-slide-meta">
        <div class="db-slide-meta-row"><dt>Surface</dt><dd>${esc(payload.surface ?? "shared")}</dd></div>
        <div class="db-slide-meta-row"><dt>Run id</dt><dd><code>${esc(payload.runId)}</code></dd></div>
        <div class="db-slide-meta-row"><dt>Generated</dt><dd>${esc(date)}</dd></div>
      </dl>
    </div>
    <footer class="db-slide-footer">Slide 1 / 4 · ${esc(projectName)}</footer>
  </section>`
}

function renderComponentSlide(payload: PptxExportPayload): string {
  // Sandpack screenshot capture is non-trivial in a node-only daemon; the
  // spec calls out a placeholder image as an acceptable MVP. We render a
  // styled "preview unavailable" tile that prints cleanly and prompts the
  // reader to open the workspace URL for the live view.
  return `<section class="db-slide db-slide--component" aria-label="Component preview">
    <div class="db-slide-inner">
      <p class="db-slide-kicker">Component preview</p>
      <h2 class="db-slide-heading">Generated component</h2>
      <div class="db-slide-component-card" role="img" aria-label="Component preview placeholder">
        <span class="db-slide-component-icon" aria-hidden="true">◳</span>
        <p class="db-slide-component-note">Live preview available in the workspace.</p>
        <p class="db-slide-component-link"><code>/workspace/${esc(payload.runId)}</code></p>
      </div>
      <p class="db-slide-note">
        Headless capture of the Sandpack iframe is out of scope for the MVP exporter — open
        the workspace URL in a browser, then capture the canvas separately if a static
        screenshot is required for distribution.
      </p>
    </div>
    <footer class="db-slide-footer">Slide 2 / 4 · Component</footer>
  </section>`
}

function renderBeImpactSlide(payload: PptxExportPayload): string {
  const snapshot = payload.beImpact ?? null
  let bodyHtml: string
  if (!snapshot || (
    snapshot.existingEndpoints.length === 0 &&
    snapshot.dbTables.length === 0 &&
    snapshot.requiredEndpoints.length === 0
  )) {
    bodyHtml = `<p class="db-slide-empty">No backend touchpoints captured for this run.</p>`
  } else {
    const eps = snapshot.existingEndpoints
      .map(
        (e) =>
          `<li><span class="db-slide-tag">${esc(e.method)}</span> <code>${esc(e.path)}</code><span class="db-slide-muted"> · ${esc(e.file)}</span></li>`,
      )
      .join("")
    const tables = snapshot.dbTables
      .map((t) => `<li><code>${esc(t.name)}</code>${t.access ? ` <span class="db-slide-muted">(${esc(t.access)})</span>` : ""}</li>`)
      .join("")
    const required = snapshot.requiredEndpoints
      .map((r) => `<li>${esc(r.description)}</li>`)
      .join("")
    bodyHtml = `
      ${snapshot.scenario ? `<p class="db-slide-scenario">Scenario: <strong>${esc(snapshot.scenario)}</strong></p>` : ""}
      ${eps ? `<h3>Existing endpoints (${snapshot.existingEndpoints.length})</h3><ul class="db-slide-list">${eps}</ul>` : ""}
      ${tables ? `<h3>DB tables (${snapshot.dbTables.length})</h3><ul class="db-slide-list">${tables}</ul>` : ""}
      ${required ? `<h3>Required new endpoints (${snapshot.requiredEndpoints.length})</h3><ul class="db-slide-list">${required}</ul>` : ""}
    `
  }
  return `<section class="db-slide db-slide--be" aria-label="Backend impact">
    <div class="db-slide-inner">
      <p class="db-slide-kicker">Backend impact</p>
      <h2 class="db-slide-heading">Endpoints &amp; data</h2>
      ${bodyHtml}
    </div>
    <footer class="db-slide-footer">Slide 3 / 4 · BE Impact</footer>
  </section>`
}

function renderAuditSlide(payload: PptxExportPayload): string {
  const snapshot = payload.audit ?? null
  const status = snapshot?.status ?? "pass"
  const statusLabel =
    status === "pass" ? "Pass" : status === "required" ? "Required" : "Missing"
  const reason = snapshot?.reason ?? "No audit findings."
  const sensitive = snapshot?.sensitiveFields ?? []
  const calls = snapshot?.auditCalls ?? []
  return `<section class="db-slide db-slide--audit" aria-label="Audit">
    <div class="db-slide-inner">
      <p class="db-slide-kicker">Audit (CR-3)</p>
      <h2 class="db-slide-heading">Status: <span class="db-slide-status db-slide-status--${esc(status)}">${esc(statusLabel)}</span></h2>
      <p class="db-slide-reason">${esc(reason)}</p>
      ${
        sensitive.length > 0
          ? `<h3>Sensitive fields (${sensitive.length})</h3><ul class="db-slide-list">${sensitive.map((f) => `<li><code>${esc(f)}</code></li>`).join("")}</ul>`
          : ""
      }
      ${
        calls.length > 0
          ? `<h3>Audit-call references (${calls.length})</h3><ul class="db-slide-list">${calls.map((c) => `<li><code>${esc(c)}</code></li>`).join("")}</ul>`
          : ""
      }
    </div>
    <footer class="db-slide-footer">Slide 4 / 4 · Audit · CR-3</footer>
  </section>`
}

const DECK_STYLES = `
:root {
  --dash-bg: #ffffff;
  --dash-fg: #0f172a;
  --dash-muted: #64748b;
  --dash-line: #e2e8f0;
  --dash-accent: #5e2aac;
  --dash-success: #16a34a;
  --dash-warn: #ea580c;
  --dash-error: #dc2626;
  --dash-page: #f1f5f9;
  --dash-tile: #f8fafc;
  --dash-on-accent: #ffffff;
  font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--dash-page); color: var(--dash-fg); }
.db-deck { display: flex; flex-direction: column; gap: 24px; padding: 24px; max-width: 1280px; margin: 0 auto; }
.db-deck-header { padding: 16px 24px; background: var(--dash-bg); border: 1px solid var(--dash-line); border-radius: 12px; }
.db-deck-header h1 { margin: 0 0 4px; font-size: 18px; }
.db-deck-instructions { margin: 0; font-size: 13px; color: var(--dash-muted); }
.db-slide { background: var(--dash-bg); border: 1px solid var(--dash-line); border-radius: 12px; box-shadow: 0 1px 2px rgba(15,23,42,0.04); display: flex; flex-direction: column; aspect-ratio: 16 / 9; min-height: 540px; overflow: hidden; }
.db-slide-inner { flex: 1; padding: 48px 56px; display: flex; flex-direction: column; gap: 16px; }
.db-slide-footer { padding: 12px 56px; border-top: 1px solid var(--dash-line); font-size: 12px; color: var(--dash-muted); display: flex; justify-content: space-between; }
.db-slide-kicker { margin: 0; font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--dash-accent); font-weight: 600; }
.db-slide-title { margin: 0; font-size: 44px; font-weight: 700; line-height: 1.1; }
.db-slide-heading { margin: 0; font-size: 28px; font-weight: 600; }
.db-slide-prompt { margin: 8px 0 0; font-size: 18px; color: var(--dash-fg); line-height: 1.4; }
.db-slide-meta { margin: auto 0 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px 24px; border-top: 1px solid var(--dash-line); padding-top: 16px; }
.db-slide-meta-row { display: flex; flex-direction: column; gap: 4px; }
.db-slide-meta dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--dash-muted); }
.db-slide-meta dd { margin: 0; font-size: 14px; }
.db-slide-meta code { font-size: 13px; }
.db-slide-component-card { border: 2px dashed var(--dash-line); border-radius: 12px; padding: 48px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; background: var(--dash-tile); flex: 1; justify-content: center; }
.db-slide-component-icon { font-size: 48px; color: var(--dash-muted); }
.db-slide-component-note { margin: 0; font-size: 16px; color: var(--dash-fg); }
.db-slide-component-link { margin: 0; font-size: 13px; color: var(--dash-muted); }
.db-slide-note { margin: 0; font-size: 13px; color: var(--dash-muted); line-height: 1.5; }
.db-slide-empty { margin: 0; font-size: 16px; color: var(--dash-muted); font-style: italic; }
.db-slide-scenario { margin: 0; font-size: 14px; color: var(--dash-muted); }
.db-slide-list { margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7; }
.db-slide-list code { font-size: 13px; }
.db-slide-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; background: var(--dash-accent); color: var(--dash-on-accent); font-size: 11px; font-weight: 600; letter-spacing: 0.04em; margin-right: 6px; }
.db-slide-muted { color: var(--dash-muted); font-size: 12px; }
.db-slide h3 { margin: 12px 0 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--dash-muted); font-weight: 600; }
.db-slide-status { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 16px; font-weight: 600; }
.db-slide-status--pass { background: rgba(22,163,74,0.12); color: var(--dash-success); }
.db-slide-status--required { background: rgba(234,88,12,0.12); color: var(--dash-warn); }
.db-slide-status--missing { background: rgba(220,38,38,0.12); color: var(--dash-error); }
.db-slide-reason { margin: 0; font-size: 16px; line-height: 1.4; }
@media print {
  html, body { background: var(--dash-bg); }
  .db-deck-header { display: none; }
  .db-deck { gap: 0; padding: 0; max-width: none; }
  .db-slide { border: none; border-radius: 0; box-shadow: none; page-break-after: always; aspect-ratio: auto; height: 100vh; min-height: 100vh; }
  .db-slide:last-child { page-break-after: auto; }
}
`

/**
 * Render the deck as a self-contained HTML document. No external fetches at
 * print time (fonts inlined to system fallback). Browsers print to PDF via
 * the built-in dialog; the resulting PDF imports cleanly into PowerPoint
 * (File → Open → PDF) and Keynote.
 */
export function renderPptxDeck(payload: PptxExportPayload): PptxExportResult {
  const title = payload.projectName?.trim() || payload.runId
  const slides = [
    renderCoverSlide(payload),
    renderComponentSlide(payload),
    renderBeImpactSlide(payload),
    renderAuditSlide(payload),
  ].join("\n")
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=1280" />
  <title>${esc(title)} · Dash Build deck</title>
  <style>${DECK_STYLES}</style>
</head>
<body>
  <main class="db-deck" data-run-id="${esc(payload.runId)}">
    <header class="db-deck-header">
      <h1>Dash Build · ${esc(title)}</h1>
      <p class="db-deck-instructions">
        Open in PowerPoint or Keynote: print this page to PDF (Cmd/Ctrl-P → "Save as PDF"),
        then open the PDF in the target presentation app. Slides are 16:9 letterbox so the
        print output matches a standard widescreen deck.
      </p>
    </header>
    ${slides}
  </main>
</body>
</html>`
  return {
    contentType: "text/html; charset=utf-8",
    filename: `${sanitizeFilename(title)}-deck.html`,
    body,
  }
}
