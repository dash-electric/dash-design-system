"use client"

import * as React from "react"
import { RiShieldLine as Shield, RiSmartphoneLine as Smartphone, RiComputerLine as Monitor, RiLogoutBoxLine as LogOut } from "@remixicon/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Switch } from "@/registry/dash/ui/switch"
import { Badge } from "@/registry/dash/ui/badge"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

type Session = {
  id: string
  device: string
  icon: React.ReactNode
  location: string
  lastActive: string
  current?: boolean
}

const sessions: Session[] = [
  { id: "s1", device: "MacBook Pro · Chrome",    icon: <Monitor className="size-4" />,    location: "Bekasi, ID", lastActive: "Sekarang",     current: true },
  { id: "s2", device: "iPhone 15 · Dash mobile", icon: <Smartphone className="size-4" />, location: "Bekasi, ID", lastActive: "3 jam lalu" },
  { id: "s3", device: "Windows · Edge",          icon: <Monitor className="size-4" />,    location: "Surabaya, ID", lastActive: "2 hari lalu" },
]

/** Settings — privacy & security: 2FA + active sessions + password change. */
export function SettingsPrivacySecurity({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle>Otentikasi dua faktor</CardTitle>
          <CardDescription>Lapisan kedua keamanan untuk akun Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-state-success-lighter text-state-success-base flex items-center justify-center">
                <Shield className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-strong-950">SMS OTP</div>
                <div className="text-xs text-text-sub-600">Kode 6-digit ke +62 812 8***. Aktif sejak 2025-04-12.</div>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <Divider />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-bg-weak-50 text-text-sub-600 flex items-center justify-center">
                <Smartphone className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-strong-950">Authenticator app</div>
                <div className="text-xs text-text-sub-600">Google Authenticator / 1Password / Authy.</div>
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Ganti password</CardTitle>
          <CardDescription>Minimum 8 karakter, kombinasi huruf + angka + simbol.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="oldpw">Password lama</Label>
            <InputRoot><Input id="oldpw" type="password" /></InputRoot>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newpw">Password baru</Label>
            <InputRoot><Input id="newpw" type="password" /></InputRoot>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newpw2">Konfirmasi</Label>
            <InputRoot><Input id="newpw2" type="password" /></InputRoot>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t border-stroke-soft-200">
          <Button tone="neutral" style="stroke">Batal</Button>
          <Button tone="primary" style="filled">Update password</Button>
        </CardFooter>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sesi aktif</CardTitle>
          <CardDescription>Device yang sedang login ke akun Anda.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-stroke-soft-200">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-6 py-3">
                <div className="size-9 rounded-lg bg-bg-weak-50 text-text-sub-600 flex items-center justify-center">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-strong-950">{s.device}</span>
                    {s.current ? <Badge appearance="lighter" status="success">Current</Badge> : null}
                  </div>
                  <div className="text-xs text-text-sub-600">{s.location} · {s.lastActive}</div>
                </div>
                {!s.current ? (
                  <Button tone="destructive" style="stroke" size="xs">
                    <LogOut className="size-3" /> Sign out
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="justify-end border-t border-stroke-soft-200">
          <Button tone="destructive" style="lighter" size="sm">Sign out semua device lain</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
