"use client"

import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * EMV Chip glyph — Figma verified 2026-05-19 (10 color variants, 32×24 size).
 * Figma Color= names + node IDs:
 *   3027:8866 🤍 White    3027:8868 🩶 Gray    3027:8870 💜 Purple
 *   3027:8872 💔 Red      3027:8874 🧡 Orange  3027:8876 💛 Yellow
 *   3027:8878 💙 Blue     3027:8880 🩵 Teal    3027:8882 🩷 Pink
 *   3027:8884 💚 Green
 */

const SWATCHES: { color: string; name: string }[] = [
  { color: "#FFFFFF", name: "white" },
  { color: "#D1D5DB", name: "gray" },
  { color: "#A78BFA", name: "purple" },
  { color: "#FCA5A5", name: "red" },
  { color: "#FDBA74", name: "orange" },
  { color: "#FCD34D", name: "yellow" },
  { color: "#93C5FD", name: "blue" },
  { color: "#67E8F9", name: "teal" },
  { color: "#F9A8D4", name: "pink" },
  { color: "#86EFAC", name: "green" },
]

export default function EmvChipWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="EMV Chip"
        description="32 × 24 glyph used on bank-card surfaces. 10 color variants — pick the variant that contrasts the card background."
      />

      <DocsSection title="10 color variants">
        <DocsExample
          title="Full swatch grid"
          preview={
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-3xl">
              {SWATCHES.map((s) => (
                <div key={s.color} className="flex flex-col items-center gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3">
                  <ChipGlyph color={s.color} />
                  <div className="text-[10px] font-medium tracking-wide uppercase text-text-strong-950">
                    {s.name}
                  </div>
                  <div className="text-[10px] tabular-nums text-text-soft-400">{s.color}</div>
                </div>
              ))}
            </div>
          }
          code={`<ChipGlyph color="#7C3AED" />`}
        />
      </DocsSection>

      <DocsSection title="On card surfaces">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Use a warm fill (yellow / orange) on dark card surfaces and a light fill (white / gray) on light surfaces.
        </p>
        <DocsExample
          title="Light vs dark surface"
          preview={
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-bg-white-0 border border-stroke-soft-200 p-4">
                <ChipGlyph color="#FFFFFF" />
              </div>
              <div className="rounded-xl bg-bg-strong-950 p-4">
                <ChipGlyph color="#FBBF24" />
              </div>
            </div>
          }
          code={`<ChipGlyph color="#FFFFFF" />  // light surface
<ChipGlyph color="#FBBF24" />  // dark surface`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "color", type: "string", description: "Fill color in any CSS color form. Stroke is auto-derived (10-20% black overlay)." },
            { name: "className", type: "string", description: "Override default 32 × 24 sizing." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Outer rounded rect (4px corner) — fill color.</li>
          <li>Inner rect — 2px corner, transparent fill, 20% black stroke.</li>
          <li>Crosshair lines — divide the inner pad into 4 contacts.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function ChipGlyph({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={cn("size-8", className)} aria-hidden>
      <rect x="1" y="1" width="30" height="22" rx="4" fill={color} stroke="#000" strokeOpacity="0.1" />
      <rect x="6" y="6" width="20" height="12" rx="2" fill="none" stroke="#000" strokeOpacity="0.2" />
      <line x1="6" y1="12" x2="26" y2="12" stroke="#000" strokeOpacity="0.2" />
      <line x1="16" y1="6" x2="16" y2="18" stroke="#000" strokeOpacity="0.2" />
    </svg>
  )
}
