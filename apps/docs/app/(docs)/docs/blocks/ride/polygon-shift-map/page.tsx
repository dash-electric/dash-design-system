"use client"

import * as React from "react"
import {
  PolygonShiftMap,
  type PolygonZone,
  type MitraPosition,
} from "@/registry/dash/blocks/ride/polygon-shift-map"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

// Three sample zones — a simple Jakarta polygon for each (4 vertices).
const DEMO_ZONES: PolygonZone[] = [
  {
    id: "z-sudirman",
    name: "Sudirman",
    shape: [
      { lat: -6.222, lng: 106.815 },
      { lat: -6.222, lng: 106.825 },
      { lat: -6.212, lng: 106.825 },
      { lat: -6.212, lng: 106.815 },
    ],
    requiredDrivers: 25,
    currentDrivers: 14,
  },
  {
    id: "z-kemang",
    name: "Kemang",
    shape: [
      { lat: -6.265, lng: 106.815 },
      { lat: -6.265, lng: 106.825 },
      { lat: -6.255, lng: 106.825 },
      { lat: -6.255, lng: 106.815 },
    ],
    requiredDrivers: 15,
    currentDrivers: 16,
  },
  {
    id: "z-senayan",
    name: "Senayan",
    shape: [
      { lat: -6.230, lng: 106.795 },
      { lat: -6.230, lng: 106.810 },
      { lat: -6.215, lng: 106.810 },
      { lat: -6.215, lng: 106.795 },
    ],
    requiredDrivers: 12,
    currentDrivers: 22,
  },
]

const DEMO_MITRAS: MitraPosition[] = [
  // Sudirman
  { id: "m-1", name: "Wahyu Pratama", lat: -6.218, lng: 106.820, status: "idle", vehicleType: "car" },
  { id: "m-2", name: "Siti Nurhaliza", lat: -6.215, lng: 106.818, status: "active", vehicleType: "motor" },
  { id: "m-3", name: "Andi Wijaya", lat: -6.220, lng: 106.823, status: "delivering", vehicleType: "premium" },
  // Kemang
  { id: "m-4", name: "Bayu Saputra", lat: -6.260, lng: 106.820, status: "idle", vehicleType: "motor" },
  { id: "m-5", name: "Dewi Lestari", lat: -6.258, lng: 106.822, status: "active", vehicleType: "car" },
  // Senayan
  { id: "m-6", name: "Reza Tamara", lat: -6.222, lng: 106.802, status: "idle", vehicleType: "car" },
  { id: "m-7", name: "Maya Damayanti", lat: -6.225, lng: 106.805, status: "active", vehicleType: "motor" },
  { id: "m-8", name: "Faisal Rahman", lat: -6.220, lng: 106.808, status: "delivering", vehicleType: "premium" },
]

function InteractiveDemo() {
  const onBroadcastBonus = React.useCallback(async (_zoneId: string) => {
    await new Promise((r) => setTimeout(r, 500))
  }, [])
  return (
    <PolygonShiftMap
      zones={DEMO_ZONES}
      mitras={DEMO_MITRAS}
      onBroadcastBonus={onBroadcastBonus}
    />
  )
}

export default function PolygonShiftMapDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Ride"
        kind="composite"
        status="beta"
        title="Polygon Shift Map"
        description="Mitra positioning vs polygon-shift supply table. Saturation classifier per zone, point-in-polygon mitra count, broadcast-bonus action for under-supplied zones. No map library dep. Layer 3 — Dash Ride only."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add polygon-shift-map`} />
      </DocsSection>

      <DocsSection title="Preview (table renderer, default)">
        <DocsExample
          title="3 zones, 8 mitras"
          description="Zones sorted by saturation severity — under-supplied first. Click a zone row to expand the detail panel listing mitras inside the polygon (computed via ray-casting). Under-supplied zones expose a 'Siarkan bonus' action; clicking calls onBroadcastBonus and fires the audit row server-side."
          preview={
            <div className="w-full max-w-5xl">
              <InteractiveDemo />
            </div>
          }
          code={`<PolygonShiftMap
  zones={zones}
  mitras={mitras}
  onBroadcastBonus={async (zoneId) => {
    await api.post(\`/ride/zones/\${zoneId}/broadcast-bonus\`)
    await mutate("/ride/zones")
  }}
/>`}
        />
      </DocsSection>

      <DocsSection title="External map adapter">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Set <code>mapRenderer="external"</code> when the consumer app
          composes a real map viewport (Mapbox / Google / MapLibre). The block
          continues to render the supply/demand table beneath your map and
          exposes <code>onZoneSelect</code> so a zone click on the map syncs
          the block's selection.
        </p>
        <DocsCode
          language="tsx"
          code={`<>
  <RideMapViewport
    zones={zones}
    mitras={mitras}
    onZoneClick={(id) => setSelectedZoneId(id)}
  />
  <PolygonShiftMap
    zones={zones}
    mitras={mitras}
    mapRenderer="external"
    onZoneSelect={setSelectedZoneId}
    onBroadcastBonus={broadcastBonus}
  />
</>`}
        />
      </DocsSection>

      <DocsSection title="Saturation classifier">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Each zone is classified by the ratio of <code>currentDrivers</code>{" "}
          to <code>requiredDrivers</code>:
        </p>
        <ul className="text-sm text-text-sub-600 space-y-1 list-disc pl-5 max-w-3xl">
          <li><strong>Under</strong> — ratio &lt; 0.8 (red badge, broadcast action enabled)</li>
          <li><strong>Balanced</strong> — 0.8 ≤ ratio ≤ 1.2 (green badge)</li>
          <li><strong>Over</strong> — ratio &gt; 1.2 (blue badge, signals you can pull mitras to under zones)</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "zones",
              type: "PolygonZone[]",
              description: "Ordered list of polygon shift zones. Each carries id, name, shape (vertex list), requiredDrivers, currentDrivers.",
            },
            {
              name: "mitras",
              type: "MitraPosition[]",
              description: "All mitras to evaluate against the zones. Lat/lng required — point-in-polygon test runs on selection.",
            },
            {
              name: "onZoneSelect",
              type: "(zoneId) => void",
              description: "Optional callback when dispatcher selects a zone — useful to sync an external map viewport.",
            },
            {
              name: "onBroadcastBonus",
              type: "(zoneId) => Promise<void>",
              description: "Optional broadcast action for under-supplied zones. Caller writes the audit row. Button only renders when this prop is provided.",
            },
            {
              name: "mapRenderer",
              type: '"table" | "external"',
              description: 'Default "table" — list + detail only. "external" reserves a slot for the caller to compose an actual map.',
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
          Broadcast bonus actions are auditable. Per Dash AI Rules § Audit
          Trail, the caller MUST persist when <code>onBroadcastBonus</code>{" "}
          fires:
        </p>
        <ul className="text-sm text-text-sub-600 space-y-1 list-disc pl-5 max-w-3xl">
          <li><code>dispatcherId</code> + <code>zoneId</code></li>
          <li><code>zoneSnapshot</code> (required / current driver counts at the moment of broadcast)</li>
          <li><code>broadcastAt</code> ISO timestamp (server-side)</li>
          <li><code>ipHash</code> (sha256, forensic-only)</li>
        </ul>
      </DocsSection>

      <DocsSection title="Voice">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Neutral ops register — dispatcher is staff. Copy intentionally avoids
          framing mitra supply in inventory terms ("Kurang", not "Defisit
          stok").
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
