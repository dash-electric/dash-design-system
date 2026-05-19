"use client"

/**
 * Finance Widgets — Dash block bundle.
 *
 * Figma parity: Widgets [Finance & Banking] [1.1] — id 3963:7181.
 * Ported 6 most-common widget patterns:
 *   - <MyCardsWidget />            (Type=💳 My Cards)
 *   - <RecentTransactionsWidget /> (Type=⏳ Recent Transactions)
 *   - <TotalBalanceWidget />       (Type=💰 Total Balance)
 *   - <QuickTransferWidget />      (Type=🛫 Quick Transfer)
 *   - <BudgetOverviewWidget />     (Type=📊 Budget Overview)
 *   - <MySubscriptionsWidget />    (Type=🔖 My Subscriptions)
 */

import * as React from "react"
import { RiAddLine as Plus, RiBankCardLine as CreditCard, RiArrowRightUpLine as ArrowUpRight, RiArrowDownSLine as ArrowDownLeft, RiSettings4Line as Settings2, RiMusicLine as Music2, RiTvLine as Tv, RiPlayCircleLine as PlayCircle } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Badge, StatusBadge } from "@/registry/dash/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

function WidgetHeader({
  title,
  action,
  onAction,
  actionLabel = "See All",
}: {
  title: React.ReactNode
  action?: React.ReactNode
  onAction?: () => void
  actionLabel?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-label-medium text-text-strong-950">{title}</h3>
      {action ?? (
        <button
          type="button"
          onClick={onAction}
          className="text-label-small text-text-sub-600 hover:text-text-strong-950"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  My Cards                                                                   */
/* -------------------------------------------------------------------------- */

export function MyCardsWidget({
  cardLabel = "Savings Card",
  balance = 16058.94,
  spendingLimit = 1500,
  period = "week",
  className,
  onAdd,
}: {
  cardLabel?: string
  balance?: number
  spendingLimit?: number
  period?: "day" | "week" | "month"
  className?: string
  onAdd?: () => void
}) {
  const periodMap = { day: "Daily", week: "Weekly", month: "Monthly" } as const
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label-medium text-text-strong-950">My Cards</h3>
          <Button tone="primary" style="ghost" size="xs" onClick={onAdd}>
            <Plus /> Add Card
          </Button>
        </div>

        <div className="relative aspect-[1.6/1] w-full rounded-2xl bg-gradient-to-br from-(--dash-purple-700) to-(--dash-purple-900) p-4 text-text-white-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <Badge appearance="lighter" status="success" className="bg-white/15 text-text-white-0 border-white/20">
                Active
              </Badge>
              <CreditCard className="size-6 opacity-80" />
            </div>
            <div>
              <div className="text-xs opacity-70">{cardLabel}</div>
              <div className="text-2xl font-medium tabular-nums mt-0.5">{usd(balance)}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-bg-weak-50 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-label-x-small uppercase tracking-wider text-text-soft-400">Spending Limit</span>
            <span className="text-label-small text-text-strong-950 tabular-nums">
              {usd(spendingLimit)} <span className="text-text-soft-400">/ {period}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Recent Transactions                                                        */
/* -------------------------------------------------------------------------- */

export type Transaction = {
  id: string
  title: string
  subtitle?: string
  amount: number
  date: string
  direction: "in" | "out"
  status?: "pending" | "complete"
}

const txDefaults: Transaction[] = [
  { id: "tx1", title: "Salary Deposit",   subtitle: "Monthly salary from Apex Finance", amount: 3500,   date: "Sep 18", direction: "in" },
  { id: "tx2", title: "Stock Dividend",   subtitle: "Payment from stock investments.",  amount: 846.14, date: "Sep 17", direction: "in" },
  { id: "tx3", title: "Rental Income",    subtitle: "Rental payment from Mr. Dudley.",  amount: 100,    date: "Sep 17", direction: "in" },
  { id: "tx4", title: "Refund from Amazon", subtitle: "Refund of Order No #124235",     amount: 36.24,  date: "Sep 15", direction: "in" },
]

export function RecentTransactionsWidget({
  transactions = txDefaults,
  className,
}: {
  transactions?: Transaction[]
  className?: string
}) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <WidgetHeader title="Recent Transactions" />
        <Tabs defaultValue="incoming">
          <TabsList>
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          <TabsContent value="incoming" className="mt-3">
            <ul className="divide-y divide-stroke-soft-200">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <div className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    t.direction === "in"
                      ? "bg-(--state-success-lighter) text-(--state-success-base)"
                      : "bg-(--state-error-lighter) text-(--state-error-base)",
                  )}>
                    {t.direction === "in" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-label-small text-text-strong-950 truncate">{t.title}</div>
                    {t.subtitle ? (
                      <div className="text-paragraph-x-small text-text-sub-600 truncate">{t.subtitle}</div>
                    ) : null}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn(
                      "text-label-small tabular-nums",
                      t.direction === "in" ? "text-(--state-success-base)" : "text-text-strong-950",
                    )}>
                      {t.direction === "in" ? "+" : "-"}{usd(t.amount)}
                    </div>
                    <div className="text-paragraph-x-small text-text-soft-400">{t.date}</div>
                  </div>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="outgoing" className="mt-3 text-paragraph-small text-text-sub-600">
            No outgoing transactions.
          </TabsContent>
          <TabsContent value="pending" className="mt-3 text-paragraph-small text-text-sub-600">
            No pending transactions.
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Total Balance                                                              */
/* -------------------------------------------------------------------------- */

export function TotalBalanceWidget({
  balance = 14480.24,
  deltaPct = 5,
  spark = [2200, 2900, 2500, 3400, 4100, 3700, 4800, 4300, 5000, 4600, 5100],
  className,
}: {
  balance?: number
  deltaPct?: number
  spark?: number[]
  className?: string
}) {
  const max = Math.max(...spark)
  const min = Math.min(...spark)
  const points = spark.map((v, i) => {
    const x = (i / (spark.length - 1)) * 100
    const y = 30 - ((v - min) / (max - min || 1)) * 28
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(" ")
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label-medium text-text-strong-950">Total Balance</h3>
          <Badge appearance="lighter" status={deltaPct >= 0 ? "success" : "error"}>
            {deltaPct >= 0 ? "+" : ""}{deltaPct}%
          </Badge>
        </div>
        <div className="text-title-h3 text-text-strong-950 tabular-nums">{usd(balance)}</div>
        <svg viewBox="0 0 100 32" className="w-full h-12" preserveAspectRatio="none">
          <defs>
            <linearGradient id="balance-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={`${points} 100,32 0,32`}
            fill="url(#balance-fill)"
            stroke="none"
          />
          <polyline
            points={points}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Quick Transfer                                                             */
/* -------------------------------------------------------------------------- */

export type Contact = {
  id: string
  name: string
  initials?: string
  avatarSrc?: string
}

const contactsDefaults: Contact[] = [
  { id: "c1", name: "Natalia", initials: "NA" },
  { id: "c2", name: "James",   initials: "JB" },
  { id: "c3", name: "Laura",   initials: "LP" },
  { id: "c4", name: "Wei",     initials: "WC" },
]

export function QuickTransferWidget({
  contacts = contactsDefaults,
  available = 16058.94,
  className,
}: {
  contacts?: Contact[]
  available?: number
  className?: string
}) {
  const [amount, setAmount] = React.useState("0.00")
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label-medium text-text-strong-950">Quick Transfer</h3>
          <button type="button" className="inline-flex items-center gap-1 text-label-small text-primary hover:underline">
            Advanced <Settings2 className="size-3.5" />
          </button>
        </div>
        <div className="text-label-x-small uppercase tracking-wider text-text-soft-400">
          My Contacts ({contacts.length})
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {contacts.map((c) => (
            <button
              key={c.id}
              type="button"
              className="flex shrink-0 flex-col items-center gap-1 rounded-lg p-1 hover:bg-bg-weak-50"
            >
              <Avatar size="lg">
                {c.avatarSrc ? <AvatarImage src={c.avatarSrc} alt={c.name} /> : null}
                <AvatarFallback>{c.initials ?? c.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="text-paragraph-x-small text-text-sub-600">{c.name}</span>
            </button>
          ))}
        </div>
        <Divider />
        <div className="space-y-1.5">
          <label className="text-label-x-small uppercase tracking-wider text-text-soft-400">
            Enter Amount
          </label>
          <div className="flex items-baseline gap-2">
            <span className="text-text-soft-400 text-title-h4">$</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-title-h3 tabular-nums text-text-strong-950 outline-none"
              inputMode="decimal"
            />
          </div>
          <div className="text-paragraph-x-small text-text-soft-400">
            Available: <span className="text-text-sub-600 tabular-nums">{usd(available)}</span>
          </div>
        </div>
        <Button tone="primary" style="filled" size="md" className="w-full">
          Save a New Action
        </Button>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Budget Overview                                                            */
/* -------------------------------------------------------------------------- */

export function BudgetOverviewWidget({
  income = 96000,
  expenses = 24000,
  scheduled = 14000,
  incomeDeltaPct = 5,
  expensesDeltaPct = -3,
  className,
}: {
  income?: number
  expenses?: number
  scheduled?: number
  incomeDeltaPct?: number
  expensesDeltaPct?: number
  className?: string
}) {
  const max = Math.max(income, expenses, scheduled) * 1.1
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
  // Toy bars per month
  const bars = months.map((_, i) => ({
    inc: 4000 + ((i * 13) % 9) * 800,
    exp: 1500 + ((i * 7) % 5) * 600,
  }))
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label-medium text-text-strong-950">Budget Overview</h3>
          <Badge appearance="lighter" status="neutral">Last Year</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <BudgetStat label="Income"    value={income}    delta={incomeDeltaPct}   accent="success" />
          <BudgetStat label="Expenses"  value={expenses}  delta={expensesDeltaPct} accent="error" />
          <BudgetStat label="Scheduled" value={scheduled} accent="primary" />
        </div>
        <div className="flex items-end gap-1.5 h-24">
          {bars.map((b, i) => (
            <div key={i} className="flex flex-1 flex-col items-stretch gap-0.5">
              <div className="w-full rounded-sm bg-(--primary-alpha-24)" style={{ height: `${(b.inc / max) * 100}%` }} />
              <div className="w-full rounded-sm bg-(--state-error-lighter)" style={{ height: `${(b.exp / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-paragraph-x-small text-text-soft-400">
          {months.map((m) => <span key={m}>{m}</span>)}
        </div>
      </CardContent>
    </Card>
  )
}

function BudgetStat({
  label,
  value,
  delta,
  accent,
}: {
  label: string
  value: number
  delta?: number
  accent: "primary" | "success" | "error"
}) {
  const accentText =
    accent === "success" ? "text-(--state-success-base)" :
    accent === "error"   ? "text-(--state-error-base)"   :
    "text-primary"
  return (
    <div className="rounded-lg bg-bg-weak-50 p-3 space-y-1">
      <div className="text-label-x-small uppercase tracking-wider text-text-soft-400">{label}</div>
      <div className="text-label-medium text-text-strong-950 tabular-nums">{usd(value)}</div>
      {delta !== undefined ? (
        <div className={cn("text-paragraph-x-small tabular-nums", accentText)}>
          {delta >= 0 ? "+" : ""}{delta}%
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  My Subscriptions                                                           */
/* -------------------------------------------------------------------------- */

export type Subscription = {
  id: string
  name: string
  cycle: "month" | "year"
  amount: number
  status: "Paid" | "Expiring" | "Paused"
  icon?: React.ReactNode
}

const subDefaults: Subscription[] = [
  { id: "s1", name: "Apple Music",    cycle: "month", amount: 7.99,  status: "Paid",     icon: <Music2 className="size-4" /> },
  { id: "s2", name: "Youtube Music",  cycle: "year",  amount: 79.99, status: "Expiring", icon: <PlayCircle className="size-4" /> },
  { id: "s3", name: "Prime Video",    cycle: "month", amount: 9.99,  status: "Paused",   icon: <Tv className="size-4" /> },
]

const subStatusMap: Record<Subscription["status"], "success" | "warning" | "neutral"> = {
  Paid: "success",
  Expiring: "warning",
  Paused: "neutral",
}

export function MySubscriptionsWidget({
  subscriptions = subDefaults,
  promo = { title: "50% discount on Apple Music", body: "For only $4.99 per month!", cta: "Learn More" },
  className,
}: {
  subscriptions?: Subscription[]
  promo?: { title: string; body: string; cta: string } | null
  className?: string
}) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <WidgetHeader title="My Subscriptions" />
        {promo ? (
          <div className="rounded-lg bg-(--primary-alpha-10) p-3">
            <div className="text-label-small text-primary">{promo.title}</div>
            <div className="mt-0.5 text-paragraph-x-small text-text-sub-600">{promo.body}</div>
            <button type="button" className="mt-1 text-label-small text-primary hover:underline">
              {promo.cta}
            </button>
          </div>
        ) : null}
        <ul className="space-y-2.5">
          {subscriptions.map((s) => (
            <li key={s.id} className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600">
                {s.icon ?? <CreditCard className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-label-small text-text-strong-950 truncate">{s.name}</div>
                <div className="text-paragraph-x-small text-text-soft-400 tabular-nums">
                  {usd(s.amount)} <span>/{s.cycle}</span>
                </div>
              </div>
              <StatusBadge status={subStatusMap[s.status]}>{s.status}</StatusBadge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
