"use client"

import * as React from "react"
import { RiSearchLine as Search, RiEqualizerLine as SlidersHorizontal, RiArrowUpDownLine as ArrowDownUp, RiUserAddLine as UserPlus, RiMoreLine as MoreHorizontal } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import { cn } from "@/registry/dash/lib/utils"
import { FinanceSettingsShell } from "@/registry/dash/templates/_finance-settings-shell"

/**
 * FinanceTeamSettings — port of AlignUI Pro Figma frame
 * "Team Settings [Finance & Banking]" (node 3966:59504).
 *
 * Composition:
 *  - FinanceSettingsShell with activeTab="team".
 *  - Filter row: SegmentedControl [All|Income|Expenses *legacy labels from source*] + Invite member + Search + Filter + Sort by.
 *  - Table: Member Full Name · Email · Last Activity · Role · row actions.
 *
 * Note: the figma frame reuses generic [All/Income/Expenses] segmented labels — adapted to
 * team-relevant [All / Active / Invited] for semantic clarity.
 */

export type FinanceTeamMember = {
  id: string
  name: string
  email: string
  lastActivity: string
  role: string
  status: "active" | "invited"
}

const defaultMembers: FinanceTeamMember[] = [
  { id: "m1", name: "Arthur Taylor", email: "arthur@alignui.com", lastActivity: "Today, 3:52 PM", role: "CEO", status: "active" },
  { id: "m2", name: "Sophia Williams", email: "sophia@alignui.com", lastActivity: "Yesterday, 8:21 AM", role: "HR Assistant", status: "active" },
  { id: "m3", name: "Matthew Johnson", email: "matthew@alignui.com", lastActivity: "Today, 3:24 PM", role: "Data Engineer", status: "active" },
  { id: "m4", name: "James Brown", email: "james@alignui.com", lastActivity: "Sep 24, 2023 at 2:10 PM", role: "Marketing Manager", status: "active" },
  { id: "m5", name: "Wei Chen", email: "wei@alignui.com", lastActivity: "Sep 23, 2023 at 1:30 PM", role: "Operations Manager", status: "invited" },
]

export type FinanceTeamSettingsProps = {
  members?: FinanceTeamMember[]
  className?: string
}

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase()
}

export function FinanceTeamSettings({
  members = defaultMembers,
  className,
}: FinanceTeamSettingsProps) {
  const [filter, setFilter] = React.useState<"all" | "active" | "invited">("all")
  const filtered = members.filter((m) =>
    filter === "all" ? true : m.status === filter,
  )

  return (
    <FinanceSettingsShell
      activeTab="team"
      title="Team"
      subtitle="Display team members and personalize preferences."
      className={className}
    >
      {/* Filter row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          value={filter}
          onValueChange={(v: string) => v && setFilter(v as typeof filter)}
        >
          <SegmentedItem value="all">All</SegmentedItem>
          <SegmentedItem value="active">Active</SegmentedItem>
          <SegmentedItem value="invited">Invited</SegmentedItem>
        </SegmentedControl>
        <div className="flex flex-wrap items-center gap-2">
          <InputRoot className="w-full sm:w-[260px]">
            <InputIcon>
              <Search className="size-4" />
            </InputIcon>
            <Input placeholder="Search..." />
          </InputRoot>
          <Button style="stroke" tone="neutral" size="md">
            <SlidersHorizontal className="size-4" /> Filter
          </Button>
          <Button style="stroke" tone="neutral" size="md">
            <ArrowDownUp className="size-4" /> Sort by
          </Button>
          <Button size="md">
            <UserPlus className="size-4" /> Invite
          </Button>
        </div>
      </div>

      {/* Members table */}
      <div className={cn("rounded-xl border border-stroke-soft-200 overflow-hidden")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member Full Name</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>{initialsOf(m.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-text-strong-950">{m.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-text-sub-600">{m.email}</TableCell>
                <TableCell className="text-text-sub-600">{m.lastActivity}</TableCell>
                <TableCell>
                  <Badge appearance="lighter" status={m.status === "invited" ? "warning" : "success"} size="sm">
                    {m.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button style="ghost" tone="neutral" size="icon-xs" aria-label="More">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </FinanceSettingsShell>
  )
}
