# NOTICE — Attribution and Licensing

## Origin

This skill (`dash-prd`) is **adapted from [NatPRD](https://github.com/anatasof/NatPRD)** by Anatasof Wirapraja, released under the BSD 3-Clause License (Copyright (c) 2026, Anatasof Wirapraja).

The original upstream is preserved in `LICENSE`. All redistributions of this skill — internal or external — must carry that license file unmodified.

## What was adapted

The Dash adaptation makes the following changes from upstream NatPRD:

- **`SKILL.md`** — renamed `natprd → dash-prd`; added Dash domain context block (tribes, BU enum, user surfaces, voice rule); description updated to mention Dash domain triggers. Workflow modes, anti-hallucination rules, version/date auto-update rules, and reference-research rules are preserved verbatim.
- **`prompts/interview-questions.md`** — §0.2 expanded with Dash-specific Tribe / BU / User Surface / Mitra-facing probes; §0.3b regulation table re-prioritised to put Indonesian regulations (OJK POJK 12/2018, UU PDP 2022, BI-SNAP, OJK POJK 35/2018) first; §13 risk categories expanded with Dash-relevant operational categories (mitra suspension, payment reversal, geofence accuracy, fleet ops, charging infra, capacity, mitra gaming).
- **`prompts/section-rules.md`** — added cross-section Dash guardrails (mandatory Tribe/BU/User Surface fields, mitra-facing voice rule, specific Indonesian regulation citation requirement); added matching violations to §2.
- **`templates/prd-template.md`** — §2 frontmatter extended with Tribe / BU / User Surface / Mitra-facing fields; placeholder content uses Dash-realistic example (Auto Suspend Mitra Reservasi); §13 prepopulated with Dash risk categories; §11 events use Dash-specific names and properties (`mitra_suspended`, `mitra_appeal_submitted`, `mitra_reinstated`); §15 comms plan uses Dash channels.
- **`README.md`** — rewritten as internal-facing install/usage doc for Dash team members.
- **`install.sh`** — new file; symlinks the vendored skill into `~/.claude/skills/dash-prd`.
- **`examples/`** — new directory with two sample completed Dash PRDs for reference.

## What was preserved verbatim

- **`LICENSE`** — unchanged BSD-3-Clause text with original copyright.
- **`prompts/validation-rules.md`** — generic scoring rubric, language-agnostic.
- **`scripts/validate.py`** — deterministic structural validator, language-agnostic.
- **`templates/prd-summary-template.md`** — one-page stakeholder summary template.
- All anti-hallucination rules, version/date auto-update rules, reference-research rules, and the 12-core / 4-optional section structure.

## BSD-3-Clause compliance checklist

- [x] **Clause 1** — Source redistribution retains the copyright notice, list of conditions, and disclaimer. `LICENSE` file copied verbatim into this directory.
- [x] **Clause 2** — N/A for source-only distribution; if ever packaged binary, reproduce notice in docs.
- [x] **Clause 3** — Neither the name of Anatasof Wirapraja nor "NatPRD" is used to endorse or promote this Dash-adapted skill. The Dash version is named `dash-prd` and is positioned as a fork/adaptation, not the original.
- [x] **Attribution** — Origin and adaptations documented in this NOTICE.md, in `SKILL.md` header, and in `README.md`.

## Upstream link

Original repository: https://github.com/anatasof/NatPRD

If you want to contribute back improvements that aren't Dash-specific, consider opening a PR upstream.
