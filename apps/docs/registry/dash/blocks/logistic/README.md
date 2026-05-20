# Logistic Workflow Blocks

**Layer 3 — Logistic-specific workflow blocks.** Placeholder for Dash Logistic launch.

Currently empty. The product is in early planning — expected initial blocks include:

- `logistic-route-planner` — multi-stop route + ETA composer
- `hub-shift-board` — hub-level shift staffing view
- `lane-sla-monitor` — lane-level SLA breach dashboard
- `cod-reconciliation` — cash-on-delivery reconcile flow

When the first Logistic block lands:
1. Add `theme: "logistic"` + `products: ["logistic"]` to its `registry.json` entry.
2. Re-export from `index.ts` here.
3. Append the name to `LOGISTIC_BLOCK_NAMES`.

## Cross-product blocks

`delivery-status-timeline` is tagged `theme: "shared"` (works for both Ride deliveries and Logistic shipments). If Logistic needs a divergent variant later, fork into `logistic/logistic-status-timeline.tsx` rather than mutating the shared block.

## How to use this index

Once populated, exploration aid for engineers. Real consumption stays via `dash add <name>`.
