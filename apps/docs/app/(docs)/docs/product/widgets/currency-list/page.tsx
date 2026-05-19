"use client"

import * as React from "react"
import {
  RiArrowDownSLine as ChevronDown,
  RiArrowRightUpLine as ArrowUpRight,
  RiArrowRightDownLine as ArrowDownRight,
  RiSearchLine as Search,
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
 * Currency List widget — Figma 1:1 (re-verified 2026-05-19).
 *
 *   3927:3349    Currency List — loaded (USD base, search, 4 pair rows)
 *   3963:10268   Currency List — empty ("Currency list is unavailable now")
 *
 * Real Figma anatomy: header shows a base-currency dropdown ("🇺🇸 USD ⌄") instead of
 * a "See All" link, followed by a search input row, then a list of pair rows. Each
 * row = flag avatar + currency name + "1 [base] to [code]" subtitle + rate value +
 * signed % delta with up/down diagonal arrow. Empty state replaces body with
 * illustration + "Refresh" CTA (no Add Currency button in Figma).
 */

type CurrencyRow = {
  code: string
  flag: string
  name: string
  rate: string
  change: number
}

const ROWS_PRIMARY: CurrencyRow[] = [
  { code: "EUR", flag: "🇪🇺", name: "Euro", rate: "0.94", change: -0.44 },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar", rate: "1.35", change: 0.26 },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen", rate: "147.92", change: 0.0 },
  { code: "TRY", flag: "🇹🇷", name: "Turkish Lira", rate: "30.70", change: 1.42 },
]

const ROWS_SECONDARY: CurrencyRow[] = [
  { code: "GBP", flag: "🇬🇧", name: "British Pound", rate: "0.78", change: 0.32 },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar", rate: "1.52", change: 0.18 },
  { code: "CHF", flag: "🇨🇭", name: "Swiss Franc", rate: "0.88", change: -0.11 },
  { code: "BRL", flag: "🇧🇷", name: "Brazilian Real", rate: "5.34", change: -0.21 },
]

export default function CurrencyListWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Currency List"
        description="FX conversion watchlist — base-currency dropdown in the header, search input, and a list of pair rows. Each row shows flag, full name, '1 [base] to [code]' subtitle, current rate, and a signed % delta. Empty state covers the no-tracked-pairs case."
      />

      <DocsSection title="Loaded state — USD base">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default render — USD as the base currency, 4 watched pairs (EUR, CAD, JPY, TRY). Positive deltas render
          success-base with up-right arrow; negative deltas render error-base with down-right arrow.
        </p>
        <DocsExample
          title="USD → EUR · CAD · JPY · TRY"
          preview={
            <div className="max-w-sm">
              <CurrencyListLoaded base="USD" baseFlag="🇺🇸" rows={ROWS_PRIMARY} />
            </div>
          }
          code={`<CurrencyList
  base="USD"
  rows={[
    { code: "EUR", flag: "🇪🇺", name: "Euro", rate: "0.94", change: -0.44 },
    { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar", rate: "1.35", change: 0.26 },
    { code: "JPY", flag: "🇯🇵", name: "Japanese Yen", rate: "147.92", change: 0.0 },
    { code: "TRY", flag: "🇹🇷", name: "Turkish Lira", rate: "30.70", change: 1.42 },
  ]}
/>`}
        />
      </DocsSection>

      <DocsSection title="Loaded state — alternative pairs">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Same shell, different watchlist. Confirms 4-row density holds across content variations.
        </p>
        <DocsExample
          title="GBP · AUD · CHF · BRL"
          preview={
            <div className="max-w-sm">
              <CurrencyListLoaded base="USD" baseFlag="🇺🇸" rows={ROWS_SECONDARY} />
            </div>
          }
          code={`<CurrencyList base="USD" rows={[/* GBP, AUD, CHF, BRL */]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Renders when the FX feed is unavailable. Body swaps to illustration + Refresh CTA.
        </p>
        <DocsExample
          title="Currency list unavailable"
          preview={
            <div className="max-w-sm">
              <CurrencyListEmpty />
            </div>
          }
          code={`<CurrencyList state="empty" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "base", type: "string", defaultValue: '"USD"', description: "Base currency code rendered in the header dropdown and row subtitles." },
            { name: "baseFlag", type: "string", description: "Flag emoji shown next to the base-currency code in the header." },
            { name: "rows", type: "CurrencyRow[]", description: "Watchlist rows — { code, flag, name, rate, change }." },
            { name: "row.code", type: "string", description: "ISO code (used as React key + subtitle suffix)." },
            { name: "row.flag", type: "string", description: "Country flag emoji rendered at the row leading edge." },
            { name: "row.name", type: "string", description: "Full currency name shown as the row label." },
            { name: "row.rate", type: "string", description: "Pre-formatted rate value, tabular-nums." },
            { name: "row.change", type: "number", description: "Signed daily % delta — positive renders green, negative red." },
            { name: "state", type: '"loaded" | "empty"', defaultValue: '"loaded"', description: "Loaded renders the list; empty renders the illustration + Add Currency CTA." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Header</strong> — title left + base-currency pill (flag + code + chevron) on the right.</li>
          <li><strong>Search</strong> — full-width search input below header (icon affix + placeholder + shortcut hint).</li>
          <li><strong>Row</strong> — flag avatar + (name + "1 [base] to [code]" subtitle) + (rate + signed % chip).</li>
          <li><strong>Divider</strong> — soft 1px between rows (no divider on first or last edge).</li>
          <li><strong>Change chip</strong> — up-right arrow (success) or down-right arrow (error) + signed value.</li>
          <li><strong>Empty</strong> — circular illustration + "Currency list is unavailable" copy + Refresh stroke button.</li>
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
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1 inline-flex items-center gap-1.5">
          {title}
        </div>
        {trailing}
      </div>
      {children}
    </div>
  )
}

function BasePill({ base, flag }: { base: string; flag: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-xs font-medium text-text-strong-950"
    >
      <span className="text-base leading-none" aria-hidden>
        {flag}
      </span>
      {base}
      <ChevronDown className="size-3 text-text-soft-400" />
    </button>
  )
}

function CurrencyListLoaded({
  base,
  baseFlag,
  rows,
}: {
  base: string
  baseFlag: string
  rows: CurrencyRow[]
}) {
  return (
    <WidgetShell title="Currency List" trailing={<BasePill base={base} flag={baseFlag} />}>
      <div className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 h-9 text-xs text-text-soft-400">
        <Search className="size-3.5" aria-hidden />
        <span className="flex-1">Search...</span>
        <kbd className="rounded border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.5 text-[10px] text-text-sub-600">
          ⌘1
        </kbd>
      </div>

      <ul className="divide-y divide-stroke-soft-200">
        {rows.map((r) => {
          const positive = r.change >= 0
          const Arrow = positive ? ArrowUpRight : ArrowDownRight
          return (
            <li key={r.code} className="flex items-center gap-2.5 py-2.5">
              <span
                className="inline-flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 text-lg leading-none"
                aria-hidden
              >
                {r.flag}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-strong-950 truncate">
                  {r.name}
                </div>
                <div className="text-[11px] text-text-sub-600">
                  1 {base} to {r.code}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium tabular-nums text-text-strong-950">
                  {r.rate} {r.code}
                </div>
                <div
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[11px] tabular-nums font-medium",
                    positive ? "text-success-base" : "text-error-base",
                  )}
                >
                  <Arrow className="size-3" aria-hidden />
                  {positive ? "" : ""}
                  {r.change.toFixed(2)}%
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </WidgetShell>
  )
}

function CurrencyListEmpty() {
  return (
    <WidgetShell title="Currency List" trailing={<BasePill base="USD" flag="🇺🇸" />}>
      <div className="flex flex-col items-center gap-3 py-8 text-center border-t border-stroke-soft-200 pt-6">
        <EmptyStateIllustration kind="currency-list" />
        <div className="text-xs text-text-sub-600 max-w-[28ch] leading-relaxed">
          Currency list is unavailable now.
          <br />
          Please check back later.
        </div>
        <Button style="stroke" tone="neutral" size="xs">
          Refresh
        </Button>
      </div>
    </WidgetShell>
  )
}
