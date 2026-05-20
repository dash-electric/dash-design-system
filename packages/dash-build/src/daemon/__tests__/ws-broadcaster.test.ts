import { describe, expect, it } from "vitest"
import { Broadcaster, type WsClient } from "../ws/broadcaster.js"

function fakeClient(): WsClient & { messages: string[]; isAlive: boolean } {
  const messages: string[] = []
  const c = {
    socket: {} as never,
    messages,
    isAlive: true,
    send(text: string) {
      messages.push(text)
    },
    alive() {
      return this.isAlive
    },
    close() {
      this.isAlive = false
    },
  }
  return c
}

describe("Broadcaster", () => {
  it("add and remove clients", () => {
    const b = new Broadcaster()
    const c = fakeClient()
    b.add(c)
    expect(b.size()).toBe(1)
    b.remove(c)
    expect(b.size()).toBe(0)
  })

  it("broadcast sends to every live client", () => {
    const b = new Broadcaster()
    const a = fakeClient()
    const c = fakeClient()
    b.add(a)
    b.add(c)
    b.broadcast("prompts:changed", { id: "x" })
    expect(a.messages).toHaveLength(1)
    expect(c.messages).toHaveLength(1)
  })

  it("broadcast wraps payload in {event, data, ts} JSON", () => {
    const b = new Broadcaster()
    const c = fakeClient()
    b.add(c)
    b.broadcast("auth:changed", { provider: "github" })
    const msg = JSON.parse(c.messages[0]!)
    expect(msg.event).toBe("auth:changed")
    expect(msg.data.provider).toBe("github")
    expect(typeof msg.ts).toBe("number")
  })

  it("prunes dead clients on broadcast", () => {
    const b = new Broadcaster()
    const live = fakeClient()
    const dead = fakeClient()
    dead.isAlive = false
    b.add(live)
    b.add(dead)
    b.broadcast("ping", {})
    expect(b.size()).toBe(1)
    expect(live.messages).toHaveLength(1)
    expect(dead.messages).toHaveLength(0)
  })
})
