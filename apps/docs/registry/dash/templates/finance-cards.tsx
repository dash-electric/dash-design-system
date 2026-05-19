"use client"

import * as React from "react"
import { RiMoreLine as MoreHorizontal, RiAddLine as Plus, RiSearchLine as Search, RiEqualizerLine as SlidersHorizontal, RiArrowUpDownLine as ArrowDownUp } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { cn } from "@/registry/dash/lib/utils"

/**
 * FinanceCards — port of AlignUI Pro Figma frame "My Cards [Finance & Banking]"
 * (node 3965:42989).
 *
 * Structure:
 *  - Page header: "My Cards" + subtitle + period select + Schedule/Move Money.
 *  - Filter row: SegmentedControl [All | Virtual | Physical] + search + Filter + Sort by.
 *  - Card grid: 3-up responsive grid of card tiles (virtual or physical),
 *    each tile = gradient card preview + status badge + footer details.
 *
 * Pixel parity is approximate; structural parity matches Figma.
 */

export type FinanceCardItem = {
  id: string
  kind: "Virtual" | "Physical"
  label: string
  status: "Active" | "Expired" | "Frozen"
  balance: number
  cardNumberLast4: string
  expiry: string
  cardholderName?: string
}

export type FinanceCardsProps = {
  title?: string
  subtitle?: string
  cards?: FinanceCardItem[]
  className?: string
}

const defaultCards: FinanceCardItem[] = [
  { id: "c1", kind: "Virtual", label: "Savings Card", status: "Active", balance: 16058.94, cardNumberLast4: "1234", expiry: "06/27" },
  { id: "c2", kind: "Virtual", label: "Traveling Card", status: "Expired", balance: 16058.94, cardNumberLast4: "2345", expiry: "04/23" },
  { id: "c3", kind: "Physical", label: "Arthur Taylor", status: "Active", balance: 0, cardNumberLast4: "3456", expiry: "08/28", cardholderName: "Arthur Taylor" },
]

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)

function statusToBadge(s: FinanceCardItem["status"]) {
  if (s === "Active") return { status: "success" as const, appearance: "lighter" as const }
  if (s === "Expired") return { status: "error" as const, appearance: "lighter" as const }
  return { status: "warning" as const, appearance: "lighter" as const }
}

export function FinanceCards({
  title = "My Cards",
  subtitle = "Organize and access your payment cards.",
  cards = defaultCards,
  className,
}: FinanceCardsProps) {
  const [filter, setFilter] = React.useState<"all" | "virtual" | "physical">("all")

  const filtered = cards.filter((c) =>
    filter === "all" ? true : filter === "virtual" ? c.kind === "Virtual" : c.kind === "Physical",
  )

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">{title}</h1>
          <p className="text-sm text-text-sub-600">{subtitle}</p>
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
          <Button style="stroke" tone="neutral" size="md">Schedule</Button>
          <Button size="md">
            <Plus className="size-4" /> Add Card
          </Button>
        </div>
      </div>

      <Divider />

      {/* Filter row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          value={filter}
          onValueChange={(v: string) => v && setFilter(v as typeof filter)}
        >
          <SegmentedItem value="all">All</SegmentedItem>
          <SegmentedItem value="virtual">Virtual</SegmentedItem>
          <SegmentedItem value="physical">Physical</SegmentedItem>
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

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const badge = statusToBadge(c.status)
          const isPhysical = c.kind === "Physical"
          return (
            <Card key={c.id} padding="md">
              <CardContent className="p-0 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-text-strong-950">{c.kind} Card</h3>
                    <Badge appearance="stroke" status="neutral" size="sm">Details</Badge>
                  </div>
                  <Button style="ghost" tone="neutral" size="icon-xs" aria-label="More options">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
                {/* Card preview */}
                <div
                  className={cn(
                    "relative overflow-hidden rounded-xl p-4 text-static-white",
                    isPhysical
                      ? "bg-gradient-to-br from-bg-strong-950 via-(--dash-neutral-700) to-bg-surface-800"
                      : c.status === "Expired"
                      ? "bg-gradient-to-br from-(--dash-neutral-500) via-(--dash-neutral-600) to-(--dash-neutral-800)"
                      : "bg-gradient-to-br from-(--dash-purple-700) via-(--dash-purple-500) to-(--dash-purple-900)",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <Badge appearance={badge.appearance} status={badge.status} size="sm">{c.status}</Badge>
                    <div className="size-8 rounded-full bg-static-white/15" aria-hidden />
                  </div>
                  <p className="mt-3 text-2xl font-semibold tabular-nums">{fmtUSD(c.balance)}</p>
                  <p className="mt-0.5 text-xs opacity-80">{c.label}</p>
                  <div className="mt-6 grid grid-cols-3 gap-2 text-[11px] opacity-90">
                    <div>
                      <p className="opacity-70">{isPhysical ? "Cardholder" : "Card Number"}</p>
                      <p className="tracking-wider">
                        {isPhysical ? (c.cardholderName ?? "—") : `•••• ${c.cardNumberLast4}`}
                      </p>
                    </div>
                    <div>
                      <p className="opacity-70">Expiry</p>
                      <p className="">{c.expiry}</p>
                    </div>
                    <div>
                      <p className="opacity-70">CVC</p>
                      <p className="">•••</p>
                    </div>
                  </div>
                </div>
                {/* Footer details */}
                <div className="grid grid-cols-3 gap-2 text-xs text-text-sub-600">
                  <div>
                    <p className="uppercase tracking-wider">Number</p>
                    <p className="text-text-strong-950 font-medium">•••• {c.cardNumberLast4}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider">Expiry</p>
                    <p className="text-text-strong-950 font-medium">{c.expiry}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider">CVC</p>
                    <p className="text-text-strong-950 font-medium">•••</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
