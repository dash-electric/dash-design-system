# Phase 2 — Component Audit Summary

**Date**: 2026-05-17
**Branch**: `feat/figma-parity-v2`
**Method**: 9 parallel autonomous audit agents, each scoped to 1 component category.

## Coverage

60+ components audited across 9 categories:

| Agent | Category | Components | Commit |
|---|---|---|---|
| A | Button family | 6 (button/icon-button/link-button/fancy-button/social-button/button-group) | `4dd6fda` |
| B | Form inputs | 10 (input/textarea/checkbox/radio/switch/slider/otp/password/toggle/toggle-group) | `3a3fee3` |
| C | Display atoms | 8 (avatar/tag/divider/kbd/skeleton/spinner/hint/brand-mark) | `2ec2daa` |
| D | Overlays | 10 (tooltip/popover/modal/drawer/sheet/alert-dialog/hover-card/dropdown/context/menubar) | `7b4168d` |
| E | Navigation | 8 (breadcrumb/pagination/tabs/segmented/step/dot/nav-menu/sidebar) | `0df3ad2` |
| F | Feedback | 6 (alert/toaster/notification-feed/activity-feed/progress-bar/progress-circle) | `1101ed4` |
| G | Data display | 6 (table/data-table/card/stat/chart/empty-state) | `1ea1dda` |
| H | Pickers | 10 (select/combobox/date-picker/calendar/time/color/file-upload/command/rich-editor/filter) | `5d71b3d` |
| I | Misc | 11 (accordion/collapsible/carousel/rating/scroll-area/resizable/aspect-ratio/label/field/form/hint) | `eddcd17` |

Plus 2 cross-cutting token fixes (`314ab88`, `e930235`).

## Decisions logged

**86 total decisions** (D1-D86) in `figma-audit/decisions.md`. Highlights:

- **D1** — state-X-light/lighter: alpha → solid (`-200`/`-50`) per multi-agent feedback
- **D3** — Primary brand stays purple (Figma default = sky)
- **D8** — Avatar 9-size scale (BREAKING for `size="2xl"`/`size="3xl"` callers)
- **D11** — BrandMark remapped to Key Icons node (BREAKING size shifts)
- **D17** — Button keeps Dash xs..xl API; default `md` (Figma default = `lg`)
- **D29** — Radio inverted (inner-dot pattern via Figma exact)
- **D41-D56** — Navigation 16 decisions including 3 BREAKING visual diffs (Tabs/Step-Indicator/Dot-Stepper)

## Hold-list

119 lines, ~50+ items in `figma-audit/hold-list.md`. Categories:
- Component variants not yet ported (Compact Button, Button Group items, Sidebar feature cards, etc.)
- Dash extensions without Figma source (Skeleton, Spinner, Form, Field, Aspect-Ratio, Resizable)
- Token alignment items (now mostly resolved in `e930235`)

## Breaking changes summary

Consumers may need to update:
1. **Avatar** size labels — old `2xl`/`3xl` shifted
2. **BrandMark** size labels — old `md`/`lg` shifted
3. **Tabs** `pill` variant — fully reimplemented from track to no-track
4. **Step-Indicator** marker size 28→20, connector hairline → chevron
5. **Dot-Stepper** removed stretch-to-pill animation
6. **Card** default padding 20→16px
7. **StatValue** default size smaller (was text-3xl, now 24px)
8. **Table** header weight 600→500, color sub-600→soft-400
9. **Tag** gap 4px → 2px

## Concerns to address Phase 5

- **Pre-existing typecheck errors** in 3 docs pages (`date-picker/page.tsx`, `tooltip/page.tsx`, `dot-stepper/page.tsx`) — out of scope per agent constraints, schedule cleanup commit.
- **Visual regression QA** — 9 breaking-ish visual diffs above need eyeball check against Figma frames before merge to main.
- **Multi-mode validation** — light/dark mode rendering not yet tested per-component (Phase 5).

## Token catalog (post-Phase 2)

- **~430 CSS vars** in `app/globals.css` (was 526 pre-Phase 1, 276 post-bug, now 430+)
- **Full coverage**: foundations (slate+gray+9 colors), state semantic (11 statuses × 4 tones), semantic light+dark (bg/text/icon/stroke/illustration), radius (12), spacing (13), shadows (composed multi-layer), typography (22 classes), bare aliases, namespaced state aliases.

## Next

- **Phase 3** — Blocks/Templates extraction from Sector pages (HR/Finance/Marketing)
- **Phase 5** — Multi-mode + visual regression pass
- **Icons** — HOLD per user instruction
