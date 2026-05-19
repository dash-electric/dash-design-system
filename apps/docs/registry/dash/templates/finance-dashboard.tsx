"use client"

import * as React from "react"
import { RiEyeLine as Eye, RiEyeOffLine as EyeOff, RiMoreLine as MoreHorizontal, RiArrowRightLine as ArrowRight, RiArrowRightUpLine as ArrowUpRight, RiArrowDownSLine as ArrowDownLeft, RiCalendarLine as Calendar, RiSendPlaneLine as Send, RiArrowLeftRightLine as ArrowLeftRight } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Stat, StatLabel, StatValue, StatTrend } from "@/registry/dash/ui/stat"
import { Divider } from "@/registry/dash/ui/divider"
import { ProgressBar } from "@/registry/dash/ui/progress-bar"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/registry/dash/ui/select"
import { cn } from "@/registry/dash/lib/utils"

/**
 * FinanceDashboard — port of AlignUI Pro Figma frame
 * "Dashboard [Finance & Banking]" (node 3911:35680).
 *
 * Composition (structural parity):
 *  - Page header: greeting + period select + Schedule / Move Money CTAs.
 *  - 3-column grid:
 *      col-1 (cards): My Cards widget (virtual card preview + Adjust Limit),
 *                     Recent Transactions list (3 rows + See All link).
 *      col-2 (chart): Budget Overview — Income/Expenses/Scheduled stats +
 *                     12-month ghost bar chart.
 *      col-3 (mini):  Spending Summary (gauge + category list + week cap),
 *                     Exchange widget (USD→EUR fee breakdown + CTA).
 *
 * Pixel parity is approximate (Phase 5); structural parity matches Figma.
 */

export type FinanceTransaction = {
  id: string
  title: string
  subtitle: string
  amount: number
  direction: "in" | "out"
  date: string
}

export type FinanceSpendCategory = {
  label: string
  amount: number
  /** 0..1 share of weekly cap */
  share: number
  tone: "primary" | "information" | "success" | "warning" | "error"
}

export type FinanceDashboardProps = {
  userName?: string
  greeting?: string
  cardLabel?: string
  cardBalance?: number
  cardNumberLast4?: string
  cardExpiry?: string
  spendingLimit?: number
  income?: number
  incomeDelta?: number
  expenses?: number
  expensesDelta?: number
  scheduled?: number
  spendThisWeek?: number
  weeklyCap?: number
  spendCategories?: FinanceSpendCategory[]
  transactions?: FinanceTransaction[]
  exchangeFrom?: string
  exchangeTo?: string
  exchangeRate?: number
  exchangeAmount?: number
  exchangeAvailable?: number
  className?: string
}

const defaultTx: FinanceTransaction[] = [
  { id: "tx-01", title: "Netflix Cashback", subtitle: "Cashback of September, 2023", amount: 36.24, direction: "in", date: "Sep 18" },
  { id: "tx-02", title: "Rental Income", subtitle: "Rental payment from Mr. Dudley.", amount: 800, direction: "in", date: "Sep 17" },
  { id: "tx-03", title: "Grocery Shopping", subtitle: "Purchase of monthly groceries.", amount: 84.14, direction: "out", date: "Sep 16" },
]

const defaultCats: FinanceSpendCategory[] = [
  { label: "Shopping",  amount: 900, share: 0.45, tone: "primary" },
  { label: "Utilities", amount: 600, share: 0.30, tone: "information" },
  { label: "Others",    amount: 200, share: 0.10, tone: "warning" },
]

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)

export function FinanceDashboard({
  userName = "Arthur Taylor",
  greeting = "Welcome back to Apex",
  cardLabel = "Savings Card",
  cardBalance = 16058.94,
  cardNumberLast4 = "1234",
  cardExpiry = "06/27",
  spendingLimit = 12000,
  income = 96000,
  incomeDelta = 5,
  expenses = 24000,
  expensesDelta = -3,
  scheduled = 14000,
  spendThisWeek = 1800,
  weeklyCap = 2000,
  spendCategories = defaultCats,
  transactions = defaultTx,
  exchangeFrom = "USD",
  exchangeTo = "EUR",
  exchangeRate = 0.94,
  exchangeAmount = 100,
  exchangeAvailable = 16058.94,
  className,
}: FinanceDashboardProps) {
  const [hidden, setHidden] = React.useState(false)
  const weeklyPct = Math.min(100, Math.round((spendThisWeek / weeklyCap) * 100))
  const exchangeTax = exchangeAmount * 0.02
  const exchangeFee = exchangeAmount * 0.01
  const exchangeTotal = (exchangeAmount - exchangeTax - exchangeFee) * exchangeRate

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">{userName}</h1>
          <p className="text-sm text-text-sub-600">{greeting} 👋🏻</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="last-month">
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-week">Last week</SelectItem>
              <SelectItem value="last-month">Last month</SelectItem>
              <SelectItem value="last-quarter">Last quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button style="stroke" tone="neutral" size="md">
            <Calendar className="size-4" /> Schedule
          </Button>
          <Button size="md">
            <Send className="size-4" /> Move Money
          </Button>
        </div>
      </div>

      <Divider />

      {/* 3-col grid: col-1 cards+tx, col-2 budget chart, col-3 spending+exchange */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* COL 1 — My Cards + Recent Transactions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card padding="md">
            <CardContent className="p-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-strong-950">My Cards</h3>
                <Button style="ghost" tone="neutral" size="xs">
                  Add Card <ArrowRight className="size-4" />
                </Button>
              </div>
              <div className="relative overflow-hidden rounded-xl p-4 text-static-white bg-gradient-to-br from-(--dash-purple-700) via-(--dash-purple-500) to-(--dash-purple-900)">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge appearance="lighter" status="success" size="sm">Active</Badge>
                    <p className="mt-3 text-2xl font-semibold tabular-nums">
                      {hidden ? "••••••" : fmtUSD(cardBalance)}
                    </p>
                    <p className="mt-0.5 text-xs opacity-80">{cardLabel}</p>
                  </div>
                  <div className="size-8 rounded-full bg-static-white/15" aria-hidden />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 text-[11px] opacity-90">
                  <div>
                    <p className="opacity-70">Card Number</p>
                    <p className="tracking-wider">•••• {cardNumberLast4}</p>
                  </div>
                  <div>
                    <p className="opacity-70">Expiry</p>
                    <p className="">{cardExpiry}</p>
                  </div>
                  <div>
                    <p className="opacity-70">CVC</p>
                    <p className="">•••</p>
                  </div>
                </div>
              </div>
              <div className="text-xs text-text-sub-600">
                Spending Limit · <span className="font-semibold text-text-strong-950 tabular-nums">{fmtUSD(spendingLimit)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button style="stroke" tone="neutral" size="xs" onClick={() => setHidden((h) => !h)}>
                  {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  {hidden ? "Unhide" : "Hide"}
                </Button>
                <Button style="stroke" tone="neutral" size="xs">Adjust Limit</Button>
                <Button style="ghost" tone="neutral" size="xs" aria-label="More options">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card padding="md">
            <CardContent className="p-0 flex flex-col gap-3">
              <h3 className="text-base font-semibold text-text-strong-950">Recent Transactions</h3>
              <Divider />
              <ul className="flex flex-col">
                {transactions.map((tx) => (
                  <li key={tx.id} className="flex items-center gap-3 py-2">
                    <span
                      aria-hidden
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-full",
                        tx.direction === "in"
                          ? "bg-(--state-success-lighter) text-(--state-success-base)"
                          : "bg-(--state-error-lighter) text-(--state-error-base)",
                      )}
                    >
                      {tx.direction === "in" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-strong-950 truncate">{tx.title}</p>
                      <p className="text-xs text-text-sub-600 truncate">{tx.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          tx.direction === "in" ? "text-(--state-success-base)" : "text-text-strong-950",
                        )}
                      >
                        {tx.direction === "in" ? "+" : "-"}{fmtUSD(tx.amount)}
                      </p>
                      <p className="text-xs text-text-sub-600">{tx.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button style="ghost" tone="neutral" size="xs" className="self-start">
                See All Transactions <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* COL 2 — Budget Overview */}
        <div className="lg:col-span-5">
          <Card padding="md" className="h-full">
            <CardContent className="p-0 flex h-full flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-text-strong-950">Budget Overview</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-sub-600">
                    <LegendDot tone="primary" /> Income
                    <LegendDot tone="error" /> Expenses
                    <LegendDot tone="warning" /> Scheduled
                  </div>
                </div>
                <Badge appearance="stroke" status="neutral" size="sm">Last Year</Badge>
              </div>
              <Divider />
              <div className="grid grid-cols-3 gap-3">
                <Stat>
                  <StatLabel>INCOME</StatLabel>
                  <StatValue size="md">{fmtUSD(income)}</StatValue>
                  <StatTrend trend={incomeDelta >= 0 ? "up" : "down"}>
                    {incomeDelta >= 0 ? "+" : ""}{incomeDelta}%
                  </StatTrend>
                </Stat>
                <Stat>
                  <StatLabel>EXPENSES</StatLabel>
                  <StatValue size="md">{fmtUSD(expenses)}</StatValue>
                  <StatTrend trend={expensesDelta >= 0 ? "up" : "down"}>
                    {expensesDelta >= 0 ? "+" : ""}{expensesDelta}%
                  </StatTrend>
                </Stat>
                <Stat>
                  <StatLabel>SCHEDULED</StatLabel>
                  <StatValue size="md">{fmtUSD(scheduled)}</StatValue>
                  <StatTrend trend="neutral">—</StatTrend>
                </Stat>
              </div>
              <Divider />
              {/* Lightweight stacked bar ghost — no recharts dep for this widget */}
              <div className="flex flex-1 min-h-[160px] flex-col">
                <div className="flex-1 grid grid-cols-12 items-end gap-2">
                  {[8, 6, 9, 7, 10, 8, 11, 9, 12, 10, 13, 11].map((v, i) => (
                    <div key={i} className="flex flex-col justify-end gap-1">
                      <span className="rounded-sm bg-(--primary-base)" style={{ height: `${v * 6}px` }} />
                      <span className="rounded-sm bg-(--state-error-base)/60" style={{ height: `${(14 - v) * 3}px` }} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-12 text-[10px] text-text-soft-400 text-center">
                  {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((m, i) => (
                    <span key={`${m}-${i}`}>{m}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COL 3 — Spending Summary + Exchange */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card padding="md">
            <CardContent className="p-0 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold text-text-strong-950">Spending Summary</h3>
                <Badge appearance="stroke" status="neutral" size="sm">Last Week</Badge>
              </div>
              <Divider />
              <Stat>
                <StatLabel>SPEND</StatLabel>
                <StatValue size="lg">{fmtUSD(spendThisWeek)}</StatValue>
              </Stat>
              <ProgressBar value={weeklyPct} tone="primary" />
              <ul className="mt-1 flex flex-col gap-2">
                {spendCategories.map((c) => (
                  <li key={c.label} className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2 text-text-sub-600">
                      <LegendDot tone={c.tone} /> {c.label}
                    </span>
                    <span className="font-medium text-text-strong-950 tabular-nums">{fmtUSD(c.amount)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-text-sub-600">
                Your weekly spending limit is{" "}
                <span className="text-text-strong-950 font-medium">{fmtUSD(weeklyCap)}</span>.
              </p>
            </CardContent>
          </Card>

          <Card padding="md">
            <CardContent className="p-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-strong-950">Exchange</h3>
                <ArrowLeftRight className="size-4 text-text-soft-400" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wider text-text-sub-600">Currencies</p>
                <div className="flex items-center gap-2">
                  <Badge appearance="lighter" status="neutral" size="md">{exchangeFrom}</Badge>
                  <ArrowRight className="size-3 text-text-soft-400" />
                  <Badge appearance="lighter" status="neutral" size="md">{exchangeTo}</Badge>
                </div>
                <p className="text-xl font-semibold text-text-strong-950 tabular-nums">{fmtUSD(exchangeAmount)}</p>
                <p className="text-xs text-text-sub-600">Available: {fmtUSD(exchangeAvailable)}</p>
                <p className="text-xs text-text-sub-600">1 {exchangeFrom} = {exchangeRate} {exchangeTo}</p>
              </div>
              <Divider />
              <dl className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-text-sub-600">Tax (2%)</dt>
                  <dd className="tabular-nums text-text-strong-950">{fmtUSD(exchangeTax)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-sub-600">Exchange fee (1%)</dt>
                  <dd className="tabular-nums text-text-strong-950">{fmtUSD(exchangeFee)}</dd>
                </div>
                <div className="flex justify-between font-medium">
                  <dt className="text-text-strong-950">Total amount</dt>
                  <dd className="tabular-nums text-text-strong-950">€{exchangeTotal.toFixed(2)}</dd>
                </div>
              </dl>
              <Button size="md" className="w-full">Exchange</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User identity strip — mirrors Figma sidebar footer */}
      <Card padding="sm" className="bg-bg-weak-50/40">
        <CardContent className="p-0 flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback>
              {userName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-strong-950 truncate">{userName}</p>
            <p className="text-xs text-text-sub-600 truncate">
              {userName.toLowerCase().replace(" ", ".")}@alignui.com
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-text-soft-400">
            Apex · Finance & Banking
          </span>
        </CardContent>
      </Card>
    </div>
  )
}

function LegendDot({
  tone,
}: {
  tone: "primary" | "information" | "success" | "warning" | "error"
}) {
  const map = {
    primary: "bg-(--primary-base)",
    information: "bg-(--state-information-base)",
    success: "bg-(--state-success-base)",
    warning: "bg-(--state-warning-base)",
    error: "bg-(--state-error-base)",
  } as const
  return <span aria-hidden className={cn("inline-block size-2 rounded-full", map[tone])} />
}
