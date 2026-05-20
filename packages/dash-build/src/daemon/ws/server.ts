import { createHash } from "node:crypto"
import type { IncomingMessage } from "node:http"
import type { Socket } from "node:net"
import { Broadcaster, wrapSocket } from "./broadcaster.js"
import {
  OPCODE_CLOSE,
  OPCODE_PING,
  decodeFrame,
  encodeCloseFrame,
  encodePongFrame,
} from "./frame.js"

const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

/**
 * Compute the Sec-WebSocket-Accept response header per RFC 6455 §4.2.2.
 */
export function computeAcceptKey(clientKey: string): string {
  return createHash("sha1")
    .update(clientKey + WS_GUID)
    .digest("base64")
}

export interface WsServerDeps {
  broadcaster: Broadcaster
}

/**
 * Handle an HTTP upgrade request, completing the WebSocket handshake and
 * attaching the new client to the broadcaster. Drops the connection if the
 * upgrade request is malformed.
 */
export function handleUpgrade(
  req: IncomingMessage,
  socket: Socket,
  _head: Buffer,
  deps: WsServerDeps,
): void {
  const key = req.headers["sec-websocket-key"]
  const upgrade = String(req.headers["upgrade"] ?? "").toLowerCase()

  if (upgrade !== "websocket" || typeof key !== "string" || !key) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n")
    socket.destroy()
    return
  }

  if (req.url !== "/ws") {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
    socket.destroy()
    return
  }

  const accept = computeAcceptKey(key)
  const headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "\r\n",
  ].join("\r\n")
  socket.write(headers)

  const client = wrapSocket(socket)
  deps.broadcaster.add(client)

  // Greeting so the client knows it's connected
  client.send(
    JSON.stringify({
      event: "hello",
      data: { connected: true },
      ts: Date.now(),
    }),
  )

  let buffer = Buffer.alloc(0)

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk])
    while (true) {
      const decoded = decodeFrame(buffer)
      if (!decoded) break
      buffer = Buffer.from(decoded.rest)
      const { opcode, payload } = decoded.frame

      if (opcode === OPCODE_CLOSE) {
        socket.write(encodeCloseFrame(1000, "bye"))
        client.close()
        deps.broadcaster.remove(client)
        return
      }
      if (opcode === OPCODE_PING) {
        socket.write(encodePongFrame(payload))
      }
      // We ignore client text frames in v0 — the dashboard is read-only over ws.
    }
  })

  const cleanup = () => {
    deps.broadcaster.remove(client)
  }
  socket.on("close", cleanup)
  socket.on("error", cleanup)
}
