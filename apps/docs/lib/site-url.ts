/**
 * Public origin of this docs deployment — used to build copy-paste skill
 * links (e.g. https://<origin>/skills/<slug>.md).
 *
 * Configurable per environment (staging vs production) via env var, set in
 * the GitHub deploy workflow:
 *   - SITE_URL             — runtime (Cloud Run env var; no rebuild needed)
 *   - NEXT_PUBLIC_SITE_URL — build-time (inlined; use if a client component
 *                            ever needs it directly)
 *
 * Both are read here; falls back to the production origin. Read in server
 * components, so the runtime SITE_URL is enough for staging vs prod.
 */
export function getSiteUrl(): string {
  const pick = (v: string | undefined) =>
    v && v.trim().length > 0 ? v.trim() : undefined
  const raw =
    pick(process.env.NEXT_PUBLIC_SITE_URL) ??
    pick(process.env.SITE_URL) ??
    "https://ds.dash.com"
  return raw.replace(/\/+$/, "")
}

/** Host only (no scheme) — for compact display in UI. */
export function getSiteHost(): string {
  try {
    return new URL(getSiteUrl()).host
  } catch {
    return getSiteUrl().replace(/^https?:\/\//, "")
  }
}
