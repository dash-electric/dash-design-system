"use client"

import * as React from "react"
import { RiArrowRightUpLine as ArrowUpRight, RiArrowDownSLine as ArrowDownRight, RiSearchLine as Search, RiFilter3Line as Filter } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import {
  Pagination,
  PaginationList,
  PaginationItem,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
} from "@/registry/dash/ui/pagination"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { cn } from "@/registry/dash/lib/utils"

export type TxRow = {
  id: string
  party: string
  initials?: string
  category: string
  amount: number
  direction: "in" | "out"
  status: "completed" | "pending" | "failed"
  date: string
}

const defaultRows: TxRow[] = [
  { id: "TX-2026-8841", party: "Reservasi · BKS-A41",  initials: "RB", category: "Trip payout", amount: 78_500,  direction: "in",  status: "completed", date: "Today 14:22" },
  { id: "TX-2026-8840", party: "Express · TGR-902",    initials: "EX", category: "Surge bonus", amount: 32_000,  direction: "in",  status: "completed", date: "Today 11:08" },
  { id: "TX-2026-8838", party: "Withdraw · BCA *4421", initials: "BC", category: "Cash out",    amount: 500_000, direction: "out", status: "pending",   date: "Yesterday" },
  { id: "TX-2026-8836", party: "Bulk · BDG-13",        initials: "BL", category: "Trip payout", amount: 145_000, direction: "in",  status: "completed", date: "Yesterday" },
  { id: "TX-2026-8835", party: "Penalty · late",       initials: "PN", category: "Adjustment",  amount: 25_000,  direction: "out", status: "completed", date: "2d ago" },
  { id: "TX-2026-8832", party: "Reservasi · SBY-08",   initials: "RB", category: "Trip payout", amount: 92_500,  direction: "in",  status: "failed",    date: "2d ago" },
]

const statusMap = {
  completed: { label: "Completed", status: "success" as const },
  pending:   { label: "Pending",   status: "warning" as const },
  failed:    { label: "Failed",    status: "error" as const },
}

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n)

export type TransactionsTableProps = {
  rows?: TxRow[]
  className?: string
}

/** Transactions table — filter row + DataTable-style rows + pagination. */
export function TransactionsTable({ rows = defaultRows, className }: TransactionsTableProps) {
  return (
    <div className={cn("space-y-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4", className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <InputRoot size="sm" className="max-w-xs flex-1">
          <InputIcon><Search className="size-4" strokeWidth={1.75} /></InputIcon>
          <Input placeholder="Cari ID, mitra, kategori…" />
        </InputRoot>
        <Button tone="neutral" style="stroke" size="sm">
          <Filter className="size-4" /> Status
        </Button>
        <Button tone="neutral" style="stroke" size="sm">
          <Filter className="size-4" /> Tribe
        </Button>
        <Button tone="neutral" style="stroke" size="sm">
          7d ▾
        </Button>
        <span className="ml-auto text-xs text-text-soft-400">{rows.length} rows</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-weak-50 text-left">
            <tr>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">ID</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Party</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Category</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">Amount</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Status</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke-soft-200">
            {rows.map((r) => {
              const s = statusMap[r.status]
              return (
                <tr key={r.id} className="hover:bg-bg-weak-50/50">
                  <td className="px-3 py-2.5 text-xs text-text-soft-400">{r.id}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar size="xs"><AvatarFallback>{r.initials ?? r.party.slice(0, 2)}</AvatarFallback></Avatar>
                      <span className="text-text-strong-950">{r.party}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-text-sub-600">{r.category}</td>
                  <td className={cn(
                    "px-3 py-2.5 text-right",
                    r.direction === "in" ? "text-state-success-base" : "text-text-strong-950"
                  )}>
                    <span className="inline-flex items-center gap-1">
                      {r.direction === "in" ? <ArrowDownRight className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                      {r.direction === "in" ? "+" : "−"}Rp {fmt(r.amount)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5"><Badge appearance="lighter" status={s.status}>{s.label}</Badge></td>
                  <td className="px-3 py-2.5 text-text-sub-600">{r.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination>
        <PaginationList>
          <PaginationPrevious />
          <PaginationItem><PaginationButton isActive>1</PaginationButton></PaginationItem>
          <PaginationItem><PaginationButton>2</PaginationButton></PaginationItem>
          <PaginationItem><PaginationButton>3</PaginationButton></PaginationItem>
          <PaginationNext />
        </PaginationList>
      </Pagination>
    </div>
  )
}
