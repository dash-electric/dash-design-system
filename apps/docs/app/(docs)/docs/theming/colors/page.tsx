"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { cn } from "@/registry/dash/lib/utils"

const SCALES = [
  { name: "gray",   chart: false },
  { name: "slate",  chart: false },
  { name: "blue",   chart: false },
  { name: "orange", chart: false },
  { name: "red",    chart: false },
  { name: "green",  chart: false },
  { name: "yellow", chart: false },
  { name: "purple", chart: false },
  { name: "sky",    chart: false },
  { name: "pink",   chart: true },
  { name: "teal",   chart: true },
] as const

const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const
const ALPHAS = ["alpha-24", "alpha-16", "alpha-10"] as const

function Swatch({ token }: { token: string }) {
  const [copied, setCopied] = React.useState(false)
  const onClick = () => {
    navigator.clipboard.writeText(`var(--${token})`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-stretch gap-1 text-left"
    >
      <div
        className={cn(
          "h-12 rounded-md border border-stroke-soft-200",
          copied && "ring-2 ring-(--dash-purple-500)",
        )}
        style={{ background: `var(--${token})` }}
      />
      <div className="text-[10px] text-text-soft-400 truncate group-hover:text-text-strong-950">
        {copied ? "Copied!" : token.replace(/^dash-/, "")}
      </div>
    </button>
  )
}

export default function ColorsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Theming"
        title="Colors"
        description="Full swatch reference for all 11 Dash color scales. ~130 swatches total. Click any swatch to copy its var() reference to the clipboard."
      />

      <DocsSection
        title="Usage"
        description="Prefer semantic tokens (bg-bg-weak-50, text-text-sub-600). Reach for raw scales only for chart series, illustrations, or one-off marketing."
      >
        <DocsCode
          language="tsx"
          code={`<div className="bg-(--dash-purple-100) text-(--dash-purple-900)">
  Phase7 callout
</div>`}
        />
      </DocsSection>

      {SCALES.map((scale) => (
        <DocsSection
          key={scale.name}
          id={`scale-${scale.name}`}
          title={
            <span className="flex items-baseline gap-3">
              <span className="capitalize">{scale.name}</span>
              {scale.chart ? (
                <span className="text-[10px] uppercase tracking-widest text-text-soft-400 rounded-full border border-stroke-soft-200 px-2 py-0.5">
                  chart only
                </span>
              ) : null}
            </span>
          }
        >
          <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
            {SHADES.map((shade) => (
              <Swatch key={shade} token={`dash-${scale.name}-${shade}`} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {ALPHAS.map((a) => (
              <Swatch key={a} token={`dash-${scale.name}-${a}`} />
            ))}
          </div>
        </DocsSection>
      ))}

      <DocsSection
        title="Static + overlay"
        description="Static colors don&apos;t flip on dark mode. Overlays are alpha layers for scrims (modals, drawers)."
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Swatch token="static-black" />
          <Swatch token="static-white" />
          <Swatch token="overlay-gray" />
          <Swatch token="overlay" />
        </div>
      </DocsSection>
    </DocsPageShell>
  )
}
