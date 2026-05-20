#!/usr/bin/env node
/**
 * Hermes worker CLI entry. Three modes:
 *
 *   dash-worker run                — one-shot, process pending gaps, exit
 *   dash-worker watch              — daemon, poll every config.pollIntervalMs
 *   dash-worker generate <gap-id>  — manual trigger for a specific gap
 *
 * Flags:
 *   --dry-run     stub Anthropic + GitHub + Slack (smoke testing)
 *   --queue=PATH  override gap queue path (default ~/.dash/gap-queue.json)
 *   --json        emit JSON outcome summary on stdout (run / generate)
 *
 * Exit codes:
 *   0   success (all processed, none crashed)
 *   1   at least one gap failed
 *   2   bad CLI usage
 *
 * Real Anthropic client wiring is intentionally lazy — we only import the SDK
 * when the user has set ANTHROPIC_API_KEY AND is not in dry-run. This keeps
 * `dash-worker --dry-run run` working without the dep installed.
 */
import process from "node:process"
import { loadConfig } from "./config.js"
import {
  processGapById,
  runOnce,
  runWatch,
} from "./pipeline.js"
import type { GeneratorDeps } from "./generator.js"
import type { PipelineOutcome } from "./types.js"

type ParsedArgs = {
  mode: "run" | "watch" | "generate" | "help"
  gapId: string | null
  dryRun: boolean
  json: boolean
  queuePath: string | null
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2)
  let mode: ParsedArgs["mode"] = "help"
  let gapId: string | null = null
  let dryRun = false
  let json = false
  let queuePath: string | null = null

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === "--dry-run") dryRun = true
    else if (a === "--json") json = true
    else if (a === "--help" || a === "-h") mode = "help"
    else if (a.startsWith("--queue=")) queuePath = a.slice("--queue=".length)
    else if (a === "--queue") {
      queuePath = args[i + 1] ?? null
      i++
    } else if (a === "run" && mode === "help") mode = "run"
    else if (a === "watch" && mode === "help") mode = "watch"
    else if (a === "generate" && mode === "help") {
      mode = "generate"
      gapId = args[i + 1] ?? null
      i++
    }
  }
  return { mode, gapId, dryRun, json, queuePath }
}

function printHelp(): void {
  console.log(`dash-worker — Hermes gap-to-vendored agent

Usage:
  dash-worker run                   one-shot: process pending gaps
  dash-worker watch                 daemon: poll the gap queue
  dash-worker generate <gap-id>     process a single gap by id

Flags:
  --dry-run      stub Anthropic + GitHub + Slack
  --queue=PATH   override gap queue path
  --json         JSON summary on stdout
  -h, --help     show this help

Env:
  ANTHROPIC_API_KEY (required unless --dry-run)
  GITHUB_TOKEN
  GITHUB_REPO        default: irfanputra-design/dash
  SLACK_WEBHOOK_URL
  MIN_SCORE_AUTO_MERGE  default: 85
  MIN_SCORE_REVIEW       default: 60
  POLL_INTERVAL_MS       default: 60000
`)
}

/**
 * Build generator deps lazily. In dry-run we don't import the SDK at all,
 * which lets the package run on hosts that didn't `pnpm install` the SDK
 * (e.g. CI smoke tests).
 */
async function buildGeneratorDeps(dryRun: boolean): Promise<GeneratorDeps> {
  if (dryRun) return {}
  // Lazy import — keeps dry-run path free of the SDK requirement.
  try {
    const sdkModule = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => unknown
    }
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return {}
    const Ctor = sdkModule.default
    const client = new Ctor({ apiKey }) as GeneratorDeps["client"]
    // Skill loader: lazy import so the worker still runs in repos without
    // `@dash/skill` installed (it still gets a usable, empty system prompt).
    let skill: GeneratorDeps["skill"]
    try {
      const skillMod = (await import("@dash/skill")) as {
        loadDashSkill?: GeneratorDeps["skill"]
      }
      skill = skillMod.loadDashSkill ?? undefined
    } catch {
      skill = undefined
    }
    return { client, skill }
  } catch {
    return {}
  }
}

function summariseOutcomes(outcomes: PipelineOutcome[]): {
  vendored: number
  needsReview: number
  failed: number
  skipped: number
} {
  let vendored = 0
  let needsReview = 0
  let failed = 0
  let skipped = 0
  for (const o of outcomes) {
    if (o.kind === "vendored") vendored++
    else if (o.kind === "needs-review") needsReview++
    else if (o.kind === "failed") failed++
    else skipped++
  }
  return { vendored, needsReview, failed, skipped }
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv)
  if (args.mode === "help") {
    printHelp()
    return 0
  }

  const config = loadConfig({ dryRun: args.dryRun })

  if (!args.dryRun && !config.anthropicApiKey) {
    console.error(
      "ANTHROPIC_API_KEY missing — set it in env or pass --dry-run.",
    )
    return 2
  }

  const generator = await buildGeneratorDeps(args.dryRun)
  const queuePath = args.queuePath ?? undefined

  if (args.mode === "run") {
    const outcomes = await runOnce(config, { generator, queuePath })
    const summary = summariseOutcomes(outcomes)
    if (args.json) {
      process.stdout.write(JSON.stringify({ summary, outcomes }, null, 2) + "\n")
    } else {
      console.log(
        `[hermes] done — vendored=${summary.vendored} needs-review=${summary.needsReview} failed=${summary.failed} skipped=${summary.skipped}`,
      )
    }
    return summary.failed > 0 ? 1 : 0
  }

  if (args.mode === "watch") {
    const ctrl = new AbortController()
    const onSig = () => ctrl.abort()
    process.on("SIGINT", onSig)
    process.on("SIGTERM", onSig)
    await runWatch(config, { generator, queuePath, signal: ctrl.signal })
    return 0
  }

  if (args.mode === "generate") {
    if (!args.gapId) {
      console.error("dash-worker generate <gap-id> — id missing")
      return 2
    }
    const outcome = await processGapById(args.gapId, config, {
      generator,
      queuePath,
    })
    if (!outcome) {
      console.error(`gap not found: ${args.gapId}`)
      return 1
    }
    if (args.json) {
      process.stdout.write(JSON.stringify({ outcome }, null, 2) + "\n")
    } else {
      console.log(`[hermes] gap ${args.gapId} → ${outcome.kind}`)
    }
    return outcome.kind === "failed" ? 1 : 0
  }

  printHelp()
  return 2
}

// Auto-run when invoked as a CLI. Vitest imports this file only via deep
// modules, so the entry guard prevents the daemon from starting in tests.
const isCli = process.argv[1] && /dash-worker|index\.(?:m?[jt]s|cjs)$/.test(process.argv[1])
if (isCli) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.error("[hermes] fatal", err)
      process.exit(1)
    },
  )
}

export { main, parseArgs, buildGeneratorDeps, summariseOutcomes }
