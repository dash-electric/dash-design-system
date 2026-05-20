"use client"

import * as React from "react"
import {
  BatchDispatchGrid,
  type Package,
  type DispatchDriver,
} from "@/registry/dash/blocks/logistic/batch-dispatch-grid"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const SAMPLE_PACKAGES: Package[] = [
  {
    id: "p1",
    trackingNumber: "DLV-882104",
    weight: 1800,
    dimensions: { l: 30, w: 20, h: 10 },
    destinationZone: "Kuningan",
    priority: "urgent",
    scheduledFor: "2026-05-20T10:00:00+07:00",
    status: "pending",
  },
  {
    id: "p2",
    trackingNumber: "DLV-882199",
    weight: 4200,
    dimensions: { l: 40, w: 30, h: 15 },
    destinationZone: "Tebet",
    priority: "express",
    scheduledFor: "2026-05-20T11:00:00+07:00",
    status: "pending",
  },
  {
    id: "p3",
    trackingNumber: "DLV-882211",
    weight: 800,
    dimensions: { l: 25, w: 18, h: 8 },
    destinationZone: "Kuningan",
    priority: "standard",
    scheduledFor: "2026-05-20T12:30:00+07:00",
    status: "pending",
  },
  {
    id: "p4",
    trackingNumber: "DLV-882278",
    weight: 6500,
    dimensions: { l: 50, w: 40, h: 25 },
    destinationZone: "Cilandak",
    priority: "express",
    scheduledFor: "2026-05-20T13:00:00+07:00",
    status: "pending",
  },
  {
    id: "p5",
    trackingNumber: "DLV-882299",
    weight: 2400,
    dimensions: { l: 35, w: 25, h: 12 },
    destinationZone: "Tebet",
    priority: "standard",
    scheduledFor: "2026-05-20T14:00:00+07:00",
    status: "pending",
  },
]

const SAMPLE_DRIVERS: DispatchDriver[] = [
  {
    id: "d1",
    name: "Sigit P.",
    vehicleType: "Motor",
    currentLoad: 3000,
    capacityRemaining: 12000,
    currentZone: "Kuningan",
  },
  {
    id: "d2",
    name: "Bagas R.",
    vehicleType: "Mobil",
    currentLoad: 5000,
    capacityRemaining: 25000,
    currentZone: "Tebet",
  },
  {
    id: "d3",
    name: "Yuda S.",
    vehicleType: "Truk Kecil",
    currentLoad: 8000,
    capacityRemaining: 8000,
    currentZone: "Cilandak",
  },
]

export default function BatchDispatchGridDocsPage() {
  const onAssignBatch = async (
    assignments: { packageId: string; driverId: string }[],
  ) => {
    await new Promise((r) => setTimeout(r, 500))
    // Demo: caller writes to t_batch_dispatch_audit_log here.
    console.log("Batch dispatch:", assignments)
  }

  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Logistic"
        title="Batch Dispatch Grid"
        description="Bulk N-packages × M-drivers assignment grid. Per-cell toggle, multi-select bulk-assign, per-driver capacity meter, zone-proximity auto-suggest, over-capacity highlight, audited bulk submit. Layer 3 — Dash Logistic only."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add batch-dispatch-grid`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="5 packages × 3 drivers"
          description="Click a cell to assign / un-assign. Check packages on the left then click a driver column header to bulk-assign. Try Auto-suggest for zone-proximity heuristic. Submit opens a confirm modal."
          preview={
            <div className="w-full">
              <BatchDispatchGrid
                packages={SAMPLE_PACKAGES}
                drivers={SAMPLE_DRIVERS}
                onAssignBatch={onAssignBatch}
                dispatcherId="DSP-001"
              />
            </div>
          }
          code={`<BatchDispatchGrid
  packages={pendingPackages}
  drivers={availableDrivers}
  onAssignBatch={async (assignments) => {
    // 1. Insert one row in t_batch_dispatch_audit_log
    // 2. Bulk update t_packages set driver_id = ?, status = 'assigned'
    // 3. Push driver app notification
    await api.post('/dispatch/batch', assignments)
  }}
  capacityWarningThreshold={80}
  dispatcherId={session.user.id}
/>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "packages", type: "Package[]", description: "Pending packages. Block reads weight + destinationZone + priority for capacity guard + auto-suggest." },
            { name: "drivers", type: "DispatchDriver[]", description: "Available drivers. currentLoad + capacityRemaining drive the capacity meter; currentZone seeds the auto-suggest." },
            { name: "onAssignBatch", type: "(assignments) => Promise<void>", description: "Caller commits the batch + writes one audit row. Block toasts on resolve + reject." },
            { name: "capacityWarningThreshold", type: "number?", description: "Percentage fill at which the meter goes warning (yellow). Default 80." },
            { name: "dispatcherId", type: "string?", description: "Logged sr-only + intended for the audit payload at the consumer layer." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Capacity logic">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Per-driver capacity bar fills with{" "}
          <code>currentLoad + addedFromAssignment</code>. When any single
          cell's package weight exceeds the driver's remaining capacity (net of
          everything else already routed in this batch), the cell renders red
          with a warning icon. Submission is still allowed — dispatcher
          override is sometimes correct (mitra agreeing to overload, or
          imminent dropoff before pickup) — but the confirm modal surfaces it
          as an "Over capacity" badge for explicit acknowledgement.
        </p>
      </DocsSection>

      <DocsSection title="Audit trail contract">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The block is FE-only. The consumer's <code>onAssignBatch</code> MUST
          persist:
        </p>
        <ol className="mt-3 text-sm text-text-sub-600 space-y-1.5 list-decimal pl-5">
          <li>One <code>t_batch_dispatch_audit_log</code> row containing the full assignment list.</li>
          <li>Dispatcher ID + timestamp.</li>
          <li>Capacity-warning flag per assignment, when over-capacity at submit time (legal hedge).</li>
          <li>Bulk update <code>t_packages.driver_id</code> + status = "assigned" inside the same transaction.</li>
        </ol>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> at shift start when a dispatcher needs to land 20-100 packages across the available roster.</li>
          <li><strong>Use</strong> as the canonical bulk-dispatch UI — tribes should not roll their own spreadsheet export/import flow.</li>
          <li><strong>Don't</strong> use for single ad-hoc reassignments — that's a row-level action in the packages table.</li>
          <li><strong>Don't</strong> use as the live ops view; it's pre-dispatch only.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Do / Don't">
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Do</strong> commit the audit row in the same transaction as the package updates.</p>
                <p><strong>Do</strong> preserve over-capacity warnings in the audit payload — supervisors need them.</p>
                <p><strong>Do</strong> push driver app notifications inside <code>onAssignBatch</code>, not after toast.</p>
              </div>
            ),
            caption: "Bulk dispatch is high-stakes — atomic + audited.",
          }}
          dont={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Don't</strong> resolve <code>onAssignBatch</code> without the audit row.</p>
                <p><strong>Don't</strong> block submit on over-capacity warnings — dispatcher override is sometimes correct.</p>
                <p><strong>Don't</strong> add <code>react-query</code> — banned. Caller owns its own data flow.</p>
              </div>
            ),
            caption: "Warn, don't gate; audit, don't trust.",
          }}
        />
      </DocsSection>

      <DocsSection title="Theme cascade">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Uses <code>--theme-accent-base</code> + <code>--theme-accent-lighter</code> from the{" "}
          <code>logistic</code> theme manifest (orange{" "}
          <code>#ea580c</code>) for the assigned-cell highlight + Submit CTA +
          capacity bar default fill. Warning + error states still use Layer 0
          semantic tokens — accent is never error.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
