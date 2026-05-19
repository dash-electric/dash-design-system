"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiLockLine as Lock, RiUserLine as User } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { SocialButton } from "@/registry/dash/ui/social-button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Divider } from "@/registry/dash/ui/divider"

/**
 * Signup with social SSO row above the email form.
 */
export function SignupBlock02() {
  return (
    <form className="w-full max-w-sm space-y-5">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">Daftar mitra Dash</h1>
        <p className="text-sm text-text-sub-600">Bergabung dengan 700+ mitra aktif.</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <SocialButton brand="google" label="Daftar dengan Google" className="w-full" />
        <SocialButton brand="apple" label="Daftar dengan Apple" className="w-full" />
      </div>

      <div className="relative">
        <Divider />
        <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-bg-white-0 px-3 text-xs text-text-soft-400 uppercase tracking-wider">atau email</span>
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
          <Label htmlFor="password">Password</Label>
          <InputRoot>
            <InputIcon><Lock className="size-4" strokeWidth={1.75} /></InputIcon>
            <Input id="password" type="password" placeholder="Min. 8 karakter" />
          </InputRoot>
        </div>
      </div>

      <Button tone="primary" style="filled" className="w-full">Daftar mitra</Button>

      <p className="text-center text-sm text-text-sub-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-(--dash-purple-600) font-medium hover:underline">Masuk</Link>
      </p>
    </form>
  )
}
