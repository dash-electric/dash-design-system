"use client"

import * as React from "react"
import { RiAddLine as Plus, RiBankCardLine as CreditCard, RiBuilding2Line as Building2, RiWalletLine as Wallet } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Switch } from "@/registry/dash/ui/switch"
import {
  MarketingSettingsShell,
  SettingsRow,
  SettingsRowDivider,
} from "@/registry/dash/templates/_internal/marketing-settings-shell"

export type MarketingPaymentBillingProps = {
  className?: string
}

type PaymentMethod = {
  id: string
  name: string
  description: string
  fee: string
  icon: React.ElementType
  enabled: boolean
}

const methods: PaymentMethod[] = [
  { id: "card",   name: "Credit Card",   description: "Accept Visa, Mastercard, American Express", fee: "2.9% + €0.30", icon: CreditCard, enabled: true },
  { id: "bank",   name: "Bank Transfer", description: "Manual bank transfer payments",             fee: "No fee",       icon: Building2,  enabled: true },
  { id: "wallet", name: "Digital Wallet",description: "Apple Pay, Google Pay, Samsung Pay",        fee: "1.9% + €0.20", icon: Wallet,     enabled: false },
]

/**
 * MarketingPaymentBilling — Payment & Billing settings panel.
 * Ported from AlignUI Pro Figma node `164843:41278`.
 */
export function MarketingPaymentBilling({ className }: MarketingPaymentBillingProps) {
  return (
    <MarketingSettingsShell
      activeId="billing"
      title="Payment & Billing"
      description="Configure your payment methods and billing preferences"
      tabs={["Payment Method", "Currency Settings", "Tax Settings"]}
      activeTabIndex={0}
      className={className}
    >
      <div className="space-y-1">
        <SettingsRow
          title="Payment Methods"
          description="Configure available payment options"
        >
          <Button tone="neutral" style="stroke" size="sm">
            <Plus className="size-3.5" /> Add Payment Method
          </Button>
        </SettingsRow>
        <SettingsRowDivider />

        {methods.map((m, i) => {
          const Icon = m.icon
          return (
            <React.Fragment key={m.id}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center py-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-bg-weak-50 flex items-center justify-center text-text-sub-600">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-strong-950">{m.name}</div>
                    <div className="text-xs text-text-sub-600 mt-0.5">{m.description}</div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge appearance="lighter" status="information">{m.fee}</Badge>
                      {m.enabled ? <Badge appearance="lighter" status="success">Active</Badge> : null}
                    </div>
                  </div>
                </div>
                <Switch defaultChecked={m.enabled} />
              </div>
              {i < methods.length - 1 ? <SettingsRowDivider /> : null}
            </React.Fragment>
          )
        })}
      </div>
    </MarketingSettingsShell>
  )
}
