# Dash Design Contract

This file is the global design contract for Dash Design System generation.
It is intentionally repo-agnostic: every Dash product repo should receive the
same interaction quality, visual rhythm, and brand behavior even when its
framework, folder structure, or data-fetching style differs.

Repo-specific implementation details belong in repo skills, `dash info`, or
the Adaptation Layer. This file defines what the UI must feel like.

## Purpose

Dash UI is an operational product surface for Indonesian mobility, logistics,
finance, and partner workflows. Generated UI should feel calm, efficient, and
trustworthy. It should help teams scan, compare, approve, correct, and move
work forward with low ambiguity.

The design system must keep the same product character across:

- `portal-v2`
- `backoffice`
- `basecamp`
- `react-fleet`
- future product and Trellis tenant repos

## Non-Negotiable Invariants

- Use Dash registry components or existing repo primitives before creating
  local UI from scratch.
- Use semantic tokens and CSS variables. Never hard-code brand hex values in
  generated UI.
- Keep operational screens dense but readable. Prefer scan-friendly tables,
  toolbars, filters, status chips, and progressive detail over decorative
  marketing layouts.
- Do not place cards inside cards. Cards are for repeated items, modals, and
  genuinely framed tools.
- Keep card radius at 8px or less unless the target repo already has a stricter
  tokenized radius rule.
- Use familiar controls: icon buttons for tools, tabs for views, segmented
  controls for modes, switches for binary settings, and menus for option sets.
- Every async workflow needs a visible loading, empty, error, and success state.
- Every destructive or financial action needs confirmation and an audit-aware
  explanation path.
- Text must fit its container on desktop and mobile. Do not use viewport-scaled
  font sizes.
- Do not rely on decorative gradients, blobs, bokeh, or generic illustration to
  make an internal tool feel designed.
- Treat this file as the active design system whenever it is available. Do not
  ask the user to choose a visual direction unless the target repo has no Dash
  design contract or the user explicitly wants an exploration.
- Convert rough user prompts into context before visual generation. A vague UI
  request must produce an intake/PRD/design/TRD trail, even when the small-task
  version is kept in memory.

## Layout Rhythm

Dash operational pages should start with the working surface, not a landing
hero. First viewport priority:

1. Current context or object title.
2. Primary filters, search, or task controls.
3. Core data surface.
4. Secondary detail, preview, or activity panel.

Use these layout defaults unless the target repo already establishes another
pattern:

- Toolbars are compact and aligned to the data they control.
- Filters live near the data surface, not in isolated marketing sections.
- Tables should support scanning: clear row height, stable columns, status
  chips, and right-aligned numeric values.
- Detail pages should separate identity, status, evidence, actions, and audit
  trail.
- Modals should be focused and short. For complex flows, prefer drawer or
  full-page workflow.
- Mobile layouts should collapse to one primary task per screen.

## Workspace Density

Dash app chrome should feel like a focused workspace, not a marketing page.
Use these density defaults unless the target repo already has tighter tokens:

- App shell padding: 12-16px desktop, 10-12px mobile.
- Top bars and status bars: 44-52px preferred height.
- Chat/task bubble padding: 6-8px vertical, 10-12px horizontal.
- Chat/task bubble line-height: 1.35-1.45.
- Chat/task thread gap: 8-10px.
- Composer textarea minimum height: 56-64px for normal prompts.
- Workflow surface radius: 10-14px. Avoid 20px+ radii for operational shells.
- Cards in dense tools: radius 6-8px, shallow shadow or border, not both unless
  the component is floating above the workspace.
- Use hairline borders and spacing changes before large shadows, blur, or
  oversized rounded containers.

If a surface looks soft, puffy, or inflated, reduce padding first, then radius,
then shadow. Preserve readable hit targets for actual controls.

## Component Behavior

Generated UI should preserve expected behavior across repos:

- Buttons: one primary action per region; secondary actions stay visually
  quieter.
- Forms: use local state and explicit validation. Show field-level errors near
  the field and a summary only when it helps.
- Tables: include empty state, loading skeleton, error recovery, and pagination
  or progressive loading when the data set is not obviously small.
- Filters: show active filter state and a clear reset path.
- Status: use domain state labels from the glossary. Do not invent states.
- Evidence: proof images, payment data, signatures, KYC, and approvals must
  surface provenance and audit status.
- Navigation: preserve the target repo navigation model. Do not introduce a
  new sidebar, shell, or route pattern unless explicitly requested.
- Prompt/composer UIs: keep the text box compact, keep actions close to the
  input, and show progress in the canvas rather than making the chat transcript
  the dominant visual object.
- Progress UIs: expose the active stage and completed stages. A user should be
  able to tell whether the system is discovering, designing, coding, validating,
  or previewing.

## Voice And Copy

Copy should be contextual, not one-size-fits-all.

- Mitra-facing and legally sensitive flows default to formal, clear language.
- Internal operator tools may be concise and operational.
- Avoid slang in generated UI copy.
- Avoid explanatory text that describes the UI itself. Use labels and states
  that make the next action obvious.
- Error copy should say what happened and what the user can do next.
- Empty states should explain the absence of data and provide the next relevant
  action when one exists.

## Visual Character

Dash should feel precise, grounded, and fast. It should not feel like a generic
AI dashboard or SaaS marketing template.

Use:

- restrained neutral surfaces
- Dash semantic color only for meaning and hierarchy
- compact status chips
- predictable spacing
- clear affordances
- sober motion for feedback

Avoid:

- oversized hero compositions inside apps
- purple-only screens
- nested card stacks
- generic glassmorphism as the primary system
- frosted-glass app shells for operational tools
- random shadows or radii
- raw hex color values
- ornamental SVGs that do not reveal product state

## Generation Critique

Before accepting generated UI, run a short critique against these dimensions:

- Philosophy: does it feel like Dash ops software, not a generic AI SaaS page?
- Hierarchy: can a busy operator find the object, state, evidence, and action?
- Execution: are spacing, alignment, radius, type, and state styling precise?
- Specificity: does copy and data use Dash domain language and real states?
- Restraint: did the design avoid decorative flourishes that do not help work?

Any failed dimension must either be fixed before preview or called out as a
known limitation in the review artifact.

## Cross-Repo Generation Rule

When generating for a target repo:

1. Load this design contract first.
2. Load Layered Architecture and foundation rules.
3. Load the repo-specific stack mandate.
4. Match the repo's implementation style.
5. Preserve the same Dash product character.
6. Emit a compact state-coverage checklist for UI work: loading, empty, error,
   success, permission/disabled, and long-content behavior.

If repo patterns conflict with this design contract, preserve working repo
behavior and explain the conflict. If the conflict touches Layer 0 foundation,
stop and surface it instead of generating a silent override.

## Anti-Patterns

Reject or rewrite output that includes:

- `react-hook-form`, `zod`, TanStack Query, or SWR in existing Dash repos
- hard-coded Dash Purple or custom accent hex values
- card-inside-card layouts
- decorative gradient/blob-heavy internal tools
- generic admin dashboards with no Dash domain language
- new status values not present in the domain glossary
- missing audit trail for legal, financial, proof, KYC, approval, or payment
  flows
- generated copy that says how to use the UI instead of making the UI clear
- inflated chat/task cards that bury short user prompts in oversized padding
- progress screens with no active stage, no elapsed/error feedback, or no next
  recovery action

## Definition Of Done

A generated UI is Dash-consistent when:

- it uses Dash tokens or registry primitives
- it follows the target repo's stack
- it preserves operational density
- it shows loading, empty, error, and success states
- it uses domain state names correctly
- it avoids banned dependencies and raw hex
- it respects audit requirements
- it passes the generation critique dimensions
- it includes state coverage for the surface it changes
- it would still feel like Dash if moved from one repo to another
