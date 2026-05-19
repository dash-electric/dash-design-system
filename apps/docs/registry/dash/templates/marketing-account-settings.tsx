"use client"

import * as React from "react"
import { RiUserLine as User, RiNotification3Line as Bell, RiGlobalLine as Globe, RiShieldLine as Shield, RiPlugLine as Plug, RiPaletteLine as Palette, RiStore2Line as Store, RiBox3Line as Package, RiBankCardLine as CreditCard, RiTruckLine as Truck, RiUploadLine as Upload } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Field, FieldGroup, FieldDescription } from "@/registry/dash/ui/field"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type SettingsSection = {
  group: "Personal Settings" | "General Settings"
  items: Array<{
    id: string
    label: string
    icon: React.ElementType
  }>
}

export type MarketingAccountSettingsProps = {
  userName?: string
  userEmail?: string
  userPhone?: string
  activeItemId?: string
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

const sections: SettingsSection[] = [
  {
    group: "Personal Settings",
    items: [
      { id: "profile",      label: "Profile",            icon: User },
      { id: "notifications", label: "Notifications",     icon: Bell },
      { id: "language",     label: "Language & Region",  icon: Globe },
      { id: "security",     label: "Privacy & Security", icon: Shield },
      { id: "integrations", label: "Integrations",       icon: Plug },
      { id: "appearance",   label: "Appearance",         icon: Palette },
    ],
  },
  {
    group: "General Settings",
    items: [
      { id: "store",        label: "Store Settings",     icon: Store },
      { id: "products",     label: "Products Settings",  icon: Package },
      { id: "billing",      label: "Payment & Billing",  icon: CreditCard },
      { id: "shipping",     label: "Shipping & Delivery", icon: Truck },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * MarketingAccountSettings — Catalyst-style Settings page ported from AlignUI Pro Figma.
 * Two-column layout: left settings nav (grouped: Personal / General) +
 * right scrolling form (profile photo, name, email, phone).
 *
 * Source: Figma node `164842:5776` ("Account Settings [Marketing & Sales]").
 */
export function MarketingAccountSettings({
  userName = "James Brown",
  userEmail = "james@alignui.com",
  userPhone = "+1 (012) 345-6789",
  activeItemId = "profile",
  className,
}: MarketingAccountSettingsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
          <p className="text-sm text-text-sub-600">Manage and collaborate on your account settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button tone="neutral" style="stroke" size="sm">Discard</Button>
          <Button tone="primary" style="filled" size="sm">Save Changes</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar nav */}
        <aside className="space-y-6">
          {sections.map((section) => (
            <nav key={section.group} aria-label={section.group}>
              <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-text-soft-400 mb-1">
                {section.group}
              </h2>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = item.id === activeItemId
                  return (
                    <li key={item.id}>
                      <button
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                          active
                            ? "bg-(--dash-purple-50) text-(--dash-purple-700) font-medium"
                            : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950",
                        )}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          ))}
        </aside>

        {/* Form */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <FieldGroup>
              <Field>
                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-start">
                  <div>
                    <Label>Profile Photo</Label>
                    <FieldDescription>Min 400x400px, PNG or JPEG formats.</FieldDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar size="xl">
                      <AvatarFallback>
                        {userName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button tone="neutral" style="stroke" size="sm">
                      <Upload className="size-3.5" /> Change
                    </Button>
                  </div>
                </div>
              </Field>

              <Divider />

              <Field>
                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-start">
                  <div>
                    <Label>Full Name</Label>
                    <FieldDescription>Your name will be visible to your contacts.</FieldDescription>
                  </div>
                  <InputRoot>
                    <Input defaultValue={userName} />
                  </InputRoot>
                </div>
              </Field>

              <Divider />

              <Field>
                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-start">
                  <div>
                    <Label>Email Address</Label>
                    <FieldDescription>Business email address recommended.</FieldDescription>
                  </div>
                  <InputRoot>
                    <Input type="email" defaultValue={userEmail} />
                  </InputRoot>
                </div>
              </Field>

              <Divider />

              <Field>
                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-start">
                  <div>
                    <Label>Phone Number</Label>
                    <FieldDescription>Business phone number recommended.</FieldDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <InputRoot className="flex-1">
                      <Input type="tel" defaultValue={userPhone} />
                    </InputRoot>
                    <Button tone="neutral" style="ghost" size="sm">Cancel</Button>
                    <Button tone="primary" style="filled" size="sm">Save</Button>
                  </div>
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
