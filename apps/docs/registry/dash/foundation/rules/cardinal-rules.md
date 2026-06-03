# Dash Foundation — Cardinal Rules (Layer 0)

> Non-negotiable rules shared by all Dash products + Trellis tenants. These bind everyone consuming Layer 0. Product/feature layers may add stricter rules, but MAY NEVER relax these.

Distilled from `apps/docs/registry/rules/dash-ai-rules.md` (996 lines) and `CLAUDE.md`. Source of truth remains `dash-ai-rules.md` until consumers are switched in Phase B.

## CR-1 — Additive only

Existing Dash production code is **NEVER modified** by the DS. Dash DS is purely **additive**: build new patterns + components here, consumer repos pull via `dashkit add`. The DS adapts to each real Dash repo; it does NOT force-migrate stacks.

Source: `CLAUDE.md` § "Cardinal rules" #1; `dash-ai-rules.md` § "Dash Repo Adaptation Layer" (user mandate 2026-05-20: "kita gabisa ngubah existing, kita hanya bisa support itu").

## CR-2 — Audit trail mandatory for legal/financial fields

Any user-editable field carrying legal/financial weight MUST have a sibling audit log capturing original value, edited value, editor identity, timestamp, and non-empty edit reason. The original value is NEVER overwritten — the audit row is inserted in the SAME transaction as the update.

Scope: image proof (POD/POP/KYC), payment amounts (top-up/payout/adjustment/refund), signature blobs, delivery confirmation flags, mitra status changes (suspend/unsuspend/block/reinstate/tier change), driver approval ladder transitions.

Source: `dash-ai-rules.md` § "Audit Trail (MANDATORY …)" lines 833-873.

## CR-3 — Banned libraries (refuse on sight)

Across all FE Dash repos:

| Category | Banned |
|---|---|
| Forms | `react-hook-form`, Formik, Final Form, react-final-form |
| Validation (FE) | `zod`, `joi` (FE-side), `yup`, `ajv`, `valibot` |
| Data fetch | `@tanstack/react-query`, `swr`, `react-query`, Apollo Client |
| Component libs (greenfield) | MUI, antd, Chakra, Mantine, Radix-themes |
| Resolvers | `@hookform/resolvers` |

Replacements: `useState` + hand-rolled validation (per repo); Jotai (portal-v2) or Zustand 5 (basecamp) for global state; `axios` + custom hooks (or native `fetch`) for data; `@dash` registry for primitives.

Source: `dash-ai-rules.md` § "External Library Policy → Banned categories" lines 907-913; § "Anti-patterns (REFUSE)" lines 577-595.

## CR-4 — Voice formal "Anda" mitra-facing

All mitra-facing copy defaults to formal "Anda", not "kamu". See `voice/voice-rules.md` for the full rule set and Layer 1+ override policy. Legal/financial/compliance flows MUST stay formal regardless of Layer 1 overrides.

Source: `CLAUDE.md` § "Cardinal rules" #5; `dash-ai-rules.md` line 387 + Auto Suspend precedent.

## CR-5 — Token usage (no raw hex)

Never use raw color hex / rgb in component code. Always use semantic tokens (`bg-bg-white-0`, `text-text-strong-950`, `border-stroke-soft-200`, `bg-primary-base`). Foundation ships the canonical token set via `foundation/tokens/*.css` and Tailwind theme aliases.

Dash Purple canonical hex: `#5e2aac` (= `--dash-purple-500` = `--primary-base`). Do NOT introduce `#7C4FC4` or any other purple variant.

Source: `CLAUDE.md` § "Cardinal rules" #4; `dash-ai-rules.md` § "Always" #3 + § "Anti-patterns".

## CR-6 — File conventions (use registry, not copy-paste)

NEVER copy-paste a component between Dash repos. Always use `dashkit add <name>` to install a fresh copy from the registry — the CLI handles tokens, dependencies, and cssVars correctly. Manual copy will silently break theming.

Divergence requires `dashkit gap report` FIRST. Cosmetic tweaks in place are OK; behavioral changes must be reported upstream. No silent forks.

Source: `dash-ai-rules.md` § "Cross-Repo Component Replication" lines 927-947.

## CR-7 — Cross-repo sync via `dashkit sync`

Mass updates and version reconciliation across consumer repos run through `dashkit sync` (planned v0.5). Do not precompose manual upgrade scripts. Each repo's `components.json` records installed versions; do not hand-edit version fields.

Source: `dash-ai-rules.md` § "Cross-Repo Component Replication" #4-5 (lines 941-942); `CLAUDE.md` § "Tooling".

## CR-8 — Audit trail UI on disputable entities

Any entity that can be the subject of a mitra dispute MUST render an audit history view (canonical: `@dash/activity-feed`) showing all audit rows (editor, reason, timestamp). This is a UI rule, not just a backend rule.

Source: `dash-ai-rules.md` § "Audit Trail → Rules" #5 (line 868).

---

## Lock policy

This file is **Layer 0 — LOCKED**. Changes require:

1. Multi-product review (Dash Ride + Dash Logistic + Dash Travel + Dash Marketplace owners + Trellis liaison).
2. Migration plan for existing consumers if a rule tightens.
3. ADR entry in vault under `Dash-Design-System/ADRs/`.

Additions to Layer 0 (new CR-N) follow the same gate. Removals require explicit kill-criteria match (see `KILL-CRITERIA.md`).
