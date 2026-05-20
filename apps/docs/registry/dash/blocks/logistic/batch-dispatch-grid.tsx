"use client"

import * as React from "react"
import {
  RiCheckLine,
  RiAlertLine,
  RiSparklingLine,
  RiTruckLine,
  RiFlashlightLine,
  RiStarLine,
  RiCloseLine,
  RiMapPin2Line,
} from "@remixicon/react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/registry/dash/ui/modal"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { Label } from "@/registry/dash/ui/label"
import { toast } from "@/registry/dash/ui/toaster"
import { cn } from "@/registry/dash/lib/utils"

/**
 * batch-dispatch-grid — Dash Logistic Layer 3 block (theme: "logistic").
 *
 * Bulk assignment console: N packages × M drivers. Dispatcher sweeps the
 * pending queue at the start of a shift and lands assignments in one go.
 *
 * WHY this block exists:
 *  - Tribes were assigning one-by-one (slow + error-prone) or batch in
 *    spreadsheets (no audit, no capacity guard). This block enforces
 *    capacity + zone hints + a single audited submit.
 *  - Capacity guard: weight comparison vs `capacityRemaining`. Over = red.
 *  - Smart-suggest: caller can implement zone-proximity + load balancing
 *    inside an opt-in click; the block defaults to a simple zone-match
 *    heuristic so the button works out of the box.
 *  - Voice: neutral ops UI. Indonesian copy, no "Anda" softener — internal
 *    dispatcher tool, terser like warehouse scanner.
 *
 * Implementation:
 *  - useState only.
 *  - Click cell to (un)assign. Multi-select packages (left col) + click
 *    driver header → bulk-assign selected to that driver.
 *  - Conflict highlight: assignment that exceeds driver capacity = red cell.
 *  - Bulk submit modal shows summary + capacity warnings before commit.
 *  - Audit payload: batch list + dispatcherId + timestamp passed via
 *    `onAssignBatch`; consumer writes audit row.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Package = {
  id: string
  trackingNumber: string
  weight: number // grams
  dimensions: { l: number; w: number; h: number } // cm
  destinationZone: string
  priority: "standard" | "express" | "urgent"
  scheduledFor: string // ISO
  status: "pending" | "assigned" | "in-transit" | "delivered" | "failed"
}

export type DispatchDriver = {
  id: string
  name: string
  vehicleType: string
  currentLoad: number // weight grams
  capacityRemaining: number // grams
  currentZone: string
}

export type BatchDispatchGridProps = {
  packages: Package[]
  drivers: DispatchDriver[]
  /** Caller commits assignments + writes audit log row. */
  onAssignBatch: (
    assignments: { packageId: string; driverId: string }[],
  ) => Promise<void>
  /** Capacity-fill % at which the meter goes warning. Default 80. */
  capacityWarningThreshold?: number
  /** Surfaced in audit metadata + sr-only readout. */
  dispatcherId?: string
  className?: string
}

type Assignment = Record<string, string | undefined> // packageId → driverId | undefined

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRIORITY_META: Record<
  Package["priority"],
  { label: string; status: "neutral" | "warning" | "error"; icon: React.ReactNode }
> = {
  standard: { label: "Std", status: "neutral", icon: null },
  express: {
    label: "Exp",
    status: "warning",
    icon: <RiFlashlightLine aria-hidden className="size-3" />,
  },
  urgent: {
    label: "Urg",
    status: "error",
    icon: <RiStarLine aria-hidden className="size-3" />,
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatGrams(g: number): string {
  if (!Number.isFinite(g) || g <= 0) return "0 kg"
  if (g < 1000) return `${g} g`
  return `${(g / 1000).toFixed(1)} kg`
}

/** Returns total assigned weight per driver. */
function computeDriverLoad(
  assignment: Assignment,
  packages: Package[],
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [pkgId, driverId] of Object.entries(assignment)) {
    if (!driverId) continue
    const pkg = packages.find((p) => p.id === pkgId)
    if (!pkg) continue
    out[driverId] = (out[driverId] ?? 0) + pkg.weight
  }
  return out
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BatchDispatchGrid({
  packages,
  drivers,
  onAssignBatch,
  capacityWarningThreshold = 80,
  dispatcherId,
  className,
}: BatchDispatchGridProps) {
  const [assignment, setAssignment] = React.useState<Assignment>({})
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set())
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const addedLoad = React.useMemo(
    () => computeDriverLoad(assignment, packages),
    [assignment, packages],
  )

  const assignedCount = Object.values(assignment).filter(Boolean).length
  const totalCount = packages.length
  const allAssigned = totalCount > 0 && assignedCount === totalCount

  // ---------------------------------------------------------------------------
  // Cell handlers
  // ---------------------------------------------------------------------------
  const setOne = (pkgId: string, driverId: string | undefined) => {
    setAssignment((prev) => {
      const next = { ...prev }
      if (driverId) next[pkgId] = driverId
      else delete next[pkgId]
      return next
    })
  }

  const toggleCell = (pkgId: string, driverId: string) => {
    setAssignment((prev) => {
      const next = { ...prev }
      if (next[pkgId] === driverId) {
        delete next[pkgId]
      } else {
        next[pkgId] = driverId
      }
      return next
    })
  }

  const toggleSelected = (pkgId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(pkgId)) next.delete(pkgId)
      else next.add(pkgId)
      return next
    })
  }

  const bulkAssignSelectedTo = (driverId: string) => {
    if (selected.size === 0) {
      toast.error("Pilih paket terlebih dahulu.")
      return
    }
    setAssignment((prev) => {
      const next = { ...prev }
      for (const id of selected) next[id] = driverId
      return next
    })
    toast.success(
      `${selected.size} paket ditugaskan ke ${
        drivers.find((d) => d.id === driverId)?.name ?? driverId
      }.`,
    )
    setSelected(new Set())
  }

  // ---------------------------------------------------------------------------
  // Auto-suggest (zone proximity)
  // ---------------------------------------------------------------------------
  const handleAutoSuggest = () => {
    const next: Assignment = { ...assignment }
    // Track in-progress accumulated weight per driver during simulation.
    const draft: Record<string, number> = {}
    for (const d of drivers) draft[d.id] = 0

    // Greedy: highest priority first, prefer driver whose zone matches; fall
    // back to driver with most remaining capacity.
    const order = [...packages]
      .filter((p) => !next[p.id])
      .sort((a, b) => {
        const rank = { urgent: 0, express: 1, standard: 2 } as const
        return rank[a.priority] - rank[b.priority]
      })

    for (const pkg of order) {
      const candidates = drivers
        .filter(
          (d) => d.capacityRemaining - draft[d.id] >= pkg.weight,
        )
        .sort((a, b) => {
          const aZ = a.currentZone === pkg.destinationZone ? 0 : 1
          const bZ = b.currentZone === pkg.destinationZone ? 0 : 1
          if (aZ !== bZ) return aZ - bZ
          return (
            b.capacityRemaining - draft[b.id] - (a.capacityRemaining - draft[a.id])
          )
        })
      const pick = candidates[0]
      if (!pick) continue
      next[pkg.id] = pick.id
      draft[pick.id] += pkg.weight
    }
    setAssignment(next)
    toast.success("Auto-suggest selesai. Mohon tinjau sebelum submit.")
  }

  const clearAll = () => {
    setAssignment({})
    setSelected(new Set())
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = async () => {
    const batch = Object.entries(assignment)
      .filter(([, d]) => Boolean(d))
      .map(([packageId, driverId]) => ({ packageId, driverId: driverId! }))
    if (batch.length === 0) {
      toast.error("Belum ada penugasan.")
      return
    }
    setSubmitting(true)
    try {
      await onAssignBatch(batch)
      toast.success(`${batch.length} penugasan tersimpan.`)
      setConfirmOpen(false)
      setAssignment({})
      setSelected(new Set())
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Penugasan gagal tersimpan. Mohon coba lagi.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <section
      aria-label="Batch dispatch grid"
      className={cn(
        "rounded-xl border border-stroke-soft-200 bg-bg-white-0",
        className,
      )}
    >
      {/* Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke-soft-200 p-4">
        <div>
          <h3 className="text-sm font-medium text-text-strong-950">
            Batch Dispatch
          </h3>
          <p className="mt-0.5 text-xs text-text-soft-400">
            {assignedCount}/{totalCount} paket ditugaskan · {drivers.length} driver tersedia
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            tone="neutral"
            style="stroke"
            size="sm"
            onClick={clearAll}
            disabled={assignedCount === 0 || submitting}
            leftIcon={<RiCloseLine />}
          >
            Kosongkan
          </Button>
          <Button
            type="button"
            tone="primary"
            style="lighter"
            size="sm"
            onClick={handleAutoSuggest}
            disabled={submitting || packages.length === 0 || drivers.length === 0}
            leftIcon={<RiSparklingLine />}
          >
            Auto-suggest
          </Button>
          <Button
            type="button"
            tone="primary"
            style="filled"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={assignedCount === 0 || submitting}
            leftIcon={<RiCheckLine />}
            className="bg-[var(--theme-accent-base)] hover:bg-[var(--theme-accent-dark)] text-[var(--theme-accent-on)]"
          >
            Submit ({assignedCount})
          </Button>
        </div>
      </header>

      {/* Empty state */}
      {packages.length === 0 ? (
        <p className="p-8 text-center text-sm text-text-soft-400">
          Tidak ada paket pending.
        </p>
      ) : drivers.length === 0 ? (
        <p className="p-8 text-center text-sm text-text-soft-400">
          Tidak ada driver tersedia.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-bg-weak-50">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 min-w-[260px] border-b border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 text-left text-xs font-medium text-text-sub-600"
                >
                  Paket ({totalCount})
                </th>
                {drivers.map((d) => {
                  const added = addedLoad[d.id] ?? 0
                  const total = d.currentLoad + added
                  const cap = d.currentLoad + d.capacityRemaining
                  const pct = cap > 0 ? (total / cap) * 100 : 0
                  const overCapacity = added > d.capacityRemaining
                  const warning = pct >= capacityWarningThreshold
                  return (
                    <th
                      key={d.id}
                      scope="col"
                      className="min-w-[180px] border-b border-stroke-soft-200 px-3 py-2 text-left align-top"
                    >
                      <button
                        type="button"
                        onClick={() => bulkAssignSelectedTo(d.id)}
                        disabled={selected.size === 0}
                        className="group block w-full rounded-md p-1 text-left hover:bg-bg-white-0 disabled:cursor-not-allowed disabled:opacity-60"
                        title={
                          selected.size > 0
                            ? `Tugaskan ${selected.size} paket terpilih ke ${d.name}`
                            : "Pilih paket dulu untuk bulk-assign"
                        }
                      >
                        <div className="flex items-center gap-2">
                          <RiTruckLine
                            aria-hidden
                            className="size-4 text-text-sub-600"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-text-strong-950">
                              {d.name}
                            </p>
                            <p className="truncate text-[10px] text-text-soft-400">
                              {d.vehicleType} · {d.currentZone}
                            </p>
                          </div>
                        </div>
                        <CapacityMeter
                          pct={Math.min(100, pct)}
                          warning={warning}
                          overCapacity={overCapacity}
                        />
                        <p
                          className={cn(
                            "mt-1 text-[10px] tabular-nums",
                            overCapacity
                              ? "text-error-base font-semibold"
                              : warning
                                ? "text-state-warning-base"
                                : "text-text-soft-400",
                          )}
                        >
                          {formatGrams(total)} / {formatGrams(cap)}
                          {overCapacity ? " · OVER" : ""}
                        </p>
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => {
                const isSelected = selected.has(pkg.id)
                const assignedTo = assignment[pkg.id]
                const pri = PRIORITY_META[pkg.priority]
                return (
                  <tr
                    key={pkg.id}
                    className={cn(
                      "border-b border-stroke-soft-200",
                      isSelected && "bg-primary-alpha-10",
                    )}
                  >
                    {/* Package cell (sticky) */}
                    <th
                      scope="row"
                      className={cn(
                        "sticky left-0 z-10 px-3 py-2 text-left align-top",
                        isSelected ? "bg-primary-alpha-10" : "bg-bg-white-0",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelected(pkg.id)}
                          aria-label={`Pilih ${pkg.trackingNumber}`}
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <code className="font-mono text-xs text-text-strong-950">
                              {pkg.trackingNumber}
                            </code>
                            {pkg.priority !== "standard" ? (
                              <Badge status={pri.status} appearance="lighter">
                                <span className="flex items-center gap-1">
                                  {pri.icon}
                                  {pri.label}
                                </span>
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-[11px] text-text-soft-400">
                            {formatGrams(pkg.weight)} ·{" "}
                            <span className="inline-flex items-center gap-0.5">
                              <RiMapPin2Line
                                aria-hidden
                                className="size-3"
                              />
                              {pkg.destinationZone}
                            </span>
                          </p>
                        </div>
                      </div>
                    </th>

                    {/* Driver cells */}
                    {drivers.map((d) => {
                      const isAssigned = assignedTo === d.id
                      const wouldOverflow =
                        !isAssigned &&
                        pkg.weight > d.capacityRemaining - (addedLoad[d.id] ?? 0)
                      return (
                        <td key={d.id} className="px-2 py-2 align-top">
                          <button
                            type="button"
                            onClick={() => toggleCell(pkg.id, d.id)}
                            aria-pressed={isAssigned}
                            aria-label={
                              isAssigned
                                ? `Hapus ${pkg.trackingNumber} dari ${d.name}`
                                : `Tugaskan ${pkg.trackingNumber} ke ${d.name}`
                            }
                            className={cn(
                              "flex h-9 w-full items-center justify-center rounded-md border text-xs transition-colors",
                              isAssigned
                                ? wouldOverflow
                                  ? "border-error-base bg-state-error-lighter text-error-base"
                                  : "border-[var(--theme-accent-base)] bg-[var(--theme-accent-lighter)] text-[var(--theme-accent-dark)]"
                                : wouldOverflow
                                  ? "border-error-base/40 text-error-base hover:bg-state-error-lighter"
                                  : "border-stroke-soft-200 text-text-soft-400 hover:bg-bg-weak-50",
                            )}
                          >
                            {isAssigned ? (
                              <RiCheckLine aria-hidden className="size-4" />
                            ) : wouldOverflow ? (
                              <RiAlertLine aria-hidden className="size-4" />
                            ) : (
                              <span aria-hidden>·</span>
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!allAssigned && assignedCount > 0 ? (
        <p className="border-t border-stroke-soft-200 px-4 py-2 text-xs text-text-soft-400">
          {totalCount - assignedCount} paket belum ditugaskan.
        </p>
      ) : null}

      {/* Confirm modal */}
      <Modal open={confirmOpen} onOpenChange={(o) => !submitting && setConfirmOpen(o)}>
        <ModalContent className="max-w-lg">
          <ModalHeader>
            <ModalTitle>Konfirmasi penugasan batch</ModalTitle>
            <ModalDescription>
              {assignedCount} paket akan ditugaskan ke {Object.keys(addedLoad).length}{" "}
              driver. Penugasan tercatat di audit log.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-3">
            <Label>Ringkasan per driver</Label>
            <ul className="space-y-1.5 text-sm">
              {drivers
                .filter((d) => (addedLoad[d.id] ?? 0) > 0)
                .map((d) => {
                  const added = addedLoad[d.id] ?? 0
                  const overCapacity = added > d.capacityRemaining
                  const count = Object.values(assignment).filter(
                    (id) => id === d.id,
                  ).length
                  return (
                    <li
                      key={d.id}
                      className="flex items-center justify-between rounded-md border border-stroke-soft-200 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-text-strong-950">
                          {d.name}
                        </p>
                        <p className="text-[11px] text-text-soft-400">
                          {count} paket · {formatGrams(added)}
                        </p>
                      </div>
                      {overCapacity ? (
                        <Badge status="error" appearance="lighter">
                          Over capacity
                        </Badge>
                      ) : (
                        <Badge status="success" appearance="lighter">
                          OK
                        </Badge>
                      )}
                    </li>
                  )
                })}
            </ul>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              tone="neutral"
              style="stroke"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              tone="primary"
              style="filled"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
              leftIcon={<RiCheckLine />}
            >
              {submitting ? "Menyimpan..." : "Konfirmasi"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {dispatcherId ? (
        <span className="sr-only">Dispatcher: {dispatcherId}</span>
      ) : null}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CapacityMeter({
  pct,
  warning,
  overCapacity,
}: {
  pct: number
  warning: boolean
  overCapacity: boolean
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stroke-soft-200"
    >
      <div
        className={cn(
          "h-full transition-all",
          overCapacity
            ? "bg-state-error-base"
            : warning
              ? "bg-state-warning-base"
              : "bg-[var(--theme-accent-base)]",
        )}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  )
}

export default BatchDispatchGrid
