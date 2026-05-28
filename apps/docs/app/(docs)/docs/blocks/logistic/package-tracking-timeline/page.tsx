"use client"

import * as React from "react"
import {
  PackageTrackingTimeline,
  type PackageProofImage,
} from "@/registry/dash/blocks/logistic/package-tracking-timeline"
import type { DeliveryStatusEvent } from "@/registry/dash/blocks/delivery-status-timeline"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const PROOF_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
      <rect width='400' height='300' fill='#1f1133'/>
      <text x='200' y='150' fill='#fff' font-family='Inter, sans-serif' font-size='20' text-anchor='middle' dy='.3em'>POD Sample</text>
    </svg>`,
  )

const SAMPLE_EVENTS: DeliveryStatusEvent[] = [
  {
    status: "PENDING_PAYMENT",
    timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(),
    actorName: "Klien Portal",
    actorRole: "client",
  },
  {
    status: "QUEUEING",
    timestamp: new Date(Date.now() - 86400000 * 1.18).toISOString(),
    actorName: "System",
    actorRole: "system",
  },
  {
    status: "ALLOCATING",
    timestamp: new Date(Date.now() - 86400000 * 1.15).toISOString(),
    actorName: "System",
    actorRole: "system",
    note: "Mencari mitra di radius 5km.",
  },
  {
    status: "PENDING_PICKUP",
    timestamp: new Date(Date.now() - 86400000 * 1.1).toISOString(),
    actorName: "Sigit P.",
    actorRole: "mitra",
  },
  {
    status: "PICKING_UP",
    timestamp: new Date(Date.now() - 86400000 * 1.05).toISOString(),
    actorName: "Sigit P.",
    actorRole: "mitra",
    location: { lat: -6.2088, lng: 106.8456 },
  },
  {
    status: "ARRIVED_AT_PICKUP_POINT",
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    actorName: "Sigit P.",
    actorRole: "mitra",
  },
  {
    status: "PENDING_DELIVERY",
    timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
    actorName: "Sigit P.",
    actorRole: "mitra",
  },
  {
    status: "IN_DELIVERY",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actorName: "Sigit P.",
    actorRole: "mitra",
    note: "Paket dalam perjalanan menuju Bekasi Timur.",
  },
]

const SAMPLE_PROOFS: PackageProofImage[] = [
  {
    type: "pickup",
    url: PROOF_IMG,
    capturedAt: new Date(Date.now() - 86400000).toISOString(),
    capturedBy: "Sigit P.",
  },
  {
    type: "delivery",
    url: PROOF_IMG,
    capturedAt: new Date(Date.now() - 1800000).toISOString(),
    capturedBy: "Sigit P.",
  },
]

export default function PackageTrackingTimelineDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Logistic"
        title="Package Tracking Timeline"
        description="Logistic overlay over the shared delivery-status-timeline: hero tracking number + ETA countdown, COD panel, proof image grid, recipient call button. Read-only mitra/customer-facing tracking view. Layer 3 — Dash Logistic only."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add package-tracking-timeline`} />
      </DocsSection>

      <DocsSection title="Preview — full overlay">
        <DocsExample
          title="In-delivery package with COD + proof + recipient"
          description="ETA countdown ticks every 60s. Click a proof thumbnail to open the shared ProofImageViewer (zoom + pan)."
          preview={
            <div className="w-full max-w-2xl">
              <PackageTrackingTimeline
                packageId="PKG-882104"
                trackingNumber="DLV-882104-7T"
                events={SAMPLE_EVENTS}
                currentStatus="IN_DELIVERY"
                estimatedDeliveryAt={new Date(
                  Date.now() + 3600000 * 1.5,
                ).toISOString()}
                recipientName="Sari Wulandari"
                recipientPhone="+62 812 8800 1042"
                cod={{ amount: 187500, status: "pending" }}
                proofImages={SAMPLE_PROOFS}
              />
            </div>
          }
          code={`<PackageTrackingTimeline
  packageId={pkg.id}
  trackingNumber={pkg.trackingNumber}
  events={pkg.statusEvents}
  currentStatus={pkg.currentStatus}
  estimatedDeliveryAt={pkg.eta}
  recipientName={recipient.name}
  recipientPhone={recipient.phone}
  cod={pkg.cod}
  proofImages={pkg.proofImages}
/>`}
        />
      </DocsSection>

      <DocsSection title="Preview — minimal (delivered)">
        <DocsExample
          title="Completed delivery, no COD, no recipient phone"
          description="Hero shows the success badge; ETA countdown is absent. Timeline shows the full happy-path arc."
          preview={
            <div className="w-full max-w-2xl">
              <PackageTrackingTimeline
                packageId="PKG-882211"
                trackingNumber="DLV-882211-A1"
                events={[
                  ...SAMPLE_EVENTS,
                  {
                    status: "ARRIVED_AT_DESTINATION",
                    timestamp: new Date(Date.now() - 600000).toISOString(),
                    actorName: "Sigit P.",
                    actorRole: "mitra",
                  },
                  {
                    status: "COMPLETED",
                    timestamp: new Date(Date.now() - 60000).toISOString(),
                    actorName: "Sigit P.",
                    actorRole: "mitra",
                    note: "Paket diterima resepsionis pukul 14:32 WIB.",
                  },
                ]}
                currentStatus="COMPLETED"
                recipientName="Resepsionis Kantor"
              />
            </div>
          }
          code={`<PackageTrackingTimeline
  packageId={pkg.id}
  trackingNumber={pkg.trackingNumber}
  events={pkg.statusEvents}
  currentStatus="COMPLETED"
  recipientName="Resepsionis Kantor"
/>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "packageId", type: "string", description: "Internal package id (also passed to the shared timeline as deliveryId)." },
            { name: "trackingNumber", type: "string", description: "Public-facing tracking code rendered in the hero." },
            { name: "events", type: "DeliveryStatusEvent[]", description: "From shared block — full state-machine event list. Sorted newest-first by the inner timeline." },
            { name: "currentStatus", type: "string", description: "Any of the 26 ts-delivery-service statuses (see shared delivery-status-timeline)." },
            { name: "estimatedDeliveryAt", type: "string? (ISO)", description: "Optional. Drives the live-ticking countdown in the hero. Goes red + 'Sudah jatuh tempo' when past." },
            { name: "recipientPhone", type: "string?", description: "When present, surfaces a tel: button (mobile native dial)." },
            { name: "recipientName", type: "string?", description: "Surfaced in the recipient panel above the timeline." },
            { name: "cod", type: "{ amount: number; status }?", description: "Cash-on-delivery info. amount is in IDR full rupiah. status drives the badge colour." },
            { name: "proofImages", type: "PackageProofImage[]?", description: "Thumbnail grid; clicking opens the shared ProofImageViewer." },
            { name: "locale", type: '"id" | "en"', description: "id (default) renders formal Indonesian. en for international tenants." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Shared block reuse">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          This block intentionally does <strong>not</strong> own the 26-status
          timeline — it imports from the shared{" "}
          <code>delivery-status-timeline</code> block (also reused by Dash
          Ride). It also reuses the shared <code>proof-image-viewer</code> for
          the zoom overlay. The Logistic-specific layer is:
        </p>
        <ul className="mt-2 text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Hero with theme-accent rail + live ETA countdown.</li>
          <li>COD panel — Logistic-only concept (Ride has no COD).</li>
          <li>Proof image grid → opens shared viewer.</li>
          <li>Recipient call button (formal "Anda" copy).</li>
        </ul>
        <p className="mt-2 text-xs text-text-soft-400">
          Per the Layered Architecture: don't fork — compose.
        </p>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> on the mitra app + customer portal package detail screen.</li>
          <li><strong>Use</strong> when COD or proof images are part of the delivery contract — they're surfaced as first-class panels.</li>
          <li><strong>Don't</strong> use as a backoffice dispatcher view — that's <code>delivery-status-timeline</code> directly, no overlay needed.</li>
          <li><strong>Don't</strong> add mutation actions — this is read-only by design. Mutations live in adjacent flows (handover form, COD-collect, etc.).</li>
        </ul>
      </DocsSection>

      <DocsSection title="Do / Don't">
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Do</strong> pass <code>estimatedDeliveryAt</code> only when you have a real ETA — fake values mislead the mitra.</p>
                <p><strong>Do</strong> keep COD amount in IDR full rupiah (not cents) — the formatter expects rupiah.</p>
                <p><strong>Do</strong> use formal "Anda" — this is mitra-facing.</p>
              </div>
            ),
            caption: "Read-only views still carry voice + data-integrity contracts.",
          }}
          dont={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Don't</strong> add buttons that mutate state — this is the read-only screen.</p>
                <p><strong>Don't</strong> swap formal "Anda" for casual "kamu".</p>
                <p><strong>Don't</strong> fork the 26-status timeline — reuse the shared block.</p>
              </div>
            ),
            caption: "Read-only · formal voice · compose, don't fork.",
          }}
        />
      </DocsSection>

      <DocsSection title="Theme cascade">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Hero uses <code>--theme-accent-base/30</code> border +{" "}
          <code>--theme-accent-lighter</code> background +{" "}
          <code>--theme-accent-dark</code> ETA text — all from the{" "}
          <code>logistic</code> theme manifest. The shared timeline below the
          hero inherits the same accent via the Layer 1 Badge primitive (which
          itself reads Layer 0 semantic tokens, untouched by theme). No accent
          hex is hard-coded.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
