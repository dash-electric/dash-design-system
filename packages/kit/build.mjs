#!/usr/bin/env node
/**
 * build.mjs — produce the `@dash/kit` bundle.
 *
 * `@dash/kit` IS the curated, ban-gated, import-rewritten `@dash/ui` atom
 * source bundle that Sandpack mounts inside the dash-build preview iframe.
 *
 * It is generated from the monorepo registry source
 * (`apps/docs/registry/dash/ui/*.tsx` + `lib/utils.ts`) by REUSING the exact
 * ban-gate / BFS-prune / import-rewrite logic that
 * `packages/dash-build/scripts/copy-dash-ui-to-template.mjs` exposes via its
 * pure `planCopy` / `renderBarrel` / `renderManifest` entry points — so the
 * producer (this package) and the consumer dev-fallback path can never drift
 * (R1 mitigation: reuse, don't reimplement).
 *
 * Output layout (flat — so dash-build's package mode is a verbatim tree copy):
 *   packages/kit/
 *     ├── index.tsx       (barrel)
 *     ├── manifest.json   (diagnostics)
 *     ├── lib/utils.tsx
 *     ├── badge.tsx
 *     └── …
 *
 * NOTE: we do NOT wipe the whole package dir (it holds package.json + this
 * build script) — we clean only the generated artifacts.
 *
 * Pure ESM, Node >= 20. Zero npm dependencies.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import {
  planCopy,
  renderBarrel,
  renderManifest,
} from "./tooling/copy-dash-ui-to-template.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const KIT_ROOT = __dirname
const REPO_ROOT = resolve(KIT_ROOT, "..", "..")
const ATOMS_SOURCE_DIR = resolve(REPO_ROOT, "apps", "docs", "registry", "dash", "ui")
const LIB_SOURCE_PATH = resolve(REPO_ROOT, "apps", "docs", "registry", "dash", "lib", "utils.ts")

// Files we never touch — the package shell.
const PRESERVE = new Set(["package.json", "build.mjs", "README.md", "node_modules", "tooling"])

// ─── Clean stale generated artifacts (everything except the shell) ──────────
for (const entry of readdirSync(KIT_ROOT)) {
  if (PRESERVE.has(entry)) continue
  rmSync(join(KIT_ROOT, entry), { recursive: true, force: true })
}

// ─── Build from raw monorepo source → run the full ban-gate + rewrite ───────
const plan = planCopy({ atomsDir: ATOMS_SOURCE_DIR, mode: "source" })

// ─── Write the gated, rewritten bundle into the package root (flat) ─────────
mkdirSync(join(KIT_ROOT, "lib"), { recursive: true })
writeFileSync(join(KIT_ROOT, "lib", "utils.tsx"), readFileSync(LIB_SOURCE_PATH, "utf8"), "utf8")

for (const atom of plan.included) {
  writeFileSync(join(KIT_ROOT, `${atom.slug}.tsx`), atom.rewritten, "utf8")
}

writeFileSync(
  join(KIT_ROOT, "index.tsx"),
  renderBarrel(plan.included.map((a) => a.slug)),
  "utf8",
)
writeFileSync(join(KIT_ROOT, "manifest.json"), renderManifest(plan), "utf8")

const sample = plan.included.slice(0, 6).map((a) => a.slug).join(", ")
// eslint-disable-next-line no-console
console.log(
  `[@dash/kit build] wrote ${plan.included.length} atom(s) to ${KIT_ROOT} ` +
    `(skipped ${plan.skipped.length}). Sample: ${sample}…`,
)
