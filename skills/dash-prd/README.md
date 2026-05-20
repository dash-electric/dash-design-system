# Dash PRD Skill

Internal Claude Code skill for writing production-grade PRDs for **PT Dash Elektrik Indonesia** initiatives. Adapted from [NatPRD](https://github.com/anatasof/NatPRD) (BSD-3-Clause) — see [`NOTICE.md`](NOTICE.md).

---

## What it does

- **Runs an upfront intake** covering Dash tribe, BU enum, user surface, mitra-facing flag, compliance signals, team structure, and discovery maturity
- **Identifies applicable regulations** with Indonesian regulations (OJK POJK 12/2018, UU PDP 2022, BI-SNAP, OJK POJK 35/2018) as the default lens, plus cross-border regulations when relevant
- **Interviews you section by section** with focused, Dash-aware questions in mixed EN/ID where natural
- **Enforces** the Dash voice rule — mitra-facing copy must use formal "Anda"
- **Validates** every answer against section rules before moving on
- **Generates** Gherkin acceptance criteria for every user story
- **Never fabricates content** — writes `[TBD]` instead of inventing metrics, names, dates, or evidence
- **Scores** the completed PRD out of 100 with a detailed validation report
- **Outputs** a production-ready `docs/prd.md` file

---

## Who can use this

Any Dash team member writing a feature spec:

- **PMs** building a quarterly initiative across one or more tribes
- **PEs / engineers** spec'ing a new service, API, or refactor
- **Designers** documenting a flow before handoff
- **Ops leads** spec'ing a new operational tool, rule, or policy
- **Tribe leads** writing a strategic initiative or cross-tribe rollout

If you can describe the feature, the skill will guide you to a structured PRD.

---

## Installation

The skill lives **vendored** at `dash-ds/skills/dash-prd/`. To activate in your local Claude Code:

```bash
cd /Users/irfanprimaputra.b/dash-ds
bash skills/dash-prd/install.sh
```

This creates a symlink `~/.claude/skills/dash-prd → /Users/irfanprimaputra.b/dash-ds/skills/dash-prd`. Restart Claude Code to pick it up.

The symlink approach means any update to the vendored skill takes effect immediately on next Claude Code restart — no re-install needed.

> **Future:** When the `dash` CLI extends to skills, this will become `dash skill install dash-prd`.

---

## Usage

In Claude Code, anywhere in the Dash workspace:

```
# Create a new PRD
"I want a PRD for the auto-suspend mitra feature"
"Help me write a PRD for the new EV charging station integration"
"Create a PRD for mitra Lvl 1 onboarding revamp"

# Review an existing PRD
"Review my PRD"
"Validate the PRD at docs/auto-suspend-mitra-prd.md"

# Update a specific section
"Update the hypothesis in the PRD"
"Add a new user story to the requirements section"

# Generate a stakeholder summary
"Generate a one-pager summary of the PRD for the COO"
```

---

## PRD Structure

### Core sections (always required)
1. Initiative Name
2. Document Status ← status, version, **Tribe, BU, User Surface, Mitra-facing**, author, owner, reviewers, approvers
3. Background ← problem, evidence, cost of inaction, regulatory context (if compliance signals)
4. Objective ← outcome + numeric KRs + Dash OKR link
5. Scope & Boundaries
6. Hypothesis
7. Success Metrics ← leading / lagging / guardrail
8. Requirements ← user stories + Gherkin AC + NFRs (voice rule enforced if mitra-facing)
9. Solution ← design links + coverage map + alternatives
10. Metric Monitoring
11. Event & Data Tracking
12. FAQ

### Optional sections (triggered by intake answers)
13. Risks & Mitigations (incl. regulatory + Dash ops categories)
14. Dependencies
15. Launch Plan
16. Stakeholder Map

---

## Validation Scoring

After generation, the PRD is scored out of 100:

| Band | Score | Meaning |
|---|---|---|
| Excellent | 90–100 | Ready for `In Review` |
| Good | 75–89 | Fix warnings before circulating |
| Needs Work | 60–74 | Several sections incomplete |
| Not Ready | <60 | Major gaps — do not circulate |

You can also run the validator directly:

```bash
python3 skills/dash-prd/scripts/validate.py path/to/prd.md
```

Outputs JSON. No deps — Python 3 stdlib only.

---

## File Structure

```
skills/dash-prd/
├── SKILL.md                          ← Skill entry point (Claude Code reads this)
├── README.md                         ← This file
├── NOTICE.md                         ← BSD-3 attribution + adaptation summary
├── LICENSE                           ← BSD-3-Clause (unchanged from NatPRD)
├── install.sh                        ← Symlink installer
├── templates/
│   ├── prd-template.md               ← Blank PRD template (Dash frontmatter)
│   └── prd-summary-template.md       ← One-page stakeholder summary
├── prompts/
│   ├── interview-questions.md        ← Questions per section (Dash-aware)
│   ├── section-rules.md              ← Rules per section (Dash guardrails added)
│   └── validation-rules.md           ← Scoring rubric (verbatim from NatPRD)
├── scripts/
│   └── validate.py                   ← Deterministic baseline validator
└── examples/
    ├── auto-suspend-mitra-prd.md     ← Sample completed PRD (Express tribe)
    └── driver-onboarding-prd.md      ← Sample completed PRD (mitra ops)
```

---

## Dash-specific behavior

| Behavior | Detail |
|---|---|
| **Tribe / BU / User Surface / Mitra-facing** mandatory in §2 | Missing any of these is a validation violation |
| **Mitra-facing voice rule** | If `Mitra-facing? = Yes`, all UI copy uses formal "Anda" — never "kamu", "yaa", "lewatin", "bakal" |
| **Indonesian regulations first** | OJK / UU PDP / BI-SNAP / Kominfo as default lens; international regs only when relevant |
| **Specific regulation citations** | Must use full reg number (e.g., `OJK POJK 12/2018`) — generic "OJK" is a violation |
| **Dash risk categories** in §13 | Pre-populates probes for mitra suspension, payment reversal, geofence, fleet ops, charging, capacity, gaming |

---

## License

BSD 3-Clause. Free to use, modify, and redistribute, with attribution. Adapted from NatPRD by Anatasof Wirapraja. Do not use the original author's name to endorse this Dash-adapted version.

See [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md) for details.
