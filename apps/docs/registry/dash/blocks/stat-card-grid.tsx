"use client"

import * as React from "react"
import { Card } from "@/registry/dash/ui/card"
import { Stat, StatLabel, StatValue, StatTrend } from "@/registry/dash/ui/stat"
import { cn } from "@/registry/dash/lib/utils"

export type StatTile = {
  label: string
  value: string
  trend?: "up" | "down" | "neutral"
  delta?: string
  context?: string
}

const defaults: StatTile[] = [
  { label: "Mitra aktif",         value: "734",       trend: "up",   delta: "+12",   context: "7-day" },
  { label: "Dispatch terkirim",   value: "1,284",     trend: "up",   delta: "12.4%", context: "vs kemarin" },
  { label: "Avg rate per trip",   value: "Rp 78.5k",  trend: "down", delta: "-2.1%", context: "vs last week" },
  { label: "SLA compliance",      value: "92%",       trend: "up",   delta: "+3pt",  context: "target 85%" },
]

export type StatCardGridProps = {
  tiles?: StatTile[]
  /** Tiles per row (responsive 1 → cols on lg). Default 4. */
  cols?: 3 | 4
  className?: string
}

/** Stat card grid — 3-4 KPI tiles in responsive layout. */
export function StatCardGrid({ tiles = defaults, cols = 4, className }: StatCardGridProps) {
  const grid = cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"
  return (
    <div className={cn("grid gap-4", grid, className)}>
      {tiles.map((t, i) => (
        <Card key={i}>
          <Stat>
            <StatLabel>{t.label}</StatLabel>
            <StatValue>{t.value}</StatValue>
            {t.trend && t.delta ? (
              <StatTrend trend={t.trend} value={t.delta}>{t.context ?? ""}</StatTrend>
            ) : null}
          </Stat>
        </Card>
      ))}
    </div>
  )
}
