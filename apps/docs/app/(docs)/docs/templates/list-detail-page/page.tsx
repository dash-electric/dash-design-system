"use client"

import { useState } from "react"
import { ListDetailPage } from "@/registry/dash/templates/list-detail-page"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { RiSearchLine as Search } from "@remixicon/react"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

const mitra = [
  { id: "mtr-9412", name: "Sigit P.", tribe: "Reservasi", city: "Bekasi", trips: 142, status: "active" as const },
  { id: "mtr-9419", name: "Andi W.", tribe: "Express", city: "Tangerang", trips: 78, status: "suspended" as const },
  { id: "mtr-9425", name: "Rina S.", tribe: "Express", city: "Jakarta", trips: 263, status: "active" as const },
  { id: "mtr-9431", name: "Wei Chen", tribe: "Bulk", city: "Surabaya", trips: 14, status: "pending" as const },
  { id: "mtr-9434", name: "Fayzul A.", tribe: "Reservasi", city: "Bandung", trips: 98, status: "active" as const },
]

const tone = { active: "success", suspended: "error", pending: "warning" } as const

export default function ListDetailPageDocs() {
  const [selectedId, setSelectedId] = useState("mtr-9412")
  const selected = mitra.find((m) => m.id === selectedId)!

  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Generic"
        title="List-Detail Page"
        description="Master-detail layout for resource browsers — mitra list, trip log, dispatch queue, ticket inbox. Resizable horizontal split or fixed columns; you bring the list and the detail."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add list-detail-page`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Mitra browser"
          description="35/65 resizable split. List on the left with search toolbar, detail on the right with action toolbar. Click a row to switch — selection is parent-owned."
          preview={
            <DocsTemplatePreview>
              <ListDetailPage
                listToolbar={
                  <InputRoot size="sm">
                    <InputIcon><Search className="size-4" strokeWidth={1.75} /></InputIcon>
                    <Input placeholder="Cari mitra…" />
                  </InputRoot>
                }
                list={
                  <ul className="divide-y divide-stroke-soft-200">
                    {mitra.map((m) => {
                      const isActive = m.id === selectedId
                      return (
                        <li key={m.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(m.id)}
                            className={cn(
                              "w-full flex items-center justify-between gap-2 px-3 py-3 text-left transition-colors",
                              "hover:bg-bg-weak-50",
                              isActive && "bg-bg-weak-50",
                            )}
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate text-text-strong-950">{m.name}</div>
                              <div className="text-xs text-text-soft-400">{m.id} · {m.city}</div>
                            </div>
                            <Badge status={tone[m.status]} appearance="lighter">{m.status}</Badge>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                }
                detailToolbar={
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm text-text-soft-400">{selected.id}</div>
                    <div className="flex gap-2">
                      <Button size="sm" tone="neutral" style="stroke">Edit</Button>
                      <Button size="sm" tone="destructive">Suspend</Button>
                    </div>
                  </div>
                }
                detail={
                  <div className="space-y-4 max-w-xl">
                    <header>
                      <h2 className="text-xl font-semibold tracking-tight text-text-strong-950">{selected.name}</h2>
                      <p className="text-sm text-text-sub-600">{selected.tribe} · {selected.city}</p>
                    </header>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-text-soft-400 uppercase tracking-wide">Total trip</div>
                        <div className="font-semibold tabular-nums">{selected.trips}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-soft-400 uppercase tracking-wide">Status</div>
                        <Badge status={tone[selected.status]} appearance="lighter">{selected.status}</Badge>
                      </div>
                    </div>
                    <div className="rounded-lg border border-stroke-soft-200 p-4 text-sm text-text-sub-600">
                      Aktivitas terakhir: dispatch terkirim 18 menit lalu. Surge factor saat ini 1.2×.
                    </div>
                  </div>
                }
              />
            </DocsTemplatePreview>
          }
          code={`<ListDetailPage
  listToolbar={<SearchInput />}
  list={<MitraList selectedId={id} onSelect={setId} />}
  detailToolbar={<DetailActions />}
  detail={<MitraDetail mitra={selected} />}
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="Two resizable columns glued by the @dash Resizable primitive. State (selection, filters) is fully parent-owned."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><code>list</code> — your scrollable list of rows. Each row should call back into parent state on click.</li>
          <li><code>listToolbar</code> — search input, filter chips, "+ Add" button. Sticky at the top of the list pane.</li>
          <li><code>detail</code> — read-only or editable view of the selected entity.</li>
          <li><code>detailToolbar</code> — primary actions (Edit, Delete, Approve, Suspend) plus contextual breadcrumb.</li>
          <li>Switch between <code>layout="resizable"</code> (drag handle, default) and <code>layout="fixed"</code> (320 px aside) when space is tight.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> for any resource-browser screen — mitra, trips, dispatch queue, payouts, tickets.</li>
          <li><strong>Use</strong> when users primarily scan and select, then act on one item at a time.</li>
          <li><strong>Use</strong> when the detail panel is small-to-medium (fits within 65% width).</li>
          <li><strong>Don't</strong> use for full-screen tables — reach for <code>OrdersTable</code> or <code>TransactionsTable</code> blocks instead.</li>
          <li><strong>Don't</strong> use when a third panel is needed (conversation context) — reach for <code>HaloDash3Pane</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "list / detail", type: "ReactNode", description: "Required content for each pane." },
            { name: "listToolbar / detailToolbar", type: "ReactNode", description: "Optional sticky top bars per pane." },
            { name: "listSize", type: "number", defaultValue: "35", description: "Initial split percentage for the list pane (20-60)." },
            { name: "layout", type: '"resizable" | "fixed"', defaultValue: '"resizable"', description: "Drag handle vs fixed 320 px aside." },
          ]}
        />
      </DocsSection>
      <DocsSection title="List left, detail right">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two-pane list/detail keeps both visible on desktop. Don't open the detail in a modal — modals lose URL state and scroll position.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md h-32 rounded-lg border border-stroke-soft-200 bg-bg-white-0 overflow-hidden grid grid-cols-[110px_1fr]">
                <div className="border-r border-stroke-soft-200 p-1.5 space-y-1"><div className="h-6 rounded bg-primary-alpha-16 border border-primary-base" /><div className="h-6 rounded bg-bg-weak-50" /><div className="h-6 rounded bg-bg-weak-50" /><div className="h-6 rounded bg-bg-weak-50" /></div>
                <div className="p-2 space-y-1.5"><div className="h-3 rounded bg-bg-soft-200 w-20" /><div className="h-2 rounded bg-bg-weak-50" /><div className="h-2 rounded bg-bg-weak-50" /><div className="h-8 rounded bg-bg-weak-50" /></div>
              </div>
            ),
            caption: "List of mitra on the left stays selectable while detail panel updates. URL reflects the selected item.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md h-32 rounded-lg border border-stroke-soft-200 bg-bg-white-0 overflow-hidden relative">
                <div className="absolute inset-0 p-2 space-y-1"><div className="h-6 rounded bg-bg-weak-50" /><div className="h-6 rounded bg-bg-weak-50" /><div className="h-6 rounded bg-bg-weak-50" /></div>
                <div className="absolute inset-x-6 inset-y-4 rounded-lg border border-stroke-strong-950 bg-bg-white-0 shadow-lg p-2"><div className="h-3 rounded bg-bg-soft-200 w-20" /><div className="h-2 rounded bg-bg-weak-50 mt-1" /><div className="text-[8px] text-text-soft-400 mt-2">(modal — no URL, no deep-link)</div></div>
              </div>
            ),
            caption: "Don't open the detail in a modal. URL doesn't change, ops can't share a link to a specific mitra, browser back closes the modal.",
          }}
        />
      </DocsSection>

      <DocsSection title="Mobile back navigation">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          On mobile the panes stack — detail covers list with explicit back-nav arrow. Don't use a hamburger drawer for the back action.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-48 h-32 rounded-lg border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
                <div className="h-7 border-b border-stroke-soft-200 px-2 flex items-center gap-2"><span className="text-xs">←</span><span className="text-[10px]">Daftar mitra</span></div>
                <div className="p-2 space-y-1"><div className="h-3 rounded bg-bg-soft-200 w-20" /><div className="h-2 rounded bg-bg-weak-50" /><div className="h-8 rounded bg-bg-weak-50" /></div>
              </div>
            ),
            caption: "Back-arrow chevron with the parent list name. One tap returns to the list with selection preserved.",
          }}
          dont={{
            preview: (
              <div className="w-48 h-32 rounded-lg border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
                <div className="h-7 border-b border-stroke-soft-200 px-2 flex items-center gap-2"><span className="text-xs">☰</span><span className="text-[10px]">Mitra detail</span></div>
                <div className="p-2"><div className="text-[8px] text-text-soft-400">(no back action — user must open drawer + tap list)</div></div>
              </div>
            ),
            caption: "Don't use a hamburger drawer as the back gesture. Hamburger = global nav; user expects to step back to the list.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
