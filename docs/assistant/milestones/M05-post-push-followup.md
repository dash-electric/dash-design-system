# M05 — Post-Push Follow-up Plan

> **Context**: 2026-06-03 push focused on `@dash/kit` + `dash` CLI polish so
> sister consumer repos (`dash-dashboard`, `dash-build`) can consume the design
> system cleanly via `file:` workspace dep. Below = the work explicitly
> deferred from that push, broken into milestones with concrete file/scope
> hooks so future passes can pick up cold.

## Milestone summary

| # | Title | Scope size | Blocking? | Owner hint |
|---|-------|-----------|-----------|------------|
| M05.1 | Existing component cleanup (UI polish + shadow audit) | ~10–25 files | Quality, not blocking | Design + DS |
| M05.2 | Missing component doc pages — full sweep | ~3 known + audit catches more | Discoverability, not blocking | DS docs |
| M05.3 | MCP contract refactor (Phase A–E from 2026-06-02 plan) | 18 files | Blocks dash-build codex codegen quality | DS infra |
| M05.4 | Sync ritual automation (post-edit hook → `pnpm --filter @dash/kit build`) | 1–2 files | DX nicety | DS infra |
| M05.5 | Reverse-flow harvest (consumer → DS) | Skeleton script + workflow | Unlocks crowdsourced atoms | DS infra |
| M05.6 | Untracked `docs/assistant/` triage (commit / ignore / move) | git hygiene | Tidiness | Maintainer |
| M05.7 | CLI publish to npm internal registry | Release infra | Unlocks external Dash repo consumption | DS infra |
| M05.8 | Consumer-side import drift (dash-dashboard 9-file `@/registry/dash/lib/utils` rewrite) | Cross-repo (Chat C) | Blocks dash-dashboard typecheck | Dash dashboard team |

---

## M05.1 — Existing component cleanup

Several existing components still ship the heavy 5-layer custom shadow
(`shadow-regular-xs`) that we already downgraded on `Button` (neutral / stroke
variant) during the 2026-06-02 push. Mirror the same downgrade where it
visually applies.

### Known sites

- `apps/docs/registry/dash/ui/widget-shell.tsx:44` — `shadow-regular-xs` on the
  card surface. Idle state feels too card-like for an inline widget grid.
  Suggested swap: `shadow-xs` (Tailwind v4 hairline). Hover state
  (`hover:shadow-card-sm`) can stay.

### Recommended audit pass

```bash
grep -rn "shadow-regular-xs" apps/docs/registry/dash/ui/ | wc -l
# Triage each hit: keep on cards / dropdowns / floating surfaces,
# downgrade to shadow-xs on inline buttons / chips / hairline lifts.
```

Other suspected polish areas (open):

- Modal / Drawer focus-ring weights — many use `ring-4` which feels heavy at
  Dash Purple alpha-10. Survey before action.
- Table sticky header drop shadow on scroll — verify across breakpoints.
- Empty-state vertical rhythm — illustration size vs title vs body inconsistent
  across the 34 kinds.

### Definition of done

- `grep -n "shadow-regular-xs"` in `registry/dash/ui/` returns only the
  surfaces we intentionally keep (large card / floating panel surfaces).
- `pnpm --filter @dash/docs typecheck` clean.
- `pnpm --filter @dash/kit build` rebuilt + sister repos verified at next
  manual smoke.

---

## M05.2 — Missing component doc pages — full sweep

2026-06-03 batch added 3 doc pages (`brand-logo`,
`empty-state-illustration`, `widget-shell`). Audit logic that produced them:

```bash
# UI sources
ls apps/docs/registry/dash/ui/*.tsx | xargs -n1 basename | sed 's/\.tsx$//' | sort > /tmp/ui-sources.txt

# UI doc pages
ls -d apps/docs/app/\(docs\)/docs/components/*/ | xargs -n1 basename | sort > /tmp/ui-docs.txt

# Missing
comm -23 /tmp/ui-sources.txt /tmp/ui-docs.txt
```

Re-run on the next pass. False positives to skip: `dash-logo` (lives at
`/docs/foundations/dash-logo`), `flag` (lives at
`/docs/foundations/country-flags`), `progress-bar` (combined doc page at
`/docs/components/progress` w/ progress-circle).

### Doc page template

Follow the structure used in the 3 newly-added pages — they're the canonical
"simple-component" template (atoms with no heavy variant matrix):

1. `DocsHeader` (no decorative tabs)
2. `DocsSection title="Install"` (single bash codeblock)
3. `DocsSection title="Anatomy"` (one annotated preview)
4. `DocsSection title="Examples"` (3–5 `DocsExample` variations)
5. Optional `DocsSection title="Don't"` (DocsDoDont card)
6. `DocsSection title="API"` (`DocsPropsTable`)
7. `DocsSection title="Accessibility"` (3–5 bullets)
8. Optional final section: theming / vendor / asset source / etc.

### Other things to audit in the same pass

- **Orphan doc pages** — doc page exists, no UI source (e.g. `progress`,
  `charts/<sub>` aliased to `progress-bar` / chart blocks). Confirm aliasing is
  intentional; if not, surface to maintainer.
- **Nav-config drift** — every doc page should also appear in
  `apps/docs/components/docs/nav-config.ts` `componentInventory`. Cross-check
  the inventory against doc page filesystem each cycle.

---

## M05.3 — MCP contract refactor (Phase A–E)

Full plan captured in conversation transcript on 2026-06-02. TL;DR:

- 8 MCP tools currently exposed by `@dash/mcp-server` use snake_case
  (`search_components`, `get_component`, `search_tokens`, …) and return raw
  `RegistryItem` shape (`{files, deps, cssVars}`), NOT the
  `_shared-contracts/component-contract.md` shape
  (`{props, variants, examples, related, status, category, importPath}`).
- Token shape mismatch — flat `{path, value, group}[]` vs grouped `{colors,
  spacing, typography, radius, shadow}` per contract.
- Missing tools: `listComponents`, `listIcons`.

### File list (18 — repeated from 2026-06-02 plan)

**Phase A — schema + extractor:**
1. `packages/registry-schema/src/zod-schemas.ts` — add `ComponentContractShape`
2. `packages/registry-schema/src/index.ts` — export new type
3. `apps/docs/scripts/build-component-contract.mjs` (NEW)
4. `apps/docs/package.json` — `registry:build:contract` script

**Phase B — MCP server refactor:**
5. `packages/mcp-server/src/tools/list-components.ts` (NEW)
6. `packages/mcp-server/src/tools/get-component.ts` (REWRITE)
7. `packages/mcp-server/src/tools/search-components.ts` (REWRITE)
8. `packages/mcp-server/src/tools/list-tokens.ts` (NEW)
9. `packages/mcp-server/src/tools/list-icons.ts` (NEW)
10. `packages/mcp-server/src/index.ts` — register camelCase + snake_case alias

**Phase C — tests + docs:**
11. `packages/mcp-server/src/tools/list-components.test.ts` (NEW)
12. `packages/mcp-server/src/tools/get-component.test.ts` (NEW)
13. `packages/mcp-server/src/tools/list-tokens.test.ts` (NEW)
14. `packages/mcp-server/README.md`
15. `CHANGELOG.md` — `[Unreleased]`

**Phase D — version + handshake:**
16. `packages/mcp-server/src/version.ts` — 0.1.0 → 0.2.0
17. `_shared-contracts/component-contract.md` — v1 → v2 (additive)

**Phase E — CLI MCP wiring sanity:**
18. `packages/cli/src/commands/mcp.ts` — verify env var names match contract

### Cross-repo coordination

After landing this, post a handoff brief to Chat B (dash-build). Brief template
already drafted in 2026-06-02 transcript — fill placeholders (commit SHA,
staging URL, token mechanism) at handoff time. Save brief at
`_shared-contracts/HANDOFF-dash-ds-to-dash-build-<date>.md`.

### Skip / defer triggers

- Snake_case tool aliases stay for 1 minor (until v0.3.x) so dash-build doesn't
  break immediately.
- Defer P-Z extractors (icons / token CSS parsing) until first consumer pull
  actually exercises them.

---

## M05.4 — Sync ritual automation

After `apps/docs/registry/dash/ui/*.tsx` edits, `@dash/kit` must rebuild via
`pnpm --filter @dash/kit build`. Currently manual — documented in CHANGELOG
"Consumer sync ritual" section.

Possible automation:

- **chokidar watcher** — `packages/kit/dev.mjs` that watches the source dir +
  runs `build.mjs` on change. Wire up `"dev": "node ./dev.mjs"` script.
- **husky pre-commit** — if source `*.tsx` changed in staged diff, run
  `pnpm --filter @dash/kit build` before allowing commit. Catches consumer
  drift at the boundary.
- **Next dev plugin** — inject build into the `pnpm dev` lifecycle so editing
  source also rebuilds kit for the running consumer dev servers.

Recommend pre-commit hook + watcher — cheapest combo.

---

## M05.5 — Reverse-flow harvest (consumer → DS)

User-asked feature: when dash-build's codex (or any consumer) generates a
component that doesn't exist in the DS (e.g. `pie-chart`), how do we propagate
it back?

### Path comparison

| Path | Effort | Coverage |
|------|--------|----------|
| Manual PR | 0 | All consumers |
| GH Actions cron | Medium | Connected repos |
| Extend `@dash/worker` (reuse Hermes pipeline) | Low | Workers can reach |
| New CLI `dash harvest` | Medium | Opt-in consumers |
| Skill (Claude Code agent) | Low | Manual trigger |

### Recommended phasing

1. **Now**: manual PR with `harvest` label. Maintainer validates banned imports
   + tokens + voice + audit before merge.
2. **Sprint+1**: `dash harvest` subcommand. Reuses `dash audit` rule engine to
   lint candidate file before generating PR via `gh` CLI.
3. **Sprint+2**: scheduled GH Actions cron clones N consumer repos nightly,
   diffs against `registry/dash/ui/`, opens auto-PRs against `dash-ds main` for
   net-new components.

### Cron skeleton (for sprint+2)

```yaml
# .github/workflows/harvest-from-consumers.yml
name: Harvest new components from consumers
on:
  schedule:
    - cron: "0 19 * * *"  # 3am WIB daily
  workflow_dispatch: {}

jobs:
  harvest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install
      - name: Run harvest
        env: { GH_TOKEN: ${{ secrets.HARVEST_BOT_TOKEN }} }
        run: |
          pnpm tsx scripts/harvest.ts \
            --consumer ~/Work/dash/dash-build \
            --consumer ~/Work/dash/dash-dashboard \
            --consumer ~/Dash/portal-v2 \
            --output-pr
```

---

## M05.6 — Untracked docs/assistant/ triage

Pre-push state: untracked items in `docs/assistant/`:

- `adr/ADR-001-local-first-web.md`
- `adr/ADR-002-local-files-obsidian-db.md`
- `adr/ADR-003-google-meet-aftermath-first.md`
- `milestones/M01-automation-spine.md`
- `milestones/M02-meeting-aftermath-brain.md`
- `milestones/M03-dash-context-brain.md`
- `milestones/M04-claude-handoff.md`
- `claude-implementation-brief.md`
- (others — list incomplete)

Decide per file: commit (yes, it's institutional knowledge), .gitignore (yes,
it's personal scratch), or move (e.g. to Obsidian vault). Touch in a separate
PR — keep this push focused.

This milestone file (`M05-post-push-followup.md`) is added in the current push
intentionally — it documents the plan being deferred.

---

## M05.7 — CLI publish to npm internal registry

Currently `dash` CLI consumed via local workspace path
(`node ~/Work/dash/dash-ds/packages/cli/dist/index.js …`). External Dash repos
can't run `pnpm i -g dash` because the package isn't on npm.

### Path

1. Decide registry — npm public, GitHub Packages, or internal Verdaccio.
2. Configure `publishConfig` in `packages/cli/package.json`.
3. Run `pnpm --filter dash publish` (or via release-please / changesets).
4. Update `apps/docs/app/(docs)/docs/installation` pages to drop the local
   `node …/dist/index.js` workaround.
5. Smoke test in `~/Dash/portal-v2` (or any external repo): `pnpm i -g dash`,
   `dash init`, `dash add button` → verify install works end-to-end.

### Gate

Don't publish until M05.3 MCP refactor is at least started — otherwise external
consumers wire MCP with snake_case names and we eat the migration tax twice.

---

## M05.8 — Consumer-side import drift (Chat C handoff)

Found during `pnpm typecheck` cross-repo on 2026-06-03. `dash-dashboard` has 9
files importing the legacy alias `@/registry/dash/lib/utils`:

```
src/components/ui/divider.tsx
src/components/ui/drawer.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/kbd.tsx
src/components/ui/stat.tsx
src/components/ui/table.tsx
src/components/ui/tag.tsx
src/components/ui/tooltip.tsx
src/components/ui/widget-shell.tsx
```

Should import `@dash/kit/lib/utils` instead. Out of scope for Chat A
(`dash-ds`). Surface to Chat C (`dash-dashboard`) with the codemod:

```bash
cd ~/Work/dash/dash-dashboard
grep -rl "@/registry/dash/lib/utils" src/ | xargs sed -i '' \
  's|@/registry/dash/lib/utils|@dash/kit/lib/utils|g'
pnpm typecheck
```

---

## Out-of-band notes

- **Battery Saver Mode (macOS)** kills background dev servers spawned from
  Claude Code sessions. Workaround: run docs dev with `nohup ... &` + `disown`,
  or run in a terminal pane that stays foregrounded. Documented because it
  cost us 2 restart cycles during the 2026-06-03 push.
- **`dash-doc` rename signal** — last meaningful commit `dbb1e64` says
  "dash-ds is now dash-doc (producer)". Path still `dash-ds`. Decide if the
  repo gets a physical rename or the commit message is stale. Touching this
  rename = breaks every link, slack reference, IDE workspace — defer until
  there's a clear migration window.
