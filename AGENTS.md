# AGENTS.md — Dash Design System Agent Rules

> Loaded by AI agents (Claude Code, Cursor, Hermes, OpenClaw, Codex) operating on `/dash-ds/`. Complements `CLAUDE.md` (which is Claude-Code-specific) with rules that apply to ALL generation agents — including remote workers that don't read CLAUDE.md.

## Theme-aware generation

Every generated block, template, or pattern MUST carry theme metadata. The Dash platform serves 4+ products plus N Trellis tenants; an untagged block is undeployable.

### Defaults

- **New atom-level primitives** (Button, Input, …) default to `theme: "shared"` and live under `registry/dash/ui/`.
- **New composites tied to a product workflow** must declare `theme: "<product>"` matching one of `ride`, `logistic`, `travel`, `marketplace`, `outsourcing`, or `trellis-{tenantId}`.
- **When in doubt → `theme: "shared"`.** A shared block can be promoted to product-specific later; the reverse forces a rename.
- **Global UI character comes from [`design.md`](./design.md).** Use it as the cross-repo contract for layout density, token usage, component behavior, and anti-patterns before applying repo-specific stack rules.

### Registry entry

Generated blocks MUST register in `apps/docs/registry.json` with a `theme` field:

```json
{
  "name": "logistic-route-planner",
  "type": "registry:block",
  "theme": "logistic",
  "files": [{ "path": "registry/dash/blocks/logistic/route-planner.tsx", "type": "registry:component" }],
  "dependencies": ["button", "select", "map"]
}
```

The `dash audit` CI gate rejects:

- Missing `theme` field on block/template entries
- Hard-coded accent hex (e.g. `#5e2aac`) inside Layer 1 primitives — accent must come from `--accent-base` token
- Banned external imports (see `registry/rules/dash-ai-rules.md` § Banned Imports)
- Layer 3 block consumed under a mismatched theme in a downstream repo

## Hermes worker — theme routing

The Hermes generation worker reads `gap.repo` from the incoming Gap entry and maps the consumer repo to a theme:

```
portal-v2          → theme: "ride"
backoffice         → theme: "ride"
basecamp           → theme: "ride"        (Q3 2026: split per-product)
react-fleet        → theme: "logistic"
dash-travel-fe     → theme: "travel"      (planned)
dash-marketplace   → theme: "marketplace" (planned)
<trellis-tenant>   → theme: "trellis-{tenantId}"
```

Generated output inherits the resolved theme. If a worker can't resolve the repo → theme mapping, it MUST fall back to `theme: "shared"` and surface the ambiguity in the PR description rather than guessing.

## Layered Architecture — do not violate

Agents MUST respect the layer boundaries documented in [`LAYERED-ARCHITECTURE.md`](./LAYERED-ARCHITECTURE.md):

- **Layer 0** (foundation tokens, type ramp, motion) is **locked**. Do not generate new entries. If a generation appears to require a Layer 0 change, stop and surface the request — Head of Design owns this layer.
- **Layer 1** (primitives) is **shared and stable**. New atoms allowed only if not already present (`dash search <name>` first). Never hard-code brand color.
- **Layer 2** (theme manifest) — generate when onboarding a new product or Trellis tenant. ~30 lines. Use `registry/dash/themes/trellis-template.ts` as the scaffold.
- **Layer 3** (workflow blocks) — primary generation surface for product features. Declare `theme:` correctly.

## Existing Dash production code

`/Users/irfanprimaputra.b/Dash/*` repos are **READ-ONLY** references for any agent. Distill patterns into new DS entries under `registry/dash/`; never edit production directly.

## Dash Build planning workflow

Dash Build adopts a gstack-inspired artifact pipeline. Agents should not jump
from rough prompt directly to generation when context is missing.

Required sequence for non-trivial Dash Build work:

```
dash-intake -> dash-prd -> dash-design-review? -> dash-trd -> generation -> dash-review -> dash-qa
```

- Use [`packages/dash-build/docs/context-intake.md`](./packages/dash-build/docs/context-intake.md) to normalize casual/messy user prompts and decide whether to ask.
- Use [`packages/dash-build/docs/artifact-contracts.md`](./packages/dash-build/docs/artifact-contracts.md) for PRD, design, TRD, QA, and review artifact requirements.
- Use [`packages/dash-build/docs/skill-routing.md`](./packages/dash-build/docs/skill-routing.md) to decide which planning/review skill should run.
- Use [`packages/dash-build/docs/qa-and-review.md`](./packages/dash-build/docs/qa-and-review.md) before marking generated output done.

## See also

- [`CLAUDE.md`](./CLAUDE.md) — repo-level rules and Claude-Code-specific workflows
- [`design.md`](./design.md) — global cross-repo design contract for AI generation
- [`packages/dash-build/docs/gstack-adoption.md`](./packages/dash-build/docs/gstack-adoption.md) — Dash Build planning workflow adopted from gstack principles
- [`LAYERED-ARCHITECTURE.md`](./LAYERED-ARCHITECTURE.md) — full architecture spec
- [`apps/docs/registry/rules/dash-ai-rules.md`](./apps/docs/registry/rules/dash-ai-rules.md) — per-repo stack mandates, banned imports
- [`apps/docs/registry/rules/dash-domain-glossary.md`](./apps/docs/registry/rules/dash-domain-glossary.md) — entities, table names, state machines
- [`apps/docs/AGENTS.md`](./apps/docs/AGENTS.md) — Next.js 16 specifics for docs app
