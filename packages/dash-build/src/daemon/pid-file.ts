import { mkdir, readFile, writeFile, unlink } from "node:fs/promises"
import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"

const DEFAULT_DIR = join(homedir(), ".dash-build")
const DEFAULT_FILE = join(DEFAULT_DIR, "daemon.pid")

export interface PidFileOptions {
  path?: string
}

export async function writePidFile(pid: number, opts: PidFileOptions = {}): Promise<string> {
  const file = opts.path ?? DEFAULT_FILE
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, String(pid), "utf8")
  return file
}

export async function readPidFile(opts: PidFileOptions = {}): Promise<number | null> {
  const file = opts.path ?? DEFAULT_FILE
  if (!existsSync(file)) return null
  try {
    const raw = await readFile(file, "utf8")
    const pid = Number.parseInt(raw.trim(), 10)
    return Number.isFinite(pid) && pid > 0 ? pid : null
  } catch {
    return null
  }
}

export async function deletePidFile(opts: PidFileOptions = {}): Promise<void> {
  const file = opts.path ?? DEFAULT_FILE
  if (!existsSync(file)) return
  try {
    await unlink(file)
  } catch {
    // Swallow — best-effort cleanup
  }
}

/** Check if a process is currently alive by sending signal 0. */
export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export const PID_FILE_PATH = DEFAULT_FILE
