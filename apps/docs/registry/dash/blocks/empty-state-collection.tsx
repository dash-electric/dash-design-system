"use client"

import * as React from "react"
import { RiInboxLine as Inbox, RiSearchEyeLine as SearchX, RiFilterOffLine as FilterX, RiQuestionnaireLine as FileQuestion } from "@remixicon/react"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "@/registry/dash/ui/empty-state"
import { Button } from "@/registry/dash/ui/button"
import { Card } from "@/registry/dash/ui/card"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Empty state collection — 4 patterns: empty inbox / no search results / no filter results / 404 page.
 */
export function EmptyStateCollection({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
      <Card>
        <EmptyState>
          <EmptyStateIcon><Inbox /></EmptyStateIcon>
          <EmptyStateTitle>Belum ada tiket</EmptyStateTitle>
          <EmptyStateDescription>
            Inbox Halo-dash Anda kosong. Tiket baru dari mitra akan muncul di sini.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button tone="primary" style="filled">Refresh</Button>
          </EmptyStateActions>
        </EmptyState>
      </Card>

      <Card>
        <EmptyState>
          <EmptyStateIcon><SearchX /></EmptyStateIcon>
          <EmptyStateTitle>Tidak ada hasil</EmptyStateTitle>
          <EmptyStateDescription>
            Kami tidak menemukan dispatch yang cocok dengan kata kunci Anda. Coba ejaan lain atau hapus filter.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button tone="neutral" style="stroke">Clear search</Button>
          </EmptyStateActions>
        </EmptyState>
      </Card>

      <Card>
        <EmptyState>
          <EmptyStateIcon><FilterX /></EmptyStateIcon>
          <EmptyStateTitle>Filter terlalu spesifik</EmptyStateTitle>
          <EmptyStateDescription>
            Tidak ada mitra Reservasi di Bekasi dengan rating ≥4.8 minggu ini. Lebarkan filter untuk melihat lebih banyak.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button tone="neutral" style="stroke">Reset filters</Button>
          </EmptyStateActions>
        </EmptyState>
      </Card>

      <Card>
        <EmptyState>
          <EmptyStateIcon><FileQuestion /></EmptyStateIcon>
          <EmptyStateTitle>Halaman tidak ditemukan</EmptyStateTitle>
          <EmptyStateDescription>
            URL ini tidak valid atau resource sudah dipindahkan. Periksa kembali tautan atau kembali ke dashboard.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button tone="primary" style="filled">Kembali ke dashboard</Button>
            <Button tone="neutral" style="ghost">Hubungi support</Button>
          </EmptyStateActions>
        </EmptyState>
      </Card>
    </div>
  )
}
