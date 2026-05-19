"use client"

import * as React from "react"
import { RiSearchLine as Search, RiEqualizerLine as SlidersHorizontal, RiArrowUpDownLine as ArrowDownUp, RiDownloadLine as Download, RiUserAddLine as UserPlus, RiArrowDownSLine as ArrowDownLeft, RiArrowRightUpLine as ArrowUpRight, RiArrowLeftSLine as ChevronLeft, RiArrowRightSLine as ChevronRight, RiMoreLine as MoreHorizontal } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import {
  Pagination,
  PaginationList,
  PaginationItem,
  PaginationButton,
  PaginationEllipsis,
} from "@/registry/dash/ui/pagination"
import { cn } from "@/registry/dash/lib/utils"

/**
 * FinanceTransactions — port of AlignUI Pro Figma frame
 * "Transactions [Finance & Banking]" (node 3965:46276).
 *
 * Structure:
 *  - Page header: title + subtitle + period select + Export/Add Team Member.
 *  - Section header: "All Cards" + subtitle + Export button.
 *  - Horizontal filter row: Segmented [All|Income|Expenses] + search + Filter + Sort by.
 *  - Table: To/From · Amount · Account · Date & Time · Payment Method · row actions.
 *  - Pagination row: "Page 2 of 16" + numbered cells + page-size select.
 *
 * Pixel parity is approximate; structural parity matches Figma.
 */

export type FinanceTxRow = {
  id: string
  party: string
  initials?: string
  category: string
  direction: "in" | "out"
  amount: number
  account: string
  date: string
  method: "Wire" | "ACH" | "Money Transfer"
}

export type FinanceTransactionsProps = {
  title?: string
  subtitle?: string
  rows?: FinanceTxRow[]
  totalPages?: number
  currentPage?: number
  className?: string
}

const defaultRows: FinanceTxRow[] = [
  { id: "tx-1", party: "Investment Return", initials: "IR", category: "Income",   direction: "in",  amount: 560,    account: "Checking", date: "12 September · 09:21", method: "Wire" },
  { id: "tx-2", party: "James Brown",       initials: "JB", category: "Ops Payroll", direction: "out", amount: 35.20,  account: "Money Transfer", date: "12 September · 10:02", method: "Wire" },
  { id: "tx-3", party: "Stock Dividend",    initials: "SD", category: "AP",       direction: "in",  amount: 1250,   account: "Checking", date: "12 September · 11:14", method: "ACH" },
  { id: "tx-4", party: "Sophia Williams",   initials: "SW", category: "Checking", direction: "in",  amount: 150,    account: "Checking", date: "12 September · 12:30", method: "Money Transfer" },
  { id: "tx-5", party: "Freelance Income",  initials: "FI", category: "Checking", direction: "in",  amount: 250,    account: "Checking", date: "12 September · 13:00", method: "ACH" },
  { id: "tx-6", party: "Emma Wright",       initials: "EW", category: "AP",       direction: "out", amount: 21.80,  account: "Money Transfer", date: "12 September · 14:11", method: "Wire" },
  { id: "tx-7", party: "Utilities Payment", initials: "UP", category: "Ops Payroll", direction: "out", amount: 63.75,  account: "ACH",      date: "12 September · 14:50", method: "ACH" },
  { id: "tx-8", party: "Matthew Johnson",   initials: "MJ", category: "Checking", direction: "out", amount: 45,     account: "Money Transfer", date: "12 September · 15:35", method: "Money Transfer" },
]

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)

function methodAppearance(m: FinanceTxRow["method"]) {
  if (m === "Wire") return { status: "information" as const }
  if (m === "ACH") return { status: "success" as const }
  return { status: "feature" as const }
}

export function FinanceTransactions({
  title = "Transactions",
  subtitle = "Track your financial transactions to stay in control of your income and expenses.",
  rows = defaultRows,
  totalPages = 16,
  currentPage = 2,
  className,
}: FinanceTransactionsProps) {
  const [filter, setFilter] = React.useState<"all" | "income" | "expenses">("all")

  const filtered = rows.filter((r) =>
    filter === "all" ? true : filter === "income" ? r.direction === "in" : r.direction === "out",
  )

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">{title}</h1>
          <p className="text-sm text-text-sub-600 max-w-prose">{subtitle}</p>
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
          <Button style="stroke" tone="neutral" size="md">
            <Download className="size-4" /> Export
          </Button>
          <Button size="md">
            <UserPlus className="size-4" /> Add Team Member
          </Button>
        </div>
      </div>

      <Divider />

      {/* Section header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-strong-950">All Cards</h2>
          <p className="text-sm text-text-sub-600">Monitor and manage transactions across all your cards.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button style="stroke" tone="neutral" size="md">
            <Download className="size-4" /> Export
          </Button>
        </div>
      </div>

      {/* Horizontal filter row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          value={filter}
          onValueChange={(v: string) => v && setFilter(v as typeof filter)}
        >
          <SegmentedItem value="all">All</SegmentedItem>
          <SegmentedItem value="income">Income</SegmentedItem>
          <SegmentedItem value="expenses">Expenses</SegmentedItem>
        </SegmentedControl>
        <div className="flex flex-wrap items-center gap-2">
          <InputRoot className="w-full sm:w-[260px]">
            <InputIcon>
              <Search className="size-4" />
            </InputIcon>
            <Input placeholder="Search..." />
          </InputRoot>
          <Button style="stroke" tone="neutral" size="md">
            <SlidersHorizontal className="size-4" /> Filter
          </Button>
          <Button style="stroke" tone="neutral" size="md">
            <ArrowDownUp className="size-4" /> Sort by
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-stroke-soft-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">To / From</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => {
              const method = methodAppearance(r.method)
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback>{r.initials ?? r.party[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-strong-950 truncate">{r.party}</p>
                        <p className="text-xs text-text-sub-600 truncate">{r.category}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-sm font-semibold tabular-nums",
                        r.direction === "in" ? "text-(--state-success-base)" : "text-text-strong-950",
                      )}
                    >
                      {r.direction === "in" ? (
                        <ArrowDownLeft className="size-3.5" />
                      ) : (
                        <ArrowUpRight className="size-3.5" />
                      )}
                      {r.direction === "in" ? "+" : "-"}
                      {fmtUSD(r.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-text-strong-950">{r.account}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-text-sub-600">{r.date}</span>
                  </TableCell>
                  <TableCell>
                    <Badge appearance="lighter" status={method.status} size="sm">{r.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button style="ghost" tone="neutral" size="icon-xs" aria-label="More">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-text-sub-600">
          Page <span className="font-medium text-text-strong-950">{currentPage}</span> of{" "}
          <span className="font-medium text-text-strong-950">{totalPages}</span>
        </p>
        <Pagination className="justify-center">
          <PaginationList>
            <PaginationItem>
              <PaginationButton aria-label="Previous page">
                <ChevronLeft className="size-4" />
              </PaginationButton>
            </PaginationItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <PaginationItem key={n}>
                <PaginationButton isActive={n === currentPage}>{n}</PaginationButton>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationButton>{totalPages}</PaginationButton>
            </PaginationItem>
            <PaginationItem>
              <PaginationButton aria-label="Next page">
                <ChevronRight className="size-4" />
              </PaginationButton>
            </PaginationItem>
          </PaginationList>
        </Pagination>
        <Select defaultValue="7">
          <SelectTrigger className="h-9 w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 / page</SelectItem>
            <SelectItem value="14">14 / page</SelectItem>
            <SelectItem value="25">25 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
