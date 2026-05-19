"use client"

import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"

type DocsTemplatePreviewProps = {
  /** Minimum inner width — templates are designed at 1440px. */
  minWidth?: number
  /** Background color class for the inner canvas. */
  background?: string
  /** Inner padding class. */
  padding?: string
  /** Extra classes for the inner container. */
  className?: string
  children: React.ReactNode
}

/**
 * DocsTemplatePreview — horizontal-scroll preview for full-width templates.
 *
 * Templates are designed at 1440px wide but docs article column is ~1080px.
 * Without this, the outer `DocsPreview` (overflow-hidden) clips template
 * content (right-rail buttons, sidebars, etc.). This component renders the
 * template at its intended width and exposes a horizontal scroll handle so
 * the user can see the full layout.
 *
 * Pair with `<DocsExample preview={<DocsTemplatePreview>…}>`. The outer
 * `DocsPreview` is `noPad` aware via the `data-template-preview` flag —
 * see `DocsPreview` in components/docs/preview.tsx.
 */
export const DocsTemplatePreview = ({
  children,
  minWidth = 1440,
  background = "bg-bg-white-0",
  padding,
  className,
}: DocsTemplatePreviewProps) => (
  <div
    data-template-preview
    className={cn("w-full overflow-x-auto", background)}
  >
    <div
      style={{ minWidth }}
      className={cn(padding, className)}
    >
      {children}
    </div>
  </div>
)
