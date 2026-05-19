"use client"

import * as React from "react"
import { RiBankCardLine as CreditCard, RiEyeLine as Eye, RiEyeOffLine as EyeOff } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"

export type PayoutCard = {
  id: string
  brand: "BCA" | "Mandiri" | "GoPay" | "DANA"
  last4: string
  holder: string
  balance: number
  primary?: boolean
}

const defaults: PayoutCard[] = [
  { id: "c1", brand: "BCA",    last4: "4421", holder: "Sigit Prabowo", balance: 2_485_000, primary: true },
  { id: "c2", brand: "GoPay",  last4: "8842", holder: "Sigit Prabowo", balance: 412_500 },
  { id: "c3", brand: "DANA",   last4: "1102", holder: "Sigit Prabowo", balance: 88_000 },
]

const brandGradient = {
  BCA:     "from-(--dash-blue-600) to-(--dash-blue-900)",
  Mandiri: "from-(--dash-purple-600) to-(--dash-purple-900)",
  GoPay:   "from-(--dash-green-600) to-(--dash-green-900)",
  DANA:    "from-(--dash-sky-500) to-(--dash-blue-800)",
}

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n)

export type MyCardsStackProps = {
  cards?: PayoutCard[]
  className?: string
}

/** Payout cards stack — banking-card visualization for mitra payout methods. */
export function MyCardsStack({ cards = defaults, className }: MyCardsStackProps) {
  const [hidden, setHidden] = React.useState(true)
  const [activeIdx, setActiveIdx] = React.useState(0)
  const active = cards[activeIdx] ?? cards[0]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Featured card */}
      <div className={cn(
        "relative aspect-[1.6/1] w-full max-w-sm rounded-2xl bg-gradient-to-br p-6 text-text-white-0 shadow-custom-lg overflow-hidden",
        brandGradient[active.brand]
      )}>
        <div className="absolute -top-10 -right-10 size-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 size-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest opacity-70">{active.brand}</div>
              {active.primary ? <Badge appearance="lighter" status="information" className="bg-white/15 text-text-white-0 border-white/20">Primary</Badge> : null}
            </div>
            <CreditCard className="size-7 opacity-80" />
          </div>
          <div className="space-y-3">
            <div className="text-2xl tracking-widest">
              •••• •••• •••• {hidden ? "••••" : active.last4}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs opacity-70">Holder</div>
                <div className="text-sm font-medium uppercase tracking-wide">{active.holder}</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70">Balance</div>
                <div className="text-lg font-semibold">{hidden ? "Rp •••••" : `Rp ${fmt(active.balance)}`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button tone="neutral" style="stroke" size="sm" onClick={() => setHidden((h) => !h)}>
          {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          {hidden ? "Tampilkan" : "Sembunyikan"}
        </Button>
        <Button tone="primary" style="filled" size="sm">Cash out</Button>
      </div>

      {/* Stack — other cards */}
      <ul className="space-y-2">
        {cards.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => setActiveIdx(i)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                i === activeIdx
                  ? "border-(--dash-purple-500) bg-(--dash-purple-50) dark:bg-(--dash-purple-950)/40"
                  : "border-stroke-soft-200 hover:bg-bg-weak-50"
              )}
            >
              <div className={cn("size-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-text-white-0", brandGradient[c.brand])}>
                <CreditCard className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-strong-950">{c.brand}</div>
                <div className="text-xs text-text-soft-400">•••• {c.last4}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">Rp {fmt(c.balance)}</div>
                {c.primary ? <Badge appearance="lighter" status="information">Primary</Badge> : null}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
