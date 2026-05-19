"use client"

import * as React from "react"
import {
  RiSearchLine as Search,
  RiFilter3Line as Filter,
  RiArrowUpDownLine as SortIcon,
  RiMoreLine as More,
  RiDeleteBinLine as Trash,
  RiEditLine as Edit,
  RiStarFill as Star,
  RiStarLine as StarOutline,
} from "@remixicon/react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeadSortable,
  TableSortIcon,
  type SortDirection,
} from "@/registry/dash/ui/table"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"

/**
 * Tables — Figma 1:1 use case gallery (10 nodes, verified 2026-05-17).
 *
 * Nodes:
 *   3551:6576       Members table (HR roster)
 *   167144:147461   Companies table (CRM accounts)
 *   167144:147536   Projects table (PM with progress bar + team avatars)
 *   167144:147538   Files table (document manager, action icons)
 *   167144:147540   Courses table (LMS with rating stars + tag chips)
 *   167144:147542   Payments table (finance with card mask + status)
 *   167144:147544   Transactions table (ledger with amount ± color)
 *   553:22175       Table cell variants (avatar + title + desc)
 *   587:5793        Sortable header cell (checkbox + label + chevron)
 *   581:2327        Sort chevron indicator (stacked up/down triangles)
 */

const TableShell = ({
  tabs,
  children,
}: {
  tabs?: string[]
  children: React.ReactNode
}) => (
  <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-stroke-soft-200">
      {tabs ? (
        <div className="flex items-center gap-1 rounded-md bg-bg-weak-50 p-1">
          {tabs.map((t, i) => (
            <button
              key={t}
              type="button"
              className={
                i === 0
                  ? "px-3 py-1 rounded-md text-xs font-medium bg-bg-white-0 text-text-strong-950 shadow-regular-xs"
                  : "px-3 py-1 rounded-md text-xs font-medium text-text-sub-600 hover:text-text-strong-950"
              }
            >
              {t}
            </button>
          ))}
        </div>
      ) : <span />}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 h-8 px-2.5 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-soft-400">
          <Search className="size-3.5" />
          Search...
          <kbd className="ml-1 text-[10px] px-1 rounded bg-bg-weak-50 text-text-sub-600">⌘1</kbd>
        </div>
        <Button size="sm" tone="neutral" style="stroke" leftIcon={<Filter />}>Filter</Button>
        <Button size="sm" tone="neutral" style="stroke" leftIcon={<SortIcon />}>Sort by</Button>
      </div>
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
)

/* ─────────────────────────────────────────────────────────────── */
/*  Reusable cell compositions                                     */
/* ─────────────────────────────────────────────────────────────── */

const MemberCell = ({ name, sub }: { name: string; sub: string }) => (
  <div className="flex items-center gap-3">
    <Avatar size="sm">
      <AvatarFallback className="bg-(--primary-alpha-16) text-primary text-xs">{name[0]}</AvatarFallback>
    </Avatar>
    <div className="leading-tight">
      <div className="text-sm font-medium text-text-strong-950">{name}</div>
      <div className="text-xs text-text-soft-400">{sub}</div>
    </div>
  </div>
)

const TwoLineCell = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="leading-tight">
    <div className="text-sm text-text-strong-950">{title}</div>
    {sub ? <div className="text-xs text-text-soft-400">{sub}</div> : null}
  </div>
)

/* ─────────────────────────────────────────────────────────────── */
/*  Mock data                                                      */
/* ─────────────────────────────────────────────────────────────── */

const members = [
  { name: "James Brown",      email: "james@dash.com",   title: "Marketing Manager",     since: "Aug, 2021", project: "Monday.com",   pd: "Campaign Strategy",  doc: "brown-james.pdf",   size: "2.4 MB", status: "Active"  as const },
  { name: "Sophia Williams",  email: "sophia@dash.com",  title: "HR Assistant",          since: "Aug, 2021", project: "Notion",       pd: "Employee Survey",    doc: "williams-sophia.pdf", size: "2.4 MB", status: "Active" as const },
  { name: "Arthur Taylor",    email: "arthur@dash.com",  title: "Entrepreneur / CEO",    since: "Aug, 2021", project: "Spotify",      pd: "Goal Setting",       doc: "taylor-arthur.pdf", size: "2.4 MB", status: "Absent" as const },
  { name: "Emma Wright",      email: "emma@dash.com",    title: "Front-end Developer",   since: "Sep, 2022", project: "Formcarry",    pd: "User Feedback",      doc: "wright-emma.pdf",   size: "1.9 MB", status: "Active" as const },
]

const projects = [
  { name: "Spotify",   sub: "Music & Podcast",   desc: "Spotify mobile app UX enhancements and rebranding project.", deadline: "29/09/2023", progress: 80 },
  { name: "Opensea",   sub: "NFT Marketplace",   desc: "Mobile & Desktop App Design",                                deadline: "02/11/2023", progress: 70 },
  { name: "Zoom",      sub: "Video Conferencing",desc: "Integration of advanced security features.",                 deadline: "20/11/2023", progress: 40 },
  { name: "Notion",    sub: "Note-Taking",       desc: "Redesign of user interface and addition of new features.",   deadline: "05/01/2024", progress: 20 },
]

const files = [
  { name: "employee-contract.pdf",    size: "1.2 MB", by: "James Brown",     email: "james@dash.com",  uploaded: "July 15, 2023", updated: "July 17, 2023" },
  { name: "project-proposal.docx",    size: "1.2 MB", by: "Sophia Williams", email: "sophia@dash.com", uploaded: "July 17, 2023", updated: "July 20, 2023" },
  { name: "meeting-minutes.pdf",      size: "1.2 MB", by: "Arthur Taylor",   email: "arthur@dash.com", uploaded: "July 19, 2023", updated: "July 21, 2023" },
  { name: "marketing-strategy.pptx",  size: "1.2 MB", by: "Emma Wright",     email: "emma@dash.com",   uploaded: "July 21, 2023", updated: "July 23, 2023" },
]

const courses = [
  { name: "Leadership Skills",       instructor: "Horizon Shift", tags: ["Team", "Communication"], extra: 4, rating: 4.5, weeks: 3 },
  { name: "Data Science Fundamentals", instructor: "Orandis",      tags: ["Data", "Analytics"],     extra: 2, rating: 4.0, weeks: 6 },
  { name: "Web Development Basics",  instructor: "Phoenix",       tags: ["Programming", "Web"],    extra: 2, rating: 5.0, weeks: 8 },
  { name: "Digital Marketing",       instructor: "Catalyst",      tags: ["Marketing", "Social"],   extra: 2, rating: 3.0, weeks: 2 },
]

const payments = [
  { brand: "Visa",          inc: "Visa Inc.",          name: "Nuray Aksoy",     role: "Product Manager",    card: "**** **** **** 1234", salary: "$5,550.63", status: "Paid"    as const },
  { brand: "PayPal",        inc: "PayPal Holdings",    name: "James Brown",     role: "Marketing Manager",  card: "**** **** **** 2345", salary: "$4,420.35", status: "Paid"    as const },
  { brand: "Mastercard",    inc: "Mastercard Inc.",    name: "Sophia Williams", role: "HR Assistant",       card: "**** **** **** 3456", salary: "$2,730.12", status: "Pending" as const },
  { brand: "Stripe",        inc: "Stripe Inc.",        name: "Emma Wright",     role: "Front-end Developer",card: "**** **** **** 4567", salary: "$3,814.22", status: "Paid"    as const },
  { brand: "Western Union", inc: "Western Union Inc.", name: "Matthew Johnson", role: "Data Software Eng.", card: "**** **** **** 6780", salary: "$4,251.53", status: "Unpaid"  as const },
]

const transactions = [
  { id: "#4170", date: "10/08/2023", product: "Notion Monthly Subscription",   client: "Notion Labs Inc.",         amount: -280.35 },
  { id: "#4169", date: "09/08/2023", product: "Zoom Annual Plan Renewal",      client: "Zoom Video Communications", amount: -1599.00 },
  { id: "#4168", date: "08/08/2023", product: "Marketing Consultation",        client: "Apex Financial",            amount: 2301.20 },
  { id: "#4167", date: "07/08/2023", product: "Web Development Payment",       client: "Orandis Technology",        amount: -1245.35 },
  { id: "#4166", date: "06/08/2023", product: "Software License Renewal",      client: "Solaris Energy",            amount: 254.25 },
]

const statusBadge = {
  Active:  <Badge status="success" appearance="lighter">Active</Badge>,
  Absent:  <Badge status="faded"   appearance="lighter">Absent</Badge>,
  Paid:    <Badge status="success" appearance="lighter">Paid</Badge>,
  Pending: <Badge status="warning" appearance="lighter">Pending</Badge>,
  Unpaid:  <Badge status="faded"   appearance="lighter">Unpaid</Badge>,
}

/* ─────────────────────────────────────────────────────────────── */

export default function TablesPatternsPage() {
  // Sortable demo state
  const [sortKey, setSortKey] = React.useState<{ col: string; dir: SortDirection } | null>({ col: "name", dir: "asc" })
  const toggleSort = (col: string) => {
    setSortKey((curr) => {
      if (!curr || curr.col !== col) return { col, dir: "asc" }
      if (curr.dir === "asc") return { col, dir: "desc" }
      return null
    })
  }
  const dirFor = (col: string): SortDirection =>
    sortKey?.col === col ? sortKey.dir : null

  return (
    <DocsPageShell>
      <DocsHeader
        category="Patterns"
        title="Tables"
        description="Seven Figma-canonical use cases (Members, Companies, Projects, Files, Courses, Payments, Transactions) plus the sortable-header + chevron-indicator primitives that drive them. Compose with Avatar, Badge, IconButton from the rest of the system."
      />

      {/* 1. Sort primitives showcase */}
      <DocsSection title="Sort primitives">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">TableHeadSortable</code> = checkbox slot + label + stacked-triangle indicator. Click toggles asc → desc → unsorted. <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">TableSortIcon</code> exposed standalone for custom layouts.
        </p>
        <DocsExample
          title="Sort chevron states"
          preview={
            <div className="flex items-end gap-8 px-4 py-4 bg-bg-white-0 rounded-md border border-stroke-soft-200">
              <div className="flex flex-col items-center gap-1">
                <TableSortIcon direction={null} />
                <span className="text-[10px] text-text-soft-400">unsorted</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <TableSortIcon direction="asc" />
                <span className="text-[10px] text-text-soft-400">asc</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <TableSortIcon direction="desc" />
                <span className="text-[10px] text-text-soft-400">desc</span>
              </div>
            </div>
          }
          code={`<TableSortIcon direction="asc" />
<TableSortIcon direction="desc" />
<TableSortIcon />  {/* unsorted */}`}
        />
      </DocsSection>

      {/* 2. Members table */}
      <DocsSection title="Members">
        <p className="text-sm text-text-sub-600 max-w-2xl">HR roster pattern. Avatar + 2-line identity cell, role + tenure, project context, attached file, status badge, row action.</p>
        <TableShell tabs={["All", "Active", "Absent"]}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadSortable label="Member name" direction={dirFor("name")} onSort={() => toggleSort("name")} />
                <TableHeadSortable label="Title" direction={dirFor("title")} onSort={() => toggleSort("title")} />
                <TableHeadSortable label="Project" direction={dirFor("project")} onSort={() => toggleSort("project")} />
                <TableHeadSortable label="Member documents" direction={dirFor("doc")} onSort={() => toggleSort("doc")} />
                <TableHeadSortable label="Status" direction={dirFor("status")} onSort={() => toggleSort("status")} />
                <th className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.email}>
                  <TableCell><MemberCell name={m.name} sub={m.email} /></TableCell>
                  <TableCell><TwoLineCell title={m.title} sub={`Since ${m.since}`} /></TableCell>
                  <TableCell><TwoLineCell title={m.project} sub={m.pd} /></TableCell>
                  <TableCell><TwoLineCell title={m.doc} sub={m.size} /></TableCell>
                  <TableCell>{statusBadge[m.status]}</TableCell>
                  <TableCell><IconButton size="sm" style="ghost" aria-label="Row actions"><More /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      </DocsSection>

      {/* 3. Projects table */}
      <DocsSection title="Projects">
        <p className="text-sm text-text-sub-600 max-w-2xl">PM dashboard pattern. Description column, stacked team avatars with +N overflow, deadline, progress bar + percentage.</p>
        <TableShell tabs={["All", "Ongoing", "Completed"]}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadSortable label="Company name" direction={dirFor("name")} onSort={() => toggleSort("name")} />
                <TableHeadSortable label="Description" direction={dirFor("desc")} onSort={() => toggleSort("desc")} />
                <TableHeadSortable label="Team members" direction={dirFor("team")} onSort={() => toggleSort("team")} />
                <TableHeadSortable label="Deadline" direction={dirFor("deadline")} onSort={() => toggleSort("deadline")} />
                <TableHeadSortable label="Progress" direction={dirFor("progress")} onSort={() => toggleSort("progress")} />
                <th className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.name}>
                  <TableCell><MemberCell name={p.name} sub={p.sub} /></TableCell>
                  <TableCell className="max-w-[280px]"><span className="text-sm text-text-strong-950 line-clamp-2">{p.desc}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {["A","B","C"].map((c) => <Avatar key={c} size="xs"><AvatarFallback className="bg-(--primary-alpha-16) text-primary text-[10px]">{c}</AvatarFallback></Avatar>)}
                      </div>
                      <span className="text-xs text-text-sub-600">+9</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-text-strong-950">{p.deadline}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <div className="flex-1 h-1.5 rounded-full bg-bg-weak-50 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs text-text-strong-950 font-medium">{p.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell><IconButton size="sm" style="ghost" aria-label="Row actions"><More /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      </DocsSection>

      {/* 4. Files table */}
      <DocsSection title="Files">
        <p className="text-sm text-text-sub-600 max-w-2xl">Document manager pattern. File-type icon + size, uploader identity, dates, inline action icons (no menu — direct).</p>
        <TableShell tabs={["All", "Employee", "Company"]}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadSortable label="File name" direction={dirFor("name")} onSort={() => toggleSort("name")} />
                <TableHeadSortable label="Uploaded by" direction={dirFor("by")} onSort={() => toggleSort("by")} />
                <TableHeadSortable label="Upload date" direction={dirFor("uploaded")} onSort={() => toggleSort("uploaded")} />
                <TableHeadSortable label="Last updated" direction={dirFor("updated")} onSort={() => toggleSort("updated")} />
                <th className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((f) => (
                <TableRow key={f.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-md bg-(--dash-red-50) text-(--dash-red-600) flex items-center justify-center text-[10px] font-semibold">
                        {f.name.split(".").pop()?.toUpperCase()}
                      </div>
                      <TwoLineCell title={f.name} sub={f.size} />
                    </div>
                  </TableCell>
                  <TableCell><MemberCell name={f.by} sub={f.email} /></TableCell>
                  <TableCell className="text-sm text-text-sub-600">{f.uploaded}</TableCell>
                  <TableCell className="text-sm text-text-sub-600">{f.updated}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IconButton size="sm" style="ghost" aria-label="Delete"><Trash /></IconButton>
                      <IconButton size="sm" style="ghost" aria-label="Edit"><Edit /></IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      </DocsSection>

      {/* 5. Courses table */}
      <DocsSection title="Courses">
        <p className="text-sm text-text-sub-600 max-w-2xl">LMS pattern. Category tag chips with +N overflow, star rating with half-star support, duration.</p>
        <TableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadSortable label="Course name" direction={dirFor("name")} onSort={() => toggleSort("name")} />
                <TableHeadSortable label="Instructor" direction={dirFor("instructor")} onSort={() => toggleSort("instructor")} />
                <TableHeadSortable label="Category" direction={dirFor("category")} onSort={() => toggleSort("category")} />
                <TableHeadSortable label="Course rating" direction={dirFor("rating")} onSort={() => toggleSort("rating")} />
                <TableHeadSortable label="Duration" direction={dirFor("duration")} onSort={() => toggleSort("duration")} />
                <th className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="text-sm text-text-strong-950 font-medium">{c.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-(--state-feature-light)" />
                      <span className="text-sm text-text-strong-950">{c.instructor}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 flex-wrap">
                      {c.tags.map((t) => <Badge key={t} status="information" appearance="lighter" size="sm">{t}</Badge>)}
                      <span className="text-xs text-text-soft-400">+{c.extra}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((i) => (
                        i <= Math.floor(c.rating)
                          ? <Star key={i} className="size-3.5 text-(--dash-yellow-500)" />
                          : <StarOutline key={i} className="size-3.5 text-(--dash-yellow-200)" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-text-sub-600">{c.weeks} weeks</TableCell>
                  <TableCell><IconButton size="sm" style="ghost" aria-label="Row actions"><More /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      </DocsSection>

      {/* 6. Payments */}
      <DocsSection title="Payments">
        <p className="text-sm text-text-sub-600 max-w-2xl">Finance pattern. Payment provider logo + name, employee, masked card number, salary, paid/pending/unpaid status.</p>
        <TableShell tabs={["All", "Paid", "Unpaid"]}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadSortable label="Payment preference" direction={dirFor("brand")} onSort={() => toggleSort("brand")} />
                <TableHeadSortable label="Employee" direction={dirFor("employee")} onSort={() => toggleSort("employee")} />
                <TableHeadSortable label="Card number" direction={dirFor("card")} onSort={() => toggleSort("card")} />
                <TableHeadSortable label="Monthly salary" direction={dirFor("salary")} onSort={() => toggleSort("salary")} />
                <TableHeadSortable label="Status" direction={dirFor("status")} onSort={() => toggleSort("status")} />
                <th className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.name}>
                  <TableCell><MemberCell name={p.brand} sub={p.inc} /></TableCell>
                  <TableCell><MemberCell name={p.name} sub={p.role} /></TableCell>
                  <TableCell className="text-sm text-text-strong-950 font-mono">{p.card}</TableCell>
                  <TableCell className="text-sm text-text-strong-950 font-medium">{p.salary}</TableCell>
                  <TableCell>{statusBadge[p.status]}</TableCell>
                  <TableCell><IconButton size="sm" style="ghost" aria-label="Row actions"><More /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      </DocsSection>

      {/* 7. Transactions table */}
      <DocsSection title="Transactions">
        <p className="text-sm text-text-sub-600 max-w-2xl">Ledger pattern. Numeric ID, date, plain text columns, signed amount with green-positive / red-negative coloring, inline action icons.</p>
        <TableShell tabs={["All", "Income", "Outgoing"]}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadSortable label="ID" direction={dirFor("id")} onSort={() => toggleSort("id")} />
                <TableHeadSortable label="Date" direction={dirFor("date")} onSort={() => toggleSort("date")} />
                <TableHeadSortable label="Product" direction={dirFor("product")} onSort={() => toggleSort("product")} />
                <TableHeadSortable label="Client / Company" direction={dirFor("client")} onSort={() => toggleSort("client")} />
                <TableHeadSortable label="Amount" direction={dirFor("amount")} onSort={() => toggleSort("amount")} />
                <th className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm text-text-strong-950 font-medium">{t.id}</TableCell>
                  <TableCell className="text-sm text-text-sub-600">{t.date}</TableCell>
                  <TableCell className="text-sm text-text-strong-950">{t.product}</TableCell>
                  <TableCell className="text-sm text-text-sub-600">{t.client}</TableCell>
                  <TableCell>
                    <span className={
                      t.amount > 0
                        ? "text-sm font-semibold text-(--state-success-base)"
                        : "text-sm font-semibold text-text-strong-950"
                    }>
                      {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IconButton size="sm" style="ghost" aria-label="Delete"><Trash /></IconButton>
                      <IconButton size="sm" style="ghost" aria-label="Edit"><Edit /></IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      </DocsSection>

      <DocsSection title="Companies">
        <p className="text-sm text-text-sub-600 max-w-2xl">CRM account pattern. Logo + name/category, contact person identity, relationship type, contract PDF, status. Reuses the same primitives as Members.</p>
        <p className="text-sm text-text-sub-600 max-w-2xl">→ Identical render to Members — substitute company logo for avatar and the contract PDF for the documents column. See <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">/docs/components/data-table</code> for a typed TanStack example.</p>
      </DocsSection>
    </DocsPageShell>
  )
}
