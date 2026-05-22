import { escapeHtml } from "../layout.js"

/**
 * OpenAI connect form — API-key-first with Codex CLI as a local-account option.
 *
 *   Path A — Bring your own OpenAI API key. This is the most portable path
 *   for future users and CI-like/local testing.
 *
 *   Path B — Use the official Codex CLI. If `codex` is installed and logged
 *   in, Dash Build can spawn `codex exec` per generation.
 *
 * The route layer exposes `activeMode` so the rendering caller can pre-
 * select the right card. If `activeMode === "codex-cli"`, that card is
 * marked "Ready — using Codex login". If neither is set,
 * the BYO form is the default focus.
 */
export interface OpenAIConnectOptions {
  /** Whether `codex` binary is on PATH (from /api/auth/openai GET). */
  codexCliInstalled?: boolean
  /** Optional version string from the probe. */
  codexCliVersion?: string | null
  /** Active mode if known — drives which card is highlighted. */
  activeMode?: "byo-key" | "codex-cli" | "none"
}

export function renderOpenAIConnectForm(
  opts: OpenAIConnectOptions = {},
): string {
  const codexReady = Boolean(opts.codexCliInstalled)
  const activeMode = opts.activeMode ?? "none"

  return `<div class="db-connect-shell" data-active-mode="${escapeHtml(activeMode)}">
    <header class="db-connect-head">
      <h2 class="db-connect-title">Connect OpenAI to start building</h2>
      <p class="db-connect-lede">Use an OpenAI API key for the most portable setup, or connect through the official Codex CLI when you want Dash Build to reuse your local Codex login.</p>
    </header>

    <div class="db-connect-grid">

      <!-- Path A: BYO API key -->
      <section class="db-connect-card${activeMode === "byo-key" ? " db-connect-card--active" : ""}" aria-labelledby="db-byo-title">
        <div class="db-connect-card-head">
          <span class="db-connect-card-tag">Path A · Recommended</span>
          <h3 class="db-connect-card-title" id="db-byo-title">Paste an OpenAI API key</h3>
        </div>
        <p class="db-connect-card-body">Best default for local testing, teams, and future package users. Stored AES-256-GCM encrypted, mode 0600.</p>
        <form class="db-connect-form" id="db-byo-form" autocomplete="off" novalidate>
          <label class="db-connect-label" for="db-byo-input">API key</label>
          <input
            type="password"
            id="db-byo-input"
            name="apiKey"
            class="db-connect-input"
            placeholder="sk-…"
            spellcheck="false"
            autocapitalize="off"
            autocorrect="off"
            required
            pattern="^sk-.+"
          />
          <button type="submit" class="db-button db-button-primary db-connect-submit">
            <span class="db-button-label">Save fallback key</span>
            <span class="db-button-arrow" aria-hidden="true">→</span>
          </button>
          <p class="db-connect-form-msg" id="db-byo-msg" aria-live="polite"></p>
        </form>
      </section>

      <!-- Path B: Codex CLI -->
      <section class="db-connect-card${activeMode === "codex-cli" ? " db-connect-card--active" : ""}" aria-labelledby="db-cli-title">
        <div class="db-connect-card-head">
          <span class="db-connect-card-tag">Path B · Local Codex</span>
          <h3 class="db-connect-card-title" id="db-cli-title">Use your OpenAI login via Codex</h3>
        </div>
        ${
          codexReady
            ? `<p class="db-connect-card-body">
                 <span class="db-connect-status db-connect-status--ok">●</span>
                 <code>codex</code> detected${opts.codexCliVersion ? ` <span class="db-connect-muted">(${escapeHtml(opts.codexCliVersion)})</span>` : ""}. Dash Build can spawn <code>codex exec</code> per prompt. Your OpenAI login stays inside Codex.
               </p>
               <div class="db-connect-actions">
                 <button type="button" class="db-button db-button-ghost db-connect-cli-use" id="db-cli-use">
                   <span class="db-button-label">Use Codex mode</span>
                 </button>
                 <button type="button" class="db-button db-button-secondary db-connect-cli-copy" id="db-cli-copy">
                   <span class="db-button-label">Copy login command</span>
                 </button>
               </div>
               <div class="db-connect-fallback" id="db-cli-fallback" hidden>
                 <p class="db-connect-fallback-title">Finish login in Terminal</p>
                 <ol class="db-connect-steps">
                   <li>Run <code>codex login --device-auth</code> in your terminal.</li>
                   <li>Complete the OpenAI sign-in page.</li>
                   <li>Refresh this dashboard.</li>
                 </ol>
               </div>`
            : `<p class="db-connect-card-body">
                 <span class="db-connect-status db-connect-status--pending">○</span>
                 <code>codex</code> not ready yet. Install or log in once in your terminal:
               </p>
               <pre class="db-connect-pre"><code>npm i -g @openai/codex
codex login --device-auth
# then refresh this page</code></pre>`
        }
      </section>

    </div>

    <footer class="db-connect-foot">
      <span class="db-connect-foot-dot">●</span>
      API key mode is the safest product default. Codex mode remains available for local users who already work inside Codex.
    </footer>
    <p class="db-connect-form-msg" id="db-cli-msg" aria-live="polite"></p>
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
            var res = await fetch("/api/auth/openai", {
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
      var cliCopyBtn = document.getElementById("db-cli-copy");
      var cliMsg = document.getElementById("db-cli-msg");
      var cliFallback = document.getElementById("db-cli-fallback");
      var cliPoll = null;
      var cliCommand = "codex login --device-auth";
      function setCliMessage(text, kind) {
        if (!cliMsg) return;
        cliMsg.textContent = text;
        cliMsg.className = "db-connect-form-msg" + (kind ? " db-connect-form-msg--" + kind : "");
      }
      function showCliFallback() {
        if (cliFallback) cliFallback.hidden = false;
      }
      async function copyCliCommand() {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(cliCommand);
          } else {
            var input = document.createElement("textarea");
            input.value = cliCommand;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
          }
          setCliMessage("Copied: " + cliCommand, "ok");
        } catch (err) {
          setCliMessage("Copy failed. Run: " + cliCommand, "err");
        }
      }
      if (cliCopyBtn) {
        cliCopyBtn.addEventListener("click", function () {
          showCliFallback();
          void copyCliCommand();
        });
      }
      if (cliBtn) {
        cliBtn.addEventListener("click", async function () {
          cliBtn.setAttribute("disabled", "disabled");
          setCliMessage("Starting Codex login…", "pending");
          try {
            var res = await fetch("/api/auth/openai/codex-cli/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" }
            });
            var body = await res.json().catch(function () { return {}; });
            if (!res.ok || !body.ok) {
              throw new Error(body.error || ("HTTP " + res.status));
            }
            if (body.status === "connected") {
              setCliMessage("Codex already connected. Reloading…", "ok");
              setTimeout(function () { window.location.reload(); }, 300);
              return;
            }
            if (body.verificationUrl) {
              window.open(body.verificationUrl, "_blank", "noopener");
            }
            setCliMessage(
              body.code
                ? "Finish login in the OpenAI page, then enter code: " + body.code
                : "Finish login in the OpenAI page we just opened.",
              "pending"
            );
            cliPoll = window.setInterval(async function () {
              try {
                var pollRes = await fetch("/api/auth/openai/codex-cli/session");
                var pollBody = await pollRes.json().catch(function () { return {}; });
                if (!pollRes.ok || !pollBody.ok) return;
                if (pollBody.status === "connected") {
                  if (cliPoll) window.clearInterval(cliPoll);
                  setCliMessage("Codex connected. Reloading…", "ok");
                  setTimeout(function () { window.location.reload(); }, 400);
                  return;
                }
                if (pollBody.status === "failed") {
                  if (cliPoll) window.clearInterval(cliPoll);
                  cliBtn.removeAttribute("disabled");
                  setCliMessage("Codex login failed. Check terminal auth and try again.", "err");
                }
              } catch (err) {
                // keep polling quietly
              }
            }, 2000);
          } catch (err) {
            cliBtn.removeAttribute("disabled");
            showCliFallback();
            setCliMessage("Dash Build could not start Codex login from the browser. Use the terminal command instead.", "err");
          }
        });
      }
    })();
  </script>`
}
