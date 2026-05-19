"use client"

import * as React from "react"
import {
  RiHistoryLine,
  RiSearch2Line,
  RiLineChartLine,
  RiPieChartLine,
  RiComputerLine,
  RiBankLine,
  RiGlobalLine,
  RiArrowLeftDownLine,
  RiArrowRightUpLine,
  RiMore2Line,
  RiExpandUpDownFill,
  RiArrowLeftDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightDoubleLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Input, InputRoot, InputIcon } from "@/registry/dash/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import { Kbd } from "@/registry/dash/ui/kbd"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Finance Widget — Transactions Table. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-transactions-table.tsx + transactions-table.tsx
 *
 * 5 rows · 6 columns (Select / To-From / Amount / Account / Date / Payment Method / Actions).
 * Source: Investment Return / James Brown / Stock Dividend / Sophia Williams / Freelance Income.
 */

type Row = {
  id: string
  toFrom: { label: string; avatar?: string; icon?: React.ElementType }
  amount: { value: number; type: "enter" | "exit" }
  account: string
  date: string
  method: "wire" | "ach" | "transfer-enter" | "transfer-exit"
}

const ROWS: Row[] = [
  { id: "1", toFrom: { label: "Investment Return", icon: RiLineChartLine }, amount: { value: 560, type: "enter" }, account: "Checking", date: "Sep 12, 2024", method: "wire" },
  { id: "2", toFrom: { label: "James Brown", avatar: "JB" }, amount: { value: 35.2, type: "exit" }, account: "Ops Payroll", date: "Sep 12, 2024", method: "transfer-exit" },
  { id: "3", toFrom: { label: "Stock Dividend", icon: RiPieChartLine }, amount: { value: 1250, type: "enter" }, account: "AP", date: "Sep 12, 2024", method: "ach" },
  { id: "4", toFrom: { label: "Sophia Williams", avatar: "SW" }, amount: { value: 150, type: "enter" }, account: "Checking", date: "Sep 12, 2024", method: "transfer-enter" },
  { id: "5", toFrom: { label: "Freelance Income", icon: RiComputerLine }, amount: { value: 250, type: "enter" }, account: "Checking", date: "Sep 12, 2024", method: "ach" },
]

const METHOD_META: Record<Row["method"], { label: string; icon: React.ElementType }> = {
  ach: { label: "ACH", icon: RiBankLine },
  wire: { label: "Wire", icon: RiGlobalLine },
  "transfer-enter": { label: "Money Transfer", icon: RiArrowLeftDownLine },
  "transfer-exit": { label: "Money Transfer", icon: RiArrowRightUpLine },
}

const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)

export default function FinanceTransactionsTableWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="Transactions Table"
        description="Full-width transactions table with TanStack sort headers. 6 sortable columns: To/From, Amount, Account, Date & Time, Payment Method (+ row checkbox & row-action menu). Source paginates 16 pages."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="5 rows · 16-page pagination"
          preview={
            <div className="space-y-6">
              {/* Top toolbar */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
                    <RiHistoryLine className="size-5 text-text-sub-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-strong-950">Recent Transactions</div>
                    <div className="mt-1 text-xs text-text-sub-600">Display the recent transactions in the table below.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <InputRoot className="lg:w-[300px]">
                    <InputIcon><RiSearch2Line /></InputIcon>
                    <Input placeholder="Search..." />
                    <Kbd>⌘ 1</Kbd>
                  </InputRoot>
                  <Button tone="neutral" style="stroke" size="sm">See All</Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stroke-soft-200">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-0 pr-0"><Checkbox /></TableHead>
                      <SortHead>To / From</SortHead>
                      <SortHead>Amount</SortHead>
                      <SortHead>Account</SortHead>
                      <SortHead>Date &amp; Time</SortHead>
                      <SortHead>Payment Method</SortHead>
                      <TableHead className="w-0" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ROWS.map((r) => {
                      const Method = METHOD_META[r.method]
                      const Icon = r.toFrom.icon
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="pr-0"><Checkbox /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {r.toFrom.avatar ? (
                                <Avatar size="md"><AvatarImage src="" /><AvatarFallback>{r.toFrom.avatar}</AvatarFallback></Avatar>
                              ) : Icon ? (
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
                                  <Icon className="size-5 text-text-sub-600" />
                                </div>
                              ) : null}
                              <span className="text-sm text-text-strong-950">{r.toFrom.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm tabular-nums text-text-sub-600">
                              {r.amount.type === "exit" ? "−" : ""}
                              {fmt(r.amount.value)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-text-sub-600">{r.account}</TableCell>
                          <TableCell className="text-sm text-text-sub-600">{r.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex size-8 items-center justify-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
                                <Method.icon className="size-5 text-text-sub-600" />
                              </div>
                              <span className="text-sm text-text-sub-600">{Method.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="w-0">
                            <Button tone="neutral" style="ghost" size="xs" aria-label="Actions"><RiMore2Line /></Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="hidden lg:flex items-center gap-3 pt-2">
                <span className="flex-1 whitespace-nowrap text-sm text-text-sub-600">Page 2 of 16</span>
                <div className="flex items-center gap-1">
                  <PageBtn><RiArrowLeftDoubleLine className="size-4" /></PageBtn>
                  <PageBtn><RiArrowLeftSLine className="size-4" /></PageBtn>
                  {["1", "2", "3", "4", "5", "...", "16"].map((p, i) => (
                    <PageBtn key={i} active={p === "4"}>{p}</PageBtn>
                  ))}
                  <PageBtn><RiArrowRightSLine className="size-4" /></PageBtn>
                  <PageBtn><RiArrowRightDoubleLine className="size-4" /></PageBtn>
                </div>
                <span className="flex-1 flex justify-end text-xs text-text-sub-600">7 / page</span>
              </div>
            </div>
          }
          code={`<TransactionsTable data={[
  { toFrom: { label: 'Investment Return', icon: RiLineChartLine }, amount: { value: 560, type: 'enter' }, account: 'Checking', date: '2024-09-12', method: 'wire' },
  // …
]} />`}
        />
      </DocsSection>

      <DocsSection title="Cell variants">
        <DocsExample
          title="To/From — avatar vs icon vs initial fallback"
          preview={
            <div className="space-y-3 max-w-md">
              <Variant label="Avatar">
                <Avatar size="md"><AvatarImage src="" /><AvatarFallback>JB</AvatarFallback></Avatar>
                <span className="text-sm">James Brown</span>
              </Variant>
              <Variant label="Icon ring">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
                  <RiLineChartLine className="size-5 text-text-sub-600" />
                </div>
                <span className="text-sm">Investment Return</span>
              </Variant>
              <Variant label="Initial fallback (blue)">
                <Avatar size="md"><AvatarFallback className="bg-(--state-information-light) text-(--state-information-dark)">U</AvatarFallback></Avatar>
                <span className="text-sm">Unknown</span>
              </Variant>
            </div>
          }
          code={`{avatar ? <Avatar /> : icon ? <IconRing /> : <Avatar fallback="initial" />}`}
        />
      </DocsSection>

      <DocsSection title="Method legend">
        <DocsExample
          title="Wire / ACH / Money Transfer"
          preview={
            <div className="flex flex-wrap gap-4">
              {Object.entries(METHOD_META).map(([k, m]) => (
                <div key={k} className="flex items-center gap-2 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1.5">
                  <m.icon className="size-4 text-text-sub-600" />
                  <span className="text-xs text-text-sub-600">{m.label}</span>
                  <span className="text-[10px] uppercase tracking-wider text-text-soft-400">{k}</span>
                </div>
              ))}
            </div>
          }
          code={`const METHOD_META = {
  ach: { label: 'ACH', icon: RiBankLine },
  wire: { label: 'Wire', icon: RiGlobalLine },
  'transfer-enter': { label: 'Money Transfer', icon: RiArrowLeftDownLine },
  'transfer-exit': { label: 'Money Transfer', icon: RiArrowRightUpLine },
}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "data", type: "TransactionTableData[]", description: "Rows with {toFrom, amount, account, date, method}." },
            { name: "onRowClick", type: "(row: TransactionTableData) => void", description: "Open the Transaction Detail Drawer (source uses a jotai atom)." },
            { name: "sort", type: "{ id: string; desc: boolean }[]", description: "TanStack sort state. Source ships every column sortable." },
            { name: "pageSize", type: "7 | 15 | 50 | 100", defaultValue: "7", description: "Page size Select." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Toolbar</strong> — 40px circular history avatar + 2-line title/description + search Input (300px lg) with ⌘1 kbd + See All button.</li>
          <li><strong>Columns</strong> — Select (checkbox) / To-From / Amount / Account / Date &amp; Time / Payment Method / Actions.</li>
          <li><strong>Amount cell</strong> — exit type prefixes a minus sign.</li>
          <li><strong>Pagination</strong> — desktop: prev/next double-arrow + numbered pages (current pill); mobile: Previous / Next / "Page X of Y".</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function SortHead({ children }: { children: React.ReactNode }) {
  return (
    <TableHead>
      <span className="inline-flex items-center gap-0.5">
        {children}
        <RiExpandUpDownFill className="size-4 text-text-sub-600" />
      </span>
    </TableHead>
  )
}

function PageBtn({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs",
        active
          ? "bg-bg-strong-950 text-static-white"
          : "text-text-sub-600 hover:bg-bg-weak-50",
      )}
    >
      {children}
    </button>
  )
}

function Variant({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-stroke-soft-200 bg-bg-white-0 p-2">
      <span className="w-32 text-[10px] uppercase tracking-wider text-text-soft-400">{label}</span>
      {children}
    </div>
  )
}
