"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { RadioGroup, RadioItem } from "@/registry/dash/ui/radio"
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
 * Marketing Settings — Appearance. Ported from settings-modal/appearance/
 *   {index, theme, preferences}.tsx.
 */

const SWATCHES = [
  "#FA7319",
  "#335CFF",
  "#FB3748",
  "#1FC16B",
  "#F6B51E",
  "#7D52F4",
  "#47C2FF",
  "#FB4BA3",
  "#22D3BB",
] as const

function ThemeForm() {
  const [theme, setTheme] = React.useState("light")
  const [brand, setBrand] = React.useState<string>("#FA7319")
  return (
    <SectionBody>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div>
          <div className="text-sm font-medium text-text-strong-950">Interface Theme</div>
          <div className="mt-1 text-xs text-text-sub-600">
            Select and customize your UI theme.
          </div>
        </div>
        <RadioGroup
          value={theme}
          onValueChange={setTheme}
          className="flex flex-row items-center gap-5 text-sm text-text-sub-600"
        >
          <label className="flex cursor-pointer items-center gap-1.5">
            <RadioItem value="light" /> Light
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <RadioItem value="dark" /> Dark
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <RadioItem value="system" /> System
          </label>
        </RadioGroup>
      </div>
      <DashedDivider />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div>
          <div className="text-sm font-medium text-text-strong-950">Brand Color</div>
          <div className="mt-1 text-xs text-text-sub-600">
            Select or customize your brand color.
          </div>
        </div>
        <div className="flex items-center gap-1">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => setBrand(c)}
              className={
                "relative inline-flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-bg-white-0 transition " +
                (brand === c ? "ring-2" : "ring-0")
              }
              style={{ ["--tw-ring-color" as never]: c }}
            >
              <span
                className="size-4 rounded-full"
                style={{ background: c }}
              />
            </button>
          ))}
        </div>
      </div>
      <DashedDivider />
      <FormRow
        rightWidth="256px"
        label="Sidebar Feautre"
        hint="What’s shows in the destkop sidebar."
        control={
          <Select defaultValue="recent-changes">
            <SelectTrigger size="md" className="w-[256px]">
              <SelectValue placeholder="Select Sidebar Feature" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent-changes">Recent Changes</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              <SelectItem value="quick-actions">Quick Actions</SelectItem>
              <SelectItem value="notifications">Notifications</SelectItem>
              <SelectItem value="bookmarks">Bookmarks</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </SectionBody>
  )
}

function PreferencesForm() {
  return (
    <SectionBody>
      <ToggleRow
        control={<Checkbox defaultChecked />}
        label="Compact Mode"
        hint="Control the density of your interface layout."
      />
      <DashedDivider />
      <ToggleRow
        control={<Checkbox defaultChecked />}
        label="Show Grid Lines"
        hint="Add visual separation to tables and lists."
      />
      <DashedDivider />
      <ToggleRow
        control={<Checkbox />}
        label="Show Tooltips"
        hint="Show helpful hints when hovering over elements."
      />
      <DashedDivider />
      <ToggleRow
        control={<Checkbox />}
        label="Enable Animations"
        hint="Add smooth transitions between interface states."
      />
      <DashedDivider />
      <ToggleRow
        control={<Checkbox />}
        label="Show Breadcrumbs"
        hint="Show your current location in navigation hierarchy."
      />
    </SectionBody>
  )
}

function AppearancePreview({ tab }: { tab: "Theme" | "Preferences" }) {
  return (
    <PreviewFrame>
      <SectionHeader
        title="Appearance Settings"
        description="Customize your dashboard appearance and layout settings"
      />
      <SubTabs current={tab} tabs={["Theme", "Preferences"]} />
      {tab === "Theme" ? <ThemeForm /> : <PreferencesForm />}
    </PreviewFrame>
  )
}

export default function MarketingSettingsAppearancePage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Settings"
        title="Appearance"
        description="Theme + brand color + sidebar feature, plus layout preferences. Two sub-tabs."
      />

      <DocsSection title="Theme">
        <DocsExample
          title="Interface theme, brand color, sidebar feature"
          description="RadioGroup (Light / Dark / System), 9-color brand swatch picker, and a Sidebar Feature select."
          preview={<AppearancePreview tab="Theme" />}
          code={`<RadioGroup defaultValue="light" className="flex items-center gap-5">
  <label className="flex items-center gap-1.5"><RadioItem value="light" /> Light</label>
  <label className="flex items-center gap-1.5"><RadioItem value="dark" /> Dark</label>
  <label className="flex items-center gap-1.5"><RadioItem value="system" /> System</label>
</RadioGroup>

{/* Brand swatches — Figma sample list */}
{['#FA7319', '#335CFF', '#FB3748', '#1FC16B', '#F6B51E', '#7D52F4', '#47C2FF', '#FB4BA3', '#22D3BB']
  .map((c) => <button key={c} className="size-7 rounded-full" style={{ background: c }} />)}

<Select defaultValue="recent-changes">
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="recent-changes">Recent Changes</SelectItem>
    <SelectItem value="favorites">Favorites</SelectItem>
    <SelectItem value="quick-actions">Quick Actions</SelectItem>
    <SelectItem value="notifications">Notifications</SelectItem>
    <SelectItem value="bookmarks">Bookmarks</SelectItem>
  </SelectContent>
</Select>`}
        />
      </DocsSection>

      <DocsSection title="Preferences">
        <DocsExample
          title="Layout preferences"
          description="Five checkbox rows — Compact Mode, Show Grid Lines, Show Tooltips, Enable Animations, Show Breadcrumbs."
          preview={<AppearancePreview tab="Preferences" />}
          code={`<ToggleRow control={<Checkbox defaultChecked />} label="Compact Mode"
  hint="Control the density of your interface layout." />
<ToggleRow control={<Checkbox defaultChecked />} label="Show Grid Lines"
  hint="Add visual separation to tables and lists." />
<ToggleRow control={<Checkbox />} label="Show Tooltips"
  hint="Show helpful hints when hovering over elements." />
<ToggleRow control={<Checkbox />} label="Enable Animations"
  hint="Add smooth transitions between interface states." />
<ToggleRow control={<Checkbox />} label="Show Breadcrumbs"
  hint="Show your current location in navigation hierarchy." />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>Theme: row spans full width with label/hint on left, RadioGroup or ColorSwatch row on right.</li>
          <li>Brand color: 9 round swatches at size 28 with a 2px ring when selected (ring color = swatch).</li>
          <li>Preferences: control-then-label flex row; Checkbox aligned with label baseline.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
