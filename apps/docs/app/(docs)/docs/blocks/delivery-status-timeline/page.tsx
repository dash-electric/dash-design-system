"use client"

import * as React from "react"
import {
  DeliveryStatusTimeline,
  type DeliveryStatusEvent,
} from "@/registry/dash/blocks/delivery-status-timeline"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const SAMPLE: DeliveryStatusEvent[] = [
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

const FAILED_FLOW: DeliveryStatusEvent[] = [
  { status: "PENDING_PAYMENT", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), actorName: "Klien Portal", actorRole: "client" },
  { status: "QUEUEING", timestamp: new Date(Date.now() - 86400000 * 1.95).toISOString(), actorName: "System", actorRole: "system" },
  { status: "ALLOCATING", timestamp: new Date(Date.now() - 86400000 * 1.9).toISOString(), actorName: "System", actorRole: "system" },
  { status: "PENDING_PICKUP", timestamp: new Date(Date.now() - 86400000 * 1.85).toISOString(), actorName: "Bagas R.", actorRole: "mitra" },
  { status: "PICKING_UP", timestamp: new Date(Date.now() - 86400000 * 1.8).toISOString(), actorName: "Bagas R.", actorRole: "mitra" },
  { status: "IN_DELIVERY", timestamp: new Date(Date.now() - 86400000 * 1.6).toISOString(), actorName: "Bagas R.", actorRole: "mitra" },
  { status: "FAILED", timestamp: new Date(Date.now() - 86400000 * 1.4).toISOString(), actorName: "Ops Center", actorRole: "ops", note: "Penerima tidak ditemukan setelah 3 kali percobaan kontak." },
  { status: "PENDING_RETURN", timestamp: new Date(Date.now() - 86400000 * 1.3).toISOString(), actorName: "Ops Center", actorRole: "ops" },
  { status: "IN_RETURN", timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(), actorName: "Bagas R.", actorRole: "mitra" },
  { status: "ON_HOLD", timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), actorName: "Ops Center", actorRole: "ops", note: "Menunggu konfirmasi klien untuk pembuangan paket." },
]

export default function DeliveryStatusTimelineDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Workflow"
        title="Delivery Status Timeline"
        description="Visual timeline of a delivery across the 26-status ts-delivery-service state machine. Newest-first rail with category-coded badges, actor + role, optional location link, and inline expandable details. Used by backoffice ops + portal client tracking."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add delivery-status-timeline`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="EXPRESS happy path"
          description="9 events from PENDING_PAYMENT → ARRIVED_AT_DESTINATION. Current status row gets a pulse ring + aria-current=step."
          preview={
            <div className="w-full max-w-2xl">
              <DeliveryStatusTimeline
                deliveryId="DLV-2026-08812"
                events={SAMPLE}
                currentStatus="ARRIVED_AT_DESTINATION"
              />
            </div>
          }
          code={`<DeliveryStatusTimeline
  deliveryId="DLV-2026-08812"
  events={events}
  currentStatus="ARRIVED_AT_DESTINATION"
/>`}
        />
      </DocsSection>

      <DocsSection title="Failed → return flow">
        <DocsExample
          title="ON_HOLD warning state"
          description="Failed delivery routed to return → currently on hold pending client decision. Warning category surfaces in yellow."
          preview={
            <div className="w-full max-w-2xl">
              <DeliveryStatusTimeline
                deliveryId="DLV-2026-08801"
                events={FAILED_FLOW}
                currentStatus="ON_HOLD"
              />
            </div>
          }
          code={`<DeliveryStatusTimeline
  deliveryId="DLV-2026-08801"
  events={failedFlowEvents}
  currentStatus="ON_HOLD"
/>`}
        />
      </DocsSection>

      <DocsSection title="English locale">
        <DocsExample
          title="locale='en'"
          description="Status labels render English. Used by portal-v2 next-intl en.json screens."
          preview={
            <div className="w-full max-w-2xl">
              <DeliveryStatusTimeline
                deliveryId="DLV-2026-08812"
                events={SAMPLE}
                currentStatus="ARRIVED_AT_DESTINATION"
                locale="en"
              />
            </div>
          }
          code={`<DeliveryStatusTimeline locale="en" {...props} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Card wrapper with header (delivery ID + event count).</li>
          <li>Vertical <code>ol</code> with category-colored dot + Badge label + relative time (Tooltip = absolute time on hover).</li>
          <li>Each row is a button — click to expand inline (status code, full timestamp, actor ID, full note).</li>
          <li>Current status: pulse ring + ring-offset + Badge appearance flips from <code>lighter</code> to <code>filled</code> + <code>aria-current=&quot;step&quot;</code>.</li>
          <li>Optional location: opens Google Maps in new tab via <code>MapPin</code> icon link.</li>
          <li>Collapse: when <code>expandable</code> + events &gt; 10, middle rows hide behind &ldquo;Lihat semua&rdquo;. First 3 + last 3 always visible.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Status categories (color mapping)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          All 26 ts-delivery-service statuses collapse into 5 visual categories. The mapping is exported as <code>STATUS_CATEGORY</code> for reuse in badges/filters/charts elsewhere.
        </p>
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong className="text-text-soft-400">neutral (grey)</strong> — PENDING_PAYMENT, QUEUEING, ALLOCATING, PREPARING, PENDING_PICKING_UP, PENDING_PICKUP, PENDING_DELIVERY, PENDING_RETURN.</li>
          <li><strong className="text-primary-base">in-progress (Dash purple)</strong> — PICKING_UP, ARRIVED_AT_PICKUP_POINT, IN_DELIVERY, ARRIVED_AT_DESTINATION, IN_RETURN, ARRIVED_AT_RETURN_POINT, RETURN_TO_HUB.</li>
          <li><strong className="text-state-success-base">success (green)</strong> — COMPLETED, VERIFIED, RETURNED.</li>
          <li><strong className="text-state-error-base">error (red)</strong> — CANCELLED, FAILED, FAILED_IN_RETURN, DISPOSED, EXPIRED.</li>
          <li><strong className="text-state-warning-base">warning (yellow)</strong> — NOT_VERIFIED, ON_HOLD, ARRIVED_AT_HUB.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> on Control Tower delivery-detail drawer to show status progression at a glance.</li>
          <li><strong>Use</strong> on portal-v2 client tracking page (public token-gated route).</li>
          <li><strong>Use</strong> in backoffice <code>/mgmt/v1/deliveries/:deliveryUID</code> detail page.</li>
          <li><strong>Don&rsquo;t</strong> reverse the order (oldest-first) — newest must be on top so ops sees current state without scrolling.</li>
          <li><strong>Don&rsquo;t</strong> render raw status codes in user-facing text — always pass labels via <code>statusLabels</code> or rely on <code>DEFAULT_STATUS_LABELS</code>.</li>
          <li><strong>Don&rsquo;t</strong> use casual &ldquo;kamu&rdquo; in custom labels for mitra-facing surfaces — Dash voice rule is formal &ldquo;Anda&rdquo;.</li>
        </ul>
      </DocsSection>

      <DocsSection title="State machine integration">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          This component is read-only — it does NOT advance status. Status transitions live in <code>ts-delivery-service</code> behind <code>DeliveryStatusStateMachine.canTransitionTo()</code>. Use <code>.isFinal(currentStatus)</code> on the caller side to decide whether to render &ldquo;Cancel&rdquo; / &ldquo;Update status&rdquo; controls alongside this timeline. Final states: COMPLETED, DISPOSED, RETURNED, CANCELLED, EXPIRED.
        </p>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "deliveryId", type: "string", description: "Delivery UID. Rendered in the header + used as aria-label seed." },
            { name: "events", type: "DeliveryStatusEvent[]", description: "{ status, timestamp (ISO), actorId?, actorName?, actorRole?, note?, location? }. Order doesn't matter — component sorts newest-first." },
            { name: "currentStatus", type: "string", description: "One of 26 enums. The matching event (most recent) gets pulse ring + aria-current=step." },
            { name: "statusLabels", type: "Record<string, { id, en }>", description: "Optional override map. Defaults to DEFAULT_STATUS_LABELS exported by this module." },
            { name: "locale", type: '"id" | "en"', description: 'Default "id". Switches both labels + relative-time + absolute-time formatting.' },
            { name: "expandable", type: "boolean", description: "Default true. When true and events > 10, collapse middle (show first 3 + last 3 + 'Lihat semua' button)." },
            { name: "className", type: "string", description: "Outer wrapper class override." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Newest-first rule">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Like Activity Timeline — current state must be visible without scrolling. Component sorts events internally; you can pass them in any order.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <div className="flex gap-2 text-xs"><span className="text-[10px] text-text-soft-400 mt-0.5">2m</span><span><strong>Tiba di Tujuan</strong> · Sigit P.</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[10px] text-text-soft-400 mt-0.5">12m</span><span><strong>Dalam Pengantaran</strong> · Sigit P.</span></div>
              </div>
            ),
            caption: "Newest event on top — ops checking on this delivery sees 'arrived at destination' first.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <div className="flex gap-2 text-xs"><span className="text-[10px] text-text-soft-400 mt-0.5">2d</span><span><strong>Pending Payment</strong> · Klien</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[10px] text-text-soft-400 mt-0.5">2d</span><span><strong>Queueing</strong> · System</span></div>
              </div>
            ),
            caption: "Don't render oldest-first. Current state hides at the bottom of the rail.",
          }}
        />
      </DocsSection>

      <DocsSection title="Human-readable labels, not codes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The 26 ts-delivery-service enums are machine identifiers — never expose them as-is to clients. The component renders <code>statusLabels[status][locale]</code>; fall back to <code>DEFAULT_STATUS_LABELS</code> baked in.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-state-success-lighter text-state-success-base px-2 py-0.5">Selesai</span>
                <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-bg-weak-50 text-text-soft-400 px-2 py-0.5">Mencari Mitra</span>
              </div>
            ),
            caption: "Render localized human labels.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-bg-weak-50 text-text-sub-600 px-2 py-0.5 rounded">COMPLETED</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-bg-weak-50 text-text-sub-600 px-2 py-0.5 rounded">ALLOCATING</span>
              </div>
            ),
            caption: "Don't expose raw enum codes. Reads as debug output, not customer communication.",
          }}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
