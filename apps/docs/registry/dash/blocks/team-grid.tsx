"use client"

import * as React from "react"
import { RiMoreLine as MoreHorizontal, RiMessage2Line as MessageSquare } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { cn } from "@/registry/dash/lib/utils"

export type TeamMember = {
  id: string
  name: string
  initials?: string
  role: "L1" | "L2" | "Lead" | "Admin"
  tribe?: "Reservasi" | "Express" | "Bulk" | "Halo-dash"
  status: "online" | "busy" | "away"
  open?: number
}

const defaultMembers: TeamMember[] = [
  { id: "u1", name: "Wei Chen",   role: "Lead",  tribe: "Halo-dash", status: "online", open: 4 },
  { id: "u2", name: "Fayzul A.",  role: "L2",    tribe: "Halo-dash", status: "busy",   open: 7 },
  { id: "u3", name: "Sigit P.",   role: "L1",    tribe: "Reservasi", status: "online", open: 12 },
  { id: "u4", name: "Rina S.",    role: "L1",    tribe: "Halo-dash", status: "online", open: 5 },
  { id: "u5", name: "Yoga P.",    role: "L1",    tribe: "Express",   status: "away",   open: 2 },
  { id: "u6", name: "Maya D.",    role: "Admin", tribe: "Bulk",      status: "online", open: 6 },
  { id: "u7", name: "Reza T.",    role: "L1",    tribe: "Express",   status: "busy",   open: 9 },
  { id: "u8", name: "Eko W.",     role: "L1",    tribe: "Reservasi", status: "online", open: 3 },
]

const dot = {
  online: "bg-state-success-base",
  busy:   "bg-state-warning-base",
  away:   "bg-text-soft-400",
}

export type TeamGridProps = {
  members?: TeamMember[]
  className?: string
}

/** Team grid — avatar cards with role + tribe + status indicator. */
export function TeamGrid({ members = defaultMembers, className }: TeamGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3", className)}>
      {members.map((m) => (
        <Card key={m.id} className="overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar size="md">
                    <AvatarFallback>{m.initials ?? m.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className={cn("absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-bg-white-0", dot[m.status])} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text-strong-950 truncate">{m.name}</div>
                  <div className="text-xs text-text-sub-600">{m.role}</div>
                </div>
              </div>
              <IconButton aria-label="More" size="xs" tone="neutral" style="ghost">
                <MoreHorizontal />
              </IconButton>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {m.tribe ? <Badge appearance="lighter" status="information">{m.tribe}</Badge> : null}
              {typeof m.open === "number" ? (
                <Badge appearance="lighter" status="feature">{m.open} open</Badge>
              ) : null}
            </div>

            <Button tone="neutral" style="stroke" size="sm" className="w-full">
              <MessageSquare className="size-3.5" /> Message
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
