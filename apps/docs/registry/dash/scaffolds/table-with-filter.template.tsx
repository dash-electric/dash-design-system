"use client"

import * as React from "react"
import {
  RiSearchLine as Search,
  RiRefreshLine as Refresh,
} from "@remixicon/react"
import { DataTable, type ColumnDef } from "@/registry/dash/ui/data-table"
import { Card, CardContent, CardHeader } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { DateRangePicker } from "@/registry/dash/ui/date-picker"
import { StatusBadge, type Status } from "@/registry/dash/ui/badge"
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/registry/dash/ui/empty-state"

/**
 * @template table-with-filter
 * @placeholder COLUMNS         — TanStack ColumnDef<TRow>[] for the rows being shown.
 * @placeholder DATA_FETCHER    — async fn returning rows for the current filter+page.
 *                                 Signature: (filters: TableFilters) => Promise<TRow[]>
 * @placeholder FILTER_FIELDS   — feature-specific filter chips on top of the base
 *                                 status+search+daterange (e.g. tribe, region, tier).
 * @placeholder ROW_DETAIL      — what to do when a row is clicked (default = no-op).
 *
 * WHY this template:
 *  - 80%+ of Dash backoffice screens are "table + filter bar + paginate + row
 *    click → detail modal". PE rewrites this skeleton 10× per quarter — same
 *    bugs each time (filter doesn't reset page; debounce missing; empty state
 *    renders BEFORE first fetch returns and looks like a broken endpoint).
 *  - Locking the filter ↔ fetch ↔ pagination wiring in the scaffold means
 *    Agent N only fills the columns and the fetcher.
 *  - `@dash/data-table` is the canonical table primitive (TanStack-backed).
 *    Sticking to it avoids the "second table lib" anti-pattern in rules § Anti-patterns.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TableFilters = {
  /** Status badge variant — pre-baked because every Dash table has one. */
  status: Status | "all"
  /** Debounced search query. */
  search: string
  /** Inclusive date range, null = unbounded on that side. */
  dateFrom: Date | null
  dateTo: Date | null
}

export type TableWithFilterTemplateProps<TRow extends { id: string }> = {
  /** TanStack ColumnDef array. Filled by AI from the row shape. */
  columns: ColumnDef<TRow, unknown>[]
  /** Returns the rows for the current filters. Called on filter change + mount. */
  fetcher: (filters: TableFilters) => Promise<TRow[]>
  /** Status options surfaced in the filter dropdown. Order shown in the UI. */
  statusOptions?: { value: Status | "all"; label: string }[]
  /** Page size for the DataTable. Defaults to 10 — matches existing tables. */
  pageSize?: number
  /** Row click handler — typically opens a detail modal. */
  onRowClick?: (row: TRow) => void
  /** Feature-specific filter chips appended after status/search/daterange. */
  extraFilters?: React.ReactNode
  /** Header title — appears above the filter bar. */
  title?: string
}

const DEFAULT_STATUS_OPTIONS: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "Semua status" },
  { value: "success", label: "Berhasil" },
  { value: "warning", label: "Perlu perhatian" },
  { value: "error", label: "Gagal" },
  { value: "information", label: "Sedang diproses" },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TableWithFilterTemplate<TRow extends { id: string }>({
  columns,
  fetcher,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  pageSize = 10,
  onRowClick,
  extraFilters,
  title = "Daftar",
}: TableWithFilterTemplateProps<TRow>) {
  const [filters, setFilters] = React.useState<TableFilters>({
    status: "all",
    search: "",
    dateFrom: null,
    dateTo: null,
  })
  const [rows, setRows] = React.useState<TRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | undefined>(undefined)

  // WHY a debounce ref (not a hook lib): vanilla state mandate — we cannot add
  // `use-debounce` or similar. A 350ms window matches existing Dash tables.
  const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [searchInput, setSearchInput] = React.useState("")

  const runFetch = React.useCallback(
    async (next: TableFilters) => {
      setLoading(true)
      setError(undefined)
      try {
        const result = await fetcher(next)
        setRows(result)
      } catch (err) {
        setRows([])
        setError(err instanceof Error ? err.message : "Gagal memuat data.")
      } finally {
        setLoading(false)
      }
    },
    [fetcher],
  )

  // Initial fetch + refetch on filter change. WHY effect (not handler-only):
  // status / date range mutate via dedicated controls; the effect collapses
  // every filter source into a single fetch trigger.
  React.useEffect(() => {
    runFetch(filters)
  }, [filters, runFetch])

  const onSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }))
    }, 350)
  }

  // @placeholder FILTER_FIELDS
  // -------------------------------------------------------------------------
  // AI: if the feature needs additional filters (region, tribe, tier),
  // accept them via the `extraFilters` prop and merge into TableFilters
  // through a wider generic. Default scaffold ships only status+search+date.
  // -------------------------------------------------------------------------

  return (
    <Card>
      <CardHeader className="gap-3">
        <h2 className="text-lg font-semibold text-text-strong-950">{title}</h2>

        <div className="flex flex-wrap items-center gap-2">
          <InputRoot className="min-w-[240px] flex-1">
            <InputIcon>
              <Search aria-hidden className="size-4" />
            </InputIcon>
            <Input
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari..."
              aria-label="Cari di tabel"
            />
          </InputRoot>

          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value as Status | "all" }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    {opt.value !== "all" ? (
                      <StatusBadge status={opt.value} variant="dot-stroke" size="sm" />
                    ) : null}
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DateRangePicker
            value={
              filters.dateFrom || filters.dateTo
                ? {
                    from: filters.dateFrom ?? undefined,
                    to: filters.dateTo ?? undefined,
                  }
                : undefined
            }
            onValueChange={(range) =>
              setFilters((prev) => ({
                ...prev,
                dateFrom: range?.from ?? null,
                dateTo: range?.to ?? null,
              }))
            }
          />

          {extraFilters}

          <Button
            type="button"
            tone="neutral"
            style="stroke"
            size="sm"
            leftIcon={<Refresh />}
            onClick={() => runFetch(filters)}
            loading={loading}
          >
            Muat ulang
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="rounded-lg border border-error-base bg-error-lighter p-3 text-sm text-error-base">
            {error}
          </div>
        ) : null}

        <DataTable
          columns={columns}
          data={rows}
          pageSize={pageSize}
          emptyState={
            !loading && rows.length === 0 ? (
              <EmptyState>
                <EmptyStateTitle>Tidak ada data</EmptyStateTitle>
                <EmptyStateDescription>
                  Tidak ditemukan data yang cocok dengan filter saat ini.
                </EmptyStateDescription>
              </EmptyState>
            ) : undefined
          }
          // WHY onTableReady (not onRowClick prop): the data-table primitive
          // doesn't expose row click natively. We attach a click handler via
          // the column meta in COLUMNS for now; once the table primitive grows
          // an onRowClick we'll plumb it through here.
          onTableReady={() => {
            void onRowClick
            // AI: wire up `table.getRowModel().rows[i].original` → onRowClick
            // inside the row renderer if your columns need it.
          }}
        />
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Helpers — re-exported so AI fills can use them in COLUMNS.
// ---------------------------------------------------------------------------

/**
 * @placeholder COLUMNS — example column shape. AI replaces this with the
 *                         feature's actual columns in the consumer block.
 */
export type TableColumnExample<TRow> = ColumnDef<TRow, unknown>
