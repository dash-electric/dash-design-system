# Dash DS — Themes (Layer 2)

Per-product/tenant theme overlays built on top of **Layer 0 Foundation**
(`apps/docs/app/globals.css` — tokens, primitives, semantic colors).

Layer model recap:

```
Layer 0  Foundation   shared across ALL Dash products (this repo's globals.css)
Layer 1  Primitives   shared UI atoms (apps/docs/registry/dash/ui/*)
Layer 2  Themes       per-product accent + voice deltas (THIS DIRECTORY)
Layer 3  Patterns     product-specific compositions (consumer repos)
```

A theme **never** redefines foundation neutrals, type scale, radii, spacing,
shadows, or motion. It overrides ONLY:

- `--theme-accent-*` ramp (and a small set of derived tokens)
- Optional `--theme-display-font` (heading face)
- Optional voice deltas (tone for product audience)

Dash Purple `#5e2aac` stays as `--primary-base` across every theme — that is
the family identity. Accent diverges per product.

## Themes

| Theme              | Accent        | Hex        | Audience / use case                                   |
|--------------------|---------------|------------|-------------------------------------------------------|
| `ride`             | Mobility green| `#16a34a`  | Driver app, dispatcher, ride ops (current default)    |
| `logistic`         | Delivery orange| `#ea580c` | Warehouse, batch ops, fleet logistics                 |
| `travel`           | Ocean blue    | `#0284c7`  | Booking flow, itinerary, traveller-facing surfaces    |
| `marketplace`      | Commerce yellow| `#ca8a04` | Storefront, checkout, merchant tooling                |
| `trellis-tenant`   | Neutral grey  | `#6b7280`  | Generic template for Trellis SaaS customers to fork   |

## When to use which

- **Pick `ride`** if you are building Dash Ride surfaces (driver, dispatcher,
  ride-hailing ops). This was the implicit default before this refactor; pick
  it explicitly now.
- **Pick `logistic`** for Dash Logistic / Express delivery batch ops, warehouse
  scanning UIs, courier-facing surfaces.
- **Pick `travel`** for Dash Travel booking, itinerary planner, traveller
  notifications — anything where "calm/elegance" matters more than urgency.
- **Pick `marketplace`** for Dash Marketplace storefront, checkout, seller
  console — anything commerce-flavoured.
- **Pick `trellis-tenant`** as the starting point if you are a Trellis SaaS
  tenant forking Dash DS — replace the placeholder accent with your brand.

## How a theme is applied

A theme is a single CSS file imported AFTER `globals.css`. It redefines
`--theme-accent-*` cascading vars; primitives consume them via the
`--state-feature-*` / `--primary-accent-*` indirections.

```ts
// apps/docs/app/layout.tsx (consumer side)
import "./globals.css";
import "@/registry/dash/themes/ride/colors.css";
```

The CLI (Phase C) will codify this and let you swap themes at scaffold time:
`dash init --theme=logistic`.

## Migration note

`apps/docs/registry/dash/theme/` (singular, monolithic) is the legacy theme
directory — DO NOT modify. It will be migrated to `themes/ride/` via a
deprecation path tracked in `BASELINE-DRIFT-2026-05-20.md`.
