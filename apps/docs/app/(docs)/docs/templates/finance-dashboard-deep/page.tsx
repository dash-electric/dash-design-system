"use client"

import * as React from "react"
import {
  RiArrowRightSLine,
  RiArrowRightUpLine,
  RiArrowLeftDownLine,
  RiArrowLeftRightLine,
  RiBankCardLine,
  RiCalendarLine,
  RiCupLine,
  RiEyeLine,
  RiEyeOffLine,
  RiHomeSmileFill,
  RiLightbulbFlashFill,
  RiMore2Line,
  RiPieChartLine,
  RiPlaneLine,
  RiRestaurantLine,
  RiSendPlaneLine,
  RiShoppingCartLine,
  RiSpotifyFill,
  RiTicketLine,
  RiWifiLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge, StatusBadge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Divider } from "@/registry/dash/ui/divider"
import { ProgressBar } from "@/registry/dash/ui/progress-bar"
import { Tag } from "@/registry/dash/ui/tag"
import { cn } from "@/registry/dash/lib/utils"
import {
  FinanceAppShell,
  FinanceHeader,
  MoveMoneyButton,
} from "@/registry/dash/templates/_internal/finance-app-shell"

/* -------------------------------------------------------------------------- *
 *  Finance Dashboard (Deep) — full home preview                              *
 *  Mirrors `template-finance-master/app/(main)/(home)/page.tsx` 14-widget    *
 *  grid 1:1. Each widget is rendered with verbatim KPIs from source:         *
 *  • My Cards (Savings Card · $16,058.94 · ••••1234 · 06/27)                 *
 *  • Budget Overview                                                          *
 *  • Spending Summary                                                         *
 *  • Exchange (USD→EUR)                                                       *
 *  • My Cards Compact                                                         *
 *  • Total Expenses · Total Balance                                           *
 *  • Quick Transfer                                                           *
 *  • Recent Transactions                                                      *
 *  • My Subscriptions                                                         *
 *  • Saved Actions                                                            *
 *  • Credit Score                                                             *
 *  • Major Expenses                                                           *
 *  • Transactions Table (spans full width)                                    *
 * -------------------------------------------------------------------------- */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

function WidgetCard({
  title,
  cta,
  className,
  children,
}: {
  title?: string
  cta?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200",
        className,
      )}
    >
      {title ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-text-strong-950">
            {title}
          </div>
          {cta ?? (
            <button
              type="button"
              className="text-text-soft-400 hover:text-text-sub-600"
              aria-label="More"
            >
              <RiMore2Line className="size-4" />
            </button>
          )}
        </div>
      ) : null}
      {children}
    </div>
  )
}

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n)

/* ───────────────────────── Widget: My Cards (large) ─────────────────────── */
function WidgetMyCards({ className }: { className?: string }) {
  const [hidden, setHidden] = React.useState(false)
  return (
    <WidgetCard
      title="My Cards"
      className={className}
      cta={
        <Button size="xs" style="ghost" tone="neutral">
          Add Card
          <RiArrowRightSLine className="size-4" />
        </Button>
      }
    >
      {/* Virtual Card (light surface, Apex logo) */}
      <div className="relative flex h-[188px] flex-col gap-3 overflow-hidden rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-(--dash-purple-600) text-static-white text-[10px] font-bold">
                A
              </div>
              <RiWifiLine className="size-6 rotate-90 text-text-soft-400" />
            </div>
            <StatusBadge variant="dot-stroke" status="success">
              Active
            </StatusBadge>
          </div>
          <div className="grid size-8 place-items-center rounded bg-(--dash-orange-100) text-[9px] font-bold text-(--dash-orange-700)">
            MC
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-1">
          <div className="text-xs text-text-sub-600">Savings Card</div>
          <div className="text-2xl font-semibold tabular-nums text-text-strong-950">
            {hidden ? "••••••••" : fmtUSD(16058.94)}
          </div>
        </div>
      </div>

      {/* Spending limit row */}
      <div className="text-xs text-text-sub-600">
        Spending Limit ·{" "}
        <span className="font-semibold tabular-nums text-text-strong-950">
          {fmtUSD(12000)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="xs"
          style="stroke"
          tone="neutral"
          onClick={() => setHidden((h) => !h)}
        >
          {hidden ? (
            <RiEyeLine className="size-4" />
          ) : (
            <RiEyeOffLine className="size-4" />
          )}
          {hidden ? "Unhide" : "Hide"}
        </Button>
        <Button size="xs" style="stroke" tone="neutral">
          Adjust Limit
        </Button>
        <Button
          size="xs"
          style="ghost"
          tone="neutral"
          aria-label="More options"
        >
          <RiMore2Line className="size-4" />
        </Button>
      </div>

      {/* Card meta */}
      <Divider />
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Card Number</span>
          <span className="tabular-nums text-text-strong-950">• • • • 1234</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Expiry Date</span>
          <span className="tabular-nums text-text-strong-950">06/27</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">CVC</span>
          <span className="text-text-strong-950">• • •</span>
        </div>
      </div>
    </WidgetCard>
  )
}

/* ───────────────────────── Widget: Budget Overview ──────────────────────── */
function WidgetBudgetOverview({ className }: { className?: string }) {
  return (
    <WidgetCard
      title="Budget Overview"
      className={className}
      cta={
        <Badge appearance="stroke" status="neutral" size="sm">
          Last Year
        </Badge>
      }
    >
      <div className="flex items-center gap-3 text-xs text-text-sub-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-(--dash-purple-500)" />
          Income
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-(--state-error-base)" />
          Expenses
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-(--state-warning-base)" />
          Scheduled
        </span>
      </div>
      <Divider />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-text-soft-400">
            Income
          </div>
          <div className="mt-1 text-xl font-semibold text-text-strong-950 tabular-nums">
            {fmtUSD(96000)}
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-(--state-success-base)">
            <RiArrowRightUpLine className="size-3.5" />
            +5%
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-text-soft-400">
            Expenses
          </div>
          <div className="mt-1 text-xl font-semibold text-text-strong-950 tabular-nums">
            {fmtUSD(24000)}
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-(--state-error-base)">
            <RiArrowLeftDownLine className="size-3.5" />
            -3%
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-text-soft-400">
            Scheduled
          </div>
          <div className="mt-1 text-xl font-semibold text-text-strong-950 tabular-nums">
            {fmtUSD(14000)}
          </div>
          <div className="mt-1 text-xs text-text-soft-400">—</div>
        </div>
      </div>
      <Divider />
      {/* 12-month stacked-bar ghost */}
      <div className="flex h-[140px] items-end gap-2">
        {[8, 6, 9, 7, 10, 8, 11, 9, 12, 10, 13, 11].map((v, i) => (
          <div key={i} className="flex flex-1 flex-col justify-end gap-1">
            <span
              className="rounded-sm bg-(--dash-purple-500)"
              style={{ height: `${v * 6}px` }}
            />
            <span
              className="rounded-sm bg-(--state-error-base)/60"
              style={{ height: `${(14 - v) * 3}px` }}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 text-center text-[10px] text-text-soft-400">
        {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map(
          (m, i) => (
            <span key={`${m}-${i}`}>{m}</span>
          ),
        )}
      </div>
    </WidgetCard>
  )
}

/* ──────────────────────── Widget: Spending Summary ──────────────────────── */
function WidgetSpendingSummary() {
  const cats = [
    { label: "Shopping", amount: 900, tone: "bg-(--dash-purple-500)" },
    { label: "Utilities", amount: 600, tone: "bg-(--state-information-base)" },
    { label: "Others", amount: 300, tone: "bg-(--state-warning-base)" },
  ]
  return (
    <WidgetCard
      title="Spending Summary"
      cta={
        <Badge appearance="stroke" status="neutral" size="sm">
          Last Week
        </Badge>
      }
    >
      <div>
        <div className="text-[11px] uppercase tracking-wide text-text-soft-400">
          Spend
        </div>
        <div className="mt-1 text-2xl font-semibold text-text-strong-950 tabular-nums">
          {fmtUSD(1800)}
        </div>
      </div>
      <ProgressBar value={90} />
      <ul className="flex flex-col gap-2">
        {cats.map((c) => (
          <li
            key={c.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="inline-flex items-center gap-2 text-text-sub-600">
              <span className={cn("size-2 rounded-full", c.tone)} />
              {c.label}
            </span>
            <span className="font-medium tabular-nums text-text-strong-950">
              {fmtUSD(c.amount)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-text-sub-600">
        Your weekly spending limit is{" "}
        <span className="font-medium text-text-strong-950">{fmtUSD(2000)}</span>
        .
      </p>
    </WidgetCard>
  )
}

/* ─────────────────────────── Widget: Exchange ───────────────────────────── */
function WidgetExchange() {
  return (
    <WidgetCard
      title="Exchange"
      cta={<RiArrowLeftRightLine className="size-4 text-text-soft-400" />}
    >
      <div className="flex flex-col gap-2">
        <p className="text-[11px] uppercase tracking-wide text-text-soft-400">
          Currencies
        </p>
        <div className="flex items-center gap-2">
          <Badge appearance="lighter" status="neutral" size="md">
            USD
          </Badge>
          <RiArrowRightSLine className="size-3 text-text-soft-400" />
          <Badge appearance="lighter" status="neutral" size="md">
            EUR
          </Badge>
        </div>
        <p className="text-xl font-semibold tabular-nums text-text-strong-950">
          {fmtUSD(100)}
        </p>
        <p className="text-xs text-text-sub-600">
          Available: {fmtUSD(16058.94)}
        </p>
        <p className="text-xs text-text-sub-600">1 USD = 0.94 EUR</p>
      </div>
      <Divider />
      <dl className="flex flex-col gap-1 text-xs">
        <div className="flex justify-between">
          <dt className="text-text-sub-600">Tax (2%)</dt>
          <dd className="tabular-nums text-text-strong-950">{fmtUSD(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-sub-600">Exchange fee (1%)</dt>
          <dd className="tabular-nums text-text-strong-950">{fmtUSD(1)}</dd>
        </div>
        <div className="flex justify-between font-medium">
          <dt className="text-text-strong-950">Total amount</dt>
          <dd className="tabular-nums text-text-strong-950">€91.18</dd>
        </div>
      </dl>
      <Button size="md" className="w-full">
        Exchange
      </Button>
    </WidgetCard>
  )
}

/* ──────────────────────── Widget: My Cards Compact ──────────────────────── */
function WidgetMyCardsCompact() {
  return (
    <WidgetCard
      title="My Cards"
      cta={
        <Button size="xs" style="ghost" tone="neutral">
          See All
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {[
          { name: "Savings Card", last: "1234", balance: 16058.94 },
          { name: "Daily Spending Card", last: "6454", balance: 11.25 },
          { name: "Travel Card", last: "9876", balance: 453.76 },
        ].map((c) => (
          <div
            key={c.last}
            className="flex items-center justify-between rounded-lg bg-bg-weak-50 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-md bg-bg-white-0 ring-1 ring-stroke-soft-200">
                <RiBankCardLine className="size-4 text-text-sub-600" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-text-strong-950">
                  {c.name}
                </div>
                <div className="text-xs text-text-sub-600">
                  •••• {c.last}
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold tabular-nums text-text-strong-950">
              {fmtUSD(c.balance)}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

/* ───────────────────────── Widget: Total Expenses ───────────────────────── */
function WidgetTotalExpenses() {
  return (
    <WidgetCard title="Total Expenses">
      <div>
        <div className="text-2xl font-semibold text-text-strong-950 tabular-nums">
          {fmtUSD(24000)}
        </div>
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-(--state-error-base)">
          <RiArrowLeftDownLine className="size-3.5" />
          -3% vs last month
        </div>
      </div>
      {/* Mini sparkline */}
      <div className="flex h-12 items-end gap-1">
        {[40, 55, 35, 60, 45, 65, 50, 70, 55, 75, 60, 80].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-(--state-error-base)/60"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </WidgetCard>
  )
}

/* ───────────────────────── Widget: Total Balance ────────────────────────── */
function WidgetTotalBalance() {
  return (
    <WidgetCard title="Total Balance">
      <div>
        <div className="text-2xl font-semibold text-text-strong-950 tabular-nums">
          {fmtUSD(16523.95)}
        </div>
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-(--state-success-base)">
          <RiArrowRightUpLine className="size-3.5" />
          +12% vs last month
        </div>
      </div>
      <div className="flex h-12 items-end gap-1">
        {[30, 45, 50, 40, 60, 55, 70, 65, 80, 75, 85, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-(--state-success-base)/60"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </WidgetCard>
  )
}

/* ───────────────────────── Widget: Quick Transfer ───────────────────────── */
function WidgetQuickTransfer() {
  const contacts = [
    { initials: "JB", name: "James", color: "bg-(--dash-blue-100)" },
    { initials: "SW", name: "Sophia", color: "bg-(--dash-yellow-100)" },
    { initials: "MJ", name: "Matthew", color: "bg-(--dash-purple-100)" },
    { initials: "EW", name: "Emma", color: "bg-(--dash-pink-100)" },
    { initials: "AT", name: "Arthur", color: "bg-(--dash-orange-100)" },
  ]
  return (
    <WidgetCard
      title="Quick Transfer"
      cta={
        <CompactButton variant="stroke" size="sm" fullRadius aria-label="Quick transfer">
          <RiArrowRightSLine />
        </CompactButton>
      }
    >
      <div className="flex items-center gap-3 overflow-x-auto">
        {contacts.map((c) => (
          <div
            key={c.initials}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <Avatar size="xl" className={c.color}>
              <AvatarFallback className="text-text-strong-950">
                {c.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-text-sub-600">{c.name}</span>
          </div>
        ))}
      </div>
      <Button size="md" className="w-full">
        <RiSendPlaneLine className="size-4" />
        Send Money
      </Button>
    </WidgetCard>
  )
}

/* ────────────────────── Widget: Recent Transactions ─────────────────────── */
function WidgetRecentTransactions() {
  const txs = [
    {
      id: "2441c347",
      icon: RiPieChartLine,
      name: "Stock Dividend",
      desc: "Payment from stock investments.",
      amount: 1500,
      direction: "in" as const,
      date: "Sep 15",
    },
    {
      id: "ab193fd6",
      icon: RiHomeSmileFill,
      name: "Rental Income",
      desc: "Rental payment from Mr. Dudley.",
      amount: 800,
      direction: "in" as const,
      date: "Sep 17",
    },
    {
      id: "7a2dc594",
      icon: RiShoppingCartLine,
      name: "Grocery Shopping",
      desc: "Purchase of monthly groceries.",
      amount: 84.14,
      direction: "out" as const,
      date: "Sep 16",
    },
  ]
  return (
    <WidgetCard
      title="Recent Transactions"
      cta={
        <Button size="xs" style="ghost" tone="neutral">
          See All
          <RiArrowRightSLine className="size-4" />
        </Button>
      }
    >
      <ul className="flex flex-col">
        {txs.map((tx) => {
          const Icon = tx.icon
          return (
            <li key={tx.id} className="flex items-center gap-3 py-2">
              <span
                aria-hidden
                className="inline-flex size-9 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600"
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-strong-950">
                  {tx.name}
                </p>
                <p className="truncate text-xs text-text-sub-600">{tx.desc}</p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    tx.direction === "in"
                      ? "text-(--state-success-base)"
                      : "text-text-strong-950",
                  )}
                >
                  {tx.direction === "in" ? "+" : "-"}
                  {fmtUSD(tx.amount)}
                </p>
                <p className="text-xs text-text-soft-400">{tx.date}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </WidgetCard>
  )
}

/* ───────────────────────── Widget: My Subscriptions ─────────────────────── */
function WidgetMySubscriptions() {
  const subs = [
    {
      name: "Netflix",
      desc: "Premium Plan",
      amount: 18.99,
      icon: "bg-(--state-error-base) text-static-white",
      letter: "N",
    },
    {
      name: "Spotify",
      desc: "Family Plan",
      amount: 14.99,
      icon: "bg-(--state-success-base) text-static-white",
      letter: "S",
    },
    {
      name: "iCloud",
      desc: "200 GB Storage",
      amount: 2.99,
      icon: "bg-(--dash-blue-500) text-static-white",
      letter: "i",
    },
  ]
  return (
    <WidgetCard
      title="My Subscriptions"
      cta={
        <Button size="xs" style="ghost" tone="neutral">
          See All
        </Button>
      }
    >
      <ul className="flex flex-col gap-3">
        {subs.map((s) => (
          <li key={s.name} className="flex items-center gap-3">
            <div
              className={cn(
                "grid size-9 place-items-center rounded-full text-sm font-semibold",
                s.icon,
              )}
            >
              {s.letter}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-text-strong-950">
                {s.name}
              </div>
              <div className="text-xs text-text-sub-600">{s.desc}</div>
            </div>
            <div className="text-sm font-semibold tabular-nums text-text-strong-950">
              {fmtUSD(s.amount)}
            </div>
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}

/* ────────────────────────── Widget: Saved Actions ───────────────────────── */
function WidgetSavedActions() {
  const actions = [
    { label: "Pay Rent", amount: 1200, icon: RiHomeSmileFill },
    { label: "Electricity", amount: 72.32, icon: RiLightbulbFlashFill },
    { label: "Coffee Shop", amount: 4.75, icon: RiCupLine },
  ]
  return (
    <WidgetCard
      title="Saved Actions"
      cta={
        <Button size="xs" style="ghost" tone="neutral">
          See All
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <li
              key={a.label}
              className="flex items-center gap-3 rounded-lg bg-bg-weak-50 p-2.5"
            >
              <div className="grid size-8 place-items-center rounded-md bg-bg-white-0 ring-1 ring-stroke-soft-200">
                <Icon className="size-4 text-text-sub-600" />
              </div>
              <div className="min-w-0 flex-1 text-sm font-medium text-text-strong-950">
                {a.label}
              </div>
              <div className="text-sm font-semibold tabular-nums text-text-strong-950">
                {fmtUSD(a.amount)}
              </div>
              <CompactButton variant="stroke" size="sm" fullRadius aria-label={`Pay ${a.label}`}>
                <RiArrowRightSLine />
              </CompactButton>
            </li>
          )
        })}
      </ul>
    </WidgetCard>
  )
}

/* ─────────────────────────── Widget: Credit Score ───────────────────────── */
function WidgetCreditScore() {
  // semi-circle gauge mimic: 760 / 850 = ~89%
  return (
    <WidgetCard title="Credit Score">
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative grid h-24 w-44 place-items-end">
          <svg viewBox="0 0 100 50" className="size-full">
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              className="stroke-bg-weak-50"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              className="stroke-(--state-success-base)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="141.37"
              strokeDashoffset="15.5"
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <div className="text-2xl font-semibold tabular-nums text-text-strong-950">
              760
            </div>
            <div className="text-[10px] uppercase tracking-wide text-text-soft-400">
              of 850
            </div>
          </div>
        </div>
        <Badge appearance="lighter" status="success" size="md">
          Very Good
        </Badge>
      </div>
    </WidgetCard>
  )
}

/* ───────────────────────── Widget: Major Expenses ───────────────────────── */
function WidgetMajorExpenses() {
  const rows = [
    {
      name: "Flight Booking",
      desc: "Flight reservation to New York.",
      amount: 350,
      icon: RiPlaneLine,
    },
    {
      name: "Restaurant Dinner",
      desc: "Dinner at a restaurant.",
      amount: 45.2,
      icon: RiRestaurantLine,
    },
    {
      name: "Movie Tickets",
      desc: "Tickets for a movie screening.",
      amount: 25.5,
      icon: RiTicketLine,
    },
  ]
  return (
    <WidgetCard
      title="Major Expenses"
      cta={
        <Button size="xs" style="ghost" tone="neutral">
          See All
        </Button>
      }
    >
      <ul className="flex flex-col">
        {rows.map((r) => {
          const Icon = r.icon
          return (
            <li key={r.name} className="flex items-center gap-3 py-2">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-strong-950">
                  {r.name}
                </p>
                <p className="truncate text-xs text-text-sub-600">{r.desc}</p>
              </div>
              <p className="text-sm font-semibold tabular-nums text-text-strong-950">
                -{fmtUSD(r.amount)}
              </p>
            </li>
          )
        })}
      </ul>
    </WidgetCard>
  )
}

/* ───────────────────── Widget: Transactions Table (full) ────────────────── */
function WidgetTransactionsTable({ className }: { className?: string }) {
  const rows = [
    {
      id: "326860a3",
      to: "Investment Return",
      icon: RiPieChartLine,
      direction: "in" as const,
      amount: 560,
      account: "Checking",
      method: "Wire",
      date: "2024-09-12",
    },
    {
      id: "326860b3",
      to: "James Brown",
      avatar: "JB",
      direction: "out" as const,
      amount: 35.2,
      account: "Ops Payroll",
      method: "Transfer",
      date: "2024-09-12",
    },
    {
      id: "326860c3",
      to: "Stock Dividend",
      icon: RiPieChartLine,
      direction: "in" as const,
      amount: 1250,
      account: "AP",
      method: "ACH",
      date: "2024-09-12",
    },
    {
      id: "326860d3",
      to: "Sophia Williams",
      avatar: "SW",
      direction: "in" as const,
      amount: 150,
      account: "Checking",
      method: "Transfer",
      date: "2024-09-12",
    },
  ]
  return (
    <WidgetCard
      title="Transactions"
      className={className}
      cta={
        <Button size="xs" style="ghost" tone="neutral">
          See All
          <RiArrowRightSLine className="size-4" />
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-lg ring-1 ring-stroke-soft-200">
        <table className="w-full text-sm">
          <thead className="bg-bg-weak-50">
            <tr className="text-left">
              {["To / From", "Amount", "Account", "Date", "Method"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke-soft-200 bg-bg-white-0">
            {rows.map((r) => {
              const Icon = r.icon
              return (
                <tr key={r.id}>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {Icon ? (
                        <span className="inline-flex size-7 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600">
                          <Icon className="size-4" />
                        </span>
                      ) : (
                        <Avatar size="sm" className="bg-(--dash-purple-100)">
                          <AvatarFallback className="text-text-strong-950">
                            {r.avatar}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-sm font-medium text-text-strong-950">
                        {r.to}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        r.direction === "in"
                          ? "text-(--state-success-base)"
                          : "text-text-strong-950",
                      )}
                    >
                      {r.direction === "in" ? "+" : "-"}
                      {fmtUSD(r.amount)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-text-sub-600">
                    {r.account}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-text-sub-600">
                    {r.date}
                  </td>
                  <td className="px-3 py-2.5">
                    <Tag size="sm">{r.method}</Tag>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  )
}

/* ─────────────────────────────── Preview ────────────────────────────────── */
function FinanceDashboardPreview() {
  return (
    <FinanceAppShell active="dashboard">
      <FinanceHeader
        icon={
          <Avatar size="xl" className="bg-(--dash-blue-100)">
            <AvatarFallback className="text-text-strong-950">AT</AvatarFallback>
          </Avatar>
        }
        title="Arthur Taylor"
        description="Welcome back to Apex 👋🏻"
        actions={<MoveMoneyButton />}
      />
      <div className="flex flex-col gap-6 px-8 pb-8 lg:pt-1">
        <div className="grid grid-cols-3 items-start gap-6">
          {/* Row 1 */}
          <WidgetMyCards className="row-span-2" />
          <WidgetBudgetOverview className="col-span-2" />
          {/* Row 2 (My Cards spans into) */}
          <WidgetSpendingSummary />
          <WidgetExchange />
          {/* Row 3 */}
          <WidgetMyCardsCompact />
          <div className="grid gap-6">
            <WidgetTotalExpenses />
            <WidgetTotalBalance />
          </div>
          <WidgetQuickTransfer />
          <WidgetRecentTransactions />
          <WidgetMySubscriptions />
          <WidgetSavedActions />
          <WidgetCreditScore />
          <WidgetMajorExpenses />
          {/* Row N — full-width transactions table */}
          <WidgetTransactionsTable className="col-span-3" />
        </div>
      </div>
    </FinanceAppShell>
  )
}

export default function FinanceDashboardDeepDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance"
        title="Finance Dashboard (Deep)"
        description="Full Apex Finance home rendered 1:1 from the template-finance-master source — 272px sidebar with Apex CompanySwitch, 88px topbar with Arthur Taylor avatar and Move Money CTA, and the complete 14-widget grid: My Cards · Budget Overview · Spending Summary · Exchange · My Cards Compact · Total Expenses · Total Balance · Quick Transfer · Recent Transactions · My Subscriptions · Saved Actions · Credit Score · Major Expenses · Transactions Table."
      />

      <DocsSection title="Full preview">
        <DocsTemplatePreview>
          <FinanceDashboardPreview />
        </DocsTemplatePreview>
      </DocsSection>

      <DocsSection
        title="Anatomy"
        description="Two zones — 272px sidebar (fixed) and a flex content column that opens with an 88px Header and a 3-column widget grid spanning up to ~1280px before the outer container scrolls."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            <strong>Sidebar (272px)</strong> — Apex CompanySwitch → Main nav
            (Dashboard active, My Cards, Transfer, Transactions, Payments,
            Exchange) → Favs (Loom Mobile App, Monday Redesign, Udemy Courses ·
            ⌘1-3) → Others (Settings / Support) → Arthur Taylor user card.
          </li>
          <li>
            <strong>Top Header</strong> — 48px Arthur Taylor avatar + greeting
            "Arthur Taylor / Welcome back to Apex 👋🏻" + Search (⌘K), bell,
            Move Money CTA.
          </li>
          <li>
            <strong>Widget grid</strong> — 3 columns × ~6 rows. My Cards spans
            2 rows. Budget Overview spans 2 cols. Total Expenses + Total
            Balance share one column slot. Transactions Table spans 3 cols.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Sample data (verbatim from source)">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            <strong>Savings Card</strong> — •••• 1234 · Expiry 06/27 · CVC •••
            · Balance $16,058.94 · Spending limit $12,000.
          </li>
          <li>
            <strong>Budget Overview</strong> — Income $96,000 (+5%) · Expenses
            $24,000 (-3%) · Scheduled $14,000.
          </li>
          <li>
            <strong>Spending Summary</strong> — Spend $1,800 of $2,000 weekly
            cap · Shopping $900 / Utilities $600 / Others $300.
          </li>
          <li>
            <strong>Exchange</strong> — USD → EUR · Amount $100 · Rate 0.94 ·
            Tax 2% · Fee 1% · Total €91.18.
          </li>
          <li>
            <strong>Recent Transactions</strong> — Stock Dividend +$1,500 ·
            Rental Income +$800 · Grocery Shopping -$84.14.
          </li>
          <li>
            <strong>Credit Score</strong> — 760 of 850 (Very Good).
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            <strong>Avatar / AvatarGroup / AvatarFallback</strong> — Arthur
            avatar (xl), Quick Transfer contacts, Transactions Table rows.
          </li>
          <li>
            <strong>Badge / StatusBadge</strong> — Active virtual card,
            Last Year / Last Week pills, Very Good credit rating, USD/EUR
            currency chips.
          </li>
          <li>
            <strong>Button / CompactButton / IconButton</strong> — Move Money,
            Send Money, Adjust Limit, Hide/Unhide, Exchange CTA, See All links.
          </li>
          <li>
            <strong>Divider</strong> — Inside My Cards card meta, Budget
            Overview legend separator, Exchange tax/fee separator, sidebar.
          </li>
          <li>
            <strong>ProgressBar</strong> — Spending Summary weekly gauge.
          </li>
          <li>
            <strong>Tag</strong> — Method column in Transactions Table.
          </li>
          <li>
            <strong>Kbd</strong> — ⌘K search hint, Favs shortcuts.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
