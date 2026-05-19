"use client"

import * as React from "react"
import { RiAddLine, RiSubtractLine, RiExpandLeftRightLine } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Marketing Widget — Geography. Ported from AlignUI Marketing Template (2026-05-18).
 * Source: components/widgets/widget-geogprahy.tsx + widget-geography-map.tsx
 *
 * Map approximated as a dotted-grid Europe canvas with positioned markers; exact world map SVG
 * (Leaflet + dotted-map dep in source) is too heavy for a docs preview.
 */

type LocationData = {
  id: number
  // Normalized 0..1 coords (x=left, y=top) inside the map canvas
  x: number
  y: number
  count: number
  country: { name: string; flag: string }
  demographics: { men: number; women: number; other: number }
}

const GEOGRAPHY: LocationData[] = [
  { id: 1, x: 0.62, y: 0.55, count: 1500, country: { name: "Turkey", flag: "🇹🇷" }, demographics: { men: 32, women: 60, other: 8 } },
  { id: 2, x: 0.42, y: 0.45, count: 800, country: { name: "France", flag: "🇫🇷" }, demographics: { men: 45, women: 50, other: 5 } },
  { id: 3, x: 0.39, y: 0.34, count: 1200, country: { name: "United Kingdom", flag: "🇬🇧" }, demographics: { men: 48, women: 47, other: 5 } },
  { id: 4, x: 0.5, y: 0.4, count: 900, country: { name: "Germany", flag: "🇩🇪" }, demographics: { men: 42, women: 53, other: 5 } },
  { id: 5, x: 0.5, y: 0.5, count: 600, country: { name: "Italy", flag: "🇮🇹" }, demographics: { men: 38, women: 55, other: 7 } },
]

export default function GeographyWidgetPage() {
  const [highlightedId, setHighlightedId] = React.useState(1)
  const highlighted = GEOGRAPHY.find((l) => l.id === highlightedId)!

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Geography"
        description="Visitor geography map with interactive country markers. Click a marker to inspect that country's count + Men/Women/Other demographics. Live in source via Leaflet + a dotted world map; here approximated with a dotted canvas + positioned markers."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Live marker switcher"
          preview={
            <WidgetShell className="max-w-sm">
              <HeaderRow location={highlighted} />
              <DemographicsPill demographics={highlighted.demographics} />
              <MapCanvas data={GEOGRAPHY} highlightedId={highlightedId} setHighlightedId={setHighlightedId} />
            </WidgetShell>
          }
          code={`<WidgetShell>
  <HeaderRow location={highlighted} />
  <DemographicsPill demographics={highlighted.demographics} />
  <MapCanvas data={GEOGRAPHY} highlightedId={highlightedId} setHighlightedId={setHighlightedId} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <DocsExample
          title="Each country selected"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GEOGRAPHY.slice(0, 2).map((loc) => (
                <WidgetShell key={loc.id}>
                  <HeaderRow location={loc} />
                  <DemographicsPill demographics={loc.demographics} />
                  <MapCanvas data={GEOGRAPHY} highlightedId={loc.id} />
                </WidgetShell>
              ))}
            </div>
          }
          code={`<MapCanvas data={GEOGRAPHY} highlightedId={2} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No visitor locations"
          preview={
            <WidgetShell className="max-w-sm">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="text-xs text-text-sub-600">Geography</div>
                  <div className="mt-1 text-2xl font-semibold text-text-strong-950">0</div>
                </div>
                <Button style="stroke" tone="neutral" size="xs">
                  Details
                </Button>
              </div>
              <div className="flex h-[224px] items-center justify-center rounded-lg border border-dashed border-stroke-soft-200 text-xs text-text-soft-400">
                No location data available.
              </div>
            </WidgetShell>
          }
          code={`<EmptyState text="No location data available." />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data", type: "LocationData[]", description: "Marker dataset. Each: id, lat/lng (here x/y normalized), count, country, demographics." },
            { name: "highlightedId", type: "number", description: "Currently selected marker id." },
            { name: "setHighlightedId", type: "(id: number) => void", description: "Selection setter." },
            { name: "location.country.flag", type: "string", description: "Path to flag SVG (or emoji here)." },
            { name: "location.demographics", type: "{ men; women; other }", description: "Percent breakdown." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Card shell with standard header (count + flag chip beside it).</li>
          <li>Ringed demographics pill: Men · Women · Other with percentages.</li>
          <li>Map canvas (224px). Dotted background + positioned markers.</li>
          <li>Active marker: 32px primary-alpha halo + 20px primary core + white inner + primary center.</li>
          <li>Inactive markers: greyscale (stroke + white + soft) clickable.</li>
          <li>Zoom +/- controls (CompactButton) bottom-left, recenter button bottom-right when panned.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ---------------- helpers ---------------- */

function WidgetShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative flex w-full flex-col gap-4 rounded-2xl bg-bg-white-0 p-5 shadow-sm ring-1 ring-inset ring-stroke-soft-200", className)}>
      {children}
    </div>
  )
}

function HeaderRow({ location }: { location: LocationData }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="text-xs text-text-sub-600">Geography</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-2xl font-semibold tracking-tight tabular-nums text-text-strong-950">
            {location.count.toLocaleString()}
          </div>
          <div className="flex h-6 items-center gap-1 rounded-md bg-bg-white-0 pl-1 pr-2 ring-1 ring-inset ring-stroke-soft-200">
            <span className="text-sm leading-none">{location.country.flag}</span>
            <span className="text-[10px] text-text-sub-600">{location.country.name}</span>
          </div>
        </div>
      </div>
      <Button style="stroke" tone="neutral" size="xs">
        Details
      </Button>
    </div>
  )
}

function DemographicsPill({ demographics }: { demographics: { men: number; women: number; other: number } }) {
  return (
    <div className="flex h-7 w-full items-center gap-[3px] rounded-lg bg-bg-white-0 px-1.5 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex-1 text-center text-[10px] text-text-soft-400">
        Men <span className="text-text-sub-600">{demographics.men}%</span>
      </div>
      <div className="text-[10px] text-text-disabled-300">·</div>
      <div className="flex-1 text-center text-[10px] text-text-soft-400">
        Women <span className="text-text-sub-600">{demographics.women}%</span>
      </div>
      <div className="text-[10px] text-text-disabled-300">·</div>
      <div className="flex-1 text-center text-[10px] text-text-soft-400">
        Other <span className="text-text-sub-600">{demographics.other}%</span>
      </div>
    </div>
  )
}

function MapCanvas({
  data,
  highlightedId,
  setHighlightedId,
}: {
  data: LocationData[]
  highlightedId: number
  setHighlightedId?: (id: number) => void
}) {
  return (
    <div className="relative h-[224px] w-full overflow-hidden rounded-lg bg-bg-white-0">
      {/* Dotted Europe-ish canvas */}
      <DottedCanvas />
      {/* markers */}
      {data.map((loc) => {
        const isActive = loc.id === highlightedId
        const left = `${loc.x * 100}%`
        const top = `${loc.y * 100}%`
        return (
          <button
            key={loc.id}
            type="button"
            onClick={() => setHighlightedId?.(loc.id)}
            aria-label={`Select ${loc.country.name}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left, top }}
          >
            {isActive ? (
              <span className="relative flex items-center justify-center">
                <span className="absolute size-8 rounded-full bg-(--primary-alpha-24)" />
                <span className="absolute size-5 rounded-full bg-(--primary-base)" />
                <span className="absolute size-4 rounded-full bg-bg-white-0" />
                <span className="absolute size-2 rounded-full bg-(--primary-base)" />
              </span>
            ) : (
              <span className="relative flex items-center justify-center">
                <span className="absolute size-5 rounded-full bg-stroke-soft-200" />
                <span className="absolute size-4 rounded-full bg-bg-white-0" />
                <span className="absolute size-2 rounded-full bg-text-soft-400" />
              </span>
            )}
          </button>
        )
      })}
      {/* zoom controls */}
      <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-2">
        <CompactButton variant="stroke" aria-label="Zoom in">
          <RiAddLine />
        </CompactButton>
        <CompactButton variant="stroke" aria-label="Zoom out">
          <RiSubtractLine />
        </CompactButton>
      </div>
      <CompactButton variant="stroke" aria-label="Recenter map" className="absolute bottom-2 right-2 z-10">
        <RiExpandLeftRightLine />
      </CompactButton>
    </div>
  )
}

function DottedCanvas() {
  // 20×14 grid of dots, with a continent-ish silhouette mask via opacity.
  const cols = 24
  const rows = 14
  const dots: { cx: number; cy: number; on: boolean }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const xn = c / (cols - 1)
      const yn = r / (rows - 1)
      // crude Europe-ish silhouette
      const inEurope =
        xn > 0.32 && xn < 0.78 && yn > 0.18 && yn < 0.78 &&
        !(xn > 0.7 && yn < 0.32) && !(xn < 0.36 && yn > 0.6)
      dots.push({ cx: xn * 100, cy: yn * 100, on: inEurope })
    }
  }
  return (
    <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.on ? 0.5 : 0.3} fill="hsl(var(--stroke-soft-200))" opacity={d.on ? 1 : 0.35} />
      ))}
    </svg>
  )
}
