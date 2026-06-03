"use client"

import * as React from "react"
import {
  RiBox3Line,
  RiStore3Line,
  RiBillLine,
  RiEqualizerLine,
  RiTeamLine,
  RiSettings3Line,
  RiShieldKeyholeLine,
  RiSearchLine,
  RiNotification3Line,
  RiTranslate2,
  RiSidebarUnfoldLine,
  RiMegaphoneLine,
  RiCloseLine,
  RiArrowRightUpLine,
  RiCircleFill,
} from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Divider } from "@/registry/dash/ui/divider"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { IconButton } from "@/registry/dash/ui/icon-button"

/**
 * Shared shell helpers for Dash Next Portal template docs pages.
 * Internal to /app/(docs)/docs/templates/ — not part of the public Dash registry.
 * Ported from next-portal-v2-web (sidebar/sidebar.tsx + header/DashboardHeader.tsx
 * + banner/AnnouncementBar.tsx).
 */

export const PORTAL_NAV: Array<{
  icon: React.ElementType
  label: string
  href: string
}> = [
  { icon: RiBox3Line, label: "Delivery", href: "/deliveries" },
  { icon: RiStore3Line, label: "Address", href: "/addresses" },
  { icon: RiStore3Line, label: "Outlets", href: "/outlets" },
  { icon: RiTeamLine, label: "Users", href: "/users" },
  { icon: RiShieldKeyholeLine, label: "Policies", href: "/policies" },
  { icon: RiBillLine, label: "Billing", href: "/billing" },
  { icon: RiEqualizerLine, label: "Developers", href: "/developer" },
  { icon: RiSettings3Line, label: "Setting", href: "/setting" },
]

export function PortalAnnouncementBar() {
  const text = "Sandbox mode enabled — deliveries created here will not be dispatched to real drivers."
  return (
    <div className="flex h-10 w-full items-center overflow-hidden bg-(--state-information-base) text-static-white">
      <div className="flex shrink-0 items-center gap-2 pl-4 pr-3">
        <RiMegaphoneLine className="size-4 shrink-0" />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="px-12 text-sm font-medium">
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PortalSidebar({ active }: { active: string }) {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-stroke-soft-200 bg-bg-white-0">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-text-strong-950 text-static-white text-xs font-bold">
            D
          </div>
          <span className="text-base font-semibold tracking-tight text-text-strong-950">
            Dash Portal
          </span>
        </div>
        <button className="flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 bg-bg-white-0 shadow-xs">
          <RiSidebarUnfoldLine className="size-4 text-text-sub-600" />
        </button>
      </div>

      <Divider />

      <div className="px-3 pt-3">
        <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-text-soft-400">
          Main
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {PORTAL_NAV.map((item) => {
          const Icon = item.icon
          const isActive = item.href === active
          return (
            <button
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-bg-weak-50 text-text-strong-950 font-medium"
                  : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <Divider />

      <div className="flex items-center gap-3 p-4">
        <Avatar size="lg">
          <AvatarFallback>SP</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-medium text-text-strong-950">
            Sigit Permana
          </p>
          <p className="truncate text-xs text-text-sub-600">sigit@dash.id</p>
        </div>
      </div>
    </aside>
  )
}

export function PortalHeader({
  title,
  subtitle,
  actions,
  sandbox,
}: {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  sandbox?: boolean
}) {
  return (
    <div className="sticky top-0 z-10 bg-bg-white-0">
      <div className="flex h-[72px] w-full items-center justify-between px-8 py-6">
        <div className="flex flex-col gap-1">
          {title ? (
            <p className="text-lg font-medium text-text-strong-950">{title}</p>
          ) : null}
          {subtitle ? (
            <p className="text-sm text-text-sub-600">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {sandbox ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-(--state-warning-lighter) px-2.5 py-1 text-xs font-medium text-(--state-warning-base)">
              <RiCircleFill className="size-2" />
              Sandbox
            </span>
          ) : null}
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-text-sub-600 hover:bg-bg-weak-50">
            <RiTranslate2 className="size-4" />
            EN
          </button>
          <IconButton tone="neutral" style="ghost" size="sm" aria-label="Notifications">
            <RiNotification3Line />
          </IconButton>
          {actions}
        </div>
      </div>
      <Divider />
    </div>
  )
}

export function PortalShell({
  active,
  children,
  withAnnouncementBar,
}: {
  active: string
  children: React.ReactNode
  withAnnouncementBar?: boolean
}) {
  return (
    <div className="flex h-[860px] w-full flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0">
      {withAnnouncementBar ? <PortalAnnouncementBar /> : null}
      <div className="flex flex-1 overflow-hidden">
        <PortalSidebar active={active} />
        <main className="flex-1 overflow-y-auto bg-bg-white-0">{children}</main>
      </div>
    </div>
  )
}

/**
 * Page-level information banner — recreated from policies/page.tsx (lines 235-272).
 * Light-gray panel with title + description + "Learn more" link.
 */
export function PortalInformationBanner({
  title,
  description,
  ctaLabel = "Learn more",
  onDismiss,
}: {
  title: React.ReactNode
  description: React.ReactNode
  ctaLabel?: string
  onDismiss?: () => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-bg-weak-50 p-6">
      <div className="flex flex-col gap-1">
        <div className="flex w-full items-start justify-between gap-3">
          <p className="text-xl font-semibold text-text-strong-950">{title}</p>
          {onDismiss ? (
            <IconButton
              tone="neutral"
              style="ghost"
              size="xs"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <RiCloseLine />
            </IconButton>
          ) : null}
        </div>
        <p className="text-sm text-text-sub-600">{description}</p>
      </div>
      <div className="flex gap-3">
        <Button tone="neutral" style="stroke" size="sm">
          {ctaLabel}
          <RiArrowRightUpLine className="size-4" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Inline search + filter row used by Outlets / Users tables.
 * Replica of OutletFilter.tsx desktop branch (lines 80-92).
 */
export function PortalSearchRow({ placeholder = "Search" }: { placeholder?: string }) {
  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:gap-3">
      <div className="hidden gap-3 lg:flex">
        <div className="w-[300px] whitespace-nowrap">
          <InputRoot size="sm">
            <InputIcon>
              <RiSearchLine className="size-4" />
            </InputIcon>
            <Input placeholder={placeholder} />
          </InputRoot>
        </div>
      </div>
    </div>
  )
}
