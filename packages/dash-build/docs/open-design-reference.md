# Open Design Reference Adoption

Status: adopted as reference material, not vendored.
Local copy: `/Users/irfanprimaputra.b/References/open-design`
Upstream: `https://github.com/nexu-io/open-design`

Open Design is close to Dash Build in shape: local-first generation, multiple
agent backends, portable design-system files, skill routing, artifact previews,
and a browser UI that treats prompts as a workspace. Dash Build adopts the
parts that improve context quality and UI consistency while keeping Dash's own
multi-product, theme-aware registry model.

## What We Adopt

| Open Design pattern | Dash Build adaptation |
| --- | --- |
| Active `DESIGN.md` per design system | Root `design.md` is the active Dash contract for every target repo. |
| First-turn discovery form | `dash-intake` asks only blockers before PRD/design/TRD. |
| Deterministic design directions | Only used when no Dash design contract exists or user requests exploration. |
| Craft docs for quality | Folded into `design.md`: density, typography, state coverage, critique. |
| Progress checklist | Canvas shows pipeline stages: PRD, design, Skill, Codex, validate, preview. |
| Sandboxed artifact preview | Dash Build preview remains local and GitHub-optional until PR creation. |
| Skill metadata/routing | `docs/skill-routing.md` defines Dash stages and reusable local skills. |
| Self-critique before artifact | Dash critique dimensions gate generated UI before preview/review. |
| Inline question forms | Clarifications render inside the chat instead of forcing a new page. |
| Resizable split workspace | Chat and canvas width can be adjusted without leaving the dashboard. |
| API-key-friendly auth | API keys are treated as the portable default; Codex login is one local option. |

## What We Do Not Copy

- We do not vendor Open Design runtime packages.
- We do not replace Dash Skill v4, Layered Architecture, registry rules, or
  theme routing.
- We do not allow freeform visual directions to override Dash tokens.
- We do not treat every task as a long interview. Small, safe changes stay
  lightweight.
- We do not generate deployable blocks without Dash `theme` metadata.

## Dash-Specific Rules

Dash Build differs from Open Design because it targets existing production
repos and a theme-aware design system:

1. Resolve repo to theme before generation.
2. Load `design.md`, Layered Architecture, registry rules, and repo stack rules.
3. Ask clarification only when the answer changes product scope, design
   pattern, data/API, audit behavior, or implementation path.
4. Produce PRD/design/TRD context before Codex changes files.
5. Run critique and state coverage before preview is considered complete.
6. Keep GitHub optional for local preview; require GitHub only for real PRs.

## UI Lessons For Dash Build Itself

The Dash Build dashboard should be a compact workspace:

- Chat bubbles are task messages, not hero cards.
- The canvas should dominate during generation.
- Status and auth chips should be visible but quiet.
- Progress stages should make it obvious whether the system is thinking,
  coding, validating, blocked, or ready.
- Clarification questions should stay in the conversational flow as compact
  forms with obvious choices.
- The chat/canvas split should be adjustable because long prompts and visual
  review need different amounts of space.
- Glass, blur, oversized radius, and large vertical padding are anti-patterns
  for this tool unless used sparingly for a modal or floating overlay.

## Source Areas Reviewed

- `README.md` for product model and local-first positioning.
- `CONTEXT.md` for glossary and artifact concepts.
- `apps/daemon/src/prompts/discovery.ts` for discovery, critique, and artifact
  discipline.
- `apps/daemon/src/prompts/directions.ts` for deterministic direction choice.
- `apps/daemon/src/skills.ts` for skill metadata/routing.
- `apps/daemon/src/design-systems.ts` for portable design-system loading.
- `craft/*` for typography, color, state coverage, accessibility, and
  anti-slop checks.
- `design-systems/*/DESIGN.md` for practical system file structure.
