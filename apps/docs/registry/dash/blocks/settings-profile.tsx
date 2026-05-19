"use client"

import * as React from "react"
import { RiCameraLine as Camera } from "@remixicon/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { cn } from "@/registry/dash/lib/utils"

export type SettingsProfileProps = {
  className?: string
  defaultName?: string
  defaultEmail?: string
  defaultPhone?: string
  defaultBio?: string
}

/** Settings — profile section. Avatar upload + name/email/phone/bio. */
export function SettingsProfile({
  className,
  defaultName = "Sigit Prabowo",
  defaultEmail = "sigit@dash.id",
  defaultPhone = "0812 8000 4421",
  defaultBio = "Mitra Reservasi · Bekasi. Aktif sejak 2023.",
}: SettingsProfileProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Informasi dasar mitra. Ditampilkan ke pelanggan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar size="2xl">
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
            <button
              type="button"
              aria-label="Ganti foto"
              className="absolute -bottom-1 -right-1 size-8 rounded-full bg-(--dash-purple-600) text-text-white-0 flex items-center justify-center shadow-custom-md hover:bg-(--dash-purple-700)"
            >
              <Camera className="size-4" />
            </button>
          </div>
          <div>
            <div className="text-sm font-medium text-text-strong-950">Foto profil</div>
            <div className="text-xs text-text-sub-600">JPG/PNG, maksimal 2 MB. Tampil di app pelanggan.</div>
            <div className="mt-2 flex gap-2">
              <Button tone="neutral" style="stroke" size="sm">Upload</Button>
              <Button tone="neutral" style="ghost" size="sm">Remove</Button>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama lengkap</Label>
            <InputRoot>
              <Input id="name" defaultValue={defaultName} />
            </InputRoot>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <InputRoot>
              <Input id="email" type="email" defaultValue={defaultEmail} />
            </InputRoot>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Nomor HP</Label>
            <InputRoot>
              <Input id="phone" type="tel" defaultValue={defaultPhone} />
            </InputRoot>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mitraId">Mitra ID</Label>
            <InputRoot>
              <Input id="mitraId" defaultValue="mtr-9412" disabled />
            </InputRoot>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio singkat</Label>
          <Textarea id="bio" rows={3} defaultValue={defaultBio} />
          <p className="text-xs text-text-soft-400">Maksimal 280 karakter. Ditampilkan di profile mitra.</p>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t border-stroke-soft-200">
        <Button tone="neutral" style="stroke">Batal</Button>
        <Button tone="primary" style="filled">Simpan perubahan</Button>
      </CardFooter>
    </Card>
  )
}
