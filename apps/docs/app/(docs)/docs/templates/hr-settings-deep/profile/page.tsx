"use client"

import * as React from "react"
import {
  RiUserLine,
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

const PROFILE_TABS = [
  { label: "Profile Settings", icon: RiUserLine },
  { label: "Contact Information", icon: RiContactsBookLine },
  { label: "Social Links", icon: RiShareLine },
  { label: "Export Data", icon: RiShareForwardBoxLine },
]

/* -------------------------------------------------------------------------- */
/* Panel 1 — Profile Settings                                                  */
/* -------------------------------------------------------------------------- */
function ProfileSettingsPanel() {
  return (
    <SectionCard>
      <div className="flex gap-5">
        <Avatar size="3xl">
          <AvatarFallback>SW</AvatarFallback>
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
          <Label htmlFor="prof-fullname" required>
            Full Name
          </Label>
          <InputRoot size="md">
            <Input id="prof-fullname" defaultValue="Sophia Williams" />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="prof-title" required>
            Title
          </Label>
          <InputRoot size="md">
            <Input id="prof-title" placeholder="e.g. UI/UX Designer" />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="prof-bio" hint="(Optional)">
            Biography
          </Label>
          <Textarea
            id="prof-bio"
            className="min-h-[58px]"
            placeholder="Describe yourself..."
          />
          <div className="-mt-1 text-right text-[11px] text-text-soft-400">
            0/200
          </div>
          <Hint>
            <RiInformationFill className="size-4" />
            It will be displayed on your profile.
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

/* -------------------------------------------------------------------------- */
/* Panel 2 — Contact Information                                               */
/* -------------------------------------------------------------------------- */
function ContactInfoPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Contact Information"
        description="Enter your contact details for communication."
      />

      <Divider />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="cont-email" required>
            Email Address
          </Label>
          <InputRoot size="md">
            <Input
              id="cont-email"
              type="email"
              defaultValue="sophia@alignui.com"
            />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="cont-phone" hint="(Optional)">
            Phone Number
          </Label>
          <InputRoot size="md">
            <InputAffix>+1</InputAffix>
            <Input id="cont-phone" placeholder="(555) 000-0000" />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="cont-address" required>
            Address
          </Label>
          <Textarea
            id="cont-address"
            className="min-h-[58px]"
            placeholder="Enter your full address here..."
          />
          <div className="-mt-1 text-right text-[11px] text-text-soft-400">
            0/200
          </div>
          <Hint>
            <RiInformationFill className="size-4" />
            Input your residential address for HR records.
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

/* -------------------------------------------------------------------------- */
/* Panel 3 — Social Links                                                      */
/* -------------------------------------------------------------------------- */
function SocialLinksPanel() {
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
            <Label htmlFor={`prof-soc-${id}`} hint="(Optional)">
              {label}
            </Label>
            <InputRoot size="md">
              <InputAffix>{affix}</InputAffix>
              <Input id={`prof-soc-${id}`} placeholder="username" />
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

/* -------------------------------------------------------------------------- */
/* Panel 4 — Export Data                                                       */
/* -------------------------------------------------------------------------- */
function ExportDataPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Export Data"
        description="Export your HR data for personal records."
      />

      <Divider />

      <div className="flex items-center gap-2">
        <Checkbox id="prof-exp-c1" defaultChecked />
        <Label htmlFor="prof-exp-c1" className="text-sm font-normal">
          Include Personal Information
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="prof-exp-c2" defaultChecked />
        <Label htmlFor="prof-exp-c2" className="text-sm font-normal">
          Include Attendance Records
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="prof-exp-c3" />
        <Label htmlFor="prof-exp-c3" className="text-sm font-normal">
          Include Performance Reviews
        </Label>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <Label htmlFor="prof-exp-fmt" required>
          Select preferred file format
        </Label>
        <Select defaultValue="docx">
          <SelectTrigger id="prof-exp-fmt">
            <SelectValue placeholder="Select a time format" />
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

function ProfileSettingsPreview({ tab }: { tab: string }) {
  return (
    <SettingsPagePreview active="profile">
      <SectionTabRail tabs={PROFILE_TABS} current={tab} />
      {tab === "Profile Settings" ? <ProfileSettingsPanel /> : null}
      {tab === "Contact Information" ? <ContactInfoPanel /> : null}
      {tab === "Social Links" ? <SocialLinksPanel /> : null}
      {tab === "Export Data" ? <ExportDataPanel /> : null}
    </SettingsPagePreview>
  )
}

export default function HrSettingsDeepProfilePage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Settings"
        title="Profile Settings"
        description="Per-person profile section. Vertical sub-tab rail with 4 panels: Profile Settings (avatar + name + title + biography), Contact Information (email + phone + address), Social Links (Facebook / Instagram / X), Export Data."
      />

      <DocsSection title="Profile Settings panel">
        <ProfileSettingsPreview tab="Profile Settings" />
      </DocsSection>

      <DocsSection title="Contact Information panel">
        <ProfileSettingsPreview tab="Contact Information" />
      </DocsSection>

      <DocsSection title="Social Links panel">
        <ProfileSettingsPreview tab="Social Links" />
      </DocsSection>

      <DocsSection title="Export Data panel">
        <ProfileSettingsPreview tab="Export Data" />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            Avatar upload row — <code>Avatar size=&quot;3xl&quot;</code> (64px) +
            label/hint block + <em>Upload</em> xs stroke button.
          </li>
          <li>
            Fields: Full Name (default <em>Sophia Williams</em>), Title
            (placeholder <em>e.g. UI/UX Designer</em>), Biography (200 char
            textarea, optional, info hint).
          </li>
          <li>
            Contact panel uses an affix Input as the phone-number fallback
            (template uses <code>PhoneNumberInput</code>).
          </li>
          <li>
            Export panel: 3 checkboxes (Personal Information / Attendance
            Records / Performance Reviews), then a 6-option file-format Select,
            then a full-width <em>Export</em> stroke button with a share icon.
          </li>
          <li>
            Footer = two-column grid (Discard stroke + Apply Changes primary).
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
