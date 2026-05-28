"use client"

import * as React from "react"
import {
  RiLayoutGridLine,
  RiCalendarLine,
  RiTimerLine,
  RiFoldersLine,
  RiGroupLine,
  RiEqualizerLine,
  RiStarSmileLine,
  RiFileCloudLine,
  RiSettings2Line,
  RiHeadphoneLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiSearch2Line,
  RiNotification3Line,
  RiExpandUpDownLine,
} from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Divider } from "@/registry/dash/ui/divider"
import { Kbd } from "@/registry/dash/ui/kbd"

/* -------------------------------------------------------------------------- *
 *  HR App Shell — shared sidebar + topbar wrapper used by all HR template    *
 *  docs (dashboard, calendar, teams, integrations). Mirrors the Synergy HR  *
 *  source (`template-hr-master`) layout 1:1 in structural parity:           *
 *    - 272px fixed sidebar w/ Company Switch, Main nav, Favs, Settings      *
 *    - Top-of-page Header w/ avatar/icon + title + description + actions    *
 *    - Content area fills remaining width                                   *
 *                                                                            *
 *  Internal — not exported via registry. Used by 5 docs preview pages.       *
 * -------------------------------------------------------------------------- */

export type HrNavId =
  | "dashboard"
  | "calendar"
  | "time-off"
  | "projects"
  | "teams"
  | "integrations"
  | "benefits"
  | "documents"

type NavLink = {
  id: HrNavId
  label: string
  icon: React.ElementType
  disabled?: boolean
}

const navLinks: NavLink[] = [
  { id: "dashboard", label: "Dashboard", icon: RiLayoutGridLine },
  { id: "calendar", label: "Calendar", icon: RiCalendarLine },
  { id: "time-off", label: "Time Off", icon: RiTimerLine, disabled: true },
  { id: "projects", label: "Projects", icon: RiFoldersLine, disabled: true },
  { id: "teams", label: "Teams", icon: RiGroupLine },
  { id: "integrations", label: "Integrations", icon: RiEqualizerLine },
  { id: "benefits", label: "Benefits", icon: RiStarSmileLine, disabled: true },
  { id: "documents", label: "Documents", icon: RiFileCloudLine, disabled: true },
]

const favs: Array<{ name: string; color: string; shortcut: string }> = [
  { name: "Loom Mobile App", color: "bg-(--dash-purple-500)", shortcut: "⌘1" },
  { name: "Monday Redesign", color: "bg-(--dash-red-500)", shortcut: "⌘2" },
  { name: "Udemy Courses", color: "bg-(--dash-pink-500)", shortcut: "⌘3" },
]

function CompanySwitch() {
  return (
    <div className="flex w-full items-center gap-3 rounded-lg p-2 ring-1 ring-inset ring-stroke-soft-200">
      <div className="grid size-10 shrink-0 place-items-center rounded-md bg-bg-strong-950 text-static-white text-sm font-semibold">
        S
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-strong-950">
          Synergy HR
        </div>
        <div className="truncate text-xs text-text-sub-600">Pro Plan</div>
      </div>
      <RiExpandUpDownLine className="size-5 shrink-0 text-text-soft-400" />
    </div>
  )
}

function UserButton() {
  return (
    <div className="flex w-full items-center gap-3 rounded-lg p-2 ring-1 ring-inset ring-stroke-soft-200">
      <Avatar size="lg" className="bg-(--dash-yellow-100) shrink-0">
        <AvatarFallback className="text-text-strong-950">SW</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-strong-950">
          Sophia Williams
        </div>
        <div className="truncate text-xs text-text-sub-600">
          sophia@alignui.com
        </div>
      </div>
      <RiArrowRightSLine className="size-5 shrink-0 text-text-soft-400" />
    </div>
  )
}

function NavItem({
  link,
  active,
}: {
  link: NavLink
  active: boolean
}) {
  const Icon = link.icon
  return (
    <div
      aria-current={active ? "page" : undefined}
      aria-disabled={link.disabled || undefined}
      className={cn(
        "group relative flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-text-sub-600 transition-colors hover:bg-bg-weak-50",
        active && "bg-bg-weak-50",
        link.disabled && "pointer-events-none opacity-50",
      )}
    >
      <div
        className={cn(
          "absolute -left-5 top-1/2 h-5 w-1 origin-left -translate-y-1/2 rounded-r-full bg-primary transition-transform",
          active ? "scale-100" : "scale-0",
        )}
      />
      <Icon
        className={cn(
          "size-5 shrink-0",
          active && "text-primary",
        )}
      />
      <span className="flex-1">{link.label}</span>
      {active ? (
        <RiArrowRightSLine className="size-5 text-text-sub-600" />
      ) : null}
    </div>
  )
}

export function HrSidebar({ active }: { active: HrNavId }) {
  return (
    <aside className="hidden h-full w-[272px] shrink-0 flex-col overflow-hidden border-r border-stroke-soft-200 bg-bg-white-0 lg:flex">
      <div className="p-3">
        <CompanySwitch />
      </div>
      <div className="px-6">
        <Divider />
      </div>
      <div className="flex flex-1 flex-col gap-6 px-6 pb-4 pt-6">
        {/* Main */}
        <div className="space-y-2">
          <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
            Main
          </div>
          <div className="space-y-1">
            {navLinks.map((link) => (
              <NavItem
                key={link.id}
                link={link}
                active={link.id === active}
              />
            ))}
          </div>
        </div>

        {/* Favs */}
        <div className="space-y-2">
          <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
            Favs
          </div>
          <div className="space-y-1">
            {favs.map((fav) => (
              <div
                key={fav.name}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-sub-600 hover:bg-bg-weak-50"
              >
                <div className="flex size-5 shrink-0 items-center justify-center">
                  <div className="size-3 rounded-full ring-2 ring-bg-white-0 shadow-sm">
                    <div className={cn("size-2 rounded-full", fav.color)} />
                  </div>
                </div>
                <span className="flex-1 truncate">{fav.name}</span>
                <Kbd className="text-[10px]">{fav.shortcut}</Kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Settings / Support */}
        <div className="mt-auto space-y-1.5">
          <div className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-sub-600 hover:bg-bg-weak-50">
            <RiSettings2Line className="size-5 shrink-0" />
            <span className="flex-1">Settings</span>
          </div>
          <div className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-sub-600 opacity-50">
            <RiHeadphoneLine className="size-5 shrink-0" />
            <span className="flex-1">Support</span>
          </div>
        </div>
      </div>
      <div className="px-6">
        <Divider />
      </div>
      <div className="p-3">
        <UserButton />
      </div>
    </aside>
  )
}

export type HrHeaderProps = {
  icon: React.ReactNode
  title: string
  description: string
  actions?: React.ReactNode
  showSearch?: boolean
}

export function HrHeader({
  icon,
  title,
  description,
  actions,
  showSearch = true,
}: HrHeaderProps) {
  return (
    <header className="flex min-h-[88px] flex-col gap-4 px-8 py-6 md:flex-row md:items-center md:justify-between md:gap-3">
      <div className="flex flex-1 items-center gap-3.5">
        {icon}
        <div className="space-y-1">
          <div className="text-base font-medium text-text-strong-950">
            {title}
          </div>
          <div className="text-sm text-text-sub-600">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {showSearch ? (
          <button
            type="button"
            className="hidden h-9 items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-sm text-text-soft-400 shadow-sm lg:flex"
          >
            <RiSearch2Line className="size-4" />
            <span>Search…</span>
            <Kbd className="ml-2 text-[10px]">⌘K</Kbd>
          </button>
        ) : null}
        <button
          type="button"
          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-sm lg:flex"
          aria-label="Notifications"
        >
          <RiNotification3Line className="size-5" />
        </button>
        {actions}
      </div>
    </header>
  )
}

export function HrAppShell({
  active,
  children,
  className,
}: {
  active: HrNavId
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-[820px] w-full bg-bg-white-0",
        className,
      )}
    >
      <HrSidebar active={active} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

export { RiArrowDownSLine, RiSearch2Line }
