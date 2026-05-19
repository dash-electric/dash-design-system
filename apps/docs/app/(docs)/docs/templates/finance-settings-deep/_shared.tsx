"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiArrowRightSLine,
  RiUserSettingsLine,
  RiBuilding2Line,
  RiNotificationBadgeLine,
  RiGroupLine,
  RiShieldUserLine,
  RiEqualizerLine,
  RiGlobalLine,
} from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { Button } from "@/registry/dash/ui/button"
import { Divider } from "@/registry/dash/ui/divider"
import { LinkButton } from "@/registry/dash/ui/link-button"

/**
 * Shared layout primitives for the Finance Settings Deep docs sub-pages.
 *
 * Mirrors the AlignUI Finance Template (app/settings/*) shell:
 *   - Left rail (264px): "Settings" + caption + 7 vertical tab links
 *   - Right column: section header (48px circle icon + title + description +
 *     Export button on the right), Divider, then section content.
 *
 * Each section page renders the right column verbatim per the source —
 * the source has NO inner sub-tab rail (unlike HR), only a single page per
 * section. The left rail is the only nav.
 */

export type NavId =
  | "profile"
  | "company"
  | "notifications"
  | "team"
  | "privacy-security"
  | "integrations"
  | "localization"

export const NAV: {
  id: NavId
  label: string
  icon: React.ElementType
  href: string
}[] = [
  {
    id: "profile",
    label: "Profile",
    icon: RiUserSettingsLine,
    href: "/docs/templates/finance-settings-deep/profile",
  },
  {
    id: "company",
    label: "Company",
    icon: RiBuilding2Line,
    href: "/docs/templates/finance-settings-deep/company",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: RiNotificationBadgeLine,
    href: "/docs/templates/finance-settings-deep/notifications",
  },
  {
    id: "team",
    label: "Team",
    icon: RiGroupLine,
    href: "/docs/templates/finance-settings-deep/team",
  },
  {
    id: "privacy-security",
    label: "Privacy & Security",
    icon: RiShieldUserLine,
    href: "/docs/templates/finance-settings-deep/privacy-security",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: RiEqualizerLine,
    href: "/docs/templates/finance-settings-deep/integrations",
  },
  {
    id: "localization",
    label: "Localization",
    icon: RiGlobalLine,
    href: "/docs/templates/finance-settings-deep/localization",
  },
]

/** 264px left rail — mirrors `lg:flex` settings-menu desktop view. */
export function SettingsNavRail({ active }: { active: NavId }) {
  return (
    <aside className="hidden w-[264px] shrink-0 flex-col gap-5 border-r border-stroke-soft-200 p-5 lg:flex">
      <div>
        <div className="text-base font-medium text-text-strong-950">
          Settings
        </div>
        <div className="mt-1 text-sm text-text-sub-600">
          Choose between categories.
        </div>
      </div>

      <Divider />

      <nav aria-label="Finance settings">
        <ul className="flex flex-col gap-0.5">
          {NAV.map(({ id, label, icon: Icon, href }) => {
            const isActive = id === active
            return (
              <li key={id}>
                <Link
                  href={href}
                  className={cn(
                    "group flex h-10 w-full items-center gap-2 rounded-[10px] px-2 text-sm transition-colors",
                    isActive
                      ? "bg-bg-weak-50 text-text-strong-950"
                      : "text-text-sub-600 hover:bg-bg-weak-50",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "size-5 shrink-0",
                      isActive
                        ? "text-primary"
                        : "text-text-soft-400 group-hover:text-text-sub-600",
                    )}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {isActive ? (
                    <RiArrowRightSLine className="size-[18px] shrink-0 text-text-sub-600" />
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

/** Section header — 48px circle icon + title + description + Export button. */
export function SettingsSectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:pt-8">
      <div className="flex items-center gap-3.5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
          <Icon className="size-6 text-text-sub-600" />
        </div>
        <div>
          <div className="text-lg font-medium text-text-strong-950">
            {title}
          </div>
          <div className="mt-0.5 text-sm text-text-sub-600">{description}</div>
        </div>
      </div>
      <Button
        tone="neutral"
        style="stroke"
        size="md"
        className="w-full md:w-auto"
      >
        <ExportIcon />
        Export
      </Button>
    </div>
  )
}

function ExportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="size-5"
    >
      <path d="M12 3l-4 4h3v8h2V7h3l-4-4zM5 21v-2h14v2H5z" />
    </svg>
  )
}

/**
 * Two-pane shell: left rail + right content column, wrapped in a rounded
 * canvas so the docs preview shows the full settings page layout 1:1.
 */
export function SettingsPagePreview({
  active,
  children,
}: {
  active: NavId
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0">
      <SettingsNavRail active={active} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

/** Two-column field row — matches `grid md:grid-cols-[minmax(0,26fr),minmax(0,37fr)]`. */
export function FieldRow({
  label,
  description,
  children,
  className,
}: {
  label: string
  description: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid gap-6 md:grid-cols-[minmax(0,26fr),minmax(0,37fr)]",
        className,
      )}
    >
      <div>
        <div className="text-sm font-medium text-text-strong-950">{label}</div>
        <div className="mt-1 text-xs text-text-sub-600">{description}</div>
      </div>
      <div>{children}</div>
    </div>
  )
}

/** Value display + Edit link (the most common right-hand pattern). */
export function ValueEdit({
  children,
  multiline,
}: {
  children: React.ReactNode
  multiline?: boolean
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div
        className={cn(
          "text-sm text-text-strong-950",
          multiline ? "leading-relaxed" : "",
        )}
      >
        {children}
      </div>
      <LinkButton tone="primary" size="md" href="#">
        Edit
        <RiArrowRightSLine className="size-4" />
      </LinkButton>
    </div>
  )
}

/** Line-spacing divider used between field rows. */
export function RowDivider() {
  return <Divider />
}
