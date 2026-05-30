# Contributing to Dash Design System

Thanks for contributing. This repo houses the Dash registry, CLI, MCP server, and Skill package. All 10 team members at Dash pull from this — every change ripples downstream. Read this once before your first PR.

> **Internal only**: Dash Tech team. By contributing, you agree this work is internal-only per [`apps/docs/NOTICE.md`](apps/docs/NOTICE.md) and AlignUI Pro license. No external redistribution.

---

## Quick start — add a new component (10 steps)

The canonical 10-step flow lives in [`apps/docs/MAINTENANCE.md` §5](apps/docs/MAINTENANCE.md#5-add-a-new-component-single-most-common-task). TL;DR:

1. Branch: `feat/component-<name>` (e.g. `feat/component-rating-stars`).
2. Pull source from Figma / AlignUI Pro (Figma MCP `get_design_context`).
3. Write component in `apps/docs/registry/dash/ui/<name>.tsx` — anatomy: `forwardRef` · `data-slot` · `cva` variants · `@/registry/dash/lib/utils`.
4. Add entry to `apps/docs/registry.json` items[] (name, type, deps, files).
5. Build registry: `pnpm --filter @dash/docs build` (regenerates `public/r/*.json`).
6. Add docs page: `apps/docs/app/(docs)/docs/components/<name>/page.tsx` using `DocsPageShell` + `DocsHeader` + `DocsSection` + `DocsExample`.
7. Type-check + visual: `pnpm tsc --noEmit && pnpm --filter @dash/docs dev` → eyeball `http://localhost:3000/docs/components/<name>`.
8. Smoke: `bash apps/docs/scripts/smoke.sh http://localhost:3000 ""`.
9. Commit (see [Commit messages](#commit-messages)) + push + `gh pr create --fill`.
10. After merge: Vercel auto-deploys. Slack `#design-system`: `@dash/<name> shipped — install: dashkit add <name>`.

For **blocks / templates / patterns**, same flow with `type: "registry:block" | "registry:page" | "registry:pattern"` and the file in `registry/dash/blocks/` / `registry/dash/templates/` / `registry/dash/patterns/`. Templates need `target: "<consumer-path>"` so `dashkit add` knows where to write.

---

## Branch naming

| Prefix | Use for | Example |
|---|---|---|
| `feat/<name>` | New component, pattern, CLI flag, MCP tool | `feat/use-code-field` |
| `fix/<name>` | Bug, regression, broken docs page | `fix/data-table-empty-state` |
| `docs/<name>` | Docs-only edit (no source change) | `docs/contributing-update` |
| `chore/<name>` | Tooling, deps, infra, build config | `chore/upgrade-next-17` |
| `refactor/<name>` | Internal restructure, no behaviour change | `refactor/registry-build` |

Use kebab-case. Keep it under ~5 words.

---

## Commit messages

Format: **[Conventional Commits](https://www.conventionalcommits.org/)** + Co-Authored-By Claude trailer.

```
<type>(<scope>): <short summary>

<optional body — explain why, not what>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Types: `feat` · `fix` · `docs` · `chore` · `refactor` · `test` · `perf` · `style`.

Scope examples: `(rating-stars)` · `(cli)` · `(mcp)` · `(registry)` · `(docs)` · `(skill)`.

Examples:

```
feat(rating-stars): add @dash/rating-stars component

Adds the half-step rating input requested by the basecamp team.
Mirrors Figma node 4521:9018. Anatomy follows data-slot pattern.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

```
fix(use-code-field): preserve case-sensitive input

Was force-uppercasing 6-digit referralCode, breaking
policy_one_time_codes lookup which is case-sensitive.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Keep the summary line under 72 chars. Use the body to explain **why**, not what — the diff shows what.

---

## PR workflow

```
branch  →  push  →  open PR  →  autoplan review  →  address feedback  →  merge
```

1. Push to `feat/...` branch.
2. `gh pr create --fill` (or via GitHub UI).
3. The PR template prompts for: motivation, screenshots (visual change), and which downstream repo will consume.
4. **Autoplan review** runs automatically — pulls the diff through CEO + design + eng + DX gates. Surface decisions appear as PR comments.
5. Address each review comment (push fixes as new commits, do **not** force-push during review).
6. Once green + 1 approval (Irfan during Phase 1, anyone after handoff): squash-merge to `main`.
7. Vercel auto-deploys within ~60s.
8. Post in `#design-system` Slack if shipping a user-facing change.

**Never:**
- Force-push to `main` (protected branch).
- Skip pre-commit hooks (`--no-verify`).
- Amend a commit after pushing for review (creates noise — new commit instead).

---

## Code style

| Topic | Rule |
|---|---|
| Language | TypeScript strict (no `any` without a `// reason:` comment). |
| Files | `.tsx` for components, `.ts` for utilities. |
| Indentation | **Tabs** (matches existing `apps/docs/` source). Spaces in YAML / JSON. |
| Imports | Absolute via `@/*` alias. No deep `../../../` relative imports. |
| Components | `forwardRef` + `data-slot` + `cva` variants — see existing `apps/docs/registry/dash/ui/button.tsx` as the canonical reference. |
| Naming | PascalCase components, camelCase functions, kebab-case files. |
| State | Native `useState` + Jotai atoms preferred. Do **not** add `react-hook-form`, `zod` (registry-level), or `react-query` to registry source — that's downstream Adaptation Layer territory. |
| Tests | Vitest. Prompt-harness fixtures in `packages/skill/tests/fixtures/`. |
| Lint | `pnpm lint` clean. ESLint config: `apps/docs/eslint.config.mjs`. |

If `.editorconfig` is added later, defer to it. For now: tabs for source, 2-space JSON/YAML, LF line endings, UTF-8.

---

## Anti-patterns

Do **not** introduce these into registry source. They're enumerated in [`apps/docs/dash-ai-rules.md`](apps/docs/dash-ai-rules.md) (v2, 30 anti-patterns across 5 FE + 5 BE Adaptation Layers).

Highlights — registry MUST NOT:

- Hard-code colors (use `--dash-*` CSS variables / Tailwind tokens).
- Force-uppercase `useCode` / `referralCode` input (case-sensitive per `policy_one_time_codes`).
- Assume number-typed status envelopes (`ts-delivery-service` returns string `"Success"`).
- Bake in `react-hook-form` / `zod` / `react-query` (banned in portal stack).
- Use `axios.defaults.baseURL` mutations (breaks SSR + multi-tenant).
- Hard-code the 26 delivery statuses inline (always import shared enum).

If your component **needs** one of these, file an issue first — there's usually a Dash-specific pattern that supersedes it.

---

## Where to file issues

| Issue type | Where |
|---|---|
| Bug in registry component | `dash-tech/dash-ds` → Issues → `bug` label |
| Feature request (new component / pattern) | `dash-tech/dash-ds` → Issues → `enhancement` label |
| CLI bug or feature | Same repo, `area:cli` label |
| MCP server bug | Same repo, `area:mcp` label |
| Docs typo / unclear instruction | Same repo, `area:docs` label — or open a `docs/<name>` PR directly |
| Live incident (`ds.dash.com` down) | Slack `#design-system` first, GitHub issue after with `incident` label |
| Security concern | DM Irfan directly. Do not open a public issue. |

Include: repo name + version, reproduction steps, expected vs actual, screenshots (if visual), `dashkit doctor` output (if CLI / MCP).

---

## Sign-off

By contributing, you agree:

- This work is **internal-only** per [`apps/docs/NOTICE.md`](apps/docs/NOTICE.md).
- Your contribution is covered by the AlignUI Pro license held by Dash Tech.
- External redistribution is prohibited.
- Co-authoring with Claude / Cursor / other AI is welcome — credit via `Co-Authored-By:` trailer.

Questions about scope or licensing → Irfan (`irfanprima34@gmail.com`) or `#design-system` Slack.
