/**
 * Sandpack mount script — embedded as a string and served from
 * /static/preview-mount.js. Activates only on pages that contain a
 * `[data-component-id]` mount element (rendered by `preview-panel.ts`).
 *
 * Lifecycle:
 *   1. On DOM ready, locate `#db-preview-sandpack`.
 *   2. Dynamically import @codesandbox/sandpack-react via the CDN (esm.sh).
 *      Lazy import keeps the dashboard initial bundle untouched.
 *   3. POST /api/preview/component with { componentSource, promptId } pulled
 *      from `data-*` attributes (or window.__DASH_PREVIEW_INIT if set by
 *      the workspace template).
 *   4. Construct a Sandpack root using the returned `files` + `dependencies`.
 *   5. Listen for the `dash-build:preview-refresh` CustomEvent — fired by
 *      app.ts SSE handler when the orchestrator emits `component:updated`.
 *      On refresh, re-POST and call `sandpack.updateFile()` for each diff.
 *
 * Agent A's workspace.ts SHOULD include this script tag AFTER /static/app.js:
 *   <script src="/static/preview-mount.js" defer></script>
 *
 * The script self-bails when the mount element is absent, so it is safe to
 * include on every page if convenient.
 *
 * CDN versions are imported from `src/constants/cdn.ts` so the probe script
 * (`scripts/probe-sandpack-cdn.mjs`) and the embedded runtime can never drift
 * apart — change one place, both stay in sync.
 */

import {
  REACT_CDN_URL,
  REACT_DOM_CLIENT_CDN_URL,
  SANDPACK_CDN_URL,
} from "../../../constants/cdn.js"

export const PREVIEW_MOUNT_JS = `
(function () {
  "use strict";

  var SANDPACK_CDN = ${JSON.stringify(SANDPACK_CDN_URL)};
  var REACT_CDN = ${JSON.stringify(REACT_CDN_URL)};
  var REACT_DOM_CLIENT_CDN = ${JSON.stringify(REACT_DOM_CLIENT_CDN_URL)};

  function bootstrap() {
    var init = (window).__DASH_PREVIEW_INIT || null;
    // Open WebUI #A4 — branch on A/B mode. When the init blob carries a
    // variantsSnapshot with >=2 entries, mount each variant in its own
    // Sandpack iframe; otherwise fall back to the canonical single-mount
    // path. Both paths share loadSandpackLib + escapeHtml helpers.
    var variantsSnapshot =
      init && init.variantsSnapshot && init.variantsSnapshot.list &&
      init.variantsSnapshot.list.length >= 2
        ? init.variantsSnapshot
        : null;
    if (variantsSnapshot) {
      bootstrapVariants(init, variantsSnapshot);
      bindVariantPickClicks();
      return;
    }

    var mount = document.getElementById("db-preview-sandpack");
    if (!mount) return; // no preview on this page
    var componentId = mount.getAttribute("data-component-id") || "";
    var promptId = mount.getAttribute("data-prompt-id") || null;

    var source = init && init.componentId === componentId ? init.componentSource : null;

    if (!source) {
      // No inline source — wait for SSE / explicit refresh to populate.
      setState(mount, "idle");
      bindRefreshListener(mount, function (cs) {
        source = cs;
        mountSandpack(mount, cs, promptId);
        return source;
      });
      return;
    }

    mountSandpack(mount, source, promptId);
    bindRefreshListener(mount, function (cs) {
      source = cs;
      mountSandpack(mount, cs, promptId);
      return source;
    });

    function setState(target, state) {
      target.setAttribute("data-preview-state", state);
    }
  }

  function bindRefreshListener(target, onSource) {
    target.addEventListener("dash-build:preview-refresh", function (e) {
      var detail = (e).detail || {};
      if (detail.componentSource) {
        onSource(detail.componentSource);
      }
    });
  }

  function setState(target, state) {
    target.setAttribute("data-preview-state", state);
  }

  // Open WebUI #A4 — bootstrap all variant mounts. Each mount has its own
  // [data-component-id][data-variant-id] target node; we pre-mount each
  // with the inline source from the snapshot. Both fetches run in parallel.
  function bootstrapVariants(init, snapshot) {
    var mounts = document.querySelectorAll(
      ".db-preview-sandpack--variant[data-variant-id]"
    );
    if (!mounts || mounts.length === 0) return;
    var componentId = init && init.componentId ? init.componentId : "";
    for (var i = 0; i < mounts.length; i++) {
      (function (mount) {
        var variantId = mount.getAttribute("data-variant-id") || "";
        var promptId = mount.getAttribute("data-prompt-id") || null;
        var entry = null;
        for (var j = 0; j < snapshot.list.length; j++) {
          if (snapshot.list[j].id === variantId) { entry = snapshot.list[j]; break; }
        }
        if (!entry) {
          setState(mount, "idle");
          return;
        }
        var source = entry.componentSource;
        mountSandpack(mount, source, promptId);
        bindRefreshListener(mount, function (cs) {
          mountSandpack(mount, cs, promptId);
        });
        // Avoid unused warning for componentId — it's surfaced for future
        // SSE wiring that scopes refresh by componentId equality.
        void componentId;
      })(mounts[i]);
    }
  }

  // Open WebUI #A4 — wire the "Pick this" CTAs. Click → POST to
  // /api/runs/:runId/pick-variant with the variant id; on success, reload
  // the workspace so the server-rendered split-view collapses to single.
  function bindVariantPickClicks() {
    var buttons = document.querySelectorAll("[data-variant-pick]");
    if (!buttons || buttons.length === 0) return;
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.addEventListener("click", function (e) {
        var target = e.currentTarget;
        var pick = target.getAttribute("data-variant-pick") || "";
        var runId = target.getAttribute("data-run-id") || "";
        if (!pick || !runId) return;
        if (target.getAttribute("aria-pressed") === "true") return;
        target.setAttribute("disabled", "true");
        target.textContent = "Picking…";
        fetch("/api/runs/" + encodeURIComponent(runId) + "/pick-variant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: pick }),
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data && data.ok) {
              window.location.reload();
            } else {
              target.removeAttribute("disabled");
              target.textContent = "Pick this";
            }
          })
          .catch(function () {
            target.removeAttribute("disabled");
            target.textContent = "Pick this";
          });
      });
    }
  }

  function mountSandpack(mount, componentSource, promptId) {
    renderSkeleton(mount);
    setState(mount, "loading");
    fetch("/api/preview/component", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        componentSource: componentSource,
        promptId: promptId,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || data.ok !== true) {
          renderError(mount, data && data.message ? data.message : "Preview render failed.");
          setState(mount, "error");
          return;
        }
        return loadSandpackLib().then(function (lib) {
          renderSandpack(mount, lib, data.sandpack);
          setState(mount, "ready");
        });
      })
      .catch(function (err) {
        renderError(mount, err && err.message ? err.message : String(err));
        setState(mount, "error");
      });
  }

  function renderSkeleton(mount) {
    mount.innerHTML =
      '<div class="db-preview-skeleton" role="status" aria-label="Preview loading">' +
        '<div class="db-preview-skeleton-bar db-preview-skeleton-bar--header"></div>' +
        '<div class="db-preview-skeleton-body">' +
          '<div class="db-preview-skeleton-bar db-preview-skeleton-bar--row" style="width: 78%"></div>' +
          '<div class="db-preview-skeleton-bar db-preview-skeleton-bar--row" style="width: 60%"></div>' +
          '<div class="db-preview-skeleton-bar db-preview-skeleton-bar--row" style="width: 86%"></div>' +
          '<div class="db-preview-skeleton-bar db-preview-skeleton-bar--block"></div>' +
          '<div class="db-preview-skeleton-bar db-preview-skeleton-bar--row" style="width: 70%"></div>' +
          '<div class="db-preview-skeleton-bar db-preview-skeleton-bar--row" style="width: 52%"></div>' +
        '</div>' +
        '<span class="db-preview-skeleton-sr">Compiling preview…</span>' +
      '</div>';
  }

  function renderError(mount, message) {
    mount.innerHTML =
      '<div class="db-preview-sandpack-error" role="alert">' +
      '<p class="db-preview-sandpack-error-title">Preview failed</p>' +
      '<p class="db-preview-sandpack-error-body">' +
        escapeHtml(message) +
      '</p>' +
      '</div>';
  }

  function loadSandpackLib() {
    if (window.__DASH_SANDPACK_PROMISE) return window.__DASH_SANDPACK_PROMISE;
    window.__DASH_SANDPACK_PROMISE = Promise.all([
      import(REACT_CDN),
      import(REACT_DOM_CLIENT_CDN),
      import(SANDPACK_CDN),
    ]).then(function (mods) {
      return {
        React: mods[0],
        ReactDOMClient: mods[1],
        Sandpack: mods[2],
      };
    });
    return window.__DASH_SANDPACK_PROMISE;
  }

  function renderSandpack(mount, lib, sandpack) {
    mount.innerHTML = "";
    var React = lib.React;
    var SandpackProvider = lib.Sandpack.SandpackProvider;
    var SandpackPreview = lib.Sandpack.SandpackPreview;
    var element = React.createElement(
      SandpackProvider,
      {
        template: sandpack.template,
        files: sandpack.files,
        customSetup: { dependencies: sandpack.dependencies, entry: sandpack.entry },
        theme: "light",
      },
      React.createElement(SandpackPreview, {
        showOpenInCodeSandbox: false,
        showRefreshButton: true,
      })
    );
    var root = lib.ReactDOMClient.createRoot(mount);
    root.render(element);
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
`
