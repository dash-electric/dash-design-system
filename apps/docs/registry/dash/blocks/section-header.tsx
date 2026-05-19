"use client"

/**
 * Section Header — Dash block.
 *
 * Figma parity (Headers [1.1] :: Section Header [1.1] — id 3880:63403).
 * Same `leading` axis as Page Header (basic / avatar / icon / brand / company).
 * Compared to Page Header:
 *   - Title row supports an inline compact button (e.g. dropdown chevron).
 *   - No primary `controls` slot; single search topbar icon + actions row only.
 *   - Slightly tighter typography (label-medium vs label-large).
 *
 * Composition:
 *   leading? + (title + compact-button?) + description    ── actions row
 *   bottom divider (optional)
 */

import * as React from "react"
import { RiSearchLine as Search, RiArrowDownSLine as ChevronDown } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

export type SectionHeaderLeadingKind = "basic" | "avatar" | "icon" | "brand" | "company"

export type SectionHeaderProps = React.HTMLAttributes<HTMLElement> & {
  title: React.ReactNode
  description?: React.ReactNode
  leading?: SectionHeaderLeadingKind
  leadingSlot?: React.ReactNode
  avatarSrc?: string
  avatarFallback?: string
  /** Inline compact button next to title (default false). */
  showTitleAction?: boolean
  /** Custom node for the title compact button — overrides default chevron-down. */
  titleAction?: React.ReactNode
  onTitleAction?: () => void
  /** Show search topbar icon. */
  showSearch?: boolean
  onSearchClick?: () => void
  /** Action row (Buttons) — right region. */
  actions?: React.ReactNode
  /** Show bottom divider (default true). */
  divider?: boolean
}

/** Section Header — content-area heading with optional inline action and right-side buttons. */
export function SectionHeader({
  title,
  description,
  leading = "basic",
  leadingSlot,
  avatarSrc,
  avatarFallback,
  showTitleAction = false,
  titleAction,
  onTitleAction,
  showSearch = false,
  onSearchClick,
  actions,
  divider = true,
  className,
  ...rest
}: SectionHeaderProps) {
  const renderLeading = () => {
    if (leading === "basic") return null
    if (leadingSlot) return leadingSlot
    if (leading === "avatar") {
      return (
        <Avatar size="xl">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
          <AvatarFallback>{avatarFallback ?? "DS"}</AvatarFallback>
        </Avatar>
      )
    }
    return (
      <div className="size-12 shrink-0 rounded-xl bg-bg-weak-50 ring-1 ring-stroke-soft-200" />
    )
  }

  return (
    <header
      data-slot="section-header"
      className={cn("flex flex-col gap-4", className)}
      {...rest}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {renderLeading()}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-label-medium text-text-strong-950">{title}</h2>
              {showTitleAction
                ? titleAction ?? (
                    <IconButton
                      tone="neutral"
                      style="ghost"
                      size="xs"
                      aria-label="More"
                      onClick={onTitleAction}
                    >
                      <ChevronDown />
                    </IconButton>
                  )
                : null}
            </div>
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
          {actions}
        </div>
      </div>

      {divider ? <Divider /> : null}
    </header>
  )
}

/** Default action pair (Export + primary CTA). Mirrors Figma "Export" + "Invite Member". */
export function SectionHeaderDefaultActions({
  primaryLabel = "Invite Member",
  secondaryLabel = "Export",
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
