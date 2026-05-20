/**
 * Skeleton loading placeholders — shimmer effect for initial load and WS
 * reconnect periods. CSS shimmer animation lives in `styles/dashboard.ts`
 * under `.db-skeleton-card` / `.db-skeleton-line` / `.db-skeleton-chip`.
 */

/** Prompt card skeleton — 3 stacked lines mimicking head + body + foot. */
export function promptCardSkeleton(): string {
  return `<div class="db-skeleton-card" aria-hidden="true">
    <div class="db-skeleton-line" style="width: 60%"></div>
    <div class="db-skeleton-line" style="width: 90%; margin-top: 8px"></div>
    <div class="db-skeleton-line" style="width: 40%; margin-top: 12px"></div>
  </div>`
}

/** Status bar skeleton — two pill-shaped chips placeholder. */
export function statusBarSkeleton(): string {
  return `<div class="db-skeleton-status" aria-hidden="true">
    <div class="db-skeleton-chip"></div>
    <div class="db-skeleton-chip"></div>
  </div>`
}

/** Convenience: render N prompt card skeletons in a stacked list. */
export function promptListSkeleton(count = 3): string {
  return `<div class="db-skeleton-list" aria-busy="true" aria-live="polite">
    ${Array.from({ length: Math.max(1, count) }, () => promptCardSkeleton()).join("")}
  </div>`
}
