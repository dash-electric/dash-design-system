import type { ServerResponse } from "node:http"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import type { Store } from "../state/store.js"
import type { Orchestrator } from "../../pipeline/orchestrator.js"
import { renderDashboard } from "../templates/dashboard.js"
import { sendHtml } from "./_helpers.js"

const execAsync = promisify(exec)

/**
 * Probe `claude --version`. Result is used by the connect-form to show
 * the Claude Code subscription path as ready vs needing-install.
 *
 * Timeout 1.5s so a slow/missing binary never blocks a dashboard render.
 * Worst case: form shows "claude not on PATH" — user just retries.
 */
async function probeClaudeCli(): Promise<{
  installed: boolean
  version: string | null
}> {
  try {
    const { stdout } = await execAsync("claude --version", { timeout: 1500 })
    return { installed: true, version: stdout.trim() || null }
  } catch {
    return { installed: false, version: null }
  }
}

export async function handleDashboard(
  res: ServerResponse,
  store: Store,
  orchestrator?: Orchestrator,
): Promise<void> {
  const claudeProbe = await probeClaudeCli()
  sendHtml(
    res,
    200,
    renderDashboard(store, orchestrator, {
      claudeCliInstalled: claudeProbe.installed,
      claudeCliVersion: claudeProbe.version,
    }),
  )
}
