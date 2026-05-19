"use client"

import * as React from "react"
import { Switch } from "@/registry/dash/ui/switch"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import {
  MarketingSettingsShell,
  SettingsRow,
  SettingsRowDivider,
} from "@/registry/dash/templates/_internal/marketing-settings-shell"

export type MarketingShippingDeliveryProps = {
  className?: string
}

type ShippingMethod = {
  id: string
  name: string
  description: string
  price: string
  enabled: boolean
}

const methods: ShippingMethod[] = [
  { id: "standard", name: "Standard Shipping", description: "3-5 business days",          price: "$29.90", enabled: true },
  { id: "express",  name: "Express Shipping",  description: "1-2 business days",          price: "$29.90", enabled: true },
  { id: "free",     name: "Free Shipping",     description: "For orders above threshold", price: "$29.90", enabled: false },
]

/**
 * MarketingShippingDelivery — Shipping & Delivery settings panel.
 * Ported from AlignUI Pro Figma node `164843:41590`.
 */
export function MarketingShippingDelivery({ className }: MarketingShippingDeliveryProps) {
  return (
    <MarketingSettingsShell
      activeId="shipping"
      title="Shipping & Delivery"
      description="Configure your shipping and delivery settings"
      tabs={["Shipping Methods", "Delivery Options", "Shipping Zones"]}
      activeTabIndex={0}
      className={className}
    >
      <div className="space-y-1">
        {methods.map((m, i) => (
          <React.Fragment key={m.id}>
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_180px] gap-4 items-center py-3">
              <Switch defaultChecked={m.enabled} />
              <div>
                <div className="text-sm font-medium text-text-strong-950">{m.name}</div>
                <div className="text-xs text-text-sub-600 mt-0.5">{m.description}</div>
              </div>
              <InputRoot>
                <Input defaultValue={m.price} />
              </InputRoot>
            </div>
            {i < methods.length - 1 ? <SettingsRowDivider /> : null}
          </React.Fragment>
        ))}

        <SettingsRowDivider />

        <SettingsRow
          title="Free Shipping Threshold"
          description="Minimum order amount that qualifies for free shipping."
        >
          <InputRoot>
            <Input defaultValue="$100.00" />
          </InputRoot>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="International Shipping"
          description="Enable shipping outside primary region."
        >
          <Switch />
        </SettingsRow>
      </div>
    </MarketingSettingsShell>
  )
}
