"use client"

import * as React from "react"
import { RiMailLine as Mail, RiMessage2Line as MessageSquare, RiCloudLine as Cloud, RiWalletLine as Wallet } from "@remixicon/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"

const SlackIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
  </svg>
)

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.03c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.26 5.69.41.35.78 1.04.78 2.1v3.11c0 .31.2.67.8.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
  </svg>
)

type Integration = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected?: boolean
  connectedAs?: string
}

const items: Integration[] = [
  { id: "slack",      name: "Slack",       description: "Forward tiket Halo-dash ke channel #ops.",                 icon: <SlackIcon />,                        connected: true, connectedAs: "#ops-halo-dash" },
  { id: "whatsapp",   name: "WhatsApp Business", description: "Auto-reply mitra via WA. Template approval required.", icon: <MessageSquare className="size-5" />, connected: true, connectedAs: "+62 21 80042233" },
  { id: "email",      name: "Email SMTP",  description: "Custom SMTP untuk notif transaksional.",                   icon: <Mail className="size-5" />,          connected: false },
  { id: "bca",        name: "BCA API",     description: "Payout langsung ke rekening BCA mitra.",                   icon: <Wallet className="size-5" />,        connected: true, connectedAs: "BCA Bisnis · *0099" },
  { id: "gh",         name: "GitHub",      description: "Sync incident postmortem dengan repo eng.",                icon: <GitHubIcon />,                       connected: false },
  { id: "bmkg",       name: "BMKG Weather",description: "Real-time cuaca per area dispatch.",                       icon: <Cloud className="size-5" />,         connected: true, connectedAs: "Free tier · 100k req/mo" },
]

/** Settings — integrations cards with connect/disconnect button. */
export function SettingsIntegrations({ className }: { className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Integrasi</CardTitle>
        <CardDescription>Hubungkan Dash ke tools tribe Anda.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-stroke-soft-200 p-4 flex items-start gap-3">
            <div className="size-10 rounded-lg bg-bg-weak-50 text-text-strong-950 flex items-center justify-center shrink-0">
              {it.icon}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-sm font-semibold text-text-strong-950">{it.name}</div>
                {it.connected ? (
                  <Badge appearance="lighter" status="success">Connected</Badge>
                ) : (
                  <Badge appearance="lighter" status="feature">Not connected</Badge>
                )}
              </div>
              <p className="text-xs text-text-sub-600 leading-relaxed">{it.description}</p>
              {it.connectedAs ? (
                <div className="text-xs text-text-soft-400">{it.connectedAs}</div>
              ) : null}
              <div className="pt-1">
                {it.connected ? (
                  <Button tone="neutral" style="stroke" size="xs">Disconnect</Button>
                ) : (
                  <Button tone="primary" style="filled" size="xs">Connect</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
