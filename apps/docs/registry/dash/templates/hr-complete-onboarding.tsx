"use client"

import * as React from "react"
import { RiCheckboxCircleLine as CheckCircle2, RiUserLine as User, RiAtLine as AtSign, RiMailLine as Mail, RiBriefcaseLine as Briefcase, RiBuilding2Line as Building2, RiPencilLine as Pencil } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import {
  OnboardingTopNav,
  OnboardingBottomBar,
} from "@/registry/dash/templates/hr-personal-information"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrCompleteOnboarding — ported 1:1 (structural parity) from AlignUI Pro Figma node 3908:30330.
 * Synergy HR onboarding step 5 of 5 (summary). Read-only review list of 5 fields
 * (Full Name / Username / Email / Title / Department) each with an Edit pencil action.
 */

export type HrCompleteOnboardingSummary = {
  fullName: string
  username: string
  email: string
  title: string
  department: string
}

export type HrCompleteOnboardingProps = {
  brand?: React.ReactNode
  summary?: HrCompleteOnboardingSummary
  onComplete?: (summary: HrCompleteOnboardingSummary) => void
  onBack?: () => void
  onEdit?: (field: keyof HrCompleteOnboardingSummary) => void
  className?: string
}

const steps = ["Personal", "Role", "Position", "Password", "Summary"]

const defaultSummary: HrCompleteOnboardingSummary = {
  fullName: "James Brown",
  username: "@jamesbrown",
  email: "james@alignui.com",
  title: "Marketing Manager",
  department: "Marketing",
}

export function HrCompleteOnboarding({
  brand,
  summary = defaultSummary,
  onComplete,
  onBack,
  onEdit,
  className,
}: HrCompleteOnboardingProps) {
  const rows: Array<{
    key: keyof HrCompleteOnboardingSummary
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
  }> = [
    { key: "fullName", icon: User, label: "Full Name", value: summary.fullName },
    { key: "username", icon: AtSign, label: "Username", value: summary.username },
    { key: "email", icon: Mail, label: "Email Address", value: summary.email },
    { key: "title", icon: Briefcase, label: "Title", value: summary.title },
    { key: "department", icon: Building2, label: "Department", value: summary.department },
  ]

  return (
    <div className={cn("min-h-screen flex flex-col bg-bg-white-0", className)}>
      <OnboardingTopNav brand={brand} currentStep={4} steps={steps} />

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto size-14 rounded-full bg-(--state-success-lighter) border border-(--state-success-light) grid place-items-center mb-4">
              <CheckCircle2 className="size-6 text-state-success-base" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
              Onboarding Summary
            </h1>
            <p className="mt-1 text-sm text-text-sub-600">
              Review and complete your account setup.
            </p>
          </div>

          <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 divide-y divide-stroke-soft-200">
            {rows.map((row) => {
              const Icon = row.icon
              return (
                <div key={row.key} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="size-8 shrink-0 rounded-full bg-bg-weak-50 border border-stroke-soft-200 grid place-items-center">
                    <Icon className="size-3.5 text-icon-sub-600" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-text-sub-600">{row.label}</div>
                    <div className="text-sm font-medium text-text-strong-950 truncate">
                      {row.value}
                    </div>
                  </div>
                  <Button
                    tone="neutral"
                    style="ghost"
                    size="sm"
                    onClick={() => onEdit?.(row.key)}
                    aria-label={`Edit ${row.label}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              )
            })}
          </div>

          <Button
            tone="primary"
            style="filled"
            size="lg"
            type="button"
            className="w-full mt-6"
            onClick={() => onComplete?.(summary)}
          >
            Complete
          </Button>
        </div>
      </main>

      <OnboardingBottomBar onBack={onBack} />
    </div>
  )
}

