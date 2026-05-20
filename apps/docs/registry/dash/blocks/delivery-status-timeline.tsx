"use client"

import * as React from "react"
import {
  RiMapPin2Line as MapPin,
  RiArrowDownSLine as ChevronDown,
  RiArrowUpSLine as ChevronUp,
} from "@remixicon/react"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/registry/dash/ui/tooltip"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Delivery Status Timeline — visual progression of a ts-delivery-service
 * delivery across its 26-status state machine (EXPRESS + LOGISTIC unified).
 *
 * Used by backoffice ops (Control Tower, mgmt detail) + portal client tracking.
 * Renders newest-first vertical rail with status badges color-coded per category,
 * actor avatar + role, optional note, optional map link, expandable middle when
 * events > 10. Current status row gets a pulse ring + bold border + aria-current.
 *
 * Status categories (see `STATUS_CATEGORY`):
 *   - neutral (grey)   → created / pending payment / queueing
 *   - in-progress      → picking up, in delivery, in return  → Dash purple (feature)
 *   - success (green)  → completed, verified, returned
 *   - error (red)      → cancelled, failed, disposed, expired, failed_in_return
 *   - warning (yellow) → on_hold, not_verified, arrived_at_hub (ops attention)
 *
 * Voice: formal "Anda" — see CLAUDE.md cardinal rule 5.
 *
 * Constraints: useState only (no RHF/Zod/Query); Dash tokens; banned imports avoided.
 */

/* -------------------------------------------------------------------------- */
/* Status taxonomy                                                            */
/* -------------------------------------------------------------------------- */

export type DeliveryStatusCategory =
  | "neutral"
  | "in-progress"
  | "success"
  | "error"
  | "warning"

/** Map all 26 ts-delivery-service statuses → visual category. */
export const STATUS_CATEGORY: Record<string, DeliveryStatusCategory> = {
  // neutral — booked, not moving yet
  PENDING_PAYMENT: "neutral",
  QUEUEING: "neutral",
  ALLOCATING: "neutral",
  PREPARING: "neutral",
  PENDING_PICKING_UP: "neutral",
  PENDING_PICKUP: "neutral",
  PENDING_DELIVERY: "neutral",
  PENDING_RETURN: "neutral",
  // in-progress — courier active
  PICKING_UP: "in-progress",
  ARRIVED_AT_PICKUP_POINT: "in-progress",
  IN_DELIVERY: "in-progress",
  ARRIVED_AT_DESTINATION: "in-progress",
  IN_RETURN: "in-progress",
  ARRIVED_AT_RETURN_POINT: "in-progress",
  RETURN_TO_HUB: "in-progress",
  // success — terminal good
  COMPLETED: "success",
  VERIFIED: "success",
  RETURNED: "success",
  // error — terminal bad
  CANCELLED: "error",
  FAILED: "error",
  FAILED_IN_RETURN: "error",
  DISPOSED: "error",
  EXPIRED: "error",
  // warning — needs ops/mitra attention
  NOT_VERIFIED: "warning",
  ON_HOLD: "warning",
  ARRIVED_AT_HUB: "warning",
}

/** Default bilingual labels for all 26 statuses. Override via `statusLabels` prop. */
export const DEFAULT_STATUS_LABELS: Record<string, { id: string; en: string }> = {
  PENDING_PAYMENT: { id: "Menunggu Pembayaran", en: "Pending Payment" },
  QUEUEING: { id: "Dalam Antrian", en: "Queueing" },
  ALLOCATING: { id: "Mencari Mitra", en: "Allocating" },
  PREPARING: { id: "Disiapkan", en: "Preparing" },
  PENDING_PICKING_UP: { id: "Menunggu Penjemputan Ulang", en: "Pending Re-Pickup" },
  PENDING_PICKUP: { id: "Menunggu Penjemputan", en: "Pending Pickup" },
  ARRIVED_AT_PICKUP_POINT: { id: "Tiba di Titik Penjemputan", en: "Arrived at Pickup" },
  PICKING_UP: { id: "Menjemput Paket", en: "Picking Up" },
  PENDING_DELIVERY: { id: "Siap Diantar", en: "Pending Delivery" },
  IN_DELIVERY: { id: "Dalam Pengantaran", en: "In Delivery" },
  ARRIVED_AT_DESTINATION: { id: "Tiba di Tujuan", en: "Arrived at Destination" },
  COMPLETED: { id: "Selesai", en: "Completed" },
  CANCELLED: { id: "Dibatalkan", en: "Cancelled" },
  FAILED: { id: "Gagal", en: "Failed" },
  VERIFIED: { id: "Terverifikasi", en: "Verified" },
  NOT_VERIFIED: { id: "Belum Terverifikasi", en: "Not Verified" },
  PENDING_RETURN: { id: "Menunggu Pengembalian", en: "Pending Return" },
  IN_RETURN: { id: "Dalam Pengembalian", en: "In Return" },
  ARRIVED_AT_RETURN_POINT: { id: "Tiba di Titik Retur", en: "Arrived at Return" },
  FAILED_IN_RETURN: { id: "Gagal Retur", en: "Failed Return" },
  RETURN_TO_HUB: { id: "Kembali ke Hub", en: "Return to Hub" },
  ARRIVED_AT_HUB: { id: "Tiba di Hub", en: "Arrived at Hub" },
  ON_HOLD: { id: "Ditahan", en: "On Hold" },
  RETURNED: { id: "Dikembalikan", en: "Returned" },
  DISPOSED: { id: "Dimusnahkan", en: "Disposed" },
  EXPIRED: { id: "Kedaluwarsa", en: "Expired" },
}

const CATEGORY_TO_BADGE_STATUS = {
  neutral: "neutral",
  "in-progress": "feature",
  success: "success",
  error: "error",
  warning: "warning",
} as const

const CATEGORY_TO_DOT = {
  neutral: "bg-text-soft-400",
  "in-progress": "bg-primary-base",
  success: "bg-state-success-base",
  error: "bg-state-error-base",
  warning: "bg-state-warning-base",
} as const

const CATEGORY_TO_RING = {
  neutral: "ring-text-soft-400/30",
  "in-progress": "ring-primary-base/30",
  success: "ring-state-success-base/30",
  error: "ring-state-error-base/30",
  warning: "ring-state-warning-base/30",
} as const

const ROLE_LABELS: Record<NonNullable<DeliveryStatusEvent["actorRole"]>, { id: string; en: string }> = {
  mitra: { id: "Mitra", en: "Driver" },
  ops: { id: "Ops", en: "Ops" },
  system: { id: "Sistem", en: "System" },
  client: { id: "Klien", en: "Client" },
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type DeliveryStatusEvent = {
  status: string
  timestamp: string
  actorId?: string
  actorName?: string
  actorRole?: "mitra" | "ops" | "system" | "client"
  note?: string
  location?: { lat: number; lng: number }
}

export type DeliveryStatusTimelineProps = {
  deliveryId: string
  events: DeliveryStatusEvent[]
  currentStatus: string
  statusLabels?: Record<string, { id: string; en: string }>
  locale?: "id" | "en"
  expandable?: boolean
  className?: string
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatRelative(iso: string, locale: "id" | "en"): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diffSec = Math.floor((Date.now() - then) / 1000)
  const abs = Math.abs(diffSec)
  const id = locale === "id"
  if (abs < 60) return id ? "baru saja" : "just now"
  if (abs < 3600) {
    const m = Math.floor(abs / 60)
    return id ? `${m} menit lalu` : `${m}m ago`
  }
  if (abs < 86400) {
    const h = Math.floor(abs / 3600)
    return id ? `${h} jam lalu` : `${h}h ago`
  }
  const d = Math.floor(abs / 86400)
  return id ? `${d} hari lalu` : `${d}d ago`
}

function formatAbsolute(iso: string, locale: "id" | "en"): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(locale === "id" ? "id-ID" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function initials(name?: string): string {
  if (!name) return "??"
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "??"
}

/* -------------------------------------------------------------------------- */
/* Defaults — sample data for docs / preview                                  */
/* -------------------------------------------------------------------------- */

const SAMPLE_EVENTS: DeliveryStatusEvent[] = [
  { status: "PENDING_PAYMENT", timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(), actorName: "Klien Portal", actorRole: "client" },
  { status: "QUEUEING", timestamp: new Date(Date.now() - 86400000 * 1.18).toISOString(), actorName: "System", actorRole: "system" },
  { status: "ALLOCATING", timestamp: new Date(Date.now() - 86400000 * 1.15).toISOString(), actorName: "System", actorRole: "system", note: "Mencari mitra di radius 5km." },
  { status: "PENDING_PICKUP", timestamp: new Date(Date.now() - 86400000 * 1.1).toISOString(), actorName: "Sigit P.", actorRole: "mitra" },
  { status: "PICKING_UP", timestamp: new Date(Date.now() - 86400000 * 1.05).toISOString(), actorName: "Sigit P.", actorRole: "mitra", location: { lat: -6.2088, lng: 106.8456 } },
  { status: "ARRIVED_AT_PICKUP_POINT", timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), actorName: "Sigit P.", actorRole: "mitra" },
  { status: "PENDING_DELIVERY", timestamp: new Date(Date.now() - 3600000 * 22).toISOString(), actorName: "Sigit P.", actorRole: "mitra" },
  { status: "IN_DELIVERY", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), actorName: "Sigit P.", actorRole: "mitra", note: "Paket dalam perjalanan menuju Bekasi Timur." },
  { status: "ARRIVED_AT_DESTINATION", timestamp: new Date(Date.now() - 1800000).toISOString(), actorName: "Sigit P.", actorRole: "mitra", location: { lat: -6.2455, lng: 106.9921 } },
]

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

type Row =
  | { kind: "event"; event: DeliveryStatusEvent; index: number; isCurrent: boolean }
  | { kind: "collapse"; hiddenCount: number }

export function DeliveryStatusTimeline({
  deliveryId,
  events,
  currentStatus,
  statusLabels,
  locale = "id",
  expandable = true,
  className,
}: DeliveryStatusTimelineProps) {
  const [expandedEvent, setExpandedEvent] = React.useState<number | null>(null)
  const [showAll, setShowAll] = React.useState<boolean>(false)
  const labels = statusLabels ?? DEFAULT_STATUS_LABELS

  // Newest-first (latest event on top).
  const sorted = React.useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  }, [events])

  const shouldCollapse = expandable && !showAll && sorted.length > 10
  const rows: Row[] = React.useMemo(() => {
    if (!shouldCollapse) {
      return sorted.map((event, index) => ({
        kind: "event" as const,
        event,
        index,
        isCurrent: event.status === currentStatus && index === 0,
      }))
    }
    const head = sorted.slice(0, 3)
    const tail = sorted.slice(-3)
    const hiddenCount = sorted.length - head.length - tail.length
    const out: Row[] = []
    head.forEach((event, i) =>
      out.push({ kind: "event", event, index: i, isCurrent: event.status === currentStatus && i === 0 }),
    )
    out.push({ kind: "collapse", hiddenCount })
    tail.forEach((event, i) => {
      const trueIndex = sorted.length - tail.length + i
      out.push({
        kind: "event",
        event,
        index: trueIndex,
        isCurrent: event.status === currentStatus && trueIndex === 0,
      })
    })
    return out
  }, [shouldCollapse, sorted, currentStatus])

  return (
    <TooltipProvider delayDuration={200}>
      <section
        aria-label={locale === "id" ? `Riwayat status pengiriman ${deliveryId}` : `Delivery status timeline ${deliveryId}`}
        className={cn(
          "rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4",
          className,
        )}
      >
        <header className="mb-4 flex items-baseline justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium text-text-strong-950">
              {locale === "id" ? "Riwayat Status" : "Status Timeline"}
            </h3>
            <p className="mt-0.5 text-xs text-text-soft-400">
              {locale === "id" ? "Pengiriman" : "Delivery"} · {deliveryId} ·{" "}
              {sorted.length} {locale === "id" ? "kejadian" : "events"}
            </p>
          </div>
        </header>

        <ol className="relative" role="list">
          {rows.map((row, rowIdx) => {
            if (row.kind === "collapse") {
              return (
                <li
                  key={`collapse-${rowIdx}`}
                  className="relative flex items-center gap-4 py-2"
                >
                  <span
                    aria-hidden
                    className="absolute left-4 top-0 bottom-0 w-px bg-stroke-soft-200"
                  />
                  <div className="relative z-10 flex size-8 items-center justify-center rounded-full border border-dashed border-stroke-soft-200 bg-bg-white-0">
                    <span className="text-[10px] font-medium text-text-soft-400">
                      {row.hiddenCount}
                    </span>
                  </div>
                  <Button
                    tone="neutral"
                    style="ghost"
                    size="xs"
                    onClick={() => setShowAll(true)}
                    leftIcon={<ChevronDown />}
                  >
                    {locale === "id"
                      ? `Lihat semua (${row.hiddenCount} kejadian)`
                      : `Show all (${row.hiddenCount} events)`}
                  </Button>
                </li>
              )
            }

            const { event, index, isCurrent } = row
            const category = STATUS_CATEGORY[event.status] ?? "neutral"
            const badgeStatus = CATEGORY_TO_BADGE_STATUS[category]
            const label =
              labels[event.status]?.[locale] ??
              DEFAULT_STATUS_LABELS[event.status]?.[locale] ??
              event.status
            const isLast = rowIdx === rows.length - 1
            const open = expandedEvent === index
            const eventId = `${deliveryId}-evt-${index}`

            return (
              <li
                key={eventId}
                aria-current={isCurrent ? "step" : undefined}
                className="relative pb-4"
              >
                {!isLast ? (
                  <span
                    aria-hidden
                    className="absolute left-4 top-9 bottom-0 w-px bg-stroke-soft-200"
                  />
                ) : null}

                <div className="flex gap-4">
                  {/* Status dot column */}
                  <div className="shrink-0">
                    <span
                      className={cn(
                        "relative z-10 flex size-8 items-center justify-center rounded-full bg-bg-white-0",
                        isCurrent
                          ? cn(
                              "ring-2 ring-offset-2 ring-offset-bg-white-0",
                              CATEGORY_TO_RING[category],
                            )
                          : "ring-1 ring-stroke-soft-200",
                      )}
                    >
                      <span
                        className={cn(
                          "size-3 rounded-full",
                          CATEGORY_TO_DOT[category],
                          isCurrent && "animate-pulse",
                        )}
                      />
                    </span>
                  </div>

                  {/* Event body */}
                  <button
                    type="button"
                    onClick={() => setExpandedEvent(open ? null : index)}
                    aria-expanded={open}
                    aria-controls={`${eventId}-detail`}
                    className={cn(
                      "group min-w-0 flex-1 rounded-lg border border-transparent px-2 py-1 text-left",
                      "hover:bg-bg-weak-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40",
                      isCurrent && "border-stroke-soft-200 bg-bg-weak-50",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        status={badgeStatus}
                        appearance={isCurrent ? "filled" : "lighter"}
                      >
                        {label}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-text-soft-400 underline-offset-2 hover:underline">
                            {formatRelative(event.timestamp, locale)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {formatAbsolute(event.timestamp, locale)}
                        </TooltipContent>
                      </Tooltip>
                      {event.location ? (
                        <a
                          href={`https://maps.google.com/?q=${event.location.lat},${event.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-primary-base hover:underline"
                          aria-label={locale === "id" ? "Buka lokasi di peta" : "Open location on map"}
                        >
                          <MapPin className="size-3.5" />
                          {locale === "id" ? "Peta" : "Map"}
                        </a>
                      ) : null}
                    </div>

                    {event.actorName ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <Avatar size="xs">
                          <AvatarFallback>{initials(event.actorName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-text-sub-600">
                          {event.actorName}
                          {event.actorRole ? (
                            <span className="ml-1 text-text-soft-400">
                              · {ROLE_LABELS[event.actorRole][locale]}
                            </span>
                          ) : null}
                        </span>
                        {expandable ? (
                          <span className="ml-auto inline-flex items-center text-text-soft-400">
                            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {open ? (
                      <div
                        id={`${eventId}-detail`}
                        className="mt-2 rounded-md border border-stroke-soft-200 bg-bg-white-0 p-2 text-xs text-text-sub-600"
                      >
                        {event.note ? (
                          <p className="leading-relaxed">{event.note}</p>
                        ) : (
                          <p className="text-text-soft-400">
                            {locale === "id" ? "Tidak ada catatan." : "No note."}
                          </p>
                        )}
                        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                          <dt className="text-text-soft-400">{locale === "id" ? "Status:" : "Status:"}</dt>
                          <dd className="font-mono text-[11px] text-text-sub-600">{event.status}</dd>
                          <dt className="text-text-soft-400">{locale === "id" ? "Waktu:" : "Time:"}</dt>
                          <dd>{formatAbsolute(event.timestamp, locale)}</dd>
                          {event.actorId ? (
                            <>
                              <dt className="text-text-soft-400">Actor ID:</dt>
                              <dd className="font-mono text-[11px] text-text-sub-600">{event.actorId}</dd>
                            </>
                          ) : null}
                        </dl>
                      </div>
                    ) : !open && event.note ? (
                      <p className="mt-1 line-clamp-1 text-xs text-text-sub-600">
                        {event.note}
                      </p>
                    ) : null}
                  </button>
                </div>
              </li>
            )
          })}
        </ol>

        {expandable && showAll && sorted.length > 10 ? (
          <div className="mt-1 flex justify-center">
            <Button
              tone="neutral"
              style="ghost"
              size="xs"
              onClick={() => setShowAll(false)}
              leftIcon={<ChevronUp />}
            >
              {locale === "id" ? "Ringkas" : "Collapse"}
            </Button>
          </div>
        ) : null}
      </section>
    </TooltipProvider>
  )
}

DeliveryStatusTimeline.SAMPLE_EVENTS = SAMPLE_EVENTS

export default function DeliveryStatusTimelineDemo() {
  return (
    <DeliveryStatusTimeline
      deliveryId="DLV-2026-08812"
      events={SAMPLE_EVENTS}
      currentStatus="ARRIVED_AT_DESTINATION"
    />
  )
}
