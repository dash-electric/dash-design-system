# Voice overrides — `marketplace`

Deltas only. Base voice = Layer 0.

## Deltas

- **Benefit-first copy:** lead with what the buyer/seller gets, not the
  feature ("Hemat Rp 25.000 dengan promo cashback" not "Cashback Rp 25.000
  tersedia").
- **Price-prominent layout language:** strikethrough for original price,
  emphasized for discounted. Both follow tabular-nums.
- **Promo labels:** "Promo", "Diskon", "Cashback" — Indonesian native, NOT
  English "Sale", "Off", "Deal".

## Anti-patterns (do NOT use)

- Fake scarcity ("Tinggal 2 lagi!" without inventory truth).
- Countdown timers without genuine deadline.
- Manipulative urgency ("Jangan lewatkan!").

## Preserved

- Formal "Anda" for merchant console. Buyer-facing storefront MAY use "kamu"
  IF product owner explicitly opts in (this is a deviation from CLAUDE.md
  rule #5 limited to consumer-facing surfaces; ask first).
- No emoji in production UI strings.
