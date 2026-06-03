# Repo Management Comparison — Shadcn vs Dash DS

> Sources read: 22 shadcn files (`/tmp/shadcn-ui/`) + 11 Dash files (`/Users/irfanprimaputra.b/dash-ds/`).
> Date: 2026-05-20.
> Scope: contribution workflow, issue mgmt, release, CI/CD, docs, components, code quality, security, community, governance, sustainability.

---

## Executive Summary

**Verdict.** Shadcn ships a mature, automated, public-OSS pipeline (Changesets-driven semver releases, signed-commit enforcement, stale-issue bot, dependabot fan-out across 11 template dirs, OIDC npm publishing). Dash DS has equivalent *intent* — `CONTRIBUTING.md`, `CHANGELOG.md`, branch/commit conventions, `MAINTENANCE.md` playbook, layered architecture — but **zero `.github/` directory exists in the repo today**: no workflows, no issue templates, no PR template, no dependabot, no CODEOWNERS. The `COMMIT-PLAN-2026-05-20.md` explicitly notes "workflows authored, deferred pending OAuth scope refresh." So Dash has the *documents* but is missing the *automation* that makes those documents enforceable.

**5 critical adoptions (compressed):**
1. Materialize `.github/workflows/` — at minimum `code-check.yml` (lint+typecheck+format) and `test.yml` on every PR.
2. Adopt Changesets (`.changeset/` + `release.yml`) to replace the manual `CHANGELOG.md` edits.
3. Issue templates (`bug_report.yml` + `feature_request.yml` + `config.yml` disabling blank issues).
4. PR template forcing motivation + screenshot + downstream-consumer field (the `CONTRIBUTING.md` already prescribes this — needs to be a YAML file).
5. Stale-issue bot (`issue-stale.yml`) — critical because Dash is bus-factor=1 (Irfan) and issues will rot.

---

## A. Contribution Workflow

### Shadcn approach

`CONTRIBUTING.md:43-113` documents the dev loop: fork → clone → branch → `pnpm install` → `pnpm --filter=v4 dev` (docs site at :4000) or `pnpm --filter=shadcn dev` (CLI). CLI testing flow at `CONTRIBUTING.md:91-113` chains two terminals (`pnpm dev` + `pnpm shadcn <cmd> -c ~/Desktop/my-app`). Component contribution at `CONTRIBUTING.md:125-143` explicitly states: "(1) You make the changes for every style. (2) You update the documentation. (3) You run `pnpm registry:build` to update the registry."

Commit convention at `CONTRIBUTING.md:144-173` enforces Conventional Commits with 8 categories: `feat / feature`, `fix`, `refactor`, `docs`, `build`, `test`, `ci`, `chore`. Backed by `.commitlintrc.json` extending `@commitlint/config-conventional`.

Branch naming is implicit ("Create a new Branch / `git checkout -b my-new-branch`") — no prefix convention enforced.

Merge strategy: **squash** via Kodiak bot (`.kodiak.toml:7` `method = "squash"`, `delete_branch_on_merge = true`, `automerge_label = "automerge"`). Optimistic updates off; conflict notifications on.

### Dash approach

`CONTRIBUTING.md:9-24` documents a 10-step component-add flow that is *more prescriptive* than shadcn's: branch `feat/component-<name>` → Figma MCP source → write under `apps/docs/registry/dash/ui/<name>.tsx` → register in `registry.json` → build → docs page → typecheck → smoke → PR → Slack.

Branch naming at `CONTRIBUTING.md:30-38` is **enumerated** with a table: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`. Explicitly kebab-case, <5 words. **Stronger than shadcn here.**

Commit convention at `CONTRIBUTING.md:42-67` is Conventional Commits + a mandatory `Co-Authored-By: Claude Opus 4.7` trailer. Two worked examples included. <72 char summary rule explicit.

PR workflow at `CONTRIBUTING.md:82-101` describes: branch → push → PR → autoplan review → address feedback → squash-merge → Vercel auto-deploy → Slack announce. Three "never" rules: no force-push to `main`, no `--no-verify`, no amend-after-push.

`MAINTENANCE.md:171-226` has the canonical 10-step component flow with terminal commands — more operational than shadcn's prose version.

### Diff analysis

| Axis | Shadcn | Dash | Winner |
|---|---|---|---|
| Branch naming convention | Implicit | Enumerated table | **Dash** |
| Commit convention | Conventional + commitlint enforcement | Conventional + Co-Authored-By + manual | Shadcn (enforced) |
| Component-add flow doc | Prose | Numbered 10-step + cmds | **Dash** |
| Merge bot | Kodiak | None | Shadcn |
| AI/agent context (CLAUDE/AGENTS) | None | CLAUDE.md + AGENTS.md + apps/docs/AGENTS.md | **Dash** |

### Recommendation

**Adopt:** commitlint enforcement (`.commitlintrc.json` + a `commitlint` step in the lint workflow); Kodiak or GitHub native merge-queue (`squash` strategy, `automerge` label). **Adapt:** keep Dash's branch-prefix table — that's better than shadcn. **Avoid:** copying shadcn's "every style" rule — Dash has one canonical theme system per `CLAUDE.md:10-25` (Layer 0-3), not multi-style fork.

---

## B. Issue Management

### Shadcn approach

Three YAML issue templates:

- `bug_report.yml` — required fields: bug description, affected component, repro steps, system info, terms acknowledgement. Optional: codesandbox/stackblitz link, logs. Auto-labels `["bug"]`. Title prefix `[bug]: `. Caution callout (`bug_report.yml:53-55`): "If you skip [repro], this issue might be labeled `please add a reproduction` and closed."
- `feature_request.yml` — feature desc + affected components + context. Auto-label `area: request`. Title `[feat]: `.
- `config.yml` — `blank_issues_enabled: false` (force a template), redirects "Get Help" → Discussions.

Discussion templates: `blocks-request.yml` for new-block requests.

Triage automation: `issue-stale.yml` — runs daily at 23:40 UTC. Issues stale at **365 days**, closed 7 days later. PRs not auto-staled (`days-before-pr-stale: -1`). Exempt labels: `roadmap`, `next`, `bug`.

### Dash approach

`CONTRIBUTING.md:140-151` enumerates "Where to file issues" by category (bug → `bug` label, feature → `enhancement`, CLI → `area:cli`, MCP → `area:mcp`, docs → `area:docs`, incident → Slack first then `incident` label, security → DM Irfan).

**There are no YAML templates.** No `.github/ISSUE_TEMPLATE/` directory. The label taxonomy exists in prose but is not enforced by GitHub when an issue opens.

No stale-issue bot. No automated triage.

### Diff analysis

Dash has the **label vocabulary** documented but lacks the **enforcement mechanism**. A user filing a bug today gets a blank textarea — they may forget repro steps, component name, system info. Shadcn's YAML form makes those *required*.

### Recommendation

**Adopt verbatim:**
- `bug_report.yml` (copy + s/shadcn/dash/, s/`[bug]: `/`[bug]: `/, swap component examples to Button/DataTable/RatingStars).
- `feature_request.yml` (same edits).
- `config.yml` with `blank_issues_enabled: false` + contact_link to Slack `#design-system`.
- `issue-stale.yml` — set `days-before-issue-stale: 90` (more aggressive than shadcn's 365 because Dash is internal-only, faster cycle).

Add Dash-specific issue templates: `incident.yml` (live `ds.dash.com` down) — already implied by `CONTRIBUTING.md:148`.

---

## C. Release Workflow

### Shadcn approach

Uses **Changesets** (`.changeset/config.json`, `.changeset/README.md`). Config:

```json
{
  "changelog": ["@changesets/changelog-github", { "repo": "shadcn-ui/ui" }],
  "commit": false,
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["v4", "tests"]
}
```

Contributors drop a markdown file in `.changeset/` describing their change (`angry-stars-pick.md` example: 5 lines, `"shadcn": patch` + one-line summary "fix failing version derivation test").

`release.yml` workflow:
- **On PR with `🚀 autorelease` label** → `prerelease` job: bumps version via `version-script-beta.js`, runs `pnpm pub:beta` (publishes `shadcn@x.y.z-beta-N`), uploads artifact, comments on PR via `prerelease-comment.yml` with install command `pnpm dlx shadcn@<beta-version>`.
- **On push to `main`** → `release` job: runs `changesets/action@v1` which either (a) opens "Version Packages" PR collecting all pending `.changeset/*.md` entries into bumped versions + updated `CHANGELOG.md`, or (b) if such a PR is merged, runs `npx changeset publish` → npm publish + GitHub release + tag.

Critical hardening: **GPG-signed release commits** (`release.yml:107-113` uses `crazy-max/ghaction-import-gpg@v6`). **OIDC npm publishing** (`id-token: write` permission, `npm install -g npm@latest`). **Signed-commits workflow** (`signed-commits.yml`) — comments on PRs with unsigned commits asking author to sign, deletes the comment when fixed.

`packages/shadcn/CHANGELOG.md` = 839 lines, auto-generated by Changesets with PR links + commit SHAs + contributor handles. Semver clean: 4.7.0 / 4.6.0 / 4.5.0 / 4.4.0 / 4.3.1 / 4.3.0 / 4.2.0 / 4.1.2 / 4.1.1 / 4.1.0 — readable trail of Minor vs Patch.

### Dash approach

`CHANGELOG.md` is **hand-written** Keep-a-Changelog style — three releases logged (0.5.0, 0.2.0, 0.1.0 — note version order anomaly because they all landed on the same day 2026-05-20). Entries grouped by Added / Changed / Fixed / Removed / Documented.

`COMMIT-PLAN-2026-05-20.md:381-394` describes the release flow: "After 13 commits land: `git log --oneline -20` review → push → verify CI green (or note CI deferred per OAuth scope) → tag if releasing: `v0.5.0`."

No Changesets. No `.changeset/` directory. No `release.yml`. No GPG-signed releases. No OIDC npm publishing (because nothing is published to npm yet — `package.json` is `private: true`).

`MAINTENANCE.md:262-279` documents a **breaking-change protocol**: bump `version:` inside `registry.json` items[], add a `deprecates` block, Slack announce 1 week before merge, monitor 4xx rate post-merge. This is registry-item-level versioning, not package-level — Dash has invented a different model.

### Diff analysis

This is the **largest gap**. Shadcn has fully automated, contributor-driven release notes; Dash has hand-rolled CHANGELOG entries that will drift the moment Irfan isn't the only person committing.

**Counter-context:** Dash CLI isn't published to a public npm registry yet (`packages/cli/package.json` is internal/private). So full Changesets is overkill until publish. But the CHANGELOG.md format is already a problem — three "releases" all dated 2026-05-20 with overlapping content suggests the version line is being used as a section header, not a real release tag.

### Recommendation

**Adopt (Wave 5 timeline):**
- `.changeset/config.json` with `"ignore": ["@dash/docs"]` (docs app doesn't version), `"baseBranch": "main"`, `"access": "restricted"` (private packages).
- `release.yml` push-to-main → Version PR. Skip prerelease step initially (no external beta consumers).
- Replace hand-written `CHANGELOG.md` for each package; root CHANGELOG can stay narrative-style for now.

**Avoid:** OIDC npm publishing + GPG signing until the CLI is actually published. Premature hardening.

**Adapt:** Dash's registry-item-level versioning (`registry.json` items[] `version:` field per `MAINTENANCE.md:269-272`) is a *good idea shadcn doesn't have*. Keep that as a Dash-specific layer on top of package versioning.

---

## D. CI/CD

### Shadcn approach

**7 workflows** in `.github/workflows/`:

1. `code-check.yml` — runs on every PR. Three parallel jobs: `lint` (pnpm lint), `format` (builds shadcn package first, then `pnpm format:check`), `tsc` (pnpm typecheck). All cache pnpm store via `actions/cache@v3` keyed on `pnpm-lock.yaml` hash.
2. `test.yml` — runs on every PR. Node 22, installs Bun (because `apps/v4/registry:build` script uses `bun run ./scripts/build-registry.mts`). Runs `pnpm test` which boots the v4 dev server and runs vitest against it.
3. `release.yml` — described in C.
4. `signed-commits.yml` — described in C.
5. `prerelease-comment.yml` — described in C.
6. `validate-registries.yml` — runs when `apps/v4/public/r/registries.json` or `apps/v4/registry/directory.json` change. Two jobs: (a) `check-registry-sync` flags PR with `registries: invalid` + comments "can you run `pnpm registry:build`" if directory changed but registries.json didn't; (b) `validate` enforces reserved-namespace block (`@shadcn`, `@ui`, `@blocks`, `@components`, `@registry`, etc.) and runs `pnpm validate:registries`.
7. `issue-stale.yml` — described in B.

Plus `dependabot.yml` — **12 ecosystems** monitored weekly (root + 11 template dirs).

### Dash approach

**No `.github/workflows/` directory exists in the repo today.** Verified by `find /Users/irfanprimaputra.b/dash-ds -maxdepth 3 -name ".github" -type d` returning empty.

`README.md:88-89` claims "Open a PR — CI runs typecheck, lint, registry build, Next build, CLI tests, docs unit tests, and visual regression." This is **aspirational** — the workflows are not yet committed (per `COMMIT-PLAN-2026-05-20.md:7` "workflows authored, deferred pending OAuth scope refresh").

`CHANGELOG.md:83` 0.1.0 entry says "GitHub Actions CI + preview + release workflows" were added, but they are not in the current working tree.

### Diff analysis

**This is the highest-leverage gap.** Without CI gates, every contribution relies on the contributor remembering to run `pnpm tsc --noEmit && pnpm test && pnpm lint` locally. With 10 downstream consumers (`CONTRIBUTING.md:3` "All 10 team members at Dash pull from this — every change ripples downstream"), a single bad merge can break every downstream repo.

### Recommendation

**Adopt this week (highest priority of the entire report):**

1. **`code-check.yml`** — copy shadcn's verbatim, swap `pnpm/action-setup@v4` to `9.0.0` (matches `package.json:21` `packageManager`). Three jobs: lint, format:check, typecheck. Required check on `main` branch.
2. **`test.yml`** — minimal: `pnpm test` (runs all package vitest specs — currently 64+ per `CHANGELOG.md`). Node 20. Required check.
3. **`registry-build.yml`** (Dash-specific, not in shadcn): on PR, run `pnpm registry:build` and fail if `apps/docs/public/r/*.json` has uncommitted diff (means contributor forgot to commit rebuilt registry).
4. **`audit.yml`** (Dash-specific): on PR, run `dash audit --fail-on-error` against changed components. This is the "banned imports" gate documented in `CLAUDE.md:30`.
5. **`dependabot.yml`** — monitor root `package.json` weekly. Add per-template entries when Dash ships its own templates dir (mirroring shadcn's `templates/*` pattern).

**Defer until external preview consumers exist:** `validate-registries.yml`, `prerelease-comment.yml`.

---

## E. Documentation Contribution

### Shadcn approach

`CONTRIBUTING.md:115-123` — docs live in `apps/v4/content/docs/`, written in **MDX** (via fumadocs). Preview via `pnpm --filter=v4 dev` at :4000. `apps/v4/package.json:42` `"fumadocs-mdx": "13.0.2"`.

Sidebar / navigation auto-generated by fumadocs from file structure. Component docs co-located with registry source under `apps/v4/registry/new-york-v4/` — same shape, different style versions.

No explicit docs style guide. Docs are written by the maintainer; contributors are asked to "update the documentation" (`CONTRIBUTING.md:141`) but not given a template.

### Dash approach

Docs use **TSX pages**, not MDX. `apps/docs/app/(docs)/docs/components/<name>/page.tsx` with `DocsPageShell + DocsHeader + DocsSection + DocsExample` composition (`MAINTENANCE.md:206-207`, `CONTRIBUTING.md:18`).

Per-page schema enforced via `DocsHeader` props: `status` (stable/beta/wip/deprecated) + `kind` (atom/composite/specialized) — codemodded across 97 pages per `COMMIT-PLAN-2026-05-20.md:254-277` Commit 10.

Schema spec lives at `apps/docs/docs/COMPONENT-PAGE-SCHEMA.md` (per Commit 13). Audit baseline at `apps/docs/docs/SCHEMA-AUDIT-2026-05-20.md`.

`MAINTENANCE.md:204-207` says to use the shared primitives; no MDX support.

### Diff analysis

| Axis | Shadcn | Dash |
|---|---|---|
| Format | MDX (fumadocs) | TSX (custom shell) |
| Schema | Implicit | Explicit (status + kind) |
| Sidebar | Auto-generated | Manual |
| Examples | Embedded in MDX | `DocsExample` component imports registry source |

Dash's TSX-with-schema approach is **stricter** but harder for non-engineer contributors (no markdown fallback). Shadcn's MDX is friendlier for designers/PMs writing docs.

### Recommendation

**Keep** Dash's TSX + schema model — it enables type-checked docs (catches stale prop names at compile time) and the `status` pill is a real product feature.

**Adopt:** add an MDX *escape hatch* for narrative pages (decision logs, architecture writeups). Fumadocs supports both. This unblocks PMs writing roadmap pages without learning TSX.

**Add:** a `DOCS-STYLE-GUIDE.md` covering: when to use `DocsSection` vs free TSX, naming for `DocsExample` IDs, screenshot dimensions, status-pill criteria (when does beta → stable?). Shadcn doesn't have this and it shows in inconsistencies; Dash should leapfrog.

---

## F. Component Contribution

### Shadcn approach

`CONTRIBUTING.md:125-143` — components in `apps/v4/registry/new-york-v4/ui/`. Examples in `apps/v4/registry/new-york-v4/example/`. **Must update every style** (currently only `new-york-v4`, but historically `default` + `new-york` both existed).

Test convention via vitest in `packages/tests/`. CLI tests in `packages/shadcn/` per `CONTRIBUTING.md:179-184`. No Storybook, no per-component test runner — integration tests against the live dev server.

File structure:
```
apps/v4/registry/new-york-v4/
├── ui/<name>.tsx          # source component
├── example/<name>-demo.tsx # demo for docs
```

No `data-slot` convention documented in CONTRIBUTING (it's implicit in the component source).

### Dash approach

`CONTRIBUTING.md:105-117` is **far more prescriptive**:

> `forwardRef` + `data-slot` + `cva` variants — see existing `apps/docs/registry/dash/ui/button.tsx` as the canonical reference. PascalCase components, camelCase functions, kebab-case files. Tabs for indentation. Absolute imports via `@/*`. No `react-hook-form`, `zod` (registry-level), or `react-query` in registry source.

`AGENTS.md:6-27` enforces theme metadata: every block/template MUST carry `theme: "shared" | "ride" | "logistic" | "travel" | "marketplace" | "trellis-{tenantId}"`. The `dash audit` CI gate (planned) rejects missing theme + hard-coded accent hex + banned imports.

Tests: Vitest. Prompt-harness fixtures in `packages/skill/tests/fixtures/`.

File structure (from `CLAUDE.md:42-50` + observed):
```
apps/docs/registry/dash/
├── ui/<name>.tsx          # Layer 1 atoms
├── blocks/<product>/      # Layer 3 workflow blocks
├── templates/<name>.tsx
├── patterns/<name>.tsx
├── hooks/<name>.ts
├── lib/utils.ts
└── rules/                 # AI rules + glossary
```

### Diff analysis

Dash's contribution rules are **substantially more rigorous** than shadcn's:
- Explicit anatomy (`forwardRef + data-slot + cva`).
- Banned-imports list enforced by `dash audit`.
- Layered architecture with `theme:` field required on blocks.
- Anti-pattern list referencing rules.md (Dash Purple, useCode case sensitivity, envelope shapes).

Shadcn doesn't have most of this because shadcn is a **public OSS library**; Dash is an **internal platform** with sharper opinions.

### Recommendation

**Keep all Dash-specific rigor.** It's the right level for an internal DS.

**Adopt:** shadcn's "examples/" sibling directory pattern. Currently Dash docs import demos inline in the page.tsx; extracting to `registry/dash/examples/<name>-demo.tsx` makes them reusable (CLI could ship demos alongside the component if a user wants reference code).

**Avoid:** shadcn's "make changes for every style" mandate — Dash has one canonical style per theme; multi-style fork is a non-goal.

---

## G. Code Quality

### Shadcn approach

- **ESLint** root config at `.eslintrc.json`: extends `next/core-web-vitals + turbo + prettier + plugin:tailwindcss/recommended`. Plugin `tailwindcss/classnames-order: error`. Per-package eslint at `apps/v4/eslint.config.mjs`.
- **Prettier** root config at `prettier.config.cjs`: no semi, double quotes, 2-space tabs, LF, ES5 trailing commas, 80-char width. `@ianvs/prettier-plugin-sort-imports` with elaborate import-order regex stack. `prettier-plugin-tailwindcss` with `cn` + `cva` recognized as tailwind functions.
- **TypeScript** strict implicit via `tsconfig.json` (not read but inferred from project shape).
- **Test coverage**: no explicit target. CI just requires `pnpm test` green.
- **Pre-commit hooks**: not in repo (no `.husky/`, no `lint-staged` config). Relies on CI.
- **Commitlint** via `.commitlintrc.json` extending conventional config.

### Dash approach

- **ESLint** at `apps/docs/eslint.config.mjs` (not read but referenced from `CONTRIBUTING.md:116`).
- **Prettier** — not explicitly configured at root; per-package likely.
- **TypeScript** strict mode mandatory (`CONTRIBUTING.md:108` "no `any` without a `// reason:` comment").
- **Tabs** for source (matches existing apps/docs/) — different from shadcn's 2-space.
- **Tests**: Vitest. 64 tests across 8 files per `CHANGELOG.md:64`. No coverage target documented.
- **Pre-commit hooks**: not present in repo. `CONTRIBUTING.md:99` says "Skip pre-commit hooks (`--no-verify`)" — never — implying hooks should exist but aren't installed yet.

### Diff analysis

| Axis | Shadcn | Dash |
|---|---|---|
| ESLint config | Root + per-pkg | Per-app only |
| Prettier root | Yes (.cjs) | No |
| Commitlint | Yes | Documented, not enforced |
| Pre-commit hooks | No | Mentioned, not installed |
| Indentation | 2-space | Tabs |
| TS strict | Implicit | Explicit "no any" rule |

### Recommendation

**Adopt:**
- Root `.prettierrc.cjs` with Dash-tab-style (tabs for source, 2-space JSON/YAML, LF, no semi to match modern conventions — or match the existing apps/docs/ choice exactly).
- `@ianvs/prettier-plugin-sort-imports` with a Dash-specific import-order (separate the `@/registry/dash/*` block from `@/components/*`).
- `lefthook` or `husky` + `lint-staged` for `pnpm lint:fix` + `pnpm format:write` on staged files. Add a `pnpm dash audit` step on staged registry components.
- `.commitlintrc.json` — copy shadcn's verbatim. Add `commitlint` step in `code-check.yml`.

**Avoid:** copying shadcn's 80-char width if Dash team prefers 100 (check existing source). Style consistency > shadcn parity here.

---

## H. Security

### Shadcn approach

`SECURITY.md` (10 lines, terse) — directs reporters to GitHub's **private vulnerability reporting** feature ("Report a vulnerability" button under Security tab). No PGP key, no SLA promise.

Dependency hygiene via `dependabot.yml` — weekly npm scans across 12 directories (root + 11 templates).

Signed commits enforced via `signed-commits.yml` (comments on PRs with unsigned commits; deletes the comment when fixed). Release commits GPG-signed (`release.yml:107-113`).

### Dash approach

`CONTRIBUTING.md:149` — "Security concern: DM Irfan directly. Do not open a public issue." That's the entire policy.

No `SECURITY.md` file at the repo root.

No dependabot, no signed-commit enforcement, no GPG. No private vuln reporting setup.

`CONTRIBUTING.md:5` clarifies the repo is internal-only (no external redistribution), which limits exposure — but the registry serves over HTTP via `ds.dash.com` (Vercel) and 10 consumer repos pull from it. A compromised registry could push poisoned components to every Dash app simultaneously.

`MAINTENANCE.md:146` mentions Bearer token rotation quarterly. `MAINTENANCE.md:285-298` covers user onboarding via 1Password share. So token hygiene is *documented* but not *automated*.

### Diff analysis

Dash's attack surface is internal-only, but the **blast radius is larger per-incident** because one compromised registry component lands in 10 production apps. Shadcn's blast radius is "users opt-in to update their copy of the component" — slower spread.

### Recommendation

**Adopt:**
- `SECURITY.md` at root. Even one paragraph: "Report via DM to Irfan. We acknowledge within 24h, patch within 7 days for HIGH/CRITICAL." Document SLA so consumers know what to expect.
- `dependabot.yml` weekly — root + each `packages/*` `package.json`. Auto-merge patch-level updates after CI green (low-risk).
- `signed-commits.yml` — copy verbatim. Internal repo + signed commits = audit trail for the inevitable "who pushed this" forensics.
- A **registry integrity check** workflow: on push to main, compute SHA256 of every `public/r/*.json` and write to a `INTEGRITY.txt` artifact. CLI `dash add` can later verify on pull.

**Defer:** GPG-signed releases until npm-publishing the CLI publicly.

---

## I. Community

### Shadcn approach

- `README.md` directs to https://ui.shadcn.com/docs (own domain).
- `CONTRIBUTING.md:7` "feel free to reach out to [@shadcn](https://twitter.com/shadcn)" — direct Twitter line to maintainer.
- GitHub Discussions enabled — `ISSUE_TEMPLATE/config.yml` redirects "Get Help" + "If you aren't sure this is a bug" to Discussions.
- Block requests via Discussion template (`blocks-request.yml`).
- v0 partnership: `apps/v4/package.json:75` `"shadcn": "4.7.0"` + integrations in registry; `apps/v4/scripts/` references V0_URL env var (`turbo.json:14`).
- Vercel hosting: `vercel.com/dash` referenced in MAINTENANCE flows, Vercel Analytics dep (`apps/v4/package.json:42`).

### Dash approach

- Slack `#design-system` is the primary channel (`CONTRIBUTING.md:23,95,148`).
- No Discussions configured (because no `.github/`).
- No Twitter, no public docs domain yet (planned: `ds.dash.com`).
- No v0 / external integrations.
- Vercel for hosting (`vercel.json` present, `MAINTENANCE.md:42` Vercel dashboard scan).
- `CLAUDE.md` + `AGENTS.md` for AI-agent contributors — **this is something shadcn doesn't have at all** and is a Dash-specific competitive advantage given the AI-first workflow.

### Diff analysis

Different audiences. Shadcn = open OSS, public community. Dash = closed internal, Slack-first. The patterns shouldn't transfer directly.

### Recommendation

**Adopt:**
- GitHub Discussions for **internal-only async** (decisions, RFCs, "should we adopt X" debates). Slack is ephemeral; Discussions create a searchable record. Pin the layered-architecture RFC + each kill-criteria milestone.
- Discussion templates: `rfc.yml` (decision needed, options, recommendation), `component-request.yml` (mirror shadcn's blocks-request).

**Avoid:** Twitter / public outreach until the DS goes external.

**Keep:** the `CLAUDE.md` + `AGENTS.md` pattern — this is a real Dash differentiator.

---

## J. Governance

### Shadcn approach

- **No CODEOWNERS file** observed.
- **Single maintainer**: `package.json:7-10` "name: shadcn / url: twitter.com/shadcn". Decisions visible on Twitter + PRs.
- **No RFC pattern** — Discussions used informally.
- **No roadmap file** — `exempt-issue-labels: "roadmap,next"` in stale workflow hints at a roadmap label.

### Dash approach

- **No CODEOWNERS file.** Bus factor = 1 (Irfan) — explicitly called out in `CLAUDE.md:122` "Deputy maintainer (bus factor = 1 currently; Q3 2026 mandatory)".
- **Decision-making**: CEO (Aditya) + Head of Design for Layer 0 changes (`CLAUDE.md:13` "Changing Layer 0 requires a Head of Design RFC"). `KILL-CRITERIA.md` CEO-signed thresholds.
- **RFC pattern**: prose in `CLAUDE.md` — "Layer 0 RFC required. Stop and ask." No template yet.
- **Roadmap**: `apps/docs/ROADMAP.md` exists (per `ls` output line 22). Vault has `Master-Execution-Plan-2026-05-20.md` (`CLAUDE.md:46`).

### Diff analysis

Both repos have bus-factor=1 problems. Dash is *aware* of this and has it as an open question. Shadcn has the same situation but ships at higher cadence due to a stable maintainer + automation.

### Recommendation

**Adopt:**
- `CODEOWNERS` file: `* @irfanputra-design` initially; add deputy + per-area owners when team grows (per `CLAUDE.md:122` Q3 2026).
- `.github/PULL_REQUEST_TEMPLATE.md` enforcing motivation + screenshot + downstream-consumer field (matches `CONTRIBUTING.md:90-92`).
- **RFC template** as a discussion: copy shadcn's blocks-request shape, add fields: Problem · Options Considered · Recommendation · Layer Touched · Approver Required.
- Public `ROADMAP.md` link in README — `apps/docs/ROADMAP.md` is already 10760 bytes but not linked from root README.

---

## K. Sustainability

### Shadcn approach

- **FUNDING.yml**: `github: [shadcn]` — single GitHub Sponsors line.
- **Commercial offering**: shadcn/ui is free, MIT-licensed. Monetization via **v0** partnership (Vercel) — `apps/v4/package.json:42` `@vercel/analytics`, V0_URL env vars in turbo.json + release.yml.
- **Vendor backing**: Vercel (via v0).
- **License**: MIT (`LICENSE.md`, 21 lines).
- **Author**: single individual ("shadcn" w/ Twitter link), no org/company in package.json.

### Dash approach

- **No FUNDING.yml** — internal repo, no public sponsorship.
- **Commercial offering**: N/A — internal-only per `apps/docs/NOTICE.md`.
- **Vendor backing**: PT Dash Elektrik Indonesia (employer of Irfan).
- **License**: Proprietary / internal-only. `apps/docs/NOTICE.md` (2069 bytes) holds terms. AlignUI Pro license covers source per `CONTRIBUTING.md:159-161`.
- **License risk** is non-trivial: the DS uses AlignUI Pro as a Figma source. Memory note `dash_ds_code_sovereign` (2026-05-20) clarifies code is 100% Dash-written, AlignUI is a visual Figma reference only — zero npm/runtime dependency, license risk over-stated in earlier framing.

### Diff analysis

Different funding models. Shadcn = OSS + sponsor + Vercel partnership. Dash = paid by employer + AlignUI Figma source.

The **sustainability concern for Dash is bus-factor, not money.** If Irfan leaves PT Dash, the DS loses its sole maintainer. `KILL-CRITERIA.md` (per `CHANGELOG.md:35`) presumably codifies this — kill criteria CEO-signed 2026-05-20.

### Recommendation

**Adopt:**
- A `MAINTAINERS.md` at root with **deputy plan**: primary (Irfan), deputy (TBD by Q3 2026 per `CLAUDE.md:122`), succession protocol if primary leaves.
- A formal commitment from PT Dash leadership funding a backup maintainer at 0.2 FTE — this is a sustainability ask, not a code change.

**Avoid:** FUNDING.yml (internal repo, no external sponsors).

---

## Critical Adoptions (Top 10, ranked by impact)

| # | Adopt | Source | Why | Effort | Risk if skipped |
|---|---|---|---|---|---|
| 1 | `.github/workflows/code-check.yml` (lint + format + typecheck) | shadcn `code-check.yml` verbatim | No CI gate today; any contributor can land broken code | 1 hr | HIGH — 10 consumers depend on green main |
| 2 | `.github/workflows/test.yml` | shadcn `test.yml` | 64 tests written, no CI run | 30 min | HIGH — tests are useless if not run |
| 3 | `.github/ISSUE_TEMPLATE/{bug_report,feature_request,config}.yml` | shadcn verbatim | Issues today are blank textarea; repro steps will be missed | 1 hr | MEDIUM — adoption-blocker friction |
| 4 | `.github/PULL_REQUEST_TEMPLATE.md` | Author from `CONTRIBUTING.md:90-92` | Motivation + screenshot + downstream-consumer fields | 30 min | MEDIUM — review noise |
| 5 | `.github/dependabot.yml` weekly npm | shadcn pattern | Security + transitive bug fixes | 15 min | MEDIUM — slow drift over months |
| 6 | `.commitlintrc.json` + commitlint in CI | shadcn verbatim | `CONTRIBUTING.md:44` already documents the convention | 30 min | LOW — already doc-enforced |
| 7 | `.github/workflows/issue-stale.yml` (90-day stale) | shadcn pattern, more aggressive interval | Bus-factor=1; issues will rot | 15 min | LOW initially, HIGH at month 6 |
| 8 | `.github/workflows/signed-commits.yml` | shadcn verbatim | Audit trail for internal repo with money-touching consumers | 30 min | LOW — internal only |
| 9 | `SECURITY.md` + GitHub private vuln reporting | shadcn verbatim | Currently no documented disclosure path | 15 min | MEDIUM — compliance ask |
| 10 | `.github/workflows/registry-build.yml` (Dash-specific) | Author new — fails if `pnpm registry:build` produces uncommitted diff | Reviewers can't tell if contributor rebuilt registry | 1 hr | HIGH — drift between source and `public/r/*.json` |

**Total effort to land Top 10**: ~6 hours single-session. Yields ~80% of shadcn's operational maturity.

---

## Things Dash Already Does Well

1. **CLAUDE.md + AGENTS.md + apps/docs/AGENTS.md for AI agents** — shadcn has zero AI-agent context. Dash is ahead of the curve here; the layered architecture + banned imports + cardinal rules in `CLAUDE.md:27-34` are textbook agent-onboarding material. Keep iterating.

2. **Layered architecture explicit (`LAYERED-ARCHITECTURE.md` + `theme:` field on registry blocks)** — `AGENTS.md:6-27` defines `theme: "shared" | "ride" | "logistic" | "travel" | "marketplace" | "trellis-{tenantId}"`. Shadcn has one style at a time (currently `new-york-v4`); Dash supports multi-product theming as a first-class concern. **More mature than shadcn for a platform DS.**

3. **Branch-prefix table (`CONTRIBUTING.md:30-38`)** — shadcn just says "create a branch." Dash enumerates `feat/fix/docs/chore/refactor` with examples. Better contributor signal-to-noise.

4. **10-step component-add flow with terminal commands (`MAINTENANCE.md:171-226`)** — shadcn's CONTRIBUTING.md describes the flow in prose; Dash's MAINTENANCE.md gives copy-pasteable bash. **More operational.**

5. **Anti-patterns referenced from `dash-ai-rules.md` (`CONTRIBUTING.md:122-135`)** — six concrete don'ts (hard-code colors, force-uppercase useCode, hard-code 26 delivery statuses, banned imports, `axios.defaults` mutations). Shadcn has nothing comparable — Dash has *opinions* and codifies them. Internal DS done right.

---

## Sustainability + Bus Factor Analysis

**Shadcn** — bus factor = 1 (shadcn the person). Mitigations: massive community adoption (~80k GitHub stars), corporate sponsor (Vercel via v0), full automation (Changesets, dependabot, OIDC publish — anyone can fork-and-continue). If the maintainer disappears tomorrow, the project is forkable by any of 1000+ contributors. **Sustainability via community.**

**Dash** — bus factor = 1 (Irfan). Mitigations: PT Dash Elektrik salary backs the work; CEO-signed kill criteria provide an off-ramp; AlignUI Pro license is corporate, not personal. If Irfan leaves tomorrow, the project has **no automated CI, no Changesets, no documented succession plan** — the 10 downstream consumer repos would be stranded with no one to roll forward. The `CLAUDE.md:122` open question "Deputy maintainer (bus factor = 1 currently; Q3 2026 mandatory)" is **the single largest sustainability gap.**

**Concrete sustainability moves for Dash (ranked):**

1. **Q3 2026 hard deadline for deputy maintainer** — already planned per CLAUDE.md. Make it a calendar-blocked OKR, not a soft date.
2. **Materialize CI/CD this month** — without automation, succession is impossible. A deputy can't take over a manual release pipeline they didn't build.
3. **Document succession protocol** in a `MAINTAINERS.md` — primary unavailable → deputy promotes → kill criteria reviewed at 30/60/90 days.
4. **Automate the CHANGELOG** via Changesets — hand-edited CHANGELOGs die the moment the maintainer leaves.
5. **Externalize Dash's commitment** — get CEO Aditya to put DS funding in writing. Currently it's a side-of-desk effort by Irfan; without a budget line, it can be cut in a quarterly review without warning.

---

## Roadmap to Match Shadcn Operational Maturity

### Week 1 — Materialize the `.github/` directory (highest-leverage, lowest-risk)

- [ ] Create `.github/workflows/code-check.yml` (lint + format + typecheck, 3 parallel jobs).
- [ ] Create `.github/workflows/test.yml` (vitest, Node 20).
- [ ] Create `.github/ISSUE_TEMPLATE/{bug_report,feature_request,config}.yml` (3 files).
- [ ] Create `.github/PULL_REQUEST_TEMPLATE.md` (motivation/screenshot/downstream).
- [ ] Create `.github/dependabot.yml` (weekly npm, root + each `packages/*`).
- [ ] Add `.commitlintrc.json` at root + commitlint step in `code-check.yml`.
- [ ] Add `SECURITY.md` at root (short — DM Irfan, 24h ack SLA).
- [ ] Branch-protect `main`: require code-check + test green, require 1 approval (currently Irfan), no force-push.

**Deliverable**: every PR now has automated guards. Bus factor still 1, but the *machine* enforces quality even when the human is sleeping.

### Week 2-4 — Dash-specific automation

- [ ] `.github/workflows/registry-build.yml` (fail on uncommitted `public/r/*.json` diff after `pnpm registry:build`).
- [ ] `.github/workflows/audit.yml` (run `dash audit --fail-on-error` against changed registry items — gates banned imports, hardcoded hex, missing `theme:` field).
- [ ] `.github/workflows/signed-commits.yml` (copy shadcn verbatim).
- [ ] `.github/workflows/issue-stale.yml` (90-day stale, exempt `roadmap`+`next`+`incident`).
- [ ] `CODEOWNERS` at `.github/CODEOWNERS`: `* @irfanputra-design` initially.
- [ ] Add `MAINTAINERS.md` at root with deputy-plan placeholder.
- [ ] `lefthook`/`husky` pre-commit hooks (lint:fix + format:write on staged files).

**Deliverable**: registry drift detection, banned-import enforcement, stale-issue bot, succession scaffolding.

### Week 5-8 — Changesets + release automation

- [ ] Add `@changesets/cli` + `@changesets/changelog-github` dev deps.
- [ ] `.changeset/config.json` (`baseBranch: "main"`, `ignore: ["@dash/docs"]`, `access: "restricted"`).
- [ ] `.changeset/README.md` (explain to contributors how to add a changeset).
- [ ] `.github/workflows/release.yml` (push-to-main → Version PR → merge → tag + GitHub release).
- [ ] Migrate hand-written `CHANGELOG.md` entries to per-package CHANGELOGs (keep root CHANGELOG as narrative cross-cut).
- [ ] First Changeset-driven release: tag `v0.6.0`.

**Deliverable**: automated releases, contributor-driven changelog, semver discipline. Matches shadcn's release maturity.

### After 8 weeks — optional polish

- [ ] Discussion templates: `rfc.yml`, `component-request.yml`.
- [ ] Public `ROADMAP.md` linked from README (already exists at `apps/docs/ROADMAP.md`).
- [ ] Integrity check workflow (SHA256 of `public/r/*.json` on push to main).
- [ ] OIDC npm publish (if CLI ever ships to public npm).
- [ ] GPG-signed release commits (if compliance ever demands).

---

## Sources

### Shadcn (22 files)
- `/tmp/shadcn-ui/CONTRIBUTING.md` (194 lines)
- `/tmp/shadcn-ui/README.md` (17 lines)
- `/tmp/shadcn-ui/SECURITY.md` (10 lines)
- `/tmp/shadcn-ui/LICENSE.md` (21 lines)
- `/tmp/shadcn-ui/package.json` (90 lines)
- `/tmp/shadcn-ui/turbo.json` (59 lines)
- `/tmp/shadcn-ui/pnpm-workspace.yaml` (7 lines)
- `/tmp/shadcn-ui/.commitlintrc.json` (3 lines)
- `/tmp/shadcn-ui/.eslintrc.json` (32 lines)
- `/tmp/shadcn-ui/.kodiak.toml` (19 lines)
- `/tmp/shadcn-ui/prettier.config.cjs` (37 lines)
- `/tmp/shadcn-ui/.github/FUNDING.yml` (3 lines)
- `/tmp/shadcn-ui/.github/dependabot.yml` (46 lines)
- `/tmp/shadcn-ui/.github/changeset-version.js` (12 lines)
- `/tmp/shadcn-ui/.github/workflows/code-check.yml` (123 lines)
- `/tmp/shadcn-ui/.github/workflows/release.yml` (127 lines)
- `/tmp/shadcn-ui/.github/workflows/test.yml` (48 lines)
- `/tmp/shadcn-ui/.github/workflows/signed-commits.yml` (75 lines)
- `/tmp/shadcn-ui/.github/workflows/issue-stale.yml` (45 lines)
- `/tmp/shadcn-ui/.github/workflows/prerelease-comment.yml` (67 lines)
- `/tmp/shadcn-ui/.github/workflows/validate-registries.yml` (129 lines)
- `/tmp/shadcn-ui/.github/ISSUE_TEMPLATE/bug_report.yml` (86 lines)
- `/tmp/shadcn-ui/.github/ISSUE_TEMPLATE/feature_request.yml` (56 lines)
- `/tmp/shadcn-ui/.github/ISSUE_TEMPLATE/config.yml` (5 lines)
- `/tmp/shadcn-ui/.github/DISCUSSION_TEMPLATE/blocks-request.yml` (26 lines)
- `/tmp/shadcn-ui/.changeset/README.md` (9 lines)
- `/tmp/shadcn-ui/.changeset/config.json` (11 lines)
- `/tmp/shadcn-ui/.changeset/angry-stars-pick.md` (5 lines)
- `/tmp/shadcn-ui/scripts/sync-templates.sh` (39 lines)
- `/tmp/shadcn-ui/apps/v4/package.json` (151 lines)
- `/tmp/shadcn-ui/packages/shadcn/package.json` (129 lines)
- `/tmp/shadcn-ui/packages/shadcn/CHANGELOG.md` (839 lines, head preview only)

### Dash (11 files)
- `/Users/irfanprimaputra.b/dash-ds/CONTRIBUTING.md` (164 lines)
- `/Users/irfanprimaputra.b/dash-ds/README.md` (93 lines)
- `/Users/irfanprimaputra.b/dash-ds/CLAUDE.md` (122 lines)
- `/Users/irfanprimaputra.b/dash-ds/AGENTS.md` (72 lines)
- `/Users/irfanprimaputra.b/dash-ds/package.json` (22 lines)
- `/Users/irfanprimaputra.b/dash-ds/pnpm-workspace.yaml` (6 lines)
- `/Users/irfanprimaputra.b/dash-ds/CHANGELOG.md` (111 lines)
- `/Users/irfanprimaputra.b/dash-ds/COMMIT-PLAN-2026-05-20.md` (395 lines)
- `/Users/irfanprimaputra.b/dash-ds/apps/docs/MAINTENANCE.md` (323 lines)
- `/Users/irfanprimaputra.b/dash-ds/apps/docs/CLAUDE.md` (1 line)
- `/Users/irfanprimaputra.b/dash-ds/apps/docs/AGENTS.md` (3 lines)
- (verified absence) `/Users/irfanprimaputra.b/dash-ds/.github/` — does not exist
