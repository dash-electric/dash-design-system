"use client"

import * as React from "react"
import { RiInboxLine as Inbox, RiLifebuoyLine as LifeBuoy, RiTeamLine as Users, RiSettings3Line as Settings, RiSendPlaneLine as Send, RiAttachmentLine as Paperclip, RiPhoneLine as Phone, RiMailLine as Mail, RiMapPinLine as MapPin, RiTruckLine as Truck, RiTimeLine as Clock } from "@remixicon/react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarFooter,
  SidebarInset,
} from "@/registry/dash/ui/sidebar"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/registry/dash/ui/resizable"
import { ScrollArea } from "@/registry/dash/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

type Ticket = {
  id: string
  customer: string
  initials?: string
  subject: string
  preview: string
  priority: "urgent" | "high" | "med" | "low"
  slaLeftMin: number
  unread?: boolean
  time: string
}

const defaultTickets: Ticket[] = [
  { id: "TKT-8841", customer: "Sigit P.",   subject: "Mitra Reservasi BKS keluhan rate", preview: "Min, rate Bekasi-Jaktim turun 15% sejak Senin…", priority: "urgent", slaLeftMin: 8,   unread: true,  time: "2m" },
  { id: "TKT-8840", customer: "Reza T.",    subject: "Surge factor Tangerang ga match", preview: "App nunjukin surge 1.4x tapi total payment normal…", priority: "high",   slaLeftMin: 22,  unread: true,  time: "8m" },
  { id: "TKT-8838", customer: "Eko W.",     subject: "Payout BCA delay 2 hari",         preview: "Halo Halo-dash, transfer BCA 4421 belum masuk…",     priority: "high",   slaLeftMin: 45,  time: "32m" },
  { id: "TKT-8835", customer: "Putri N.",   subject: "App login error setelah Lebaran", preview: "Setelah update app v3.2.1 ga bisa login pakai…",     priority: "med",    slaLeftMin: 120, time: "1h" },
  { id: "TKT-8832", customer: "Bambang H.", subject: "Request unsuspend mitra mtr-4421",preview: "Mohon bantu cek, akun saya kena auto-suspend…",      priority: "med",    slaLeftMin: 240, time: "2h" },
]

const priorityStatus = {
  urgent: { label: "Urgent", status: "error" as const },
  high:   { label: "High",   status: "warning" as const },
  med:    { label: "Med",    status: "information" as const },
  low:    { label: "Low",    status: "feature" as const },
}

export type HaloDash3PaneProps = {
  tickets?: Ticket[]
  defaultSelected?: string
  className?: string
}

/**
 * HaloDash3Pane — backoffice support module shell.
 * Sidebar + Resizable 3-pane: ticket list / conversation thread / customer inspector.
 */
export function HaloDash3Pane({
  tickets = defaultTickets,
  defaultSelected,
  className,
}: HaloDash3PaneProps) {
  const [selectedId, setSelectedId] = React.useState(defaultSelected ?? tickets[0]?.id)
  const selected = tickets.find((t) => t.id === selectedId) ?? tickets[0]
  const p = priorityStatus[selected.priority]

  return (
    <SidebarProvider className={cn("h-[720px] w-full bg-bg-weak-50 overflow-hidden rounded-xl border border-stroke-soft-200", className)}>
      <Sidebar>
        <SidebarHeader>
          <span className="font-semibold text-text-strong-950">Halo-dash</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Queue</SidebarGroupLabel>
            <SidebarItem active><Inbox /> Active <span className="ml-auto text-xs text-text-soft-400">{tickets.length}</span></SidebarItem>
            <SidebarItem><LifeBuoy /> Resolved</SidebarItem>
            <SidebarItem><Users /> My team</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarItem><Settings /> Settings</SidebarItem>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <ResizablePanelGroup orientation="horizontal">
          {/* PANE 1: Ticket list */}
          <ResizablePanel defaultSize={28} minSize={22} maxSize={40}>
            <div className="flex h-full flex-col border-r border-stroke-soft-200 bg-bg-white-0">
              <div className="border-b border-stroke-soft-200 px-3 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold tracking-tight">Active queue</h2>
                  <Badge appearance="lighter" status="warning">{tickets.length}</Badge>
                </div>
                <InputRoot size="sm">
                  <Input placeholder="Cari TKT-XXXX, mitra…" />
                </InputRoot>
              </div>
              <ScrollArea className="flex-1">
                <ul className="divide-y divide-stroke-soft-200">
                  {tickets.map((t) => {
                    const pp = priorityStatus[t.priority]
                    const isSel = t.id === selectedId
                    const hot = t.slaLeftMin < 15
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(t.id)}
                          className={cn(
                            "w-full text-left px-3 py-2.5 hover:bg-bg-weak-50 transition-colors flex gap-2.5",
                            isSel && "bg-(--dash-purple-50) dark:bg-(--dash-purple-950)/40",
                            t.unread && "border-l-2 border-l-(--dash-purple-600)"
                          )}
                        >
                          <Avatar size="sm"><AvatarFallback>{t.initials ?? t.customer.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-text-strong-950 truncate">{t.customer}</span>
                              <span className={cn(
                                "text-xs shrink-0",
                                hot ? "text-state-error-base" : "text-text-soft-400"
                              )}>{t.time}</span>
                            </div>
                            <div className={cn("text-xs truncate", t.unread ? "font-medium text-text-strong-950" : "text-text-sub-600")}>
                              {t.subject}
                            </div>
                            <div className="text-xs text-text-sub-600 truncate mt-0.5">{t.preview}</div>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <Badge appearance="lighter" status={pp.status}>{pp.label}</Badge>
                              <span className="text-xs text-text-soft-400">{t.id}</span>
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* PANE 2: Conversation */}
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="flex h-full flex-col bg-bg-white-0">
              <header className="border-b border-stroke-soft-200 px-6 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-text-strong-950">{selected.subject}</div>
                    <div className="text-xs text-text-sub-600 mt-0.5 inline-flex items-center gap-2">
                      <span className="">{selected.id}</span>
                      <span>·</span>
                      <Badge appearance="lighter" status={p.status}>{p.label}</Badge>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {selected.slaLeftMin}m left</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button tone="neutral" style="stroke" size="sm">Snooze</Button>
                    <Button tone="primary" style="filled" size="sm">Resolve</Button>
                  </div>
                </div>
              </header>

              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4 max-w-2xl">
                  {/* Customer message */}
                  <div className="flex gap-3">
                    <Avatar size="sm"><AvatarFallback>{selected.customer.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-text-strong-950">{selected.customer}</span>
                        <span className="text-xs text-text-soft-400">{selected.time} ago</span>
                      </div>
                      <div className="mt-1 rounded-xl bg-bg-weak-50 px-3 py-2 text-sm text-text-strong-950 leading-relaxed">
                        {selected.preview} Bisa minta tolong dibantu cek? Saya udah cek di dashboard mitra ga ada error code apa-apa.
                      </div>
                    </div>
                  </div>

                  {/* Agent reply */}
                  <div className="flex gap-3 flex-row-reverse">
                    <Avatar size="sm"><AvatarFallback>WC</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 justify-end">
                        <span className="text-xs text-text-soft-400">Just now</span>
                        <span className="text-sm font-medium text-text-strong-950">Wei Chen · Lead</span>
                      </div>
                      <div className="mt-1 rounded-xl bg-(--dash-purple-100) dark:bg-(--dash-purple-900)/40 px-3 py-2 text-sm text-text-strong-950 leading-relaxed ml-auto max-w-md">
                        Halo, terima kasih sudah laporan. Saya cek dulu rate Bekasi-Jaktim Senin minggu ini.
                        Akan saya update dalam 10 menit.
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Composer */}
              <div className="border-t border-stroke-soft-200 p-3 bg-bg-weak-50/50">
                <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-2 space-y-2">
                  <Textarea rows={3} placeholder="Ketik balasan… (Cmd+Enter untuk kirim)" className="border-0 focus-visible:ring-0 resize-none" />
                  <div className="flex items-center gap-2">
                    <Button tone="neutral" style="ghost" size="xs"><Paperclip className="size-3.5" /></Button>
                    <span className="text-xs text-text-soft-400">Reply sebagai Wei Chen · public</span>
                    <Button tone="primary" style="filled" size="sm" className="ml-auto">
                      <Send className="size-3.5" /> Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* PANE 3: Customer inspector */}
          <ResizablePanel defaultSize={27} minSize={20} maxSize={35}>
            <div className="flex h-full flex-col border-l border-stroke-soft-200 bg-bg-white-0">
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Avatar size="xl"><AvatarFallback>{selected.customer.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                    <div>
                      <div className="text-base font-semibold">{selected.customer}</div>
                      <div className="text-xs text-text-sub-600">mtr-9412 · Reservasi</div>
                    </div>
                    <Badge appearance="lighter" status="success">Active mitra</Badge>
                  </div>

                  <Divider />

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-sub-600">Kontak</h3>
                    <ul className="space-y-1.5 text-sm">
                      <li className="flex items-center gap-2 text-text-strong-950"><Phone className="size-3.5 text-text-sub-600" /> +62 812 8000 4421</li>
                      <li className="flex items-center gap-2 text-text-strong-950"><Mail className="size-3.5 text-text-sub-600" /> sigit@dash.id</li>
                      <li className="flex items-center gap-2 text-text-strong-950"><MapPin className="size-3.5 text-text-sub-600" /> Bekasi · Jabodetabek</li>
                    </ul>
                  </section>

                  <Divider />

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-sub-600">Stats</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg border border-stroke-soft-200 px-3 py-2">
                        <div className="text-xs text-text-sub-600">Trips 30d</div>
                        <div className="text-base font-semibold">312</div>
                      </div>
                      <div className="rounded-lg border border-stroke-soft-200 px-3 py-2">
                        <div className="text-xs text-text-sub-600">Rating</div>
                        <div className="text-base font-semibold">4.6/5</div>
                      </div>
                      <div className="rounded-lg border border-stroke-soft-200 px-3 py-2">
                        <div className="text-xs text-text-sub-600">Cancel rate</div>
                        <div className="text-base font-semibold">2.1%</div>
                      </div>
                      <div className="rounded-lg border border-stroke-soft-200 px-3 py-2">
                        <div className="text-xs text-text-sub-600">Sejak</div>
                        <div className="text-base font-semibold">2023</div>
                      </div>
                    </div>
                  </section>

                  <Divider />

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-sub-600">Riwayat tiket</h3>
                    <ul className="space-y-1.5 text-xs">
                      <li className="flex justify-between text-text-sub-600"><span><Truck className="inline size-3" /> TKT-8821 · resolved</span><span>3d</span></li>
                      <li className="flex justify-between text-text-sub-600"><span><Truck className="inline size-3" /> TKT-8714 · resolved</span><span>12d</span></li>
                      <li className="flex justify-between text-text-sub-600"><span><Truck className="inline size-3" /> TKT-8512 · resolved</span><span>1mo</span></li>
                    </ul>
                  </section>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </SidebarProvider>
  )
}
