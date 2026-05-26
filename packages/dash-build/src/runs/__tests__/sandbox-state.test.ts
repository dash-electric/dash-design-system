import { describe, it, expect, vi } from "vitest"
import {
  SandboxStateMachine,
  STALE_THRESHOLD_MS,
  shouldFlipStale,
  type SandboxTransitionEvent,
} from "../sandbox-state.js"

function makeSm(initial: Parameters<typeof SandboxStateMachine>[0]["initial"] = "clean") {
  return new SandboxStateMachine({ repoSlug: "dash/backoffice", initial })
}

describe("SandboxStateMachine", () => {
  it("defaults to clean", () => {
    const sm = new SandboxStateMachine({ repoSlug: "dash/backoffice" })
    expect(sm.current()).toBe("clean")
    expect(sm.history()).toEqual([])
  })

  it("walks the happy path clean → cloned → shim_applied → idle", () => {
    const sm = makeSm()
    expect(sm.transition("cloned").ok).toBe(true)
    expect(sm.transition("shim_applied").ok).toBe(true)
    expect(sm.transition("idle").ok).toBe(true)
    expect(sm.current()).toBe("idle")
    expect(sm.history()).toHaveLength(3)
    expect(sm.history()[0]).toMatchObject({ from: "clean", to: "cloned" })
  })

  it("walks the generate → preview → publish → sweep loop", () => {
    const sm = makeSm("idle")
    expect(sm.transition("generating").ok).toBe(true)
    expect(sm.transition("preview_ready").ok).toBe(true)
    expect(sm.transition("publishing").ok).toBe(true)
    expect(sm.transition("sweep").ok).toBe(true)
    expect(sm.transition("idle").ok).toBe(true)
    expect(sm.current()).toBe("idle")
  })

  it("supports generate → idle cancel and preview → idle reject", () => {
    const sm = makeSm("idle")
    sm.transition("generating")
    expect(sm.transition("idle").ok).toBe(true) // cancel/fail
    sm.transition("generating")
    sm.transition("preview_ready")
    expect(sm.transition("idle").ok).toBe(true) // user reject
  })

  it("supports idle → stale → clean lifecycle", () => {
    const sm = makeSm("idle")
    expect(sm.transition("stale").ok).toBe(true)
    expect(sm.transition("clean").ok).toBe(true)
    expect(sm.current()).toBe("clean")
  })

  it("rejects invalid transitions with informative error", () => {
    const sm = makeSm("clean")
    const r = sm.transition("idle")
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/invalid transition clean → idle/)
    expect(sm.current()).toBe("clean")
  })

  it("rejects skipping over a state (cloned → idle)", () => {
    const sm = makeSm("cloned")
    expect(sm.transition("idle").ok).toBe(false)
    expect(sm.transition("shim_applied").ok).toBe(true)
  })

  it("rejects publishing → idle directly (must go via sweep)", () => {
    const sm = makeSm("idle")
    sm.transition("generating")
    sm.transition("preview_ready")
    sm.transition("publishing")
    expect(sm.transition("idle").ok).toBe(false)
    expect(sm.transition("sweep").ok).toBe(true)
  })

  it("caps history at 20 entries", () => {
    const sm = makeSm("idle")
    for (let i = 0; i < 30; i++) {
      sm.transition("generating")
      sm.transition("idle")
    }
    expect(sm.history().length).toBeLessThanOrEqual(20)
  })

  it("rehydrate bypasses validation (for Store reload)", () => {
    const sm = makeSm("clean")
    sm.rehydrate("publishing", [
      { from: "preview_ready", to: "publishing", at: "2025-01-01T00:00:00.000Z" },
    ])
    expect(sm.current()).toBe("publishing")
    expect(sm.history()).toHaveLength(1)
  })

  it("history entries carry ISO timestamps", () => {
    const sm = makeSm("idle")
    sm.transition("generating")
    const h = sm.history()
    expect(h[0].at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  // Sprint 1C — transition event subscription
  describe("onTransition event subscription", () => {
    it("fires onTransition with full event payload on success", () => {
      const events: SandboxTransitionEvent[] = []
      const sm = new SandboxStateMachine({
        repoSlug: "dash/backoffice",
        initial: "idle",
        onTransition: (e) => events.push(e),
      })
      const res = sm.transition("generating")
      expect(res.ok).toBe(true)
      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({
        repoSlug: "dash/backoffice",
        from: "idle",
        to: "generating",
        runId: null,
      })
      expect(events[0].at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it("does NOT fire on rejected transition", () => {
      const cb = vi.fn()
      const sm = new SandboxStateMachine({
        repoSlug: "dash/backoffice",
        initial: "clean",
        onTransition: cb,
      })
      const res = sm.transition("publishing")
      expect(res.ok).toBe(false)
      expect(cb).not.toHaveBeenCalled()
    })

    it("stamps pendingRunId onto the next event and auto-clears after", () => {
      const events: SandboxTransitionEvent[] = []
      const sm = new SandboxStateMachine({
        repoSlug: "dash/backoffice",
        initial: "idle",
        onTransition: (e) => events.push(e),
      })
      sm.setRunIdForNextTransition("prm_abc123")
      sm.transition("generating")
      sm.transition("idle") // no runId set — should be null
      expect(events).toHaveLength(2)
      expect(events[0].runId).toBe("prm_abc123")
      expect(events[1].runId).toBeNull()
    })

    it("late-binds via setOnTransition (orchestrator wiring path)", () => {
      const sm = makeSm("idle")
      const cb = vi.fn()
      sm.setOnTransition(cb)
      sm.transition("generating")
      expect(cb).toHaveBeenCalledOnce()
      expect(cb.mock.calls[0][0]).toMatchObject({ to: "generating" })
    })

    it("swallows subscriber throws so machine state stays consistent", () => {
      const sm = new SandboxStateMachine({
        repoSlug: "dash/backoffice",
        initial: "idle",
        onTransition: () => {
          throw new Error("subscriber broken")
        },
      })
      const res = sm.transition("generating")
      expect(res.ok).toBe(true)
      expect(sm.current()).toBe("generating")
    })

    it("is backward-compatible — omitting onTransition is a no-op", () => {
      const sm = makeSm("idle")
      // No subscriber wired. Should still transition cleanly.
      const res = sm.transition("generating")
      expect(res.ok).toBe(true)
      expect(sm.current()).toBe("generating")
    })
  })
})

describe("shouldFlipStale", () => {
  const now = 1_700_000_000_000

  it("flips idle older than threshold", () => {
    const old = new Date(now - STALE_THRESHOLD_MS - 1000).toISOString()
    expect(shouldFlipStale("idle", old, now)).toBe(true)
  })

  it("flips preview_ready older than threshold", () => {
    const old = new Date(now - STALE_THRESHOLD_MS - 1000).toISOString()
    expect(shouldFlipStale("preview_ready", old, now)).toBe(true)
  })

  it("keeps idle younger than threshold", () => {
    const recent = new Date(now - 60_000).toISOString()
    expect(shouldFlipStale("idle", recent, now)).toBe(false)
  })

  it("does NOT flip generating even if old (orchestrator must reconcile)", () => {
    const old = new Date(now - STALE_THRESHOLD_MS - 1000).toISOString()
    expect(shouldFlipStale("generating", old, now)).toBe(false)
  })

  it("does NOT flip publishing even if old", () => {
    const old = new Date(now - STALE_THRESHOLD_MS - 1000).toISOString()
    expect(shouldFlipStale("publishing", old, now)).toBe(false)
  })

  it("returns false on null lastActivity", () => {
    expect(shouldFlipStale("idle", null, now)).toBe(false)
  })

  it("returns false on garbage timestamp", () => {
    expect(shouldFlipStale("idle", "not-a-date", now)).toBe(false)
  })
})
