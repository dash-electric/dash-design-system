"use client"

/**
 * Avatar Examples — Recipient Selection.
 *
 * Figma parity: Avatar :: Examples id 2937:14646.
 * Demonstrates Avatar with text fallback in a transfer-recipient list,
 * keyboard-shortcut affordances, and a primary "New Recipient" CTA.
 */

import * as React from "react"
import { RiAddLine as Plus, RiSearchLine as Search } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { Kbd } from "@/registry/dash/ui/kbd"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

export type Recipient = {
  id: string
  name: string
  subtitle: string
  account: string
  avatarSrc?: string
  initials?: string
  shortcut?: string
}

const defaults: Recipient[] = [
  { id: "r1", name: "James Brown",     subtitle: "james@alignui.com",  account: "A-52112", initials: "JB", shortcut: "⌘1" },
  { id: "r2", name: "Sophia Williams", subtitle: "+44 01 2345 6789",   account: "A-52132", initials: "SW", shortcut: "⌘2" },
  { id: "r3", name: "Emma Wright",     subtitle: "emma@alignui.com",   account: "A-52184", initials: "EW", shortcut: "⌘3" },
  { id: "r4", name: "Matthew Johnson", subtitle: "+1 (456) 789-0123",  account: "A-52114", initials: "MJ", shortcut: "⌘4" },
]

export function AvatarRecipientSelection({
  recipients = defaults,
  title = "Saved Recipients",
  onSelect,
  onNewRecipient,
  className,
}: {
  recipients?: Recipient[]
  title?: string
  onSelect?: (id: string) => void
  onNewRecipient?: () => void
  className?: string
}) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label-medium text-text-strong-950">{title}</h3>
          <Search className="size-4 text-text-soft-400" />
        </div>
        <ul className="-mx-1">
          {recipients.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelect?.(r.id)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-bg-weak-50"
              >
                <Avatar size="md">
                  {r.avatarSrc ? <AvatarImage src={r.avatarSrc} alt={r.name} /> : null}
                  <AvatarFallback>{r.initials ?? r.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-label-small text-text-strong-950 truncate">{r.name}</div>
                  <div className="text-paragraph-x-small text-text-sub-600 truncate">{r.subtitle}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-paragraph-x-small text-text-soft-400 tabular-nums">{r.account}</span>
                  {r.shortcut ? <Kbd>{r.shortcut}</Kbd> : null}
                </div>
              </button>
            </li>
          ))}
        </ul>
        <Divider />
        <Button tone="primary" style="filled" size="md" className="w-full" onClick={onNewRecipient}>
          <Plus />
          New Recipient
        </Button>
      </CardContent>
    </Card>
  )
}
