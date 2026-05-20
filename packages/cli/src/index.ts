#!/usr/bin/env node
/**
 * Dash CLI entrypoint — commander wiring.
 */
import { Command } from "commander"
import kleur from "kleur"
import { VERSION } from "./version.js"
import { runInit } from "./commands/init.js"
import { runAdd } from "./commands/add.js"
import { runBuild } from "./commands/build.js"
import { runSearch } from "./commands/search.js"
import { runList } from "./commands/list.js"
import { runDiff } from "./commands/diff.js"
import { runMcpInit } from "./commands/mcp.js"
import { runLogin, runLogout } from "./commands/login.js"
import { runInfo } from "./commands/info.js"
import { runSync } from "./commands/sync.js"
import { runDoctor } from "./commands/doctor.js"
import { runAudit } from "./commands/audit.js"
import { runGapReport, runGapSync } from "./commands/gap.js"
import {
  runFeedbackLog,
  runFeedbackList,
  runFeedbackSync,
} from "./commands/feedback.js"
import {
  runSkillClear,
  runSkillRefresh,
  runSkillStatus,
} from "./commands/skill.js"
import { runMigrate } from "./commands/migrate.js"

const program = new Command()

program
  .name("dash")
  .description("Dash Design System CLI — install registry items into your project")
  .version(VERSION)

program
  .command("init")
  .description("Initialize Dash in your project (components.json, globals.css, base theme)")
  .option("--yes", "Skip prompts (use defaults)")
  .option("--token <token>", "Registry Bearer token (saved to .env.local)")
  .option("--framework <framework>", "next-app | next-pages | vite | remix | astro | cra | react")
  .option("--registry-url <url>", "Override registry URL")
  .option(
    "--theme <theme>",
    "Layer-2 tenant theme: ride | logistic | travel | marketplace | trellis-<id>",
  )
  .action(async (opts) => {
    await runInit({
      yes: opts.yes,
      token: opts.token,
      framework: opts.framework,
      registryUrl: opts.registryUrl,
      theme: opts.theme,
    })
  })

program
  .command("add <name...>")
  .description("Install one or more registry items (resolves deps recursively)")
  .option("--yes", "Skip overwrite prompts (skip existing files)")
  .option("--overwrite", "Force overwrite existing files")
  .option("--dry-run", "Print planned changes without applying")
  .option("--path <path>", "Override target directory")
  .option("--registry-url <url>", "Override registry URL")
  .option("--token <token>", "Bearer token (overrides env)")
  .option("--no-cache", "Bypass persistent disk cache (force fresh fetch)")
  .option("--theme <name>", "Layer-2 theme (ride | logistic | travel | marketplace | trellis-tenant)")
  .action(async (names: string[], opts) => {
    await runAdd({
      names,
      yes: opts.yes,
      overwrite: opts.overwrite,
      dryRun: opts.dryRun,
      path: opts.path,
      registryUrl: opts.registryUrl,
      token: opts.token,
      noCache: opts.cache === false,
      theme: opts.theme,
    })
  })

program
  .command("build")
  .description("Build registry from source (run inside Dash DS repo)")
  .option("--output <dir>", "Output directory", "public/r")
  .option("--registry <file>", "Path to registry.json", "registry.json")
  .action(async (opts) => {
    await runBuild({ output: opts.output, registry: opts.registry })
  })

program
  .command("search <query>")
  .description("Search registry items by name, title, description, or type")
  .option("--registry-url <url>", "Override registry URL")
  .option("--token <token>", "Bearer token")
  .option("--namespace <ns>", "Restrict to a single registry namespace (dash | trellis | logistic | …)")
  .action(async (query: string, opts) => {
    await runSearch({
      query,
      registryUrl: opts.registryUrl,
      token: opts.token,
      namespace: opts.namespace,
    })
  })

program
  .command("list")
  .description("List all available registry items")
  .option("--type <type>", "Filter by type: ui | theme | block | template | file")
  .option("--registry-url <url>", "Override registry URL")
  .option("--token <token>", "Bearer token")
  .option("--theme <name>", "Filter by Layer-2 theme (ride | logistic | …)")
  .option("--namespace <ns>", "Registry namespace to list (dash | trellis | logistic | …)")
  .action(async (opts) => {
    await runList({
      type: opts.type,
      registryUrl: opts.registryUrl,
      token: opts.token,
      theme: opts.theme,
      namespace: opts.namespace,
    })
  })

program
  .command("diff <name>")
  .description("Show diff between locally installed item and latest registry version")
  .option("--registry-url <url>", "Override registry URL")
  .option("--token <token>", "Bearer token")
  .action(async (name: string, opts) => {
    await runDiff({ name, registryUrl: opts.registryUrl, token: opts.token })
  })

program
  .command("info")
  .description("Print a snapshot of project state (framework, aliases, installed @dash items)")
  .option("--json", "Emit machine-readable JSON (for skill / tooling consumption)")
  .option("--cwd <path>", "Override working directory")
  .option("--registry <url>", "Override registry URL for installed-items resolution")
  .option("--token <token>", "Bearer token")
  .option("--theme <name>", "Override detected Layer-2 theme")
  .action(async (opts) => {
    await runInfo({
      json: opts.json,
      cwd: opts.cwd,
      registry: opts.registry,
      token: opts.token,
      theme: opts.theme,
    })
  })

program
  .command("sync [names...]")
  .description("Sync installed @dash items against latest registry versions")
  .option("--all", "Auto-update all drifted items without prompting")
  .option("--check", "Report drift only — do not install or prompt")
  .option("--auto-upgrade", "Only apply patch bumps (skip minor + major)")
  .option("--dry-run", "Preview changes without writing")
  .option("--json", "Emit machine-readable JSON (no prompts, no writes)")
  .option("--registry-url <url>", "Override registry URL")
  .option("--token <token>", "Bearer token")
  .option("--no-cache", "Bypass disk cache (force fresh fetch)")
  .option("--theme <name>", "Layer-2 theme to sync against (ride | logistic | …)")
  .action(async (names: string[], opts) => {
    await runSync({
      names: names?.length ? names : undefined,
      all: opts.all,
      check: opts.check,
      autoUpgrade: opts.autoUpgrade,
      dryRun: opts.dryRun,
      json: opts.json,
      registryUrl: opts.registryUrl,
      token: opts.token,
      noCache: opts.cache === false,
      theme: opts.theme,
    })
  })

program
  .command("login")
  .description("Save a Bearer token for a registry to ~/.dash/credentials.json")
  .option("--registry <url>", "Registry URL (defaults to components.json or DEFAULT_REGISTRY_URL)")
  .option("--token <token>", "Token (skips interactive prompt)")
  .action(async (opts) => {
    await runLogin({ registry: opts.registry, token: opts.token })
  })

program
  .command("logout")
  .description("Remove saved credentials for a registry")
  .option("--registry <url>", "Registry URL")
  .action(async (opts) => {
    await runLogout({ registry: opts.registry })
  })

const mcp = program.command("mcp").description("MCP server integration")
mcp
  .command("init")
  .description("Wire @dash/mcp-server into Claude Code and/or Cursor MCP configs")
  .option("--token <token>", "Bearer token (defaults to DASH_REGISTRY_TOKEN env)")
  .option("--registry-url <url>", "Override registry URL")
  .option("--config-path <path>", "Override editor config path (single-editor mode)")
  .option("--claude-code", "Target Claude Code only")
  .option("--cursor", "Target Cursor only")
  .option("--both", "Target both Claude Code and Cursor")
  .option("--check-only", "Detect editor installs without writing")
  .action(async (opts) => {
    const editors: Array<"claude-code" | "cursor"> = []
    if (opts.both) {
      editors.push("claude-code", "cursor")
    } else {
      if (opts.claudeCode) editors.push("claude-code")
      if (opts.cursor) editors.push("cursor")
    }
    await runMcpInit({
      token: opts.token,
      registryUrl: opts.registryUrl,
      configPath: opts.configPath,
      editors: editors.length > 0 ? editors : undefined,
      checkOnly: opts.checkOnly,
    })
  })

program
  .command("doctor")
  .description("End-to-end health check (registry, token, MCP, framework, env)")
  .option("--json", "Emit machine-readable JSON")
  .option("--registry <url>", "Override registry URL")
  .option("--no-network", "Skip network calls (offline diagnostic)")
  .action(async (opts) => {
    await runDoctor({
      json: opts.json,
      registry: opts.registry,
      noNetwork: opts.network === false,
    })
  })

program
  .command("audit")
  .description("Scan consumer repo for drift against Dash design-system rules")
  .option("--path <dir>", "Scan a specific directory (defaults to cwd)")
  .option("--json", "Emit machine-readable JSON report")
  .option("--fail-on-error", "Exit 1 if any HIGH severity drift is found (CI mode)")
  .option("--only <category>", "Limit to one rule category (imports | style | layer) or a rule id")
  .option("--theme <name>", "Validate against a specific Layer-2 theme")
  .option("--layer-only", "Run only Layered Architecture rules (L-1 … L-7)")
  .option("--explain-layer", "Print the Layered Architecture rule summary and exit")
  .action((opts) => {
    runAudit({
      path: opts.path,
      json: opts.json,
      failOnError: opts.failOnError,
      only: opts.only,
      theme: opts.theme,
      layerOnly: opts.layerOnly,
      explainLayer: opts.explainLayer,
    })
  })

const gap = program
  .command("gap")
  .description("Log Dash design-system coverage gaps for the DS maintainer queue")

gap
  .command("sync")
  .description("Push pending local gap entries to the dashboard API")
  .option("--url <url>", "Dashboard base URL (defaults to DASH_DASHBOARD_URL env)")
  .option("--token <token>", "Bearer token (defaults to DASH_CEO_TOKEN env)")
  .option("--dry-run", "Print what would be sent without uploading")
  .option("--json", "Emit machine-readable JSON")
  .action(async (opts) => {
    await runGapSync({
      url: opts.url,
      token: opts.token,
      dryRun: opts.dryRun,
      json: opts.json,
    })
  })

gap
  .command("report [description]")
  .description("Log a missing DS pattern/component (or --list / --clear / --export)")
  .option("--severity <level>", "low | medium | high (prompted if omitted)")
  .option("--repo <name>", "Repo name (auto-detected from cwd if omitted)")
  .option("--prompt <text>", "Original user prompt that surfaced the gap")
  .option("--list", "Print queue contents")
  .option("--clear", "Clear all queued gaps (interactive confirm)")
  .option("--export <path>", "Export queue JSON to <path>")
  .option("--json", "Emit machine-readable JSON")
  .option("--yes", "Skip confirmation prompts (use with --clear in scripts)")
  .option("--non-interactive", "Skip interactive prompts (default severity = medium)")
  .action(async (description: string | undefined, opts) => {
    await runGapReport({
      description,
      severity: opts.severity,
      repo: opts.repo,
      prompt: opts.prompt,
      list: opts.list,
      clear: opts.clear,
      export: opts.export,
      json: opts.json,
      yes: opts.yes,
      nonInteractive: opts.nonInteractive,
    })
  })

// ─────────────────────────────────────────────────────────────────────────
// `dash feedback` — Wave 5 pilot signal capture
// ─────────────────────────────────────────────────────────────────────────

const feedback = program
  .command("feedback")
  .description("Capture Wave 5 pilot signal (bugs, UX, missing pieces, praise, drift)")

feedback
  .command("log [text]")
  .description("Append a feedback entry to ~/.dash/feedback-log.jsonl")
  .option("--category <name>", "bug | ux | missing | praise | drift | other", "other")
  .option("--severity <level>", "low | med | high")
  .option("--pilot <name>", "Pilot tag (default: wave-5)")
  .option("--pe <name>", "User name (auto-detected from git config user.name if omitted)")
  .option("--command <cmd>", "Command that triggered the feedback (context)")
  .option("--component <name>", "Component related to the feedback (context)")
  .option("--repo <name>", "Repo where the feedback originated (context)")
  .option("--json", "Read structured entry from stdin / emit JSON")
  .action(async (text: string | undefined, opts) => {
    await runFeedbackLog({
      text,
      category: opts.category,
      severity: opts.severity,
      pilot: opts.pilot,
      pe: opts.pe,
      command: opts.command,
      component: opts.component,
      repo: opts.repo,
      json: opts.json,
    })
  })

feedback
  .command("list")
  .description("Print local feedback entries as a table")
  .option("--pilot <name>", "Filter by pilot tag")
  .option("--pe <name>", "Filter by user name")
  .option("--category <name>", "Filter by category")
  .option("--json", "Emit machine-readable JSON")
  .action((opts) => {
    runFeedbackList({
      pilot: opts.pilot,
      pe: opts.pe,
      category: opts.category,
      json: opts.json,
    })
  })

feedback
  .command("sync")
  .description("Push pending feedback entries to the admin pilot API")
  .option("--url <url>", "Dashboard base URL (defaults to DASH_DASHBOARD_URL env)")
  .option("--token <token>", "Bearer token (defaults to DASH_CEO_TOKEN env)")
  .option("--dry-run", "Print what would be sent without uploading")
  .option("--json", "Emit machine-readable JSON")
  .action(async (opts) => {
    await runFeedbackSync({
      url: opts.url,
      token: opts.token,
      dryRun: opts.dryRun,
      json: opts.json,
    })
  })

// ─────────────────────────────────────────────────────────────────────────
// `dash skill` — v4 freshness cache management
// ─────────────────────────────────────────────────────────────────────────

const skill = program
  .command("skill")
  .description("Manage @dash/skill v4 snapshot cache (per-prompt freshness)")

skill
  .command("status")
  .description("Show whether the skill cache for this cwd is fresh, stale, or missing")
  .option("--cwd <path>", "Override working directory")
  .option("--json", "Emit machine-readable JSON")
  .action(async (opts) => {
    await runSkillStatus({ cwd: opts.cwd, json: opts.json })
  })

skill
  .command("refresh")
  .description("Force a re-scan of `dash info --json` and update the skill cache")
  .option("--cwd <path>", "Override working directory")
  .option("--json", "Emit machine-readable JSON")
  .action(async (opts) => {
    await runSkillRefresh({ cwd: opts.cwd, json: opts.json })
  })

skill
  .command("clear")
  .description("Clear the skill cache entry for this cwd (or --all to wipe everything)")
  .option("--cwd <path>", "Override working directory")
  .option("--all", "Wipe every cache entry on disk")
  .option("--json", "Emit machine-readable JSON")
  .action(async (opts) => {
    await runSkillClear({ cwd: opts.cwd, all: opts.all, json: opts.json })
  })

// ─────────────────────────────────────────────────────────────────────────
// `dash migrate <name>` — apply codemods for breaking changes
// ─────────────────────────────────────────────────────────────────────────

program
  .command("migrate [name]")
  .description("Apply a Dash migration (codemod for a breaking change)")
  .option("--list", "List available migrations")
  .option("--dry-run", "Show what would change without writing")
  .option("--yes", "Skip confirmation prompt")
  .option("--cwd <path>", "Working directory (defaults to cwd)")
  .action(async (name: string | undefined, opts) => {
    await runMigrate({
      name,
      list: opts.list,
      dryRun: opts.dryRun,
      yes: opts.yes,
      cwd: opts.cwd,
    })
  })

program.parseAsync(process.argv).catch((err: Error) => {
  console.error(kleur.red(`✗ ${err.message}`))
  if (process.env.DEBUG) console.error(err.stack)
  process.exit(1)
})
