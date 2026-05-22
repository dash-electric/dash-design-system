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
      var txt = document.createElement("span");
      txt.className = "db-chat-bubble-text";
      txt.textContent = content;
      bubble.appendChild(txt);
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
      }
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

  document.addEventListener("click", function (ev) {
    var target = ev.target;
    if (!target || !target.closest) return;
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
      }).then(function () { refreshDashboard(); }).catch(function () { /* best-effort */ });
    });
  }

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
      }).then(function () {
        setTimeout(refreshDashboard, 600);
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

  // ---------- Boot ----------
  setWsState("connecting", "Connecting…");
  connectWs();
})();
`
