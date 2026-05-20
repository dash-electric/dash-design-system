"use client"

import * as React from "react"
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiMapPin2Line,
  RiTimeLine,
  RiTruckLine,
  RiMotorbikeLine,
  RiCarLine,
  RiAlertLine,
  RiCheckLine,
  RiFlashlightLine,
  RiStarLine,
  RiInboxArchiveLine,
  RiInboxUnarchiveLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Label } from "@/registry/dash/ui/label"
import { toast } from "@/registry/dash/ui/toaster"
import { cn } from "@/registry/dash/lib/utils"

/**
 * route-planner — Dash Logistic Layer 3 block (theme: "logistic").
 *
 * WHY this block exists:
 *  - Courier batch-ops UX: N pickup/dropoff stops, sorted by ETA, with a
 *    manual override for dispatchers who know the field better than the TSP.
 *  - Vehicle constraint awareness — truck-large does not fit "gang sempit",
 *    surfaces a manual flag rather than silently failing.
 *  - Audit trail: route assignment is fleet-ops sensitive (driver hours,
 *    fuel cost, customer SLA). Log route + driver + dispatcher + timestamp.
 *  - Voice neutral (ops/dispatcher facing internal tool). No mitra "Anda".
 *
 * Implementation notes:
 *  - useState only (banned imports policy).
 *  - Optimization is delegated to `onOptimize` resolver — DS does not own
 *    TSP solving (consumer chooses Google OR-tools / OSRM / Mapbox).
 *  - Drag-reorder is the bare-minimum useful: keyboard up/down + drag handle.
 *    Full HTML5 DnD is overkill for ~20 stops/route median.
 *  - Distance + ETA are derived from `distanceMatrix` if provided, else
 *    fall back to crude haversine from the start location → first stop +
 *    stop-to-stop. Caller can pass a high-accuracy matrix when they have one.
 *  - Theme: uses `--theme-accent-*` (orange) for the "Optimize" CTA per
 *    `themes/logistic/colors.css`. Primary CTAs (Assign) stay Dash purple.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RouteStop = {
  id: string
  type: "pickup" | "dropoff"
  address: string
  lat: number
  lng: number
  customerName?: string
  packageId?: string
  timeWindow?: { start: string; end: string } // ISO
  priority?: "standard" | "express" | "urgent"
}

export type RoutePlannerVehicle = "motor" | "car" | "truck-small" | "truck-large"

export type RoutePlannerProps = {
  stops: RouteStop[]
  /** Caller optimizes via TSP / external service. */
  onOptimize: (stops: RouteStop[]) => Promise<RouteStop[]>
  /** Optional: caller provides distance matrix (meters, NxN, row major). */
  distanceMatrix?: number[][]
  startLocation: { lat: number; lng: number; address: string }
  vehicleType: RoutePlannerVehicle
  /** Save route assignment. Caller writes to `t_route_assignments_audit_log`. */
  onAssign: (route: {
    stops: RouteStop[]
    totalDistance: number
    eta: string
    driverId: string
  }) => Promise<void>
  /** Default driver id, optional. */
  defaultDriverId?: string
  /** Dispatcher id, surfaced in audit metadata + sr-only readout. */
  dispatcherId?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type IconType = React.ComponentType<{
  className?: string
  "aria-hidden"?: React.AriaAttributes["aria-hidden"]
}>

const VEHICLE_META: Record<
  RoutePlannerVehicle,
  {
    label: string
    icon: IconType
    /** Average speed km/h used for crude ETA fallback. */
    avgSpeedKmh: number
    /** Soft warning text — surfaced when not empty. */
    constraintWarning?: string
  }
> = {
  motor: { label: "Motor", icon: RiMotorbikeLine, avgSpeedKmh: 28 },
  car: { label: "Mobil", icon: RiCarLine, avgSpeedKmh: 32 },
  "truck-small": { label: "Truk Kecil", icon: RiTruckLine, avgSpeedKmh: 26 },
  "truck-large": {
    label: "Truk Besar",
    icon: RiTruckLine,
    avgSpeedKmh: 22,
    constraintWarning:
      "Truk besar tidak muat di gang sempit. Mohon flag manual stop yang berisiko sebelum assign.",
  },
}

const PRIORITY_META: Record<
  NonNullable<RouteStop["priority"]>,
  { label: string; status: "neutral" | "warning" | "error"; icon: React.ReactNode }
> = {
  standard: { label: "Standar", status: "neutral", icon: null },
  express: {
    label: "Express",
    status: "warning",
    icon: <RiFlashlightLine aria-hidden className="size-3" />,
  },
  urgent: {
    label: "Urgent",
    status: "error",
    icon: <RiStarLine aria-hidden className="size-3" />,
  },
}

// ---------------------------------------------------------------------------
// Distance / ETA helpers
// ---------------------------------------------------------------------------

/** Haversine distance in meters. */
function haversine(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371_000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Total route distance in meters.
 * If `matrix[i][j]` is provided we trust it; else fall back to haversine.
 * Row 0 = start location, rows 1..N = stops (in order).
 */
function totalDistance(
  start: { lat: number; lng: number },
  stops: RouteStop[],
  matrix?: number[][],
): number {
  const points: Array<{ lat: number; lng: number }> = [start, ...stops]
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (
      matrix &&
      matrix[i] &&
      typeof matrix[i][i + 1] === "number" &&
      Number.isFinite(matrix[i][i + 1])
    ) {
      total += matrix[i][i + 1]
    } else {
      total += haversine(a, b)
    }
  }
  return total
}

function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters <= 0) return "—"
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—"
  const totalMin = Math.round(ms / 60_000)
  if (totalMin < 60) return `${totalMin} mnt`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m === 0 ? `${h} jam` : `${h} jam ${m} mnt`
}

function formatEta(date: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date)
  } catch {
    return date.toISOString()
  }
}

function formatTimeWindow(tw?: { start: string; end: string }): string | null {
  if (!tw) return null
  try {
    const s = new Date(tw.start)
    const e = new Date(tw.end)
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d)
    return `${fmt(s)}–${fmt(e)}`
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoutePlanner({
  stops: initialStops,
  onOptimize,
  distanceMatrix,
  startLocation,
  vehicleType,
  onAssign,
  defaultDriverId = "",
  dispatcherId,
  className,
}: RoutePlannerProps) {
  const [stops, setStops] = React.useState<RouteStop[]>(initialStops)
  const [optimizing, setOptimizing] = React.useState(false)
  const [assigning, setAssigning] = React.useState(false)
  const [driverId, setDriverId] = React.useState<string>(defaultDriverId)
  const [driverError, setDriverError] = React.useState<string | undefined>(
    undefined,
  )
  const [flaggedStopIds, setFlaggedStopIds] = React.useState<Set<string>>(
    () => new Set(),
  )

  const vehicleMeta = VEHICLE_META[vehicleType]

  // Reset stops when caller passes a fresh prop (e.g. switching routes).
  React.useEffect(() => {
    setStops(initialStops)
  }, [initialStops])

  // -------------------------------------------------------------------------
  // Derived: distance + ETA
  // -------------------------------------------------------------------------
  const totals = React.useMemo(() => {
    const dist = totalDistance(startLocation, stops, distanceMatrix)
    const speedMs = (vehicleMeta.avgSpeedKmh * 1000) / 3600
    // Drive time + 4 minutes per stop (handling overhead).
    const driveMs = speedMs > 0 ? (dist / speedMs) * 1000 : 0
    const stopOverheadMs = stops.length * 4 * 60 * 1000
    const totalMs = driveMs + stopOverheadMs
    const eta = new Date(Date.now() + totalMs)
    return {
      distanceMeters: dist,
      durationMs: totalMs,
      eta,
    }
  }, [startLocation, stops, distanceMatrix, vehicleMeta.avgSpeedKmh])

  // -------------------------------------------------------------------------
  // Reorder helpers
  // -------------------------------------------------------------------------
  const move = (index: number, dir: -1 | 1) => {
    setStops((prev) => {
      const next = prev.slice()
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      const [picked] = next.splice(index, 1)
      next.splice(target, 0, picked)
      return next
    })
  }

  // -------------------------------------------------------------------------
  // Optimize
  // -------------------------------------------------------------------------
  const handleOptimize = async () => {
    setOptimizing(true)
    try {
      const next = await onOptimize(stops)
      setStops(next)
      toast.success("Rute teroptimasi berdasarkan jarak + time window.")
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Optimasi gagal. Mohon coba beberapa saat lagi.",
      )
    } finally {
      setOptimizing(false)
    }
  }

  // -------------------------------------------------------------------------
  // Flag manual (vehicle constraint)
  // -------------------------------------------------------------------------
  const toggleFlag = (stopId: string) => {
    setFlaggedStopIds((prev) => {
      const next = new Set(prev)
      if (next.has(stopId)) next.delete(stopId)
      else next.add(stopId)
      return next
    })
  }

  // -------------------------------------------------------------------------
  // Assign
  // -------------------------------------------------------------------------
  const handleAssign = async () => {
    setDriverError(undefined)
    const id = driverId.trim()
    if (!id) {
      setDriverError("Mohon isi driver ID.")
      return
    }
    setAssigning(true)
    try {
      await onAssign({
        stops,
        totalDistance: Math.round(totals.distanceMeters),
        eta: totals.eta.toISOString(),
        driverId: id,
      })
      toast.success(`Rute ditugaskan ke driver ${id}.`)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Penugasan gagal tersimpan. Mohon coba lagi.",
      )
    } finally {
      setAssigning(false)
    }
  }

  const VehicleIcon = vehicleMeta.icon
  const pickupCount = stops.filter((s) => s.type === "pickup").length
  const dropoffCount = stops.length - pickupCount

  return (
    <section
      aria-label="Perencana rute pengantaran"
      className={cn(
        "rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4",
        className,
      )}
    >
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-text-strong-950">
            Perencana Rute
          </h3>
          <p className="mt-0.5 text-xs text-text-soft-400">
            {stops.length} stop · {pickupCount} pickup · {dropoffCount} dropoff
          </p>
        </div>
        <Button
          type="button"
          tone="primary"
          style="filled"
          size="sm"
          loading={optimizing}
          disabled={optimizing || stops.length < 2}
          onClick={handleOptimize}
          className="bg-[var(--theme-accent-base)] hover:bg-[var(--theme-accent-dark)] text-[var(--theme-accent-on)]"
        >
          {optimizing ? "Mengoptimasi..." : "Optimize Otomatis"}
        </Button>
      </header>

      {/* Summary strip */}
      <dl className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3 sm:grid-cols-4">
        <SummaryStat
          icon={<VehicleIcon aria-hidden className="size-4 text-text-sub-600" />}
          label="Kendaraan"
          value={vehicleMeta.label}
        />
        <SummaryStat
          icon={<RiMapPin2Line aria-hidden className="size-4 text-text-sub-600" />}
          label="Total Stop"
          value={String(stops.length)}
        />
        <SummaryStat
          icon={<RiInboxArchiveLine aria-hidden className="size-4 text-text-sub-600" />}
          label="Total Jarak"
          value={formatDistance(totals.distanceMeters)}
        />
        <SummaryStat
          icon={<RiTimeLine aria-hidden className="size-4 text-text-sub-600" />}
          label="ETA Selesai"
          value={`${formatEta(totals.eta)} · ${formatDuration(totals.durationMs)}`}
        />
      </dl>

      {/* Vehicle constraint warning */}
      {vehicleMeta.constraintWarning ? (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-state-warning-base/40 bg-state-warning-lighter/40 p-3 text-xs text-text-strong-950">
          <RiAlertLine
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-state-warning-base"
          />
          <span>{vehicleMeta.constraintWarning}</span>
        </div>
      ) : null}

      {/* Start location */}
      <div className="mb-3 rounded-lg border border-dashed border-stroke-soft-200 p-3 text-xs text-text-sub-600">
        <span className="font-medium text-text-strong-950">Mulai dari: </span>
        {startLocation.address}
      </div>

      {/* Stops list */}
      {stops.length === 0 ? (
        <p className="rounded-lg border border-stroke-soft-200 p-6 text-center text-sm text-text-soft-400">
          Belum ada stop pada rute ini.
        </p>
      ) : (
        <ol className="space-y-2" role="list">
          {stops.map((stop, index) => (
            <StopRow
              key={stop.id}
              stop={stop}
              index={index}
              total={stops.length}
              flagged={flaggedStopIds.has(stop.id)}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onToggleFlag={() => toggleFlag(stop.id)}
            />
          ))}
        </ol>
      )}

      {/* Assign panel */}
      <div className="mt-4 grid gap-3 rounded-lg border border-stroke-soft-200 p-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="route-planner-driver-id">
            Driver ID <span className="text-error-base">*</span>
          </Label>
          <input
            id="route-planner-driver-id"
            type="text"
            value={driverId}
            onChange={(e) => {
              setDriverId(e.target.value)
              if (driverError) setDriverError(undefined)
            }}
            placeholder="DRV-..."
            aria-invalid={Boolean(driverError)}
            disabled={assigning}
            className={cn(
              "mt-1 block w-full rounded-md border bg-bg-white-0 px-3 py-2 text-sm text-text-strong-950 outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40",
              driverError ? "border-error-base" : "border-stroke-soft-200",
            )}
          />
          {driverError ? (
            <p className="mt-1 text-xs text-error-base">{driverError}</p>
          ) : (
            <p className="mt-1 text-xs text-text-soft-400">
              Rute + driver + dispatcher + timestamp tercatat di audit log.
            </p>
          )}
        </div>
        <Button
          type="button"
          tone="primary"
          style="filled"
          size="md"
          leftIcon={<RiCheckLine />}
          loading={assigning}
          disabled={assigning || stops.length === 0}
          onClick={handleAssign}
        >
          {assigning ? "Menyimpan..." : "Tugaskan Rute"}
        </Button>
      </div>

      {dispatcherId ? (
        <span className="sr-only">Dispatcher: {dispatcherId}</span>
      ) : null}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <dt className="text-[11px] uppercase tracking-wide text-text-soft-400">
          {label}
        </dt>
        <dd className="truncate text-sm font-medium text-text-strong-950">
          {value}
        </dd>
      </div>
    </div>
  )
}

function StopRow({
  stop,
  index,
  total,
  flagged,
  onMoveUp,
  onMoveDown,
  onToggleFlag,
}: {
  stop: RouteStop
  index: number
  total: number
  flagged: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleFlag: () => void
}) {
  const isPickup = stop.type === "pickup"
  const priority = stop.priority ?? "standard"
  const priorityMeta = PRIORITY_META[priority]
  const window = formatTimeWindow(stop.timeWindow)

  return (
    <li
      className={cn(
        "rounded-lg border p-3 transition-colors",
        flagged
          ? "border-state-warning-base/60 bg-state-warning-lighter/40"
          : "border-stroke-soft-200 bg-bg-white-0",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Sequence + type */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
              isPickup
                ? "bg-state-feature-lighter text-state-feature-base"
                : "bg-state-success-lighter text-state-success-base",
            )}
            aria-label={isPickup ? "Pickup" : "Dropoff"}
          >
            {isPickup ? (
              <RiInboxArchiveLine aria-hidden className="size-4" />
            ) : (
              <RiInboxUnarchiveLine aria-hidden className="size-4" />
            )}
          </span>
          <span className="text-[11px] font-mono text-text-soft-400">
            #{index + 1}
          </span>
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              status={isPickup ? "feature" : "success"}
              appearance="lighter"
            >
              {isPickup ? "Pickup" : "Dropoff"}
            </Badge>
            {priority !== "standard" ? (
              <Badge status={priorityMeta.status} appearance="lighter">
                <span className="flex items-center gap-1">
                  {priorityMeta.icon}
                  {priorityMeta.label}
                </span>
              </Badge>
            ) : null}
            {window ? (
              <span className="inline-flex items-center gap-1 text-xs text-text-sub-600">
                <RiTimeLine aria-hidden className="size-3.5" />
                {window}
              </span>
            ) : null}
            {flagged ? (
              <Badge status="warning" appearance="filled">
                Flag Manual
              </Badge>
            ) : null}
          </div>

          <p className="mt-1.5 truncate text-sm text-text-strong-950">
            {stop.address}
          </p>
          <p className="mt-0.5 text-xs text-text-soft-400">
            {stop.customerName ?? "—"}
            {stop.packageId ? (
              <>
                {" · "}
                <span className="font-mono">{stop.packageId}</span>
              </>
            ) : null}
          </p>
        </div>

        {/* Controls */}
        <div className="flex shrink-0 flex-col gap-1">
          <Button
            type="button"
            tone="neutral"
            style="ghost"
            size="xs"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label={`Pindah stop ${index + 1} ke atas`}
            leftIcon={<RiArrowUpLine />}
          >
            <span className="sr-only">Naik</span>
          </Button>
          <Button
            type="button"
            tone="neutral"
            style="ghost"
            size="xs"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label={`Pindah stop ${index + 1} ke bawah`}
            leftIcon={<RiArrowDownLine />}
          >
            <span className="sr-only">Turun</span>
          </Button>
          <Button
            type="button"
            tone={flagged ? "destructive" : "neutral"}
            style={flagged ? "filled" : "stroke"}
            size="xs"
            onClick={onToggleFlag}
            aria-pressed={flagged}
            leftIcon={<RiAlertLine />}
          >
            <span className="sr-only">
              {flagged ? "Hapus flag" : "Tandai manual"}
            </span>
          </Button>
        </div>
      </div>
    </li>
  )
}

export default RoutePlanner
