"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiSettings2Line,
  RiUserLine,
  RiBuilding2Line,
  RiGlobalLine,
  RiFolderSettingsLine,
  RiNotificationLine,
  RiShieldUserLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Shared layout pieces for the HR Settings Deep docs sub-pages.
 * Mirrors the AlignUI HR Template (app/(main)/settings/*) structure:
 *   - Section header (icon + title + description)
 *   - 2-pane shell: left settings nav (6 items) + right active content
 *   - Inner vertical tab-rail card per section (mirrors source TabMenuVertical)
 */

export type NavId =
  | "general"
  | "profile"
  | "company"
  | "notifications"
  | "privacy-security"
  | "integrations"

export const NAV: { id: NavId; label: string; href: string }[] = [
  {
    id: "general",
    label: "General Settings",
    href: "/docs/templates/hr-settings-deep/general",
  },
  {
    id: "profile",
    label: "Profile Settings",
    href: "/docs/templates/hr-settings-deep/profile",
  },
  {
    id: "company",
    label: "Company Settings",
    href: "/docs/templates/hr-settings-deep/company",
  },
  {
    id: "notifications",
    label: "Notification Settings",
    href: "/docs/templates/hr-settings-deep/notifications",
  },
  {
    id: "privacy-security",
    label: "Privacy & Security",
    href: "/docs/templates/hr-settings-deep/privacy-security",
  },
  {
    id: "integrations",
    label: "Integrations",
    href: "/docs/templates/hr-settings-deep/integrations",
  },
]

export function HrSettingsHeader() {
  return (
    <div className="flex items-center gap-4 border-b border-stroke-soft-200 pb-5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
        <RiSettings2Line className="size-6 text-text-sub-600" />
      </div>
      <div>
        <div className="text-base font-medium text-text-strong-950">
          Settings Page
        </div>
        <div className="mt-1 text-sm text-text-sub-600">
          Manage your preferences and configure various options.
        </div>
      </div>
    </div>
  )
}

/** Horizontal top tabs that mirror the source TabMenuHorizontal page nav. */
export function HrSettingsTopTabs({ active }: { active: NavId }) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-stroke-soft-200">
      {NAV.map((item) => {
        const isActive = item.id === active
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "whitespace-nowrap py-3 text-sm",
              isActive
                ? "-mb-px border-b-2 border-primary-base font-medium text-text-strong-950"
                : "text-text-sub-600 hover:text-text-strong-950",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

/**
 * Vertical inner tab-rail card (left side of each section page).
 * Mirrors the `w-[258px] rounded-2xl ring-1 ring-stroke-soft-200` card seen in source.
 */
export function SectionTabRail({
  tabs,
  current,
}: {
  tabs: { label: string; icon: React.ElementType }[]
  current: string
}) {
  return (
    <div className="w-[258px] shrink-0 rounded-2xl bg-bg-white-0 p-2.5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <h4 className="mb-2 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-text-soft-400">
        select menu
      </h4>
      <div className="flex flex-col gap-0.5">
        {tabs.map(({ label, icon: Icon }) => {
          const active = label === current
          return (
            <button
              key={label}
              type="button"
              className={cn(
                "group flex h-9 w-full items-center gap-2 rounded-[10px] px-2 text-left text-sm",
                active
                  ? "bg-bg-weak-50 text-text-strong-950"
                  : "bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50",
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  active
                    ? "text-primary-base"
                    : "text-text-soft-400 group-hover:text-text-sub-600",
                )}
              />
              <span className="flex-1">{label}</span>
              {active ? (
                <RiArrowRightSLine className="size-[18px] shrink-0 text-text-sub-600" />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Two-pane settings preview frame: top header → top tabs → 2-pane body. */
export function SettingsPagePreview({
  active,
  children,
}: {
  active: NavId
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-col gap-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6">
      <HrSettingsHeader />
      <HrSettingsTopTabs active={active} />
      <div className="flex flex-col gap-8 md:grid md:grid-cols-[auto_1fr] md:items-start">
        {children}
      </div>
    </div>
  )
}

/** Standard section card on right (matches HR template page-section markup). */
export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full max-w-[440px] flex-col gap-4">{children}</div>
  )
}

export function SectionTitle({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <div className="text-sm font-medium text-text-strong-950">{title}</div>
      <p className="mt-1 text-sm text-text-sub-600">{description}</p>
    </div>
  )
}

export function DashedLine() {
  return (
    <span
      role="separator"
      aria-hidden
      className="block h-px w-full border-t border-dashed border-stroke-soft-200"
    />
  )
}

/** Section icon map (reused by header rows + nav cards). */
export const SECTION_ICONS: Record<NavId, React.ElementType> = {
  general: RiGlobalLine,
  profile: RiUserLine,
  company: RiBuilding2Line,
  notifications: RiNotificationLine,
  "privacy-security": RiShieldUserLine,
  integrations: RiFolderSettingsLine,
}
