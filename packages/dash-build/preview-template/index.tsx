/**
 * Sandpack entry — mounts `App` into the in-browser bundler's root node.
 * Sandpack injects its own `<div id="root"></div>` so we can rely on it.
 */
import * as React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"

const container = document.getElementById("root")
if (!container) {
  throw new Error("Sandpack root element missing")
}
const root = createRoot(container)
root.render(<App />)
