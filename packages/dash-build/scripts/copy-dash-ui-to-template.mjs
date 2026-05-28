#!/usr/bin/env node
/**
 * copy-dash-ui-to-template.mjs — Tier 0 Phase C / 0E (sub-task 1).
 *
 * Copies a CURATED, SAFE subset of `@dash/ui` atoms from
 * `apps/docs/registry/dash/ui/*.tsx` into
 * `packages/dash-build/preview-template/dash-ui/*.tsx` so they can be shipped
 * into the Sandpack iframe at runtime. The barrel `index.tsx` re-exports
 * every copied atom, so generated code that does
 * `import { Badge } from "@dash/ui"` resolves at runtime instead of 404-ing
 * against npm (the registry is sovereign — `@dash/ui` is NOT published).
 *
 * Why we only ship a subset:
 *   - Many atoms pull heavy external deps (recharts, react-day-picker, cmdk,
 *     date-fns, sonner, embla-carousel, react-resizable-panels, react-colorful,
 *     input-otp). Shipping those balloons the iframe payload and Sandpack
 *     can't resolve them anyway. We skip silently.
 *   - Some atoms pull a NON-react-slot `@radix-ui/*` package — drop those for
 *     the same reason.
 *   - Atoms importing one of the BANNED packages (react-hook-form, zod, …)
 *     are unconditionally rejected — they violate Dash CR-3 and would leak
 *     into iframe generation otherwise.
 *   - Atoms transitively depending on a dropped atom are pruned (BFS closure).
 *
 * Output:
 *   preview-template/dash-ui/
 *     ├── index.tsx       (barrel re-export `export * from "./badge"` …)
 *     ├── lib/utils.tsx   (the `cn` helper — depended on by every atom)
 *     ├── badge.tsx       (rewritten imports → `./lib/utils`, `./button`)
 *     ├── button.tsx
 *     └── …
 *
 * Imports are rewritten as follows:
 *   `@/registry/dash/lib/utils`        → `./lib/utils`
 *   `@/registry/dash/ui/<name>`        → `./<name>`
 *
 * Zero npm dependencies. Pure ESM, Node >= 20.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Paths ────────────────────────────────────────────────────────────────
const PACKAGE_ROOT = resolve(__dirname, "..")
const REPO_ROOT = resolve(PACKAGE_ROOT, "..", "..")
const ATOMS_SOURCE_DIR = resolve(REPO_ROOT, "apps", "docs", "registry", "dash", "ui")
const LIB_SOURCE_PATH = resolve(REPO_ROOT, "apps", "docs", "registry", "dash", "lib", "utils.ts")
const OUTPUT_DIR = resolve(PACKAGE_ROOT, "preview-template", "dash-ui")
const OUTPUT_LIB_DIR = resolve(OUTPUT_DIR, "lib")
const MANIFEST_PATH = resolve(OUTPUT_DIR, "manifest.json")

// ─── Banned packages — never ship an atom that imports any of these ───────
// Mirror of `BANNED_IMPORTS` in `src/skills/prompt-composer.ts` plus the
// runtime cost gate (heavy / non-resolvable from Sandpack CDN).
const BANNED_IMPORTS = ["react-hook-form", "@hookform", "@tanstack", "swr", "zod"]
const HEAVY_OR_UNRESOLVABLE = [
  "react-day-picker",
  "recharts",
  "cmdk",
  "date-fns",
  "sonner",
  "react-resizable-panels",
  "react-colorful",
  "input-otp",
  "embla-carousel-react",
]

/**
 * Allow `@radix-ui/react-slot` (used by Button / IconButton / Slot wrappers
 * for asChild semantics — tiny, no runtime DOM); reject any other radix
 * package since they bring jsx tree primitives we don't need.
 */
const RADIX_ALLOWLIST = ["@radix-ui/react-slot"]

// ─── Import-rewrite regexes ───────────────────────────────────────────────
const REGISTRY_LIB_RE = /@\/registry\/dash\/lib\/utils/g
const REGISTRY_UI_RE = /@\/registry\/dash\/ui\/([a-z0-9-]+)/g
// Catches anything else under `@/registry/...` — those are gaps we cannot
// rewrite, so an atom that has one gets skipped.
const REGISTRY_OTHER_RE = /@\/registry\/(?!dash\/(?:lib\/utils|ui\/[a-z0-9-]+))[^"]+/g

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Pull `from "x"` specifiers out of a file's TS source. Returns deduped
 * package + relative specs (specs starting with `.` are dropped — we don't
 * care about them for ban-gate purposes).
 */
function collectExternalImports(source) {
  const out = new Set()
  const importRe = /\bfrom\s+["']([^"']+)["']/g
  let m
  while ((m = importRe.exec(source)) !== null) {
    const spec = m[1]
    if (spec.startsWith(".")) continue
    if (spec.startsWith("@/")) continue
    // Capture top-level package name (e.g. `@radix-ui/react-slot` from
    // `@radix-ui/react-slot/dist/foo`).
    if (spec.startsWith("@")) {
      const parts = spec.split("/")
      out.add(parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec)
    } else {
      out.add(spec.split("/")[0])
    }
  }
  return out
}

/**
 * Pull `@/registry/dash/ui/<name>` references — these are SIBLING atom deps.
 * Returns deduped slug list (the `<name>` part).
 */
function collectSiblingDeps(source) {
  const out = new Set()
  let m
  // Reset state since we're reusing a global regex
  REGISTRY_UI_RE.lastIndex = 0
  while ((m = REGISTRY_UI_RE.exec(source)) !== null) {
    out.add(m[1])
  }
  return out
}

function rewriteSource(source) {
  return source
    .replace(REGISTRY_LIB_RE, "./lib/utils")
    .replace(REGISTRY_UI_RE, "./$1")
}

function readAtomSource(atomFile) {
  return readFileSync(join(ATOMS_SOURCE_DIR, atomFile), "utf8")
}

function hasBannedImport(externals) {
  for (const pkg of externals) {
    if (BANNED_IMPORTS.some((b) => pkg === b || pkg.startsWith(`${b}/`))) return true
    if (HEAVY_OR_UNRESOLVABLE.includes(pkg)) return true
    if (pkg.startsWith("@radix-ui/") && !RADIX_ALLOWLIST.includes(pkg)) return true
  }
  return false
}

function hasUnsupportedRegistryRef(source) {
  REGISTRY_OTHER_RE.lastIndex = 0
  return REGISTRY_OTHER_RE.test(source)
}

// ─── Main ─────────────────────────────────────────────────────────────────

/**
 * Pure entry point used by `__tests__/copy-dash-ui-to-template.test.ts`.
 * Returns the `{ included, skipped, source }` triple without touching disk.
 */
export function planCopy({ atomsDir = ATOMS_SOURCE_DIR } = {}) {
  if (!existsSync(atomsDir)) {
    throw new Error(`Atom source dir not found: ${atomsDir}`)
  }
  const atomFiles = readdirSync(atomsDir)
    .filter((f) => f.endsWith(".tsx"))
    .sort()

  const skipped = []
  /** @type {Map<string, { source: string; siblingDeps: Set<string>; externals: Set<string> }>} */
  const candidates = new Map()

  // Pass 1 — direct ban-gate per atom.
  for (const file of atomFiles) {
    const slug = basename(file, ".tsx")
    const source = readFileSync(join(atomsDir, file), "utf8")
    const externals = collectExternalImports(source)

    if (hasBannedImport(externals)) {
      skipped.push({ slug, reason: "banned-or-heavy-external", details: [...externals] })
      continue
    }
    if (hasUnsupportedRegistryRef(source)) {
      skipped.push({ slug, reason: "unsupported-registry-ref", details: [] })
      continue
    }
    const siblings = collectSiblingDeps(source)
    candidates.set(slug, { source, siblingDeps: siblings, externals })
  }

  // Pass 2 — BFS prune: drop any atom whose sibling tree references a
  // previously-dropped atom. Repeat until stable.
  let changed = true
  while (changed) {
    changed = false
    for (const [slug, meta] of candidates) {
      for (const sibling of meta.siblingDeps) {
        if (!candidates.has(sibling)) {
          skipped.push({
            slug,
            reason: "transitive-skip",
            details: [sibling],
          })
          candidates.delete(slug)
          changed = true
          break
        }
      }
    }
  }

  const included = [...candidates.entries()]
    .map(([slug, meta]) => ({
      slug,
      source: meta.source,
      rewritten: rewriteSource(meta.source),
      externals: [...meta.externals],
      siblingDeps: [...meta.siblingDeps],
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug))

  return { included, skipped }
}

/** Render the barrel `index.tsx` re-exporting every included atom. */
export function renderBarrel(includedSlugs) {
  const header = [
    "/**",
    " * AUTO-GENERATED by scripts/copy-dash-ui-to-template.mjs — do NOT edit.",
    " *",
    ' * Barrel re-export so generated components can use `import { Badge } from "@dash/ui"`',
    " * inside the Sandpack iframe at runtime. The Sandpack files map maps the bare",
    ' * `@dash/ui` specifier to `/dash-ui/index.tsx`.',
    " */",
    "",
  ].join("\n")
  const lines = includedSlugs.map((slug) => `export * from "./${slug}"`)
  return header + lines.join("\n") + "\n"
}

/** Render the bundled `lib/utils.tsx` — copied verbatim from registry. */
function readLibUtils() {
  return readFileSync(LIB_SOURCE_PATH, "utf8")
}

/** Render the manifest JSON the runtime can read for diagnostics. */
function renderManifest(plan) {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      includedCount: plan.included.length,
      skippedCount: plan.skipped.length,
      included: plan.included.map((a) => ({
        slug: a.slug,
        externals: a.externals,
        siblingDeps: a.siblingDeps,
      })),
      skipped: plan.skipped,
    },
    null,
    2,
  )
}

/**
 * Apply the plan to disk. Idempotent — wipes `dash-ui/` before writing.
 */
export function applyPlan(plan, { outputDir = OUTPUT_DIR } = {}) {
  // Wipe and recreate so stale files never linger.
  if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(outputDir, { recursive: true })
  mkdirSync(join(outputDir, "lib"), { recursive: true })

  // lib/utils.tsx — depended on by every atom.
  writeFileSync(join(outputDir, "lib", "utils.tsx"), readLibUtils(), "utf8")

  for (const atom of plan.included) {
    writeFileSync(join(outputDir, `${atom.slug}.tsx`), atom.rewritten, "utf8")
  }

  writeFileSync(
    join(outputDir, "index.tsx"),
    renderBarrel(plan.included.map((a) => a.slug)),
    "utf8",
  )
  writeFileSync(MANIFEST_PATH.replace(OUTPUT_DIR, outputDir), renderManifest(plan), "utf8")
}

// ─── CLI entry ────────────────────────────────────────────────────────────
const isDirectInvoke =
  process.argv[1] && resolve(process.argv[1]) === resolve(__filename)
if (isDirectInvoke) {
  const plan = planCopy()
  applyPlan(plan)
  const sample = plan.included.slice(0, 6).map((a) => a.slug).join(", ")
  // eslint-disable-next-line no-console
  console.log(
    `[copy-dash-ui-to-template] wrote ${plan.included.length} atom(s) to preview-template/dash-ui/ ` +
      `(skipped ${plan.skipped.length}). Sample: ${sample}…`,
  )
}
