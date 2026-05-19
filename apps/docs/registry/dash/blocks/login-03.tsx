"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiLockLine as Lock, RiSparkling2Line as Sparkles } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Badge } from "@/registry/dash/ui/badge"

/**
 * Login split-screen with hero panel (left: branding, right: form).
 */
export function LoginBlock03() {
  return (
    <div className="grid min-h-[600px] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 lg:grid-cols-2">
      {/* Hero panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-(--dash-purple-700) via-(--dash-purple-600) to-(--dash-purple-900) text-text-white-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 size-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative space-y-1.5">
          <div className="text-xs uppercase tracking-widest opacity-70">Dash</div>
          <div className="text-3xl font-semibold tracking-tight">Operasi tanpa hambatan</div>
        </div>
        <div className="relative space-y-4">
          <Badge appearance="lighter" status="information" className="bg-white/15 text-text-white-0 border-white/20">
            <Sparkles className="size-3" /> Lebaran rate freeze
          </Badge>
          <blockquote className="text-lg leading-relaxed opacity-90">
            "Dashboard Halo-dash bantu kita pantau 700+ mitra realtime. Skala Bekasi sampai Surabaya tanpa drama."
          </blockquote>
          <div className="text-sm opacity-70">— Fayzul A., Halo-dash Lead</div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center p-8 lg:p-12">
        <form className="w-full max-w-sm space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">Masuk ke Dash</h1>
            <p className="text-sm text-text-sub-600">Akses dashboard mitra & ops Anda.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <InputRoot>
                <InputIcon><Mail className="size-4" strokeWidth={1.75} /></InputIcon>
                <Input id="email" type="email" placeholder="anda@dash.id" />
              </InputRoot>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-(--dash-purple-600) hover:underline">Lupa?</Link>
              </div>
              <InputRoot>
                <InputIcon><Lock className="size-4" strokeWidth={1.75} /></InputIcon>
                <Input id="password" type="password" placeholder="••••••••" />
              </InputRoot>
            </div>
          </div>
          <Button tone="primary" style="filled" className="w-full">Masuk</Button>
          <p className="text-center text-sm text-text-sub-600">
            Belum punya akun?{" "}
            <Link href="/signup" className="text-(--dash-purple-600) font-medium hover:underline">Daftar mitra</Link>
          </p>
        </form>
      </main>
    </div>
  )
}
