"use client"

import * as React from "react"
import {
  RiHistoryLine,
  RiSearch2Line,
  RiCalendarLine,
  RiArrowDownSLine,
  RiFilter3Line,
  RiShareForwardBoxLine,
  RiAddLine,
  RiCheckboxCircleFill,
  RiExpandUpDownFill,
  RiMore2Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiShoppingBag2Line,
  RiGiftLine,
  RiTimeLine,
  RiMapPinTimeLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import {
  Sidebar,
  PageHeader,
  FakeButton,
} from "../marketing-dashboard/page"

/**
 * Marketing Orders. Ported from AlignUI Marketing template
 * (`app/(main)/orders/page.tsx` + summary.tsx + filters.tsx + table.tsx +
 * order-detail-drawer.tsx). Header + summary + filter toolbar + 8-row table
 * with sample data verbatim from `app/(main)/orders/table.tsx` lines 45-182,
 * plus an inline-expanded Order Detail panel for #ORD-98745.
 */
export default function MarketingOrdersDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing"
        title="Marketing orders"
        description="Catalyst Orders page — KPI summary (1,248 / $48,294 / $86.45 / 28 pending), filter toolbar, sortable table with 8 sample orders (Sophia Williams / Laura Perez / Lena Müller / Natalia Nowak / Wei Chen / Emma Wright / Ravi Patel / Nuray Aksoy), and the row-click Order Detail drawer rendered as an inline panel for #ORD-98745."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Orders page + Order #98745 detail panel"
          description="Click a row → Drawer (here shown inline). Apple Watch S5 GPS 40MM · Subtotal $399.00 · VAT 20% $79.80 · Total $478.80. 4-step timeline (Order confirmed → Package prepared → In transit → Out for delivery)."
          preview={
            <DocsTemplatePreview padding="">
              <OrdersPreview />
            </DocsTemplatePreview>
          }
          code={`<MarketingOrders title="Orders" description="Manage and track your orders" orders={[/* Order[] */]} />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><b>Header</b> — History icon disc + “Orders” + subtitle + New Product CTA.</li>
          <li><b>Summary</b> — 4 KPI tiles: Total Orders 1,248 (+12), Total Revenue $48,294 (+8%), Average Order Value $86.45 (-2%), Pending Orders 28.</li>
          <li><b>Toolbar</b> — Search orders… input + Last 7 days · Feb 04 - Feb 11, 2024 ButtonGroup + All Status + Filter + Export.</li>
          <li><b>Table</b> — checkbox · ID · Date · Status · Customer (Avatar 24) · Purchased · Revenue · row actions.</li>
          <li><b>Pagination</b> — Page 2 of 16, page-size 7/15/50/100.</li>
          <li><b>Detail panel</b> — Order header + status badge + ORDER SUMMARY + CUSTOMER + TIMELINE (4 rows) + Cancel / Save Changes footer.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Checkbox — header + row select.</li>
          <li>Avatar — customer 24px.</li>
          <li>StatusBadge — Paid (icon-light success).</li>
          <li>InputRoot / Input / InputIcon — Search.</li>
          <li>Table.Root / Header / Row / Cell / Caption.</li>
          <li>Pagination.NavButton / Item.</li>
          <li>Drawer — order detail.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "orders", type: "Order[]", description: "{ id, customer:{ name, image, color }, date, revenue, purchased:{ name }, status:{ variant, label } }." },
            { name: "onRowClick", type: "(order: Order) => void", description: "Opens detail drawer." },
            { name: "pageSize", type: "7 | 15 | 50 | 100", description: "Default 7. Mirrors Select in pagination footer." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

type Order = {
  id: string
  customer: { name: string; initials: string }
  date: string
  revenue: number
  purchased: string
  status: "Paid" | "Pending" | "Shipped" | "Refunded" | "Cancelled"
}

const ORDERS: Order[] = [
  { id: "#ORD-98745", customer: { name: "Sophia Williams", initials: "SW" }, date: "29 Oct, 09:20", revenue: 399.99, purchased: "Apple Watch S5 GPS 40mm White", status: "Paid" },
  { id: "#ORD-28745", customer: { name: "Laura Perez", initials: "LP" }, date: "28 Oct, 10:30", revenue: 1299.99, purchased: "MacBook Pro M1 256GB Silvere", status: "Paid" },
  { id: "#ORD-56745", customer: { name: "Lena Müller", initials: "LM" }, date: "27 Oct, 11:45", revenue: 1299.99, purchased: "iMac M1 24-inch Purple", status: "Paid" },
  { id: "#ORD-46345", customer: { name: "Natalia Nowak", initials: "NN" }, date: "26 Oct, 19:25", revenue: 549.99, purchased: "AirPods Max Green", status: "Paid" },
  { id: "#ORD-45248", customer: { name: "Wei Chen", initials: "WC" }, date: "25 Oct, 18:12", revenue: 99.99, purchased: "HomePod Mini Orange", status: "Paid" },
  { id: "#ORD-21325", customer: { name: "Emma Wright", initials: "EW" }, date: "24 Oct, 17:54", revenue: 1599.99, purchased: "Apple Studio Display Standard Glass", status: "Paid" },
  { id: "#ORD-73456", customer: { name: "Ravi Patel", initials: "RP" }, date: "26 Oct, 20:24", revenue: 249.99, purchased: "Apple AirPods Pro 2nd Gen", status: "Paid" },
  { id: "#ORD-21352", customer: { name: "Nuray Aksoy", initials: "NA" }, date: "25 Oct, 21:57", revenue: 449.99, purchased: "iPad 10th Gen 64GB Wi-Fi Space Gray", status: "Paid" },
]

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

function OrdersPreview() {
  return (
    <div className="flex min-h-[1200px] bg-bg-weak-50">
      <Sidebar activeHref="/orders" />
      <div className="flex-1 self-stretch bg-bg-white-0">
        <PageHeader
          icon={
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
              <RiHistoryLine className="size-6" />
            </span>
          }
          title="Orders"
          description="Manage and track your orders"
          actions={<FakeButton tone="primary"><RiAddLine className="size-4" /> New Product</FakeButton>}
        />

        <div className="px-8 pb-6">
          <DashedDivider />

          <div className="grid grid-cols-4 divide-x divide-stroke-soft-200 py-6">
            <SummaryTile label="Total Orders" value="1,248" delta="+12" suffix="vs this week" up />
            <SummaryTile label="Total Revenue" value="$48,294" delta="+8%" suffix="vs last week" up />
            <SummaryTile label="Average Order Value" value="$86.45" delta="-2%" suffix="this week" />
            <SummaryTile label="Pending Orders" value="28" suffix="Requires attention" muted />
          </div>

          <DashedDivider />

          <div className="grid grid-cols-[1fr_400px] gap-6 pt-6">
            <div>
              <Toolbar />
              <OrdersTable />
              <Pagination />
            </div>
            <OrderDetailPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryTile({ label, value, delta, suffix, up, muted }: { label: string; value: string; delta?: string; suffix: string; up?: boolean; muted?: boolean }) {
  return (
    <div className="px-8 first:pl-0 last:pr-0">
      <div className="text-xs text-text-sub-600">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <div className="text-xl font-semibold tracking-tight text-text-strong-950">{value}</div>
        <div className={"text-[11px] " + (muted ? "text-text-soft-400" : "text-text-sub-600")}>
          {delta ? <span className={up ? "text-success-base" : "text-error-base"}>{delta}</span> : null} {suffix}
        </div>
      </div>
    </div>
  )
}

function Toolbar() {
  return (
    <div className="flex gap-3 pb-6">
      <div className="flex flex-1 gap-3">
        <div className="inline-flex h-9 flex-1 max-w-[352px] items-center gap-2 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-2.5 shadow-regular-xs">
          <RiSearch2Line className="size-4 text-text-soft-400" />
          <input type="text" placeholder="Search orders..." className="w-full bg-transparent text-sm text-text-strong-950 placeholder:text-text-soft-400 outline-none" />
        </div>
        <div className="inline-flex h-9 items-stretch overflow-hidden rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
          <button type="button" className="inline-flex items-center gap-1 px-4 text-sm text-text-sub-600">
            Last 7 days
            <RiArrowDownSLine className="size-4 text-text-soft-400" />
          </button>
          <span className="w-px self-stretch bg-stroke-soft-200" />
          <button type="button" className="inline-flex items-center gap-1.5 px-4 text-sm text-text-sub-600">
            <RiCalendarLine className="size-4 text-text-soft-400" />
            Feb 04 - Feb 11, 2024
          </button>
        </div>
      </div>
      <div className="flex gap-3">
        <FakeButton>All Status <RiArrowDownSLine className="size-4" /></FakeButton>
        <FakeButton><RiFilter3Line className="size-4" /> Filter</FakeButton>
        <FakeButton><RiShareForwardBoxLine className="size-4" /> Export</FakeButton>
      </div>
    </div>
  )
}

function OrdersTable() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-stroke-soft-200">
      <table className="w-full">
        <thead className="bg-bg-weak-50">
          <tr className="text-left">
            <Th width="w-10"><span className="inline-flex size-4 items-center justify-center rounded border border-stroke-soft-200 bg-bg-white-0" /></Th>
            <Th>ID</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Customer</Th>
            <Th>Purchased</Th>
            <Th align="right">Revenue</Th>
            <Th width="w-10" />
          </tr>
        </thead>
        <tbody>
          {ORDERS.map((o, i) => (
            <tr key={o.id} className={"transition-colors hover:bg-bg-weak-50/60 " + (i === 0 ? "bg-bg-weak-50" : "")}>
              <Td><span className="inline-flex size-4 items-center justify-center rounded border border-stroke-soft-200 bg-bg-white-0" /></Td>
              <Td><span className="text-sm text-text-strong-950">{o.id}</span></Td>
              <Td><span className="text-sm text-text-strong-950">{o.date}</span></Td>
              <Td>
                <span className="inline-flex items-center gap-1 rounded-[6px] py-1 pl-1 pr-2 text-xs leading-4 font-medium bg-bg-white-0 outline outline-1 -outline-offset-1 outline-stroke-soft-200 text-text-sub-600">
                  <RiCheckboxCircleFill className="size-3.5 text-(--state-success-base)" />
                  {o.status}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-6 items-center justify-center overflow-hidden rounded-full bg-bg-weak-50 text-[10px] font-semibold text-text-strong-950">{o.customer.initials}</span>
                  <span className="text-sm text-text-strong-950">{o.customer.name}</span>
                </div>
              </Td>
              <Td><span className="text-sm text-text-strong-950">{o.purchased}</span></Td>
              <Td align="right"><span className="text-sm tabular-nums text-text-strong-950">{fmt.format(o.revenue)}</span></Td>
              <Td><RiMore2Line className="size-4 text-text-sub-600" /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, align, width }: { children?: React.ReactNode; align?: "right"; width?: string }) {
  return (
    <th className={"px-4 py-3 text-xs font-medium text-text-sub-600 " + (align === "right" ? "text-right" : "text-left") + " " + (width ?? "")}>
      <span className="inline-flex items-center gap-1">
        {children}
        {children && typeof children === "string" ? <RiExpandUpDownFill className="size-3.5 text-text-soft-400" /> : null}
      </span>
    </th>
  )
}

function Td({ children, align }: { children?: React.ReactNode; align?: "right" }) {
  return (
    <td className={"border-t border-stroke-soft-200 px-4 py-3 h-12 align-middle " + (align === "right" ? "text-right" : "")}>{children}</td>
  )
}

function Pagination() {
  return (
    <div className="mt-10 flex items-center gap-3">
      <span className="flex-1 text-sm text-text-sub-600">Page 2 of 16</span>
      <div className="inline-flex items-center gap-1">
        <PageBtn><RiArrowLeftDoubleLine className="size-4" /></PageBtn>
        <PageBtn><RiArrowLeftSLine className="size-4" /></PageBtn>
        <PageBtn>1</PageBtn>
        <PageBtn>2</PageBtn>
        <PageBtn>3</PageBtn>
        <PageBtn current>4</PageBtn>
        <PageBtn>5</PageBtn>
        <PageBtn>…</PageBtn>
        <PageBtn>16</PageBtn>
        <PageBtn><RiArrowRightSLine className="size-4" /></PageBtn>
        <PageBtn><RiArrowRightDoubleLine className="size-4" /></PageBtn>
      </div>
      <div className="flex flex-1 justify-end">
        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 text-xs text-text-sub-600 shadow-regular-xs">
          7 / page
          <RiArrowDownSLine className="size-4" />
        </button>
      </div>
    </div>
  )
}

function PageBtn({ children, current }: { children: React.ReactNode; current?: boolean }) {
  return (
    <button
      type="button"
      className={
        "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs " +
        (current
          ? "border-stroke-strong-950 bg-bg-strong-950 text-text-white-0"
          : "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50")
      }
    >
      {children}
    </button>
  )
}

function OrderDetailPanel() {
  return (
    <aside className="flex h-fit flex-col self-start rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
      <header className="flex items-start gap-4 p-6">
        <div className="flex-1">
          <div className="text-base font-semibold text-text-strong-950">Order #98745</div>
          <div className="mt-1 text-sm text-text-sub-600">Oct 29, 2024 • $478.80</div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-[6px] py-1 pl-1 pr-2 text-xs leading-4 font-medium bg-(--state-success-lighter) text-(--state-success-base)">
          <RiCheckboxCircleFill className="size-3.5" />
          Paid
        </span>
        <button type="button" className="inline-flex size-7 items-center justify-center rounded-md text-text-sub-600 hover:bg-bg-weak-50">
          <RiMore2Line className="size-4" />
        </button>
      </header>

      <SectionDivider>ORDER SUMMARY</SectionDivider>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-bg-weak-50">
            <RiShoppingBag2Line className="size-6 text-text-sub-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-text-strong-950">Apple Watch S5 GPS 40MM</div>
            <div className="mt-1 text-xs text-text-soft-400">MWVE2LL/A</div>
          </div>
        </div>
        <DashedDivider />
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-text-sub-600">Subtotal</span><span className="text-text-strong-950">$399.00</span></div>
          <div className="flex justify-between"><span className="text-text-sub-600">VAT (20.00%)</span><span className="text-text-strong-950">$79.80</span></div>
          <div className="flex justify-between font-medium"><span className="text-text-sub-600">Total</span><span className="text-text-strong-950">$478.80</span></div>
        </div>
      </div>

      <SectionDivider>CUSTOMER</SectionDivider>

      <div className="p-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-(--state-warning-lighter) text-sm font-semibold text-(--state-warning-base)">SW</span>
          <div>
            <div className="text-sm font-medium text-text-strong-950">Sophia Williams</div>
            <div className="mt-1 text-sm text-text-sub-600">sophia@alignui.com</div>
          </div>
        </div>
      </div>

      <SectionDivider>TIMELINE</SectionDivider>

      <div className="flex flex-col gap-6 p-6">
        <TimelineRow icon={<RiShoppingBag2Line className="size-4 text-success-base" />} title="Order confirmed" subtitle="Order placed and confirmed" date="4 Nov 2024, 05:16" />
        <TimelineRow icon={<RiGiftLine className="size-4 text-(--state-feature-base)" />} title="Package prepared" subtitle="Packed and handed to DHL Express" date="4 Nov 2024, 09:45" />
        <TimelineRow icon={<RiTimeLine className="size-4 text-warning-base" />} title="In transit" subtitle="Package in transit" date="4 Nov 2024, 14:30" />
        <TimelineRow icon={<RiMapPinTimeLine className="size-4 text-(--state-faded-base)" />} title="Out for delivery" subtitle="Will be delivered today" date="4 Nov 2024, 16:45" last />
      </div>

      <div className="mt-auto border-t border-stroke-soft-200">
        <div className="grid grid-cols-2 gap-4 p-6">
          <FakeButton>Cancel</FakeButton>
          <FakeButton tone="primary">Save Changes</FakeButton>
        </div>
      </div>
    </aside>
  )
}

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center gap-3 border-y border-stroke-soft-200 bg-bg-weak-50 px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
      {children}
    </div>
  )
}

function DashedDivider() {
  return (
    <svg width="100%" height="1" aria-hidden>
      <line x1="0" y1="0.5" x2="100%" y2="0.5" strokeDasharray="4 4" stroke="var(--stroke-soft-200)" />
    </svg>
  )
}

function TimelineRow({ icon, title, subtitle, date, last }: { icon: React.ReactNode; title: string; subtitle: string; date: string; last?: boolean }) {
  return (
    <div className="relative flex items-start gap-4">
      {!last ? <span className="absolute -bottom-4 left-3.5 top-9 w-px bg-stroke-soft-200" /> : null}
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">{icon}</span>
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-1.5">
          <div className="text-sm font-medium text-text-strong-950">{title}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-soft-400">{date}</div>
        </div>
        <div className="mt-1 text-xs text-text-sub-600">{subtitle}</div>
      </div>
    </div>
  )
}
