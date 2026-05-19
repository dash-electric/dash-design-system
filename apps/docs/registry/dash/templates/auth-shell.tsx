"use client"

import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"

export type AuthShellProps = {
  brand?: React.ReactNode
  illustration?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  /**
   * "centered" = single card centered on muted bg
   * "split"    = left content + right hero panel (desktop only)
   */
  variant?: "centered" | "split"
  className?: string
}

/**
 * AuthShell — page-level layout for login / signup / reset / verification.
 * - "centered" pattern: form card on muted background, brand on top, footer link below.
 * - "split" pattern: form left + hero illustration right, common for marketing-grade auth.
 */
export function AuthShell({
  brand = <span className="text-2xl font-semibold tracking-tight">Dash</span>,
  illustration,
  title,
  description,
  children,
  footer,
  variant = "centered",
  className,
}: AuthShellProps) {
  if (variant === "split") {
    return (
      <div className={cn("min-h-screen grid lg:grid-cols-2 bg-bg-weak-50", className)}>
        <div className="flex flex-col px-8 py-10 lg:px-16">
          <div className="mb-10">{brand}</div>
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <h1 className="text-3xl font-semibold tracking-tight text-text-strong-950">{title}</h1>
            {description ? (
              <p className="mt-2 text-text-sub-600 leading-relaxed">{description}</p>
            ) : null}
            <div className="mt-8">{children}</div>
          </div>
          {footer ? <div className="mt-auto pt-6 text-sm text-text-sub-600">{footer}</div> : null}
        </div>
        <div className="hidden lg:flex bg-(--dash-purple-50) items-center justify-center p-12">
          {illustration ?? (
            <div className="relative size-full max-h-[640px] rounded-2xl bg-gradient-to-br from-(--dash-purple-300) via-(--dash-purple-500) to-(--dash-purple-800) overflow-hidden">
              <div className="absolute inset-0 grid place-items-center text-white/90 text-center px-6">
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Halo-dash · Tribe-Express</p>
                  <p className="text-2xl font-semibold tracking-tight">Satu shell untuk semua tribe.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen bg-bg-weak-50 flex flex-col items-center px-6 py-10", className)}>
      <div className="mb-8">{brand}</div>
      <div className="w-full max-w-sm rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-custom-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-text-strong-950">{title}</h1>
          {description ? (
            <p className="mt-1.5 text-sm text-text-sub-600 leading-relaxed">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
      {footer ? <div className="mt-6 text-sm text-text-sub-600">{footer}</div> : null}
    </div>
  )
}
