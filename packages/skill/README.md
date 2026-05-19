# @dash/skill

> **STATUS: SCAFFOLD ONLY — Phase 2 work (post-pilot, week 3).**
> Current state = manifest + folder structure + stubbed entry points.
> Real prompt injection lands in the Phase 2 milestone. Do not publish, do not consume.

Claude Code skill that auto-activates inside any repository wired to the `@dash` registry and injects:

1. **Project state** — captured via `dash info --json` (framework, aliases, installed @dash items, custom hooks, API base URL)
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
│   ├── info-collector.ts  # Calls `dash info --json` via execSync
│   ├── prompt-builder.ts  # Composes captured context → AI prompt template
│   └── activate.ts        # Auto-activation predicate (CWD detection)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Phase plan

| Phase | When | What |
| --- | --- | --- |
| 1 (current) | pilot | Scaffold only. `dash info` plumbing in `dash-cli` v0.2.0 ready. |
| 2 | post-pilot, week 3 | Replace stub `src/index.ts` with real prompt assembly + caching layer |
| 3 | week 4+ | Glossary + anti-pattern detection + per-tribe overlays |

## Prereqs

- `dash` CLI ≥ 0.2.0 (provides `dash info --json`)
- Claude Code session with skill loader enabled

## Why a separate package

Keeping the skill out of `dash-cli` means:

- The CLI stays a pure tool, no AI coupling
- The skill can be versioned independently and pulled by tribe-config without forcing a CLI bump
- Tribe-specific overrides (Express vs Halo vs DS-internal) layer on top without touching the CLI
