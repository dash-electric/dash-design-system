"use client"

import * as React from "react"
import { RiSearchLine as Search, RiFilter3Line as Filter, RiDownloadLine as Download, RiFileTextLine as FileText, RiMoreLine as MoreHorizontal } from "@remixicon/react"
import { Card, CardHeader, CardDescription, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge, type Status } from "@/registry/dash/ui/badge"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Stat, StatValue, StatTrend } from "@/registry/dash/ui/stat"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { cn } from "@/registry/dash/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type OrderStatus = "paid" | "pending" | "shipped" | "refunded" | "cancelled"

export type Order = {
  id: string
  date: string
  customer: string
  product: string
  revenue: number
  status: OrderStatus
}

export type MarketingOrdersProps = {
  title?: string
  description?: string
  orders?: Order[]
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

const defaultOrders: Order[] = [
  { id: "#ORD-98745", date: "29 Oct, 09:20", customer: "Sophia Williams",  product: "Apple Watch S5 GPS 40mm White", revenue: 399.99,  status: "paid" },
  { id: "#ORD-23674", date: "28 Oct, 10:30", customer: "Laura Perez",      product: "MacBook Pro M1 256GB Silver",   revenue: 1299.00, status: "shipped" },
  { id: "#ORD-23673", date: "27 Oct, 16:14", customer: "Arthur Taylor",    product: "iMac M1 24-inch Purple",        revenue: 1499.00, status: "pending" },
  { id: "#ORD-23645", date: "27 Oct, 11:02", customer: "Emma Wright",      product: "AirPods Max Green",             revenue: 549.00,  status: "paid" },
  { id: "#ORD-23601", date: "26 Oct, 18:55", customer: "Noah Patel",       product: "HomePod Mini Orange",           revenue: 99.00,   status: "refunded" },
  { id: "#ORD-23580", date: "26 Oct, 14:21", customer: "Wei Chen",         product: "iPad Pro 12.9-inch M2",         revenue: 1099.00, status: "paid" },
  { id: "#ORD-23541", date: "25 Oct, 09:18", customer: "Olivia Brown",     product: "Magic Keyboard Wireless",       revenue: 129.00,  status: "cancelled" },
  { id: "#ORD-23502", date: "24 Oct, 22:07", customer: "Lucas Garcia",     product: "Studio Display 5K",             revenue: 1999.00, status: "shipped" },
]

const statusMap: Record<OrderStatus, { label: string; status: Status }> = {
  paid:      { label: "Paid",      status: "success" },
  pending:   { label: "Pending",   status: "warning" },
  shipped:   { label: "Shipped",   status: "information" },
  refunded:  { label: "Refunded",  status: "feature" },
  cancelled: { label: "Cancelled", status: "error" },
}

const formatUSD = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * MarketingOrders — Catalyst-style Orders table page ported from AlignUI Pro Figma.
 * Page header + KPI tiles (Total Orders / Revenue / AOV / Pending) +
 * filter toolbar (search, date range, status, export) + orders table.
 *
 * Source: Figma node `164770:19931` ("Orders [Marketing & Sales]").
 */
export function MarketingOrders({
  title = "Orders",
  description = "Manage and track your orders",
  orders = defaultOrders,
  className,
}: MarketingOrdersProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-text-sub-600">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button tone="neutral" style="stroke" size="sm">
            <Download className="size-4" /> Export
          </Button>
          <Button tone="primary" style="filled" size="sm">New Order</Button>
        </div>
      </header>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Orders</CardDescription></CardHeader>
          <CardContent><Stat>
            <StatValue>1,248</StatValue>
            <StatTrend trend="up" value="+12">vs this week</StatTrend>
          </Stat></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Revenue</CardDescription></CardHeader>
          <CardContent><Stat>
            <StatValue>$48,294</StatValue>
            <StatTrend trend="up" value="+8%">vs last week</StatTrend>
          </Stat></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Average Order Value</CardDescription></CardHeader>
          <CardContent><Stat>
            <StatValue>$86.45</StatValue>
            <StatTrend trend="down" value="-2%">this week</StatTrend>
          </Stat></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Pending Orders</CardDescription></CardHeader>
          <CardContent><Stat>
            <StatValue>28</StatValue>
            <span className="text-xs text-state-warning-base">Requires attention</span>
          </Stat></CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <InputRoot size="sm" className="w-72">
          <InputIcon><Search /></InputIcon>
          <Input placeholder="Search orders..." />
        </InputRoot>
        <div className="flex-1" />
        <Button tone="neutral" style="stroke" size="sm">Last 7 days</Button>
        <Button tone="neutral" style="stroke" size="sm">Feb 04 - Feb 11, 2024</Button>
        <Button tone="neutral" style="stroke" size="sm">All Status</Button>
        <Button tone="neutral" style="stroke" size="sm">
          <Filter className="size-3.5" /> Filter
        </Button>
      </div>

      {/* Orders table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-weak-50 text-left">
                <tr>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">ID</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Date</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Status</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Customer</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Purchased</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">Revenue</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-soft-200">
                {orders.map((o) => {
                  const meta = statusMap[o.status]
                  return (
                    <tr key={o.id} className="hover:bg-bg-weak-50/50">
                      <td className="px-6 py-3 text-xs text-text-strong-950">{o.id}</td>
                      <td className="px-6 py-3 text-text-sub-600 whitespace-nowrap">{o.date}</td>
                      <td className="px-6 py-3">
                        <Badge appearance="lighter" status={meta.status}>{meta.label}</Badge>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar size="xs">
                            <AvatarFallback>
                              {o.customer.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-text-strong-950">{o.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-text-sub-600 max-w-[260px] truncate">{o.product}</td>
                      <td className="px-6 py-3 text-right text-text-strong-950">{formatUSD(o.revenue)}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton tone="neutral" style="ghost" size="xs" aria-label="View PDF">
                            <FileText />
                          </IconButton>
                          <IconButton tone="neutral" style="ghost" size="xs" aria-label="More">
                            <MoreHorizontal />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
