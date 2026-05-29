/**
 * Bug fixes (2026-05-28) — regression tests for three flow bugs:
 *
 *   1. Home composer used to redirect to `/workspace/#prompt=…` (no runId),
 *      leaving the workspace stuck without an active run. Now POSTs
 *      `/api/prompt` first and navigates to `/workspace/<runId>`.
 *   2. Workspace iteration used to call `refreshDashboard()` after submit,
 *      which fetched `/dashboard?legacy=1` and blew away the optimistic chat
 *      bubble. Now detects the workspace path and navigates to the freshly
 *      minted run instead.
 *   3. Patch-mode preview never refreshed because the WS `component:updated`
 *      event was not bridged to the Sandpack mount's
 *      `dash-build:preview-refresh` listener. Now the client dispatches a
 *      CustomEvent to every matching `[data-component-id]` mount.
 *
 * Tests stay at the substring-assertion level on `DASHBOARD_JS` (the same
 * style as doc-attach-dropdown.test.ts) — full DOM round-trip lives in the
 * routes integration tests.
 */

import { describe, expect, it } from "vitest"
import { DASHBOARD_JS } from "../../client/app.js"

describe("Bug 1 — home composer posts then navigates to /workspace/<runId>", () => {
  it("hookHomePrompt POSTs /api/prompt instead of just redirecting to /workspace/#prompt=", () => {
    // Old behaviour stitched the prompt text into the URL hash and navigated.
    // Make sure the seed-via-hash path is gone — the home composer is now
    // server-authoritative for run creation.
    expect(DASHBOARD_JS).toContain("function hookHomePrompt")
    expect(DASHBOARD_JS).toContain('"/api/prompt"')
    // The success branch navigates to /workspace/ followed by encodeURIComponent
    // of the response id (string includes verbatim across the file).
    expect(DASHBOARD_JS).toContain(
      'navigateTo("/workspace/" + encodeURIComponent(resp.id))'
    )
  })

  it("falls back to /workspace/ when the textarea is empty (new-project shortcut)", () => {
    // Empty submit must still feel responsive — drop the user into a fresh
    // workspace shell so the in-workspace composer can take over.
    expect(DASHBOARD_JS).toContain('navigateTo("/workspace/")')
  })

  it("surfaces a toast when the home submit fails so the user is not silently stuck", () => {
    // Error path must re-enable the submit button + surface a toast.
    expect(DASHBOARD_JS).toMatch(/submitBtn\.removeAttribute\(["']disabled["']\)/)
    expect(DASHBOARD_JS).toContain("Could not start workspace")
  })

  it("forwards attachedDocs from the home textarea so doc context survives the home → workspace hop", () => {
    // The composer carries Open WebUI '#' adoption metadata; the home
    // submit path must respect it so the orchestrator gets the same prompt
    // shape it would from the in-workspace composer.
    expect(DASHBOARD_JS).toMatch(/payload\.attachedDocs = attached/)
  })
})

describe("Bug 1b — workspace iteration submit navigates to the new run", () => {
  it("detects /workspace path and navigates to the new runId on submit", () => {
    // The shared submitPrompt() must branch on the current path so a
    // workspace-page submit lands on /workspace/<newId> instead of falling
    // through to refreshDashboard (which swaps db-chat-thread out from under
    // the optimistic bubble).
    expect(DASHBOARD_JS).toContain('location.pathname || ""')
    expect(DASHBOARD_JS).toMatch(
      /indexOf\(["']\/workspace["']\) === 0/
    )
    expect(DASHBOARD_JS).toMatch(
      /navigateTo\(["']\/workspace\/["'] \+ encodeURIComponent\(resp\.id\)\)/
    )
  })
})

describe("Bug 2 — client bridges WS component:updated to Sandpack refresh", () => {
  it("listens for component:updated WS messages and dispatches dash-build:preview-refresh", () => {
    // The bridge is required because preview-mount.js only listens for the
    // CustomEvent on its mount node; without the bridge the orchestrator
    // broadcast lands on the WS and dies there.
    expect(DASHBOARD_JS).toContain('msg.event === "component:updated"')
    expect(DASHBOARD_JS).toContain('"dash-build:preview-refresh"')
    expect(DASHBOARD_JS).toContain("CustomEvent")
  })

  it("scopes dispatch to mounts whose data-component-id matches the payload", () => {
    // A/B variant mounts share the page; the bridge must skip mounts whose
    // component-id doesn't match so a variant-A update doesn't blow away
    // variant-B's iframe. NOTE: the broadcaster wraps the event as
    // { event, data, ts }, so the handler reads from `payload = msg.data`,
    // not `msg` root (the earlier msg-root shape dispatched empty details).
    expect(DASHBOARD_JS).toContain("data-component-id")
    expect(DASHBOARD_JS).toMatch(/mid !== payload\.componentId/)
  })

  it("passes componentSource + contextMap through the event detail", () => {
    // preview-mount.js reads detail.componentSource directly; the bridge
    // must forward the full payload (sourced from msg.data) so patch-mode
    // preview hydrates with the post-diff source, not just the raw diff body.
    expect(DASHBOARD_JS).toMatch(/componentSource:\s*payload\.componentSource/)
    expect(DASHBOARD_JS).toMatch(/contextMap:\s*payload\.contextMap/)
  })
})

describe("Bug 3 — workspace hashchange listener (carry-over regression)", () => {
  it("listens for hashchange on window so deep-links like #tab=audit activate the tab", () => {
    // Programmatic `location.hash = '#tab=audit'` used to silently fail
    // because the tab handler only ran on click. The hashchange listener
    // routes both the tab + viewport hash slices through the same setters.
    expect(DASHBOARD_JS).toContain('addEventListener("hashchange"')
    expect(DASHBOARD_JS).toContain("applyHashTab")
  })

  it("guards the hashchange registration so HMR / double-boot does not stack listeners", () => {
    // Wired via a data-attribute marker on <html> so repeat module loads
    // (Tier 4 #16 dev refresh, HMR) do not pile up duplicate handlers.
    expect(DASHBOARD_JS).toContain("data-workspace-hash-wired")
  })
})

describe("Bug 5 — workspace composer submits exactly once", () => {
  it("declares a dedicated in-flight latch independent of submitBtn.disabled", () => {
    // The old guard leaned only on submitBtn.disabled, which DOM re-renders
    // could reset — letting a second click/Cmd+Enter POST /api/prompt twice
    // (two identical bubbles + two runs). A dedicated boolean owned by
    // submitPrompt() closes that gap.
    expect(DASHBOARD_JS).toContain("var promptSubmitInFlight = false")
    expect(DASHBOARD_JS).toMatch(
      /if \(promptSubmitInFlight \|\| submitBtn\.disabled\) return/
    )
    // The latch is set before the fetch + cleared only in .finally so a
    // re-entrant submit during the in-flight window is ignored.
    expect(DASHBOARD_JS).toContain("promptSubmitInFlight = true")
    expect(DASHBOARD_JS).toContain("promptSubmitInFlight = false")
  })

  it("binds the composer button click through a single dual-purpose handler", () => {
    // One listener (onComposerButtonClick) routes to submit OR cancel so we
    // never double-bind submit on the same button.
    expect(DASHBOARD_JS).toContain("function onComposerButtonClick")
    expect(DASHBOARD_JS).toContain(
      'submitBtn.addEventListener("click", onComposerButtonClick)'
    )
    // Exactly one click binding for the composer button.
    const clickBindings =
      DASHBOARD_JS.match(/submitBtn\.addEventListener\("click"/g) ?? []
    expect(clickBindings.length).toBe(1)
  })
})

describe("Bug 6 — workspace composer can stop a running generation", () => {
  it("posts to /api/prompts/:id/cancel and flips the button into Stop mode", () => {
    expect(DASHBOARD_JS).toContain("function cancelActiveRun")
    expect(DASHBOARD_JS).toContain('"/cancel"')
    expect(DASHBOARD_JS).toContain("function setComposerStopMode")
    // The dual-purpose button cancels when in stop-mode, else submits.
    expect(DASHBOARD_JS).toMatch(
      /data-stop-mode["']\) === ["']true["']/
    )
  })

  it("reverts the Stop button to Build when the run reaches a terminal status", () => {
    expect(DASHBOARD_JS).toContain("clearComposerStopMode")
    expect(DASHBOARD_JS).toMatch(/msg\.status === ["']cancelled["']/)
  })
})

describe("P19 — workspace composer Reset button is wired", () => {
  it("handles the reset action in the workspace-action dispatch", () => {
    // The Reset button (data-workspace-action=\"reset\") had no handler — the
    // dispatch only knew share/run/export-pptx. Add an action === \"reset\"
    // branch so clicks actually clear the composer.
    expect(DASHBOARD_JS).toContain('if (action === "reset")')
  })

  it("clears the composer input + local draft state on reset", () => {
    // Reset wipes the textarea value and the attached-docs draft attribute,
    // mirroring what a successful submit clears.
    expect(DASHBOARD_JS).toMatch(/composerInput\.value = ""/)
    expect(DASHBOARD_JS).toMatch(/data-attached-docs["'],\s*["']\[\]["']/)
  })

  it("no longer claims a dedicated listener already handles reset", () => {
    // The old false comment said reset was \"handled by their own dedicated
    // listeners\". The only reset listener is db-local-run-reset (a different
    // button). That claim must be gone.
    expect(DASHBOARD_JS).not.toContain(
      '"reset" + other actions are still handled by their own dedicated'
    )
  })
})

describe("P22 — Cmd+Enter routes through the dual-purpose composer handler", () => {
  it("calls onComposerButtonClick (not submitPrompt directly) on Cmd/Ctrl+Enter", () => {
    // Cmd+Enter previously called submitPrompt() directly, bypassing Stop-mode
    // routing + the in-flight latch guard inside onComposerButtonClick. The
    // keydown branch must now go through onComposerButtonClick so Stop-mode is
    // honoured and double-submit is prevented.
    // The workspace composer keydown branch opens with the Cmd/Ctrl+Enter
    // guard; within ~600 chars its call must be onComposerButtonClick() (the
    // dual-purpose dispatcher), not a bare submitPrompt(). Slice from the
    // metaKey guard so the assertion is anchored to that exact branch.
    const guardIdx = DASHBOARD_JS.indexOf(
      '(ev.metaKey || ev.ctrlKey) && ev.key === "Enter"'
    )
    expect(guardIdx).toBeGreaterThan(-1)
    const keydownBlock = DASHBOARD_JS.slice(guardIdx, guardIdx + 700)
    expect(keydownBlock).toContain("onComposerButtonClick()")
  })
})
