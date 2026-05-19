#!/usr/bin/env bash
# scripts/smoke.sh — Post-deploy smoke test for ds.dash.com
#
# Usage:
#   bash scripts/smoke.sh https://ds.dash.com "$DASH_REGISTRY_TOKEN"
#   bash scripts/smoke.sh http://localhost:3000 "$DASH_REGISTRY_TOKEN"
#
# Exits 0 if all critical probes pass, 1 otherwise.
#
# Categories:
#   1. PUBLIC  — must return 200 without auth
#   2. GATED   — must return 401 without token, 200 with token
#   3. SHOULD  — non-blocking checks (warn but don't fail)
#
# Does NOT enumerate all 178 registry items — picks a representative
# slice (atoms, composites, blocks, templates, theme, rules).

set -u

BASE="${1:-http://localhost:3000}"
TOKEN="${2:-}"

if [[ -z "$BASE" ]]; then
  echo "usage: bash scripts/smoke.sh <base-url> [token]" >&2
  exit 2
fi

GREEN=$'\033[0;32m'
RED=$'\033[0;31m'
YELLOW=$'\033[0;33m'
RESET=$'\033[0m'

fail_count=0
warn_count=0
pass_count=0

probe() {
  local label="$1" expected="$2" url="$3" auth="${4:-}"
  local code
  if [[ -n "$auth" ]]; then
    code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $auth" "$url")
  else
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  fi

  if [[ "$code" == "$expected" ]]; then
    printf "  ${GREEN}✓${RESET} %-45s %s\n" "$label" "$code"
    pass_count=$((pass_count + 1))
  else
    printf "  ${RED}✗${RESET} %-45s expected=%s got=%s\n" "$label" "$expected" "$code"
    fail_count=$((fail_count + 1))
  fi
}

warn() {
  local label="$1" expected="$2" url="$3"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [[ "$code" == "$expected" ]]; then
    printf "  ${GREEN}✓${RESET} %-45s %s\n" "$label" "$code"
    pass_count=$((pass_count + 1))
  else
    printf "  ${YELLOW}⚠${RESET} %-45s expected=%s got=%s (non-blocking)\n" "$label" "$expected" "$code"
    warn_count=$((warn_count + 1))
  fi
}

echo
echo "Dash DS smoke — $BASE"
echo "=================================================================="

# ─── 1. PUBLIC routes (must work without token) ───────────────────────
echo
echo "PUBLIC:"
probe "health"        200 "$BASE/api/health"
probe "landing"       200 "$BASE/"
probe "docs index"    200 "$BASE/docs"
probe "installation"  200 "$BASE/docs/installation"
probe "theming"       200 "$BASE/docs/theming"
probe "components"    200 "$BASE/docs/components"

# Component pages — sample slice
probe "button page"   200 "$BASE/docs/components/button"
probe "modal page"    200 "$BASE/docs/components/modal"
probe "data-table"    200 "$BASE/docs/components/data-table"
probe "form page"     200 "$BASE/docs/components/form"

# Blocks + templates
probe "blocks index"  200 "$BASE/docs/blocks"
probe "templates idx" 200 "$BASE/docs/templates"

# ─── 2. GATED routes (Bearer required in production) ──────────────────
echo
echo "GATED:"

# Without token — production must 401, dev bypasses to 200.
without_token_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/r/button.json")
if [[ "$without_token_code" == "401" ]]; then
  printf "  ${GREEN}✓${RESET} %-45s 401 (gate working)\n" "no-auth → /r/button.json"
  pass_count=$((pass_count + 1))
elif [[ "$without_token_code" == "200" ]]; then
  printf "  ${YELLOW}⚠${RESET} %-45s 200 (dev bypass — OK for localhost)\n" "no-auth → /r/button.json"
  warn_count=$((warn_count + 1))
else
  printf "  ${RED}✗${RESET} %-45s expected 401 got=%s\n" "no-auth → /r/button.json" "$without_token_code"
  fail_count=$((fail_count + 1))
fi

# With token — must succeed
if [[ -n "$TOKEN" ]]; then
  probe "with-auth → /r/button.json"   200 "$BASE/r/button.json"          "$TOKEN"
  probe "with-auth → /r/modal.json"    200 "$BASE/r/modal.json"           "$TOKEN"
  probe "with-auth → /r/base-theme"    200 "$BASE/r/base-theme.json"      "$TOKEN"
  probe "with-auth → /r/login-01"      200 "$BASE/r/login-01.json"        "$TOKEN"
  probe "with-auth → /r/dashboard"     200 "$BASE/r/dashboard-shell.json" "$TOKEN"
  probe "API /api/registry/button"     200 "$BASE/api/registry/button"    "$TOKEN"
else
  printf "  ${YELLOW}⚠${RESET} skipping authed probes — no token passed\n"
fi

# ─── 3. SHOULD work but non-blocking ──────────────────────────────────
echo
echo "SHOULD:"
warn "favicon"        200 "$BASE/favicon.ico"
warn "registry index" 200 "$BASE/api/registry/index"
warn "dark-mode doc"  200 "$BASE/docs/foundations/dark-mode"
warn "cli doc"        200 "$BASE/docs/tools/cli"
warn "changelog"      200 "$BASE/docs/changelog"

# ─── Summary ───────────────────────────────────────────────────────────
echo
echo "=================================================================="
printf "  pass=%d  warn=%d  fail=%d\n" "$pass_count" "$warn_count" "$fail_count"
echo

if (( fail_count > 0 )); then
  echo "${RED}FAILED${RESET} — $fail_count critical probe(s) did not match expected status."
  exit 1
fi

if (( warn_count > 0 )); then
  echo "${YELLOW}OK (with warnings)${RESET} — non-blocking probes flagged. Review above."
  exit 0
fi

echo "${GREEN}OK${RESET} — all probes pass."
