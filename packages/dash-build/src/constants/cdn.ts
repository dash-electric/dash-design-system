/**
 * CDN URL constants — single source of truth for esm.sh-hosted runtimes the
 * Sandpack preview pulls in at mount time. Two consumers:
 *
 *   1. `src/daemon/templates/client/preview-mount.ts` — embeds them into the
 *      preview-mount.js blob served at /static/preview-mount.js. Bumping a
 *      version here changes the browser runtime.
 *   2. `scripts/probe-sandpack-cdn.mjs` — fetches each URL via HEAD before
 *      publish to ensure the CDN actually has those versions. If a version
 *      pin goes stale the build fails fast instead of users discovering it
 *      at runtime.
 *
 * The script reads these constants directly so we cannot drift the probed
 * versions away from the embedded ones. Avoid hard-coding versions outside
 * this file.
 */

/** Sandpack React renderer — drives the embedded preview iframe. */
export const SANDPACK_VERSION = "2.19.10"

/** React runtime — must match the version Sandpack expects as a peer. */
export const REACT_VERSION = "18.3.1"

/** Fully qualified esm.sh URL for the Sandpack React renderer. */
export const SANDPACK_CDN_URL = `https://esm.sh/@codesandbox/sandpack-react@${SANDPACK_VERSION}`

/** Fully qualified esm.sh URL for React. */
export const REACT_CDN_URL = `https://esm.sh/react@${REACT_VERSION}`

/** Fully qualified esm.sh URL for the react-dom/client entry. */
export const REACT_DOM_CLIENT_CDN_URL = `https://esm.sh/react-dom@${REACT_VERSION}/client`

/** Every CDN URL the probe script will HEAD-check before publish. */
export const PROBE_URLS: readonly string[] = [
  SANDPACK_CDN_URL,
  REACT_CDN_URL,
  REACT_DOM_CLIENT_CDN_URL,
]
