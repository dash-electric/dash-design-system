import { createServer } from "node:net"

/**
 * Find first available port starting at `start`, scanning up to `maxTries` ports.
 * Throws if no free port found.
 */
export async function detectPort(start = 7777, maxTries = 10): Promise<number> {
  for (let i = 0; i < maxTries; i++) {
    const port = start + i
    if (await isPortFree(port)) return port
  }
  throw new Error(`No free port in range ${start}-${start + maxTries - 1}`)
}

export function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer()
    server.once("error", () => resolve(false))
    server.once("listening", () => {
      server.close(() => resolve(true))
    })
    server.listen(port, "127.0.0.1")
  })
}
