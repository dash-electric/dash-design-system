"use client"

import * as React from "react"
import {
  RiTruckLine,
  RiStore3Line,
  RiMapPin2Line,
  RiUser3Line,
  RiShieldCheckLine,
  RiBillLine,
  RiSettings4Line,
  RiCodeBoxLine,
  RiTestTubeLine,
  RiNotification3Line,
  RiSearch2Line,
  RiAddFill,
  RiUpload2Line,
  RiDownload2Line,
  RiSparklingLine,
  RiFilter3Fill,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiCalendarLine,
  RiArrowLeftSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiPriceTag3Line,
  RiMore2Line,
  RiExpandUpDownFill,
  RiCheckboxCircleFill,
  RiTimeFill,
  RiTruckFill,
  RiCloseCircleFill,
  RiErrorWarningFill,
  RiArrowRightUpLine,
  RiInformationLine,
  RiTranslate2,
  RiMoonLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { Button } from "@/registry/dash/ui/button"
import { StatusBadge as DashStatusBadge, type Status as BadgeStatus } from "@/registry/dash/ui/badge"

/**
 * Portal Deliveries — list page. Ported from Dash Next Portal v2
 * (`app/[locale]/(dashboard)/deliveries/page.tsx` + DeliveryTable +
 * DeliveryFilter + DeliveryTableColumns + widget-box + DeliveryMock).
 *
 * Faithful port: full sidebar nav (Deliveries / Outlets / Addresses / Users /
 * Policies / Billing / Settings / Developer / Simulation), top header with
 * logo + notification + language + theme + user, filter bar (search + date
 * range + status + outlet + courier), analytics summary (6 statuses), and
 * the 8-row table with sample delivery IDs from `types/mock-data/DeliveryMock.ts`.
 */
export default function PortalDeliveriesListDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Deliveries"
        description="Operator deliveries list page — sidebar shell (272px) + sticky header + analytics summary (Allocating 0 / Picking up 20 / In delivery 120 / Completed 90 / Failed 5 / Cancelled 10), filter toolbar (search + date range + status + outlet + courier), and an 8-row deliveries table with Dash Express sample data (DE-1748581212493 → DE-1748581212500)."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Deliveries page — Dash Next Portal v2"
          description="1440px-wide composition. Sidebar (272px) + main column (1168px) with sticky header, top-right CTA cluster (New delivery / Bulk / Generate / Export reconciliation), 6-tile analytics summary, filter toolbar, table, pagination."
          preview={
            <DocsTemplatePreview padding="">
              <DeliveriesPreview />
            </DocsTemplatePreview>
          }
          code={`<PortalDeliveries deliveries={DELIVERIES} analytics={ANALYTICS} />`}
        />
      </DocsSection>

      <DocsSection title="Filter bar">
        <DocsExample
          bare
          title="Search + Date range + Status + Outlet + Courier + Filter"
          description="Mirrors `components/DeliveryFilter.tsx` + `components/filter/DateRangeFilter.tsx`. Status filter shows 6 chips; Outlet/Courier only render for client_super_admin role."
          preview={
            <DocsTemplatePreview padding="" minWidth={1168}>
              <div className="bg-bg-white-0 p-6">
                <FilterBar />
              </div>
            </DocsTemplatePreview>
          }
          code={`<DeliveryFilter search={search} setSearch={setSearch} userRoleParams="client_super_admin" />`}
        />
      </DocsSection>

      <DocsSection title="Table">
        <DocsExample
          bare
          title="Delivery table — 8 rows · ID / Recipient / Outlet / Status / Pickup / Drop-off / Created / Action"
          description="Ported from `components/DeliveryTableColumns.tsx`. Status badges use 6 fixed variants (Allocating / Pending pickup / Picking up / Pending delivery / In delivery / Completed / Failed / Cancelled). Row click → /deliveries/[deliveryID]."
          preview={
            <DocsTemplatePreview padding="" minWidth={1168}>
              <div className="bg-bg-white-0 p-6">
                <DeliveriesTable />
              </div>
            </DocsTemplatePreview>
          }
          code={`<DeliveryTable data={deliveries} clientType={clientType} />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><b>Sidebar</b> — Dash logo + 9 nav items (Deliveries · Outlets · Addresses · Users · Policies · Billing · Settings · Developer · Simulation) + UserButton bottom.</li>
          <li><b>Header</b> — Page title &ldquo;Deliveries&rdquo; + subtitle + right cluster: Notification bell · Language select (EN/ID) · Theme switch · Avatar.</li>
          <li><b>Action row</b> — New delivery (primary CTA, RiAddFill) · Bulk upload (RiUpload2Line) · Generate (RiSparklingLine, AI) · Export reconciliation (RiDownload2Line).</li>
          <li><b>Analytics summary</b> — 6 status tiles (Allocating / Picking up / In delivery / Completed / Failed / Cancelled) with counts from `analyticsMockData` source.</li>
          <li><b>Toolbar</b> — Search (300px) + Date range (Today / Last 7 days / Last 30 days / Custom) + Filter popover (Status / Outlet / Courier tabs).</li>
          <li><b>Table</b> — Checkbox + 7 sortable columns + action menu (View / Cancel / Download shipping label / Download shipping doc).</li>
          <li><b>Bulk action bar</b> — Appears when rows selected: Download labels · Download docs.</li>
          <li><b>Pagination</b> — Page X of Y, 10/25/50/100 per page.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>WidgetBox.Root / Header / Footer — analytics tiles + table wrapper.</li>
          <li>Button (variant primary / neutral, mode filled / stroke / lighter).</li>
          <li>InputRoot / Input / InputIcon — search input.</li>
          <li>Popover — Filter popover (Status / Outlet / Courier tabs).</li>
          <li>Checkbox.Root — table row select + header select-all.</li>
          <li>Badge.Root (size medium, variant lighter, color green/blue/yellow/red).</li>
          <li>Dropdown (Root / Trigger / Content / Item) — language + row actions.</li>
          <li>Table primitives (Table.Root / Header / Row / Head / Cell).</li>
          <li>Pagination — TablePagination 10/25/50/100.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "deliveries", type: "DeliveryDataType[]", description: "Mirrors source `types/DelliveryTypes.ts`. { deliveryID, providerOrderID, status, createdAt, pickupAt, completedAt, provider, courier, quote, providerOutlet }." },
            { name: "clientType", type: "'HEALTHCARE' | string", description: "Selects column set (Healthcare drops some fields). Source `DeliveryTableColumns.getColumnsForClientType`." },
            { name: "userRoleParams", type: "'client_super_admin' | 'client_admin' | 'client_user'", description: "Super admin sees all outlets + driver filter; others scoped to userOutletID." },
            { name: "revenueStream", type: "string", description: "Used for SLA visibility flag in detail view." },
            { name: "envMode", type: "'PRODUCTION' | 'SANDBOX'", description: "SANDBOX swaps real table for SandboxDeliveryTable + adds simulation menu item." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Verbatim sample data                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

type DeliveryStatus =
  | "ALLOCATING"
  | "PENDING_PICKUP"
  | "PICKING_UP"
  | "PENDING_DELIVERY"
  | "IN_DELIVERY"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"

type Delivery = {
  providerOrderID: string
  deliveryID: string
  status: DeliveryStatus
  createdAt: string
  pickupAt: string
  recipient: string
  outlet: string
  origin: string
  destination: string
  courier: string
}

const DELIVERIES: Delivery[] = [
  { providerOrderID: "DAILY_EXPRESS-00001", deliveryID: "DE-1748581212493", status: "ALLOCATING", createdAt: "30 May, 12:00", pickupAt: "30 May, 12:00", recipient: "Bambang Sutejo", outlet: "Kembangan Hub", origin: "Kembangan Hub", destination: "Noovoleum Ucollect", courier: "—" },
  { providerOrderID: "DAILY_EXPRESS-00002", deliveryID: "DE-1748581212494", status: "PENDING_PICKUP", createdAt: "30 May, 12:00", pickupAt: "30 May, 12:00", recipient: "Sari Wijaya", outlet: "Kembangan Hub", origin: "Kembangan Hub", destination: "Noovoleum Ucollect", courier: "Andi Pratama" },
  { providerOrderID: "DAILY_EXPRESS-00003", deliveryID: "DE-1748581212495", status: "PICKING_UP", createdAt: "30 May, 11:45", pickupAt: "30 May, 12:00", recipient: "Reza Hidayat", outlet: "Senayan Outlet", origin: "Senayan Outlet", destination: "Noovoleum Ucollect", courier: "Joko Susilo" },
  { providerOrderID: "DAILY_EXPRESS-00004", deliveryID: "DE-1748581212496", status: "PENDING_DELIVERY", createdAt: "30 May, 11:30", pickupAt: "30 May, 11:45", recipient: "Maya Sari", outlet: "Senayan Outlet", origin: "Senayan Outlet", destination: "Pondok Indah Mall", courier: "Bayu Pranata" },
  { providerOrderID: "DAILY_EXPRESS-00005", deliveryID: "DE-1748581212497", status: "IN_DELIVERY", createdAt: "30 May, 11:15", pickupAt: "30 May, 11:30", recipient: "Fadli Rahman", outlet: "Kembangan Hub", origin: "Kembangan Hub", destination: "Grand Indonesia", courier: "Dimas Saputra" },
  { providerOrderID: "DAILY_EXPRESS-00006", deliveryID: "DE-1748581212498", status: "COMPLETED", createdAt: "30 May, 10:50", pickupAt: "30 May, 11:05", recipient: "Lina Permata", outlet: "Senayan Outlet", origin: "Senayan Outlet", destination: "Plaza Indonesia", courier: "Rian Hidayat" },
  { providerOrderID: "DAILY_EXPRESS-00007", deliveryID: "DE-1748581212499", status: "FAILED", createdAt: "30 May, 10:30", pickupAt: "30 May, 10:45", recipient: "Doni Setiawan", outlet: "Kembangan Hub", origin: "Kembangan Hub", destination: "Kelapa Gading Mall", courier: "Putra Wijaya" },
  { providerOrderID: "DAILY_EXPRESS-00008", deliveryID: "DE-1748581212500", status: "CANCELLED", createdAt: "30 May, 10:00", pickupAt: "30 May, 10:15", recipient: "Tania Ardelia", outlet: "Senayan Outlet", origin: "Senayan Outlet", destination: "Central Park Mall", courier: "—" },
]

const ANALYTICS: { status: DeliveryStatus; label: string; count: number; tone: StatusTone }[] = [
  { status: "ALLOCATING", label: "Allocating", count: 0, tone: "neutral" },
  { status: "PICKING_UP", label: "Picking up", count: 20, tone: "blue" },
  { status: "IN_DELIVERY", label: "In delivery", count: 120, tone: "yellow" },
  { status: "COMPLETED", label: "Completed", count: 90, tone: "green" },
  { status: "FAILED", label: "Failed", count: 5, tone: "red" },
  { status: "CANCELLED", label: "Cancelled", count: 10, tone: "gray" },
]

/* ────────────────────────────────────────────────────────────────────────── */
/*  Preview                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function DeliveriesPreview() {
  return (
    <div className="flex min-h-[1100px] bg-bg-weak-50">
      <PortalSidebar activeHref="/deliveries" />
      <div className="flex-1 self-stretch bg-bg-white-0">
        <PortalHeader />

        <div className="flex flex-col gap-6 px-8 py-6">
          {/* Title + action cluster */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-text-strong-950">Deliveries</h1>
              <p className="mt-1 text-sm text-text-sub-600">Manage and track all deliveries across your outlets.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FakeButton>
                <RiDownload2Line className="size-4" /> Export reconciliation
              </FakeButton>
              <FakeButton>
                <RiSparklingLine className="size-4" /> Generate
              </FakeButton>
              <FakeButton>
                <RiUpload2Line className="size-4" /> Bulk upload
              </FakeButton>
              <FakeButton tone="primary">
                <RiAddFill className="size-4" /> New delivery
              </FakeButton>
            </div>
          </div>

          {/* Analytics summary */}
          <AnalyticsSummary />

          {/* Filter bar */}
          <FilterBar />

          {/* Table */}
          <DeliveriesTable />

          {/* Pagination */}
          <Pagination />
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sidebar                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

type NavItem = {
  icon: React.ElementType
  label: string
  href: string
  badge?: string
}

const NAV: NavItem[] = [
  { icon: RiTruckLine, label: "Deliveries", href: "/deliveries" },
  { icon: RiStore3Line, label: "Outlets", href: "/outlets" },
  { icon: RiMapPin2Line, label: "Addresses", href: "/addresses" },
  { icon: RiUser3Line, label: "Users", href: "/users" },
  { icon: RiShieldCheckLine, label: "Policies", href: "/policies" },
  { icon: RiBillLine, label: "Billing", href: "/billing" },
]

const NAV_FOOTER: NavItem[] = [
  { icon: RiSettings4Line, label: "Settings", href: "/settings" },
  { icon: RiCodeBoxLine, label: "Developer", href: "/developer" },
  { icon: RiTestTubeLine, label: "Simulation", href: "/simulation", badge: "Sandbox" },
]

export function PortalSidebar({ activeHref }: { activeHref: string }) {
  return (
    <aside className="hidden lg:flex w-[272px] shrink-0 flex-col self-stretch border-r border-stroke-soft-200 bg-bg-white-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-4">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-bg-strong-950 text-sm font-bold text-text-white-0">
          D
        </span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-text-strong-950">Dash Portal</div>
          <div className="text-[11px] text-text-sub-600">PT Pharma Indonesia</div>
        </div>
      </div>
      <div className="px-6"><div className="h-px bg-stroke-soft-200" /></div>

      {/* Main nav */}
      <div className="flex flex-1 flex-col gap-6 px-6 pb-4 pt-6">
        <div>
          <div className="p-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">Main</div>
          <div className="space-y-1">
            {NAV.map(({ icon: Icon, label, href }) => {
              const active = href === activeHref
              return (
                <a
                  key={label}
                  href="#"
                  className={
                    "group relative flex items-center gap-2 rounded-lg py-2 pl-3 text-sm transition-colors " +
                    (active ? "bg-bg-weak-50 text-text-strong-950" : "text-text-sub-600 hover:bg-bg-weak-50")
                  }
                >
                  {active ? <span className="absolute -left-5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" /> : null}
                  <Icon className={"size-5 shrink-0 " + (active ? "text-primary" : "text-text-sub-600")} />
                  <span className="flex-1">{label}</span>
                  {active ? <RiArrowRightSLine className="size-5 text-text-sub-600" /> : null}
                </a>
              )
            })}
          </div>
        </div>

        <div>
          <div className="p-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">System</div>
          <div className="space-y-1">
            {NAV_FOOTER.map(({ icon: Icon, label, href, badge }) => {
              const active = href === activeHref
              return (
                <a
                  key={label}
                  href="#"
                  className={
                    "group flex items-center gap-2 rounded-lg py-2 pl-3 pr-3 text-sm transition-colors " +
                    (active ? "bg-bg-weak-50 text-text-strong-950" : "text-text-sub-600 hover:bg-bg-weak-50")
                  }
                >
                  <Icon className="size-5 shrink-0 text-text-sub-600" />
                  <span className="flex-1">{label}</span>
                  {badge ? (
                    <span className="inline-flex items-center rounded-md bg-(--state-warning-lighter) px-1.5 py-0.5 text-[10px] font-medium text-(--state-warning-base)">
                      {badge}
                    </span>
                  ) : null}
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* User button */}
      <div className="border-t border-stroke-soft-200 p-3">
        <button type="button" className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-bg-weak-50">
          <span className="inline-flex size-9 items-center justify-center overflow-hidden rounded-full bg-(--state-feature-lighter) text-xs font-semibold text-(--state-feature-base)">IP</span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-text-strong-950">Irfan Prima</span>
            <span className="block text-xs text-text-sub-600">irfan@dashelectric.co</span>
          </span>
          <RiArrowRightSLine className="size-4 text-text-sub-600" />
        </button>
      </div>
    </aside>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Header                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export function PortalHeader() {
  return (
    <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-8">
      <div className="flex items-center gap-2 text-sm text-text-sub-600">
        <span>Deliveries</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="relative inline-flex size-9 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50">
          <RiNotification3Line className="size-5" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-(--state-error-base)" />
        </button>
        <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-text-sub-600 hover:bg-bg-weak-50">
          <RiTranslate2 className="size-4" />
          EN
          <RiArrowDownSLine className="size-4" />
        </button>
        <button type="button" className="inline-flex size-9 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50">
          <RiMoonLine className="size-5" />
        </button>
        <span className="inline-flex size-9 items-center justify-center overflow-hidden rounded-full bg-(--state-feature-lighter) text-xs font-semibold text-(--state-feature-base)">IP</span>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Analytics summary                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

type StatusTone = "neutral" | "blue" | "yellow" | "green" | "red" | "gray"

const TONE_BG: Record<StatusTone, string> = {
  neutral: "bg-bg-weak-50 text-text-sub-600",
  blue: "bg-(--state-information-lighter) text-(--state-information-base)",
  yellow: "bg-(--state-warning-lighter) text-(--state-warning-base)",
  green: "bg-(--state-success-lighter) text-(--state-success-base)",
  red: "bg-(--state-error-lighter) text-(--state-error-base)",
  gray: "bg-bg-weak-50 text-text-soft-400",
}

function AnalyticsSummary() {
  return (
    <div className="grid grid-cols-6 gap-3">
      {ANALYTICS.map((tile) => (
        <div key={tile.status} className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
          <div className="flex items-center justify-between">
            <span className={"inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium " + TONE_BG[tile.tone]}>
              {tile.label}
            </span>
            <RiArrowRightUpLine className="size-4 text-text-soft-400" />
          </div>
          <div className="mt-3 text-2xl font-semibold tracking-tight text-text-strong-950 tabular-nums">{tile.count}</div>
          <div className="mt-1 text-[11px] text-text-soft-400">deliveries</div>
        </div>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Filter bar                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex h-9 w-[300px] items-center gap-2 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-2.5 shadow-regular-xs">
        <RiSearch2Line className="size-4 text-text-soft-400" />
        <input
          type="text"
          placeholder="Search by ID, recipient, courier..."
          className="w-full bg-transparent text-sm text-text-strong-950 placeholder:text-text-soft-400 outline-none"
        />
      </div>
      <FakeButton>
        <RiCalendarLine className="size-4" /> Last 7 days
        <RiArrowDownSLine className="size-4" />
      </FakeButton>
      <FakeButton>
        <RiPriceTag3Line className="size-4" /> Status: All
        <RiArrowDownSLine className="size-4" />
      </FakeButton>
      <FakeButton>
        <RiStore3Line className="size-4" /> Outlet: All
        <RiArrowDownSLine className="size-4" />
      </FakeButton>
      <FakeButton>
        <RiUser3Line className="size-4" /> Courier: All
        <RiArrowDownSLine className="size-4" />
      </FakeButton>
      <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-3 text-sm text-text-sub-600 shadow-regular-xs hover:bg-bg-weak-50">
        <RiFilter3Fill className="size-4" /> Filter
        <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-text-white-0">2</span>
      </button>
      <div className="ml-auto inline-flex items-center gap-2 text-xs text-text-soft-400">
        <RiInformationLine className="size-3.5" />
        245 deliveries total
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Table                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

const STATUS_META: Record<DeliveryStatus, { label: string; tone: StatusTone; icon: React.ElementType }> = {
  ALLOCATING: { label: "Allocating", tone: "neutral", icon: RiTimeFill },
  PENDING_PICKUP: { label: "Pending pickup", tone: "blue", icon: RiTimeFill },
  PICKING_UP: { label: "Picking up", tone: "blue", icon: RiTruckFill },
  PENDING_DELIVERY: { label: "Pending delivery", tone: "yellow", icon: RiTimeFill },
  IN_DELIVERY: { label: "In delivery", tone: "yellow", icon: RiTruckFill },
  COMPLETED: { label: "Completed", tone: "green", icon: RiCheckboxCircleFill },
  FAILED: { label: "Failed", tone: "red", icon: RiErrorWarningFill },
  CANCELLED: { label: "Cancelled", tone: "gray", icon: RiCloseCircleFill },
}

const TONE_TO_BADGE_STATUS: Record<StatusTone, BadgeStatus> = {
  neutral: "neutral",
  blue: "information",
  yellow: "warning",
  green: "success",
  red: "error",
  gray: "faded",
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const meta = STATUS_META[status]
  return (
    <DashStatusBadge
      status={TONE_TO_BADGE_STATUS[meta.tone]}
      variant="icon-light"
      icon={<meta.icon />}
    >
      {meta.label}
    </DashStatusBadge>
  )
}

function DeliveriesTable() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-stroke-soft-200">
      <table className="w-full">
        <thead className="bg-bg-weak-50">
          <tr className="text-left">
            <Th width="w-10">
              <span className="inline-flex size-4 items-center justify-center rounded border border-stroke-soft-200 bg-bg-white-0" />
            </Th>
            <Th>Delivery ID</Th>
            <Th>Recipient</Th>
            <Th>Outlet</Th>
            <Th>Status</Th>
            <Th>Pickup</Th>
            <Th>Drop-off</Th>
            <Th>Created</Th>
            <Th width="w-10" />
          </tr>
        </thead>
        <tbody>
          {DELIVERIES.map((d, i) => (
            <tr key={d.deliveryID} className={"transition-colors hover:bg-bg-weak-50/60 " + (i === 0 ? "bg-bg-weak-50" : "")}>
              <Td>
                <span className="inline-flex size-4 items-center justify-center rounded border border-stroke-soft-200 bg-bg-white-0" />
              </Td>
              <Td>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-strong-950">{d.deliveryID}</span>
                  <span className="text-[11px] text-text-soft-400">{d.providerOrderID}</span>
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-7 items-center justify-center overflow-hidden rounded-full bg-bg-weak-50 text-[10px] font-semibold text-text-strong-950">
                    {d.recipient.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                  </span>
                  <span className="text-sm text-text-strong-950">{d.recipient}</span>
                </div>
              </Td>
              <Td><span className="text-sm text-text-sub-600">{d.outlet}</span></Td>
              <Td><StatusBadge status={d.status} /></Td>
              <Td><span className="text-sm text-text-strong-950">{d.origin}</span></Td>
              <Td><span className="text-sm text-text-strong-950">{d.destination}</span></Td>
              <Td><span className="text-sm tabular-nums text-text-sub-600">{d.createdAt}</span></Td>
              <Td>
                <button type="button" className="inline-flex size-7 items-center justify-center rounded-md text-text-sub-600 hover:bg-bg-weak-50">
                  <RiMore2Line className="size-4" />
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, width }: { children?: React.ReactNode; width?: string }) {
  return (
    <th className={"px-4 py-3 text-xs font-medium text-text-sub-600 text-left " + (width ?? "")}>
      <span className="inline-flex items-center gap-1">
        {children}
        {children && typeof children === "string" ? <RiExpandUpDownFill className="size-3.5 text-text-soft-400" /> : null}
      </span>
    </th>
  )
}

function Td({ children }: { children?: React.ReactNode }) {
  return <td className="border-t border-stroke-soft-200 px-4 py-3 h-12 align-middle">{children}</td>
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Pagination                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function Pagination() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 text-sm text-text-sub-600">Page 1 of 25</span>
      <div className="inline-flex items-center gap-1">
        <PageBtn><RiArrowLeftDoubleLine className="size-4" /></PageBtn>
        <PageBtn><RiArrowLeftSLine className="size-4" /></PageBtn>
        <PageBtn current>1</PageBtn>
        <PageBtn>2</PageBtn>
        <PageBtn>3</PageBtn>
        <PageBtn>…</PageBtn>
        <PageBtn>25</PageBtn>
        <PageBtn><RiArrowRightSLine className="size-4" /></PageBtn>
        <PageBtn><RiArrowRightDoubleLine className="size-4" /></PageBtn>
      </div>
      <div className="flex flex-1 justify-end">
        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 text-xs text-text-sub-600 shadow-regular-xs">
          10 / page
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

/* ────────────────────────────────────────────────────────────────────────── */
/*  Shared buttons (export so detail page can reuse)                          */
/* ────────────────────────────────────────────────────────────────────────── */

export function FakeButton({
  children,
  tone,
}: {
  children: React.ReactNode
  tone?: "primary"
}) {
  return (
    <Button
      type="button"
      tone={tone === "primary" ? "primary" : "neutral"}
      style={tone === "primary" ? "filled" : "stroke"}
      size="md"
    >
      {children}
    </Button>
  )
}

export { TONE_BG, STATUS_META, StatusBadge }
export type { DeliveryStatus, StatusTone }
