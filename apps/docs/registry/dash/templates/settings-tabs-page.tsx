"use client"

import * as React from "react"
import { RiArrowRightSLine as ChevronRight } from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"

export type SettingsSection = {
  id: string
  label: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
}

export type SettingsTabsPageProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  sections: SettingsSection[]
  activeId: string
  onChange?: (id: string) => void
  children: React.ReactNode
  className?: string
}

/**
 * SettingsTabsPage — left nav of settings sections + right content pane.
 * Sections grouped under a title; clicking sets activeId (controlled).
 */
export function SettingsTabsPage({
  title = "Settings",
  description,
  sections,
  activeId,
  onChange,
  children,
  className,
}: SettingsTabsPageProps) {
  return (
    <div className={cn("flex w-full gap-8", className)}>
      <aside className="w-64 shrink-0">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-text-strong-950">{title}</h2>
          {description ? <p className="text-sm text-text-sub-600 mt-1">{description}</p> : null}
        </div>
        <nav className="flex flex-col gap-0.5" aria-label="Settings sections">
          {sections.map((s) => {
            const isActive = s.id === activeId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange?.(s.id)}
                data-active={isActive ? "true" : undefined}
                className={cn(
                  "group flex items-center gap-2.5 px-3 h-9 rounded-md text-sm font-medium text-text-sub-600 transition-colors",
                  "hover:bg-bg-weak-50 hover:text-text-strong-950",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "data-[active=true]:bg-bg-weak-50 data-[active=true]:text-text-strong-950",
                  "[&_svg]:size-4 [&_svg]:shrink-0",
                )}
              >
                {s.icon}
                <span className="flex-1 text-left">{s.label}</span>
                <ChevronRight
                  strokeWidth={1.75}
                  className="size-3.5 opacity-0 group-data-[active=true]:opacity-100 text-text-soft-400"
                />
              </button>
            )
          })}
        </nav>
      </aside>
      <section className="flex-1 min-w-0">{children}</section>
    </div>
  )
}
