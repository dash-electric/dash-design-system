"use client"

import * as React from "react"
import {
  RiArrowRightSLine as ChevronRight,
  RiBankCardLine as CardIcon,
  RiLineChartLine as LineChart,
  RiHomeSmile2Line as Home,
  RiAmazonFill as AmazonI,
  RiMastercardFill as MasterI,
  RiToolsLine as Tools,
  RiShoppingCart2Line as Cart,
  RiLightbulbLine as Bulb,
  RiSignalWifiLine as Wifi,
  RiSpotifyLine as Spotify,
  RiYoutubeLine as Youtube,
  RiLeafLine as Leaf,
} from "@remixicon/react"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
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
 * Recent Transactions widget — Figma 1:1 (3 nodes verified 2026-05-18).
 *
 *   3710:11192   Incoming tab — 4 credit rows (Salary / Stock / Rental / Refund)
 *   3710:11512   Outgoing tab — 4 debit rows (Baroque / Mastercard / Repair / Walmart)
 *   3710:11773   Pending tab — 4 upcoming rows (Electricity / Internet / Spotify / YouTube)
 */
type TxRow = {
  brand: string
  desc: string
  amount: string
  date: string
  leading: React.ReactNode
}

const INCOMING: TxRow[] = [
  { brand: "Salary Deposit", desc: "Monthly salary from Apex…", amount: "$3,500.00", date: "Sep 18", leading: <RowIcon bg="bg-bg-weak-50" fg="text-icon-sub-600"><Home className="size-3.5" /></RowIcon> },
  { brand: "Stock Dividend", desc: "Payment from stock invest…", amount: "$846.14", date: "Sep 18", leading: <RowIcon bg="bg-bg-weak-50" fg="text-icon-sub-600"><LineChart className="size-3.5" /></RowIcon> },
  { brand: "Rental Income", desc: "Rental payment from Mr. Du…", amount: "$100.00", date: "Sep 17", leading: <RowIcon bg="bg-success-lighter" fg="text-success-base"><Leaf className="size-3.5" /></RowIcon> },
  { brand: "Refund from Amazon", desc: "Refund of Order No #124235", amount: "$36.24", date: "Sep 15", leading: <RowIcon bg="bg-bg-weak-50" fg="text-icon-sub-600"><AmazonI className="size-3.5" /></RowIcon> },
]

const OUTGOING: TxRow[] = [
  { brand: "Baroque Painting", desc: "Order No #234122", amount: "-$124.00", date: "Sep 18", leading: <RowIcon bg="bg-success-lighter" fg="text-success-base"><Cart className="size-3.5" /></RowIcon> },
  { brand: "Mastercard Payment", desc: "Monthly Credit Card Paym…", amount: "-$963.62", date: "Sep 15", leading: <RowIcon bg="bg-error-lighter" fg="text-error-base"><MasterI className="size-3.5" /></RowIcon> },
  { brand: "Car Repairing Expenses", desc: "RepairMyCar Co.", amount: "-$640.00", date: "Sep 08", leading: <RowIcon bg="bg-bg-weak-50" fg="text-icon-sub-600"><Tools className="size-3.5" /></RowIcon> },
  { brand: "Grocery Shopping", desc: "Walmart Canada", amount: "-$146.31", date: "Sep 04", leading: <RowIcon bg="bg-information-lighter" fg="text-information-base"><Cart className="size-3.5" /></RowIcon> },
]

const PENDING: TxRow[] = [
  { brand: "Electricity Bill", desc: "3 days later", amount: "-$86.00", date: "Sep 21", leading: <RowIcon bg="bg-warning-lighter" fg="text-warning-base"><Bulb className="size-3.5" /></RowIcon> },
  { brand: "Internet Service", desc: "4 days later", amount: "-$46.00", date: "Sep 22", leading: <RowIcon bg="bg-information-lighter" fg="text-information-base"><Wifi className="size-3.5" /></RowIcon> },
  { brand: "Spotify Premium", desc: "5 days later", amount: "-$19.99", date: "Sep 23", leading: <RowIcon bg="bg-success-lighter" fg="text-success-base"><Spotify className="size-3.5" /></RowIcon> },
  { brand: "YouTube Premium", desc: "8 days later", amount: "-$14.99", date: "Sep 24", leading: <RowIcon bg="bg-error-lighter" fg="text-error-base"><Youtube className="size-3.5" /></RowIcon> },
]

export default function RecentTransactionsWidgetPage() {
  const [tab, setTab] = React.useState("incoming")
  const rows = tab === "incoming" ? INCOMING : tab === "outgoing" ? OUTGOING : PENDING

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Recent Transactions"
        description="Three-tab transaction history widget — Incoming credits, Outgoing debits, Pending upcoming charges. Each tab swaps a distinct row set inside the same shell."
      />

      <DocsSection title="Default">
        <DocsExample
          title="Live tab switcher"
          preview={
            <WidgetShell title="Recent Transactions" seeAll className="max-w-md">
              <SegmentedControl size="sm" value={tab} onValueChange={setTab} className="w-full mb-2">
                <SegmentedItem size="sm" value="incoming" className="flex-1">Incoming</SegmentedItem>
                <SegmentedItem size="sm" value="outgoing" className="flex-1">Outgoing</SegmentedItem>
                <SegmentedItem size="sm" value="pending" className="flex-1">Pending</SegmentedItem>
              </SegmentedControl>
              <ul className="divide-y divide-stroke-soft-200 text-xs">
                {rows.map((r) => (
                  <TransactionRow key={r.brand} row={r} />
                ))}
              </ul>
            </WidgetShell>
          }
          code={`<WidgetShell title="Recent Transactions" seeAll>
  <SegmentedControl value={tab} onValueChange={setTab}>
    <SegmentedItem value="incoming">Incoming</SegmentedItem>
    <SegmentedItem value="outgoing">Outgoing</SegmentedItem>
    <SegmentedItem value="pending">Pending</SegmentedItem>
  </SegmentedControl>
  {rows.map((r) => <TransactionRow row={r} />)}
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Tab variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Each tab uses domain-specific row sets. Incoming rows show positive amounts; Outgoing + Pending show negative amounts. Leading icon color hints the category.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["incoming", "outgoing", "pending"] as const).map((k) => {
            const set = k === "incoming" ? INCOMING : k === "outgoing" ? OUTGOING : PENDING
            return (
              <WidgetShell key={k} title="Recent Transactions" seeAll>
                <SegmentedControl size="sm" value={k} className="w-full mb-2">
                  <SegmentedItem size="sm" value="incoming" className="flex-1">Incoming</SegmentedItem>
                  <SegmentedItem size="sm" value="outgoing" className="flex-1">Outgoing</SegmentedItem>
                  <SegmentedItem size="sm" value="pending" className="flex-1">Pending</SegmentedItem>
                </SegmentedControl>
                <ul className="divide-y divide-stroke-soft-200 text-xs">
                  {set.map((r) => (
                    <TransactionRow key={r.brand} row={r} />
                  ))}
                </ul>
              </WidgetShell>
            )
          })}
        </div>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "tab", type: '"incoming" | "outgoing" | "pending"', defaultValue: '"incoming"', description: "Active segment." },
            { name: "rows", type: "TxRow[]", description: "Per-tab transaction list. Caller injects each set." },
            { name: "row.brand", type: "string", description: "Merchant or counterparty (line 1)." },
            { name: "row.desc", type: "string", description: "Order ref or supporting copy (line 2)." },
            { name: "row.amount", type: "string", description: "Signed currency string ($3,500.00 / -$124.00)." },
            { name: "row.date", type: "string", description: "Short date ('Sep 18') or relative ('3 days later')." },
            { name: "row.leading", type: "ReactNode", description: "Brand glyph in tinted circle." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Card shell with title left + See All link right.</li>
          <li>3-segment SegmentedControl (full width) below header.</li>
          <li>Row: 28px tinted-circle icon + 2-line title/desc + right-aligned amount/date + chevron.</li>
          <li>Amount uses tabular-nums; sign baked into the string.</li>
          <li>Rows divided by stroke-soft-200 1px lines.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function WidgetShell({
  title,
  seeAll,
  children,
  className,
}: {
  title: React.ReactNode
  seeAll?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {seeAll && <LinkButton size="sm">See All</LinkButton>}
      </div>
      {children}
    </div>
  )
}

function RowIcon({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex size-7 items-center justify-center rounded-full shrink-0", bg, fg)}>
      {children}
    </span>
  )
}

function TransactionRow({ row }: { row: TxRow }) {
  const isNeg = row.amount.startsWith("-")
  return (
    <li className="flex items-center gap-2 py-2">
      {row.leading}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate text-text-strong-950">{row.brand}</div>
        <div className="text-text-sub-600 truncate">{row.desc}</div>
      </div>
      <div className="text-right">
        <div className={cn("font-medium tabular-nums", isNeg ? "text-text-strong-950" : "text-text-strong-950")}>{row.amount}</div>
        <div className="text-text-sub-600 text-[11px]">{row.date}</div>
      </div>
      <ChevronRight className="size-4 text-text-soft-400" />
    </li>
  )
}
