/**
 * Minimal RFC 6455 WebSocket frame encoder/decoder.
 *
 * Scope intentionally narrow — daemon only sends short JSON text frames to
 * dashboard clients on localhost. We do NOT support fragmentation, extensions,
 * or binary streaming. This keeps us zero-dep (no `ws` package needed).
 */

export const OPCODE_CONTINUATION = 0x0
export const OPCODE_TEXT = 0x1
export const OPCODE_BINARY = 0x2
export const OPCODE_CLOSE = 0x8
export const OPCODE_PING = 0x9
export const OPCODE_PONG = 0xa

export interface DecodedFrame {
  fin: boolean
  opcode: number
  payload: Buffer
}

/**
 * Encode a text frame to send from the server. Server frames are unmasked
 * per RFC 6455.
 */
export function encodeTextFrame(text: string): Buffer {
  const payload = Buffer.from(text, "utf8")
  return encodeFrame(OPCODE_TEXT, payload)
}

export function encodeCloseFrame(code = 1000, reason = ""): Buffer {
  const reasonBuf = Buffer.from(reason, "utf8")
  const payload = Buffer.concat([Buffer.alloc(2), reasonBuf])
  payload.writeUInt16BE(code, 0)
  return encodeFrame(OPCODE_CLOSE, payload)
}

export function encodePongFrame(payload: Buffer): Buffer {
  return encodeFrame(OPCODE_PONG, payload)
}

function encodeFrame(opcode: number, payload: Buffer): Buffer {
  const len = payload.length
  let header: Buffer
  if (len < 126) {
    header = Buffer.alloc(2)
    header[0] = 0x80 | opcode
    header[1] = len
  } else if (len < 65536) {
    header = Buffer.alloc(4)
    header[0] = 0x80 | opcode
    header[1] = 126
    header.writeUInt16BE(len, 2)
  } else {
    header = Buffer.alloc(10)
    header[0] = 0x80 | opcode
    header[1] = 127
    header.writeBigUInt64BE(BigInt(len), 2)
  }
  return Buffer.concat([header, payload])
}

/**
 * Decode a single client frame from a buffer. Returns null if the buffer
 * does not yet contain a complete frame.
 */
export function decodeFrame(buf: Buffer): { frame: DecodedFrame; rest: Buffer } | null {
  if (buf.length < 2) return null
  const b0 = buf[0]!
  const b1 = buf[1]!
  const fin = (b0 & 0x80) !== 0
  const opcode = b0 & 0x0f
  const masked = (b1 & 0x80) !== 0
  let payloadLen = b1 & 0x7f
  let offset = 2

  if (payloadLen === 126) {
    if (buf.length < offset + 2) return null
    payloadLen = buf.readUInt16BE(offset)
    offset += 2
  } else if (payloadLen === 127) {
    if (buf.length < offset + 8) return null
    const big = buf.readBigUInt64BE(offset)
    payloadLen = Number(big)
    offset += 8
  }

  let maskKey: Buffer | null = null
  if (masked) {
    if (buf.length < offset + 4) return null
    maskKey = buf.subarray(offset, offset + 4)
    offset += 4
  }

  if (buf.length < offset + payloadLen) return null

  const raw = buf.subarray(offset, offset + payloadLen)
  let payload: Buffer
  if (maskKey) {
    payload = Buffer.alloc(payloadLen)
    for (let i = 0; i < payloadLen; i++) {
      payload[i] = raw[i]! ^ maskKey[i % 4]!
    }
  } else {
    payload = Buffer.from(raw)
  }

  return {
    frame: { fin, opcode, payload },
    rest: buf.subarray(offset + payloadLen),
  }
}
