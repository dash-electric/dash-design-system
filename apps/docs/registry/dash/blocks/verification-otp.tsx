"use client"

import * as React from "react"
import Link from "next/link"
import { RiArrowLeftLine as ArrowLeft } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/registry/dash/ui/input-otp"

/**
 * 6-digit OTP verification block — Dash mitra KYC second-factor.
 */
export function VerificationOtpBlock() {
  const [value, setValue] = React.useState("")
  return (
    <form className="w-full max-w-sm space-y-6 text-center">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">Verifikasi nomor HP</h1>
        <p className="text-sm text-text-sub-600">
          Masukkan 6-digit kode yang dikirim ke{" "}
          <span className="text-text-strong-950 font-medium">+62 812 8***</span>.
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button tone="primary" style="filled" className="w-full" disabled={value.length < 6}>Verifikasi</Button>

      <div className="space-y-2 text-sm">
        <p className="text-text-sub-600">
          Belum dapat kode?{" "}
          <button type="button" className="text-(--dash-purple-600) font-medium hover:underline">Kirim ulang (30s)</button>
        </p>
        <Link href="/login" className="inline-flex items-center gap-1.5 text-text-sub-600 hover:text-text-strong-950">
          <ArrowLeft className="size-3.5" /> Kembali ke login
        </Link>
      </div>
    </form>
  )
}
