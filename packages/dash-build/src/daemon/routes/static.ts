import type { ServerResponse } from "node:http"
import { notFound } from "./_helpers.js"

const CSS = `
:root {
  --bg: #f7f5fb;
  --paper: #ffffff;
  --ink: #1a1424;
  --muted: #6b6478;
  --accent: #5e2aac;
  --accent-soft: #ede5fa;
  --border: #e6e1ee;
  --ok: #2f8f5f;
  --ok-soft: #e3f3eb;
  --warn: #b76b00;
  --warn-soft: #fbeed4;
  --radius: 10px;
  --shadow: 0 1px 2px rgba(26, 20, 36, 0.04), 0 1px 1px rgba(26, 20, 36, 0.02);
  font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--ink); }
body { min-height: 100vh; display: flex; flex-direction: column; }

.db-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px; background: var(--paper);
  border-bottom: 1px solid var(--border);
}
.db-brand { display: flex; align-items: center; gap: 10px; }
.db-brand-dot {
  width: 10px; height: 10px; border-radius: 50%; background: var(--accent);
}
.db-brand-name { font-weight: 700; letter-spacing: -0.01em; }
.db-nav { display: flex; gap: 14px; }
.db-nav-item { cursor: default; font-size: 16px; }

.db-main { flex: 1; max-width: 800px; width: 100%; margin: 0 auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.db-footer {
  padding: 12px 24px; color: var(--muted); font-size: 12px;
  border-top: 1px solid var(--border); background: var(--paper);
  text-align: center;
}

.db-card {
  background: var(--paper); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow);
}
.db-heading { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
.db-label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
.db-muted { color: var(--muted); }
.db-link { color: var(--accent); }

.db-status { background: var(--paper); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 18px; box-shadow: var(--shadow); }
.db-status-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; flex-wrap: wrap; }

.db-pill {
  background: var(--accent-soft); color: var(--accent);
  padding: 2px 10px; border-radius: 999px; font-weight: 600; font-size: 13px;
}
.db-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;
}
.db-chip-ok { background: var(--ok-soft); color: var(--ok); }
.db-chip-warn { background: var(--warn-soft); color: var(--warn); }

.db-textarea {
  width: 100%; min-height: 80px; padding: 12px;
  border: 1px solid var(--border); border-radius: 8px;
  font-family: inherit; font-size: 14px; line-height: 1.5; resize: vertical;
  background: var(--bg);
}
.db-textarea:focus { outline: 2px solid var(--accent); outline-offset: 1px; border-color: transparent; }
.db-prompt-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
.db-button {
  background: var(--accent); color: #fff; border: none; padding: 10px 18px;
  border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;
  transition: opacity 120ms ease;
}
.db-button:hover { opacity: 0.9; }
.db-button:disabled { opacity: 0.5; cursor: not-allowed; }

.db-prompt-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.db-prompt-card {
  display: grid; grid-template-columns: 110px 1fr auto; gap: 12px; align-items: center;
  padding: 10px 12px; background: var(--bg); border-radius: 8px;
  font-size: 13px;
}
.db-prompt-meta { color: var(--muted); font-size: 12px; }
.db-prompt-text { color: var(--ink); }
.db-prompt-status { font-size: 12px; color: var(--muted); white-space: nowrap; }
.db-prompt-status-pr_created { color: var(--ok); font-weight: 600; }
.db-prompt-status-failed { color: var(--warn); }

.db-empty { color: var(--muted); font-size: 13px; margin: 0; }
`

const JS = `
(function () {
  var dot = document.getElementById("db-conn-dot");
  var promptsEl = document.getElementById("db-prompts");
  var submitBtn = document.getElementById("db-prompt-submit");
  var input = document.getElementById("db-prompt-input");

  function setOnline(ok) {
    if (!dot) return;
    dot.textContent = ok ? "🟢" : "🔴";
    dot.setAttribute("title", ok ? "Daemon online" : "Daemon offline");
  }

  function connectWs() {
    try {
      var ws = new WebSocket("ws://" + location.host + "/ws");
      ws.onopen = function () { setOnline(true); };
      ws.onclose = function () { setOnline(false); setTimeout(connectWs, 2000); };
      ws.onerror = function () { setOnline(false); };
      ws.onmessage = function (ev) {
        try {
          var msg = JSON.parse(ev.data);
          if (msg.event === "prompts:changed" || msg.event === "auth:changed") {
            refresh();
          }
        } catch (e) { /* ignore */ }
      };
    } catch (e) {
      setOnline(false);
    }
  }

  function refresh() {
    fetch("/api/status").then(function (r) { return r.json(); }).catch(function () { return null; });
  }

  if (submitBtn && input) {
    submitBtn.addEventListener("click", function () {
      var text = input.value.trim();
      if (!text) return;
      submitBtn.disabled = true;
      fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text }),
      })
        .then(function (r) { return r.json(); })
        .then(function () { input.value = ""; })
        .finally(function () { submitBtn.disabled = false; });
    });
  }

  connectWs();
})();
`

export function handleStatic(res: ServerResponse, pathname: string): void {
  if (pathname === "/static/app.css") {
    res.writeHead(200, {
      "Content-Type": "text/css; charset=utf-8",
      "Content-Length": Buffer.byteLength(CSS),
      "Cache-Control": "no-store",
    })
    res.end(CSS)
    return
  }
  if (pathname === "/static/app.js") {
    res.writeHead(200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Content-Length": Buffer.byteLength(JS),
      "Cache-Control": "no-store",
    })
    res.end(JS)
    return
  }
  notFound(res)
}
