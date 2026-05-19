"use client"

import * as React from "react"
import { RiArrowUpCircleLine as TrendingUp, RiArrowDownCircleLine as TrendingDown, RiFocus3Line as Target, RiMoneyDollarCircleLine as DollarSign, RiPulseLine as Activity, RiPercentLine as Percent } from "@remixicon/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/registry/dash/ui/card"
import { Stat, StatLabel, StatValue, StatTrend } from "@/registry/dash/ui/stat"
import { Badge } from "@/registry/dash/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/dash/ui/chart"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts"
import { cn } from "@/registry/dash/lib/utils"

export type SessionRow = {
  session: "Asia" | "London" | "NY"
  trades: number
  pnl: number
  winRate: number
  expectancy: number
  maxDD: number
  pf: number
}

export type EquityPoint = { day: string; equity: number }

const defaultSessions: SessionRow[] = [
  { session: "Asia",   trades: 41, pnl: 408,  winRate: 41.2, expectancy: 0.28, maxDD: -58,  pf: 1.18 },
  { session: "London", trades: 38, pnl: 1085, winRate: 44.8, expectancy: 0.62, maxDD: -86,  pf: 1.42 },
  { session: "NY",     trades: 47, pnl: 664,  winRate: 42.4, expectancy: 0.34, maxDD: -116, pf: 1.26 },
]

const defaultEquity: EquityPoint[] = [
  { day: "W1",  equity: 0 },
  { day: "W2",  equity: 88 },
  { day: "W4",  equity: 142 },
  { day: "W6",  equity: 218 },
  { day: "W8",  equity: 312 },
  { day: "W10", equity: 408 },
  { day: "W12", equity: 488 },
  { day: "W14", equity: 612 },
  { day: "W16", equity: 720 },
  { day: "W18", equity: 884 },
  { day: "W20", equity: 1020 },
  { day: "W22", equity: 1248 },
  { day: "W24", equity: 1480 },
  { day: "W26", equity: 1720 },
  { day: "W28", equity: 1928 },
  { day: "W30", equity: 2157 },
]

export type Phase7ResultsPageProps = {
  /** Iteration label e.g. Phase 51 HYBRID. */
  iteration?: string
  totalPnl?: number
  totalTrades?: number
  totalWinRate?: number
  totalExpectancy?: number
  maxDrawdown?: number
  worstDay?: number
  sessions?: SessionRow[]
  equity?: EquityPoint[]
  className?: string
}

const chartConfig = {
  equity: { label: "Equity (pts)", color: "var(--dash-purple-500)" },
} satisfies ChartConfig

const fmtPts = (n: number) => `${n >= 0 ? "+" : ""}${n.toLocaleString("en-US")}`

/**
 * Phase7ResultsPage — analytics-heavy dashboard for PT Box phase7 results.
 * Stat grid header + equity timeline + per-session breakdown table.
 */
export function Phase7ResultsPage({
  iteration = "Phase 51 · HYBRID per-session",
  totalPnl = 2157,
  totalTrades = 126,
  totalWinRate = 42.8,
  totalExpectancy = 0.41,
  maxDrawdown = -480,
  worstDay = -116,
  sessions = defaultSessions,
  equity = defaultEquity,
  className,
}: Phase7ResultsPageProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Hero */}
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-soft-400">PT Box · Phase 7 Results</div>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">{iteration}</h1>
          <p className="text-sm text-text-sub-600 mt-1">XAUUSD M1 · 5y backtest · Trump-2 era</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge appearance="lighter" status="success">Holdout PASS</Badge>
          <Badge appearance="lighter" status="information">7× iron law</Badge>
        </div>
      </header>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="col-span-2">
          <Stat>
            <StatLabel className="inline-flex items-center gap-1.5"><DollarSign className="size-3.5" /> Total PnL</StatLabel>
            <StatValue className={cn(totalPnl >= 0 ? "text-state-success-base" : "text-state-error-base")}>
              {fmtPts(totalPnl)} pts
            </StatValue>
            <StatTrend trend={totalPnl >= 0 ? "up" : "down"} value="5y">4× current baseline</StatTrend>
          </Stat>
        </Card>
        <Card>
          <Stat>
            <StatLabel className="inline-flex items-center gap-1.5"><Activity className="size-3.5" /> Trades</StatLabel>
            <StatValue>{totalTrades}</StatValue>
            <StatTrend trend="neutral" value="n">5y sample</StatTrend>
          </Stat>
        </Card>
        <Card>
          <Stat>
            <StatLabel className="inline-flex items-center gap-1.5"><Percent className="size-3.5" /> Win rate</StatLabel>
            <StatValue>{totalWinRate}%</StatValue>
            <StatTrend trend="up" value="+0.7pt">vs baseline</StatTrend>
          </Stat>
        </Card>
        <Card>
          <Stat>
            <StatLabel className="inline-flex items-center gap-1.5"><Target className="size-3.5" /> Expectancy</StatLabel>
            <StatValue>{totalExpectancy}R</StatValue>
            <StatTrend trend="up" value="positive">per trade</StatTrend>
          </Stat>
        </Card>
        <Card>
          <Stat>
            <StatLabel className="inline-flex items-center gap-1.5"><TrendingDown className="size-3.5" /> Max DD</StatLabel>
            <StatValue className="text-state-error-base">{maxDrawdown} pts</StatValue>
            <StatTrend trend="down" value={`worst ${worstDay}`}>single day</StatTrend>
          </Stat>
        </Card>
      </div>

      {/* Equity curve */}
      <Card>
        <CardHeader>
          <CardTitle>Equity curve</CardTitle>
          <CardDescription>Cumulative PnL points · weekly snapshots</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <AreaChart data={equity}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-equity)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-equity)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={50} />
              <ReferenceLine y={0} stroke="var(--stroke-soft-200)" />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="var(--color-equity)"
                strokeWidth={2}
                fill="url(#equityGrad)"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Per-session breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Per-session breakdown</CardTitle>
          <CardDescription>Asia · London · NY — apples-to-apples</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-weak-50 text-left">
                <tr>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600">Session</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">Trades</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">PnL (pts)</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">Win %</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">Exp. R</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">Max DD</th>
                  <th className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-text-sub-600 text-right">PF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-soft-200">
                {sessions.map((s) => (
                  <tr key={s.session} className="hover:bg-bg-weak-50/50">
                    <td className="px-6 py-3">
                      <Badge appearance="lighter" status={s.session === "London" ? "success" : "information"}>{s.session}</Badge>
                    </td>
                    <td className="px-6 py-3 text-right">{s.trades}</td>
                    <td className={cn(
                      "px-6 py-3 text-right font-semibold",
                      s.pnl >= 0 ? "text-state-success-base" : "text-state-error-base"
                    )}>
                      <span className="inline-flex items-center gap-1 justify-end">
                        {s.pnl >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                        {fmtPts(s.pnl)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">{s.winRate}%</td>
                    <td className="px-6 py-3 text-right">{s.expectancy}R</td>
                    <td className="px-6 py-3 text-right text-state-error-base">{s.maxDD}</td>
                    <td className="px-6 py-3 text-right">{s.pf}</td>
                  </tr>
                ))}
                <tr className="bg-bg-weak-50 font-semibold">
                  <td className="px-6 py-3 text-text-strong-950">Total</td>
                  <td className="px-6 py-3 text-right">{sessions.reduce((s, r) => s + r.trades, 0)}</td>
                  <td className="px-6 py-3 text-right text-state-success-base">{fmtPts(sessions.reduce((s, r) => s + r.pnl, 0))}</td>
                  <td className="px-6 py-3 text-right">{totalWinRate}%</td>
                  <td className="px-6 py-3 text-right">{totalExpectancy}R</td>
                  <td className="px-6 py-3 text-right text-state-error-base">{maxDrawdown}</td>
                  <td className="px-6 py-3 text-right">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pain metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Worst single day</CardTitle>
            <CardDescription>Realized closed PnL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-state-error-base">{worstDay} pts</div>
            <div className="text-xs text-text-sub-600 mt-1">≈ -$58 at 0.02 lot</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Days with loss &gt; $50</CardTitle>
            <CardDescription>5y daily distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">5.4%</div>
            <div className="text-xs text-text-sub-600 mt-1">68 of 1260 trading days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Days with win &gt; $50</CardTitle>
            <CardDescription>5y daily distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-state-success-base">12.9%</div>
            <div className="text-xs text-text-sub-600 mt-1">163 of 1260 trading days</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
