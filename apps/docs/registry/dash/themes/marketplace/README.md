# Theme — `marketplace` (Dash Marketplace)

**Status:** placeholder. Spin-up theme for Dash Marketplace product line.

## Intent

Warm, commerce-flavoured, conversion-oriented. Used by **storefront**,
**checkout**, **merchant console** — environments where price, promo and
"buy" signals drive engagement.

Accent: **commerce yellow `#ca8a04`** (Tailwind yellow-600 / amber-ish gold).
Hue chosen for: (1) commerce/promo connotation (gold = premium, price tags),
(2) clear separation from semantic warning yellow (which uses Layer 0
`--state-warning-base`), (3) warm pair with Dash Purple.

WCAG caveat: yellow accents are notoriously low-contrast on white. We
default to **`--theme-accent-700` (`#854d0e`)** for any text-on-white usage
and reserve `--theme-accent-500/600` for non-text UI (price tags, badges,
icon fills) — see `colors.css` AA notes.

## When this theme applies

- Storefront listing pages
- Cart / checkout flows
- Promo banners + price tags
- Merchant seller console

## Notes

- Primary CTAs use `--primary-base` (Dash Purple).
- `--theme-accent-*` for price highlights, "Promo" pills, savings badges,
  "Top pick" tags.
- Voice override: benefit-first, no manipulative scarcity (see
  `voice-overrides.md`).
