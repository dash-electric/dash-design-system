import type { IncomingMessage, ServerResponse } from "node:http"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import type { Store } from "../../state/store.js"
import type { Broadcaster } from "../../ws/broadcaster.js"
import {
  badRequest,
  methodNotAllowed,
  notFound,
  readJsonBody,
  sendJson,
  sendRedirect,
} from "../_helpers.js"
import { BYOKeyStore } from "../../../auth/anthropic/byo-key.js"

/**
 * Auth routes — ToS-safe rewrite (May 2026).
 *
 * The previous implementation reused Claude Code's public OAuth client_id
 * (`9d1c250a-…`) to mint Pro/Max subscription tokens for daemon use. That
 * was banned by Anthropic's Consumer ToS update (Feb 2026, enforced
 * April 4 2026). See packages/dash-build/src/auth/anthropic/oauth-flow.ts
 * for the historical note.
 *
 * Two ToS-safe paths replace it:
 *
 *   Path A — BYO Anthropic API key (default, official):
 *     - POST /api/auth/anthropic { apiKey } → encrypt + store via BYOKeyStore.
 *     - DELETE /api/auth/anthropic → clear key + flip auth.connected false.
 *     - GET /api/auth/anthropic → JSON describing both options + state.
 *
 *   Path B — Claude Code subprocess (optional, subscription-friendly):
 *     - GET /api/auth/anthropic/claude-cli → probe `claude --version` on PATH.
 *     - No token storage — user runs `claude login` once in their terminal;
 *       dash-build spawns `claude` as a subprocess and lets it manage its
 *       own auth state on disk. This is ToS-safe because no third-party
 *       app is extracting or reusing Claude Code's tokens.
 *
 * GitHub App flow remains a stub for Wave 5 (per-user pilot grant).
 */

const PORT = Number(process.env.DASH_BUILD_PORT ?? 7777)

const execAsync = promisify(exec)

function makeKeyStore(): BYOKeyStore {
  return new BYOKeyStore()
}

async function probeClaudeCli(): Promise<{
  installed: boolean
  version: string | null
}> {
  try {
    const { stdout } = await execAsync("claude --version", { timeout: 3000 })
    const version = stdout.trim() || null
    return { installed: true, version }
  } catch {
    return { installed: false, version: null }
  }
}

export function handleAuthRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  store: Store,
  broadcaster: Broadcaster,
): void {
  // ── Status ─────────────────────────────────────────────────────────────
  if (pathname === "/api/auth/status") {
    if (req.method !== "GET") return methodNotAllowed(res)
    return sendJson(res, 200, { ok: true, auth: store.getAuth() })
  }

  // ── Anthropic: Claude CLI probe (Path B) ───────────────────────────────
  // Declared BEFORE the catch-all `/api/auth/anthropic` block so the
  // suffix matches first.
  if (pathname === "/api/auth/anthropic/claude-cli") {
    if (req.method !== "GET") return methodNotAllowed(res)
    void probeClaudeCli().then((probe) => {
      sendJson(res, 200, {
        ok: true,
        installed: probe.installed,
        version: probe.version,
        loginInstructions:
          "Run `claude login` in your terminal once. dash-build will spawn `claude` as a subprocess for generation.",
      })
    })
    return
  }

  // ── Anthropic: BYO API key (Path A) ────────────────────────────────────
  if (pathname === "/api/auth/anthropic") {
    if (req.method === "GET") {
      void (async () => {
        const keyStore = makeKeyStore()
        const existing = await keyStore.load().catch(() => null)
        // Probe Claude CLI to surface the *active* effective mode. The
        // dashboard uses this to indicate whether generation will route
        // via BYO HTTP API or `claude` subprocess. TODO(agent-b chat-ui):
        // surface activeMode in the dashboard header pill once chat
        // rewrite lands.
        const cliProbe = existing ? { installed: false } : await probeClaudeCli()
        const activeMode: "byo-key" | "claude-cli" | "none" = existing
          ? "byo-key"
          : cliProbe.installed
            ? "claude-cli"
            : "none"
        sendJson(res, 200, {
          ok: true,
          provider: "anthropic",
          mode: existing ? "byo-key" : "none",
          activeMode,
          connected: existing !== null,
          options: {
            byoKey: {
              description:
                "Bring your own Anthropic API key (sk-ant-*). Get one at https://console.anthropic.com/. POST { apiKey } here to save.",
              endpoint: "POST /api/auth/anthropic",
            },
            claudeCli: {
              description:
                "Subprocess the official Claude Code CLI. Run `claude login` in your terminal once; dash-build spawns `claude` per generation. ToS-safe because the user runs the official CLI — no third-party token extraction.",
              endpoint: "GET /api/auth/anthropic/claude-cli",
            },
          },
          tosNote:
            "Subscription OAuth (Claude Pro/Max token extraction) was banned by Anthropic effective April 4 2026 and is no longer supported.",
        })
      })()
      return
    }

    if (req.method === "POST") {
      void (async () => {
        let body: { apiKey?: string }
        try {
          body = await readJsonBody<{ apiKey?: string }>(req)
        } catch {
          return badRequest(res, "invalid_json_body")
        }
        const apiKey = body.apiKey?.trim()
        if (!apiKey) return badRequest(res, "missing_apiKey")
        if (!apiKey.startsWith("sk-ant-")) {
          return badRequest(
            res,
            'invalid_apiKey_prefix (expected "sk-ant-")',
          )
        }
        try {
          await makeKeyStore().save(apiKey)
        } catch (err) {
          return badRequest(res, `save_failed: ${(err as Error).message}`)
        }
        await store.setAuth("anthropic", {
          connected: true,
          user: "byo-key",
        })
        broadcaster.broadcast("auth:changed", { provider: "anthropic" })
        sendJson(res, 200, { ok: true, mode: "byo-key" })
      })()
      return
    }

    if (req.method === "DELETE") {
      void (async () => {
        await makeKeyStore().clear().catch(() => undefined)
        await store.setAuth("anthropic", { connected: false, user: null })
        broadcaster.broadcast("auth:changed", { provider: "anthropic" })
        sendJson(res, 200, { ok: true })
      })()
      return
    }

    return methodNotAllowed(res)
  }

  // ── GitHub: still stub (Wave 5 = per-user pilot grant) ─────────────────
  if (pathname === "/api/auth/github") {
    if (req.method !== "POST" && req.method !== "GET") return methodNotAllowed(res)
    return sendRedirect(res, "/api/auth/github/callback?stub=1")
  }

  if (pathname === "/api/auth/github/callback") {
    void store
      .setAuth("github", { connected: false, repos: [] })
      .then(() => broadcaster.broadcast("auth:changed", { provider: "github" }))
    return sendJson(res, 200, {
      ok: true,
      provider: "github",
      message: "github_app_stub_pending_per_user_pilot_grant",
    })
  }

  return notFound(res)
}

// Test hook — preserved for backwards compatibility with older test imports.
// No in-memory state to reset now (OAuth pending map removed); kept as a
// no-op so any external caller doesn't break on upgrade.
export function __resetAuthPendingStateForTests(): void {
  /* no-op — OAuth pending state map was removed in May 2026 ToS fix */
}
