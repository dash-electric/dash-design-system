"use client"

import * as React from "react"
import {
  RiLayoutGridLine,
  RiBankCardLine,
  RiArrowLeftRightLine,
  RiHistoryLine,
  RiBillLine,
  RiExchangeLine,
  RiSettings2Line,
  RiHeadphoneLine,
  RiArrowRightSLine,
  RiSearch2Line,
  RiNotification3Line,
  RiExpandUpDownLine,
  RiSendPlaneLine,
} from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Divider } from "@/registry/dash/ui/divider"
import { Kbd } from "@/registry/dash/ui/kbd"
import { Button } from "@/registry/dash/ui/button"

/* -------------------------------------------------------------------------- *
 *  Finance App Shell — shared sidebar + topbar used by `finance-*-deep`      *
 *  template docs. Mirrors `template-finance-master` 1:1 in structural        *
 *  parity:                                                                    *
 *    - 272px fixed sidebar w/ Apex CompanySwitch, Main nav, Favs,            *
 *      Others (Settings / Support), Arthur Taylor user card.                  *
 *    - Page header w/ icon + title + description + search/bell + actions.    *
 *                                                                            *
 *  Internal — not exported via registry. Used by 3 docs preview pages.        *
 * -------------------------------------------------------------------------- */

export type FinanceNavId =
  | "dashboard"
  | "my-cards"
  | "transfer"
  | "transactions"
  | "payments"
  | "exchange"

type NavLink = {
  id: FinanceNavId
  label: string
  icon: React.ElementType
  disabled?: boolean
}

const navLinks: NavLink[] = [
  { id: "dashboard", label: "Dashboard", icon: RiLayoutGridLine },
  { id: "my-cards", label: "My Cards", icon: RiBankCardLine },
  { id: "transfer", label: "Transfer", icon: RiArrowLeftRightLine },
  { id: "transactions", label: "Transactions", icon: RiHistoryLine },
  { id: "payments", label: "Payments", icon: RiBillLine, disabled: true },
  { id: "exchange", label: "Exchange", icon: RiExchangeLine, disabled: true },
]

const favs: Array<{ name: string; color: string; shortcut: string }> = [
  { name: "Loom Mobile App", color: "bg-(--dash-purple-500)", shortcut: "⌘1" },
  { name: "Monday Redesign", color: "bg-(--dash-red-500)", shortcut: "⌘2" },
  { name: "Udemy Courses", color: "bg-(--dash-pink-500)", shortcut: "⌘3" },
]

function CompanySwitch() {
  return (
    <div className="flex w-full items-center gap-3 rounded-lg p-2 ring-1 ring-inset ring-stroke-soft-200">
      <div className="grid size-10 shrink-0 place-items-center rounded-md bg-(--dash-purple-600) text-static-white text-sm font-semibold">
        A
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-strong-950">
          Apex
        </div>
        <div className="truncate text-xs text-text-sub-600">Finance & Banking</div>
      </div>
      <RiExpandUpDownLine className="size-5 shrink-0 text-text-soft-400" />
    </div>
  )
}

function UserButton() {
  return (
    <div className="flex w-full items-center gap-3 rounded-lg p-2 ring-1 ring-inset ring-stroke-soft-200">
      <Avatar size="lg" className="shrink-0 bg-(--dash-blue-100)">
        <AvatarFallback className="text-text-strong-950">AT</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-strong-950">
          Arthur Taylor
        </div>
        <div className="truncate text-xs text-text-sub-600">
          arthur@apex.com
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

export function FinanceSidebar({ active }: { active: FinanceNavId }) {
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

        {/* Others */}
        <div className="mt-auto space-y-2">
          <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
            Others
          </div>
          <div className="space-y-1">
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

export type FinanceHeaderProps = {
  icon: React.ReactNode
  title: string
  description: string
  actions?: React.ReactNode
  showSearch?: boolean
}

export function FinanceHeader({
  icon,
  title,
  description,
  actions,
  showSearch = true,
}: FinanceHeaderProps) {
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

/**
 * MoveMoneyButton — purple primary CTA from the source template's topbar.
 */
export function MoveMoneyButton() {
  return (
    <Button size="sm">
      <RiSendPlaneLine className="size-4" />
      Move Money
    </Button>
  )
}

export function FinanceAppShell({
  active,
  children,
  className,
}: {
  active: FinanceNavId
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
      <FinanceSidebar active={active} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

export { AvatarImage }
