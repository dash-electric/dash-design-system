# Theme — `ride` (Dash Ride)

**Status:** default. This was the implicit theme before the Layer 2 refactor;
making it explicit now.

## Intent

Energetic, decisive, mobility-forward. Used by **driver app**, **dispatcher
console**, **ride operations** surfaces — environments where the user is
on-the-move, often time-pressured, and needs the next action to *pop*.

Accent: **mobility green `#16a34a`** (Tailwind green-600). Pairs cleanly with
Dash Purple `#5e2aac` while keeping enough hue separation to read as a distinct
"go / accept / dispatch" signal without colliding with semantic success
(`--state-success-base` foundation green).

## When this theme applies

- Driver mobile app (mitra-facing)
- Dispatcher / batch console
- Ride-ops dashboards
- Internal tools for ride product line

## Notes

- Primary CTAs still use `--primary-base` (Dash Purple) for brand identity.
- `--theme-accent-*` powers secondary affordances, status pulses, "active
  trip" highlights, map markers, badges.
- Voice override: see `voice-overrides.md` — slightly faster cadence, mitra
  formality preserved (Anda, not kamu — see CLAUDE.md cardinal rule #5).
