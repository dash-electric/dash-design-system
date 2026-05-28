"use client"

import * as React from "react"
import { RiMailCheckLine as MailCheck, RiArrowLeftLine as ArrowLeft } from "@remixicon/react"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/dash/ui/input-otp"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

/**
 * FinanceEmailVerification — port of AlignUI Pro Figma frame
 * "Email Verification [Finance & Banking]" (node 3971:38360).
 *
 * Structure: identical chrome to FinanceResetPassword.
 *  - Top bar + brand + Go Back link.
 *  - Card: icon + title "Enter Verification Code" + description with email + 4-digit OTP + FancyButton + Resend link.
 *  - Footer.
 *
 * Figma source shows a 4-digit code (4-7-0-9). We use a 4-slot InputOTP.
 */

export type FinanceEmailVerificationProps = {
  brand?: React.ReactNode
  email?: string
  length?: 4 | 6
  onSubmit?: (code: string) => void
  onResend?: () => void
  className?: string
}

export function FinanceEmailVerification({
  brand = (
    <div className="flex items-center gap-2">
      <span aria-hidden className="inline-flex size-8 items-center justify-center rounded-lg bg-(--primary-base) text-static-white text-sm font-bold">
        A
      </span>
      <span className="text-sm font-semibold tracking-tight text-text-strong-950">Apex</span>
    </div>
  ),
  email = "arthur@alignui.com",
  length = 4,
  onSubmit,
  onResend,
  className,
}: FinanceEmailVerificationProps) {
  const [code, setCode] = React.useState("")
  const slots = Array.from({ length }, (_, i) => i)

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
            onSubmit?.(code)
          }}
          className="relative z-[1] w-full max-w-[440px] rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-8 shadow-custom-md"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div
              aria-hidden
              className="inline-flex size-16 items-center justify-center rounded-2xl bg-bg-weak-50 ring-8 ring-bg-weak-50/40"
            >
              <MailCheck className="size-7 text-text-strong-950" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
                Enter Verification Code
              </h1>
              <p className="mt-1 text-sm text-text-sub-600">
                We&rsquo;ve sent a code to{" "}
                <span className="font-medium text-text-strong-950">{email}</span>
              </p>
            </div>
          </div>

          <Divider className="my-6" />

          <div className="flex justify-center">
            <InputOTP maxLength={length} value={code} onChange={setCode}>
              <InputOTPGroup>
                {slots.map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-16 w-16 text-2xl" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <FancyButton
            type="submit"
            tone="primary"
            size="md"
            className="mt-6 w-full"
            disabled={code.length !== length}
          >
            Submit Code
          </FancyButton>

          <div className="mt-6 flex flex-col items-center gap-1 text-center text-sm">
            <span className="text-text-sub-600">Experiencing issues receiving the code?</span>
            <LinkButton tone="primary" size="md" onClick={onResend}>
              Resend code
            </LinkButton>
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
