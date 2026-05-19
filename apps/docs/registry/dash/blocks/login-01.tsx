"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiLockLine as Lock } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Checkbox } from "@/registry/dash/ui/checkbox"

/**
 * Login (classic — email + password centered).
 * Compose inside AuthShell or render standalone.
 */
export function LoginBlock01() {
  return (
    <form className="w-full max-w-sm space-y-5">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">Masuk ke Dash</h1>
        <p className="text-sm text-text-sub-600">Selamat datang kembali — kelola operasi mitra Anda.</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <InputRoot>
            <InputIcon><Mail className="size-4" strokeWidth={1.75} /></InputIcon>
            <Input id="email" type="email" placeholder="anda@dash.id" autoComplete="email" />
          </InputRoot>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-(--dash-purple-600) hover:underline">Lupa password?</Link>
          </div>
          <InputRoot>
            <InputIcon><Lock className="size-4" strokeWidth={1.75} /></InputIcon>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </InputRoot>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-sub-600">
        <Checkbox id="remember" />
        <span>Ingat saya selama 30 hari</span>
      </label>

      <Button tone="primary" style="filled" className="w-full">Masuk</Button>

      <p className="text-center text-sm text-text-sub-600">
        Belum punya akun?{" "}
        <Link href="/signup" className="text-(--dash-purple-600) font-medium hover:underline">Daftar mitra</Link>
      </p>
    </form>
  )
}
