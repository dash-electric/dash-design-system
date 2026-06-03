# @dash/skill

> **STATUS: SCAFFOLD ONLY — Phase 2 work (post-pilot, week 3).**
> Current state = manifest + folder structure + stubbed entry points.
> Real prompt injection lands in the Phase 2 milestone. Do not publish, do not consume.

Claude Code skill that auto-activates inside any repository wired to the `@dash` registry and injects:

1. **Project state** — captured via `dashkit info --json` (framework, aliases, installed @dash items, custom hooks, API base URL)
2. **Latest AI rules** — fetched from `{registryUrl}/r/dash-ai-rules.json`, cached 5 min
3. **Dash domain glossary** — `delivery`, `mitra`, `use-code`, `dispatch`, `outlet`, `driver`

## Activation

The skill auto-activates when the AI session's CWD contains:

- `components.json` with a `registries["@dash"]` entry, **or**
- a `.dash` directory marker, **or**
- explicit invocation via `/dash-skill`

See `SKILL.md` for the full activation contract.

## Structure

```
dash-skill/
├── manifest.json          # Claude Code skill manifest (machine-readable)
├── SKILL.md               # Skill body — markdown frontmatter + activation rules
├── src/
│   ├── index.ts           # Entry — composes info + rules + glossary
│   ├── info-collector.ts  # Calls `dashkit info --json` via execSync
│   ├── prompt-builder.ts  # Composes captured context → AI prompt template
│   └── activate.ts        # Auto-activation predicate (CWD detection)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Phase plan

| Phase | When | What |
| --- | --- | --- |
| 1 (current) | pilot | Scaffold only. `dashkit info` plumbing in `dash-cli` v0.2.0 ready. |
| 2 | post-pilot, week 3 | Replace stub `src/index.ts` with real prompt assembly + caching layer |
| 3 | week 4+ | Glossary + anti-pattern detection + per-tribe overlays |

## Prereqs

- `dashkit` CLI ≥ 0.2.0 (provides `dashkit info --json`)
- Claude Code session with skill loader enabled

## v3 — multi-tenant scoping

Opt in by passing `version: 3` to `loadDashSkill`. v3 adds Layer-2 theme
awareness so different Dash products (Ride / Logistic / Travel / Marketplace)
plus future Trellis external tenants get isolated context without forking
the foundation.

```ts
import { loadDashSkill, getTenantContext } from "@dash/skill"

const prompt = await loadDashSkill({
  cwd: process.cwd(),
  version: 3,
  // optional — bypasses auto-detection
  tenantId: "ride",
  // optional — only needed when the DS lives outside the consumer repo
  dsRoot: "/path/to/dash-ds",
})
```

### Tenant detection priority

1. `opts.tenantId` (explicit override, must be valid)
2. `components.json` field `dashTheme` (written by `dashkit init --theme <name>`)
3. `package.json` `name` heuristic (e.g. `@dash-ride/portal`)
4. Env var `DASH_TENANT`
5. Auto-detect from imports (paths under `blocks/<tenant>/*`)
6. Falls back to `undefined` → shared/generic context

Valid tenants: `ride`, `logistic`, `travel`, `marketplace`, `trellis-tenant`,
or any `trellis-<id>` matching `/^trellis-[a-z0-9-]+$/`.

### Per-tenant context filtering

v3 injects (in priority order, ≤7K char budget):

| Block | Source | Approx chars |
| --- | --- | --- |
| Layer 0 cardinal rules (pinned) | `dash-ai-rules.md` line ranges | ~3K |
| Tenant theme metadata | `themes/<id>/manifest.json` | ~0.5K |
| Tenant voice overrides | `themes/<id>/voice-overrides.md` | ~1K (capped at 1.5K) |
| Tenant + shared block list | `registry.json` filtered | ~1K |
| Global rules summary | hand-rolled 8 bullets | ~0.5K |

Items NOT matching the resolved tenant are filtered out:

- Tenant blocks = items with `theme === <tenantId>` (canonical owner)
- Shared blocks = items with `theme === "shared"` (cross-tenant primitives)
- Other tenants' blocks are absent from the prompt regardless of `products[]`

When budget overflows, drop order: global summary → tenant block list → voice
overrides. Pinned blocks and per-repo scoped rules are never dropped.

### `getTenantContext` helper

For consumers (Hermes worker, dashboard, AI clients) that want tenant data
without building the full prompt:

```ts
import { getTenantContext, collectDashInfo } from "@dash/skill"

const info = await collectDashInfo(process.cwd())
const snapshot = info.ok ? info.snapshot : null
const { tenantId, theme, voiceOverrides, blocks, cardinalRules } =
  getTenantContext(snapshot, { explicit: "ride" })
```

### Migration from v2

v3 is fully additive. Existing v2 callers continue to work unchanged:

- `loadDashSkill()` with no `version` argument still defaults to **v2**.
- `composeV2Prompt` is preserved verbatim.
- The new `opts.tenantId` is ignored when `version !== 3`.
- `DashInfoSnapshot.detectedTenant` is optional — v1/v2 paths ignore it.

To opt a consumer in:

1. Bump call to `loadDashSkill({ version: 3 })`.
2. (Optional) Add `dashTheme` to `components.json` or run
   `dashkit init --theme ride` for a fresh repo.
3. (Optional) Provide `dsRoot` if your consumer project lives outside the
   `dash-ds` monorepo so the loader can find `themes/manifest.json`.

## Why a separate package

Keeping the skill out of `dash-cli` means:

- The CLI stays a pure tool, no AI coupling
- The skill can be versioned independently and pulled by tribe-config without forcing a CLI bump
- Tribe-specific overrides (Express vs Halo vs DS-internal) layer on top without touching the CLI
