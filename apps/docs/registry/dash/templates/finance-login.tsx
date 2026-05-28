"use client"

import * as React from "react"
import { RiMailLine as Mail, RiCheckLine as Check } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { PasswordInput } from "@/registry/dash/ui/password-input"
import { Label } from "@/registry/dash/ui/label"
import { Hint } from "@/registry/dash/ui/hint"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

/**
 * FinanceLogin — port of AlignUI Pro Figma frame
 * "Login Page [Finance & Banking]" (node 3969:30780).
 *
 * Structure (centered card on patterned background):
 *  - Top bar: Apex logo + "Don't have an account? · Register"
 *  - Pattern background.
 *  - Login card (440x524):
 *      Header — title + description.
 *      Forms — Email + Password with strength checklist (3 items).
 *      Supporting — Keep me logged in + Forgot password.
 *      Submit — FancyButton (Login).
 *  - Footer bar: copyright + language select.
 *
 * Pixel parity is approximate; structural parity matches Figma.
 */

export type FinanceLoginProps = {
  brand?: React.ReactNode
  /** When provided, shown above the form title (e.g. "Welcome back to Apex"). */
  eyebrow?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  className?: string
}

const passwordChecks = [
  { label: "At least 1 uppercase", check: (v: string) => /[A-Z]/.test(v) },
  { label: "At least 1 number", check: (v: string) => /\d/.test(v) },
  { label: "At least 8 characters", check: (v: string) => v.length >= 8 },
] as const

export function FinanceLogin({
  brand = (
    <div className="flex items-center gap-2">
      <span aria-hidden className="inline-flex size-8 items-center justify-center rounded-lg bg-(--primary-base) text-static-white text-sm font-bold">
        A
      </span>
      <span className="text-sm font-semibold tracking-tight text-text-strong-950">Apex</span>
    </div>
  ),
  eyebrow,
  title = "Login to your account",
  description = "Enter your details to login.",
  onSubmit,
  className,
}: FinanceLoginProps) {
  const [password, setPassword] = React.useState("")

  return (
    <div className={cn("relative min-h-screen flex flex-col bg-bg-weak-50", className)}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-6 lg:px-10">
        {brand}
        <div className="flex items-center gap-2 text-sm text-text-sub-600">
          <span className="hidden sm:inline">Don&apos;t have an account?</span>
          <LinkButton tone="muted" size="md">
            Register
          </LinkButton>
        </div>
      </header>

      {/* Decorative pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-[440px] w-full max-w-[1140px] rounded-[40px] bg-gradient-to-b from-(--dash-purple-200)/40 via-(--dash-purple-50)/30 to-transparent opacity-70"
      />

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <form
          onSubmit={onSubmit}
          className="relative z-[1] w-full max-w-[440px] rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-8 shadow-custom-md"
        >
          <div className="flex flex-col gap-1">
            {eyebrow ? (
              <p className="text-xs uppercase tracking-wider text-text-sub-600">{eyebrow}</p>
            ) : null}
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">{title}</h1>
            <p className="text-sm text-text-sub-600">{description}</p>
          </div>

          <Divider className="my-6" />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-email">Email Address</Label>
              <InputRoot>
                <InputIcon>
                  <Mail className="size-4" />
                </InputIcon>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="hello@alignui.com"
                  autoComplete="email"
                />
              </InputRoot>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-password">Password</Label>
              <PasswordInput
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
              />
              <Hint className="mt-1 text-text-sub-600">Must contain at least;</Hint>
              <ul className="flex flex-col gap-1 pl-0.5">
                {passwordChecks.map((c) => {
                  const ok = c.check(password)
                  return (
                    <li
                      key={c.label}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs",
                        ok ? "text-(--state-success-base)" : "text-text-sub-600",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "inline-flex size-3.5 items-center justify-center rounded-full",
                          ok ? "bg-(--state-success-base) text-static-white" : "bg-stroke-soft-200",
                        )}
                      >
                        {ok ? <Check className="size-2.5" strokeWidth={3} /> : null}
                      </span>
                      {c.label}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Supporting content */}
          <div className="mt-6 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-text-sub-600">
              <Checkbox defaultChecked />
              Keep me logged in
            </label>
            <LinkButton tone="primary" size="md">
              Forgot password?
            </LinkButton>
          </div>

          {/* Submit */}
          <FancyButton type="submit" tone="primary" size="md" className="mt-6 w-full">
            Login
          </FancyButton>
        </form>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-2 px-6 py-6 sm:flex-row sm:px-10">
        <p className="text-xs text-text-sub-600">© 2024 Apex Financial</p>
        <p className="text-xs text-text-sub-600">ENG</p>
      </footer>
    </div>
  )
}
