# MCP + npm-package boundary between dash-build and dash-ds

> Migration SPEC (design + plan). NOT code. Owner reviews before any code is written.
> Created 2026-05-29. Targets the pre-split state of the `dash-ds` monorepo.
> Every claim is grounded to a `file:line` in the current tree.

## TL;DR

`packages/dash-build/` reads five things out of the `dash-ds` monorepo by walking
the filesystem up to a `repoRoot` (`design-loader.ts:39`, `ds-catalog-loader.ts:226-237`).
That filesystem coupling blocks a clean repo split. This spec puts **two boundaries**
between the builder and the rest of the monorepo:

1. **An npm package — `@dash/kit`** — for the one thing that must be *vendored* into
   the consumer (the `@dash/ui` atom source bundle that Sandpack mounts at runtime).
2. **The existing MCP server (`packages/mcp-server`)** — for everything *dynamic*
   (catalog, rules, glossary, design contract). Three new tools + one extended tool
   cover the five reads.

Both boundaries are built **pre-split** with **dual-read + filesystem fallback**, so
monorepo dev and the 1143-test hermetic suite keep passing at every step. The loaders
are already `async` and already dependency-injected through `chain.ts:314-317`, so the
MCP branch lands in the *default* loader impl only — **zero call-site changes**.

---

## 1. Goal + split end-state

**Goal:** make `packages/dash-build` depend on `dash-ds` only through (a) a versioned
npm package and (b) network MCP calls — never a relative path into `apps/docs/...`.

Three repos after the split:

```
┌─────────────────────────── dash-doc (was monorepo root) ────────────────────────────┐
│  apps/docs/registry/dash/ui/*.tsx + lib/utils.ts   ── build ──▶  @dash/kit (npm pkg)  │
│  apps/docs/public/r/*.json  (227 items)            ─┐                                  │
│  registry/rules/dash-ai-rules.compressed.md         │                                 │
│  registry/rules/dash-domain-glossary.md             ├─ served by ─▶  mcp-server       │
│  design.md · LAYERED-ARCHITECTURE.md                │   (8 + 3 new tools, HTTP/stdio)  │
│  foundation/{rules,voice,manifest.json}            ─┘                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘
        │ npm install @dash/kit                    │ MCP over DASH_DS_MCP_URL
        ▼                                          ▼
┌──────────────── dash-build ────────────────┐   (also consumed by future repos)
│  builder: skills/chain.ts + loaders          │
│  vendored gstack skills (skills/, split-safe)│
│  preview-template/ ← @dash/kit from node_mod │
└──────────────────────────────────────────────┘

┌──────────── dash-dashboard ────────────┐
│  owner surface (@dash/dashboard)        │  ← out of scope here; consumes MCP same as build
└─────────────────────────────────────────┘
```

- **dash-doc** owns the registry, the `@dash/kit` *source*, the MCP server, and all
  rules/design markdown. It is the single producer.
- **dash-build** owns the builder + the vendored gstack skills (already copied into
  `packages/dash-build/skills/` and resolved there first — `skill-reader.ts:14-17`, so
  **split-safe, no work needed**) + the generated `preview-template/` output.
- **dash-dashboard** owns the owner surface; it consumes the same MCP boundary.

---

## 2. The `@dash/kit` package

### What it is

The curated, ban-gated `@dash/ui` atom source bundle that Sandpack mounts inside the
preview iframe. Today this bundle is produced at build time by
`scripts/copy-dash-ui-to-template.mjs` reading `apps/docs/registry/dash/ui/*.tsx`
(`ATOMS_SOURCE_DIR`, line 57) + `lib/utils.ts` (`LIB_SOURCE_PATH`, line 58), applying
the ban-gate (lines 145-157), the BFS transitive prune (lines 197-214), and the import
rewrite (lines 135-139), then writing `preview-template/dash-ui/` (line 59).

`@dash/kit` is **free** — the 8 existing `@dash/*` packages are `aop-schema`, `build`,
`dashboard`, `mcp-server`, `registry-schema`, `skill`, `worker`, `docs` (confirmed via
`packages/*/package.json` + `apps/*/package.json` names).

### Package shape

```jsonc
// @dash/kit package.json (published from dash-doc)
{
  "name": "@dash/kit",
  "version": "0.1.0",
  "description": "Dash UI kit — curated @dash/ui atom source bundle for AI generation + Sandpack preview.",
  "files": ["ui/", "lib/", "index.tsx", "manifest.json"],
  "exports": {
    ".": "./index.tsx",
    "./*": "./ui/*.tsx",
    "./lib/utils": "./lib/utils.tsx"
  },
  "peerDependencies": { "react": "^18.3.0", "@remixicon/react": "^4.9.0" }
}
```

**Contents = the current copy-script OUTPUT**, post-ban-gate: the included `.tsx` atoms
(import-rewritten), `lib/utils.tsx`, the barrel `index.tsx` (`renderBarrel`, line 230),
and `manifest.json` (`renderManifest`, line 251). The ban-gate logic (`BANNED_IMPORTS`,
`HEAVY_OR_UNRESOLVABLE`, `RADIX_ALLOWLIST`, lines 66-84) **moves into dash-doc's build of
`@dash/kit`** — it is the gate that decides what is safe to ship to a browser bundle, so
it belongs with the producer.

### How the copy script consumes it

`copy-dash-ui-to-template.mjs` flips from *reading the monorepo source dir* to *reading
the installed package*, with FS fallback for monorepo dev:

```js
// resolve order: installed @dash/kit → monorepo source dir (dev fallback)
function resolveAtomsDir() {
  try {
    // @dash/kit already IS the post-ban-gate bundle → straight copy, no re-gate
    return { mode: "package", dir: dirname(require.resolve("@dash/kit/package.json")) }
  } catch {
    return { mode: "source", dir: ATOMS_SOURCE_DIR } // ../../apps/docs/registry/dash/ui
  }
}
```

`planCopy({ atomsDir })` already takes the dir as a parameter (line 165) and is the pure,
tested entry point — so this is a thin resolver change, not a rewrite. In `package` mode
the bundle is already gated + rewritten, so the copy is a verbatim tree copy; in `source`
mode the existing ban-gate + rewrite runs (dev parity). Sandpack then reads the bundle
from `preview-template/dash-ui/` exactly as today (`component-preview.ts:245-325`,
`loadDashUiBundle`).

### The `@dash/ui` → `@dash/kit` rename surface

**DECIDED 2026-05-29 — FULL RENAME.** `@dash/ui` → `@dash/kit` everywhere: package
name, every import specifier, the model-facing directive text, the validator
banned-import allowlist, the synthetic Sandpack package.json, and newly generated
code. NO alias (industry norm = package name === import specifier; MUI/Chakra/Mantine
never alias, and install-X-import-Y confuses consumers). Rationale: the package carries
more than components (`lib/utils` + future hooks/tokens), so "kit" is more accurate than
"ui"; and a single consistent name is what the owner wants for callers. Risk (miss a
site → preview import fails) is mitigated by grep-sweep + the 1143-test suite + a
zero-remaining-`@dash/ui` assertion. The rename runs INSIDE the `@dash/kit`-carve phase
(Phase 2) — same files are already being touched. The table below is the full surface.

| # | file:line | current | becomes | load-bearing? |
|---|---|---|---|---|
| 1 | `services/component-preview.ts:266-274` | synthetic `package.json` `name:"@dash/ui"` + virtual path `/node_modules/@dash/ui/...` | `@dash/kit` | **YES** — Sandpack module resolution |
| 2 | `services/component-preview.ts:586` | `VERSION_MAP["@dash/ui"]` | `@dash/kit` | **YES** — dep version emit |
| 3 | `services/component-preview.ts:600` | `DASH_DS_UNRESOLVABLE` list | `@dash/kit` | **YES** — warning gate |
| 4 | `services/component-preview.ts:481,534,543` | `dashDsImports.includes("@dash/ui")` / `d === "@dash/ui"` / `declaredDeps.has("@dash/ui")` | accept BOTH `@dash/ui` + `@dash/kit` during migration, then `@dash/kit` | **YES** — bundle-available gate |
| 5 | `services/component-preview.ts:133,165-173,229` | aliasing + bundle-dir comments | `@dash/kit` | doc/comment |
| 6 | `scripts/copy-dash-ui-to-template.mjs:235-237` | barrel header text + Sandpack-map note | `@dash/kit` | doc/comment |
| 7 | `preview-template/dash-ui/index.tsx:4-6` | barrel header (regenerated) | `@dash/kit` | regenerated artifact |
| 8 | `skills/prompt-composer.ts:733` | `DS_FIRST_DIRECTIVE_BLOCK`: `import { X } from "@dash/ui"` | `@dash/kit` | **YES** — drives generated import |
| 9 | `skills/prompt-composer.ts:57,763` | composer comment + portal-v2 stack mandate text | `@dash/kit` | prompt text |
| 10 | `skills/ds-catalog-loader.ts:4,189` | catalog block header `import { X } from "@dash/ui"` | `@dash/kit` | **YES** — drives generated import |
| 11 | `skills/validator.ts:312,419,700,724` | banned-import retry hint + "must prefer @dash/ui" + raw-HTML hint | `@dash/kit` | prompt text |
| 12 | `skills/design-review.ts:88,95` | review heuristic text | `@dash/kit` | prompt text |
| 13 | `skills/ds-candidate-ranker.ts:8,451` | "promote into @dash/ui" prose | `@dash/kit` | doc/comment |

Tests that assert the old specifier and must be updated alongside the rename:
`__tests__/ds-catalog-loader.test.ts:75`, `__tests__/chain.test.ts:306`,
`services/__tests__/component-preview.test.ts:162,174,219,362,430` (and the
`@dash/ui`-string fixtures at `:52,156,168,179,206,226,252,259,275,283,289,353,426`),
`__tests__/validator.test.ts:600,672,693,732,751,770`,
`__tests__/design-review.test.ts:29-35,75`, `__tests__/chain.intake.test.ts:42`,
`daemon/__tests__/preview-initial.test.ts:496`.

**Critical scope note:** `@dash/kit` governs **NEW generation + the preview only**.
Existing Dash production repos (portal-v2, backoffice, …) keep whatever specifier they
already import — CR-1 (additive-only, `CLAUDE.md`) means we never rewrite their imports.
The denylist `BANNED_IMPORTS` (`prompt-composer.ts:79-85`: `react-hook-form`, `zod`,
`@hookform/resolvers`, `@tanstack/react-query`, `swr`) does **not** contain any `@dash/*`
specifier, so neither `@dash/ui` nor `@dash/kit` is at risk of being flagged by
`validator.ts:240` or the copy-script gate (`copy-dash-ui-to-template.mjs:66`) — no
allowlist edit needed, only the directive *text* changes.

---

## 3. MCP tools to ADD

The MCP server today exposes 8 tools (`index.ts:74-84`, `dispatch` `:137-181`):
`search_components`, `get_component` (`includeFiles` returns `files[].content`,
`get-component.ts:50`), `list_categories`, `list_templates`, `search_tokens`,
`get_rules`, `get_ai_rules` (deprecated alias), `get_audit_checklist`. It reads the
registry over HTTP via `RegistryClient` against `DASH_REGISTRY_URL` (default
`localhost:3000`, `index.ts:9-10`) with a 5-min LRU cache (`registry-client.ts:11-12`),
exposing `getRawFile()` (`:99-112`) and `getItem()` (`:88-97`).

**Confirmed gaps** (none currently served): `dash-ai-rules.compressed.md` (FS-only — no
`r/` json; `ls public/r/` shows only `dash-ai-rules.json`), the glossary (has
`r/dash-domain-glossary.json` with inline `files[0].content`, but **no tool** exposes it),
and `design.md` / `cardinal-rules.md` / `voice-rules.md` / `foundation/manifest.json` /
`LAYERED-ARCHITECTURE.md` (none in `r/`, no tools).

### `get_design_context`

Covers all five reads of `design-loader.ts:115-121` in **one** round-trip.

```jsonc
// input
{ "type": "object", "properties": {}, "additionalProperties": false }
// output (TextContent JSON; mirrors DesignContext minus loaded/missing arrays)
{
  "designContract": "string",       // design.md
  "layeredArchitecture": "string",  // LAYERED-ARCHITECTURE.md (server applies FALLBACK_LAYERED, design-loader.ts:85-97, on miss)
  "cardinalRules": "string",        // foundation/rules/cardinal-rules.md
  "voiceRules": "string",           // foundation/voice/voice-rules.md
  "manifest": { } | null            // foundation/manifest.json (parsed)
}
```

Serves: `design.md`, `LAYERED-ARCHITECTURE.md`, `foundation/rules/cardinal-rules.md`,
`foundation/voice/voice-rules.md`, `foundation/manifest.json` in dash-doc. **Prerequisite
dash-doc task:** publish these 5 to `r/` (e.g. `r/design-context.json` bundling all 5, or
five raw files reachable via `getRawFile`). This same tool also feeds the M3 intake brain:
`prd-synthesizer.ts:54-55` consumes `designContract`, threaded from `chain.ts:400`
(`designContract: design.designContract`) — so the design-loader MCP branch must populate
`designContract` for that path too (it does, since it returns the same field).

### `get_rules` extended with `variant`

```jsonc
{ "type": "object",
  "properties": { "variant": { "enum": ["full", "compressed"], "default": "full" } },
  "additionalProperties": false }
```

`full` = today's behaviour (`runGetAiRules`, `get-ai-rules.ts:46`, reads
`dash-ai-rules.md`). `compressed` = reads `dash-ai-rules.compressed.md`, which is what
`ds-catalog-loader.ts:231-232` loads today. **Prerequisite dash-doc task:** publish
`dash-ai-rules.compressed.md` to `r/` (currently FS-only). `get_ai_rules` stays the
deprecated alias (`index.ts:162-170`).

### `get_glossary`

Moves the truncation that currently lives client-side (`truncateGlossary`,
`ds-catalog-loader.ts:156-166`) to the server.

```jsonc
// input
{ "type": "object",
  "properties": { "charBudget": { "type": "number", "description": "Server-side truncation budget; default ~12000 (matches ds-catalog-loader.ts:273)." } },
  "additionalProperties": false }
// output
{ "glossary": "string" }   // post-truncation
```

Serves `registry/rules/dash-domain-glossary.md` — already in `r/` as
`dash-domain-glossary.json` with inline `files[0].content`, so the server reads it via
`getItem("dash-domain-glossary")` and applies `truncateGlossary` before returning.

### `get_catalog` (optional)

The catalog (`parseRegistry`, `ds-catalog-loader.ts:130-153` splitting atoms/blocks/
templates by `registry:ui|block|page`) can be served either by a new `get_catalog`
returning `{ atoms[], blocks[], templates[], total }`, **or** by reusing the existing
`list_categories` + `search_components`. **Recommendation:** reuse the existing two — the
catalog split is pure derivation over the index the registry already serves, so a new tool
adds surface for no new data. The loader can call `search_components` (or read
`r/index.json` directly through a thin client) and run the existing `parseRegistry` on the
result.

| new/changed tool | dash-doc source it serves | reads via |
|---|---|---|
| `get_design_context` | design.md, LAYERED-ARCHITECTURE.md, cardinal-rules.md, voice-rules.md, manifest.json | `r/design-context.json` (new) or 5× `getRawFile` |
| `get_rules{variant:compressed}` | dash-ai-rules.compressed.md (publish to `r/`) | `getRawFile` |
| `get_glossary{charBudget}` | dash-domain-glossary.md | `getItem("dash-domain-glossary")` |
| `get_catalog` (skip — reuse) | registry.json / `r/index.json` | `getIndex` + `parseRegistry` |

---

## 4. Loader migration — dual-read

Both `loadDSContext` (`ds-catalog-loader.ts:243`) and `loadDesignContext`
(`design-loader.ts:99`) are already `async` and already best-effort (every read is
optional, never throws). The change: add an **MCP-first branch** gated on an env var,
falling back to the existing FS path on any error.

```ts
// ds-catalog-loader.ts — loadDSContext, default impl only
export async function loadDSContext(opts: LoadDSContextOpts = {}): Promise<DSContext> {
  const mcpUrl = process.env.DASH_DS_MCP_URL   // e.g. http://localhost:3000 (registry) or stdio descriptor
  if (mcpUrl) {
    try {
      const [catalog, rules, glossary] = await Promise.all([
        mcp.callCatalog(),                                  // get_catalog / list_categories
        mcp.callRules({ variant: "compressed" }),           // get_rules
        mcp.callGlossary({ charBudget: opts.glossaryCharBudget ?? 12_000 }), // get_glossary
      ])
      return { catalog, compressedRules: rules, domainGlossary: glossary,
               loadedSources: ["mcp:" + mcpUrl], missingSources: [] }
    } catch {
      /* fall through to FS — keeps monorepo dev + hermetic tests working */
    }
  }
  // …existing FS path verbatim (lines 244-280)…
}
```

`loadDesignContext` gets the symmetric branch calling `get_design_context`, falling back
to the FS reads at `design-loader.ts:115-121` (and still applying `FALLBACK_LAYERED` on a
miss). **Key property:** these are the *default* impls. `chain.ts:314-317` injects
`deps.loadDesign` / `deps.loadDSContext`, so hermetic tests pass stubs and never hit the
MCP branch — **zero call-site changes, zero test-wiring changes**. The `.catch(() => …)`
guards at `chain.ts:320` and `:344` already degrade a total loader failure to empty
context, so even a misconfigured MCP URL cannot break a run.

A new shared `mcp` client lives in `packages/dash-build/src/skills/` (small wrapper over
the same `@modelcontextprotocol/sdk` client transport the dashboard already uses, or a
plain `fetch` to the registry where the data is just `r/` json). It is the only new
runtime dependency the loaders gain.

---

## 5. Migration order (nothing breaks mid-flight)

Each step is independently shippable + testable. FS fallback is retained until step 6.

1. **dash-doc producer prep** — publish `dash-ai-rules.compressed.md` + the 5
   design-context files to `r/`; add `get_design_context`, `get_glossary`, and the
   `variant` arg to `get_rules` in `mcp-server`. No consumer change yet; existing 8 tools
   untouched.
2. **Carve `@dash/kit`** — build the package from dash-doc's `registry/dash/ui` +
   `lib/utils.ts` applying the existing ban-gate; rewire `copy-dash-ui-to-template.mjs`
   with `require.resolve("@dash/kit")` + FS fallback (`ATOMS_SOURCE_DIR`). Preview still
   works either way. Do the `@dash/ui → @dash/kit` rename (§2 table) behind the
   accept-both compatibility window (table row 4).
3. **Loaders dual-read** — add the MCP-first branch to both default loaders; FS fallback
   retained. Gate on `DASH_DS_MCP_URL` being set.
4. **Flip default to MCP/package primary** — set `DASH_DS_MCP_URL` in the dash-build dev
   + CI env so MCP is the live path; `@dash/kit` resolves from `node_modules`. FS fallback
   still present as safety net.
5. **Split repos** — move `apps/docs` + `mcp-server` to dash-doc; `packages/dash-build`
   (+ vendored `skills/`) to dash-build; `@dash/dashboard` to dash-dashboard.
   dash-build now depends on `@dash/kit` (npm) + MCP (network) only.
6. **Post-split cleanup** — remove the now-dead FS fallback branches in both loaders +
   the `source` mode in the copy script + the accept-both `@dash/ui` compatibility (row 4).

---

## 6. Test strategy (keep 1143 green)

- **Loaders are DI'd** — `chain.test.ts` / `chain.intake.test.ts` inject
  `deps.loadDesign` / `deps.loadDSContext` stubs (`chain.ts:314-317`), so they are
  unaffected by the MCP branch. No change.
- **New MCP-client tests** — add unit tests for the MCP-first branch in both loaders with
  a **mocked transport**: assert (a) MCP success returns the mapped `DSContext` /
  `DesignContext`, (b) transport throw falls back to FS, (c) unset `DASH_DS_MCP_URL` skips
  MCP entirely. Mirror the existing best-effort test style in
  `__tests__/ds-catalog-loader.test.ts`.
- **`@dash/kit` copy-script test parameterized** — `planCopy({ atomsDir })` is already
  pure + parameterized (`copy-dash-ui-to-template.mjs:165`); add a case pointing
  `atomsDir` at a fixture `@dash/kit`-shaped dir and assert verbatim copy (package mode)
  vs ban-gate run (source mode).
- **Rename test updates** — update the `@dash/ui` assertions enumerated in §2 to
  `@dash/kit`, keeping at least one accept-both test until step 6. Specifically the
  synthetic-package-json test (`component-preview.test.ts:162-179`) and the banned/warn
  tests (`:206-289`).
- **New MCP tool tests in dash-doc** — `get_design_context`, `get_glossary`,
  `get_rules{variant}` get tool tests alongside the existing
  `tools/get-ai-rules.test.ts` / `tools/get-audit-checklist.test.ts` pattern.

---

## 7. Risk register

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | **`@dash/kit` carve** — the Sandpack file-tree shape (`/node_modules/@dash/kit/<atom>.tsx` + synthetic package.json, `component-preview.ts:266-317`) and the ban-gate (`copy-dash-ui-to-template.mjs:145-214`) must move cleanly to the package build, or the preview silently renders raw-HTML fallback. | **High** | Keep `planCopy`/`applyPlan` as the package build's internal step (reuse, don't reimplement). Snapshot-test the emitted bundle file-tree before vs after the carve. Retain `source` mode through step 6. |
| R2 | **Rename completeness** — miss one load-bearing site (table rows 1-4, 8, 10) and preview imports 404 or the model emits the wrong specifier. | **High** | The §2 table is the exhaustive grep result (`grep -rn '@dash/ui'`). Land the rename behind accept-both (row 4) so a missed read still resolves during migration; remove only at step 6. |
| R3 | **Test hermeticity** — an MCP branch that fires during tests would make the suite network-dependent. | Medium | MCP branch gated on `DASH_DS_MCP_URL`; tests never set it and inject stubs. The `.catch` guards (`chain.ts:320,344`) are a second safety net. |
| R4 | **Compressed-rules publish prerequisite** — `get_rules{variant:compressed}` is useless until dash-doc publishes `dash-ai-rules.compressed.md` to `r/`. | Medium | Step 1 ordering makes this a producer-side gate before any consumer flips. Loader FS fallback covers the window. |
| R5 | **MCP latency vs FS** — per-run network round-trips replace local reads. | Low | `RegistryClient` 5-min LRU (`registry-client.ts:11`) absorbs repeat reads; loaders run their MCP calls in one `Promise.all`. |

---

## 8. Effort estimate

| Phase | Scope | Est. | Pre-split mandatory? |
|---|---|---|---|
| 1 | dash-doc: publish 6 files to `r/` + 3 MCP tools (+tests) | 1.5 d | **Mandatory** (producer must serve before consumer reads) |
| 2 | `@dash/kit` carve + copy-script rewire + rename surface (§2) + test updates | 2 d | **Mandatory** (preview must resolve from package) |
| 3 | Loader dual-read branch + MCP client wrapper + branch tests | 1 d | **Mandatory** |
| 4 | Env flip to MCP/package primary | 0.25 d | **Mandatory** (proves boundary end-to-end pre-split) |
| 5 | Physical repo split + dependency rewiring | 1 d | The split itself |
| 6 | Remove FS fallback + `source` mode + accept-both compat | 0.5 d | **Deferrable** (post-split cleanup; harmless to keep) |

Phases 1-4 are the boundary and are pre-split-mandatory. Phase 6 is the only
post-split-deferrable work — dead fallback paths are harmless to carry.

---

## 9. Open decisions for the owner

1. **Rename vs alias — RESOLVED 2026-05-29: FULL RENAME.** `@dash/ui` → `@dash/kit`
   everywhere (package name === import specifier; no alias, matching MUI/Chakra/Mantine
   norm). All rows in §2 move, including the model-facing directive text
   (`prompt-composer.ts:733`, `ds-catalog-loader.ts:189`). Mitigated by grep-sweep +
   1143-test suite + zero-remaining-`@dash/ui` assertion. No longer a blocker.
2. **Publish target for `@dash/kit`** — npm public, a private registry (e.g. GitHub
   Packages / Verdaccio), or a tarball/`file:` dep during the pilot? The registry is
   sovereign today (`component-preview.ts:573`: "`@dash/ui` is NOT published"), so this is
   the first published Dash package — the target dictates auth + CI publish wiring.
3. **MCP transport for the loaders** — the server is stdio today
   (`StdioServerTransport`, `index.ts:118`). For an in-process builder, do we (a) spawn the
   stdio server, (b) call the registry `r/` json directly over HTTP (`DASH_REGISTRY_URL`),
   or (c) stand up an HTTP MCP transport? Option (b) is the lightest for the data that is
   already in `r/`; (a)/(c) matter more for the design-context bundle if it is not put in
   `r/`.
4. **`get_catalog` — add or reuse?** §3 recommends reusing `list_categories` +
   `search_components`. Confirm, or add the dedicated tool if the owner prefers a single
   catalog call.
