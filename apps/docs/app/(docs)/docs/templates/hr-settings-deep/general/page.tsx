"use client"

import * as React from "react"
import {
  RiGlobalLine,
  RiSunLine,
  RiMoonLine,
  RiEqualizerLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Button } from "@/registry/dash/ui/button"
import { Label } from "@/registry/dash/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { RadioGroup, RadioItem } from "@/registry/dash/ui/radio"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"
import {
  SettingsPagePreview,
  SectionTabRail,
  SectionCard,
  SectionTitle,
} from "../_shared"

const GENERAL_TABS = [
  { label: "Regional Preferences", icon: RiGlobalLine },
  { label: "Theme Options", icon: RiSunLine },
]

const LANGS = [
  { value: "en-US", flag: "US", label: "English (US)" },
  { value: "en-GB", flag: "GB", label: "English (UK)" },
  { value: "en-ES", flag: "ES", label: "Spanish (Spain)" },
  { value: "es-MX", flag: "MX", label: "Spanish (Mexico)" },
  { value: "fr-FR", flag: "FR", label: "French (France)" },
  { value: "de-DE", flag: "DE", label: "German" },
  { value: "zh-CN", flag: "CN", label: "Chinese (Simplified)" },
  { value: "ja-JP", flag: "JP", label: "Japanese" },
  { value: "ko-KR", flag: "KR", label: "Korean" },
] as const

const TIMEZONES: { value: string; label: string }[] = [
  { value: "GMT-12:00", label: "GMT-12:00 - International Date Line West" },
  { value: "GMT-11:00", label: "GMT-11:00 - Midway Island, Samoa" },
  { value: "GMT-10:00", label: "GMT-10:00 - Hawaii" },
  { value: "GMT-09:00", label: "GMT-09:00 - Alaska" },
  { value: "GMT-08:00", label: "GMT-08:00 - Pacific Time (US & Canada)" },
  { value: "GMT-07:00", label: "GMT-07:00 - Mountain Time (US & Canada)" },
  { value: "GMT-06:00", label: "GMT-06:00 - Central Time (US & Canada)" },
  { value: "GMT-05:00", label: "GMT-05:00 - Eastern Time (US & Canada)" },
  { value: "GMT-04:00", label: "GMT-04:00 - Atlantic Standard Time (AST)" },
  { value: "GMT-03:00", label: "GMT-03:00 - Buenos Aires" },
  { value: "GMT-02:00", label: "GMT-02:00 - Mid-Atlantic" },
  { value: "GMT-01:00", label: "GMT-01:00 - Azores" },
  { value: "GMT+00:00", label: "GMT+00:00 - London, Lisbon" },
]

function RegionalPreferencesPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Regional Preferences"
        description="Select your preferences for your region."
      />

      <Divider />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="gen-lang" required>
            Language
          </Label>
          <Select defaultValue="en-US">
            <SelectTrigger id="gen-lang">
              <SelectValue placeholder="Select a time format" />
            </SelectTrigger>
            <SelectContent>
              {LANGS.map(({ flag, label, value }) => (
                <SelectItem key={value} value={value}>
                  <span className="mr-1 inline-flex size-4 items-center justify-center rounded-sm bg-bg-weak-50 text-[9px] font-semibold text-text-sub-600">
                    {flag}
                  </span>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="gen-tz" required>
            Timezone
          </Label>
          <Select defaultValue="GMT-04:00">
            <SelectTrigger id="gen-tz">
              <SelectValue placeholder="Select a timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="gen-tf" hint="(Optional)">
            Time Format
          </Label>
          <Select defaultValue="24-hours">
            <SelectTrigger id="gen-tf">
              <SelectValue placeholder="Select a time format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12-hours">12 hours</SelectItem>
              <SelectItem value="24-hours">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="gen-df" hint="(Optional)">
            Date Format
          </Label>
          <Select defaultValue="DD/MM/YY">
            <SelectTrigger id="gen-df">
              <SelectValue placeholder="Select a date format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MM/DD/YY">MM/DD/YY</SelectItem>
              <SelectItem value="DD/MM/YY">DD/MM/YY</SelectItem>
              <SelectItem value="YY/MM/DD">YY/MM/DD</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
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

function ThemeCard({
  id,
  icon: Icon,
  title,
  desc,
  checked,
  onSelect,
}: {
  id: string
  icon: React.ElementType
  title: string
  desc: string
  checked: boolean
  onSelect: () => void
}) {
  return (
    <label
      htmlFor={`theme-${id}`}
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-start gap-3.5 rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 transition hover:bg-bg-weak-50 hover:ring-transparent",
        checked && "shadow-none ring-primary-base",
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
        <Icon className="size-5 text-text-sub-600" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        <div className="text-xs text-text-sub-600">{desc}</div>
      </div>
      <RadioItem id={`theme-${id}`} value={id} />
    </label>
  )
}

function ThemeOptionsPanel() {
  const [value, setValue] = React.useState("system")
  return (
    <SectionCard>
      <SectionTitle
        title="Theme Options"
        description="Pick theme to personalize experience."
      />

      <Divider />

      <RadioGroup
        value={value}
        onValueChange={setValue}
        className="flex flex-col gap-3"
      >
        <ThemeCard
          id="light"
          icon={RiSunLine}
          title="Light Mode"
          desc="Pick a clean and classic light theme."
          checked={value === "light"}
          onSelect={() => setValue("light")}
        />
        <ThemeCard
          id="dark"
          icon={RiMoonLine}
          title="Dark Mode"
          desc="Select a sleek and modern dark theme."
          checked={value === "dark"}
          onSelect={() => setValue("dark")}
        />
        <ThemeCard
          id="system"
          icon={RiEqualizerLine}
          title="System"
          desc="Adapts to your device's theme."
          checked={value === "system"}
          onSelect={() => setValue("system")}
        />
      </RadioGroup>

      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button tone="neutral" style="stroke">
          Discard
        </Button>
        <Button>Apply Changes</Button>
      </div>
    </SectionCard>
  )
}

function GeneralPreview({ tab }: { tab: string }) {
  return (
    <SettingsPagePreview active="general">
      <SectionTabRail tabs={GENERAL_TABS} current={tab} />
      {tab === "Regional Preferences" ? <RegionalPreferencesPanel /> : null}
      {tab === "Theme Options" ? <ThemeOptionsPanel /> : null}
    </SettingsPagePreview>
  )
}

export default function HrSettingsDeepGeneralPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Settings"
        title="General Settings"
        description="App-wide preferences. Two-panel rail: Regional Preferences (Language with country flag, Timezone, 12/24h Time Format, 4-option Date Format) and Theme Options (Light / Dark / System radio cards)."
      />

      <DocsSection title="Regional Preferences panel">
        <GeneralPreview tab="Regional Preferences" />
      </DocsSection>

      <DocsSection title="Theme Options panel">
        <GeneralPreview tab="Theme Options" />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            <strong>Language</strong> — 9 options. Each option renders a 16px
            flag chip (US/GB/ES/MX/FR/DE/CN/JP/KR) before the label.
          </li>
          <li>
            <strong>Timezone</strong> — 13 options from GMT-12 → GMT+00, default
            GMT-04:00.
          </li>
          <li>
            <strong>Time / Date Format</strong> — optional. Time = 12 hours / 24
            hours. Date = MM/DD/YY · DD/MM/YY · YY/MM/DD · YYYY-MM-DD.
          </li>
          <li>
            <strong>Theme cards</strong> — radio-bound, 12px radius card with
            48px circular icon (Sun / Moon / Equalizer), label + helper,
            16px RadioItem on the right. Selected state replaces the 1px
            soft-200 ring with primary-base.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
