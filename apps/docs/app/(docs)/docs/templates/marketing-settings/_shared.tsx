"use client"

import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"
import { Button } from "@/registry/dash/ui/button"

/**
 * Shared layout pieces for the Marketing Settings docs sub-pages.
 * Mirrors the source AlignUI structure (settings-modal/<section>/index.tsx):
 *   <SectionHeader title description action />
 *   <SubTabs current={current} tabs={[...]} />
 *   <SectionBody> {form rows separated by <DashedDivider />} </SectionBody>
 */

export function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex w-full flex-col gap-3.5 px-6 py-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <div className="text-base font-medium text-text-strong-950">{title}</div>
        <div className="mt-1 text-sm text-text-sub-600">{description}</div>
      </div>
      <div className="grid grid-cols-2 items-center gap-3 sm:flex">
        <Button size="md" tone="neutral" style="stroke" className="rounded-[10px]">
          Discard
        </Button>
        <Button size="md" className="rounded-[10px]">
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export function SubTabs({
  tabs,
  current,
}: {
  tabs: string[]
  current: string
}) {
  return (
    <div className="flex items-center gap-6 border-b border-stroke-soft-200 px-6">
      {tabs.map((t) => (
        <span
          key={t}
          className={cn(
            "py-3 text-sm",
            t === current
              ? "-mb-px border-b-2 border-primary-base font-medium text-text-strong-950"
              : "text-text-sub-600",
          )}
        >
          {t}
        </span>
      ))}
    </div>
  )
}

export function SectionBody({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6 p-6">{children}</div>
}

/** Dashed horizontal rule used between every row in the modal source. */
export function DashedDivider() {
  return (
    <span
      role="separator"
      aria-hidden
      className="block h-px w-full border-t border-dashed border-stroke-soft-200"
    />
  )
}

/** Two-column row: left = label + hint, right = control. */
export function FormRow({
  label,
  hint,
  control,
  rightWidth = "312px",
}: {
  label: React.ReactNode
  hint: React.ReactNode
  control: React.ReactNode
  rightWidth?: string
}) {
  return (
    <div
      className="grid items-center gap-4 sm:gap-6"
      style={{ gridTemplateColumns: `minmax(0, 1fr) ${rightWidth}` }}
    >
      <div>
        <div className="text-sm font-medium text-text-strong-950">{label}</div>
        <div className="mt-1 text-xs text-text-sub-600">{hint}</div>
      </div>
      <div className="flex justify-end">{control}</div>
    </div>
  )
}

/** Row whose right column is just a Switch / Checkbox aligned with a label block. */
export function ToggleRow({
  control,
  label,
  hint,
  swap,
}: {
  control: React.ReactNode
  label: React.ReactNode
  hint: React.ReactNode
  /** If true: label on left, control on right (matches Tax / Inventory / Categories source). */
  swap?: boolean
}) {
  if (swap) {
    return (
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="text-sm font-medium text-text-strong-950">{label}</div>
          <div className="mt-1 text-xs text-text-sub-600">{hint}</div>
        </div>
        {control}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-6">
      {control}
      <div>
        <div className="text-sm font-medium text-text-strong-950">{label}</div>
        <div className="mt-1 text-xs text-text-sub-600">{hint}</div>
      </div>
    </div>
  )
}

/** Frame for live previews (rounded card with subtle border + scroll). */
export function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0">
      {children}
    </div>
  )
}
