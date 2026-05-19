"use client"

import * as React from "react"
import { RiUserAddLine as UserPlus, RiMoreLine as MoreHorizontal } from "@remixicon/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { IconButton } from "@/registry/dash/ui/icon-button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { cn } from "@/registry/dash/lib/utils"

type TeamMember = {
  id: string
  name: string
  email: string
  role: "Lead" | "L2" | "L1" | "Admin"
  status: "active" | "invited"
  initials?: string
}

const defaults: TeamMember[] = [
  { id: "u1", name: "Wei Chen",     email: "wei@dash.id",      role: "Lead",  status: "active" },
  { id: "u2", name: "Fayzul A.",    email: "fayzul@dash.id",   role: "L2",    status: "active" },
  { id: "u3", name: "Rina S.",      email: "rina@dash.id",     role: "L1",    status: "active" },
  { id: "u4", name: "Yoga P.",      email: "yoga@dash.id",     role: "L1",    status: "active" },
  { id: "u5", name: "Maya D.",      email: "maya@dash.id",     role: "Admin", status: "active" },
  { id: "u6", name: "Andre L.",     email: "andre@dash.id",    role: "L1",    status: "invited" },
]

/** Settings — team member list with role select + invite. */
export function SettingsTeam({ className }: { className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>Tim</CardTitle>
          <CardDescription>Kelola akses Halo-dash dan role per anggota.</CardDescription>
        </div>
        <Button tone="primary" style="filled" size="sm">
          <UserPlus className="size-4" /> Invite
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-stroke-soft-200">
          {defaults.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-6 py-3">
              <Avatar size="md">
                <AvatarFallback>{m.initials ?? m.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-strong-950 truncate">{m.name}</span>
                  {m.status === "invited" ? <Badge appearance="lighter" status="warning">Invited</Badge> : null}
                </div>
                <div className="text-xs text-text-sub-600 truncate">{m.email}</div>
              </div>
              <div className="w-32">
                <Select defaultValue={m.role}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="L2">L2 Agent</SelectItem>
                    <SelectItem value="L1">L1 Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <IconButton aria-label="More" size="sm"><MoreHorizontal /></IconButton>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
