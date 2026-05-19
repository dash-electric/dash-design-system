"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiLockLine as Lock, RiUserLine as User, RiTruckLine as Truck } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"

/**
 * Signup split-screen with hero panel.
 */
export function SignupBlock03() {
  return (
    <div className="grid min-h-[600px] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 lg:grid-cols-2">
      {/* Hero panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-(--dash-purple-700) via-(--dash-purple-600) to-(--dash-purple-900) text-text-white-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative space-y-1.5">
          <div className="text-xs uppercase tracking-widest opacity-70">Dash</div>
          <div className="text-3xl font-semibold tracking-tight">Mulai earning hari ini</div>
        </div>
        <div className="relative space-y-4">
          <ul className="space-y-2 text-sm opacity-90">
            <li className="flex items-start gap-2"><Truck className="size-4 mt-0.5" /> 3 tribe: Reservasi, Express, Bulk</li>
            <li className="flex items-start gap-2"><Truck className="size-4 mt-0.5" /> Payout harian via BCA/GoPay/DANA</li>
            <li className="flex items-start gap-2"><Truck className="size-4 mt-0.5" /> Surge factor sampai 1.8× saat peak</li>
          </ul>
          <div className="text-sm opacity-70 pt-4 border-t border-white/15">
            Sudah 700+ mitra aktif di Jabodetabek, Bandung, Surabaya.
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center p-8 lg:p-12">
        <form className="w-full max-w-sm space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">Daftar mitra Dash</h1>
            <p className="text-sm text-text-sub-600">Isi data dasar, KYC menyusul.</p>
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
      </main>
    </div>
  )
}
