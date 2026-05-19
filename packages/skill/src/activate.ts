/**
 * Auto-activation predicate. Returns true when the given CWD is a Dash-wired
 * repository — components.json with `registries.@dash`, OR a `.dash` marker
 * directory.
 *
 * Side-effect free filesystem check. Used by the Claude Code skill loader.
 */
import fs from "node:fs"
import path from "node:path"

export type ActivationResult = {
  active: boolean
  reason: "components-json" | "dash-marker" | "none"
  registryUrl: string | null
}

export function shouldActivate(cwd: string): ActivationResult {
  const cjPath = path.join(cwd, "components.json")
  if (fs.existsSync(cjPath)) {
    try {
      const raw = fs.readFileSync(cjPath, "utf-8")
      const json = JSON.parse(raw) as {
        registries?: Record<string, { url?: string }>
      }
      const dashReg = json.registries?.["@dash"]
      if (dashReg?.url) {
        return { active: true, reason: "components-json", registryUrl: dashReg.url }
      }
    } catch {
      /* fall through */
    }
  }
  if (fs.existsSync(path.join(cwd, ".dash"))) {
    return { active: true, reason: "dash-marker", registryUrl: null }
  }
  return { active: false, reason: "none", registryUrl: null }
}
