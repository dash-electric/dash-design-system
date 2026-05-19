"use client"

import * as React from "react"
import {
  RiExpandUpDownFill,
  RiFilter3Fill,
  RiGroupLine,
  RiMore2Line,
  RiSearch2Line,
  RiSortDesc,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { Divider } from "@/registry/dash/ui/divider"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Kbd } from "@/registry/dash/ui/kbd"
import {
  SegmentedControl,
  SegmentedItem,
} from "@/registry/dash/ui/segmented-control"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/dash/ui/select"
import { StatusBadge } from "@/registry/dash/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/dash/ui/table"
import {
  SettingsPagePreview,
  SettingsSectionHeader,
} from "../_shared"

/* ------------------------------------------------------------------------- */
/* Data                                                                      */
/* ------------------------------------------------------------------------- */

type Member = {
  id: string
  name: string
  initials: string
  email: string
  lastActivity: string
  role: string
}

const members: Member[] = [
  {
    id: "326860a3",
    name: "Arthur Taylor",
    initials: "AT",
    email: "arthur@alignui.com",
    lastActivity: "Today, 3:52 PM",
    role: "CEO",
  },
  {
    id: "326860b3",
    name: "Sophia Williams",
    initials: "SW",
    email: "sophia@alignui.com",
    lastActivity: "Yesterday, 8:21 AM",
    role: "HR Assistant",
  },
  {
    id: "326860c3",
    name: "Matthew Johnson",
    initials: "MJ",
    email: "matthew@alignui.com",
    lastActivity: "Today, 3:24 PM",
    role: "Data Engineer",
  },
  {
    id: "326860d3",
    name: "James Brown",
    initials: "JB",
    email: "james@alignui.com",
    lastActivity: "Sep 24, 2023 at 2:10 PM",
    role: "Marketing Manager",
  },
  {
    id: "326860e3",
    name: "Wei Chen",
    initials: "WC",
    email: "wei@alignui.com",
    lastActivity: "Sep 23, 2023 at 1:30 PM",
    role: "Operations Manager",
  },
]

/* ------------------------------------------------------------------------- */
/* Filters row                                                               */
/* ------------------------------------------------------------------------- */

function TeamFilters() {
  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
      <InputRoot size="md" className="lg:hidden">
        <InputIcon>
          <RiSearch2Line className="size-5" />
        </InputIcon>
        <Input placeholder="Search..." />
        <button type="button" aria-label="Filter">
          <RiFilter3Fill className="size-5 text-text-soft-400" />
        </button>
      </InputRoot>

      <SegmentedControl defaultValue="all" className="lg:w-80">
        <SegmentedItem value="all">All</SegmentedItem>
        <SegmentedItem value="active">Active</SegmentedItem>
        <SegmentedItem value="inactive">Inactive</SegmentedItem>
      </SegmentedControl>

      <div className="hidden flex-wrap gap-3 min-[560px]:flex-nowrap lg:flex">
        <InputRoot size="sm" className="w-[300px]">
          <InputIcon>
            <RiSearch2Line className="size-4" />
          </InputIcon>
          <Input placeholder="Search..." />
          <Kbd>⌘1</Kbd>
        </InputRoot>

        <Button
          tone="neutral"
          style="stroke"
          size="sm"
          className="flex-1 min-[560px]:flex-none"
        >
          <RiFilter3Fill className="size-4" />
          Filter
        </Button>

        <Select>
          <SelectTrigger size="sm" className="w-auto flex-1 min-[560px]:flex-none">
            <RiSortDesc className="size-4 text-text-sub-600" />
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

/* ------------------------------------------------------------------------- */
/* Table                                                                     */
/* ------------------------------------------------------------------------- */

function SortHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5">
      {children}
      <button
        type="button"
        className="inline-flex items-center text-text-sub-600"
        aria-label="Sort"
      >
        <RiExpandUpDownFill className="size-5 text-text-sub-600" />
      </button>
    </div>
  )
}

function TeamMembersTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-stroke-soft-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-0 pr-0">
              <Checkbox aria-label="Select all" />
            </TableHead>
            <TableHead>
              <SortHeader>Member Full Name</SortHeader>
            </TableHead>
            <TableHead>
              <SortHeader>Email Address</SortHeader>
            </TableHead>
            <TableHead>
              <SortHeader>Account</SortHeader>
            </TableHead>
            <TableHead>
              <SortHeader>Role</SortHeader>
            </TableHead>
            <TableHead className="w-[60px] px-5" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="h-12 w-0 pr-0">
                <Checkbox aria-label={`Select ${m.name}`} />
              </TableCell>
              <TableCell className="h-12">
                <div className="flex items-center gap-3">
                  <Avatar size="md">
                    <AvatarFallback>{m.initials}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium text-text-strong-950">
                    {m.name}
                  </div>
                </div>
              </TableCell>
              <TableCell className="h-12 text-sm text-text-sub-600">
                {m.email}
              </TableCell>
              <TableCell className="h-12 text-sm text-text-sub-600">
                {m.lastActivity}
              </TableCell>
              <TableCell className="h-12">
                <StatusBadge
                  status="success"
                  variant="dot-stroke"
                  size="sm"
                >
                  {m.role}
                </StatusBadge>
              </TableCell>
              <TableCell className="h-12 w-0 px-5">
                <Button
                  tone="neutral"
                  style="ghost"
                  size="icon-xs"
                  aria-label={`More actions for ${m.name}`}
                >
                  <RiMore2Line className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* Section body                                                              */
/* ------------------------------------------------------------------------- */

function TeamSectionBody() {
  return (
    <>
      <SettingsSectionHeader
        icon={RiGroupLine}
        title="Team"
        description="Display team members and personalize preferences."
      />
      <div className="px-4 lg:px-8">
        <Divider />
      </div>
      <div className="flex w-full flex-1 flex-col gap-4 px-4 py-6 lg:px-8">
        <TeamFilters />
        <TeamMembersTable />
      </div>
    </>
  )
}

export default function FinanceSettingsDeepTeamPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance / Settings"
        title="Team"
        description="Filter row (All / Active / Inactive SegmentedControl + 300px search input with ⌘1 Kbd + Filter button + Sort Select) and a 5-row team members table with Avatar + Name, Email, Account (relative date), Role (StatusBadge dot-stroke), per-row More action. Ported from app/settings/team-settings/{page,filters,table}.tsx."
      />

      <DocsSection title="Team section preview">
        <SettingsPagePreview active="team">
          <TeamSectionBody />
        </SettingsPagePreview>
      </DocsSection>

      <DocsSection title="Members">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Arthur Taylor</strong>{" "}
            (CEO) · arthur@alignui.com · Today, 3:52 PM
          </li>
          <li>
            <strong className="text-text-strong-950">Sophia Williams</strong>{" "}
            (HR Assistant) · sophia@alignui.com · Yesterday, 8:21 AM
          </li>
          <li>
            <strong className="text-text-strong-950">Matthew Johnson</strong>{" "}
            (Data Engineer) · matthew@alignui.com · Today, 3:24 PM
          </li>
          <li>
            <strong className="text-text-strong-950">James Brown</strong>{" "}
            (Marketing Manager) · james@alignui.com · Sep 24, 2023 at 2:10 PM
          </li>
          <li>
            <strong className="text-text-strong-950">Wei Chen</strong>{" "}
            (Operations Manager) · wei@alignui.com · Sep 23, 2023 at 1:30 PM
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Filters</strong> —
            mobile-only InputRoot with inline filter button, then a 3-segment
            SegmentedControl (All / Active / Inactive), then a desktop-only
            row with 300px search input + Kbd hint, Filter stroke button, and
            a Sort by Select.
          </li>
          <li>
            <strong className="text-text-strong-950">Table</strong> — select
            checkbox column + 4 sortable headers (Member Full Name / Email
            Address / Account / Role) + actions column. Role uses
            <code> StatusBadge variant="dot-stroke" status="success"</code>{" "}
            (source = <code>StatusBadge variant="stroke" status="completed"</code>).
          </li>
          <li>
            Source uses <code>@tanstack/react-table</code> with
            <code> getSortedRowModel</code>; sort interactions are documented
            but not implemented in the static docs preview.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
