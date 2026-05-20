# Auto Suspend Mitra Reservasi

> **Automatically suspend mitra Reservasi accounts after 3 consecutive missed dispatches in a single day to free slot capacity and protect dispatch success rate.**

---

# CORE SECTIONS

---

## 1. Initiative Name

`Auto Suspend Mitra Reservasi`

---

## 2. Document Status

| Field | Detail |
|---|---|
| **Status** | `Draft` |
| **Version** | v0.2 |
| **Last Updated** | 2026-05-20 |
| **Author** | Irfan Prima Putra |
| **Owner** | Irfan Prima Putra |
| **Tribe** | Express |
| **BU** | EXPRESS |
| **User Surface** | Halo-Dash + Mitra mobile |
| **Mitra-facing?** | Yes |
| **Reviewers** | [TBD — Express Eng Lead], Fayzul (Tribe Lead Express) |
| **Approvers** | [TBD — approver: COO] |
| **Approval Date** | — |

---

## 3. Background

### Problem Statement
Mitra Reservasi yang sudah inactive masih menempati slot dispatch dan menyebabkan dispatch fail saat trip masuk. Dispatcher tidak punya tooling untuk auto-suspend, sehingga melakukan manual review yang tidak scalable seiring growth Jabodetabek.

### Evidence & Data
- 18.3% mitra Lvl 1 di Jabodetabek lapse dalam 30 hari setelah aktivasi tanpa menyelesaikan 5 deliveries [source: docs/mitra-cohort-2026-q1.md, retrieved: 2026-05-20]
- Phase-19 dispatch forensic: 47.5% loss correlation dengan mitra unavailable >30 menit post-acceptance [source: vault note project_ptbox_phase19_loss_forensic.md, retrieved: 2026-05-20]
- Manual suspension volume di Halo-Dash tumbuh 3.2× YoY (Q1 2025 → Q1 2026) [source: Halo-Dash ops dashboard screenshot retrieved 2026-05-15]

### Context & History
Tidak ada attempt sebelumnya. Manual suspension policy ada tapi tidak konsisten antar dispatcher. Closest prior art: Gojek's auto-deactivation policy untuk GoRide (publicly described in their 2023 blog post — referenced but not relied on).

### Cost of Inaction
- Dispatch fail rate terus naik seiring pertumbuhan mitra base
- Dispatcher productivity tergerus untuk manual triage
- Risiko regulasi UU PDP jika audit trail suspension tidak konsisten

### Regulatory Context

| Regulation | Jurisdiction | Key Requirements for This Initiative | Status |
|---|---|---|---|
| UU PDP 2022 | Indonesia | Lawful basis for processing mitra suspension data; audit log of every action; 5y retention; right-to-erasure on appeal | `[TBD — compliance review required]` |

**Compliance Review Owner:** [TBD — Legal Counsel name]
**Review Deadline:** [TBD — before In Review status]

---

## 4. Objective

### Primary Objective
> Free dispatch slot capacity from inactive mitra Reservasi accounts in Jabodetabek by automating suspension after 3 consecutive missed dispatches in a single day, without introducing dispute volume above ops capacity.

### Key Results

| # | Key Result | Baseline | Target | Timeline |
|---|---|---|---|---|
| KR1 | Dispatch success rate (Jabodetabek, Reservasi tier) | [TBD — baseline needed] | +3pp absolute | 2026-Q3 |
| KR2 | Dispatch dispute volume after auto-suspension | 0 (new) | <30/week | 2026-Q3 |
| KR3 | Dispatcher hours spent on manual suspension review | [TBD — baseline needed] | -50% | 2026-Q3 |

### Company OKR Alignment
Dash 2026 OKR Q3: "Improve operational efficiency in Express tribe by 15%."

---

## 5. Scope & Boundaries

### In Scope
- Auto-suspension rule for mitra Reservasi after 3 missed dispatches in 1 calendar day (WIB)
- Push notification to mitra at suspension event
- Halo-Dash ops view of auto-suspension events
- Mitra appeal flow ("Ajukan Banding") in mitra app with 7-day window
- Audit log of every suspension event for UU PDP compliance

### Out of Scope

| Item | Reason | Future Plan |
|---|---|---|
| Auto-suspend for non-Reservasi mitra types (Instant, Scheduled) | Different ops model | Phase 2 |
| Full re-activation flow (handled by mitra-services) | Owned by separate tribe | Tracked in DEP-001 |
| Suspension for non-dispatch reasons (KYC, vehicle expiry) | Different policy domain | Separate PRD |

### Platform & Segment Coverage

| Dimension | Coverage |
|---|---|
| **Platform** | Halo-Dash web (ops) + Mitra mobile (Android, iOS) |
| **User Segment** | Mitra Reservasi Lvl 1–3 |
| **Geography** | Jabodetabek (Phase 1); nationwide deferred to Phase 2 |
| **Phase** | Phase 1 |

---

## 6. Hypothesis

> *"We believe that **auto-suspending mitra Reservasi after 3 missed dispatches in a single day** for **Jabodetabek mitra Lvl 1–3** will result in **a 3pp absolute increase in dispatch success rate within 30 days**, because **Phase-19 forensic data shows 47.5% of dispatch fails correlate with mitra unavailable for 30+ minutes after accepting**."*

### Confidence Level
`Medium`

**Reasoning:** Strong correlation evidence in Phase 19 forensic data, but no prior A/B test. Mitra behavior post-suspension is uncertain — may shift problem rather than solve it.

### Falsification Condition
If dispatch success rate does not improve by ≥1pp within 30 days AND dispute volume rises above 50/week, the hypothesis is wrong and we should roll back.

### Post-Launch Learning Plan
30-day retrospective owned by Express tribe lead (Fayzul). Re-evaluate hypothesis with 30d data and decide Phase 2 expansion.

---

## 7. Success Metrics

### Primary Metrics

| Metric | Type | Baseline | Target | Measurement Method | Timeline | Owner |
|---|---|---|---|---|---|---|
| Dispatch success rate | Leading | [TBD — baseline needed] | +3pp | Metabase query `dispatch_success_v2` | 2026-Q3 | [TBD — owner: ] |
| Dispatcher manual review hours/week | Lagging | [TBD — baseline needed] | -50% | Halo-Dash time-tracking export | 2026-Q3 | [TBD — owner: ] |

### Guardrail Metrics

| Metric | Baseline | Alert Threshold | Measurement Method | Owner |
|---|---|---|---|---|
| Mitra suspension dispute count (Reservasi cohort) | 0 (new) | >30/week | Halo-Dash ops dashboard | [TBD — owner: ] |
| Mitra NPS (Reservasi cohort) | [TBD] | drop >3pt | Monthly survey | [TBD — owner: ] |
| False-positive rate (verified by ops review) | 0 (new) | >5% | Weekly ops audit sample | [TBD — owner: ] |

---

## 8. Requirements

### Functional Requirements

#### US-001 — Mitra receives suspension notification

**Priority:** `Must-have`

**User Story:**
> As a **mitra Reservasi Lvl 1 di Jabodetabek**, I want to **menerima notifikasi saat akun saya di-suspend secara otomatis**, so that **saya mengerti alasan dan bisa mengajukan banding**.

**Acceptance Criteria:**
```gherkin
Scenario: Auto-suspension triggered after 3 missed dispatches
  Given mitra Reservasi has accepted 3 dispatches today and failed to complete each within SLA
  When the auto-suspension job runs at 23:59 WIB
  Then mitra account status changes to "Suspended"
    And mitra receives push notification with copy: "Akun Anda telah di-suspend sementara karena melewatkan 3 dispatch hari ini. Silakan ajukan banding melalui menu Bantuan."
    And the suspension event is logged with mitra_id, dispatch_ids, and timestamp

Scenario: Mitra has 2 missed dispatches — no suspension
  Given mitra Reservasi has 2 missed dispatches today
  When the auto-suspension job runs at 23:59 WIB
  Then mitra account status remains "Active"
    And no notification is sent
```

**Dependencies:** US-002 (appeal flow)
**Notes:** Voice rule — formal "Anda" throughout.

---

#### US-002 — Mitra submits appeal

**Priority:** `Must-have`

**User Story:**
> As a **suspended mitra Reservasi**, I want to **submit a banding request through the mitra app**, so that **ops team dapat review dan reinstate akun saya dalam 24 jam**.

**Acceptance Criteria:**
```gherkin
Scenario: Mitra submits appeal within 7-day window
  Given mitra account is "Suspended" and suspension occurred within last 7 days
  When mitra taps "Ajukan Banding" in mitra app and submits reason text
  Then a ticket is created in Halo-Dash queue "mitra-suspension-appeals"
    And mitra receives confirmation push within 60 seconds
    And the appeal event is logged

Scenario: Appeal attempted after 7-day window
  Given mitra account is "Suspended" and suspension occurred >7 days ago
  When mitra taps "Ajukan Banding"
  Then the app shows: "Periode banding 7 hari telah lewat. Silakan hubungi Customer Care."
    And no ticket is created
```

**Dependencies:** None
**Notes:** Ops SLA 24h for review.

---

### Non-Functional Requirements

| ID | Category | Requirement | Priority | Verification Method |
|---|---|---|---|---|
| NFR-001 | Performance | Auto-suspension batch completes <10 min for 50k mitra | `Must-have` | Load test in staging |
| NFR-002 | Security | All suspension events logged to immutable audit trail | `Must-have` | Code review + SIEM check |
| NFR-003 | Compliance | UU PDP — audit log retained 5 years | `Must-have` | Legal/compliance review |
| NFR-004 | Availability | Appeal API uptime ≥99.5% business hours WIB | `Must-have` | Grafana SLA dashboard |

---

## 9. Solution

### Proposed Approach
Daily cron job at 23:59 WIB reads dispatch event stream for last 24h, counts missed dispatches per Reservasi mitra, flips status to "Suspended" for any with ≥3 misses, emits `mitra_suspended` event. Appeal handled via existing Halo-Dash ticket queue infra.

### Design Artifacts

| Artifact | Link | Status |
|---|---|---|
| Mitra app flow | [Design pending — link to be added] | Draft |
| Halo-Dash ops queue view | [Design pending — link to be added] | Draft |

### User Story Coverage Map

| User Story | Solution Component | Design Reference |
|---|---|---|
| US-001 | Auto-suspension cron + push notification | [Design pending] |
| US-002 | Mitra app banding screen + Halo-Dash queue | [Design pending] |

### Considered Alternatives

| Option | Description | Why Rejected |
|---|---|---|
| Manual suspension by dispatcher | Status quo — dispatchers flag individually | Doesn't scale; bias risk |
| Soft throttle (reduce priority) | Reduce dispatch priority instead of suspend | Doesn't free slot; mitra confusion |
| Streak-based (e.g., 5-in-3-days) | Wider window | More complex; harder to explain to mitra |

### Technical Constraints & Decisions
Reuses existing mitra-status service. Depends on dispatch-events Kafka topic. Notification via existing push infra.

---

## 10. Metric Monitoring

| Field | Detail |
|---|---|
| **Dashboard / Tool** | Metabase `mitra-auto-suspend-v1` |
| **DRI** | [TBD — owner: ] |
| **Monitoring Cadence** | Daily launch week → Weekly month 1 → Bi-weekly after |
| **Primary Metric Alert Threshold** | Dispatch success rate drop >2pp |
| **Guardrail Metric Alert Threshold** | Dispute count >30/wk |
| **Rollback Trigger** | Dispute >50/wk OR NPS drop >5pt OR false-positive >5% |
| **Escalation Path** | Slack `#tribe-express-alerts` → DRI → Tribe Lead Fayzul → COO |

### Post-Launch Review Schedule

| Review | Date | Participants | Owner |
|---|---|---|---|
| 2-Week Check-in | [TBD — dates to be confirmed] | PM, Eng Lead, Ops Lead | [TBD] |
| 30-Day Review | [TBD] | PM, Eng Lead, Tribe Lead | [TBD] |
| Quarterly Retrospective | [TBD] | All stakeholders | [TBD] |

---

## 11. Event & Data Tracking

| Event Name | Trigger Condition | Properties | Side | Destination | Maps to Metric | Compliance Flag |
|---|---|---|---|---|---|---|
| `mitra_suspended` | Auto-suspension job marks status=Suspended | `{ mitra_id, tribe, bu, level, kota, missed_dispatch_ids[], reason: "auto_3_missed", ts }` | Server | Mixpanel + BI | Dispatch success rate | Yes |
| `mitra_appeal_submitted` | Mitra submits banding form | `{ mitra_id, suspension_id, reason_text, ts }` | Client (mitra app) | Mixpanel | Dispute count | Yes |
| `mitra_reinstated` | Ops approves appeal in Halo-Dash | `{ mitra_id, suspension_id, ops_user_id, ts }` | Server | Mixpanel + BI | Dispute count | Yes |

**Data Team Sign-off:**
- [x] Pending
- [ ] Approved

---

## 12. FAQ

| # | Question | Answer | Date | Answered By | Status |
|---|---|---|---|---|---|
| 1 | Apakah dispatch sengaja di-decline juga dihitung "missed"? | Tidak — hanya accepted lalu tidak diselesaikan dalam SLA | 2026-05-18 | Fayzul | `Resolved` |
| 2 | Bagaimana behavior saat mitra sakit/cuti? | [Open] — perlu policy clarification | — | [TBD — owner: Tribe Lead] | `Open` |
| 3 | Apakah suspension affect pending payroll? | [Open] — finance team review | — | [TBD — owner: Finance Lead] | `Open` |

---

# OPTIONAL SECTIONS

---

## 13. Risks & Mitigations

### Regulatory Risks

| ID | Regulation | Risk Description | Likelihood | Impact | Mitigation | Contingency | Owner | Phase |
|---|---|---|---|---|---|---|---|---|
| RR-001 | UU PDP 2022 | Processing mitra suspension without lawful basis or proper audit | `M` | `H` | T&C update to include auto-suspension; immutable audit log; 5y retention | Cease auto-suspension; notify Kominfo if breach | [TBD — Legal Counsel] | Pre-launch |

**Legal/Compliance Sign-off on Regulatory Risks:**
- [ ] Pending — [TBD — Legal Counsel]
- [ ] Approved

### Operational & Technical Risks

| ID | Risk | Likelihood | Impact | Mitigation | Contingency | Owner | Phase |
|---|---|---|---|---|---|---|---|
| R-001 | Wrongful suspension erodes mitra trust | `M` | `H` | Conservative threshold (3 misses, full day); appeal SLA 24h; weekly false-positive audit | Batch reinstate; in-app apology | [TBD — owner: ] | Pre-launch |
| R-002 | GPS/geofence error causes false "missed" | `M` | `M` | 200m tolerance in geofence check; cross-reference GPS heatmap | Pause auto-suspension in affected polygon | [TBD — owner: ] | Pre-launch |
| R-003 | Pending payroll at suspension time | `L` | `M` | Settle pending payroll before suspension status lock | Manual settlement via finance | [TBD — owner: ] | Pre-launch |
| R-004 | Dispute volume spike overwhelms ops queue | `M` | `M` | Phased rollout Jakarta-first; ops capacity plan | Pause new suspensions; manual-only mode | [TBD — owner: ] | Post-launch |

---

## 14. Dependencies

### Upstream

| ID | Dependency | Team / Vendor | What Is Needed | Expected Date | Confirmed | Risk if Delayed | Escalation |
|---|---|---|---|---|---|---|---|
| DEP-001 | Mitra re-activation API | Mitra-services tribe | API + Halo-Dash UI for ops to reinstate | [TBD] | No | Blocks launch | Tribe Lead Fayzul → COO |
| DEP-002 | Push notification capacity uplift | Platform tribe | 3x current send rate | [TBD] | No | Notifications drop at peak | Platform Lead → CTO |

### Downstream

| ID | Dependent Initiative | Team | What They Need | Expected Date |
|---|---|---|---|---|
| DEP-D01 | Mitra payroll v3 | Finance tribe | Suspension status feed for payroll lock | [TBD] |

---

## 15. Launch Plan

### Rollout Strategy
Staged by region: Jakarta-only Phase 1a (2 weeks shadow mode → 2 weeks live), then Jabodetabek-wide Phase 1b.

### Go / No-Go Criteria

| Stage | Go Condition | No-Go Condition | Decision Maker |
|---|---|---|---|
| Shadow mode (Jakarta) | Job runs but no suspensions executed; <0.1% mismatch | Mismatch >1% | Eng Lead |
| Jakarta live | Shadow dispute simulation <10/wk; legal sign-off | Dispute spike in shadow | Fayzul |
| Jabodetabek full | Dispute <30/wk in Jakarta; NPS stable | NPS drop >3pt | COO |

### Communications Plan

| Audience | Channel | Message Summary | Timing | Owner |
|---|---|---|---|---|
| Mitra (in-app) | Push + in-app modal | "Update kebijakan dispatch — mulai [tgl], Anda akan otomatis di-suspend jika melewatkan 3 dispatch dalam 1 hari" | 7 days before launch | [TBD] |
| Ops team | Slack + briefing | New queue handling, SLA 24h | 3 days before | [TBD] |
| Customer support | Runbook + training | Appeal flow handling | 5 days before | [TBD] |

### Rollback Plan

| Field | Detail |
|---|---|
| **Rollback Trigger** | Dispute >50/wk OR NPS drop >5pt OR false-positive >5% |
| **Decision Maker** | Fayzul |
| **Execution Time** | <1h (feature flag toggle) |
| **Rollback Steps** | Toggle `auto_suspension_enabled = false`; existing suspensions remain; ops handles backlog manually |

**Launch DRI:** [TBD — not the PM]

**Compliance Sign-off:**
- [ ] Pending
- [ ] Approved

---

## 16. Stakeholder Map

| Name | Role / Title | Team / Org | RACI | Comms Cadence | Preferred Channel |
|---|---|---|---|---|---|
| Fayzul | Tribe Lead Express | Dash Express | `A` | Weekly | Slack DM |
| Irfan Prima Putra | PM Auto-Suspend | Dash Express | `R` | Daily during execution | Slack |
| [TBD] | Eng Lead Express | Dash Platform | `R` | Daily during execution | Slack |
| [TBD] | Legal Counsel | Dash Legal | `C` | At milestones | Email |
| Aditya Brahmana | CEO | Dash | `I` | At milestones | Slack |

---

*— Example Dash PRD — generated by dash-prd skill —*
