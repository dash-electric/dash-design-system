# Dash Build — Build Scripts

Standalone Node scripts that support the `@dash/build` package. Run them from
the package root (`packages/dash-build/`) via pnpm.

## Audit suite quick reference

| Command | What it does |
|---------|--------------|
| `pnpm audit` | Runs `audit:css` then `audit:tokens`. Single entry-point for pre-commit. |
| `pnpm audit:css` | Fails on raw hex in `src/` (respects allowlist). |
| `pnpm audit:css:strict` | Fails on ANY hex anywhere — even allowlisted ones. Target state. |
| `pnpm audit:css:report` | Summary report (no exit fail). See intentional vs TODO buckets. |
| `pnpm audit:css:allowlist` | Bootstrap mode — appends every current violation to the allowlist. Use sparingly. |
| `pnpm audit:tokens` | Warn-only scan for non-hex token leaks (font-size/radius/shadow/keywords). |
| `pnpm audit:tokens:strict` | Same scan, but fails on any finding. |
| `pnpm audit:tokens:report` | Per-category summary plus full finding list. |

The `pretest` hook chains `audit:css` before every `pnpm test` run so a
regression cannot land silently.

## `audit-css.mjs` — raw hex color guard

Enforces `design.md` CR-5 ("Never raw hex — use Dash semantic tokens only")
across every `*.ts` file under `packages/dash-build/src/`.

### What it scans for

- Any `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA` hex literal in source.
- A line is **not** a violation if any of these are true:
  - It is inside a CSS variable definition (`--token: #abc`) — sanctioned.
  - It uses a `var(--token, #fallback)` fallback — explicit override.
  - It is a comment (`//`, `/*`, ` *`).
  - The `(file, hex)` pair appears in `audit-css.allowlist.json` with a reason.

### Modes

```bash
pnpm --filter @dash/build audit:css
# → default — respects allowlist. Exits 1 on any new violation.

pnpm --filter @dash/build audit:css:strict
# → ignores allowlist. EVERY raw hex is a violation. Target state once
#   Agent A2 finishes the dashboard.ts hex refactor.

pnpm --filter @dash/build audit:css:report
# → prints scan summary: total files, hex by file, allowlist size, and a
#   split between "intentional literal" (canonical brand, ANSI banner,
#   prompt body, test fixture) and "TODO refactor" (legacy waiting on
#   token migration). Never exits non-zero.

pnpm --filter @dash/build audit:css:allowlist
# → bootstrap mode: appends every current violation to the allowlist with
#   reason "TODO: review". Replace the placeholders with real explanations
#   before committing.
```

### Allowlist file

`scripts/audit-css.allowlist.json` is the single source of truth for legacy
exceptions. Every entry must explain **why** the raw hex still exists and
when it will be migrated to a token. Reviewers should reject PRs that add new
allowlist entries without a substantive `reason`.

## `audit-tokens.mjs` — non-hex token leak guard

Complements `audit-css.mjs`. Catches token-leak categories that raw-hex
scanning misses, on lines that look like CSS property declarations inside
template literals:

| Category | Heuristic | Suggested token |
|----------|-----------|-----------------|
| `font-size` | `font-size: Npx` where N > 14 | `var(--text-md)`, `var(--text-lg)`, `var(--text-xl)` |
| `border-radius` | `border-radius: Npx` where N > 12 | `var(--radius-lg)`, `var(--radius-pill)` |
| `box-shadow` | `box-shadow:` with raw rgba/px (not `var(--shadow-*)`) | `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-focus)` |
| `color-keyword` | `color: white` / `background: black` (bare keyword) | `var(--bg-white)`, `var(--text-strong)` |

Warn-only by default (exit 0). Pass `--strict` to fail on any finding. Pass
`--report` for a per-category breakdown and full finding list.

Legitimate exceptions live in `scripts/audit-tokens.allowlist.json`:

```json
{
  "allowed": [
    { "file": "src/daemon/templates/styles/dashboard.ts", "line": 123, "category": "font-size",
      "reason": "marketing hero literal, intentional one-off" }
  ]
}
```

Set `line` to a specific line number, or omit it to allow the category
file-wide (use sparingly — file-wide allowlist defeats the audit).

## Validator daemon-self-audit mode

`src/skills/validator.ts` exposes a `mode: "daemon-self-audit"` option that
reuses the same hex regex as `audit-css.mjs`. It lets test suites assert that
the daemon's own UI does not regress on CR-5, separate from the CLI guard.

```ts
validateOutput(emptyParsed, design, {
  mode: "daemon-self-audit",
  daemonRoot: "/abs/path/src/daemon",
  allowlist: [{ file: "src/daemon/templates/styles/dashboard.ts", hex: "#5e2aac" }],
})
```

Backward compatible — existing 2-arg callers are unaffected.

## Workflow for developers

Before committing anything under `packages/dash-build/`:

```bash
pnpm --filter @dash/build audit
pnpm --filter @dash/build test
pnpm --filter @dash/build typecheck
```

If `audit:css` fails, choose one:

1. **Refactor**: replace the hex with a semantic token in
   `src/daemon/templates/styles/dashboard.ts` (or wherever the literal lives).
   This is the preferred fix.
2. **Allowlist**: only when the hex is a genuine intentional literal
   (canonical brand reference, ANSI banner, prompt body, test fixture). Add
   an entry with a real `reason` — never leave `"TODO: review"`.

## Pre-commit + CI

Husky is not currently installed at the repo root. When it is added, append
the audit call to `.husky/pre-commit`:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm --filter @dash/build audit
```

For CI, add to `.github/workflows/` (not configured in this slice yet):

```yaml
- name: Dash Build audit
  run: pnpm --filter @dash/build audit
```

In the meantime, the `pretest` script ensures `audit:css` runs before every
`pnpm test`, and any developer running tests will see regressions immediately.

## Path to strict mode

Today: `audit:css` passes because 28 legacy hex entries live in the allowlist.
Agent A2 is refactoring `src/daemon/templates/styles/dashboard.ts` and other
legacy sites to use semantic tokens. Once that work lands:

1. Re-run `pnpm audit:css:report` and verify "TODO refactor" bucket is 0 (or
   close to it — only intentional literals should remain).
2. Drop the migrated entries from `audit-css.allowlist.json`.
3. Flip the `test` pipeline (or CI) to use `audit:css:strict` instead of
   `audit:css`. From that point on, ANY hex in `src/` — even Dash Purple
   `#5e2aac` outside a `--token: ...` line — fails the build.

This is the end state. The allowlist becomes a permanent record of the few
truly intentional literals (canonical brand reference in ANSI, test
fixtures, prompt-body forbidden examples).

## Why this matters

Dash Build is the AI-driven internal builder; every new feature it ships is
seen by 10+ team members. If an AI agent (Claude included) introduces a raw
hex during code generation, that hex becomes "load-bearing" and spreads to
consumer Dash repos through PRs the agent opens. The audit catches the leak
at commit time, before it reaches the registry — and the daemon-self-audit
ensures Dash Build itself does not enforce rules it violates.

## `check-bundle-size.ts`

Tracks dashboard bundle size deltas. Runs in CI; see `__tests__/` for
fixtures.
