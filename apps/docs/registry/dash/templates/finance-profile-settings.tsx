"use client"

import * as React from "react"
import { RiUploadLine as Upload, RiFileCopyLine as Copy, RiShareLine as Share2 } from "@remixicon/react"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"
import {
  FinanceSettingsShell,
  SettingsFieldRow,
} from "@/registry/dash/templates/_finance-settings-shell"

/**
 * FinanceProfileSettings — port of AlignUI Pro Figma frame
 * "Profile Settings [Finance & Banking]" (node 3966:48150).
 *
 * Composition:
 *  - FinanceSettingsShell with activeTab="profile".
 *  - Field rows: Apex ID + Profile Photo + Full Name + Email + Phone + Legal Address.
 *  - Sticky footer: Discard / Save.
 *
 * Pixel parity is approximate; structural parity matches Figma.
 */

export type FinanceProfileSettingsProps = {
  className?: string
}

export function FinanceProfileSettings({ className }: FinanceProfileSettingsProps) {
  return (
    <FinanceSettingsShell
      activeTab="profile"
      title="Profile Settings"
      subtitle="Customize and edit essential profile details."
      className={className}
    >
      <div className="divide-y divide-stroke-soft-200">
        {/* Apex ID */}
        <SettingsFieldRow
          label="Apex ID"
          description="Use this ID to receive transfers."
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-text-strong-950">A-12341234</span>
            <Badge appearance="lighter" status="success" size="sm">
              Active
            </Badge>
            <div className="ml-auto flex items-center gap-2">
              <Button style="stroke" tone="neutral" size="sm">
                <Copy className="size-3.5" /> Copy ID
              </Button>
              <Button style="stroke" tone="neutral" size="sm">
                <Share2 className="size-3.5" /> Share ID
              </Button>
            </div>
          </div>
        </SettingsFieldRow>

        {/* Profile Photo */}
        <SettingsFieldRow
          label="Profile Photo"
          description="Min 400x400px, PNG or JPEG formats."
        >
          <div className="flex items-center gap-4">
            <Avatar size="xl">
              <AvatarFallback>AT</AvatarFallback>
            </Avatar>
            <Button style="stroke" tone="neutral" size="sm">
              <Upload className="size-3.5" /> Upload
            </Button>
          </div>
        </SettingsFieldRow>

        {/* Full Name */}
        <SettingsFieldRow
          label="Full Name"
          description="Your name will be visible to your contacts."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">Arthur Taylor</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        {/* Email */}
        <SettingsFieldRow
          label="Email Address"
          description="Business email address recommended."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">arthur@alignui.com</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        {/* Phone */}
        <SettingsFieldRow
          label="Phone Number"
          description="Business phone number recommended."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">+1 (012) 345-6789</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        {/* Legal Address */}
        <SettingsFieldRow
          label="Legal Address"
          description="Legal residential address for billing details."
        >
          <div className="flex items-start justify-between gap-3">
            <address className="not-italic text-sm text-text-strong-950 leading-relaxed">
              12 Rue Principale
              <br />
              Ville de Québec,
              <br />
              Québec, Canada
            </address>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>
      </div>

      <Divider />

      <div className={cn("flex items-center justify-end gap-2")}>
        <Button tone="neutral" style="stroke">
          Discard
        </Button>
        <Button tone="primary" style="filled">
          Save
        </Button>
      </div>
    </FinanceSettingsShell>
  )
}
