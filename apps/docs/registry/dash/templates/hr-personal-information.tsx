"use client"

import * as React from "react"
import { RiUserLine as User, RiAtLine as AtSign, RiPhoneLine as Phone, RiCloseLine as X, RiArrowLeftSLine as ChevronLeft, RiArrowDownSLine as ChevronDown, RiInformationLine as Info } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { StepIndicator, Step } from "@/registry/dash/ui/step-indicator"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrPersonalInformation — ported 1:1 (structural parity) from AlignUI Pro Figma node 3903:29361.
 * Synergy HR onboarding step 1 of 5. Layout:
 *   - Top nav: brand + horizontal step indicator (Personal / Role / Position / Password / Summary) + close
 *   - Center card: Custom Icon + heading + 3 inputs (Full Name / Username with prefix / Phone with country select)
 *   - Continue CTA + Back button
 *
 * Stepper, hint texts and country dropdown are visual stubs.
 */

export type HrPersonalInformationProps = {
  brand?: React.ReactNode
  onContinue?: (data: { fullName: string; username: string; phone: string }) => void
  onBack?: () => void
  className?: string
}

const steps = ["Personal", "Role", "Position", "Password", "Summary"]

export function HrPersonalInformation({
  brand,
  onContinue,
  onBack,
  className,
}: HrPersonalInformationProps) {
  const [fullName, setFullName] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [phone, setPhone] = React.useState("")

  return (
    <div className={cn("min-h-screen flex flex-col bg-bg-white-0", className)}>
      <OnboardingTopNav brand={brand} currentStep={0} steps={steps} />

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="mx-auto size-14 rounded-full bg-bg-weak-50 border border-stroke-soft-200 grid place-items-center mb-4">
              <User className="size-6 text-icon-sub-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
              Personal Information
            </h1>
            <p className="mt-1 text-sm text-text-sub-600">
              Provide essential information to proceed.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onContinue?.({ fullName, username, phone })
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="fullname">Full Name</Label>
              <InputRoot>
                <InputIcon><User /></InputIcon>
                <Input
                  id="fullname"
                  placeholder="James Brown"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </InputRoot>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <InputRoot>
                <InputIcon><AtSign /></InputIcon>
                <span className="text-sm text-text-soft-400 select-none pr-1">synergy.com/</span>
                <Input
                  id="username"
                  placeholder="jamesbrown123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </InputRoot>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <InputRoot>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-text-strong-950 pr-2 border-r border-stroke-soft-200"
                  aria-label="Country code"
                >
                  🇺🇸 +1 <ChevronDown className="size-3" />
                </button>
                <InputIcon><Phone /></InputIcon>
                <Input
                  id="phone"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </InputRoot>
              <p className="flex items-center gap-1 text-xs text-text-sub-600">
                <Info className="size-3" />
                This is a hint text to help user.
              </p>
            </div>

            <Button
              tone="primary"
              style="filled"
              size="lg"
              type="submit"
              className="w-full mt-2"
            >
              Continue
            </Button>
          </form>
        </div>
      </main>

      <OnboardingBottomBar onBack={onBack} />
    </div>
  )
}

/* ============================================================
 * Shared sub-shells (inlined per template by Figma source)
 * ============================================================ */

export function OnboardingTopNav({
  brand,
  currentStep,
  steps: stepLabels,
}: {
  brand?: React.ReactNode
  currentStep: number
  steps: string[]
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 lg:px-10 py-5 border-b border-stroke-soft-200">
      {brand ?? (
        <div className="flex items-center gap-2 shrink-0">
          <div className="size-8 rounded-lg bg-(--primary-base) grid place-items-center text-text-white-0 font-semibold">
            S
          </div>
          <span className="hidden sm:inline text-base font-semibold tracking-tight">
            Synergy HR
          </span>
        </div>
      )}

      <StepIndicator className="hidden md:flex">
        {stepLabels.map((label, i) => (
          <Step
            key={label}
            index={i}
            status={i < currentStep ? "completed" : i === currentStep ? "current" : "upcoming"}
            label={label}
            withConnector={i < stepLabels.length - 1}
          />
        ))}
      </StepIndicator>

      <Button tone="neutral" style="ghost" size="sm" aria-label="Close">
        <X className="size-4" />
      </Button>
    </header>
  )
}

export function OnboardingBottomBar({ onBack }: { onBack?: () => void }) {
  return (
    <footer className="flex items-center justify-between gap-4 px-6 lg:px-10 py-5 border-t border-stroke-soft-200">
      <Button tone="neutral" style="stroke" size="sm" onClick={onBack}>
        <ChevronLeft className="size-3.5" /> Back
      </Button>
      <div className="flex items-center gap-3 text-xs text-text-soft-400">
        <span>© 2024 Synergy HR</span>
        <span>🌐 ENG</span>
      </div>
    </footer>
  )
}
