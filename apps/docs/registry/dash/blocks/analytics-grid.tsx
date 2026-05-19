"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/registry/dash/ui/card"
import { Stat, StatLabel, StatValue, StatTrend } from "@/registry/dash/ui/stat"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/dash/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart } from "recharts"
import { cn } from "@/registry/dash/lib/utils"

const dispatchTrend = [
  { d: "Sen", v: 880 },
  { d: "Sel", v: 1020 },
  { d: "Rab", v: 980 },
  { d: "Kam", v: 1180 },
  { d: "Jum", v: 1340 },
  { d: "Sab", v: 1410 },
  { d: "Min", v: 1284 },
]

const tribeRevenue = [
  { tribe: "Reservasi", v: 18.4 },
  { tribe: "Express",   v: 12.2 },
  { tribe: "Bulk",      v: 24.8 },
]

const areaCfg = { v: { label: "Dispatch", color: "var(--dash-purple-500)" } } satisfies ChartConfig
const barCfg = { v: { label: "Revenue Jt", color: "var(--dash-blue-500)" } } satisfies ChartConfig

export type AnalyticsGridProps = {
  className?: string
}

/** Analytics grid — Chart + Stat combo, 2-column on desktop. */
export function AnalyticsGrid({ className }: AnalyticsGridProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <Stat>
            <StatLabel>Dispatch this week</StatLabel>
            <StatValue>8,094</StatValue>
            <StatTrend trend="up" value="+18%">vs last week</StatTrend>
          </Stat>
        </Card>
        <Card>
          <Stat>
            <StatLabel>Active mitra</StatLabel>
            <StatValue>734</StatValue>
            <StatTrend trend="up" value="+24">7-day</StatTrend>
          </Stat>
        </Card>
        <Card>
          <Stat>
            <StatLabel>Revenue (Jt)</StatLabel>
            <StatValue>Rp 55.4</StatValue>
            <StatTrend trend="up" value="+12%">vs last week</StatTrend>
          </Stat>
        </Card>
        <Card>
          <Stat>
            <StatLabel>Avg trip</StatLabel>
            <StatValue>Rp 78.5k</StatValue>
            <StatTrend trend="down" value="-2.1%">vs last week</StatTrend>
          </Stat>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Dispatch trend</CardTitle>
            <CardDescription>Daily dispatched · 7d</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaCfg} className="h-56 w-full">
              <AreaChart data={dispatchTrend}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="d" tickLine={false} axisLine={false} />
                <Area type="monotone" dataKey="v" stroke="var(--color-v)" fill="var(--color-v)" fillOpacity={0.2} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue per tribe</CardTitle>
            <CardDescription>Last 7d, in Juta IDR</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barCfg} className="h-56 w-full">
              <BarChart data={tribeRevenue}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="tribe" tickLine={false} axisLine={false} />
                <Bar dataKey="v" fill="var(--color-v)" radius={[4, 4, 0, 0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
