---
name: dash-design-system
description: Use this skill when working in any repository that has @dash registry configured. Activates on session start to inject Dash Design System context, project state (installed components, framework, aliases), and Dash domain conventions into the AI's working memory.
---

# Dash Design System Skill

## Activation criteria

This skill auto-activates when CWD contains:
1. `components.json` with `registries.@dash` URL, OR
2. `.dash` directory marker, OR
3. Explicit invocation via `/dash-skill`

## On activation, the skill:

1. Runs `dashkit info --json` to capture repo state
2. Fetches latest `dash-ai-rules.md` from configured registry (cached 5min)
3. Loads Dash domain glossary
4. Injects into AI context

## What AI should do after activation:

- Before generating any UI, query Dash MCP `search_components` for matching primitives
- Use installed @dash items from `dashkit info` output — don't redundantly install
- Apply refactor protocol (read → plan → confirm → write → diff → tsc) for any modification to existing code
- Apply auto-inference protocol when prompts are short/ambiguous
- Refuse anti-patterns (hardcoded hex, custom Modal from scratch, raw table for grids) — redirect to @dash equivalent
- Respect domain glossary terms (delivery, mitra, use-code, dispatch, outlet, driver)

## Reference

- Full rules: <registry>/r/dash-ai-rules.json
- Pattern blocks: https://ds.dash.com/docs/patterns
- Component catalog: https://ds.dash.com/docs/components
