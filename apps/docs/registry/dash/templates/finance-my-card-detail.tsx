"use client"

import * as React from "react"
import { RiEyeLine as Eye, RiEqualizerLine as SlidersHorizontal, RiMoreLine as MoreHorizontal, RiArrowDownSLine as ArrowDownLeft, RiArrowRightUpLine as ArrowUpRight } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { cn } from "@/registry/dash/lib/utils"

/**
 * FinanceMyCardDetail — port of AlignUI Pro Figma frame
 * "My Card Detail [Finance & Banking]" (node 3965:44031).
 *
 * Structure:
 *  - Page header: "My Cards" + subtitle + period select + Move Money.
 *  - 2-column body:
 *      LEFT — card preview (gradient) + Unhide / Adjust Limit / More actions.
 *      RIGHT — info grid (Card Number / Expiry / CVC / Spending Limit).
 *  - Recent Transactions section: list with amount + date + See All link.
 *
 * Pixel parity is approximate; structural parity matches Figma.
 */

export type MyCardTransaction = {
  id: string
  title: string
  subtitle: string
  amount: number
  date: string
  direction: "in" | "out"
}

const defaultTransactions: MyCardTransaction[] = [
  { id: "t1", title: "Netflix Cashback", subtitle: "Cashback of September, 2023", amount: 36.24, date: "Sep 18", direction: "in" },
  { id: "t2", title: "Rental Income", subtitle: "Rental payment from Mr. Dudley.", amount: 800.0, date: "Sep 17", direction: "in" },
  { id: "t3", title: "Grocery Shopping", subtitle: "Purchase of monthly groceries.", amount: 84.14, date: "Sep 16", direction: "out" },
  { id: "t4", title: "Stock Dividend", subtitle: "Payment from stock investments.", amount: 1500.0, date: "Sep 15", direction: "in" },
  { id: "t5", title: "Electricity Bills", subtitle: "Payment for electricity bills.", amount: 72.32, date: "Sep 14", direction: "out" },
]

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)

export type FinanceMyCardDetailProps = {
  cardLabel?: string
  balance?: number
  cardLast4?: string
  expiry?: string
  spendingLimit?: number
  transactions?: MyCardTransaction[]
  className?: string
}

export function FinanceMyCardDetail({
  cardLabel = "Savings Card",
  balance = 16058.94,
  cardLast4 = "1234",
  expiry = "06/27",
  spendingLimit = 12000,
  transactions = defaultTransactions,
  className,
}: FinanceMyCardDetailProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Page header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            My Cards
          </h1>
          <p className="text-sm text-text-sub-600">
            Organize and access your payment cards.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="last-month">
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-week">Last week</SelectItem>
              <SelectItem value="last-month">Last month</SelectItem>
              <SelectItem value="last-quarter">Last quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button size="md">Move Money</Button>
        </div>
      </header>

      <Divider />

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-text-strong-950">Virtual Card</h2>
          <Badge appearance="lighter" status="success" size="sm">Active</Badge>
        </div>
        <Button style="ghost" tone="neutral" size="md">
          See all cards
        </Button>
      </div>

      {/* Body: card preview + info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        {/* Left — gradient preview */}
        <div className="relative overflow-hidden rounded-2xl p-5 text-static-white bg-gradient-to-br from-(--dash-purple-700) via-(--dash-purple-500) to-(--dash-purple-900) shadow-custom-md">
          <div className="flex items-start justify-between">
            <Badge appearance="lighter" status="success" size="sm">Active</Badge>
            <div className="size-8 rounded-full bg-static-white/15" aria-hidden />
          </div>
          <p className="mt-6 text-4xl font-semibold tabular-nums">{fmtUSD(balance)}</p>
          <p className="mt-0.5 text-sm opacity-80">{cardLabel}</p>
          <div className="mt-8 grid grid-cols-3 gap-2 text-[11px] opacity-90">
            <div>
              <p className="opacity-70">Card Number</p>
              <p className="tracking-wider">•••• {cardLast4}</p>
            </div>
            <div>
              <p className="opacity-70">Expiry</p>
              <p className="">{expiry}</p>
            </div>
            <div>
              <p className="opacity-70">CVC</p>
              <p className="">•••</p>
            </div>
          </div>
        </div>

        {/* Right — info grid + action row */}
        <div className="flex flex-col gap-5">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div className="flex justify-between gap-3 border-b border-stroke-soft-200 py-2">
              <dt className="text-sm text-text-sub-600">Card Number</dt>
              <dd className="text-sm text-text-strong-950">•••• {cardLast4}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-stroke-soft-200 py-2">
              <dt className="text-sm text-text-sub-600">Expiry Date</dt>
              <dd className="text-sm text-text-strong-950">{expiry}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-stroke-soft-200 py-2">
              <dt className="text-sm text-text-sub-600">CVC</dt>
              <dd className="text-sm text-text-strong-950">•••</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-stroke-soft-200 py-2">
              <dt className="text-sm text-text-sub-600">Spending Limit (Monthly)</dt>
              <dd className="text-sm font-medium text-text-strong-950 tabular-nums">
                {fmtUSD(spendingLimit)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-2">
            <Button style="stroke" tone="neutral" size="md">
              <Eye className="size-4" /> Unhide
            </Button>
            <Button style="stroke" tone="neutral" size="md">
              <SlidersHorizontal className="size-4" /> Adjust Limit
            </Button>
            <Button style="ghost" tone="neutral" size="md">
              <MoreHorizontal className="size-4" /> More
            </Button>
          </div>
        </div>
      </div>

      <Divider />

      {/* Recent transactions */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-strong-950">
            Recent Transactions
          </h3>
          <Button style="ghost" tone="neutral" size="md">See All Transactions</Button>
        </div>

        <ul className="divide-y divide-stroke-soft-200 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
          {transactions.map((t) => {
            const isIn = t.direction === "in"
            return (
              <li key={t.id} className="flex items-center gap-3 p-3">
                <span
                  aria-hidden
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-full",
                    isIn ? "bg-(--state-success-light) text-(--state-success-base)" : "bg-(--state-error-light) text-(--state-error-base)",
                  )}
                >
                  {isIn ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-strong-950 truncate">{t.title}</p>
                  <p className="text-xs text-text-sub-600 truncate">{t.subtitle}</p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      isIn ? "text-(--state-success-base)" : "text-text-strong-950",
                    )}
                  >
                    {isIn ? "+" : "-"}
                    {fmtUSD(t.amount)}
                  </p>
                  <p className="text-xs text-text-sub-600">{t.date}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
