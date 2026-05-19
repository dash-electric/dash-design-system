"use client"

import * as React from "react"
import { RiShieldCheckLine as ShieldCheck } from "@remixicon/react"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { BrandMark } from "@/registry/dash/ui/brand-mark"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/dash/ui/input-otp"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Verification Key — 96×96 shield-icon header → 4-digit OTP grid → FancyCTA →
 * resend link. source auth block 8.
 */
export function AuthVerificationKey({ className }: { className?: string }) {
  const [value, setValue] = React.useState("")
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={cn("w-full max-w-[440px] space-y-6", className)}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <BrandMark size="lg" shape="square" tone="neutral" aria-hidden>
          <ShieldCheck strokeWidth={1.5} />
        </BrandMark>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Verifikasi kode 4 digit
          </h1>
          <p className="text-sm text-text-sub-600">
            Masukkan kode yang kami kirim ke email Anda.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={4} value={value} onChange={setValue}>
          <InputOTPGroup className="gap-3">
            <InputOTPSlot index={0} className="size-14 text-lg" />
            <InputOTPSlot index={1} className="size-14 text-lg" />
            <InputOTPSlot index={2} className="size-14 text-lg" />
            <InputOTPSlot index={3} className="size-14 text-lg" />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <FancyButton
        tone="primary"
        size="lg"
        className="w-full"
        type="submit"
        disabled={value.length < 4}
      >
        Verifikasi
      </FancyButton>

      <p className="text-center text-sm text-text-sub-600">
        Belum dapat kode?{" "}
        <LinkButton tone="primary" size="sm" underline="hover">
          Kirim ulang
        </LinkButton>
      </p>
    </form>
  )
}
