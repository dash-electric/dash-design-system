"use client"

import * as React from "react"
import { RiCheckboxCircleLine as CheckCircle2, RiTruckLine as Truck, RiAlertLine as AlertTriangle, RiUserAddLine as UserPlus, RiBillLine as Receipt, RiMessage2Line as MessageSquare } from "@remixicon/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/registry/dash/ui/card"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"

export type TimelineEvent = {
  id: string
  actor: string
  initials?: string
  icon?: React.ReactNode
  iconTone?: "success" | "warning" | "error" | "info" | "neutral"
  action: React.ReactNode
  meta?: string
  time: string
}

const iconBg = {
  success: "bg-state-success-lighter text-state-success-base",
  warning: "bg-state-warning-lighter text-state-warning-base",
  error:   "bg-state-error-lighter text-state-error-base",
  info:    "bg-state-information-lighter text-state-information-base",
  neutral: "bg-bg-weak-50 text-text-sub-600",
}

const defaults: TimelineEvent[] = [
  { id: "e1", actor: "Sigit P.",   icon: <Truck className="size-4" />,         iconTone: "info",    action: <>menerima dispatch <strong>DSP-9412</strong> untuk Bulk Bekasi</>, meta: "Rp 1.24jt", time: "2m ago" },
  { id: "e2", actor: "Halo-dash",  icon: <CheckCircle2 className="size-4" />,  iconTone: "success", action: <>resolve <strong>TKT-8838</strong> · Payout BCA delay</>, meta: "Rina S.", time: "8m ago" },
  { id: "e3", actor: "System",     icon: <AlertTriangle className="size-4" />, iconTone: "warning", action: <>flag mitra <strong>mtr-4421</strong> · 3 dispatch miss hari ini</>, meta: "Auto-suspend pending", time: "15m ago" },
  { id: "e4", actor: "Wei Chen",   icon: <UserPlus className="size-4" />,      iconTone: "info",    action: <>approve KYC mitra <strong>mtr-9614</strong></>, meta: "Tribe-Express · Bandung", time: "32m ago" },
  { id: "e5", actor: "Maya D.",    icon: <Receipt className="size-4" />,       iconTone: "neutral", action: <>release payout batch <strong>PYO-2026-08</strong></>, meta: "84 mitra · Rp 142jt", time: "1h ago" },
  { id: "e6", actor: "Reza T.",    icon: <MessageSquare className="size-4" />, iconTone: "info",    action: <>balas tiket <strong>TKT-8835</strong> · App login error</>, time: "1h ago" },
]

export type ActivityTimelineProps = {
  events?: TimelineEvent[]
  className?: string
}

/** Activity timeline — wide variant of ActivityFeed, with grouped icon column + actor avatar. */
export function ActivityTimeline({ events = defaults, className }: ActivityTimelineProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Ops events realtime · last 1h</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ol className="relative px-6 pb-4">
          {events.map((e, i) => (
            <li key={e.id} className="flex gap-4 pb-4 relative">
              {/* connector line */}
              {i < events.length - 1 ? (
                <span aria-hidden className="absolute left-4 top-9 bottom-0 w-px bg-stroke-soft-200" />
              ) : null}

              <div className={cn(
                "shrink-0 size-8 rounded-full flex items-center justify-center relative z-10",
                iconBg[e.iconTone ?? "neutral"]
              )}>
                {e.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <Avatar size="xs"><AvatarFallback>{e.initials ?? e.actor.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <span className="text-sm font-medium text-text-strong-950">{e.actor}</span>
                  <span className="text-xs text-text-soft-400">·</span>
                  <span className="text-sm text-text-sub-600">{e.action}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-text-soft-400">
                  <span>{e.time}</span>
                  {e.meta ? <Badge appearance="lighter" status="feature">{e.meta}</Badge> : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
