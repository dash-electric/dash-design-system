# Dash Solo Designer Operating Assistant

This folder is the source of truth for the assistant plan discussed in Hermes.

## Read in this order
1. `master-plan.md` — north star, milestones, scope, success criteria
2. `architecture.md` — system shape, data flow, storage, connectors
3. `ui-surfaces.md` — what the local UI contains and how it is used
4. `edge-cases.md` — extension strategy and failure cases to design for now

## Goal
Build a **local-first operating assistant for Dash** that helps a senior/staff-level product designer operate with stronger recall, better prioritization, clearer business/product reasoning, and cleaner execution handoffs.

This is **not**:
- a generic personal AI app
- an OpenHuman clone
- a chat toy that depends on manual context pasting
- a UI-only design copilot

This is:
- meeting-aware
- context-aware
- artifact-generating
- Claude-handoff-ready
- memory-growing
- designed for Dash first, extensible later

## Canonical assumptions for v1
- Scope: **Dash only**
- UI: **local web app**
- Main meeting source: **Google Meet transcript / exported notes / local transcript files**
- Storage: **local files + curated Obsidian sync + SQLite/DB index**
- Main outputs: **decision brief + Claude handoff + prioritized next actions**
- Main role: **Senior Product Design / Product-Business Operator**

## Related Dash context
- `AGENTS.md`
- `CLAUDE.md`
- `design.md`
- `packages/dash-build/docs/`
