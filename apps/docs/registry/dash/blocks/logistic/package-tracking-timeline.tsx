"use client"

import * as React from "react"
import {
  RiUser3Line,
  RiPhoneLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiImageLine,
  RiTruckLine,
} from "@remixicon/react"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import {
  DeliveryStatusTimeline,
  STATUS_CATEGORY,
  DEFAULT_STATUS_LABELS,
  type DeliveryStatusEvent,
} from "@/registry/dash/blocks/delivery-status-timeline"
import {
  ProofImageViewer,
  type ProofImageMeta,
} from "@/registry/dash/blocks/proof-image-viewer"
import { cn } from "@/registry/dash/lib/utils"

/**
 * package-tracking-timeline — Dash Logistic Layer 3 block (theme: "logistic").
 *
 * Wraps the shared `delivery-status-timeline` with a Logistic-specific
 * overlay:
 *  - Hero: tracking number + current status badge + estimated-delivery
 *    countdown (live-ticking — 60s interval, cancels on unmount).
 *  - COD panel (Cash-on-Delivery) — amount + collection status badge.
 *  - Proof images thumbnail grid — clicking opens shared `ProofImageViewer`
 *    block (no duplication).
 *  - Recipient info panel with mobile call-button (tel: link, native dial).
 *
 * Read-only view: no audit trail (this is the mitra-/customer-facing
 * tracking screen). Mutation flows live in separate blocks.
 *
 * Voice: formal "Anda" — mitra/courier facing per Dash voice rule.
 *
 * Implementation:
 *  - Shared block reuse via direct import (zero copy).
 *  - useState only — countdown via setInterval + useState tick.
 *  - Theme accent (orange) for the hero rail + ETA accent text.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PackageCodInfo = {
  amount: number // IDR (full rupiah, not cents)
  status: "pending" | "collected" | "refunded"
}

export type PackageProofImage = {
  type: "pickup" | "delivery"
  url: string
  capturedAt?: string
  capturedBy?: string
}

export type PackageTrackingTimelineProps = {
  packageId: string
  trackingNumber: string
  events: DeliveryStatusEvent[]
  currentStatus: string
  estimatedDeliveryAt?: string
  recipientPhone?: string
  recipientName?: string
  cod?: PackageCodInfo
  proofImages?: PackageProofImage[]
  locale?: "id" | "en"
  className?: string
}

// ---------------------------------------------------------------------------
// Status → badge style mapping (reuses shared taxonomy from delivery-status-timeline)
// ---------------------------------------------------------------------------

const CATEGORY_TO_BADGE_STATUS = {
  neutral: "neutral",
  "in-progress": "feature",
  success: "success",
  error: "error",
  warning: "warning",
} as const

const COD_STATUS_META: Record<
  PackageCodInfo["status"],
  { id: string; en: string; badge: "warning" | "success" | "neutral" }
> = {
  pending: { id: "Belum Ditagih", en: "Pending", badge: "warning" },
  collected: { id: "Sudah Ditagih", en: "Collected", badge: "success" },
  refunded: { id: "Dikembalikan", en: "Refunded", badge: "neutral" },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatIdr(n: number): string {
  if (!Number.isFinite(n)) return "—"
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `Rp ${Math.round(n).toLocaleString("id-ID")}`
  }
}

function formatCountdown(targetMs: number, locale: "id" | "en"): {
  text: string
  isPast: boolean
} {
  const diff = targetMs - Date.now()
  const id = locale === "id"
  if (diff <= 0) {
    return {
      text: id ? "Sudah jatuh tempo" : "Past due",
      isPast: true,
    }
  }
  const totalMin = Math.floor(diff / 60_000)
  if (totalMin < 60) {
    return {
      text: id ? `${totalMin} menit lagi` : `in ${totalMin}m`,
      isPast: false,
    }
  }
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h < 24) {
    return {
      text: id
        ? `${h} jam ${m} menit lagi`
        : `in ${h}h ${m}m`,
      isPast: false,
    }
  }
  const d = Math.floor(h / 24)
  const hr = h % 24
  return {
    text: id ? `${d} hari ${hr} jam lagi` : `in ${d}d ${hr}h`,
    isPast: false,
  }
}

function formatAbsolute(iso: string, locale: "id" | "en"): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(locale === "id" ? "id-ID" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PackageTrackingTimeline({
  packageId,
  trackingNumber,
  events,
  currentStatus,
  estimatedDeliveryAt,
  recipientPhone,
  recipientName,
  cod,
  proofImages,
  locale = "id",
  className,
}: PackageTrackingTimelineProps) {
  const [, forceTick] = React.useState(0)
  const [openProofIndex, setOpenProofIndex] = React.useState<number | null>(null)

  // -------------------------------------------------------------------------
  // Countdown ticker — only runs when we have an ETA + ETA is in the future.
  // -------------------------------------------------------------------------
  const etaMs = React.useMemo(() => {
    if (!estimatedDeliveryAt) return null
    const t = new Date(estimatedDeliveryAt).getTime()
    return Number.isFinite(t) ? t : null
  }, [estimatedDeliveryAt])

  React.useEffect(() => {
    if (etaMs == null) return
    const id = setInterval(() => forceTick((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [etaMs])

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------
  const category = STATUS_CATEGORY[currentStatus] ?? "neutral"
  const badgeStatus = CATEGORY_TO_BADGE_STATUS[category]
  const statusLabel =
    DEFAULT_STATUS_LABELS[currentStatus]?.[locale] ?? currentStatus

  const countdown =
    etaMs != null ? formatCountdown(etaMs, locale) : null
  const id = locale === "id"
  const proofs = proofImages ?? []
  const activeProof =
    openProofIndex != null ? proofs[openProofIndex] : null

  // Map active proof to shared ProofImageViewer meta shape.
  const proofMeta: ProofImageMeta | null = activeProof
    ? {
        url: activeProof.url,
        label:
          activeProof.type === "pickup"
            ? id
              ? "Bukti pengambilan"
              : "Pickup proof"
            : id
              ? "Bukti pengantaran"
              : "Delivery proof",
        capturedAt:
          activeProof.capturedAt ?? new Date().toISOString(),
        capturedBy: activeProof.capturedBy,
      }
    : null

  return (
    <section
      aria-label={
        id
          ? `Pelacakan paket ${trackingNumber}`
          : `Package tracking ${trackingNumber}`
      }
      className={cn("space-y-4", className)}
    >
      {/* Hero */}
      <header
        className={cn(
          "rounded-xl border p-4",
          "border-[var(--theme-accent-base)]/30 bg-[var(--theme-accent-lighter)]",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-text-soft-400">
              {id ? "Nomor Resi" : "Tracking Number"}
            </p>
            <p className="mt-0.5 font-mono text-lg font-semibold text-text-strong-950">
              {trackingNumber}
            </p>
            <p className="mt-0.5 text-[11px] text-text-soft-400">
              {id ? "ID paket" : "Package ID"}:{" "}
              <span className="font-mono">{packageId}</span>
            </p>
          </div>
          <div className="text-right">
            <Badge status={badgeStatus} appearance="filled">
              {statusLabel}
            </Badge>
            {countdown ? (
              <div
                className="mt-2 inline-flex items-center gap-1 text-xs"
                aria-live="polite"
              >
                <RiTimeLine
                  aria-hidden
                  className="size-3.5 text-[var(--theme-accent-dark)]"
                />
                <span
                  className={cn(
                    "font-medium",
                    countdown.isPast
                      ? "text-error-base"
                      : "text-[var(--theme-accent-dark)]",
                  )}
                >
                  {countdown.text}
                </span>
                {estimatedDeliveryAt ? (
                  <span className="text-text-soft-400">
                    · {formatAbsolute(estimatedDeliveryAt, locale)}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* COD + Recipient row */}
      <div
        className={cn(
          "grid gap-3",
          cod && (recipientName || recipientPhone)
            ? "sm:grid-cols-2"
            : "grid-cols-1",
        )}
      >
        {cod ? <CodPanel cod={cod} locale={locale} /> : null}
        {recipientName || recipientPhone ? (
          <RecipientPanel
            name={recipientName}
            phone={recipientPhone}
            locale={locale}
          />
        ) : null}
      </div>

      {/* Proof images */}
      {proofs.length > 0 ? (
        <section
          aria-label={id ? "Bukti foto" : "Proof images"}
          className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4"
        >
          <div className="mb-3 flex items-baseline justify-between">
            <h4 className="text-sm font-medium text-text-strong-950">
              {id ? "Bukti Foto" : "Proof Images"}
            </h4>
            <span className="text-xs text-text-soft-400">
              {proofs.length} {id ? "foto" : "images"}
            </span>
          </div>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {proofs.map((p, i) => (
              <li key={`${p.type}-${i}`}>
                <button
                  type="button"
                  onClick={() => setOpenProofIndex(i)}
                  className="group relative aspect-square w-full overflow-hidden rounded-md border border-stroke-soft-200 bg-bg-weak-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/40"
                  aria-label={
                    id
                      ? `Buka ${p.type === "pickup" ? "bukti pengambilan" : "bukti pengantaran"}`
                      : `Open ${p.type} proof`
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={
                      p.type === "pickup"
                        ? id
                          ? "Bukti pengambilan"
                          : "Pickup proof"
                        : id
                          ? "Bukti pengantaran"
                          : "Delivery proof"
                    }
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute left-1 top-1">
                    <Badge
                      status={p.type === "pickup" ? "feature" : "success"}
                      appearance="filled"
                    >
                      <span className="flex items-center gap-1">
                        {p.type === "pickup" ? (
                          <RiTruckLine aria-hidden className="size-3" />
                        ) : (
                          <RiImageLine aria-hidden className="size-3" />
                        )}
                        {p.type === "pickup"
                          ? id
                            ? "Pickup"
                            : "Pickup"
                          : id
                            ? "Antar"
                            : "Deliver"}
                      </span>
                    </Badge>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Timeline — shared block */}
      <DeliveryStatusTimeline
        deliveryId={packageId}
        events={events}
        currentStatus={currentStatus}
        locale={locale}
      />

      {/* Proof viewer overlay */}
      {proofMeta ? (
        <div
          role="dialog"
          aria-label={id ? "Pratinjau bukti foto" : "Proof preview"}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-strong-950/80 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenProofIndex(null)
          }}
        >
          <div className="w-full max-w-3xl">
            <ProofImageViewer
              proof={proofMeta}
              actions={[
                {
                  id: "close",
                  label: id ? "Tutup" : "Close",
                  onClick: () => setOpenProofIndex(null),
                },
              ]}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sub-panels
// ---------------------------------------------------------------------------

function CodPanel({
  cod,
  locale,
}: {
  cod: PackageCodInfo
  locale: "id" | "en"
}) {
  const meta = COD_STATUS_META[cod.status]
  const id = locale === "id"
  return (
    <section
      aria-label={id ? "Informasi COD" : "COD info"}
      className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-alpha-10 text-primary-base">
          <RiMoneyDollarCircleLine aria-hidden className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-text-soft-400">
            {id ? "Tagihan COD" : "COD Amount"}
          </p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-text-strong-950">
            {formatIdr(cod.amount)}
          </p>
        </div>
        <Badge status={meta.badge} appearance="lighter">
          {meta[locale]}
        </Badge>
      </div>
    </section>
  )
}

function RecipientPanel({
  name,
  phone,
  locale,
}: {
  name?: string
  phone?: string
  locale: "id" | "en"
}) {
  const id = locale === "id"
  return (
    <section
      aria-label={id ? "Informasi penerima" : "Recipient info"}
      className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-bg-weak-50 text-text-sub-600">
          <RiUser3Line aria-hidden className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-text-soft-400">
            {id ? "Penerima" : "Recipient"}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-text-strong-950">
            {name ?? (id ? "Tidak tercatat" : "Unknown")}
          </p>
          {phone ? (
            <p className="text-xs text-text-soft-400">{phone}</p>
          ) : null}
        </div>
        {phone ? (
          <Button
            tone="primary"
            style="lighter"
            size="sm"
            leftIcon={<RiPhoneLine />}
            asChild
          >
            <a
              href={`tel:${phone}`}
              aria-label={
                id
                  ? `Hubungi penerima di ${phone}`
                  : `Call recipient at ${phone}`
              }
            >
              {id ? "Hubungi" : "Call"}
            </a>
          </Button>
        ) : null}
      </div>
    </section>
  )
}

export default PackageTrackingTimeline
