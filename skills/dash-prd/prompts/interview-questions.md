# Interview Questions by Section — Dash PRD

These are the questions Claude asks the user during Mode 1 (Generate).
Ask them conversationally — one at a time, not as a dump.
Validate each answer before moving to the next section.

---

## §0 — Intake (Run Before Everything Else)

This section runs BEFORE the section-by-section interview. Complete all §0 questions first.
Do not begin §1 until §0 is finished.
Use the answers to configure which optional sections to include and how to tailor later questions.

---

### §0.1 — Initiative Identity

1. What is the working name for this initiative? (This will be refined into a proper noun phrase in §1 — any name is fine for now.)
2. Give me one sentence: what is this initiative trying to do, and for whom?

---

### §0.2 — Product and Platform Context (Dash-specific)

3. **Tribe mana yang punya inisiatif ini?**
   (Express / Delivery / X-Dock / Scheduled-Instant / Canvasser-Rental / 4-Wheel / Outsourcing / Staging)
   - _Why this matters:_ Each Dash tribe has distinct ops model, mitra type, and SLA. Wrong tribe routing breaks downstream coordination.
   - RULE: If user is unsure, write `[TBD — confirm with tribe lead]`. Do NOT guess.

4. **Mana BU enum yang sesuai?**
   (`QUICK_COMMERCE` / `EXPRESS` / `X_DOCK` / `SCHEDULED_INSTANT` / `CANVASSER_RENTAL` / `4_WHEEL` / `OUTSOURCING` / `STAGING`)
   - This populates the `BU` frontmatter field in §2. Must match codebase enum exactly.

5. **Surface user mana yang terkena dampak?**
   (Halo-Dash backoffice / Portal-v2 client / Basecamp / Mitra mobile / React-Fleet ops)
   - _If multiple surfaces:_ "Apakah experience-nya sama di semua surface, atau ada perbedaan per surface? Note untuk §9."

6. **Apakah feature ini mitra-facing (langsung dipakai driver/courier)?** (Yes / No)
   - _If Yes:_ FLAG voice rule. All UI copy in §8 and §9 must use formal "Anda", tanpa slang ("kamu", "yaa", "lewatin", "bakal"). This is mandatory per Dash design system voice convention.
   - _If No (staff-facing):_ Casual tone acceptable but still professional.

7. What type of initiative is this?
   (new feature / redesign or UX improvement / internal tool / API or platform / ops automation / fleet management / other)
   - _Why this matters:_ Mitra-facing apps require UX-heavy requirement stories. Internal Halo-Dash tools need admin flows and permission levels. Fleet/ops APIs need NFRs up front.

8. Which platform(s) does this touch?
   (iOS / Android / Web / backend only / cross-platform / other)
   - _If cross-platform:_ "Are there platform-specific differences to capture, or is it the same experience everywhere?"

9. Who is the primary user?
   (mitra / outlet partner / Dash internal ops / Dash leadership / B2B client / developer / other)
   - _If "Dash internal ops":_ Flag this — admin flows, permission levels, and audit trails will be probed in §8.

---

### §0.3 — Domain and Compliance Context

10. What product domain or area does this sit in?
    (e.g., mitra onboarding, mitra suspension, dispatch, payments/payroll, KYC, fleet maintenance, EV charging, incidents, repossession, handover, vehicle ops, customer support)

11. Does this initiative touch any of the following? (confirm each)
    - Financial transactions / payment flows / payroll
    - Identity verification (eKYC, KYB, biometrics — KTP, SIM, KYC selfie, NIK)
    - Personal data or PII beyond basic profile (mitra NIK, alamat, kontak darurat, dependent info)
    - Indonesian regulatory requirements (OJK, UU PDP, BI, Kominfo)
    - International regulatory requirements (GDPR for cross-border data, etc.)
    - Credit, lending, BNPL, vehicle financing, insurance products
    - _If any are confirmed:_ §13 Risks & Mitigations is automatically included. The §11 compliance flag column is required.

---

### §0.3b — Regulation Identification (Mandatory When Compliance Signals Exist)

**Run this immediately after §0.3 if any compliance signal was confirmed. Do not skip or defer.**

Based on the domain, geography, and signals confirmed in §0.3, identify the specific applicable regulations and present them to the user for confirmation.

Use the following signal-to-regulation mapping as a starting point. For Dash (Indonesia-primary), Indonesian regulations come FIRST. Add others only if cross-border or applicable.

| Signal | Indonesian Regulations (default) | International (cross-border / B2B / future) |
|---|---|---|
| Financial transactions / payments / payroll | **BI-SNAP**, OJK POJK relevant; PCI-DSS if card | PSD2 (EU), MAS (SG), RBI (IN) |
| Identity verification / eKYC / KYB | **OJK POJK 12/2018** (eKYC), Kominfo Permen 20/2016 | FATF AML/CFT, MAS Notice 626 |
| Credit / lending / BNPL / vehicle finance | **OJK POJK 35/2018**, OJK POJK 10/2022 | CCPA |
| Insurance products (vehicle, mitra) | **OJK** insurance regulations | — |
| Personal data / PII beyond basic profile | **UU PDP** (Undang-Undang Pelindungan Data Pribadi 2022) | GDPR (EU/EEA), PDPA (SG/TH) |
| Biometric data (selfie, fingerprint) | **UU PDP** (data sensitif spesifik) | BIPA (Illinois), GDPR Art. 9 |
| Cross-border data transfer (e.g., cloud hosting outside ID) | **UU PDP** Bab V, Kominfo PSE | GDPR Chapter V, SCCs |
| Mitra worker classification / labor | UU Cipta Kerja, **OJK** if BNPL via mitra payroll | — |
| Children's data (rare for Dash, but check) | UU Perlindungan Anak, **UU PDP** | COPPA (US) |

Steps:
1. Based on confirmed signals, state: "Berdasarkan signal yang Anda confirm, regulasi yang kemungkinan apply untuk inisiatif ini: [list]. Apakah ini benar? Ada yang missing atau tidak apply?"
2. Wait for the user to confirm, correct, or add regulations.
3. Record the confirmed regulation list. This list is used in §3 (Regulatory Context), §5 (Scope), and §13 (Risks & Mitigations).
4. If the user is unsure: "Saya akan flag area ini sebagai `[TBD — legal/compliance team to confirm applicable regulations]` dan add sebagai open item di §12 FAQ."

RULE: If a compliance signal was confirmed in §0.3, this step is mandatory. It cannot be skipped even if the user is uncertain — at minimum, flag it as TBD with an owner.

---

### §0.4 — Team and Execution Context

12. How many teams are involved in delivering this?
    (just our tribe / 2 tribes / 3 or more tribes / cross-org with Eng/Ops/Legal)
    - _If 3+ teams:_ Auto-flag §16 Stakeholder Map.
    - _If 2+ teams:_ Auto-flag §14 Dependencies.

13. Is this initiative currently blocked by, or blocking, another tribe's work?
    - _If yes:_ Auto-flag §14 Dependencies.

14. Does this depend on any third-party APIs, vendors, or external services?
    (e.g., payment processor, eKYC provider, OEM API, charging network, map provider, telco, cloud vendor)
    - _If yes:_ Auto-flag §14 Dependencies.

15. Are there external parties involved who need to be informed or who have sign-off authority?
    (e.g., OJK, BI, Kominfo, OEM partner, fleet rental partner, outlet partner with contractual SLA)
    - _If yes:_ Auto-flag §16 Stakeholder Map.

16. Does this require executive or leadership sign-off before launch?
    (CEO Aditya Brahmana, COO, CFO, CTO, Tribe Lead)
    - _If yes:_ Auto-flag §16 Stakeholder Map.

---

### §0.5 — Launch and Rollout Context

17. How is this going live?
    (full release / feature flag / staged rollout by mitra cohort / staged by region or kota / A/B test / canary)
    - _If staged, phased, A/B, or canary:_ Auto-flag §15 Launch Plan.

18. Does this require any of the following before going live?
    - Marketing or comms coordination (mitra in-app message, outlet partner announcement, internal Slack/email)
    - Legal or compliance sign-off
    - Mitra support / ops enablement (training, runbook, basecamp briefing)
    - Partner or vendor notification (OEM, charging, payment)
    - _If any are confirmed:_ Auto-flag §15 Launch Plan.

---

### §0.6 — Discovery Maturity

19. Where is the discovery for this initiative right now?
    (just an idea / validated with mitra / data-backed from analytics / already designed in Figma / ready to build)
    - _If "just an idea":_ Warn: "Background and Hypothesis will need significant development — I'll probe deeper there. Expect to use [TBD] placeholders for evidence and metrics we don't have yet."
    - _If "already designed":_ "Do you have Figma links or existing documentation? Share them now and I'll attach them to §9 rather than marking [No design link]."

20. Are there any existing artifacts to pull from?
    (mitra research, ops post-mortem, dispatch dashboard, Jira epic, Figma file, previous PRD, Notion doc, Dash vault note)
    - _If yes:_ "Paste the key findings or link here. I'll use them as real evidence in §3 and §6 instead of placeholder content."
    - _If no:_ "Understood — we'll build from what you know. I'll flag anything that needs research as [TBD — needs data]."

---

### §0.7 — Optional Section Confirmation

After completing §0.3–§0.5, apply the trigger logic below and present a summary:

> "Berdasarkan jawaban Anda, ini yang akan saya include selain 12 core sections:
> - §13 Risks & Mitigations: [Yes — reason / No]
> - §14 Dependencies: [Yes — reason / No]
> - §15 Launch Plan: [Yes — reason / No]
> - §16 Stakeholder Map: [Yes — reason / No]
>
> Sudah benar? Anda bisa add/remove sebelum kita mulai."

Wait for confirmation. Do not proceed to §1 until the user confirms or adjusts the list.

---

### Optional Section Trigger Logic

| Signal from §0 | Triggered section |
|---|---|
| Domain: payments, payroll, eKYC, AML, lending, insurance, fleet finance | §13 Risks & Mitigations |
| PII, biometric, or financial data involved | §13 Risks & Mitigations |
| Regulatory requirement mentioned (OJK / UU PDP / BI / etc.) | §13 Risks & Mitigations |
| Any tribe blocked or blocking | §14 Dependencies |
| Third-party API, vendor, or external service dependency | §14 Dependencies |
| 2+ tribes involved | §14 Dependencies |
| Staged, phased, A/B, or canary rollout | §15 Launch Plan |
| Comms, legal, ops, or partner sign-off required before launch | §15 Launch Plan |
| 3+ tribes involved | §16 Stakeholder Map |
| Executive or leadership sign-off required | §16 Stakeholder Map |
| External regulators, OEM partners, or vendors with sign-off authority | §16 Stakeholder Map |

Any single signal is sufficient to trigger the section.

---

## §1 — Initiative Name

1. What is the name of this initiative? (max 8 words, noun phrase)
   - _Probe if too long:_ "Can we trim that to 8 words or fewer?"
   - _Probe if verb phrase:_ "Let's rephrase as a noun phrase — what's the thing being built, not the action?"
2. Does this name appear anywhere else — Jira, Notion, roadmap, vault? If yes, confirm it matches exactly.

---

## §2 — Document Status

1. What is the current status? (Draft / In Review / Approved / In Execution / Deprecated)
2. Who is the author? Who is the current owner?
3. Confirm Tribe, BU, User Surface, Mitra-facing — captured at §0.2. These are **mandatory** frontmatter fields.
4. Who needs to review this? Name at least one engineering lead and one business stakeholder (tribe lead or PM).
   - _If only team names given:_ "Bisa nama spesifik orangnya, bukan cuma tim?"
5. Who has authority to approve this PRD? Name the individual(s) — not a team.
   - _If only a team name is given:_ "Bisa nama spesifik orang yang punya sign-off authority?"
   - _If the PRD is still Draft:_ Leave as `[TBD — approver: ]` and flag as required before `Approved` status.

---

## §3 — Background

1. What problem are we solving? Who is affected (mitra, outlet, ops, leadership), and how often or severely?
   - _Probe if too solution-y:_ "Let's hold the solution for later — what's the pain the user or business is experiencing?"

2. What evidence do you have that this problem exists?
   - _Acceptable sources:_ quantitative data with a number (dispatch success rate, mitra Lvl distribution, completion time, churn rate), mitra research with a named finding, support ticket volume, NPS verbatim, incident data, A/B test result, competitive benchmark.
   - _For each piece of evidence provided:_ "Sumbernya apa — siapa yang measure, kapan, dan dimana documented?"
   - _If the user says "kita pikir" or "kita rasa" without data:_ "I'll capture that as an unvalidated team belief — written as `[Team belief — unvalidated: ___]`. Ada angka kasar atau supporting reference? Kalau tidak, saya flag `[TBD — needs data]`."
   - _If no evidence at all:_ "I'll mark this section as needing evidence. The Background section requires at least one cited source to pass validation."
   - RULE: Do not write any claim as established fact unless the user provided either a number or a named source.

3. Has this been attempted before? Apakah ada prior work atau history we should acknowledge?
   - _If prior attempt exists:_ "What happened last time, and what's different now?"

4. What happens if we do nothing? What is the cost of inaction — revenue, mitra churn, regulatory exposure, dispatch fail rate, competitive position?

5. _(Run only if compliance signals were confirmed in §0.3b)_ Based on the regulations identified — [list from §0.3b] — what specific requirements do they impose on this initiative? For example: data residency in Indonesia, consent flows for UU PDP, audit logging for OJK, mitra eKYC retention, reporting obligations to BI for payment flows.
   - _If the user doesn't know the specifics:_ "I'll write `[TBD — compliance review required: [regulation name]]` and flag it as an open item for legal/compliance to resolve before Approved status."
   - RULE: Do not invent regulatory requirements. If the user cannot describe them, write the TBD placeholder.

6. Is there prior art on this problem? Have other ride-hailing / delivery / fleet companies (Gojek, Grab, Maxim, Lalamove, foreign) solved it, or has Dash tried something similar before?

---

## §4 — Objective

1. What does success look like in one sentence? This should be an outcome, not a feature.
   - _Probe if it's a feature:_ "That's what we're building — but what business result does it produce? Naik dispatch success rate? Drop mitra churn? Cut payroll error?"
2. What are 2–3 measurable key results? For each one I need: the metric, the current baseline value, the target value, and the timeline.
   - _If no baseline:_ "Do you have a current number to start from? Even an estimate? If not, I'll write `[TBD — baseline needed]` and flag it as pre-approval required."
3. Which company-level OKR does this initiative support? (Dash quarterly OKR, tribe OKR)

---

## §5 — Scope & Boundaries

1. What is explicitly in scope for this initiative?
2. What is explicitly out of scope? (List items that someone might reasonably expect to be included but aren't)
   - _For each out-of-scope item:_ "What's the reason — deferred, owned by another tribe, future phase?"
3. Which platforms does this cover? (iOS / Android / Web / API / All)
4. Which user segments does this apply to? (mitra Lvl 1 / Lvl 2 / Lvl 3 / outlet / ops staff / specific city)
5. Which geographies or regions are included? (Jabodetabek / Bandung / Surabaya / nationwide / specific kota)
6. Is this phased? If so, what's in Phase 1 vs. later?

7. _(Run only if compliance signals were confirmed in §0.3b)_ Based on [identified regulations], are any capabilities explicitly excluded from scope due to regulatory constraints? Are any capabilities in scope specifically because a regulation requires them?
   - _Example prompts:_ "Apakah UU PDP requires consent management flow yang harus in-scope? Apakah BI-SNAP prevents storing payment data tertentu?"
   - Record regulatory-driven In and Out of Scope items separately so reviewers can trace them to the compliance requirement.

---

## §6 — Hypothesis

1. Let's build the hypothesis together. Complete this sentence:
   "We believe that [doing X] for [user/segment — e.g., mitra Lvl 1 di Jabodetabek] will result in [outcome Y], because [evidence/rationale Z]."
   - _Guide them through each component if they're stuck._
   - _If the user cannot fill [Z] with real evidence:_ "I'll write the rationale as `[TBD — needs evidential basis]`. The hypothesis must be grounded in something — we can revisit this once Background evidence is confirmed."
2. How confident are you in this hypothesis? (High / Medium / Low) — and why?
3. What would tell you the hypothesis is wrong? What result or signal would prove it doesn't hold?
4. Who will own the post-launch retrospective to revisit this hypothesis?

---

## §7 — Success Metrics

**Primary Metrics:**
1. What is the main metric this initiative is optimizing for?
   - _Common Dash metrics:_ dispatch success rate, mitra Lvl 1→2 progression rate, delivery completion time, mitra churn at 30/60/90d, payroll error rate, KYC pass rate, vehicle utilization %, charging session success, outlet onboarding TAT.
2. Is there a leading indicator — a metric that will move first and predict future success?
3. Is there a lagging indicator — a metric that confirms success after the fact?

4. For each metric, I need five things:
   a. **Baseline:** What is the current value today, before this initiative?
      - _If "I don't know":_ "I'll write `[TBD — baseline needed]` for now. This must be filled before the PRD can be approved. Who will get this number, and by when?"
      - RULE: Do NOT estimate. If the user did not provide a number, write `[TBD]`. No exceptions.
   b. **Target:** What is the goal value, and by what date?
      - _If directional like "naikin":_ "I need a specific number or percentage."
   c. **Measurement method:** How will this metric be measured? (specific tool, query, or dashboard name — not just "kita track")
   d. **Owner:** Who owns tracking and reporting? (individual name, not a team)
   e. **Type:** Is this a leading or lagging indicator?

**Guardrail Metrics:**
5. What metrics must not regress as a result of this initiative?
   - _Common Dash guardrails:_ mitra satisfaction (NPS), dispatch fail rate, payroll dispute count, incident rate, customer complaint rate.
6. For each guardrail: what's the baseline, and at what threshold should the team raise an alarm?

7. Sanity check before moving on:
   - Min one leading metric (moves within 2 weeks)?
   - Min one lagging metric (confirms outcome 30–90d)?
   - Min one guardrail metric?

---

## §8 — Requirements

For each user story, ask the following sequence. Repeat until the user signals no more stories.

1. Who is the user in this story? (specific role — e.g., "mitra Lvl 1 yang baru aktif", "dispatcher Halo-Dash", "ops kota Bandung" — not just "user")
2. What do they want to do?
3. Why — what benefit does it give them?
   - _Assemble:_ "As a [role], I want to [action], so that [benefit]."
4. What's the happy path — the standard successful scenario?
   - _Capture as Gherkin:_ Given / When / Then
5. What's an edge case or failure scenario — what happens when something goes wrong?
   - _Capture as Gherkin:_ Given / When / Then
6. What's the priority? (Must-have / Should-have / Could-have / Won't-have this phase)
7. Does this story depend on any other stories or external systems?
8. Any notes, constraints, or open questions specific to this story?

**Voice rule check (mandatory for mitra-facing stories):** If §0.2 confirmed mitra-facing, any UI copy embedded in Given/When/Then MUST use formal "Anda" — flag any "kamu", "yaa", "lewatin", "bakal", "udah", or other casual register.

After each story, before asking for more, explicitly surface these gap checks:
> "Before we move on — have we covered:
> 1. Error or failure states for this flow?
> 2. Admin or internal Halo-Dash staff versions of this flow?
> 3. Role-based or permission-level variations (driver vs. dispatcher vs. ops lead)?
> 4. Abandonment or partial completion scenarios?
> 5. Offline / low-connectivity scenarios (relevant for mitra mobile)?"

Then ask: "Any more stories? Before you say no — have we also covered any onboarding or first-run flows?"

Continue until the user explicitly says "no more stories" after the gap-check prompt.

**Non-Functional Requirements:**
9. Are there performance requirements? (e.g., dispatch latency, payroll job runtime)
10. Are there security or compliance requirements? (e.g., encryption, OJK, UU PDP audit log)
11. Are there accessibility requirements? (mitra app on low-end Android, varied literacy)
12. Are there availability or uptime requirements?
    - _For each:_ "How will this be verified or tested?"
13. Are there rate limits, API quotas, or concurrency constraints that could affect this feature? (dispatch QPS, payment gateway rate limits)
14. Are there data retention, deletion, or portability requirements?
    - _If the initiative handles PII (confirmed in §0.3):_ Ask this question unconditionally and mark the answer as compliance-required (UU PDP right-to-erasure).

---

## §9 — Solution

1. At a high level, how does the proposed solution work from the user's perspective?

2. Do you have design artifacts — Figma flows, wireframes, mockups, prototypes? Please share the links.
   - _If links are provided:_ Record them exactly as given. Do not paraphrase. Note the status (Draft / In Progress / Final).
   - _If no links yet:_ "I'll write `[No design link — status: Draft]` for now. This section requires a link to pass validation. When will designs be available, and who is the designer?"
   - RULE: Do not describe the design or UI in prose if no link exists. Use: `[Design pending — link to be added]`.

3. For each user story we captured, which part of the solution addresses it?

4. What alternatives were considered and why were they rejected?
   - _Probe if none:_ "There are always tradeoffs — what did you consider and decide against?"

5. Are there any technical constraints or architectural decisions that shaped this solution?
   - _If "I don't know":_ "Are there any known DB limitations, third-party API rate limits (OEM, payment, eKYC), mobile OS restrictions, or platform architecture decisions already established (Halo-Dash monolith, Mitra app stack, dispatch service)?"

6. Does this solution create any new backend services, data models, or API contracts that don't currently exist?
   - _If yes:_ "These are likely dependencies for other tribes. I'll flag them for §14 (Dependencies)."

---

## §10 — Metric Monitoring

1. Where will the metrics be monitored post-launch? (dashboard name, tool, link — be specific. Common Dash: Metabase, Mixpanel, Grafana, internal BI)
   - RULE: Do not invent a dashboard name. If unspecified, write `[TBD — monitoring tool not confirmed]`.
2. Who is the DRI for monitoring? (name a person, not a team)
3. What's the monitoring cadence? (daily launch week, weekly after, etc.)
4. At what threshold for each primary metric should the team escalate?
5. At what threshold for each guardrail metric should the team escalate?
6. What specific condition would trigger a rollback? Who decides, and how fast can it be executed?
7. Who gets notified first if something goes wrong, and through what channel? (Slack channel, PagerDuty, Telegram, WA)
8. Set post-launch review dates now — 2-week check-in, 30-day review, quarterly retrospective.
   - RULE: Do not invent dates. If the user cannot provide them, write `[TBD — dates to be confirmed]`.

---

## §11 — Event & Data Tracking

Before listing events, run this cross-check against §7:

> "Let's start by mapping from metrics to events. For each metric in §7, which user action or system action produces the data to measure it? If a metric has no corresponding event, we have a gap."

Go through each §7 metric and confirm its event(s) before writing any tracking rows.
- RULE: Do not generate event names that the user has not confirmed. If unconfirmed, write `[TBD — event name to be confirmed by data team]`.

For each confirmed event, ask:

1. What is the event name? (follow noun_verb format — e.g., `mitra_suspended`, `delivery_completed`, `kyc_submitted`)
2. When exactly does this event fire? (be specific — which user action, which screen, which API call)
3. What properties or data should be attached? (e.g., `mitra_id`, `tribe`, `bu`, `dispatch_id`, `level`, `kota`)
4. Is this a client-side or server-side event?
5. Where does this event get sent? (Mixpanel, Segment, internal BI, Metabase — confirm with user, do not assume)
6. Which metric from §7 does this event support?
   - _If the user cannot name a metric:_ "Every event must map to a metric. Either remove this event or add a metric to §7."
   - RULE: An event with no §7 metric mapping must be marked `[UNLINKED — not valid for tracking plan]`.
7. Does this event involve PII (NIK, KTP, alamat), financial data, or biometric data? (compliance flag — for UU PDP audit)

After all events, run this closing cross-check:
> "Does every metric in §7 have at least one event feeding it?"

Then ask: "Has the data or analytics team reviewed this tracking plan?"
- _If no:_ Mark `[ ] Data team sign-off — PENDING`.
- RULE: Never pre-populate the sign-off checkbox as complete.

---

## §12 — FAQ

Before asking open-endedly, raise contextually relevant probes based on §0 intake:

- _If domain is payments/payroll:_ "Has anyone asked what happens if payroll fails mid-flow, or if a retry causes a duplicate transfer to mitra rekening?"
- _If mitra-facing mobile:_ "Has anyone asked how this experience looks on Android 8 / low-end devices / limited data plans?"
- _If internal Halo-Dash tool:_ "Has anyone asked how the transition period works while both old and new flows exist in parallel?"
- _If staged rollout (§15 triggered):_ "Has anyone asked what the criteria are for expanding from Phase 1 (e.g., Jakarta only) to Phase 2 (e.g., Jabodetabek-wide)?"
- _If compliance or regulatory (OJK / UU PDP):_ "Has there been a legal review? Should that be an open item with a named compliance owner?"
- _If 3+ tribes involved:_ "Has anyone asked who has final decision-making authority when tribes disagree?"
- _If touches mitra suspension/repossession:_ "Has anyone asked about appeal / re-activation flow for mitra who dispute the action?"

For each probe the user confirms as a real question:
- What was the question?
- What was the answer?
- Who answered it, and when?
- Is this Resolved or Open?

Then ask: "Are there any other questions from stakeholders or engineering?"

For any open (unresolved) items:
- "Who specifically owns resolving this? I need a person, not a team."
- "What is the deadline for resolution?"
- RULE: An open item with no individual owner is a warning. Push for a name before accepting the entry.

---

## §13 — Risks & Mitigations

_(Run only when §13 was triggered at intake. Use the regulation list from §0.3b to seed regulatory risk rows.)_

**Start with regulatory risks — mandatory when compliance signals exist:**

For each confirmed regulation from §0.3b, ask:

1. What is the specific risk this regulation creates for this initiative?
   - _If unsure:_ "I'll write the risk as `[TBD — [regulation name] risk to be assessed by legal/compliance]` with the compliance team as pending owner."
2. What is the likelihood this risk materializes? (High / Medium / Low)
3. What is the business impact? (High / Medium / Low) — think OJK fines, license suspension, mitra data breach (UU PDP), reputational damage.
4. What is the mitigation plan — what are we doing before launch to prevent this risk?
   - _Probe if vague:_ "Is there a compliance review scheduled? A legal sign-off checkpoint? An audit log? A specific technical control?"
5. What is the contingency plan — what do we do if the risk materializes despite mitigations?
6. Who owns this risk? (Named individual)
7. Is this a pre-launch risk (must be resolved before go-live) or post-launch risk (ongoing monitoring)?

**Then cover operational and technical risks. Dash-relevant categories to probe:**

8. What are the top 3 operational risks for this initiative that aren't regulatory? Probe these Dash-common categories:
   - **Mitra suspension / repossession risk** — wrongful suspension, dispute backlog, mitra trust erosion
   - **Payment reversal risk** — failed disbursement, duplicate, bank gateway failure
   - **Geofence accuracy risk** — wrong polygon, GPS drift, false dispatch fail
   - **Vehicle / fleet ops risk** — handover dispute, maintenance backlog, OEM API outage
   - **Charging infrastructure risk** — station downtime, provider integration failure
   - **Capacity risk** — 10x volume spike (e.g., promo, viral period), dispatch throughput
   - **Mitra behavior risk** — gaming the system, fake KYC, NIK reuse
9. For each: likelihood, impact, mitigation, contingency, owner, phase.

**Closing check:**
> "We've covered: [list of regulations identified]. Does legal or compliance need to formally review this section before the PRD moves to In Review? If so, I'll add that as an open item in §12."
