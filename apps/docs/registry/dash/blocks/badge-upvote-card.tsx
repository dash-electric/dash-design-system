"use client"

/**
 * Badge Examples — Week's Top Contributor (Upvote Card).
 *
 * Figma parity: Badge [Examples] :: id 2939:19644.
 * Demonstrates NumberBadge / row-aligned ranked list with upvote action.
 */

import * as React from "react"
import { RiArrowUpSLine as ChevronUp } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { cn } from "@/registry/dash/lib/utils"

export type Contributor = {
  id: string
  name: string
  role: string
  upvotes: number
  avatarSrc?: string
  initials?: string
  upvoted?: boolean
}

const defaults: Contributor[] = [
  { id: "c1", name: "James Brown",     role: "Marketing Manager",   upvotes: 26, initials: "JB", upvoted: true },
  { id: "c2", name: "Sophia Williams", role: "HR Assistant",        upvotes: 17, initials: "SW" },
  { id: "c3", name: "Arthur Taylor",   role: "CEO of Apex",         upvotes: 11, initials: "AT" },
  { id: "c4", name: "Emma Wright",     role: "Front-end Developer", upvotes: 4,  initials: "EW" },
]

export function BadgeUpvoteCard({
  contributors = defaults,
  title = "Week's Top Contributor",
  className,
  onUpvote,
}: {
  contributors?: Contributor[]
  title?: string
  className?: string
  onUpvote?: (id: string) => void
}) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <h3 className="text-label-medium text-text-strong-950">{title}</h3>
        <ul className="space-y-2.5">
          {contributors.map((c) => (
            <li key={c.id} className="flex items-center gap-3">
              <Avatar size="md">
                {c.avatarSrc ? <AvatarImage src={c.avatarSrc} alt={c.name} /> : null}
                <AvatarFallback>{c.initials ?? c.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-label-small text-text-strong-950 truncate">{c.name}</div>
                <div className="text-paragraph-x-small text-text-sub-600 truncate">{c.role}</div>
              </div>
              <Button
                tone={c.upvoted ? "primary" : "neutral"}
                style={c.upvoted ? "filled" : "stroke"}
                size="xs"
                onClick={() => onUpvote?.(c.id)}
              >
                <ChevronUp />
                {c.upvotes}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
