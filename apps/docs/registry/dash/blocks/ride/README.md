# Ride Workflow Blocks

**Layer 3 — Ride-specific workflow blocks.** Use mitra (driver) / vehicle / repossession / dispatch concepts. Not portable to other products without significant refactor of props + copy.

This directory holds **re-export indexes only**. Source `.tsx` files remain in `apps/docs/registry/dash/blocks/` (flat layout). Theme membership is tagged via `theme: "ride"` + `products: ["ride"]` on each entry in `apps/docs/registry.json`.

## Members (2)

- `mitra-dispute-flow` — driver dispute submission. Formal "Anda" voice baked in. Reason taxonomy tied to Ride domain (delivery/payment/suspension/maintenance).
- `repossession-action-sheet` — 7-state repossession FSM (OPEN/IN_PROGRESS/FOUND/POTENTIAL_LOSS/PENDING_APPROVAL/WRITTEN_OFF/CLOSED). Fleet-vehicle scoped.

## When to add a block here vs `shared/`

Add to **ride/** when ANY of:
- Props or types reference `mitra`, `driver`, `vehicle`, `dispatch`, `repossession`, `tribe`, `shift`, `zero-rate`.
- Copy is written in formal mitra-facing "Anda" voice (per Dash voice rule) and would be wrong for non-mitra audiences.
- Workflow tied to a Ride-only state machine (repo FSM, suspension FSM, dispatch FSM).
- Mobile-first form factor for in-field mitra app (vs desktop backoffice).

If the workflow is also relevant to Logistic but with different copy/state, **fork into `logistic/`** instead of mutating shared.

## How to use this index

Exploration aid for engineers. Real consumption stays via `dash add <name>`.
