<!--
  PR title must follow Conventional Commits, e.g.:
    feat(button): add destructive variant
    fix(cli): handle missing registry token gracefully
    docs: clarify Wave 5 onboarding flow
-->

## Summary

<!-- 1-3 sentences. What changed and why. -->

## Type of change

- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] docs — documentation only
- [ ] refactor — code change without behavior change
- [ ] perf — performance improvement
- [ ] test — adding/refactoring tests
- [ ] chore — tooling, deps, build
- [ ] breaking — backward-incompatible change

## Pre-merge checklist

- [ ] `pnpm -r typecheck` passes locally
- [ ] `pnpm -r test` passes locally
- [ ] `pnpm registry:build` produces no uncommitted diff
- [ ] `dashkit audit` passes (if registry or component touched)
- [ ] CHANGELOG.md updated (if user-facing change)
- [ ] Conventional Commits title (`feat:`, `fix:`, `docs:`, ...)
- [ ] Breaking changes flagged with `!` and described in BREAKING CHANGE footer
- [ ] Screenshots attached (if UI change)

## Screenshots / recordings

<!-- Drag images or videos here if UI is affected. -->

## Notes for reviewer

<!-- Anything special: feature flags, follow-ups, risky areas, manual test steps. -->

## Related

<!-- Closes #X, refs #Y, links to Notion/Slack threads. -->
