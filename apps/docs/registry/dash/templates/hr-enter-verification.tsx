"use client"

import * as React from "react"
import { RiMailCheckLine as MailCheck } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/dash/ui/input-otp"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrEnterVerification — ported 1:1 (structural parity) from AlignUI Pro Figma node 3903:26321.
 * Synergy HR verification step. Split-screen mirror of hr-login:
 *   - Left: brand + heading + 4-digit OTP + Verify CTA + resend link
 *   - Right: Time Off promo (illustration placeholder)
 */

export type HrEnterVerificationProps = {
  brand?: React.ReactNode
  illustration?: React.ReactNode
  recipientEmail?: string
  onSubmit?: (code: string) => void
  onResend?: () => void
  onGoBack?: () => void
  className?: string
}

export function HrEnterVerification({
  brand,
  illustration,
  recipientEmail = "james@alignui.com",
  onSubmit,
  onResend,
  onGoBack,
  className,
}: HrEnterVerificationProps) {
  const [code, setCode] = React.useState("")

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
          <div className="mx-auto size-14 rounded-full bg-bg-weak-50 border border-stroke-soft-200 grid place-items-center mb-6">
            <MailCheck className="size-6 text-icon-sub-600" />
          </div>

          <h1 className="text-center text-3xl font-semibold tracking-tight text-text-strong-950">
            Enter Verification Code
          </h1>
          <p className="mt-2 text-center text-text-sub-600">
            We&apos;ve sent a code to{" "}
            <span className="font-medium text-text-strong-950">{recipientEmail}</span>
          </p>

          <form
            className="mt-8 space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit?.(code)
            }}
          >
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={code}
                onChange={setCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              tone="primary"
              style="filled"
              size="lg"
              type="submit"
              className="w-full"
              disabled={code.length < 4}
            >
              Verify
            </Button>

            <p className="text-center text-sm text-text-sub-600">
              Experiencing issues receiving the code?{" "}
              <LinkButton
                href="#"
                tone="primary"
                onClick={(e) => {
                  e.preventDefault()
                  onResend?.()
                }}
              >
                Resend code
              </LinkButton>
            </p>
          </form>
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
          // TODO: figma-audit/hold-list.md — Verification illustration (Figma 3903:27620)
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
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-(--dash-yellow-300)" />
                <span className="flex-1">Jan 15, 2024 (Casual)</span>
                <span className="text-xs opacity-90">Pending</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-(--dash-green-300)" />
                <span className="flex-1">Feb 12, 2024</span>
                <span className="text-xs opacity-90">Confirmed</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-(--dash-red-300)" />
                <span className="flex-1">Feb 12, 2024</span>
                <span className="text-xs opacity-90">Rejected</span>
              </li>
            </ul>
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
