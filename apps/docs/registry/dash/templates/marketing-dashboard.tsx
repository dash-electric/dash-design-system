"use client"

import * as React from "react"
import { RiSearchLine as Search, RiComputerLine as Monitor, RiTabletLine as Tablet, RiSmartphoneLine as Smartphone, RiShoppingCartLine as ShoppingCart, RiBankCardLine as CreditCard, RiCheckboxCircleLine as CheckCircle2, RiArrowRightSLine as ChevronRight } from "@remixicon/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Stat, StatValue, StatTrend } from "@/registry/dash/ui/stat"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/dash/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { cn } from "@/registry/dash/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type SalesChannel = {
  id: string
  name: string
  revenue: number
  delta: string
  trendDirection: "up" | "down"
}

export type FunnelRow = {
  stage: "Added to Cart" | "Reached Checkout" | "Purchased"
  count: number
  delta: string
  trendDirection: "up" | "down"
}

export type MarketingDashboardProps = {
  greeting?: string
  userName?: string
  channels?: SalesChannel[]
  funnel?: FunnelRow[]
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

const defaultChannels: SalesChannel[] = [
  { id: "ch-online", name: "Online Store",    revenue: 52_120_000, delta: "+4.5%", trendDirection: "up" },
  { id: "ch-fb",     name: "Facebook",        revenue: 38_450_000, delta: "-2.8%", trendDirection: "down" },
  { id: "ch-ig",     name: "Instagram",       revenue: 37_750_000, delta: "+3.2%", trendDirection: "up" },
  { id: "ch-tt",     name: "TikTok Shop",     revenue: 29_200_000, delta: "+8.1%", trendDirection: "up" },
  { id: "ch-tp",     name: "Tokopedia",       revenue: 24_840_000, delta: "+1.4%", trendDirection: "up" },
]

const defaultFunnel: FunnelRow[] = [
  { stage: "Added to Cart",    count: 3842, delta: "+1.8%", trendDirection: "up" },
  { stage: "Reached Checkout", count: 1256, delta: "-1.2%", trendDirection: "down" },
  { stage: "Purchased",        count: 649,  delta: "+2.4%", trendDirection: "up" },
]

const salesTrend = [
  { month: "Feb", value: 84 },
  { month: "Mar", value: 92 },
  { month: "Apr", value: 105 },
  { month: "May", value: 118 },
  { month: "Jun", value: 112 },
  { month: "Jul", value: 128 },
]

const chartConfig = {
  value: { label: "Sales (Rp jt)", color: "var(--dash-purple-500)" },
} satisfies ChartConfig

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(n)

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * MarketingDashboard — Catalyst-style Marketing & Sales overview ported from
 * AlignUI Pro Figma. KPI cards (Total Sales / Visitors / Conversion) +
 * Sales trend area chart + Device breakdown + Cart→Checkout→Purchase funnel +
 * Sales Channels table.
 *
 * Source: Figma node `164623:17809` ("Dashboard [Marketing & Sales]").
 */
export function MarketingDashboard({
  greeting = "Welcome back to Catalyst",
  userName = "James Brown",
  channels = defaultChannels,
  funnel = defaultFunnel,
  className,
}: MarketingDashboardProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Page header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Avatar size="md">
            <AvatarFallback>
              {userName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting} <span aria-hidden>👋🏻</span>
            </h1>
            <p className="text-sm text-text-sub-600">Marketing &amp; Sales</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InputRoot size="sm" className="w-64">
            <InputIcon><Search /></InputIcon>
            <Input placeholder="Search..." />
          </InputRoot>
          <Button tone="neutral" style="stroke" size="sm">Last month</Button>
          <Button tone="primary" style="filled" size="sm">New Products</Button>
        </div>
      </header>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Sales</CardDescription>
            <Button tone="neutral" style="ghost" size="sm">
              Report <ChevronRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <Stat>
              <StatValue>$128.32K</StatValue>
              <StatTrend trend="up" value="+2%">vs last month</StatTrend>
            </Stat>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Visitors</CardDescription>
            <Button tone="neutral" style="ghost" size="sm">
              Report <ChevronRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <Stat>
              <StatValue>237,456</StatValue>
              <StatTrend trend="down" value="-1.4%">vs last month</StatTrend>
            </Stat>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Conversion Rate</CardDescription>
            <Button tone="neutral" style="ghost" size="sm">
              Details <ChevronRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <Stat>
              <StatValue>16.9%</StatValue>
              <StatTrend trend="up" value="+2.1%">vs last month</StatTrend>
            </Stat>
          </CardContent>
        </Card>
      </div>

      {/* Sales trend + Devices */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Total Sales</CardTitle>
              <CardDescription>Monthly trend</CardDescription>
            </div>
            <SegmentedControl defaultValue="1M" size="sm">
              <SegmentedItem value="1D">1D</SegmentedItem>
              <SegmentedItem value="1W">1W</SegmentedItem>
              <SegmentedItem value="1M">1M</SegmentedItem>
              <SegmentedItem value="3M">3M</SegmentedItem>
              <SegmentedItem value="1Y">1Y</SegmentedItem>
            </SegmentedControl>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-56 w-full">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  fill="url(#salesGrad)"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Sessions breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Desktop", icon: Monitor,    pct: 27, delta: "-3.2%", down: true },
              { name: "Tablet",  icon: Tablet,     pct: 12, delta: "-6.4%", down: true },
              { name: "Mobile",  icon: Smartphone, pct: 61, delta: "+0.8%", down: false },
            ].map(({ name, icon: Icon, pct, delta, down }) => (
              <div key={name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-text-strong-950">
                    <Icon className="size-4 text-text-sub-600" /> {name}
                  </span>
                  <span className={cn("text-xs", down ? "text-state-error-base" : "text-state-success-base")}>
                    {delta}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-bg-weak-50 overflow-hidden">
                    <div className="h-full bg-(--dash-purple-500)" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs text-text-sub-600">{pct}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Funnel + Sales channels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Checkout funnel</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnel.map((row, i) => {
              const Icon = i === 0 ? ShoppingCart : i === 1 ? CreditCard : CheckCircle2
              const pct = Math.round((row.count / funnel[0].count) * 100)
              return (
                <div key={row.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2 text-text-strong-950">
                      <Icon className="size-4 text-text-sub-600" /> {row.stage}
                    </span>
                    <span className="text-xs text-text-sub-600">
                      {row.count.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-bg-weak-50 overflow-hidden">
                      <div
                        className="h-full bg-(--dash-purple-500)"
                        style={{ width: `${pct}%`, opacity: 1 - i * 0.18 }}
                      />
                    </div>
                    <span className={cn(
                      "w-12 text-right text-xs",
                      row.trendDirection === "up" ? "text-state-success-base" : "text-state-error-base",
                    )}>
                      {row.delta}
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sales channels</CardTitle>
              <CardDescription>Revenue by source · last 30d</CardDescription>
            </div>
            <Button tone="neutral" style="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-weak-50 text-left">
                  <tr>
                    <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Channel</th>
                    <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">Revenue</th>
                    <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">Δ</th>
                    <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-soft-200">
                  {channels.map((c) => (
                    <tr key={c.id} className="hover:bg-bg-weak-50/50">
                      <td className="px-6 py-3 font-medium text-text-strong-950">{c.name}</td>
                      <td className="px-6 py-3 text-right">Rp {formatIDR(c.revenue)}</td>
                      <td className={cn(
                        "px-6 py-3 text-right text-xs",
                        c.trendDirection === "up" ? "text-state-success-base" : "text-state-error-base",
                      )}>
                        {c.delta}
                      </td>
                      <td className="px-6 py-3">
                        <Badge appearance="lighter" status={c.trendDirection === "up" ? "success" : "warning"}>
                          {c.trendDirection === "up" ? "Healthy" : "Watch"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
