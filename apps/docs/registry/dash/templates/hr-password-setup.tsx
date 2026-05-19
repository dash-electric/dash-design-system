"use client"

import * as React from "react"
import { RiLockLine as Lock, RiCheckLine as Check, RiCloseLine as XIcon } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Label } from "@/registry/dash/ui/label"
import { PasswordInput } from "@/registry/dash/ui/password-input"
import {
  OnboardingTopNav,
  OnboardingBottomBar,
} from "@/registry/dash/templates/hr-personal-information"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrPasswordSetup — ported 1:1 (structural parity) from AlignUI Pro Figma node 3908:30106.
 * Synergy HR onboarding step 4 of 5. Two password fields + live rule checklist
 * (uppercase / number / 8+ chars).
 */

export type HrPasswordSetupProps = {
  brand?: React.ReactNode
  onContinue?: (data: { password: string; confirm: string }) => void
  onBack?: () => void
  className?: string
}

const steps = ["Personal", "Role", "Position", "Password", "Summary"]

const rules = [
  { id: "uppercase" as const, label: "At least 1 uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number" as const, label: "At least 1 number", test: (p: string) => /\d/.test(p) },
  { id: "chars" as const, label: "At least 8 characters", test: (p: string) => p.length >= 8 },
]

export function HrPasswordSetup({
  brand,
  onContinue,
  onBack,
  className,
}: HrPasswordSetupProps) {
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")

  return (
    <div className={cn("min-h-screen flex flex-col bg-bg-white-0", className)}>
      <OnboardingTopNav brand={brand} currentStep={3} steps={steps} />

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto size-14 rounded-full bg-bg-weak-50 border border-stroke-soft-200 grid place-items-center mb-4">
              <Lock className="size-6 text-icon-sub-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
              Password Setup
            </h1>
            <p className="mt-1 text-sm text-text-sub-600">
              Set up a secure password to protect your account.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onContinue?.({ password, confirm })
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="password">Create a Password</Label>
              <PasswordInput
                id="password"
                placeholder="• • • • • • • • • •"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordRules password={password} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm Password</Label>
              <PasswordInput
                id="confirm"
                placeholder="• • • • • • • • • •"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {confirm && confirm !== password ? (
                <p className="text-xs text-error-base">Passwords do not match.</p>
              ) : null}
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

function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1">
      <li className="text-xs text-text-sub-600">Must contain at least:</li>
      {rules.map((r) => {
        const met = r.test(password)
        return (
          <li
            key={r.id}
            className={cn(
              "flex items-center gap-1.5 text-xs",
              met ? "text-state-success-base" : "text-text-soft-400",
            )}
          >
            {met ? <Check className="size-3" /> : <XIcon className="size-3" />}
            {r.label}
          </li>
        )
      })}
    </ul>
  )
}
