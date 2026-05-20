# Dash Foundation — Voice Rules (Layer 0)

> Shared voice baseline for all Dash products + Trellis tenants.
> Product/feature layers (Layer 1+) may opt down to informal voice for non-legal flows; legal/financial/compliance flows MUST inherit Layer 0 formal voice.

## Default voice: formal "Anda"

All mitra-facing copy defaults to **formal "Anda"**, not casual "kamu".

| | Use | Avoid |
|---|---|---|
| Pronoun | Anda | kamu, lo, lu |
| Imperative | Mohon, Silakan | yuk, ayo, plis |
| Affirmation | Ya | yaa, yap, oke |
| Filler | (none) | sih, deh, dong, kok |
| Verb prefix | melengkapi, menyimpan | ngelengkapin, nyimpen |
| Particle | (none) | -in, -nya casual |

Rationale: Dash carries legal/financial weight (mitra payouts, KYC, contracts, suspensions). Formal voice is the safest default — it preserves dignity, signals compliance maturity, and reads correctly when copy appears in dispute documents, regulator screenshots, or court evidence.

## Dual-aesthetic principle

Foundation voice is **formal-functional**, not corporate-stiff. Sentences stay short, action-led, and human. Avoid both extremes:

- Too casual: "Yuk lengkapin datamu biar bisa narik lagi" — REJECT (Layer 0 forbids slang for mitra-facing legal flows).
- Too stiff: "Diharapkan Anda berkenan untuk melengkapi data Anda agar dapat melanjutkan aktivitas operasional" — REJECT (bloated, condescending).
- Foundation-right: "Lengkapi data Anda untuk melanjutkan." — APPROVED.

## Mandatory rules (Layer 0)

1. **Address mitra as "Anda"** in every UI surface (driver app, web portal, push notification, SMS, email, dispute letter, suspension screen).
2. **No slang, no softeners, no informal particles** (-in, -nya, -dong, -sih, -deh, -kok, yaa, yuk, plis).
3. **No emoji in legal/financial flows.** Allowed sparingly in non-legal celebration moments (mission complete, milestone) at Layer 1+ discretion.
4. **Active voice for instructions.** "Unggah foto KTP" not "Foto KTP perlu diunggah".
5. **Sentence case for labels and buttons.** "Simpan perubahan" not "SIMPAN PERUBAHAN" or "Simpan Perubahan".
6. **Numbers in figures, not words.** "3 mitra" not "tiga mitra".
7. **Explicit subject in count labels.** "7 mitra Lvl 1 · 4 mitra Lvl 2" not "Lvl 1: 7 · Lvl 2: 4" (ambiguous).
8. **One CTA per surface.** Secondary actions are tertiary buttons or links, not parallel primaries.

## Layer 1+ override policy

A consumer product (e.g. Dash Ride driver-app onboarding celebration, Dash Marketplace promo banner) MAY opt into informal voice ONLY when ALL of these hold:

- Surface is **non-legal** (no contract, no payout, no suspension, no KYC).
- Override is **declared in the feature spec / PRD** under a "Voice deviation" section.
- Override is **logged** in `BASELINE-DRIFT-<date>.md` so it surfaces in DS audits.

Default still wins on omission. When in doubt, use "Anda".

## Cross-reference

- Existing per-repo voice mandates: `apps/docs/registry/rules/dash-ai-rules.md` § "Per-repo stack mandates" (note: portal-v2 currently declares "kamu" default — that is Layer 1 product policy from a 2026-era decision, NOT a contradiction of Layer 0; future Layer 1 review should reconcile).
- Driver-app formal-functional override precedent: Auto Suspend Mitra feature (2026-05-11) — first explicit "Anda" deployment.
