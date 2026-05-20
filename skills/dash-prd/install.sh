#!/usr/bin/env bash
# install.sh — Install the dash-prd skill into Claude Code by symlinking from the
# vendored location in dash-ds into ~/.claude/skills/.
#
# Idempotent: re-running replaces an existing symlink (or refuses to clobber a
# real directory at the target — manual intervention required in that case).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="dash-prd"
SKILLS_DIR="${HOME}/.claude/skills"
TARGET="${SKILLS_DIR}/${SKILL_NAME}"

mkdir -p "${SKILLS_DIR}"

if [[ -L "${TARGET}" ]]; then
  echo "[dash-prd] Existing symlink at ${TARGET} — replacing."
  rm "${TARGET}"
elif [[ -e "${TARGET}" ]]; then
  echo "[dash-prd] ERROR: ${TARGET} exists and is not a symlink." >&2
  echo "[dash-prd]        Remove or rename it manually, then re-run this script." >&2
  exit 1
fi

ln -s "${SCRIPT_DIR}" "${TARGET}"

echo "[dash-prd] Installed symlink:"
echo "           ${TARGET} -> ${SCRIPT_DIR}"
echo ""
echo "[dash-prd] Restart Claude Code to activate the skill."
echo "[dash-prd] Then trigger with: \"I want a PRD for [feature]\""
