"use client"

import * as React from "react"
import { RiUserLine as User, RiShieldUserLine as ShieldUser, RiEqualizerLine as Sliders, RiPaletteLine as Palette, RiStore2Line as Store, RiShoppingBag3Line as ShoppingBag, RiBankCardLine as CreditCard, RiTruckLine as Truck } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { cn } from "@/registry/dash/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Shared shell for Marketing & Sales modal-style settings panels.           */
/*  Internal — not exported via registry. Used by 7 Tier-2 settings templates */
/* -------------------------------------------------------------------------- */

export type SettingsNavId =
  | "account"
  | "privacy"
  | "integrations"
  | "appearance"
  | "store"
  | "products"
  | "billing"
  | "shipping"

const personal: Array<{ id: SettingsNavId; label: string; icon: React.ElementType }> = [
  { id: "account",      label: "Account Settings",  icon: User },
  { id: "privacy",      label: "Privacy & Security", icon: ShieldUser },
  { id: "integrations", label: "Integrations",       icon: Sliders },
  { id: "appearance",   label: "Appearance",         icon: Palette },
]

const general: Array<{ id: SettingsNavId; label: string; icon: React.ElementType }> = [
  { id: "store",    label: "Store Settings",      icon: Store },
  { id: "products", label: "Products Settings",   icon: ShoppingBag },
  { id: "billing",  label: "Payment & Billing",   icon: CreditCard },
  { id: "shipping", label: "Shipping & Delivery", icon: Truck },
]

export type MarketingSettingsShellProps = {
  activeId: SettingsNavId
  title: string
  description: string
  tabs?: string[]
  activeTabIndex?: number
  children: React.ReactNode
  className?: string
}

export function MarketingSettingsShell({
  activeId,
  title,
  description,
  tabs,
  activeTabIndex = 0,
  children,
  className,
}: MarketingSettingsShellProps) {
  return (
    <div
      className={cn(
        "min-h-[760px] w-full bg-[#333333]/24 p-6 flex items-center justify-center",
        className,
      )}
    >
      <div className="bg-bg-white-0 rounded-2xl shadow-custom-lg overflow-hidden w-full max-w-[980px] h-[680px] grid grid-cols-[256px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-stroke-soft-200 p-4 space-y-6 overflow-y-auto">
          <NavGroup heading="Personal Settings" items={personal} activeId={activeId} />
          <div className="border-t border-stroke-soft-200" />
          <NavGroup heading="General Settings" items={general} activeId={activeId} />
        </aside>

        {/* Content */}
        <div className="flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-stroke-soft-200">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-text-strong-950">{title}</h2>
              <p className="text-sm text-text-sub-600">{description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button tone="neutral" style="stroke" size="sm">Discard</Button>
              <Button tone="primary" style="filled" size="sm">Save Changes</Button>
            </div>
          </header>

          {/* Tabs */}
          {tabs && tabs.length > 0 && (
            <nav className="flex items-center gap-6 px-6 border-b border-stroke-soft-200" aria-label={`${title} tabs`}>
              {tabs.map((label, i) => {
                const active = i === activeTabIndex
                return (
                  <button
                    key={label}
                    className={cn(
                      "py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                      active
                        ? "border-(--dash-purple-700) text-text-strong-950"
                        : "border-transparent text-text-sub-600 hover:text-text-strong-950",
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </nav>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

function NavGroup({
  heading,
  items,
  activeId,
}: {
  heading: string
  items: Array<{ id: SettingsNavId; label: string; icon: React.ElementType }>
  activeId: SettingsNavId
}) {
  return (
    <nav aria-label={heading}>
      <div className="px-2 text-xs font-semibold uppercase tracking-wider text-text-soft-400 mb-2">
        {heading}
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon
          const active = item.id === activeId
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
                <Icon className="size-5 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/*  Settings Row helper                                                       */
/* -------------------------------------------------------------------------- */

export function SettingsRow({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4 items-center py-3",
        className,
      )}
    >
      <div>
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        {description ? (
          <div className="text-xs text-text-sub-600 mt-0.5">{description}</div>
        ) : null}
      </div>
      {children ? <div className="md:justify-self-end w-full md:w-auto">{children}</div> : null}
    </div>
  )
}

export function SettingsRowDivider() {
  return <div className="border-t border-stroke-soft-200" />
}
