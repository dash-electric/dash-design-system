"use client"

import * as React from "react"
import { RiDashboardLine as LayoutDashboard, RiTruckLine as Truck, RiTeamLine as Users, RiLifebuoyLine as LifeBuoy, RiSettings3Line as Settings, RiNotification3Line as Bell, RiSearchLine as Search } from "@remixicon/react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarTrigger,
  SidebarInset,
} from "@/registry/dash/ui/sidebar"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { cn } from "@/registry/dash/lib/utils"

type NavItem = {
  label: string
  icon: React.ReactNode
  active?: boolean
  href?: string
}

export type DashboardShellProps = {
  brand?: React.ReactNode
  groups?: Array<{ label?: string; items: NavItem[] }>
  user?: { name: string; email?: string; initials?: string }
  headerActions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const defaultGroups: NonNullable<DashboardShellProps["groups"]> = [
  {
    label: "Operasi",
    items: [
      { label: "Dashboard", icon: <LayoutDashboard />, active: true },
      { label: "Dispatch", icon: <Truck /> },
      { label: "Mitra", icon: <Users /> },
    ],
  },
  {
    label: "Support",
    items: [{ label: "Tickets", icon: <LifeBuoy /> }],
  },
]

/**
 * DashboardShell — Sidebar + topbar + content shell.
 * Composable: pass your own groups + headerActions + user + children.
 * Wraps everything in SidebarProvider so child slots can call useSidebar().
 */
export function DashboardShell({
  brand,
  groups = defaultGroups,
  user = { name: "Halo-dash Ops", email: "ops@dash.id", initials: "HO" },
  headerActions,
  children,
  className,
}: DashboardShellProps) {
  return (
    <SidebarProvider className={cn("h-screen w-full bg-bg-weak-50", className)}>
      <Sidebar>
        <SidebarHeader>{brand ?? <span className="font-semibold text-text-strong-950">Dash</span>}</SidebarHeader>
        <SidebarContent>
          {groups.map((g, gi) => (
            <SidebarGroup key={gi}>
              {g.label ? <SidebarGroupLabel>{g.label}</SidebarGroupLabel> : null}
              {g.items.map((item, ii) => (
                <SidebarItem key={ii} active={item.active}>
                  {item.icon}
                  {item.label}
                </SidebarItem>
              ))}
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarItem>
            <Settings />
            Settings
          </SidebarItem>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b border-stroke-soft-200 bg-bg-white-0 px-4">
          <SidebarTrigger />
          <InputRoot size="sm" className="max-w-sm flex-1">
            <InputIcon>
              <Search className="size-4" strokeWidth={1.75} />
            </InputIcon>
            <Input placeholder="Cari mitra, dispatch, tribe…" />
          </InputRoot>
          <div className="flex items-center gap-2 ml-auto">
            {headerActions}
            <IconButton aria-label="Notifications">
              <Bell />
            </IconButton>
            <Avatar size="sm">
              <AvatarFallback>{user.initials ?? user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
