"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiArrowLeftLine as ArrowLeft } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"

/**
 * Forgot password — email-only reset request form.
 */
export function ForgotPasswordBlock01() {
  return (
    <form className="w-full max-w-sm space-y-5">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">Reset password</h1>
        <p className="text-sm text-text-sub-600">
          Masukkan email Anda. Kami akan kirim link reset valid 1 jam.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <InputRoot>
          <InputIcon><Mail className="size-4" strokeWidth={1.75} /></InputIcon>
          <Input id="email" type="email" placeholder="anda@dash.id" autoComplete="email" />
        </InputRoot>
      </div>

      <Button tone="primary" style="filled" className="w-full">Kirim link reset</Button>

      <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-text-sub-600 hover:text-text-strong-950">
        <ArrowLeft className="size-3.5" /> Kembali ke login
      </Link>
    </form>
  )
}
