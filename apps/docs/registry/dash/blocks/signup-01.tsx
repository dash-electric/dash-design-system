"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiLockLine as Lock, RiUserLine as User, RiPhoneLine as Phone } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Checkbox } from "@/registry/dash/ui/checkbox"

/**
 * Signup (classic — name + email + phone + password centered).
 */
export function SignupBlock01() {
  return (
    <form className="w-full max-w-sm space-y-5">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">Daftar mitra Dash</h1>
        <p className="text-sm text-text-sub-600">Mulai earning di tribe Reservasi/Express/Bulk.</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama lengkap</Label>
          <InputRoot>
            <InputIcon><User className="size-4" strokeWidth={1.75} /></InputIcon>
            <Input id="name" placeholder="Sigit Prabowo" />
          </InputRoot>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <InputRoot>
            <InputIcon><Mail className="size-4" strokeWidth={1.75} /></InputIcon>
            <Input id="email" type="email" placeholder="anda@dash.id" />
          </InputRoot>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Nomor HP</Label>
          <InputRoot>
            <InputIcon><Phone className="size-4" strokeWidth={1.75} /></InputIcon>
            <Input id="phone" type="tel" placeholder="0812 8xxx xxxx" />
          </InputRoot>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <InputRoot>
            <InputIcon><Lock className="size-4" strokeWidth={1.75} /></InputIcon>
            <Input id="password" type="password" placeholder="Min. 8 karakter" />
          </InputRoot>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-text-sub-600">
        <Checkbox id="terms" className="mt-0.5" />
        <span>
          Saya setuju dengan{" "}
          <Link href="/terms" className="text-(--dash-purple-600) hover:underline">Syarat & Ketentuan</Link> dan{" "}
          <Link href="/privacy" className="text-(--dash-purple-600) hover:underline">Kebijakan Privasi</Link>.
        </span>
      </label>

      <Button tone="primary" style="filled" className="w-full">Daftar mitra</Button>

      <p className="text-center text-sm text-text-sub-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-(--dash-purple-600) font-medium hover:underline">Masuk</Link>
      </p>
    </form>
  )
}
