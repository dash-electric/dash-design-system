/**
 * Preview-shim system (Phase D1).
 *
 * Each consumer repo has a versioned patch that makes it bootable in Dash
 * Build's preview sandbox without real auth/secrets. The shim is applied as
 * an isolated commit on top of `main` in the working clone, and it MUST
 * NEVER be cherry-picked onto the publish branch (the publish extractor uses
 * `verifyShimNotInBranch` to enforce this).
 *
 * Commit message contract — exact string used by the cherry-pick exclude
 * filter and the verifier:
 *     "preview-shim apply v<version> [DO NOT MERGE]"
 *
 * Adding a new shim:
 *   1. Define the patch object with `repoSlug`, `version`, `patchContent`,
 *      `filesAffected`. patchContent uses { path, content } overwrite tuples.
 *   2. Export from this file.
 *   3. Wire it in workspace.ts shim registry.
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises"
import { dirname, join, resolve, sep } from "node:path"
import { spawn } from "node:child_process"

export interface ShimFileOp {
  /** Relative path inside the workspace, e.g. "src/lib/firebase.js". */
  path: string
  /** Full file content to write (overwrite). */
  content: string
}

export interface PreviewShim {
  /** Matches Store sandboxState key: "dash/backoffice", "dash/portal-v2". */
  repoSlug: string
  /** Monotonic version. Bump on any patch change so old shim commits get superseded. */
  version: number
  /** Ordered list of file overwrites to apply. */
  patchContent: ShimFileOp[]
  /** Convenience — same paths as patchContent for fast lookup / docs. */
  filesAffected: string[]
}

/** Marker put inside generated stubs so a forensic grep finds them quickly. */
const PREVIEW_MARKER = "/* DASH BUILD PREVIEW SHIM — DO NOT MERGE */"

// ──────────────────────────────────────────────────────────────────────────
// next-backoffice-web shim (v1)
// ──────────────────────────────────────────────────────────────────────────

const BACKOFFICE_FIREBASE_STUB = `${PREVIEW_MARKER}
// Replaces src/lib/firebase.js for preview-only boot. Real firebase env vars
// are absent in the sandbox, so getAuth() would throw at module load. Stubs
// expose the same surface (app/auth/db/remoteConfig/messaging) but with
// preview-safe no-op implementations.

const PREVIEW_USER = {
  uid: "preview-user",
  email: "preview@dashelectric.local",
  displayName: "Preview User",
  emailVerified: true,
  isAnonymous: false,
  metadata: { creationTime: null, lastSignInTime: null },
  providerData: [],
  refreshToken: "",
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => "preview-id-token",
  getIdTokenResult: async () => ({
    token: "preview-id-token",
    expirationTime: "",
    authTime: "",
    issuedAtTime: "",
    signInProvider: "preview",
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({ uid: "preview-user" }),
}

const app = { name: "[DEFAULT]", options: {}, automaticDataCollectionEnabled: false }

const auth = {
  app,
  currentUser: PREVIEW_USER,
  languageCode: null,
  settings: { appVerificationDisabledForTesting: true },
  tenantId: null,
  onAuthStateChanged: (cb) => {
    try { cb && cb(PREVIEW_USER) } catch (_) {}
    return () => {}
  },
  onIdTokenChanged: (cb) => {
    try { cb && cb(PREVIEW_USER) } catch (_) {}
    return () => {}
  },
  signOut: async () => {},
  signInWithCustomToken: async () => ({ user: PREVIEW_USER }),
  setPersistence: async () => {},
  updateCurrentUser: async () => {},
}

const db = { app, type: "firestore", toJSON: () => ({}) }

const remoteConfig = {
  app,
  settings: { minimumFetchIntervalMillis: 3600000, fetchTimeoutMillis: 60000 },
  defaultConfig: {
    delivery_cancel_button_visibility: false,
    fcm_notification_whitelist: "",
  },
  fetchTimeMillis: 0,
}

const messaging = null

export { app, auth, db, remoteConfig, messaging }
`

const BACKOFFICE_AUTH_CONTEXT_STUB = `${PREVIEW_MARKER}
// Replaces src/contexts/AuthContext.js for preview-only boot. The real
// provider chains Firebase + NextAuth + cross-domain cookie storage, all of
// which require live tokens. In the sandbox we short-circuit straight to a
// signed-in preview user so protected routes render without a real session.

import React, { createContext, useContext, useState } from "react"

const PREVIEW_USER = {
  id: "preview-user",
  uid: "preview-user",
  email: "preview@dashelectric.local",
  name: "Preview User",
  displayName: "Preview User",
  role: "admin",
  roles: ["admin"],
  permissions: ["*"],
  isAuthenticated: true,
}

export const AuthContext = createContext({
  user: PREVIEW_USER,
  token: "preview-jwt",
  loading: false,
  error: null,
  signIn: async () => PREVIEW_USER,
  signOut: async () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }) {
  const [user] = useState(PREVIEW_USER)
  const value = {
    user,
    token: "preview-jwt",
    loading: false,
    error: null,
    signIn: async () => user,
    signOut: async () => {},
    refresh: async () => {},
  }
  return React.createElement(AuthContext.Provider, { value }, children)
}

export function UserAuth() {
  return useContext(AuthContext)
}

export default AuthProvider
`

/**
 * F3 — preview-only mock fixture generator. Inlined into every axios stub
 * so the shim stays self-contained (zero new modules / runtime deps). The
 * helper pattern-matches the failing request URL and returns a reasonable
 * fixture for the most common Dash staging endpoints that anonymously
 * return 401. Kept boring: no fancy faker — deterministic strings make the
 * preview iframe predictable across reloads.
 *
 * Pattern matches (substring, case-insensitive):
 *   /v3/drivers     → array of 4 mock mitra (uid + name + status)
 *   /v1/deliveries  → array of 3 mock deliveries (id + tile + status)
 *   /v3/orders      → array of 3 mock orders (id + customer + total)
 *   /health         → { ok: true, mock: true }
 *   *               → empty array if URL looks like a list endpoint, else {}
 */
const PREVIEW_MOCK_HELPER_SRC = `function generatePreviewMockResponse(url, config) {
  if (typeof url !== "string" || url.length === 0) return {}
  var lower = url.toLowerCase()
  var listy = /\\/(list|search|query|index)(\\b|\\?|$)/.test(lower) ||
    /s(\\?|$)/.test(lower)

  // /v3/drivers → mock mitra (4 entries, mixed statuses for UI variance).
  if (lower.indexOf("/v3/drivers") >= 0) {
    return [
      { uid: "mitra-preview-001", name: "Budi Santoso", status: "active", suspended: false, tier: 1 },
      { uid: "mitra-preview-002", name: "Siti Rahayu", status: "active", suspended: false, tier: 2 },
      { uid: "mitra-preview-003", name: "Andi Wijaya", status: "suspended", suspended: true, tier: 1 },
      { uid: "mitra-preview-004", name: "Rina Pratama", status: "pending", suspended: false, tier: 3 },
    ]
  }

  // /v1/deliveries → 3 mock deliveries spanning common states.
  if (lower.indexOf("/v1/deliveries") >= 0) {
    return [
      { id: "dlv-preview-001", tile: "TILE-JKT-01", status: "delivered", mitra: "mitra-preview-001" },
      { id: "dlv-preview-002", tile: "TILE-JKT-02", status: "in_progress", mitra: "mitra-preview-002" },
      { id: "dlv-preview-003", tile: "TILE-JKT-03", status: "queued", mitra: null },
    ]
  }

  // /v3/orders → 3 mock orders. Total is in IDR cents (Dash convention).
  if (lower.indexOf("/v3/orders") >= 0) {
    return [
      { id: "ord-preview-001", customer: "Kopi Kenangan", total: 1250000, status: "completed" },
      { id: "ord-preview-002", customer: "Jiwa+", total: 875000, status: "in_progress" },
      { id: "ord-preview-003", customer: "Sayurbox", total: 2400000, status: "queued" },
    ]
  }

  // /health → cheap probe, always ok in preview.
  if (lower.indexOf("/health") >= 0) {
    return { ok: true, mock: true }
  }

  // Default: empty array for list endpoints, empty object otherwise. Avoids
  // throwing inside .map() callers that depend on an array shape.
  return listy ? [] : {}
}`

const BACKOFFICE_AXIOS_STUB_V2 = `${PREVIEW_MARKER}
// Replaces src/utils/axios.js for preview-only boot (Dash Build SHIM v2).
// v2 layers an axios response interceptor that catches anonymous 401s from
// the Dash staging API and returns a deterministic mock fixture instead.
// The behaviour is GATED by NEXT_PUBLIC_DASH_BUILD_PREVIEW === "true" so it
// can NEVER leak into a production bundle. v1 only forced the baseURL.

import axios from "axios"
import { v4 as uuidv4 } from "uuid"

const PREVIEW_FLAG =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NEXT_PUBLIC_DASH_BUILD_PREVIEW === "true"

const STAGING_BASE = "https://stg-api.dashelectric.co"
const RUNTIME_BASE =
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL) ||
  STAGING_BASE

const baseURL = PREVIEW_FLAG ? STAGING_BASE : RUNTIME_BASE

const Axios = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "dash-client-type": "web",
  },
})

${PREVIEW_MOCK_HELPER_SRC}

Axios.interceptors.request.use(
  (config) => {
    config.headers["X-Idempotency-Key"] = uuidv4()
    try {
      config.headers["X-Client-Time-Zone"] =
        Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (_) {}
    return config
  },
  (error) => Promise.reject(error),
)

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      PREVIEW_FLAG &&
      error &&
      error.response &&
      error.response.status === 401
    ) {
      var url = (error.config && error.config.url) || ""
      var mockData = generatePreviewMockResponse(url, error.config)
      if (mockData !== null && mockData !== undefined) {
        return Promise.resolve({
          status: 200,
          statusText: "OK (preview mock)",
          data: mockData,
          headers: {},
          config: error.config,
          _previewMock: true,
        })
      }
    }
    return Promise.reject(error)
  },
)

export default Axios
`

/**
 * Backoffice axios stub v1 — original implementation without the mock
 * interceptor. Kept so `BACKOFFICE_SHIM_V1` remains a true v1 snapshot
 * (commit subject "preview-shim apply v1 [DO NOT MERGE]"). Active
 * bootstrap uses V2 via `getShimForRepo()`.
 */
const BACKOFFICE_AXIOS_STUB_V1 = `${PREVIEW_MARKER}
// Replaces src/utils/axios.js for preview-only boot. Forces baseURL to the
// shared staging API so generated screens can hit safe read-only endpoints
// instead of pointing at a missing process.env.NEXT_PUBLIC_API_URL.

import axios from "axios"
import { v4 as uuidv4 } from "uuid"

const PREVIEW_FLAG =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NEXT_PUBLIC_DASH_BUILD_PREVIEW === "true"

const STAGING_BASE = "https://stg-api.dashelectric.co"
const RUNTIME_BASE =
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL) ||
  STAGING_BASE

const baseURL = PREVIEW_FLAG ? STAGING_BASE : RUNTIME_BASE

const Axios = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "dash-client-type": "web",
  },
})

Axios.interceptors.request.use(
  (config) => {
    config.headers["X-Idempotency-Key"] = uuidv4()
    try {
      config.headers["X-Client-Time-Zone"] =
        Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (_) {}
    return config
  },
  (error) => Promise.reject(error),
)

Axios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default Axios
`

/** Alias kept for any callers that imported the un-versioned name. */
const BACKOFFICE_AXIOS_STUB = BACKOFFICE_AXIOS_STUB_V2

/**
 * Backoffice shim v1 — original implementation without the mock
 * interceptor. Retained as a historical reference + for unit tests that
 * pin the v1 commit message; production bootstrap now uses V2 via
 * `getShimForRepo()`.
 */
export const BACKOFFICE_SHIM_V1: PreviewShim = {
  repoSlug: "dash/backoffice",
  version: 1,
  patchContent: [
    { path: "src/lib/firebase.js", content: BACKOFFICE_FIREBASE_STUB },
    { path: "src/contexts/AuthContext.js", content: BACKOFFICE_AUTH_CONTEXT_STUB },
    { path: "src/utils/axios.js", content: BACKOFFICE_AXIOS_STUB_V1 },
  ],
  filesAffected: [
    "src/lib/firebase.js",
    "src/contexts/AuthContext.js",
    "src/utils/axios.js",
  ],
}

/**
 * F3 — backoffice shim v2 (active). Same file list as v1; the axios stub
 * now bundles a response interceptor that catches anonymous-401s and
 * returns preview fixture data. Version bumped so the cherry-pick exclude
 * filter still recognises the commit subject pattern
 * (`preview-shim apply v<n> [DO NOT MERGE]`).
 */
export const BACKOFFICE_SHIM_V2: PreviewShim = {
  repoSlug: "dash/backoffice",
  version: 2,
  patchContent: [
    { path: "src/lib/firebase.js", content: BACKOFFICE_FIREBASE_STUB },
    { path: "src/contexts/AuthContext.js", content: BACKOFFICE_AUTH_CONTEXT_STUB },
    { path: "src/utils/axios.js", content: BACKOFFICE_AXIOS_STUB_V2 },
  ],
  filesAffected: BACKOFFICE_SHIM_V1.filesAffected,
}

// ──────────────────────────────────────────────────────────────────────────
// next-portal-v2-web shim (v1)
// ──────────────────────────────────────────────────────────────────────────

const PORTAL_FIREBASE_STUB = BACKOFFICE_FIREBASE_STUB

const PORTAL_AUTH_CONTEXT_STUB = `${PREVIEW_MARKER}
// Portal-v2 uses Jotai + an auth atom rather than React Context, but the
// repo also re-exports an AuthContext compatibility shim. This stub mirrors
// the backoffice approach: hand back a preview user so any code path reading
// the context renders signed-in.

import React, { createContext, useContext, useState } from "react"

const PREVIEW_USER = {
  id: "preview-user",
  uid: "preview-user",
  email: "preview@dashelectric.local",
  name: "Preview User",
  role: "ops",
  permissions: ["*"],
  isAuthenticated: true,
}

export const AuthContext = createContext({
  user: PREVIEW_USER,
  token: "preview-jwt",
  loading: false,
  error: null,
  signIn: async () => PREVIEW_USER,
  signOut: async () => {},
})

export function AuthProvider({ children }) {
  const [user] = useState(PREVIEW_USER)
  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        token: "preview-jwt",
        loading: false,
        error: null,
        signIn: async () => user,
        signOut: async () => {},
      },
    },
    children,
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthProvider
`

const PORTAL_API_SERVICE_STUB_V2 = `${PREVIEW_MARKER}
// Replaces src/services/apiService.ts (or .js) for preview-only boot (v2).
// v2 mirrors the backoffice axios stub: forces staging baseURL AND layers
// a 401-catching response interceptor that returns preview fixture data
// (gated by NEXT_PUBLIC_DASH_BUILD_PREVIEW). Without it portal pages render
// empty list states everywhere — Dash staging is anonymous-401.

import axios from "axios"

const PREVIEW_FLAG =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NEXT_PUBLIC_DASH_BUILD_PREVIEW === "true"

const STAGING_BASE = "https://stg-api.dashelectric.co"
const RUNTIME_BASE =
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL) ||
  STAGING_BASE

const apiService = axios.create({
  baseURL: PREVIEW_FLAG ? STAGING_BASE : RUNTIME_BASE,
  headers: {
    "Content-Type": "application/json",
    "dash-client-type": "portal-web",
  },
})

${PREVIEW_MOCK_HELPER_SRC}

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      PREVIEW_FLAG &&
      error &&
      error.response &&
      error.response.status === 401
    ) {
      var url = (error.config && error.config.url) || ""
      var mockData = generatePreviewMockResponse(url, error.config)
      if (mockData !== null && mockData !== undefined) {
        return Promise.resolve({
          status: 200,
          statusText: "OK (preview mock)",
          data: mockData,
          headers: {},
          config: error.config,
          _previewMock: true,
        })
      }
    }
    return Promise.reject(error)
  },
)

export default apiService
`

/**
 * Portal-v2 api service stub v1 — original implementation (no interceptor).
 * Retained so `PORTAL_V2_SHIM_V1` is a true v1 snapshot. v2 is the active
 * stub via the shim registry.
 */
const PORTAL_API_SERVICE_STUB_V1 = `${PREVIEW_MARKER}
// Replaces src/services/apiService.ts (or .js) for preview-only boot.
// Forces baseURL to the public staging endpoint so generated portal pages
// have a working data source without leaking prod credentials.

import axios from "axios"

const PREVIEW_FLAG =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NEXT_PUBLIC_DASH_BUILD_PREVIEW === "true"

const STAGING_BASE = "https://stg-api.dashelectric.co"
const RUNTIME_BASE =
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL) ||
  STAGING_BASE

const apiService = axios.create({
  baseURL: PREVIEW_FLAG ? STAGING_BASE : RUNTIME_BASE,
  headers: {
    "Content-Type": "application/json",
    "dash-client-type": "portal-web",
  },
})

export default apiService
`

/** Alias kept for any callers that imported the un-versioned name. */
const PORTAL_API_SERVICE_STUB = PORTAL_API_SERVICE_STUB_V2

/**
 * Portal-v2 shim v1 — original implementation. Kept for backwards
 * compatibility with tests pinning the v1 commit message; production
 * bootstrap now uses V2 via `getShimForRepo()`.
 */
export const PORTAL_V2_SHIM_V1: PreviewShim = {
  repoSlug: "dash/portal-v2",
  version: 1,
  patchContent: [
    { path: "src/lib/firebase.js", content: PORTAL_FIREBASE_STUB },
    { path: "src/contexts/AuthContext.js", content: PORTAL_AUTH_CONTEXT_STUB },
    { path: "src/services/apiService.js", content: PORTAL_API_SERVICE_STUB_V1 },
  ],
  filesAffected: [
    "src/lib/firebase.js",
    "src/contexts/AuthContext.js",
    "src/services/apiService.js",
  ],
}

/**
 * F3 — portal-v2 shim v2 (active). Mirrors backoffice v2: adds the axios
 * mock interceptor that returns preview fixture data on anonymous-401.
 */
export const PORTAL_V2_SHIM_V2: PreviewShim = {
  repoSlug: "dash/portal-v2",
  version: 2,
  patchContent: [
    { path: "src/lib/firebase.js", content: PORTAL_FIREBASE_STUB },
    { path: "src/contexts/AuthContext.js", content: PORTAL_AUTH_CONTEXT_STUB },
    { path: "src/services/apiService.js", content: PORTAL_API_SERVICE_STUB_V2 },
  ],
  filesAffected: PORTAL_V2_SHIM_V1.filesAffected,
}

// ──────────────────────────────────────────────────────────────────────────
// Registry + commit helpers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Active shim registry. F3 — points at v2 so bootstrap installs the axios
 * mock interceptor. v1 entries remain exported above for callers that
 * pin the older version explicitly (and for the v1 unit test contract).
 */
const SHIMS: PreviewShim[] = [BACKOFFICE_SHIM_V2, PORTAL_V2_SHIM_V2]

export function getShimForRepo(repoSlug: string): PreviewShim | null {
  return SHIMS.find((s) => s.repoSlug === repoSlug) ?? null
}

export function shimCommitMessage(shim: Pick<PreviewShim, "version">): string {
  return `preview-shim apply v${shim.version} [DO NOT MERGE]`
}

/**
 * Stable substring used by both the cherry-pick exclude filter (Agent D2) and
 * `verifyShimNotInBranch` below. The version digit is intentionally dropped so
 * we still catch shims tagged with future versions.
 */
const SHIM_COMMIT_SIGNAL = "preview-shim apply v"

export interface ApplyShimResult {
  ok: boolean
  commitSha?: string
  error?: string
}

/**
 * Apply a shim to a git working copy:
 *   1. Overwrite each patchContent file (creating parent dirs as needed).
 *   2. `git add <files>`.
 *   3. `git commit -m "preview-shim apply v<version> [DO NOT MERGE]"`.
 *
 * On success returns the new commit SHA; the orchestrator stores it under
 * `Store.sandboxState[repoSlug].shimCommitSha` for later cherry-pick exclusion.
 */
export async function applyShim(
  workspaceDir: string,
  shim: PreviewShim,
): Promise<ApplyShimResult> {
  // Sanity-check the workspace exists and is a git repo.
  try {
    await access(workspaceDir)
  } catch {
    return { ok: false, error: `workspace not found: ${workspaceDir}` }
  }
  const gitCheck = await runGit(["rev-parse", "--is-inside-work-tree"], workspaceDir)
  if (gitCheck.code !== 0 || gitCheck.stdout.trim() !== "true") {
    return { ok: false, error: `not a git repo: ${workspaceDir}` }
  }

  for (const op of shim.patchContent) {
    const absPath = safeJoin(workspaceDir, op.path)
    if (!absPath) {
      return { ok: false, error: `unsafe shim path: ${op.path}` }
    }
    try {
      await mkdir(dirname(absPath), { recursive: true })
      await writeFile(absPath, op.content, "utf8")
    } catch (err) {
      return { ok: false, error: `failed to write ${op.path}: ${(err as Error).message}` }
    }
  }

  const addResult = await runGit(
    ["add", "--", ...shim.patchContent.map((op) => op.path)],
    workspaceDir,
  )
  if (addResult.code !== 0) {
    return { ok: false, error: `git add failed: ${addResult.stderr.trim() || addResult.stdout.trim()}` }
  }

  // Use --allow-empty so re-applying an identical shim still produces a commit
  // we can reference. The orchestrator only ever calls applyShim once per
  // bootstrap, but defending against re-runs makes the flow idempotent.
  const commitResult = await runGit(
    ["commit", "--allow-empty", "-m", shimCommitMessage(shim)],
    workspaceDir,
  )
  if (commitResult.code !== 0) {
    return {
      ok: false,
      error: `git commit failed: ${commitResult.stderr.trim() || commitResult.stdout.trim()}`,
    }
  }

  const shaResult = await runGit(["rev-parse", "HEAD"], workspaceDir)
  if (shaResult.code !== 0) {
    return { ok: false, error: `git rev-parse HEAD failed: ${shaResult.stderr.trim()}` }
  }
  return { ok: true, commitSha: shaResult.stdout.trim() }
}

/**
 * Returns true when the named branch (or HEAD if branch omitted) contains NO
 * preview-shim commits. Used by the publish extractor (Agent D2) as a hard
 * gate before pushing to prod-bare.
 */
export async function verifyShimNotInBranch(
  workspaceDir: string,
  branchName?: string,
): Promise<boolean> {
  const ref = branchName ?? "HEAD"
  // %s = subject only; one commit per line.
  const result = await runGit(
    ["log", "--format=%s", ref],
    workspaceDir,
  )
  if (result.code !== 0) {
    // If the ref doesn't exist, treat as "shim not present" so callers that
    // pre-create empty branches get `true`. Real errors will surface from the
    // calling git ops anyway.
    return true
  }
  return !result.stdout.split("\n").some((line) =>
    line.trim().startsWith(SHIM_COMMIT_SIGNAL),
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Internal helpers (subprocess + path safety)
// ──────────────────────────────────────────────────────────────────────────

interface GitResult {
  stdout: string
  stderr: string
  code: number
}

/**
 * Minimal git subprocess wrapper. Phase D2 will extract this into
 * `src/runs/git-ops.ts` as a shared module; for D1 it lives here so the shim
 * applier has zero cross-module dependency.
 */
async function runGit(args: string[], cwd: string): Promise<GitResult> {
  return await new Promise<GitResult>((resolveProc) => {
    const child = spawn("git", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (d) => {
      stdout += d.toString("utf8")
    })
    child.stderr.on("data", (d) => {
      stderr += d.toString("utf8")
    })
    child.on("error", (err) => {
      resolveProc({ stdout, stderr: stderr + String(err), code: 1 })
    })
    child.on("close", (code) => {
      resolveProc({ stdout, stderr, code: code ?? 1 })
    })
  })
}

function safeJoin(base: string, rel: string): string | null {
  if (rel.includes("\0")) return null
  const absBase = resolve(base)
  const absPath = resolve(absBase, rel)
  if (absPath !== absBase && !absPath.startsWith(absBase + sep)) {
    return null
  }
  return absPath
}

/** Exposed for tests that want to inspect what the shim system reads back. */
export async function readShimFile(workspaceDir: string, relPath: string): Promise<string | null> {
  const abs = safeJoin(workspaceDir, relPath)
  if (!abs) return null
  try {
    return await readFile(abs, "utf8")
  } catch {
    return null
  }
}
