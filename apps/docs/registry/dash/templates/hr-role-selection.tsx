"use client"

import * as React from "react"
import { RiUserSettingsLine as UserCog, RiUserLine as User, RiBriefcaseLine as Briefcase } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import {
  OnboardingTopNav,
  OnboardingBottomBar,
} from "@/registry/dash/templates/hr-personal-information"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrRoleSelection — ported 1:1 (structural parity) from AlignUI Pro Figma node 3904:29701.
 * Synergy HR onboarding step 2 of 5. Two radio cards (Employee / Employer).
 */

export type HrRoleSelectionProps = {
  brand?: React.ReactNode
  defaultRole?: "employee" | "employer"
  onContinue?: (role: "employee" | "employer") => void
  onBack?: () => void
  className?: string
}

const steps = ["Personal", "Role", "Position", "Password", "Summary"]

const roles = [
  {
    id: "employee" as const,
    icon: User,
    title: "I'm an Employee",
    description: "Join as an employee to access Synergy.",
  },
  {
    id: "employer" as const,
    icon: Briefcase,
    title: "I'm an Employer",
    description: "Join as an employer to access Synergy.",
  },
]

export function HrRoleSelection({
  brand,
  defaultRole = "employee",
  onContinue,
  onBack,
  className,
}: HrRoleSelectionProps) {
  const [role, setRole] = React.useState<"employee" | "employer">(defaultRole)

  return (
    <div className={cn("min-h-screen flex flex-col bg-bg-white-0", className)}>
      <OnboardingTopNav brand={brand} currentStep={1} steps={steps} />

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto size-14 rounded-full bg-bg-weak-50 border border-stroke-soft-200 grid place-items-center mb-4">
              <UserCog className="size-6 text-icon-sub-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
              Role Selection
            </h1>
            <p className="mt-1 text-sm text-text-sub-600">
              Choose your role within Synergy.
            </p>
          </div>

          <div role="radiogroup" aria-label="Select role" className="space-y-3">
            {roles.map((r) => {
              const Icon = r.icon
              const selected = role === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "w-full flex items-start gap-3 rounded-xl border bg-bg-white-0 px-4 py-3.5 text-left transition-colors",
                    selected
                      ? "border-(--primary-base) ring-2 ring-(--primary-alpha-16)"
                      : "border-stroke-soft-200 hover:border-stroke-sub-300",
                  )}
                >
                  <span className="size-10 shrink-0 rounded-full bg-bg-weak-50 border border-stroke-soft-200 grid place-items-center">
                    <Icon className="size-4 text-icon-sub-600" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-text-strong-950">
                      {r.title}
                    </span>
                    <span className="block text-xs text-text-sub-600 mt-0.5">
                      {r.description}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "size-5 rounded-full border grid place-items-center transition-colors",
                      selected
                        ? "border-(--primary-base) bg-(--primary-base)"
                        : "border-stroke-soft-200",
                    )}
                  >
                    {selected ? <span className="size-1.5 rounded-full bg-text-white-0" /> : null}
                  </span>
                </button>
              )
            })}
          </div>

          <Button
            tone="primary"
            style="filled"
            size="lg"
            type="button"
            className="w-full mt-6"
            onClick={() => onContinue?.(role)}
          >
            Continue
          </Button>
        </div>
      </main>

      <OnboardingBottomBar onBack={onBack} />
    </div>
  )
}
