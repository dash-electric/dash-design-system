"use client"

import * as React from "react"
import { RiMailLine as Mail } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrResetPassword — ported 1:1 (structural parity) from AlignUI Pro Figma node 3902:26187.
 * Synergy HR Reset Password page. Mirror of Login split-screen with email-only form.
 */

export type HrResetPasswordProps = {
  brand?: React.ReactNode
  illustration?: React.ReactNode
  onSubmit?: (email: string) => void
  onGoBack?: () => void
  className?: string
}

export function HrResetPassword({
  brand,
  illustration,
  onSubmit,
  onGoBack,
  className,
}: HrResetPasswordProps) {
  const [email, setEmail] = React.useState("")

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
            Reset Password
          </h1>
          <p className="mt-2 text-text-sub-600">
            Enter your email to reset your password.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit?.(email)
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <InputRoot>
                <InputIcon>
                  <Mail className="size-4" />
                </InputIcon>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@alignui.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputRoot>
              <p className="text-xs text-text-sub-600">
                Enter the email with which you&apos;ve registered.
              </p>
            </div>

            <Button tone="primary" style="filled" size="lg" type="submit" className="w-full">
              Reset Password
            </Button>
          </form>

          <div className="mt-6 text-sm text-text-sub-600">
            Don&apos;t have access anymore?{" "}
            <LinkButton href="#" tone="primary">
              Try another method
            </LinkButton>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm">
          <span className="text-text-sub-600">
            Changed your mind?{" "}
            <LinkButton
              href="#"
              tone="primary"
              onClick={(e) => {
                e.preventDefault()
                onGoBack?.()
              }}
            >
              Go back
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
          // TODO: figma-audit/hold-list.md — Reset Password illustration (Figma 3903:27675)
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
