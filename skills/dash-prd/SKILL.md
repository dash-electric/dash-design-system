---
name: dash-prd
description: Activate this skill when the user wants to create, update, validate, or review a Product Requirement Document for a Dash initiative. Triggers on mentions of PRD, product requirements, user stories, acceptance criteria, mitra-facing features, Express / Delivery / X-Dock / Scheduled-Instant / Canvasser-Rental / 4-Wheel / Outsourcing / Staging tribe work, fleet ops, EV charging, payments, or when the user describes a Dash feature and asks for structured documentation.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch
---

# Dash PRD Maker

An interactive, guided PRD generation skill for writing production-grade PRDs for **PT Dash Elektrik Indonesia** (Dash) initiatives — Express, Delivery, X-Dock, Scheduled/Instant, Canvasser/Rental, 4-Wheel, Outsourcing, Staging, mitra ops, fleet, EV charging, payments.

Produces fully structured PRDs with user stories, Gherkin acceptance criteria, section-level rules, and optional sections — all in markdown format.

> **Attribution:** This skill is adapted from [NatPRD](https://github.com/anatasof/NatPRD) by Anatasof Wirapraja (BSD-3-Clause). See `NOTICE.md` for details.

---

## Dash Domain Context

Before running this skill, anchor on these Dash-specific concepts:

- **Tribes:** Express, Delivery, X-Dock, Scheduled/Instant, Canvasser/Rental, 4-Wheel, Outsourcing, Staging
- **Business Units (BU enum):** `QUICK_COMMERCE | EXPRESS | X_DOCK | SCHEDULED_INSTANT | CANVASSER_RENTAL | 4_WHEEL | OUTSOURCING | STAGING`
- **User surfaces:** Halo-Dash (backoffice), Portal-v2 (client), Basecamp (ops), Mitra mobile app, React-Fleet (ops console)
- **Core entities:** mitra (driver/courier), outlet, delivery, maintenance, repossession, incident, vehicle, handover, OEM, model, station, provider
- **Voice rule (mandatory):** Mitra-facing UI uses formal "Anda" — never casual "kamu" or slang (per Dash design system convention)
- **Indonesian regulations to consider:** OJK POJK 12/2018 (eKYC), UU PDP (PII), BI-SNAP (payments), OJK POJK 35/2018 (BNPL/credit)

These anchor every interview question. The `Tribe` and `BU` fields in §2 are **mandatory** — do not skip.

---

## What This Skill Does

When activated, this skill:

1. **Interviews** the user section by section using focused, Dash-aware questions
2. **Validates** each answer against the section rules before moving on
3. **Writes** the PRD incrementally, showing each section as it's completed
4. **Enforces** the PRD standard — no placeholders, no rule violations allowed
5. **Outputs** a complete `prd.md` file (default location: `docs/prd.md`)

The 12 core sections, 4 optional sections, scoring rubric, and per-section rules
live in the supporting files referenced at the bottom of this document. Load them
on demand when you need the full text — do not duplicate them here.

---

## How to Activate

In Claude Code, simply say:
- `"I want a PRD for [feature/initiative name]"`
- `"Help me write a PRD"`
- `"Create a PRD for [description]"`
- `"Review my PRD"` — to validate an existing PRD file

Claude will detect the intent and load this skill automatically.

---

## User-Choice Presentation

Whenever an interview question offers a choice between **2–4 discrete, mutually-exclusive options**, present it using the `AskUserQuestion` tool so the user can click rather than type. This applies across all three modes.

The tool caps at 4 listed options and automatically adds an "Other" escape, so you can cover up to 5 outcomes (4 explicit + Other) without listing them all.

Examples that MUST use buttons:
- §0.2 Tribe (Express / Delivery / X-Dock / Scheduled-Instant — "Other" covers Canvasser-Rental, 4-Wheel, Outsourcing, Staging)
- §0.2 BU enum (group into ≤4 button categories; rely on "Other" for the long tail)
- §0.2 User surface (Halo-Dash / Portal-v2 / Basecamp / Mitra mobile — "Other" covers React-Fleet)
- §0.2 Mitra-facing? (Yes / No)
- §2 Document Status (Draft / In Review / Approved / In Execution); "Other" covers Deprecated
- §6 Hypothesis confidence (High / Medium / Low)
- §8 MoSCoW priority (Must-have / Should-have / Could-have / Won't-have)
- §7 Metric type (Leading / Lagging / Guardrail)
- Any yes/no compliance flag in §0.3
- "Any more user stories?" (Yes — add another / No — move on)

Exceptions — keep as plain text:
- **Open-ended questions** (the working name in §0.1, evidence narrative in §3, hypothesis prose in §6, baseline/target values in §7): no discrete option set.
- **Questions with >5 effective options** (e.g., §0.2 initiative type with 8 options): keep as text, or split into two sequential button questions.
- **Multi-select** (e.g., §0.3 compliance signals — multiple may apply): use `AskUserQuestion` with `multiSelect: true`, up to 4 grouped categories.

If a question doesn't naturally fit any of these patterns, default to text — never invent options to force a button UI.

---

## Anti-Hallucination Rules

These rules apply at ALL times during Mode 1, Mode 2, and Mode 3. They are not optional.

### When the user does not have information

If the user says they don't know a detail — or if no answer is provided — use the most specific `[TBD]` variant defined in the rules below. If no specific variant applies, write `[TBD]`. Do NOT invent a plausible-sounding value.

This applies without exception to:
- Baselines and targets in §4 (Objectives / KRs) and §7 (Metrics)
- Event names and metric mappings in §11 (Tracking)
- Design artifact links in §9 (Solution)
- Stakeholder names in §2, §10, §16
- Evidence, sources, and citations in §3 (Background)
- Dates, deadlines, and review schedules in §10 and §15
- Risk owners, dependency confirmations, and compliance references
- Dashboard or monitoring tool names and links in §10
- **Dash-specific:** Tribe / BU / User surface in §2 frontmatter — write `[TBD — confirm with tribe lead]` if unknown, never guess

### Specific prohibitions

- NEVER write a metric baseline or target that the user did not provide. Write `[TBD]` instead.
- NEVER fabricate a design link, Figma URL, Confluence link, or Jira ticket. Write `[No design link — status: Draft]` instead.
- NEVER invent a person's name as a reviewer, approver, DRI, or owner. Write `[TBD — owner: ]` or `[TBD — approver: ]` instead.
- NEVER write "approximately", "roughly", or "around X%" to soften an invented number. If the user didn't give the number, write `[TBD]`.
- NEVER generate evidence, research citations, or data to support the background if the user has not provided it. Write unvalidated assertions as: `[Team belief — unvalidated: ___]`.
- NEVER fabricate an event name, tracking property, or data destination. If the user has not confirmed a tracking plan, mark every event row: `[TBD — event name to be confirmed by data team]`.
- NEVER pre-populate the data team sign-off checkbox as complete unless the user explicitly confirms it.
- NEVER describe a UI or design in prose if no design link exists. Use: `[Design pending — link to be added]`.
- **Dash-specific:** NEVER assume a tribe owns an initiative without explicit user confirmation. Tribes have distinct ops models — wrong tribe routing breaks the PRD.

### When the user is vague

Push back with a clarifying probe before writing the section. Use the probes defined in `prompts/interview-questions.md`. Do not write the section until you have enough real information to avoid fabricating core content.

### [TBD] handling in validation

`[TBD]` fields are treated as missing for scoring purposes. Each `[TBD]` is scored as if the field is absent — applying the same deductions as the rubric in `prompts/validation-rules.md`. `[TBD]` fields are reported as warnings in the validation report, not violations, but they do reduce the score accordingly.

---

## Reference Research

The skill enriches PRDs with verifiable facts from sources **the user explicitly references**. Three source classes, each with a defined fallback:

| Source class | Examples | How to read it |
|---|---|---|
| Local file path | `docs/research-2026-q1.md`, prior PRD, exported CSV, post-mortem, Dash vault note | `Read` tool directly |
| Public URL | News article, regulatory body page (OJK, BI), public research, vendor docs, public blog post | `WebFetch` tool |
| Auth-walled URL | Notion, Jira, internal wiki, private Confluence, Figma, Dash internal tools | Ask user to paste the relevant excerpt — Claude Code cannot authenticate |

The skill NEVER goes searching for sources on its own (no `WebSearch`). If the user did not name a source, it does not exist for PRD purposes — write `[TBD — needs source]` instead.

### Fetch flow

1. User mentions a path or URL during §0.6, §3, §4, §7, or any interview turn.
2. Identify the source class from the table above.
3. For **local paths**: `Read` the file directly.
4. For **URLs**: try `WebFetch` first. If it fails (auth wall, 404, paywall, JS-only rendering, timeout), tell the user "I couldn't fetch that — could you paste the relevant section?" and proceed with the pasted excerpt.
5. Whether fetched or pasted, the rest of the rules below apply identically.

### Verify-before-write rule

For every fact that will land in the PRD with a `[source: …]` annotation, show the user the exact text first:

> "I'll write this in §3 Background: '18.3% mitra Lvl 1 lapse within 30 days of activation without completing 5 deliveries' [source: docs/mitra-cohort-2026-q1.md, retrieved: 2026-05-20]. OK to write this, or do you want to adjust the quote?"

This is the user's check that the fetch / read actually returned what the model claims. One confirmation per quoted fact — for facts only, not for narrative paragraphs.

### What to extract

Verifiable facts only:
- Numbers (metrics, baselines, dates, sample sizes) — quote exactly.
- Direct quotes (1–2 sentences) attributable to a named source.
- Named people (researcher, owner, approver) — cite role and source.
- Regulations or standards named in the source — cite the exact reference.

### How to attribute

Every research-derived fact carries an inline annotation. Format:

```
[source: docs/mitra-cohort-2026-q1.md, retrieved: 2026-05-20]
[source: https://www.ojk.go.id/id/regulasi/POJK-12-2018.pdf §4, retrieved: 2026-05-20]
[source: user-pasted excerpt from Notion PRD-EXPRESS-AUTO-SUSPEND §3.2, retrieved: 2026-05-20]
```

Use today's date from `currentDate`. Do not invent a date. Do not invent a section anchor — only cite `§N` if the source actually has that heading.

### What NOT to do

- NEVER paraphrase a source — quote the number or sentence directly.
- NEVER synthesize across sources without showing the user the synthesis and getting explicit confirmation.
- NEVER extrapolate a number. Write the measured value with its date; mark the rest `[TBD]`.
- NEVER fabricate the contents of a `WebFetch` result. If the fetch failed or returned empty, say so and ask the user to paste — do not invent text the page "would have" contained.
- NEVER follow links inside a fetched page to fetch more pages. One fetch per user-provided URL.
- NEVER use `WebSearch` to look up facts the user did not source. The skill has no `WebSearch` capability for this reason.

### When research returns nothing relevant

If the source contains nothing useful for the current section, that is the result. Keep the `[TBD]`. Do not pad the section to make the source feel useful.

### Interaction with anti-hallucination rules

- If a source contradicts the user's interview answer, flag the contradiction — do not silently choose.
- If a source names a regulation not on the confirmed §0.3b list, ask the user before adding it to §3 Regulatory Context.
- Research enriches what the user provided; it does not override user-confirmed answers.

---

## Version and Date Auto-Update Rules

These rules apply automatically whenever Claude writes or saves the PRD file. No manual entry is needed.

### Last Updated

- Always set `Last Updated` to today's date in `YYYY-MM-DD` format.
- Apply on every write: new PRD creation, section edit, status change, or validation fix.
- Use the current date from your context (`currentDate`). Do not invent a date.

### Version

Use the `vX.Y` format. Read the existing `Version` field from the PRD file before writing. Parse `vX.Y` into X and Y as integers and apply the matching rule:

| Trigger | Rule | Example |
|---|---|---|
| New PRD created (Mode 1) | Set to `v0.1` | — |
| Any section added or edited (no status change) | Increment Y by 1 | `v0.2` → `v0.3` |
| Status change: `Draft` → `In Review` | Increment Y by 1 | `v0.3` → `v0.4` |
| Status change: `In Review` → `Approved` | Increment X by 1, reset Y to 0 | `v0.4` → `v1.0` |
| Status change: `Approved` → `In Execution` | Increment X by 1, reset Y to 0 | `v1.0` → `v2.0` |
| Status change: any → `Deprecated` | Increment Y by 1 | `v2.1` → `v2.2` |

**Precedence:** When a status change and a content edit occur in the same save, apply the status-change rule only. Do not double-increment.

**Fallback:** If the existing Version field is absent or unreadable, treat it as `v0.0` before applying the rule (first increment → `v0.1`).

---

## Output Path

Default output: `docs/prd.md`.

If the user specified an explicit file path in their request (e.g., "save it to `prds/2026-Q2-auto-suspend-mitra.md`"), honor that path instead. The same rule applies to Mode 2 (read path) and Mode 3 (update path): if the user names a file, use it; otherwise default to `docs/prd.md`.

---

## Workflow

### Mode 1: Generate (default)
Used when user wants to create a new PRD from scratch.

```
Step 1 — Intake
  Run the full §0 Intake from prompts/interview-questions.md.
  Do NOT begin the section-by-section interview until all §0 questions are complete.
  Capture Tribe, BU, User Surface, Mitra-facing flag explicitly — these populate §2 frontmatter.
  Use §0 answers to determine which optional sections to include BEFORE proceeding to Step 2.
  Optional section decisions are final after intake — do not re-ask screening questions later.

  MANDATORY: If any compliance signal is confirmed in §0.3 (payments, eKYC, PII, regulated data,
  credit, etc.), run §0.3b Regulation Identification before proceeding. For Dash initiatives,
  default-consider OJK POJK 12/2018, UU PDP, BI-SNAP, OJK POJK 35/2018 alongside international
  regulations. Get user confirmation. The confirmed regulation list carries forward into §3
  (Regulatory Context), §5 (Scope), and §13 (Risks & Mitigations).

Step 2 — Guided Interview
  Work through each section in order.
  Ask focused questions per section (see prompts/interview-questions.md).
  Validate each answer against section rules before proceeding.
  Show the completed section output before moving to the next.

Step 3 — Requirements Deep Dive
  For §8, collect all user stories one at a time.
  For each story: role → action → benefit → scenarios.
  Ask "Any more stories?" after each one until the user signals done.
  If Mitra-facing flag is Yes, enforce formal "Anda" voice in any UI copy captured.

Step 4 — Optional Sections
  Optional sections were determined at intake. Present the confirmed list to the user.
  Generate each confirmed section in order: §13, §14, §15, §16.

Step 5 — Output
  Apply Version and Date Auto-Update Rules: set Version to v0.1, set Last Updated to today's date.
  Assemble and write the complete PRD to the output path (see "Output Path" above).
  Run validation: invoke `python3 scripts/validate.py <path>` for the deterministic baseline,
  then layer the semantic checks from prompts/validation-rules.md on top.
  Report validation score and any warnings.
  Offer a summary of what was generated.
```

### Mode 2: Review
Used when the user says "review my PRD" or provides an existing PRD file.

```
Step 1 — Read the existing PRD file (path from user, or default docs/prd.md).
Step 2 — Run validation: invoke `python3 scripts/validate.py <path>` first,
  then add semantic checks from prompts/validation-rules.md.
Step 3 — Report: score, issues found, sections that need work.
Step 4 — Offer to fix specific sections interactively.
  After each fix is written to the file: apply Version and Date Auto-Update Rules.
```

### Mode 3: Update
Used when the user wants to revise a specific section of an existing PRD.

```
Step 1 — Identify the target section and the PRD file path.
Step 2 — Show the current content of that section.
Step 3 — Ask focused questions to gather new/updated content.
Step 4 — Rewrite the section and update the file. Apply Version and Date Auto-Update Rules.
Step 5 — Re-run validation on the updated section.
```

---

## File References

| File | Purpose | When to load |
|---|---|---|
| `SKILL.md` | This file — always loaded | Always |
| `prompts/interview-questions.md` | Questions to ask per section during generation | Mode 1 (each section), Mode 3 |
| `prompts/section-rules.md` | Full rules for every section — used for validation | Modes 1, 2, 3 when validating |
| `prompts/validation-rules.md` | Scoring rubric and validation report format | Modes 1, 2 (after writing/reading PRD) |
| `templates/prd-template.md` | The blank PRD template | Mode 1 when assembling final output |
| `templates/prd-summary-template.md` | One-page stakeholder summary template | When user requests a summary |
| `scripts/validate.py` | Deterministic baseline validator (run via Bash) | Modes 1, 2 — before producing report |
| `examples/` | Sample completed Dash PRDs for reference | Optional, reference only |

See [README.md](README.md) for installation, full feature list, and FAQ.
See [NOTICE.md](NOTICE.md) for attribution and BSD-3 compliance.

---

## License
BSD 3-Clause — free to use and redistribute, with attribution. Adapted from NatPRD by Anatasof Wirapraja. Do not use the original author's name to endorse this Dash-adapted version.
