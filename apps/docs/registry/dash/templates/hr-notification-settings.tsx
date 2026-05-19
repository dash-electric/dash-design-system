"use client"

import * as React from "react"
import { RiUserLine as User, RiPhoneLine as Phone, RiGlobalLine as Globe, RiFileDownloadLine as FileDown, RiSettings3Line as Settings, RiNotification3Line as Bell, RiLockLine as Lock, RiBuilding2Line as Building2, RiSparkling2Line as Sparkles } from "@remixicon/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/registry/dash/ui/card"
import { Switch } from "@/registry/dash/ui/switch"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  SettingsSideNav,
  SettingsFooter,
} from "@/registry/dash/templates/hr-general-settings"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrNotificationSettings — ported 1:1 (structural parity) from AlignUI Pro Figma node 3892:87292.
 * Synergy HR Settings page with Notification active panel:
 *   - 3 preference rows (News and Updates / Reminders / Promotions)
 *   - Each row = title + description + switch + Learn more link
 *   - Upgrade promo block at bottom
 */

export type HrNotificationSettingsProps = {
  className?: string
}

const settingsNav = [
  { id: "profile", label: "Profile Settings", icon: User },
  { id: "contact", label: "Contact Information", icon: Phone },
  { id: "social", label: "Social Links", icon: Globe },
  { id: "export", label: "Export Data", icon: FileDown },
  { id: "general", label: "General Settings", icon: Settings },
  { id: "company", label: "Company Settings", icon: Building2 },
  { id: "notifications", label: "Notification Settings", icon: Bell, active: true },
  { id: "privacy", label: "Privacy & Security", icon: Lock },
]

const preferences = [
  {
    id: "news",
    title: "News and Updates",
    description: "Stay informed about the latest news, updates, and announcements.",
    defaultOn: true,
  },
  {
    id: "reminders",
    title: "Reminders and Events",
    description: "Get reminders for upcoming events, deadlines, and appointments.",
    defaultOn: true,
  },
  {
    id: "promotions",
    title: "Promotions and Offers",
    description: "Receive notifications about special promotions, discounts, and exclusive offers.",
    defaultOn: false,
  },
]

export function HrNotificationSettings({ className }: HrNotificationSettingsProps) {
  const [state, setState] = React.useState<Record<string, boolean>>(
    Object.fromEntries(preferences.map((p) => [p.id, p.defaultOn])),
  )

  return (
    <div className={cn("space-y-6", className)}>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
          Settings Page
        </h1>
        <p className="text-sm text-text-sub-600 mt-1">
          Manage your preferences and configure various options.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <SettingsSideNav items={settingsNav} />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-stroke-soft-200">
              {preferences.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-strong-950">{p.title}</div>
                    <div className="text-xs text-text-sub-600 mt-0.5">{p.description}</div>
                    <LinkButton href="#" tone="primary" size="sm" className="mt-1">
                      Learn more
                    </LinkButton>
                  </div>
                  <Switch
                    checked={state[p.id]}
                    onCheckedChange={(c) =>
                      setState((s) => ({ ...s, [p.id]: c === true }))
                    }
                    aria-label={p.title}
                  />
                </div>
              ))}
            </CardContent>
            <SettingsFooter />
          </Card>

          {/* Upgrade promo */}
          <Card className="bg-(--dash-purple-50) border-(--primary-alpha-16)">
            <CardContent className="flex items-start gap-4 py-5">
              <span className="size-10 rounded-full bg-(--primary-base) text-text-white-0 grid place-items-center shrink-0">
                <Sparkles className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-strong-950">
                  Maximize your app usage by leaving notification settings active.
                </div>
                <div className="text-xs text-text-sub-600 mt-1">
                  Upgrade to Pro for advanced delivery rules and quiet hours.
                </div>
              </div>
              <Button tone="primary" style="filled" size="sm">Upgrade</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
