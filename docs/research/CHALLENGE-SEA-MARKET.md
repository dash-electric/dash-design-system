# Dash DS — SEA + Indonesian Market Challenge Review

> **Author:** Claude Opus 4.7 (1M ctx) — critical review under Irfan's direction
> **Date:** 2026-05-21
> **Mode:** Honest, gap-first, no marketing speak. Surfaces uncomfortable findings.
> **Status:** Reference doc. NOT committed. NOT a kill criteria signal.
> **Lens:** What does Dash DS need that shadcn (San Francisco-built) inherently cannot address because shadcn was never written with Indonesian/SEA users in scope?

---

## Executive Summary

Dash DS' Indonesian context shows up in **eight of ten** sample blocks at the surface (Rp prefix, "Anda" voice, `+62` phone affixes, KTP-shaped flows). But the locale support is **inline-copied, not systematized** — every block re-implements its own `Intl.NumberFormat("id-ID")` formatter, every "Rp ••••" mask is hand-rolled, no shared `formatIDR(cents)` exists in `lib/`, and the only `finance-localization-settings.tsx` template still ships as **AlignUI's western default** (USD, GMT+03:00 Istanbul, English) — the localisation template itself is unlocalised. That is the single most-embarrassing gap for an Indonesian DS.

shadcn will **never** address this because shadcn is built as a globally-neutral primitive layer; locale is a consumer-app concern in their model. That neutrality is a moat for Dash if Dash invests in a Layer-0 `intl/` foundation: shared formatters for IDR/cents, phone +62 normaliser, eKYC document patterns (KTP/SIM/STNK/NPWP), 1×24-jam SLA language, OJK/UU PDP audit hooks, and BI-SNAP payment-rail wiring. None of that will ever ship in shadcn upstream. Build it once at Layer 0, every product/tenant inherits.

Top regulatory miss: **UU PDP (2024 enforcement) is not a first-class rule in `cardinal-rules.md`**, even though Dash carries mitra PII (KTP photo, NIK, NPWP, geolocation, payout bank). Audit trail (CR-2) is good but PDP requires consent capture + erasure + breach notification — none of which the DS exposes as canonical patterns.

Second-tier miss: **no offline-first patterns at Layer 0**. Dash mitra drives motor in Jakarta rain on 2G/3G — `use-mobile.ts` exists but there is no `use-network`, no toast queue for offline submit, no payload-replay UX. shadcn doesn't have these either and never will, because their primary use case is desktop SaaS on broadband. Dash needs them critically.

Third-tier miss: **Trellis SEA expansion is structurally unprepared**. `trellis-tenant` theme template lets the tenant pick a color, but the foundation hard-codes Indonesia: voice is "Anda", date format implied DD/MM, phone format `+62`, currency rendered as "Rp" prefix. A Vietnamese (VND, đồng-suffix) or Thai (฿, Buddhist calendar option) tenant would need to **fork** Layer 0 — defeating the whole "share foundation" pitch.

**TL;DR:** Indonesian context is present but not architected. Pre-Wave-5 fixable in 3 critical adds (~16-24h). SEA expansion needs a Layer-0 `intl` namespace before Trellis sales pitch — call it now.

---

## Top 15 Findings (Indonesian-specific gaps)

### Finding #1 — No shared IDR formatter in `lib/`
**Category:** Currency / DRY
**Severity:** High
**Source:** `apps/docs/registry/dash/blocks/my-cards-stack.tsx:31`, `products-grid.tsx:43`, `transactions-table.tsx:45`, `orders-table.tsx:37`, `mitra-dispute-flow.tsx:690`, `package-tracking-timeline.tsx:107`, `ui/price-with-discount.tsx:37`, `payment-receipt-edit.tsx:171` — eight files redefine the same `Intl.NumberFormat("id-ID")` formatter inline.
**Description:** Every IDR-displaying component carries its own `const fmt = (n: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n)`. Three different conventions for the "Rp" prefix coexist: `"Rp ${fmt(n)}"` (space), `"Rp" + fmt` (no space), and `Intl.NumberFormat(..., { style: "currency", currency: "IDR" })` (which produces "Rp 1.234.567,00" — wrong for Dash where receipts are whole rupiah). Cents vs rupiah convention is also inconsistent: `payment-receipt-edit.tsx` uses IDR cents (×100), `my-cards-stack.tsx` uses raw rupiah, `package-tracking-timeline.tsx` documents "IDR (full rupiah, not cents)". A new dev cannot tell from prop types which unit a block expects.
**Why shadcn doesn't address this:** shadcn is locale-neutral. Currency formatting is consumer-app concern. They will never ship a `formatIDR` because they would have to ship 180 currency helpers.
**Why Dash MUST address it:** Dash is single-currency (IDR) for the foreseeable future. Inconsistent cents-vs-rupiah handling is a **financial bug class** — payment-receipt-edit's 64-bit-cents convention is correct, but other money-touching blocks (`transactions-table`, `orders-table`) silently expect rupiah units. One copy-paste mistake = 100× off payout.
**Fix:**
1. Add `apps/docs/registry/dash/lib/intl.ts` exporting `formatIDR(cents: number)`, `formatIDRRupiah(rupiah: number)`, `parseIDRInput(raw: string): cents`, with explicit cents vs rupiah variants.
2. Lint rule (or `dash audit` check) banning inline `Intl.NumberFormat("id-ID"` in registry files.
3. Migrate the 8 files to the shared formatter.
**Effort:** 3-4h (helper + migration + audit rule).

### Finding #2 — Localisation settings template ships AlignUI's western defaults
**Category:** Voice / Branding embarrassment
**Severity:** Critical (pre-pilot blocker)
**Source:** `apps/docs/registry/dash/templates/finance-localization-settings.tsx:40-70`
**Description:** The literal `FinanceLocalizationSettings` template — the one a developer copies when building Dash's own settings page — defaults to **"English (ENG)"** for language, **"United States Dollar (USD)"** for currency, **"(GMT+03:00) Istanbul"** for timezone, and English headings ("Language" / "Currency" / "Discard" / "Save"). The strings are AlignUI's stock filler. A developer running `dash add finance-localization-settings` in a Dash repo lands a settings screen that says "USD" and "Istanbul" out of the box.
**Why shadcn doesn't address this:** shadcn doesn't ship localisation settings as a template at all.
**Why Dash MUST address it:** Dash is Indonesian. The pilot wave will compare this against existing Dash production screens (Bahasa, IDR, WIB) and conclude the DS is "western copy-paste." Trellis sales: this template defines the *first impression* of "what does Dash DS look like for my SaaS tenant."
**Fix:** Re-author with Indonesian defaults: "Bahasa Indonesia", "Rupiah Indonesia (IDR)", "(GMT+07:00) Jakarta — WIB", "DD/MM/YYYY", and Bahasa headings ("Bahasa" / "Mata uang" / "Zona waktu" / "Format tanggal" / "Batal" / "Simpan"). Add a Trellis-tenant override-table at the top of the file documenting which fields a tenant SHOULD bind (e.g., VND for Vietnam).
**Effort:** 1-2h.

### Finding #3 — No UU PDP (Personal Data Protection) cardinal rule
**Category:** Regulatory (Indonesian)
**Severity:** Critical (post-pilot landmine)
**Source:** `apps/docs/registry/dash/foundation/rules/cardinal-rules.md` (8 cardinal rules, none mention PDP / consent / erasure / breach); rules glossary search returns zero hits for "PDP", "OJK", "BI-SNAP".
**Description:** Indonesia's UU PDP (UU 27/2022, full enforcement October 2024) requires consent capture for personal-data collection, purpose specification, retention limits, subject erasure rights, and 72-hour breach notification for processors. Dash collects KTP photos (NIK), bank-account numbers, geolocation, NPWP, mitra phone, and payout history — every category is PDP-regulated. The DS has CR-2 (audit trail) which covers part of it, but no canonical patterns for: (a) consent checkbox + audit ("setuju pengumpulan data") on signup, (b) data-export request UI (subject access right), (c) data-erasure request UI (right to be forgotten), (d) retention-expiry banner ("Data Anda akan dihapus pada [date]"), (e) breach-notification template.
**Why shadcn doesn't address this:** US has no UU PDP. GDPR cookies exist but shadcn doesn't ship them as primitives.
**Why Dash MUST address it:** OJK/Kominfo can fine 2% of annual revenue per violation. Mitra disputes that escalate to regulator (e.g., "Dash kept my KTP after suspension") need DS-canonical screens. Today Dash has zero PDP-specific UX in the registry.
**Fix:**
1. Add CR-9 to `cardinal-rules.md`: "UU PDP compliance hooks mandatory for personal-data collection screens — consent checkbox + purpose statement + retention disclosure."
2. New block: `pdp-consent-card` (signup/edit screens — purpose, retention, contact DPO).
3. New block: `pdp-data-request-flow` (subject access + erasure request, audit-bearing).
4. Documentation page citing UU PDP article references.
**Effort:** 8-12h (rule + 2 blocks + doc + audit fixture).

### Finding #4 — No phone-number normaliser / +62 handling
**Category:** Currency-equivalent (phone is identity in Indonesia)
**Severity:** High
**Source:** `apps/docs/registry/dash/blocks/signup-01.tsx:41` (`placeholder="0812 8xxx xxxx"`), `settings-profile.tsx:26` (`defaultPhone = "0812 8000 4421"`), `verification-otp.tsx:25` (`+62 812 8***`), `settings-integrations.tsx:33` (`+62 21 80042233`), `halo-dash-3pane.tsx:247` (`+62 812 8000 4421`). Glossary `dash-ai-rules.md:551` shows one regex `/^(\+62|62|0)[\d]{8,12}$/` as the example.
**Description:** Indonesian mobile numbers can be entered as `0812...`, `812...`, `+62 812...`, `62 812...`, or `+62812...` — five common variants. Backend storage convention isn't enforced in the DS. Carrier prefix (Telkomsel 0811-0813, 0821-0823, 0852-0853; Indosat 0814-0816, 0855-0858; XL 0817-0819; Tri 0895-0899; Smartfren 0881-0889) matters for some flows (WA OTP routing, low-cost SMS provider choice) but the DS has no carrier-aware UI.
**Why shadcn doesn't address this:** US uses E.164 → libphonenumber. Indonesia uses a thousand subtle conventions ("Nomor HP" vs "Nomor telepon" vs "WhatsApp") that shadcn would never bake in.
**Why Dash MUST address it:** mitra signup, KYC, OTP, payout SMS, dispute contact — every entity has a phone. Inconsistent normalisation = mitra cannot receive OTP = mitra cannot work.
**Fix:**
1. `apps/docs/registry/dash/lib/phone.ts` — `normalizeID(raw): "+628..."`, `displayID("+628..."): "0812 8xxx xxxx"`, `maskID(...): "+62 812 8***"`, `isValidID(...): boolean`, optional `carrier(...)`.
2. `apps/docs/registry/dash/ui/phone-input.tsx` primitive — sticky `+62` affix, auto-strip leading 0, validation on blur.
3. Migrate signup-01, settings-profile, verification-otp, repossession-action-sheet to use the primitive.
**Effort:** 4-6h.

### Finding #5 — No KTP / SIM / STNK / NPWP document-upload patterns
**Category:** Indonesian KYC
**Severity:** High
**Source:** `dash-ai-rules.md` mentions KTP/POD/POP/KYC under audit trail scope (line 833-873) but no canonical components exist. `apps/docs/registry/dash/blocks/` has `image-editor-with-audit.tsx` (generic) and `proof-image-viewer.tsx` (generic) — neither knows about KTP-specific fields (NIK 16-digit, alamat-as-printed, expiry, photo-with-KTP selfie).
**Description:** Dash mitra onboarding requires: (1) KTP (national ID), (2) SIM (driver licence with class A/C distinction for motor vs car), (3) STNK (vehicle registration), often (4) BPKB (vehicle ownership), and (5) NPWP (taxpayer ID, optional but required for monthly earnings > Rp 4.5jt). Each has specific OCR fields, validation rules, expiry semantics. Verihubs is the assumed eKYC vendor (open question in `CLAUDE.md`) — no DS-canonical integration shape.
**Why shadcn doesn't address this:** US KYC is SSN + drivers license + maybe selfie. Shadcn would never ship `id-card-upload-ktp.tsx`.
**Why Dash MUST address it:** every Dash product line (Ride, Logistic, Express, Maintenance) re-implements KTP capture today, with different field shapes. New product onboarding = re-implementing eKYC from scratch.
**Fix:**
1. Block `ktp-upload` with structured fields (NIK, nama, tanggal lahir, alamat, RT/RW, kelurahan, kecamatan, agama, status, pekerjaan, kewarganegaraan, expiry — match KTP card layout).
2. Block `sim-upload` with class radio (A / B-I / B-II / C / D), expiry, name match-check against KTP.
3. Block `stnk-upload` with vehicle metadata (plat nomor, merek, tipe, jenis, model, tahun, isi silinder, warna, bahan bakar).
4. Pattern `ekyc-step-stack` chaining all three with audit-bearing scaffold.
5. Glossary entry documenting Verihubs integration shape OR generic eKYC provider interface.
**Effort:** 16-24h (4 blocks + 1 pattern + doc + fixtures).

### Finding #6 — Foundation voice has no Layer 1 informal "kamu" register
**Category:** Voice / Customer-facing apps
**Severity:** Medium
**Source:** `apps/docs/registry/dash/foundation/voice/voice-rules.md:6-18` defines formal "Anda" as the Layer-0 default; line 52 acknowledges portal-v2 currently declares "kamu" but treats it as "Layer 1 product policy from a 2026-era decision." The DS doesn't ship a *companion* informal-voice rules file as Layer 1.
**Description:** Voice rules document a default + an override policy, but the override has no canonical Layer-1 ruleset. Each consumer product re-derives what "informal kamu" means (fillers? slang? emoji? imperatives?). The 2026-05-11 mobile-driver-app decision (memory item `feedback_dash_mobile_voice_formal.md`) explicitly *overrode* a casual Mode C — but the rejection criteria aren't codified.
**Why shadcn doesn't address this:** No voice register at all.
**Why Dash MUST address it:** Indonesian has 3+ formality registers (Anda formal, kamu informal, lo/gue jakarta-casual) plus regional variants (Sunda halus, Jawa krama, etc.). Without a codified informal-voice ruleset, customer-facing apps (Dash Marketplace, Dash Ride passenger app) will drift toward AI-generic "Hai!" or worse.
**Fix:**
1. Add `apps/docs/registry/dash/foundation/voice/informal-rules.md` — Layer 1 informal "kamu" ruleset (still no slang for legal/financial, allow softer imperatives, allow emoji in non-transactional surfaces, no JKT-casual slang in pan-archipelago apps).
2. Document the Mode-C rejection criteria from 2026-05-11.
3. Cross-link from `cardinal-rules.md` CR-4.
**Effort:** 2-3h.

### Finding #7 — No offline-first / network-aware primitives
**Category:** Mobile + connectivity
**Severity:** High (mitra app blocker)
**Source:** `apps/docs/registry/dash/hooks/use-mobile.ts` is the only mobile-aware hook — pure viewport breakpoint. No `use-network`, no `use-online`, no offline submit queue. `mitra-dispute-flow.tsx:550` says "Tim kami akan menindaklanjuti dalam 1×24 jam" but no UX if the dispute submit fires when offline.
**Description:** Indonesian mobile context: 95%+ smartphone, but motor-riding mitra hits dead zones constantly (tunnels, basements, rural Bekasi). Form-with-audit + bulk-upload + dispute submit all assume connectivity. shadcn primitives don't help here.
**Why shadcn doesn't address this:** SF/SaaS desktop = always-online. shadcn will never ship "queue-and-replay-on-reconnect."
**Why Dash MUST address it:** mitra cannot complete a delivery confirmation in an underground parking lot today, and the DS doesn't help them.
**Fix:**
1. `hooks/use-network.ts` — online/offline + connection-quality (Network Information API where available).
2. `hooks/use-submit-queue.ts` — IndexedDB-backed payload queue with retry on reconnect.
3. Banner UI primitive `offline-banner.tsx` — sticky "Anda offline. Perubahan akan dikirim ketika koneksi kembali."
4. Update `form-with-audit.template.tsx` to compose with queue.
**Effort:** 12-16h.

### Finding #8 — No e-wallet / payment-rail iconography or canonical brand list
**Category:** Payments
**Severity:** Medium
**Source:** `my-cards-stack.tsx:11-21` hard-codes `"BCA" | "Mandiri" | "GoPay" | "DANA"` as a union literal. `payment-receipt-edit.tsx:74` enumerates `"cash" | "transfer" | "qris" | "ewallet"` (collapsing all e-wallets into one). No shared `PaymentRail` type, no icon-set for OVO / ShopeePay / LinkAja / Jenius / DANA / GoPay / BCA / Mandiri / BNI / BRI / Permata / CIMB Niaga / BTPN Jenius / Bank Jago / Allo Bank / SeaBank.
**Description:** Different blocks invent different brand enums. `signup-03.tsx:26` mentions "Payout harian via BCA/GoPay/DANA" as marketing copy. `transactions-table.tsx:33` shows "Withdraw · BCA *4421". No DS-canonical icon for any of these.
**Why shadcn doesn't address this:** US payment rails are Visa/MC/Amex/PayPal/ApplePay/Venmo. Indonesia has its own 15+ rail ecosystem.
**Why Dash MUST address it:** mitra payout is a daily UX moment. Wrong brand badge = trust hit.
**Fix:**
1. `lib/payment-rails.ts` — exhaustive enum + display name + bank code (BI Switching network code) + 24-color brand hex.
2. `ui/payment-rail-badge.tsx` — primitive with brand-correct mark + color (use brand SVG, vendored).
3. `ui/payment-method-picker.tsx` — selector grid grouped by rail type (Virtual Account, QRIS, E-Wallet, Cash, COD).
4. Pattern doc citing BI-SNAP open-banking API for FE-BE integration shape.
**Effort:** 10-14h.

### Finding #9 — Trellis tenant template hard-codes Indonesia at Layer 0
**Category:** SEA expansion
**Severity:** Medium (strategic, deferred)
**Source:** `trellis-tenant/README.md` — tenant MAY override `--primary-base`, `--theme-accent-*`, `--font-display`, "voice deltas." Tenant MUST NOT override "Layer 0 foundation tokens" + "Layer 1 primitive internals." But Layer 0 voice = "Anda" (Indonesian), Layer 0 currency rendering = "Rp" prefix (Indonesian), Layer 0 implied date = DD/MM (which conflicts with Thai Buddhist calendar option, US-tenant MM/DD).
**Description:** A Vietnamese tenant (VND, no cents, "₫" suffix not prefix, comma thousands sep), a Thai tenant (THB, "฿" prefix, Buddhist year +543), a Philippine tenant (PHP, "₱" prefix, same DD/MM as ID but English-primary) — none can use Layer 0 verbatim. The "trellis-tenant" template README implies all of this is overridable, but the actual `voice-rules.md` mandates "Anda" without a `--language` token.
**Why shadcn doesn't address this:** shadcn doesn't claim multi-tenant SEA at all. Dash *does* claim it via Trellis pitch.
**Why Dash MUST address it:** Trellis sales motion will hit this on first Vietnamese / Thai customer. Easier to architect now than retrofit.
**Fix:**
1. Layer 0 token additions: `--intl-currency-code`, `--intl-currency-symbol`, `--intl-currency-symbol-position` (prefix/suffix), `--intl-locale`, `--intl-date-format`, `--intl-week-start` (Mon/Sun/Sat).
2. `lib/intl.ts` reads these tokens (cssVar) instead of hard-coding "id-ID".
3. Per-tenant manifest schema documents which Layer-0 intl-tokens are overridable.
4. Decision: voice register (Anda vs ban kamu vs locale-equivalent formality) — leave to Layer 2 tenant voice override.
**Effort:** 16-24h. Defer until first non-Indonesian Trellis tenant signs.

### Finding #10 — Calendar / date components have no Bahasa locale binding
**Category:** Date format
**Severity:** Medium
**Source:** `apps/docs/registry/dash/ui/date-picker.tsx:40` defaults to `placeholder = "Pick a date"` (English), `:92` and `:151` same. `hr-general-settings.tsx:60` has DD/MM/YY vs MM/DD/YY toggle but defaults DD/MM/YY only by chance. No `id-ID` locale passed to `date-fns` `format()` import in `date-picker.tsx`.
**Description:** Date picker UI renders English month names + English day-of-week + English placeholder out-of-box. Other components (`multi-stage-approval.tsx:196`, `proof-image-viewer.tsx:649`) correctly pass `"id-ID"` to `toLocaleString`, but the primitive that's MOST visible — the picker itself — does not.
**Why shadcn doesn't address this:** shadcn defaults to English. They have an `--rtl` migration but no `--locale=id` equivalent.
**Why Dash MUST address it:** every booking/scheduling/dispatch UI uses date picker. "Pick a date" in English = unprofessional.
**Fix:** Add `locale` prop to `DatePicker` defaulting to id-ID; render placeholder "Pilih tanggal" / "Pilih rentang tanggal"; pass `import { id } from 'date-fns/locale'` to internal `Calendar`. Document in `lib/intl.ts`.
**Effort:** 2-3h.

### Finding #11 — No hari raya / public holiday awareness
**Category:** Cultural / scheduling
**Severity:** Low (high upside)
**Source:** Glossary + DS searches return zero matches for "hari raya", "Idul Fitri", "Natal", "Nyepi", "Waisak".
**Description:** Indonesian operating calendar has ~16 public holidays (Idul Fitri H-1/H/H+1, Idul Adha, Tahun Baru Hijriyah, Maulid, Isra Mikraj, Wafat Yesus, Paskah, Kenaikan Yesus, Natal + cuti bersama, Nyepi, Waisak, Tahun Baru, Imlek, HUT RI, Hari Buruh, Hari Lahir Pancasila). Mitra schedule, dispatch SLA, payout cutoff, customer-facing scheduling all change around these. The DS has no `useID Holidays()` hook, no `<HolidayBanner />`, no "Tutup hari ini — Hari Raya Idul Fitri" empty-state preset.
**Why shadcn doesn't address this:** US holidays are different (Thanksgiving, July 4, MLK Day). shadcn ships no holiday primitives at all.
**Why Dash MUST address it:** Lebaran is the single biggest demand spike + supply crunch of the year for ride/delivery. Hari raya UX needs to be canonical (greetings, scheduling cutoffs, payout deferral disclosures).
**Fix:**
1. `lib/holidays-id.ts` — annual public-holiday data (probably hand-curated; OJK publishes annually).
2. `hooks/use-holiday-id.ts` — `isHolidayToday()`, `nextHoliday()`, `isCutiBersama()`.
3. `ui/holiday-banner.tsx` — themeable banner ("Selamat Hari Raya Idul Fitri. Pengiriman ditangguhkan hingga [date].").
4. Empty-state preset variant: "closed-holiday."
**Effort:** 6-8h.

### Finding #12 — No timezone primitives (WIB / WITA / WIT)
**Category:** Timezone
**Severity:** Medium
**Source:** Glossary `dash-domain-glossary.md:372` lists "Time: `14:30 WIB`" as voice convention. `proof-image-viewer.tsx:645` comment says "dd MMM yyyy HH:mm WIB-style" but the code just calls `id-ID` — no actual WIB enforcement. Backend uses `moment-timezone` + `geo-tz` (line 1375) but the FE has zero timezone primitives.
**Description:** Indonesia has 3 timezones: WIB (UTC+7, Java/Sumatera/Kalimantan-Barat-Tengah), WITA (UTC+8, Bali/NTT/NTB/Sulawesi/Kalimantan-Timur-Selatan-Utara), WIT (UTC+9, Maluku/Papua). Dash Ride in Surabaya = WIB. Dash Ride in Makassar = WITA. A Jakarta dispatcher reviewing a Makassar trip needs "08:00 WITA = 07:00 WIB" handled correctly. Today the DS prints raw `toLocaleString("id-ID")` which silently uses *user-browser-local* timezone — wrong for cross-region ops.
**Why shadcn doesn't address this:** US has 4 timezones; their components don't ship timezone widgets either. But Dash's mitra-tracker / dispatcher boards need it.
**Why Dash MUST address it:** misreading WITA-as-WIB is a 1-hour dispatch error.
**Fix:**
1. `lib/intl.ts` add `formatJakartaTime(iso, opts)`, `formatIndonesianTime(iso, tz: "WIB"|"WITA"|"WIT")`.
2. `ui/timezone-badge.tsx` — small WIB/WITA/WIT badge component for timestamp cells.
3. Wire `proof-image-viewer.tsx`, `multi-stage-approval.tsx`, `audit-history-table.tsx` to render the badge.
**Effort:** 4-6h.

### Finding #13 — No syariah / halal indicator pattern (defer — narrow)
**Category:** Cultural / religious
**Severity:** Low
**Source:** Zero matches in registry for "halal", "syariah", "sertifikat MUI".
**Description:** Dash Marketplace will eventually surface food/restaurant listings (Kopi Kenangan, Chagee, Jiwa+ are existing partners per memory `project_dash_company.md`). Halal certification is a real consumer signal in Indonesia (~87% Muslim population, BPJPH halal certification mandatory for food/beverage by 2024). No DS `<HalalBadge sertifikatId="..." />`, no "Halal · MUI 0001-2025" pattern.
**Why shadcn doesn't address this:** halal certification is exclusively Indonesian/Malaysian/Brunei concern.
**Why Dash MUST address it (eventually):** Marketplace listings without halal indicators = lower conversion.
**Fix:** Defer until Marketplace ships food vertical. Then add `<CertificationBadge type="halal-mui" id="0001-2025" />`. Optional companion `<CertificationBadge type="bpom" />` (food safety), `<CertificationBadge type="sni" />` (national standard).
**Effort:** 3-4h when needed.

### Finding #14 — Banned-library list doesn't include Indonesian-specific gotchas
**Category:** Library hygiene
**Severity:** Low (drift prevention)
**Source:** `cardinal-rules.md` CR-3 lists banned categories (RHF, zod, TanStack Query, MUI, antd). Doesn't address: `moment` (use `moment-timezone` only on BE, `date-fns` on FE), `numeral` (replace with shared `formatIDR`), `libphonenumber-js` (heavy ~80kB; can do +62 normalisation in <50 LOC).
**Description:** Devs new to Indonesian context will reach for libphonenumber-js for the `+62` parser. It works but the DS shipped its own `lib/phone.ts` (per Finding #4) is leaner. Without an explicit ban, drift will land.
**Why shadcn doesn't address this:** shadcn doesn't opinion on phone libs.
**Why Dash MUST address it:** prevent 80kB add for what should be 50 LOC.
**Fix:** Add to CR-3 table — "Phone / locale" row: ban libphonenumber-js + moment + numeral. Add replacements.
**Effort:** 30 min.

### Finding #15 — 1×24 jam / 2×24 jam SLA language has no canonical microcopy pattern
**Category:** Voice / SLA UX
**Severity:** Low
**Source:** `mitra-dispute-flow.tsx:550` — "Tim kami akan menindaklanjuti dalam 1×24 jam." This phrasing is **Indonesian-specific** (not "within 24 hours" — the `N×24 jam` construction is canonical in Indonesian regulatory + customer-service writing). No registry-wide microcopy bank for SLA expressions.
**Description:** Devs will translate Western "within 24 hours" → "dalam 24 jam" which reads stilted. Native pattern is "1×24 jam" / "2×24 jam" / "3×24 jam" / "1×7 hari kerja." Without a shared microcopy snippet bank, this drifts.
**Why shadcn doesn't address this:** English SLA = "within N hours." Indonesian SLA = N×24 jam. shadcn will never document this.
**Why Dash MUST address it:** consistency in legal/dispute language matters.
**Fix:** Add to `foundation/voice/voice-rules.md` a "Canonical SLA microcopy" section: "1×24 jam (=24 jam kerja)", "2×24 jam non-libur", "1×7 hari kerja", "selambat-lambatnya [date]". Link 4-6 production blocks (mitra-dispute, payout-delay, refund-process, dispute-escalation).
**Effort:** 1-2h.

---

## What shadcn Will NEVER Address (Permanent Dash Edge)

These are gaps shadcn cannot fix without abandoning their global-neutral positioning. Each is a permanent moat for Dash.

1. **Indonesian regulatory hooks** — UU PDP consent/erasure, OJK fintech screens, BI-SNAP payment-rail wiring, BPJPH halal badges, MUI/BPOM/SNI certification surfaces. shadcn will never ship `pdp-consent-card.tsx`.
2. **eKYC document patterns** — KTP / SIM / STNK / NPWP structured uploads with OCR-field shapes specific to Indonesian government documents.
3. **Indonesian payment-rail iconography** — BCA / Mandiri / BNI / BRI / Permata / CIMB Niaga / GoPay / OVO / DANA / ShopeePay / LinkAja / Jenius / Bank Jago / Allo / SeaBank / QRIS / Bukalapak BukaDompet. shadcn ships Visa/MC/AmEx only.
4. **Mitra voice formality system** — Layer-0 "Anda" + Layer-1 informal kamu + rejection criteria for AI-slop "Hai!". shadcn has no voice register at all.
5. **Hari raya / cuti bersama scheduling** — Idul Fitri H-7/H/H+7 surge banners, Natal closure, cuti bersama auto-pause. shadcn ships zero holiday primitives.
6. **WIB/WITA/WIT triple-timezone primitives** — domestic Indonesian timezone handling at cross-region ops level.
7. **IDR cents-vs-rupiah convention enforcement** — Indonesian-specific because rupiah's high nominal value (1 USD = ~16,000 IDR) drives the cents storage decision uniquely. USD apps would never face this.
8. **N×24 jam SLA microcopy** + Indonesian regulatory phrasing ("selambat-lambatnya", "selama-lamanya 3×24 jam", "hari kerja vs hari kalender").
9. **Indonesian phone normalisation** — `+62` / `62` / `0` / `812...` four-variant parsing.
10. **Mitra-app offline-first patterns** — designed for motor-riding mitra in 2G/3G dead zones, not desk SaaS.

shadcn could *theoretically* expose extension points for these (via registry namespace), but they will never ship the implementations. **Dash is the implementation.**

---

## What Dash Already Does (acknowledge)

Don't let the gaps overshadow what's good. Dash DS *does* take Indonesian context seriously in several places already:

1. **Eight blocks use `Intl.NumberFormat("id-ID")` correctly** — `transactions-table`, `orders-table`, `my-cards-stack`, `products-grid`, `mitra-dispute-flow`, `package-tracking-timeline`, `payment-receipt-edit`, `price-with-discount`. The convention is right; only the DRY is wrong.
2. **Voice rules locked at Layer 0** — `voice-rules.md` with formal "Anda" default + Layer-1 override policy is a real differentiator vs shadcn's zero stance.
3. **Audit-trail cardinal rule (CR-2)** maps to PDP partial-compliance even if PDP isn't named — original + edited + editor + reason in same transaction = the right architecture.
4. **WhatsApp Business integration as canonical** — `settings-integrations.tsx:33` treats WA as first-class. Western DSs don't; Indonesia runs on WA.
5. **`tel:` link convention** in `package-tracking-timeline.tsx:495` — mobile dial is the right default for Indonesian last-mile delivery.
6. **mitra-dispute-flow with formal voice + 1×24 jam phrasing** — `mitra-dispute-flow.tsx:550` is structurally correct Indonesian SLA microcopy.
7. **`asia-southeast2` (Jakarta) infrastructure default** — `dash-ai-rules.md:610` enforces this, no US-region drift.
8. **payment-receipt-edit cents-storage discipline** — `payment-receipt-edit.tsx:53-56` explicitly handles IDR cents (×100) to avoid float drift on large rupiah amounts. This is the right call.
9. **Driver-app voice override precedent** (2026-05-11 formal-functional) is documented in baseline-drift — institutional memory of why "kamu" was rejected for that flow.
10. **Layered architecture with theme-per-product** — Ride (green), Logistic (orange), Travel (blue), Marketplace (yellow) — already maps to Dash business lines, ready for Trellis multi-tenant.

The DS isn't ignorant of Indonesia. It's just inconsistently aware.

---

## Pre-Wave 5 Pilot Critical Adds

The pilot in Wave 5 will compare DS output to existing Dash production. Three fixes BEFORE Wave 5 prevent embarrassment:

1. **Re-author `finance-localization-settings.tsx`** with Indonesian defaults (Finding #2). 1-2h. Single highest-leverage fix.
2. **Add `lib/intl.ts` + migrate 8 IDR formatters** (Finding #1). 3-4h. Pilots will immediately complain about inconsistency.
3. **Add `ui/phone-input.tsx` + `lib/phone.ts`** (Finding #4). 4-6h. Three signup blocks use raw `<Input type="tel">` today.

**Total pre-pilot critical: 8-12 hours.** Everything else is post-pilot or Trellis-future.

---

## SEA Expansion Considerations (Trellis future)

Trellis sells multi-tenant SaaS to non-Dash customers. Today the "Dash-ness" is baked into Layer 0. SEA expansion needs:

### Phase 1 — Foundation neutrality (before first non-ID tenant)

- Layer-0 intl tokens (currency code, symbol, position, locale, date format, week start). See Finding #9.
- `lib/intl.ts` reads tokens, doesn't hard-code "id-ID".
- Voice rules become **per-locale** — `voice-rules.id.md`, `voice-rules.en.md`, `voice-rules.vi.md`, `voice-rules.th.md` — with each locale defining its own formality register equivalent to "Anda."

### Phase 2 — Per-country adaptation (per tenant onboarding)

- VN tenant: VND currency (no cents, comma decimal), Vietnamese voice (anh/chị formal, bạn casual), VND-suffix render ("1.000.000 ₫"), Vietnam holiday calendar (Tết, Reunification Day).
- TH tenant: THB currency, Thai voice (ครับ/ค่ะ formality), Buddhist year option (+543 toggle), Songkran/Vesak holidays.
- PH tenant: PHP currency, English-primary + Filipino fallback (po/opo politeness particles), Catholic holidays.
- Each tenant gets `themes/trellis-<tenant>/intl.json` declaring overrides.

### Phase 3 — Indonesian-specific lift-out

- Move KTP/SIM/STNK/NPWP/halal/PDP/OJK/BI-SNAP patterns from Layer 1 / blocks down into a **`country-pack-id/`** Layer (between Layer 0 and Layer 1).
- Non-Indonesian tenants don't pull country-pack-id; they pull country-pack-vn or country-pack-th.
- Layer-0 foundation stays globally neutral.

This is a 3-6 month refactor and should NOT happen pre-Wave-5. But Phase 1 (intl tokens) should land in Q3 2026 once pilot stabilises.

### What NOT to copy from regional players

- **Gojek's internal DS** ("Asphalt"): excellent tokens, but tightly coupled to Gojek brand identity. Don't copy their accent palette.
- **Tokopedia DS**: heavy commerce focus, won't generalise.
- **GrabUI**: pan-SEA but Singapore-led — voice register skews English-default. Don't inherit that bias.
- **Bukalapak**: declining; not a model.
- **Bank Mandiri Livin / BCA**: useful for fintech compliance patterns (esp. OJK-mandated screens) but visually conservative. Mine for compliance flow ideas, not aesthetics.

---

## Open Questions for User

1. **PDP enforcement priority**: should PDP cardinal rule + 2 blocks (consent-card, data-request-flow) be a pre-Wave-5 must-have, or post-pilot? My recommendation: **pre-pilot if Auto Suspend Mitra is part of Wave 5** (suspension touches PDP-erasure semantics), otherwise can defer.

2. **Trellis first non-Indonesian tenant timeline**: if there's already a Vietnamese / Thai pipeline lead in sales conversation, the Layer-0 intl-tokens work needs to start now (16-24h). If first non-ID tenant is >6 months away, defer to Q3 2026. What's the actual horizon?

3. **eKYC vendor confirmation (Verihubs?)** — `CLAUDE.md` lists this as open. If confirmed, the `ktp-upload` / `sim-upload` / `stnk-upload` blocks can ship with Verihubs response-shape adapters baked in. If undecided, ship vendor-agnostic blocks with a documented adapter interface — slightly more work, but no rework when vendor is picked.

---

## Methodology / Confidence

- Files read in full: `cardinal-rules.md`, `voice-rules.md`, `payment-receipt-edit.tsx` (220 LOC of 800+), `surge-multiplier-card.tsx` (80 LOC), `driver-assignment-board.tsx` (120 LOC), `finance-localization-settings.tsx` (85 LOC), `price-with-discount.tsx` (88 LOC), `date-picker.tsx` (80 LOC), `trellis-tenant/README.md`, `themes/manifest.json`, `use-mobile.ts`, plus excerpts of `dash-ai-rules.md` (rows 386-444 + 550-612) and `dash-domain-glossary.md` (targeted hits).
- Files surveyed by grep: full `registry/dash/` (180+ tsx files).
- Memory-context cross-checks: 60+ memory items reviewed for relevant Indonesian/Dash decisions.
- **High-confidence findings:** #1, #2, #4, #6, #7, #8, #10, #12, #15 — directly file:line verified.
- **Medium-confidence findings:** #3 (PDP), #5 (eKYC), #9 (Trellis), #11 (hari raya), #13 (halal), #14 (banned libs) — based on absence-of-evidence in registry + domain knowledge of Indonesian regulatory landscape (cutoff Jan 2026).
- **Not verified:** actual Verihubs integration shape, OJK current enforcement rigor, real-world Dash production code in the production repos (READ-ONLY per CLAUDE.md, not browsed in this review).

If any of the regulatory-confidence findings (#3, #5) are wrong because Dash already has those patterns elsewhere (e.g., in a memory-held vault PRD not in the DS repo), surface them and I'll downgrade. The point of the review is to find absence; presence elsewhere is a happy correction.

---

> *"Indonesian context is present but not architected."* — One-line summary if you only read one sentence.
