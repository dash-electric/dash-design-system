"use client"

import * as React from "react"
import { RiMailLine as Mail, RiKey2Line as KeyRound, RiArrowLeftLine as ArrowLeft } from "@remixicon/react"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Hint } from "@/registry/dash/ui/hint"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

/**
 * FinanceResetPassword — port of AlignUI Pro Figma frame
 * "Reset Password [Finance & Banking]" (node 3971:38279).
 *
 * Structure: identical chrome to FinanceRegister, single-field card.
 *  - Top bar: brand + "Changed your mind? · Go Back"
 *  - Card: icon + title "Reset Password" + description + Email input + FancyButton + try-another fallback link.
 *  - Footer bar.
 */

export type FinanceResetPasswordProps = {
  brand?: React.ReactNode
  onSubmit?: (email: string) => void
  className?: string
}

export function FinanceResetPassword({
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
}: FinanceResetPasswordProps) {
  const [email, setEmail] = React.useState("")

  return (
    <div className={cn("relative min-h-screen flex flex-col bg-bg-weak-50", className)}>
      <header className="flex items-center justify-between px-6 py-6 lg:px-10">
        {brand}
        <div className="flex items-center gap-2 text-sm text-text-sub-600">
          <span className="hidden sm:inline">Changed your mind?</span>
          <LinkButton tone="muted" size="md">
            <ArrowLeft className="size-3.5" /> Go Back
          </LinkButton>
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
            onSubmit?.(email)
          }}
          className="relative z-[1] w-full max-w-[440px] rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-8 shadow-custom-md"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div
              aria-hidden
              className="inline-flex size-16 items-center justify-center rounded-2xl bg-bg-weak-50 ring-8 ring-bg-weak-50/40"
            >
              <KeyRound className="size-7 text-text-strong-950" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
                Reset Password
              </h1>
              <p className="mt-1 text-sm text-text-sub-600">
                Enter your email to reset your password.
              </p>
            </div>
          </div>

          <Divider className="my-6" />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-email">Email Address</Label>
            <InputRoot>
              <InputIcon>
                <Mail className="size-4" />
              </InputIcon>
              <Input
                id="reset-email"
                type="email"
                placeholder="hello@alignui.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </InputRoot>
            <Hint className="mt-1 text-text-sub-600">
              We&apos;ll send a recovery link to this address.
            </Hint>
          </div>

          <FancyButton type="submit" tone="primary" size="md" className="mt-6 w-full">
            Reset Password
          </FancyButton>

          <div className="mt-6 flex flex-col items-center gap-1 text-center text-sm">
            <span className="text-text-sub-600">Don&rsquo;t have access anymore?</span>
            <LinkButton tone="primary" size="md">Try another method</LinkButton>
          </div>
        </form>
      </main>

      <footer className="flex flex-col items-center justify-between gap-2 px-6 py-6 sm:flex-row sm:px-10">
        <p className="text-xs text-text-sub-600">© 2024 Apex Financial</p>
        <p className="text-xs text-text-sub-600">ENG</p>
      </footer>
    </div>
  )
}
