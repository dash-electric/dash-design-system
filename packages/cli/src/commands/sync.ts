/**
 * `dash sync` — scan consumer repo for installed @dash items, compare each
 * against the latest registry version, and update those that drifted.
 *
 * Flow:
 *   1. Call `collectInfo()` to enumerate installed items (re-uses dash info logic).
 *   2. For each item, fetch the latest from the registry.
 *   3. Compare file contents → produce a "drift report".
 *   4. Prompt per item (or auto-update with --all). --dry-run shows the plan.
 *   5. --json emits machine-readable output (no prompts, no writes).
 *
 * Side-effects: writes files via `writeRegistryFile`. Re-uses existing
 * disk-cache; pass --no-cache to force fresh fetch.
 */
import fs from "node:fs"
import path from "node:path"
import kleur from "kleur"
import ora from "ora"
import prompts from "prompts"
import {
  DEFAULT_REGISTRY_URL,
  readComponentsJson,
  resolveTargetPath,
} from "../lib/components-json.js"
import { fetchRegistryItem } from "../lib/registry-fetch.js"
import { writeRegistryFile } from "../lib/file-writer.js"
import { collectInfo } from "./info.js"
import type { RegistryItem } from "../lib/schema.js"
import type { InfoSnapshot } from "./info.js"

export type SyncOpts = {
  all?: boolean
  dryRun?: boolean
  json?: boolean
  registryUrl?: string
  token?: string
  noCache?: boolean
  cwd?: string
  /** Inject a pre-built snapshot (testing). */
  _snapshot?: InfoSnapshot
  /** Inject a fetcher (testing) to avoid network. */
  _fetchItem?: (name: string) => Promise<RegistryItem>
  /** Bypass interactive prompt (testing). Defaults to opts.all. */
  _autoConfirm?: boolean
}

export type SyncItemStatus =
  | "up-to-date"
  | "drift"
  | "missing-local"
  | "fetch-failed"

export type SyncItemReport = {
  name: string
  type: string
  status: SyncItemStatus
  /** Files that differ (relative to cwd). Only populated for `drift`. */
  changedFiles: string[]
  error?: string
}

export type SyncReport = {
  cwd: string
  registryUrl: string
  total: number
  drift: number
  upToDate: number
  failed: number
  updated: number
  skipped: number
  dryRun: boolean
  items: SyncItemReport[]
}

async function compareItem(
  item: RegistryItem,
  cwd: string,
  config: ReturnType<typeof readComponentsJson>,
): Promise<{ status: SyncItemStatus; changed: string[] }> {
  if (!item.files?.length) return { status: "up-to-date", changed: [] }
  const changed: string[] = []
  let anyExists = false
  for (const f of item.files) {
    const target = resolveTargetPath(f, config, cwd)
    if (!fs.existsSync(target)) {
      changed.push(path.relative(cwd, target))
      continue
    }
    anyExists = true
    const local = fs.readFileSync(target, "utf-8")
    const remote = f.content ?? ""
    if (local !== remote) changed.push(path.relative(cwd, target))
  }
  if (!anyExists) return { status: "missing-local", changed }
  if (changed.length === 0) return { status: "up-to-date", changed: [] }
  return { status: "drift", changed }
}

/**
 * Build the sync report without applying any changes. Pure read.
 */
export async function planSync(opts: SyncOpts): Promise<{
  report: SyncReport
  fetched: Map<string, RegistryItem>
}> {
  const cwd = opts.cwd ?? process.cwd()
  const config = readComponentsJson(cwd)
  const registryUrl =
    opts.registryUrl ??
    config?.registries?.["@dash"]?.url ??
    DEFAULT_REGISTRY_URL

  const snap =
    opts._snapshot ??
    (await collectInfo({
      cwd,
      registry: registryUrl,
      token: opts.token,
    }))

  const installed = snap.dash.installedItems
  const fetched = new Map<string, RegistryItem>()
  const items: SyncItemReport[] = []

  for (const inst of installed) {
    let remote: RegistryItem
    try {
      remote = opts._fetchItem
        ? await opts._fetchItem(inst.name)
        : await fetchRegistryItem(inst.name, {
            registryUrl,
            token: opts.token,
            noCache: opts.noCache,
            cwd,
          })
      fetched.set(inst.name, remote)
    } catch (err) {
      items.push({
        name: inst.name,
        type: inst.type,
        status: "fetch-failed",
        changedFiles: [],
        error: (err as Error).message,
      })
      continue
    }
    const cmp = await compareItem(remote, cwd, config)
    items.push({
      name: inst.name,
      type: inst.type,
      status: cmp.status,
      changedFiles: cmp.changed,
    })
  }

  const report: SyncReport = {
    cwd,
    registryUrl,
    total: items.length,
    drift: items.filter((i) => i.status === "drift").length,
    upToDate: items.filter((i) => i.status === "up-to-date").length,
    failed: items.filter((i) => i.status === "fetch-failed").length,
    updated: 0,
    skipped: 0,
    dryRun: Boolean(opts.dryRun),
    items,
  }

  return { report, fetched }
}

async function applyUpdate(
  remote: RegistryItem,
  cwd: string,
  config: ReturnType<typeof readComponentsJson>,
  opts: SyncOpts,
): Promise<number> {
  if (!remote.files?.length) return 0
  let written = 0
  for (const f of remote.files) {
    const target = resolveTargetPath(f, config, cwd)
    const result = await writeRegistryFile(f, target, {
      cwd,
      yes: true,
      overwrite: true,
      dryRun: opts.dryRun,
    })
    if (result !== "skipped") written++
  }
  return written
}

function printPretty(report: SyncReport): void {
  console.log(kleur.bold().cyan(`\nDash sync`))
  console.log(
    kleur.dim(
      `  registry: ${report.registryUrl}\n  scanned: ${report.total} item(s)\n`,
    ),
  )

  if (report.total === 0) {
    console.log(kleur.dim("  No installed @dash items detected. Run `dash add` first."))
    return
  }

  for (const item of report.items) {
    switch (item.status) {
      case "up-to-date":
        console.log(kleur.green(`  ✓ ${item.name}  ${kleur.dim("up to date")}`))
        break
      case "drift":
        console.log(
          kleur.yellow(
            `  △ ${item.name}  ${kleur.dim(`${item.changedFiles.length} file(s) drifted`)}`,
          ),
        )
        for (const f of item.changedFiles) {
          console.log(kleur.dim(`      · ${f}`))
        }
        break
      case "missing-local":
        console.log(kleur.dim(`  ? ${item.name}  (no local files matched)`))
        break
      case "fetch-failed":
        console.log(
          kleur.red(`  ✗ ${item.name}  ${kleur.dim(item.error ?? "fetch failed")}`),
        )
        break
    }
  }

  console.log(
    kleur.bold().dim(
      `\n  ${report.upToDate} up-to-date · ${report.drift} drifted · ${report.failed} failed`,
    ),
  )
}

export async function runSync(opts: SyncOpts): Promise<SyncReport> {
  const cwd = opts.cwd ?? process.cwd()
  const spinner = opts.json ? null : ora("Scanning installed @dash items").start()
  const { report, fetched } = await planSync(opts)
  spinner?.succeed(`Scanned ${report.total} item(s)`)

  if (opts.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n")
    return report
  }

  printPretty(report)

  if (opts.dryRun) {
    console.log(kleur.yellow(`\n(dry-run — no changes applied)`))
    return report
  }

  const driftedItems = report.items.filter((i) => i.status === "drift")
  if (driftedItems.length === 0) {
    console.log(kleur.green(`\n✓ Nothing to sync`))
    return report
  }

  const config = readComponentsJson(cwd)
  const autoConfirm = opts._autoConfirm ?? opts.all

  for (const item of driftedItems) {
    const remote = fetched.get(item.name)
    if (!remote) continue

    let proceed = autoConfirm
    if (!autoConfirm) {
      const ans = await prompts({
        type: "confirm",
        name: "ok",
        message: `Update ${kleur.cyan(item.name)} (${item.changedFiles.length} file(s))?`,
        initial: true,
      })
      proceed = ans.ok
    }

    if (!proceed) {
      report.skipped++
      console.log(kleur.dim(`  · ${item.name} skipped`))
      continue
    }

    const written = await applyUpdate(remote, cwd, config, opts)
    report.updated += written > 0 ? 1 : 0
    console.log(kleur.green(`  ↻ ${item.name} (${written} file(s) written)`))
  }

  console.log(
    kleur.bold().green(
      `\n✓ Sync complete — ${report.updated} updated, ${report.skipped} skipped`,
    ),
  )
  return report
}
