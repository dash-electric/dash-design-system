# Dash DS Kill Criteria

> **Purpose:** define explicit conditions under which Dash DS will be sunset or paused. Without these thresholds, the project survives on sunk-cost rather than measured value.

**Owner:** Irfan (CEO Dash)
**Established:** 2026-05-20
**Review cadence:** monthly until Q1 review, quarterly thereafter

---

## Why kill criteria matter

Self-critique in `feedback.md`:
> "We have no kill criterion. Projects without one survive long past their value."

A pre-committed kill threshold:
1. Removes emotional sunk-cost pressure from future decisions
2. Forces measurement (you cannot kill what you cannot count)
3. Signals to users that DS is an experiment, not a mandate — encourages honest adoption

---

## Goals being measured

From Obsidian vault `02-Projects/Product-Design/Dash/Dash-Design-System/00-Overview.md`:

1. **Eliminate brand drift** across 10 team members
2. **Drop ship-time** 2-3 days → 1 day per feature
3. **100% Dash sovereign** (zero external dependencies in end-state)
4. **AI-native** consumption via Claude Code / Cursor + Dash MCP

Each goal needs a measurable proxy. The thresholds below use the cleanest available proxy.

---

## Tier 1 — Hard kill thresholds

### T1.1 — Adoption floor (Week 4)

**Threshold:** If fewer than **3 users** have installed at least 1 Dash DS component within 4 weeks of public launch, pivot or kill.

**Why 3:**
- 10 team members total. 3 = 30% = floor for "this is a thing some people use".
- Below 30% = signals that the boring incumbent (senior FE reviewer + 5-page README + Figma) is more attractive than DS.

**How to measure:**
- `dash audit --json` run weekly against each user repo
- OR explicit install telemetry from CLI `dash add` POST `/api/usage` (P1.15)
- OR direct ask in `#design-system` Slack (lossy, last resort)

**If failed:** spend 1 week on user 1:1s to understand barrier. Either fix the barrier or pivot to senior-FE-review model.

---

### T1.2 — PR penetration (Week 8)

**Threshold:** If fewer than **30%** of new UI PRs across the 10 Dash repos use any Dash DS component within 8 weeks of launch, kill the active build investment.

**Why 30%:**
- Baseline: 0% (no one uses DS today). 30% in 8 weeks = ~4% weekly growth = realistic floor for a working tool.
- Below 30% = DS is shelfware. The 60-70hr/wk maintenance burden (per backfill estimate from schema unification) doesn't pay back.

**How to measure:**
- GitHub Actions workflow in each Dash repo: grep PR diff for `@dash/` imports or `dash/registry/` paths
- Aggregate to weekly dashboard
- 8-week rolling average

**If failed:** stop active build, mark DS as "experimental, archived". Existing components remain installable but no new investment.

---

### T1.3 — Brand drift reduction (Quarter 1)

**Threshold:** If `dash audit` drift count across the 5 FE repos has NOT decreased by **20%** vs the 2026-05-20 baseline by end of Q1 (90 days post-launch), the core value claim is unproven — kill or pivot.

**Baseline (from `BASELINE-DRIFT-2026-05-20.md`):**
- next-backoffice-web: 1,913 hex + 695 inline style
- next-basecamp-web-main: 2,028 hex matches
- ts-delivery-service-main: 655 + 104 response helper sites
- (full table in baseline report)

**Why 20%:**
- 20% reduction = ~750 hex eliminations in backoffice alone — that's adoption working.
- Less than 20% = DS exists but isn't eliminating drift (the stated #1 goal).

**How to measure:**
- Re-run baseline scanners (`/tmp/scan_fe.sh`, `/tmp/scan_be.sh`) at Q1 mark
- Compare counts vs baseline
- Compute % delta per repo + aggregate

**If failed:** publish the gap honestly. Decide: extend timeline (admitting initial estimate was wrong) or kill.

---

## Tier 2 — Soft signals (warning, not kill)

These don't trigger immediate kill, but require explicit explanation if observed:

### T2.1 — Single-user adoption skew
If 1 user accounts for >70% of all installs, DS is being used by 1 person, not the team. Sign of personal preference, not team value.

### T2.2 — Component drift in DS itself
If `dash audit` run against `/dash-ds/` source itself produces HIGH findings (self-contradiction), the artifact has lost discipline. Wave 1+2+3 fixed the known cases — future regressions are signal of decay.

### T2.3 — CLI/MCP error rate
If `dash add` failure rate exceeds 5% (per usage telemetry once instrumented), tool is too fragile to scale.

### T2.4 — Time-to-resolution on user issues
If median issue resolution time exceeds 5 working days, bus factor (1) is real and unsustainable.

---

## Explicitly NOT in kill criteria

- **Aesthetic preference** — if users "don't like the look", that's a UX iteration, not kill signal
- **Number of components** — 214 vs 30 doesn't matter if usage is real
- **Token cost of build** — sunk
- **Visibility / PR / external recognition** — DS is internal, not marketing
- **Comparison to shadcn/ui growth curve** — different audience, different metrics

---

## Decision protocol when a threshold trips

When any T1 threshold trips:

1. **Pause active build** (no new components, no new docs) within 1 week of trip
2. **Write a 1-page postmortem**: what happened, what hypothesis failed, what was learned
3. **Hold 60-min decision meeting** with: Irfan + 1 senior team member + 1 design lead
4. **Choose ONE outcome:**
   - **Kill** — archive repo, freeze CLI, document migration path off `@dash/*`
   - **Pivot** — redefine scope (e.g., DS becomes "token-only" instead of components)
   - **Extend with explicit justification** — add 4 more weeks IF a concrete blocker can be fixed (e.g., MCP wiring was broken). Max 1 extension.

No "let's see how it goes" without explicit extension justification.

---

## Measurement infrastructure required

These must be in place before launch for kill criteria to be measurable:

- [x] **Baseline scan** done 2026-05-20 (`BASELINE-DRIFT-2026-05-20.md`)
- [x] **`dash audit` CLI** built (Wave 2) — can be re-run on schedule
- [ ] **Install telemetry** — CLI `dash add` POST `/api/usage` (P1.15, deferred)
- [ ] **PR penetration tracker** — GitHub Actions per repo (post-launch task)
- [ ] **Quarterly re-baseline schedule** — calendar invite

---

## Schedule

| Date | Activity |
|---|---|
| 2026-05-20 | Baseline established (this doc + drift report) |
| Launch + 0 day | T1 thresholds active |
| Launch + 4 weeks | T1.1 review |
| Launch + 8 weeks | T1.2 review |
| Launch + 90 days | T1.3 review + Q1 retro |
| Quarterly thereafter | Re-measure T1.3 |

---

## Notes

- These thresholds are starting points, not laws. Adjust if early signal shows them mis-calibrated.
- The point is to commit to *some* threshold and review against it honestly — not to find the perfect number.
- If you find yourself arguing why a tripped threshold doesn't really count, that's the moment kill criteria matter most.

---

**Sign-off:**

- [x] **Irfan (CEO) — approved 2026-05-20:** T1.1 = 3 users / T1.2 = 30% PR / T1.3 = 20% drift reduction
- [ ] Senior user rep — deferred (bus factor = 1 currently; revisit Q3 2026 when deputy onboards)
- [ ] Design lead — deferred (same — single-owner phase)

**Note:** Per locked decision 2026-05-20, sole sign-off = CEO acceptable for Phase 0-2. Add additional approvers post-bus-factor mitigation.
