"use client"

import * as React from "react"
import { RiUserLine as User, RiPhoneLine as Phone, RiGlobalLine as Globe, RiFileDownloadLine as FileDown, RiSettings3Line as Settings, RiNotification3Line as Bell, RiLockLine as Lock, RiBuilding2Line as Building2, RiSunLine as Sun, RiMoonLine as Moon, RiComputerLine as Monitor } from "@remixicon/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Label } from "@/registry/dash/ui/label"
import { Divider } from "@/registry/dash/ui/divider"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrGeneralSettings — ported 1:1 (structural parity) from AlignUI Pro Figma node 3880:69995.
 * Synergy HR Settings page with vertical tab nav + General active panel:
 *   - Regional Preferences (Language / Timezone / Time Format / Date Format)
 *   - Theme Options (Light / Dark / System)
 *
 * Stand-alone — assumes parent app shell provides sidebar + header.
 * For full-page port including sidebar, compose with `dashboard-shell`.
 */

export type HrGeneralSettingsProps = {
  className?: string
}

const settingsNav = [
  { id: "profile", label: "Profile Settings", icon: User },
  { id: "contact", label: "Contact Information", icon: Phone },
  { id: "social", label: "Social Links", icon: Globe },
  { id: "export", label: "Export Data", icon: FileDown },
  { id: "general", label: "General Settings", icon: Settings, active: true },
  { id: "company", label: "Company Settings", icon: Building2 },
  { id: "notifications", label: "Notification Settings", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Lock },
]

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
]

export function HrGeneralSettings({ className }: HrGeneralSettingsProps) {
  const [theme, setTheme] = React.useState("light")
  const [language, setLanguage] = React.useState("en-US")
  const [timezone, setTimezone] = React.useState("AST")
  const [timeFormat, setTimeFormat] = React.useState("24h")
  const [dateFormat, setDateFormat] = React.useState("DD/MM/YY")

  return (
    <div className={cn("space-y-6", className)}>
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Settings Page
          </h1>
          <p className="text-sm text-text-sub-600 mt-1">
            Manage your preferences and configure various options.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <SettingsSideNav items={settingsNav} />

        <div className="space-y-6">
          {/* Regional Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Preferences</CardTitle>
              <CardDescription>Select your preferences for your region.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AST">GMT-4:00 — Atlantic (AST)</SelectItem>
                      <SelectItem value="EST">GMT-5:00 — Eastern (EST)</SelectItem>
                      <SelectItem value="PST">GMT-8:00 — Pacific (PST)</SelectItem>
                      <SelectItem value="UTC">GMT+0:00 — UTC</SelectItem>
                      <SelectItem value="CET">GMT+1:00 — Central Europe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select value={timeFormat} onValueChange={setTimeFormat}>
                    <SelectTrigger id="time-format" className="w-full">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="12h">12 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="date-format" className="w-full">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YY">DD/MM/YY</SelectItem>
                      <SelectItem value="MM/DD/YY">MM/DD/YY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <SettingsFooter />
          </Card>

          {/* Theme Options */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Options</CardTitle>
              <CardDescription>Pick a theme for your workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3">
                {themes.map((t) => {
                  const Icon = t.icon
                  const selected = theme === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border bg-bg-white-0 px-4 py-5 text-center transition-colors",
                        selected
                          ? "border-(--primary-base) ring-2 ring-(--primary-alpha-16)"
                          : "border-stroke-soft-200 hover:border-stroke-sub-300",
                      )}
                    >
                      <Icon className="size-5 text-icon-sub-600" />
                      <span className="text-sm font-medium text-text-strong-950">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
            <SettingsFooter />
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
 * Shared settings sub-shells
 * ============================================================ */

export function SettingsSideNav({
  items,
}: {
  items: Array<{
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    active?: boolean
  }>
}) {
  return (
    <nav
      aria-label="Settings sections"
      className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-2 h-fit"
    >
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  item.active
                    ? "bg-bg-weak-50 text-text-strong-950 font-medium"
                    : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function SettingsFooter() {
  return (
    <>
      <Divider />
      <div className="flex items-center justify-end gap-2 px-6 py-4">
        <Button tone="neutral" style="stroke">Discard</Button>
        <Button tone="primary" style="filled">Apply Changes</Button>
      </div>
    </>
  )
}
