"use client"

import * as React from "react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import {
  MarketingSettingsShell,
  SettingsRow,
  SettingsRowDivider,
} from "@/registry/dash/templates/_internal/marketing-settings-shell"

export type MarketingPrivacySecurityProps = {
  className?: string
}

/**
 * MarketingPrivacySecurity — Privacy & Security settings panel.
 * Ported from AlignUI Pro Figma node `164843:34880`.
 */
export function MarketingPrivacySecurity({ className }: MarketingPrivacySecurityProps) {
  return (
    <MarketingSettingsShell
      activeId="privacy"
      title="Privacy & Security"
      description="Customize your privacy and security settings"
      tabs={["Password & 2FA", "Active Session"]}
      activeTabIndex={0}
      className={className}
    >
      <div className="space-y-1">
        <SettingsRow
          title="Change Password"
          description="Update password for enhanced account security."
        >
          <Button tone="neutral" style="stroke" size="sm">Change Password</Button>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Backup Codes"
          description="Generate backup codes for your 2FA device."
        >
          <Button tone="neutral" style="stroke" size="sm">Generate Codes</Button>
        </SettingsRow>
        <SettingsRowDivider />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center py-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-text-strong-950">2FA-Authentication</div>
              <Badge appearance="lighter" status="success">Enabled</Badge>
            </div>
            <div className="text-xs text-text-sub-600 mt-0.5">
              Add an extra layer of protection to your account.
            </div>
          </div>
          <Button tone="primary" style="stroke" size="sm">Manage Authentication</Button>
        </div>
        <SettingsRowDivider />

        <SettingsRow
          title="Login Notifications"
          description="Receive an email when a new device signs in."
        >
          <Button tone="neutral" style="stroke" size="sm">Configure</Button>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Data Export"
          description="Download a copy of your account data."
        >
          <Button tone="neutral" style="stroke" size="sm">Request Export</Button>
        </SettingsRow>
      </div>
    </MarketingSettingsShell>
  )
}
