"use client"

import * as React from "react"
import {
  RiArrowDownSLine,
  RiCloseLine,
  RiComputerLine,
  RiDownload2Line,
  RiFilter3Fill,
  RiFlashlightLine,
  RiHistoryLine,
  RiLineChartLine,
  RiPieChartLine,
  RiSearch2Line,
  RiShareForwardBoxFill,
  RiSortDesc,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Divider } from "@/registry/dash/ui/divider"
import { IconButton } from "@/registry/dash/ui/icon-button"
import {
  InputRoot,
  Input,
  InputIcon,
} from "@/registry/dash/ui/input"
import { Kbd } from "@/registry/dash/ui/kbd"
import { LinkButton } from "@/registry/dash/ui/link-button"
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
import { Tag } from "@/registry/dash/ui/tag"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/registry/dash/ui/tooltip"
import { cn } from "@/registry/dash/lib/utils"
import {
  FinanceAppShell,
  FinanceHeader,
  MoveMoneyButton,
} from "@/registry/dash/templates/_internal/finance-app-shell"

/* -------------------------------------------------------------------------- *
 *  Finance Transactions (Deep) — full Apex `/transactions` page preview      *
 *  Mirrors `template-finance-master/app/(main)/transactions/page.tsx`:       *
 *  • Header w/ history icon + "Transactions" + subtitle + Export + Move CTA  *
 *  • "All Cards" subtitle row w/ Export As button                            *
 *  • Filter row — SegmentedControl (All/Income/Expenses) + search + sort     *
 *  • TransactionsTable primitive (8 sample rows verbatim from source)        *
 *  • Transaction detail drawer preview (slide-over on the right)             *
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

/* ──────────────────────── Transactions Filter Bar ───────────────────────── */
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
        <SegmentedItem value="income">Income</SegmentedItem>
        <SegmentedItem value="expenses">Expenses</SegmentedItem>
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

/* ─────────────────────── Sample data (verbatim source) ──────────────────── */
type Row = {
  id: string
  toFrom: { label: string; icon?: React.ElementType; avatar?: string }
  amount: { type: "enter" | "exit"; value: number }
  account: string
  date: string
  method: "wire" | "transfer-exit" | "transfer-enter" | "ach"
}

const rows: Row[] = [
  {
    id: "326860a3",
    toFrom: { label: "Investment Return", icon: RiLineChartLine },
    amount: { type: "enter", value: 560 },
    account: "Checking",
    date: "2024-09-12",
    method: "wire",
  },
  {
    id: "326860b3",
    toFrom: { label: "James Brown", avatar: "JB" },
    amount: { type: "exit", value: 35.2 },
    account: "Ops Payroll",
    date: "2024-09-12",
    method: "transfer-exit",
  },
  {
    id: "326860c3",
    toFrom: { label: "Stock Dividend", icon: RiPieChartLine },
    amount: { type: "enter", value: 1250 },
    account: "AP",
    date: "2024-09-12",
    method: "ach",
  },
  {
    id: "326860d3",
    toFrom: { label: "Sophia Williams", avatar: "SW" },
    amount: { type: "enter", value: 150 },
    account: "Checking",
    date: "2024-09-12",
    method: "transfer-enter",
  },
  {
    id: "326860e3",
    toFrom: { label: "Freelance Income", icon: RiComputerLine },
    amount: { type: "enter", value: 250 },
    account: "Checking",
    date: "2024-09-12",
    method: "ach",
  },
  {
    id: "326860f3",
    toFrom: { label: "Emma Wright", avatar: "EW" },
    amount: { type: "exit", value: 21.8 },
    account: "AP",
    date: "2024-09-12",
    method: "wire",
  },
  {
    id: "326860g3",
    toFrom: { label: "Utilities Payment", icon: RiFlashlightLine },
    amount: { type: "exit", value: 63.75 },
    account: "Ops Payroll",
    date: "2024-09-12",
    method: "ach",
  },
  {
    id: "326860h3",
    toFrom: { label: "Matthew Johnson", avatar: "MJ" },
    amount: { type: "exit", value: 45 },
    account: "Checking",
    date: "2024-09-12",
    method: "transfer-exit",
  },
]

function methodLabel(m: Row["method"]): string {
  return {
    wire: "Wire",
    "transfer-exit": "Transfer (Out)",
    "transfer-enter": "Transfer (In)",
    ach: "ACH",
  }[m]
}

function methodStatus(m: Row["method"]): React.ComponentProps<typeof Badge>["status"] {
  return {
    wire: "information" as const,
    "transfer-exit": "warning" as const,
    "transfer-enter": "success" as const,
    ach: "neutral" as const,
  }[m]
}

/* ───────────────────────── Transactions Table ───────────────────────────── */
function TransactionsTable({
  onSelect,
  selectedId,
}: {
  onSelect: (id: string) => void
  selectedId?: string
}) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-stroke-soft-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <span className="sr-only">Select</span>
            </TableHead>
            <TableHead>To / From</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="w-[60px] text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const Icon = r.toFrom.icon
            const isSelected = selectedId === r.id
            return (
              <TableRow
                key={r.id}
                onClick={() => onSelect(r.id)}
                className={cn(
                  "cursor-pointer",
                  isSelected && "bg-bg-weak-50",
                )}
              >
                <TableCell>
                  <div className="grid size-5 place-items-center rounded border border-stroke-soft-200" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    {Icon ? (
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600">
                        <Icon className="size-4" />
                      </span>
                    ) : (
                      <Avatar size="md" className="bg-(--dash-purple-100)">
                        <AvatarFallback className="text-text-strong-950">
                          {r.toFrom.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-sm font-medium text-text-strong-950">
                      {r.toFrom.label}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      r.amount.type === "enter"
                        ? "text-(--state-success-base)"
                        : "text-text-strong-950",
                    )}
                  >
                    {r.amount.type === "enter" ? "+" : "-"}
                    {fmtUSD(r.amount.value)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-text-sub-600">
                  {r.account}
                </TableCell>
                <TableCell className="text-sm text-text-sub-600 tabular-nums">
                  {r.date}
                </TableCell>
                <TableCell>
                  <Badge
                    appearance="lighter"
                    status={methodStatus(r.method)}
                    size="sm"
                  >
                    {methodLabel(r.method)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconButton
                        size="xs"
                        style="ghost"
                        tone="neutral"
                        aria-label="View transaction"
                      >
                        <RiHistoryLine className="size-4" />
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent>View details</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/* ────────────────────────── Detail Drawer (preview) ─────────────────────── */
function TransactionDetailDrawer({ row }: { row: Row }) {
  const Icon = row.toFrom.icon
  return (
    <aside className="flex w-[380px] shrink-0 flex-col gap-4 rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-text-strong-950">
          Transaction Detail
        </div>
        <CompactButton variant="stroke" size="sm" fullRadius aria-label="Close drawer">
          <RiCloseLine />
        </CompactButton>
      </div>
      <Divider />

      <div className="flex flex-col items-center gap-3 py-2">
        {Icon ? (
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600">
            <Icon className="size-6" />
          </span>
        ) : (
          <Avatar size="2xl" className="bg-(--dash-purple-100)">
            <AvatarFallback className="text-text-strong-950">
              {row.toFrom.avatar}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="text-center">
          <div className="text-base font-semibold text-text-strong-950">
            {row.toFrom.label}
          </div>
          <div
            className={cn(
              "mt-1 text-2xl font-semibold tabular-nums",
              row.amount.type === "enter"
                ? "text-(--state-success-base)"
                : "text-text-strong-950",
            )}
          >
            {row.amount.type === "enter" ? "+" : "-"}
            {fmtUSD(row.amount.value)}
          </div>
        </div>
        <Badge
          appearance="lighter"
          status={row.amount.type === "enter" ? "success" : "neutral"}
          size="md"
        >
          {row.amount.type === "enter" ? "Completed · Received" : "Completed · Sent"}
        </Badge>
      </div>

      <Divider />

      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-text-sub-600">Transaction ID</dt>
          <dd className="font-mono text-xs text-text-strong-950">{row.id}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-text-sub-600">Account</dt>
          <dd className="text-text-strong-950">{row.account}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-text-sub-600">Date</dt>
          <dd className="tabular-nums text-text-strong-950">{row.date}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-text-sub-600">Method</dt>
          <dd>
            <Tag size="sm">{methodLabel(row.method)}</Tag>
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-text-sub-600">Reference</dt>
          <dd className="font-mono text-xs text-text-strong-950">
            APX-{row.id.slice(-4).toUpperCase()}
          </dd>
        </div>
      </dl>

      <Divider />

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" style="stroke" tone="neutral">
          <RiDownload2Line className="size-4" />
          Receipt
        </Button>
        <Button size="sm">Repeat Payment</Button>
      </div>

      <LinkButton tone="muted" size="sm" className="self-center">
        Dispute Transaction
      </LinkButton>
    </aside>
  )
}

/* ──────────────────────────── Pagination Strip ──────────────────────────── */
function PaginationStrip() {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <div className="text-xs text-text-sub-600">
        Showing <span className="font-medium text-text-strong-950">1-8</span>{" "}
        of <span className="font-medium text-text-strong-950">52</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Button size="xs" style="stroke" tone="neutral">
          Previous
        </Button>
        {["1", "2", "3", "…", "7"].map((p, i) => (
          <button
            key={i}
            className={cn(
              "grid size-7 place-items-center rounded-md text-xs font-medium text-text-sub-600 hover:bg-bg-weak-50",
              p === "1" && "bg-bg-strong-950 text-static-white hover:bg-bg-strong-950",
            )}
          >
            {p}
          </button>
        ))}
        <Button size="xs" style="stroke" tone="neutral">
          Next
        </Button>
      </div>
    </div>
  )
}

/* ─────────────────────────────── Preview ────────────────────────────────── */
function FinanceTransactionsPreview() {
  const [filter, setFilter] = React.useState("all")
  const [selectedId, setSelectedId] = React.useState<string>("326860a3")
  const selectedRow = rows.find((r) => r.id === selectedId) ?? rows[0]

  return (
    <FinanceAppShell active="transactions">
      <FinanceHeader
        icon={
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
            <RiHistoryLine className="size-6 text-text-sub-600" />
          </div>
        }
        title="Transactions"
        description="Track your financial transactions to stay in control of your income and expenses."
        actions={
          <>
            <Button size="sm" style="stroke" tone="neutral">
              <RiShareForwardBoxFill className="size-4" />
              Export
            </Button>
            <MoveMoneyButton />
          </>
        }
      />

      <div className="px-8">
        <Divider />
        <div className="flex items-center gap-3 py-4">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <div className="text-sm font-medium text-text-strong-950">
                All Cards
              </div>
              <CompactButton variant="stroke" size="md" fullRadius aria-label="Change card scope">
                <RiArrowDownSLine />
              </CompactButton>
            </div>
            <div className="mt-1 text-sm text-text-sub-600">
              Monitor and manage transactions across all your cards.
            </div>
          </div>
          <Button size="sm" style="stroke" tone="neutral">
            <RiDownload2Line className="size-4" />
            Export As
          </Button>
        </div>
        <Divider />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-8 py-6">
        <Filters value={filter} onChange={setFilter} />

        <div className="flex items-start gap-6">
          <div className="flex-1 space-y-4">
            <TransactionsTable
              onSelect={setSelectedId}
              selectedId={selectedId}
            />
            <PaginationStrip />
          </div>
          <TransactionDetailDrawer row={selectedRow} />
        </div>
      </div>
    </FinanceAppShell>
  )
}

export default function FinanceTransactionsDeepDocsPage() {
  return (
    <TooltipProvider>
      <DocsPageShell>
        <DocsHeader
          category="Templates / Finance"
          title="Transactions (Deep)"
          description="Full Apex `/transactions` page rendered 1:1 from source — header w/ history icon + Export + Move Money CTA, 'All Cards' scope row w/ Export As, SegmentedControl (All/Income/Expenses) + search + Filter + Sort, the 8-row Transactions Table primitive (To/From · Amount · Account · Date · Method · Actions), and a 380px Transaction Detail drawer preview sitting flush to the right."
        />

        <DocsSection title="Full preview">
          <DocsTemplatePreview>
            <FinanceTransactionsPreview />
          </DocsTemplatePreview>
        </DocsSection>

        <DocsSection title="Anatomy">
          <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
            <li>
              <strong>Header (88px)</strong> — History icon tile · "Transactions"
              · subtitle "Track your financial transactions to stay in control
              of your income and expenses." · Export + Move Money actions.
            </li>
            <li>
              <strong>Scope row</strong> — "All Cards" label with a stroke
              CompactButton chevron + subtitle "Monitor and manage transactions
              across all your cards." + Export As button on the right.
            </li>
            <li>
              <strong>Filter row</strong> — 320px SegmentedControl (All /
              Income / Expenses) + 300px search Input w/ ⌘1 Kbd + Filter Button
              + Sort by Select.
            </li>
            <li>
              <strong>Transactions Table</strong> — 8 rows w/ checkbox cell,
              To/From (icon or avatar + name), Amount (colored +/-), Account,
              Date, Method (Badge), Actions (IconButton + Tooltip).
            </li>
            <li>
              <strong>Detail drawer (380px)</strong> — Icon hero + label +
              amount + status Badge + Transaction ID/Account/Date/Method/
              Reference list + Receipt + Repeat Payment buttons + Dispute link.
            </li>
            <li>
              <strong>Pagination strip</strong> — Showing 1-8 of 52 · Prev /
              page chips / Next.
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Sample data (verbatim from source)">
          <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
            <li>326860a3 — Investment Return · +$560 · Checking · Wire</li>
            <li>326860b3 — James Brown · -$35.20 · Ops Payroll · Transfer (Out)</li>
            <li>326860c3 — Stock Dividend · +$1,250 · AP · ACH</li>
            <li>326860d3 — Sophia Williams · +$150 · Checking · Transfer (In)</li>
            <li>326860e3 — Freelance Income · +$250 · Checking · ACH</li>
            <li>326860f3 — Emma Wright · -$21.80 · AP · Wire</li>
            <li>326860g3 — Utilities Payment · -$63.75 · Ops Payroll · ACH</li>
            <li>326860h3 — Matthew Johnson · -$45 · Checking · Transfer (Out)</li>
            <li>All rows dated <strong>2024-09-12</strong> in source.</li>
          </ul>
        </DocsSection>

        <DocsSection title="Components used">
          <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
            <li>
              <strong>Avatar / AvatarFallback</strong> — James Brown, Sophia
              Williams, Emma Wright, Matthew Johnson rows + 2xl hero in drawer.
            </li>
            <li>
              <strong>Badge</strong> — Method pills (Wire / ACH / Transfer In /
              Transfer Out) + drawer status pill.
            </li>
            <li>
              <strong>Button</strong> — Export, Export As, Move Money, Receipt,
              Repeat Payment, Prev / Next.
            </li>
            <li>
              <strong>CompactButton</strong> — "All Cards" chevron + drawer
              close.
            </li>
            <li>
              <strong>IconButton</strong> — Row actions cell.
            </li>
            <li>
              <strong>InputRoot / Input / InputIcon</strong> — Search input
              with Kbd hint.
            </li>
            <li>
              <strong>LinkButton</strong> — Dispute Transaction footer link.
            </li>
            <li>
              <strong>SegmentedControl / SegmentedItem</strong> — All / Income
              / Expenses scope.
            </li>
            <li>
              <strong>Select</strong> — Sort by ASC / DESC.
            </li>
            <li>
              <strong>Tag</strong> — Method field in detail drawer.
            </li>
            <li>
              <strong>Table primitives</strong> (Table, TableHeader, TableBody,
              TableRow, TableHead, TableCell) — the transactions list.
            </li>
            <li>
              <strong>Tooltip + TooltipProvider</strong> — "View details" row
              action hint.
            </li>
            <li>
              <strong>Divider</strong> — Section separators in header, drawer.
            </li>
          </ul>
        </DocsSection>
      </DocsPageShell>
    </TooltipProvider>
  )
}
