"use client"

import * as React from "react"
import { RiAlertLine as AlertTriangle, RiPhoneLine as Phone, RiMessage2Line as MessageSquare, RiTruckLine as Truck, RiShieldLine as Shield, RiHistoryLine as History } from "@remixicon/react"
import { ListDetailPage } from "@/registry/dash/templates/list-detail-page"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
} from "@/registry/dash/ui/modal"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/registry/dash/ui/alert-dialog"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Divider } from "@/registry/dash/ui/divider"
import { RiSearchLine as Search } from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"

export type FlaggedMitra = {
  id: string
  name: string
  initials?: string
  tribe: "Reservasi" | "Express" | "Bulk"
  region: string
  missCount: number
  flagReason: string
  flaggedAt: string
  lastDispatch: string
}

const defaults: FlaggedMitra[] = [
  { id: "mtr-4421", name: "Bambang H.",  tribe: "Reservasi", region: "Bekasi",    missCount: 3, flagReason: "3 dispatch miss dalam 24 jam · auto-suspend pending", flaggedAt: "Hari ini 14:22", lastDispatch: "Today 09:14" },
  { id: "mtr-3812", name: "Eko W.",      tribe: "Express",   region: "Tangerang", missCount: 4, flagReason: "4 cancel oleh mitra · pelanggaran SLA", flaggedAt: "Hari ini 11:08", lastDispatch: "Today 08:30" },
  { id: "mtr-9614", name: "Reza T.",     tribe: "Bulk",      region: "Bandung",   missCount: 3, flagReason: "3 dispatch miss · cuaca BMKG warning aktif", flaggedAt: "Kemarin", lastDispatch: "Yesterday 15:42" },
  { id: "mtr-7104", name: "Putri N.",    tribe: "Reservasi", region: "Surabaya",  missCount: 3, flagReason: "3 dispatch miss · saldo payout negatif", flaggedAt: "Kemarin", lastDispatch: "Yesterday 12:20" },
  { id: "mtr-5520", name: "Andre L.",    tribe: "Express",   region: "Bekasi",    missCount: 5, flagReason: "5 cancel + 2 keluhan pelanggan", flaggedAt: "2 hari lalu", lastDispatch: "2d ago" },
]

export type MitraSuspendPageProps = {
  mitras?: FlaggedMitra[]
  /** Default selected mitra id. */
  defaultSelected?: string
  className?: string
}

/**
 * MitraSuspendPage — Halo-dash Ops master/detail for flagged mitra.
 * Compose ListDetailPage + Modal (manual override) + AlertDialog (permanent suspend).
 */
export function MitraSuspendPage({
  mitras = defaults,
  defaultSelected,
  className,
}: MitraSuspendPageProps) {
  const [selectedId, setSelectedId] = React.useState(defaultSelected ?? mitras[0]?.id)
  const selected = mitras.find((m) => m.id === selectedId) ?? mitras[0]

  return (
    <div className={cn("h-[720px] w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0", className)}>
      <ListDetailPage
        listToolbar={
          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight">Flagged mitra</h2>
              <Badge appearance="lighter" status="warning">{mitras.length}</Badge>
            </div>
            <InputRoot size="sm">
              <InputIcon><Search className="size-3.5" strokeWidth={1.75} /></InputIcon>
              <Input placeholder="Cari mtr-XXXX atau nama…" />
            </InputRoot>
          </div>
        }
        list={
          <ul className="divide-y divide-stroke-soft-200">
            {mitras.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={cn(
                    "w-full px-3 py-3 text-left flex items-start gap-2.5 hover:bg-bg-weak-50 transition-colors",
                    selectedId === m.id && "bg-(--dash-purple-50) dark:bg-(--dash-purple-950)/40"
                  )}
                >
                  <Avatar size="sm">
                    <AvatarFallback>{m.initials ?? m.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-text-strong-950 truncate">{m.name}</span>
                      <span className="text-xs text-text-soft-400 shrink-0">{m.id}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <Badge appearance="lighter" status="information">{m.tribe}</Badge>
                      <span className="text-xs text-text-soft-400">·</span>
                      <span className="text-xs text-text-sub-600">{m.region}</span>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-state-warning-base font-medium">
                      <AlertTriangle className="size-3" /> {m.missCount} miss · {m.flaggedAt}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        }
        detailToolbar={
          <div className="flex items-center justify-between py-1">
            <div className="text-sm text-text-sub-600">{selected.id}</div>
            <div className="flex gap-2">
              <Button tone="neutral" style="stroke" size="sm">
                <Phone className="size-3.5" /> Call
              </Button>
              <Button tone="neutral" style="stroke" size="sm">
                <MessageSquare className="size-3.5" /> WA mitra
              </Button>
            </div>
          </div>
        }
        detail={
          <div className="space-y-5">
            <header className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback>{selected.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">{selected.name}</h1>
                  <div className="text-sm text-text-sub-600">
                    {selected.id} · {selected.tribe} · {selected.region}
                  </div>
                </div>
              </div>
              <Badge appearance="lighter" status="warning" className="text-xs">
                <AlertTriangle className="size-3" /> Auto-suspend pending
              </Badge>
            </header>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alasan flag</CardTitle>
                <CardDescription>Trigger Halo-dash Ops · {selected.flaggedAt}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-text-strong-950">
                {selected.flagReason}
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <Card className="p-4">
                <div className="text-xs text-text-sub-600">Dispatch miss</div>
                <div className="text-2xl font-semibold mt-1">{selected.missCount}</div>
                <div className="text-xs text-text-soft-400 mt-1">last 24h</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-text-sub-600">Last dispatch</div>
                <div className="text-base font-semibold mt-1">{selected.lastDispatch}</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-text-sub-600">Rating 30d</div>
                <div className="text-2xl font-semibold mt-1">4.6<span className="text-text-soft-400 text-base font-normal">/5</span></div>
              </Card>
            </div>

            <Divider />

            <section className="space-y-3">
              <h3 className="text-sm font-semibold inline-flex items-center gap-2">
                <History className="size-4" /> Riwayat 7 hari
              </h3>
              <ul className="space-y-1.5 text-xs text-text-sub-600">
                <li className="flex justify-between"><span><Truck className="inline size-3" /> DSP-9412 · accepted</span><span>09:14</span></li>
                <li className="flex justify-between"><span><Truck className="inline size-3" /> DSP-9410 · missed</span><span>08:30</span></li>
                <li className="flex justify-between"><span><Truck className="inline size-3" /> DSP-9405 · missed</span><span>Yesterday 18:42</span></li>
                <li className="flex justify-between"><span><Truck className="inline size-3" /> DSP-9403 · completed</span><span>Yesterday 12:20</span></li>
              </ul>
            </section>

            <Divider />

            {/* Action footer */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-text-sub-600 max-w-md">
                Halo-dash Ops actor: Wei Chen. Tindakan permanent suspend memerlukan konfirmasi & audit log.
              </p>
              <div className="flex gap-2">
                {/* Manual override modal */}
                <Modal>
                  <ModalTrigger asChild>
                    <Button tone="neutral" style="stroke">
                      <Shield className="size-4" /> Manual override
                    </Button>
                  </ModalTrigger>
                  <ModalContent>
                    <ModalHeader>
                      <ModalTitle>Manual override — {selected.id}</ModalTitle>
                      <ModalDescription>
                        Cancel auto-suspend dan beri 24 jam grace period. Mitra akan dapat notif WA + email.
                      </ModalDescription>
                    </ModalHeader>
                    <ModalBody className="space-y-3">
                      <Textarea rows={4} placeholder="Catatan internal (wajib) — contoh: konfirmasi via call, sakit, BMKG flash flood Bekasi." />
                    </ModalBody>
                    <ModalFooter>
                      <ModalClose asChild><Button tone="neutral" style="stroke">Batal</Button></ModalClose>
                      <Button tone="primary" style="filled">Setujui override</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>

                {/* Permanent suspend confirm */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button tone="destructive" style="filled">Suspend permanen</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Suspend {selected.name} permanen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini menonaktifkan akun {selected.id} di semua tribe. Saldo payout sisa
                        Rp 2.485k akan diproses manual via Halo-dash Finance dalam 3-5 hari kerja.
                        Tidak bisa di-undo via UI; revert manual via DB ops.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Ya, suspend permanen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}
