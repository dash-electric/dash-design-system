# Theme — `logistic` (Dash Logistic)

**Status:** placeholder. Spin-up theme for Dash Logistic / Express delivery
product line.

## Intent

Industrial, urgent, batch-throughput oriented. Used by **warehouse scanners**,
**courier batch ops**, **fleet logistics dashboards** — environments dense with
status counters and queue states.

Accent: **delivery orange `#ea580c`** (Tailwind orange-600). Hue chosen for:
(1) high attention without competing with semantic error red,
(2) warmth that reads "delivery / logistics" in industry-standard colour
language (DHL, Amazon Prime tape).

## When this theme applies

- Warehouse scanner UI (handheld terminal)
- Batch dispatch / queue console
- Courier-facing pickup/dropoff flows
- Fleet logistics dashboards

## Notes

- Primary CTAs still use `--primary-base` (Dash Purple) — family identity.
- `--theme-accent-*` for queue badges, "needs action" pulses, batch progress
  bars, package state pills.
- Voice override: terser, transaction-id first (see `voice-overrides.md`).
