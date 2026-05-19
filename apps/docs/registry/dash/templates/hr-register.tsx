"use client"

import * as React from "react"
import { RiCheckLine as Check, RiErrorWarningLine as AlertCircle } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { PasswordInput } from "@/registry/dash/ui/password-input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { SocialButton } from "@/registry/dash/ui/social-button"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrRegister — ported 1:1 (structural parity) from AlignUI Pro Figma node 3902:26059.
 * Synergy HR Register page. Mirror of Login split-screen with full-name + email + password + checklist.
 */

export type HrRegisterProps = {
  brand?: React.ReactNode
  illustration?: React.ReactNode
  onSubmit?: (data: { fullName: string; email: string; password: string }) => void
  className?: string
}

const passwordRules = [
  { id: "uppercase", label: "At least 1 uppercase", met: false },
  { id: "number", label: "At least 1 number", met: false },
  { id: "chars", label: "At least 8 characters", met: false },
]

export function HrRegister({
  brand,
  illustration,
  onSubmit,
  className,
}: HrRegisterProps) {
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const rules = passwordRules.map((r) => ({
    ...r,
    met:
      r.id === "uppercase"
        ? /[A-Z]/.test(password)
        : r.id === "number"
        ? /\d/.test(password)
        : password.length >= 8,
  }))

  return (
    <div className={cn("min-h-screen grid lg:grid-cols-2 bg-bg-white-0", className)}>
      {/* Left — form */}
      <div className="flex flex-col px-6 py-8 lg:px-16 lg:py-10">
        <div className="flex items-center justify-between mb-12">
          {brand ?? (
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-(--primary-base) grid place-items-center text-text-white-0 font-semibold">
                S
              </div>
              <span className="text-base font-semibold tracking-tight">Synergy HR</span>
            </div>
          )}
          <Button tone="neutral" style="ghost" size="sm">ENG</Button>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-3xl font-semibold tracking-tight text-text-strong-950">
            Create a new account
          </h1>
          <p className="mt-2 text-text-sub-600">Enter your details to register.</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit?.({ fullName, email, password })
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="fullname">Full Name</Label>
              <InputRoot>
                <Input
                  id="fullname"
                  placeholder="James Brown"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </InputRoot>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <InputRoot>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@alignui.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputRoot>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="• • • • • • • • • •"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-text-sub-600">
                Must contain 1 uppercase letter, 1 number, min. 8 characters.
              </p>
              <ul className="mt-2 space-y-1">
                {rules.map((r) => (
                  <li
                    key={r.id}
                    className={cn(
                      "flex items-center gap-1.5 text-xs",
                      r.met ? "text-state-success-base" : "text-text-soft-400",
                    )}
                  >
                    {r.met ? (
                      <Check className="size-3" />
                    ) : (
                      <AlertCircle className="size-3" />
                    )}
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>

            <Button tone="primary" style="filled" size="lg" type="submit" className="w-full">
              Register
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-text-soft-400">
            <Divider className="flex-1" />
            OR
            <Divider className="flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <SocialButton brand="google" style="stroke">
              Google
            </SocialButton>
            <SocialButton brand="apple" style="stroke">
              Apple
            </SocialButton>
            <SocialButton brand="github" style="stroke">
              GitHub
            </SocialButton>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm">
          <span className="text-text-sub-600">
            Already have an account?{" "}
            <LinkButton href="#" tone="primary">
              Login
            </LinkButton>
          </span>
          <span className="text-xs text-text-soft-400">© 2024 Synergy HR</span>
        </div>
      </div>

      {/* Right — illustration (shared with hr-login) */}
      <aside
        className="hidden lg:flex items-center justify-center bg-(--dash-purple-50) p-12"
        aria-hidden
      >
        {illustration ?? (
          // TODO: figma-audit/hold-list.md — Register illustration (Figma 3903:27620)
          // not exported; reusing Time Off promo card.
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-(--dash-purple-300) via-(--dash-purple-500) to-(--dash-purple-800) text-text-white-0 p-8 space-y-6 shadow-custom-md">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider opacity-90">
              <span>Time Off</span>
              <button className="opacity-80 hover:opacity-100">See All</button>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-semibold tracking-tight">10</span>
                <span className="text-sm uppercase tracking-wider opacity-80">out of 20</span>
              </div>
              <div className="h-1.5 bg-white/15 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-text-white-0 w-1/2" />
              </div>
            </div>
            <div className="pt-4 border-t border-white/20">
              <div className="text-lg font-semibold leading-tight">
                Stay in Control of Your Time Off
              </div>
              <p className="text-sm opacity-90 mt-1.5 leading-relaxed">
                Track your time off balance and manage requests with the Time Off widget, ensuring a stress-free experience.
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
