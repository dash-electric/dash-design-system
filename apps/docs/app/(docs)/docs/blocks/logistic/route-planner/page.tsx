"use client"

import * as React from "react"
import {
  RoutePlanner,
  type RouteStop,
} from "@/registry/dash/blocks/logistic/route-planner"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const START = {
  lat: -6.2088,
  lng: 106.8456,
  address: "Hub Dash Pancoran — Jl. Pasar Minggu Raya No. 1, Jakarta Selatan",
}

const SAMPLE_STOPS: RouteStop[] = [
  {
    id: "stop-1",
    type: "pickup",
    address: "Toko Kopi Kenangan — Plaza Festival, Kuningan",
    lat: -6.2256,
    lng: 106.8328,
    customerName: "Kopi Kenangan Kuningan",
    packageId: "PKG-882104",
    priority: "express",
    timeWindow: {
      start: "2026-05-20T09:00:00+07:00",
      end: "2026-05-20T10:30:00+07:00",
    },
  },
  {
    id: "stop-2",
    type: "dropoff",
    address: "Jl. Senopati No. 64, Kebayoran Baru",
    lat: -6.2333,
    lng: 106.8094,
    customerName: "Sari Wulandari",
    packageId: "PKG-882104",
    priority: "express",
  },
  {
    id: "stop-3",
    type: "pickup",
    address: "Gudang Sayurbox — Jl. TB Simatupang, Cilandak",
    lat: -6.2911,
    lng: 106.8112,
    customerName: "Sayurbox Hub TB",
    packageId: "PKG-882199",
    priority: "urgent",
  },
  {
    id: "stop-4",
    type: "dropoff",
    address: "Apartemen Casablanca Tower 3 — Menteng Dalam",
    lat: -6.2244,
    lng: 106.8412,
    customerName: "Bayu Pratama",
    packageId: "PKG-882199",
    priority: "urgent",
  },
  {
    id: "stop-5",
    type: "dropoff",
    address: "Kantor Pos Tebet — Jl. Tebet Raya",
    lat: -6.2364,
    lng: 106.8517,
    customerName: "Resepsionis Pos",
    packageId: "PKG-882211",
    priority: "standard",
  },
]

export default function RoutePlannerDocsPage() {
  const [stops, setStops] = React.useState(SAMPLE_STOPS)

  const onOptimize = async (current: RouteStop[]) => {
    await new Promise((r) => setTimeout(r, 500))
    // Demo "optimization" — pickups before dropoffs, urgent first.
    const rank: Record<NonNullable<RouteStop["priority"]>, number> = {
      urgent: 0,
      express: 1,
      standard: 2,
    }
    return [...current].sort((a, b) => {
      if (a.type !== b.type) return a.type === "pickup" ? -1 : 1
      return rank[a.priority ?? "standard"] - rank[b.priority ?? "standard"]
    })
  }

  const onAssign = async () => {
    await new Promise((r) => setTimeout(r, 600))
    // Demo: caller would write to t_route_assignments_audit_log.
  }

  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Logistic"
        title="Route Planner"
        description="Delivery route planner: N pickup/dropoff stops sorted by ETA, manual reorder override, vehicle-constraint warning, distance + ETA summary, audit-trail assignment payload. Layer 3 — Dash Logistic only."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add route-planner`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Mixed pickup + dropoff route"
          description="5-stop route across Jakarta Selatan. Click Optimize Otomatis to re-sort by demo heuristic (pickups before dropoffs, urgent priority first). Up/down arrows manually override. Driver ID required before assign."
          preview={
            <div className="w-full">
              <RoutePlanner
                stops={stops}
                onOptimize={async (current) => {
                  const next = await onOptimize(current)
                  setStops(next)
                  return next
                }}
                startLocation={START}
                vehicleType="motor"
                onAssign={onAssign}
                dispatcherId="DSP-001"
                defaultDriverId="DRV-1042"
              />
            </div>
          }
          code={`<RoutePlanner
  stops={stops}
  onOptimize={callTspSolver}
  startLocation={hub}
  vehicleType="motor"
  onAssign={async (route) => {
    // 1. Insert t_route_assignments_audit_log row
    // 2. Update t_drivers active_route_id
    await api.post('/routes', route)
  }}
  dispatcherId={session.user.id}
/>`}
        />
      </DocsSection>

      <DocsSection title="Vehicle constraint — truck-large">
        <DocsExample
          title="vehicleType='truck-large'"
          description="Surfaces the gang-sempit warning banner. Stops can be flag-manual'd by the dispatcher via the bell button on each row."
          preview={
            <div className="w-full">
              <RoutePlanner
                stops={SAMPLE_STOPS.slice(0, 3)}
                onOptimize={async (s) => s}
                startLocation={START}
                vehicleType="truck-large"
                onAssign={onAssign}
              />
            </div>
          }
          code={`<RoutePlanner
  stops={stops}
  onOptimize={solve}
  startLocation={hub}
  vehicleType="truck-large"  /* warns: gang sempit */
  onAssign={save}
/>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "stops", type: "RouteStop[]", description: "Initial pickup/dropoff stops. Block holds them in local state for reorder + optimize; caller passes new prop to reset." },
            { name: "onOptimize", type: "(stops: RouteStop[]) => Promise<RouteStop[]>", description: "Caller invokes TSP solver (Google OR-tools / OSRM / Mapbox / in-house). Block toasts on resolve + reject." },
            { name: "distanceMatrix", type: "number[][]?", description: "Optional NxN matrix (meters, row-major). Index 0 = start, 1..N = stops. When absent, block falls back to haversine." },
            { name: "startLocation", type: "{ lat, lng, address }", description: "Hub / warehouse anchor. Surfaced in the 'Mulai dari' strip." },
            { name: "vehicleType", type: '"motor" | "car" | "truck-small" | "truck-large"', description: "Drives icon, avg speed (ETA fallback), and constraint warning." },
            { name: "onAssign", type: "(route) => Promise<void>", description: "Caller writes to t_route_assignments_audit_log + binds the active route to the driver. Block toasts on success/failure." },
            { name: "defaultDriverId", type: "string?", description: "Pre-fills the driver ID input. Editable by dispatcher." },
            { name: "dispatcherId", type: "string?", description: "Logged sr-only + intended for the audit payload at the consumer layer." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Audit trail contract">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The block is FE-only. The consumer's <code>onAssign</code> MUST persist:
        </p>
        <ol className="mt-3 text-sm text-text-sub-600 space-y-1.5 list-decimal pl-5">
          <li>Route stops in order — pickup/dropoff sequence is legally relevant for SLA disputes.</li>
          <li>Driver ID + dispatcher ID + timestamp.</li>
          <li>Total distance (meters) + ETA (ISO).</li>
          <li>Vehicle type — needed for capacity audits when stops carry weight.</li>
        </ol>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for dispatcher-driven route assembly. Drag-reorder + optimize + flag-manual is the canonical UX.</li>
          <li><strong>Use</strong> as the only route-assignment UI — tribes should not roll their own list ordering.</li>
          <li><strong>Don't</strong> use for live-tracking a route in progress — that's <code>package-tracking-timeline</code> + driver telemetry.</li>
          <li><strong>Don't</strong> bypass <code>onAssign</code>. The audit row MUST land before the driver receives the route.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Do / Don't">
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Do</strong> pass a real distance matrix when one is available — haversine is a fallback only.</p>
                <p><strong>Do</strong> respect the manual flag on stops — they signal gang-sempit / restricted-access.</p>
                <p><strong>Do</strong> log dispatcher + driver in the audit row.</p>
              </div>
            ),
            caption: "Routes are SLA-sensitive — assumptions in distance + driver hours both matter.",
          }}
          dont={{
            preview: (
              <div className="text-xs text-text-sub-600 space-y-1.5">
                <p><strong>Don't</strong> auto-assign on optimize resolve — dispatcher confirms via the Assign button.</p>
                <p><strong>Don't</strong> swap the orange Optimize CTA for purple — accent is theme-coded.</p>
                <p><strong>Don't</strong> add <code>react-hook-form</code> for the driver input — banned.</p>
              </div>
            ),
            caption: "Theme + audit + stack policy converge.",
          }}
        />
      </DocsSection>

      <DocsSection title="Theme cascade">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Block reads <code>--theme-accent-base</code> + <code>--theme-accent-dark</code> + <code>--theme-accent-on</code>
          {" "}from the <code>logistic</code> theme manifest (orange{" "}
          <code>#ea580c</code>). Primary CTAs (Assign) stay Dash Purple per
          Layer 0 — accent is for the Optimize action + flag highlight only.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
