"use client"

import * as React from "react"
import { Button } from "@/registry/dash/ui/button"
import { Switch } from "@/registry/dash/ui/switch"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import {
  MarketingSettingsShell,
  SettingsRow,
  SettingsRowDivider,
} from "@/registry/dash/templates/_internal/marketing-settings-shell"

export type MarketingProductsSettingsProps = {
  className?: string
}

/**
 * MarketingProductsSettings — Products Settings panel (Inventory / display).
 * Ported from AlignUI Pro Figma node `164843:40671`.
 */
export function MarketingProductsSettings({ className }: MarketingProductsSettingsProps) {
  return (
    <MarketingSettingsShell
      activeId="products"
      title="Product Settings"
      description="Manage your product display and inventory settings"
      tabs={["Default", "Categories", "Inventory"]}
      activeTabIndex={2}
      className={className}
    >
      <div className="space-y-1">
        <SettingsRow
          title="Track Inventory"
          description="Enable inventory tracking for all products"
        >
          <Switch defaultChecked />
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Show Out of Stock Products"
          description="Display products with zero inventory on your store"
        >
          <Switch />
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Show Compare at Price"
          description="Enable price comparison display for discounted products"
        >
          <Switch defaultChecked />
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Default Stock Threshold"
          description="Set minimum stock level for inventory alerts"
        >
          <InputRoot>
            <Input defaultValue="10" />
          </InputRoot>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Auto-Hide When Out of Stock"
          description="Automatically hide products when inventory hits zero"
        >
          <Switch />
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Restock Notifications"
          description="Notify customers when products are back in stock"
        >
          <Button tone="neutral" style="stroke" size="sm">Configure</Button>
        </SettingsRow>
      </div>
    </MarketingSettingsShell>
  )
}
