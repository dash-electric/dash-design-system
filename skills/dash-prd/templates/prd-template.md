# [Initiative Name]

> **One-line summary of what this initiative is and why it matters for Dash.**

---

## How to Use This Template

- Fill in every **Core Section**. Do not skip or leave placeholders.
- Add **Optional Sections** only when the trigger condition is met.
- All requirements are written as **user stories**. All acceptance criteria are written in **Gherkin syntax**.
- Rules under each section are non-negotiable standards — they exist to prevent rework and stakeholder confusion.
- Move Document Status to `In Review` only when all Core Sections are complete.
- This document is the single source of truth. If it is not written here, it does not exist.
- **Dash-specific:** Tribe / BU / User Surface / Mitra-facing fields in §2 are **mandatory**. If mitra-facing, all UI copy uses formal "Anda".

---

# CORE SECTIONS

---

## 1. Initiative Name

`[Auto Suspend Mitra Reservasi]`

### Rules
- Maximum 8 words.
- Use a noun phrase, not a verb phrase.
- Must be unique and match Jira, Notion, and roadmap exactly.
- If phased, suffix with phase number.

---

## 2. Document Status

| Field | Detail |
|---|---|
| **Status** | `Draft` |
| **Version** | v0.1 |
| **Last Updated** | YYYY-MM-DD |
| **Author** | [Name] |
| **Owner** | [Name] |
| **Tribe** | [Express / Delivery / X-Dock / Scheduled-Instant / Canvasser-Rental / 4-Wheel / Outsourcing / Staging] |
| **BU** | [QUICK_COMMERCE / EXPRESS / X_DOCK / SCHEDULED_INSTANT / CANVASSER_RENTAL / 4_WHEEL / OUTSOURCING / STAGING] |
| **User Surface** | [Halo-Dash / Portal-v2 / Basecamp / Mitra mobile / React-Fleet] |
| **Mitra-facing?** | [Yes / No] |
| **Reviewers** | [Engineering Lead], [Tribe Lead / Business Stakeholder] |
| **Approvers** | [Name], [Name] |
| **Approval Date** | — |

### Rules
- Fixed status vocabulary only: Draft → In Review → Approved → In Execution → Deprecated.
- Named individuals as reviewers, not teams.
- No development before Approved.
- **Tribe / BU / User Surface / Mitra-facing are mandatory.** Write `[TBD — confirm with tribe lead]` if unknown; do not omit.
- If `Mitra-facing? = Yes`, all UI copy in §8 and §9 must use formal "Anda" per Dash voice rule.

---

## 3. Background

### Problem Statement
[Describe the user or business pain. Who is affected (mitra, outlet, ops)? How often? How severely? Lead with the problem — never the solution.]

### Evidence & Data
[Cite data, mitra research, support tickets, incidents, or dispatch dashboards. No unsubstantiated claims. Example: "18.3% of mitra Lvl 1 in Jabodetabek lapsed within 30d of activation [source: docs/mitra-cohort-2026-q1.md, retrieved: 2026-05-20]."]

### Context & History
[Prior work, failed attempts, or related initiatives. Link to prior PRDs, vault notes, or post-mortems.]

### Cost of Inaction
[What is lost if this is not pursued — mitra churn, dispatch fail rate, regulatory exposure, revenue, competitive position vs. Gojek/Grab/Maxim?]

### Regulatory Context
*(Include this subsection when compliance signals were confirmed at intake. Remove this subsection if no compliance signals apply — note its removal explicitly: "No regulatory requirements identified.")*

| Regulation | Jurisdiction | Key Requirements for This Initiative | Status |
|---|---|---|---|
| [OJK POJK 12/2018] | Indonesia | [eKYC obligations — e.g., NIK validation against Dukcapil] | `Confirmed` / `[TBD — compliance review required]` |
| [UU PDP 2022] | Indonesia | [Lawful basis for processing mitra PII; right-to-erasure flow] | `Confirmed` / `[TBD — compliance review required]` |
| [BI-SNAP] | Indonesia | [Payment integration standards if payroll touched] | `Confirmed` / `[TBD — compliance review required]` |

**Compliance Review Owner:** [Name — individual, not team]
**Review Deadline:** [Date or `[TBD]`]

### Rules
- Lead with pain, not solution.
- Every claim needs a cited source.
- 3–5 paragraphs. Link to longer docs rather than embedding.
- Cost of inaction is mandatory.
- Regulatory Context is mandatory when any compliance signal was confirmed at intake.
- Indonesian regulation citations must include specific regulation number (e.g., `OJK POJK 12/2018`, not just `OJK`).

---

## 4. Objective

### Primary Objective
> [One outcome statement. No feature descriptions. Example: "Reduce mitra Reservasi inactive accounts that consume dispatch slots by enforcing automatic suspension after 3 consecutive missed dispatches in a single day."]

### Key Results

| # | Key Result | Baseline | Target | Timeline |
|---|---|---|---|---|
| KR1 | Dispatch success rate (Jabodetabek, Reservasi tier) | [Value]% | [Value]% | [Date] |
| KR2 | Active Reservasi mitra ratio | [Value]% | [Value]% | [Date] |
| KR3 | Dispute volume after auto-suspension | [Value]/wk | <[Value]/wk | [Date] |

### Company OKR Alignment
[Name the parent Dash OKR. If none exists, escalate before proceeding.]

### Rules
- One primary objective. Multiple = scope that needs splitting.
- Every KR needs a numeric baseline and target.
- Traceable to a company or tribe OKR.

---

## 5. Scope & Boundaries

### In Scope
- [Item — e.g., Auto-suspend rule for Reservasi mitra after 3 missed dispatches in 1 calendar day]
- [Item]

### Out of Scope

| Item | Reason | Future Plan |
|---|---|---|
| [Auto-suspend for non-Reservasi mitra types] | Different ops model, separate appeal flow needed | Phase 2 |
| [Re-activation flow] | Handled by mitra-services tribe | Tracked in DEP-001 |

### Platform & Segment Coverage

| Dimension | Coverage |
|---|---|
| **Platform** | [Halo-Dash web (ops view) + Mitra mobile (notification)] |
| **User Segment** | [Mitra Reservasi Lvl 1–3 in Jabodetabek] |
| **Geography** | [Jabodetabek Phase 1; nationwide Phase 2] |
| **Phase** | [Phase 1] |

### Rules
- Both In and Out of Scope must be explicitly listed.
- Every Out item needs a reason.
- Platform and segment are mandatory.

---

## 6. Hypothesis

> *"We believe that **[auto-suspending mitra Reservasi after 3 missed dispatches]** for **[Jabodetabek Lvl 1–3 mitra]** will result in **[higher dispatch success rate and fewer slot-blocking inactive accounts]**, because **[Phase-19 forensic data shows 47.5% of dispatch fails correlate with mitra unavailable for 30+ min after acceptance]**."*

[Write hypothesis here.]

### Confidence Level
`High` / `Medium` / `Low`

**Reasoning:** [Why this level?]

### Falsification Condition
[What result would prove this hypothesis wrong? Example: "If dispatch success rate does not improve by ≥3pp within 30 days AND dispute volume rises by >5%, the hypothesis is wrong."]

### Post-Launch Learning Plan
[Who owns the retrospective? When?]

### Rules
- Template is mandatory. All four components required.
- Must be falsifiable.
- Confidence level needs written rationale.

---

## 7. Success Metrics

### Primary Metrics

| Metric | Type | Baseline | Target | Measurement Method | Timeline | Owner |
|---|---|---|---|---|---|---|
| Dispatch success rate | Leading | [Value]% | [Value]% | Metabase query `dispatch_success_v2` | [Date] | [Name] |
| Mitra Lvl 1→2 progression | Lagging | [Value]% | [Value]% | Mixpanel cohort `mitra_progression` | [Date] | [Name] |

### Guardrail Metrics

| Metric | Baseline | Alert Threshold | Measurement Method | Owner |
|---|---|---|---|---|
| Mitra suspension dispute count | [Value]/wk | >[Value]/wk | Halo-Dash ops dashboard | [Name] |
| Mitra NPS (Reservasi cohort) | [Value] | <[Value] | Monthly survey | [Name] |

### Rules
- Min one leading + one lagging metric.
- Guardrail metrics are mandatory.
- All fields required per row.
- Owner = named individual, not team.

---

## 8. Requirements

> User stories: *"As a [specific role], I want to [action], so that [benefit]."*
> Acceptance criteria: Gherkin syntax, minimum 2 scenarios per story.
> **Dash voice rule:** If §2 `Mitra-facing? = Yes`, all UI copy MUST use formal "Anda".

---

### Functional Requirements

#### US-001 — [Auto-suspension notification to mitra]

**Priority:** `Must-have`

**User Story:**
> As a **mitra Reservasi Lvl 1 di Jabodetabek**, I want to **menerima notifikasi saat akun saya di-suspend secara otomatis**, so that **saya mengerti alasan dan bisa mengajukan banding**.

**Acceptance Criteria:**
```gherkin
Scenario: Auto-suspension triggered after 3 missed dispatches
  Given mitra Reservasi has missed 3 consecutive dispatches in 1 calendar day
  When the auto-suspension job runs at 23:59 WIB
  Then mitra account status changes to "Suspended"
    And mitra receives push notification: "Akun Anda telah di-suspend sementara karena melewatkan 3 dispatch hari ini. Silakan ajukan banding melalui menu Bantuan."
    And the suspension event is logged with mitra_id, dispatch_ids, and timestamp

Scenario: Mitra missed 2 dispatches — no suspension
  Given mitra Reservasi has missed 2 dispatches in 1 calendar day
  When the auto-suspension job runs at 23:59 WIB
  Then mitra account status remains "Active"
    And no notification is sent
```

**Dependencies:** [US-002 — Appeal flow]
**Notes:** Voice rule applied — formal "Anda", no slang.

---

#### US-002 — [Mitra appeal flow via Halo-Dash]

**Priority:** `Must-have`

**User Story:**
> As a **suspended mitra Reservasi**, I want to **submit a banding request through the mitra app**, so that **ops team can review and potentially reinstate my account within 24 hours**.

**Acceptance Criteria:**
```gherkin
Scenario: Mitra submits appeal within 7 days of suspension
  Given mitra account status is "Suspended" and suspension occurred <7 days ago
  When mitra taps "Ajukan Banding" in the mitra app and submits a reason
  Then a ticket is created in Halo-Dash queue "mitra-suspension-appeals"
    And mitra receives confirmation push notification within 60 seconds

Scenario: Appeal submitted after 7-day window
  Given mitra account status is "Suspended" and suspension occurred >7 days ago
  When mitra taps "Ajukan Banding"
  Then the app shows: "Periode banding 7 hari telah lewat. Silakan hubungi Customer Care."
    And no ticket is created
```

**Dependencies:** None
**Notes:** Ops SLA 24h handling required.

---

### Non-Functional Requirements

| ID | Category | Requirement | Priority | Verification Method |
|---|---|---|---|---|
| NFR-001 | Performance | Auto-suspension batch job completes for 50k mitra in <10 min | `Must-have` | Load test in staging |
| NFR-002 | Security | All suspension events logged to audit trail with mitra_id (hashed PII) | `Must-have` | Code review + SIEM check |
| NFR-003 | Compliance | UU PDP — audit log of every suspension/reinstatement, retained 5 years | `Must-have` | Legal/compliance review |
| NFR-004 | Availability | Appeal API uptime ≥99.5% during business hours WIB | `Must-have` | Grafana SLA dashboard |

### Rules
- User stories only. Specific roles. Min 2 Gherkin scenarios each.
- MoSCoW priority on every story.
- NFRs need verification methods.
- Mitra-facing UI copy uses formal "Anda".

---

## 9. Solution

### Proposed Approach
[Product-level description. Reference designs — do not describe UI in prose.]

### Design Artifacts

| Artifact | Link | Status |
|---|---|---|
| Mitra App Flow | [Figma link] | `Draft` / `Final` |
| Halo-Dash Ops View | [Figma link] | `Draft` / `Final` |
| Notification copy | [Notion link] | `Draft` / `Final` |

### User Story Coverage Map

| User Story | Solution Component | Design Reference |
|---|---|---|
| US-001 | Auto-suspension cron job + push service | [Screen / link] |
| US-002 | Mitra app banding screen + Halo-Dash queue | [Screen / link] |

### Considered Alternatives

| Option | Description | Why Rejected |
|---|---|---|
| Option A | Manual suspension by dispatcher | Doesn't scale; bias risk; current state — no improvement |
| Option B | Soft-throttle (reduce dispatch priority) instead of suspend | Doesn't free slot; mitra confusion higher |

### Technical Constraints & Decisions
[Architectural decisions or constraints — e.g., uses existing mitra-status service; depends on dispatch event stream; reuses notification infra.]

### Rules
- Design links required.
- All user stories must appear in coverage map.
- Alternatives section is mandatory — always include at least one.

---

## 10. Metric Monitoring

| Field | Detail |
|---|---|
| **Dashboard / Tool** | Metabase: `mitra-auto-suspend-v1` |
| **DRI** | [Named individual] |
| **Monitoring Cadence** | Daily launch week → Weekly month 1 → Bi-weekly after |
| **Primary Metric Alert Threshold** | Dispatch success rate drop >2pp vs. baseline |
| **Guardrail Metric Alert Threshold** | Dispute count >20/wk |
| **Rollback Trigger** | Dispute count >50/wk OR mitra NPS drop >5pt |
| **Escalation Path** | Slack #tribe-express-alerts → DRI → Tribe Lead → COO |

### Post-Launch Review Schedule

| Review | Date | Participants | Owner |
|---|---|---|---|
| 2-Week Check-in | YYYY-MM-DD | [PM, Eng Lead, Ops Lead] | [Name] |
| 30-Day Review | YYYY-MM-DD | [PM, Eng Lead, Tribe Lead] | [Name] |
| Quarterly Retrospective | YYYY-MM-DD | [Stakeholders] | [Name] |

### Rules
- Named DRI, not a team.
- Alert thresholds defined pre-launch.
- Rollback trigger must be observable, not vague.
- Review dates set at Approved and put in calendar.

---

## 11. Event & Data Tracking

> Naming: `noun_verb`. Every event maps to a metric in §7. Data team sign-off required before dev.

| Event Name | Trigger Condition | Properties | Side | Destination | Maps to Metric | Compliance Flag |
|---|---|---|---|---|---|---|
| `mitra_suspended` | Auto-suspension job marks account Suspended | `{ mitra_id, tribe, bu, level, kota, missed_dispatch_ids[], reason: "auto_3_missed" }` | Server | Mixpanel + internal BI | Dispatch success rate | Yes (mitra_id) |
| `mitra_appeal_submitted` | Mitra submits banding form | `{ mitra_id, suspension_id, reason_text, ts }` | Client (mitra app) | Mixpanel | Dispute count | Yes |
| `mitra_reinstated` | Ops approves appeal in Halo-Dash | `{ mitra_id, suspension_id, ops_user_id, ts }` | Server | Mixpanel + BI | Dispute count | Yes |

**Data Team Sign-off:**
- [ ] Pending
- [ ] Approved — [Name], [Date]

### Rules
- noun_verb naming, no exceptions.
- Every event traces to §7 metric.
- Trigger conditions are specific, not generic.
- Client vs. server-side distinguished.
- Sign-off required before dev starts.

---

## 12. FAQ

| # | Question | Answer | Date | Answered By | Status |
|---|---|---|---|---|---|
| 1 | Apakah dispatch sengaja di-decline juga dihitung sebagai "missed"? | Tidak — hanya dispatch yang accepted lalu tidak diselesaikan dalam SLA | YYYY-MM-DD | [Name] | `Resolved` |
| 2 | Bagaimana behavior saat mitra sakit / cuti? | [Open question] | — | [Owner] | `Open` |

### Rules
- Add questions immediately when raised.
- Open items need an owner.
- Never delete resolved questions.
- At Approved: zero Open items without a resolution plan.

---

---

# OPTIONAL SECTIONS

> Include only when trigger condition is met. Delete this instruction block in the final document.

---

## 13. Risks & Mitigations
*(Include when: payments, compliance, regulated data, multi-tribe dependencies, mitra suspension/repossession, payment reversal, geofence accuracy, vehicle/fleet ops, charging infra, capacity spike, mitra gaming)*

### Regulatory Risks
*(Mandatory when compliance signals were confirmed at intake. One row per confirmed regulation minimum.)*

| ID | Regulation | Risk Description | Likelihood | Impact | Mitigation | Contingency | Owner | Phase |
|---|---|---|---|---|---|---|---|---|
| RR-001 | UU PDP 2022 | Processing mitra suspension without lawful basis or audit trail | `M` | `H` | Legal review of T&C; audit log on every suspension; 5y retention | Cease auto-suspension; notify Kominfo if breach | [Name] | Pre-launch |
| RR-002 | OJK POJK 12/2018 | (if eKYC re-trigger involved) Re-verification flow bypassing eKYC standards | `L` | `H` | Compliance team review of re-activation flow | Suspend re-activation; manual review only | [Name] | Pre-launch |

**Legal/Compliance Sign-off on Regulatory Risks:**
- [ ] Pending — [Name, Title to review]
- [ ] Approved — [Name, Title], [Date]

### Operational & Technical Risks

| ID | Risk | Likelihood | Impact | Mitigation | Contingency | Owner | Phase |
|---|---|---|---|---|---|---|---|
| R-001 | Wrongful suspension (false positive) erodes mitra trust | `M` | `H` | Conservative threshold (3 misses); appeal flow SLA 24h; whitelist for known issues | Reinstate batch; public apology in mitra app | [Name] | Pre-launch |
| R-002 | Geofence/GPS error causes false "missed" classification | `M` | `M` | Cross-check with GPS heatmap; allow 200m tolerance | Pause auto-suspension in affected polygon | [Name] | Pre-launch |
| R-003 | Payment reversal — pending payroll at suspension time | `L` | `M` | Settle pending payroll before suspension lock | Manual settlement via finance team | [Name] | Pre-launch |
| R-004 | 10x dispute volume spike overwhelms ops queue | `M` | `M` | Phased rollout (Jakarta first); ops capacity plan | Pause new suspensions; manual review only | [Name] | Post-launch |

### Rules
- Both mitigation and contingency required per risk row.
- Named individual owner per row, not team.
- Distinguish pre-launch vs. post-launch risks.
- Every confirmed regulation from §3 Regulatory Context must have at least one row in Regulatory Risks.
- Each regulatory risk row must name the specific regulation (e.g., `OJK POJK 12/2018`, `UU PDP 2022`) — not "regulatory risk" generically.
- Legal/compliance sign-off checkbox is required in this section when regulatory risks are present.

---

## 14. Dependencies
*(Include when: blocked by or blocking another tribe, or relies on third-party system)*

### Upstream Dependencies

| ID | Dependency | Team / Vendor | What Is Needed | Expected Date | Confirmed | Risk if Delayed | Escalation |
|---|---|---|---|---|---|---|---|
| DEP-001 | Mitra re-activation API | Mitra-services tribe | API + UI for ops to reinstate | YYYY-MM-DD | Yes / No | Blocks launch | [Path] |
| DEP-002 | Push notification capacity uplift | Platform tribe | 5x current send rate | YYYY-MM-DD | Yes / No | Notifications drop | [Path] |

### Downstream Dependencies

| ID | Dependent Initiative | Team | What They Need | Expected Date |
|---|---|---|---|---|
| DEP-D01 | Mitra payroll v3 | Finance tribe | Suspension status feed | YYYY-MM-DD |

### Rules
- Confirmed column must be Yes before Approved.
- Hard unconfirmed dependencies block Approved status.
- Keep this section live during execution.

---

## 15. Launch Plan
*(Include when: coordinated rollout, staged release, or compliance gate required)*

### Rollout Strategy
`[Staged rollout by kota — Jakarta first, then Jabodetabek, then nationwide]`

[Rationale for chosen strategy.]

### Go / No-Go Criteria

| Stage | Go Condition | No-Go Condition | Decision Maker |
|---|---|---|---|
| Internal (shadow mode) | Job runs but no suspensions executed; <0.1% mismatch | Mismatch >1% | [Eng Lead] |
| Jakarta limited rollout | Dispute rate <10/wk in shadow; legal sign-off | Dispute spike in shadow | [Tribe Lead] |
| Full Jabodetabek | Dispute rate <30/wk; mitra NPS stable | NPS drop >3pt | [COO] |

### Communications Plan

| Audience | Channel | Message Summary | Timing | Owner |
|---|---|---|---|---|
| Mitra (in-app) | Push + in-app modal | "Update kebijakan dispatch — mulai [tgl], Anda akan otomatis di-suspend jika melewatkan 3 dispatch dalam 1 hari" | 7 days before launch | [Name] |
| Ops team | Slack + briefing | New queue handling, SLA 24h | 3 days before launch | [Name] |
| Customer support | Runbook + training | Appeal flow handling | 5 days before launch | [Name] |

### Rollback Plan

| Field | Detail |
|---|---|
| **Rollback Trigger** | Dispute count >50/wk OR mitra NPS drop >5pt OR false-positive rate >5% |
| **Decision Maker** | [Tribe Lead] |
| **Execution Time** | <1h (feature flag toggle) |
| **Rollback Steps** | Toggle `auto_suspension_enabled = false` in feature flag; existing suspensions remain but no new ones; ops handles backlog manually |

**Launch DRI:** [Name — not the PM]

**Compliance Sign-off:**
- [ ] Pending
- [ ] Approved — [Name, Title], [Date]

### Rules
- Rollback plan required.
- Go/No-Go criteria defined before launch day.
- Customer support in comms plan always.
- Launch DRI ≠ PM.

---

## 16. Stakeholder Map
*(Include when: >3 tribes involved, executive visibility needed, or external parties present)*

### RACI Matrix

| Name | Role / Title | Team / Org | RACI | Comms Cadence | Preferred Channel |
|---|---|---|---|---|---|
| [Name] | Tribe Lead Express | Dash Express | `A` | Weekly | Slack DM |
| [Name] | PM Auto-Suspend | Dash Express | `R` | Daily during execution | Slack |
| [Name] | Eng Lead | Dash Platform | `R` | Daily during execution | Slack |
| [Name] | Legal Counsel | Dash Legal | `C` | At milestones | Email |
| [Name] | COO | Dash | `I` | At milestones | Slack |

> `R` Responsible · `A` Accountable · `C` Consulted · `I` Informed
> Exactly one Accountable. Named individuals only.

### Rules
- Exactly one A.
- Named individuals, not roles.
- Comms cadence + channel for every stakeholder.
- External parties clearly labeled.

---

*— PRD Template — Dash PRD skill (adapted from NatPRD, BSD-3-Clause) —*
