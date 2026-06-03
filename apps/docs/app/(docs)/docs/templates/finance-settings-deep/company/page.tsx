"use client"

import { RiBuilding2Line } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { Divider } from "@/registry/dash/ui/divider"
import {
  SettingsPagePreview,
  SettingsSectionHeader,
  FieldRow,
  ValueEdit,
} from "../_shared"

function CompanySectionBody() {
  return (
    <>
      <SettingsSectionHeader
        icon={RiBuilding2Line}
        title="Company Settings"
        description="Customize and edit essential company details."
      />
      <div className="px-4 lg:px-8">
        <Divider />
      </div>
      <div className="flex w-full flex-col gap-6 px-4 py-6 lg:px-8">
        <FieldRow
          label="Upload Logo"
          description="Min 400x400px, PNG or JPEG formats."
        >
          <div className="flex items-center gap-6">
            <Avatar size="2xl" shape="rounded">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Button tone="neutral" style="stroke" size="xs">
              Upload
            </Button>
          </div>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Legal Name"
          description="The official legal name of your company."
        >
          <ValueEdit>Apex Financial, Inc.</ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Tax ID Number"
          description="Registered in the official jurisdiction of your company."
        >
          <ValueEdit>123456789RC0001</ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Email Address"
          description="The official email address for billings and contact requests."
        >
          <ValueEdit>apex@alignui.com</ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Phone Number"
          description="The official phone number for billing and contact requests."
        >
          <ValueEdit>+1 (416) 555-7890</ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Legal Address"
          description="The official residential address for billing details and shipments."
        >
          <ValueEdit multiline>
            123 Main Street
            <br />
            Suite 456
            <br />
            Toronto, ON M1A 1A1
            <br />
            Canada
          </ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Web Links"
          description="Links for your company's website and social media accounts."
        >
          <ValueEdit multiline>
            apexfinancial.com
            <br />
            linkedin.com/company/apexfinancial
            <br />
            facebook.com/apexfinancial
            <br />
            twitter.com/apexfinancial
          </ValueEdit>
        </FieldRow>
      </div>
    </>
  )
}

export default function FinanceSettingsDeepCompanyPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance / Settings"
        title="Company"
        description="Company logo upload + 6 field rows (Legal Name, Tax ID Number, Email Address, Phone Number, Legal Address, Web Links). All right-hand values shown as static text + LinkButton Edit. Ported from app/settings/company-settings/page.tsx."
      />

      <DocsSection title="Company section preview">
        <SettingsPagePreview active="company">
          <CompanySectionBody />
        </SettingsPagePreview>
      </DocsSection>

      <DocsSection title="Field inventory">
        <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Upload Logo</strong> —
            56px rounded Avatar with "A" fallback (source uses
            <code> placeholderType="company"</code>). Upload xs stroke button.
          </li>
          <li>
            <strong className="text-text-strong-950">Legal Name</strong> —
            <em> Apex Financial, Inc.</em>
          </li>
          <li>
            <strong className="text-text-strong-950">Tax ID Number</strong> —
            <em> 123456789RC0001</em>
          </li>
          <li>
            <strong className="text-text-strong-950">Email Address</strong> —
            <em> apex@alignui.com</em>
          </li>
          <li>
            <strong className="text-text-strong-950">Phone Number</strong> —
            <em> +1 (416) 555-7890</em>
          </li>
          <li>
            <strong className="text-text-strong-950">Legal Address</strong> —
            4-line address (123 Main Street / Suite 456 / Toronto, ON M1A 1A1 /
            Canada).
          </li>
          <li>
            <strong className="text-text-strong-950">Web Links</strong> —
            4 URLs (apexfinancial.com + 3 socials).
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
