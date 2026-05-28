/**
 * Dash Build preview template — App shell.
 *
 * This file is read verbatim by `component-preview.ts` and shipped to Sandpack
 * as `/App.tsx`. It is the harness around the generated `Component.tsx`:
 *
 *   - imports the user's generated component
 *   - wires the Dash DS token CSS (real Layer 0 vars)
 *   - loads the mock fixtures (`mocks.json`) so list/table components have data
 *   - provides a neutral canvas (no global chrome) so each component renders
 *     in isolation, similar to a Storybook story
 *
 * DO NOT add provider wiring here that does not exist in Dash production
 * repos — the goal is "what would this look like in a Dash repo", not "what
 * does the dashboard look like".
 */
import * as React from "react"
import Component from "./Component"
import mocks from "./mocks.json"
import "./dash-tokens.css"

export default function App(): JSX.Element {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "var(--bg-white-0, #ffffff)",
        color: "var(--text-strong-950, #0e121b)",
        fontFamily:
          'var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif)',
      }}
    >
      <Component {...(mocks as Record<string, unknown>)} />
    </div>
  )
}
