"use client"

/**
 * Badge Examples — Profile Account dropdown.
 *
 * Figma parity: Badge [Examples] :: id 2950:5586.
 * Demonstrates Badge in a profile-account dropdown header (PRO badge),
 * combined with Switch for Dark Mode toggle and a logout destructive item.
 */

import * as React from "react"
import { RiSettings3Line as Settings, RiPlugLine as Plug, RiLogoutBoxLine as LogOut, RiMoonLine as Moon } from "@remixicon/react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/registry/dash/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Switch } from "@/registry/dash/ui/switch"

export type ProfileAccount = {
  name: string
  handle?: string
  email?: string
  plan?: "FREE" | "PRO" | "TEAM" | "ENTERPRISE"
  avatarSrc?: string
  initials?: string
}

const defaultAccount: ProfileAccount = {
  name: "Laura Perez",
  handle: "@weichen",
  email: "laura@alignui.com",
  plan: "PRO",
  initials: "LP",
}

const planStatus: Record<NonNullable<ProfileAccount["plan"]>, "success" | "feature" | "stable" | "neutral"> = {
  FREE: "neutral",
  PRO: "feature",
  TEAM: "stable",
  ENTERPRISE: "success",
}

export function BadgeProfileAccount({
  account = defaultAccount,
  trigger,
  onSettings,
  onIntegrations,
  onLogout,
  darkMode,
  onDarkModeChange,
}: {
  account?: ProfileAccount
  trigger?: React.ReactNode
  onSettings?: () => void
  onIntegrations?: () => void
  onLogout?: () => void
  darkMode?: boolean
  onDarkModeChange?: (next: boolean) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <button type="button" className="inline-flex items-center gap-2 rounded-lg p-1.5 hover:bg-bg-weak-50">
            <Avatar size="sm">
              {account.avatarSrc ? <AvatarImage src={account.avatarSrc} alt={account.name} /> : null}
              <AvatarFallback>{account.initials ?? account.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="text-label-small text-text-strong-950">{account.name}</span>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[260px]">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar size="md">
              {account.avatarSrc ? <AvatarImage src={account.avatarSrc} alt={account.name} /> : null}
              <AvatarFallback>{account.initials ?? account.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-label-small text-text-strong-950 truncate">{account.name}</span>
                {account.plan ? (
                  <Badge appearance="lighter" status={planStatus[account.plan]} size="sm">
                    {account.plan}
                  </Badge>
                ) : null}
              </div>
              {account.email ? (
                <div className="text-paragraph-x-small text-text-sub-600 truncate">{account.email}</div>
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSettings}>
          <Settings />
          Account Settings
          <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onIntegrations}>
          <Plug />
          Integrations
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="cursor-default"
        >
          <Moon />
          Dark Mode
          <Switch
            checked={!!darkMode}
            onCheckedChange={onDarkModeChange}
            className="ml-auto"
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} className="text-(--state-error-base)">
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
