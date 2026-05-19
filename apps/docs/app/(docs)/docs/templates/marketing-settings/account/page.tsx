"use client"

import * as React from "react"
import { RiCloseCircleFill as CloseFill } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { Avatar, AvatarImage, AvatarFallback, AvatarIndicator } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Switch } from "@/registry/dash/ui/switch"
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
 * Marketing Settings — Account. Ported from settings-modal/account-settings/
 *   {index, profile-settings, notifications-settings, language-region-settings}.tsx.
 */

function ProfileForm() {
  return (
    <SectionBody>
      <FormRow
        label="Profile Photo"
        hint="Min 400x400px, PNG or JPEG formats."
        control={
          <div className="flex items-center gap-5">
            <Avatar size="lg" className="relative">
              <AvatarImage src="" alt="James" />
              <AvatarFallback>JB</AvatarFallback>
              <AvatarIndicator position="top-right" tone="cancel" size="md">
                <CloseFill />
              </AvatarIndicator>
            </Avatar>
            <Button size="xs" tone="neutral" style="stroke">
              Change
            </Button>
          </div>
        }
      />
      <DashedDivider />
      <FormRow
        label="Full Name"
        hint="Your name will be visible to your contacts."
        control={
          <InputRoot size="md" className="w-[312px]">
            <Input defaultValue="James Brown" />
          </InputRoot>
        }
      />
      <DashedDivider />
      <FormRow
        label="Email Address"
        hint="Business email address recommended."
        control={
          <InputRoot size="md" className="w-[312px]">
            <Input defaultValue="james@alignui.com" />
          </InputRoot>
        }
      />
      <DashedDivider />
      <FormRow
        label="Phone Number"
        hint="Business phone number recommended."
        control={
          <InputRoot size="md" className="w-[312px]">
            <Input defaultValue="+1 (012) 345-6789" />
          </InputRoot>
        }
      />
    </SectionBody>
  )
}

function NotificationsForm() {
  return (
    <SectionBody>
      <ToggleRow
        control={<Switch defaultChecked />}
        label="Sales Reports"
        hint="Receive daily, weekly, or monthly reports"
      />
      <DashedDivider />
      <ToggleRow
        control={<Switch defaultChecked />}
        label="New Orders"
        hint="Get notified when you receive a new order"
      />
      <DashedDivider />
      <ToggleRow
        control={<Switch />}
        label="Marketing Updates"
        hint="News about products and features"
      />
      <DashedDivider />
      <ToggleRow
        control={<Switch />}
        label="Orders Alerts"
        hint="Get instant push alerts for order status changes"
      />
    </SectionBody>
  )
}

function LanguageRegionForm() {
  const trigger = (placeholder: string) => (
    <SelectTrigger size="md" className="w-[256px]">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
  )
  return (
    <SectionBody>
      <FormRow
        rightWidth="256px"
        label="Language"
        hint="Display the app in your selected language."
        control={
          <Select defaultValue="en-US">
            {trigger("Select language")}
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="en-GB">English (UK)</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <DashedDivider />
      <FormRow
        rightWidth="256px"
        label="Currency"
        hint="View balances in your selected currency."
        control={
          <Select defaultValue="usd">
            {trigger("Select currency")}
            <SelectContent>
              <SelectItem value="usd">US Dollar (USD)</SelectItem>
              <SelectItem value="eur">Euro (EUR)</SelectItem>
              <SelectItem value="gbp">British Pound (GBP)</SelectItem>
              <SelectItem value="jpy">Japanese Yen (JPY)</SelectItem>
              <SelectItem value="aud">Australian Dollar (AUD)</SelectItem>
              <SelectItem value="cad">Canadian Dollar (CAD)</SelectItem>
              <SelectItem value="chf">Swiss Franc (CHF)</SelectItem>
              <SelectItem value="cny">Chinese Yuan (CNY)</SelectItem>
              <SelectItem value="inr">Indian Rupee (INR)</SelectItem>
              <SelectItem value="sgd">Singapore Dollar (SGD)</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <DashedDivider />
      <FormRow
        rightWidth="256px"
        label="Timezone and Format"
        hint="Choose your timezone and preferred format."
        control={
          <Select defaultValue="europe-istanbul">
            {trigger("Select timezone")}
            <SelectContent>
              <SelectItem value="pacific-honolulu">(GMT-10:00) Hawaii</SelectItem>
              <SelectItem value="america-los_angeles">(GMT-07:00) Pacific Time</SelectItem>
              <SelectItem value="america-denver">(GMT-06:00) Mountain Time</SelectItem>
              <SelectItem value="america-chicago">(GMT-05:00) Central Time</SelectItem>
              <SelectItem value="america-new_york">(GMT-04:00) Eastern Time</SelectItem>
              <SelectItem value="europe-london">(GMT+01:00) London</SelectItem>
              <SelectItem value="europe-paris">(GMT+02:00) Paris</SelectItem>
              <SelectItem value="europe-istanbul">(GMT+03:00) Istanbul</SelectItem>
              <SelectItem value="asia-dubai">(GMT+04:00) Dubai</SelectItem>
              <SelectItem value="asia-singapore">(GMT+08:00) Singapore</SelectItem>
              <SelectItem value="asia-tokyo">(GMT+09:00) Tokyo</SelectItem>
              <SelectItem value="pacific-sydney">(GMT+11:00) Sydney</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <DashedDivider />
      <FormRow
        rightWidth="256px"
        label="Date Format"
        hint="Choose your preferred date format."
        control={
          <Select defaultValue="dd-mm-yyyy">
            {trigger("Select date format")}
            <SelectContent>
              <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
              <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
              <SelectItem value="yyyy-mm-dd">YYYY/MM/DD</SelectItem>
              <SelectItem value="dd-mmm-yyyy">DD MMM YYYY</SelectItem>
              <SelectItem value="mmm-dd-yyyy">MMM DD, YYYY</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </SectionBody>
  )
}

function AccountSettingsPreview({ tab }: { tab: "Profile" | "Notifications" | "Language & Region" }) {
  return (
    <PreviewFrame>
      <SectionHeader
        title="Account Settings"
        description="Manage and collaborate on your account settings"
      />
      <SubTabs current={tab} tabs={["Profile", "Notifications", "Language & Region"]} />
      {tab === "Profile" ? <ProfileForm /> : null}
      {tab === "Notifications" ? <NotificationsForm /> : null}
      {tab === "Language & Region" ? <LanguageRegionForm /> : null}
    </PreviewFrame>
  )
}

export default function MarketingSettingsAccountPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Settings"
        title="Account"
        description="Profile photo + name, email, phone form. Three sub-tabs: Profile, Notifications, Language & Region."
      />

      <DocsSection title="Profile">
        <DocsExample
          title="Profile form"
          description="Avatar with remove indicator + Change button, then editable rows for Full Name, Email Address, Phone Number."
          preview={<AccountSettingsPreview tab="Profile" />}
          code={`<SectionHeader title="Account Settings" description="Manage and collaborate on your account settings" />
<SubTabs current="Profile" tabs={["Profile", "Notifications", "Language & Region"]} />
<SectionBody>
  <FormRow
    label="Profile Photo"
    hint="Min 400x400px, PNG or JPEG formats."
    control={<>
      <Avatar size="lg"><AvatarFallback>JB</AvatarFallback>
        <AvatarIndicator position="top-right" tone="cancel"><CloseFill /></AvatarIndicator>
      </Avatar>
      <Button size="xs" tone="neutral" style="stroke">Change</Button>
    </>}
  />
  <DashedDivider />
  <FormRow label="Full Name" hint="Your name will be visible to your contacts."
    control={<InputRoot><Input defaultValue="James Brown" /></InputRoot>} />
  {/* Email Address, Phone Number — same shape */}
</SectionBody>`}
        />
      </DocsSection>

      <DocsSection title="Notifications">
        <DocsExample
          title="Notification toggles"
          description="Four Switch + label rows: Sales Reports, New Orders, Marketing Updates, Orders Alerts."
          preview={<AccountSettingsPreview tab="Notifications" />}
          code={`<ToggleRow control={<Switch defaultChecked />} label="Sales Reports"
  hint="Receive daily, weekly, or monthly reports" />
<DashedDivider />
<ToggleRow control={<Switch defaultChecked />} label="New Orders"
  hint="Get notified when you receive a new order" />
<DashedDivider />
<ToggleRow control={<Switch />} label="Marketing Updates"
  hint="News about products and features" />
<DashedDivider />
<ToggleRow control={<Switch />} label="Orders Alerts"
  hint="Get instant push alerts for order status changes" />`}
        />
      </DocsSection>

      <DocsSection title="Language & Region">
        <DocsExample
          title="Region selects"
          description="Four selects — Language (7 options), Currency (10 options), Timezone (12 options), Date Format (5 options). 256px right column."
          preview={<AccountSettingsPreview tab="Language & Region" />}
          code={`<FormRow label="Language" hint="Display the app in your selected language." rightWidth="256px"
  control={
    <Select defaultValue="en-US">
      <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="en-US">English (US)</SelectItem>
        {/* en-GB, es, fr, de, it, pt */}
      </SelectContent>
    </Select>
  }
/>
{/* Currency: USD EUR GBP JPY AUD CAD CHF CNY INR SGD */}
{/* Timezone: Hawaii / Pacific / Mountain / Central / Eastern / London / Paris / Istanbul / Dubai / Singapore / Tokyo / Sydney */}
{/* Date Format: DD/MM/YYYY · MM/DD/YYYY · YYYY/MM/DD · DD MMM YYYY · MMM DD, YYYY */}`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>Section header (label-md / paragraph-sm) + Discard + Save Changes buttons.</li>
          <li>Horizontal sub-tabs row (px-5) with underline active state.</li>
          <li>Form rows: <code>grid-cols-[minmax(0,1fr),312px]</code> (Profile) or <code>[1fr,256px]</code> (Language).</li>
          <li>Switch rows use control-then-label flex layout; Profile rows use label-then-control grid.</li>
          <li>Every row separated by a 1px <code>border-dashed</code> divider.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
