/**
 * Dash Build dashboard client JS — embedded as a string and served from
 * /static/app.js. Pure browser code, no build step required.
 *
 * Responsibilities:
 *   - WebSocket connect to /ws with exponential backoff reconnect
 *   - Update WS indicator pill (connected / reconnecting / disconnected)
 *   - Refresh prompt list via /api/status on push events
 *   - POST /api/prompt on submit; clear input + show spinner round-trip
 *   - Handle prompt-card approve buttons (delegated)
 */

export const DASHBOARD_JS = `
(function () {
  "use strict";

  // ---------- HTML escape (for toast user-supplied strings) ----------
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ---------- Toast system ----------
  function showToast(opts) {
    if (!opts || !opts.message) return;
    var container = document.getElementById("db-toasts");
    if (!container) return;
    var kind = opts.kind || "info";
    var duration = typeof opts.duration === "number" ? opts.duration : 4000;
    var toast = document.createElement("div");
    toast.className = "db-toast " + kind;
    toast.setAttribute("role", kind === "error" ? "alert" : "status");
    var html = '<div class="db-toast-msg">' + escapeHtml(opts.message) + '</div>';
    if (opts.action && opts.action.label && opts.action.href) {
      html += '<a class="db-toast-action" href="' + escapeHtml(opts.action.href) + '" target="_blank" rel="noopener">' + escapeHtml(opts.action.label) + '</a>';
    }
    toast.innerHTML = html;
    container.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("show"); });
    if (duration > 0) {
      setTimeout(function () {
        toast.classList.remove("show");
        setTimeout(function () { if (toast.parentNode) toast.remove(); }, 220);
      }, duration);
    }
  }
  // Expose for debugging / external triggers.
  window.dashBuildShowToast = showToast;

  // ---------- Theme toggle (system + manual) ----------
  (function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem("dash-build-theme"); } catch (e) {}
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    }
    var btn = document.getElementById("db-theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        if (!current) {
          current = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("dash-build-theme", next); } catch (e) {}
      });
    }
  })();

  // ---------- WS indicator ----------
  var indicator = document.getElementById("db-ws-indicator");
  function setWsState(state, label) {
    if (!indicator) return;
    indicator.setAttribute("data-state", state);
    var labelEl = indicator.querySelector(".db-ws-label");
    if (labelEl) labelEl.textContent = label;
  }

  // ---------- Reconnect with exponential backoff ----------
  var reconnectAttempt = 0;
  var reconnectTimer = null;
  var maxDelay = 30000;
  var baseDelay = 800;
  var manualRetryHandler = null;

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectAttempt += 1;
    // exp backoff with jitter
    var delay = Math.min(maxDelay, baseDelay * Math.pow(2, reconnectAttempt - 1));
    var jitter = Math.random() * 250;
    var wait = delay + jitter;
    setWsState("reconnecting", "Reconnecting…");
    reconnectTimer = setTimeout(function () {
      reconnectTimer = null;
      connectWs();
    }, wait);

    // On extended reconnect (3+ attempts), show skeleton to signal stale data.
    if (reconnectAttempt === 3) {
      showSkeletonInPrompts();
    }

    // After 6 attempts (~ 51s+), surface a manual retry prompt
    if (reconnectAttempt >= 6) {
      setWsState("disconnected", "Disconnected — click to retry");
      if (indicator && !manualRetryHandler) {
        manualRetryHandler = function () {
          reconnectAttempt = 0;
          if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
          connectWs();
        };
        indicator.style.cursor = "pointer";
        indicator.addEventListener("click", manualRetryHandler);
      }
    }
  }

  function clearReconnect() {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    reconnectAttempt = 0;
    if (indicator && manualRetryHandler) {
      indicator.removeEventListener("click", manualRetryHandler);
      indicator.style.cursor = "";
      manualRetryHandler = null;
    }
  }

  // ---------- WS connect ----------
  var ws = null;
  function connectWs() {
    try {
      var proto = location.protocol === "https:" ? "wss:" : "ws:";
      ws = new WebSocket(proto + "//" + location.host + "/ws");
      ws.onopen = function () {
        clearReconnect();
        setWsState("connected", "Connected");
      };
      ws.onclose = function () {
        scheduleReconnect();
      };
      ws.onerror = function () {
        // onclose will fire after; let it handle scheduling
      };
      ws.onmessage = function (ev) {
        try {
          var msg = JSON.parse(ev.data);
          if (msg.event === "prompts:changed" || msg.event === "auth:changed") {
            refreshDashboard();
          }
          // Toast-worthy events.
          switch (msg.event) {
            case "pr:created":
              showToast({
                message: "PR opened" + (msg.prNumber ? ": #" + msg.prNumber : ""),
                kind: "success",
                action: msg.prUrl ? { label: "View on GitHub →", href: msg.prUrl } : undefined,
              });
              break;
            case "generation:complete":
              showToast({
                message: "Generation done" + (msg.score != null ? " (score " + msg.score + "/100)" : ""),
                kind: msg.score != null && msg.score >= 85 ? "success" : "warn",
              });
              break;
            case "clarification:needed":
              showToast({
                message: "I need a few clarifications before generating",
                kind: "info",
              });
              break;
            case "prompts:changed":
              if (msg.status === "failed") {
                showToast({ message: "Prompt failed", kind: "error" });
              }
              break;
          }
        } catch (e) { /* ignore malformed */ }
      };
    } catch (e) {
      scheduleReconnect();
    }
  }

  // ---------- Refresh ----------
  // Soft refresh: re-fetches /dashboard and swaps the prompt list region.
  // Falls back to full reload if anything goes sideways.
  var refreshInFlight = false;
  function promptListSkeleton(count) {
    var n = Math.max(1, count || 3);
    var card = '<div class="db-skeleton-card" aria-hidden="true">' +
      '<div class="db-skeleton-line" style="width: 60%"></div>' +
      '<div class="db-skeleton-line" style="width: 90%; margin-top: 8px"></div>' +
      '<div class="db-skeleton-line" style="width: 40%; margin-top: 12px"></div>' +
      '</div>';
    var parts = [];
    for (var i = 0; i < n; i++) parts.push(card);
    return '<div class="db-skeleton-list" aria-busy="true" aria-live="polite">' + parts.join("") + '</div>';
  }
  function showSkeletonInPrompts() {
    var region = document.getElementById("db-prompts-region");
    if (region && !region.querySelector(".db-skeleton-list")) {
      region.innerHTML = promptListSkeleton(3);
    }
  }
  function refreshDashboard() {
    if (refreshInFlight) return;
    refreshInFlight = true;
    fetch("/dashboard", { headers: { "Accept": "text/html" } })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (html) {
        if (!html) return;
        try {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, "text/html");
          var newList = doc.getElementById("db-prompts-region");
          var oldList = document.getElementById("db-prompts-region");
          if (newList && oldList) {
            oldList.innerHTML = newList.innerHTML;
          }
          var newAuth = doc.getElementById("db-auth-region");
          var oldAuth = document.getElementById("db-auth-region");
          if (newAuth && oldAuth) {
            oldAuth.innerHTML = newAuth.innerHTML;
          }
        } catch (e) { /* swallow */ }
      })
      .catch(function () { /* ignore */ })
      .finally(function () { refreshInFlight = false; });
  }

  // ---------- Submit prompt ----------
  var submitBtn = document.getElementById("db-prompt-submit");
  var input = document.getElementById("db-prompt-input");
  var repoSelect = document.getElementById("db-repo-select");
  var branchInput = document.getElementById("db-branch-input");

  function submitPrompt() {
    if (!submitBtn || !input) return;
    var text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }
    submitBtn.disabled = true;
    var origLabel = submitBtn.querySelector(".db-button-label");
    var origText = origLabel ? origLabel.textContent : "";
    if (origLabel) origLabel.textContent = "Submitting…";

    var payload = { text: text };
    if (repoSelect && repoSelect.value) payload.repo = repoSelect.value;
    if (branchInput && branchInput.value) payload.branch = branchInput.value;

    fetch("/api/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        if (!r.ok) throw new Error("submit_failed");
        return r.json();
      })
      .then(function () {
        input.value = "";
        // WS push will refresh; do an immediate refresh too as belt-and-braces
        refreshDashboard();
      })
      .catch(function () {
        input.classList.add("db-textarea-error");
        setTimeout(function () { input.classList.remove("db-textarea-error"); }, 1200);
        showToast({ message: "Could not submit prompt — please retry", kind: "error" });
      })
      .finally(function () {
        submitBtn.disabled = false;
        if (origLabel) origLabel.textContent = origText;
      });
  }

  if (submitBtn) submitBtn.addEventListener("click", submitPrompt);
  if (input) {
    input.addEventListener("keydown", function (ev) {
      if ((ev.metaKey || ev.ctrlKey) && ev.key === "Enter") {
        ev.preventDefault();
        submitPrompt();
      }
    });
  }

  // ---------- Delegated: approve action ----------
  document.addEventListener("click", function (ev) {
    var target = ev.target;
    if (!target || !target.closest) return;
    var btn = target.closest("[data-prompt-approve]");
    if (!btn) return;
    ev.preventDefault();
    var id = btn.getAttribute("data-prompt-approve");
    if (!id) return;
    btn.setAttribute("disabled", "true");
    fetch("/api/prompts/" + encodeURIComponent(id) + "/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    })
      .then(function (r) { return r.json(); })
      .then(function () { refreshDashboard(); })
      .catch(function () { btn.removeAttribute("disabled"); });
  });

  // ---------- Repo select persistence ----------
  if (repoSelect) {
    repoSelect.addEventListener("change", function () {
      var val = repoSelect.value;
      var branch = branchInput ? branchInput.value : "main";
      fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: val, branch: branch }),
      }).catch(function () { /* best-effort */ });
    });
  }

  // ---------- Boot ----------
  setWsState("connecting", "Connecting…");
  connectWs();
})();
`
