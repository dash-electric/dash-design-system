# Shadcn vs Dash DS — Code-Level Comparison

**Retrieval date:** 2026-05-20
**Shadcn ref:** `/tmp/shadcn-ui/` (commit at clone time, `shadcn@4.7.0`)
**Dash ref:** `/Users/irfanprimaputra.b/dash-ds/` (CLI `dash@0.4.0`, MCP @dash/mcp-server)

> This is a code-level diff. Every claim is sourced from `file:line`. Where I read the surrounding 50–100 lines but cite a single anchor, that's intentional — the goal is to make every recommendation auditable, not exhaustive.

---

## Executive Summary

Shadcn's CLI is roughly **4× the surface area** of Dash's (≈18.5K LOC under `packages/shadcn/src/`, vs ≈7.3K LOC under `packages/cli/src/` + `mcp-server/`) and has clearly outgrown what Dash needs today. But it also encodes **eight years of edge-case learnings** — namespace dispatch, transformer pipeline, preset bit-packing, RegistryError taxonomy with suggestions, project-info detection — that Dash will hit one by one as adoption widens beyond Wave 5 pilots.

**Top five findings:**

1. **Schema rigor gap is structural.** Shadcn uses zod `discriminatedUnion` with 13 item types and runtime parsing at every fetch boundary (`packages/shadcn/src/registry/schema.ts:179`). Dash uses hand-written TypeScript types + one ~10-line `validateRegistryItem` guard (`packages/cli/src/lib/schema.ts:79`). When Dash gets a malformed registry item, the failure mode is a deep `TypeError` in a writer — shadcn surfaces it at fetch boundary with field paths.
2. **Dash MCP returns JSON, shadcn MCP returns formatted markdown.** Shadcn's MCP shapes its responses for AI consumption (pagination summaries, `add` command suggestions, audit checklists) — Dash returns raw structured JSON the model must re-format. Shadcn-style framing improves agent compliance; Dash's approach is more flexible but burns tokens.
3. **Transformer pipeline is shadcn's secret weapon.** 14 named transformers under `packages/shadcn/src/utils/transformers/` (RSC, JSX, font, icon, RTL, tw-prefix, etc.) re-shape registry source at write time. Dash currently writes files verbatim. The moment Dash needs to support Next.js Pages Router + App Router from one source, this gap will hurt.
4. **Dash has things shadcn doesn't and should keep them.** Bearer-auth registry endpoint (`apps/docs/app/api/registry/[name]/route.ts:42`), `dash audit` consumer-side drift gate (`packages/cli/src/commands/audit.ts`), `dash gap` queue + Hermes worker for AI-generated missing components (`packages/worker/src/pipeline.ts`), Layer-2 theme system, `dash feedback`, `dash sync` for installed-item drift detection, `dash doctor`. These are real Dash-grade primitives that don't exist in shadcn.
5. **Docs site is the biggest divergence — and where shadcn wins clearly.** Shadcn has 215 `.mdx` files under `apps/v4/content/` rendered via Fumadocs with built-in search (`apps/v4/app/api/search/route.ts`), `ComponentPreview`, MDX components for code/preview tabs, etc. Dash has zero MDX — every docs page is a hand-written Next.js `page.tsx`. Adding a component to Dash currently requires a TSX docs page. Shadcn requires an `.mdx` file. Dash will not scale past ~100 documented components on the current approach.

---

## A. CLI architecture

### Shadcn approach

Commander 14 with 13 top-level commands wired via `addCommand` and one nested `mcp.command("init")` (`/tmp/shadcn-ui/packages/shadcn/src/index.ts:32-46`):

```ts
program
  .addCommand(init).addCommand(apply).addCommand(add).addCommand(diff)
  .addCommand(docs).addCommand(view).addCommand(search).addCommand(migrate)
  .addCommand(info).addCommand(build).addCommand(mcp).addCommand(preset)
  .addCommand(registry)
```

Each command is a `new Command()` exported from its own file (`add.ts`, `init.ts`, etc.). Options validated through a per-command zod schema, e.g. `addOptionsSchema` (`packages/shadcn/src/commands/add.ts:33-44`). Centralized error handling lives in `utils/handle-error.ts` and includes a fallback that suggests running the *previous* minor version on the same args (`packages/shadcn/src/utils/handle-error.ts:92-101`) — graceful escape hatch when an upgrade breaks something.

Output: `kleur`-equivalent via `highlighter` (`utils/highlighter.ts`), spinners via `ora` wrapped in `utils/spinner.ts` (silent-aware), structured `logger.ts`. SIGINT/SIGTERM trapped at module top (`src/index.ts:19-20`). No telemetry/analytics integration in the OSS code — likely tracked via the `track=1` URL query param mentioned at `commands/init.ts:407`.

### Dash approach

Commander 12 with 14 top-level commands + nested `mcp init`, `gap report/sync`, `feedback log/list/sync`, `skill status/refresh/clear` (`packages/cli/src/index.ts:32-401`). Each command is a `runX` async function in `commands/`, dispatched from a thin `.action(...)` wrapper. Options are inferred from commander not validated through zod.

Centralized error handling lives in two lines at the bottom (`packages/cli/src/index.ts:402-406`):

```ts
program.parseAsync(process.argv).catch((err: Error) => {
  console.error(kleur.red(`✗ ${err.message}`))
  if (process.env.DEBUG) console.error(err.stack)
  process.exit(1)
})
```

No "try previous version" suggestion. No structured error suggestion field. Output: `kleur` + `ora` (same primitives, no abstraction). No telemetry.

### Diff analysis

- Shadcn validates command input via zod *inside* the action, before any work. Dash relies on TypeScript types compiled away. **For a tool installed via `npx`/`pnpm dlx`, the zod approach catches bad flags before file I/O — a real win.** [High confidence]
- Shadcn's per-command file pattern is more verbose but each command is independently buildable/testable. Dash's `runX` pattern is leaner but tightly coupled to the `Command` object.
- Shadcn's "try previous minor version" UX is a small touch with outsized value during a breaking-change incident.

### Recommendation

- **ADOPT:** zod per-command option schemas (one schema per `runX`, parse at entry). [4h work]
- **ADOPT:** "try previous version" handler in `dash`'s top-level catch. [1h]
- **ADAPT:** Keep Dash's `runX` + thin commander wrapper — it's more testable than shadcn's Commander-as-API style.
- **AVOID:** Shadcn's 13-command top-level surface. Dash already has 14 — going further without reorganization will bloat `--help`.

---

## B. Registry resolver

### Shadcn approach

Three-layer pipeline:

1. **Parse**: `parseRegistryAndItemFromString("@shadcn/button")` → `{registry: "@shadcn", item: "button"}` (`packages/shadcn/src/registry/parser.ts`).
2. **Build URL + headers**: `buildUrlAndHeadersForRegistryItem(name, config)` substitutes `{name}` and `{style}` placeholders, expands `${ENV_VAR}` references in headers, drops headers whose env vars didn't expand (`registry/builder.ts:21-50`, `:120-140`). Returns `null` if input is already a URL/local path.
3. **Fetch + dependency walk**: `resolveRegistryTree(names, config)` (`registry/resolver.ts:124`) recursively resolves `registryDependencies`. Handles namespace dispatch (`@v0/foo` → different registry), built-in registries fallback (`@shadcn`), cycle protection via visited set, and **source tracking** (`_source` field on each resolved item, useful for downstream error messages).

Critical detail: registries are not just URLs — they can be objects with `params`, `headers`, env-var expansion (`registry/builder.ts:78`). Auth flows for v0/Acme/private registries all converge here.

### Dash approach

Linear pipeline (`packages/cli/src/lib/registry-fetch.ts:126-154`):

```ts
async function visit(name: string): Promise<void> {
  if (visited.has(name)) return
  if (visiting.has(name)) return   // cycle — skip silently
  visiting.add(name)
  const item = await fetchRegistryItem(name, opts)
  if (item.registryDependencies?.length) {
    for (const dep of item.registryDependencies) {
      await visit(dep)
    }
  }
  visiting.delete(name); visited.add(name); ordered.push(item)
}
```

URL building is one-line concat: `${registryUrl}/r/${name}.json` (`registry-fetch.ts:83`). No `{name}` placeholder, no env-var expansion in headers. Namespacing handled via single-registry-per-config (`config.registries["@dash"].url`) — no support for multiple registries on one consumer (`components-json.ts:32-62`).

Token resolution is well-thought-out (4-layer: CLI flag > env > `.env.local` > `~/.dash/credentials.json` — `registry-fetch.ts:46-53`).

### Diff analysis

- Shadcn supports **multiple registries per project** + dynamic `@ns/foo` dispatch. Dash hardcodes `@dash` as the only registry. For a sovereign DS this is fine *today*; the moment a Trellis tenant wants its own private items registry, Dash needs shadcn-style dispatch.
- Shadcn's `_source` tracking on resolved items powers better error messages when a resolved dep fails.
- Both handle dep cycles correctly. Dash's cycle handling is "silent skip" — shadcn's is the same via `visitedItems` set in `registry/namespaces.ts:19-22`.

### Recommendation

- **ADOPT (next 8 weeks):** Multi-registry namespace dispatch (`@dash/foo`, `@trellis-acme/foo`). Even just teaching `components.json.registries` to be a map keyed by `@ns` (already typed as such in `components-json.ts` but only `@dash` resolved). [1 day]
- **ADAPT:** Borrow shadcn's `{name}`/`{style}` placeholder URL format. Dash hardcodes `/r/${name}.json`. Flexible template makes it easy to point at a v0-style endpoint without code changes. [2h]
- **ADAPT:** `_source` tracking when resolving — surface in `dash add` error messages. [2h]

---

## C. MCP server implementation

### Shadcn approach

7 tools (`packages/shadcn/src/mcp/index.ts:35-144`): `get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, `get_audit_checklist`. Tool schemas built with `zodToJsonSchema(z.object({...}))` so they're typed at runtime.

Critical pattern: every response is a **`{ content: [{ type: "text", text: ... }] }`** structure where `text` is dedented natural-language markdown shaped for an LLM (`mcp/index.ts:163-191`). Includes follow-up suggestions inline ("You can view items by running `npx shadcn@latest view @name`").

Error handling at `mcp/index.ts:413-462` distinguishes ZodError (returns field paths) from `RegistryError` (returns `code`, `suggestion`, `context` — the `RegistryError` taxonomy at `registry/errors.ts:3-32`) from generic Error. All errors come back as `isError: true` content blocks, MCP-standard.

Auth: stdio transport only (`mcp/index.ts:101-102`), no bearer — relies on the parent process being trusted (Claude Code launching the CLI).

### Dash approach

6 tools (`packages/mcp-server/src/index.ts:53-60`): `search_components`, `get_component`, `list_categories`, `list_templates`, `search_tokens`, `get_ai_rules`. Tool schemas are hand-written JSON Schema objects (`tools/search-components.ts:14-32`).

Critical pattern: every response is **`{ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }`** (`mcp-server/src/index.ts:78`) — raw JSON, the model decides how to render it.

Error handling at `mcp-server/src/index.ts:80-86`:

```ts
return {
  isError: true,
  content: [{ type: "text", text: `Error in ${name}: ${message}` }],
}
```

One generic catch — no typed error taxonomy.

Auth: stdio + Bearer token at the *registry* layer. The MCP server has access to `DASH_REGISTRY_TOKEN` env and forwards it to the registry endpoint, where `apps/docs/app/api/registry/[name]/route.ts:42` does the actual auth check + rate limiting + audit log. **This is a stronger model than shadcn** — shadcn's registry is fully open at `ui.shadcn.com/r/*`.

### Diff analysis

- Shadcn formats tool responses for LLM consumption (markdown with embedded shell commands and follow-up hints). Dash returns JSON. **Shadcn's approach gets better tool-use compliance** — the model sees a complete sentence with a CTA, not a JSON blob it has to interpret. [High confidence]
- Shadcn's RegistryError taxonomy with `suggestion` field bubbles all the way up to the MCP response and renders nicely ("Error (NOT_FOUND): foo. 💡 Run `npx shadcn add foo`").
- Dash's bearer-gated registry is a **clear win for an internal DS** — and is the right call given Dash's tenant model. Shadcn can't do this and never will.
- Shadcn ships a `get_audit_checklist` tool that returns a hardcoded markdown checklist (`mcp/index.ts:393-405`). Cheap, useful pattern — Dash should add one with Dash-specific items (banned imports, Layer-2 violation, etc.).

### Recommendation

- **ADOPT:** Markdown-formatted tool responses with embedded `dash add` CTA. Don't return raw JSON. [4h per tool, ~1 day total]
- **ADOPT:** `RegistryError` class with `code`/`suggestion`/`context` fields, surfaced in MCP responses. [4h]
- **ADOPT:** `get_audit_checklist` Dash variant — banned imports, Layer-2 theme drift, audit-trail-required fields. [2h]
- **AVOID:** Shadcn's `get_project_registries` — Dash already does this via `dash info --json` and the skill, no need to duplicate.

---

## D. Schema (registry-item.json + registry.json)

### Shadcn approach

Zod everywhere. `registryItemSchema` is a `discriminatedUnion("type", [...])` with three variants — `registry:base` (has a `config` field), `registry:font` (has a `font` field), and everything else (`packages/shadcn/src/registry/schema.ts:179-191`). 13 distinct types in `registryItemTypeSchema` (`:81-98`).

The schema is **the source of truth that's published twice** — once in TypeScript at `registry/schema.ts`, once as JSON Schema at `apps/v4/public/schema/registry-item.json` (comment at `schema.ts:3-4` flags the manual sync requirement, which is a known weakness).

Extension points: `meta: z.record(z.string(), z.any()).optional()` (`:173`) is the catch-all bucket.

Versioning: backward-compat handled by `extends: z.string().optional()` (`:160`), `passthrough()` on the deferred lookup schema (`registry/resolver.ts:120`).

### Dash approach

Hand-written TypeScript types at `packages/cli/src/lib/schema.ts:5-44`. No zod. Validation is `validateRegistryItem(item: unknown): asserts item is RegistryItem` — checks `name`/`type`/`title`/`description` are strings, nothing else (`schema.ts:79-89`).

`packages/registry-schema/` exists but is a Phase-0 stub (`src/index.ts:2-3`): "Phase 0 stub. Real schemas land when extracted from apps/docs/registry.json + scripts/build-registry.ts."

Dash schema has only 5 item types (`registry:ui`, `registry:component`, `registry:block`, `registry:hook`, `registry:lib`) per `packages/registry-schema/src/index.ts:4-9`. The CLI's local `RegistryItem.type: string` (no enum) is wider but undocumented.

### Diff analysis

- Shadcn's schema is **runtime-validated at every fetch boundary**. Dash's schema is compile-time only. A malformed registry item slips through Dash's fetch and crashes deeper in the writer.
- Shadcn maintains 13 types because each type has different handling (registry:font needs font import code, registry:base writes config, registry:page needs explicit target, etc.). Dash has 5 because the use cases haven't surfaced yet — but blocks/templates/scaffolds already exist in `apps/docs/registry/dash/` and aren't typed.
- Dash's `packages/registry-schema/` is structurally the right design (shared package) but unimplemented. Shadcn keeps the source-of-truth in the CLI package and re-exports — that's also fine for a smaller team.

### Recommendation

- **ADOPT:** Migrate `packages/cli/src/lib/schema.ts` to zod. Make it the implementation of `@dash/registry-schema`. Validate at fetch boundary in `registry-fetch.ts:90`. [1 day]
- **ADOPT:** Discriminated union with `registry:theme`, `registry:scaffold`, `registry:pattern`, `registry:template` — Dash already has all these in `apps/docs/registry/dash/` but treats them all as `string`. [4h]
- **AVOID:** Shadcn's two-source-of-truth situation (TS + JSON Schema). Use `zod-to-json-schema` (already a shadcn dep) to generate the JSON Schema from the TS source at build time. [2h]

---

## E. Init command

### Shadcn approach

Complex but coherent (`packages/shadcn/src/commands/init.ts:118-584`). Key behaviors:

- Framework detection delegated to `getProjectInfo` which interrogates `package.json` deps + presence of `next.config.*` / `vite.config.*` etc. (`utils/get-project-info.ts`).
- Monorepo detection at `:218-234` — if running at a monorepo root, lists workspace targets and exits with instructions.
- **Atomic restore**: `init` backs up an existing `components.json` to `.bak` via `createFileBackup`, registers a `process.on("exit", restoreBackupOnExit)` listener (`init.ts:154-165`), so an unexpected exit during preflight rolls back. Removes listener only on success.
- Preset system: `--preset` accepts a name (`nova`, `vega`), a URL, or a base62-encoded code that bit-packs (style, theme, base-color, icon-lib, font, radius) into a single integer (`preset/preset.ts:1-13`). Codes share design decisions in 6-8 chars.
- Template scaffolding: 6 framework templates (next, vite, react-router, astro, laravel, start) + each can be monorepo (`packages/shadcn/src/templates/`). Each template ships `init` and optional `postInit` functions.
- RTL flag flows from CLI → preset URL → init URL → registry response.
- Multi-base support: `radix` vs `base` (Base UI vs Radix). User can switch and gets a confirm prompt (`init.ts:990-1017`).

### Dash approach

Linear path (`packages/cli/src/commands/init.ts:154-348`):

1. Check existing `components.json`, prompt to overwrite if found.
2. `normalizeFramework(opts.framework, cwd)` → detect via `framework-detector.ts`.
3. Prompt for framework + tsx + token if `!opts.yes`.
4. Write `components.json` from per-framework template at `packages/cli/src/templates/<framework>/components.json`.
5. Write token to `.env.local`.
6. Write `globals.css` from inline `DASH_BASE_CSS` constant (`init.ts:103-152`).
7. Best-effort install `@dash/base-theme` + `@dash/ai-rules` (catches errors, warns).

Theme: `--theme` flag accepts internal tenants (`ride`, `logistic`, `travel`, `marketplace`) or dynamic `trellis-<id>` matching a regex (`init.ts:55-66`). Normalized and written to `components.json.dashTheme`. No bit-packed preset codes.

No backup/rollback — if init crashes mid-way, the user is left with a partial `components.json`.

### Diff analysis

- Shadcn's backup-on-exit pattern is **a real production-grade nicety** Dash should adopt. Cheap to add. [High confidence]
- Shadcn's preset codes (base62-encoded bit-pack) are over-engineered for Dash's use case — Dash only has 5 themes (ride/logistic/travel/marketplace/trellis-*) and doesn't need cross-decision sharing. Skip.
- Shadcn's template subsystem (each template ships its own `init` function) is more flexible than Dash's flat `templates/<framework>/components.json`. Dash currently can't customize per-framework beyond the `components.json` shape. For example, scaffolding a layout.tsx for next-app would require a code change in `dash init`.
- Both write a hardcoded `globals.css` for the base case. Shadcn's resolves from a registry `registry:base` item (the `registryBaseConfig` flow); Dash's is a string literal in `init.ts:103-152`. **Shadcn's approach lets you update the base theme without releasing a new CLI**.

### Recommendation

- **ADOPT:** Backup-and-restore on unexpected exit. [2h]
- **ADOPT:** Move `DASH_BASE_CSS` constant into a `registry:base` item so updates ship via registry, not CLI release. [4h]
- **ADAPT:** Per-framework `init` hooks in templates (currently Dash only customizes `components.json` shape). Need not be as elaborate as shadcn's, but parameterizable. [1 day]
- **AVOID:** Bit-packed preset codes. Dash's Layer-2 theme is a single string — no compression needed.

---

## F. Migrate command

### Shadcn approach

Three migrations (`packages/shadcn/src/migrations/`): `icons` (Lucide→Tabler etc.), `radix` (Radix-UI hoist to packages), `rtl` (LTR→RTL with `start/end` substitution). Each is a 160–455 line module that uses `fast-glob` to find target files, applies a per-file diff, and prompts before writing.

`migrate-radix.ts` (`:455` LOC) does a real AST-aware named-import rewrite — handles aliases, type-only imports, `slot` special cases (`:39-98`).

The `migrate.ts` dispatcher (`packages/shadcn/src/commands/migrate.ts:12-26`) is a static array of `{name, description}` records. No version-triggered migration — user invokes by name.

### Dash approach

No `migrate` command. `dash sync` (`packages/cli/src/commands/sync.ts:1-560`) handles drift detection between installed and registry versions, can auto-upgrade with `--all`/`--auto-upgrade`, and supports `--check` / `--json` / `--dry-run`. But sync is *re-pull*, not *code-rewrite*.

### Diff analysis

- Shadcn migrations are **breaking-change-shock-absorbers**. When Radix-UI consolidated packages and they had to migrate every user, having a CLI command made it possible. Dash will hit this the moment a Layer-0 token is renamed.
- Dash's `sync` covers what shadcn's `add --overwrite` does. It's a different abstraction (version-aware) but doesn't help with cross-file AST rewrites.

### Recommendation

- **ADOPT (next 8 weeks):** `dash migrate <name>` scaffolding. Doesn't need 3 migrations on day one — needs the *plumbing* so the first breaking change has a landing pad. Modeled on shadcn's structure: `packages/cli/src/migrations/<name>.ts` + dispatcher in `commands/migrate.ts`. [1 day for plumbing, 2-3 days per migration thereafter]
- **ADAPT:** Use `ts-morph` (shadcn already uses it via `migrate-radix.ts` and `updaters/update-files.ts`) for AST rewrites instead of regex. Dash doesn't ship ts-morph today.
- Combine `migrate` with `sync`: when `sync` detects a major-version bump, suggest the relevant migration. [Future, low priority]

---

## G. Build / sync

### Shadcn approach

Two builds:

1. **CLI build** (`packages/shadcn/src/commands/build.ts:33-100`): Reads `registry.json`, validates against `registrySchema`, for each item reads files from disk, inlines their content into `files[].content`, validates each item, writes per-item JSON to `output/`. Plus copies `registry.json` into the output. **100 LOC, single-pass, easy to understand.**
2. **App-level build** (`apps/v4/scripts/build-registry.mts`, 1344 LOC): The shadcn.com docs registry pipeline. Builds the temporary styled registries (`registry/<base>-<style>`), runs the CLI build for each style, copies UI files into `styles/<style>/ui/`, generates the `__index__.tsx` runtime lookup, etc. **This is unique to running multi-style + multi-base.**

### Dash approach

Single build (`packages/cli/src/commands/build.ts:1-73`). Reads `registry.json`, for each item validates + inlines file content + writes `outDir/<name>.json` + accumulates entries into `index.json`. 73 LOC. **Cleaner than shadcn's because Dash only has one style/base.**

Notable: Dash writes a top-level `index.json` listing all items — shadcn writes per-item JSON only and the registry index is computed from `registry.json` itself. Both work.

### Diff analysis

- Dash's build is **cleaner and easier to maintain** than shadcn's CLI build — fewer abstractions for the same job.
- Shadcn's app-level build (1344 LOC) is bloat that comes from supporting 14 style combinations (`STYLE_COMBINATIONS` at `:60-67`). Dash doesn't need this and shouldn't copy it.
- Dash already writes `index.json` (a thing shadcn computes on the fly). For the bearer-auth model this is the right call — consumers shouldn't have to hit a separate endpoint to enumerate.

### Recommendation

- **KEEP Dash's build as-is.** [No-op]
- **ADOPT:** Add zod validation at the build boundary (currently `validateRegistryItem` only checks 4 fields). When the schema migrates to zod (recommendation D), `build` automatically benefits. [2h after D]

---

## H. Theming

### Shadcn approach

Two parallel theme systems:

1. **CSS variables** (`packages/shadcn/src/utils/updaters/update-css-vars.ts`, `transformers/transform-css-vars.ts`). Components reference CSS vars (`bg-background`, `text-primary`). Theme switch = re-run init with a different preset.
2. **Tailwind preset** (`packages/shadcn/src/preset/`, exported as `shadcn/preset`). Consumers can `import shadcnPreset from "shadcn/preset"` in `tailwind.config.js` to inherit the full design system without re-running init. Multi-theme: 7 styles × 2 bases = 14 themes (`apps/v4/registry/styles/`, `registry/bases/`). Dark mode = `.dark { ... }` selector convention.

The `registry:base` item type carries a `config: rawConfigSchema.deepPartial()` field (`registry/schema.ts:181-183`) — installing a `registry:base` item rewrites your `components.json` with its overrides. This is how preset-switching works.

### Dash approach

CSS variables only. Single theme written by `init` (`packages/cli/src/commands/init.ts:103-152`). Layer-2 themes are per-tenant CSS overrides loaded via `theme-registry.ts:1-166` from `apps/docs/registry/dash/themes/<tenant>.css`. `theme-resolver.ts:1-71` decides which Layer-2 to apply (CLI flag > `dashTheme` field > "ride" default).

No Tailwind preset. Theme switching = re-run `dash init --theme <new>`.

### Diff analysis

- Shadcn's Tailwind preset is a **clean way to keep the design system updates flowing without re-running init** — `pnpm up shadcn` and you get new tokens. Dash users have to `dash sync` and accept overwrites of `globals.css`. Both work, but shadcn's is lower-friction.
- Shadcn supports **14 themes built at the docs registry**, switchable per consumer. Dash supports **N tenant themes** (currently 4 internal + N Trellis) but they're product-level concerns, not aesthetic choices. Different problem space.
- Dark mode: shadcn uses `.dark` class convention. Dash's `init.ts:137-152` uses the same. **No diff here.**

### Recommendation

- **ADOPT (8-week horizon):** Ship a `@dash/tailwind-preset` package that re-exports the foundation tokens. Consumers can opt in for zero-touch token updates. [1 day]
- **ADAPT:** Borrow shadcn's `registry:base` pattern. Currently Dash's "base theme" is a registry item but doesn't carry config overrides. If it did, Layer-2 theme switching could happen by `dash add <theme-item>` instead of re-running init. [2 days]
- **AVOID:** Multi-style aesthetics (new-york vs default). Dash doesn't need a "style" axis — it has a "tenant" axis.

---

## I. Documentation site

### Shadcn approach

Next 16 + Fumadocs (`apps/v4/package.json`, `source.config.ts`). Content is **215 `.mdx` files under `apps/v4/content/docs/`**. `mdx-components.tsx` imports the registry's components and exposes them as MDX tags, so docs authors write:

```mdx
<ComponentPreview name="button-demo" />
```

…and the rendered page shows the iframe + tabs + copy-button via `components/component-preview.tsx`. Code blocks use `rehype-pretty-code` + Shiki, syntax highlighted at build time. Search powered by Fumadocs's `createFromSource` at `apps/v4/app/api/search/route.ts:1-5`.

Hand-written components in `apps/v4/components/`: ~50 docs components (`component-preview.tsx`, `code-block-command.tsx`, `chart-display.tsx`, `block-viewer.tsx`, etc.). Many are docs-only and won't ship to consumers.

### Dash approach

Next + custom docs setup. **Zero MDX files in `apps/docs/`.** Every docs page is a hand-written `app/(docs)/docs/<route>/page.tsx`. Find by `find /Users/irfanprimaputra.b/dash-ds/apps/docs -name "*.mdx"` returns 0.

Docs components at `apps/docs/components/docs/` (12 files: `code-block.tsx`, `command-palette.tsx`, `breadcrumb.tsx`, `page-shell.tsx`, `on-this-page.tsx`, `preview.tsx`, etc.). Page contents are JSX-as-content. Code highlighting via custom Shiki wrapper (`shiki-highlighter.ts`).

No built-in search (TODO based on `command-palette.tsx` presence).

### Diff analysis

- **This is the single biggest divergence.** Shadcn ships docs at a rate of ~1 MDX file per component (≈215 components documented). Dash has 100+ items in its registry and a TSX page for each requires hand-writing JSX + including the preview wiring. **The Dash docs site will not scale past ~100 documented components without an MDX migration.** [High confidence]
- Shadcn's Fumadocs gives free TOC, search, code highlighting, breadcrumbs, prev/next. Dash has hand-built equivalents — `on-this-page.tsx`, `breadcrumb.tsx`, `page-nav.tsx` — but each is duplicate effort.
- Dash docs hand-written pages have one advantage: **they let you embed live React state and interactive components** without escaping MDX. Sometimes worth it.

### Recommendation

- **ADOPT (highest priority, 4-week horizon):** Migrate docs to Fumadocs + MDX. Pages stay TSX where interactive; everything else moves to `.mdx`. Component preview becomes `<DashPreview name="button" />`. **This unblocks every future component getting docs.** [3-5 days work]
- **ADAPT:** Keep Dash's `code-block.tsx` (with Shiki) — it's good. Bind it as the MDX `pre` component.
- **ADAPT:** Search route at `apps/docs/app/api/search/route.ts` modeled on shadcn's 5-line `createFromSource(source)`. [1h after Fumadocs migration]
- **AVOID:** Shadcn's `apps/v4/scripts/build-registry.mts` complexity (1344 LOC). Dash doesn't need style combinations.

---

## J. Examples / Blocks distribution

### Shadcn approach

Blocks live in `apps/v4/registry/new-york-v4/blocks/<name>/` as full Next.js subprojects (app + components + lib). Each block entry in `registry.json` lists every file with target paths. The CLI's `add` command resolves them like any other item.

Demos / examples (`apps/v4/registry/new-york-v4/examples/`) follow the same shape but are marked `type: "registry:example"` — they're surfaced in `<ComponentPreview>` but not installable via `add`. The MCP tool `get_item_examples_from_registries` searches these (`mcp/index.ts:106-122`).

### Dash approach

Blocks live in `apps/docs/registry/dash/blocks/<name>.tsx` as single files. Templates in `apps/docs/registry/dash/templates/<name>.tsx`. Patterns in `.../patterns/`. Scaffolds in `.../scaffolds/` — these are multi-file but the registry shape doesn't reflect that strongly.

### Diff analysis

- Shadcn's blocks-as-subprojects shape lets a `block` install 10+ files at once into the consumer with proper directory structure. Dash's single-file approach forces composition to happen in the consumer.
- Shadcn's `registry:example` separation is **a useful UX** — demo code isn't installable but is browsable. Dash mixes demos into the docs page TSX.

### Recommendation

- **ADAPT:** Introduce `registry:example` type for demo code that should be browsable but not installable. [Combine with schema migration in D]
- **ADAPT:** Allow Dash blocks to be multi-file (already true for scaffolds — extend to all blocks). [4h]
- **AVOID:** Full-subproject blocks shape. Dash's product blocks (ride-dispatch-board, logistic-route-planner) are tighter scope and don't need full Next.js apps.

---

## K. Skill (MCP) integration

### Shadcn approach

`skills/shadcn/SKILL.md` is a 100+ line skill manifest that's **bundled with the shadcn npm package** and discoverable by `npx shadcn@latest`. It runs `dash info --json` equivalent on activation (` !`npx shadcn@latest info --json` ` template, `SKILL.md:14-16`), then loads compressed rules from `rules/styling.md`, `rules/forms.md`, `rules/composition.md`, `rules/icons.md`, `rules/base-vs-radix.md`.

It enumerates **42 critical rules** as bullet points, with each section linking to a `rules/*.md` that holds Incorrect/Correct code pairs. Plus a `agents/openai.yml` for non-Claude agents.

### Dash approach

`packages/skill/SKILL.md` is **35 lines**. Activation criteria, instructions, reference. Heavy lifting happens in `packages/skill/src/`:

- `activate.ts` — detect `components.json` etc.
- `info-collector.ts` — runs `dash info --json`
- `prompt-builder.ts` — assembles snapshot + rules + tenant overlays into a final prompt (`packages/skill/src/index.ts:42-50`)
- v3 multi-tenant scoping via `lib/tenant-detector.ts`

Rules content lives outside the skill: `apps/docs/registry/rules/dash-ai-rules.md` (~829 lines full, with a compressed variant). Skill fetches latest via registry.

### Diff analysis

- Shadcn's SKILL.md is **rich content embedded directly**. Cheaper to ship (no network call) but stale if registry rules change. Updates ship with the CLI release.
- Dash's SKILL.md is **a thin pointer** that defers content to the registry. Always fresh but requires network + caches. Heavier engineering (`packages/skill/src/` is non-trivial) but pays off when rules need to evolve faster than CLI releases.
- Shadcn's `rules/*.md` files with Incorrect/Correct code pairs are **a teaching pattern Dash should copy**. Dash's `dash-ai-rules.md` is rule-heavy but example-light.

### Recommendation

- **ADOPT:** Incorrect/Correct code pairs in `apps/docs/registry/rules/dash-ai-rules.md`. Even adding 10 pairs would dramatically improve compliance. [2 days]
- **KEEP:** Dash's network-fetch skill model — it's the right call for an internal sovereign DS with frequent rule updates.
- **ADAPT:** Ship a baseline static SKILL.md that works *without* the registry network, so first-time consumers in offline / restricted-net environments still get value. [1 day]

---

## L. Testing

### Shadcn approach

- 77 `*.test.ts` files in `packages/shadcn/`.
- Vitest with `vite-tsconfig-paths` (`packages/shadcn/vitest.config.ts`).
- Snapshot testing in transformers (e.g. `transform-rsc.test.ts` patterns).
- E2E-ish via `packages/tests/` workspace (`vitest.workspace.ts`).
- Tests live next to source (`add.test.ts` beside `add.ts`).

### Dash approach

- 37 `*.test.ts` files total across all packages (vs 77 shadcn).
- Vitest configs in `packages/cli/vitest.config.ts`, `packages/worker/vitest.config.ts`, `packages/skill/vitest.config.ts`.
- Tests next to source (`components-json.test.ts` beside `components-json.ts`).
- No snapshot testing on file outputs.

### Diff analysis

- Shadcn ships **2× the test count**. Coverage on transformers + updaters + registry resolver is much denser.
- Dash has solid coverage on schema, css-merger, disk-cache, components-json — the lib layer. Commands themselves are less tested.

### Recommendation

- **ADOPT:** Snapshot testing for file outputs in `dash add` (golden files for button.tsx → consumer button.tsx). [4h plumbing, then per-component]
- **ADAPT:** Command-level integration tests that spawn the CLI in a temp dir. Shadcn does this via `packages/tests/`. Dash has some `__tests__` dirs but coverage is sparse. [1 day to set up the harness]

---

## M. Monorepo + Turbo

### Shadcn approach

- `pnpm-workspace.yaml` exposes `apps/*` and `packages/*`, excludes fixtures/templates/temp (`pnpm-workspace.yaml:1-7`).
- `turbo.json` with explicit pipeline, env passthrough for build vars, `outputs` configured for caching (`turbo.json:1-65`).
- `changesets` for versioning (`CONTRIBUTING.md` mention).
- `vitest.workspace.ts` for cross-package test runs.

### Dash approach

- `pnpm-workspace.yaml` exposes `apps/*` and `packages/*` (`pnpm-workspace.yaml:1-3`). Minimal.
- **No turbo.json.** Build is `pnpm -r build` from root `package.json:11`.
- No changesets — versions hand-bumped per package.
- No vitest workspace — each package runs independently.

### Diff analysis

- Dash will hit a build-time wall as packages grow. `pnpm -r build` re-runs everything; turbo caches the unchanged outputs.
- Changesets is overkill for a 5-package internal monorepo. Hand-bump is fine.

### Recommendation

- **ADOPT (medium priority):** `turbo.json` with build/test/lint pipelines + cache for `dist/`. Even rough Turbo speeds builds significantly. [3h]
- **AVOID:** Changesets. Dash's 5-package surface doesn't justify it.

---

## N. Versioning + release

### Shadcn approach

- Single CLI version (`shadcn@4.7.0`) covers init/add/build/MCP/etc.
- Migrations are version-agnostic, invoked by name.
- Per-style versioning at the registry level (`new-york-v4`, etc.) — but that's a docs concern, not a CLI concern.
- Pre-release tags: `pub:beta`, `pub:next`, `pub:release` (`packages/shadcn/package.json:75-77`).
- Suggests previous-minor on errors (`utils/handle-error.ts:92-101`).

### Dash approach

- CLI: `dash@0.4.0` (semver, manual bumps).
- MCP: `@dash/mcp-server` separate package, separate version.
- Skill: `@dash/skill` separate.
- Worker: separate.
- Registry items have their own version via Dash header injection (`packages/cli/src/lib/component-version.ts:1-155`) — installed components carry `// @dash-version: 1.2.3` headers so `dash sync` can detect drift.
- No pre-release tags / beta channels.

### Diff analysis

- Dash's per-component versioning is **a real innovation** shadcn doesn't have. `dash sync` can tell you "Button v1.2 → v1.3 available, breaking change". Shadcn relies on you running `add` again.
- Shadcn's single-CLI versioning is simpler but loses fidelity.

### Recommendation

- **KEEP:** Per-component version headers — Dash's win, not shadcn's. Make it more visible in docs.
- **ADOPT (low priority):** Beta/next npm tags for CLI releases (`pnpm pub:beta`). [1h]
- **ADOPT:** Previous-version suggestion in error handler (mirrors recommendation A). [1h, same task]

---

## Critical Adoption Recommendations (Top 10)

Ranked by **(impact × confidence) / effort**:

| # | Recommendation | Section | Effort | Impact | Confidence |
|---|----|----|----|----|----|
| 1 | **Migrate docs site to Fumadocs + MDX** | I | 3-5d | Unblocks all future component docs | High |
| 2 | **Move schema to zod with discriminated union** | D | 1d | Runtime-validated registry items, better errors | High |
| 3 | **Format MCP tool responses as markdown with CTAs** | C | 1d | Better LLM tool-use compliance | High |
| 4 | **Add `RegistryError` taxonomy with `suggestion` field** | C, A | 4h | Better error UX in CLI + MCP | High |
| 5 | **Add `dash migrate <name>` plumbing** | F | 1d | Lands first breaking change cleanly | High |
| 6 | **Backup-and-restore on `dash init` unexpected exit** | E | 2h | No half-broken `components.json` | High |
| 7 | **Multi-registry namespace dispatch (`@dash`, `@trellis-acme`)** | B | 1d | Unlocks tenant-private registries | Medium |
| 8 | **`get_audit_checklist` MCP tool with Dash rules** | C | 2h | Better post-generation compliance | Medium |
| 9 | **Move `DASH_BASE_CSS` from CLI constant to `registry:base` item** | E | 4h | Token updates ship via registry, not CLI release | High |
| 10 | **Add turbo.json for build/test caching** | M | 3h | 2-5× faster local + CI builds | Medium |

---

## Critical Avoid List (Top 5)

1. **Bit-packed preset codes** (`packages/shadcn/src/preset/preset.ts`) — solving a problem Dash doesn't have. Layer-2 theme is one string.
2. **Multi-style aesthetic axes** (new-york vs default) — `apps/v4/scripts/build-registry.mts` has 1344 LOC mostly to support this. Dash has one style.
3. **Full-subproject blocks** — shadcn's `apps/v4/registry/new-york-v4/blocks/<name>/` is overkill for Dash's narrower block scope.
4. **Changesets** — overkill for a 5-package internal monorepo.
5. **Two sources of truth for the schema** (TS + hand-synced JSON Schema in `apps/v4/public/schema/`) — generate JSON Schema from zod via `zod-to-json-schema`.

---

## Surprising Patterns Shadcn Uses (worth knowing)

1. **`process.on("exit", restoreBackupOnExit)`** for atomic `components.json` writes (`init.ts:154-165`) — registers a sync listener so even `process.exit(1)` in preflight rolls back. Subtle and good.
2. **`exitWithPreviousVersionSuggestion()`** in error handler (`utils/handle-error.ts:92-101`) — composes the exact `pnpm dlx shadcn@<prev-minor> <args>` command and prints it. UX layer that pays off during the first breaking-change incident.
3. **`_source` field on resolved registry items** (`registry/resolver.ts:151-154`) — tracks which user-input string led to each resolved item, used for error messages. Cheap, useful.
4. **`zodToJsonSchema(z.object({...}))` for MCP tool schemas** (`mcp/index.ts:39`) — schema authored in zod once, exported as MCP input schema. No drift between runtime parse + tool advertise.
5. **Dedented markdown via `dedent` package in MCP responses** (`mcp/index.ts:163`) — clean way to template multi-line markdown for tool output. Dash returns raw JSON instead.

## Defensible Dash Advantages Confirmed (don't drop)

1. **Bearer-auth registry endpoint** with rate limiting + audit log (`apps/docs/app/api/registry/[name]/route.ts`). Shadcn's `ui.shadcn.com/r/*` is open. Dash's tenant model requires auth.
2. **`dash audit` consumer-side drift detection** (`packages/cli/src/commands/audit.ts`, 200+ LOC). Catches banned imports, off-token colors, Layer violations *inside consumer repos*. Shadcn has nothing equivalent — it's a write-only ship-and-forget.
3. **`dash gap` queue + Hermes worker** (`packages/worker/src/pipeline.ts`, 430 LOC). When a consumer hits a missing DS pattern, log it; worker picks it up, generates a candidate via Anthropic, opens a PR. Shadcn doesn't have this loop closed.
4. **Per-component version headers + `dash sync`** (`packages/cli/src/lib/component-version.ts`). Drift detection on installed components. Shadcn re-adds from scratch.
5. **Layer-2 theme system** (`packages/cli/src/lib/theme-resolver.ts`, `theme-registry.ts`). Tenant-scoped accent/voice/density overrides without forking primitives. Shadcn's multi-style is aesthetic; Dash's multi-theme is structural.

## Critical Gaps Dash Should Close (next 8 weeks)

1. **Docs site won't scale past ~100 documented components.** Zero MDX → every docs page is hand-written TSX. Fumadocs migration is the highest-impact change available. [Section I]
2. **Schema not runtime-validated at fetch boundary.** A malformed registry item slips into the writer and crashes deep. Zod migration unblocks better error messages everywhere. [Section D]
3. **MCP returns raw JSON.** Worse tool-use compliance. Format as markdown with embedded `dash add <x>` CTAs. [Section C]
4. **No `dash migrate` infrastructure.** First breaking change in Layer-0 has no landing pad. Build the plumbing now even if migrations stay empty. [Section F]
5. **No backup/rollback in `dash init`.** A crash during preflight leaves a partial `components.json`. Trivial 2h fix with outsized UX value. [Section E]

---

## Implementation Priorities Mapped to Dash Roadmap

### Next 2 weeks (quick wins, ≤2h each)
- `RegistryError` class + `suggestion` field (#4)
- Backup-and-restore on `dash init` (#6)
- `get_audit_checklist` Dash MCP tool (#8)
- Previous-version suggestion in error handler (paired with #4)

### Next 4 weeks (foundational)
- Schema → zod migration (#2)
- MCP responses → markdown with CTAs (#3)
- `dash migrate` plumbing (#5)
- `DASH_BASE_CSS` → `registry:base` item (#9)

### Next 8 weeks (transformational)
- **Docs migration to Fumadocs + MDX (#1) — highest ROI**
- Multi-registry namespace dispatch (#7)
- Turbo.json + build caching (#10)
- Per-framework `init` hooks
- Tailwind preset package

---

## Sources

### Shadcn files read (counts)
- `/tmp/shadcn-ui/packages/shadcn/src/index.ts` (53 LOC)
- `/tmp/shadcn-ui/packages/shadcn/package.json` (130 LOC)
- `/tmp/shadcn-ui/packages/shadcn/tsup.config.ts` (29 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/commands/add.ts` (375 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/commands/init.ts` (1018 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/commands/mcp.ts` (266 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/commands/build.ts` (101 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/commands/migrate.ts` (114 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/mcp/index.ts` (464 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/registry/schema.ts` (318 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/registry/resolver.ts` (743 LOC, partial)
- `/tmp/shadcn-ui/packages/shadcn/src/registry/builder.ts` (163 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/registry/namespaces.ts` (63 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/registry/errors.ts` (80 LOC, partial)
- `/tmp/shadcn-ui/packages/shadcn/src/migrations/migrate-radix.ts` (455 LOC, partial)
- `/tmp/shadcn-ui/packages/shadcn/src/utils/handle-error.ts` (107 LOC)
- `/tmp/shadcn-ui/packages/shadcn/src/utils/updaters/update-files.ts` (100 LOC, partial)
- `/tmp/shadcn-ui/packages/shadcn/src/preset/preset.ts` (80 LOC, partial)
- `/tmp/shadcn-ui/apps/v4/package.json` (80 LOC, partial)
- `/tmp/shadcn-ui/apps/v4/scripts/build-registry.mts` (120 LOC, partial of 1344)
- `/tmp/shadcn-ui/apps/v4/source.config.ts` (39 LOC)
- `/tmp/shadcn-ui/apps/v4/registry.json` (sample)
- `/tmp/shadcn-ui/apps/v4/mdx-components.tsx` (40 LOC, partial)
- `/tmp/shadcn-ui/apps/v4/components/code-block-command.tsx` (40 LOC, partial)
- `/tmp/shadcn-ui/apps/v4/app/api/search/route.ts` (5 LOC)
- `/tmp/shadcn-ui/skills/shadcn/SKILL.md` (100 LOC, partial)
- `/tmp/shadcn-ui/scripts/sync-templates.sh` (40 LOC)
- `/tmp/shadcn-ui/turbo.json` (65 LOC)
- `/tmp/shadcn-ui/pnpm-workspace.yaml` (7 LOC)
- `/tmp/shadcn-ui/vitest.config.ts`, `vitest.workspace.ts`

**Total: ~30 shadcn files read, ~5400 LOC reviewed end-to-end.**

### Dash files cross-referenced (counts)
- `/Users/irfanprimaputra.b/dash-ds/packages/cli/src/index.ts` (407 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/cli/src/commands/init.ts` (349 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/cli/src/commands/add.ts` (100 LOC, partial)
- `/Users/irfanprimaputra.b/dash-ds/packages/cli/src/commands/build.ts` (74 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/cli/src/commands/audit.ts` (40 LOC, partial)
- `/Users/irfanprimaputra.b/dash-ds/packages/cli/src/lib/registry-fetch.ts` (155 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/cli/src/lib/schema.ts` (90 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/cli/src/lib/file-writer.ts` (112 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/cli/src/lib/components-json.ts` (102 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/cli/package.json`
- `/Users/irfanprimaputra.b/dash-ds/packages/mcp-server/src/index.ts` (127 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/mcp-server/src/tools/search-components.ts` (81 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/mcp-server/src/tools/get-component.ts` (57 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/registry-schema/src/index.ts` (34 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/skill/SKILL.md` (35 LOC)
- `/Users/irfanprimaputra.b/dash-ds/packages/skill/src/index.ts` (60 LOC, partial)
- `/Users/irfanprimaputra.b/dash-ds/packages/worker/src/index.ts` (60 LOC, partial)
- `/Users/irfanprimaputra.b/dash-ds/apps/docs/app/api/registry/[name]/route.ts` (80 LOC, partial)
- `/Users/irfanprimaputra.b/dash-ds/apps/docs/components/docs/code-block.tsx` (40 LOC, partial)
- `/Users/irfanprimaputra.b/dash-ds/package.json` (23 LOC)
- `/Users/irfanprimaputra.b/dash-ds/pnpm-workspace.yaml` (8 LOC)

**Total: ~21 Dash files read, ~2100 LOC reviewed.**

### Confidence per major section

| Section | Confidence |
|----|----|
| A. CLI architecture | High |
| B. Registry resolver | High |
| C. MCP server | High |
| D. Schema | High |
| E. Init command | High |
| F. Migrate command | High |
| G. Build / sync | High |
| H. Theming | Medium (didn't deep-read all theme registry items) |
| I. Documentation site | High |
| J. Examples / Blocks | Medium (didn't enumerate every block) |
| K. Skill | Medium (didn't deep-read rules content) |
| L. Testing | Medium (didn't compare individual test patterns) |
| M. Monorepo + Turbo | High |
| N. Versioning + release | Medium (didn't trace per-component version usage end-to-end) |
