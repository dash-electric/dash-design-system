# Dash Build Design Brief — Workspace, Repo Sync, and DS Evolution

## Audience & Context

Primary audience:
- internal product designers
- PMs / operators
- engineers reviewing generated output
- workspace owners managing publish safety

User mindset:
- busy, operational, context-switching
- wants confidence, not novelty
- needs to know what changed, where, and whether it is safe

This is not a marketing dashboard. It should feel like precise internal tooling.

## Existing Pattern To Reuse

- Root `design.md` is the visual and behavioral authority.
- Current builder split layout (chat + preview) is a useful seed, but must mature into a project shell.
- Dash operational products favor dense layouts, clear hierarchy, explicit status, sober motion, and minimal decoration.

## Layout Strategy

Recommended shell direction:
- **Left rail:** projects, recent threads, running work
- **Main conversation pane:** active thread / planning / generation log
- **Preview pane:** baseline preview, generated preview, or patch preview
- **Right inspector:** context pack, files touched, validation, DS gap candidates, publish state
- **Top bar:** project, repo, branch, auth, sync status, environment, owner actions

Key visual rule:
- the builder itself must demonstrate the same product discipline it asks generated output to follow

## Key States

### Builder States
- Home / no project selected
- Project selected, no thread yet
- Thread planning
- Clarifying
- Generating
- Preview ready
- Needs review
- Publish blocked
- Published
- Failed
- Stale after upstream sync

### Preview States
- baseline preview available
- generated preview mounted
- patch preview fallback
- auth blocked / harness fallback
- validation warning
- DS gap detected

### DS Review States
- no DS gap
- component candidate detected
- block candidate detected
- candidate approved for docs/registry
- candidate rejected / one-off only

## Components / Blocks

New or emphasized builder components likely needed later:
- Project switcher
- Thread list
- Run queue / status panel
- Sync status chip
- Branch/base commit chip
- Validation summary card
- DS candidate card
- Publish gate card
- Artifact history panel

These should follow Dash foundation and avoid generic AI chat ornamentation.

## Token & Theme Requirements

- Cite and follow root `design.md`
- Use Dash semantic tokens only
- No raw accent hex
- Keep density operational, not airy SaaS
- Highlight status through semantic chips, not decorative panels
- Ensure the builder can visually distinguish: preview, stale, blocked, published, candidate

## Accessibility Notes

- clear keyboard focus for project/thread/run selection
- explicit labels for status chips and publish actions
- error and stale warnings must be readable without relying on color alone
- inspector panels should remain navigable for dense operational use

## Anti-Patterns To Avoid

- generic AI dashboard look
- oversized hero/chat treatment
- duplicated shell metaphors inside preview + builder
- hidden publish risk
- burying DS gap information in logs only
- treating docs/registry debt as an afterthought

## design.md Management Notes

Because UI quality is a top-level concern for Dash Build, any future builder-shell or DS-evolution work should trigger a review of:
- root `design.md`
- Dash foundation/cardinal rules
- docs/registry coverage for reused vs missing patterns

If the builder UI starts introducing patterns that are not represented in Dash docs, that is a governance bug, not only a docs TODO.
