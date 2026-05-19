"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiArrowRightSLine as ChevronRight } from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"

/**
 * DocsBreadcrumb — small back-nav above page title.
 * Derives crumbs from pathname:
 *   /docs/components/button → Docs › Components › Button
 *   /docs/blocks/auth-login-phoenix → Docs › Blocks › Form + 2 SSO
 *
 * Only the parent crumb (and root) is clickable. The current page is plain text.
 */

const SEGMENT_LABELS: Record<string, string> = {
  docs: "Docs",
  components: "Components",
  blocks: "Blocks",
  templates: "Templates",
  foundations: "Foundations",
  theming: "Theming",
  registry: "Registry",
  tools: "Tools",
  forms: "Forms",
  resources: "Resources",
  installation: "Installation",
}

/** Auto-Title-Case from a slug like `password-input` → `Password Input`. */
const titleCase = (slug: string) =>
  slug
    .split("-")
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ")

export const DocsBreadcrumb = ({ className }: { className?: string }) => {
  const pathname = usePathname()
  if (!pathname || pathname === "/" || pathname === "/docs") return null

  const segments = pathname.split("/").filter(Boolean) // ["docs","components","button"]
  if (segments.length < 2) return null

  // Render all segments except the last (last = current page, just text).
  const trail = segments.slice(0, -1)
  const current = segments[segments.length - 1]

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1.5 text-xs text-text-soft-400",
        className,
      )}
    >
      {trail.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/")
        const label = SEGMENT_LABELS[seg] ?? titleCase(seg)
        return (
          <React.Fragment key={href}>
            <Link
              href={href}
              className="hover:text-text-strong-950 transition-colors"
            >
              {label}
            </Link>
            <ChevronRight aria-hidden className="size-3 shrink-0" strokeWidth={1.75} />
          </React.Fragment>
        )
      })}
      <span className="text-text-sub-600">{titleCase(current)}</span>
    </nav>
  )
}
