"use client"

import * as React from "react"
import { RiUserLine as User, RiPhoneLine as Phone, RiGlobalLine as Globe, RiFileDownloadLine as FileDown, RiSettings3Line as Settings, RiNotification3Line as Bell, RiLockLine as Lock, RiBuilding2Line as Building2, RiCheckLine as Check, RiCloseLine as XIcon } from "@remixicon/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/registry/dash/ui/card"
import { Label } from "@/registry/dash/ui/label"
import { PasswordInput } from "@/registry/dash/ui/password-input"
import {
  SettingsSideNav,
  SettingsFooter,
} from "@/registry/dash/templates/hr-general-settings"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrPrivacySecurity — ported 1:1 (structural parity) from AlignUI Pro Figma node 3893:89081.
 * Synergy HR Settings page with Privacy & Security active panel:
 *   - Change Password (current + new + confirm) with live rule checklist
 *   - 2FA / Active Sessions / Delete Account sub-headings (visual tabs, stub)
 */

export type HrPrivacySecurityProps = {
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
  { id: "privacy", label: "Privacy & Security", icon: Lock, active: true },
]

const subTabs = [
  { id: "change-password", label: "Change Password", active: true },
  { id: "2fa", label: "2FA Security" },
  { id: "sessions", label: "Active Sessions" },
  { id: "delete", label: "Delete Account" },
]

const passwordRules = [
  { id: "uppercase" as const, label: "At least 1 uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number" as const, label: "At least 1 number", test: (p: string) => /\d/.test(p) },
  { id: "chars" as const, label: "At least 8 characters", test: (p: string) => p.length >= 8 },
]

export function HrPrivacySecurity({ className }: HrPrivacySecurityProps) {
  const [current, setCurrent] = React.useState("")
  const [pwd, setPwd] = React.useState("")
  const [confirm, setConfirm] = React.useState("")

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
          <CardHeader>
            <CardTitle>Privacy &amp; Security</CardTitle>
            <CardDescription>Update password for enhanced account security.</CardDescription>
          </CardHeader>

          {/* Sub-tabs */}
          <div
            role="tablist"
            aria-label="Privacy sections"
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

          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current Password</Label>
              <PasswordInput
                id="current-password"
                placeholder="• • • • • • • • • •"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <PasswordInput
                id="new-password"
                placeholder="• • • • • • • • • •"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-text-sub-600">Must contain at least:</li>
                {passwordRules.map((r) => {
                  const met = r.test(pwd)
                  return (
                    <li
                      key={r.id}
                      className={cn(
                        "flex items-center gap-1.5 text-xs",
                        met ? "text-state-success-base" : "text-text-soft-400",
                      )}
                    >
                      {met ? <Check className="size-3" /> : <XIcon className="size-3" />}
                      {r.label}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <PasswordInput
                id="confirm-password"
                placeholder="• • • • • • • • • •"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {confirm && confirm !== pwd ? (
                <p className="text-xs text-error-base">Passwords do not match.</p>
              ) : null}
            </div>
          </CardContent>
          <SettingsFooter />
        </Card>
      </div>
    </div>
  )
}
