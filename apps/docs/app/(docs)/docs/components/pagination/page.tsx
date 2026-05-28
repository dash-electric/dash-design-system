"use client"

import * as React from "react"
import {
  RiArrowDownSLine as ChevronDown,
  RiSearchLine as Search,
  RiTeamLine as Team,
  RiNotification3Line as Bell,
  RiUploadLine as Export,
  RiAddLine as Add,
  RiFilter3Line as Filter,
  RiArrowUpDownLine as Sort,
} from "@remixicon/react"
import {
  Pagination,
  PaginationList,
  PaginationItem,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
} from "@/registry/dash/ui/pagination"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"

/**
 * Pagination — Figma 1:1 (4 nodes verified 2026-05-18).
 *
 *   513:3681     Cell spec — rounded + full radius × 4 states (default/hover/active/disabled)
 *   513:3892     3 layouts — Page X of Y label + buttons + items-per-page select
 *   3347:21643   Team table bottom pagination LIGHT
 *   3347:21652   same DARK
 */

const ItemsPerPage = ({ value, onChange, options }: { value: number; onChange: (v: number) => void; options: number[] }) => (
  <label className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-sm text-text-strong-950">
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="bg-transparent outline-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o} / page</option>
      ))}
    </select>
    <ChevronDown className="size-3.5 text-icon-soft-400" />
  </label>
)

const PaginationRow = ({
  current,
  total,
  shape,
  onSelect,
}: {
  current: number
  total: number
  shape?: "rounded" | "full"
  onSelect: (n: number) => void
}) => {
  const visible = [1, 2, 3, 4, 5, "…", total]
  return (
    <Pagination>
      <PaginationList>
        <PaginationItem>
          <PaginationFirst disabled={current === 1} onClick={() => onSelect(1)} shape={shape} />
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious disabled={current === 1} onClick={() => onSelect(Math.max(1, current - 1))} shape={shape} />
        </PaginationItem>
        {visible.map((v, i) =>
          v === "…" ? (
            <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>
          ) : (
            <PaginationItem key={i}>
              <PaginationButton
                shape={shape}
                isActive={v === current}
                onClick={() => onSelect(v as number)}
              >
                {v}
              </PaginationButton>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext disabled={current === total} onClick={() => onSelect(Math.min(total, current + 1))} shape={shape} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLast disabled={current === total} onClick={() => onSelect(total)} shape={shape} />
        </PaginationItem>
      </PaginationList>
    </Pagination>
  )
}

export default function PaginationDocsPage() {
  const [page, setPage] = React.useState(2)
  const [pageFull, setPageFull] = React.useState(2)
  const [perPage, setPerPage] = React.useState(7)
  const total = 16

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Navigation"
        title="Pagination"
        description="Page-based navigation cluster. 32px cells, rounded (radius-8) or full (pill). Compose first/prev/page-number/ellipsis/next/last + optional Page X of Y label + items-per-page select for a complete data-table footer."
      />

      <DocsSection title="Cell shapes & states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two shapes: <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">rounded</code> (radius-8) and <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">full</code> (pill). Each renders four states: default, hover (bg-weak-50), active (filled), disabled.
        </p>
        <DocsExample
          title="rounded + full × 4 states"
          preview={
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PaginationButton>1</PaginationButton>
                <PaginationButton className="bg-bg-weak-50">1</PaginationButton>
                <PaginationButton isActive>1</PaginationButton>
                <PaginationButton disabled>1</PaginationButton>
              </div>
              <div className="flex items-center gap-2">
                <PaginationButton shape="full">1</PaginationButton>
                <PaginationButton shape="full" className="bg-bg-weak-50">1</PaginationButton>
                <PaginationButton shape="full" isActive>1</PaginationButton>
                <PaginationButton shape="full" disabled>1</PaginationButton>
              </div>
            </div>
          }
          code={`<PaginationButton>1</PaginationButton>
<PaginationButton isActive>1</PaginationButton>
<PaginationButton disabled>1</PaginationButton>
<PaginationButton shape="full">1</PaginationButton>`}
        />
      </DocsSection>

      <DocsSection title="Compact prev/next">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two-chevron paginator for narrow rails (mobile, sidebar, embedded card). No numbered cells — disable Previous when on page 1, Next on the last page.
        </p>
        <DocsExample
          title="Previous + Next only"
          preview={
            <Pagination>
              <PaginationList>
                <PaginationItem>
                  <PaginationPrevious disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 text-sm text-text-sub-600">Page {page} / {total}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext disabled={page === total} onClick={() => setPage((p) => Math.min(total, p + 1))} />
                </PaginationItem>
              </PaginationList>
            </Pagination>
          }
          code={`<Pagination>
  <PaginationList>
    <PaginationItem><PaginationPrevious disabled={page === 1} onClick={prev} /></PaginationItem>
    <PaginationItem><span>Page {page} / {total}</span></PaginationItem>
    <PaginationItem><PaginationNext disabled={page === total} onClick={next} /></PaginationItem>
  </PaginationList>
</Pagination>`}
        />
      </DocsSection>

      <DocsSection title="Numbered w/ ellipsis">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Build the visible-page array client-side: always show 1-2 neighbours on each side of the current page plus the first and last. Insert <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">PaginationEllipsis</code> wherever the sequence jumps by &gt;1.
        </p>
        <DocsExample
          title="1, 2, 3, …, 16"
          preview={
            <Pagination>
              <PaginationList>
                <PaginationItem><PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} /></PaginationItem>
                {[1, 2, 3, "…", total].map((v, i) =>
                  v === "…" ? (
                    <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>
                  ) : (
                    <PaginationItem key={i}>
                      <PaginationButton isActive={v === page} onClick={() => setPage(v as number)}>{v}</PaginationButton>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem><PaginationNext onClick={() => setPage((p) => Math.min(total, p + 1))} disabled={page === total} /></PaginationItem>
              </PaginationList>
            </Pagination>
          }
          code={`{visiblePages.map((v, i) =>
  v === "…"
    ? <PaginationEllipsis />
    : <PaginationButton isActive={v === page} onClick={() => setPage(v)}>{v}</PaginationButton>
)}`}
        />
      </DocsSection>

      <DocsSection title="Showing X-Y of Z + page-size">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Range label + numbered buttons + items-per-page select. Compute the visible range from <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">(page - 1) * perPage + 1 … page * perPage</code> capped at the dataset total.
        </p>
        <DocsExample
          title='"Showing 8-14 of 112"'
          preview={
            <div className="flex items-center justify-between gap-3 flex-wrap max-w-2xl">
              <span className="text-sm text-text-sub-600">
                Showing <strong className="text-text-strong-950">{(page - 1) * perPage + 1}</strong>
                –<strong className="text-text-strong-950">{Math.min(page * perPage, 112)}</strong> of <strong className="text-text-strong-950">112</strong>
              </span>
              <PaginationRow current={page} total={total} onSelect={setPage} />
              <ItemsPerPage value={perPage} onChange={setPerPage} options={[7, 10, 25, 50]} />
            </div>
          }
          code={`<span>Showing {from}–{to} of {totalRecords}</span>
<Pagination>{...}</Pagination>
<ItemsPerPage value={perPage} onChange={setPerPage} />`}
        />
      </DocsSection>

      <DocsSection title="URL-driven controlled pagination">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          For shareable / bookmarkable lists, source <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">page</code> from the URL search params and push updates back via <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">router.replace</code>. Pagination stays controlled — no internal state.
        </p>
        <DocsExample
          title="Pattern (read-only preview)"
          preview={
            <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-4 py-3 max-w-md text-sm text-text-sub-600">
              Selected page is read from <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">searchParams.get(&quot;page&quot;)</code>. Clicking a page navigates with shallow URL update.
            </div>
          }
          code={`"use client"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

function PagedTable() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const page = Number(params.get("page") ?? 1)

  const go = (n: number) => {
    const next = new URLSearchParams(params)
    next.set("page", String(n))
    router.replace(\`\${pathname}?\${next.toString()}\`)
  }

  return (
    <Pagination>
      <PaginationList>
        <PaginationItem><PaginationPrevious onClick={() => go(page - 1)} disabled={page === 1} /></PaginationItem>
        {visible.map(v => (
          <PaginationItem><PaginationButton isActive={v === page} onClick={() => go(v)}>{v}</PaginationButton></PaginationItem>
        ))}
        <PaginationItem><PaginationNext onClick={() => go(page + 1)} disabled={page === total} /></PaginationItem>
      </PaginationList>
    </Pagination>
  )
}`}
        />
      </DocsSection>

      <DocsSection title="Full data-table footer">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Complete layout — Page X of Y label on the left, cluster of first / prev / numbered + ellipsis / next / last in the center, items-per-page select on the right. Use as a table footer.
        </p>
        <DocsExample
          title="Page 2 of 16 · 7 / page"
          preview={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-sm text-text-sub-600">Page {page} of {total}</span>
                <PaginationRow current={page} total={total} onSelect={setPage} />
                <ItemsPerPage value={perPage} onChange={setPerPage} options={[7, 10, 25, 50]} />
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-sm text-text-sub-600">Page {pageFull} of {total}</span>
                <PaginationRow current={pageFull} total={total} shape="full" onSelect={setPageFull} />
                <ItemsPerPage value={perPage} onChange={setPerPage} options={[7, 10, 25, 50]} />
              </div>
            </div>
          }
          code={`<Pagination>
  <PaginationList>
    <PaginationItem><PaginationFirst onClick={() => setPage(1)} /></PaginationItem>
    <PaginationItem><PaginationPrevious onClick={() => setPage(p => p - 1)} /></PaginationItem>
    {visible.map(v => (
      v === "…"
        ? <PaginationItem><PaginationEllipsis /></PaginationItem>
        : <PaginationItem><PaginationButton isActive={v === page} onClick={() => setPage(v)}>{v}</PaginationButton></PaginationItem>
    ))}
    <PaginationItem><PaginationNext onClick={() => setPage(p => p + 1)} /></PaginationItem>
    <PaginationItem><PaginationLast onClick={() => setPage(total)} /></PaginationItem>
  </PaginationList>
</Pagination>`}
        />
      </DocsSection>

      <DocsSection title="Inside a Teams table">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Bottom-aligned pagination row inside a real table footer. Light + dark themes auto-flip via `.dark`.
        </p>
        <DocsExample
          title="Teams members pagination"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-(--shadow-custom-sm) overflow-hidden">
              <header className="flex items-center justify-between px-6 py-4 border-b border-stroke-soft-200">
                <div className="inline-flex items-center gap-3">
                  <span className="size-8 rounded-full bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400">
                    <Team className="size-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-text-strong-950">Teams</div>
                    <div className="text-xs text-text-sub-600">Manage and collaborate within your organization&apos;s teams.</div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Button size="icon-sm" tone="neutral" style="ghost" aria-label="Search"><Search /></Button>
                  <Button size="icon-sm" tone="neutral" style="ghost" aria-label="Notifications"><Bell /></Button>
                </div>
              </header>
              <div className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-semibold text-text-strong-950">Members</div>
                  <div className="text-xs text-text-sub-600">Display all the team members and essential details.</div>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Button size="sm" tone="neutral" style="stroke" leftIcon={<Export />}>Export</Button>
                  <Button size="sm" tone="primary" leftIcon={<Add />}>Invite Member</Button>
                </div>
              </div>
              <div className="px-6 pb-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 p-1">
                  {["All", "Active", "Absent"].map((t, i) => (
                    <button
                      key={t}
                      type="button"
                      className={
                        i === 0
                          ? "px-3 py-1 rounded-md text-xs font-medium bg-bg-white-0 text-text-strong-950 shadow-regular-xs"
                          : "px-3 py-1 rounded-md text-xs font-medium text-text-sub-600 hover:text-text-strong-950"
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="inline-flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 h-8 px-2.5 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-soft-400">
                    <Search className="size-3.5" /> Search… <kbd className="ml-1 text-[10px] px-1 rounded bg-bg-weak-50 text-text-sub-600">⌘1</kbd>
                  </div>
                  <Button size="sm" tone="neutral" style="stroke" leftIcon={<Filter />}>Filter</Button>
                  <Button size="sm" tone="neutral" style="stroke" leftIcon={<Sort />}>Sort by</Button>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-bg-weak-50">
                  <tr className="text-left">
                    {["Member name","Title","Project","Member documents","Status"].map((c) => (
                      <th key={c} className="px-6 py-2 text-[11px] uppercase tracking-wider text-text-soft-400 font-medium">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-soft-200">
                  {[
                    ["James Brown",     "Marketing Manager",      "Monday.com",   "brown-james.pdf",   "Active"],
                    ["Sophia Williams", "HR Assistant",           "Notion",        "williams-sophia.pdf","Active"],
                    ["Arthur Taylor",   "Entrepreneur / CEO",     "Spotify",       "taylor-arthur.pdf",  "Absent"],
                  ].map((row) => (
                    <tr key={row[0]} className="text-text-strong-950">
                      {row.map((c, i) => <td key={i} className="px-6 py-3 text-sm">{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              <footer className="px-6 py-3 border-t border-stroke-soft-200 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-sm text-text-sub-600">Page {pageFull} of {total}</span>
                <PaginationRow current={pageFull} total={total} onSelect={setPageFull} />
                <ItemsPerPage value={perPage} onChange={setPerPage} options={[7, 10, 25, 50]} />
              </footer>
            </div>
          }
          code={`<footer className="flex items-center justify-between">
  <span>Page {page} of {total}</span>
  <Pagination>...</Pagination>
  <ItemsPerPage value={perPage} onChange={setPerPage} />
</footer>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Pagination sertakan context: total record, page size, current range. Dispatcher tahu posisi dalam dataset besar.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs text-xs flex items-center justify-between">
                <span className="text-text-sub-600">1-25 dari 1,284 mitra</span>
                <div className="flex gap-1">
                  <div className="size-6 rounded border border-stroke-soft-200 flex items-center justify-center">‹</div>
                  <div className="size-6 rounded bg-(--dash-purple-500) text-white flex items-center justify-center">1</div>
                  <div className="size-6 rounded border border-stroke-soft-200 flex items-center justify-center">2</div>
                  <div className="size-6 rounded border border-stroke-soft-200 flex items-center justify-center">›</div>
                </div>
              </div>
            ),
            caption: "Tampilkan \"1-25 dari 1,284\". Dispatcher tahu total dataset, current range, dan estimate berapa halaman tersisa.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs flex items-center gap-1">
                <div className="size-6 rounded border border-stroke-soft-200 flex items-center justify-center">‹</div>
                <div className="size-6 rounded border border-stroke-soft-200 flex items-center justify-center">›</div>
              </div>
            ),
            caption: "Jangan kasih cuma prev/next tanpa context. Dispatcher tidak tahu sudah scroll seberapa jauh dari total.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Sediakan page-size selector (25 / 50 / 100). Dispatcher monitor 200 mitra → switch ke 100/page jadi 2 halaman saja.",
          }}
          dont={{
            caption: "Jangan render 50 page button. Pakai ellipsis pattern (1 … 12 13 14 … 51). Cuma show neighborhood + first/last.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "PaginationButton.shape", type: '"rounded" | "full"', defaultValue: '"rounded"', description: "Cell radius — rounded (8px) or full (pill)." },
            { name: "PaginationButton.isActive", type: "boolean", defaultValue: "false", description: "Highlights the current page (filled bg-weak-50)." },
            { name: "PaginationButton.disabled", type: "boolean", defaultValue: "false", description: "Disabled state — opacity 50, no interaction." },
            { name: "PaginationFirst / PaginationLast", type: "Button", description: "Double-chevron skip-to-first / skip-to-last buttons." },
            { name: "PaginationPrevious / PaginationNext", type: "Button", description: "Single-chevron prev/next buttons." },
            { name: "PaginationEllipsis", type: "span", description: "Three-dot placeholder for omitted page numbers. Matches button cell chrome (32×32 with border)." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
