"use client"

import * as React from "react"
import {
  RiMapPin2Line as PinIcon,
  RiBroadcastLine as BroadcastIcon,
  RiCarLine as CarIcon,
  RiMotorbikeLine as BikeIcon,
  RiVipCrown2Line as PremiumIcon,
  RiArrowDownSLine as ChevronDown,
  RiArrowRightSLine as ChevronRight,
} from "@remixicon/react"
import { Card, CardContent, CardHeader } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import { toast } from "@/registry/dash/ui/toaster"
import { cn } from "@/registry/dash/lib/utils"

/**
 * PolygonShiftMap — Layer 3 / Ride product.
 *
 * Dispatcher view of mitra positioning vs. polygon-shift requirements.
 * Lists each zone with required vs. current driver counts, a saturation
 * indicator (under / balanced / over), and a per-zone "Broadcast bonus"
 * action for under-supplied zones.
 *
 * Why ride-only:
 *  - Polygon-shift is a Ride supply-positioning primitive (Logistic uses
 *    fixed-route assignment, not polygon shifts).
 *  - Vehicle taxonomy is Ride (motor / car / premium).
 *  - Voice: neutral ops register (dispatcher staff, not mitra).
 *
 * Map rendering:
 *  - This block intentionally does NOT include a Mapbox / Google Maps
 *    dependency. Real map integration is the consumer app's call — we'd
 *    rather avoid coupling the DS to one map vendor.
 *  - `mapRenderer="table"` (default) renders zones + supply/demand as a
 *    sortable table. `mapRenderer="external"` is reserved for the caller
 *    to compose the map separately; this block continues to render the
 *    detail table for the selected zone.
 *
 * Audit trail:
 *  - The "Broadcast bonus" action fires `onBroadcastBonus`. Caller writes
 *    (dispatcherId + zoneId + isoTs + zoneSnapshot) to the broadcast audit
 *    log per Dash AI Rules § Audit Trail. The block does NOT mutate zone
 *    state locally.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MitraVehicleType = "motor" | "car" | "premium"

export type PolygonZone = {
  id: string
  name: string
  /** Polygon vertex list — consumed by external map renderers. */
  shape: { lat: number; lng: number }[]
  requiredDrivers: number
  currentDrivers: number
}

export type MitraPosition = {
  id: string
  name: string
  lat: number
  lng: number
  status: "active" | "idle" | "delivering"
  vehicleType: MitraVehicleType
}

export type PolygonShiftMapProps = {
  zones: PolygonZone[]
  mitras: MitraPosition[]
  onZoneSelect?: (zoneId: string) => void
  /**
   * Optional broadcast bonus action — fires when dispatcher wants to lure
   * idle mitras to an under-supplied zone. Caller writes the audit row.
   */
  onBroadcastBonus?: (zoneId: string) => Promise<void>
  /**
   * Rendering mode:
   *  - "table" (default) — list + detail table only, no map dependency.
   *  - "external" — caller composes the actual map; this block still renders
   *    the supply/demand table beneath it for the selected zone.
   */
  mapRenderer?: "table" | "external"
  className?: string
}

// ---------------------------------------------------------------------------
// Saturation classifier — ratio of current / required drivers.
// ---------------------------------------------------------------------------

type Saturation = "under" | "balanced" | "over"

function classify(zone: PolygonZone): Saturation {
  if (zone.requiredDrivers === 0) {
    return zone.currentDrivers > 0 ? "over" : "balanced"
  }
  const ratio = zone.currentDrivers / zone.requiredDrivers
  if (ratio < 0.8) return "under"
  if (ratio > 1.2) return "over"
  return "balanced"
}

const SATURATION_BADGE = {
  under: { status: "error" as const, label: "Kurang" },
  balanced: { status: "success" as const, label: "Seimbang" },
  over: { status: "information" as const, label: "Berlebih" },
}

const VEHICLE_ICON: Record<MitraVehicleType, React.ReactNode> = {
  motor: <BikeIcon className="size-3.5" aria-hidden />,
  car: <CarIcon className="size-3.5" aria-hidden />,
  premium: <PremiumIcon className="size-3.5" aria-hidden />,
}

const VEHICLE_LABEL: Record<MitraVehicleType, string> = {
  motor: "Motor",
  car: "Mobil",
  premium: "Premium",
}

const STATUS_BADGE = {
  active: { status: "success" as const, label: "Aktif" },
  idle: { status: "warning" as const, label: "Idle" },
  delivering: { status: "information" as const, label: "Mengantar" },
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "?"

// ---------------------------------------------------------------------------
// Point-in-polygon (ray-casting) — used to list mitras inside a zone in the
// detail panel. Inline because we don't want to add Turf for one helper.
// ---------------------------------------------------------------------------

function pointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[],
): boolean {
  if (polygon.length < 3) return false
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]!.lng
    const yi = polygon[i]!.lat
    const xj = polygon[j]!.lng
    const yj = polygon[j]!.lat
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PolygonShiftMap({
  zones,
  mitras,
  onZoneSelect,
  onBroadcastBonus,
  mapRenderer = "table",
  className,
}: PolygonShiftMapProps) {
  const [selectedZoneId, setSelectedZoneId] = React.useState<string | null>(
    zones[0]?.id ?? null,
  )
  const [broadcastingId, setBroadcastingId] = React.useState<string | null>(null)

  const handleSelect = (zoneId: string) => {
    setSelectedZoneId(zoneId)
    onZoneSelect?.(zoneId)
  }

  const handleBroadcast = async (zoneId: string) => {
    if (!onBroadcastBonus) return
    setBroadcastingId(zoneId)
    try {
      await onBroadcastBonus(zoneId)
      toast.success("Bonus berhasil disiarkan ke mitra di sekitar zona.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tidak diketahui."
      toast.error(`Gagal menyiarkan bonus: ${message}`)
    } finally {
      setBroadcastingId(null)
    }
  }

  // Sort zones by saturation severity — under first (need attention), then
  // balanced, then over. Stable within a class.
  const sortedZones = React.useMemo(() => {
    const order: Record<Saturation, number> = { under: 0, balanced: 1, over: 2 }
    return [...zones].sort((a, b) => order[classify(a)] - order[classify(b)])
  }, [zones])

  // Mitras inside the selected zone.
  const selectedZone = React.useMemo(
    () => zones.find((z) => z.id === selectedZoneId) ?? null,
    [zones, selectedZoneId],
  )
  const mitrasInSelectedZone = React.useMemo(() => {
    if (!selectedZone) return []
    return mitras.filter((m) => pointInPolygon(m, selectedZone.shape))
  }, [mitras, selectedZone])

  // Summary counts
  const summary = React.useMemo(() => {
    const counts = { under: 0, balanced: 0, over: 0 }
    for (const z of zones) counts[classify(z)]++
    return counts
  }, [zones])

  return (
    <Card
      data-slot="polygon-shift-map"
      data-renderer={mapRenderer}
      className={cn("flex flex-col", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-stroke-soft-200 pb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text-strong-950">
            Polygon Shift Map
          </h2>
          <p className="text-xs text-text-sub-600">
            {zones.length} zona · {mitras.length} mitra terlacak
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status="error" appearance="lighter" size="sm">
            {summary.under} kurang
          </Badge>
          <Badge status="success" appearance="lighter" size="sm">
            {summary.balanced} seimbang
          </Badge>
          <Badge status="information" appearance="lighter" size="sm">
            {summary.over} berlebih
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-0 p-0">
        {mapRenderer === "external" ? (
          // Slot for an external map; caller composes the actual viewport.
          // We render a placeholder strip so consumers see where to mount.
          <div className="border-b border-dashed border-stroke-soft-200 bg-bg-weak-50 px-4 py-8 text-center text-xs text-text-soft-400">
            Render peta di sini melalui adapter eksternal (Mapbox / Google Maps).
            Lihat dokumentasi adapter untuk mengikat <code>zones.shape</code>{" "}
            dan <code>mitras</code>.
          </div>
        ) : null}

        {/* Zones table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Zona</TableHead>
                <TableHead className="text-right">Dibutuhkan</TableHead>
                <TableHead className="text-right">Tersedia</TableHead>
                <TableHead className="text-right">Selisih</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedZones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-text-sub-600">
                    Belum ada zona dikonfigurasi.
                  </TableCell>
                </TableRow>
              ) : null}
              {sortedZones.map((zone) => {
                const sat = classify(zone)
                const meta = SATURATION_BADGE[sat]
                const delta = zone.currentDrivers - zone.requiredDrivers
                const isSelected = selectedZoneId === zone.id
                const canBroadcast = sat === "under" && Boolean(onBroadcastBonus)
                return (
                  <TableRow
                    key={zone.id}
                    data-selected={isSelected || undefined}
                    data-saturation={sat}
                    className={cn(
                      "cursor-pointer",
                      isSelected ? "bg-[var(--theme-accent-lighter)]" : "",
                    )}
                    onClick={() => handleSelect(zone.id)}
                  >
                    <TableCell>
                      {isSelected ? (
                        <ChevronDown className="size-4 text-text-sub-600" aria-hidden />
                      ) : (
                        <ChevronRight className="size-4 text-text-soft-400" aria-hidden />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PinIcon aria-hidden className="size-3.5 text-text-sub-600" />
                        <span className="text-sm font-medium text-text-strong-950">
                          {zone.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {zone.requiredDrivers}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {zone.currentDrivers}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span
                        className={cn(
                          delta < 0
                            ? "text-error-base"
                            : delta > 0
                              ? "text-information-base"
                              : "text-text-sub-600",
                        )}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge status={meta.status} appearance="lighter" size="sm">
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canBroadcast ? (
                        <Button
                          type="button"
                          size="xs"
                          tone="primary"
                          style="stroke"
                          leftIcon={<BroadcastIcon />}
                          loading={broadcastingId === zone.id}
                          disabled={broadcastingId !== null}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBroadcast(zone.id)
                          }}
                        >
                          Siarkan bonus
                        </Button>
                      ) : (
                        <span className="text-xs text-text-soft-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Detail panel for selected zone */}
        {selectedZone ? (
          <div className="border-t border-stroke-soft-200 bg-bg-weak-50 px-4 py-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-text-strong-950">
                Mitra di {selectedZone.name}
              </p>
              <p className="text-xs text-text-sub-600 tabular-nums">
                {mitrasInSelectedZone.length} mitra di zona
              </p>
            </div>
            {mitrasInSelectedZone.length === 0 ? (
              <p className="rounded-lg border border-dashed border-stroke-soft-200 bg-bg-white-0 py-6 text-center text-xs text-text-soft-400">
                Tidak ada mitra di dalam polygon zona ini.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {mitrasInSelectedZone.map((m) => {
                  const status = STATUS_BADGE[m.status]
                  return (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2"
                    >
                      <Avatar size="sm">
                        <AvatarFallback>{initials(m.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-strong-950">
                          {m.name}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-text-sub-600">
                          {VEHICLE_ICON[m.vehicleType]}
                          <span>{VEHICLE_LABEL[m.vehicleType]}</span>
                        </p>
                      </div>
                      <Badge
                        status={status.status}
                        appearance="lighter"
                        size="sm"
                      >
                        {status.label}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
