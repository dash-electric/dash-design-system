"use client"

import * as React from "react"
import {
  RiBankCardLine,
  RiAddLine,
  RiHistoryLine,
  RiArrowRightSLine,
  RiCheckboxCircleFill,
  RiWifiLine,
  RiPieChartLine,
  RiHomeSmileFill,
  RiShoppingCartLine,
  RiLightbulbFlashFill,
  RiCupLine,
  RiPlaneLine,
  RiRestaurantLine,
  RiTicketLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Divider } from "@/registry/dash/ui/divider"
import {
  SegmentedControl,
  SegmentedItem,
} from "@/registry/dash/ui/segmented-control"
import { StatusBadge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Finance Widget — My Cards. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-my-cards.tsx + virtual-card.tsx + physical-card.tsx + transaction-item.tsx
 *
 * Two-tab segmented control: Virtual (2 cards) / Physical (1 card).
 * Each card exposes card #, expiry, CVC, limit + 3-button row (Unhide / Adjust Limit / More) + Recent Transactions block.
 */

type Trx = {
  id: string
  type: "other" | "rent" | "tax" | "phone" | "internet" | "donate" | "electricity" | "gas" | "water"
  name: string
  description: string
  transaction: number
  date: string
  icon: React.ElementType | string
}

const VIRTUAL = [
  {
    id: "savings-card",
    status: "active" as const,
    name: "Savings Card",
    balance: 16058.94,
    cardNumber: "• • • • 1234",
    expiryDate: "06/27",
    cvc: "• • •",
    limit: 12000,
    transactions: [
      { id: "1", type: "other", name: "Stock Dividend", description: "Payment from stock investments.", transaction: 1500, date: "09/15/2024", icon: RiPieChartLine },
      { id: "2", type: "rent", name: "Rental Income", description: "Rental payment from Mr. Dudley.", transaction: 800, date: "09/17/2024", icon: RiHomeSmileFill },
      { id: "3", type: "other", name: "Grocery Shopping", description: "Purchase of monthly groceries.", transaction: -84.14, date: "09/16/2024", icon: RiShoppingCartLine },
    ] as Trx[],
  },
  {
    id: "daily-spending-card",
    status: "inactive" as const,
    name: "Daily Spending Card",
    balance: 11.25,
    cardNumber: "• • • • 6454",
    expiryDate: "11/29",
    cvc: "• • •",
    limit: 675,
    transactions: [
      { id: "4", type: "other", name: "Netflix Cashback", description: "Cashback of September, 2023", transaction: 36.24, date: "09/15/2024", icon: "/images/major-brands/netflix.svg" },
      { id: "5", type: "electricity", name: "Electricity Bills", description: "Payment for electricity bills.", transaction: -72.32, date: "09/17/2024", icon: RiLightbulbFlashFill },
      { id: "6", type: "other", name: "Coffee Shop", description: "Purchase at local coffee shop.", transaction: -4.75, date: "09/18/2024", icon: RiCupLine },
    ] as Trx[],
  },
]

const PHYSICAL = [
  {
    id: "travel-card",
    name: "Travel Card",
    balance: 453.76,
    cardNumber: "• • • • 9876",
    expiryDate: "12/25",
    cvc: "• • •",
    limit: 1000,
    transactions: [
      { id: "p1", type: "other", name: "Flight Booking", description: "Flight reservation to New York.", transaction: -350, date: "09/14/2024", icon: RiPlaneLine },
      { id: "p2", type: "other", name: "Restaurant Dinner", description: "Dinner at a restaurant.", transaction: -45.2, date: "09/16/2024", icon: RiRestaurantLine },
      { id: "p3", type: "other", name: "Movie Tickets", description: "Tickets for a movie screening.", transaction: -25.5, date: "09/17/2024", icon: RiTicketLine },
    ] as Trx[],
  },
]

const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)

export default function FinanceMyCardsWidgetPage() {
  const [tab, setTab] = React.useState("virtual")
  const [vIdx, setVIdx] = React.useState(0)
  const [pIdx, setPIdx] = React.useState(0)

  const v = VIRTUAL[vIdx]
  const p = PHYSICAL[pIdx]

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="My Cards"
        description="Two-tab segmented carousel: Virtual (2 cards) / Physical (1 card). Each card exposes card #, expiry, CVC, spending limit, 3 action buttons, and a Recent Transactions list with framer-motion stagger entry."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Virtual tab — Savings Card"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiBankCardLine className="size-4 text-icon-sub-600" /> My Cards</>}
                action={<Button tone="neutral" style="stroke" size="xs"><RiAddLine /> Add Card</Button>}
              >
                <SegmentedControl value={tab} onValueChange={setTab} size="sm">
                  <SegmentedItem size="sm" value="virtual">Virtual <span className="text-text-soft-400">(2)</span></SegmentedItem>
                  <SegmentedItem size="sm" value="physical">Physical</SegmentedItem>
                </SegmentedControl>

                <div className="mt-4 space-y-4">
                  {tab === "virtual" ? (
                    <>
                      <CardCarousel
                        idx={vIdx}
                        onIdxChange={setVIdx}
                        renderCard={(c) => <VirtualCard {...c} />}
                        cards={VIRTUAL}
                      />
                      <CardDetails
                        cardNumber={v.cardNumber}
                        expiryDate={v.expiryDate}
                        cvc={v.cvc}
                        limit={v.limit}
                      />
                      <ActionRow />
                      <Divider />
                      <RecentTrx transactions={v.transactions} />
                    </>
                  ) : (
                    <>
                      <CardCarousel
                        idx={pIdx}
                        onIdxChange={setPIdx}
                        renderCard={(c) => <PhysicalCard name={c.name ?? "Physical Card"} />}
                        cards={PHYSICAL as any}
                      />
                      <CardDetails
                        cardNumber={p.cardNumber}
                        expiryDate={p.expiryDate}
                        cvc={p.cvc}
                        limit={p.limit}
                      />
                      <ActionRow />
                      <Divider />
                      <RecentTrx transactions={p.transactions} />
                    </>
                  )}
                </div>
              </WidgetShell>
            </div>
          }
          code={`<MyCards
  virtualCards={virtualCardsData}
  physicalCards={physicalCardsData}
  defaultTab="virtual"
/>`}
        />
      </DocsSection>

      <DocsSection title="Physical card">
        <DocsExample
          title="Travel Card · $453.76"
          preview={
            <div className="max-w-sm">
              <PhysicalCard name={PHYSICAL[0].name} />
            </div>
          }
          code={`<PhysicalCard id="travel-card" name="Travel Card" />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No cards"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiBankCardLine className="size-4 text-icon-sub-600" /> My Cards</>}
                action={<Button tone="neutral" style="stroke" size="xs"><RiAddLine /> Add Card</Button>}
              >
                <SegmentedControl size="sm" defaultValue="virtual">
                  <SegmentedItem size="sm" value="virtual">Virtual</SegmentedItem>
                  <SegmentedItem size="sm" value="physical">Physical</SegmentedItem>
                </SegmentedControl>
                <div className="flex flex-col items-center gap-3 p-5 pt-8">
                  <RiBankCardLine className="size-10 text-icon-soft-400" />
                  <p className="text-center text-sm text-text-soft-400">You do not have any cards yet.<br />Click the button to add one.</p>
                  <Button tone="neutral" style="stroke" size="xs"><RiAddLine /> Add Card</Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<MyCardsEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "virtualCards", type: "TypeVirtualCard[]", description: "Source ships 2 virtual cards." },
            { name: "physicalCards", type: "TypePhysicalCard[]", description: "Source ships 1 physical (Travel Card)." },
            { name: "defaultTab", type: '"virtual" | "physical"', defaultValue: '"virtual"', description: "Active segmented control on mount." },
            { name: "onTransactionClick", type: "(trx: Transaction) => void", description: "Click handler for transaction items." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Segmented control</strong> — 2 segments with a count chip on Virtual: <code>Virtual (2)</code>.</li>
          <li><strong>Card details rows</strong> — 4 rows: Card Number / Expiry Date / CVC / Spending Limit. sub-600 label + label-sm strong-950 value.</li>
          <li><strong>Action row</strong> — 3-up `Unhide / Adjust Limit / More` xsmall neutral-stroke buttons, equal basis.</li>
          <li><strong>Recent Transactions</strong> — uppercase subheading-xs caption + transaction-item rows + full-width neutral-stroke "See All Transactions" with history icon.</li>
          <li><strong>Transaction item</strong> — 40px tinted icon bubble + name/description (truncated) + amount + date + chevron CompactButton.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function WidgetShell({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2 min-h-8 mb-3">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function CardCarousel<T extends { id: string; name?: string }>({
  idx,
  onIdxChange,
  cards,
  renderCard,
}: {
  idx: number
  onIdxChange: (i: number) => void
  cards: T[]
  renderCard: (c: T) => React.ReactNode
}) {
  const current = cards[idx]
  return (
    <div className="space-y-2">
      {renderCard(current)}
      {cards.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => onIdxChange(i)}
              aria-label={`Show card ${i + 1}`}
              className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-6 bg-text-strong-950" : "w-1.5 bg-bg-soft-200")}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function VirtualCard({
  status,
  name,
  balance,
}: {
  id: string
  status: "active" | "inactive"
  name: string
  balance: number
}) {
  return (
    <div className="relative mx-auto flex h-[188px] w-full max-w-96 shrink-0 flex-col gap-3 rounded-2xl bg-bg-white-0 p-5 pb-4 ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-bg-weak-50 text-[10px] font-bold uppercase text-text-sub-600">APX</span>
            <RiWifiLine className="size-6 rotate-90 text-text-soft-400" />
          </div>
          {status === "active" ? (
            <StatusBadge status="success" variant="icon-stroke" icon={<RiCheckboxCircleFill />}>Active</StatusBadge>
          ) : (
            <StatusBadge status="faded" variant="icon-stroke" icon={<RiCheckboxCircleFill />}>Inactive</StatusBadge>
          )}
        </div>
        <span className="inline-flex h-5 items-center rounded-sm bg-bg-strong-950 px-1.5 text-[10px] font-bold uppercase text-static-white">MC</span>
      </div>
      <div className="mt-auto flex flex-col gap-1">
        <div className="text-xs text-text-sub-600">{name}</div>
        <div className="text-2xl font-medium tabular-nums text-text-strong-950">{fmt(balance)}</div>
      </div>
    </div>
  )
}

function PhysicalCard({ name }: { name: string }) {
  return (
    <div className="relative mx-auto flex h-[188px] w-full max-w-96 shrink-0 flex-col justify-between rounded-2xl bg-gradient-to-br from-bg-strong-950 to-bg-surface-800 p-5 text-static-white shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider opacity-70">{name}</span>
        <span className="inline-flex h-5 items-center rounded-sm bg-static-white/15 px-1.5 text-[10px] font-bold uppercase">MC</span>
      </div>
      <div className="text-[10px] tracking-[0.4em] opacity-90 font-mono">•••• •••• •••• 9876</div>
      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <div className="text-[9px] uppercase tracking-wider opacity-60">Cardholder</div>
          <div className="text-xs">Irfan P.</div>
        </div>
        <div className="space-y-0.5 text-right">
          <div className="text-[9px] uppercase tracking-wider opacity-60">Exp</div>
          <div className="text-xs">12/25</div>
        </div>
      </div>
    </div>
  )
}

function CardDetails({
  cardNumber,
  expiryDate,
  cvc,
  limit,
}: {
  cardNumber: string
  expiryDate: string
  cvc: string
  limit: number
}) {
  return (
    <div className="flex flex-col gap-3">
      <DetailRow label="Card Number" value={cardNumber} />
      <DetailRow label="Expiry Date" value={expiryDate} />
      <DetailRow label="CVC" value={cvc} />
      <DetailRow label="Spending Limit" value={fmt(limit)} />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-text-sub-600">{label}</span>
      <span className="text-xs font-medium text-text-strong-950 tabular-nums">{value}</span>
    </div>
  )
}

function ActionRow() {
  return (
    <div className="flex gap-3">
      <Button tone="neutral" style="stroke" size="xs" className="basis-full">Unhide</Button>
      <Button tone="neutral" style="stroke" size="xs" className="basis-full">Adjust Limit</Button>
      <Button tone="neutral" style="stroke" size="xs" className="basis-full">More</Button>
    </div>
  )
}

function RecentTrx({ transactions }: { transactions: Trx[] }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-soft-400">Recent Transactions</div>
      <div className="mt-2 flex flex-col gap-1.5">
        {transactions.map((t) => <TrxItem key={t.id} trx={t} />)}
      </div>
      <Button tone="neutral" style="stroke" size="sm" className="mt-3 w-full"><RiHistoryLine /> See All Transactions</Button>
    </div>
  )
}

const TYPE_BG: Record<string, string> = {
  other: "bg-bg-white-0 text-text-sub-600 shadow-sm ring-1 ring-inset ring-stroke-soft-200",
  rent: "bg-success-lighter text-success-base",
  tax: "bg-feature-lighter text-feature-base",
  phone: "bg-warning-lighter text-warning-base",
  internet: "bg-information-lighter text-information-base",
  donate: "bg-highlighted-lighter text-highlighted-base",
  electricity: "bg-away-lighter text-away-base",
  gas: "bg-error-lighter text-error-base",
  water: "bg-verified-lighter text-verified-base",
}

function TrxItem({ trx }: { trx: Trx }) {
  const Icon = typeof trx.icon === "string" ? null : (trx.icon as React.ElementType)
  return (
    <div className="flex w-full items-center gap-3 rounded-xl py-2 text-left transition hover:bg-bg-weak-50">
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", TYPE_BG[trx.type] ?? TYPE_BG.other)}>
        {Icon ? <Icon className="size-5" /> : <img src={trx.icon as string} alt="" className="size-6" />}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="truncate text-sm font-medium text-text-strong-950">{trx.name}</div>
        <div className="truncate text-[11px] text-text-sub-600">{trx.description}</div>
      </div>
      <div className="space-y-0.5 text-right">
        <div className={cn("text-sm font-medium tabular-nums", trx.transaction < 0 ? "text-text-strong-950" : "text-text-strong-950")}>{fmt(trx.transaction)}</div>
        <div className="text-[11px] text-text-sub-600">{trx.date}</div>
      </div>
      <CompactButton variant="ghost" size="md" aria-label="Open transaction"><RiArrowRightSLine /></CompactButton>
    </div>
  )
}
