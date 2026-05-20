/**
 * Backup session for safe file writes.
 *
 * Adopted from shadcn's `restoreFileBackup` pattern. Before any destructive
 * file write, `backupFile` copies the original to `.dash-backup/<ISO-ts>/<rel>`.
 *
 * Usage:
 *   const session = startBackup(cwd)
 *   try {
 *     backupFile(session, target)        // before each writeFile
 *     fs.writeFileSync(target, content)
 *     commitBackup(session, true)         // success → clean backup tree
 *   } catch (err) {
 *     restoreBackup(session)              // any failure → revert
 *     throw err
 *   }
 *
 * `startBackup` registers a `process.on("exit")` handler that auto-restores
 * if the process crashes mid-write. `commitBackup` deregisters it.
 */
import fs from "node:fs"
import path from "node:path"

export type BackupEntry = {
  /** Absolute path of the original file. */
  original: string
  /** Absolute path of the backup copy. */
  backup: string
}

export type BackupSession = {
  /** ISO timestamp identifier for this session (also the directory name). */
  id: string
  /** Absolute path to `<cwd>/.dash-backup/<id>/`. */
  rootDir: string
  /** Consumer cwd — entries are tracked relative to this root. */
  cwd: string
  /** Backup entries (one per backed-up file). */
  files: BackupEntry[]
  /** Internal flag: true once committed (no more restore). */
  committed: boolean
  /** Internal: registered exit handler so we can deregister on commit. */
  _exitHandler?: () => void
}

const BACKUP_DIR_NAME = ".dash-backup"

function safeTimestampId(): string {
  // ISO timestamp with `:` replaced (filesystem-safe)
  return new Date().toISOString().replace(/[:.]/g, "-")
}

/**
 * Start a new backup session. Registers a `process.on("exit")` handler that
 * auto-restores backed-up files if the process exits without committing.
 */
export function startBackup(cwd: string = process.cwd()): BackupSession {
  const id = safeTimestampId()
  const rootDir = path.join(cwd, BACKUP_DIR_NAME, id)
  const session: BackupSession = {
    id,
    rootDir,
    cwd,
    files: [],
    committed: false,
  }
  const handler = () => {
    if (!session.committed) {
      try {
        restoreBackup(session)
      } catch {
        /* swallow — we're already exiting */
      }
    }
  }
  session._exitHandler = handler
  process.on("exit", handler)
  return session
}

/**
 * Back up `target` if it exists. No-op if the file does not exist (nothing
 * to preserve). Safe to call multiple times for the same target — only the
 * first call wins (subsequent overwrites are already covered by the original
 * backup).
 */
export function backupFile(session: BackupSession, target: string): void {
  const abs = path.resolve(target)
  if (!fs.existsSync(abs)) return
  if (session.files.some((f) => f.original === abs)) return
  // Mirror the relative path inside the backup tree.
  const rel = path.relative(session.cwd, abs)
  // Guard against paths outside cwd (shouldn't happen, but be safe).
  const safeRel = rel.startsWith("..") ? path.basename(abs) : rel
  const backupPath = path.join(session.rootDir, safeRel)
  fs.mkdirSync(path.dirname(backupPath), { recursive: true })
  fs.copyFileSync(abs, backupPath)
  session.files.push({ original: abs, backup: backupPath })
}

/**
 * Commit the session as successful.
 *  - Deregisters the exit handler.
 *  - If `cleanup === true`, removes the backup tree.
 *  - If `cleanup === false`, leaves the backups on disk for manual recovery.
 */
export function commitBackup(session: BackupSession, cleanup: boolean): void {
  session.committed = true
  if (session._exitHandler) {
    process.removeListener("exit", session._exitHandler)
    session._exitHandler = undefined
  }
  if (cleanup && fs.existsSync(session.rootDir)) {
    fs.rmSync(session.rootDir, { recursive: true, force: true })
    // Best-effort: clean parent `.dash-backup/` if now empty.
    const parent = path.dirname(session.rootDir)
    try {
      if (fs.existsSync(parent) && fs.readdirSync(parent).length === 0) {
        fs.rmdirSync(parent)
      }
    } catch {
      /* ignore */
    }
  }
}

/**
 * Restore every file in the session to its pre-backup state.
 * Safe to call on a missing rootDir (no-op).
 */
export function restoreBackup(session: BackupSession): void {
  if (!fs.existsSync(session.rootDir)) return
  for (const entry of session.files) {
    try {
      if (fs.existsSync(entry.backup)) {
        fs.mkdirSync(path.dirname(entry.original), { recursive: true })
        fs.copyFileSync(entry.backup, entry.original)
      }
    } catch {
      // Best-effort — keep going on remaining entries.
    }
  }
  // Drop the backup tree after restore.
  try {
    fs.rmSync(session.rootDir, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}
