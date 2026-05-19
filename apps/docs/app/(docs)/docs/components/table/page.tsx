"use client"

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import { Badge } from "@/registry/dash/ui/badge"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const rows = [
  { id: "mtr-9412", name: "Sigit P.", tribe: "Reservasi", city: "Bekasi", status: "active", trips: 142 },
  { id: "mtr-9419", name: "Andi W.", tribe: "Express", city: "Tangerang", status: "suspended", trips: 78 },
  { id: "mtr-9425", name: "Rina S.", tribe: "Express", city: "Jakarta", status: "active", trips: 263 },
  { id: "mtr-9431", name: "Wei Chen", tribe: "Bulk", city: "Surabaya", status: "pending", trips: 14 },
  { id: "mtr-9434", name: "Fayzul A.", tribe: "Reservasi", city: "Bandung", status: "active", trips: 98 },
]

const statusTone: Record<string, "success" | "error" | "warning"> = {
  active: "success",
  suspended: "error",
  pending: "warning",
}

export default function TableDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Displaying Data"
        title="Table"
        description="Primitive table parts. Bring your own data + sorting logic. Combine with Pagination and Filter for full list pages. For column resizing / virtualization / multi-sort, use Data Table."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add table`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import {
  Table, TableHeader, TableBody, TableFooter,
  TableRow, TableHead, TableCell,
} from "@/registry/dash/ui/table"

<Table>
  <TableHeader>
    <TableRow><TableHead>Mitra ID</TableHead></TableRow>
  </TableHeader>
  <TableBody>
    <TableRow><TableCell>mtr-9412</TableCell></TableRow>
  </TableBody>
</Table>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Mitra list with footer"
          preview={
            <div className="w-full border border-stroke-soft-200 rounded-xl bg-bg-white-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitra ID</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tribe</TableHead>
                    <TableHead>Kota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Trip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="">{r.id}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.tribe}</TableCell>
                      <TableCell>{r.city}</TableCell>
                      <TableCell>
                        <Badge status={statusTone[r.status]} appearance="lighter">{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.trips}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5}>Total</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {rows.reduce((a, b) => a + b.trips, 0)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          }
          code={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Mitra ID</TableHead>
      <TableHead>Tribe</TableHead>
      <TableHead className="text-right">Total Trip</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map(r => (
      <TableRow key={r.id}>
        <TableCell className="">{r.id}</TableCell>
        <TableCell>{r.tribe}</TableCell>
        <TableCell className="text-right tabular-nums">{r.trips}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={2}>Total</TableCell>
      <TableCell className="text-right tabular-nums">{total}</TableCell>
    </TableRow>
  </TableFooter>
</Table>`}
        />
      </DocsSection>

      <DocsSection title="More examples">
        <DocsExample
          title="Empty state"
          preview={
            <div className="w-full border border-stroke-soft-200 rounded-xl bg-bg-white-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitra ID</TableHead>
                    <TableHead>Tribe</TableHead>
                    <TableHead className="text-right">Trip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-sm text-text-soft-400">
                      Belum ada mitra yang cocok dengan filter saat ini.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          }
          code={`<TableRow>
  <TableCell colSpan={3} className="text-center py-12">
    Belum ada mitra yang cocok dengan filter.
  </TableCell>
</TableRow>`}
        />

        <DocsExample
          title="Loading skeleton row"
          preview={
            <div className="w-full border border-stroke-soft-200 rounded-xl bg-bg-white-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitra ID</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tribe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-3 w-20 rounded bg-bg-weak-50" /></TableCell>
                      <TableCell><div className="h-3 w-32 rounded bg-bg-weak-50" /></TableCell>
                      <TableCell><div className="h-3 w-24 rounded bg-bg-weak-50" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          }
          code={`{loading && [1,2,3].map(i => (
  <TableRow key={i}>
    <TableCell><Skeleton className="w-20 h-3" /></TableCell>
    …
  </TableRow>
))}`}
        />

        <DocsExample
          title="Sticky header in tall table"
          preview={
            <div className="w-full max-h-72 overflow-auto border border-stroke-soft-200 rounded-xl bg-bg-white-0">
              <Table>
                <TableHeader className="sticky top-0 bg-bg-white-0 z-10">
                  <TableRow>
                    <TableHead>Mitra ID</TableHead>
                    <TableHead>Kota</TableHead>
                    <TableHead className="text-right">Trip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="">mtr-{9400 + i}</TableCell>
                      <TableCell>{["Bekasi", "Tangerang", "Bandung", "Surabaya"][i % 4]}</TableCell>
                      <TableCell className="text-right tabular-nums">{(i + 1) * 14}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          }
          code={`<div className="max-h-72 overflow-auto">
  <Table>
    <TableHeader className="sticky top-0 bg-bg-white-0 z-10">…</TableHeader>
    <TableBody>{/* long body */}</TableBody>
  </Table>
</div>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold text-text-strong-950 pt-2">Slots</h3>
        <DocsPropsTable
          rows={[
            { name: "Table", type: "table", description: "Root <table> element with default styles." },
            { name: "TableHeader", type: "thead", description: "Column header section." },
            { name: "TableBody", type: "tbody", description: "Data rows section." },
            { name: "TableFooter", type: "tfoot", description: "Totals / summary row section." },
            { name: "TableRow", type: "tr", description: "Single row. Add data-state='selected' for row selection styling." },
            { name: "TableHead", type: "th", description: "Header cell. Use text-right for numeric columns." },
            { name: "TableCell", type: "td", description: "Body / footer cell. Pass colSpan for full-width rows (empty state)." },
            { name: "TableCaption", type: "caption", description: "Accessible caption (often visually hidden)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Table · TableHeader · TableBody · TableFooter · TableRow · TableHead · TableCell · TableCaption.</li>
          <li>• Headless — bring sort / filter / selection state. For multi-sort, column resize, virtualization → use Data Table.</li>
          <li>• Pair with Pagination + Filter chips for full list pages.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Renders semantic <code className="text-xs">&lt;table&gt;</code> markup — screen readers expose row / column navigation.</li>
          <li>• Pair with a <code className="text-xs">TableCaption</code> (visually hidden via <code className="text-xs">sr-only</code>) describing the table&apos;s purpose.</li>
          <li>• For sortable columns: pair the <code className="text-xs">TableHead</code> with a real button + <code className="text-xs">aria-sort=&quot;ascending&quot;|&quot;descending&quot;|&quot;none&quot;</code>.</li>
          <li>• For selected rows: add <code className="text-xs">aria-selected=&quot;true&quot;</code> + data-state.</li>
          <li>• Numeric cells should use <code className="text-xs">tabular-nums</code> + <code className="text-xs">text-right</code> so columns align visually.</li>
          <li>• Wrap in <code className="text-xs">overflow-auto</code> with a labelled scroll region when horizontal scroll is needed.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
