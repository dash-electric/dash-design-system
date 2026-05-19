"use client"

import * as React from "react"
import { RiUserLine as User, RiPhoneLine as Phone, RiGlobalLine as Globe, RiFileDownloadLine as FileDown, RiSettings3Line as Settings, RiNotification3Line as Bell, RiLockLine as Lock, RiBuilding2Line as Building2, RiAddLine as Plus } from "@remixicon/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  SettingsSideNav,
} from "@/registry/dash/templates/hr-general-settings"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrIntegrationsSettings — ported 1:1 (structural parity) from AlignUI Pro Figma node 3895:91151.
 * Synergy HR Settings page with Integrations active panel:
 *   - 4 connected-app rows (Microsoft Office 365 / Zoom / Slack / Trello) with Manage button
 *   - Upcoming / Make a Suggestion sub-tabs
 *   - Add Integration CTA
 */

export type HrIntegrationsSettingsProps = {
  className?: string
}

const settingsNav = [
  { id: "profile", label: "Profile Settings", icon: User },
  { id: "contact", label: "Contact Information", icon: Phone },
  { id: "social", label: "Social Links", icon: Globe },
  { id: "export", label: "Export Data", icon: FileDown },
  { id: "general", label: "General Settings", icon: Settings },
  { id: "company", label: "Company Settings", icon: Building2 },
  { id: "notifications", label: "Notification Settings", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Lock },
]

const apps = [
  {
    id: "office365",
    name: "Microsoft Office 365",
    description: "Seamless collaboration and document management.",
    initials: "O",
    color: "bg-(--dash-blue-500)",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "For conducting virtual meetings and interviews.",
    initials: "Z",
    color: "bg-(--dash-blue-500)",
  },
  {
    id: "slack",
    name: "Slack",
    description: "For team communication and real-time collaboration.",
    initials: "S",
    color: "bg-(--dash-purple-500)",
  },
  {
    id: "trello",
    name: "Trello",
    description: "For task management and project collaboration.",
    initials: "T",
    color: "bg-(--dash-blue-500)",
  },
]

const subTabs = [
  { id: "connected", label: "Connected", active: true },
  { id: "upcoming", label: "Upcoming" },
  { id: "suggest", label: "Make a Suggestion" },
]

export function HrIntegrationsSettings({ className }: HrIntegrationsSettingsProps) {
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

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect and sync with essential tools and platforms.
              </CardDescription>
            </div>
            <Button tone="primary" style="filled" size="sm">
              <Plus className="size-3.5" /> Add Integration
            </Button>
          </CardHeader>

          {/* Sub-tabs */}
          <div
            role="tablist"
            aria-label="Integrations sections"
            className="px-6 flex items-center gap-1 border-b border-stroke-soft-200 -mt-2"
          >
            {subTabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={t.active}
                type="button"
                className={cn(
                  "relative px-3 py-3 text-sm transition-colors",
                  t.active
                    ? "text-text-strong-950 font-medium after:absolute after:left-3 after:right-3 after:bottom-0 after:h-0.5 after:bg-(--primary-base) after:rounded-full"
                    : "text-text-sub-600 hover:text-text-strong-950",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <CardContent className="divide-y divide-stroke-soft-200 pt-2">
            {apps.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-4 first:pt-2 last:pb-2">
                <span
                  className={cn(
                    "size-10 shrink-0 rounded-xl grid place-items-center text-text-white-0 font-semibold",
                    a.color,
                  )}
                  aria-hidden
                >
                  {a.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-strong-950">{a.name}</span>
                    <Badge appearance="lighter" status="success">Connected</Badge>
                  </div>
                  <div className="text-xs text-text-sub-600 mt-0.5">{a.description}</div>
                </div>
                <Button tone="neutral" style="stroke" size="sm">Manage</Button>
              </div>
            ))}
          </CardContent>

          <div className="px-6 py-4 border-t border-stroke-soft-200 text-xs text-text-sub-600">
            Don&apos;t see what you need?{" "}
            <LinkButton href="#" tone="primary" size="sm">
              Make a suggestion
            </LinkButton>
          </div>
        </Card>
      </div>
    </div>
  )
}
