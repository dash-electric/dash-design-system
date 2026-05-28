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
import { Badge, StatusBadge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
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
 * Portal Users — ported from
 * next-portal-v2-web/app/[locale]/(dashboard)/users/page.tsx + UserTable.tsx +
 * UserTableColumns.tsx + UserFilter.tsx. Sigit (super_admin) gets a 6-column
 * layout (name / email / outlet / role / status / actions); other roles get
 * 5-column (no outlet). Sample data verbatim from i18n role/status copy in
 * users namespace.
 */

const SAMPLE_USERS = [
  {
    id: "u-001",
    name: "Sigit Permana",
    email: "sigit@dash.id",
    initials: "SP",
    outlet: "Main Branch",
    role: "Super Admin",
    status: "active",
  },
  {
    id: "u-002",
    name: "Aditya Brahmana",
    email: "aditya@dash.id",
    initials: "AB",
    outlet: "Main Branch",
    role: "Admin",
    status: "active",
  },
  {
    id: "u-003",
    name: "Fayzul Rahman",
    email: "fayzul@dash.id",
    initials: "FR",
    outlet: "Kemang Outlet",
    role: "Staff",
    status: "active",
  },
  {
    id: "u-004",
    name: "Ria Anggraini",
    email: "ria@dash.id",
    initials: "RA",
    outlet: "PIK Outlet",
    role: "Staff",
    status: "pending",
  },
  {
    id: "u-005",
    name: "Budi Santoso",
    email: "budi@dash.id",
    initials: "BS",
    outlet: "Cilandak Hub",
    role: "Developer",
    status: "active",
  },
  {
    id: "u-006",
    name: "Sari Wulandari",
    email: "sari@dash.id",
    initials: "SW",
    outlet: "Bekasi Hub",
    role: "Admin",
    status: "inactive",
  },
  {
    id: "u-007",
    name: "Eko Prasetya",
    email: "eko@dash.id",
    initials: "EP",
    outlet: "BSD City Outlet",
    role: "Staff",
    status: "expired",
  },
]

const ROLE_BADGE: Record<
  string,
  "feature" | "information" | "success" | "highlighted" | "stable"
> = {
  "Super Admin": "feature",
  Admin: "information",
  Staff: "stable",
  Developer: "success",
}

const STATUS_MAP: Record<string, { label: string; status: "success" | "faded" | "warning" | "error" }> = {
  active: { label: "Active", status: "success" },
  inactive: { label: "Inactive", status: "faded" },
  pending: { label: "Pending", status: "warning" },
  expired: { label: "Expired", status: "error" },
}

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px] p-6">{children}</div>
    </div>
  )
}

export default function PortalUsersPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Portal Users"
        description="Team directory for the Dash client portal. Sidebar + topbar + 6-column users table (Avatar/Name · Email · Outlet · Role · Status · Actions) + Invite User primary button. Mirrors the production route at /users for the super_admin role."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Users page"
          description="Super admin view — sees all teammates across outlets, role + status badges. Invite User opens the CreateUserModal."
          preview={
            <DocsTemplatePreview>
              <PortalShell active="/users">
                <PortalHeader
                  title="Users"
                  subtitle="Manage users and their permissions."
                />
                <div className="flex flex-col gap-4 px-8 py-6">
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                    <div className="w-full max-w-[300px]">
                      <InputRoot size="sm">
                        <InputIcon>
                          <RiSearchLine className="size-4" />
                        </InputIcon>
                        <Input placeholder="Search users" />
                      </InputRoot>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button tone="neutral" style="stroke" size="sm">
                        <RiFilter3Line className="size-4" />
                        Filter
                      </Button>
                      <Button tone="primary" style="filled" size="sm">
                        <RiAddFill className="size-4" />
                        Invite User
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-stroke-soft-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Outlet</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {SAMPLE_USERS.map((u) => {
                          const s = STATUS_MAP[u.status] ?? STATUS_MAP.active
                          return (
                            <TableRow key={u.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar size="sm">
                                    <AvatarFallback>{u.initials}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-text-strong-950">
                                    {u.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-text-sub-600">{u.email}</TableCell>
                              <TableCell className="text-text-sub-600">{u.outlet}</TableCell>
                              <TableCell>
                                <Badge status={ROLE_BADGE[u.role] ?? "stable"}>
                                  {u.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={s.status} variant="dot-light">
                                  {s.label}
                                </StatusBadge>
                              </TableCell>
                              <TableCell className="text-right">
                                <CompactButton size="md" variant="ghost" aria-label="Row actions">
                                  <RiMore2Line className="size-4" />
                                </CompactButton>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-sm text-text-sub-600">
                    <span>Showing 1-7 of 7 users</span>
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
          code={`<PortalShell active="/users">
  <PortalHeader title="Users" subtitle="..." />
  <SearchAndFilterRow onInvite={openInviteModal} />
  <UsersTable role={userRole} data={users} />
  <Pagination />
</PortalShell>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><b>Toolbar</b> — search input (300px) + Filter popover + <b>Invite User</b> primary button. Floating FAB on mobile.</li>
          <li><b>Table columns (super_admin)</b> — Name (Avatar+Name), Email, Outlet, Role, Status, Actions.</li>
          <li><b>Table columns (other roles)</b> — Name, Email, Role, Status, Actions (Outlet column hidden).</li>
          <li><b>Role badge</b> — Super Admin (primary) / Admin (blue) / Staff (neutral) / Developer (success).</li>
          <li><b>Status badge</b> — active / inactive / pending / expired with the standard StatusBadge palette.</li>
          <li><b>Row click</b> — opens UserDetailModal via URL (?id=…&modal=detail); from there: Edit, Resend invite, Remove.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><b>Use</b> for any tenant-scoped team directory where role + invite lifecycle matter.</li>
          <li><b>Use</b> the Avatar+Name compound cell whenever the row represents a person — the avatar carries identity faster than the email column.</li>
          <li><b>Don't</b> reuse the role badge palette for non-user contexts — Super Admin = primary purple is a brand contract.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "users", type: "User[]", description: "{ id, name, email, providerOutlets:[{ name }], roles:[{ name }], status }[]." },
            { name: "userRole", type: '"client_super_admin" | "client_admin" | …', description: "Drives column visibility (Outlet column only for super_admin)." },
            { name: "isLoading", type: "boolean", description: "Swap the table for RealisticTableSkeleton when true." },
            { name: "search", type: "string", description: "Debounced 1000ms before fetch is re-fired." },
            { name: "onInvite", type: "() => void", description: "Opens CreateUserModal via URL (?modal=create-user)." },
            { name: "onRowClick", type: "(user: User) => void", description: "Opens UserDetailModal." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
