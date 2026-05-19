"use client"

import * as React from "react"
import { RiBox3Line as Package, RiMoreLine as MoreHorizontal } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { cn } from "@/registry/dash/lib/utils"

export type DispatchPool = {
  id: string
  name: string
  tribe: "Reservasi" | "Express" | "Bulk"
  region: string
  pricePerKm: number
  capacity: number
  inStock: number
  status: "active" | "low" | "out"
}

const defaultPools: DispatchPool[] = [
  { id: "pl-RB-BKS", name: "Reservasi Bekasi",   tribe: "Reservasi", region: "Bekasi",    pricePerKm: 3_200, capacity: 80, inStock: 62, status: "active" },
  { id: "pl-EX-TGR", name: "Express Tangerang",  tribe: "Express",   region: "Tangerang", pricePerKm: 4_400, capacity: 60, inStock: 8,  status: "low" },
  { id: "pl-BL-BDG", name: "Bulk Bandung",       tribe: "Bulk",      region: "Bandung",   pricePerKm: 8_900, capacity: 20, inStock: 0,  status: "out" },
  { id: "pl-RB-SBY", name: "Reservasi Surabaya", tribe: "Reservasi", region: "Surabaya",  pricePerKm: 3_400, capacity: 50, inStock: 41, status: "active" },
  { id: "pl-EX-BKS", name: "Express Bekasi",     tribe: "Express",   region: "Bekasi",    pricePerKm: 4_200, capacity: 70, inStock: 53, status: "active" },
  { id: "pl-BL-TGR", name: "Bulk Tangerang",     tribe: "Bulk",      region: "Tangerang", pricePerKm: 9_100, capacity: 15, inStock: 4,  status: "low" },
]

const statusMap = {
  active: { label: "Tersedia",  status: "success" as const },
  low:    { label: "Hampir habis", status: "warning" as const },
  out:    { label: "Habis",     status: "error" as const },
}

const tribeAccent = {
  Reservasi: "from-(--dash-purple-100) to-(--dash-purple-200) text-(--dash-purple-700)",
  Express:   "from-(--dash-blue-100) to-(--dash-blue-200) text-(--dash-blue-700)",
  Bulk:      "from-(--dash-orange-100) to-(--dash-orange-200) text-(--dash-orange-700)",
}

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n)

export type ProductsGridProps = {
  pools?: DispatchPool[]
  className?: string
}

/** Products / Dispatch pool grid — price + stock + status badge. */
export function ProductsGrid({ pools = defaultPools, className }: ProductsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {pools.map((p) => {
        const s = statusMap[p.status]
        const stockPct = Math.round((p.inStock / p.capacity) * 100)
        return (
          <Card key={p.id} className="overflow-hidden">
            <div className={cn("h-32 bg-gradient-to-br flex items-center justify-center relative", tribeAccent[p.tribe])}>
              <Package className="size-10 opacity-70" strokeWidth={1.5} />
              <Badge appearance="lighter" status={s.status} className="absolute top-2 right-2">{s.label}</Badge>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-text-strong-950 truncate">{p.name}</div>
                  <div className="text-xs text-text-soft-400">{p.id} · {p.region}</div>
                </div>
                <IconButton aria-label="More" size="xs"><MoreHorizontal /></IconButton>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-text-sub-600">Rate per km</div>
                  <div className="text-base font-semibold text-text-strong-950">Rp {fmt(p.pricePerKm)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-sub-600">Stock</div>
                  <div className="text-sm text-text-strong-950">{p.inStock}/{p.capacity}</div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-bg-weak-50 overflow-hidden">
                <div className={cn(
                  "h-full",
                  p.status === "out" ? "bg-state-error-base" : p.status === "low" ? "bg-state-warning-base" : "bg-state-success-base"
                )} style={{ width: `${stockPct}%` }} />
              </div>
              <Button tone="neutral" style="stroke" size="sm" className="w-full">Manage pool</Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
