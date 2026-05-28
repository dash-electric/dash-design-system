# Wave 2 Decisions Log — 2026-05-28

User decided all 12 overnight blockers in single sprint kickoff.

## Summary table

| Q | Topic | Decision | Rationale | Files updated |
|---|---|---|---|---|
| Q1 | Backoffice shim fix | ✅ APPLY | 30 min, unblock E2E preview testing | `src/runs/preview-shim.ts` + `__tests__/preview-shim.test.ts` |
| Q2 | Dashboard MVP widget #3 | **A) Tribe app health** | Forces alerting pipeline early, reusable for incident timeline phase | `specs/dash-dashboard-prd-2026-05-28.md` §6 |
| Q3 | DS gap ship first | **A) BulkActionBar** | Blocks 6 prompts (highest impact), unlock refund/mitra/audit list flows | `apps/docs/registry/dash/ui/bulk-action-bar.tsx` (new) |
| Q4 | AOP schema package | **A) Extract `@dash/aop-schema`** | Dashboard imports schema without dash-build dep, third-party tooling can validate | `packages/aop-schema/` (new) |
| Q5 | Dashboard repo strategy | **A) Monorepo** | Faster iteration MVP, extract Phase 4 (per TRD §12 migration plan) | `packages/dashboard/` (new) |
| Q6 | Dashboard auth | **A) Real Google SSO** | Zero security debt, ~30 min setup with `next-auth` v5 | `packages/dashboard/src/lib/auth.ts` |
| Q7 | Dashboard hosting | **Railway** (not Vercel) | $5/mo Starter cover MVP, simpler ops than Vercel for monorepo Next.js app | `packages/dashboard/railway.json` + TRD §2/§9 updates |
| Q8 | DS telemetry | **A) Opt-out** | Adoption data day-1, `--no-telemetry` escape hatch preserves privacy choice | CLI emit endpoint (post-MVP) |
| Q9 | HTML mobile + a11y fix | ✅ APPLY | 1.5h, makes doc stakeholder-ready phone + screen-reader users | `docs/dash-control-tower.html` |
| Q10 | Prototype disclaimer | ✅ APPLY | 10 min, prevent demo over-promise | `docs/dash-control-tower.html` mock UI section |
| Q11 | Theme runtime | **DEFER** to Wave 5 | Chicken-egg — need 1 tribe consuming themes for real first | `specs/ds-layer-2-theme-runtime-plan-2026-05-28.md` (existing) |
| Q12 | Real user validation | **Designer first** (TBD schedule this week) | Best signal for DS coverage gap real (vs paper analysis 73.5%) | Manual session, output `user-test-YYYY-MM-DD.md` |

## Execution status (per task)

| Task | Status |
|---|---|
| W1.1 Backoffice shim fix | ✅ DONE — Q1 applied, V3 deployed, typecheck clean |
| W1.2 HTML patches (mobile + a11y + disclaimer) | ✅ DONE — Q9+Q10 applied |
| W2 Decisions log + Railway swap | ✅ DONE — this file + TRD/PRD updated |
| W3.1 BulkActionBar component | 🟡 Subagent running |
| W3.2 Dashboard skeleton + Tribe health widget | 🟡 Subagent running |
| W3.3 AOP schema package extract | 🟡 Subagent running |
| Wave 4 user test (Q12) | ⏸ NEEDS SCHEDULE — designer kapan minggu ini |
| Q11 theme runtime | ⏸ DEFER post-Wave 4 |

## Validation paths (per decision)

| Q | How to validate |
|---|---|
| Q1 | Restart daemon → bootstrap `backoffice` repo → iframe loads without HTTP 500 |
| Q2 | `curl localhost:3001/api/v1/health/tribes` returns tribe array |
| Q3 | `ls apps/docs/registry/dash/ui/bulk-action-bar.tsx` exists + doc page renders |
| Q4 | `pnpm --filter @dash/aop-schema build` succeeds + `<30KB` bundle |
| Q5 | `ls packages/dashboard/` + `pnpm --filter @dash/dashboard dev` boots :3001 |
| Q6 | Visit `:3001/dashboard` → redirect to Google → login `@dash.com` → session set |
| Q7 | `railway up --service dashboard` deploys (after `railway link`) |
| Q8 | `dash add button` emits POST to `/api/ingest/ds-add` (DS telemetry endpoint live post-MVP) |
| Q9 | Chrome DevTools iPhone SE 375px → no horizontal scroll + tab through page works |
| Q10 | Reload HTML → "prototype · not yet wired" badge visible di mock UI section |

## Open follow-ups

- Q12 (designer session) — pick name + schedule, this is the highest-impact blocker for Wave 4
- Once W3.1-W3.3 subagents complete → integration test (run all 3 in fresh `pnpm install`)
- After Wave 3 builds, decide push timing (separate branches per W task or single Wave-3 branch?)

---

Related: [[OVERNIGHT-QUESTIONS-2026-05-28]] · [[dash-dashboard-prd-2026-05-28]] · [[dash-dashboard-trd-2026-05-28]] · [[backoffice-shim-diagnosis-2026-05-28]] · [[ds-coverage-gap-2026-05-28]]
