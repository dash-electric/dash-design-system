"use client"

import * as React from "react"
import {
  RiAddFill,
  RiSearch2Line,
  RiUpload2Line,
  RiMoreLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
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
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { PortalDashboardShell } from "../portal-dashboard-shell/page"

/**
 * Portal Addresses. Ported from Dash Next Portal v2 source (2026-05-19).
 * Source: app/[locale]/(dashboard)/addresses/page.tsx
 * Header: title "Address" + subtitle "Manage your pickup and delivery addresses" +
 * Create Address dropdown (Add Manual / Upload CSV). Search on right. Table + pagination.
 * On mobile: FAB instead of dropdown trigger.
 */
export default function PortalAddressesPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Addresses"
        description='Address CRUD page inside the Portal dashboard shell. Title "Address" · subtitle "Manage your pickup and delivery addresses". Search-by-name (debounced 1s), paginated table, "Create Address" dropdown opens either Add Manual or Upload CSV modal.'
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Header + search + table"
          description='Layout: container `mx-6 flex flex-col gap-4 lg:container lg:mx-auto lg:px-8 lg:pb-0`. Header row = title block + "Create Address" dropdown (hidden under lg, replaced by FAB). Search aligns right with `lg:w-fit lg:min-w-[300px]`.'
          preview={
            <DocsTemplatePreview>
              <PortalDashboardShell>
                <AddressesPageBody />
              </PortalDashboardShell>
            </DocsTemplatePreview>
          }
          code={`<div className="mx-6 flex flex-col gap-4 lg:container lg:mx-auto lg:px-8">
  <div className="flex items-center justify-between">
    <div className="flex flex-col gap-1">
      <p className="text-title-h6 lg:text-title-h5">Address</p>
      <p className="text-paragraph-sm text-text-sub-600">
        Manage your pickup and delivery addresses
      </p>
    </div>
    <Dropdown>
      <DropdownTrigger asChild>
        <Button tone="primary" leftIcon={<RiAddFill />}>Create Address</Button>
      </DropdownTrigger>
      <DropdownContent align="end">
        <DropdownItem><RiAddFill /> Add Manual</DropdownItem>
        <DropdownItem><RiUpload2Line /> Upload CSV</DropdownItem>
      </DropdownContent>
    </Dropdown>
  </div>

  <div className="flex w-full lg:justify-end">
    <Input size="sm" className="lg:w-fit lg:min-w-[300px]">
      <Input.Icon as={RiSearch2Line} />
      <Input.Input placeholder="Search" />
    </Input>
  </div>

  <AddressTable data={addresses} />
  <TablePagination />
</div>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Title block</strong> — verbatim source: title <code>{`t('title')`}</code> = “Address”, subtitle = “Manage your pickup and delivery addresses”.</li>
          <li><strong>Primary CTA</strong> — Dropdown with trigger “Create Address” (<code>RiAddFill</code>), hidden on mobile.</li>
          <li><strong>Dropdown items</strong> — “Add Manual” (<code>RiAddFill</code>) and “Upload CSV” (<code>RiUpload2Line</code>) — each opens a modal.</li>
          <li><strong>Mobile FAB</strong> — fixed bottom-right (<code>fixed bottom-6 right-4 z-40 lg:hidden</code>), 56px circle, opens Add Manual modal.</li>
          <li><strong>Search</strong> — small <code>InputRoot</code>, 1s debounce before triggering <code>setSearch</code>.</li>
          <li><strong>Table columns</strong> — verbatim from <code>addresses.table.*</code>: Address Name · Contact Person · Phone Number · Address · Type · Actions. Empty: “No addresses found” + “Create your first address to get started.”</li>
          <li><strong>Pagination</strong> — <code>hidePageSize</code> flag; only page navigation.</li>
          <li><strong>Toast</strong> — URL query <code>?toast=success-payment</code> triggers a generic success notification on mount.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><code>Button</code> + <code>DropdownMenu</code> — Create Address picker.</li>
          <li><code>IconButton</code> — row actions (kebab).</li>
          <li><code>InputRoot</code> / <code>Input</code> / <code>InputIcon</code> — search.</li>
          <li><code>Table</code> / <code>TableHeader</code> / <code>TableRow</code> / <code>TableHead</code> / <code>TableCell</code> — address list.</li>
          <li><code>Tag</code> — Type pills (Pickup / Delivery).</li>
          <li><code>Skeleton</code> (RealisticTableSkeleton equiv.) — loading.</li>
          <li><code>Pagination</code> — page navigation.</li>
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

function AddressesPageBody() {
  const rows = [
    {
      name: "Main Warehouse Jakarta",
      contact: "Andre Wijaya",
      phone: "+62 812 3456 7890",
      address: "Jl. Gatot Subroto No. 42, Jakarta Selatan",
      type: "Pickup",
    },
    {
      name: "Plaza Indonesia Office",
      contact: "Sari Putri",
      phone: "+62 813 5678 1234",
      address: "Plaza Indonesia, Lt. 5, Thamrin",
      type: "Pickup",
    },
    {
      name: "Customer Bandung",
      contact: "Budi Hartono",
      phone: "+62 821 0987 6543",
      address: "Jl. Asia Afrika 123, Bandung",
      type: "Delivery",
    },
  ]

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-title-h5 font-medium text-text-strong-950">
            Address
          </p>
          <p className="text-paragraph-sm font-normal text-text-sub-600">
            Manage your pickup and delivery addresses
          </p>
        </div>
        <Button tone="primary" leftIcon={<RiAddFill />}>
          Create Address
        </Button>
      </div>

      <div className="flex w-full lg:justify-end">
        <InputRoot className="lg:w-fit lg:min-w-[300px]">
          <InputIcon><RiSearch2Line className="size-4" /></InputIcon>
          <Input placeholder="Search" />
        </InputRoot>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="font-medium text-text-strong-950">
                  {r.name}
                </TableCell>
                <TableCell>{r.contact}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell className="max-w-[280px] truncate">{r.address}</TableCell>
                <TableCell>
                  <Tag>{r.type}</Tag>
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
        <span>Page 1 of 4</span>
        <Button tone="neutral" style="stroke" size="sm">Prev</Button>
        <Button tone="neutral" style="stroke" size="sm">Next</Button>
      </div>
    </div>
  )
}
