# Dash Build QA and Review Contract

QA is not optional polish. It is how Dash Build proves the generated output did
what the PRD promised.

## Review Before QA

Run review before browser QA so obvious code issues do not waste browser time.

Review checks:

- scope drift against PRD/TRD
- banned imports
- raw token/hex violations
- theme mismatch
- missing loading/empty/error states
- missing tests
- risky data mutation without audit trail
- docs drift

## Browser QA

For UI work, verify:

- route/page opens
- primary action works
- loading state is visible when applicable
- empty state is meaningful
- error state is recoverable
- desktop/tablet/mobile layout does not overlap
- keyboard focus is visible
- text fits containers

## API / Data QA

For data-heavy work, verify:

- API call shape matches TRD
- empty data and partial data render cleanly
- stale/error responses do not break layout
- filters/search/pagination preserve state
- derived metrics are not persisted unless TRD says so

## Output Format

```md
# QA Result — {feature}

Status: pass | fail | blocked

## What Was Tested

## Evidence

## Findings

## Fixes Applied

## Remaining Risk
```

## Local Pilot Rule

If GitHub App is not connected, QA can still pass for local preview. Mark ship
status as `local-only`; do not pretend a PR was opened.

