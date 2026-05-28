import type { IncomingMessage, ServerResponse } from "node:http"
import { userInfo } from "node:os"
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
import { BYOKeyStore } from "../../../auth/openai/byo-key.js"
import {
  CodexCliRunner,
  type CodexCliDeviceAuthSession,
} from "../../../auth/codex-cli/runner.js"
import {
  getInstallUrl,
  handleCallback,
  hasAppConfig,
  GitHubTokenStore,
} from "../../../integrations/github/index.js"

/**
 * Auth routes — OpenAI / Codex-first auth surface (May 2026).
 *
 * The previous implementation reused Claude Code's public OAuth client_id
 * (`9d1c250a-…`) to mint Pro/Max subscription tokens for daemon use. That
 * was banned by Anthropic's Consumer ToS update (Feb 2026, enforced
 * April 4 2026). See packages/dash-build/src/auth/anthropic/oauth-flow.ts
 * for the historical note.
 *
 * Two safe paths replace it:
 *
 *   Path A — Official Codex CLI:
 *     - GET /api/auth/openai/codex-cli → probe `codex --version` + login state.
 *     - No token storage — user runs `codex login --device-auth` once in their
 *       terminal; dash-build spawns `codex exec` as a subprocess and lets it
 *       manage its own auth state on disk.
 *
 *   Path B — Optional BYO OpenAI API key:
 *     - POST /api/auth/openai { apiKey } → encrypt + store via BYOKeyStore.
 *     - DELETE /api/auth/openai → clear key + flip auth.connected false.
 *     - GET /api/auth/openai → JSON describing both options + state.
 *
 * GitHub App flow remains a stub for Wave 5 (per-user pilot grant).
 */

const codexCli = new CodexCliRunner()
let pendingCodexLogin: CodexCliDeviceAuthSession | null = null

function makeKeyStore(): BYOKeyStore {
  return new BYOKeyStore()
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

  // ── OpenAI: Codex CLI probe (Path A) ───────────────────────────────────
  // Declared BEFORE the catch-all `/api/auth/openai` block so the
  // suffix matches first.
  if (pathname === "/api/auth/openai/codex-cli") {
    if (req.method !== "GET") return methodNotAllowed(res)
    void codexCli.probe().then((probe) => {
      sendJson(res, 200, {
        ok: true,
        installed: probe.installed,
        authenticated: probe.authenticated,
        version: probe.version,
        loginInstructions:
          "Run `codex login --device-auth` in your terminal once. dash-build will spawn `codex exec` as a subprocess for generation.",
      })
    })
    return
  }

  if (pathname === "/api/auth/openai/codex-cli/start") {
    if (req.method !== "POST") return methodNotAllowed(res)
    void (async () => {
      const probe = await codexCli.probe().catch(() => null)
      if (probe?.authenticated) {
        return sendJson(res, 200, {
          ok: true,
          status: "connected",
          authenticated: true,
        })
      }

      if (!pendingCodexLogin || pendingCodexLogin.completed) {
        pendingCodexLogin = await codexCli.startDeviceAuth()
      }

      sendJson(res, 200, {
        ok: true,
        status: pendingCodexLogin.completed
          ? pendingCodexLogin.success
            ? "connected"
            : "failed"
          : "pending",
        verificationUrl: pendingCodexLogin.verificationUrl,
        code: pendingCodexLogin.code,
      })
    })().catch((err) => {
      pendingCodexLogin = null
      badRequest(
        res,
        `codex_login_start_failed: ${(err as Error).message}. Run \`codex login --device-auth\` in your terminal, then refresh the dashboard.`,
      )
    })
    return
  }

  if (pathname === "/api/auth/openai/codex-cli/session") {
    if (req.method !== "GET") return methodNotAllowed(res)
    void (async () => {
      const probe = await codexCli.probe().catch(() => null)
      if (probe?.authenticated) {
        pendingCodexLogin = null
        return sendJson(res, 200, {
          ok: true,
          status: "connected",
          authenticated: true,
        })
      }
      if (!pendingCodexLogin) {
        return sendJson(res, 200, {
          ok: true,
          status: "idle",
          authenticated: false,
        })
      }

      const status = pendingCodexLogin.completed
        ? pendingCodexLogin.success
          ? "connected"
          : "failed"
        : "pending"

      const body = {
        ok: true,
        status,
        authenticated: false,
        verificationUrl: pendingCodexLogin.verificationUrl,
        code: pendingCodexLogin.code,
        error: pendingCodexLogin.error,
      }

      if (pendingCodexLogin.completed) {
        pendingCodexLogin = null
      }

      sendJson(res, 200, body)
    })().catch((err) => {
      badRequest(res, `codex_login_session_failed: ${(err as Error).message}`)
    })
    return
  }

  // ── OpenAI: Codex CLI + optional BYO API key ───────────────────────────
  if (pathname === "/api/auth/openai") {
    if (req.method === "GET") {
      void (async () => {
        const keyStore = makeKeyStore()
        const existing = await keyStore.load().catch(() => null)
        const cliProbe = await codexCli.probe()
        const activeMode: "byo-key" | "codex-cli" | "none" = cliProbe.authenticated
          ? "codex-cli"
          : existing
            ? "byo-key"
            : "none"
        sendJson(res, 200, {
          ok: true,
          provider: "openai",
          mode: existing ? "byo-key" : "none",
          activeMode,
          connected: activeMode !== "none",
          options: {
            codexCli: {
              description:
                "Use the official Codex CLI with your OpenAI / ChatGPT login. Run `codex login --device-auth` once; Dash Build spawns `codex exec` per generation.",
              endpoint: "GET /api/auth/openai/codex-cli",
            },
            byoKey: {
              description:
                "Optional fallback. Save an OpenAI API key (sk-*) for direct Responses API calls when you do not want to rely on local Codex auth.",
              endpoint: "POST /api/auth/openai",
            },
          },
          loginStatus: cliProbe.statusLine,
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
        if (!apiKey.startsWith("sk-")) {
          return badRequest(
            res,
            'invalid_apiKey_prefix (expected "sk-")',
          )
        }
        try {
          await makeKeyStore().save(apiKey)
        } catch (err) {
          return badRequest(res, `save_failed: ${(err as Error).message}`)
        }
        await store.setAuth("openai", {
          connected: true,
          user: "byo-key",
        })
        broadcaster.broadcast("auth:changed", { provider: "openai" })
        sendJson(res, 200, { ok: true, mode: "byo-key" })
      })()
      return
    }

    if (req.method === "DELETE") {
      void (async () => {
        await makeKeyStore().clear().catch(() => undefined)
        await store.setAuth("openai", { connected: false, user: null })
        broadcaster.broadcast("auth:changed", { provider: "openai" })
        sendJson(res, 200, { ok: true })
      })()
      return
    }

    return methodNotAllowed(res)
  }

  // ── GitHub App install + callback ──────────────────────────────────────
  //
  // Two paths:
  //
  //   Configured: DASH_BUILD_GITHUB_APP_ID + PRIVATE_KEY + CLIENT_ID +
  //   CLIENT_SECRET present in env. The dashboard "Connect GitHub" button
  //   POSTs `/api/auth/github` → we mint an install URL via the install-flow
  //   helper and 302 the user there. GitHub redirects back to
  //   `/api/auth/github/callback?installation_id=...&state=...`; we exchange
  //   that for accessible repos, persist via `GitHubTokenStore` (machine-key
  //   AES-256-GCM at `~/.dash-build/auth/github.json`), flip the store auth
  //   indicator, and broadcast `auth:changed` so the UI repaints.
  //
  //   Unconfigured: legacy stub behavior — return a structured error so the
  //   UI can surface "Set up GitHub App at github.com/settings/apps and
  //   export DASH_BUILD_GITHUB_* env vars". The fields match the README
  //   `GitHub App Setup` section so a copy-paste fixes the gap.
  //
  // PR creation itself is already wired through the orchestrator
  // (approvePR → submitChanges → createBranch + commitFiles +
  // createPullRequest). This file only handles the auth side of the loop.
  if (pathname === "/api/auth/github") {
    if (req.method !== "POST" && req.method !== "GET") return methodNotAllowed(res)
    if (!hasAppConfig()) {
      return sendJson(res, 503, {
        ok: false,
        error: "github_app_not_configured",
        message:
          "Set up the GitHub App at https://github.com/settings/apps and export " +
          "DASH_BUILD_GITHUB_APP_ID, DASH_BUILD_GITHUB_PRIVATE_KEY, " +
          "DASH_BUILD_GITHUB_CLIENT_ID, DASH_BUILD_GITHUB_CLIENT_SECRET. " +
          "See packages/dash-build/README.md `GitHub App Setup`.",
        setupUrl: "https://github.com/settings/apps",
      })
    }
    try {
      const { url } = getInstallUrl({ port: 0 })
      return sendRedirect(res, url)
    } catch (err) {
      return badRequest(res, `github_install_url_failed: ${(err as Error).message}`)
    }
  }

  if (pathname === "/api/auth/github/callback") {
    if (req.method !== "GET") return methodNotAllowed(res)
    if (!hasAppConfig()) {
      // Preserve the legacy stub payload so existing UI handlers don't break,
      // but report the underlying state honestly.
      void store
        .setAuth("github", { connected: false, repos: [] })
        .then(() => broadcaster.broadcast("auth:changed", { provider: "github" }))
      return sendJson(res, 200, {
        ok: true,
        provider: "github",
        connected: false,
        message: "github_app_stub_pending_per_user_pilot_grant",
      })
    }
    void (async () => {
      try {
        const url = new URL(req.url ?? "/", "http://localhost")
        const installationIdRaw = url.searchParams.get("installation_id")
        const setupAction = url.searchParams.get("setup_action") ?? "install"
        const state = url.searchParams.get("state") ?? undefined
        const installationId = installationIdRaw ? Number(installationIdRaw) : NaN
        if (!Number.isFinite(installationId) || installationId <= 0) {
          return badRequest(res, "missing_installation_id")
        }
        const callback = await handleCallback({
          installation_id: installationId,
          setup_action: setupAction,
          state,
        })
        const username = (() => {
          try {
            return userInfo().username
          } catch {
            return "dash-build"
          }
        })()
        const tokenStore = new GitHubTokenStore()
        await tokenStore.save({
          installationId: callback.installationId,
          user: username,
          accessibleRepos: callback.accessibleRepos,
          installedAt: new Date().toISOString(),
        })
        await store.setAuth("github", {
          connected: true,
          repos: callback.accessibleRepos.map((r) => r.fullName),
        })
        broadcaster.broadcast("auth:changed", { provider: "github" })
        sendJson(res, 200, {
          ok: true,
          provider: "github",
          connected: true,
          installationId: callback.installationId,
          setupAction: callback.setupAction,
          repos: callback.accessibleRepos,
        })
      } catch (err) {
        badRequest(res, `github_callback_failed: ${(err as Error).message}`)
      }
    })()
    return
  }

  return notFound(res)
}

// Test hook — preserved for backwards compatibility with older test imports.
// No in-memory state to reset now (OAuth pending map removed); kept as a
// no-op so any external caller doesn't break on upgrade.
export function __resetAuthPendingStateForTests(): void {
  /* no-op — OAuth pending state map was removed in May 2026 ToS fix */
}
