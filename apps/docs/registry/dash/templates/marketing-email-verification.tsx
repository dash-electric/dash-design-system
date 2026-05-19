"use client"

import * as React from "react"
import { RiDoubleQuotesL as Quote } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/dash/ui/input-otp"
import { cn } from "@/registry/dash/lib/utils"

export type MarketingEmailVerificationProps = {
  brand?: React.ReactNode
  email?: string
  testimonial?: { quote: string; name: string; role: string; initials?: string }
  goBackHref?: string
  className?: string
}

/**
 * MarketingEmailVerification — split-screen OTP verification page.
 * Ported from AlignUI Pro Figma node `164865:37357`.
 */
export function MarketingEmailVerification({
  brand = <span className="text-2xl font-semibold tracking-tight">Catalyst</span>,
  email = "james@alignui.com",
  testimonial = {
    quote: "The Marketing Management app has revolutionized our tasks. It's efficient and user-friendly, streamlining planning to tracking.",
    name: "Wei Chen",
    role: "CEO / Catalyst",
    initials: "WC",
  },
  goBackHref = "#login",
  className,
}: MarketingEmailVerificationProps) {
  const [code, setCode] = React.useState("4709")

  return (
    <div className={cn("min-h-screen grid lg:grid-cols-2 bg-bg-white-0", className)}>
      {/* Form pane */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <div>{brand}</div>
          <div className="text-sm text-text-sub-600">
            Changed your mind?{" "}
            <a href={goBackHref} className="text-(--dash-purple-700) font-medium hover:underline">
              Go back
            </a>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-text-strong-950">
              Enter Verification Code
            </h1>
            <p className="mt-2 text-sm text-text-sub-600">
              We&apos;ve sent a code to <span className="font-medium text-text-strong-950">{email}</span>
            </p>
          </div>

          <form className="space-y-5">
            <InputOTP maxLength={4} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>

            <Button tone="primary" style="filled" className="w-full">Verify</Button>

            <div className="text-center text-sm text-text-sub-600">
              Experiencing issues receiving the code?{" "}
              <a href="#resend" className="text-(--dash-purple-700) font-medium hover:underline">
                Resend code
              </a>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between text-xs text-text-soft-400 mt-8">
          <span>© 2024 Catalyst</span>
          <span>ENG</span>
        </div>
      </div>

      {/* Testimonial pane */}
      <div className="hidden lg:flex bg-(--dash-purple-50) items-center justify-center p-12">
        <div className="relative max-w-md rounded-2xl bg-gradient-to-br from-(--dash-purple-600) to-(--dash-purple-900) text-static-white p-8 shadow-custom-lg">
          <Quote className="size-8 opacity-40 mb-4" aria-hidden />
          <p className="text-lg leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
          <div className="mt-8 flex items-center gap-3">
            <Avatar size="md">
              <AvatarFallback>{testimonial.initials ?? "?"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{testimonial.name}</div>
              <div className="text-xs opacity-70">{testimonial.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
