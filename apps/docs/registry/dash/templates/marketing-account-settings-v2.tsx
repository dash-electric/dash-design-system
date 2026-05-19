"use client"

import * as React from "react"
import { RiUploadLine as Upload } from "@remixicon/react"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import {
  MarketingSettingsShell,
  SettingsRow,
  SettingsRowDivider,
} from "@/registry/dash/templates/_internal/marketing-settings-shell"

export type MarketingAccountSettingsV2Props = {
  userName?: string
  userEmail?: string
  userPhone?: string
  className?: string
}

/**
 * MarketingAccountSettingsV2 — modal-style Store Settings panel ported from
 * AlignUI Pro Figma node `164843:39909`. Differs from `marketing-account-settings`
 * (full-page Catalyst-style) by rendering the settings inside a centered modal
 * with both sidebar + content header + inline tabs.
 */
export function MarketingAccountSettingsV2({
  userName = "James Brown",
  userEmail = "james@alignui.com",
  userPhone = "+1 (012) 345-6789",
  className,
}: MarketingAccountSettingsV2Props) {
  return (
    <MarketingSettingsShell
      activeId="store"
      title="General Settings"
      description="Manage your store details and basic configurations"
      tabs={["Store Details", "Contact Information", "Discount Reminder"]}
      activeTabIndex={0}
      className={className}
    >
      <div className="space-y-1">
        <SettingsRow
          title="Profile Photo"
          description="Min 400×400px, PNG or JPEG."
        >
          <div className="flex items-center justify-end gap-3">
            <Avatar size="md">
              <AvatarFallback>
                {userName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button tone="neutral" style="stroke" size="sm">
              <Upload className="size-3.5" /> Change
            </Button>
          </div>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Store Name"
          description="Enter your store's display name for customer visibility."
        >
          <InputRoot>
            <Input defaultValue="Enter your store name" />
          </InputRoot>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Store Description"
          description="Add a brief overview of your store and services."
        >
          <InputRoot>
            <Input defaultValue="Brief description of your store..." />
          </InputRoot>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Country/Region"
          description="Select your store's primary location and market."
        >
          <InputRoot>
            <Input defaultValue="Turkey" />
          </InputRoot>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Time Zone"
          description="Select your store timezone."
        >
          <InputRoot>
            <Input defaultValue="(GMT+3:00) Istanbul" />
          </InputRoot>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Store URL"
          description="Your unique store address for customer access."
        >
          <InputRoot>
            <Input defaultValue="alignui.com/username" />
          </InputRoot>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Owner Email"
          description="Primary email for store communications."
        >
          <InputRoot>
            <Input type="email" defaultValue={userEmail} />
          </InputRoot>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Owner Phone"
          description="Primary phone number for store communications."
        >
          <InputRoot>
            <Input type="tel" defaultValue={userPhone} />
          </InputRoot>
        </SettingsRow>
      </div>
    </MarketingSettingsShell>
  )
}
