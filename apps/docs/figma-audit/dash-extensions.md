# Dash Extensions (beyond Figma)

Components/blocks/templates/tokens that **diverge** from AlignUI Pro Figma source. Kept as Dash brand identity.

## Brand overrides

| Token | Figma default | Dash override | Reason |
|---|---|---|---|
| `--primary-*` | sky (`06-foundations.sky.*`) | purple (`--dash-purple-*`) | Dash company brand color = #5e2aac |
| neutral alias | slate (`02-neutral.* → slate`) | gray (`--dash-gray-*` retained) | Dash chose warmer gray scale; slate scale ALSO emitted for Figma 1:1 components |

## Dash-only components (no Figma equivalent)

- `registry/dash/blocks/mitra-suspend-page` — Dash Express ops UI (Auto-Suspend Mitra Reservasi)
- `registry/dash/templates/halo-dash-3pane` — Halo-dash backoffice 3-pane shell
- `registry/dash/templates/phase7-results-page` — PT Box trader dashboard
- `registry/dash/templates/mitra-suspend-page` — Dash Express ops page

## Auth blocks — provenance varies (verify per block before re-stylization)

13 auth blocks exist with mixed provenance:

| File | Likely source | Status |
|---|---|---|
| `auth-login-apex.tsx` | "source auth block 4" comment | Dash-curated layout |
| `auth-login-key.tsx` | "source auth block 5" comment | Dash-curated layout |
| `auth-login-phoenix.tsx` | "source auth block 3" comment | Dash-curated layout |
| `auth-register-aurora.tsx` | matched naming convention | Dash-curated layout |
| `auth-register-key.tsx` | matched naming convention | Dash-curated layout |
| `auth-register-solaris.tsx` | matched naming convention | Dash-curated layout |
| `auth-reset-password-key.tsx` | matched naming convention | Dash-curated layout |
| `auth-verification-key.tsx` | matched naming convention | Dash-curated layout |
| `login-01.tsx`, `login-02.tsx`, `login-03.tsx` | numbered shadcn-style | Dash-curated layout |
| `signup-01.tsx`, `signup-02.tsx`, `signup-03.tsx` | numbered shadcn-style | Dash-curated layout |
| `forgot-password-01.tsx` | numbered shadcn-style | Dash-curated layout |
| `verification-otp.tsx` | OTP wrapper | Dash-curated layout |

All use Dash UI components + semantic tokens. Sector-specific auth (`hr-login.tsx`, `finance-login.tsx`, `marketing-login.tsx`) are Figma-sourced from respective sector pages.

**Strategy**: Keep both layers. Generic auth-* / login-* / signup-* serve as Dash defaults; sector-specific override per industry. PE picks based on context.

## Form/composite primitives (no Figma source)

- `aspect-ratio.tsx` — Radix re-export utility
- `resizable.tsx` — react-resizable-panels splitter
- `form.tsx` — react-hook-form integration wrapper
- `field.tsx` — layout-only stack primitive
- `carousel.tsx` — Embla-powered composite
- `kbd.tsx` — keyboard key visual indicator (no AlignUI Pro equivalent)
- `skeleton.tsx` — loading placeholder
- `spinner.tsx` — indeterminate loader (AlignUI ships determinate Circular Progress only)
- `data-table.tsx` — TanStack Table wrapper (no Figma source; complementary to Figma `table.tsx`)
- `chart.tsx` — Recharts wrapper (no Figma chart system)

## Convention

When pulling new Figma components, the agent MUST:
1. Use `--primary-*` for any "primary" / "brand" surface (auto-becomes purple in Dash)
2. Use `--dash-gray-*` for neutral if component is Dash-product UI
3. Use `--dash-slate-*` if component is AlignUI-template port (1:1 Figma)
4. Document any new divergence in this file
