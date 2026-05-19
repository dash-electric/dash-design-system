"use client"

import * as React from "react"
import { RiUploadLine as Upload, RiUserLine as User, RiPhoneLine as Phone, RiGlobalLine as Globe, RiFileDownloadLine as FileDown, RiSettings3Line as Settings, RiNotification3Line as Bell, RiLockLine as Lock, RiBuilding2Line as Building2 } from "@remixicon/react"
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
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrProfileSettings — ported 1:1 (structural parity) from AlignUI Pro Figma node 3889:79333.
 * Synergy HR Profile Settings page. Layout:
 *   - Header
 *   - Vertical tab nav (Profile / Contact / Social / Export / General / Company / Notifications / Privacy)
 *   - Right panel = active tab content (default: Profile Settings — upload photo + name + title + bio)
 *   - Footer (Discard / Apply Changes)
 *
 * Tab state is stub-only (visual). Real impl would wire to @dash/tabs + form state.
 */

export type HrProfileSettingsProps = {
  userName?: string
  userEmail?: string
  activeTab?: string
  className?: string
}

const settingsNav = [
  { id: "profile", label: "Profile Settings", icon: User, active: true },
  { id: "contact", label: "Contact Information", icon: Phone },
  { id: "social", label: "Social Links", icon: Globe },
  { id: "export", label: "Export Data", icon: FileDown },
  { id: "general", label: "General Settings", icon: Settings },
  { id: "company", label: "Company Settings", icon: Building2 },
  { id: "notifications", label: "Notification Settings", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Lock },
]

export function HrProfileSettings({
  userName = "Sophia Williams",
  userEmail = "sophia@company.com",
  activeTab = "profile",
  className,
}: HrProfileSettingsProps) {
  const [bio, setBio] = React.useState(
    "Senior HR Assistant at Synergy. I help teams stay aligned through clear policy, fair process, and a bit of empathy.",
  )

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
        {/* Vertical tab nav */}
        <nav
          aria-label="Settings sections"
          className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-2 h-fit"
        >
          <ul className="space-y-0.5">
            {settingsNav.map((item) => {
              const Icon = item.icon
              const isActive = item.id === activeTab
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
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

        {/* Active panel — Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              This information will be displayed on your public profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo */}
            <section className="flex items-start gap-5">
              <Avatar size="xl">
                <AvatarFallback>
                  {userName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
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

            {/* Full Name */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullname">Full Name</Label>
                <InputRoot>
                  <Input id="fullname" defaultValue={userName} placeholder="e.g. Sophia Williams" />
                </InputRoot>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <InputRoot>
                  <Input id="email" defaultValue={userEmail} placeholder="you@company.com" />
                </InputRoot>
              </div>
            </section>

            {/* Title */}
            <section className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <InputRoot>
                <Input id="title" defaultValue="HR Assistant" placeholder="e.g. UI/UX Designer" />
              </InputRoot>
            </section>

            {/* Biography */}
            <section className="space-y-1.5">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                value={bio}
                maxLength={200}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe yourself..."
                rows={4}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-sub-600">It will be displayed on your profile.</span>
                <span className="text-text-soft-400">{bio.length}/200</span>
              </div>
            </section>
          </CardContent>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-stroke-soft-200">
            <Button tone="neutral" style="stroke">Discard</Button>
            <Button tone="primary" style="filled">Apply Changes</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
