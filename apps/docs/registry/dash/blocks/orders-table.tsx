"use client"

import * as React from "react"
import { RiFilter3Line as Filter, RiDeleteBinLine as Trash2, RiMailLine as Mail, RiMoreLine as MoreHorizontal } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { cn } from "@/registry/dash/lib/utils"

export type OrderRow = {
  id: string
  customer: string
  tribe: "Reservasi" | "Express" | "Bulk"
  region: string
  amount: number
  status: "queued" | "in_progress" | "delivered" | "canceled"
  eta: string
}

const defaultRows: OrderRow[] = [
  { id: "DSP-9412", customer: "PT Sinar Jaya",   tribe: "Bulk",      region: "Bekasi",    amount: 1_240_000, status: "in_progress", eta: "30m" },
  { id: "DSP-9411", customer: "Wijaya & Co",     tribe: "Reservasi", region: "Tangerang", amount: 285_000,   status: "delivered",   eta: "—" },
  { id: "DSP-9410", customer: "Bangun Mandiri",  tribe: "Express",   region: "Surabaya",  amount: 142_000,   status: "queued",      eta: "12m" },
  { id: "DSP-9408", customer: "Sumber Rezeki",   tribe: "Express",   region: "Bandung",   amount: 78_500,    status: "in_progress", eta: "8m" },
  { id: "DSP-9405", customer: "Kopi Tubruk Ltd", tribe: "Bulk",      region: "Bekasi",    amount: 620_000,   status: "canceled",    eta: "—" },
  { id: "DSP-9403", customer: "Hello World Inc", tribe: "Reservasi", region: "Tangerang", amount: 198_000,   status: "delivered",   eta: "—" },
]

const statusMap = {
  queued:      { label: "Queued",      status: "feature" as const },
  in_progress: { label: "In progress", status: "information" as const },
  delivered:   { label: "Delivered",   status: "success" as const },
  canceled:    { label: "Canceled",    status: "error" as const },
}

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n)

export type OrdersTableProps = {
  rows?: OrderRow[]
  className?: string
}

/** Orders table — bulk select + status filter + dispatch rows. */
export function OrdersTable({ rows = defaultRows, className }: OrdersTableProps) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const allSelected = rows.length > 0 && selected.size === rows.length

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
  }
  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const bulkVisible = selected.size > 0

  return (
    <div className={cn("rounded-xl border border-stroke-soft-200 bg-bg-white-0", className)}>
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-stroke-soft-200">
        <Button tone="neutral" style="stroke" size="sm"><Filter className="size-4" /> Tribe</Button>
        <Button tone="neutral" style="stroke" size="sm"><Filter className="size-4" /> Status</Button>
        <Button tone="neutral" style="stroke" size="sm"><Filter className="size-4" /> Region</Button>
        <span className="ml-auto text-xs text-text-soft-400">{rows.length} dispatch</span>
      </div>

      {/* Bulk action row */}
      {bulkVisible ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-(--dash-purple-50) dark:bg-(--dash-purple-950)/40 border-b border-stroke-soft-200">
          <span className="text-sm font-medium text-text-strong-950">{selected.size} selected</span>
          <Button tone="neutral" style="stroke" size="xs"><Mail className="size-3" /> Notify mitra</Button>
          <Button tone="destructive" style="stroke" size="xs"><Trash2 className="size-3" /> Cancel</Button>
          <Button tone="neutral" style="ghost" size="xs" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-weak-50 text-left">
            <tr>
              <th className="px-3 py-2 w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" /></th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Dispatch</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Customer</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Tribe</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Region</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">Amount</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Status</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">ETA</th>
              <th className="px-3 py-2 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke-soft-200">
            {rows.map((r) => {
              const s = statusMap[r.status]
              const isSel = selected.has(r.id)
              return (
                <tr key={r.id} className={cn("hover:bg-bg-weak-50/50", isSel && "bg-(--dash-purple-50)/40 dark:bg-(--dash-purple-950)/20")}>
                  <td className="px-3 py-2.5"><Checkbox checked={isSel} onCheckedChange={() => toggle(r.id)} aria-label={`Select ${r.id}`} /></td>
                  <td className="px-3 py-2.5 text-xs text-text-strong-950">{r.id}</td>
                  <td className="px-3 py-2.5 text-text-strong-950">{r.customer}</td>
                  <td className="px-3 py-2.5"><Badge appearance="lighter" status="information">{r.tribe}</Badge></td>
                  <td className="px-3 py-2.5 text-text-sub-600">{r.region}</td>
                  <td className="px-3 py-2.5 text-right">Rp {fmt(r.amount)}</td>
                  <td className="px-3 py-2.5"><Badge appearance="lighter" status={s.status}>{s.label}</Badge></td>
                  <td className="px-3 py-2.5 text-text-sub-600 text-xs">{r.eta}</td>
                  <td className="px-3 py-2.5">
                    <IconButton aria-label="More" size="xs"><MoreHorizontal /></IconButton>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
