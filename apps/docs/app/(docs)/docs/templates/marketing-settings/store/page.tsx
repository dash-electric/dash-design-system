"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { InputRoot, Input, InputAffix } from "@/registry/dash/ui/input"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import {
  SectionHeader,
  SubTabs,
  SectionBody,
  DashedDivider,
  FormRow,
  ToggleRow,
  PreviewFrame,
} from "../_shared"

/**
 * Marketing Settings — Store (General). Ported from settings-modal/store-settings/
 *   {index, store-details, contact-information, discount-reminder}.tsx.
 *
 * Source modal renames the section header to "General Settings".
 */

const COUNTRIES: Array<[string, string]> = [
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["IT", "Italy"],
  ["ES", "Spain"],
  ["TR", "Turkey"],
  ["RU", "Russia"],
  ["CN", "China"],
  ["JP", "Japan"],
  ["IN", "India"],
  ["BR", "Brazil"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["AE", "United Arab Emirates"],
]

const TIMEZONES: Array<[string, string]> = [
  ["pacific-honolulu", "(GMT-10:00) Hawaii"],
  ["america-los_angeles", "(GMT-07:00) Pacific Time"],
  ["america-denver", "(GMT-06:00) Mountain Time"],
  ["america-chicago", "(GMT-05:00) Central Time"],
  ["america-new_york", "(GMT-04:00) Eastern Time"],
  ["europe-london", "(GMT+01:00) London"],
  ["europe-paris", "(GMT+02:00) Paris"],
  ["europe-istanbul", "(GMT+03:00) Istanbul"],
  ["asia-dubai", "(GMT+04:00) Dubai"],
  ["asia-singapore", "(GMT+08:00) Singapore"],
  ["asia-tokyo", "(GMT+09:00) Tokyo"],
  ["pacific-sydney", "(GMT+11:00) Sydney"],
]

function StoreDetailsForm() {
  return (
    <SectionBody>
      <FormRow
        label="Store Name"
        hint="Enter your store's display name for customer visibility."
        control={
          <InputRoot size="md" className="w-[312px]">
            <Input placeholder="Enter your store name" />
          </InputRoot>
        }
      />
      <DashedDivider />
      <FormRow
        label="Store Description"
        hint="Add a brief overview of your store and services."
        control={
          <InputRoot size="md" className="w-[312px]">
            <Input placeholder="Brief description of your store..." />
          </InputRoot>
        }
      />
      <DashedDivider />
      <FormRow
        label="Country/Region"
        hint="Select your store's primary location and market."
        control={
          <Select defaultValue="TR">
            <SelectTrigger size="md" className="w-[312px]">
              <SelectValue placeholder="Select Country/Region" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <DashedDivider />
      <FormRow
        label="Time Zone"
        hint="Select your store timezone."
        control={
          <Select defaultValue="europe-istanbul">
            <SelectTrigger size="md" className="w-[312px]">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <DashedDivider />
      <FormRow
        label="Store URL"
        hint="Your unique store address for customer access."
        control={
          <InputRoot size="md" className="w-[312px]">
            <InputAffix>alignui.com/</InputAffix>
            <Input placeholder="username" />
          </InputRoot>
        }
      />
    </SectionBody>
  )
}

function ContactInformationForm() {
  return (
    <SectionBody>
      <FormRow
        label="Contact Email"
        hint="Your name will be visible to your contacts."
        control={
          <InputRoot size="md" className="w-[312px]">
            <Input defaultValue="contact@alignui.com" />
          </InputRoot>
        }
      />
      <DashedDivider />
      <FormRow
        label="Support Email"
        hint="Email address for customer support inquiries."
        control={
          <InputRoot size="md" className="w-[312px]">
            <Input defaultValue="support@alignui.com" />
          </InputRoot>
        }
      />
      <DashedDivider />
      <FormRow
        label="Phone Number"
        hint="Business phone number for customer contact."
        control={
          <InputRoot size="md" className="w-[312px]">
            <Input defaultValue="+1 (012) 345-6789" />
          </InputRoot>
        }
      />
      <DashedDivider />
      <FormRow
        label="WhatsApp Number"
        hint="WhatsApp contact number for customer messaging."
        control={
          <InputRoot size="md" className="w-[312px]">
            <Input defaultValue="+1 (555) 000-0000" />
          </InputRoot>
        }
      />
      <DashedDivider />
      <FormRow
        label="Address"
        hint="Enter your store's physical location address."
        control={
          <InputRoot size="md" className="w-[312px]">
            <Input placeholder="Enter full store adress..." />
          </InputRoot>
        }
      />
      <DashedDivider />
    </SectionBody>
  )
}

function DiscountReminderForm() {
  const row = (label: string, month: string, hint: string, on: boolean) => (
    <div className="flex items-center gap-5">
      <Checkbox defaultChecked={on} />
      <div>
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-sm font-medium text-text-strong-950">{label}</span>
          <span className="text-xs text-text-sub-600">({month})</span>
        </div>
        <div className="mt-1 text-xs text-text-sub-600">{hint}</div>
      </div>
    </div>
  )
  return (
    <SectionBody>
      {row("Black Friday", "November", "Receive notifications for Black Friday promotions", true)}
      <DashedDivider />
      {row("End of Season", "January", "Receive notifications for winter season sales", true)}
      <DashedDivider />
      {row("Summary Sale", "June", "Receive notifications for summer collection sales", false)}
    </SectionBody>
  )
}

function StorePreview({
  tab,
}: {
  tab: "Store Details" | "Contact Information" | "Discount Reminder"
}) {
  return (
    <PreviewFrame>
      <SectionHeader
        title="General Settings"
        description="Manage your store details and basic configurations"
      />
      <SubTabs
        current={tab}
        tabs={["Store Details", "Contact Information", "Discount Reminder"]}
      />
      {tab === "Store Details" ? <StoreDetailsForm /> : null}
      {tab === "Contact Information" ? <ContactInformationForm /> : null}
      {tab === "Discount Reminder" ? <DiscountReminderForm /> : null}
    </PreviewFrame>
  )
}

export default function MarketingSettingsStorePage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Settings"
        title="Store"
        description="Store identity (name, description, region, timezone, URL), contact channels, and seasonal discount reminders. Three sub-tabs."
      />

      <DocsSection title="Store Details">
        <DocsExample
          title="Store identity form"
          description="Name, Description, Country/Region (15 options), Time Zone (12 options), and Store URL with 'alignui.com/' prefix."
          preview={<StorePreview tab="Store Details" />}
          code={`<FormRow label="Store Name" hint="Enter your store's display name for customer visibility."
  control={<InputRoot><Input placeholder="Enter your store name" /></InputRoot>} />
<FormRow label="Store Description" hint="Add a brief overview of your store and services."
  control={<InputRoot><Input placeholder="Brief description of your store..." /></InputRoot>} />
<FormRow label="Country/Region" hint="Select your store's primary location and market."
  control={<Select defaultValue="TR">{/* US GB DE FR IT ES TR RU CN JP IN BR CA AU AE */}</Select>} />
<FormRow label="Time Zone" hint="Select your store timezone."
  control={<Select defaultValue="europe-istanbul">{/* Hawaii … Sydney */}</Select>} />
<FormRow label="Store URL" hint="Your unique store address for customer access."
  control={<InputRoot><InputAffix>alignui.com/</InputAffix><Input placeholder="username" /></InputRoot>} />`}
        />
      </DocsSection>

      <DocsSection title="Contact Information">
        <DocsExample
          title="Contact channels"
          description="Five rows: Contact Email, Support Email, Phone Number, WhatsApp Number, Address (placeholder 'Enter full store adress...' — source typo preserved)."
          preview={<StorePreview tab="Contact Information" />}
          code={`<FormRow label="Contact Email" hint="Your name will be visible to your contacts."
  control={<InputRoot><Input defaultValue="contact@alignui.com" /></InputRoot>} />
<FormRow label="Support Email" hint="Email address for customer support inquiries."
  control={<InputRoot><Input defaultValue="support@alignui.com" /></InputRoot>} />
<FormRow label="Phone Number" hint="Business phone number for customer contact."
  control={<InputRoot><Input defaultValue="+1 (012) 345-6789" /></InputRoot>} />
<FormRow label="WhatsApp Number" hint="WhatsApp contact number for customer messaging."
  control={<InputRoot><Input defaultValue="+1 (555) 000-0000" /></InputRoot>} />
<FormRow label="Address" hint="Enter your store's physical location address."
  control={<InputRoot><Input placeholder="Enter full store adress..." /></InputRoot>} />`}
        />
      </DocsSection>

      <DocsSection title="Discount Reminder">
        <DocsExample
          title="Seasonal reminder opt-ins"
          description="3 checkboxes — Black Friday (November) and End of Season (January) checked by default; Summary Sale (June) off."
          preview={<StorePreview tab="Discount Reminder" />}
          code={`<div className="flex items-center gap-5">
  <Checkbox defaultChecked />
  <div>
    <div className="flex gap-1">
      <span className="text-sm font-medium">Black Friday</span>
      <span className="text-xs text-text-sub-600">(November)</span>
    </div>
    <div className="text-xs text-text-sub-600">Receive notifications for Black Friday promotions</div>
  </div>
</div>
{/* End of Season — January — Receive notifications for winter season sales (checked) */}
{/* Summary Sale — June — Receive notifications for summer collection sales (off) */}`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
