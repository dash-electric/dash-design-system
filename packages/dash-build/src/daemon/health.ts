/**
 * Poll a health endpoint until it returns 200 or timeout. Used by mode
 * runners (web-ui, tray) to confirm the spawned daemon is reachable before
 * opening the browser.
 */
export interface WaitForHealthOptions {
  url: string
  timeoutMs?: number
  intervalMs?: number
}

export async function waitForHealth(opts: WaitForHealthOptions): Promise<boolean> {
  const timeout = opts.timeoutMs ?? 10_000
  const interval = opts.intervalMs ?? 250
  const start = Date.now()

  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(opts.url, { method: "GET" })
      if (res.ok) return true
    } catch {
      // Daemon not up yet
    }
    await sleep(interval)
  }
  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
