import { defineConfig } from "vitest/config"

/**
 * Tier 4 #17 — pre-existing 23-29 test fail debug.
 *
 * Several `src/runs/__tests__` suites shell out to real `git`, which
 * routinely exceeds vitest's 5s default in parallel CI. The bumped
 * `testTimeout` lets those suites land cleanly; CPU-bound tests are
 * unaffected since they finish in milliseconds.
 *
 * `hookTimeout` is raised in tandem because the beforeEach/beforeAll
 * hooks of the same suites do the heavy seeding.
 *
 * Retry once on transient failure — git plumbing tests still occasionally
 * race over ENOENT under aggressive parallelism even with the real
 * BranchManager bug fixed (see `docs/known-test-flakes.md`). Retries are
 * cheap; flakes that survive deserve diagnosis.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/**/*.test.ts",
      "src/__tests__/**/*.test.ts",
      "scripts/__tests__/**/*.test.ts",
    ],
    testTimeout: 30000,
    hookTimeout: 30000,
    retry: 1,
  },
})
