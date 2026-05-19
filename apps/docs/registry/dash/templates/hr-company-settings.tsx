"use client"

import * as React from "react"
import { RiUserLine as User, RiPhoneLine as Phone, RiGlobalLine as Globe, RiFileDownloadLine as FileDown, RiSettings3Line as Settings, RiNotification3Line as Bell, RiLockLine as Lock, RiBuilding2Line as Building2, RiUploadLine as Upload } from "@remixicon/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Label } from "@/registry/dash/ui/label"
import { Divider } from "@/registry/dash/ui/divider"
import {
  SettingsSideNav,
  SettingsFooter,
} from "@/registry/dash/templates/hr-general-settings"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrCompanySettings — ported 1:1 (structural parity) from AlignUI Pro Figma node 3892:85576.
 * Synergy HR Settings page with Company active panel:
 *   - Upload logo
 *   - Company Name / Website URL
 *   - Slogan / Description (with char counter)
 */

export type HrCompanySettingsProps = {
  className?: string
}

const settingsNav = [
  { id: "profile", label: "Profile Settings", icon: User },
  { id: "contact", label: "Contact Information", icon: Phone },
  { id: "social", label: "Social Links", icon: Globe },
  { id: "export", label: "Export Data", icon: FileDown },
  { id: "general", label: "General Settings", icon: Settings },
  { id: "company", label: "Company Settings", icon: Building2, active: true },
  { id: "notifications", label: "Notification Settings", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Lock },
]

export function HrCompanySettings({ className }: HrCompanySettingsProps) {
  const [description, setDescription] = React.useState(
    "Synergy is a modern HR platform that helps growing teams hire, onboard, and grow happier humans.",
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

        <Card>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
            <CardDescription>
              Information about your organization shown across the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="flex items-start gap-5">
              <Avatar size="xl">
                <AvatarFallback>SH</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-strong-950">Upload Image</div>
                <div className="text-xs text-text-sub-600 mt-1">
                  Min 400x400px, PNG or JPEG
                </div>
                <Button tone="neutral" style="stroke" size="sm" className="mt-3">
                  <Upload className="size-3.5" /> Upload
                </Button>
              </div>
            </section>

            <Divider />

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-name">Company Name</Label>
                <InputRoot>
                  <Input id="company-name" defaultValue="Synergy HR" />
                </InputRoot>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website URL</Label>
                <InputRoot>
                  <span className="text-sm text-text-soft-400 select-none pr-1">https://</span>
                  <Input id="website" defaultValue="alignui.com" />
                </InputRoot>
              </div>
            </section>

            <section className="space-y-1.5">
              <Label htmlFor="slogan">Slogan / Catchphrase</Label>
              <InputRoot>
                <Input
                  id="slogan"
                  placeholder="e.g. Unlocking Potential, Inspiring Growth."
                />
              </InputRoot>
            </section>

            <section className="space-y-1.5">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={description}
                maxLength={200}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your company..."
                rows={4}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-sub-600">You can describe your company briefly.</span>
                <span className="text-text-soft-400">{description.length}/200</span>
              </div>
            </section>
          </CardContent>
          <SettingsFooter />
        </Card>
      </div>
    </div>
  )
}
