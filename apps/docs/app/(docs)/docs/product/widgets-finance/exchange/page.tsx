"use client"

import * as React from "react"
import { RiRefreshLine, RiArrowLeftRightLine } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Finance Widget — Exchange. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-exchange.tsx
 *
 * Source data: AMOUNT=100, AVAILABLE_BALANCE=16058.94 USD.
 * Rates: USD→EUR 0.94 · USD→TRY 28.5 · USD→JPY 149.5 (and inverses).
 * Tax 2%, Exchange fee 1%, both deducted from `convertedAmount`.
 */

const RATES = {
  USD: { EUR: 0.94, TRY: 28.5, JPY: 149.5, USD: 1 },
  EUR: { USD: 1.06, TRY: 30.3, JPY: 159, EUR: 1 },
  TRY: { USD: 0.035, EUR: 0.033, JPY: 5.24, TRY: 1 },
  JPY: { USD: 0.0067, EUR: 0.0063, TRY: 0.19, JPY: 1 },
} as const

type Code = keyof typeof RATES

const AMOUNT = 100
const AVAILABLE_USD = 16058.94

export default function FinanceExchangeWidgetPage() {
  const [from, setFrom] = React.useState<Code>("USD")
  const [to, setTo] = React.useState<Code>("EUR")

  const rate = RATES[from][to]
  const converted = AMOUNT * rate
  const availableInFrom = AVAILABLE_USD * RATES.USD[from]
  const tax = converted * 0.02
  const fee = converted * 0.01
  const total = converted - tax - fee

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  const fmt = (v: number, code: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(v)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="Exchange"
        description="Pair-based currency exchange widget. Source ships USD/EUR/TRY/JPY with a swap button, rate strip, tax (2%) + fee (1%) line items, and a stroked Exchange CTA."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="USD → EUR (live state)"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiRefreshLine className="size-4 text-icon-sub-600" /> Exchange</>}
                action={<Button tone="neutral" style="stroke" size="xs">Currencies</Button>}
              >
                <div className="rounded-xl bg-bg-white-0">
                  {/* Pair row */}
                  <div className="flex items-center gap-4 rounded-t-xl p-2 ring-1 ring-inset ring-stroke-soft-200">
                    <CurrencyChip value={from} onChange={setFrom} />
                    <span className="h-6 w-px bg-stroke-soft-200" />
                    <CompactButton variant="ghost" size="md" onClick={swap} aria-label="Swap currencies">
                      <RiArrowLeftRightLine />
                    </CompactButton>
                    <span className="h-6 w-px bg-stroke-soft-200" />
                    <CurrencyChip value={to} onChange={setTo} />
                  </div>
                  {/* Amount */}
                  <div className="flex flex-col items-center gap-1 border-x border-stroke-soft-200 p-4 text-center">
                    <div className="text-2xl font-medium tabular-nums">{fmt(AMOUNT, from)}</div>
                    <div className="text-xs text-text-sub-600">
                      Available:{" "}
                      <span className="text-text-strong-950 font-medium tabular-nums">
                        {fmt(availableInFrom, from)}
                      </span>
                    </div>
                  </div>
                  {/* Rate strip */}
                  <div className="rounded-b-xl bg-bg-weak-50 py-1.5 ring-1 ring-inset ring-stroke-soft-200 text-center text-xs text-text-sub-600">
                    1 {from} = <span className="text-text-strong-950 font-medium">{rate.toFixed(2)} {to}</span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="mt-4 flex flex-col gap-2.5">
                  <Row label="Tax (2%)" value={fmt(tax, to)} />
                  <Row label="Exchange fee (1%)" value={fmt(fee, to)} />
                  <Row label="Total amount" value={fmt(total, to)} strong />
                </div>

                <Button tone="neutral" style="stroke" size="sm" className="mt-4 w-full">
                  <RiRefreshLine /> Exchange
                </Button>
              </WidgetShell>
            </div>
          }
          code={`<Exchange from="USD" to="EUR" amount={100} available={16058.94} tax={0.02} fee={0.01} />`}
        />
      </DocsSection>

      <DocsSection title="Rate matrix">
        <DocsExample
          title="USD / EUR / TRY / JPY"
          preview={
            <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
              <table className="w-full text-sm tabular-nums">
                <thead className="bg-bg-weak-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-text-soft-400">From / To</th>
                    {(["USD", "EUR", "TRY", "JPY"] as Code[]).map((c) => (
                      <th key={c} className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-text-soft-400">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-soft-200">
                  {(["USD", "EUR", "TRY", "JPY"] as Code[]).map((a) => (
                    <tr key={a}>
                      <td className="px-3 py-2 font-medium">{a}</td>
                      {(["USD", "EUR", "TRY", "JPY"] as Code[]).map((b) => (
                        <td key={b} className="px-3 py-2 text-right text-text-sub-600">{RATES[a][b]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          code={`const RATES = {
  USD: { EUR: 0.94, TRY: 28.5, JPY: 149.5 },
  EUR: { USD: 1.06, TRY: 30.3, JPY: 159 },
  TRY: { USD: 0.035, EUR: 0.033, JPY: 5.24 },
  JPY: { USD: 0.0067, EUR: 0.0063, TRY: 0.19 },
}`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="Unavailable"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiRefreshLine className="size-4 text-icon-sub-600" /> Exchange</>}
                action={<Button tone="neutral" style="stroke" size="xs" disabled>Currencies</Button>}
              >
                <Divider />
                <div className="flex h-[260px] flex-col items-center justify-center gap-3 p-6">
                  <RiRefreshLine className="size-10 text-icon-soft-400" />
                  <p className="text-center text-sm text-text-soft-400">Exchange feature is unavailable now. Please check back later.</p>
                  <Button tone="neutral" style="stroke" size="xs">Refresh</Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<ExchangeEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "from", type: '"USD" | "EUR" | "TRY" | "JPY"', defaultValue: '"USD"', description: "Source currency code." },
            { name: "to", type: "Code", defaultValue: '"EUR"', description: "Destination currency code." },
            { name: "amount", type: "number", defaultValue: "100", description: "Source amount to convert." },
            { name: "available", type: "number", defaultValue: "16058.94", description: "Wallet balance, displayed in the source currency." },
            { name: "tax", type: "number", defaultValue: "0.02", description: "Tax %, displayed and deducted from converted." },
            { name: "fee", type: "number", defaultValue: "0.01", description: "Exchange fee %." },
            { name: "onSwap", type: "() => void", description: "Swap from/to." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Pair row</strong> — left chip + 1px divider + ghost CompactButton swap icon + 1px divider + right chip.</li>
          <li><strong>Amount block</strong> — title-h4 amount + 1-line Available row with tabular numerics.</li>
          <li><strong>Rate strip</strong> — bg-weak-50 footer band with <code>1 from = X to</code>.</li>
          <li><strong>Breakdown</strong> — 3 rows: Tax (2%), Exchange fee (1%), Total amount.</li>
          <li><strong>CTA</strong> — neutral stroke small button, full width, leading refresh icon.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function WidgetShell({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2 min-h-8 mb-3">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function CurrencyChip({ value, onChange }: { value: Code; onChange: (c: Code) => void }) {
  const codes: Code[] = ["USD", "EUR", "TRY", "JPY"]
  return (
    <label className="flex flex-1 items-center gap-2">
      <span className="inline-block size-5 rounded-full bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200 text-[8px] flex items-center justify-center font-bold text-text-sub-600">
        {value.slice(0, 2)}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Code)}
        className="flex-1 bg-transparent text-sm font-medium outline-none"
      >
        {codes.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </label>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-text-sub-600">{label}</span>
      <span className={cn("text-xs tabular-nums", strong && "font-medium text-text-strong-950")}>{value}</span>
    </div>
  )
}
