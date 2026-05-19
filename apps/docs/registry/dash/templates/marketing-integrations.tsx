"use client"

import * as React from "react"
import { RiMessage3Line as MessageCircle, RiMusicLine as Music2, RiShareLine as Share2, RiHashtag as Hash, RiSendPlaneLine as Send } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import {
  MarketingSettingsShell,
  SettingsRowDivider,
} from "@/registry/dash/templates/_internal/marketing-settings-shell"

export type MarketingIntegrationsProps = {
  className?: string
}

type Integration = {
  id: string
  name: string
  description: string
  icon: React.ElementType
  iconColor: string
  connected: boolean
}

const integrations: Integration[] = [
  { id: "fb",  name: "Facebook",    description: "Connect your Facebook account to share products and manage ads", icon: Share2,        iconColor: "text-(--dash-blue-700)",  connected: true },
  { id: "ig",  name: "Instagram",   description: "Share your products and stories directly to Instagram Shopping",  icon: Hash,          iconColor: "text-(--dash-pink-700)",  connected: true },
  { id: "x",   name: "X (Twitter)", description: "Share updates and engage with customers on X (Twitter)",          icon: Send,          iconColor: "text-text-strong-950",    connected: false },
  { id: "tk",  name: "Tiktok",      description: "Create and manage TikTok shop listings and ad campaigns",         icon: Music2,        iconColor: "text-text-strong-950",    connected: false },
  { id: "wa",  name: "WhatsApp",    description: "Manage customer support conversations via WhatsApp Business",     icon: MessageCircle, iconColor: "text-(--dash-green-700)", connected: false },
]

/**
 * MarketingIntegrations — Integrations settings panel.
 * Ported from AlignUI Pro Figma node `164843:35642`.
 */
export function MarketingIntegrations({ className }: MarketingIntegrationsProps) {
  return (
    <MarketingSettingsShell
      activeId="integrations"
      title="Integrations"
      description="Connect and sync with essential tools and platforms"
      tabs={["Social Media", "API Settings", "Connections"]}
      activeTabIndex={0}
      className={className}
    >
      <div className="space-y-1">
        {integrations.map((it, i) => {
          const Icon = it.icon
          return (
            <React.Fragment key={it.id}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center py-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-bg-weak-50 flex items-center justify-center">
                    <Icon className={`size-5 ${it.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-strong-950">{it.name}</div>
                    <div className="text-xs text-text-sub-600 mt-0.5">{it.description}</div>
                  </div>
                </div>
                <Button
                  tone={it.connected ? "neutral" : "primary"}
                  style="stroke"
                  size="sm"
                >
                  {it.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
              {i < integrations.length - 1 ? <SettingsRowDivider /> : null}
            </React.Fragment>
          )
        })}
      </div>
    </MarketingSettingsShell>
  )
}
