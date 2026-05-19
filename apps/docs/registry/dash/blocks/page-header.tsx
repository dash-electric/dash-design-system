"use client"

/**
 * Page Header — Dash block.
 *
 * Figma parity (Headers [1.1] :: Page Header [1.1] — id 3829:27898).
 * Variants on `leading` axis match Figma `Type` enum:
 *   - basic        (Type=📂 Basic)        — no leading slot
 *   - avatar       (Type=👨🏻 Avatar)        — user/profile avatar
 *   - icon         (Type=⬅️ Left Icon)     — round key-icon tile
 *   - brand        (Type=🎗️ Brand)         — brand monogram (Loom / Apex / etc.)
 *   - company      (Type=🏢 Company)       — square company logo tile
 *
 * Composition:
 *   leading? + title + description    ── primaryActions (Select / IconButtons)
 *                                        secondaryActions (Buttons row)
 *   bottom divider (optional)
 */

import * as React from "react"
import { RiSearchLine as Search, RiNotification3Line as Bell } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

export type PageHeaderLeadingKind = "basic" | "avatar" | "icon" | "brand" | "company"

export type PageHeaderProps = React.HTMLAttributes<HTMLElement> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** Type enum from Figma — controls leading visual (default "basic"). */
  leading?: PageHeaderLeadingKind
  /** Leading content — Avatar, Icon, or brand mark depending on `leading`. */
  leadingSlot?: React.ReactNode
  /** Avatar URL when leading="avatar" (fallback used otherwise). */
  avatarSrc?: string
  /** Initials/fallback when leading="avatar". */
  avatarFallback?: string
  /** Primary controls (Select dropdown, etc.) — top-right region. */
  controls?: React.ReactNode
  /** Action row (Buttons) — bottom-right region. */
  actions?: React.ReactNode
  /** Show search topbar icon. */
  showSearch?: boolean
  onSearchClick?: () => void
  /** Show notification topbar icon. */
  showNotification?: boolean
  notificationBadge?: boolean
  onNotificationClick?: () => void
  /** Show bottom divider (default true to match Figma). */
  divider?: boolean
}

/** Page Header — backoffice-grade title block with leading slot, controls, action row. */
export function PageHeader({
  title,
  description,
  leading = "basic",
  leadingSlot,
  avatarSrc,
  avatarFallback,
  controls,
  actions,
  showSearch = false,
  showNotification = false,
  notificationBadge = false,
  onSearchClick,
  onNotificationClick,
  divider = true,
  className,
  ...rest
}: PageHeaderProps) {
  const renderLeading = () => {
    if (leading === "basic") return null
    if (leadingSlot) return leadingSlot
    if (leading === "avatar") {
      return (
        <Avatar size="2xl">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
          <AvatarFallback>{avatarFallback ?? "DS"}</AvatarFallback>
        </Avatar>
      )
    }
    // For icon/brand/company callers pass leadingSlot; render placeholder square otherwise.
    return (
      <div className="size-14 shrink-0 rounded-xl bg-bg-weak-50 ring-1 ring-stroke-soft-200" />
    )
  }

  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-col gap-4", className)}
      {...rest}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {renderLeading()}
          <div className="min-w-0">
            <h1 className="text-label-large text-text-strong-950">
              {title}
            </h1>
            {description ? (
              <p className="mt-0.5 text-paragraph-small text-text-sub-600">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showSearch ? (
            <IconButton
              tone="neutral"
              style="stroke"
              size="md"
              aria-label="Search"
              onClick={onSearchClick}
            >
              <Search />
            </IconButton>
          ) : null}
          {showNotification ? (
            <IconButton
              tone="neutral"
              style="stroke"
              size="md"
              aria-label="Notifications"
              onClick={onNotificationClick}
              className="relative"
            >
              <Bell />
              {notificationBadge ? (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-(--state-error-base)" />
              ) : null}
            </IconButton>
          ) : null}
          {controls}
        </div>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      ) : null}

      {divider ? <Divider /> : null}
    </header>
  )
}

/**
 * Convenience pair of default action buttons (Schedule + primary CTA).
 * Mirrors Figma defaults "Schedule" + "Create Request".
 */
export function PageHeaderDefaultActions({
  primaryLabel = "Create Request",
  secondaryLabel = "Schedule",
  onPrimary,
  onSecondary,
}: {
  primaryLabel?: string
  secondaryLabel?: string
  onPrimary?: () => void
  onSecondary?: () => void
}) {
  return (
    <>
      <Button tone="neutral" style="stroke" size="md" onClick={onSecondary}>
        {secondaryLabel}
      </Button>
      <Button tone="primary" style="filled" size="md" onClick={onPrimary}>
        {primaryLabel}
      </Button>
    </>
  )
}
