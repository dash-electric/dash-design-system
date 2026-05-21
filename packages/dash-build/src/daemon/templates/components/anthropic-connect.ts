import { escapeHtml } from "../layout.js"

/**
 * Anthropic connect form — two ToS-safe paths surfaced side-by-side.
 *
 *   Path A — Bring your own API key (sk-ant-*). Password-style input;
 *   POSTs to /api/auth/anthropic with { apiKey } and reloads on success.
 *
 *   Path B — Subprocess the official Claude Code CLI. If `claude` is on
 *   PATH, this card is rendered "ready"; otherwise it shows install hints.
 *
 * The route layer exposes `activeMode` so the rendering caller can pre-
 * select the right card. If `activeMode === "claude-cli"`, that card is
 * marked "Ready — using subscription via Claude Code". If neither is set,
 * the BYO form is the default focus.
 */
export interface AnthropicConnectOptions {
  /** Whether `claude` binary is on PATH (from /api/auth/anthropic GET). */
  claudeCliInstalled?: boolean
  /** Optional version string from the probe. */
  claudeCliVersion?: string | null
  /** Active mode if known — drives which card is highlighted. */
  activeMode?: "byo-key" | "claude-cli" | "none"
}

export function renderAnthropicConnectForm(
  opts: AnthropicConnectOptions = {},
): string {
  const claudeReady = Boolean(opts.claudeCliInstalled)
  const activeMode = opts.activeMode ?? "none"

  return `<div class="db-connect-shell" data-active-mode="${escapeHtml(activeMode)}">
    <header class="db-connect-head">
      <h2 class="db-connect-title">Connect Anthropic to start building</h2>
      <p class="db-connect-lede">Pick one. Both paths are ToS-safe — subscription OAuth via third-party token extraction was banned by Anthropic in April 2026 and is intentionally not offered here.</p>
    </header>

    <div class="db-connect-grid">

      <!-- Path A: BYO API key -->
      <section class="db-connect-card${activeMode === "byo-key" ? " db-connect-card--active" : ""}" aria-labelledby="db-byo-title">
        <div class="db-connect-card-head">
          <span class="db-connect-card-tag">Path A · Official</span>
          <h3 class="db-connect-card-title" id="db-byo-title">Paste an Anthropic API key</h3>
        </div>
        <p class="db-connect-card-body">Get one at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com/settings/keys</a>. Stored AES-256-GCM encrypted, mode 0600. You pay Anthropic per token.</p>
        <form class="db-connect-form" id="db-byo-form" autocomplete="off" novalidate>
          <label class="db-connect-label" for="db-byo-input">API key</label>
          <input
            type="password"
            id="db-byo-input"
            name="apiKey"
            class="db-connect-input"
            placeholder="sk-ant-…"
            spellcheck="false"
            autocapitalize="off"
            autocorrect="off"
            required
            pattern="^sk-ant-.+"
          />
          <button type="submit" class="db-button db-button-primary db-connect-submit">
            <span class="db-button-label">Save & connect</span>
            <span class="db-button-arrow" aria-hidden="true">→</span>
          </button>
          <p class="db-connect-form-msg" id="db-byo-msg" aria-live="polite"></p>
        </form>
      </section>

      <!-- Path B: Claude Code CLI subprocess -->
      <section class="db-connect-card${activeMode === "claude-cli" ? " db-connect-card--active" : ""}" aria-labelledby="db-cli-title">
        <div class="db-connect-card-head">
          <span class="db-connect-card-tag">Path B · Subscription</span>
          <h3 class="db-connect-card-title" id="db-cli-title">Use your Claude Code subscription</h3>
        </div>
        ${
          claudeReady
            ? `<p class="db-connect-card-body">
                 <span class="db-connect-status db-connect-status--ok">●</span>
                 <code>claude</code> detected${opts.claudeCliVersion ? ` <span class="db-connect-muted">(${escapeHtml(opts.claudeCliVersion)})</span>` : ""}. Dash Build will spawn <code>claude -p</code> as a subprocess per prompt. Subscription tokens never leave Claude Code.
               </p>
               <button type="button" class="db-button db-button-ghost db-connect-cli-use" id="db-cli-use">
                 <span class="db-button-label">Use Claude Code mode</span>
               </button>`
            : `<p class="db-connect-card-body">
                 <span class="db-connect-status db-connect-status--pending">○</span>
                 <code>claude</code> not on PATH. Install + log in once in your terminal:
               </p>
               <pre class="db-connect-pre"><code>npm i -g @anthropic-ai/claude-code
claude login
# then refresh this page</code></pre>`
        }
      </section>

    </div>

    <footer class="db-connect-foot">
      <span class="db-connect-foot-dot">●</span>
      Subscription-extraction OAuth using Claude Code's public client_id was banned by Anthropic Feb 2026 (enforced Apr 4 2026). Tools that did it (OpenClaw, OpenCode, Roo Code, Goose) had tokens blocked.
    </footer>
  </div>
  <script>
    (function () {
      var form = document.getElementById("db-byo-form");
      var msg = document.getElementById("db-byo-msg");
      if (form) {
        form.addEventListener("submit", async function (ev) {
          ev.preventDefault();
          var input = document.getElementById("db-byo-input");
          var apiKey = input && input.value ? input.value.trim() : "";
          msg.textContent = "Saving…";
          msg.className = "db-connect-form-msg db-connect-form-msg--pending";
          try {
            var res = await fetch("/api/auth/anthropic", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ apiKey: apiKey }),
            });
            var body = await res.json().catch(function () { return {}; });
            if (res.ok && body.ok) {
              msg.textContent = "Connected. Reloading…";
              msg.className = "db-connect-form-msg db-connect-form-msg--ok";
              setTimeout(function () { window.location.reload(); }, 400);
            } else {
              msg.textContent = "Error: " + (body.error || ("HTTP " + res.status));
              msg.className = "db-connect-form-msg db-connect-form-msg--err";
            }
          } catch (err) {
            msg.textContent = "Network error: " + (err && err.message ? err.message : String(err));
            msg.className = "db-connect-form-msg db-connect-form-msg--err";
          }
        });
      }

      var cliBtn = document.getElementById("db-cli-use");
      if (cliBtn) {
        cliBtn.addEventListener("click", function () {
          // Claude CLI mode is automatic — server probes per request.
          // Just reload so the dashboard picks up the active mode.
          window.location.reload();
        });
      }
    })();
  </script>`
}
