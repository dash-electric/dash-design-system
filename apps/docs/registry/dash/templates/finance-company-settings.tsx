"use client"

import * as React from "react"
import { RiUploadLine as Upload, RiBuilding2Line as Building2 } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"
import {
  FinanceSettingsShell,
  SettingsFieldRow,
} from "@/registry/dash/templates/_finance-settings-shell"

/**
 * FinanceCompanySettings — port of AlignUI Pro Figma frame
 * "Company Settings [Finance & Banking]" (node 3966:57728).
 *
 * Composition:
 *  - FinanceSettingsShell with activeTab="company".
 *  - Field rows: Upload Logo + Legal Name + Tax ID + Email + Phone + Legal Address + Web Links.
 *  - Sticky footer: Discard / Save.
 *
 * Pixel parity is approximate; structural parity matches Figma.
 */

export type FinanceCompanySettingsProps = {
  className?: string
}

export function FinanceCompanySettings({ className }: FinanceCompanySettingsProps) {
  return (
    <FinanceSettingsShell
      activeTab="company"
      title="Company Settings"
      subtitle="Customize and edit essential company details."
      className={className}
    >
      <div className="divide-y divide-stroke-soft-200">
        {/* Upload Logo */}
        <SettingsFieldRow
          label="Upload Logo"
          description="Min 400x400px, PNG or JPEG formats."
        >
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 grid place-items-center text-text-soft-400">
              <Building2 className="size-6" />
            </div>
            <Button style="stroke" tone="neutral" size="sm">
              <Upload className="size-3.5" /> Upload
            </Button>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Legal Name"
          description="The official legal name of your company."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">Apex Financial, Inc.</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Tax ID Number"
          description="Registered in the official jurisdiction of your company."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">123456789RC0001</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Email Address"
          description="The official email address for billings and contact requests."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">apex@alignui.com</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Phone Number"
          description="The official phone number for billing and contact requests."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">+1 (416) 555-7890</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Legal Address"
          description="The official residential address for billing details and shipments."
        >
          <div className="flex items-start justify-between gap-3">
            <address className="not-italic text-sm text-text-strong-950 leading-relaxed">
              123 Main Street
              <br />
              Suite 456
              <br />
              Toronto, ON M1A 1A1
              <br />
              Canada
            </address>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Web Links"
          description="Links for your company's website and social media accounts."
        >
          <div className="flex items-start justify-between gap-3">
            <ul className="text-sm text-text-strong-950 space-y-0.5">
              <li>apexfinancial.com</li>
              <li>linkedin.com/company/apexfinancial</li>
              <li>facebook.com/apexfinancial</li>
            </ul>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>
      </div>

      <Divider />

      <div className={cn("flex items-center justify-end gap-2")}>
        <Button tone="neutral" style="stroke">Discard</Button>
        <Button tone="primary" style="filled">Save</Button>
      </div>
    </FinanceSettingsShell>
  )
}
