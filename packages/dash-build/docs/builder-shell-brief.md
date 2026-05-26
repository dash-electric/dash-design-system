# Dash Build — Generate Workspace Shell Brief (Layer C)

## Purpose
Layer C spec per Dash design system layering. Lock IA + region + state contract for the Dash Build generate workspace (Surface #2 of the 3-surface architecture: Docs / Builder / Owner).

This doc references but does NOT replace:
- `design.md` (root) — Layer A taste/soul contract
- `apps/docs/registry/rules/dash-ai-rules.md` — Layer B deterministic rule contract
- Visual references in `packages/dash-build/references/` — Layer D

## Scope
- Surface #2 only (Dash Build generate workspace at `/dashboard`)
- NOT Surface #1 (Docs) or Surface #3 (Owner control plane)

## Information Architecture

Vertical split shell:
```
[ TOP BAR — single row, 4 clusters ]
[ LEFT RAIL — conversation + composer ]   [ CANVAS — preview / code ]
```

### Top Bar
- Always single row, no stacking.
- 4 clusters L→R: project meta, mode tabs, route chip, auth/actions.
- Cluster A: project name + thread title + run tag.
- Cluster B: mode tabs (Preview / Code, icon + label, active = primary fill).
- Cluster C: target route badge (`/route via NavLabel`).
- Cluster D: auth chips + share/publish CTAs.

### Left Rail
- Width: minmax(280px, 32%).
- Vertical flex: thread (flex 1, scrollable) + thinking inline + composer (pinned bottom).
- Thread: user messages = bordered card, builder messages = bare text. No avatars, no per-message timestamps (date separator allowed).
- Composer: textarea + small action toolbar BELOW (not above). Actions: attach + mode select + submit-icon.

### Canvas
- Full-bleed area, no wrapping shell chrome.
- Mode = Preview (iframe) | Code (file rail + content pre) | (future) Diff.
- Switching = swap canvas content entirely, not nested tabs.
- Clarify card surfaces as overlay above preview when status=clarifying.

### Anti-IA (forbidden)
- Multiple horizontal strips stacked at top
- Mid-chrome standalone progress strip (status lives in rail as inline word)
- Centered full-width composer dock (composer = rail-bound)
- Tabs INSIDE canvas region
- Anchor pill overload (max 3 chips at top: project · thread · run)
- Hero "What to build today?" inside active workspace
- Heavy harness wrapping around generated content

## State Contract

### Workspace States
- idle (no active run, repo selected) → real baseline iframe
- no-project → topbar empty + rail empty hint + composer disabled
- needs-auth (no OpenAI) → connect form in rail empty zone
- queued / generating → real baseline + "Thinking…" inline in rail
- clarifying → real baseline + clarify card overlay in canvas + "Awaiting answer" in rail
- preview-ready → generated preview iframe (with optional "Real baseline" toggle)
- code-ready → file rail + content (default when user clicks Code tab)
- failed → error chip in rail + previous preview retained

### Status Pill Vocabulary
- Map to existing PromptStatus enum values
- Display copy:
  - queued → "Queued"
  - generating → "Thinking…"
  - clarifying → "Awaiting your answer"
  - awaiting_approval → "Preview ready"
  - pr_created → "Published"
  - failed → "Failed"
  - completed → "Done"

## Preview Mode Contract (Truthful Preview)
Three modes, honest labeling required:
- **Real baseline** — iframe of staging URL or local dev server. Show ribbon: "Live staging · <host> · Open real app ↗".
- **Anchored harness** — fallback only when real source not reachable. Ribbon: "Anchored harness · simulated session".
- **Generated overlay** — generated preview.tsx mounted in route slot. Ribbon: "Generated change · N files · Foundation X/100".

Toggle "Real baseline ↔ Generated" available in canvas topbar when active run is ready. Default = Generated when ready, else Real baseline.

Never mask gap with fake harness when real source is reachable.

## Theme Decision
**Active decision: light-only.**
Rationale: dark rail + light canvas was tested (P1.2B) but conflicts with `design.md` "restrained neutral surfaces" + introduces tonal striping that confuses operational users. Lovable's dark rail works for Lovable's marketing-builder identity, not Dash's ops-tool identity.
Both rail + canvas use `--paper-2` / `--paper`.

Future: a dedicated dark mode toggle may flip BOTH surfaces simultaneously. NEVER mix.

## Composer Contract
- Position: rail-bound bottom (not centered, not full-width).
- Textarea: min-height 56-64px (per design.md density §).
- Toolbar (P1.3+): attach + mode select + submit-icon.
- Submit: Cmd/Ctrl+Enter shortcut + icon button.
- Disabled state when clarifying: textarea grayed + helper "Answer the card above".

## Region Anatomy (Class Selectors)
Documented:
- `.db-shell` — root vertical flex
- `.db-topbar` — single row grid `auto auto 1fr auto`
- `.db-split` — grid `minmax(280px,32%) 1fr`
- `.db-rail` — left dark side (NOW LIGHT per Theme Decision above)
- `.db-canvas-v2` — right side flex column
- `.db-canvas-stage` — tab panel container
- `.db-canvas-panel[hidden]` — must have `display: none`
- `.db-clarify-card` — clarify overlay in canvas

## Banned Variants
- `.db-chat-shell` (old 40/60 split) — DELETED
- `.db-anchor-bar` (3-row chrome top) — superseded by `.db-topbar`
- `.db-progress-strip` (6-stage standalone) — superseded by `.db-rail-thinking` inline
- `.db-prompt-strip` (centered full-width composer dock) — superseded by `.db-rail-composer`

## Implementation Test Contract
Render assertions every shell change must keep passing:
- `db-shell` present
- `db-topbar` present
- `db-split` present
- `db-rail` present
- `db-canvas-v2` present
- `db-prompts-region` hidden compat present (tests assert)
- `db-prompt-input` present (tests + client wire)
- `db-baseline-shell` present in baseline state
- OLD `db-chat-shell`, `db-chat-pane`, `db-anchor-bar`, `db-progress-strip` ABSENT
- No raw hex in net-new CSS (audit script enforces — see CR-5)

## Update Discipline
- This doc must be updated FIRST before any structural shell change.
- Visual references go to `packages/dash-build/references/` with date-stamp filename.
- Diff against this doc must be part of PR review for shell changes.
- New shell pattern not represented here = governance gap, halt implementation, update doc first.

## References Library
Anchor references currently in scope:
- `references/lovable-builder-2026-05-25.png` — Lovable canvas-first IA (single topbar, dark rail, full-bleed canvas)
- (placeholder) `references/claude-builder-*.png`
- (placeholder) `references/linear-issue-*.png`

Methodology: study multiple references, do not copy single, do not average to safe middle. Each new shell decision must trace to a reference choice + design.md taste alignment.

## Open Questions
- Mode tabs: 2 (Preview/Code) now, planned 4 (+ Docs + Hosting) when Surface #1 + #3 ship?
- Compose toolbar enrichment timing: P1.3?
- Theme toggle: in scope for P2 or later?
- Diff view: when does it become first-class third tab?
