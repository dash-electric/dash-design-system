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
 */

export const PREVIEW_MOUNT_JS = `
(function () {
  "use strict";

  var SANDPACK_CDN = "https://esm.sh/@codesandbox/sandpack-react@2.19.10";
  var REACT_CDN = "https://esm.sh/react@18.3.1";

  function bootstrap() {
    var mount = document.getElementById("db-preview-sandpack");
    if (!mount) return; // no preview on this page
    var componentId = mount.getAttribute("data-component-id") || "";
    var promptId = mount.getAttribute("data-prompt-id") || null;

    // Initial state — try to grab source from inline init blob set by the
    // workspace template (avoids an extra round-trip when the source is
    // already known at SSR time). Falls back to fetching the latest run.
    var init = (window).__DASH_PREVIEW_INIT || null;
    var source = init && init.componentId === componentId ? init.componentSource : null;

    if (!source) {
      // No inline source — wait for SSE / explicit refresh to populate.
      setState("idle");
      bindRefreshListener();
      return;
    }

    mountSandpack(source);
    bindRefreshListener();

    function setState(state) {
      mount.setAttribute("data-preview-state", state);
    }

    function bindRefreshListener() {
      mount.addEventListener("dash-build:preview-refresh", function (e) {
        var detail = (e).detail || {};
        if (detail.componentSource) {
          mountSandpack(detail.componentSource);
        } else {
          // Fallback: refetch via POST using stored source (no-op if none).
          if (source) mountSandpack(source);
        }
      });
    }

    function mountSandpack(componentSource) {
      source = componentSource;
      setState("loading");
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
            renderError(data && data.message ? data.message : "Preview render failed.");
            setState("error");
            return;
          }
          return loadSandpackLib().then(function (lib) {
            renderSandpack(lib, data.sandpack);
            setState("ready");
          });
        })
        .catch(function (err) {
          renderError(err && err.message ? err.message : String(err));
          setState("error");
        });
    }

    function renderError(message) {
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
        import(REACT_CDN + "/dom/client"),
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

    function renderSandpack(lib, sandpack) {
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
`
