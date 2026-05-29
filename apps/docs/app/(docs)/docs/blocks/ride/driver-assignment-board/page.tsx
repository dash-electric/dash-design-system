"use client"

import * as React from "react"
import {
  DriverAssignmentBoard,
  type RideRequest,
  type AvailableDriver,
} from "@/registry/dash/blocks/ride/driver-assignment-board"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const AGO = (mins: number) =>
  new Date(Date.now() - mins * 60 * 1000).toISOString()

const DEMO_REQUESTS: RideRequest[] = [
  {
    id: "req-001",
    pickupLocation: "Mall Grand Indonesia",
    dropoffLocation: "Bandara Soekarno-Hatta T3",
    passengerName: "Rina Wahyuni",
    passengerRating: 4.8,
    vehicleType: "car",
    status: "pending",
    estimatedFare: 18500000,
    requestedAt: AGO(2),
  },
  {
    id: "req-002",
    pickupLocation: "Kemang Village",
    dropoffLocation: "Plaza Senayan",
    passengerName: "Budi Hartono",
    vehicleType: "motor",
    status: "pending",
    estimatedFare: 3200000,
    requestedAt: AGO(4),
  },
  {
    id: "req-003",
    pickupLocation: "The Ritz-Carlton Pacific Place",
    dropoffLocation: "Hotel Mulia Senayan",
    passengerName: "Tn. Hartanto",
    passengerRating: 5.0,
    vehicleType: "premium",
    status: "matching",
    estimatedFare: 12000000,
    requestedAt: AGO(7),
  },
]

const DEMO_DRIVERS: Record<string, AvailableDriver[]> = {
  "req-001": [
    {
      id: "drv-a",
      name: "Agus Setiawan",
      vehicleType: "car",
      distance: 380,
      rating: 4.9,
      trips: 3214,
      acceptanceRate: 0.96,
    },
    {
      id: "drv-b",
      name: "Dedi Kurniawan",
      vehicleType: "car",
      distance: 720,
      rating: 4.7,
      trips: 1872,
      acceptanceRate: 0.88,
    },
    {
      id: "drv-c",
      name: "Eko Saputra",
      vehicleType: "car",
      distance: 1240,
      rating: 4.5,
      trips: 901,
      acceptanceRate: 0.72,
    },
  ],
  "req-002": [
    {
      id: "drv-d",
      name: "Fajar Nugroho",
      vehicleType: "motor",
      distance: 210,
      rating: 4.95,
      trips: 5421,
      acceptanceRate: 0.97,
    },
    {
      id: "drv-e",
      name: "Galih Pratama",
      vehicleType: "motor",
      distance: 460,
      rating: 4.6,
      trips: 1208,
      acceptanceRate: 0.81,
    },
  ],
  "req-003": [
    {
      id: "drv-f",
      name: "Hendra Wijaya",
      vehicleType: "premium",
      distance: 540,
      rating: 4.99,
      trips: 2103,
      acceptanceRate: 0.99,
    },
  ],
}

function InteractiveDemo() {
  const [requests, setRequests] = React.useState<RideRequest[]>(DEMO_REQUESTS)
  const driversForRequest = React.useCallback(
    async (requestId: string) => {
      await new Promise((r) => setTimeout(r, 350))
      return DEMO_DRIVERS[requestId] ?? []
    },
    [],
  )
  const onAssign = React.useCallback(
    async (requestId: string, _driverId: string) => {
      await new Promise((r) => setTimeout(r, 400))
      // Mark as assigned locally to mirror the BE round-trip pattern.
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "assigned" as const } : r,
        ),
      )
    },
    [],
  )

  return (
    <DriverAssignmentBoard
      requests={requests}
      driversForRequest={driversForRequest}
      onAssign={onAssign}
      dispatcherId="dsp-irfan-01"
    />
  )
}

export default function DriverAssignmentBoardDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Ride"
        kind="composite"
        status="beta"
        title="Driver Assignment Board"
        description="Dispatcher split-pane to assign drivers to pending ride requests. Distance + rating + acceptance-rate filter, bulk auto-match toggle, audit-trail payload through onAssign. Layer 3 — Dash Ride only."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add driver-assignment-board`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="3 pending requests, lazy-loaded driver pool"
          description="Pick a request on the left, the right pane fetches drivers for that request. Filter by acceptance rate and search by name. Toggle 'Massal' to bulk-assign — auto-match picks the closest driver passing the acceptance threshold."
          preview={
            <div className="w-full max-w-5xl">
              <InteractiveDemo />
            </div>
          }
          code={`<DriverAssignmentBoard
  requests={pendingRequests}
  driversForRequest={async (id) => api.get(\`/dispatch/requests/\${id}/drivers\`)}
  onAssign={async (requestId, driverId) => {
    await api.post(\`/dispatch/requests/\${requestId}/assign\`, { driverId })
    await mutate("/dispatch/requests")
  }}
  dispatcherId={session.user.id}
/>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "requests",
              type: "RideRequest[]",
              description: "Ride requests in the queue. Only pending + matching are listed; assigned + cancelled are hidden.",
            },
            {
              name: "driversForRequest",
              type: "(requestId) => Promise<AvailableDriver[]>",
              description: "Lazy fetch — called when a request is selected. Results are cached per request id for the session.",
            },
            {
              name: "onAssign",
              type: "(requestId, driverId) => Promise<void>",
              description: "Persist the assignment. Caller writes the audit row + re-fetches requests so the board reflects the new status.",
            },
            {
              name: "dispatcherId",
              type: "string",
              description: "Acting dispatcher id — recorded in the audit row by the caller.",
            },
            {
              name: "className",
              type: "string",
              description: "Outer Card wrapper className.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Audit trail contract">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          The block does not write the audit row — the caller does, inside{" "}
          <code>onAssign</code>. Per Dash AI Rules § Audit Trail, every
          assignment for a Ride request MUST persist:
        </p>
        <ul className="text-sm text-text-sub-600 space-y-1 list-disc pl-5 max-w-3xl">
          <li><code>requestId</code> + <code>driverId</code></li>
          <li><code>dispatcherId</code> (passed as a prop, included in the audit payload)</li>
          <li><code>method</code> — <code>"manual"</code> or <code>"bulk"</code> (caller derives from UX context)</li>
          <li><code>assignedAt</code> ISO timestamp (server-side)</li>
          <li><code>ipHash</code> (sha256, forensic-only)</li>
        </ul>
      </DocsSection>

      <DocsSection title="Voice">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Neutral ops register — the dispatcher is internal staff, not a mitra,
          so we don't carry the formal "Anda" rule. Action labels are short
          imperative Indonesian ("Tugaskan", "Siarkan").
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
