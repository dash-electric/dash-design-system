"use client"

import * as React from "react"
import { RiArrowDownSLine as ChevronDown } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Major Expenses widget — Figma 1:1 (re-verified 2026-05-19).
 *
 *   3963:5214    Major Expenses — loaded (3 horizontal bars Housing / Utilities / Food
 *                + Weekly dropdown + 0/2k/4k/6k/8k/10k X-axis).
 *   3963:11640   Major Expenses — empty (header row only, ghosted bars + axis labels).
 *
 * Real Figma anatomy: title + range dropdown header; 3 rows (label + bar + amount)
 * with shared horizontal axis underneath. Empty state keeps the axis + ghosted
 * labels but renders no amount tags.
 */

const COLORS = {
  housing: "#3F6FFF",
  utilities: "#5BC0EB",
  food: "#7C3AED",
}

const RANGES = ["Weekly", "Monthly", "Quarterly", "Yearly"] as const
type Range = (typeof RANGES)[number]

const DATA_BY_RANGE: Record<Range, { housing: number; utilities: number; food: number }> = {
  Weekly: { housing: 220, utilities: 95, food: 60 },
  Monthly: { housing: 950, utilities: 420, food: 260 },
  Quarterly: { housing: 2800, utilities: 1100, food: 780 },
  Yearly: { housing: 11200, utilities: 4138, food: 3120 },
}

export default function MajorExpensesWidgetPage() {
  const [range, setRange] = React.useState<Range>("Weekly")
  const data = DATA_BY_RANGE[range]
  const max = Math.max(data.housing, data.utilities, data.food)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Major Expenses"
        description="Top spending categories widget — range dropdown + horizontal stacked bars for the three largest expense categories (Housing / Utilities / Food)."
      />

      <DocsSection title="Loaded">
        <DocsExample
          title="Range dropdown + bars"
          preview={
            <WidgetShell
              title="Major Expenses"
              range={range}
              onRangeChange={setRange}
              className="max-w-md"
            >
              <ExpenseBars data={data} max={max} />
            </WidgetShell>
          }
          code={`<WidgetShell title="Major Expenses" range={range} onRangeChange={setRange}>
  <ExpenseBars data={data} />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Empty">
        <DocsExample
          title="Ghosted bars (no data)"
          preview={
            <WidgetShell title="Major Expenses" range="Weekly" onRangeChange={() => {}} className="max-w-md">
              <ExpenseBarsEmpty />
            </WidgetShell>
          }
          code={`<WidgetShell title="Major Expenses" range="Weekly">
  <ExpenseBarsEmpty />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Range variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Bars scale with the selected range. The widest bar is always 100% of the available track; smaller bars are scaled proportionally.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RANGES.map((r) => {
            const d = DATA_BY_RANGE[r]
            const m = Math.max(d.housing, d.utilities, d.food)
            return (
              <WidgetShell key={r} title="Major Expenses" range={r} onRangeChange={() => {}}>
                <ExpenseBars data={d} max={m} />
              </WidgetShell>
            )
          })}
        </div>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "range", type: '"Weekly" | "Monthly" | "Quarterly" | "Yearly"', defaultValue: '"Weekly"', description: "Active period." },
            { name: "onRangeChange", type: "(r: Range) => void", description: "Range selector callback." },
            { name: "data", type: "{ housing: number; utilities: number; food: number }", description: "Spend per category in account currency." },
            { name: "max", type: "number", description: "Reference value to normalize bar widths (typically max of the three)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Card shell with title left + range dropdown trigger right (stroke button with ChevronDown).</li>
          <li>Three rows, one per category: 64px label + flexible track + amount.</li>
          <li>Each bar uses its category color from the 3-color stack legend (Housing blue, Utilities cyan, Food purple).</li>
          <li>Bar width = value / max, clamped to a 6px height pill.</li>
          <li>Empty state replaces bars with muted icon + categorize CTA.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function WidgetShell({
  title,
  range,
  onRangeChange,
  children,
  className,
}: {
  title: React.ReactNode
  range?: Range
  onRangeChange?: (r: Range) => void
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-3", className)}>
      <div className="flex items-center gap-2 relative">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {range && onRangeChange ? (
          <div className="relative">
            <Button
              style="stroke"
              tone="neutral"
              size="xs"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              {range}
              <ChevronDown className="size-3" />
            </Button>
            {open ? (
              <ul
                role="listbox"
                className="absolute right-0 top-full mt-1 z-10 min-w-[8rem] rounded-lg border border-stroke-soft-200 bg-bg-white-0 shadow-md p-1 text-xs"
              >
                {RANGES.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={r === range}
                      onClick={() => {
                        onRangeChange(r)
                        setOpen(false)
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded hover:bg-bg-weak-50",
                        r === range && "font-medium text-text-strong-950",
                      )}
                    >
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <LinkButton size="sm">See All</LinkButton>
        )}
      </div>
      {children}
    </div>
  )
}

function ExpenseBars({
  data,
  max,
}: {
  data: { housing: number; utilities: number; food: number }
  max: number
}) {
  const rows: Array<{ label: string; key: keyof typeof data; color: string }> = [
    { label: "Housing", key: "housing", color: COLORS.housing },
    { label: "Utilities", key: "utilities", color: COLORS.utilities },
    { label: "Food", key: "food", color: COLORS.food },
  ]
  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const val = data[r.key]
        const pct = Math.max(4, (val / max) * 100)
        return (
          <div key={r.key} className="flex items-center gap-2 text-xs">
            <div className="w-16 text-text-sub-600">{r.label}</div>
            <div className="flex-1 h-1.5 rounded-full bg-bg-weak-50">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: r.color }}
                aria-label={`${r.label} ${fmt(val)}`}
              />
            </div>
            <div className="w-16 text-right tabular-nums font-medium text-text-strong-950">
              {fmt(val)}
            </div>
          </div>
        )
      })}
      <AxisLabels />
    </div>
  )
}

function ExpenseBarsEmpty() {
  const labels = ["Housing", "Utilities", "Food"]
  return (
    <div className="space-y-2 opacity-60">
      {labels.map((l) => (
        <div key={l} className="flex items-center gap-2 text-xs">
          <div className="w-16 text-text-soft-400">{l}</div>
          <div className="size-4 rounded-sm bg-bg-soft-200" aria-hidden />
          <div className="flex-1" />
        </div>
      ))}
      <AxisLabels />
    </div>
  )
}

function AxisLabels() {
  const ticks = ["0", "2k", "4k", "6k", "8k", "10k"]
  return (
    <div className="grid grid-cols-6 pt-1 text-[10px] text-text-soft-400 tabular-nums pl-[4.5rem]">
      {ticks.map((t, i) => (
        <span key={t} className={i === ticks.length - 1 ? "text-right" : ""}>
          {t}
        </span>
      ))}
    </div>
  )
}
