# Theme — `trellis-tenant` (template)

**Status:** template — NOT a real theme. Fork this directory and rename to
`trellis-<tenantId>` for each Trellis SaaS customer.

## Intent

Generic starting point for **Trellis SaaS tenants** to brand their instance
on top of Dash DS. Trellis is the multi-tenant SaaS productisation of Dash —
external customers don't get Dash Purple as their brand, but they DO inherit
Layer 0 + Layer 1 (foundation + primitives) for free.

This template ships with a **neutral grey accent (`#6b7280`)** as a safe
placeholder. The Phase C CLI (`dash init --theme=trellis-tenant --tenant=acme`)
will:

1. Clone this directory to `themes/trellis-acme/`.
2. Prompt for primary + accent hex.
3. Validate the supplied hex against WCAG AA contrast.
4. Generate the colour ramp via OKLCH scaling.
5. Replace placeholders in `manifest.json`, `README.md`, `voice-overrides.md`.

## What tenants MAY override

- `--primary-base` (their own brand colour replacing Dash Purple)
- `--theme-accent-*` ramp (any AA-passing hue)
- `--font-display` via consumer `next/font` import
- Voice deltas (tone for their audience)

## What tenants MUST NOT override

- Layer 0 foundation tokens (radii, spacing, type ramp, motion, semantic
  colours like `--state-error-base`).
- Layer 1 primitive internals.
- A11y floor (focus rings, target sizes).

These are CI-enforced via `dash audit` running against tenant repos.

## When to use this template

Forking starter for any new Trellis tenant onboarding. Do NOT use it as a
"real" theme in the Dash family — that's what `ride/`, `logistic/`,
`travel/`, `marketplace/` are for.
