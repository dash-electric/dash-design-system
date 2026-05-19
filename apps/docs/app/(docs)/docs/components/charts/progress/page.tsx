"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * ProgressChart — striped/segmented progress bar.
 * Ported from AlignUI Marketing Template `components/progress-chart.tsx` (2026-05-18).
 *
 * Source mechanics:
 *   - Container measured via `useMeasure`; we mirror with a `ResizeObserver`.
 *   - "Variant A" (categories widget): 32px tall, 6px-wide pegs spaced every
 *     9px (`mask: linear-gradient(90deg, #000 6px, #0000 6px) repeat`).
 *     Progress width is snapped to the nearest 9px step so the fill always lands
 *     on a peg boundary.
 *   - "Variant B" (stock status): 24px tall, rounded 1px corners per peg,
 *     uses an inline SVG mask of a 5.625×24 rounded rect, step = 10px.
 */

type ProgressChartProps = {
  value: number
  className?: string
}

type ProgressChartStockStatusProps = {
  value: number
  max?: number
  className?: string
}

function useMeasureWidth() {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = React.useState(0)
  React.useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width)
    })
    obs.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => obs.disconnect()
  }, [])
  return { ref, width }
}

function ProgressChart({ value, className }: ProgressChartProps) {
  const { ref, width } = useMeasureWidth()
  const computedWidth = width ? Math.round(width / 9) * 9 : 0
  const computedProgress = width ? Math.round(((value / 100) * width) / 9) * 9 : 0

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div
        className="relative h-8 w-full bg-bg-soft-200"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, #000 6px, #0000 6px)",
          maskImage: "linear-gradient(90deg, #000 6px, #0000 6px)",
          WebkitMaskSize: "9px 100%",
          maskSize: "9px 100%",
          WebkitMaskRepeat: "space",
          maskRepeat: "space",
          backgroundPosition: "0 0",
          width: computedWidth || undefined,
        }}
      >
        <div className="h-full" style={{ width: `${computedProgress}px`, clipPath: "inset(0)" }}>
          <div className="absolute inset-0 bg-(--primary-base)" />
        </div>
      </div>
    </div>
  )
}

function ProgressChartStockStatus({ value, max = 100, className }: ProgressChartStockStatusProps) {
  const { ref, width } = useMeasureWidth()
  const computedWidth = width ? Math.round(width / 10) * 10 : 0
  const computedProgress = width ? Math.round(((value / max) * width) / 10) * 10 : 0

  const maskUrl =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='24' fill='none' viewBox='0 0 7 24'%3E%3Crect width='5.625' height='24' x='.625' fill='%23000' rx='1'/%3E%3C/svg%3E\")"

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div
        className="relative h-6 w-full bg-bg-soft-200"
        style={{
          WebkitMaskImage: maskUrl,
          maskImage: maskUrl,
          WebkitMaskSize: "10px 100%",
          maskSize: "10px 100%",
          WebkitMaskRepeat: "space",
          maskRepeat: "space",
          backgroundPosition: "0 0",
          width: computedWidth || undefined,
        }}
      >
        <div className="h-full" style={{ width: `${computedProgress}px`, clipPath: "inset(0)" }}>
          <div className="absolute inset-0 bg-(--primary-base)" />
        </div>
      </div>
    </div>
  )
}

export default function ProgressChartPage() {
  const [v, setV] = React.useState(58)
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Charts"
        title="Progress (segmented)"
        description="Striped progress bar — value snaps to the nearest peg so the fill always lands on a discrete boundary. Two variants: 32px categories, 24px stock-status."
        status="shipped"
      />

      <DocsSection title="Variant A — categories (32px)">
        <DocsExample
          title="Live value"
          description="Drag to feel the snap. Each peg is 6px wide on a 9px step; progress is rounded to the nearest 9px."
          preview={
            <div className="space-y-4 w-full max-w-md">
              <ProgressChart value={v} />
              <input
                type="range"
                min={0}
                max={100}
                value={v}
                onChange={(e) => setV(Number(e.target.value))}
                className="w-full"
                aria-label="progress value"
              />
              <div className="text-xs text-text-soft-400">value = {v}%</div>
            </div>
          }
          code={`<ProgressChart value={58} />`}
        />
      </DocsSection>

      <DocsSection title="Variant A — fixed values">
        <DocsExample
          title="0 / 25 / 50 / 75 / 100"
          preview={
            <div className="space-y-3 w-full max-w-md">
              {[0, 25, 50, 75, 100].map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <span className="w-10 text-xs text-text-soft-400 tabular-nums">{p}%</span>
                  <div className="flex-1">
                    <ProgressChart value={p} />
                  </div>
                </div>
              ))}
            </div>
          }
          code={`<ProgressChart value={25} />
<ProgressChart value={50} />
<ProgressChart value={75} />`}
        />
      </DocsSection>

      <DocsSection title="Variant B — stock status (24px, rounded pegs)">
        <DocsExample
          title="Stock progression"
          description="Uses an SVG mask for individually-rounded 5.625×24 pegs. Step = 10px."
          preview={
            <div className="space-y-3 w-full max-w-md">
              {[
                ["Low stock", 12],
                ["Moderate", 48],
                ["Healthy", 78],
                ["Overstocked", 96],
              ].map(([label, p]) => (
                <div key={label as string} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-text-soft-400">{label}</span>
                  <div className="flex-1">
                    <ProgressChartStockStatus value={p as number} />
                  </div>
                  <span className="w-10 text-right text-xs text-text-sub-600 tabular-nums">{p}%</span>
                </div>
              ))}
            </div>
          }
          code={`<ProgressChartStockStatus value={78} />`}
        />
      </DocsSection>

      <DocsSection title="Loading / empty">
        <DocsExample
          title="Empty (0%)"
          description="Bar renders the full peg row with zero fill — communicates the chart is live but value is 0."
          preview={
            <div className="w-full max-w-md">
              <ProgressChart value={0} />
            </div>
          }
          code={`<ProgressChart value={0} />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "number", description: "Current value. Variant A assumes 0–100; Variant B uses max." },
            { name: "max", type: "number", defaultValue: "100", description: "Variant B only — denominator for value/max ratio." },
            { name: "className", type: "string", description: "Forwarded to the outer wrapper for width overrides." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Container width is measured at runtime; peg count = floor(width / step).</li>
          <li>Variant A uses a CSS linear-gradient mask (6/3 split, 9px step).</li>
          <li>Variant B uses an inline SVG mask (rounded 1px rect, 10px step).</li>
          <li>Fill clip-path = <code>inset(0)</code> so the active region is solid <code>bg-(--primary-base)</code> beneath the peg mask.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
