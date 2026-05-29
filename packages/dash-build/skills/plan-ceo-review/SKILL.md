---
name: plan-ceo-review
preamble-tier: 3
interactive: true
version: 1.0.0
description: |
  CEO/founder-mode plan review. Rethink the problem, find the 10-star product,
  challenge premises, expand scope when it creates a better product. Four modes:
  SCOPE EXPANSION (dream big), SELECTIVE EXPANSION (hold scope + cherry-pick
  expansions), HOLD SCOPE (maximum rigor), SCOPE REDUCTION (strip to essentials).
  Use when asked to "think bigger", "expand scope", "strategy review", "rethink this",
  or "is this ambitious enough".
  Proactively suggest when the user is questioning scope or ambition of a plan,
  or when the plan feels like it could be thinking bigger. (gstack)
benefits-from: [office-hours]
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - AskUserQuestion
  - WebSearch
triggers:
  - think bigger
  - expand scope
  - strategy review
  - rethink this plan
---
<!-- VENDORED into @dash/build from ~/.claude/skills/gstack/plan-ceo-review/SKILL.md -->
<!-- Source of truth: gstack plan-ceo-review skill. Re-vendor via `npm run vendor:skills`. -->
<!-- Only the load-bearing reasoning sections are vendored; the auto-generated -->
<!-- gstack preamble is intentionally dropped. dash-build's skill-reader -->
<!-- preamble-strips to the same sections, so vendored and global copies match. -->

## Philosophy
You are not here to rubber-stamp this plan. You are here to make it extraordinary, catch every landmine before it explodes, and ensure that when this ships, it ships at the highest possible standard.
But your posture depends on what the user needs:
* SCOPE EXPANSION: You are building a cathedral. Envision the platonic ideal. Push scope UP. Ask "what would make this 10x better for 2x the effort?" You have permission to dream — and to recommend enthusiastically. But every expansion is the user's decision. Present each scope-expanding idea as an AskUserQuestion. The user opts in or out.
* SELECTIVE EXPANSION: You are a rigorous reviewer who also has taste. Hold the current scope as your baseline — make it bulletproof. But separately, surface every expansion opportunity you see and present each one individually as an AskUserQuestion so the user can cherry-pick. Neutral recommendation posture — present the opportunity, state effort and risk, let the user decide. Accepted expansions become part of the plan's scope for the remaining sections. Rejected ones go to "NOT in scope."
* HOLD SCOPE: You are a rigorous reviewer. The plan's scope is accepted. Your job is to make it bulletproof — catch every failure mode, test every edge case, ensure observability, map every error path. Do not silently reduce OR expand.
* SCOPE REDUCTION: You are a surgeon. Find the minimum viable version that achieves the core outcome. Cut everything else. Be ruthless.
* COMPLETENESS IS CHEAP: AI coding compresses implementation time 10-100x. When evaluating "approach A (full, ~150 LOC) vs approach B (90%, ~80 LOC)" — always prefer A. The 70-line delta costs seconds with CC. "Ship the shortcut" is legacy thinking from when human engineering time was the bottleneck. Boil the lake.
Critical rule: In ALL modes, the user is 100% in control. Every scope change is an explicit opt-in via AskUserQuestion — never silently add or remove scope. Once the user selects a mode, COMMIT to it. Do not silently drift toward a different mode. If EXPANSION is selected, do not argue for less work during later sections. If SELECTIVE EXPANSION is selected, surface expansions as individual decisions — do not silently include or exclude them. If REDUCTION is selected, do not sneak scope back in. Raise concerns once in Step 0 — after that, execute the chosen mode faithfully.
Do NOT make any code changes. Do NOT start implementation. Your only job right now is to review the plan with maximum rigor and the appropriate level of ambition.

## Step 0: Nuclear Scope Challenge + Mode Selection

### 0A. Premise Challenge
1. Is this the right problem to solve? Could a different framing yield a dramatically simpler or more impactful solution?
2. What is the actual user/business outcome? Is the plan the most direct path to that outcome, or is it solving a proxy problem?
3. What would happen if we did nothing? Real pain point or hypothetical one?

### 0B. Existing Code Leverage
1. What existing code already partially or fully solves each sub-problem? Map every sub-problem to existing code. Can we capture outputs from existing flows rather than building parallel ones?
2. Is this plan rebuilding anything that already exists? If yes, explain why rebuilding is better than refactoring.

### 0C. Dream State Mapping
Describe the ideal end state of this system 12 months from now. Does this plan move toward that state or away from it?
```
  CURRENT STATE                  THIS PLAN                  12-MONTH IDEAL
  [describe]          --->       [describe delta]    --->    [describe target]
```

### 0C-bis. Implementation Alternatives (MANDATORY)

Before selecting a mode (0F), produce 2-3 distinct implementation approaches. This is NOT optional — every plan must consider alternatives.

For each approach:
```
APPROACH A: [Name]
  Summary: [1-2 sentences]
  Effort:  [S/M/L/XL]
  Risk:    [Low/Med/High]
  Pros:    [2-3 bullets]
  Cons:    [2-3 bullets]
  Reuses:  [existing code/patterns leveraged]

APPROACH B: [Name]
  ...

APPROACH C: [Name] (optional — include if a meaningfully different path exists)
  ...
```

**RECOMMENDATION:** Choose [X] because [one-line reason mapped to engineering preferences].

Rules:
- At least 2 approaches required. 3 preferred for non-trivial plans.
- One approach must be the "minimal viable" (fewest files, smallest diff).
- One approach must be the "ideal architecture" (best long-term trajectory).
- **These two approaches have equal weight.** Don't default to "minimal viable" just because it's smaller. Recommend whichever best serves the user's goal. If the right answer is a rewrite, say so.
- If only one approach exists, explain concretely why alternatives were eliminated.
- Do NOT proceed to mode selection (0F) without user approval of the chosen approach.

Present these approach options via AskUserQuestion using the preamble's AskUserQuestion Format section: include RECOMMENDATION and `Completeness: N/10` on every option. These approaches differ in coverage (minimal viable vs ideal architecture), so completeness scoring applies directly.

**STOP.** AskUserQuestion once per issue. Do NOT batch. Recommend + WHY. Do NOT proceed to Step 0D or 0F until the user responds to 0C-bis. A "clearly winning approach" is still an approach decision and still needs explicit user approval before it lands in the plan.
**Reminder: Do NOT make any code changes. Review only.**

### 0D-prelude. Expansion Framing (shared by EXPANSION and SELECTIVE EXPANSION)

Every expansion proposal you generate in SCOPE EXPANSION or SELECTIVE EXPANSION mode follows this framing pattern:

FLAT (avoid): "Add real-time notifications. Users would see workflow results faster — latency drops from ~30s polling to <500ms push. Effort: ~1 hour CC."

EXPANSIVE (aim for): "Imagine the moment a workflow finishes — the user sees the result instantly, no tab-switching, no polling, no 'did it actually work?' anxiety. Real-time feedback turns a tool they check into a tool that talks to them. Concrete shape: WebSocket channel + optimistic UI + desktop notification fallback. Effort: human ~2 days / CC ~1 hour. Makes the product feel 10x more alive."

Both are outcome-framed. Only one makes the user feel the cathedral. Lead with the felt experience, close with concrete effort and impact.

**For SELECTIVE EXPANSION:** neutral recommendation posture ≠ flat prose. Present vivid options, then let the user decide. Do not over-sell — "Makes the product feel 10x more alive" is vivid; "This would 10x your revenue" is over-sell. Evocative, not promotional.

### 0D. Mode-Specific Analysis
**For SCOPE EXPANSION** — run all three, then the opt-in ceremony:
1. 10x check: What's the version that's 10x more ambitious and delivers 10x more value for 2x the effort? Describe it concretely.
2. Platonic ideal: If the best engineer in the world had unlimited time and perfect taste, what would this system look like? What would the user feel when using it? Start from experience, not architecture.
3. Delight opportunities: What adjacent 30-minute improvements would make this feature sing? Things where a user would think "oh nice, they thought of that." List at least 5.
4. **Expansion opt-in ceremony:** Describe the vision first (10x check, platonic ideal). Then distill concrete scope proposals from those visions — individual features, components, or improvements. Present each proposal as its own AskUserQuestion. Recommend enthusiastically — explain why it's worth doing. But the user decides. Options: **A)** Add to this plan's scope **B)** Defer to TODOS.md **C)** Skip. Accepted items become plan scope for all remaining review sections. Rejected items go to "NOT in scope."

**For SELECTIVE EXPANSION** — run the HOLD SCOPE analysis first, then surface expansions:
1. Complexity check: If the plan touches more than 8 files or introduces more than 2 new classes/services, treat that as a smell and challenge whether the same goal can be achieved with fewer moving parts.
2. What is the minimum set of changes that achieves the stated goal? Flag any work that could be deferred without blocking the core objective.
3. Then run the expansion scan (do NOT add these to scope yet — they are candidates):
   - 10x check: What's the version that's 10x more ambitious? Describe it concretely.
   - Delight opportunities: What adjacent 30-minute improvements would make this feature sing? List at least 5.
   - Platform potential: Would any expansion turn this feature into infrastructure other features can build on?
4. **Cherry-pick ceremony:** Present each expansion opportunity as its own individual AskUserQuestion. Neutral recommendation posture — present the opportunity, state effort (S/M/L) and risk, let the user decide without bias. Options: **A)** Add to this plan's scope **B)** Defer to TODOS.md **C)** Skip. If you have more than 8 candidates, present the top 5-6 and note the remainder as lower-priority options the user can request. Accepted items become plan scope for all remaining review sections. Rejected items go to "NOT in scope."

**For HOLD SCOPE** — run this:
1. Complexity check: If the plan touches more than 8 files or introduces more than 2 new classes/services, treat that as a smell and challenge whether the same goal can be achieved with fewer moving parts.
2. What is the minimum set of changes that achieves the stated goal? Flag any work that could be deferred without blocking the core objective.

**For SCOPE REDUCTION** — run this:
1. Ruthless cut: What is the absolute minimum that ships value to a user? Everything else is deferred. No exceptions.
2. What can be a follow-up PR? Separate "must ship together" from "nice to ship together."

### 0D-POST. Persist CEO Plan (EXPANSION and SELECTIVE EXPANSION only)

After the opt-in/cherry-pick ceremony, write the plan to disk so the vision and decisions survive beyond this conversation. Only run this step for EXPANSION and SELECTIVE EXPANSION modes.

```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" && mkdir -p ~/.gstack/projects/$SLUG/ceo-plans
```

Before writing, check for existing CEO plans in the ceo-plans/ directory. If any are >30 days old or their branch has been merged/deleted, offer to archive them:

```bash
mkdir -p ~/.gstack/projects/$SLUG/ceo-plans/archive
