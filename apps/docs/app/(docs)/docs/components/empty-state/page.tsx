"use client"

import { RiInboxLine as Inbox, RiSearchLine as Search, RiInboxUnarchiveLine as PackageOpen } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "@/registry/dash/ui/empty-state"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function EmptyStateDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Displaying Data"
        title="Empty State"
        description="What a list, table, or query result looks like when there is nothing to show. Always provide a recovery action — search, create new, change filter."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add empty-state`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="No results"
          preview={
            <EmptyState>
              <EmptyStateIcon><Search /></EmptyStateIcon>
              <EmptyStateTitle>Tidak ada mitra ditemukan</EmptyStateTitle>
              <EmptyStateDescription>
                Filter kombinasi Reservasi + Surabaya tidak menghasilkan mitra aktif. Coba longgarkan kriteria.
              </EmptyStateDescription>
              <EmptyStateActions>
                <Button tone="neutral" style="stroke">Reset filter</Button>
              </EmptyStateActions>
            </EmptyState>
          }
          code={`<EmptyState>
  <EmptyStateIcon><Search /></EmptyStateIcon>
  <EmptyStateTitle>Tidak ada mitra ditemukan</EmptyStateTitle>
  <EmptyStateDescription>Coba longgarkan kriteria.</EmptyStateDescription>
  <EmptyStateActions>
    <Button tone="neutral" style="stroke">Reset filter</Button>
  </EmptyStateActions>
</EmptyState>`}
        />

        <DocsExample
          title="Belum ada data"
          preview={
            <EmptyState>
              <EmptyStateIcon><Inbox /></EmptyStateIcon>
              <EmptyStateTitle>Belum ada dispatch</EmptyStateTitle>
              <EmptyStateDescription>
                Dispatch hari ini belum tercatat. Setelah mitra pertama assigned, list akan muncul di sini.
              </EmptyStateDescription>
              <EmptyStateActions>
                <Button>Buat dispatch manual</Button>
                <Button tone="neutral" style="ghost">Pelajari cara kerja</Button>
              </EmptyStateActions>
            </EmptyState>
          }
          code={`<EmptyState>
  <EmptyStateIcon><Inbox /></EmptyStateIcon>
  <EmptyStateTitle>Belum ada dispatch</EmptyStateTitle>
  <EmptyStateDescription>…</EmptyStateDescription>
  <EmptyStateActions>
    <Button>Buat dispatch manual</Button>
    <Button tone="neutral" style="ghost">Pelajari cara kerja</Button>
  </EmptyStateActions>
</EmptyState>`}
        />

        <DocsExample
          title="Compact (inside Card)"
          preview={
            <EmptyState size="sm">
              <EmptyStateIcon><PackageOpen /></EmptyStateIcon>
              <EmptyStateTitle>Tidak ada notif baru</EmptyStateTitle>
              <EmptyStateDescription>Semua sudah ditangani.</EmptyStateDescription>
            </EmptyState>
          }
          code={`<EmptyState size="sm">
  <EmptyStateIcon><PackageOpen /></EmptyStateIcon>
  <EmptyStateTitle>Tidak ada notif baru</EmptyStateTitle>
  <EmptyStateDescription>Semua sudah ditangani.</EmptyStateDescription>
</EmptyState>`}
        />

        <DocsExample
          title="Error fallback"
          description="Use as the catch state for failed fetches. Pair with a Retry button."
          preview={
            <EmptyState>
              <EmptyStateIcon><Search /></EmptyStateIcon>
              <EmptyStateTitle>Gagal memuat data mitra</EmptyStateTitle>
              <EmptyStateDescription>
                Koneksi ke Halo-dash terputus. Coba muat ulang — jika tetap gagal, hubungi Ops.
              </EmptyStateDescription>
              <EmptyStateActions>
                <Button>Coba lagi</Button>
                <Button tone="neutral" style="ghost">Lapor ke Ops</Button>
              </EmptyStateActions>
            </EmptyState>
          }
          code={`<EmptyState>
  <EmptyStateIcon><Search /></EmptyStateIcon>
  <EmptyStateTitle>Gagal memuat data mitra</EmptyStateTitle>
  <EmptyStateDescription>Koneksi terputus.</EmptyStateDescription>
  <EmptyStateActions>
    <Button onClick={refetch}>Coba lagi</Button>
  </EmptyStateActions>
</EmptyState>`}
        />

        <DocsExample
          title="Onboarding empty (Halo-dash first run)"
          preview={
            <EmptyState>
              <EmptyStateIcon><Inbox /></EmptyStateIcon>
              <EmptyStateTitle>Selamat datang di Halo-dash</EmptyStateTitle>
              <EmptyStateDescription>
                Mulai dengan menambahkan tribe pertama. Sistem akan otomatis menarik daftar mitra
                aktif dari Tribe-Express dalam 30 detik.
              </EmptyStateDescription>
              <EmptyStateActions>
                <Button>Tambah tribe</Button>
                <Button tone="neutral" style="ghost">Lihat tutorial</Button>
              </EmptyStateActions>
            </EmptyState>
          }
          code={`<EmptyState>
  <EmptyStateIcon><Inbox /></EmptyStateIcon>
  <EmptyStateTitle>Selamat datang di Halo-dash</EmptyStateTitle>
  <EmptyStateDescription>Mulai dengan menambahkan tribe pertama.</EmptyStateDescription>
  <EmptyStateActions>
    <Button>Tambah tribe</Button>
    <Button style="ghost">Lihat tutorial</Button>
  </EmptyStateActions>
</EmptyState>`}
        />

        <DocsExample
          title="Inline empty (inside DataTable)"
          preview={
            <div className="w-full border border-stroke-soft-200 rounded-lg bg-bg-white-0 overflow-hidden">
              <div className="grid grid-cols-3 text-xs font-medium text-text-sub-600 bg-bg-weak-50 px-4 py-2.5 border-b border-stroke-soft-200">
                <div>Mitra</div>
                <div>Tribe</div>
                <div>Status</div>
              </div>
              <EmptyState size="sm">
                <EmptyStateIcon><Search /></EmptyStateIcon>
                <EmptyStateTitle>Tidak ada mitra cocok</EmptyStateTitle>
                <EmptyStateDescription>Reset filter untuk melihat semua.</EmptyStateDescription>
              </EmptyState>
            </div>
          }
          code={`<DataTable
  columns={columns}
  data={[]}
  emptyState={
    <EmptyState size="sm">
      <EmptyStateIcon><Search /></EmptyStateIcon>
      <EmptyStateTitle>Tidak ada mitra cocok</EmptyStateTitle>
      <EmptyStateDescription>Reset filter untuk melihat semua.</EmptyStateDescription>
    </EmptyState>
  }
/>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>EmptyState</strong> — centered flex container, owns vertical padding.</li>
          <li className="pl-4">├ <strong>EmptyStateIcon</strong> — large circular badge. Omit for text-only compact empties.</li>
          <li className="pl-4">├ <strong>EmptyStateTitle</strong> — what&apos;s missing.</li>
          <li className="pl-4">├ <strong>EmptyStateDescription</strong> — why + how to recover. Cap ~2 lines.</li>
          <li className="pl-4">└ <strong>EmptyStateActions</strong> — recovery CTAs (max 2).</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Vertical spacing preset." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — EmptyState renders a plain <code className="text-xs">div</code>. EmptyStateTitle defaults to <code className="text-xs">h3</code>.</li>
          <li>• <strong>Live regions</strong> — when EmptyState replaces a previously loaded list, wrap the surrounding container in <code className="text-xs">aria-live=&quot;polite&quot;</code> so SR users hear the transition.</li>
          <li>• <strong>Icon</strong> — EmptyStateIcon is decorative; <code className="text-xs">aria-hidden</code>. Meaning lives in the title.</li>
          <li>• <strong>Actions</strong> — at most 2 CTAs. The first is primary (recovery), the second is escape (cancel filter / contact support).</li>
          <li>• <strong>Reduced motion</strong> — no inherent motion. Wrapping fade-in (if used by your route transition) should respect <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
