"use client"

import * as React from "react"
import {
  RiGroupLine,
  RiAddLine,
  RiShareForwardBoxLine,
  RiSearch2Line,
  RiFilter3Fill,
  RiSortDesc,
  RiCheckboxCircleFill,
  RiArrowDownSFill,
  RiMore2Line,
  RiArrowLeftDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightDoubleLine,
  RiArrowRightSLine,
  RiExpandUpDownFill,
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { StatusBadge } from "@/registry/dash/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import { cn } from "@/registry/dash/lib/utils"
import {
  HrAppShell,
  HrHeader,
} from "@/registry/dash/templates/_internal/hr-app-shell"

/* -------------------------------------------------------------------------- *
 *  HR Teams (Deep) — Synergy HR Teams page                                   *
 *  Mirrors `template-hr-master/app/(main)/teams/{page,filters,table}.tsx`.   *
 *  All 7 sample members ported verbatim (id, name, email, role, project,    *
 *  document, status).                                                        *
 * -------------------------------------------------------------------------- */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

type Row = {
  id: string
  name: string
  email: string
  initials: string
  title: string
  since: string
  project: string
  task: string
  brand: string
  brandTone: string
  doc: string
  docSize: string
  status: "Active" | "Absent"
}

const rows: Row[] = [
  {
    id: "326860c3",
    name: "James Brown",
    email: "james@alignui.com",
    initials: "JB",
    title: "Marketing Manager",
    since: "Since Aug, 2021",
    project: "Monday.com",
    task: "Campaign Strategy Brainstorming",
    brand: "M",
    brandTone: "bg-(--dash-red-500)",
    doc: "brown-james.pdf",
    docSize: "2.4 MB",
    status: "Active",
  },
  {
    id: "8a2c57d0",
    name: "Sophia Williams",
    email: "sophia@alignui.com",
    initials: "SW",
    title: "HR Assistant",
    since: "Since Aug, 2021",
    project: "Notion",
    task: "Employee Engagement Survey",
    brand: "N",
    brandTone: "bg-bg-strong-950",
    doc: "williams-sophia.pdf",
    docSize: "2.4 MB",
    status: "Active",
  },
  {
    id: "1a6256ab",
    name: "Arthur Taylor",
    email: "arthur@alignui.com",
    initials: "AT",
    title: "Entrepreneur / CEO",
    since: "Since May, 2022",
    project: "Spotify",
    task: "Vision and Goal Setting Session",
    brand: "S",
    brandTone: "bg-(--state-success-base)",
    doc: "taylor-arthur.pdf",
    docSize: "2.4 MB",
    status: "Absent",
  },
  {
    id: "9f92efe3",
    name: "Emma Wright",
    email: "emma@alignui.com",
    initials: "EW",
    title: "Front-end Developer",
    since: "Since Sep, 2022",
    project: "Formcarry",
    task: "User Feedback Analysis",
    brand: "F",
    brandTone: "bg-(--dash-purple-500)",
    doc: "wright-emma.pdf",
    docSize: "1.9 MB",
    status: "Active",
  },
  {
    id: "a5b7b936",
    name: "Matthew Johnson",
    email: "matthew@alignui.com",
    initials: "MJ",
    title: "Data Software Engineer",
    since: "Since Feb, 2022",
    project: "Loom",
    task: "Data Analysis Methodology",
    brand: "L",
    brandTone: "bg-(--dash-purple-500)",
    doc: "johnson-matthew.pdf",
    docSize: "2.9 MB",
    status: "Active",
  },
  {
    id: "0153ab9a",
    name: "Laura Perez",
    email: "laura@alignui.com",
    initials: "LP",
    title: "Fashion Designer",
    since: "Since Mar, 2022",
    project: "Tidal",
    task: "Design Trends and Inspirations",
    brand: "T",
    brandTone: "bg-bg-strong-950",
    doc: "perez-laura.pdf",
    docSize: "2.5 MB",
    status: "Absent",
  },
  {
    id: "e18b8b38",
    name: "Wei Chen",
    email: "wei@alignui.com",
    initials: "WC",
    title: "Operations Manager",
    since: "Since July, 2021",
    project: "Dropbox",
    task: "Process Optimization Brainstorming",
    brand: "D",
    brandTone: "bg-(--state-information-base)",
    doc: "chen-wei.pdf",
    docSize: "2.6 MB",
    status: "Active",
  },
]

function TeamsFilters() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <SegmentedControl defaultValue="all" className="lg:w-80">

        <SegmentedItem value="all">All</SegmentedItem>
        <SegmentedItem value="active">Active</SegmentedItem>
        <SegmentedItem value="absent">Absent</SegmentedItem>
      </SegmentedControl>
      <div className="flex flex-wrap items-center gap-3">
        <InputRoot size="sm" className="w-[300px]">
          <InputIcon>
            <RiSearch2Line className="size-4" />
          </InputIcon>
          <Input placeholder="Search…" />
          <Kbd size="sm">⌘1</Kbd>
        </InputRoot>
        <Button size="sm" style="stroke" tone="neutral">
          <RiFilter3Fill className="size-4" />
          Filter
        </Button>
        <Select>
          <SelectTrigger size="sm" className="w-auto gap-2">
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

function SortLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span>{label}</span>
      <RiExpandUpDownFill className="size-4 text-text-soft-400" />
    </div>
  )
}

function MembersTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-stroke-soft-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead>
              <SortLabel label="Member Name" />
            </TableHead>
            <TableHead>
              <SortLabel label="Title" />
            </TableHead>
            <TableHead>
              <SortLabel label="Projects" />
            </TableHead>
            <TableHead>
              <SortLabel label="Member Documents" />
            </TableHead>
            <TableHead>
              <SortLabel label="Status" />
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar size="md">
                    <AvatarFallback>{row.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-text-strong-950">
                      {row.name}
                    </div>
                    <div className="text-xs text-text-sub-600">
                      {row.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="text-sm text-text-strong-950">
                    {row.title}
                  </div>
                  <div className="text-xs text-text-sub-600">{row.since}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full text-static-white text-xs font-semibold ring-1 ring-stroke-soft-200",
                      row.brandTone,
                    )}
                  >
                    {row.brand}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-text-strong-950">
                      {row.project}
                    </div>
                    <div className="truncate text-xs text-text-sub-600">
                      {row.task}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-(--state-error-lighter) text-[10px] font-semibold text-(--state-error-dark)">
                    PDF
                  </div>
                  <div>
                    <div className="text-sm text-text-strong-950">
                      {row.doc}
                    </div>
                    <div className="text-xs text-text-sub-600">
                      {row.docSize}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={row.status === "Active" ? "success" : "faded"}
                  variant="icon-light"
                  icon={<RiCheckboxCircleFill />}
                >
                  {row.status}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <Button size="sm" style="ghost" tone="neutral">
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

function TablePagination() {
  return (
    <div className="flex items-center gap-3 pt-6">
      <span className="flex-1 text-sm text-text-sub-600">Page 2 of 16</span>
      <div className="flex items-center gap-1">
        {[
          { Icon: RiArrowLeftDoubleLine, label: "First" },
          { Icon: RiArrowLeftSLine, label: "Previous" },
        ].map(({ Icon, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className="grid size-8 place-items-center rounded-md border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50"
          >
            <Icon className="size-4" />
          </button>
        ))}
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={cn(
              "grid size-8 place-items-center rounded-md text-sm",
              n === 4
                ? "bg-bg-strong-950 text-static-white"
                : "border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50",
            )}
          >
            {n}
          </button>
        ))}
        <span className="px-1 text-sm text-text-soft-400">…</span>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-md border border-stroke-soft-200 bg-bg-white-0 text-sm text-text-sub-600 hover:bg-bg-weak-50"
        >
          16
        </button>
        {[
          { Icon: RiArrowRightSLine, label: "Next" },
          { Icon: RiArrowRightDoubleLine, label: "Last" },
        ].map(({ Icon, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className="grid size-8 place-items-center rounded-md border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50"
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
      <div className="flex flex-1 justify-end">
        <Select defaultValue="7">
          <SelectTrigger size="sm" className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 / page</SelectItem>
            <SelectItem value="15">15 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
            <SelectItem value="100">100 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function HrTeamsPreview() {
  return (
    <HrAppShell active="teams">
      <HrHeader
        icon={
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
            <RiGroupLine className="size-6 text-text-sub-600" />
          </div>
        }
        title="Teams"
        description="Manage and collaborate within your organization's teams."
        actions={null}
      />
      <div className="px-8">
        <Divider />
      </div>
      <div className="flex flex-col gap-4 px-8 pb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <div className="text-base font-medium text-text-strong-950">
              Members
            </div>
            <div className="text-sm text-text-sub-600">
              Display all the team members and essential details.
            </div>
          </div>
          <Button size="sm" style="stroke" tone="neutral">
            <RiShareForwardBoxLine className="size-4" />
            Export
          </Button>
          <Button size="sm">
            <RiAddLine className="size-4" />
            Invite Member
          </Button>
        </div>
        <Divider />
        <TeamsFilters />
        <MembersTable />
        <TablePagination />
      </div>
    </HrAppShell>
  )
}

export default function HrTeamsDeepDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR"
        title="HR Teams (Deep)"
        description="Synergy HR Teams page — header + Members section header (Invite Member + Export) + SegmentedControl filter (All / Active / Absent) + search/filter/sort row + 7-row member table (James, Sophia, Arthur, Emma, Matthew, Laura, Wei — all ported verbatim) + paginated footer (Page 2 of 16)."
      />

      <DocsSection title="Full preview">
        <DocsTemplatePreview>
          <HrTeamsPreview />
        </DocsTemplatePreview>
      </DocsSection>

      <DocsSection
        title="Anatomy"
        description="Page-level header is mirrored by an in-body section header so the table has its own h2 once you scroll past the page top."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            <strong>Header</strong> — circular Group icon avatar + "Teams" +
            "Manage and collaborate within your organization's teams." +
            Search · Bell on the right (no page-level CTAs).
          </li>
          <li>
            <strong>Section header</strong> — "Members" h2 + description +
            <code>Export</code> (stroke / neutral) +
            <code>Invite Member</code> (primary) buttons.
          </li>
          <li>
            <strong>Filter row</strong> — SegmentedControl (All / Active /
            Absent) on left, 300px search + Filter button + Sort by select on right.
          </li>
          <li>
            <strong>Members table</strong> — 7 columns: select checkbox, Member Name
            (avatar + name + email), Title (role + since), Projects (brand mark +
            name + task), Member Documents (PDF tile + filename + size), Status
            (StatusBadge), row-action ellipsis.
          </li>
          <li>
            <strong>Pagination</strong> — "Page 2 of 16" label, first/prev page
            nav, numeric items 1-5 (current = 4) … 16, next/last nav, and a
            "7 / page" page-size select on the right.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Avatar / AvatarFallback</strong> — Member rows (each unique initials), brand marks.</li>
          <li><strong>StatusBadge</strong> — Active (success / icon-light) and Absent (faded / icon-light).</li>
          <li><strong>Button</strong> — Export, Invite Member, Filter, row ellipsis.</li>
          <li><strong>Checkbox</strong> — Per-row select + header select-all.</li>
          <li><strong>InputRoot / Input / InputIcon</strong> — 300px search w/ kbd.</li>
          <li><strong>SegmentedControl / SegmentedItem</strong> — All / Active / Absent.</li>
          <li><strong>Select / SelectTrigger / SelectValue / SelectContent / SelectItem</strong> — Sort by, page-size.</li>
          <li><strong>Table / TableHeader / TableBody / TableRow / TableHead / TableCell</strong> — Members table.</li>
          <li><strong>Divider</strong> — Above and below the section header.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
