import type { Socket } from "node:net"
import { encodeTextFrame } from "./frame.js"

/**
 * Minimal WebSocket client abstraction. We pass around the raw TCP socket and
 * just need to know whether it's still writable.
 */
export interface WsClient {
  socket: Socket
  send(text: string): void
  alive(): boolean
  close(): void
}

export function wrapSocket(socket: Socket): WsClient {
  return {
    socket,
    send(text: string) {
      if (socket.writable && !socket.destroyed) {
        socket.write(encodeTextFrame(text))
      }
    },
    alive() {
      return socket.writable && !socket.destroyed
    },
    close() {
      try {
        socket.end()
      } catch {
        // ignore
      }
    },
  }
}

/**
 * Broadcaster fans out daemon events to every connected dashboard client.
 * Dead clients are pruned lazily on the next broadcast.
 */
export class Broadcaster {
  private clients: Set<WsClient> = new Set()

  add(client: WsClient): void {
    this.clients.add(client)
  }

  remove(client: WsClient): void {
    this.clients.delete(client)
  }

  size(): number {
    return this.clients.size
  }

  /**
   * Broadcast a JSON event to every live client. Dead clients are removed
   * from the registry as a side effect.
   */
  broadcast(event: string, data: unknown): void {
    const message = JSON.stringify({ event, data, ts: Date.now() })
    for (const client of this.clients) {
      if (!client.alive()) {
        this.clients.delete(client)
        continue
      }
      try {
        client.send(message)
      } catch {
        this.clients.delete(client)
      }
    }
  }

  closeAll(): void {
    for (const client of this.clients) client.close()
    this.clients.clear()
  }
}
