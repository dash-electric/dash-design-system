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

  // ---------- Tier 4 #16: dev CSS live-reload ----------
  // Called when the daemon broadcasts a "static:refresh" event. Swaps every
  // <link rel="stylesheet" href="/static/app.css"> href with a cache-busting
  // ?t=<now> query string so the browser fetches the freshly-rebuilt CSS
  // without a full page reload (which would lose component state, scroll
  // position, draft prompt text, etc).
  function reloadStaticCss() {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    var swapped = 0;
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute("href") || "";
      // Only swap our own stylesheet — leave font / CDN sheets alone.
      if (href.indexOf("/static/app.css") < 0) continue;
      var base = href.split("?")[0];
      link.setAttribute("href", base + "?t=" + Date.now());
      swapped += 1;
    }
    if (swapped === 0) return;
    try {
      // Surface in console so dev knows the watcher fired even if the
      // visual diff is subtle.
      // eslint-disable-next-line no-console
      console.info("[dash-build] static:refresh — reloaded", swapped, "stylesheet(s)");
    } catch (e) { /* defensive */ }
  }
  // Expose for tests + manual triggers in the dev console.
  window.dashBuildReloadStaticCss = reloadStaticCss;

  // Theme toggle removed — dashboard is light-only per Dash DS (May 2026).
  // Force-clear any persisted preference so users who saw the toggle
  // earlier don't get stuck on a now-undefined "dark" state.
  try { localStorage.removeItem("dash-build-theme"); } catch (e) {}
  document.documentElement.removeAttribute("data-theme");

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
          // Tier 4 #16: dev-only HMR signal. The daemon's DevWatcher fires
          // this when a CSS / template source changes. We swap the
          // /static/app.css <link> href with a cache-busting query string so
          // the browser re-fetches without a full reload. Safe in prod —
          // the daemon only emits this when DASH_BUILD_WATCH=1.
          if (msg.event === "static:refresh") {
            reloadStaticCss();
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
            case "sandbox:state_changed":
              // Sprint 1C: SandboxStateMachine emits this on every
              // bootstrap/run/rollback/sweep transition. Refresh the dashboard
              // so the topbar badge reflects the new state, plus a small
              // non-intrusive toast for transitions the user actively cares
              // about. Lifecycle-only bootstrap steps (clean → cloned →
              // shim_applied → idle) refresh silently to avoid toast spam.
              refreshDashboard();
              if (
                msg.to === "generating" ||
                msg.to === "preview_ready" ||
                msg.to === "publishing" ||
                msg.to === "stale" ||
                msg.to === "clone_running"
              ) {
                showToast({
                  message: "Sandbox: " + String(msg.to).replace(/_/g, " "),
                  kind: msg.to === "stale" ? "warn"
                    : msg.to === "clone_running" ? "success"
                    : "info",
                });
              }
              break;
            case "sandbox:dev_server_starting":
              // F3: orchestrator cascade kicked workspace.startDevServer().
              // Refresh so the badge can render the primary-pulse loading
              // state; toast is informational only.
              refreshDashboard();
              showToast({
                message: "Starting dev server" +
                  (msg.port ? " on :" + msg.port : "") + "…",
                kind: "info",
              });
              break;
            case "sandbox:dev_server_ready":
              // F3: workspace.startDevServer() resolved → port listening.
              // Refresh so the canvas resolver (F2) can flip the iframe from
              // staging to http://127.0.0.1:<port>.
              refreshDashboard();
              showToast({
                message: "Dev server ready" +
                  (msg.port ? " on :" + msg.port : "") + " — clone live",
                kind: "success",
              });
              break;
            case "sandbox:dev_server_failed":
              // F3: dev server failed to start (timeout, port collision,
              // npm script missing, …). The badge auto-renders an error
              // tone with a click-to-retry button; toast doubles as a hint.
              refreshDashboard();
              showToast({
                message: "Dev server failed to start — click the badge to retry",
                kind: "error",
                duration: 8000,
              });
              break;
            case "sandbox:dev_server_crashed":
              // F1: child exited unexpectedly AFTER ready (Next.js OOM,
              // syntax error in user code, manual kill from a debugger).
              // State already stepped clone_running → idle inside Workspace;
              // we surface here so the user can retry without hunting for
              // daemon stderr.
              refreshDashboard();
              showToast({
                message: "Dev server crashed" +
                  (msg.port ? " (port :" + msg.port + ")" : "") +
                  " — click the badge to retry",
                kind: "error",
                duration: 8000,
              });
              break;
            case "auth:reconnected":
              // Sprint 1B: AutoReconnect recovered the OpenAI link. Toast +
              // refresh so the rail empty state collapses into the live chat.
              showToast({
                message:
                  "Reconnected" +
                  (msg.mode ? " via " + String(msg.mode) : ""),
                kind: "success",
              });
              refreshDashboard();
              break;
            case "auth:reconnect_failed":
              // Sprint 1B: AutoReconnect tried both fallbacks and gave up.
              // Surface a warning toast with a hint to use the manual reconnect
              // button (already visible in the rail empty state).
              showToast({
                message:
                  "Could not reconnect OpenAI" +
                  (msg.reason ? " (" + String(msg.reason) + ")" : "") +
                  " — try Settings or paste a new key.",
                kind: "warn",
                duration: 6000,
              });
              break;
          }
        } catch (e) { /* ignore malformed */ }
      };
    } catch (e) {
      scheduleReconnect();
    }
  }

  // ---------- Refresh ----------
  // Soft refresh: re-fetches the legacy dashboard payload and swaps the
  // prompt list region. Falls back to full reload if anything goes sideways.
  // Tier 2 #6 (2026-05-28): /dashboard now 302s to / for new shell users —
  // pass ?legacy=1 to opt back into the classic prompt-list HTML the swap
  // logic depends on.
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
    fetch("/dashboard?legacy=1", { headers: { "Accept": "text/html" } })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (html) {
        if (!html) return;
        try {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, "text/html");
          // Chat thread (new layout) — swap inner.
          var newThread = doc.getElementById("db-chat-thread");
          var oldThread = document.getElementById("db-chat-thread");
          if (newThread && oldThread) {
            oldThread.outerHTML = newThread.outerHTML;
            scrollChatToBottom();
          }
          // Preview pane (new layout) — swap inner.
          var newPreview = doc.getElementById("db-preview-pane");
          var oldPreview = document.getElementById("db-preview-pane");
          if (newPreview && oldPreview) {
            oldPreview.outerHTML = newPreview.outerHTML;
            bootPreviewControls();
          }
          // Legacy prompt list region (classic layout + hidden fallback).
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
          hydrateInlineClarifications();
          // Phase B3 — re-highlight any code panel that was swapped in.
          if (typeof highlightCodePanel === "function") highlightCodePanel();
        } catch (e) { /* swallow */ }
      })
      .catch(function () { /* ignore */ })
      .finally(function () { refreshInFlight = false; });
  }

  // ---------- Chat helpers ----------
  function scrollChatToBottom() {
    var scroll = document.getElementById("db-chat-scroll");
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }
  function appendChatMessage(role, content, status) {
    var thread = document.getElementById("db-chat-thread");
    if (!thread) return;
    // Canvas-first workspace (P1.2A) keeps a hidden compat node — never mount
    // optimistic bubbles into it.
    if (thread.hasAttribute("hidden")) return;
    // If the thread is in empty state (a DIV, not a UL), upgrade it.
    if (thread.tagName !== "UL") {
      var ul = document.createElement("ul");
      ul.id = "db-chat-thread";
      ul.className = "db-chat-thread";
      ul.setAttribute("aria-live", "polite");
      thread.parentNode.replaceChild(ul, thread);
      thread = ul;
    }
    var li = document.createElement("li");
    li.className = "db-chat-msg";
    li.setAttribute("data-role", role);
    li.setAttribute("data-status", status || "ok");
    var bubble = document.createElement("div");
    bubble.className = "db-chat-bubble";
    if (status === "running") {
      bubble.innerHTML = '<span class="db-chat-typing" aria-label="Builder is thinking"><span></span><span></span><span></span></span>';
    } else {
      // Text goes directly into .db-chat-bubble — no inner wrapper span.
      // Removed .db-chat-bubble-text 2026-05-28 (purely structural, no CSS).
      bubble.textContent = content;
    }
    li.appendChild(bubble);
    thread.appendChild(li);
    scrollChatToBottom();
    return li;
  }

  // ---------- Inline clarification forms ----------
  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }
  function clarificationPromptIds() {
    var ids = [];
    var seen = {};
    // P1.1 R4: card-style mount is the new primary surface.
    document.querySelectorAll("[data-clarify-mount]").forEach(function (el) {
      var id = el.getAttribute("data-clarify-mount");
      if (!id || seen[id]) return;
      seen[id] = true;
      ids.push(id);
    });
    document.querySelectorAll("[data-clarification-focus]").forEach(function (el) {
      var id = el.getAttribute("data-clarification-focus");
      if (!id || seen[id]) return;
      seen[id] = true;
      ids.push(id);
    });
    return ids;
  }
  function findBuilderMessage(promptId) {
    var nodes = document.querySelectorAll(".db-chat-msg[data-role='builder'][data-prompt-id]");
    for (var i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].getAttribute("data-prompt-id") === promptId) return nodes[i];
    }
    return null;
  }
  function renderInlineQuestion(session) {
    var count = (session.questions || []).length;
    var html = '<form class="db-inline-question" data-inline-clarification="' + escapeHtml(session.promptId) + '">' +
      '<div class="db-inline-question-head">' +
      '<div><p class="db-inline-question-title">Quick context check</p>' +
      '<p class="db-inline-question-sub">Answer here; Dash Build continues without opening a new page.</p></div>' +
      '<span class="db-inline-question-pill">' + count + ' question' + (count === 1 ? '' : 's') + '</span>' +
      '</div>';
    (session.questions || []).forEach(function (q) {
      html += '<div class="db-inline-q" data-q-id="' + escapeHtml(q.id) + '" data-q-type="' + escapeHtml(q.type) + '" data-required="' + (q.required ? 'true' : 'false') + '">' +
        '<div class="db-inline-q-label">' + escapeHtml(q.text) + (q.required ? ' <span aria-label="required">*</span>' : '') + '</div>' +
        (q.rationale ? '<p class="db-inline-q-help">' + escapeHtml(q.rationale) + '</p>' : '');
      if (q.type === "single-choice" || q.type === "multi-choice") {
        var inputType = q.type === "multi-choice" ? "checkbox" : "radio";
        html += '<div class="db-inline-options">';
        (q.options || []).forEach(function (opt) {
          html += '<label class="db-inline-option"><input type="' + inputType + '" name="' + escapeHtml(q.id) + '" value="' + escapeHtml(opt) + '"><span>' + escapeHtml(opt) + '</span></label>';
        });
        html += '</div>';
      } else if (q.type === "yes-no") {
        html += '<div class="db-inline-options">' +
          '<label class="db-inline-option"><input type="radio" name="' + escapeHtml(q.id) + '" value="true"><span>Yes</span></label>' +
          '<label class="db-inline-option"><input type="radio" name="' + escapeHtml(q.id) + '" value="false"><span>No</span></label>' +
          '</div>';
      } else {
        html += '<textarea class="db-inline-textarea" name="' + escapeHtml(q.id) + '" placeholder="Type the missing context…"></textarea>';
      }
      html += '</div>';
    });
    html += '<div class="db-inline-question-foot">' +
      '<span class="db-inline-question-msg" aria-live="polite">This updates PRD and design context.</span>' +
      '<button type="submit" class="db-inline-question-submit">Continue →</button>' +
      '</div></form>';
    return html;
  }
  function readInlineAnswers(form) {
    var answers = [];
    var missing = null;
    form.querySelectorAll(".db-inline-q").forEach(function (row) {
      var id = row.getAttribute("data-q-id");
      var type = row.getAttribute("data-q-type");
      var required = row.getAttribute("data-required") === "true";
      var answer;
      if (type === "single-choice" || type === "yes-no") {
        var checked = row.querySelector("input:checked");
        if (checked) answer = type === "yes-no" ? checked.value === "true" : checked.value;
      } else if (type === "multi-choice") {
        answer = Array.prototype.slice.call(row.querySelectorAll("input:checked")).map(function (el) { return el.value; });
      } else {
        var textarea = row.querySelector("textarea");
        answer = textarea ? textarea.value.trim() : "";
      }
      var empty = Array.isArray(answer) ? answer.length === 0 : answer === undefined || answer === "";
      if (required && empty && !missing) missing = row.querySelector(".db-inline-q-label").textContent;
      answers.push({ questionId: id, answer: answer });
    });
    return { answers: answers, missing: missing };
  }
  function wireInlineQuestion(form) {
    if (!form || form.getAttribute("data-wired") === "true") return;
    form.setAttribute("data-wired", "true");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var promptId = form.getAttribute("data-inline-clarification");
      var submit = form.querySelector(".db-inline-question-submit");
      var msg = form.querySelector(".db-inline-question-msg");
      var result = readInlineAnswers(form);
      if (result.missing) {
        if (msg) msg.textContent = "Need answer: " + result.missing;
        return;
      }
      if (submit) submit.disabled = true;
      if (msg) msg.textContent = "Saving answer…";
      result.answers.reduce(function (chain, item) {
        return chain.then(function () {
          return fetch("/api/clarification/" + encodeURIComponent(promptId) + "/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
          }).then(function (res) {
            if (!res.ok) throw new Error("answer_failed");
          });
        });
      }, Promise.resolve()).then(function () {
        if (msg) msg.textContent = "Saved. Continuing generation…";
        refreshDashboard();
      }).catch(function () {
        if (submit) submit.disabled = false;
        if (msg) msg.textContent = "Could not save answer. Try again.";
      });
    });
  }
  function hydrateInlineClarifications() {
    clarificationPromptIds().forEach(function (promptId) {
      var existing = document.querySelector('[data-inline-clarification="' + cssEscape(promptId) + '"]');
      if (existing) {
        wireInlineQuestion(existing);
        return;
      }
      fetch("/api/clarification/" + encodeURIComponent(promptId))
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (session) {
          if (!session || (session.status !== "pending" && session.status !== "expired")) return;
          // P1.1 R4: prefer the structured card slot above the preview; fall
          // back to the legacy chat-bubble target only when no card exists.
          var card = document.querySelector('[data-clarify-mount="' + cssEscape(promptId) + '"]');
          if (card) {
            var loading = card.querySelector(".db-clarify-card-loading");
            if (loading) loading.remove();
            card.insertAdjacentHTML("beforeend", renderInlineQuestion(session));
            wireInlineQuestion(card.querySelector('[data-inline-clarification="' + cssEscape(promptId) + '"]'));
            return;
          }
          var msg = findBuilderMessage(promptId);
          if (!msg) return;
          msg.insertAdjacentHTML("beforeend", renderInlineQuestion(session));
          wireInlineQuestion(msg.querySelector('[data-inline-clarification="' + cssEscape(promptId) + '"]'));
          scrollChatToBottom();
        })
        .catch(function () { /* best-effort */ });
    });
  }
  // Boot: ensure chat scroll starts pinned to the bottom.
  scrollChatToBottom();
  hydrateInlineClarifications();

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

    // Optimistic chat bubbles — append user msg + running builder placeholder.
    appendChatMessage("user", text, "ok");
    var pendingBuilder = appendChatMessage("builder", "", "running");

    fetch("/api/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        if (!r.ok) throw new Error("submit_failed");
        return r.json();
      })
      .then(function (resp) {
        input.value = "";
        if (pendingBuilder && resp && resp.id) {
          pendingBuilder.setAttribute("data-prompt-id", resp.id);
        }
        // WS push will refresh; do an immediate refresh too as belt-and-braces
        refreshDashboard();
      })
      .catch(function () {
        input.classList.add("db-textarea-error");
        setTimeout(function () { input.classList.remove("db-textarea-error"); }, 1200);
        showToast({ message: "Could not submit prompt — please retry", kind: "error" });
        if (pendingBuilder && pendingBuilder.parentNode) {
          pendingBuilder.parentNode.removeChild(pendingBuilder);
        }
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
        return;
      }
      // Esc inside composer: clear textarea content. Lets the user abort an
      // in-progress draft without reaching for the mouse. We only swallow Esc
      // when the textarea actually has content — otherwise let it bubble so
      // surrounding overlays (clarification cards, modals) can react.
      if (ev.key === "Escape" && input.value) {
        ev.preventDefault();
        input.value = "";
        try {
          var clearEv = new Event("input", { bubbles: true });
          input.dispatchEvent(clearEv);
        } catch (e) { /* legacy browser no-op */ }
      }
    });
  }

  // ---------- Global keyboard shortcuts ----------
  // "/" focuses the composer textarea from anywhere on the page, skipping
  // when the user is already typing in an input/textarea/contenteditable so
  // we don't hijack the literal "/" character. Mirrors Linear/Slack pattern.
  function isEditableTarget(el) {
    if (!el) return false;
    var tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (el.isContentEditable) return true;
    return false;
  }
  document.addEventListener("keydown", function (ev) {
    // Only react to bare "/" — let Cmd/Ctrl/Alt/Shift+"/" through.
    if (ev.key !== "/" || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (isEditableTarget(ev.target)) return;
    var composer = document.getElementById("db-prompt-input");
    if (!composer) return;
    ev.preventDefault();
    try {
      composer.focus();
      // Scroll into view in case the composer is below the fold.
      if (typeof composer.scrollIntoView === "function") {
        composer.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    } catch (e) { /* defensive */ }
  });

  var resetBtn = document.getElementById("db-local-run-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      resetBtn.setAttribute("disabled", "true");
      var oldText = resetBtn.textContent || "Reset";
      resetBtn.textContent = "Resetting…";
      fetch("/api/prompts/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keepWorkspace: true })
      }).then(function (r) {
        if (!r.ok) throw new Error("reset_failed");
        return r.json();
      }).then(function () {
        showToast({ message: "Local run reset", kind: "success" });
        return refreshDashboard();
      }).catch(function () {
        showToast({ message: "Could not reset local run", kind: "error" });
      }).finally(function () {
        resetBtn.removeAttribute("disabled");
        resetBtn.textContent = oldText;
      });
    });
  }

  // ---------- Resizable chat/workspace split ----------
  function bootChatResizer() {
    var shell = document.querySelector(".db-chat-shell");
    var handle = document.querySelector(".db-chat-resizer");
    if (!shell || !handle) return;
    var saved = null;
    try { saved = localStorage.getItem("dash-build-chat-pane-width"); } catch (e) {}
    if (saved) shell.style.setProperty("--db-chat-pane-width", saved);

    function clampWidth(width) {
      var total = shell.clientWidth || window.innerWidth;
      var min = 320;
      var max = Math.max(min, total - 480);
      return Math.max(min, Math.min(max, width));
    }
    function setWidth(width, persist) {
      var next = clampWidth(width);
      shell.style.setProperty("--db-chat-pane-width", next + "px");
      handle.setAttribute("aria-valuenow", String(next));
      if (persist) {
        try { localStorage.setItem("dash-build-chat-pane-width", next + "px"); } catch (e) {}
      }
      return next;
    }
    function currentWidth() {
      var left = document.querySelector(".db-chat-pane--left");
      return left ? left.getBoundingClientRect().width : 420;
    }
    handle.setAttribute("aria-valuemin", "320");
    handle.setAttribute("aria-valuemax", String(Math.max(320, shell.clientWidth - 480)));
    handle.setAttribute("aria-valuenow", String(Math.round(currentWidth())));
    handle.addEventListener("pointerdown", function (ev) {
      if (ev.button !== 0) return;
      ev.preventDefault();
      var startX = ev.clientX;
      var startWidth = currentWidth();
      shell.classList.add("is-resizing");
      handle.setPointerCapture(ev.pointerId);
      function move(moveEv) {
        setWidth(startWidth + moveEv.clientX - startX, false);
      }
      function end(endEv) {
        try { handle.releasePointerCapture(endEv.pointerId); } catch (e) {}
        shell.classList.remove("is-resizing");
        setWidth(currentWidth(), true);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    });
    handle.addEventListener("keydown", function (ev) {
      var next = null;
      if (ev.key === "ArrowLeft") next = currentWidth() - 32;
      if (ev.key === "ArrowRight") next = currentWidth() + 32;
      if (ev.key === "Home") next = 320;
      if (ev.key === "End") next = shell.clientWidth - 480;
      if (next == null) return;
      ev.preventDefault();
      setWidth(next, true);
    });
  }
  bootChatResizer();

  // ---------- Resizable Lovable split (rail + canvas) ----------
  // Targets the .db-split grid layout (current shell). Drag handle is
  // .db-split-resizer between rail and canvas-region. Width persisted as
  // px to localStorage; CSS var --db-split-left controls grid column 1.
  function bootSplitResizer() {
    var split = document.getElementById("db-split");
    var handle = document.getElementById("db-split-resizer");
    if (!split || !handle) return;
    var saved = null;
    try { saved = localStorage.getItem("dash-build-split-left"); } catch (e) {}
    if (saved) split.style.setProperty("--db-split-left", saved);

    function clampWidth(width) {
      var total = split.clientWidth || window.innerWidth;
      var min = 240;
      var max = Math.max(min, Math.round(total * 0.6));
      return Math.max(min, Math.min(max, width));
    }
    function setWidth(width, persist) {
      var next = clampWidth(width);
      split.style.setProperty("--db-split-left", next + "px");
      handle.setAttribute("aria-valuenow", String(next));
      if (persist) {
        try { localStorage.setItem("dash-build-split-left", next + "px"); } catch (e) {}
      }
      return next;
    }
    function currentWidth() {
      var rail = split.querySelector(".db-rail");
      return rail ? rail.getBoundingClientRect().width : 360;
    }
    handle.setAttribute("aria-valuemin", "240");
    handle.setAttribute("aria-valuemax", String(Math.max(240, Math.round(split.clientWidth * 0.6))));
    handle.setAttribute("aria-valuenow", String(Math.round(currentWidth())));

    handle.addEventListener("pointerdown", function (ev) {
      if (ev.button !== 0) return;
      ev.preventDefault();
      var startX = ev.clientX;
      var startWidth = currentWidth();
      split.classList.add("is-resizing");
      try { handle.setPointerCapture(ev.pointerId); } catch (e) {}
      function move(moveEv) {
        setWidth(startWidth + moveEv.clientX - startX, false);
      }
      function end(endEv) {
        try { handle.releasePointerCapture(endEv.pointerId); } catch (e) {}
        split.classList.remove("is-resizing");
        setWidth(currentWidth(), true);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    });
    handle.addEventListener("keydown", function (ev) {
      var next = null;
      if (ev.key === "ArrowLeft") next = currentWidth() - 32;
      if (ev.key === "ArrowRight") next = currentWidth() + 32;
      if (ev.key === "Home") next = 240;
      if (ev.key === "End") next = Math.round(split.clientWidth * 0.6);
      if (next == null) return;
      ev.preventDefault();
      setWidth(next, true);
    });
    handle.addEventListener("dblclick", function () {
      // Double-click resets to default 32% of split width.
      var reset = Math.round(split.clientWidth * 0.32);
      setWidth(reset, true);
    });
  }
  bootSplitResizer();

  // ---------- Live preview viewport controls ----------
  function setPreviewViewport(mode, persist) {
    var pane = document.getElementById("db-preview-pane");
    if (!pane) return;
    var state = pane.querySelector(".db-live-preview-state--ready");
    if (!state) return;
    var next = mode === "tablet" || mode === "mobile" ? mode : "desktop";
    state.setAttribute("data-preview-viewport", next);
    pane.querySelectorAll("[data-preview-device]").forEach(function (btn) {
      var active = btn.getAttribute("data-preview-device") === next;
      btn.classList.toggle("db-live-preview-device--active", active);
      if (active) btn.setAttribute("aria-pressed", "true");
      else btn.setAttribute("aria-pressed", "false");
    });
    if (persist) {
      try { localStorage.setItem("dash-build-preview-viewport", next); } catch (e) {}
    }
  }
  function bootPreviewControls() {
    var saved = "desktop";
    try { saved = localStorage.getItem("dash-build-preview-viewport") || "desktop"; } catch (e) {}
    setPreviewViewport(saved, false);
  }
  bootPreviewControls();
  function replacePreviewPane(html) {
    if (!html) return false;
    var oldPreview = document.getElementById("db-preview-pane");
    if (!oldPreview) return false;
    oldPreview.outerHTML = html;
    bootPreviewControls();
    return true;
  }
  function fetchRepoPreview(repo) {
    if (!repo) return Promise.resolve(false);
    return fetch("/api/repo-preview?repo=" + encodeURIComponent(repo), {
      headers: { "Accept": "application/json" },
    })
      .then(function (r) {
        if (!r.ok) throw new Error("preview_unavailable");
        return r.json();
      })
      .then(function (body) {
        return replacePreviewPane(body && body.html);
      });
  }

  // Phase B2: rail-view (chat ↔ history) is a sibling concern to canvas tabs.
  // Topbar uses the same [data-tab] attribute for "history" / "chat" tabs as
  // for "preview" / "code", so we intercept rail-mode values BEFORE the
  // canvas handler (which falls back to "preview" for anything unknown).
  function setRailViewMode(next) {
    var rail = document.getElementById("db-chat-scroll");
    if (!rail) return;
    var mode = next === "history" ? "history" : "chat";
    rail.setAttribute("data-view-mode", mode);
    var views = rail.querySelectorAll("[data-rail-view]");
    for (var i = 0; i < views.length; i++) {
      var view = views[i];
      var matches = view.getAttribute("data-rail-view") === mode;
      if (matches) view.removeAttribute("hidden");
      else view.setAttribute("hidden", "");
    }
    var tabs = document.querySelectorAll("[data-tab='history'], [data-tab='chat']");
    for (var j = 0; j < tabs.length; j++) {
      var tab = tabs[j];
      var active = tab.getAttribute("data-tab") === mode;
      tab.classList.toggle("db-topbar-tab--active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    }
    if (mode === "chat") scrollChatToBottom();
  }

  // P1.1B: Preview / Code tab + file-list switching.
  function setCanvasTab(_stage, next) {
    var which = next === "code" ? "code" : "preview";
    // P1.2B: tabs live in the top bar, panels live in the canvas region —
    // walk the document instead of a single parent so the wiring survives
    // re-parenting.
    var stages = document.querySelectorAll(".db-canvas-stage, .db-canvas-v2");
    stages.forEach(function (s) {
      s.setAttribute("data-active-tab", which);
      s.querySelectorAll("[data-tab-panel]").forEach(function (panel) {
        var matches = panel.getAttribute("data-tab-panel") === which;
        if (matches) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
    });
    document.querySelectorAll("[data-tab]").forEach(function (tab) {
      var active = tab.getAttribute("data-tab") === which;
      tab.classList.toggle("db-canvas-tab--active", active);
      tab.classList.toggle("db-topbar-tab--active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
  }
  function setCodeFile(panel, path) {
    if (!panel || !path) return;
    panel.setAttribute("data-active-file", path);
    panel.querySelectorAll("[data-code-file]").forEach(function (btn) {
      var active = btn.getAttribute("data-code-file") === path;
      btn.classList.toggle("db-code-file--active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    // Phase B3 — keep the parent tab wrapper in sync so the active visual
    // state survives clicks on either the label or surrounding chrome.
    panel.querySelectorAll("[data-code-tab]").forEach(function (tab) {
      var active = tab.getAttribute("data-code-tab") === path;
      tab.classList.toggle("db-code-tab--active", active);
    });
    panel.querySelectorAll("[data-code-content]").forEach(function (pre) {
      var matches = pre.getAttribute("data-code-content") === path;
      if (matches) pre.removeAttribute("hidden");
      else pre.setAttribute("hidden", "");
    });
    // Re-run highlight on the newly visible block (hljs is idempotent once
    // the element carries the hljs class, but our .db-code-line wrappers
    // also need re-spanning when the source is freshly injected via refresh).
    highlightCodePanel(panel);
  }

  // Phase B3 — tab close: soft-hide tab + corresponding content pane. We do
  // NOT actually delete the underlying file; a /dashboard refresh restores
  // the strip. Persistent close lives in B4 scope.
  function closeCodeTab(panel, path) {
    if (!panel || !path) return;
    var tab = panel.querySelector('[data-code-tab="' + cssEscape(path) + '"]');
    if (tab) tab.setAttribute("hidden", "");
    // If the active tab was closed, advance to the next still-visible tab.
    if (panel.getAttribute("data-active-file") === path) {
      var next = panel.querySelector(".db-code-tab:not([hidden])");
      var nextPath = next ? next.getAttribute("data-code-tab") : null;
      if (nextPath) setCodeFile(panel, nextPath);
      else panel.setAttribute("data-active-file", "");
    }
  }

  // ---------- Phase B3: highlight.js wiring ----------
  // hljs is loaded from CDN via a defer script in layout.ts. It may not be
  // ready yet on first call (DOMContentLoaded order is browser-dependent for
  // defer + inline script ordering), so we re-attempt on the load event and
  // after each dashboard refresh.
  function highlightCodePanel(root) {
    if (typeof window === "undefined" || !window.hljs) return;
    var scope = root || document;
    try {
      scope.querySelectorAll(".db-code-block").forEach(function (block) {
        if (block.getAttribute("data-hljs-done") === "true") return;
        // hljs.highlightElement walks the textContent — our nested
        // .db-code-line wrappers stay intact because they wrap the entire
        // file, not individual tokens.
        try {
          window.hljs.highlightElement(block);
          block.setAttribute("data-hljs-done", "true");
        } catch (e) { /* ignore per-block highlight failure */ }
      });
    } catch (e) { /* defensive */ }
  }
  function syncHljsTheme(isDark) {
    var light = document.getElementById("hljs-light");
    var dark = document.getElementById("hljs-dark");
    if (light) light.disabled = !!isDark;
    if (dark) dark.disabled = !isDark;
  }
  // Initial sync + highlight (waits for CDN script if not yet loaded).
  syncHljsTheme(document.documentElement.classList.contains("dark"));
  if (window.hljs) {
    highlightCodePanel();
  } else {
    window.addEventListener("load", function () { highlightCodePanel(); });
  }

  // ---------- Sprint 1B: Run history jump-back ----------
  // Replaces the Phase B2 console.log stub. Six steps in order:
  //   1. Fetch /api/runs/<runId> for the run record (validates id exists).
  //   2. Fetch /api/prompts/<runId> to get the artifact (files + preview).
  //   3. Pick canvas tab (preview if previewUrl exists, else code).
  //   4. Re-render code panel files when artifact present + breadcrumb.
  //   5. Update topbar Run #N indicator.
  //   6. Switch rail back to chat + highlight the matching bubble.
  // Each step is best-effort — partial failure shows what we have.
  function jumpToRun(runId) {
    if (!runId) return Promise.resolve(false);
    return fetch("/api/runs/" + encodeURIComponent(runId), {
      headers: { "Accept": "application/json" },
    })
      .then(function (r) {
        if (!r.ok) throw new Error("run_not_found");
        return r.json();
      })
      .then(function (runBody) {
        var run = runBody && runBody.run;
        if (!run) throw new Error("run_missing");
        // Step 2 — artifact (may be null for in-flight or failed runs).
        return fetch("/api/prompts/" + encodeURIComponent(runId), {
          headers: { "Accept": "application/json" },
        })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (promptBody) {
            var artifact = promptBody && promptBody.artifact;
            // Step 3 — pick canvas tab.
            var hasPreview = !!(artifact && artifact.preview && artifact.preview.previewUrl);
            setCanvasTab(null, hasPreview ? "preview" : "code");
            // Step 4 — when artifact present, re-render code panel from the
            // first file. We do not have HTML server-rendered for non-active
            // runs, so we trigger a soft refresh and let the dashboard swap
            // the panel after the run becomes active. Update breadcrumb.
            var route = document.querySelector(".db-topbar-route-code");
            if (route && artifact && artifact.files && artifact.files[0]) {
              route.textContent = artifact.files[0].path;
            }
            // Step 5 — topbar Run #N indicator (data attribute hint).
            var topbar = document.querySelector(".db-shell .db-topbar, .db-topbar");
            if (topbar) topbar.setAttribute("data-active-run-id", run.id);
            // Step 6a — rail back to chat.
            setRailViewMode("chat");
            // Step 6b — highlight the corresponding chat bubble. Wait one
            // frame so any layout swap can settle, then scroll + flash.
            requestAnimationFrame(function () {
              var bubble = document.querySelector(
                ".db-chat-msg[data-prompt-id='" + cssEscape(run.id) + "']"
              );
              if (bubble) {
                bubble.scrollIntoView({ block: "center", behavior: "smooth" });
                bubble.classList.add("db-chat-msg--jump-flash");
                setTimeout(function () {
                  bubble.classList.remove("db-chat-msg--jump-flash");
                }, 1400);
              }
            });
            return true;
          });
      })
      .catch(function (err) {
        try { console.warn("[dash-build] jumpToRun failed", err); } catch (e) {}
        showToast({
          message:
            "Could not load that run" +
            (err && err.message ? " (" + err.message + ")" : ""),
          kind: "error",
        });
        // Still flip back to chat so the user is not left staring at history.
        setRailViewMode("chat");
        return false;
      });
  }

  // ---------- Sprint 1B: Manual OpenAI reconnect ----------
  function triggerOpenAIReconnect(trigger) {
    if (trigger && trigger.getAttribute("data-busy") === "true") return;
    var card = trigger ? trigger.closest("[data-openai-reconnect-card]") : null;
    if (trigger) trigger.setAttribute("data-busy", "true");
    if (card) card.setAttribute("data-busy", "true");
    var origLabel = trigger ? trigger.querySelector(".db-button-label") : null;
    var origText = origLabel ? origLabel.textContent : "";
    if (origLabel) origLabel.textContent = "Reconnecting…";
    fetch("/api/auth/openai/reconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then(function (r) {
        return r.json().catch(function () { return null; }).then(function (body) {
          return { ok: r.ok, status: r.status, body: body };
        });
      })
      .then(function (res) {
        var body = res && res.body ? res.body : {};
        if (body.connected) {
          showToast({
            message: "Reconnected" + (body.mode ? " via " + body.mode : ""),
            kind: "success",
          });
          refreshDashboard();
          return;
        }
        var reasonEl = card ? card.querySelector("[data-auth-reconnect-reason]") : null;
        if (reasonEl) {
          reasonEl.textContent = body.reason ? "Last attempt: " + body.reason : "";
          if (body.reason) reasonEl.removeAttribute("hidden");
          else reasonEl.setAttribute("hidden", "");
        }
        showToast({
          message:
            "Reconnect failed" +
            (body.reason ? " — " + body.reason : "") +
            ". Try Settings or paste a new key.",
          kind: "warn",
          duration: 5000,
        });
      })
      .catch(function () {
        showToast({
          message: "Reconnect request failed (network)",
          kind: "error",
        });
      })
      .finally(function () {
        if (trigger) trigger.removeAttribute("data-busy");
        if (card) card.removeAttribute("data-busy");
        if (origLabel) origLabel.textContent = origText || "Reconnect";
      });
  }

  document.addEventListener("click", function (ev) {
    var target = ev.target;
    if (!target || !target.closest) return;
    // Sprint 1B: manual reconnect button — check before generic data-tab.
    var reconnectBtn = target.closest("[data-auth-reconnect]");
    if (reconnectBtn) {
      ev.preventDefault();
      triggerOpenAIReconnect(reconnectBtn);
      return;
    }
    // Phase B2: handle [data-jump-run] before generic [data-tab] so a click
    // inside the history list does not also bubble to a parent tab pill.
    var jumpRun = target.closest("[data-jump-run]");
    if (jumpRun) {
      ev.preventDefault();
      var runId = jumpRun.getAttribute("data-jump-run");
      // Sprint 1B: real jump-back implementation. See jumpToRun above.
      jumpToRun(runId);
      return;
    }
    var tab = target.closest("[data-tab]");
    if (tab) {
      var which = tab.getAttribute("data-tab");
      // Sprint 3A: surface-switching tabs (build / owner) navigate to a new
      // route. When the element already carries an href (anchor), let the
      // browser do the navigation natively; otherwise force it via
      // window.location so a <button> with data-tab works too.
      if (which === "owner" || which === "build") {
        var href = tab.getAttribute("href");
        if (!href) {
          ev.preventDefault();
          // Tier 2 #6 — "build" now lands on the Lovable home; "owner" stays
          // at /owner. Legacy classic dashboard is reachable via ?legacy=1.
          window.location.href = which === "owner" ? "/owner" : "/";
        }
        return;
      }
      // Phase B2: history/chat are rail-mode toggles, not canvas tabs. Route
      // them to setRailViewMode and bail before setCanvasTab inverts to
      // "preview" for unknown values.
      if (which === "history" || which === "chat") {
        ev.preventDefault();
        setRailViewMode(which);
        return;
      }
      ev.preventDefault();
      setCanvasTab(null, which);
      return;
    }
    var closeBtn = target.closest("[data-code-tab-close]");
    if (closeBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      var panelClose = closeBtn.closest(".db-code-panel");
      closeCodeTab(panelClose, closeBtn.getAttribute("data-code-tab-close"));
      return;
    }
    var fileBtn = target.closest("[data-code-file]");
    if (fileBtn) {
      ev.preventDefault();
      var panel = fileBtn.closest(".db-code-panel");
      setCodeFile(panel, fileBtn.getAttribute("data-code-file"));
      return;
    }
    var device = target.closest("[data-preview-device]");
    if (device) {
      ev.preventDefault();
      setPreviewViewport(device.getAttribute("data-preview-device"), true);
      return;
    }
    var refreshPreview = target.closest("[data-preview-refresh]");
    if (refreshPreview) {
      ev.preventDefault();
      var pane = document.getElementById("db-preview-pane");
      var frame = pane ? pane.querySelector(".db-live-preview-frame") : null;
      if (frame && frame.getAttribute("src")) {
        var src = frame.getAttribute("src").split("?")[0];
        frame.setAttribute("src", src + "?t=" + Date.now());
      }
      return;
    }
    var trigger = target.closest("[data-clarification-focus]");
    if (!trigger) return;
    ev.preventDefault();
    var id = trigger.getAttribute("data-clarification-focus");
    hydrateInlineClarifications();
    setTimeout(function () {
      var form = document.querySelector('[data-inline-clarification="' + cssEscape(id) + '"]');
      if (form) {
        form.scrollIntoView({ block: "center", behavior: "smooth" });
        var firstInput = form.querySelector("input, textarea, button");
        if (firstInput) firstInput.focus();
      }
    }, 120);
  });

  // ---------- Quick replay chips (empty chat state) ----------
  // Chips rendered in chat-thread.ts empty state with [data-quick-replay].
  // Click fills the composer textarea with the chip's saved prompt text so
  // the user can iterate fast — does NOT auto-submit so they can tweak first.
  document.addEventListener("click", function (ev) {
    var target = ev.target;
    if (!target || !target.closest) return;
    var chip = target.closest("[data-quick-replay]");
    if (!chip) return;
    ev.preventDefault();
    var text = chip.getAttribute("data-quick-replay-text") || "";
    var composer = document.getElementById("db-prompt-input");
    if (!composer) return;
    try {
      composer.value = text;
      composer.focus();
      // Move caret to end so the user can append/edit immediately.
      var len = text.length;
      if (typeof composer.setSelectionRange === "function") {
        composer.setSelectionRange(len, len);
      }
      var inputEv = new Event("input", { bubbles: true });
      composer.dispatchEvent(inputEv);
    } catch (e) { /* defensive */ }
  });

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
  document.addEventListener("change", function (ev) {
    var target = ev.target;
    if (!target || target.id !== "db-repo-select") return;
    var val = target.value;
    var branchEl = document.getElementById("db-branch-input");
    var branch = branchEl && branchEl.value ? branchEl.value : "main";
      fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: val, branch: branch }),
      })
        .then(function (r) {
          if (!r.ok) throw new Error("repo_persist_failed");
          return fetchRepoPreview(val);
        })
        .catch(function () {
          showToast({ message: "Could not switch repo preview", kind: "error" });
        });
  });

  // ---------- Baseline repo preview ----------
  document.addEventListener("click", function (ev) {
    var target = ev.target;
    if (!target || !target.closest) return;
    var start = target.closest("[data-repo-preview-start]");
    if (start) {
      ev.preventDefault();
      var repo = start.getAttribute("data-repo-preview-start");
      start.setAttribute("disabled", "true");
      start.textContent = "Starting…";
      fetch("/api/repo-preview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repo })
      }).then(function (r) {
        if (!r.ok) throw new Error("start_failed");
        return r.json();
      }).then(function (body) {
        replacePreviewPane(body && body.html);
        setTimeout(function () { fetchRepoPreview(repo).catch(function () { /* best-effort */ }); }, 800);
      }).catch(function () {
        start.removeAttribute("disabled");
        start.textContent = "Start local preview →";
      });
      return;
    }
    var copy = target.closest("[data-copy-command]");
    if (copy) {
      ev.preventDefault();
      var command = copy.getAttribute("data-copy-command") || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(command).then(function () {
          showToast({ message: "Command copied", kind: "success" });
        }).catch(function () {
          showToast({ message: command, kind: "info", duration: 7000 });
        });
      } else {
        showToast({ message: command, kind: "info", duration: 7000 });
      }
    }
  });

  // ---------- Tier 2 #8: Workspace top bar Share + Run buttons ----------
  // The workspace shell (src/daemon/templates/workspace.ts) renders two
  // top-bar pills: Share (copy current URL → toast) and Run (re-execute the
  // current prompt by POSTing /api/prompts/<runId>/rerun; on success, navigate
  // to the new workspace). The Run action infers the active runId from the
  // /workspace/:id URL — Sandpack mount uses the same id, so URL is canonical.
  function currentWorkspaceRunId() {
    var path = location.pathname || "";
    if (path.indexOf("/workspace/") !== 0) return null;
    var rest = path.slice("/workspace/".length);
    var slash = rest.indexOf("/");
    var id = slash >= 0 ? rest.slice(0, slash) : rest;
    if (!id) return null;
    // Strict id charset matches the server-side route regex.
    if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;
    return id;
  }
  document.addEventListener("click", function (ev) {
    var target = ev.target;
    if (!target || !target.closest) return;
    var actionBtn = target.closest("[data-workspace-action]");
    if (!actionBtn) return;
    var action = actionBtn.getAttribute("data-workspace-action");
    if (action === "share") {
      ev.preventDefault();
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          showToast({ message: "Share link copied", kind: "success" });
        }).catch(function () {
          showToast({ message: url, kind: "info", duration: 7000 });
        });
      } else {
        showToast({ message: url, kind: "info", duration: 7000 });
      }
      return;
    }
    if (action === "run") {
      ev.preventDefault();
      var runId = currentWorkspaceRunId();
      if (!runId) {
        showToast({
          message: "No active run to re-execute",
          kind: "warn",
        });
        return;
      }
      if (actionBtn.getAttribute("data-busy") === "true") return;
      actionBtn.setAttribute("data-busy", "true");
      actionBtn.setAttribute("disabled", "true");
      var runLabel = actionBtn.querySelector(".db-button-label");
      var prevRunLabel = runLabel ? runLabel.textContent : null;
      if (runLabel) runLabel.textContent = "Running…";
      fetch("/api/prompts/" + encodeURIComponent(runId) + "/rerun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then(function (r) {
          if (!r.ok && r.status !== 202) throw new Error("rerun_failed_" + r.status);
          return r.json();
        })
        .then(function (body) {
          if (body && body.id) {
            showToast({
              message: "Re-running prompt — opening new workspace…",
              kind: "info",
            });
            // Navigate to the freshly minted workspace so SSE + Sandpack
            // mount against the new run.
            navigateTo("/workspace/" + encodeURIComponent(body.id));
            return;
          }
          // No id — soft refresh as a fallback so the user sees state move.
          refreshDashboard();
        })
        .catch(function () {
          showToast({
            message: "Could not re-run this prompt",
            kind: "error",
          });
          actionBtn.removeAttribute("data-busy");
          actionBtn.removeAttribute("disabled");
          if (runLabel && prevRunLabel != null) runLabel.textContent = prevRunLabel;
        });
      return;
    }
    // "reset" + other actions are still handled by their own dedicated
    // listeners (see composer / dashboard wiring above).
  });

  // ---------- Sprint 1A: sandbox bootstrap button ----------
  // Topbar trigger that kicks the orchestrator ensureWorkspaceBootstrap()
  // for the active repo. The button renders only when the repo sandbox is
  // null or in the clean state; once the bootstrap moves the state forward
  // the server-rendered button is gone after refresh.
  document.addEventListener("click", function (ev) {
    var target = ev.target;
    if (!target || !target.closest) return;
    var btn = target.closest("[data-sandbox-bootstrap]");
    if (!btn) return;
    ev.preventDefault();
    var repo = btn.getAttribute("data-sandbox-bootstrap");
    if (!repo) return;
    btn.setAttribute("disabled", "true");
    var labelEl = btn.querySelector(".db-topbar-bootstrap-btn-label");
    var prevLabel = labelEl ? labelEl.textContent : "";
    if (labelEl) labelEl.textContent = "Bootstrapping…";
    fetch("/api/sandbox/bootstrap?repo=" + encodeURIComponent(repo), {
      method: "POST",
    })
      .then(function (r) {
        if (!r.ok && r.status !== 202) throw new Error("bootstrap_failed");
        return r.json();
      })
      .then(function () {
        showToast({
          message: "Clone preview bootstrapping — this may take a minute.",
          kind: "info",
          duration: 6000,
        });
        // Refresh shortly so the badge can render once the state flips. The
        // sandbox:state_changed broadcast will also nudge the dashboard.
        setTimeout(function () { refreshDashboard(); }, 1500);
      })
      .catch(function () {
        btn.removeAttribute("disabled");
        if (labelEl) labelEl.textContent = prevLabel || "Activate clone preview";
        showToast({
          message: "Could not start clone preview bootstrap.",
          kind: "error",
        });
      });
  });

  // ---------- F3: sandbox dev-server restart ----------
  // Topbar badge renders as <button data-sandbox-restart-dev="<repo>"> when
  // the dev server failed to start. Click POSTs /api/sandbox/restart-dev so
  // the orchestrator re-runs stopDevServer + startDevServer; broadcast
  // lifecycle events (dev_server_starting / _ready / _failed) update the
  // badge in-place without a full reload.
  document.addEventListener("click", function (ev) {
    var target = ev.target;
    if (!target || !target.closest) return;
    var el = target.closest("[data-sandbox-restart-dev]");
    if (!el) return;
    ev.preventDefault();
    var repo = el.getAttribute("data-sandbox-restart-dev");
    if (!repo) return;
    el.setAttribute("disabled", "true");
    showToast({
      message: "Restarting dev server…",
      kind: "info",
    });
    fetch("/api/sandbox/restart-dev?repo=" + encodeURIComponent(repo), {
      method: "POST",
    })
      .then(function (r) {
        if (!r.ok && r.status !== 202) throw new Error("restart_failed");
        return r.json();
      })
      .catch(function () {
        el.removeAttribute("disabled");
        showToast({
          message: "Could not restart the dev server.",
          kind: "error",
        });
      });
  });

  // ---------- F1: starting-state countdown ----------
  // While the badge carries data-action="dev_server_starting" we tick the
  // label every 5s so the user gets feedback ("Starting dev server… (15s)")
  // instead of staring at a static spinner for the full 60s timeout. The
  // ticker auto-stops as soon as the badge re-renders into a different state
  // (success/failed/clone_running) — refreshDashboard() swaps the node
  // entirely, and our setInterval check below sees the missing element.
  var startingTickHandle = null;
  var startingTickStart = 0;
  function ensureStartingTick() {
    var badge = document.querySelector(
      '.db-sandbox-badge[data-action="dev_server_starting"]',
    );
    if (!badge) {
      if (startingTickHandle) {
        clearInterval(startingTickHandle);
        startingTickHandle = null;
        startingTickStart = 0;
      }
      return;
    }
    if (startingTickHandle) return;
    startingTickStart = Date.now();
    startingTickHandle = setInterval(function () {
      var b = document.querySelector(
        '.db-sandbox-badge[data-action="dev_server_starting"]',
      );
      if (!b) {
        clearInterval(startingTickHandle);
        startingTickHandle = null;
        startingTickStart = 0;
        return;
      }
      var labelEl = b.querySelector(".db-sandbox-badge-label");
      if (!labelEl) return;
      var elapsedSec = Math.max(0, Math.round((Date.now() - startingTickStart) / 1000));
      labelEl.textContent =
        "Starting dev server… (" + elapsedSec + "s)";
    }, 5000);
  }
  // Run once now (initial paint may already have the starting badge), then
  // re-evaluate on every refresh — refreshDashboard's success path replaces
  // the topbar node so this is the natural re-check point.
  ensureStartingTick();
  var originalRefresh = refreshDashboard;
  refreshDashboard = function () {
    var r = originalRefresh();
    // refreshDashboard returns a Promise in current impl; if it does, hook
    // the then() so we re-evaluate after DOM swap.
    if (r && typeof r.then === "function") {
      r.then(ensureStartingTick, ensureStartingTick);
    } else {
      // Fallback: queue a microtask so the swap settles first.
      setTimeout(ensureStartingTick, 0);
    }
    return r;
  };

  // ---------- Theme toggle (Phase A1) ----------
  // Document-level delegate keyed on [data-theme-toggle]. Flips the .dark
  // class on <html> and persists to localStorage under "dash-build-theme".
  // Initial state is set by an inline script in <head> (layout.ts) before
  // first paint, so we never flash the wrong theme.
  function syncThemeButtons(isDark) {
    var btns = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", isDark ? "true" : "false");
    }
  }
  syncThemeButtons(document.documentElement.classList.contains("dark"));
  document.addEventListener("click", function (ev) {
    var target = ev.target;
    if (!target || !target.closest) return;
    var toggle = target.closest("[data-theme-toggle]");
    if (!toggle) return;
    ev.preventDefault();
    var root = document.documentElement;
    var nowDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nowDark);
    try {
      localStorage.setItem("dash-build-theme", nowDark ? "dark" : "light");
    } catch (e) { /* private mode no-op */ }
    syncThemeButtons(nowDark);
    // Phase B3 — flip the highlight.js stylesheet to match the new theme.
    syncHljsTheme(nowDark);
  });

  // ---------- Lovable home + workspace wiring ----------
  // The home page (/) and workspace (/workspace/:id) ship via separate
  // server-rendered templates. Both rely on a handful of progressive
  // enhancements: the sidebar collapse toggle, the home prompt → workspace
  // transition, and recent/template card clicks.
  function navigateTo(url) {
    try {
      window.location.assign(url);
    } catch (e) {
      window.location.href = url;
    }
  }

  function hookHomePrompt() {
    var form = document.getElementById("db-home-prompt-form");
    if (!form) return;
    var textarea = form.querySelector("#db-prompt-input");
    function submit(ev) {
      if (ev && ev.preventDefault) ev.preventDefault();
      var raw = textarea && textarea.value ? textarea.value.trim() : "";
      // Always navigate to workspace — the workspace's composer will hand
      // the prompt to the existing /api/prompt flow. Carry the seed prompt
      // through the URL hash so the workspace can pre-fill its composer.
      var hash = raw ? "#prompt=" + encodeURIComponent(raw) : "";
      navigateTo("/workspace/" + hash);
    }
    form.addEventListener("submit", submit);
  }

  function hookHomeTabs() {
    var tabs = document.querySelectorAll("[data-home-tab]");
    if (!tabs || tabs.length === 0) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-home-tab");
        tabs.forEach(function (t) {
          var isActive = t === tab;
          t.classList.toggle("db-home-tab--active", isActive);
          t.setAttribute("aria-selected", isActive ? "true" : "false");
        });
        var panels = document.querySelectorAll("[data-home-panel]");
        panels.forEach(function (panel) {
          var match = panel.getAttribute("data-home-panel") === target;
          if (match) {
            panel.removeAttribute("hidden");
          } else {
            panel.setAttribute("hidden", "");
          }
        });
      });
    });
  }

  function hookSidebarToggle() {
    var btn = document.querySelector("[data-sidebar-toggle]");
    var sidebar = document.getElementById("db-sidebar");
    if (!btn || !sidebar) return;
    btn.addEventListener("click", function () {
      var collapsed = sidebar.getAttribute("data-collapsed") === "true";
      if (collapsed) {
        sidebar.removeAttribute("data-collapsed");
      } else {
        sidebar.setAttribute("data-collapsed", "true");
      }
    });
  }

  function hookNewProjectButton() {
    var btn = document.querySelector("[data-new-project]");
    if (!btn) return;
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      // Land on a fresh workspace shell. The orchestrator will own actual
      // run creation once the first prompt fires from the workspace composer.
      navigateTo("/workspace/");
    });
  }

  function hookTemplateCards() {
    var cards = document.querySelectorAll("[data-template-id]");
    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        var id = card.getAttribute("data-template-id") || "";
        navigateTo("/workspace/#template=" + encodeURIComponent(id));
      });
    });
  }

  // Tier 2 #9: example prompt cards below the home hero composer. Click →
  // fill the textarea with the example text, fire input event so any
  // autosize hook re-measures, then focus the input. We do NOT auto-submit
  // — the user keeps full control over when to launch.
  function hookExamplePromptCards() {
    var cards = document.querySelectorAll("[data-example-prompt]");
    if (!cards || cards.length === 0) return;
    cards.forEach(function (card) {
      card.addEventListener("click", function (ev) {
        if (ev && ev.preventDefault) ev.preventDefault();
        var text = card.getAttribute("data-example-prompt") || "";
        if (!text) return;
        var textarea = document.getElementById("db-prompt-input");
        if (!textarea) return;
        try {
          textarea.value = text;
          var inputEvt = new Event("input", { bubbles: true });
          textarea.dispatchEvent(inputEvt);
          textarea.focus();
          // Move caret to the end so user can immediately keep typing.
          if (typeof textarea.setSelectionRange === "function") {
            var len = text.length;
            textarea.setSelectionRange(len, len);
          }
        } catch (e) { /* defensive */ }
      });
    });
  }

  // Workspace boot: read seed prompt from URL hash (passed by home page)
  // and pre-fill the composer textarea. Fixes Agent A handoff TODO #1.
  function hookWorkspaceHashHandoff() {
    var path = location.pathname || "";
    if (path.indexOf("/workspace") !== 0) return;
    var hash = (location.hash || "").replace(/^#/, "");
    if (!hash) return;
    var params = new URLSearchParams(hash);
    var seed = params.get("prompt");
    if (!seed) return;
    var textarea = document.getElementById("db-prompt-input");
    if (!textarea) return;
    try {
      textarea.value = decodeURIComponent(seed);
      // Trigger input event so any character counter / autosize fires.
      var ev = new Event("input", { bubbles: true });
      textarea.dispatchEvent(ev);
      textarea.focus();
      // Clear hash so refresh doesn't re-seed.
      history.replaceState(null, "", path);
    } catch (e) {
      // Silently ignore decode errors.
    }
  }

  // ---------- Tier 2 #5 + #2.12 — Workspace tabs + viewport persistence ----
  // Parse the workspace location hash (e.g. "#tab=diff&viewport=mobile") so
  // refresh keeps the user's last-active tab + viewport. We also write back
  // to the hash on every change so deep-links stay shareable.
  var WORKSPACE_TABS = ["component", "diff", "be-impact", "audit", "files"];
  var WORKSPACE_VIEWPORTS = ["desktop", "tablet", "mobile"];

  function parseWorkspaceHash() {
    var raw = (location.hash || "").replace(/^#/, "");
    var out = { tab: null, viewport: null };
    if (!raw) return out;
    try {
      var params = new URLSearchParams(raw);
      var tab = params.get("tab");
      var viewport = params.get("viewport");
      if (tab && WORKSPACE_TABS.indexOf(tab) >= 0) out.tab = tab;
      if (viewport && WORKSPACE_VIEWPORTS.indexOf(viewport) >= 0) out.viewport = viewport;
    } catch (e) { /* malformed hash → ignore */ }
    return out;
  }

  function writeWorkspaceHash(updates) {
    var current = parseWorkspaceHash();
    var next = {
      tab: updates && updates.tab !== undefined ? updates.tab : current.tab,
      viewport:
        updates && updates.viewport !== undefined
          ? updates.viewport
          : current.viewport,
    };
    var parts = [];
    if (next.tab && next.tab !== "component") parts.push("tab=" + encodeURIComponent(next.tab));
    if (next.viewport && next.viewport !== "desktop") {
      parts.push("viewport=" + encodeURIComponent(next.viewport));
    }
    var hash = parts.length ? "#" + parts.join("&") : "";
    try {
      // replaceState avoids polluting history with every tab click.
      history.replaceState(null, "", location.pathname + location.search + hash);
    } catch (e) { /* private mode → no-op */ }
  }

  function setWorkspaceTab(next) {
    var tabId = WORKSPACE_TABS.indexOf(next) >= 0 ? next : "component";
    var buttons = document.querySelectorAll("[data-workspace-tab]");
    if (!buttons || buttons.length === 0) return;
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var matches = btn.getAttribute("data-workspace-tab") === tabId;
      btn.classList.toggle("db-workspace-tab--active", matches);
      btn.setAttribute("aria-selected", matches ? "true" : "false");
    }
    // Toggle the tabpanels rendered by preview-panel.ts.
    for (var j = 0; j < WORKSPACE_TABS.length; j++) {
      var id = WORKSPACE_TABS[j];
      var panel = document.getElementById("db-preview-panel-" + id);
      if (!panel) continue;
      if (id === tabId) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    }
    // Mirror onto the canvas body so CSS hooks (e.g. tab-specific padding)
    // can match against the active id.
    var canvasBody = document.querySelector("[data-workspace-active-tab]");
    if (canvasBody) canvasBody.setAttribute("data-workspace-active-tab", tabId);
    writeWorkspaceHash({ tab: tabId });
  }

  function setWorkspaceViewport(next) {
    var size = WORKSPACE_VIEWPORTS.indexOf(next) >= 0 ? next : "desktop";
    var frame = document.querySelector(".db-preview-viewport-frame");
    if (frame) frame.setAttribute("data-viewport", size);
    var btns = document.querySelectorAll("[data-viewport-size]");
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var matches = btn.getAttribute("data-viewport-size") === size;
      btn.classList.toggle("db-preview-viewport-btn--active", matches);
      btn.setAttribute("aria-pressed", matches ? "true" : "false");
    }
    writeWorkspaceHash({ viewport: size });
  }

  function hookWorkspaceTabs() {
    var tabs = document.querySelectorAll("[data-workspace-tab]");
    if (!tabs || tabs.length === 0) return;
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      if (tab.getAttribute("data-workspace-tab-wired") === "true") continue;
      tab.setAttribute("data-workspace-tab-wired", "true");
      tab.addEventListener("click", function (ev) {
        ev.preventDefault();
        var current = ev.currentTarget;
        var id = current.getAttribute("data-workspace-tab");
        setWorkspaceTab(id);
        // Re-run highlight.js on freshly visible code blocks (Diff tab uses
        // language-diff). The helper is idempotent so re-runs are safe.
        if (typeof highlightCodePanel === "function") highlightCodePanel();
      });
    }
  }

  function hookViewportToggle() {
    var btns = document.querySelectorAll("[data-viewport-size]");
    if (!btns || btns.length === 0) return;
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      if (btn.getAttribute("data-viewport-wired") === "true") continue;
      btn.setAttribute("data-viewport-wired", "true");
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        var current = ev.currentTarget;
        var size = current.getAttribute("data-viewport-size");
        setWorkspaceViewport(size);
      });
    }
  }

  function hookWorkspaceState() {
    var path = location.pathname || "";
    if (path.indexOf("/workspace") !== 0) return;
    hookWorkspaceTabs();
    hookViewportToggle();
    var state = parseWorkspaceHash();
    if (state.tab) setWorkspaceTab(state.tab);
    if (state.viewport) setWorkspaceViewport(state.viewport);
    // Diff tab uses language-diff blocks server-rendered into the panel; run
    // highlight.js once on boot so colors paint immediately.
    if (typeof highlightCodePanel === "function") highlightCodePanel();
  }

  function bootLovableShell() {
    hookHomePrompt();
    hookHomeTabs();
    hookSidebarToggle();
    hookNewProjectButton();
    hookTemplateCards();
    hookExamplePromptCards();
    hookWorkspaceHashHandoff();
    hookWorkspaceState();
  }
  bootLovableShell();

  // ---------- Boot ----------
  setWsState("connecting", "Connecting…");
  connectWs();
})();
`
