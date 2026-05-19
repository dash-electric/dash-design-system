"use client"

import * as React from "react"
import { RiAddLine as Plus, RiFilter3Line as FilterIcon, RiSearchLine as Search, RiMoreLine as MoreHorizontal, RiFileTextLine as FileText, RiArrowLeftSLine as ChevronLeft, RiArrowRightSLine as ChevronRight } from "@remixicon/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrTeams — ported 1:1 (structural parity) from AlignUI Pro Figma node 3878:62221.
 * Synergy HR Teams page. Layout:
 *   - Header (page title + CTA)
 *   - Search/Filter row
 *   - Member table: avatar+name+email, title+since, project+task, document, status
 *   - Pagination footer
 */

export type TeamMember = {
  id: string
  name: string
  email: string
  initials?: string
  title: string
  since: string
  projectIcon?: string
  projectName: string
  task: string
  document: string
  documentSize: string
  status: "Active" | "Absent" | "Away"
}

export type HrTeamsProps = {
  members?: TeamMember[]
  className?: string
}

const defaultMembers: TeamMember[] = [
  {
    id: "m1",
    name: "James Brown",
    email: "james@alignui.com",
    initials: "JB",
    title: "Marketing Manager",
    since: "Since Aug, 2021",
    projectName: "Monday.com",
    task: "Campaign Strategy Brainstorming",
    document: "brown-james.pdf",
    documentSize: "2.4 MB",
    status: "Active",
  },
  {
    id: "m2",
    name: "Sophia Williams",
    email: "sophia@alignui.com",
    initials: "SW",
    title: "HR Assistant",
    since: "Since Jan, 2023",
    projectName: "Notion",
    task: "Employee Engagement Survey",
    document: "williams-sophia.pdf",
    documentSize: "1.2 MB",
    status: "Active",
  },
  {
    id: "m3",
    name: "Arthur Taylor",
    email: "arthur@alignui.com",
    initials: "AT",
    title: "Entrepreneur / CEO",
    since: "Since Jun, 2020",
    projectName: "Spotify",
    task: "Vision and Goal Setting Session",
    document: "taylor-arthur.pdf",
    documentSize: "3.1 MB",
    status: "Absent",
  },
  {
    id: "m4",
    name: "Emma Wright",
    email: "emma@alignui.com",
    initials: "EW",
    title: "Front-end Developer",
    since: "Since Sep, 2022",
    projectName: "Formcarry",
    task: "User Feedback Analysis",
    document: "wright-emma.pdf",
    documentSize: "1.9 MB",
    status: "Active",
  },
  {
    id: "m5",
    name: "Matthew Johnson",
    email: "matthew@alignui.com",
    initials: "MJ",
    title: "Data Software Engineer",
    since: "Since Feb, 2022",
    projectName: "Loom",
    task: "Data Analysis Methodology",
    document: "johnson-matthew.pdf",
    documentSize: "2.9 MB",
    status: "Active",
  },
  {
    id: "m6",
    name: "Laura Perez",
    email: "laura@alignui.com",
    initials: "LP",
    title: "Product Designer",
    since: "Since Mar, 2023",
    projectName: "Figma",
    task: "Design System Audit",
    document: "perez-laura.pdf",
    documentSize: "1.7 MB",
    status: "Away",
  },
]

const statusBadge = {
  Active: <Badge appearance="lighter" status="success">Active</Badge>,
  Absent: <Badge appearance="lighter" status="error">Absent</Badge>,
  Away: <Badge appearance="lighter" status="warning">Away</Badge>,
} as const

export function HrTeams({ members = defaultMembers, className }: HrTeamsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Teams
          </h1>
          <p className="text-sm text-text-sub-600 mt-1">
            Manage and collaborate within your organization&apos;s teams.
          </p>
        </div>
        <div className="flex gap-2">
          <Button tone="neutral" style="stroke">
            <FilterIcon className="size-4" /> Filter
          </Button>
          <Button tone="primary" style="filled">
            <Plus className="size-4" /> Invite Member
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <CardTitle>Members ({members.length})</CardTitle>
            <CardDescription>Active staff across all teams</CardDescription>
          </div>
          <div className="w-full sm:w-80">
            <InputRoot size="sm">
              <InputIcon>
                <Search className="size-4" />
              </InputIcon>
              <Input placeholder="Search members..." />
            </InputRoot>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox />
                </TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Member Documents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar size="sm">
                        <AvatarFallback>
                          {m.initials ?? m.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-strong-950 truncate">
                          {m.name}
                        </div>
                        <div className="text-xs text-text-sub-600 truncate">{m.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-text-strong-950">{m.title}</div>
                    <div className="text-xs text-text-soft-400">{m.since}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-text-strong-950">{m.projectName}</div>
                    <div className="text-xs text-text-sub-600 line-clamp-1">{m.task}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-8 grid place-items-center rounded-md bg-(--dash-red-50) text-(--dash-red-600)">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-text-strong-950 truncate">
                          {m.document}
                        </div>
                        <div className="text-xs text-text-soft-400">
                          {m.documentSize}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge[m.status]}</TableCell>
                  <TableCell>
                    <Button tone="neutral" style="ghost" size="sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-3 border-t border-stroke-soft-200">
          <div className="text-xs text-text-sub-600">
            Showing 1-{members.length} of 24 members
          </div>
          <div className="flex items-center gap-1">
            <Button tone="neutral" style="ghost" size="sm">
              <ChevronLeft className="size-4" />
            </Button>
            {["1", "2", "3"].map((p) => (
              <Button
                key={p}
                tone="neutral"
                style={p === "1" ? "stroke" : "ghost"}
                size="sm"
              >
                {p}
              </Button>
            ))}
            <Button tone="neutral" style="ghost" size="sm">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
