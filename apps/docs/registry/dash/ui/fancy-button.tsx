"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/registry/dash/lib/utils"

/**
 * FancyButton — Figma 1:1 parity (nodes 129:1422 + 181:5291, re-verified 2026-05-17).
 *
 * Figma axes:
 *   Type  : Neutral | Primary | Destructive | Basic → `tone`
 *           (Basic = white bg + gray ring, mapped to tone="stroke")
 *   State : Default | Hover | Disabled
 *   Size  : Medium (40) | Small (36) | X-Small (32)
 *
 * Spec (the "fancy" sensation comes from three layers, all visible together):
 *   1. Solid tone fill         (e.g. bg-primary)
 *   2. Top-down white sheen    (linear-gradient white/16 → transparent; 24% on hover)
 *      → rendered via `::before` pseudo so the base bg-color class stays clean.
 *   3. Inner 1px white/12 ring (gives the bright lifted edge)
 *      + outer 1px tone-color ring (defines the silhouette)
 *      + 0 1px 2px depth shadow
 *      → all stacked in box-shadow.
 *
 * Basic (stroke) tone keeps a soft white-bg + gray-200 ring + light depth shadow,
 * NO gradient sheen — Figma "Basic" variant.
 *
 * Size metrics (Figma exact):
 *   xs (32) → h=32 r=8  pad=6   gap=4  text-sm
 *   sm (36) → h=36 r=8  pad=8   gap=4  text-sm
 *   md (40) → h=40 r=10 pad=10  gap=4  text-sm  (Figma default)
 *   lg / xl → Dash extensions (not in Figma)
 */

const fancyButtonVariants = cva(
  cn(
    "relative inline-flex items-center justify-center font-medium",
    // Sheen overlay via ::before — sits above bg-color, below content
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]",
    "before:bg-[linear-gradient(180deg,rgb(255_255_255_/_0.16)_0%,rgb(255_255_255_/_0)_100%)]",
    "hover:before:bg-[linear-gradient(180deg,rgb(255_255_255_/_0.24)_0%,rgb(255_255_255_/_0)_100%)]",
    // Content stays above sheen
    "[&>*]:relative [&>*]:z-[1]",
    "transition-[background-color,box-shadow,transform] duration-(--duration-fast) ease-(--ease-out)",
    "focus-visible:outline-none",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:shadow-none disabled:before:hidden",
    "select-none",
    "[&_svg]:shrink-0",
  ),
  {
    variants: {
      tone: {
        primary: cn(
          "bg-primary text-static-white",
          // Stacked: inner white/12 highlight ring + outer primary ring + depth
          "shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_var(--primary-base),0_1px_2px_rgb(14_18_27_/_0.24)]",
          "hover:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_var(--primary-base),0_4px_8px_rgb(14_18_27_/_0.24)]",
          "active:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_var(--primary-base)]",
          "focus-visible:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_var(--primary-base),0_1px_2px_rgb(14_18_27_/_0.24),0_0_0_2px_var(--bg-white-0),0_0_0_6px_var(--primary-alpha-10)]",
        ),
        neutral: cn(
          "bg-bg-strong-950 text-static-white",
          "shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_rgb(36_38_40),0_1px_2px_rgb(27_28_29_/_0.48)]",
          "hover:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_rgb(36_38_40),0_4px_8px_rgb(27_28_29_/_0.48)]",
          "active:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_rgb(36_38_40)]",
          "focus-visible:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_rgb(36_38_40),0_1px_2px_rgb(27_28_29_/_0.48),0_0_0_2px_var(--bg-white-0),0_0_0_6px_var(--dash-slate-alpha-16)]",
        ),
        destructive: cn(
          "bg-destructive text-static-white",
          "shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_var(--state-error-base),0_1px_2px_rgb(14_18_27_/_0.24)]",
          "hover:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_var(--state-error-base),0_4px_8px_rgb(14_18_27_/_0.24)]",
          "active:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_var(--state-error-base)]",
          "focus-visible:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12),0_0_0_1px_var(--state-error-base),0_1px_2px_rgb(14_18_27_/_0.24),0_0_0_2px_var(--bg-white-0),0_0_0_6px_var(--dash-red-alpha-10)]",
        ),
        stroke: cn(
          // Figma "Basic" tone: white bg, gray-200 ring, soft depth shadow, text-sub-600
          // No sheen for Basic — kill the ::before overlay.
          "bg-bg-white-0 text-text-sub-600",
          "before:hidden",
          "shadow-[0_0_0_1px_var(--stroke-soft-200),0_1px_3px_rgb(14_18_27_/_0.12)]",
          "hover:bg-bg-weak-50 hover:text-text-strong-950",
          "hover:shadow-[0_0_0_1px_var(--stroke-soft-200),0_4px_8px_rgb(14_18_27_/_0.12)]",
          "active:shadow-[0_0_0_1px_var(--stroke-soft-200)]",
          "focus-visible:shadow-[0_0_0_1px_var(--stroke-soft-200),0_1px_3px_rgb(14_18_27_/_0.12),0_0_0_2px_var(--bg-white-0),0_0_0_6px_var(--dash-slate-alpha-16)]",
        ),
      },
      size: {
        // Figma-canonical (paste verified 2026-05-17). Padding values match
        // Figma p-[6|8|10]; horizontal pad expanded so chevron + label fits.
        xs: "h-8 px-2.5 text-sm rounded-lg gap-1 [&_svg]:size-4",      // X-Small (32) r=8 pad=6
        sm: "h-9 px-3 text-sm rounded-lg gap-1 [&_svg]:size-4",        // Small (36)  r=8 pad=8
        md: "h-10 px-3.5 text-sm rounded-[10px] gap-1 [&_svg]:size-5", // Medium (40) r=10 pad=10 (default)
        // Dash extensions
        lg: "h-11 px-4 text-sm rounded-[10px] gap-1.5 [&_svg]:size-5",
        xl: "h-12 px-5 text-base rounded-[10px] gap-2 [&_svg]:size-5",
      },
    },
    defaultVariants: { tone: "primary", size: "md" },
  },
)

type FancyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof fancyButtonVariants> & { asChild?: boolean }

const FancyButton = React.forwardRef<HTMLButtonElement, FancyButtonProps>(
  ({ className, tone, size, asChild, type = "button", children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        data-slot="fancy-button"
        data-tone={tone ?? "primary"}
        className={cn(fancyButtonVariants({ tone, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    )
  },
)
FancyButton.displayName = "FancyButton"

export { FancyButton, fancyButtonVariants }
