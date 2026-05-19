"use client"

import * as React from "react"
import { RiSearchLine as Search, RiBox3Line as Package, RiArrowUpCircleLine as TrendingUp, RiPriceTag3Line as Tag, RiTruckLine as Truck, RiNotification3Line as Bell, RiArrowRightSLine as ChevronRight } from "@remixicon/react"
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
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { cn } from "@/registry/dash/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type ActivityItem = {
  id: string
  icon: "inventory" | "price" | "shipping" | "alert"
  title: string
  subtitle: string
  timestamp: string
}

export type MarketingAnalyticsProps = {
  greeting?: string
  userName?: string
  activities?: ActivityItem[]
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

const defaultActivities: ActivityItem[] = [
  { id: "a1", icon: "inventory", title: "Inventory Updated",  subtitle: "Women's Summer Dress - Blue · +150 units added", timestamp: "11:30 AM" },
  { id: "a2", icon: "price",     title: "Price Change",       subtitle: "Seasonal discount applied · $89.99 → $69.99 (-22%)", timestamp: "10:14 AM" },
  { id: "a3", icon: "shipping",  title: "Shipping Delay",     subtitle: "Carrier JNE · 12 orders affected", timestamp: "09:02 AM" },
  { id: "a4", icon: "alert",     title: "Low Stock Alert",    subtitle: "iMac M1 Purple · 4 units remaining", timestamp: "Yesterday" },
  { id: "a5", icon: "inventory", title: "Stock Reconciliation", subtitle: "Warehouse Tangerang · -8 units variance", timestamp: "Yesterday" },
]

const salesTrend = [
  { d: "Mon", sales: 2840 },
  { d: "Tue", sales: 3120 },
  { d: "Wed", sales: 2980 },
  { d: "Thu", sales: 3484 },
  { d: "Fri", sales: 3210 },
  { d: "Sat", sales: 4120 },
  { d: "Sun", sales: 3680 },
]

const productPerf = [
  { name: "Apple Watch S5", revenue: 12_400 },
  { name: "MacBook Pro M1", revenue: 9_800 },
  { name: "iMac M1",        revenue: 7_200 },
  { name: "AirPods Max",    revenue: 5_900 },
  { name: "HomePod Mini",   revenue: 4_300 },
]

const salesChartConfig = {
  sales: { label: "Sales", color: "var(--dash-purple-500)" },
} satisfies ChartConfig

const prodChartConfig = {
  revenue: { label: "Revenue", color: "var(--dash-blue-500)" },
} satisfies ChartConfig

const activityIconMap: Record<ActivityItem["icon"], React.ElementType> = {
  inventory: Package,
  price:     Tag,
  shipping:  Truck,
  alert:     Bell,
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * MarketingAnalytics — Catalyst-style Analytics page ported from AlignUI Pro Figma.
 * Headline KPI tiles (Current Sales / Daily Avg / Conversion Rate / Recent Activities) +
 * Sales-over-time area chart + Top product performance bar chart + Recent activity feed.
 *
 * Source: Figma node `164636:1065` ("Analytics [Marketing & Sales]").
 */
export function MarketingAnalytics({
  greeting = "Welcome back to Catalyst",
  userName = "James Brown",
  activities = defaultActivities,
  className,
}: MarketingAnalyticsProps) {
  return (
    <div className={cn("space-y-6", className)}>
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
            <p className="text-sm text-text-sub-600">Marketing &amp; Sales · Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InputRoot size="sm" className="w-64">
            <InputIcon><Search /></InputIcon>
            <Input placeholder="Search..." />
          </InputRoot>
          <Button tone="neutral" style="stroke" size="sm">Last 7 days</Button>
          <Button tone="neutral" style="stroke" size="sm">Feb 04 - Feb 11, 2024</Button>
        </div>
      </header>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Sales</CardDescription>
          </CardHeader>
          <CardContent>
            <Stat>
              <StatValue>3,484</StatValue>
              <StatTrend trend="up" value="+7.1%">vs prev</StatTrend>
            </Stat>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Daily Average</CardDescription>
          </CardHeader>
          <CardContent>
            <Stat>
              <StatValue>486</StatValue>
              <StatTrend trend="up" value="+2%">vs last week</StatTrend>
            </Stat>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversion Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <Stat>
              <StatValue>3.8%</StatValue>
              <StatTrend trend="down" value="-0.5%">vs last week</StatTrend>
            </Stat>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Recent Activities</CardDescription>
            <Button tone="neutral" style="ghost" size="sm">
              Details <ChevronRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <Stat>
              <StatValue>5</StatValue>
              <span className="text-xs text-text-sub-600">new activities today</span>
            </Stat>
          </CardContent>
        </Card>
      </div>

      {/* Sales trend full-width */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>8,944 · +2.1% vs last week</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <SegmentedControl defaultValue="weekly" size="sm">
              <SegmentedItem value="daily">Daily</SegmentedItem>
              <SegmentedItem value="weekly">Weekly</SegmentedItem>
              <SegmentedItem value="monthly">Monthly</SegmentedItem>
            </SegmentedControl>
            <Button tone="neutral" style="stroke" size="sm">All Products</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={salesChartConfig} className="h-64 w-full">
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="analGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="d" tickLine={false} axisLine={false} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="var(--color-sales)"
                strokeWidth={2}
                fill="url(#analGrad)"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Product perf + Activity feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top product performance</CardTitle>
              <CardDescription>Revenue last 7 days · $1K units</CardDescription>
            </div>
            <Button tone="neutral" style="ghost" size="sm">
              <TrendingUp className="size-4" /> View report
            </Button>
          </CardHeader>
          <CardContent>
            <ChartContainer config={prodChartConfig} className="h-60 w-full">
              <BarChart data={productPerf}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent activities</CardTitle>
              <CardDescription>Today &amp; yesterday</CardDescription>
            </div>
            <SegmentedControl defaultValue="today" size="sm">
              <SegmentedItem value="today">Today</SegmentedItem>
              <SegmentedItem value="yesterday">Yesterday</SegmentedItem>
              <SegmentedItem value="week">This week</SegmentedItem>
            </SegmentedControl>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-stroke-soft-200">
              {activities.map((a) => {
                const Icon = activityIconMap[a.icon]
                return (
                  <li key={a.id} className="flex items-start gap-3 px-6 py-3">
                    <div className="size-8 shrink-0 rounded-lg bg-bg-weak-50 flex items-center justify-center text-text-sub-600">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-text-strong-950 truncate">{a.title}</span>
                        <span className="text-xs text-text-soft-400 shrink-0">{a.timestamp}</span>
                      </div>
                      <p className="text-xs text-text-sub-600 mt-0.5 truncate">{a.subtitle}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
