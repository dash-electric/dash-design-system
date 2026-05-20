"use client"

import * as React from "react"
import {
  RiSearchLine as SearchIcon,
  RiCheckLine as CheckIcon,
  RiCarLine as CarIcon,
  RiMotorbikeLine as BikeIcon,
  RiVipCrown2Line as PremiumIcon,
  RiStarFill as StarIcon,
  RiMapPinLine as PinIcon,
  RiUserStarLine as UserStarIcon,
  RiFlashlightLine as BulkIcon,
} from "@remixicon/react"
import { Card, CardContent, CardHeader } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { toast } from "@/registry/dash/ui/toaster"
import { cn } from "@/registry/dash/lib/utils"

/**
 * DriverAssignmentBoard — Layer 3 / Ride product.
 *
 * Dispatcher backoffice tool. Split-pane: left = pending / matching ride
 * requests, right = available drivers for the selected request. Dispatcher
 * picks one driver, hits "Assign", and the audit row is fired through
 * `onAssign`. Optional bulk-assign toggle auto-matches the closest qualified
 * driver to each selected request.
 *
 * Why ride-only:
 *  - Vehicle taxonomy is Ride-specific (motor / car / premium). Logistic uses
 *    fleet vehicle classes; Travel doesn't have driver pools at all.
 *  - Voice: neutral ops register (dispatcher is staff, not mitra).
 *  - The "acceptance rate" feature is a Ride dispatcher KPI not surfaced in
 *    other product workflows.
 *
 * Audit trail:
 *  - Every assignment writes (dispatcherId + requestId + driverId + isoTs +
 *    method ("manual" | "bulk")) to t_ride_assignment_audit_log. The block
 *    fires `onAssign`; caller persists the row.
 *  - We do NOT mutate request status locally. Caller updates the request
 *    rows after the BE write succeeds and re-passes them.
 *
 * Performance note:
 *  - `driversForRequest` is a Promise — we lazy-fetch on selection rather
 *    than pre-loading drivers for every request (a 200-request queue would
 *    fan out to 200 driver lookups otherwise).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RideVehicleType = "motor" | "car" | "premium"

export type RideRequest = {
  id: string
  pickupLocation: string
  dropoffLocation: string
  passengerName: string
  passengerRating?: number
  vehicleType: RideVehicleType
  status: "pending" | "matching" | "assigned" | "cancelled"
  /** Estimated fare in IDR cents — formatted at render time. */
  estimatedFare: number
  /** ISO8601 timestamp of when the request was placed. */
  requestedAt: string
}

export type AvailableDriver = {
  id: string
  name: string
  vehicleType: RideVehicleType
  /** Meters from pickup point. */
  distance: number
  /** Driver rating, 0–5. */
  rating: number
  trips: number
  /** Acceptance rate 0–1 (0.92 = 92%). */
  acceptanceRate: number
}

export type DriverAssignmentBoardProps = {
  requests: RideRequest[]
  /** Lazy fetch — only called when a request is selected. */
  driversForRequest: (requestId: string) => Promise<AvailableDriver[]>
  /**
   * Persist the assignment. Caller writes the audit row and re-fetches
   * `requests` so the board reflects the new status.
   */
  onAssign: (requestId: string, driverId: string) => Promise<void>
  /** Acting dispatcher id — recorded in the audit row by the caller. */
  dispatcherId: string
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VEHICLE_LABEL: Record<RideVehicleType, string> = {
  motor: "Motor",
  car: "Mobil",
  premium: "Premium",
}

const VEHICLE_ICON: Record<RideVehicleType, React.ReactNode> = {
  motor: <BikeIcon className="size-3.5" aria-hidden />,
  car: <CarIcon className="size-3.5" aria-hidden />,
  premium: <PremiumIcon className="size-3.5" aria-hidden />,
}

function formatIdr(cents: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(cents / 100))
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function formatRelative(iso: string, now: number = Date.now()): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return iso
  const diffSec = Math.round((now - t) / 1000)
  if (diffSec < 60) return `${diffSec}d lalu`
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m lalu`
  const diffHr = Math.round(diffMin / 60)
  return `${diffHr}j lalu`
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "?"

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DriverAssignmentBoard({
  requests,
  driversForRequest,
  onAssign,
  dispatcherId,
  className,
}: DriverAssignmentBoardProps) {
  // Selection state — single request unless bulk-assign toggle is on.
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(
    null,
  )
  const [bulkMode, setBulkMode] = React.useState(false)
  const [bulkSelection, setBulkSelection] = React.useState<Set<string>>(new Set())

  // Driver list state per selected request — cached so flipping back and
  // forth in the queue doesn't re-fetch unnecessarily during a session.
  const [driverCache, setDriverCache] = React.useState<
    Record<string, AvailableDriver[]>
  >({})
  const [loadingDrivers, setLoadingDrivers] = React.useState(false)

  // Filters
  const [query, setQuery] = React.useState("")
  const [minAcceptance, setMinAcceptance] = React.useState<string>("0")
  const [assigningId, setAssigningId] = React.useState<string | null>(null)

  // Lazy-load drivers when selection changes.
  React.useEffect(() => {
    if (!selectedRequestId) return
    if (driverCache[selectedRequestId]) return
    let cancelled = false
    setLoadingDrivers(true)
    driversForRequest(selectedRequestId)
      .then((drivers) => {
        if (cancelled) return
        setDriverCache((c) => ({ ...c, [selectedRequestId]: drivers }))
      })
      .catch((err) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : "Tidak diketahui."
        toast.error(`Gagal memuat daftar driver: ${message}`)
      })
      .finally(() => {
        if (!cancelled) setLoadingDrivers(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedRequestId, driversForRequest, driverCache])

  // Sortable request list — pending first, then matching; newest at top.
  const sortedRequests = React.useMemo(() => {
    const visible = requests.filter(
      (r) => r.status === "pending" || r.status === "matching",
    )
    return [...visible].sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    })
  }, [requests])

  // Selected request lookup.
  const selectedRequest = React.useMemo(
    () => requests.find((r) => r.id === selectedRequestId) ?? null,
    [requests, selectedRequestId],
  )

  // Filter the active driver list.
  const driverListRaw = selectedRequestId ? driverCache[selectedRequestId] : null
  const filteredDrivers = React.useMemo(() => {
    if (!driverListRaw) return []
    const min = Number(minAcceptance) / 100
    const q = query.trim().toLowerCase()
    return driverListRaw
      .filter((d) => d.acceptanceRate >= min)
      .filter((d) => (q ? d.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.distance - b.distance)
  }, [driverListRaw, query, minAcceptance])

  // ---- Handlers -------------------------------------------------------

  const handleAssign = async (requestId: string, driverId: string) => {
    setAssigningId(driverId)
    try {
      await onAssign(requestId, driverId)
      toast.success("Driver berhasil ditugaskan.")
      // Move selection forward to the next pending request, if any, so the
      // dispatcher's hand stays on the same flow.
      const idx = sortedRequests.findIndex((r) => r.id === requestId)
      const next = sortedRequests[idx + 1]
      setSelectedRequestId(next?.id ?? null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tidak diketahui."
      toast.error(`Gagal menugaskan driver: ${message}`)
    } finally {
      setAssigningId(null)
    }
  }

  const handleBulkAssign = async () => {
    if (bulkSelection.size === 0) return
    const ids = Array.from(bulkSelection)
    let success = 0
    let failed = 0
    setAssigningId("__bulk__")
    for (const requestId of ids) {
      try {
        // Auto-match = closest driver passing the acceptance-rate threshold.
        // We re-use the same cache + filter rules as the manual flow so the
        // dispatcher's filter pane stays the source of truth for "qualified".
        const drivers =
          driverCache[requestId] ?? (await driversForRequest(requestId))
        if (!driverCache[requestId]) {
          setDriverCache((c) => ({ ...c, [requestId]: drivers }))
        }
        const min = Number(minAcceptance) / 100
        const best = [...drivers]
          .filter((d) => d.acceptanceRate >= min)
          .sort((a, b) => a.distance - b.distance)[0]
        if (!best) {
          failed++
          continue
        }
        await onAssign(requestId, best.id)
        success++
      } catch {
        failed++
      }
    }
    setAssigningId(null)
    setBulkSelection(new Set())
    if (failed === 0) {
      toast.success(`${success} permintaan berhasil ditugaskan.`)
    } else if (success === 0) {
      toast.error(`Gagal menugaskan ${failed} permintaan.`)
    } else {
      toast.success(`${success} berhasil, ${failed} gagal.`)
    }
  }

  const toggleBulk = (requestId: string) => {
    setBulkSelection((prev) => {
      const next = new Set(prev)
      if (next.has(requestId)) next.delete(requestId)
      else next.add(requestId)
      return next
    })
  }

  // ---- Render --------------------------------------------------------

  return (
    <Card
      className={cn("flex flex-col", className)}
      data-slot="driver-assignment-board"
      data-dispatcher-id={dispatcherId}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-stroke-soft-200 pb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text-strong-950">
            Penugasan Driver
          </h2>
          <p className="text-xs text-text-sub-600">
            {sortedRequests.length} permintaan menunggu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-text-sub-600">
            <Checkbox
              checked={bulkMode}
              onCheckedChange={(v) => {
                setBulkMode(Boolean(v))
                setBulkSelection(new Set())
              }}
              aria-label="Mode penugasan massal"
            />
            <span className="flex items-center gap-1">
              <BulkIcon aria-hidden className="size-3.5" />
              Massal
            </span>
          </label>
          {bulkMode ? (
            <Button
              type="button"
              size="sm"
              tone="primary"
              style="filled"
              disabled={bulkSelection.size === 0 || assigningId === "__bulk__"}
              loading={assigningId === "__bulk__"}
              onClick={handleBulkAssign}
            >
              Tugaskan {bulkSelection.size}
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-0 p-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Left: request list */}
        <div className="border-stroke-soft-200 md:border-r">
          <div className="border-b border-stroke-soft-200 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-text-soft-400">
              Permintaan ({sortedRequests.length})
            </p>
          </div>
          <ul className="divide-y divide-stroke-soft-200 max-h-[480px] overflow-auto">
            {sortedRequests.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-text-sub-600">
                Tidak ada permintaan menunggu.
              </li>
            ) : null}
            {sortedRequests.map((r) => {
              const isSelected = selectedRequestId === r.id
              const isBulkSelected = bulkSelection.has(r.id)
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedRequestId(r.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                      "hover:bg-bg-weak-50",
                      isSelected ? "bg-[var(--theme-accent-lighter)]" : "",
                    )}
                  >
                    {bulkMode ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBulk(r.id)
                        }}
                        className="mt-1"
                      >
                        <Checkbox
                          checked={isBulkSelected}
                          onCheckedChange={() => toggleBulk(r.id)}
                          aria-label={`Pilih permintaan ${r.id}`}
                        />
                      </span>
                    ) : null}
                    <span className="mt-0.5">{VEHICLE_ICON[r.vehicleType]}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-text-strong-950">
                          {r.passengerName}
                        </p>
                        <Badge
                          status={r.status === "pending" ? "warning" : "information"}
                          appearance="lighter"
                          size="sm"
                        >
                          {r.status === "pending" ? "Menunggu" : "Mencari"}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-text-sub-600">
                        <PinIcon className="inline size-3" aria-hidden />{" "}
                        {r.pickupLocation} → {r.dropoffLocation}
                      </p>
                      <p className="mt-0.5 text-xs text-text-soft-400">
                        {VEHICLE_LABEL[r.vehicleType]} ·{" "}
                        <span className="tabular-nums">
                          {formatIdr(r.estimatedFare)}
                        </span>{" "}
                        · {formatRelative(r.requestedAt)}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Right: drivers for selected request */}
        <div className="flex flex-col">
          {!selectedRequest ? (
            <div className="flex flex-1 items-center justify-center px-4 py-12 text-center text-sm text-text-sub-600">
              Pilih permintaan untuk melihat driver tersedia.
            </div>
          ) : (
            <>
              <div className="space-y-3 border-b border-stroke-soft-200 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-text-soft-400">
                  Driver tersedia
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <InputRoot className="flex-1">
                    <InputIcon>
                      <SearchIcon />
                    </InputIcon>
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cari nama driver"
                      aria-label="Cari driver"
                    />
                  </InputRoot>
                  <Select value={minAcceptance} onValueChange={setMinAcceptance}>
                    <SelectTrigger className="sm:w-44" aria-label="Filter acceptance rate">
                      <SelectValue placeholder="Acceptance ≥" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Acceptance ≥ 0%</SelectItem>
                      <SelectItem value="70">Acceptance ≥ 70%</SelectItem>
                      <SelectItem value="85">Acceptance ≥ 85%</SelectItem>
                      <SelectItem value="95">Acceptance ≥ 95%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ul className="divide-y divide-stroke-soft-200 max-h-[420px] overflow-auto">
                {loadingDrivers ? (
                  <li className="px-4 py-8 text-center text-sm text-text-sub-600">
                    Memuat driver...
                  </li>
                ) : filteredDrivers.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-text-sub-600">
                    Tidak ada driver memenuhi kriteria.
                  </li>
                ) : (
                  filteredDrivers.map((d) => {
                    const isAssigning = assigningId === d.id
                    return (
                      <li
                        key={d.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <Avatar size="md">
                          <AvatarFallback>{initials(d.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-text-strong-950">
                              {d.name}
                            </p>
                            <span className="inline-flex items-center gap-0.5 text-xs text-text-sub-600">
                              {VEHICLE_ICON[d.vehicleType]}
                              {VEHICLE_LABEL[d.vehicleType]}
                            </span>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-sub-600">
                            <span className="inline-flex items-center gap-0.5">
                              <PinIcon aria-hidden className="size-3" />
                              <span className="tabular-nums">
                                {formatDistance(d.distance)}
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-0.5">
                              <StarIcon aria-hidden className="size-3 text-warning-base" />
                              <span className="tabular-nums">{d.rating.toFixed(1)}</span>
                              <span className="text-text-soft-400">
                                ({d.trips.toLocaleString("id-ID")})
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-0.5">
                              <UserStarIcon aria-hidden className="size-3" />
                              <span className="tabular-nums">
                                {Math.round(d.acceptanceRate * 100)}%
                              </span>
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          tone="primary"
                          style="filled"
                          leftIcon={<CheckIcon />}
                          loading={isAssigning}
                          disabled={assigningId !== null}
                          onClick={() => handleAssign(selectedRequest.id, d.id)}
                        >
                          Tugaskan
                        </Button>
                      </li>
                    )
                  })
                )}
              </ul>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
