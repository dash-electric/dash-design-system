#!/usr/bin/env bash
#
# first-run-test.sh — boot Dash Build as a TRUE first-time user.
#
# Why: the dev box has accumulated 2200+ historical runs + a state.json under
# ~/.dash-build. A real "open it for the first time" test must NOT show that
# clutter. This script ARCHIVES (never deletes) the existing state into a
# timestamped backup, then boots a clean daemon pointed at the local Work/dash
# checkouts so clone+baseline works without GitHub.
#
# Usage:
#   bash scripts/first-run-test.sh            # archive + boot fresh
#   bash scripts/first-run-test.sh --restore  # put the archived state back
#
# Codex auth: do `codex login --device-auth` in another terminal BEFORE
# prompting. The daemon detects it automatically (no key needed).
#
set -euo pipefail

DASH_HOME="${HOME}/.dash-build"
STAMP="$(date +%Y%m%d-%H%M%S 2>/dev/null || echo manual)"
ARCHIVE="${DASH_HOME}-archive-${STAMP}"
PORT="${DASH_BUILD_PORT:-7777}"

# Point clone + intake at the real local checkouts (no ~/Dash, no GitHub).
export DASH_BUILD_WORK_ROOT="${DASH_BUILD_WORK_ROOT:-${HOME}/Work/dash}"
# Clone the baseline from the LOCAL checkout (filesystem clone), not the
# GitHub remote — the local daemon has no GitHub credentials, and the remote
# clone is what silently failed before. Fast + offline.
export DASH_BUILD_CLONE_FROM_LOCAL="${DASH_BUILD_CLONE_FROM_LOCAL:-1}"
# Generous cold-compile budget for the heavy backoffice first boot.
export DASH_BUILD_DEV_SERVER_TIMEOUT_MS="${DASH_BUILD_DEV_SERVER_TIMEOUT_MS:-420000}"

restore() {
  local latest
  latest="$(ls -dt "${HOME}"/.dash-build-archive-* 2>/dev/null | head -1 || true)"
  if [ -z "${latest}" ]; then
    echo "No archive found to restore."
    exit 1
  fi
  if [ -e "${DASH_HOME}" ]; then
    mv "${DASH_HOME}" "${DASH_HOME}-discarded-${STAMP}"
  fi
  mv "${latest}" "${DASH_HOME}"
  echo "Restored ${latest} → ${DASH_HOME}"
  exit 0
}

if [ "${1:-}" = "--restore" ]; then
  restore
fi

echo "── Dash Build first-run test ─────────────────────────────"
if [ -e "${DASH_HOME}" ]; then
  echo "Archiving existing state:"
  echo "  ${DASH_HOME} → ${ARCHIVE}"
  mv "${DASH_HOME}" "${ARCHIVE}"
else
  echo "No existing ~/.dash-build — already a clean slate."
fi
mkdir -p "${DASH_HOME}"

echo "WORK_ROOT     = ${DASH_BUILD_WORK_ROOT}"
echo "PORT          = ${PORT}"
echo "DEV timeout   = ${DASH_BUILD_DEV_SERVER_TIMEOUT_MS} ms"
echo "Codex auth    = run 'codex login --device-auth' if not already logged in"
echo "Restore later = bash scripts/first-run-test.sh --restore"
echo "──────────────────────────────────────────────────────────"
echo "Booting clean daemon → http://127.0.0.1:${PORT}"
echo

DASH_BUILD_PORT="${PORT}" exec node dist/daemon.js
