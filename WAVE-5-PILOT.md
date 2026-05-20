# WAVE-5-PILOT.md — Dash DS 3-User Pilot Smoke Test

> Pilot infrastructure + operational playbook for the Wave 5 smoke test.
> Validates the adoption hypothesis behind the Dash DS Master Plan before
> committing to broader rollout. Pairs with `dash feedback` CLI and the
> `/docs/admin/pilot` dashboard.

---

## A. Pilot Charter

**Goal:** validate the adoption hypothesis on three real Dash users before
committing to wider rollout. The DS dies fast if users don't adopt — this
pilot is the cheapest, sharpest signal we can get.

**Duration:** 7 working days (one full work week + a weekend gap).
**Start date:** TBD by Irfan (target: next Monday after invite acceptance).
**Pilot cohort:** 3 users — `[User-A]`, `[User-B]`, `[User-C]` (placeholders;
real names live in `~/.dash/pilot-cohort.json`, gitignored).

### Success criteria (concrete)

| Metric | Threshold | Source |
|---|---|---|
| Users complete onboarding (steps 1–9 of `ONBOARDING-PLAYBOOK`) | ≥3 | Admin dashboard / per-user checklist |
| Users install ≥3 Dash components in their repo | ≥2 of 3 | `registry-audit.jsonl` byHashedClient |
| Gap reports filed | ≥5 across cohort | `dash gap report` queue |
| Successful Hermes auto-vendor runs (if Hermes deployed) | ≥1 | Hermes audit log |
| Critical bugs blocking user work | 0 | Slack #dash-ds-pilot triage |

### Failure criteria (kill switch armed)

- **<2 users complete onboarding** within 7 days — adoption signal too
  weak; pause and diagnose before reinvesting.
- **<30% of AI prompts respect Dash rules** (sampled from `dash audit`
  on user PRs) — would require Skill v4 work before retrying.
- **3+ critical bugs filed** in week one — stop accepting new users,
  triage, ship fixes, resume.

A failure does NOT mean the DS is dead — it means the next wave must
address the diagnosed cause before reinviting users.

---

## B. Invite Sequence

**Day -7 — Identify candidates.** Pick from senior Dash developers familiar
with `halo-dash-fe`, `portal-v2`, and `backoffice`. Cohort composition
matters more than seniority — aim for a spread:

- 1 **trust-heavy** user who'll give DS the benefit of the doubt (signal
  for "does it work when motivation is high?").
- 1 **skeptical** user who'll push back hard (signal for "does it survive
  contact with friction?").
- 1 **swing-vote** user who's neutral (signal for "does it sell itself?").

Mix TS-comfortable + JS-only so we see both ergonomics paths. Document
choices in `~/.dash/pilot-cohort.json` (gitignored — keep names off
GitHub).

**Day -3 — Send invite.** Use the DM template from
`ONBOARDING-PLAYBOOK.md § Invite Template`. Plain message, no marketing
language. One sentence on what's in it for them ("ship faster with
audited Dash patterns + Hermes auto-vendor for missing pieces"), one
sentence on the ask ("7 working days, file feedback via `dash feedback
log`, join #dash-ds-pilot").

**Day -1 — Reminder + token.** Share the registry Bearer token via
1Password (NEVER paste it in Slack). Confirm each user has `pnpm`,
Node 20+, and Claude Max.

**Day 0 — Pilot starts.** Run the onboarding 1:1 with the first user.

**Day +7 — Pilot ends + retro.** Mandatory retro Sunday evening, async
or 30-min sync.

---

## C. Daily Check-in Schedule

| Day | Date | Activity |
|---|---|---|
| 1 (Mon) | TBD | Onboard [User-A] (1:1, 60 min) |
| 2 (Tue) | TBD | Onboard [User-B] (1:1, 60 min) + 15-min check-in with [User-A] |
| 3 (Wed) | TBD | Onboard [User-C] (1:1, 60 min) + 15-min check-in with [User-B] |
| 4 (Thu) | TBD | Group sync (30 min, all 3 users) — surface shared blockers |
| 5 (Fri) | TBD | Half-week retro — review `dash feedback list` + adjust plan |
| 6 (Sat) | TBD | Solo day — users work on their own, async Slack only |
| 7 (Sun) | TBD | Final retro + survey + go/no-go on Wave 6 |

Each 1:1 records onboarding step number reached + first component
installed. Logged via `dash feedback log "<user> onboarded step 9"`.

---

## D. Feedback Collection

Three channels, ranked by friction (lowest first):

1. **`dash feedback log "<text>"` CLI** — async, zero context-switch.
   Lands in `~/.dash/feedback-log.jsonl`. Synced to dashboard via
   `dash feedback sync`. Default channel for everything that isn't a
   blocker.
2. **Slack #dash-ds-pilot** — threaded discussion. Blockers go here so
   they're visible to the cohort.
3. **End-of-week survey** — single Google Form OR in-CLI
   `dash feedback survey` prompt. See § Open Questions below.

Every CLI feedback entry auto-tags `pilot: "wave-5"` and detects the
user via `git config user.name` (overridable with `--pe`). Users never have
to remember which pilot they're in.

---

## E. Metrics Tracking

Per user per day, captured by the admin dashboard:

| Metric | Source | Aggregation |
|---|---|---|
| Onboarding step completed (0–9) | `dash feedback log "step N"` | latest per user per day |
| Components installed | `registry-audit.jsonl` (op=install, hashed client) | count per user |
| Components used in shipped PR | `dash audit` run on user branch | count per PR |
| Gap reports filed | `~/.dash/gap-queue.json` (synced) | count per user |
| AI prompt count (proxy) | Skill telemetry (if wired) | rolling sum |
| Time-to-first-component | install timestamp – onboarding start | minutes |
| Time-to-first-feature-ship | first PR merge – onboarding start | hours |

Aggregate at end of week → check against § A success criteria.

---

## F. Retro Template

Run once at Day +7. Two rounds: async (everyone fills it before sync),
then 30-min sync to align on top decisions.

```
## Retro — Wave 5 Pilot, [User-X]

### What worked
- (one line per item)

### What didn't
- (one line per item — include severity: low / med / high)

### What changed in my mental model of the DS
- (1–3 sentences)

### Top 3 priorities for Wave 6 (if pilot continues)
1.
2.
3.

### Honest signal: would I keep using Dash DS if the pilot ended today?
- yes / no / depends-on (one line of context)
```

CEO consolidates the three retros into a single Wave 6 decision memo.

---

## G. Kill Switch Decision Tree

If the pilot trips a § A failure criterion mid-week:

```
1. Pause new onboarding (don't recruit User D, E…)
2. Diagnose root cause:
   - Onboarding gap?       → Skill v3 / playbook revision
   - Disinterest?          → Re-validate problem with PM Dash
   - Critical bug?         → Triage + patch, resume pilot
   - Drift not measurable? → Wave 4 telemetry not deep enough
3. Decide:
   a) Extend invite 1 week with fix shipped → continue cohort
   b) Pivot to senior-user 1:1 white-glove (skip self-serve onboarding)
   c) Sunset Wave 5, retreat to Wave 4 telemetry-only
4. Escalate to PM Dash + Head of Design for awareness BEFORE deciding
   between (b) and (c) — both have product-org implications.
5. If decision = (c), trigger the kill switch in /docs/admin/pilot
   (locks DS to "frozen" mode + Slack ping to the cohort).
```

The kill switch is reversible — "frozen" mode blocks new registry
installs cohort-wide but leaves existing installs working. Unfreeze by
clearing `~/.dash/pilot-frozen` on the server.

---

## Open questions (resolve before Day 0)

- Survey format — Google Form (familiar, exports clean) vs `dash
  feedback survey` (zero context-switch but more build work). **Recommend
  Google Form for Wave 5** — survey is a 1× thing per pilot, build cost
  doesn't amortize. Revisit if Wave 6 expands to 10+ users.
- Hermes deploy status — if not deployed by Day 0, drop the Hermes
  success criterion (don't fail the pilot on absent infra).
- Skill telemetry — confirm `dash usage` ships per-user prompt count
  before Day 0; otherwise drop AI-prompt-count metric.

---

## Pre-flight checklist (Irfan, before Day 0)

- [ ] `dash feedback log` CLI shipped and `pnpm test` green
- [ ] `/docs/admin/pilot` page deployed + Bearer-gated
- [ ] 1Password vault entry for `DASH_REGISTRY_TOKEN` shared with cohort
- [ ] #dash-ds-pilot Slack channel created + 3 users invited
- [ ] DM invite drafted (do NOT send before all 3 confirm verbally)
- [ ] Calendar holds: Day 1/2/3 onboarding 1:1 (60 min each), Day 4
      group sync (30 min), Day 5 half-week retro (30 min), Day 7 final
      retro (60 min)
- [ ] `ONBOARDING-PLAYBOOK.md` last reviewed within the past week
- [ ] Kill switch tested end-to-end on staging

Estimated prep time: **~6 hours of Irfan calendar** spread over Day -7
through Day -1 (excludes the 1:1 onboarding hours during the pilot
itself, which add ~3 hours).
