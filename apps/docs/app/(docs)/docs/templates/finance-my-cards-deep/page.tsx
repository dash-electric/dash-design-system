"use client"

import * as React from "react"
import {
  RiBankCardLine,
  RiCupLine,
  RiFilter3Fill,
  RiHistoryLine,
  RiHomeSmileFill,
  RiLightbulbFlashFill,
  RiPieChartLine,
  RiPlaneLine,
  RiRestaurantLine,
  RiSearch2Line,
  RiShoppingCartLine,
  RiSortDesc,
  RiTicketLine,
  RiWifiLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Badge, StatusBadge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { Divider } from "@/registry/dash/ui/divider"
import {
  InputRoot,
  Input,
  InputIcon,
} from "@/registry/dash/ui/input"
import { Kbd } from "@/registry/dash/ui/kbd"
import {
  SegmentedControl,
  SegmentedItem,
} from "@/registry/dash/ui/segmented-control"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { cn } from "@/registry/dash/lib/utils"
import {
  FinanceAppShell,
  FinanceHeader,
  MoveMoneyButton,
} from "@/registry/dash/templates/_internal/finance-app-shell"

/* -------------------------------------------------------------------------- *
 *  Finance My Cards (Deep) — full Apex `/my-cards` page preview              *
 *  Mirrors `template-finance-master/app/(main)/my-cards/page.tsx`:           *
 *  • Header (RiBankCardLine icon, "My Cards" + subtitle, Move Money CTA)     *
 *  • Filter row (SegmentedControl All/Virtual/Physical, search, sort)        *
 *  • Card grid — 3 cards (2 virtual + 1 physical) w/ verbatim source data    *
 *    + CardBox shell (icon + title + Details button + meta)                   *
 *  • Transaction history side panel (mirrors the detail drawer body)          *
 * -------------------------------------------------------------------------- */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n)

/* ───────────────────────────── Virtual Card ─────────────────────────────── */
function VirtualCard({
  status,
  name,
  balance,
  logo,
}: {
  status: "active" | "inactive"
  name: string
  balance: number
  logo: { letter: string; bg: string; fg: string }
}) {
  return (
    <div className="relative h-[188px] w-full overflow-hidden rounded-2xl bg-bg-white-0 p-5 ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                logo.bg,
                logo.fg,
              )}
            >
              {logo.letter}
            </div>
            <RiWifiLine className="size-6 rotate-90 text-text-soft-400" />
          </div>
          {status === "active" ? (
            <StatusBadge variant="dot-stroke" status="success">
              Active
            </StatusBadge>
          ) : (
            <StatusBadge variant="dot-stroke" status="neutral">
              Inactive
            </StatusBadge>
          )}
        </div>
        <div className="grid size-8 place-items-center rounded bg-(--dash-orange-100) text-[9px] font-bold text-(--dash-orange-700)">
          MC
        </div>
      </div>
      <div className="mt-auto absolute bottom-5 left-5 flex flex-col gap-1">
        <div className="text-xs text-text-sub-600">{name}</div>
        <div className="text-2xl font-semibold tabular-nums text-text-strong-950">
          {fmtUSD(balance)}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────── Physical Card ─────────────────────────────── */
function PhysicalCard({ name }: { name: string }) {
  return (
    <div className="relative h-[188px] w-full overflow-hidden rounded-2xl bg-text-strong-950 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Embossed chip */}
            <div className="grid h-6 w-8 place-items-center rounded-[3px] bg-gradient-to-br from-(--dash-yellow-300) via-(--dash-yellow-500) to-(--dash-orange-500)">
              <div className="h-3 w-5 rounded-sm bg-(--dash-yellow-200)/40 ring-1 ring-(--dash-yellow-700)/30" />
            </div>
            <RiWifiLine className="size-6 rotate-90 text-text-soft-400" />
          </div>
        </div>
        <div className="grid size-8 place-items-center rounded bg-(--dash-orange-100) text-[9px] font-bold text-(--dash-orange-700)">
          MC
        </div>
      </div>
      <div className="mt-auto absolute bottom-5 left-5 flex flex-col gap-1">
        <div className="text-xs text-text-soft-400">Cardholder Name</div>
        <div className="text-base font-semibold text-static-white">{name}</div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Card Box Wrapper ───────────────────────────── */
function CardBox({
  title,
  cardNumber,
  expiry,
  cvc,
  active,
  onSelect,
  children,
}: {
  title: string
  cardNumber: string
  expiry: string
  cvc: string
  active?: boolean
  onSelect?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-2xl bg-bg-white-0 p-4 ring-1 ring-inset transition-shadow",
        active
          ? "ring-(--dash-purple-500) shadow-md"
          : "ring-stroke-soft-200 hover:ring-stroke-strong-950/30",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RiBankCardLine className="size-6 shrink-0 text-text-sub-600" />
          <span className="text-sm font-medium text-text-strong-950">
            {title}
          </span>
        </div>
        <Button size="xs" style="stroke" tone="neutral" onClick={onSelect}>
          Details
        </Button>
      </div>
      {children}
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Card Number</span>
          <span className="tabular-nums text-text-strong-950">{cardNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Expiry Date</span>
          <span className="tabular-nums text-text-strong-950">{expiry}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">CVC</span>
          <span className="text-text-strong-950">{cvc}</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────── Cards data (verbatim source) ───────────────────── */
const SAVINGS_CARD = {
  type: "virtual" as const,
  status: "active" as const,
  name: "Savings Card",
  balance: 16058.94,
  cardNumber: "• • • • 1234",
  expiry: "06/27",
  cvc: "• • •",
  limit: 12000.0,
  logo: {
    letter: "A",
    bg: "bg-(--dash-purple-600)",
    fg: "text-static-white",
  },
  recentTransactions: [
    {
      id: "2441c347",
      name: "Stock Dividend",
      desc: "Payment from stock investments.",
      amount: 1500,
      direction: "in" as const,
      date: "Sep 15",
      icon: RiPieChartLine,
    },
    {
      id: "ab193fd6",
      name: "Rental Income",
      desc: "Rental payment from Mr. Dudley.",
      amount: 800,
      direction: "in" as const,
      date: "Sep 17",
      icon: RiHomeSmileFill,
    },
    {
      id: "7a2dc594",
      name: "Grocery Shopping",
      desc: "Purchase of monthly groceries.",
      amount: 84.14,
      direction: "out" as const,
      date: "Sep 16",
      icon: RiShoppingCartLine,
    },
  ],
}

const DAILY_CARD = {
  type: "virtual" as const,
  status: "inactive" as const,
  name: "Daily Spending Card",
  balance: 11.25,
  cardNumber: "• • • • 6454",
  expiry: "11/29",
  cvc: "• • •",
  limit: 675.0,
  logo: {
    letter: "S",
    bg: "bg-(--dash-blue-100)",
    fg: "text-(--dash-blue-700)",
  },
  recentTransactions: [
    {
      id: "f869c5a7",
      name: "Netflix Cashback",
      desc: "Cashback of September, 2023",
      amount: 36.24,
      direction: "in" as const,
      date: "Sep 15",
      icon: RiPieChartLine,
    },
    {
      id: "789d6ef4",
      name: "Electricity Bills",
      desc: "Payment for electricity bills.",
      amount: 72.32,
      direction: "out" as const,
      date: "Sep 17",
      icon: RiLightbulbFlashFill,
    },
    {
      id: "d1f9a9e8",
      name: "Coffee Shop",
      desc: "Purchase at local coffee shop.",
      amount: 4.75,
      direction: "out" as const,
      date: "Sep 18",
      icon: RiCupLine,
    },
  ],
}

const TRAVEL_CARD = {
  type: "physical" as const,
  name: "Travel Card",
  cardholderName: "Arthur Taylor",
  balance: 453.76,
  cardNumber: "• • • • 9876",
  expiry: "12/25",
  cvc: "• • •",
  limit: 1000.0,
  recentTransactions: [
    {
      id: "b2a7e6d5",
      name: "Flight Booking",
      desc: "Flight reservation to New York.",
      amount: 350.0,
      direction: "out" as const,
      date: "Sep 14",
      icon: RiPlaneLine,
    },
    {
      id: "d3b5c8a4",
      name: "Restaurant Dinner",
      desc: "Dinner at a restaurant.",
      amount: 45.2,
      direction: "out" as const,
      date: "Sep 16",
      icon: RiRestaurantLine,
    },
    {
      id: "e4f6d7c8",
      name: "Movie Tickets",
      desc: "Tickets for a movie screening.",
      amount: 25.5,
      direction: "out" as const,
      date: "Sep 17",
      icon: RiTicketLine,
    },
  ],
}

type CardLike =
  | typeof SAVINGS_CARD
  | typeof DAILY_CARD
  | typeof TRAVEL_CARD

/* ────────────────────────── Filters bar (replica) ───────────────────────── */
function Filters({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-3">
      <SegmentedControl
        value={value}
        onValueChange={(v: string) => v && onChange(v)}
        className="w-80"
      >
        <SegmentedItem value="all">All</SegmentedItem>
        <SegmentedItem value="virtual">Virtual</SegmentedItem>
        <SegmentedItem value="physical">Physical</SegmentedItem>
      </SegmentedControl>

      <div className="flex flex-wrap gap-3">
        <InputRoot size="sm" className="w-[300px]">
          <InputIcon>
            <RiSearch2Line />
          </InputIcon>
          <Input placeholder="Search..." />
          <Kbd className="mr-1 text-[10px]">⌘1</Kbd>
        </InputRoot>

        <Button size="sm" style="stroke" tone="neutral">
          <RiFilter3Fill className="size-4" />
          Filter
        </Button>

        <Select>
          <SelectTrigger className="h-8 w-[140px]">
            <RiSortDesc className="size-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">ASC</SelectItem>
            <SelectItem value="desc">DESC</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

/* ─────────────────────── Transaction history side panel ─────────────────── */
function TransactionHistoryPanel({ card }: { card: CardLike }) {
  return (
    <aside className="flex w-[400px] shrink-0 flex-col gap-4 rounded-2xl bg-bg-white-0 p-5 ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-text-strong-950">
          {card.type === "physical" ? "Physical" : "Virtual"} Card
        </div>
        <Badge appearance="lighter" status="neutral" size="sm">
          Selected
        </Badge>
      </div>
      <Divider />

      {card.type === "physical" ? (
        <PhysicalCard name={card.cardholderName} />
      ) : (
        <VirtualCard
          status={card.status}
          name={card.name}
          balance={card.balance}
          logo={card.logo}
        />
      )}

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Card Number</span>
          <span className="tabular-nums text-text-strong-950">
            {card.cardNumber}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Expiry Date</span>
          <span className="tabular-nums text-text-strong-950">
            {card.expiry}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">CVC</span>
          <span className="text-text-strong-950">{card.cvc}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Spending Limit (Monthly)</span>
          <span className="tabular-nums text-text-strong-950">
            {fmtUSD(card.limit)}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          size="xs"
          style="stroke"
          tone="neutral"
          className="flex-1"
        >
          Unhide
        </Button>
        <Button
          size="xs"
          style="stroke"
          tone="neutral"
          className="w-[120px] shrink-0"
        >
          Adjust Limit
        </Button>
        <Button size="xs" style="stroke" tone="neutral" className="flex-1">
          More
        </Button>
      </div>

      <Divider />
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
        Recent Transactions
      </div>

      <ul className="flex flex-col">
        {card.recentTransactions.map((tx) => {
          const Icon = tx.icon
          return (
            <li key={tx.id} className="flex items-center gap-3 py-2">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-strong-950">
                  {tx.name}
                </p>
                <p className="truncate text-xs text-text-sub-600">{tx.desc}</p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    tx.direction === "in"
                      ? "text-(--state-success-base)"
                      : "text-text-strong-950",
                  )}
                >
                  {tx.direction === "in" ? "+" : "-"}
                  {fmtUSD(tx.amount)}
                </p>
                <p className="text-xs text-text-soft-400">{tx.date}</p>
              </div>
            </li>
          )
        })}
      </ul>

      <Button size="md" style="stroke" tone="neutral" className="w-full">
        <RiHistoryLine className="size-4" />
        See All Transactions
      </Button>
    </aside>
  )
}

/* ─────────────────────────────── Preview ────────────────────────────────── */
function FinanceMyCardsPreview() {
  const [filter, setFilter] = React.useState<string>("all")
  const [selectedId, setSelectedId] = React.useState<string>("savings")

  const cards = React.useMemo(() => {
    if (filter === "virtual")
      return [
        { id: "savings", card: SAVINGS_CARD },
        { id: "daily", card: DAILY_CARD },
      ]
    if (filter === "physical") return [{ id: "travel", card: TRAVEL_CARD }]
    return [
      { id: "savings", card: SAVINGS_CARD },
      { id: "daily", card: DAILY_CARD },
      { id: "travel", card: TRAVEL_CARD },
    ]
  }, [filter])

  const selectedCard: CardLike =
    selectedId === "daily"
      ? DAILY_CARD
      : selectedId === "travel"
        ? TRAVEL_CARD
        : SAVINGS_CARD

  return (
    <FinanceAppShell active="my-cards">
      <FinanceHeader
        icon={
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
            <RiBankCardLine className="size-6 text-text-sub-600" />
          </div>
        }
        title="My Cards"
        description="Organize and access your payment cards."
        actions={<MoveMoneyButton />}
      />

      <div className="px-8">
        <Divider />
      </div>

      <div className="flex flex-col gap-6 px-8 py-6">
        <Filters value={filter} onChange={setFilter} />

        <div className="flex items-start gap-6">
          {/* Card grid */}
          <div className="grid flex-1 grid-cols-2 items-start gap-6">
            {cards.map(({ id, card }) => (
              <div
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedId(id)
                }}
                className="cursor-pointer outline-none"
              >
                {card.type === "physical" ? (
                  <CardBox
                    title="Physical Card"
                    cardNumber={card.cardNumber}
                    expiry={card.expiry}
                    cvc={card.cvc}
                    active={selectedId === id}
                    onSelect={() => setSelectedId(id)}
                  >
                    <PhysicalCard name={card.cardholderName} />
                  </CardBox>
                ) : (
                  <CardBox
                    title="Virtual Card"
                    cardNumber={card.cardNumber}
                    expiry={card.expiry}
                    cvc={card.cvc}
                    active={selectedId === id}
                    onSelect={() => setSelectedId(id)}
                  >
                    <VirtualCard
                      status={card.status}
                      name={card.name}
                      balance={card.balance}
                      logo={card.logo}
                    />
                  </CardBox>
                )}
              </div>
            ))}
          </div>

          {/* Side panel — transaction history for selected card */}
          <TransactionHistoryPanel card={selectedCard} />
        </div>
      </div>
    </FinanceAppShell>
  )
}

export default function FinanceMyCardsDeepDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance"
        title="My Cards (Deep)"
        description="Full Apex `/my-cards` page rendered 1:1 from source — header with bank-card icon and Move Money CTA, SegmentedControl (All/Virtual/Physical) + search + Filter + Sort row, and a 2-column virtual+physical card grid sitting alongside a 400px transaction-history side panel that mirrors the source detail drawer."
      />

      <DocsSection title="Full preview">
        <DocsTemplatePreview>
          <FinanceMyCardsPreview />
        </DocsTemplatePreview>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Header (88px)</strong> — RiBankCardLine icon tile · title
            "My Cards" · subtitle "Organize and access your payment cards." ·
            Search (⌘K) + bell + Move Money CTA.
          </li>
          <li>
            <strong>Filter row</strong> — 320px <code>SegmentedControl</code>{" "}
            with All / Virtual / Physical, 300px search Input with ⌘1 Kbd
            shortcut, Filter Button, Sort by Select.
          </li>
          <li>
            <strong>Card grid (2-col)</strong> — Each CardBox = title row
            (RiBankCardLine + "Virtual/Physical Card" + Details button) →
            Card preview (188px tall) → meta footer (Card Number / Expiry / CVC).
          </li>
          <li>
            <strong>Side panel (400px)</strong> — Selected card mirror + full
            meta + Unhide / Adjust Limit / More buttons + Recent Transactions
            list + See All Transactions footer button.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Sample data (verbatim from source)">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Savings Card</strong> (virtual · Active) — •••• 1234 ·
            06/27 · CVC ••• · Balance $16,058.94 · Limit $12,000.00 · Apex logo.
          </li>
          <li>
            <strong>Daily Spending Card</strong> (virtual · Inactive) — ••••
            6454 · 11/29 · Balance $11.25 · Limit $675.00 · Solaris logo.
          </li>
          <li>
            <strong>Travel Card</strong> (physical · Arthur Taylor) — ••••
            9876 · 12/25 · Balance $453.76 · Limit $1,000.00 · Voyage logo.
          </li>
          <li>
            <strong>Savings Card transactions</strong> — Stock Dividend
            +$1,500 (Sep 15) · Rental Income +$800 (Sep 17) · Grocery Shopping
            -$84.14 (Sep 16).
          </li>
          <li>
            <strong>Daily Spending transactions</strong> — Netflix Cashback
            +$36.24 (Sep 15) · Electricity Bills -$72.32 (Sep 17) · Coffee
            Shop -$4.75 (Sep 18).
          </li>
          <li>
            <strong>Travel Card transactions</strong> — Flight Booking -$350
            (Sep 14) · Restaurant Dinner -$45.20 (Sep 16) · Movie Tickets
            -$25.50 (Sep 17).
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Badge / StatusBadge</strong> — Active / Inactive virtual
            card pills, Selected side-panel chip.
          </li>
          <li>
            <strong>Button</strong> — Details (xs stroke), Unhide / Adjust
            Limit / More, See All Transactions, Move Money.
          </li>
          <li>
            <strong>Divider</strong> — Header underline + side-panel section
            separators.
          </li>
          <li>
            <strong>InputRoot / Input / InputIcon</strong> — Search input with
            Kbd hint.
          </li>
          <li>
            <strong>Kbd</strong> — ⌘1 search hotkey hint.
          </li>
          <li>
            <strong>SegmentedControl + SegmentedItem</strong> — All / Virtual /
            Physical filter.
          </li>
          <li>
            <strong>Select</strong> — Sort by ASC / DESC dropdown.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
