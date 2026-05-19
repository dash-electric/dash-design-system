"use client"

import * as React from "react"
import {
  RiRefund2Line,
  RiBankLine,
  RiHomeSmileFill,
  RiLineChartLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import {
  SegmentedControl,
  SegmentedItem,
} from "@/registry/dash/ui/segmented-control"
import { cn } from "@/registry/dash/lib/utils"
import { EmptyStateIllustration } from "@/registry/dash/ui/empty-state-illustration"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Finance Widget — Recent Transactions. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-recent-transactions.tsx + transaction-item.tsx
 *
 * 3-tab segmented (Incoming / Outgoing / Pending) + 4 incoming source rows.
 * Salary $3,500 · Stock Dividend $846.14 · Rental $100 · Amazon refund $36.24.
 */

type Trx = {
  id: string
  type: "other" | "rent" | "tax" | "phone" | "internet" | "donate" | "electricity" | "gas" | "water"
  name: string
  description: string
  transaction: number
  date: string
  icon: React.ElementType | string
}

const INCOMING: Trx[] = [
  { id: "1", type: "other", name: "Salary Deposit", description: "Monthly salary from Apex Finance", transaction: 3500, date: "Sep 18", icon: RiBankLine },
  { id: "2", type: "other", name: "Stock Dividend", description: "Payment from stock investments.", transaction: 846.14, date: "Sep 17", icon: RiLineChartLine },
  { id: "3", type: "rent", name: "Rental Income", description: "Rental payment from Mr. Dudley.", transaction: 100, date: "Sep 15", icon: RiHomeSmileFill },
  { id: "4", type: "other", name: "Refund from Amazon", description: "Refund of Order No #124235", transaction: 36.24, date: "Sep 12", icon: "AMZ" },
]

const OUTGOING: Trx[] = [
  { id: "o1", type: "rent", name: "Rent Payment", description: "Monthly rent payment.", transaction: -900, date: "Sep 18", icon: RiHomeSmileFill },
]

const PENDING: Trx[] = []

export default function FinanceRecentTransactionsWidgetPage() {
  const [tab, setTab] = React.useState("incoming")
  const rows = tab === "incoming" ? INCOMING : tab === "outgoing" ? OUTGOING : PENDING

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="Recent Transactions"
        description="3-tab segmented control (Incoming / Outgoing / Pending) over a transaction-item list. Source ships 4 incoming rows: Salary $3,500, Stock Dividend $846.14, Rental $100, Amazon refund $36.24."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Incoming — 4 rows"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiRefund2Line className="size-4 text-icon-sub-600" /> Recent Transactions</>}
                action={<Button tone="neutral" style="stroke" size="xs">See All</Button>}
              >
                <SegmentedControl value={tab} onValueChange={setTab} size="sm">
                  <SegmentedItem size="sm" value="incoming">Incoming</SegmentedItem>
                  <SegmentedItem size="sm" value="outgoing">Outgoing</SegmentedItem>
                  <SegmentedItem size="sm" value="pending">Pending</SegmentedItem>
                </SegmentedControl>
                <div className="mt-3 flex flex-col gap-2">
                  {rows.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <RiRefund2Line className="size-10 text-icon-soft-400" />
                      <p className="text-xs text-text-soft-400">No {tab} transactions yet.</p>
                    </div>
                  ) : (
                    rows.map((t) => <TrxItem key={t.id} trx={t} />)
                  )}
                </div>
              </WidgetShell>
            </div>
          }
          code={`<RecentTransactions data={incoming} tab="incoming" />`}
        />
      </DocsSection>

      <DocsSection title="3 tabs side-by-side">
        <DocsExample
          title="Incoming / Outgoing / Pending"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
              {(["incoming", "outgoing", "pending"] as const).map((t) => {
                const list = t === "incoming" ? INCOMING : t === "outgoing" ? OUTGOING : PENDING
                return (
                  <div key={t} className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-text-soft-400">{t}</div>
                    {list.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-6 text-center">
                        <RiRefund2Line className="size-8 text-icon-soft-400" />
                        <p className="text-[11px] text-text-soft-400">No records.</p>
                      </div>
                    ) : list.map((trx) => <TrxItem key={trx.id} trx={trx} compact />)}
                  </div>
                )
              })}
            </div>
          }
          code={`<RecentTransactions data={incoming} />
<RecentTransactions data={outgoing} />
<RecentTransactions data={[]} /> // Pending`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No records"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiRefund2Line className="size-4 text-icon-sub-600" /> Recent Transactions</>}>
                <SegmentedControl size="sm" defaultValue="incoming">
                  <SegmentedItem size="sm" value="incoming">Incoming</SegmentedItem>
                  <SegmentedItem size="sm" value="outgoing">Outgoing</SegmentedItem>
                  <SegmentedItem size="sm" value="pending">Pending</SegmentedItem>
                </SegmentedControl>
                <div className="flex flex-col items-center gap-3 p-5 pt-8">
                  <EmptyStateIllustration kind="recent-transactions" />
                  <p className="text-center text-sm text-text-soft-400">No records of transactions yet.<br />Please check back later.</p>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<RecentTransactionsEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data", type: "Transaction[]", description: "Row data — id, type, name, description, transaction, date, icon." },
            { name: "tab", type: '"incoming" | "outgoing" | "pending"', defaultValue: '"incoming"', description: "Active segmented control." },
            { name: "onRowClick", type: "(trx: Transaction) => void", description: "Per-row click target." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>SegmentedControl</strong> — 3 segments, Incoming default.</li>
          <li><strong>Row</strong> — 40px circular icon bubble (tinted per type) + name/description (sm/xs) + amount/date (right-aligned) + ghost chevron CompactButton.</li>
          <li><strong>Type bubble palette</strong> — `other`=white-0 ring, `rent`=success-lighter, `tax`=feature-lighter, `phone`=warning-lighter, `internet`=information-lighter, `donate`=highlighted-lighter, `electricity`=away-lighter, `gas`=error-lighter, `water`=verified-lighter.</li>
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
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 pb-5 shadow-sm", className)}>
      <div className="flex items-center gap-2 min-h-8 mb-3">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

const TYPE_BG: Record<string, string> = {
  other: "bg-bg-white-0 text-text-sub-600 shadow-sm ring-1 ring-inset ring-stroke-soft-200",
  rent: "bg-success-lighter text-success-base",
  tax: "bg-feature-lighter text-feature-base",
  phone: "bg-warning-lighter text-warning-base",
  internet: "bg-information-lighter text-information-base",
  donate: "bg-highlighted-lighter text-highlighted-base",
  electricity: "bg-away-lighter text-away-base",
  gas: "bg-error-lighter text-error-base",
  water: "bg-verified-lighter text-verified-base",
}

function TrxItem({ trx, compact }: { trx: Trx; compact?: boolean }) {
  const Icon = typeof trx.icon === "string" ? null : (trx.icon as React.ElementType)
  const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)
  return (
    <div className={cn("flex w-full items-center gap-3 rounded-xl py-2 text-left transition hover:bg-bg-weak-50", compact && "py-1.5")}>
      <div className={cn("flex shrink-0 items-center justify-center rounded-full", compact ? "size-8" : "size-10", TYPE_BG[trx.type] ?? TYPE_BG.other)}>
        {Icon ? <Icon className={compact ? "size-4" : "size-5"} /> : <span className="text-[10px] font-bold">{(trx.icon as string).slice(0, 3)}</span>}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className={cn("truncate font-medium text-text-strong-950", compact ? "text-xs" : "text-sm")}>{trx.name}</div>
        {!compact && <div className="truncate text-[11px] text-text-sub-600">{trx.description}</div>}
      </div>
      <div className="space-y-0.5 text-right">
        <div className={cn("font-medium tabular-nums text-text-strong-950", compact ? "text-xs" : "text-sm")}>{fmt(trx.transaction)}</div>
        {!compact && <div className="text-[11px] text-text-sub-600">{trx.date}</div>}
      </div>
      {!compact && <CompactButton variant="ghost" size="md" aria-label="Open transaction"><RiArrowRightSLine /></CompactButton>}
    </div>
  )
}
