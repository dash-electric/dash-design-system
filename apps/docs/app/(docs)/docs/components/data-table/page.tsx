"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/registry/dash/ui/data-table"
import { Badge } from "@/registry/dash/ui/badge"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { DocsApiTable } from "@/components/docs/api-table"
import { DocsShadcnTemplate } from "@/components/docs/shadcn-template"

type Mitra = {
  id: string
  name: string
  tribe: string
  city: string
  status: "active" | "suspended" | "pending"
  trips: number
}

const rows: Mitra[] = [
  { id: "mtr-9412", name: "Sigit P.", tribe: "Reservasi", city: "Bekasi", status: "active", trips: 142 },
  { id: "mtr-9419", name: "Andi W.", tribe: "Express", city: "Tangerang", status: "suspended", trips: 78 },
  { id: "mtr-9425", name: "Rina S.", tribe: "Express", city: "Jakarta", status: "active", trips: 263 },
  { id: "mtr-9431", name: "Wei Chen", tribe: "Bulk", city: "Surabaya", status: "pending", trips: 14 },
  { id: "mtr-9434", name: "Fayzul A.", tribe: "Reservasi", city: "Bandung", status: "active", trips: 98 },
  { id: "mtr-9440", name: "Dimas R.", tribe: "Express", city: "Bekasi", status: "active", trips: 187 },
]

const statusTone: Record<Mitra["status"], "success" | "error" | "warning"> = {
  active: "success",
  suspended: "error",
  pending: "warning",
}

const columns: ColumnDef<Mitra>[] = [
  { accessorKey: "id", header: "Mitra ID", cell: ({ row }) => <span className="">{row.original.id}</span> },
  { accessorKey: "name", header: "Nama" },
  { accessorKey: "tribe", header: "Tribe" },
  { accessorKey: "city", header: "Kota" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge status={statusTone[row.original.status]} appearance="lighter">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "trips",
    header: "Total Trip",
    cell: ({ row }) => <span className="tabular-nums">{row.original.trips}</span>,
  },
]

export default function DataTableDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Displaying Data"
        title="Data Table"
        description="Sortable, filterable table built on TanStack Table v8. For static tables use the plain Table primitive. Pair with Pagination + Filter for full list-page UX."
      />

      <DocsShadcnTemplate
        name="data-table"
        heroPreview={
          <div className="w-full">
            <DataTable columns={columns} data={rows.slice(0, 4)} />
          </div>
        }
        heroCode={`<DataTable columns={columns} data={rows} />`}
        usageImport={`import { DataTable } from "@/registry/dash/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"`}
        usageJsx={`<DataTable columns={columns} data={data} />`}
        manual={{
          sourcePath: "registry/dash/ui/data-table.tsx",
          dependencies: ["@tanstack/react-table"],
        }}
      />

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Thin opinionated wrapper around <a className="underline" href="https://tanstack.com/table/latest" target="_blank" rel="noreferrer">TanStack Table</a>. You bring two things: <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">columns</code> (defining each header + cell + sort), and <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">data</code>. The component renders the styled <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<table>`}</code> shell, sortable header cells, hover row highlight, and an empty state row. Pagination, row selection, and column visibility are opt-in via the props table below.
        </p>
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Mitra list with sortable columns"
          preview={<DataTable columns={columns} data={rows} className="w-full" />}
          code={`type Mitra = {
  id: string; name: string; tribe: string; city: string
  status: "active" | "suspended" | "pending"; trips: number
}

const columns: ColumnDef<Mitra>[] = [
  { accessorKey: "id", header: "Mitra ID" },
  { accessorKey: "name", header: "Nama" },
  { accessorKey: "tribe", header: "Tribe" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge status={statusTone[row.original.status]} appearance="lighter">
        {row.original.status}
      </Badge>
    ),
  },
]

<DataTable columns={columns} data={rows} />`}
        />

        <DocsExample
          title="Empty state"
          preview={
            <DataTable
              columns={columns}
              data={[]}
              className="w-full"
              emptyState={
                <div className="py-10 text-center text-sm text-text-sub-600">
                  Tidak ada mitra cocok dengan filter ini. <button className="text-(--dash-purple-600) underline-offset-2 hover:underline">Reset filter</button>
                </div>
              }
            />
          }
          code={`<DataTable
  columns={columns}
  data={filteredRows}
  emptyState={
    <div className="py-10 text-center">
      Tidak ada mitra cocok. <button>Reset filter</button>
    </div>
  }
/>`}
        />

        <DocsExample
          title="With row selection column"
          description="Add a column with id='select' that renders a Checkbox; DataTable wires the selection state automatically."
          preview={
            <div className="text-sm text-text-sub-600">
              <p className="mb-2">Define a select column at the head of <code className="text-xs">columns</code>:</p>
              <pre className="rounded-md bg-bg-weak-50 p-3 text-[11px] overflow-x-auto">{`{
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(v) => row.toggleSelected(!!v)}
    />
  ),
}`}</pre>
            </div>
          }
          code={`const columns: ColumnDef<Mitra>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
  },
  // …rest of columns
]

<DataTable columns={columns} data={rows} enableRowSelection />`}
        />

        <DocsExample
          title="Pagination wiring"
          description="Pass onTableReady to receive the table instance and drive an external Pagination."
          preview={
            <div className="text-sm text-text-sub-600">
              See the <a href="/docs/components/pagination" className="underline">Pagination</a> page for the controller pattern.
            </div>
          }
          code={`const [table, setTable] = useState<Table<Mitra>>()

<DataTable
  columns={columns}
  data={rows}
  pageSize={10}
  onTableReady={setTable}
/>

{table && (
  <Pagination
    page={table.getState().pagination.pageIndex + 1}
    total={table.getPageCount()}
    onPageChange={(p) => table.setPageIndex(p - 1)}
  />
)}`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Data table = scannable grid. Sortable kolom yang mitra butuh urut, format value sesuai semantic (tanggal, currency, status).
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs text-xs rounded border border-stroke-soft-200 overflow-hidden">
                <div className="grid grid-cols-3 bg-bg-weak-50 px-2 py-1 font-medium border-b border-stroke-soft-200">
                  <span>Mitra</span><span>Trip terakhir ↓</span><span>Status</span>
                </div>
                <div className="grid grid-cols-3 px-2 py-1 border-b border-stroke-soft-200">
                  <span>mtr-9412</span><span>14 Mei</span><Badge size="sm" appearance="lighter" status="success">Active</Badge>
                </div>
                <div className="grid grid-cols-3 px-2 py-1">
                  <span>mtr-7331</span><span>09 Mei</span><Badge size="sm" appearance="lighter" status="error">Suspend</Badge>
                </div>
              </div>
            ),
            caption: "Kolom \"Trip terakhir\" sortable, format \"dd MMM\" konsisten. Status di-render Badge by tone — mata cepat scan.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs rounded border border-stroke-soft-200 overflow-hidden">
                <div className="grid grid-cols-3 bg-bg-weak-50 px-2 py-1 font-medium border-b border-stroke-soft-200">
                  <span>id</span><span>last_trip_at</span><span>status</span>
                </div>
                <div className="grid grid-cols-3 px-2 py-1 border-b border-stroke-soft-200">
                  <span>mtr-9412</span><span>2026-05-14T08:23:11Z</span><span>active</span>
                </div>
              </div>
            ),
            caption: "Hindari raw column name + ISO timestamp + plain text status. Dispatcher harus parse manual setiap row.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Sticky header saat scroll panjang. Row hover state. Action di kolom terakhir (kebab menu) untuk row-level operation.",
          }}
          dont={{
            caption: "Jangan render 1,000 row sekaligus. Pakai paginate atau virtualization. Dashboard lag = dispatcher tidak pakai.",
          }}
        />
      </DocsSection>

      <DocsSection title="API" id="api">
        <DocsApiTable
          idPrefix="data-table-prop"
          rows={[
            { name: "columns", type: "ColumnDef<TData>[]", required: true, description: "TanStack Table column defs." },
            { name: "data", type: "TData[]", required: true, description: "Row data." },
            { name: "enableSorting", type: "boolean", defaultValue: "true", description: "Click-to-sort headers." },
            { name: "enableRowSelection", type: "boolean", defaultValue: "false", description: "Selection checkboxes (provide a column with id='select' to render them)." },
            { name: "pageSize", type: "number", defaultValue: "10", description: "Page size for pagination model." },
            { name: "emptyState", type: "ReactNode", description: "Custom empty-state row content." },
            { name: "onTableReady", type: "(table) => void", description: "Receive the TanStack Table instance for external controls (Pagination wiring)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — renders native <code className="text-xs">table</code> + <code className="text-xs">thead</code> / <code className="text-xs">tbody</code> / <code className="text-xs">tr</code> / <code className="text-xs">th</code> / <code className="text-xs">td</code> so SR table navigation (TalkBack tables, VoiceOver rotor) works out-of-the-box.</li>
          <li>• <strong>Sortable headers</strong> — render <code className="text-xs">role=&quot;columnheader&quot;</code> with <code className="text-xs">aria-sort</code> set to <code className="text-xs">ascending</code>, <code className="text-xs">descending</code>, or <code className="text-xs">none</code>. The clickable header is a button — Enter/Space toggles sort.</li>
          <li>• <strong>ARIA you add</strong> — wrap DataTable in an outer region with <code className="text-xs">aria-label=&quot;Mitra list&quot;</code> when multiple tables share a page.</li>
          <li>• <strong>Keyboard</strong>
            <ul className="ml-5 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li><code className="text-xs">Tab</code> walks header buttons + interactive cells (selection checkbox, row actions).</li>
              <li>Use SR table-navigation gestures to read row-by-row (data cells themselves aren&apos;t focusable by design).</li>
            </ul>
          </li>
          <li>• <strong>Empty state</strong> — the emptyState renders inside a <code className="text-xs">tr/td</code> spanning all columns so SR announces it as a table row.</li>
          <li>• <strong>Reduced motion</strong> — sort indicator rotation respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
