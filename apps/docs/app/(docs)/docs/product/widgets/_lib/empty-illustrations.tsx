import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Legacy empty-state shim for widget docs pages.
 *
 * The 34 widget-specific brand illustrations live in the public primitive:
 *   import { EmptyStateIllustration } from "@/registry/dash/ui/empty-state-illustration"
 *
 * Marketing widget docs (total-visitors, conversion-rate, etc.) don't have
 * a brand-specific illustration kind yet — those pages still render the
 * legacy stroke-based `EmptyChart` glyph through `EmptyIllustration`.
 *
 * Everything else has been migrated. When marketing illustrations land,
 * delete this file entirely.
 */

export { EmptyStateIllustration } from "@/registry/dash/ui/empty-state-illustration"

type IllusProps = { className?: string }

function svgBase(className?: string) {
  return cn("size-20", className)
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.10" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
      </linearGradient>
    </defs>
  )
}

/**
 * @deprecated Used only by marketing widget docs without a brand-specific
 * empty-state illustration. Migrate to `EmptyStateIllustration` once marketing
 * illustrations are produced.
 */
export function EmptyChart({ className }: IllusProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={cn(svgBase(className), "text-icon-soft-400")}>
      <Defs id="ech" />
      <rect x="12" y="14" width="72" height="56" rx="6" fill={`url(#ech-fill)`} stroke="currentColor" strokeWidth="2" />
      <path d="M20 60l14-14 10 8 18-22 14 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-icon-sub-600" />
      <circle cx="36" cy="80" r="2" fill="currentColor" className="text-icon-sub-600" />
      <circle cx="48" cy="84" r="2" fill="currentColor" className="text-icon-sub-600" />
      <circle cx="60" cy="80" r="2" fill="currentColor" className="text-icon-sub-600" />
    </svg>
  )
}

/**
 * @deprecated See module-level note. Drop-in muted-disc empty-state shell.
 */
export function EmptyIllustration({
  illustration: Illus,
  title,
  text,
  className,
  children,
}: {
  illustration: React.ComponentType<{ className?: string }>
  title?: string
  text?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-6 text-center", className)}>
      <Illus />
      {title ? <p className="text-sm font-medium text-text-strong-950">{title}</p> : null}
      {text ? <p className="max-w-[28ch] text-xs text-text-sub-600">{text}</p> : null}
      {children}
    </div>
  )
}
