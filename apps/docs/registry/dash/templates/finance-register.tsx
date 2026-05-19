"use client"

import * as React from "react"
import { RiMailLine as Mail, RiUserLine as UserIcon, RiCheckLine as Check, RiCloseLine as X, RiUserAddLine as UserPlus } from "@remixicon/react"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { PasswordInput } from "@/registry/dash/ui/password-input"
import { Label } from "@/registry/dash/ui/label"
import { Hint } from "@/registry/dash/ui/hint"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

/**
 * FinanceRegister — port of AlignUI Pro Figma frame
 * "Register Page [Finance & Banking]" (node 3971:38198).
 *
 * Structure mirrors FinanceLogin:
 *  - Top bar: Apex brand + "Already have an account? · Login"
 *  - Decorative pattern.
 *  - Centered card (440 wide):
 *      Header icon + title "Create a new account" + description.
 *      Forms — Full Name + Email + Password with live 3-rule checklist + strength bar.
 *      FancyButton — Register.
 *      Supporting — "By clicking Register, you agree…" + Forgot password link.
 *  - Footer bar: copyright + language select.
 */

export type FinanceRegisterProps = {
  brand?: React.ReactNode
  onSubmit?: (data: { fullName: string; email: string; password: string }) => void
  className?: string
}

const rules = [
  { id: "uppercase", label: "At least 1 uppercase", test: (v: string) => /[A-Z]/.test(v) },
  { id: "number", label: "At least 1 number", test: (v: string) => /\d/.test(v) },
  { id: "chars", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
]

export function FinanceRegister({
  brand = (
    <div className="flex items-center gap-2">
      <span aria-hidden className="inline-flex size-8 items-center justify-center rounded-lg bg-(--primary-base) text-static-white text-sm font-bold">
        A
      </span>
      <span className="text-sm font-semibold tracking-tight text-text-strong-950">Apex</span>
    </div>
  ),
  onSubmit,
  className,
}: FinanceRegisterProps) {
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const score = rules.reduce((n, r) => n + (r.test(password) ? 1 : 0), 0)

  return (
    <div className={cn("relative min-h-screen flex flex-col bg-bg-weak-50", className)}>
      <header className="flex items-center justify-between px-6 py-5 lg:px-10">
        {brand}
        <div className="flex items-center gap-2 text-sm text-text-sub-600">
          <span className="hidden sm:inline">Already have an account?</span>
          <LinkButton tone="muted" size="md">Login</LinkButton>
        </div>
      </header>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-[440px] w-full max-w-[1140px] rounded-[40px] bg-gradient-to-b from-(--dash-purple-200)/40 via-(--dash-purple-50)/30 to-transparent opacity-70"
      />

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit?.({ fullName, email, password })
          }}
          className="relative z-[1] w-full max-w-[440px] rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-8 shadow-custom-md"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div
              aria-hidden
              className="inline-flex size-16 items-center justify-center rounded-2xl bg-bg-weak-50 ring-8 ring-bg-weak-50/40"
            >
              <UserPlus className="size-7 text-text-strong-950" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
                Create a new account
              </h1>
              <p className="mt-1 text-sm text-text-sub-600">Enter your details to register.</p>
            </div>
          </div>

          <Divider className="my-6" />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-name">Full Name</Label>
              <InputRoot>
                <InputIcon>
                  <UserIcon className="size-4" />
                </InputIcon>
                <Input
                  id="reg-name"
                  placeholder="James Brown"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </InputRoot>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-email">Email Address</Label>
              <InputRoot>
                <InputIcon>
                  <Mail className="size-4" />
                </InputIcon>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="hello@alignui.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </InputRoot>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <PasswordInput
                id="reg-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="new-password"
              />
              <Hint className="mt-1 text-text-sub-600">
                Must contain 1 uppercase letter, 1 number, min. 8 characters.
              </Hint>

              {/* Strength bar — 3 segments */}
              <div className="mt-2 grid grid-cols-3 gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-colors",
                      i < score
                        ? score >= 3
                          ? "bg-(--state-success-base)"
                          : score === 2
                          ? "bg-(--state-warning-base)"
                          : "bg-(--state-error-base)"
                        : "bg-stroke-soft-200",
                    )}
                  />
                ))}
              </div>

              <ul className="mt-2 flex flex-col gap-1 pl-0.5">
                {rules.map((r) => {
                  const ok = r.test(password)
                  return (
                    <li
                      key={r.id}
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
                        {ok ? <Check className="size-2.5" strokeWidth={3} /> : <X className="size-2.5" strokeWidth={3} />}
                      </span>
                      {r.label}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <FancyButton type="submit" tone="primary" size="md" className="mt-6 w-full">
            Register
          </FancyButton>

          <div className="mt-4 text-center text-xs text-text-sub-600">
            By clicking Register, you agree to accept Apex Financial&apos;s{" "}
            <LinkButton tone="primary" size="md">Terms</LinkButton>{" "}
            and{" "}
            <LinkButton tone="primary" size="md">Privacy Policy</LinkButton>.
          </div>
        </form>
      </main>

      <footer className="flex flex-col items-center justify-between gap-2 px-6 py-5 sm:flex-row sm:px-10">
        <p className="text-xs text-text-sub-600">© 2024 Apex Financial</p>
        <p className="text-xs text-text-sub-600">ENG</p>
      </footer>
    </div>
  )
}
