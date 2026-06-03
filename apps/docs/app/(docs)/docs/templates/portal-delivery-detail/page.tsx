"use client"

import * as React from "react"
import {
  RiArrowLeftSLine,
  RiCheckboxCircleFill,
  RiCheckboxCircleLine,
  RiCloseFill,
  RiContractLine,
  RiDownload2Line,
  RiReceiptLine,
  RiShareLine,
  RiChat3Line,
  RiArrowRightUpLine,
  RiArrowDownSLine,
  RiMapPin2Line,
  RiTruckLine,
  RiUser3Line,
  RiPhoneLine,
  RiBox3Line,
  RiShieldCheckLine,
  RiTimeLine,
  RiPriceTag3Line,
  RiInformationFill,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import {
  PortalSidebar,
  PortalHeader,
  FakeButton,
  STATUS_META,
  StatusBadge,
} from "../portal-deliveries-list/page"

/**
 * Portal Delivery Detail — single-delivery view. Ported from Dash Next Portal
 * v2 (`app/[locale]/(dashboard)/deliveries/[slug]/page.tsx` 1255 LOC). Two
 * columns: left widget-box (route + sender/recipient + package + payment +
 * courier + live tracking placeholder) and right widget-box (status timeline
 * with 4 events).
 */
export default function PortalDeliveryDetailDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Delivery detail"
        description="Single delivery view for DE-1748581212497 (IN_DELIVERY) — sender/recipient route, package details (Pharma Cold Chain 2.5 kg, 30×20×15 cm), courier card (Dimas Saputra), live-tracking map placeholder, and 4-step status timeline. Mirrors `app/[locale]/(dashboard)/deliveries/[slug]/page.tsx`."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Delivery #DE-1748581212497 · IN_DELIVERY"
          description="1440px composition: sidebar + header + back link + status banner + 2-column layout (left = details widget-box, right = status timeline)."
          preview={
            <DocsTemplatePreview padding="">
              <DetailPreview />
            </DocsTemplatePreview>
          }
          code={`<PortalDeliveryDetail slug="DE-1748581212497" />`}
        />
      </DocsSection>

      <DocsSection title="Details card">
        <DocsExample
          bare
          title="Left container — Route + Package + Payment + Courier + Map"
          description="Mirrors WidgetBox.Root sections separated by `Divider.Root variant='solid-text'`. Each section uses 16px gap, divider-line between rows."
          preview={
            <DocsTemplatePreview padding="" minWidth={780}>
              <div className="bg-bg-weak-50 p-6">
                <div className="max-w-[780px]"><DetailsCard /></div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<DeliveryDetailsCard data={deliveryData} />`}
        />
      </DocsSection>

      <DocsSection title="Status timeline">
        <DocsExample
          bare
          title="Right container — 4-event timeline"
          description="First entry (most recent) renders with filled feature ring + filled icon; earlier entries are outline. Vertical dashed connector between rows. Source: `[...timeline].reverse().map(...)`."
          preview={
            <DocsTemplatePreview padding="" minWidth={420}>
              <div className="bg-bg-weak-50 p-6">
                <div className="max-w-[420px]"><StatusTimeline /></div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<DeliveryStatusTimeline timeline={data.timeline} />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><b>Top bar</b> — Back link (←) + page title &ldquo;Delivery DE-1748581212497&rdquo; + StatusBadge + right cluster: Cancel · Download (dropdown: Shipping label + Shipping doc) · Share live tracking.</li>
          <li><b>Left widget-box</b> — Header &ldquo;Details&rdquo; · Delivery route section (Total distance 4.8 km, Pickup card, Drop-off card) · Package details (name, protection, weight, size, service type, pickup time, type) · Payment detail · Driver details (Avatar 40 + name + WhatsApp chat button) · Live tracking (blurred map placeholder + button).</li>
          <li><b>Right widget-box</b> — Header &ldquo;Delivery status&rdquo; · Optional SLA badge (On-time / Late) · Timeline with 4 events (Order placed → Driver assigned → Picked up → Out for delivery).</li>
          <li><b>Mobile</b> — Tabs (Details / Status) collapse the two columns. Fixed bottom action bar with &ldquo;Live tracking&rdquo; primary button.</li>
          <li><b>Sandbox</b> — When envMode === SANDBOX, a sticky bottom bar appears with Cancel · Fail · Next state buttons (driven by `nextSimulationStatus` API).</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>WidgetBox.Root / Header (matches `components/widget-box.tsx`).</li>
          <li>Divider.Root (variant `solid-text` / `line`).</li>
          <li>Badge.Root (size medium, variant lighter, color green/red for SLA).</li>
          <li>Avatar.Root / Avatar.Image — courier 40px.</li>
          <li>Button.Root (mode stroke / filled) + Button.Icon.</li>
          <li>Dropdown (Root / Trigger / Content / Item) — Download menu.</li>
          <li>Tooltip — info icons on protection / SLA.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "slug", type: "string", description: "Delivery ID (deliveryID). Source: useParams<{ slug }>(). Calls `getDeliveryByUID(slug)`." },
            { name: "data", type: "DeliveryDetailResponse", description: "Full detail payload. { deliveryID, status, sender, recipient, courier, quote, schedule, billing, insurance, timeline, trackingURL, complete_sla_status, documents, cashOnDelivery }." },
            { name: "envMode", type: "'PRODUCTION' | 'SANDBOX'", description: "SANDBOX adds simulation bottom bar (next/fail/cancel)." },
            { name: "revenueStream", type: "string", description: "Used with NEXT_PUBLIC_REVENUE_STREAM_ALLOWED_SLA to show SLA badge." },
            { name: "onCancel / onShare / onDownload", type: "() => void", description: "Top-bar actions; map to CancelDeliveryModal / ShareLiveTrackingModal / downloadShippingDocuments." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sample data — verbatim shape from DeliveryMock.ts                         */
/* ────────────────────────────────────────────────────────────────────────── */

const DELIVERY = {
  deliveryID: "DE-1748581212497",
  providerOrderID: "DAILY_EXPRESS-00005",
  status: "IN_DELIVERY" as const,
  sender: {
    name: "Kembangan Hub",
    phone: "+62 812-3456-7890",
    address: "Kembangan Hub, Jl. Kembangan Raya No. 1, Jakarta Barat 11610",
    notes: "Loading dock B, ring bell",
  },
  recipient: {
    name: "Fadli Rahman",
    phone: "+62 813-9876-5432",
    address: "Grand Indonesia, Tower A 15F, Jl. M.H. Thamrin No. 1, Jakarta Pusat 10310",
    notes: "Call before arrival",
  },
  courier: {
    name: "Dimas Saputra",
    phone: "+62 814-1122-3344",
    plate: "B 4521 ABC",
  },
  quote: {
    distance: "4.8 km",
    finalAmount: 28500,
    packageName: "Pharma Cold Chain 2.5kg",
    weight: "2.5 kg",
    size: "30 × 20 × 15 cm",
    serviceType: "Same Day",
    pickupTime: "30 May, 11:30 – 12:00",
    type: "FROZEN",
  },
  insurance: { tier: "BASIC", coverage: "Rp 500,000" },
  billing: { paymentMethod: "Invoicing", reference: "INV-20250530-005" },
  trackingURL: "https://track.dashelectric.co/DE-1748581212497",
  timeline: [
    { status: "IN_DELIVERY", label: "Out for delivery", date: "30 May 2025", time: "11:48", notes: "Driver heading to drop-off" },
    { status: "PICKING_UP", label: "Picked up", date: "30 May 2025", time: "11:32", notes: "Package secured at outlet" },
    { status: "PENDING_PICKUP", label: "Driver assigned", date: "30 May 2025", time: "11:20", notes: "Dimas Saputra (B 4521 ABC)" },
    { status: "ALLOCATING", label: "Order placed", date: "30 May 2025", time: "11:15", notes: "DAILY_EXPRESS-00005 created" },
  ],
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Preview                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function DetailPreview() {
  return (
    <div className="flex min-h-[1100px] bg-bg-weak-50">
      <PortalSidebar activeHref="/deliveries" />
      <div className="flex-1 self-stretch bg-bg-white-0">
        <PortalHeader />

        <div className="flex flex-col gap-6 px-8 py-6">
          {/* Back + title row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" className="inline-flex size-9 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50">
                <RiArrowLeftSLine className="size-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-text-strong-950">Delivery {DELIVERY.deliveryID}</h1>
                  <StatusBadge status={DELIVERY.status} />
                </div>
                <p className="mt-0.5 text-sm text-text-sub-600">
                  {DELIVERY.providerOrderID} · Created 30 May, 11:15 · Rp 28,500
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FakeButton>
                <RiCloseFill className="size-4" /> Cancel
              </FakeButton>
              <FakeButton>
                <RiDownload2Line className="size-4" /> Download
                <RiArrowDownSLine className="size-4" />
              </FakeButton>
              <FakeButton tone="primary">
                <RiShareLine className="size-4" /> Share live tracking
              </FakeButton>
            </div>
          </div>

          {/* Status banner */}
          <div className="flex items-center gap-2 rounded-xl border border-(--state-warning-light) bg-(--state-warning-lighter) px-4 py-3 text-sm text-(--state-warning-dark)">
            <RiInformationFill className="size-5 shrink-0" />
            <span className="font-medium">Delivery in progress.</span>
            <span className="text-text-sub-600">Driver picked up at 11:32 and is heading to Grand Indonesia. ETA ~12:08.</span>
          </div>

          {/* 2-col body */}
          <div className="grid grid-cols-[1fr_420px] gap-6">
            <DetailsCard />
            <StatusTimeline />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Details card (left)                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function DetailsCard() {
  return (
    <aside className="flex h-fit flex-col rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
      <header className="flex items-center justify-between px-6 py-4">
        <h2 className="text-base font-medium text-text-strong-950">Details</h2>
        <span className="text-xs text-text-soft-400">Last updated 11:48</span>
      </header>

      <SectionDivider>DELIVERY ROUTE</SectionDivider>
      <div className="flex flex-col gap-3 px-6 py-4">
        <div className="text-sm text-text-sub-600">
          Total distance: <span className="text-text-strong-950">{DELIVERY.quote.distance}</span>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center pt-1">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-(--state-success-lighter) text-(--state-success-base)">
              <RiMapPin2Line className="size-4" />
            </span>
            <div className="my-1 h-12 w-px border-l border-dashed border-stroke-soft-200" />
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-(--state-information-lighter) text-(--state-information-base)">
              <RiMapPin2Line className="size-4" />
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400">Pickup</div>
              <div className="mt-0.5 flex items-baseline gap-1.5 text-sm">
                <span className="font-medium text-text-strong-950">{DELIVERY.sender.name}</span>
                <span className="text-text-sub-600">— {DELIVERY.sender.phone}</span>
              </div>
              <div className="mt-1 text-sm text-text-sub-600">{DELIVERY.sender.address}</div>
              {DELIVERY.sender.notes && (
                <div className="mt-1 text-xs text-text-soft-400">Notes: {DELIVERY.sender.notes}</div>
              )}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400">Drop-off</div>
              <div className="mt-0.5 flex items-baseline gap-1.5 text-sm">
                <span className="font-medium text-text-strong-950">{DELIVERY.recipient.name}</span>
                <span className="text-text-sub-600">— {DELIVERY.recipient.phone}</span>
              </div>
              <div className="mt-1 text-sm text-text-sub-600">{DELIVERY.recipient.address}</div>
              {DELIVERY.recipient.notes && (
                <div className="mt-1 text-xs text-text-soft-400">Notes: {DELIVERY.recipient.notes}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SectionDivider>PACKAGE DETAILS</SectionDivider>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 py-4">
        <FieldRow icon={<RiBox3Line className="size-4 text-text-soft-400" />} label="Package" value={DELIVERY.quote.packageName} />
        <FieldRow icon={<RiShieldCheckLine className="size-4 text-text-soft-400" />} label="Protection" value={`${DELIVERY.insurance.tier} — Coverage up to ${DELIVERY.insurance.coverage}`} />
        <RowDivider />
        <FieldRow label="Weight" value={DELIVERY.quote.weight} />
        <FieldRow label="Size (cm)" value={DELIVERY.quote.size} />
        <RowDivider />
        <FieldRow icon={<RiTruckLine className="size-4 text-text-soft-400" />} label="Service type" value={DELIVERY.quote.serviceType} />
        <FieldRow icon={<RiTimeLine className="size-4 text-text-soft-400" />} label="Pickup time" value={DELIVERY.quote.pickupTime} />
        <RowDivider />
        <FieldRow icon={<RiPriceTag3Line className="size-4 text-text-soft-400" />} label="Type" value={DELIVERY.quote.type} />
        <div />
      </div>

      <SectionDivider>PAYMENT DETAIL</SectionDivider>
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div>
          <div className="text-sm text-text-sub-600">Payment info available</div>
          <div className="mt-0.5 text-xs text-text-soft-400">{DELIVERY.billing.paymentMethod} · {DELIVERY.billing.reference}</div>
        </div>
        <FakeButton>
          View billing
          <RiArrowRightUpLine className="size-4" />
        </FakeButton>
      </div>

      <SectionDivider>DRIVER DETAILS</SectionDivider>
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center overflow-hidden rounded-full bg-(--state-feature-lighter) text-sm font-semibold text-(--state-feature-base)">
            DS
          </span>
          <div>
            <div className="text-xs uppercase tracking-wider text-text-soft-400">Driver</div>
            <div className="mt-0.5 text-sm font-medium text-text-strong-950">{DELIVERY.courier.name}</div>
            <div className="text-xs text-text-sub-600">{DELIVERY.courier.plate} · {DELIVERY.courier.phone}</div>
          </div>
        </div>
        <button type="button" className="inline-flex size-9 items-center justify-center rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 text-text-soft-400 hover:bg-bg-weak-50">
          <RiChat3Line className="size-4" />
        </button>
      </div>

      <SectionDivider>LIVE TRACKING</SectionDivider>
      <div className="p-6">
        <MapPlaceholder />
      </div>
    </aside>
  )
}

function FieldRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-soft-400">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm text-text-strong-950">{value}</div>
    </div>
  )
}

function RowDivider() {
  return (
    <div className="col-span-2 -my-1">
      <div className="h-px bg-stroke-soft-200" />
    </div>
  )
}

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-y border-stroke-soft-200 bg-bg-weak-50 px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
      {children}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Map placeholder                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function MapPlaceholder() {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(0 0 0 / 0.10) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      {/* Route line */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 400 180" fill="none" preserveAspectRatio="none">
        <path d="M40 130 C 120 100, 200 80, 360 50" stroke="var(--state-feature-base)" strokeWidth="2.5" strokeDasharray="4 4" />
      </svg>
      {/* Pickup marker */}
      <span className="absolute left-[10%] bottom-[28%] inline-flex size-6 items-center justify-center rounded-full bg-(--state-success-base) ring-4 ring-(--state-success-lighter)">
        <RiMapPin2Line className="size-3.5 text-text-white-0" />
      </span>
      {/* Drop-off marker */}
      <span className="absolute right-[10%] top-[22%] inline-flex size-6 items-center justify-center rounded-full bg-(--state-information-base) ring-4 ring-(--state-information-lighter)">
        <RiMapPin2Line className="size-3.5 text-text-white-0" />
      </span>
      {/* CTA */}
      <div className="absolute inset-0 flex items-end justify-center pb-4">
        <button type="button" className="inline-flex items-center gap-1.5 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-sm text-text-sub-600 shadow-regular-md hover:bg-bg-weak-50">
          Open live tracking
          <RiArrowRightUpLine className="size-4" />
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Status timeline (right)                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function StatusTimeline() {
  return (
    <aside className="flex h-fit flex-col rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
      <header className="flex items-center justify-between px-6 py-4">
        <h2 className="text-base font-medium text-text-strong-950">Delivery status</h2>
        <span className="inline-flex items-center gap-1 rounded-md bg-(--state-success-lighter) px-2 py-0.5 text-[11px] font-medium text-(--state-success-base)">
          <RiCheckboxCircleFill className="size-3.5" />
          SLA on-time
        </span>
      </header>

      <SectionDivider>DELIVERY PROGRESS</SectionDivider>

      <div className="flex flex-col py-4">
        {DELIVERY.timeline.map((item, index, arr) => {
          const isFirst = index === 0
          const last = index === arr.length - 1
          const Icon = STATUS_META[item.status as keyof typeof STATUS_META]?.icon ?? RiCheckboxCircleFill
          return (
            <div className="flex w-full gap-4 px-6" key={index}>
              <div className="flex flex-col items-center">
                {isFirst ? (
                  <span className="inline-flex size-7 items-center justify-center rounded-full border border-(--state-feature-base) bg-(--state-feature-lighter)">
                    <RiCheckboxCircleFill className="size-4 text-(--state-feature-base)" />
                  </span>
                ) : (
                  <span className="inline-flex size-7 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0">
                    <RiCheckboxCircleLine className="size-4 text-text-soft-400" />
                  </span>
                )}
                {!last && <span className="my-2 h-12 w-px border-l border-dashed border-stroke-soft-200" />}
              </div>
              <div className="flex w-full flex-col gap-1 pb-6">
                <div className="flex w-full items-baseline justify-between gap-1.5">
                  <p className="text-sm font-medium text-text-strong-950">{item.date}</p>
                  <p className="text-[10px] uppercase tracking-wider text-text-soft-400">{item.time}</p>
                </div>
                <p className="text-xs text-text-sub-600">{item.notes}</p>
                <span className="mt-1 w-fit">
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{}}>
                    <Icon className="size-3.5" />
                    {item.label}
                  </span>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-stroke-soft-200 p-6">
        <FakeButton tone="primary">
          <RiReceiptLine className="size-4" /> View shipping label
        </FakeButton>
        <p className="mt-2 text-[11px] text-text-soft-400">
          PDF includes airway bill, recipient signature panel, and barcode.
        </p>
      </div>
    </aside>
  )
}

/* unused-but-imported guard — kept so future variants can opt in */
void RiContractLine
void RiPhoneLine
void RiUser3Line
