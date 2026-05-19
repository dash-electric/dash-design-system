"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiArrowLeftLine as ArrowLeft, RiArrowRightLine as ArrowRight } from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { fullInventoryFlat } from "@/components/docs/nav-config"

const ALL_PAGES = fullInventoryFlat

type Props = {
  className?: string
}

/**
 * DocsPageNav — prev/next cards at bottom of a docs page.
 * Resolves current page by pathname against flat nav-config.
 */
export const DocsPageNav = ({ className }: Props) => {
  const pathname = usePathname()
  const idx = ALL_PAGES.findIndex((p) => p.href === pathname)

  if (idx === -1) return null

  const prev = idx > 0 ? ALL_PAGES[idx - 1] : null
  const next = idx < ALL_PAGES.length - 1 ? ALL_PAGES[idx + 1] : null

  if (!prev && !next) return null

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "mt-16 pt-8 border-t border-stroke-soft-200 grid grid-cols-1 sm:grid-cols-2 gap-3",
        className,
      )}
    >
      {prev ? (
        <Link
          href={prev.href}
          className={cn(
            "group rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-4",
            "transition-colors hover:border-(--dash-purple-300) hover:bg-bg-weak-50",
            "flex items-center gap-3",
          )}
        >
          <ArrowLeft
            className="size-4 shrink-0 text-text-soft-400 transition-transform group-hover:-translate-x-0.5 group-hover:text-(--dash-purple-500)"
            strokeWidth={1.75}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-text-soft-400">
              Previous
            </div>
            <div className="text-sm font-medium text-text-strong-950 truncate">{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className={cn(
            "group rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-4",
            "transition-colors hover:border-(--dash-purple-300) hover:bg-bg-weak-50",
            "flex items-center gap-3 sm:text-right sm:flex-row-reverse",
          )}
        >
          <ArrowRight
            className="size-4 shrink-0 text-text-soft-400 transition-transform group-hover:translate-x-0.5 group-hover:text-(--dash-purple-500)"
            strokeWidth={1.75}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-text-soft-400">
              Next
            </div>
            <div className="text-sm font-medium text-text-strong-950 truncate">{next.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
