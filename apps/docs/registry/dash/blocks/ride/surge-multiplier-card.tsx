"use client"

import * as React from "react"
import {
  RiFireFill as FireIcon,
  RiTimeLine as ClockIcon,
  RiMapPin2Line as PinIcon,
  RiCarLine as CarIcon,
} from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Badge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"

/**
 * SurgeMultiplierCard — Layer 3 / Ride product.
 *
 * Real-time surge multiplier indicator for the Dash Ride mitra (driver) mobile
 * app. Mitra opens app → sees current zone, multiplier (e.g. 1.5×), countdown
 * until surge expires, projected earning range, and number of waiting orders.
 *
 * Why ride-only:
 *  - Surge pricing model is Ride-specific (Logistic uses zone-bonus, Travel
 *    uses time-of-day mult, Marketplace none).
 *  - Voice: formal "Anda" mitra-facing register (per Dash voice rule).
 *  - Visual emphasis on the green ride accent ramp (Layer 2 theme: ride).
 *
 * Data ownership:
 *  - The component is presentational. Caller fetches surge from the pricing
 *    service, polls `/v1/ride/surge/zones/{zoneId}` (typical 15s tick), and
 *    re-passes props. `validUntil` drives the countdown locally so we don't
 *    require sub-second polling.
 *
 * Audit trail: N/A. This is a display-only card. Mitra accepting a surge
 * order writes the audit row downstream in the trip dispatch flow, not here.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SurgeLevel = "off" | "low" | "medium" | "high" | "extreme"

export type SurgeMultiplierCardProps = {
  /** Human-readable zone label, e.g. "Sudirman", "Kemang", "Senayan". */
  zoneName: string
  /** Numeric multiplier applied to the base fare (1.0 = no surge). */
  multiplier: number
  /** Semantic level — drives color + copy. Caller maps multiplier ranges. */
  level: SurgeLevel
  /** ISO8601 timestamp when this surge window expires. */
  validUntil: string
  /** Optional earning projection at the current multiplier (IDR cents). */
  estimatedEarning?: { min: number; max: number }
  /** Active demand signal — orders waiting in this zone. */
  waitingOrders?: number
  className?: string
}

// ---------------------------------------------------------------------------
// Level → presentation map
// ---------------------------------------------------------------------------

// We DON'T map directly to --theme-accent-* for every level because surge
// semantics span a wider band than the single accent ramp: "extreme" needs
// red urgency, "high" leans into the ride green peak, "off" is neutral.
// Levels off/low use neutral + soft theme tint. Levels medium/high use the
// theme accent ramp. Extreme escalates to error/red — universal "stop and
// look" register that doesn't conflict with the green ride accent.
const LEVEL_LABEL_ID: Record<SurgeLevel, string> = {
  off: "Tidak ada surge",
  low: "Surge rendah",
  medium: "Surge sedang",
  high: "Surge tinggi",
  extreme: "Surge ekstrem",
}

const LEVEL_RING_CLASS: Record<SurgeLevel, string> = {
  off: "bg-bg-weak-50 text-text-sub-600 border-stroke-soft-200",
  low: "bg-[var(--theme-accent-lighter)] text-text-strong-950 border-[var(--theme-accent-light)]",
  medium:
    "bg-[var(--theme-accent-light)] text-[var(--theme-accent-darker)] border-[var(--theme-accent-base)]",
  high: "bg-[var(--theme-accent-base)] text-[var(--theme-accent-on)] border-[var(--theme-accent-dark)]",
  extreme: "bg-error-base text-static-white border-error-dark",
}

const LEVEL_BADGE_STATUS = {
  off: "neutral",
  low: "stable",
  medium: "feature",
  high: "success",
  extreme: "error",
} as const

// ---------------------------------------------------------------------------
// Formatters — inline, no date / intl lib added (per Dash external-lib policy)
// ---------------------------------------------------------------------------

function formatIdr(cents: number): string {
  const rupiah = Math.round(cents / 100)
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(rupiah)
}

function formatMultiplier(m: number): string {
  // 1.5 → "1.5×", 2 → "2×". Indonesian uses period as decimal but we keep
  // dot for numerics to match Dash app convention.
  if (Number.isInteger(m)) return `${m}×`
  return `${m.toFixed(1)}×`
}

/** "Berlaku 4m 32s lagi" — countdown copy in formal Anda register. */
function formatCountdownId(msRemaining: number): string {
  if (msRemaining <= 0) return "Surge berakhir"
  const totalSec = Math.floor(msRemaining / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  if (min >= 60) {
    const hr = Math.floor(min / 60)
    const remMin = min % 60
    return `Berlaku ${hr}j ${remMin}m lagi`
  }
  if (min > 0) return `Berlaku ${min}m ${sec.toString().padStart(2, "0")}d lagi`
  return `Berlaku ${sec}d lagi`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SurgeMultiplierCard({
  zoneName,
  multiplier,
  level,
  validUntil,
  estimatedEarning,
  waitingOrders,
  className,
}: SurgeMultiplierCardProps) {
  // Pulse animation re-keyed by level so it re-triggers on level change.
  // The key forces a remount of the pulse ring on transition (e.g. medium →
  // high), drawing the mitra's eye when surge escalates.
  const [pulseKey, setPulseKey] = React.useState(0)
  const lastLevelRef = React.useRef(level)
  React.useEffect(() => {
    if (lastLevelRef.current !== level) {
      setPulseKey((k) => k + 1)
      lastLevelRef.current = level
    }
  }, [level])

  // Countdown — recompute every second. We use a single setInterval so the
  // component is cheap even if many cards render in a list view.
  const validUntilMs = React.useMemo(() => {
    const t = new Date(validUntil).getTime()
    return Number.isNaN(t) ? 0 : t
  }, [validUntil])

  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const remaining = validUntilMs - now
  const isExpired = remaining <= 0

  const heroClasses = LEVEL_RING_CLASS[level]

  return (
    <Card
      data-slot="surge-multiplier-card"
      data-level={level}
      className={cn("overflow-hidden", className)}
      aria-label={`${LEVEL_LABEL_ID[level]} di ${zoneName}`}
    >
      {/* Hero band — multiplier value, large. */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 border-b px-5 py-6 transition-colors",
          heroClasses,
        )}
      >
        {/* Pulse ring — animated on level change. */}
        {level !== "off" && !isExpired ? (
          <span
            key={pulseKey}
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 animate-ping rounded-none opacity-30",
              level === "extreme" ? "bg-error-light" : "bg-[var(--theme-accent-light)]",
            )}
            style={{ animationDuration: "1.6s", animationIterationCount: 2 }}
          />
        ) : null}

        <div className="relative flex items-center gap-2 text-sm font-medium opacity-90">
          <FireIcon aria-hidden className="size-4" />
          <span>{LEVEL_LABEL_ID[level]}</span>
        </div>
        <div
          className="relative font-bold leading-none tabular-nums"
          style={{ fontSize: "clamp(2.5rem, 8vw, 3.5rem)" }}
        >
          {formatMultiplier(multiplier)}
        </div>
        <div className="relative flex items-center gap-1 text-xs opacity-90">
          <PinIcon aria-hidden className="size-3.5" />
          <span className="font-medium">{zoneName}</span>
        </div>
      </div>

      {/* Body — countdown, earning, waiting orders. */}
      <CardContent className="space-y-3 px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm text-text-sub-600">
            <ClockIcon aria-hidden className="size-4" />
            <span aria-live="polite" className="tabular-nums">
              {formatCountdownId(remaining)}
            </span>
          </div>
          <Badge
            status={LEVEL_BADGE_STATUS[level]}
            appearance="lighter"
            size="sm"
          >
            {LEVEL_LABEL_ID[level]}
          </Badge>
        </div>

        {estimatedEarning ? (
          <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2.5">
            <p className="text-xs text-text-sub-600">
              Estimasi pendapatan Anda
            </p>
            <p className="text-base font-semibold text-text-strong-950 tabular-nums">
              {formatIdr(estimatedEarning.min)} – {formatIdr(estimatedEarning.max)}
            </p>
            <p className="text-xs text-text-soft-400">per perjalanan</p>
          </div>
        ) : null}

        {typeof waitingOrders === "number" && waitingOrders > 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--theme-accent-lighter)] px-3 py-2 text-sm text-[var(--theme-accent-darker)]">
            <CarIcon aria-hidden className="size-4" />
            <span>
              <strong className="tabular-nums">{waitingOrders}</strong>{" "}
              {waitingOrders === 1 ? "pesanan menunggu" : "pesanan menunggu"} di zona ini
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
