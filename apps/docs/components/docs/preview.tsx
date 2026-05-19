"use client"

import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"

type PreviewProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Frame minimum height. */
  height?: number
  /** Surround content in centered flex layout (default true). */
  center?: boolean
  /** Optional label shown in the top hairline bar. */
  label?: React.ReactNode
  /**
   * Drop inner padding + outer overflow-hidden. Used for full-width
   * template previews where the inner content manages its own canvas
   * (see `DocsTemplatePreview`).
   */
  bare?: boolean
}

/**
 * DocsPreview — clean white surface, no decorative pattern.
 * The component itself is the focus, not the frame around it.
 */
export const DocsPreview = ({
  className,
  children,
  height,
  center = true,
  label,
  bare = false,
  ...props
}: PreviewProps) => (
  <div
    data-slot="docs-preview"
    className={cn(
      "relative w-full border-x border-t border-stroke-soft-200 bg-bg-white-0 rounded-t-xl",
      !bare && "overflow-hidden",
      className,
    )}
    {...props}
  >
    {label ? (
      <div className="flex items-center justify-between gap-2 border-b border-stroke-soft-200 bg-bg-weak-50/40 px-4 h-9">
        <span className="text-[10px] uppercase tracking-widest text-text-soft-400">
          {label}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-text-soft-400">
          Preview
        </span>
      </div>
    ) : null}
    <div
      style={height ? { minHeight: height } : undefined}
      className={cn(
        "relative isolate",
        !bare && "p-10 lg:p-14",
        !bare && center && "flex items-center justify-center min-h-48",
      )}
    >
      {children}
    </div>
  </div>
)
