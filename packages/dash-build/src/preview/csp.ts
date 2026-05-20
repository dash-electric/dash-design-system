/**
 * Content Security Policy for iframe sandboxes.
 *
 * The shell sets this via meta tag AND the API route sends it as a header.
 * Two layers because some browsers honor only one when the HTML is served
 * from the same origin as the parent dashboard.
 *
 * Key restriction: `connect-src 'none'` — preview cannot phone home. Inline
 * scripts are required because esbuild emits an inline sourcemap.
 */

export interface CspOptions {
  /** Allow extra style/font origins (defaults cover Google Fonts + jsDelivr). */
  extraStyleSrc?: string[]
}

export function buildCsp(opts: CspOptions = {}): string {
  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://cdn.jsdelivr.net",
    ...(opts.extraStyleSrc ?? []),
  ]
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    `style-src ${styleSrc.join(" ")}`,
    "font-src https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: blob:",
    "connect-src 'none'",
    "frame-ancestors 'self'",
  ].join("; ")
}
