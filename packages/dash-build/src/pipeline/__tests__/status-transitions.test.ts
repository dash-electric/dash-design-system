import { describe, expect, it } from "vitest"
import {
  assertTransition,
  canTransition,
  IllegalTransitionError,
  isTerminal,
  nextStatus,
} from "../status-transitions.js"

describe("status-transitions", () => {
  it("allows queued → generating", () => {
    expect(canTransition("queued", "generating")).toBe(true)
    expect(nextStatus("queued", "generating")).toBe("generating")
  })

  it("allows generating → clarifying (clarification path)", () => {
    expect(canTransition("generating", "clarifying")).toBe(true)
  })

  it("allows clarifying → generating (resume after answers)", () => {
    expect(canTransition("clarifying", "generating")).toBe(true)
  })

  it("allows generating → awaiting_approval (happy path)", () => {
    expect(canTransition("generating", "awaiting_approval")).toBe(true)
  })

  it("allows awaiting_approval → pr_created", () => {
    expect(canTransition("awaiting_approval", "pr_created")).toBe(true)
  })

  it("allows any non-terminal → failed", () => {
    expect(canTransition("queued", "failed")).toBe(true)
    expect(canTransition("generating", "failed")).toBe(true)
    expect(canTransition("clarifying", "failed")).toBe(true)
    expect(canTransition("awaiting_approval", "failed")).toBe(true)
  })

  it("no-ops on terminal state (nextStatus returns current)", () => {
    expect(isTerminal("completed")).toBe(true)
    expect(isTerminal("failed")).toBe(true)
    expect(isTerminal("cancelled")).toBe(true)
    expect(nextStatus("failed", "generating")).toBe("failed")
    expect(nextStatus("completed", "pr_created")).toBe("completed")
  })

  it("rejects illegal transitions", () => {
    expect(() => assertTransition("queued", "pr_created")).toThrowError(
      IllegalTransitionError,
    )
    expect(() => assertTransition("queued", "awaiting_approval")).toThrowError(
      IllegalTransitionError,
    )
  })
})
