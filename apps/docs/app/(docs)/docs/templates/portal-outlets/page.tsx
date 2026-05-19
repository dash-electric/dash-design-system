"use client"

import * as React from "react"
import {
  RiAddFill,
  RiMore2Line,
  RiSearchLine,
  RiFilter3Line,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { StatusBadge } from "@/registry/dash/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { PortalShell, PortalHeader } from "../_portal-shared"

/**
 * Portal Outlets — ported from
 * next-portal-v2-web/app/[locale]/(dashboard)/outlets/page.tsx + OutletTable.tsx
 * + OutletFilter.tsx. Header + search filter row + outlets table with name/city
 * columns + row actions. Sample data verbatim from observed API response shape.
 */

const SAMPLE_OUTLETS = [
  { id: "o-001", name: "Main Branch", city: "Jakarta Selatan", status: "active" },
  { id: "o-002", name: "Kemang Outlet", city: "Jakarta Selatan", status: "active" },
  { id: "o-003", name: "PIK Outlet", city: "Jakarta Utara", status: "active" },
  { id: "o-004", name: "Cilandak Hub", city: "Jakarta Selatan", status: "active" },
  { id: "o-005", name: "Bekasi Hub", city: "Bekasi", status: "active" },
  { id: "o-006", name: "Tangerang Outlet", city: "Tangerang", status: "inactive" },
  { id: "o-007", name: "BSD City Outlet", city: "Tangerang Selatan", status: "active" },
  { id: "o-008", name: "Depok Outlet", city: "Depok", status: "active" },
]

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px] p-6">{children}</div>
    </div>
  )
}

export default function PortalOutletsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Portal Outlets"
        description="Outlets directory for the Dash client portal. Sidebar + topbar + outlets table with name/city columns, search filter, row actions, and pagination footer. Mirrors the production route at /outlets."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Outlets page"
          description="Sigit (super admin) views all outlets under their tenant. Search narrows by name; row click opens detail modal."
          preview={
            <DocsTemplatePreview>
              <PortalShell active="/outlets">
                <PortalHeader
                  title="Outlets"
                  subtitle="Manage outlets and their availability across your tenant."
                />
                <div className="flex flex-col gap-4 px-8 py-6">
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                    <div className="w-full max-w-[300px]">
                      <InputRoot size="sm">
                        <InputIcon>
                          <RiSearchLine className="size-4" />
                        </InputIcon>
                        <Input placeholder="Search outlets" />
                      </InputRoot>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button tone="neutral" style="stroke" size="sm">
                        <RiFilter3Line className="size-4" />
                        Filter
                      </Button>
                      <Button tone="primary" style="filled" size="sm">
                        <RiAddFill className="size-4" />
                        Add Outlet
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-stroke-soft-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {SAMPLE_OUTLETS.map((o) => (
                          <TableRow key={o.id}>
                            <TableCell className="font-medium text-text-strong-950">
                              {o.name}
                            </TableCell>
                            <TableCell className="text-text-sub-600">
                              {o.city}
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                status={o.status === "active" ? "success" : "faded"}
                                variant="dot-light"
                              >
                                {o.status === "active" ? "Active" : "Inactive"}
                              </StatusBadge>
                            </TableCell>
                            <TableCell className="text-right">
                              <CompactButton size="md" variant="ghost" aria-label="Row actions">
                                <RiMore2Line className="size-4" />
                              </CompactButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-sm text-text-sub-600">
                    <span>Showing 1-8 of 8 outlets</span>
                    <div className="flex items-center gap-2">
                      <Button tone="neutral" style="stroke" size="xs" disabled>
                        Previous
                      </Button>
                      <Button tone="neutral" style="stroke" size="xs" disabled>
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </PortalShell>
            </DocsTemplatePreview>
          }
          code={`<PortalShell active="/outlets">
  <PortalHeader title="Outlets" subtitle="..." />
  <div className="flex flex-col gap-4 px-8 py-6">
    <SearchAndFilterRow />
    <OutletsTable data={outlets} />
    <Pagination />
  </div>
</PortalShell>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><b>Sidebar</b> — 240px brand + Main nav group (Delivery / Address / Outlets / Users / Policies / Billing / Developers / Setting) + user card.</li>
          <li><b>Topbar</b> — page title + subtitle on the left, locale select + notification bell + primary action on the right.</li>
          <li><b>Toolbar</b> — search input (300px, debounce 1000ms) + Filter popover + <b>Add Outlet</b> primary button.</li>
          <li><b>Table</b> — sticky right-rail action column; columns: Name, City, Status, Actions. Click row → opens OutletDetailModal.</li>
          <li><b>Empty state</b> — illustration + "No outlets yet" / "Try adjusting your filters or create a new outlet" copy.</li>
          <li><b>Pagination</b> — TablePagination block (page / pageSize / lastPage from API response).</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><b>Use</b> for any tenant-scoped directory (outlets, addresses, vehicles, hubs) where each row is a manageable asset.</li>
          <li><b>Use</b> when row actions need to live in a sticky right column so the action target never scrolls out of view.</li>
          <li><b>Don't</b> use for time-series records (deliveries, transactions) — those want timeline ordering, not directory ordering.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "outlets", type: "Outlet[]", description: "{ id, name, city, status }[]." },
            { name: "isLoading", type: "boolean", description: "When true, swap the table for RealisticTableSkeleton." },
            { name: "page / pageSize / totalPage", type: "number", description: "Controlled pagination state — server-paged." },
            { name: "search", type: "string", description: "Debounced 1000ms before fetch is re-fired." },
            { name: "onAdd", type: "() => void", description: "Opens the CreateOutletModal via URL (?modal=create-user)." },
            { name: "onRowClick", type: "(outlet: Outlet) => void", description: "Opens OutletDetailModal via URL (?id=…&modal=detail)." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
