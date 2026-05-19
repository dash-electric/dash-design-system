"use client"

import * as React from "react"
import {
  RiExchange2Line as ExchangeIcon,
  RiArrowDownSLine as ChevronDown,
  RiArrowLeftRightLine as Swap,
  RiRefreshLine as Refresh,
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
 * Exchange widget — Figma 1:1 (2 nodes verified 2026-05-19).
 *
 *   3918:45941   Exchange — loaded (dual currency pill + amount + rate line + fee breakdown + CTA)
 *   3963:9828    Exchange — empty (no currency pair linked)
 *
 * Real Figma anatomy: header "Exchange" + "Currencies" stroke button. Body = two
 * currency pills (flag + code + chevron) split by horizontal swap arrows, big
 * amount headline + Available subtitle, rate row "1 USD = 0.94 EUR", Tax /
 * Exchange fee / Total amount line items, full-width "Exchange" CTA.
 */

type Currency = { code: string; flag: string }

export default function ExchangeWidgetPage() {
  const [amount, setAmount] = React.useState("100.00")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Exchange"
        description="Bi-directional currency swap card — dual currency pill selectors split by a swap action, big amount headline against an available-balance subtitle, live rate line, fee breakdown, and Exchange CTA. Empty state covers the unlinked-pair case."
      />

      <DocsSection title="Loaded state — USD → EUR">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default render — $100.00 from USD into EUR. Rate, tax (2%), exchange fee (1%), and total amount recompute
          live against the entered amount.
        </p>
        <DocsExample
          title="Full widget"
          preview={
            <div className="max-w-sm">
              <ExchangeLoaded amount={amount} onAmountChange={setAmount} />
            </div>
          }
          code={`<Exchange from="USD" to="EUR" amount="100.00" rate={0.94} taxPct={2} feePct={1} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Renders when no currency pair is linked. Header CTA stays interactive; body swaps to illustration +
          Link Pair stroke CTA.
        </p>
        <DocsExample
          title="No currency pair linked"
          preview={
            <div className="max-w-sm">
              <ExchangeEmpty />
            </div>
          }
          code={`<Exchange state="empty" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "from", type: "Currency", defaultValue: '{ code: "USD", flag: "🇺🇸" }', description: "Source currency rendered in the left pill." },
            { name: "to", type: "Currency", defaultValue: '{ code: "EUR", flag: "🇪🇺" }', description: "Target currency rendered in the right pill." },
            { name: "amount", type: "string", description: "Controlled amount value (string for input fidelity)." },
            { name: "available", type: "string", defaultValue: '"$16,058.94"', description: "Subtitle line under the headline." },
            { name: "rate", type: "number", defaultValue: "0.94", description: "Conversion rate — used to compute the total amount." },
            { name: "taxPct", type: "number", defaultValue: "2", description: "Tax percent applied on the amount." },
            { name: "feePct", type: "number", defaultValue: "1", description: "Exchange fee percent applied on the amount." },
            { name: "onSwap", type: "() => void", description: "Fires when the central swap button is pressed." },
            { name: "onSubmit", type: "() => void", description: "Fires when the Exchange CTA is pressed." },
            { name: "state", type: '"loaded" | "empty"', defaultValue: '"loaded"', description: "Loaded shows the form; empty replaces body with illustration + Link CTA." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Header</strong> — title + refresh icon + Currencies stroke button.</li>
          <li><strong>Pair selector</strong> — left currency pill + central swap action + right currency pill.</li>
          <li><strong>Headline</strong> — large tabular-nums amount + Available subtitle.</li>
          <li><strong>Rate row</strong> — soft pill row "1 [from] = [rate] [to]".</li>
          <li><strong>Breakdown</strong> — Tax (n%) / Exchange fee (n%) / Total amount line items.</li>
          <li><strong>CTA</strong> — full-width Exchange button with refresh icon.</li>
          <li><strong>Empty</strong> — circular illustration + 2-line copy + Link Pair stroke button.</li>
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

function CurrencyPill({ code, flag }: Currency) {
  return (
    <button
      type="button"
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 h-9 px-3 text-sm font-medium text-text-strong-950"
    >
      <span className="text-base leading-none" aria-hidden>
        {flag}
      </span>
      {code}
      <ChevronDown className="size-3.5 text-text-soft-400" />
    </button>
  )
}

function ExchangeLoaded({
  amount,
  onAmountChange,
}: {
  amount: string
  onAmountChange: (v: string) => void
}) {
  const rate = 0.94
  const value = parseFloat(amount || "0")
  const tax = value * 0.02
  const fee = value * 0.01
  const total = (value - tax - fee) * rate

  return (
    <WidgetShell
      title={
        <>
          <Refresh className="size-4 text-icon-sub-600" />
          Exchange
        </>
      }
      trailing={
        <Button style="stroke" tone="neutral" size="xs">
          Currencies
        </Button>
      }
    >
      <div className="flex items-center gap-2">
        <CurrencyPill code="USD" flag="🇺🇸" />
        <span
          className="inline-flex size-9 items-center justify-center rounded-full bg-bg-weak-50 text-icon-sub-600"
          aria-hidden
        >
          <Swap className="size-3.5" />
        </span>
        <CurrencyPill code="EUR" flag="🇪🇺" />
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tabular-nums text-text-strong-950">$</span>
          <input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-24 bg-transparent text-3xl font-semibold tabular-nums text-text-strong-950 outline-none text-center"
            aria-label="Amount"
          />
        </div>
        <div className="text-xs text-text-sub-600">
          Available : <span className="text-text-strong-950 font-medium tabular-nums">$16,058.94</span>
        </div>
      </div>

      <div className="rounded-md bg-bg-weak-50 px-3 py-2 text-center text-xs text-text-sub-600">
        1 USD ={" "}
        <span className="text-text-strong-950 font-medium tabular-nums">{rate.toFixed(2)} EUR</span>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Tax (2%)</span>
          <span className="tabular-nums text-text-strong-950">${tax.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Exchange fee (1%)</span>
          <span className="tabular-nums text-text-strong-950">${fee.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-stroke-soft-200">
          <span className="text-text-sub-600">Total amount</span>
          <span className="tabular-nums font-medium text-text-strong-950">€{total.toFixed(2)}</span>
        </div>
      </div>

      <Button size="md" className="w-full">
        <Refresh className="size-4" />
        Exchange
      </Button>
    </WidgetShell>
  )
}

function ExchangeEmpty() {
  return (
    <WidgetShell
      title={
        <>
          <Refresh className="size-4 text-icon-sub-600" />
          Exchange
        </>
      }
      trailing={
        <Button style="stroke" tone="neutral" size="xs" disabled>
          Currencies
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <EmptyStateIllustration kind="exchange" />
        <div className="text-xs text-text-sub-600 max-w-[28ch] leading-relaxed">
          No exchange pair linked yet.
          <br />
          Connect a pair to start trading.
        </div>
        <Button style="stroke" tone="neutral" size="xs">
          Link Pair
        </Button>
      </div>
    </WidgetShell>
  )
}

type _UseCurrencyType = Currency
