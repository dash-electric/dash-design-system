# Mode-Aware Intake — 2026-05-29

> Status: Draft — spec only. No code wired yet.
> Owner: Dash Build daemon team.
> Builds on: `be-aware-intake-2026-05-28.md` (scenario classifier), `product-model.md`
> (modes, First-Run Journey, Preview Model), `context-intake.md` (clarification gate
> + question budget), `LAYERED-ARCHITECTURE.md` (Layer 0/1/2/3).

---

## TL;DR

Dash Build classifies every prompt into a *scenario* (`fe_only`, `update_existing`,
`extend_fe_be`, `extend_fe_be_db`, `new_product`, `ambiguous` — see
`scenario-classifier.ts:20`). It does **not** yet have a notion of the **project
mode** the prompt lives in. Scenario answers *"what kind of change is this prompt?"*.
Mode answers *"what kind of project are we building in?"* — and that question must be
settled **before** generation because it drives clone behaviour, preview type, and
output shape.

Today the clone path is gated on `if (input.repo)` at `orchestrator.ts:379`. That is
the right *principle* (clone is about the project, not the prompt), but `repo` is an
implicit flag, not an explicit concept. The result: when no repo is wired, every
prompt is treated like a blank standalone Sandpack render — even improvements to a
real Dash surface. That is the trust bug: the user sees a generic sandbox card
instead of their real app, and stops believing the output reflects reality.

This spec introduces an explicit **project mode** (`existing-repo` |
`blank-product` | `design-system`), a **mode detector** that sits *above* the
scenario classifier, and a **mode-clarification gate** that reuses the existing inline
question-card mechanism. Mode then flows down through the planning pipeline:
clarify mode → freeze a clear context pack → (PRD if scope is big) → (TRD if needed) →
UI/code.

---

## 1. Problem statement

`Project.mode` already exists in the data model (`product-model.md:49`:
`existing-repo | blank-product | design-system`) but nothing in the pipeline reads it.
The orchestrator infers behaviour from the presence of `input.repo` alone:

- `submitPrompt` kicks `ensureWorkspaceBootstrap(input.repo)` only when `input.repo`
  is truthy (`orchestrator.ts:379-380`).
- `runIntake` scans the repo at `repoPath` and classifies the prompt
  (`orchestrator.ts:1337`), but has no concept of *why* this repo is in scope.

Consequences of the missing concept:

1. **Trust collapse.** A prompt that improves `backoffice` with no repo wired renders
   as a standalone Sandpack component — the user never sees their real app as a
   baseline, so the change looks ungrounded. `product-model.md:206` warns: *"never
   show a blank canvas as success."*
2. **Wrong preview routing.** Existing-repo work wants iframe baseline + overlay;
   blank work wants Sandpack standalone; DS work wants Sandpack + a token-swap panel.
   One code path cannot serve all three.
3. **Scenario carries mode weight it should not.** A `new_product` scenario is being
   read as "this is a from-scratch product", when it can equally mean "a brand-new
   *surface* inside an existing repo". `reconcileScenario()` (`chain.ts:67`) already
   patches one half of this; mode makes the intent explicit instead of inferred.

---

## 2. The three modes

| Mode | Definition | When it applies | Example |
|---|---|---|---|
| `existing-repo` | Improve a real Dash repo. Has `repoFullName` + `localRepoPath`. | User picked a repo, or the prompt names a surface that resolves to a real file. | "Tambahin tab Delivery di detail mitra (backoffice)" |
| `blank-product` | Build a brand-new product from scratch. Nothing exists yet. | No repo wired AND prompt signals from-scratch intent. | "Bikin produk baru buat booking lapangan futsal dari nol" |
| `design-system` | Evolve the DS itself — swap foundation, add theme, propose a variant. | Prompt targets tokens/theme/foundation in a DS context. | "Ganti accent jadi teal buat tenant travel baru" |

### `existing-repo`

System **clones** the repo into `~/Work/dash-build-clones/<repoSlug>/`
(`workspace.ts:5`), applies the **preview-shim** to strip auth/secrets
(`preview-shim.ts` — e.g. `BACKOFFICE_SHIM_V3` swaps the NextAuth/Firebase auth
module for a stub), boots the real dev server (`startDevServer`,
`workspace.ts:48`), and shows the **real app** in an iframe as the baseline. The
scenario classifier runs and `reconcileScenario()` (`chain.ts:67`) demotes a false
`new_product` to `extend_fe_be` once existing FE files resolve.

### `blank-product`

**No clone** — there is nothing to clone. Preview is **Sandpack standalone**: a
single component inside a Dash-DS-tokened sandbox. **Decision (locked):** explore in
Sandpack first; repo creation comes **later**, not auto-scaffolded per prompt
(`product-model.md:166` — "no GitHub required yet"). `new_product` is the **correct**
scenario here.

### `design-system`

Components from `@dash/ui` are used as-is; the user swaps the **foundation**.
**Decision (locked):** do not make this rigid — the DS must *grow* with new product
variants (travel, marketplace, trellis tenants). Three tiers of evolution, detailed in
§9.

---

## 3. Mode vs Scenario — the two-axis model

These are orthogonal. **Mode is set once per project** and persists across threads.
**Scenario is computed per prompt**. Mode decides clone/preview/output shape; scenario
decides which BE/DB context blocks the composer injects.

| Project mode → / Prompt scenario ↓ | `existing-repo` | `blank-product` | `design-system` |
|---|---|---|---|
| `fe_only` | patch FE file in clone | new component in Sandpack | token/variant tweak |
| `update_existing` | patch resolved file | n/a (nothing to update) | edit existing theme |
| `extend_fe_be` | new FE + extend BE in repo | n/a | n/a |
| `extend_fe_be_db` | new FE + BE + migration in repo | deferred (no BE yet) | n/a |
| `new_product` | **new surface inside repo** (still clone) | from-scratch product | new theme manifest |
| `ambiguous` | clarify scenario | clarify scenario | clarify tier |

The cell that matters most: **`new_product` × `existing-repo`** — a brand-new module
added to `backoffice` is a `new_product` *scenario* but an `existing-repo` *mode*, so
it **still clones** to stay consistent with the repo's nav/shell. This is exactly the
case `reconcileScenario()` was written to catch (`chain.ts:52-64`).

---

## 4. Mode detector

A new read-only module, `src/intake/mode-detector.ts`, runs **before**
`classifyPrompt`. Side-effect-free, degrades gracefully (no signal → `ambiguous`).

```typescript
export type ProjectMode = "existing-repo" | "blank-product" | "design-system"

export interface ModeDetectionResult {
  mode: ProjectMode | "ambiguous"
  confidence: number       // 0..1
  reasoning: string
  needsClarify?: string     // populated only when ambiguous
}

export interface ModeDetectionContext {
  selectedRepo: string | null       // from the repo dropdown / project.repoFullName
  resolvedFiles: string[]           // FE files the prompt resolves to (may be [])
  projectModeHint?: ProjectMode     // persisted Project.mode if already known
}

export function detectMode(
  prompt: string,
  ctx: ModeDetectionContext,
): ModeDetectionResult
```

### Heuristics (precedence order)

| # | Signal | Result | Confidence | Ask? |
|---|---|---|---|---|
| 0 | `projectModeHint` already set on the project | that mode | 1.0 | no |
| 1 | `selectedRepo` present (picked in dropdown) | `existing-repo` | 0.95 | no |
| 2 | prompt names a surface/route that resolves to a real file (`resolvedFiles.length > 0`) | `existing-repo` | 0.85 | no |
| 3 | prompt says "from scratch / dari nol / new product / produk baru" AND no repo | `blank-product` | 0.75 | confirm |
| 4 | prompt mentions "ganti warna/theme/foundation/token" or "design system" in a DS context | `design-system` | 0.75 | confirm |
| 5 | bare prompt, no repo, no strong signal | `ambiguous` | 0.3 | **ask 1** |

Rule 1 is decisive: **if the user already picked a repo, mode is clear — do not ask.**
Rule 2 piggybacks on the same existing-file resolution that `reconcileScenario()`
already consumes (`chain.ts:75`), so the detector and the reconciler agree by
construction.

### Pseudocode

```
detectMode(prompt, ctx):
  if ctx.projectModeHint: return { mode: hint, confidence: 1.0, reasoning: "persisted" }
  if ctx.selectedRepo:    return { mode: "existing-repo", confidence: 0.95, no-ask }
  if ctx.resolvedFiles.length > 0:
                          return { mode: "existing-repo", confidence: 0.85, no-ask }
  if matchesDsSignal(prompt):
                          return { mode: "design-system", confidence: 0.75, confirm }
  if matchesBlankSignal(prompt) and !ctx.selectedRepo:
                          return { mode: "blank-product", confidence: 0.75, confirm }
  return { mode: "ambiguous", confidence: 0.3,
           needsClarify: "Where should this live?" }
```

DS-signal and blank-signal lexicons are bilingual (EN + ID), mirroring the existing
`GREENFIELD_KEYWORDS` / `NEW_ADDITION_KEYWORDS` style in
`scenario-classifier.ts:104,138`.

---

## 5. Mode-clarification gate

### When to ask vs skip

Respect the **question budget** from `context-intake.md`: **0 questions when mode is
clear, 1 when there is exactly one genuine ambiguity.** Concretely:

- Heuristic 0/1/2 (confidence ≥ 0.85) → **skip**. Mode is clear; never ask.
- Heuristic 3/4 (confidence 0.75) → optional single confirm, framed with a default
  pre-selected (the PM-not-interrogation rule, `context-intake.md:71-78`).
- Heuristic 5 (`ambiguous`, < 0.5) → **ask exactly one question**.

### The question (and only mechanism)

**Reuse the existing clarification gate** — the inline question card already rendered
in the chat thread for scenario-`ambiguous` and `needsClarify` today
(`scenario-classifier.ts:481-497`). **Do not invent a new UI.** The mode question is
just another card in the same lane:

> **Where should this live?**
> - **Existing repo** — improve a Dash app you already have (we'll clone it and show
>   the real screen). *(default if any repo is connected)*
> - **New product** — start something brand-new in a sandbox.
> - **Design exploration** — change colors, theme, or the design system itself.

Options are outcome-framed with a sensible default, exactly as
`context-intake.md:71-78` requires ("offer recommended default when obvious… explain
the consequence in one sentence"). The answer is persisted onto `Project.mode` and
into the context pack so later stages never re-ask.

---

## 6. Clone gating

**Clone is gated by `mode === "existing-repo"`, NOT by prompt scenario.** This
formalises the `if (input.repo)` principle at `orchestrator.ts:379` — the presence of
a repo *is* the existing-repo signal, mode just names it.

| Mode | Clone? | Preview type | Scenario-reconcile? |
|---|---|---|---|
| `existing-repo` | **yes** — `ensureWorkspaceBootstrap(repo)` | iframe baseline + overlay | **on** (`reconcileScenario` runs) |
| `blank-product` | no | Sandpack standalone | off (`new_product` is correct, never demoted) |
| `design-system` | no | Sandpack + token-swap panel | off |

Key invariant: a `new_product` *scenario* inside `existing-repo` mode **still clones**
(top-left cell of the matrix in §3). Clone follows mode; reconcile then corrects the
scenario once files resolve.

The bootstrap remains best-effort and non-blocking (`orchestrator.ts:381-394` caps the
wait at 5 s and swallows failures) — mode-gating changes *whether* we kick it, not its
failure semantics.

---

## 7. Preview routing per mode

| Mode | Preview pipeline |
|---|---|
| `existing-repo` | **iframe baseline + overlay.** Clone → shim → dev server → iframe shows the real app (Baseline Preview, `product-model.md:189`). Generated change overlays via the Generated/Patch preview layers (`product-model.md:194,200`). |
| `blank-product` | **Sandpack standalone.** Single component mounted in a Dash-DS-tokened template with mock fixtures (the post-2026-05-28 default per `CLAUDE.md` / `component-preview-architecture-2026-05-28.md`). No clone, no iframe. |
| `design-system` | **Sandpack + token-swap panel.** Same Sandpack mount, plus a live controls panel that re-renders on Layer 0 token edits (accent / radius / spacing / font). |

When the existing-repo iframe cannot mount (deps missing, dev server failed), fall back
to the Patch Preview card with file list + score + reason — never a blank canvas
(`product-model.md:206`).

---

## 8. Context pack → PRD → TRD → UI/code flow

The point (Irfan's framing): *"biar context kebentuk jelas, terus bisa diturunkan ke
PRD dan TRD jika dibutuhkan, baru diturunkan ke UI dan code."* Mode is the first thing
clarified so everything downstream inherits a clear frame.

```
prompt
  ↓ detectMode()                         ← NEW, sits above the classifier
  ↓ mode-clarification gate (ask 0/1)    ← reuses existing question card
  ↓ persist Project.mode + freeze Context Pack (product-model.md:110)
  ↓ classifyPrompt() + reconcileScenario()  (mode decides if reconcile runs)
  ↓ PRD   — only when scope is big (dash-prd skill)
  ↓ TRD   — only when BE/DB/migration touched
  ↓ Skill v4 + Codex → UI/code
  ↓ preview routed per §7
```

Mode is written into the Context Pack so PRD/TRD generation, design loading, and the
prompt composer all read one frozen answer rather than re-detecting
(`context-intake.md:78`: "persist answers… so later stages do not ask again").

---

## 9. Design-system mode detail — the 3-tier evolution

DS mode must **grow** the library, not freeze it. Per the Design-System Evolution Loop
(`product-model.md:310-339`) and the layered model (`LAYERED-ARCHITECTURE.md`):

| Tier | What changes | Layer | Behaviour | Speed |
|---|---|---|---|---|
| **(a) Token swap** | accent / radius / spacing / font | Layer 0 tokens (consumed downstream) | instant — re-render Sandpack with new token values | instant |
| **(b) New theme manifest** | a new tenant/product theme | Layer 2 | add a manifest under `registry/dash/themes/<name>/` (see `ds-layer-2-theme-runtime-plan-2026-05-28.md`) | minutes |
| **(c) New component variant** | a new Layer 1 variant | Layer 1 | **does NOT silently mutate Layer 1** — enters the **DS-candidate review lane** | gated |

### The candidate lane (tier c)

Per the cardinal **additive-only** rule (`CLAUDE.md` rule 1) and the Layered decision
tree (Layer 1 changes require care), a proposed variant never mutates `@dash/ui`
in place. It becomes a candidate and walks the states from
`product-model.md:324-338`:

```
candidate ──approve──▶ approved ──promote──▶ registry (Layer 1)
    │
    └──reject──▶ one_off   (stays a feature-local component, never promoted)
```

Candidate record fields (`product-model.md:331-338`): `type` (`component | block`),
`name`, `theme`, `runId`, `reason`, `status`. This respects additive-only while
letting the library grow — token swaps and new themes flow fast; new shared primitives
go through review.

---

## 10. Edge cases

1. **`new_product` scenario inside an existing repo.** Mode = `existing-repo` (repo
   selected) wins → still clone. Scenario stays `new_product` until
   `reconcileScenario()` resolves existing FE files and demotes to `extend_fe_be`
   (`chain.ts:67`). New module lands consistent with repo nav/shell.
2. **User switches repo mid-thread.** Mode re-detects (heuristic 1 fires on the new
   `selectedRepo`). New repo ⇒ new clone target; the thread's context pack is
   re-frozen and the baseline iframe re-boots against the new clone.
3. **Blank, then wants to save as a repo.** Start `blank-product` (Sandpack, no
   clone). Repo creation is **deferred** (§2 decision). When the user explicitly opts
   to persist, the project flips to `existing-repo`, the scaffolded code is committed
   to a new repo, and subsequent prompts clone it like any other existing repo.
4. **DS prompt with a repo selected.** Heuristic 1 would say `existing-repo`, but a
   strong DS signal (heuristic 4) competes. Resolve by asking the single confirm
   question — do not silently pick. (DS work *can* happen inside the `dash-ds` repo;
   the confirm disambiguates "edit DS" vs "use DS in this app".)

---

## 11. Implementation plan

**New:**

1. `src/intake/mode-detector.ts` — `detectMode()` + bilingual lexicons + tests
   (mirror the hermetic, side-effect-free style of `scenario-classifier.ts`).
2. Wire `detectMode()` in `orchestrator.ts` **before** `runIntake` (currently called
   at `orchestrator.ts:862`), passing `selectedRepo` + resolved files.
3. Replace the implicit `if (input.repo)` clone gate (`orchestrator.ts:379`) with an
   explicit `if (mode === "existing-repo")` gate (repo presence still feeds the mode
   detector, so behaviour is preserved for the common case).
4. Mode-clarification card — render via the **existing** clarify-gate component used
   for scenario `needsClarify` (`scenario-classifier.ts:496`); no new UI.
5. Persist resolved mode onto `Project.mode` + into the Context Pack.

**Already built (reuse, do not rebuild):**

- `Project.mode` field (`product-model.md:49`).
- Scenario classifier + `reconcileScenario()` (`scenario-classifier.ts`, `chain.ts:67`).
- Clone + shim + dev-server workspace (`workspace.ts`, `preview-shim.ts`).
- Sandpack standalone preview (`component-preview-architecture-2026-05-28.md`).
- Clarification gate mechanism + question budget (`context-intake.md`).
- Layer 2 theme manifests + candidate states (`ds-layer-2-theme-runtime-plan-2026-05-28.md`, `product-model.md:324`).

**Deferred:** see §12.

---

## 12. Non-goals / deferred

- **Auto-scaffold a blank repo per prompt.** Blank stays Sandpack-only; repo creation
  is an explicit later step (§2, §10.3).
- **Full Hermes event router** for cross-tab/cross-user mode-change broadcasts. Mode
  changes broadcast over the existing `runs:changed` / `prompts:changed` SSE channels
  for now (`orchestrator.ts` broadcaster).
- **Multi-repo concurrency** in one project (mode is single-repo per project today).
- **LLM-backed mode detection.** Heuristic-only first, matching the classifier's
  hermetic stance (`be-aware-intake-2026-05-28.md` § Classification algorithm); an LLM
  pass can stack on top later, same as planned for the scenario classifier.
