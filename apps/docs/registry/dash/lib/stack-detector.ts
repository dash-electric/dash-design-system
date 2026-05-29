/**
 * Dash Repo Stack Detector
 *
 * Inspects a consumer repo and identifies which of the 5 known Dash FE stacks
 * it matches (portal-v2, backoffice, halo-fe, basecamp, fleet-mgmt) or returns
 * `unknown` if no profile matches.
 *
 * Used by `dashkit init` / Adaptation Layer to auto-select the right per-repo
 * rule set (jotai vs zustand, App vs Pages router, MUI vs AlignUI, etc.).
 *
 * Pure filesystem inspection — no network, no spawn.
 */
import fs from "node:fs"
import path from "node:path"

export type DashRepoStack =
  | "portal-v2"
  | "backoffice"
  | "halo-fe"
  | "basecamp"
  | "fleet-mgmt"
  | "unknown"

export type DashStackDetection = {
  stack: DashRepoStack
  confidence: "high" | "medium" | "low"
  signals: string[]
}

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

function readPackageJson(rootPath: string): PackageJson | null {
  try {
    const raw = fs.readFileSync(path.join(rootPath, "package.json"), "utf-8")
    return JSON.parse(raw) as PackageJson
  } catch {
    return null
  }
}

function hasAnyDep(pkg: PackageJson, name: string): boolean {
  return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name])
}

function depValue(pkg: PackageJson, name: string): string | undefined {
  return pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]
}

function dirExists(rootPath: string, ...segments: string[]): boolean {
  try {
    return fs.statSync(path.join(rootPath, ...segments)).isDirectory()
  } catch {
    return false
  }
}

function hasAppRouter(rootPath: string): boolean {
  // App Router signature: `app/` dir at root (or src/app/) with layout.tsx
  return (
    dirExists(rootPath, "app") || dirExists(rootPath, "src", "app")
  )
}

function hasPagesRouter(rootPath: string): boolean {
  return (
    dirExists(rootPath, "pages") || dirExists(rootPath, "src", "pages")
  )
}

function hasTypeScript(rootPath: string): boolean {
  return fs.existsSync(path.join(rootPath, "tsconfig.json"))
}

function hasAlignUISignature(rootPath: string): boolean {
  // AlignUI components ship with a recognizable variant primitive at known paths.
  const candidates = [
    "components/ui/button.tsx",
    "src/components/ui/button.tsx",
    "components/align-ui",
    "src/components/align-ui",
  ]
  for (const c of candidates) {
    if (fs.existsSync(path.join(rootPath, c))) return true
  }
  return false
}

function isAlignUIVendored(pkg: PackageJson): boolean {
  // halo-fe vendors AlignUI via `file:` protocol in deps.
  const all = { ...pkg.dependencies, ...pkg.devDependencies }
  for (const [name, version] of Object.entries(all ?? {})) {
    if (!version) continue
    if (
      (name.includes("align") || name.includes("ui")) &&
      version.startsWith("file:")
    ) {
      return true
    }
  }
  return false
}

export function detectDashRepoStack(rootPath: string): DashStackDetection {
  const pkg = readPackageJson(rootPath)
  if (!pkg) {
    return {
      stack: "unknown",
      confidence: "low",
      signals: ["no package.json"],
    }
  }

  // ── fleet-mgmt: CRA (react-scripts) + react-router-dom v7
  if (hasAnyDep(pkg, "react-scripts")) {
    const rrd = depValue(pkg, "react-router-dom")
    const signals = ["react-scripts dep present"]
    if (rrd) signals.push(`react-router-dom@${rrd}`)
    const isV7 = !!rrd && /^[~^]?7\./.test(rrd)
    if (isV7) {
      return { stack: "fleet-mgmt", confidence: "high", signals }
    }
    return { stack: "fleet-mgmt", confidence: "medium", signals }
  }

  const hasNext = hasAnyDep(pkg, "next")
  const ts = hasTypeScript(rootPath)
  const app = hasAppRouter(rootPath)
  const pages = hasPagesRouter(rootPath)

  if (!hasNext) {
    return {
      stack: "unknown",
      confidence: "low",
      signals: ["no next dep, no react-scripts"],
    }
  }

  // ── basecamp: Next App + TS + zustand + Firebase
  const hasZustand = hasAnyDep(pkg, "zustand")
  const hasFirebase =
    hasAnyDep(pkg, "firebase") || hasAnyDep(pkg, "firebase-admin")
  if (hasNext && app && ts && hasZustand && hasFirebase) {
    return {
      stack: "basecamp",
      confidence: "high",
      signals: ["next + app router", "typescript", "zustand", "firebase"],
    }
  }

  // ── halo-fe: Next Pages + JS + AlignUI vendored (`file:`)
  const alignVendored = isAlignUIVendored(pkg)
  if (hasNext && pages && !ts && alignVendored) {
    return {
      stack: "halo-fe",
      confidence: "high",
      signals: ["next + pages router", "javascript", "AlignUI vendored (file:)"],
    }
  }

  // ── portal-v2: Next App + TS + jotai + AlignUI signature
  const hasJotai = hasAnyDep(pkg, "jotai")
  const alignSig = hasAlignUISignature(rootPath)
  if (hasNext && app && ts && hasJotai) {
    const signals = ["next + app router", "typescript", "jotai"]
    if (alignSig) signals.push("AlignUI signature")
    return {
      stack: "portal-v2",
      confidence: alignSig ? "high" : "medium",
      signals,
    }
  }

  // ── backoffice: Next Pages + JS + NextAuth + (MUI or antd)
  const hasNextAuth =
    hasAnyDep(pkg, "next-auth") || hasAnyDep(pkg, "@auth/core")
  const hasMUI =
    hasAnyDep(pkg, "@mui/material") || hasAnyDep(pkg, "@material-ui/core")
  const hasAntd = hasAnyDep(pkg, "antd")
  if (hasNext && pages && !ts && hasNextAuth && (hasMUI || hasAntd)) {
    const signals = ["next + pages router", "javascript", "next-auth"]
    if (hasMUI) signals.push("MUI")
    if (hasAntd) signals.push("antd")
    return { stack: "backoffice", confidence: "high", signals }
  }

  return {
    stack: "unknown",
    confidence: "low",
    signals: ["next detected but no known FE profile matched"],
  }
}
