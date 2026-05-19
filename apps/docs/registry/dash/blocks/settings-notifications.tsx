"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Switch } from "@/registry/dash/ui/switch"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

type Row = { event: string; description: string; defaults?: { email: boolean; push: boolean; sms: boolean } }

const rows: Row[] = [
  { event: "Dispatch baru",        description: "Saat ada job baru cocok dengan tribe Anda.",   defaults: { email: false, push: true,  sms: true } },
  { event: "Payout cair",          description: "Saat saldo masuk ke rekening payout primary.", defaults: { email: true,  push: true,  sms: false } },
  { event: "Rate surge",           description: "Saat surge factor naik di area Anda.",         defaults: { email: false, push: true,  sms: false } },
  { event: "SLA at risk",          description: "Saat tiket Halo-dash mendekati deadline.",     defaults: { email: true,  push: true,  sms: false } },
  { event: "Mitra suspend warn",   description: "Saat akun Anda flag dengan 2+ dispatch miss.", defaults: { email: true,  push: true,  sms: true } },
  { event: "Berita produk Dash",   description: "Update fitur, maintenance, dan campaign.",     defaults: { email: true,  push: false, sms: false } },
]

/** Settings — notifications switch matrix (email/push/SMS × event types). */
export function SettingsNotifications({ className }: { className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Notifikasi</CardTitle>
        <CardDescription>Pilih channel yang aktif untuk setiap event.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[1fr,80px,80px,80px] gap-x-4 px-6 py-3 bg-bg-weak-50 border-y border-stroke-soft-200 text-xs font-semibold uppercase tracking-wider text-text-sub-600">
          <span>Event</span>
          <span className="text-center">Email</span>
          <span className="text-center">Push</span>
          <span className="text-center">SMS</span>
        </div>
        <ul className="divide-y divide-stroke-soft-200">
          {rows.map((r) => (
            <li key={r.event} className="grid grid-cols-[1fr,80px,80px,80px] gap-x-4 px-6 py-3 items-center">
              <div>
                <div className="text-sm font-medium text-text-strong-950">{r.event}</div>
                <div className="text-xs text-text-sub-600">{r.description}</div>
              </div>
              <div className="flex justify-center"><Switch defaultChecked={r.defaults?.email} /></div>
              <div className="flex justify-center"><Switch defaultChecked={r.defaults?.push} /></div>
              <div className="flex justify-center"><Switch defaultChecked={r.defaults?.sms} /></div>
            </li>
          ))}
        </ul>
        <Divider />
        <div className="px-6 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-strong-950">Do Not Disturb</div>
              <div className="text-xs text-text-sub-600">Mode hening malam · 22:00 – 06:00 WIB.</div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t border-stroke-soft-200">
        <Button tone="neutral" style="stroke">Reset</Button>
        <Button tone="primary" style="filled">Simpan</Button>
      </CardFooter>
    </Card>
  )
}
