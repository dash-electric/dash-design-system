"use client"

import * as React from "react"
import {
  RiSearch2Line,
  RiCalendarLine,
  RiMoreLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { StatusBadge } from "@/registry/dash/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { PortalDashboardShell } from "../portal-dashboard-shell/page"

/**
 * Portal Billing. Ported from Dash Next Portal v2 source (2026-05-19).
 * Source: app/[locale]/(dashboard)/billing/page.tsx
 * Header: title "Billing" + subtitle "View and manage your billing information".
 * Filter bar above table (search + date range + status + type). Paginated table.
 */
export default function PortalBillingPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Billing"
        description='Billing transactions page inside the Portal dashboard shell. Title "Billing" · subtitle "View and manage your billing information". URL-driven filters (status, startDate, endDate, search). Detail modal opens on row click.'
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Header + filter bar + transactions table"
          description='Layout matches Addresses: container `mx-6 flex flex-col gap-4 lg:container lg:mx-auto lg:px-8`. No CTA in the header (read-only screen). `BillingFilter` exposes search + date range filters.'
          preview={
            <DocsTemplatePreview>
              <PortalDashboardShell>
                <BillingPageBody />
              </PortalDashboardShell>
            </DocsTemplatePreview>
          }
          code={`<div className="mx-6 flex flex-col gap-4 lg:container lg:mx-auto lg:px-8">
  <div className="flex items-center justify-between">
    <div className="flex flex-col gap-1">
      <p className="text-title-h6 lg:text-title-h5">Billing</p>
      <p className="text-paragraph-sm text-text-sub-600">
        View and manage your billing information
      </p>
    </div>
  </div>

  <BillingFilter search={search} setSearch={setSearch} />

  {isLoading ? <RealisticTableSkeleton /> : <BillingTable data={billingList} />}

  <TablePagination />
</div>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Title block</strong> — verbatim source: <code>{`t('title')`}</code> = “Billing”, subtitle = “View and manage your billing information”. No primary CTA.</li>
          <li><strong>Filters</strong> — search by transaction ID/description, date range picker, status multi-select, type multi-select. From <code>billing.filters.*</code>: “Search transactions”, “Date Range”, “Status”, “Type”, “Clear All”, “Select All”, “Clear”, “Apply”.</li>
          <li><strong>Table columns</strong> — verbatim from <code>billing.table.*</code>: Transaction ID · Type · Payment · &hellip;.</li>
          <li><strong>Status badge</strong> — color-coded via <code>StatusBadge</code> (Paid / Pending / Failed / Refunded).</li>
          <li><strong>Detail modal</strong> — <code>BillingDetailModal</code> opens on row click; shows full transaction breakdown.</li>
          <li><strong>URL sync</strong> — filters round-trip through <code>searchParams</code>; changing any filter resets page to 1.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>InputRoot</code> / <code>Input</code> / <code>InputIcon</code> — search.</li>
          <li><code>Button</code> — Clear / Apply filter actions.</li>
          <li><code>IconButton</code> — row kebab.</li>
          <li><code>StatusBadge</code> — payment status pill.</li>
          <li><code>Table</code> — transactions list.</li>
          <li><code>DatePicker</code> / <code>Calendar</code> — date range (source uses custom picker).</li>
          <li><code>Modal</code> — billing detail.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

function BillingPageBody() {
  const rows = [
    { id: "TX-2026-001823", type: "Delivery", payment: "QRIS", amount: "Rp 1,250,000", date: "May 18, 2026", status: "Paid" as const },
    { id: "TX-2026-001822", type: "Top-up", payment: "Bank Transfer", amount: "Rp 5,000,000", date: "May 17, 2026", status: "Paid" as const },
    { id: "TX-2026-001821", type: "Delivery", payment: "Credit", amount: "Rp 380,000", date: "May 17, 2026", status: "Pending" as const },
    { id: "TX-2026-001820", type: "Delivery", payment: "QRIS", amount: "Rp 215,500", date: "May 16, 2026", status: "Failed" as const },
  ]

  const statusMap = {
    Paid: { status: "success" as const, label: "Paid" },
    Pending: { status: "warning" as const, label: "Pending" },
    Failed: { status: "error" as const, label: "Failed" },
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-title-h5 font-medium text-text-strong-950">
            Billing
          </p>
          <p className="text-paragraph-sm font-normal text-text-sub-600">
            View and manage your billing information
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputRoot className="min-w-[300px]">
          <InputIcon><RiSearch2Line className="size-4" /></InputIcon>
          <Input placeholder="Search transactions" />
        </InputRoot>
        <Button tone="neutral" style="stroke" leftIcon={<RiCalendarLine />}>
          Date Range
        </Button>
        <Button tone="neutral" style="stroke">Status</Button>
        <Button tone="neutral" style="stroke">Type</Button>
        <div className="ml-auto flex gap-2">
          <Button tone="neutral" style="ghost">Clear All</Button>
          <Button tone="primary">Apply</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-text-strong-950">{r.id}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.payment}</TableCell>
                <TableCell>{r.amount}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>
                  <StatusBadge status={statusMap[r.status].status}>
                    {statusMap[r.status].label}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <IconButton aria-label="Row actions" style="ghost" tone="neutral" size="sm">
                    <RiMoreLine className="size-4" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2 text-paragraph-sm text-text-sub-600">
        <span>Showing 1–4 of 86</span>
        <Button tone="neutral" style="stroke" size="sm">Prev</Button>
        <Button tone="neutral" style="stroke" size="sm">Next</Button>
      </div>
    </div>
  )
}
