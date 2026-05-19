"use client"

import * as React from "react"
import { RiUserLine as User, RiBuilding2Line as Building2, RiNotification3Line as Bell, RiTeamLine as Users, RiShieldCheckLine as ShieldCheck, RiPlugLine as Plug, RiEarthLine as Globe2 } from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { Button } from "@/registry/dash/ui/button"
import { Divider } from "@/registry/dash/ui/divider"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"

/**
 * Internal shell shared by all Finance settings sub-flow templates
 * (profile / company / notifications / team / privacy / integrations / localization).
 *
 * Structure mirrors AlignUI Pro "Settings — Apex" Figma frames:
 *  - Left rail: vertical tab nav (7 categories).
 *  - Right column: page header (title + subtitle + period select + Schedule/Export) + slotted content.
 */

export type FinanceSettingsTab =
  | "profile"
  | "company"
  | "notifications"
  | "team"
  | "privacy"
  | "integrations"
  | "localization"

const tabs: { id: FinanceSettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "company", label: "Company", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "team", label: "Team", icon: Users },
  { id: "privacy", label: "Privacy & Security", icon: ShieldCheck },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "localization", label: "Localization", icon: Globe2 },
]

export type FinanceSettingsShellProps = {
  activeTab: FinanceSettingsTab
  title: string
  subtitle: string
  children: React.ReactNode
  className?: string
}

export function FinanceSettingsShell({
  activeTab,
  title,
  subtitle,
  children,
  className,
}: FinanceSettingsShellProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Left rail */}
        <aside className="h-fit">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-text-strong-950">
              Settings
            </h2>
            <p className="text-sm text-text-sub-600">Choose between categories.</p>
          </div>
          <Divider className="mb-3" />
          <nav aria-label="Settings sections">
            <ul className="space-y-0.5">
              {tabs.map((t) => {
                const Icon = t.icon
                const active = t.id === activeTab
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                        active
                          ? "bg-bg-weak-50 text-text-strong-950 font-medium"
                          : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{t.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Right column */}
        <div className="flex flex-col gap-6 min-w-0">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
                {title}
              </h1>
              <p className="text-sm text-text-sub-600">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select defaultValue="last-month">
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-week">Last week</SelectItem>
                  <SelectItem value="last-month">Last month</SelectItem>
                  <SelectItem value="last-quarter">Last quarter</SelectItem>
                </SelectContent>
              </Select>
              <Button style="stroke" tone="neutral" size="md">
                Schedule
              </Button>
              <Button size="md">Export</Button>
            </div>
          </header>

          <Divider />

          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * SettingsFieldRow — repeated row pattern across Profile/Company/Localization:
 *   left = label + sublabel + description
 *   right = value display + Edit link OR custom controls
 */
export type SettingsFieldRowProps = {
  label: React.ReactNode
  description?: React.ReactNode
  badge?: React.ReactNode
  /** Right-side slot (value display + edit link, or any input). */
  children: React.ReactNode
  className?: string
}

export function SettingsFieldRow({
  label,
  description,
  badge,
  children,
  className,
}: SettingsFieldRowProps) {
  return (
    <div className={cn("flex flex-col gap-3 py-5 lg:flex-row lg:gap-8", className)}>
      <div className="lg:w-[420px] lg:shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-strong-950">{label}</h3>
          {badge}
        </div>
        {description ? (
          <p className="mt-1 text-xs text-text-sub-600">{description}</p>
        ) : null}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
