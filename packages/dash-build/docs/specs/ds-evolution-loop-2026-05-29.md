# DS Evolution Loop — How Dash Build Grows the Design System

> Spec for how Dash Build participates in Dash DS growth without breaking the
> additive-only contract or fragmenting the library.
> Created 2026-05-29. Implements the "Design-System Evolution Loop" sketch in
> [`product-model.md:310`](../product-model.md) and the Layer decision tree in
> [`CLAUDE.md:18`](../../../../CLAUDE.md).

## Problem

The product owner's directive (Irfan, 2026-05-29):

> "jangan hanya dibatasi, karena kita akan membuat librarynya berkembang. kalau
> kita terlalu membuatnya kaku DS akan menjadi 1 doang dan ga akan berkembang
> mengikuti variant produk2 baru yang rilis nantinya."

Two failure modes bound the design space:

1. **Too rigid** — Dash Build is locked to today's ~94 atoms + 50 blocks + 70
   templates ([`ds-coverage-gap-2026-05-28.md`](../ds-coverage-gap-2026-05-28.md)).
   When Dash Travel, Marketplace, or a Trellis tenant launches, the builder
   either refuses or hands back off-system output. The DS stays "1 doang"
   (just one) and dies as the product family grows.
2. **Too loose** — every generation silently injects new components into
   Layer 1. Within months the registry forks into chaos, drift wins, and the
   "one DS, four products, N tenants, zero drift" promise of
   [`LAYERED-ARCHITECTURE.md:205`](../../../../LAYERED-ARCHITECTURE.md) is dead.

The synthesis is the **DS Evolution Loop**: the DS grows on purpose, through
three graded tiers of change, each with its own landing zone, validation, and
governance gate. The cardinal rule from [`CLAUDE.md:29`](../../../../CLAUDE.md)
— "this repo is purely ADDITIVE; existing production code is NEVER modified" —
holds across all three. Growth is *adding*, never *mutating*.

This spec defines the three tiers, how a run decides which tier it is in, the
candidate lifecycle for the heaviest tier, how it wires into mode-aware intake,
how DS coverage scoring feeds it, and the governance + phasing model.

---

## The Three Tiers

Ordered lightest → heaviest. The lighter the tier, the more it can be
automated; the heavier the tier, the stronger the human gate.

### Tier 1 — Layer 0 Token Swap (instant, no review)

**When.** The user wants a different accent color, radius, spacing feel, or
font — but the *components stay the same*. "Make the buttons orange." "Use
sharper corners." No new component is created; existing `@dash/ui` primitives
re-render against new token values.

**Mechanism.** Tier 1 never touches component source. It overrides the Layer 0
*semantic token values* that Layer 1 already consumes. In preview this lands as
CSS custom properties injected into the Sandpack template's `dash-tokens.css`
asset (served by [`preview.ts:65`](../../src/daemon/routes/api/preview.ts) and
read at [`component-preview.ts:487`](../../src/services/component-preview.ts)).
Sandpack hot-reloads; the live tree re-themes with no recompile. The override
maps onto the Layer 2 accent variables already defined in theme CSS — e.g.
`--theme-accent-base`, `--theme-accent-dark`, `--theme-accent-on`
([`themes/travel/colors.css:26`](../../../../apps/docs/registry/dash/themes/travel/colors.css)).

**Where it lands.** Preview-only by default (`dash-tokens.css` override in the
Sandpack `customSetup`, [`preview-mount.ts:254`](../../src/daemon/templates/client/preview-mount.ts)).
If the user wants the swap *persisted* for a product, it is no longer Tier 1 —
it becomes a Tier 2 theme manifest. Tier 1 is the ephemeral "try a color" loop.

**Validation.**

| Allowed in Tier 1 (auto) | Needs escalation |
|---|---|
| Accent value (`--accent-base` family) | Type ramp change → Layer 0 RFC ([`CLAUDE.md:23`](../../../../CLAUDE.md)) |
| Optional radius override | Spacing scale change → Layer 0 RFC |
| Density preset (compact/cozy/comfortable) | Motion curve change → Layer 0 RFC |
| Surface tint from accent scale | New semantic token tier → Layer 0 RFC |

Canonical default: Dash Purple `#5e2aac` remains the brand mark and ships as
`primaryBrand` in [`themes/manifest.json:5`](../../../../apps/docs/registry/dash/themes/manifest.json).
A token swap may change the per-product **accent** but must not introduce a
second purple (`#7C4FC4` is banned, [`CLAUDE.md:24`](../../../../CLAUDE.md)).
WCAG AA contrast on the new accent is validated before the swap is offered for
persistence (mirror the `wcag` block at
[`themes/travel/manifest.json:25`](../../../../apps/docs/registry/dash/themes/travel/manifest.json)).

**Example.** User: "buttons should be teal." Dash Build maps teal to a
`--theme-accent-*` scale, injects it into `dash-tokens.css`, hot-reloads the
Sandpack preview. No component, no candidate, no PR. If the user says "keep
this for our new kiosk product" → escalate to Tier 2.

### Tier 2 — Layer 2 New Theme Manifest (new product / tenant)

**When.** A new Dash product (Travel, Marketplace, Outsourcing) or a Trellis
tenant needs its own accent + voice register + density. This is the growth path
the owner directive is most about — "variant produk2 baru yang rilis nantinya."
[`LAYERED-ARCHITECTURE.md:87`](../../../../LAYERED-ARCHITECTURE.md) calls Layer 2
"the layer that bends."

**Mechanism.** Dash Build generates a new Layer 2 theme — the ~30-line delta
that is "the entire delta needed to rebrand"
([`LAYERED-ARCHITECTURE.md:96`](../../../../LAYERED-ARCHITECTURE.md)). It does
**not** fork Layer 0 or Layer 1. It produces a theme folder mirroring the
existing pattern at
[`apps/docs/registry/dash/themes/travel/`](../../../../apps/docs/registry/dash/themes/travel/):

- `manifest.json` — `name`, `title`, `layer: 2`, `primary: "#5e2aac"`, an
  `accent` block with `name` + `hex` + 50–950 `scale`, a `wcag` block, and an
  `audience` array (shape per
  [`themes/travel/manifest.json:1`](../../../../apps/docs/registry/dash/themes/travel/manifest.json)).
- `colors.css` — `--theme-accent-*` variables for `:root` and `.dark`
  ([`themes/travel/colors.css`](../../../../apps/docs/registry/dash/themes/travel/colors.css)).
- `typography.css` — optional ramp overlay deltas only.
- `voice-overrides.md` — **deltas only**, "Base voice = Layer 0," following the
  preserved/deltas split at
  [`themes/travel/voice-overrides.md`](../../../../apps/docs/registry/dash/themes/travel/voice-overrides.md).

It also appends one entry to the central
[`themes/manifest.json`](../../../../apps/docs/registry/dash/themes/manifest.json)
`themes[]` array (`name`, `title`, `accent`, `accentName`, `default: false`,
`audience`, `path`).

**Where it lands.** `apps/docs/registry/dash/themes/<theme>/` plus the central
manifest append. The theme is consumed via the `theme:` field that Layer 3
blocks already declare ([`LAYERED-ARCHITECTURE.md:102`](../../../../LAYERED-ARCHITECTURE.md))
and via `dash add button --theme <theme>`
([`LAYERED-ARCHITECTURE.md:167`](../../../../LAYERED-ARCHITECTURE.md)).

**Validation.**

- No raw hex anywhere except inside the theme's own accent scale + sanctioned
  carve-outs (external brand hex, `[stroke=…]` chart hooks per
  [`LAYERED-ARCHITECTURE.md:79`](../../../../LAYERED-ARCHITECTURE.md)).
- `primary` must equal `#5e2aac` — the brand mark is shared, only the accent
  diverges ([`LAYERED-ARCHITECTURE.md:139`](../../../../LAYERED-ARCHITECTURE.md)).
- `wcag` block must declare passing ratios for accent-on-white and
  white-on-accent at the chosen step (AA normal minimum).
- Theme metadata (`audience`, `voice` register) must be present — a theme with
  no declared voice/audience is rejected.
- Layer 0 + Layer 1 untouched — CI `dash audit` rejects any theme PR that edits
  a primitive ([`LAYERED-ARCHITECTURE.md:176`](../../../../LAYERED-ARCHITECTURE.md)).

**Example.** "Spin up a theme for Dash Travel." Dash Build emits
`themes/travel/` (ocean-blue `#0284c7`, mixed voice with reassuring cadence +
softened ETA language, traveller/booking-ops audience), validates WCAG 4.55+,
appends the manifest entry, opens a PR. Every Layer 1 primitive and every
shared Layer 3 block immediately works under the new theme — zero component
changes. This is "one DS, N products" in action: the library *grew* to serve a
new variant by adding 30 lines, not by forking.

### Tier 3 — Layer 1 New Component Variant (candidate lane)

**When.** Generation needs a UI pattern that does **not** exist in the
registry, and it cannot be composed cleanly from existing atoms — e.g. the
`BulkActionBar`, `DiffView`, `ComparisonTable` gaps at the top of the coverage
report ([`ds-coverage-gap-2026-05-28.md`](../ds-coverage-gap-2026-05-28.md)
"Top 10 missing components").

**Rule — do NOT silently add to Layer 1.** This is the loose-mode failure
guard. The pipeline runs the loop from
[`product-model.md:314`](../product-model.md):

1. **Reuse first.** Try existing foundation → component → block. The
   prompt-composer already biases the model this way: "ALWAYS prefer `import {
   X } from "@dash/ui"` over raw HTML"
   ([`prompt-composer.ts:662`](../../src/skills/prompt-composer.ts)). `dash
   search <name>` runs before any custom build ([`CLAUDE.md`](../../../../CLAUDE.md)
   "When generating code" step 1).
2. **If coverage is missing, mark output as `DS gap`.** When the model falls
   back to raw HTML it must annotate: "DS atom gap — candidate for registry"
   ([`prompt-composer.ts:681`](../../src/skills/prompt-composer.ts)).
3. **If a reusable primitive/composite emerges, mark it
   `component candidate` or `block candidate`** with the candidate record:
   `{ type, name, theme, runId, reason, status }`
   ([`product-model.md:331`](../product-model.md)).
4. **Route to a review lane** before any docs/registry promotion. No
   auto-promote.

**Candidate fields** (from [`product-model.md:331`](../product-model.md)):

| Field | Values / meaning |
|---|---|
| `type` | `component` (Layer 1 atom) \| `block` (Layer 3 composite) |
| `name` | parsed component name (e.g. `bulk-action-bar`) |
| `theme` | `shared` for Layer 1; `<product>` for Layer 3 |
| `runId` | the generation run that produced it |
| `reason` | why no existing atom covered it (the gap note) |
| `status` | `candidate` \| `approved` \| `rejected` \| `one_off` |

**Where it lands.** On creation: persisted as a candidate record attached to
the run — **not** written to `registry.json`. Only on `approved` does it follow
the "Add new component to DS" workflow at
[`CLAUDE.md:129`](../../../../CLAUDE.md): build under
`registry/dash/{ui,blocks}/<name>.tsx` → register in `registry.json` → add doc
page → `pnpm registry:build` → `dash audit` clean.

**Validation.** Same as any DS contribution: no banned imports, no raw hex
(Layer 1 carve-outs per [`LAYERED-ARCHITECTURE.md:79`](../../../../LAYERED-ARCHITECTURE.md)),
tokens only, audit trail for legal/financial fields. A Layer 1 candidate must
be theme-neutral (`theme: "shared"`) and consume only Layer 0 tokens — a
candidate that hard-codes an accent is rejected at the lane, not promoted.

**Example.** Prompt 9 (comparison table, 45% coverage) finds no
`ComparisonTable`. Dash Build composes a best-effort version from `table` +
`combobox` + `badge`, marks it `DS gap`, and emits a `block candidate`
`{ type: "block", name: "comparison-table", theme: "shared", runId,
reason: "no tabular two-entity compare; lowest-coverage prompt", status:
"candidate" }`. The feature ships for the user as a one-run composition; the
candidate waits in the lane for a DS maintainer.

---

## Tier Decision Tree

A generation run picks exactly one tier per change:

```
START: what does the run need?
│
├─ Only token values differ (color / radius / density / font),
│   components unchanged, ephemeral?
│      └─► TIER 1  — inject into dash-tokens.css, hot-reload, no persist
│
├─ A whole product / tenant needs its own accent + voice + density,
│   persisted, reusing all primitives?
│      └─► TIER 2  — generate themes/<name>/ + manifest append, PR
│
├─ A UI pattern is needed that no existing atom/block covers,
│   AND cannot be cleanly composed?
│      ├─ reuse possible?      ──► compose from @dash/ui, NO candidate
│      └─ reuse impossible?    ──► TIER 3 — DS gap + candidate record → lane
│
└─ Touching type ramp / spacing scale / motion / token tier?
       └─► NOT a tier — Layer 0 RFC. Stop and ask. ([CLAUDE.md:23])
```

Cross-tier: a single feature can trigger more than one tier (e.g. new product =
Tier 2 theme **and** Tier 3 candidates for missing product blocks). Each change
is recorded independently.

---

## Candidate Lifecycle & States

```
            (generation finds gap, emits reusable pattern)
                            │
                            ▼
                    ┌──────────────┐
                    │  candidate   │  persisted on run, NOT in registry
                    └──────┬───────┘
          DS maintainer review (Surface 1 / Surface 3)
            ┌───────────────┼───────────────┐
            ▼               ▼                ▼
      ┌──────────┐   ┌──────────┐     ┌──────────┐
      │ approved │   │ rejected │     │ one_off  │
      └────┬─────┘   └──────────┘     └──────────┘
           │           (not reusable)   (used once,
           ▼            archived)         never promoted —
  promote: registry +                     keep run output,
  doc page + registry:build               drop from queue)
           │
           ▼
   becomes Layer 1 atom (theme: shared)
   or Layer 3 block (theme: <product>)
```

- **candidate** — default on emit. Lives with the run; invisible to consumer
  repos.
- **approved** — promoted via the [`CLAUDE.md:129`](../../../../CLAUDE.md) add-
  component workflow. Becomes a real Layer 1 / Layer 3 registry entry.
- **rejected** — not reusable / duplicate / off-foundation. Archived with
  reason; the feature still shipped as one-run output.
- **one_off** — genuinely single-use (a bespoke layout). The output stays in
  the user's PR; the candidate is dropped from the promote queue so the registry
  stays clean.

**Who approves.** A DS maintainer, via the Surface 1 *DS Gap Inbox* +
*Promote Queue* ([`master-plan-2026-05-25.md:153`](../master-plan-2026-05-25.md))
and the Surface 3 *DS Candidate Queue* where `OwnerAI` ranks by reusability
([`master-plan-2026-05-25.md:225`](../master-plan-2026-05-25.md),
[`:238`](../master-plan-2026-05-25.md)). Ranking is implemented as the
`DSCandidateRanker` — score = `crossRepoCount*10 + min(complexity,5) +
domainNeutralityBonus`; the cross-repo-recurrence signal drives priority
([`ds-candidate-ranker.ts:10`](../../src/owner/ai/ds-candidate-ranker.ts)).

**P2 reality.** Surfaces 1 + 3 are P2 (not yet built). Until then the loop runs
in **flag-and-persist** mode: Dash Build emits the candidate record, persists it
on the run, surfaces the gap note in the run explanation, and a human reviews
later. The `WorkerClient` promote path
([`worker-client.ts:9`](../../src/bridge/worker-client.ts)) currently returns
`501 not_implemented` — promotion is human-driven for now.

---

## Integration with Mode-Aware Intake

The loop is **mode-aware**, not mode-exclusive:

| Mode | Tier behavior |
|---|---|
| **design-system mode** | Primary trigger. Tier 1 token swaps + Tier 2 theme generation are first-class; Tier 3 candidates route to the lane. This is where DS growth is the *point*. |
| **existing-repo mode** | Generation targets a consumer repo, but a `DS gap` discovered mid-build still emits a Tier 3 candidate (cross-repo recurrence is the strongest promotion signal — see ranker). Tokens stay read-only from the repo's theme. |
| **blank mode** | Same as existing-repo: gaps surface as candidates; the new app picks an existing theme or triggers Tier 2 if it is a new product. |

All three modes feed the **same** candidate store, which is what makes
`crossRepoCount` meaningful — a pattern that shows up in design-system mode
*and* two consumer repos ranks higher than one seen once. Intake persists answers
into PRD/TRD context so later stages do not re-ask
([`CLAUDE.md`](../../../../CLAUDE.md) "When user asks for a new feature").

---

## DS Coverage Scoring as a Gap Signal

The foundation match score (0–100, [`types.ts:40`](../../src/bridge/types.ts))
is computed from the DS-import ratio in
[`validator.ts:82`](../../src/skills/validator.ts):
`ratio = dsImports / max(1, rawHtmlElements)` over UI-shaped files
(`measureDSCoverage`). High raw-HTML count on a UI-shaped prompt
(`isUiShapedPrompt`, [`validator.ts:114`](../../src/skills/validator.ts)) means
the model fell back to hand-rolled markup.

The insight: **a low foundation score on a UI prompt is not always bad output —
it can be a DS gap signal.** Decision rule:

- Low score **+** banned imports / raw hex → bad output, regenerate.
- Low score **+** clean tokens **+** UI-shaped prompt **+** model annotated
  "DS atom gap" → likely a *real coverage gap* → emit Tier 3 candidate rather
  than just penalizing the run.

This routes the 73.5% average coverage
([`ds-coverage-gap-2026-05-28.md`](../ds-coverage-gap-2026-05-28.md) roll-up)
upward over time: the components the builder keeps hand-rolling (BulkActionBar,
DiffView, ComparisonTable) are exactly the ones the ranker surfaces for
promotion. Auto-merge stays gated — score below threshold blocks auto-merge
([`end-to-end-flow.test.ts:291`](../../src/__tests__/integration/end-to-end-flow.test.ts)).

---

## Governance

`design.md` is an **active contract**, not passive reference
([`product-model.md:340`](../product-model.md)): it governs builder shell
density, status communication, token use, and anti-pattern avoidance in both
generated UI and the builder UI itself. Any pattern Dash Build introduces that
is not represented in the active design contract or docs coverage is a tracked
governance gap.

| Action | Auto | Human gate |
|---|---|---|
| Tier 1 token swap (preview, ephemeral) | ✅ auto | — |
| Tier 1 persisted as Layer 0 RFC item | — | ✅ Head of Design RFC |
| Tier 2 theme manifest generation | ✅ generate + validate | ✅ PR review (DS) |
| Tier 3 candidate emit + persist | ✅ auto | — |
| Tier 3 candidate → registry promotion | — | ✅ DS maintainer (OD-4) |
| Layer 0 ramp/spacing/motion change | — | ✅ Layer 0 RFC, stop and ask |

CI `dash audit` is the backstop on every PR: rejects hard-coded accent hex in
Layer 1, blocks installed under wrong theme, manifests missing required tokens,
and banned imports ([`LAYERED-ARCHITECTURE.md:176`](../../../../LAYERED-ARCHITECTURE.md)).

---

## Phasing (P0 / P1 / P2)

| Phase | Scope | Buildable where |
|---|---|---|
| **P0 — now, local** | Tier 1 token swap in Sandpack preview (`dash-tokens.css` inject). Tier 3 `DS gap` annotation + candidate record `{type,name,theme,runId,reason,status}` persisted on run. Foundation score → gap-signal heuristic. | Daemon + validator + prompt-composer (all exist). |
| **P1 — near-term** | Tier 2 theme-manifest generator (emit `themes/<name>/` + central manifest append + WCAG validation), PR via GitHub App. `DSCandidateRanker` scoring wired to a local candidate list view. | `ds-candidate-ranker.ts` exists; needs generator + route. |
| **P2 — needs surfaces** | Surface 1 *DS Gap Inbox* + *Promote Queue*; Surface 3 *DS Candidate Queue* with OwnerAI ranking + one-click approve → Surface 1 docs push. `WorkerClient` promote route (currently 501). Full human-in-the-loop promotion UI. | Blocked on Surface 1 + 3 build. |

Until P2, the loop runs **flag-and-persist**: candidates are recorded and
surfaced in run output; a human reviews and promotes manually through the
[`CLAUDE.md:129`](../../../../CLAUDE.md) workflow.

---

## Non-Goals

- **No auto-promotion of candidates to Layer 1/3 without human review.** OD-4 /
  the owner directive both require a human gate. Dash Build flags and persists;
  it never writes `registry.json` autonomously.
- **No touching Layer 0** (type ramp, spacing scale, motion curves, token tiers)
  without a Layer 0 RFC. Tier 1 swaps the *accent/density* surface, never the
  ramp ([`CLAUDE.md:23`](../../../../CLAUDE.md),
  [`LAYERED-ARCHITECTURE.md:211`](../../../../LAYERED-ARCHITECTURE.md)).
- **No forking Layer 1 per product.** New products get a Tier 2 theme, not a
  copy of the primitives ([`LAYERED-ARCHITECTURE.md:19`](../../../../LAYERED-ARCHITECTURE.md)).
- **No second brand purple.** `#5e2aac` only; `primaryBrand` shared across all
  themes ([`CLAUDE.md:24`](../../../../CLAUDE.md)).
- **No silent raw-HTML acceptance.** A DS gap must be annotated and turned into
  a candidate, not buried in the diff.

---

## See also

- [`product-model.md:310`](../product-model.md) — Design-System Evolution Loop +
  design.md as active governance
- [`LAYERED-ARCHITECTURE.md`](../../../../LAYERED-ARCHITECTURE.md) — 4-layer model,
  theme structure, CI contract
- [`CLAUDE.md:18`](../../../../CLAUDE.md) — Layer decision tree, cardinal rules,
  add-component workflow
- [`ds-coverage-gap-2026-05-28.md`](../ds-coverage-gap-2026-05-28.md) — 73.5%
  coverage, top missing components
- [`master-plan-2026-05-25.md:146`](../master-plan-2026-05-25.md) — Surface 1
  DS Gap Inbox / Promote Queue; Surface 3 DS Candidate Queue
- [`component-preview-architecture-2026-05-28.md`](./component-preview-architecture-2026-05-28.md)
  — Sandpack preview + token injection
