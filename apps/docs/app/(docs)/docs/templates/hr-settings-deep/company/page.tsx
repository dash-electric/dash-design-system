"use client"

import * as React from "react"
import {
  RiBuilding2Line,
  RiContactsBookLine,
  RiShareLine,
  RiShareForwardBoxLine,
  RiAddLine,
  RiInformationFill,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputAffix } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Hint } from "@/registry/dash/ui/hint"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { Divider } from "@/registry/dash/ui/divider"
import {
  SettingsPagePreview,
  SectionTabRail,
  SectionCard,
  SectionTitle,
} from "../_shared"

const COMPANY_TABS = [
  { label: "Company Settings", icon: RiBuilding2Line },
  { label: "Contact Information", icon: RiContactsBookLine },
  { label: "Social Links", icon: RiShareLine },
  { label: "Export Data", icon: RiShareForwardBoxLine },
]

function CompanySettingsPanel() {
  return (
    <SectionCard>
      <div className="flex gap-5">
        <Avatar size="3xl">
          <AvatarFallback>SH</AvatarFallback>
        </Avatar>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-medium text-text-strong-950">
              Upload Image
            </div>
            <div className="text-xs text-text-sub-600">
              Min 400x400px, PNG or JPEG
            </div>
          </div>
          <Button size="xs" tone="neutral" style="stroke">
            Upload
          </Button>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="co-name" required>
            Company Name
          </Label>
          <InputRoot size="md">
            <Input id="co-name" defaultValue="Synergy HR" />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="co-url" required>
            Website URL
          </Label>
          <InputRoot size="md">
            <InputAffix>https://</InputAffix>
            <Input
              id="co-url"
              placeholder="synergyhr.com"
              defaultValue="synergyhr.com"
            />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="co-slogan" required>
            Slogan/Catchphrase
          </Label>
          <InputRoot size="md">
            <Input
              id="co-slogan"
              placeholder="e.g. Unlocking Potential, Inspiring Growth."
            />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="co-desc" hint="(Optional)">
            Company Description
          </Label>
          <Textarea
            id="co-desc"
            className="min-h-[58px]"
            placeholder="Describe your company..."
          />
          <div className="-mt-1 text-right text-[11px] text-text-soft-400">
            0/200
          </div>
          <Hint>
            <RiInformationFill className="size-4" />
            You can describe your company briefly.
          </Hint>
        </div>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button tone="neutral" style="stroke">
          Discard
        </Button>
        <Button>Apply Changes</Button>
      </div>
    </SectionCard>
  )
}

function CompanyContactPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Contact Information"
        description="Enter your company's details for communication."
      />

      <Divider />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="co-email" required>
            Contact Information
          </Label>
          <InputRoot size="md">
            <Input
              id="co-email"
              type="email"
              defaultValue="sophia@alignui.com"
            />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="co-phone" hint="(Optional)">
            Phone Number
          </Label>
          <InputRoot size="md">
            <InputAffix>+1</InputAffix>
            <Input id="co-phone" placeholder="(555) 000-0000" />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="co-addr" required>
            Address
          </Label>
          <Textarea
            id="co-addr"
            className="min-h-[58px]"
            placeholder="Enter your full address here..."
          />
          <div className="-mt-1 text-right text-[11px] text-text-soft-400">
            0/200
          </div>
          <Hint>
            <RiInformationFill className="size-4" />
            Input company&apos;s residential address for official records.
          </Hint>
        </div>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button tone="neutral" style="stroke">
          Discard
        </Button>
        <Button>Apply Changes</Button>
      </div>
    </SectionCard>
  )
}

function CompanySocialPanel() {
  const links: { id: string; label: string; affix: string }[] = [
    { id: "facebook", label: "Facebook", affix: "facebook.com" },
    { id: "instagram", label: "Instagram", affix: "instagram.com" },
    { id: "x", label: "X", affix: "x.com" },
  ]
  return (
    <SectionCard>
      <SectionTitle
        title="Social Links"
        description="Manage your social media connections."
      />

      <Divider />

      <div className="flex flex-col gap-3">
        {links.map(({ id, label, affix }) => (
          <div key={id} className="flex flex-col gap-1">
            <Label htmlFor={`co-soc-${id}`} hint="(Optional)">
              {label}
            </Label>
            <InputRoot size="md">
              <InputAffix>{affix}</InputAffix>
              <Input id={`co-soc-${id}`} placeholder="username" />
            </InputRoot>
          </div>
        ))}
      </div>

      <Button tone="neutral" style="stroke" className="mt-1 w-full">
        <RiAddLine />
        Add Social Link
      </Button>
    </SectionCard>
  )
}

function CompanyExportPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Export Data"
        description="Export your HR data for personal records."
      />

      <Divider />

      <div className="flex items-center gap-2">
        <Checkbox id="co-exp-c1" defaultChecked />
        <Label htmlFor="co-exp-c1" className="text-sm font-normal">
          Include Company Information
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="co-exp-c2" defaultChecked />
        <Label htmlFor="co-exp-c2" className="text-sm font-normal">
          Employee Management
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="co-exp-c3" />
        <Label htmlFor="co-exp-c3" className="text-sm font-normal">
          Leave and Attendance
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="co-exp-c4" />
        <Label htmlFor="co-exp-c4" className="text-sm font-normal">
          Performance Analytics
        </Label>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <Label htmlFor="co-exp-fmt" required>
          Select preferred file format
        </Label>
        <Select defaultValue="docx">
          <SelectTrigger id="co-exp-fmt">
            <SelectValue placeholder="Select a file format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="docx">Word Document (DOCX)</SelectItem>
            <SelectItem value="excel">Excel Spreadsheet (XLSX)</SelectItem>
            <SelectItem value="pptx">PowerPoint Presentation (PPTX)</SelectItem>
            <SelectItem value="txt">Plain Text File (TXT)</SelectItem>
            <SelectItem value="csv">CSV File (CSV)</SelectItem>
            <SelectItem value="json">JSON File (JSON)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button style="stroke" className="mt-1 w-full">
        <RiShareForwardBoxLine />
        Export
      </Button>
    </SectionCard>
  )
}

function CompanyPreview({ tab }: { tab: string }) {
  return (
    <SettingsPagePreview active="company">
      <SectionTabRail tabs={COMPANY_TABS} current={tab} />
      {tab === "Company Settings" ? <CompanySettingsPanel /> : null}
      {tab === "Contact Information" ? <CompanyContactPanel /> : null}
      {tab === "Social Links" ? <CompanySocialPanel /> : null}
      {tab === "Export Data" ? <CompanyExportPanel /> : null}
    </SettingsPagePreview>
  )
}

export default function HrSettingsDeepCompanyPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Settings"
        title="Company Settings"
        description="Org-level settings section. Vertical sub-tab rail with 4 panels: Company Settings (logo + name + URL + slogan + description), Contact Information, Social Links, Export Data (4 checkbox toggles instead of 3)."
      />

      <DocsSection title="Company Settings panel">
        <CompanyPreview tab="Company Settings" />
      </DocsSection>

      <DocsSection title="Contact Information panel">
        <CompanyPreview tab="Contact Information" />
      </DocsSection>

      <DocsSection title="Social Links panel">
        <CompanyPreview tab="Social Links" />
      </DocsSection>

      <DocsSection title="Export Data panel">
        <CompanyPreview tab="Export Data" />
      </DocsSection>

      <DocsSection title="Differences vs Profile section">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            <strong>Company Settings</strong> panel adds 2 extra fields (Website
            URL with <code>https://</code> affix, Slogan/Catchphrase).
          </li>
          <li>
            <strong>Contact Information</strong> labels the email field as
            &quot;Contact Information&quot; (not &quot;Email Address&quot;).
          </li>
          <li>
            <strong>Export Data</strong> uses 4 checkboxes (Company Information,
            Employee Management, Leave and Attendance, Performance Analytics)
            and the Select placeholder is &quot;Select a file format&quot;.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
