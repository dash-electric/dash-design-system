# Dash DS — AI Rules Validation Fixtures

> Test fixtures that pin down whether an AI assistant (Claude Code / Cursor / Copilot) actually obeys `dash-ai-rules.md` (829 lines, per-repo stack mandates + ban list) when prompted to do work in one of the 5 Dash FE repos.
>
> **Status: 25 original fixtures simulated 2026-05-20** (see `EXECUTION-REPORT-2026-05-20.md`). 5 image-edit fixtures added 2026-05-20 covering Backoffice POD/POP proof edit (Canvas API + audit trail). No live AI run yet — both passes are simulated against Claude Opus 4.7 priors.

## Index — 30 fixtures, 5 per FE repo + 5 image-edit (Backoffice POD/POP)

| # | Fixture ID | Stack | Category | Severity |
|---|---|---|---|---|
| 1 | `fe-portal-v2-form-01` | portal-v2 | Form | high |
| 2 | `fe-portal-v2-fetch-02` | portal-v2 | Data fetch | high |
| 3 | `fe-portal-v2-modal-03` | portal-v2 | Modal | medium |
| 4 | `fe-portal-v2-list-04` | portal-v2 | List/table | medium |
| 5 | `fe-portal-v2-style-05` | portal-v2 | Style/brand | medium |
| 6 | `fe-backoffice-form-01` | backoffice | Form | high |
| 7 | `fe-backoffice-fetch-02` | backoffice | Data fetch | high |
| 8 | `fe-backoffice-modal-03` | backoffice | Modal | medium |
| 9 | `fe-backoffice-list-04` | backoffice | List/table | medium |
| 10 | `fe-backoffice-style-05` | backoffice | Style/brand | medium |
| 11 | `fe-halo-dash-fe-form-01` | halo-dash-fe | Form | high |
| 12 | `fe-halo-dash-fe-fetch-02` | halo-dash-fe | Data fetch (3s polling) | high |
| 13 | `fe-halo-dash-fe-modal-03` | halo-dash-fe | Modal | medium |
| 14 | `fe-halo-dash-fe-list-04` | halo-dash-fe | List/table | medium |
| 15 | `fe-halo-dash-fe-style-05` | halo-dash-fe | Style/brand | medium |
| 16 | `fe-basecamp-form-01` | basecamp | Form (Zustand+shadcn) | high |
| 17 | `fe-basecamp-fetch-02` | basecamp | Data fetch (route handler) | high |
| 18 | `fe-basecamp-modal-03` | basecamp | Modal (shadcn) | medium |
| 19 | `fe-basecamp-list-04` | basecamp | List/table | medium |
| 20 | `fe-basecamp-style-05` | basecamp | Style/brand `#5e2aac` | medium |
| 21 | `fe-react-fleet-form-01` | react-fleet | Form (CRA+CRACO) | high |
| 22 | `fe-react-fleet-fetch-02` | react-fleet | Data fetch (nested pagination) | high |
| 23 | `fe-react-fleet-modal-03` | react-fleet | Modal (in-house) | medium |
| 24 | `fe-react-fleet-list-04` | react-fleet | List/table | medium |
| 25 | `fe-react-fleet-style-05` | react-fleet | Style/brand DRIFT surfacing | medium |
| 26 | `fe-backoffice-image-edit-01` | backoffice | Image edit (Canvas crop+rotate) | high |
| 27 | `fe-backoffice-image-edit-02` | backoffice | BE update + audit log | high |
| 28 | `fe-backoffice-image-edit-03` | backoffice | Edit history side-by-side | medium |
| 29 | `fe-backoffice-image-edit-04` | backoffice | Edit reason dropdown | medium |
| 30 | `fe-backoffice-image-edit-05` | backoffice | Success toast (Bahasa) | low |

### Image-edit category notes

Added 2026-05-20 to cover the Backoffice POD/POP proof-edit use case. Fixtures 26-30 form a single feature slice (FE editor → BE update + audit → history view → reason dropdown → success toast). Two rules-side additions are referenced and need to land in `dash-ai-rules.md` for the expected_pattern_ref citations to resolve:

- **Phase 0.1 — External-lib policy.** Refuse anti-pattern entry banning fresh image-editor libraries (react-easy-crop, cropperjs, react-image-crop, filerobot, @uppy/image-editor). Canvas-API hand-roll is the default for crop+rotate scope (~80 LOC).
- **Phase 0.2 — Audit trail rule.** Every edit on user-uploaded proof MUST persist `{ original_url, edited_url, editor_id, edit_reason, ts }` in `t_proof_audit_log` and write the edited image to a separate `proof-edited/` storage path. Original image at `proof-original/` is write-once.

Severity ladder for this category:
- 26 (FE editor) and 27 (BE audit) are **high** — both have hard banned imports / hard schema requirements.
- 28 (history) and 29 (reason dropdown) are **medium** — visual + UX correctness, not stack-level.
- 30 (toast) is **low** — copy + variant, no banned imports.

## Fixture schema

Each JSON file has the same shape:

```json
{
  "id": "fe-portal-v2-form-01",
  "stack": "portal-v2",
  "prompt": "<the exact PE-style prompt to paste into the AI>",
  "expected_avoid": ["<imports / patterns / APIs the AI must NOT produce>"],
  "expected_use":  ["<imports / patterns / APIs the AI SHOULD produce>"],
  "expected_pattern_ref": "<rules section + line range so a human verifier can check>",
  "context_notes":  "<background, ambiguities, and why this matters>",
  "severity": "high | medium | low"
}
```

Severity ladder:
- **high** — a banned import / framework would slip in (RHF, zod, TanStack Query, etc). System-level violation.
- **medium** — off-token color, wrong primitive choice, naming divergence, or pattern drift.
- **low** — style preference only. (None at present — could be added later.)

## How to run a validation pass (manual, for now)

The fixtures exist to be executed by hand against an AI assistant configured with `@dash` registry + the rules file. Until automation lands, the loop is:

1. Open each fixture JSON.
2. In Claude Code / Cursor with the target Dash repo open (so its `AGENTS.md` / `CLAUDE.md` is loaded into context), paste the `prompt` verbatim.
3. Capture the AI's full response (chat + proposed code diff).
4. Score against `expected_avoid` and `expected_use`:
   - **PASS** — every `expected_avoid` item is absent AND at least the load-bearing items in `expected_use` appear.
   - **FAIL (severity high)** — any `expected_avoid` item appears (e.g. `import { useForm } from "react-hook-form"`).
   - **FAIL (severity medium)** — wrong primitive, wrong color path, missed drift surfacing.
   - **PARTIAL** — banned items absent, but one or more `expected_use` items missing — note the gap.
5. Record the verdict in a tracking sheet (path TBD; suggestion: `fixtures/results/<date>.csv`).

### What counts as a fail (concrete examples)

- Prompt 1 (`fe-portal-v2-form-01`) returning `import { useForm } from "react-hook-form"` → **fail high**.
- Prompt 17 (`fe-basecamp-fetch-02`) returning `import axios from "axios"` instead of native `fetch` → **fail medium** (axios is wrong layer here; basecamp talks to its own route handlers).
- Prompt 25 (`fe-react-fleet-style-05`) silently writing `bg-[#5e2aac]` over the existing blue → **fail medium** (the drift must be surfaced, not silently fixed, per "kita gabisa ngubah existing").
- Prompt 12 (`fe-halo-dash-fe-fetch-02`) missing `clearInterval` cleanup → **partial** (polling is correct lib but the cleanup gap is a real bug).

### Pass/fail criteria — aggregate

For the overall run to be considered a "pass" on a given AI model:
- 100% of `severity: high` fixtures must PASS (no banned imports anywhere).
- ≥80% of `severity: medium` fixtures must PASS.
- Drift-surfacing fixtures (`fe-react-fleet-style-05`, `fe-portal-v2-style-05`, `fe-basecamp-style-05`) must produce a *recommendation*, not a silent rewrite, in their response text.

## Coverage matrix

| Category | portal-v2 | backoffice | halo-dash-fe | basecamp | react-fleet |
|---|---|---|---|---|---|
| Form (RHF/zod ban) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Data fetch (TanStack/SWR ban) | ✓ | ✓ | ✓ (polling) | ✓ (route handler) | ✓ (nested pagination) |
| Modal | ✓ | ✓ | ✓ | ✓ (shadcn) | ✓ (in-house) |
| List/table | ✓ | ✓ | ✓ | ✓ | ✓ |
| Style/brand | ✓ | ✓ | ✓ | ✓ | ✓ (blue drift surfacing) |
| Image edit (POD/POP) | — | ✓ (5 fixtures) | — | — | — |

## Known ambiguities surfaced while writing the fixtures

Documenting these because they came up repeatedly and the rules file does not fully resolve them:

1. ~~**Dash Purple has two documented hex values.** Rules L417 says basecamp's brand is `#7C4FC4` (hard-coded hex). Rules L219 says `bg-primary` resolves to `#5e2aac` via `--dash-purple-500`. The fixtures flag this in `fe-portal-v2-style-05`, `fe-backoffice-style-05`, `fe-halo-dash-fe-style-05`, and `fe-basecamp-style-05`. **Recommend:** rules file pick one canonical value, document the other as legacy.~~ **RESOLVED 2026-05-20:** Canonical Dash Purple primary = `#5e2aac` (matches DS token `--dash-purple-500`). Rules + glossary + all fixtures synced to single value. `#7C4FC4` deprecated.
2. **basecamp + shadcn Dialog naming conflict.** Rules say "use Dash Modal name, not shadcn Dialog name" (L139), but basecamp's UI lib IS shadcn — so shadcn `Dialog` / `AlertDialog` *is* the canonical primitive there, and Dash Button's `tone × style` API does not apply. Captured in `fe-basecamp-modal-03`. **Recommend:** rules add an exception for basecamp at the naming-divergence table.
3. **react-fleet has stale RHF deps but zero source imports.** Captured in `fe-react-fleet-form-01`. AI may see `package.json` and assume RHF is the canonical pattern. The rules call this out explicitly (L577), but a fresh AI without the rules in context will likely miss it.
4. **No AGENTS.md exists for react-fleet.** Conventions are inferred from `ARCHITECTURE.md` and code samples. Captured in `fe-react-fleet-form-01` and `fe-react-fleet-modal-03`. **Recommend:** Dash team write an AGENTS.md for this repo.
5. **Modal primitive ambiguity in repos with co-existing UI libs.** Backoffice (MUI + antd + Tailwind) and halo (AlignUI vendored) tolerate library coexistence. Whether a new modal should be `@dash/modal`, the existing MUI/antd/AlignUI modal, or shadcn is decided by surrounding-section consistency, not a global rule. The fixtures encode "stay consistent within a pane / page" but a stricter rules-side decision would reduce ambiguity.

## Out of scope (intentional)

- **BE / service / IaC fixtures.** This task covers the 5 FE repos. The 5 BE repos (nodejs-core, ts-delivery, nest-express, nest-fleet, halo-dash-be) and infrastructure each warrant a parallel fixture suite (ORM/envelope/state-machine/style mandates).
- **Drift-detection-only fixtures.** No fixture currently tests a prompt that should produce *no code* and only a flag (e.g. "should the AI refuse and ask?"). Could be added later.
- **Multi-turn fixtures.** All 30 are single-shot prompts. Real PE conversation has follow-ups; that's a v2 concern.

## Next step

Recommend running fixtures 1, 6, 11, 16, 21, 26 (one form/feature-start fixture per repo + image-edit-01, all `severity: high`) as a smoke test first. If RHF/zod (or a fresh image-editor lib like react-easy-crop on fixture 26) slips in on any of those, the rules file isn't being honored — investigate context wiring before running the full 30. See `EXECUTION-REPORT-2026-05-20.md` for the most recent simulated pass.
