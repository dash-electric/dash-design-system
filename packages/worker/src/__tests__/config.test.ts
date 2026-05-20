import { describe, it, expect } from "vitest"
import { loadConfig } from "../config.js"

describe("loadConfig", () => {
  it("uses defaults when env is empty", () => {
    const cfg = loadConfig({ env: {} })
    expect(cfg.anthropicApiKey).toBeNull()
    expect(cfg.githubToken).toBeNull()
    expect(cfg.githubRepo).toBe("irfanputra-design/dash")
    expect(cfg.minScoreAutoMerge).toBe(85)
    expect(cfg.minScoreReview).toBe(60)
    expect(cfg.pollIntervalMs).toBe(60000)
    expect(cfg.anthropicModel).toBe("claude-opus-4-7")
    expect(cfg.dryRun).toBe(false)
  })

  it("env overrides defaults", () => {
    const cfg = loadConfig({
      env: {
        ANTHROPIC_API_KEY: "sk-x",
        GITHUB_TOKEN: "ghp-x",
        GITHUB_REPO: "myorg/myrepo",
        SLACK_WEBHOOK_URL: "https://hooks.slack.com/abc",
        MIN_SCORE_AUTO_MERGE: "90",
        MIN_SCORE_REVIEW: "70",
        POLL_INTERVAL_MS: "30000",
        ANTHROPIC_MODEL: "claude-sonnet-4-5",
      },
    })
    expect(cfg.anthropicApiKey).toBe("sk-x")
    expect(cfg.githubRepo).toBe("myorg/myrepo")
    expect(cfg.minScoreAutoMerge).toBe(90)
    expect(cfg.minScoreReview).toBe(70)
    expect(cfg.pollIntervalMs).toBe(30000)
    expect(cfg.anthropicModel).toBe("claude-sonnet-4-5")
  })

  it("falls back to default when integer env is malformed", () => {
    const cfg = loadConfig({ env: { MIN_SCORE_AUTO_MERGE: "abc" } })
    expect(cfg.minScoreAutoMerge).toBe(85)
  })

  it("dryRun flag overrides env-based wiring", () => {
    const cfg = loadConfig({ env: { ANTHROPIC_API_KEY: "sk-x" }, dryRun: true })
    expect(cfg.dryRun).toBe(true)
    expect(cfg.anthropicApiKey).toBe("sk-x")
  })
})
