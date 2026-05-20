# Mitra Onboarding Revamp v2

> **Streamline mitra onboarding from 5 days to 24 hours by integrating eKYC, vehicle handover, and first-dispatch readiness into a single guided flow.**

---

# CORE SECTIONS

---

## 1. Initiative Name

`Mitra Onboarding Revamp v2`

---

## 2. Document Status

| Field | Detail |
|---|---|
| **Status** | `Draft` |
| **Version** | v0.1 |
| **Last Updated** | 2026-05-20 |
| **Author** | [TBD — owner: ] |
| **Owner** | [TBD — owner: ] |
| **Tribe** | Express |
| **BU** | EXPRESS |
| **User Surface** | Mitra mobile + Basecamp |
| **Mitra-facing?** | Yes |
| **Reviewers** | [TBD — Eng Lead], [TBD — Tribe Lead] |
| **Approvers** | [TBD — approver: COO] |
| **Approval Date** | — |

---

## 3. Background

### Problem Statement
Current mitra onboarding takes a median of 5 days from registration to first dispatch. Drop-off di setiap step tinggi: 32% drop di KYC, 18% drop di vehicle handover scheduling, 12% drop di first-dispatch readiness check. New mitra losing momentum, leaving for competitors (Gojek, Maxim) yang onboard dalam <48 jam.

### Evidence & Data
- Median onboarding TAT 5.2 days, p90 = 11 days [source: Mixpanel cohort `mitra_onboarding_funnel_2026_q1`, retrieved: 2026-05-20]
- Step drop-off rates: KYC 32%, vehicle handover 18%, first-dispatch readiness 12% [source: same Mixpanel funnel]
- 23% of churned mitra Lvl 0 cite "terlalu lama, ribet" in exit survey [source: docs/mitra-exit-survey-2026-q1.md §3.1, retrieved: 2026-05-20]

### Context & History
Onboarding v1 launched Q2 2024. Two minor patches sejak itu (NIK validation, photo retry). No major redesign. Prior eKYC vendor (Privy) replaced dengan Verihubs di Q4 2025 — current flow masih disesuaikan.

### Cost of Inaction
- Continued mitra acquisition cost waste (CAC ~Rp 450k per acquired mitra; ~30% never reach first dispatch)
- Competitive disadvantage vs. Gojek (<48h) and Maxim (<24h)
- Mitra base growth slowdown affects dispatch capacity headroom

### Regulatory Context

| Regulation | Jurisdiction | Key Requirements for This Initiative | Status |
|---|---|---|---|
| OJK POJK 12/2018 | Indonesia | eKYC standards — NIK verification against Dukcapil; selfie liveness check | `Confirmed` |
| UU PDP 2022 | Indonesia | Lawful basis for PII collection (NIK, KTP photo, SIM, alamat); consent flow; 5y retention | `Confirmed` |
| Kominfo Permen 20/2016 | Indonesia | Personal data system registration | `[TBD — compliance review required]` |

**Compliance Review Owner:** [TBD — Legal Counsel name]
**Review Deadline:** [TBD — before In Review]

---

## 4. Objective

### Primary Objective
> Reduce median mitra onboarding TAT from 5 days to under 24 hours by consolidating eKYC, vehicle handover, and first-dispatch readiness into a single guided flow, without increasing fraud rate.

### Key Results

| # | Key Result | Baseline | Target | Timeline |
|---|---|---|---|---|
| KR1 | Median onboarding TAT | 5.2 days | <24h | 2026-Q4 |
| KR2 | Onboarding funnel completion rate (registration → first dispatch) | [TBD — baseline needed; estimate ~40%] | 65% | 2026-Q4 |
| KR3 | KYC fraud rate (false approvals) | [TBD — baseline needed] | No regression (≤current) | 2026-Q4 |

### Company OKR Alignment
Dash 2026 OKR Q4: "Grow active mitra base by 40% with stable unit economics."

---

## 5. Scope & Boundaries

### In Scope
- Mitra mobile app onboarding flow redesign (registration → first dispatch ready)
- Integration with Verihubs eKYC v2 API
- Vehicle handover scheduling integrated into app (currently external WA/email)
- First-dispatch readiness checklist gating active status
- Basecamp ops view to monitor onboarding pipeline

### Out of Scope

| Item | Reason | Future Plan |
|---|---|---|
| Outlet partner onboarding | Different domain, separate PRD | Q1 2027 |
| Mitra Lvl 2/3 progression | Different lifecycle stage | Tracked separately |
| Background check / police clearance | Currently manual, owned by HR | Phase 2 |

### Platform & Segment Coverage

| Dimension | Coverage |
|---|---|
| **Platform** | Mitra mobile (Android primary, iOS secondary) + Basecamp web |
| **User Segment** | New mitra registrations (Lvl 0 → Lvl 1) |
| **Geography** | Jabodetabek, Bandung, Surabaya (Phase 1) |
| **Phase** | Phase 1 |

---

## 6. Hypothesis

> *"We believe that **consolidating eKYC, vehicle handover, and first-dispatch readiness into a single guided in-app flow** for **new mitra registrations (Lvl 0 → Lvl 1) in Jabodetabek, Bandung, and Surabaya** will result in **median onboarding TAT under 24h and funnel completion above 65%**, because **exit survey data shows 23% of churned mitra cite onboarding friction, and competitor benchmarks (Gojek <48h, Maxim <24h) demonstrate the consolidated flow pattern works**."*

### Confidence Level
`Medium`

**Reasoning:** Strong evidence for friction problem, but consolidating multi-vendor flows is operationally complex. Risk of Verihubs API SLA or vehicle handover ops capacity becoming bottleneck.

### Falsification Condition
If TAT does not drop below 3 days within 60 days, or fraud rate increases by >0.5pp, the hypothesis is wrong.

### Post-Launch Learning Plan
60-day retrospective owned by Express tribe PM. Re-evaluate with cohort data and decide Phase 2 (other regions, outlet onboarding) scope.

---

## 7. Success Metrics

### Primary Metrics

| Metric | Type | Baseline | Target | Measurement Method | Timeline | Owner |
|---|---|---|---|---|---|---|
| Median onboarding TAT (registration → first dispatch) | Leading | 5.2 days | <24h | Mixpanel funnel `mitra_onboarding_v2` | 2026-Q4 | [TBD] |
| Funnel completion rate | Lagging | [TBD] | 65% | Mixpanel cohort | 2026-Q4 | [TBD] |

### Guardrail Metrics

| Metric | Baseline | Alert Threshold | Measurement Method | Owner |
|---|---|---|---|---|
| KYC fraud rate (post-launch detected false approvals) | [TBD] | >current +0.5pp | Weekly fraud team audit | [TBD] |
| Verihubs eKYC API success rate | [TBD] | <95% | Grafana SLA dashboard | [TBD] |
| Vehicle handover scheduling SLA | [TBD] | >3 day median wait | Basecamp ops dashboard | [TBD] |

---

## 8. Requirements

### Functional Requirements

#### US-001 — Mitra completes eKYC in-app

**Priority:** `Must-have`

**User Story:**
> As a **calon mitra baru di Jabodetabek**, I want to **menyelesaikan verifikasi identitas (KTP + selfie liveness) langsung di aplikasi mitra**, so that **saya tidak perlu menunggu proses manual dan bisa lanjut ke step berikutnya dalam hitungan menit**.

**Acceptance Criteria:**
```gherkin
Scenario: KYC submitted with valid NIK and clear selfie
  Given calon mitra has registered with email/phone
  When mitra uploads KTP photo and completes selfie liveness check
  Then Verihubs API validates NIK against Dukcapil within 60 seconds
    And if valid, mitra moves to next step "Vehicle Handover Scheduling"
    And the event `kyc_submitted` fires with mitra_id and pass/fail flag

Scenario: KYC fails — NIK not found or photo unclear
  Given calon mitra submits KYC
  When Verihubs returns "FAIL" within 60 seconds
  Then mitra sees screen: "Verifikasi gagal. Silakan coba lagi atau hubungi Customer Care."
    And mitra can retry up to 3 times in 24h
    And the failure is logged
```

**Dependencies:** Verihubs API integration
**Notes:** Voice rule applied — formal "Anda" / "calon mitra".

---

#### US-002 — Mitra schedules vehicle handover

**Priority:** `Must-have`

**User Story:**
> As a **mitra yang sudah lulus KYC**, I want to **memilih slot waktu pickup kendaraan di basecamp terdekat melalui aplikasi**, so that **saya tahu kapan dan dimana harus datang tanpa perlu WhatsApp ke admin**.

**Acceptance Criteria:**
```gherkin
Scenario: Mitra selects available slot at nearest basecamp
  Given mitra has passed KYC
  When mitra opens "Vehicle Handover" screen and selects basecamp + time slot
  Then the slot is reserved and locked for 30 minutes pending confirmation
    And mitra receives confirmation push with basecamp address and Google Maps link
    And the event `handover_scheduled` fires

Scenario: All slots full at preferred basecamp
  Given mitra opens scheduling screen
  When all slots at nearest basecamp are taken for next 3 days
  Then mitra sees alternative basecamp suggestions sorted by distance
    And mitra can wait for new slots (notified push when available)
```

**Dependencies:** Basecamp slot inventory service
**Notes:** Ops capacity planning required for slot supply.

---

#### US-003 — Mitra completes first-dispatch readiness check

**Priority:** `Must-have`

**User Story:**
> As a **mitra yang sudah menerima kendaraan**, I want to **menyelesaikan readiness check (vehicle inspection, app tutorial, first test dispatch) sebelum akun saya aktif**, so that **saya siap untuk dispatch real tanpa risiko gagal di trip pertama**.

**Acceptance Criteria:**
```gherkin
Scenario: Mitra completes all readiness items
  Given mitra has completed vehicle handover
  When mitra completes vehicle inspection checklist + watches app tutorial + completes test dispatch
  Then mitra status changes from "Lvl 0" to "Lvl 1 — Active"
    And mitra is eligible to receive real dispatch
    And the event `mitra_activated` fires

Scenario: Mitra skips test dispatch
  Given mitra has completed vehicle inspection and tutorial but not test dispatch
  When mitra tries to mark onboarding complete
  Then mitra sees: "Anda perlu menyelesaikan test dispatch terlebih dahulu untuk mengaktifkan akun."
    And status remains "Lvl 0"
```

**Dependencies:** Test dispatch simulator service
**Notes:** Test dispatch is a sandboxed dispatch event, no real customer.

---

### Non-Functional Requirements

| ID | Category | Requirement | Priority | Verification Method |
|---|---|---|---|---|
| NFR-001 | Performance | KYC verification round-trip ≤60s p95 | `Must-have` | Load test + Grafana |
| NFR-002 | Security | KTP photo encrypted at rest; access logged | `Must-have` | Security review |
| NFR-003 | Compliance | UU PDP — consent screen + lawful basis + 5y retention | `Must-have` | Legal review |
| NFR-004 | Compliance | OJK POJK 12/2018 — eKYC liveness + Dukcapil match | `Must-have` | Compliance audit |
| NFR-005 | Availability | Onboarding flow uptime ≥99% (excluding scheduled maint) | `Must-have` | Grafana SLA |
| NFR-006 | Accessibility | Works on Android 8+; flow tested with limited data plan | `Should-have` | Manual device testing |

---

## 9. Solution

### Proposed Approach
Single-flow onboarding wizard in mitra app: registration → KYC (Verihubs) → vehicle handover scheduling → handover confirmation → readiness check (inspection + tutorial + test dispatch) → activation. Each step persists state so mitra can resume. Basecamp ops view in Basecamp web shows pipeline per basecamp.

### Design Artifacts

| Artifact | Link | Status |
|---|---|---|
| Onboarding flow Figma | [Design pending — link to be added] | Draft |
| Basecamp ops view | [Design pending — link to be added] | Draft |
| Notification copy doc | [Design pending — link to be added] | Draft |

### User Story Coverage Map

| User Story | Solution Component | Design Reference |
|---|---|---|
| US-001 | In-app KYC screen + Verihubs API integration | [Design pending] |
| US-002 | Scheduling screen + Basecamp slot service | [Design pending] |
| US-003 | Readiness checklist + test dispatch simulator | [Design pending] |

### Considered Alternatives

| Option | Description | Why Rejected |
|---|---|---|
| Keep v1 flow + parallelize manually | Status quo with ops sprint | Doesn't fix in-app friction; ops cost still high |
| Switch eKYC vendor again | Privy / Tilaka instead of Verihubs | Vendor switch cost > flow redesign benefit |
| Offline-first onboarding kiosk at basecamp | Physical kiosk at handover | High capex; doesn't help pre-handover steps |

### Technical Constraints & Decisions
Verihubs API rate limit: 100 RPS — sufficient. Basecamp slot service to be built (new). Test dispatch simulator reuses existing dispatch infra in sandbox mode.

---

## 10. Metric Monitoring

| Field | Detail |
|---|---|
| **Dashboard / Tool** | Metabase `mitra-onboarding-v2` + Mixpanel funnel |
| **DRI** | [TBD — owner: ] |
| **Monitoring Cadence** | Daily launch month → Weekly month 2-3 → Bi-weekly after |
| **Primary Metric Alert Threshold** | TAT median >36h |
| **Guardrail Metric Alert Threshold** | KYC fraud rate increase >0.3pp |
| **Rollback Trigger** | KYC fraud +0.5pp OR Verihubs API down >2h OR funnel completion drop >10pp from v1 baseline |
| **Escalation Path** | Slack `#tribe-express-alerts` → DRI → Tribe Lead → COO |

### Post-Launch Review Schedule

| Review | Date | Participants | Owner |
|---|---|---|---|
| 2-Week Check-in | [TBD] | PM, Eng, Ops, Fraud | [TBD] |
| 30-Day Review | [TBD] | PM, Eng Lead, Tribe Lead | [TBD] |
| 60-Day Hypothesis Review | [TBD] | All stakeholders | [TBD] |

---

## 11. Event & Data Tracking

| Event Name | Trigger Condition | Properties | Side | Destination | Maps to Metric | Compliance Flag |
|---|---|---|---|---|---|---|
| `kyc_submitted` | Mitra submits KYC, Verihubs returns result | `{ mitra_id, result: pass/fail, fail_reason, ts }` | Server | Mixpanel + BI | TAT, fraud rate | Yes (PII) |
| `handover_scheduled` | Mitra books vehicle handover slot | `{ mitra_id, basecamp_id, slot_ts, ts }` | Client | Mixpanel | TAT | No |
| `handover_completed` | Ops marks vehicle handed over in Basecamp | `{ mitra_id, basecamp_id, ops_user_id, vehicle_id, ts }` | Server | Mixpanel + BI | TAT | No |
| `mitra_activated` | Readiness check complete; status → Lvl 1 | `{ mitra_id, tribe, bu, kota, ts }` | Server | Mixpanel + BI | Funnel completion | No |

**Data Team Sign-off:**
- [x] Pending
- [ ] Approved

---

## 12. FAQ

| # | Question | Answer | Date | Answered By | Status |
|---|---|---|---|---|---|
| 1 | Apakah mitra yang sudah pakai v1 perlu re-onboard? | Tidak — v2 only untuk new registrations | 2026-05-15 | Tribe Lead | `Resolved` |
| 2 | Bagaimana fallback kalau Verihubs API down? | [Open] — perlu eng decision | — | [TBD — owner: Eng Lead] | `Open` |
| 3 | Apakah test dispatch dihitung sebagai delivery dalam ops metrics? | [Open] | — | [TBD — owner: Data Lead] | `Open` |

---

# OPTIONAL SECTIONS

---

## 13. Risks & Mitigations

### Regulatory Risks

| ID | Regulation | Risk Description | Likelihood | Impact | Mitigation | Contingency | Owner | Phase |
|---|---|---|---|---|---|---|---|---|
| RR-001 | OJK POJK 12/2018 | eKYC bypass — false positive Dukcapil match | `L` | `H` | Verihubs liveness + match score threshold ≥0.85; manual review for borderline | Suspend onboarding; manual KYC fallback | [TBD — Legal] | Pre-launch |
| RR-002 | UU PDP 2022 | KTP photo storage without explicit consent or excessive retention | `M` | `H` | Consent screen with explicit toggle; 5y retention auto-purge job; access audit log | Stop new collection; legal review | [TBD — Legal] | Pre-launch |

**Legal/Compliance Sign-off:**
- [ ] Pending — [TBD — Legal Counsel]
- [ ] Approved

### Operational & Technical Risks

| ID | Risk | Likelihood | Impact | Mitigation | Contingency | Owner | Phase |
|---|---|---|---|---|---|---|---|
| R-001 | Verihubs API outage during peak onboarding hours | `M` | `H` | SLA contract with Verihubs; cached recent results for retry | Manual KYC via Basecamp; communicate delay to mitra | [TBD] | Post-launch |
| R-002 | Basecamp slot capacity insufficient for new mitra volume | `H` | `M` | Capacity plan with ops; dynamic slot opening | Pause new registrations; comms to applicants | [TBD] | Pre-launch |
| R-003 | Fraud rate increase from automated flow (less manual review) | `M` | `H` | Fraud detection ML on KYC + behavioral signals; weekly audit | Manual review gate re-enabled; investigate cohort | [TBD] | Post-launch |
| R-004 | Mitra confusion at test dispatch (looks like real trip) | `M` | `M` | Clear "TEST DISPATCH" UI labeling; tutorial primer | In-app FAQ + ops support | [TBD] | Pre-launch |

---

## 14. Dependencies

### Upstream

| ID | Dependency | Team / Vendor | What Is Needed | Expected Date | Confirmed | Risk if Delayed | Escalation |
|---|---|---|---|---|---|---|---|
| DEP-001 | Verihubs eKYC v2 API | Verihubs (vendor) | Production API access + SLA | [TBD] | No | Blocks launch | Procurement → CTO |
| DEP-002 | Basecamp slot service | Platform tribe | New service + Basecamp web UI | [TBD] | No | Blocks launch | Platform Lead → CTO |
| DEP-003 | Test dispatch simulator | Dispatch tribe | Sandbox dispatch endpoint | [TBD] | No | Blocks launch | Tribe Lead → CTO |

### Downstream

| ID | Dependent Initiative | Team | What They Need | Expected Date |
|---|---|---|---|---|
| DEP-D01 | Mitra Lvl 1→2 progression | Mitra-services | Updated activation event schema | [TBD] |

---

## 15. Launch Plan

### Rollout Strategy
City-staged: Jabodetabek Phase 1a (4 weeks), then Bandung + Surabaya Phase 1b (4 weeks). Feature flag gated. Old v1 flow remains as fallback during Phase 1a.

### Go / No-Go Criteria

| Stage | Go Condition | No-Go Condition | Decision Maker |
|---|---|---|---|
| Internal QA | All flows pass end-to-end on staging | Critical bug | Eng Lead |
| Jabodetabek 10% rollout | KYC API success >97% in shadow; legal sign-off | Verihubs SLA miss | Tribe Lead |
| Jabodetabek 100% | TAT <36h in 10% cohort | TAT regression vs. v1 | COO |
| Bandung + Surabaya | Jabodetabek 100% stable for 2 weeks | Any Jabodetabek rollback | COO |

### Communications Plan

| Audience | Channel | Message Summary | Timing | Owner |
|---|---|---|---|---|
| New mitra (in-app) | In-app welcome modal | Step-by-step guide screen 1 | At registration | [TBD] |
| Existing mitra (no impact) | None — internal only | — | — | — |
| Basecamp ops team | Slack + training session | New ops dashboard, slot management | 7 days before launch | [TBD] |
| Customer support | Runbook | Handling KYC fail / scheduling issues | 5 days before | [TBD] |
| Verihubs (vendor) | Email + onboarding call | Go-live date, expected volume | 14 days before | [TBD] |

### Rollback Plan

| Field | Detail |
|---|---|
| **Rollback Trigger** | KYC fraud +0.5pp OR Verihubs down >2h OR funnel drop >10pp |
| **Decision Maker** | Tribe Lead (Phase 1a) / COO (Phase 1b+) |
| **Execution Time** | <30min (feature flag toggle back to v1) |
| **Rollback Steps** | Toggle `onboarding_v2_enabled = false`; v1 flow resumes; in-progress mitra continue on v2 to avoid data loss |

**Launch DRI:** [TBD — not the PM]

**Compliance Sign-off:**
- [ ] Pending
- [ ] Approved

---

## 16. Stakeholder Map

| Name | Role / Title | Team / Org | RACI | Comms Cadence | Preferred Channel |
|---|---|---|---|---|---|
| [TBD — Tribe Lead Express] | Tribe Lead | Dash Express | `A` | Weekly | Slack DM |
| [TBD — PM] | PM Onboarding | Dash Express | `R` | Daily | Slack |
| [TBD — Eng Lead] | Eng Lead | Dash Platform | `R` | Daily | Slack |
| [TBD — Ops Lead] | Basecamp Ops Lead | Dash Ops | `R` | Daily | Slack |
| [TBD — Legal Counsel] | Legal Counsel | Dash Legal | `C` | At milestones | Email |
| [TBD — Fraud Lead] | Fraud Detection Lead | Dash Risk | `C` | At milestones | Slack |
| Verihubs Account Manager | Vendor PM | Verihubs (external) | `C` | At milestones | Email |
| Aditya Brahmana | CEO | Dash | `I` | At milestones | Slack |

---

*— Example Dash PRD — generated by dash-prd skill —*
