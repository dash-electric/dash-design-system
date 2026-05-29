# Repo split — dry-run execution plan (2026-05-29)

**Status:** PLAN ONLY. No moves executed. Review → then run.
**Goal:** carve the `dash-ds` monorepo into 3 repos with the MCP boundary
(already built, Phases 1-4) as the seam. Local-only, history-preserving, no
remotes/push until verified.

> Prereq DONE: MCP boundary Phases 1-4 committed (`632e90f`, `a96fc4e`,
> `7791088`, `5c6ea0c`, `589e8c3`). Parity proven byte-identical MCP↔FS; fresh
> daemon emits `@dash/kit` + respects real backoffice nav. Suite 1160/1160.

---

## 1. Current monorepo (facts)

Workspace globs: `apps/*`, `packages/*` (pnpm).

| Package dir | name | LOC(src) | @dash deps | consumed by |
|---|---|---|---|---|
| apps/docs | @dash/docs | — | — | (producer surface) |
| packages/kit | @dash/kit | — | — | dash-build (Sandpack), published |
| packages/mcp-server | @dash/mcp-server | — | — | dash-build + dashboard (boundary) |
| packages/cli | dash | — | registry-schema | dash-doc tooling |
| packages/skill | @dash/skill | 4226 | — | cli, worker, docs, **dash-build** |
| packages/registry-schema | @dash/registry-schema | 290 | — | cli, docs, **dash-build** |
| packages/aop-schema | @dash/aop-schema | 1704 | — | **dash-build only** |
| packages/worker | @dash/worker | — | skill | dash-doc tooling |
| packages/dashboard | @dash/dashboard | — | — | owner surface |
| packages/dash-build | @dash/build | — | skill, registry-schema, aop-schema | the builder |

dash-build's workspace deps: `@dash/skill`, `@dash/registry-schema`,
`@dash/aop-schema` (all `workspace:*`).

---

## 2. Target end-state — 3 repos

```
dash-doc/        (the PRODUCER — single source of truth)
  apps/docs                 registry r/*.json + @dash/kit source + design md
  packages/kit              → published @dash/kit
  packages/mcp-server       → the boundary server (HTTP/stdio)
  packages/skill            → published @dash/skill        (shared)
  packages/registry-schema  → published @dash/registry-schema (shared)
  packages/cli              dash CLI
  packages/worker           worker
  pnpm-workspace.yaml (apps/* + packages/*)

dash-build/      (the BUILDER — consumes dash-doc via npm + MCP)
  src/ + skills/ (vendored gstack) + preview-template/
  packages/aop-schema       ← MOVED IN (dash-build sole consumer)
  npm deps: @dash/kit, @dash/skill, @dash/registry-schema (published)
  runtime:  DASH_DS_MCP_URL → dash-doc mcp-server (dynamic reads)

dash-dashboard/  (the OWNER surface — consumes MCP same as build)
  packages/dashboard content hoisted to repo root
  npm deps: (none @dash workspace today) ; MCP for dynamic data
```

**Boundary contract after split:** dash-build + dash-dashboard depend on dash-doc
ONLY via (a) published npm packages (`@dash/kit`, `@dash/skill`,
`@dash/registry-schema`) and (b) MCP over `DASH_DS_MCP_URL`. No relative path
into `apps/docs/...` survives.

---

## 3. The three shared-package decisions

1. **`@dash/aop-schema` → absorb into dash-build.** Sole consumer is dash-build.
   Move `packages/aop-schema/` to `dash-build/packages/aop-schema/` (keep as an
   internal workspace pkg of the dash-build repo) OR inline its src under
   `dash-build/src/observability/aop-schema/`. **Recommend internal workspace
   pkg** — least import churn (`@dash/aop-schema` specifier unchanged).
2. **`@dash/skill` + `@dash/registry-schema` → publish from dash-doc.** Shared by
   producer-side (cli/worker/docs) AND dash-build. dash-build switches its
   `workspace:*` → a published semver (`^0.1.0`). Pre-split: cut a `0.1.0` of
   each to a local verdaccio or `pnpm pack` tarball so dash-build installs
   offline during the transition.
3. **`@dash/kit` → already published-model.** No further work; dash-build already
   resolves it via `require.resolve` with FS fallback (Phase 2).

---

## 4. Execution steps (history-preserving, local, reversible)

Each step is a separate commit on a `split/*` branch. Backup branch first.

### Step 0 — safety net
```bash
cd /Users/irfanprimaputra.b/Work/dash/dash-ds
git branch backup/pre-split-2026-05-29        # full snapshot, instant rollback
git status --porcelain                        # MUST be clean before split
```

### Step 1 — publish the shared packages (offline)
```bash
# from dash-ds, build + pack the 3 shared pkgs dash-build will consume
pnpm --filter @dash/kit build && (cd packages/kit && pnpm pack)            # → dash-kit-0.1.0.tgz
pnpm --filter @dash/skill build && (cd packages/skill && pnpm pack)
pnpm --filter @dash/registry-schema build && (cd packages/registry-schema && pnpm pack)
# stash the 3 .tgz in a known dir for dash-build install
mkdir -p ~/Work/dash/.local-tarballs && mv packages/*/*.tgz ~/Work/dash/.local-tarballs/
```

### Step 2 — carve dash-doc (in place = rename the monorepo)
The monorepo IS dash-doc minus dash-build + dashboard + aop-schema. Cleanest:
keep `dash-ds` as `dash-doc`, then *remove* the moved-out dirs in a later step
once the new repos verify. Do NOT delete until Step 5 passes.

### Step 3 — create dash-build repo (history-preserving via subtree)
```bash
cd ~/Work/dash
# split dash-build's history into its own branch, then materialize a repo
git -C dash-ds subtree split --prefix=packages/dash-build -b split/dash-build
git -C dash-ds subtree split --prefix=packages/aop-schema -b split/aop-schema
mkdir dash-build && cd dash-build && git init
git pull ../dash-ds split/dash-build                # dash-build at repo root
mkdir -p packages/aop-schema
git pull ../dash-ds split/aop-schema                # NOTE: lands at root; mv into packages/aop-schema in a commit
# rewire package.json: workspace:* → file:../.local-tarballs/*.tgz (transition)
#   @dash/kit, @dash/skill, @dash/registry-schema → tarball installs
#   @dash/aop-schema → workspace:* (now an internal pkg of this repo)
# add pnpm-workspace.yaml: ['.', 'packages/*']
pnpm install
```

### Step 4 — create dash-dashboard repo
```bash
git -C dash-ds subtree split --prefix=packages/dashboard -b split/dashboard
mkdir dash-dashboard && cd dash-dashboard && git init && git pull ../dash-ds split/dashboard
pnpm install
```

### Step 5 — VERIFY each repo green (before any deletion)
```bash
# dash-build
cd ~/Work/dash/dash-build && pnpm install && pnpm typecheck && pnpm test && pnpm build
#   start daemon, DASH_DS_MCP_URL=http://localhost:3000 (dash-doc docs server),
#   run the suspended-mitra prompt, confirm @dash/kit + preview + respects FE/BE
# dash-doc
cd ~/Work/dash/dash-ds && pnpm install && pnpm -r typecheck && pnpm -r test
#   docs server still serves r/*.json on :3000
# dash-dashboard
cd ~/Work/dash/dash-dashboard && pnpm install && pnpm typecheck && pnpm build
```

### Step 6 — prune dash-doc (ONLY after Step 5 all green)
```bash
cd ~/Work/dash/dash-ds && git rm -r packages/dash-build packages/dashboard packages/aop-schema
# drop their workspace entries; rename repo dir dash-ds → dash-doc
git commit -m "chore: prune split-out packages (dash-build, dashboard, aop-schema)"
```

---

## 5. Risk register

| # | risk | mitigation |
|---|---|---|
| S1 | Lose git history in new repos | `subtree split` preserves per-file history; backup branch = instant restore |
| S2 | dash-build can't resolve @dash/skill etc post-split | Step 1 packs local tarballs; dash-build installs from `file:` until a real registry exists |
| S3 | @dash/aop-schema import churn | Keep it `@dash/aop-schema` as internal workspace pkg → zero import edits |
| S4 | Hidden relative import into apps/docs | grep-sweep `\.\./.*apps/docs` in dash-build src BEFORE Step 3; boundary loaders already MCP-gated |
| S5 | Two checkouts share ~/.dash-build state | dash-build repo points DASH_HOME at its own dir, or archive between runs |
| S6 | Docs server must run for dash-build MCP path | document in dash-build README; FS fallback gone post-split, so MCP is required → dash-doc docs server is a hard runtime dep for full context |

> **S6 is the one behavioural change to flag:** post-split dash-build has no
> monorepo FS to fall back to. The Phase-3 FS fallback still exists in code but
> resolves nothing (no `apps/docs` sibling), so the MCP server becomes a hard
> dependency for full design context. Generation still runs degraded (empty
> context) if MCP is down — it won't crash — but quality drops. Keep the docs
> server up, or publish the design-context bundle into `@dash/kit` too.

---

## 6. Pre-split grep-sweep (run before Step 3)

```bash
cd ~/Work/dash/dash-ds/packages/dash-build
# any surviving relative path into the monorepo producer?
grep -rnE "\.\./(\.\./)+apps/docs|registry/dash/foundation|apps/docs/registry" src/ \
  | grep -v "__tests__\|\.test\." || echo "CLEAN — no producer FS coupling"
```
Expected CLEAN: the loaders read via MCP (env-gated) or walk-up FS that simply
finds nothing post-split. If a hardcoded `apps/docs` path shows, fix before split.

**RAN 2026-05-29 — VALIDATED CLEAN.** 16 matches, all either comments/docstrings
or the loader path-*builders* (`locateRegistryJson`, `locateCompressedRules`,
`locateDomainGlossary`, `hasDashFoundation`) that `path.join` onto a
walk-up-discovered `repoRoot` (`findRepoRoot`). NONE are hardcoded absolutes.
Post-split `findRepoRoot` finds no `apps/docs` sibling → FS reads return null →
the Phase-4 MCP path drives. No surprise producer coupling. Safe to split.

---

## 7. Rollback

```bash
cd ~/Work/dash/dash-ds && git checkout backup/pre-split-2026-05-29
rm -rf ~/Work/dash/dash-build ~/Work/dash/dash-dashboard   # new repos are throwaway until Step 6
```
Until Step 6 deletes anything, the monorepo is fully intact — the split is
additive (new sibling repos) and 100% reversible.
```
```
