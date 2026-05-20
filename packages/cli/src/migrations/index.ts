/**
 * Migration registry — central index of all available `dash migrate <name>`
 * codemods / scanners.
 *
 * Each migration is a self-contained module that exports a `Migration`
 * object. New migrations are added here, not in the CLI command file, so
 * adding a migration never requires editing commander wiring.
 */
import { rhfToVanillaMigration } from "./rhf-to-vanilla.js"
import { iconRenameMigration } from "./icon-rename.js"

export type MigrationChange = {
  /** Absolute or relative file path that was (or would be) modified. */
  file: string
  /** Snippet of code before the change. Empty string for scan-only migrations. */
  before: string
  /** Snippet of code after the change. Empty string for scan-only migrations. */
  after: string
}

export type MigrationResult = {
  /** Total .tsx/.ts/.jsx/.js files scanned. */
  filesScanned: number
  /** Files that were modified (or would be modified in dry-run mode). */
  filesModified: number
  /** Per-file change records (may be empty for scan-only migrations). */
  changes: MigrationChange[]
  /** Non-fatal advisories surfaced to the user. */
  warnings: string[]
}

export type Migration = {
  /** Short kebab-case identifier used on the CLI (`dash migrate <name>`). */
  name: string
  /** One-line description shown in `--list`. */
  description: string
  /** Dash CLI version when this migration first shipped. */
  version: string
  /** Run the migration. `dryRun` must not mutate the filesystem. */
  apply: (
    cwd: string,
    opts: { dryRun?: boolean; yes?: boolean },
  ) => Promise<MigrationResult>
}

/**
 * Registry of all known migrations. Order is preserved for `--list` output.
 */
export const MIGRATIONS: Migration[] = [
  rhfToVanillaMigration,
  iconRenameMigration,
]

export function getMigration(name: string): Migration | undefined {
  return MIGRATIONS.find((m) => m.name === name)
}

export function listMigrationNames(): string[] {
  return MIGRATIONS.map((m) => m.name)
}
