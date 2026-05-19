"use client"

import * as React from "react"
import {
  RiArrowDownSLine as ChevronDown,
  RiPieChart2Line as PieIcon,
  RiShoppingBag3Line as Shopping,
  RiFileList3Line as Bill,
  RiCoinsLine as Coin,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"
import { EmptyStateIllustration } from "@/registry/dash/ui/empty-state-illustration"

/**
 * Spending Summary widget — Figma 1:1 (2 nodes verified 2026-05-19).
 *
 *   3917:45735   Spending Summary — loaded (gauge + total + 3 categories + hint)
 *   3963:9423    Spending Summary — empty ("No records of spendings yet")
 *
 * The 2-category variant below is a documentation-only density demo (not a separate
 * Figma frame) — same shell wired to fewer categories.
 */

const APEX_BLUE = "var(--primary-base)"
const APEX_CYAN = "#5BC0EB"

type Category = {
  key: string
  label: string
  amount: number
  icon: React.ElementType
  tint: string
  iconTint: string
}

const CATEGORIES: Category[] = [
  { key: "shopping", label: "Shopping", amount: 900, icon: Shopping, tint: "bg-(--primary-alpha-10)", iconTint: "text-(--primary-base)" },
  { key: "utilities", label: "Utilities", amount: 600, icon: Bill, tint: "bg-information-lighter", iconTint: "text-information-base" },
  { key: "others", label: "Others", amount: 200, icon: Coin, tint: "bg-bg-weak-50", iconTint: "text-text-soft-400" },
]

export default function SpendingSummaryWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Spending Summary"
        description="Periodic spend rollup — total headline, semi-arc gauge against weekly limit, and 2-3 category breakdown chips. Empty state replaces the body with an illustration + Add Category CTA when no transactions have been categorized."
      />

      <DocsSection title="Loaded state — 3 categories">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default render — $1,800 spent of $2,000 weekly limit (90% gauge fill). Three category tiles render with
          colored leading icons.
        </p>
        <DocsExample
          title="Full widget"
          preview={
            <div className="max-w-sm">
              <SpendingSummaryLoaded categories={CATEGORIES} total={1800} limit={2000} />
            </div>
          }
          code={`<SpendingSummary
  total={1800}
  limit={2000}
  categories={[
    { label: "Shopping", amount: 900 },
    { label: "Utilities", amount: 600 },
    { label: "Others", amount: 200 },
  ]}
/>`}
        />
      </DocsSection>

      <DocsSection title="Loaded state — 2 categories">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact variant — Food + Drinks only. Used in narrower dashboard columns where 3-tile grid would compress.
        </p>
        <DocsExample
          title="Food + Drinks"
          preview={
            <div className="max-w-sm">
              <SpendingSummaryLoaded
                total={860}
                limit={1200}
                categories={[
                  { key: "food", label: "Food", amount: 640, icon: Shopping, tint: "bg-(--primary-alpha-10)", iconTint: "text-(--primary-base)" },
                  { key: "drinks", label: "Drinks", amount: 220, icon: Coin, tint: "bg-information-lighter", iconTint: "text-information-base" },
                ]}
              />
            </div>
          }
          code={`<SpendingSummary
  total={860}
  limit={1200}
  categories={[
    { label: "Food", amount: 640 },
    { label: "Drinks", amount: 220 },
  ]}
/>`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Renders when no transactions have been categorized yet. Header period selector remains interactive; body
          swaps to illustration + Add Category CTA.
        </p>
        <DocsExample
          title="No spending tracked"
          preview={
            <div className="max-w-sm">
              <SpendingSummaryEmpty />
            </div>
          }
          code={`<SpendingSummary state="empty" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "total", type: "number", description: "Total spent in the current period." },
            { name: "limit", type: "number", description: "Period limit — drives the gauge fill ratio." },
            { name: "currency", type: "string", defaultValue: '"$"', description: "Currency prefix for headline + tiles." },
            { name: "period", type: '"Last Week" | "This Week" | "This Month"', defaultValue: '"Last Week"', description: "Header dropdown selection." },
            { name: "categories", type: "Category[]", description: "2 or 3 categorized buckets (label + amount + icon)." },
            { name: "state", type: '"loaded" | "empty"', defaultValue: '"loaded"', description: "Loaded renders gauge + tiles; empty swaps in the illustration." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Header</strong> — title + pie icon + period dropdown (stroke neutral xs).</li>
          <li><strong>Gauge</strong> — half-donut, soft track + primary fill, "SPEND" caption above the headline.</li>
          <li><strong>Headline</strong> — total spend rendered tabular-nums xl, centered under the gauge.</li>
          <li><strong>Category grid</strong> — 2 or 3 tiles, each with a tinted icon avatar + label + amount.</li>
          <li><strong>Hint footer</strong> — bordered row stating the period limit ("Your weekly spending limit is $2000").</li>
          <li><strong>Empty</strong> — circular illustration + 2-line copy + Add Category stroke button.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ---------------------------------------------------------------------------- */

function WidgetShell({
  title,
  trailing,
  children,
  className,
}: {
  title: React.ReactNode
  trailing?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-3",
        className,
      )}
    >
      <div className="flex items-center gap-2 pb-2 border-b border-stroke-soft-200">
        <div className="text-sm font-medium text-text-strong-950 flex-1 inline-flex items-center gap-1.5">
          {title}
        </div>
        {trailing}
      </div>
      {children}
    </div>
  )
}

function SpendingSummaryLoaded({
  total,
  limit,
  categories,
}: {
  total: number
  limit: number
  categories: Category[]
}) {
  const ratio = Math.min(total / limit, 1)
  // semi-arc: full arc length = π·r. We render two strokes (cyan tail + blue head).
  const r = 36
  const circ = Math.PI * r
  const fillLen = circ * ratio
  const split = fillLen * 0.78 // 78% main color, 22% accent tail

  return (
    <WidgetShell
      title={
        <>
          <PieIcon className="size-4 text-icon-sub-600" />
          Spending Summary
        </>
      }
      trailing={
        <Button style="stroke" tone="neutral" size="xs">
          Last Week
          <ChevronDown className="size-3" />
        </Button>
      }
    >
      {/* Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative h-24 w-48">
          <svg viewBox="0 0 100 56" className="w-full h-full">
            <path
              d="M10 50 A36 36 0 1 1 90 50"
              fill="none"
              stroke="#E5E5E5"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M10 50 A36 36 0 1 1 90 50"
              fill="none"
              stroke={APEX_BLUE}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${split} ${circ}`}
            />
            <path
              d="M10 50 A36 36 0 1 1 90 50"
              fill="none"
              stroke={APEX_CYAN}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${fillLen - split} ${circ}`}
              strokeDashoffset={-split}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
            <div className="text-[10px] uppercase tracking-wider text-text-soft-400">
              Spend
            </div>
            <div className="text-2xl font-semibold tabular-nums text-text-strong-950">
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div
        className={cn(
          "grid gap-2 pt-3 border-t border-stroke-soft-200",
          categories.length === 3 ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        {categories.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.key} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-full",
                  c.tint,
                )}
              >
                <Icon className={cn("size-4", c.iconTint)} />
              </span>
              <div className="text-[11px] text-text-sub-600">{c.label}</div>
              <div className="text-sm font-semibold tabular-nums text-text-strong-950">
                ${c.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Hint */}
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs text-text-sub-600">
        Your weekly spending limit is ${limit.toLocaleString()}.
      </div>
    </WidgetShell>
  )
}

function SpendingSummaryEmpty() {
  return (
    <WidgetShell
      title={
        <>
          <PieIcon className="size-4 text-icon-sub-600" />
          Spending Summary
        </>
      }
      trailing={null}
    >
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <EmptyStateIllustration kind="spending-summary" />
        <div className="text-xs text-text-sub-600 max-w-[28ch] leading-relaxed">
          No records of spendings yet.
          <br />
          Please check back later.
        </div>
      </div>
    </WidgetShell>
  )
}
