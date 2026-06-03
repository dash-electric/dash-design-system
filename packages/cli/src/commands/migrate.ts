/**
 * `dashkit migrate <name>` — apply codemods for breaking changes.
 *
 * Pattern adopted from shadcn (`shadcn migrate <name>`). Each breaking
 * change ships a migration; consumers run `dashkit migrate <name>` to apply
 * the codemod. Migrations are scan-only (report) or write (codemod).
 *
 * Flags:
 *   --list           list available migrations
 *   --dry-run        scan and report, no writes
 *   --yes            skip confirmation prompt
 *   --cwd <path>     override working directory
 */
import path from "node:path"
import kleur from "kleur"
import prompts from "prompts"
import {
  MIGRATIONS,
  getMigration,
  type MigrationResult,
} from "../migrations/index.js"

export type MigrateOpts = {
  name?: string
  list?: boolean
  dryRun?: boolean
  yes?: boolean
  cwd?: string
}

function printList(): void {
  console.log(kleur.bold("Available migrations:"))
  console.log("")
  for (const m of MIGRATIONS) {
    console.log(`  ${kleur.cyan(m.name.padEnd(20))} ${kleur.dim(`(v${m.version})`)}`)
    console.log(`  ${kleur.dim(m.description)}`)
    console.log("")
  }
  console.log(
    kleur.dim(
      `Run a migration: ${kleur.cyan("dashkit migrate <name>")}  ` +
        `(${kleur.cyan("--dry-run")} to preview)`,
    ),
  )
}

function printResult(name: string, result: MigrationResult, dryRun: boolean): void {
  console.log("")
  console.log(kleur.bold(`Migration: ${name}`))
  console.log(kleur.dim(`  Files scanned : ${result.filesScanned}`))
  console.log(
    kleur.dim(
      `  Files modified: ${result.filesModified}${dryRun ? " (dry-run)" : ""}`,
    ),
  )

  if (result.changes.length === 0) {
    console.log(kleur.green("\n  ✓ No changes needed — codebase already clean."))
  } else {
    console.log("")
    for (const change of result.changes) {
      const marker = dryRun ? kleur.yellow("⟳") : kleur.green("✓")
      console.log(`  ${marker} ${change.file}`)
      if (change.before && change.before !== change.after) {
        // For multi-line snippets (scan-only), show in dim
        const beforeLines = change.before.split("\n").slice(0, 3)
        for (const line of beforeLines) {
          console.log(kleur.dim(`      ${line}`))
        }
      }
    }
  }

  if (result.warnings.length > 0) {
    console.log("")
    for (const w of result.warnings) {
      console.log(kleur.yellow(`  ! ${w}`))
    }
  }
}

export async function runMigrate(opts: MigrateOpts): Promise<void> {
  const cwd = path.resolve(opts.cwd ?? process.cwd())

  // --list (or no name given) → list and exit
  if (opts.list || !opts.name) {
    printList()
    return
  }

  const migration = getMigration(opts.name)
  if (!migration) {
    console.error(kleur.red(`✗ Migration not found: ${opts.name}`))
    console.error(
      kleur.dim(`Run ${kleur.cyan("dashkit migrate --list")} to see available migrations.`),
    )
    process.exit(1)
  }

  // Confirm prompt unless --yes or --dry-run
  if (!opts.yes && !opts.dryRun) {
    console.log(kleur.bold(`Migration: ${migration.name}`))
    console.log(kleur.dim(`  ${migration.description}`))
    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message: `Apply migration "${migration.name}" to ${cwd}?`,
      initial: false,
    })
    if (!confirm) {
      console.log(kleur.dim("migrate aborted"))
      return
    }
  }

  const result = await migration.apply(cwd, {
    dryRun: opts.dryRun,
    yes: opts.yes,
  })

  printResult(migration.name, result, !!opts.dryRun)
}
