"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import {
  RiSearchLine,
  RiTimeLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { DateRangePicker } from "@/registry/dash/ui/date-picker"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import {
  Pagination,
  PaginationList,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationButton,
} from "@/registry/dash/ui/pagination"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/registry/dash/ui/tooltip"
import { cn } from "@/registry/dash/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Single audit log entry, mirrors the `t_<entity>_audit_log` row contract
 * documented in dash-ai-rules.md § Audit Trail.
 */
export type AuditEntry = {
  id: string
  fieldName: string
  /** Raw value before the edit. Can be URL, money-as-string, JSON blob, etc. */
  originalValue: string
  /** Raw value after the edit. */
  editedValue: string
  editorId: string
  /** Optional human-readable editor name; if absent, `editorLookup` is consulted. */
  editorName?: string
  /** ISO8601 timestamp. */
  editedAt: string
  /** REQUIRED non-empty per BE contract — never render empty reasons. */
  editReason: string
  /** Optional sha256 of source IP (forensic-only, not displayed). */
  ipHash?: string
}

export type AuditHistoryTableProps = {
  entries: AuditEntry[]
  /** Map of raw field name → human-readable label. */
  fieldLabels?: Record<string, string>
  /**
   * Renderer for a single value cell. Use to surface image thumbnails for
   * URLs, formatted money for amounts, etc. Returning `null` falls back to
   * the raw string.
   */
  renderValue?: (fieldName: string, value: string) => React.ReactNode
  /** Async lookup for editor name when only `editorId` is known. */
  editorLookup?: (editorId: string) => Promise<string>
  /** Override the default Indonesian empty message. */
  emptyMessage?: string
  /** Page size — defaults to 10 to match other Dash tables. */
  pageSize?: number
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const REASON_TRUNCATE = 60

/**
 * Indonesian relative-time formatter — kept inline (vs. importing `dayjs`
 * or `date-fns`) because the rules § External Library Policy bans adding a
 * date lib for two strings of output. Buckets follow what staff scan for
 * fastest in the backoffice queue.
 */
function formatRelativeId(iso: string, now: number = Date.now()): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return iso
  const diffSec = Math.round((now - t) / 1000)
  if (diffSec < 0) return "baru saja"
  if (diffSec < 45) return "baru saja"
  if (diffSec < 90) return "1 menit lalu"
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr} jam lalu`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 30) return `${diffDay} hari lalu`
  const diffMo = Math.round(diffDay / 30)
  if (diffMo < 12) return `${diffMo} bulan lalu`
  const diffYr = Math.round(diffMo / 12)
  return `${diffYr} tahun lalu`
}

function formatAbsoluteId(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  // 24-hr Indonesian display, no locale lib required.
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d)
}

function defaultLabel(fieldName: string, labels?: Record<string, string>): string {
  if (labels?.[fieldName]) return labels[fieldName]
  // Humanize snake_case → "Snake Case" as a safe fallback.
  return fieldName
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")
}

type SortKey = "editedAt" | "fieldName" | "editorName"
type SortDir = "asc" | "desc"

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders edit history for any user-editable legal/financial field.
 * Per Dash audit-trail rule, every entity carrying mitra dispute or
 * regulator exposure (proof images, payments, signatures, KYC docs,
 * mitra status changes) MUST surface its `t_<entity>_audit_log` rows
 * via this block.
 *
 * Voice: neutral (staff-/ops-facing, not mitra-facing).
 */
export function AuditHistoryTable({
  entries,
  fieldLabels,
  renderValue,
  editorLookup,
  emptyMessage,
  pageSize = 10,
  className,
}: AuditHistoryTableProps) {
  // --- Filter state -------------------------------------------------------
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [fieldFilter, setFieldFilter] = React.useState<string>("all")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined,
  )

  // --- Pagination + expansion + sort -------------------------------------
  const [page, setPage] = React.useState(1)
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = React.useState<SortKey>("editedAt")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")

  // --- Editor-name async cache -------------------------------------------
  // WHY a Map cached in state (not React Query / SWR): the rules ban data
  // fetching libs. A Map keyed on editorId is sufficient for the lookup
  // pattern and re-renders trigger naturally when entries change.
  const [editorCache, setEditorCache] = React.useState<
    Record<string, { status: "loading" | "loaded" | "error"; name?: string }>
  >({})

  // Debounce search input — same 350ms convention as table-with-filter
  // scaffold; lets the user type without thrash on the filter pass below.
  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset page when filters move — avoids the "empty page 4" trap.
  React.useEffect(() => {
    setPage(1)
  }, [search, fieldFilter, dateRange?.from, dateRange?.to])

  // Trigger async lookups for any editor missing a name. Tracks in flight
  // requests in a ref so we don't fire duplicates per render.
  const inFlightRef = React.useRef<Set<string>>(new Set())
  React.useEffect(() => {
    if (!editorLookup) return
    const missing = entries.filter(
      (e) =>
        !e.editorName &&
        !editorCache[e.editorId] &&
        !inFlightRef.current.has(e.editorId),
    )
    if (missing.length === 0) return

    missing.forEach((e) => {
      inFlightRef.current.add(e.editorId)
      setEditorCache((prev) => ({
        ...prev,
        [e.editorId]: { status: "loading" },
      }))
      editorLookup(e.editorId)
        .then((name) => {
          setEditorCache((prev) => ({
            ...prev,
            [e.editorId]: { status: "loaded", name },
          }))
        })
        .catch(() => {
          setEditorCache((prev) => ({
            ...prev,
            [e.editorId]: { status: "error" },
          }))
        })
        .finally(() => {
          inFlightRef.current.delete(e.editorId)
        })
    })
    // We intentionally exclude editorCache from deps — including it would
    // trigger the effect after every setState, even though no new entries
    // need fetching. The `missing` filter above is the real guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, editorLookup])

  // --- Unique fields for filter dropdown ---------------------------------
  const uniqueFields = React.useMemo(() => {
    const set = new Set(entries.map((e) => e.fieldName))
    return Array.from(set)
  }, [entries])

  // --- Filtered + sorted entries -----------------------------------------
  const resolvedName = React.useCallback(
    (e: AuditEntry): string => {
      if (e.editorName) return e.editorName
      const cached = editorCache[e.editorId]
      if (cached?.status === "loaded" && cached.name) return cached.name
      return e.editorId
    },
    [editorCache],
  )

  const visible = React.useMemo(() => {
    const from = dateRange?.from?.getTime() ?? -Infinity
    const to = dateRange?.to ? dateRange.to.getTime() + 86_400_000 - 1 : Infinity
    const filtered = entries.filter((e) => {
      if (fieldFilter !== "all" && e.fieldName !== fieldFilter) return false
      const t = new Date(e.editedAt).getTime()
      if (!Number.isNaN(t)) {
        if (t < from || t > to) return false
      }
      if (search) {
        const name = resolvedName(e).toLowerCase()
        if (!name.includes(search)) return false
      }
      return true
    })

    const dir = sortDir === "asc" ? 1 : -1
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "editedAt") {
        return (
          (new Date(a.editedAt).getTime() - new Date(b.editedAt).getTime()) *
          dir
        )
      }
      if (sortKey === "fieldName") {
        return (
          defaultLabel(a.fieldName, fieldLabels).localeCompare(
            defaultLabel(b.fieldName, fieldLabels),
            "id",
          ) * dir
        )
      }
      return resolvedName(a).localeCompare(resolvedName(b), "id") * dir
    })

    return sorted
  }, [
    entries,
    fieldFilter,
    dateRange?.from,
    dateRange?.to,
    search,
    sortKey,
    sortDir,
    fieldLabels,
    resolvedName,
  ])

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageEntries = visible.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  // --- Handlers -----------------------------------------------------------
  const toggleExpand = (id: string) => {
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "editedAt" ? "desc" : "asc")
    }
  }

  const ariaSortFor = (key: SortKey): "ascending" | "descending" | "none" => {
    if (sortKey !== key) return "none"
    return sortDir === "asc" ? "ascending" : "descending"
  }

  const renderValueCell = (
    fieldName: string,
    value: string,
  ): React.ReactNode => {
    if (renderValue) {
      const rendered = renderValue(fieldName, value)
      if (rendered !== null && rendered !== undefined) return rendered
    }
    return (
      <span className="font-mono text-xs text-text-sub-600 break-all">
        {value || <em className="not-italic text-text-soft-400">kosong</em>}
      </span>
    )
  }

  const renderEditorCell = (e: AuditEntry) => {
    const cached = editorCache[e.editorId]
    const name = e.editorName ?? cached?.name
    if (!name && cached?.status === "loading") {
      return (
        <div className="flex items-center gap-2">
          <span className="size-7 rounded-full bg-bg-weak-50 animate-pulse" />
          <span className="h-3 w-20 rounded bg-bg-weak-50 animate-pulse" />
        </div>
      )
    }
    const display = name ?? e.editorId
    return (
      <div className="flex items-center gap-2">
        <Avatar size="md" shape="circle">
          <AvatarFallback>{initialsFromName(display) || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-text-strong-950 truncate max-w-[140px]">
            {display}
          </span>
          {name ? (
            <span className="text-[11px] text-text-soft-400 truncate max-w-[140px] font-mono">
              {e.editorId}
            </span>
          ) : null}
        </div>
      </div>
    )
  }

  // --- Empty state --------------------------------------------------------
  if (entries.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-10 text-center",
          className,
        )}
      >
        <p className="text-sm text-text-sub-600">
          {emptyMessage ?? "Belum ada riwayat edit."}
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div
        data-slot="audit-history-table"
        className={cn(
          "rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden",
          className,
        )}
      >
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-stroke-soft-200">
          <InputRoot className="min-w-[200px] flex-1 max-w-xs">
            <InputIcon>
              <RiSearchLine aria-hidden className="size-4" />
            </InputIcon>
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari editor..."
              aria-label="Cari berdasarkan nama editor"
            />
          </InputRoot>

          {uniqueFields.length > 1 ? (
            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger className="w-[200px]" aria-label="Filter field">
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua field</SelectItem>
                {uniqueFields.map((f) => (
                  <SelectItem key={f} value={f}>
                    {defaultLabel(f, fieldLabels)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <DateRangePicker
            value={dateRange}
            onValueChange={setDateRange}
            placeholder="Rentang tanggal"
          />

          <span className="ml-auto text-xs text-text-soft-400">
            {visible.length} dari {entries.length} riwayat
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-weak-50">
              <tr className="text-left">
                <th scope="col" className="w-8 px-3 py-2" aria-label="Expand">
                  <span className="sr-only">Buka detail</span>
                </th>
                <th
                  scope="col"
                  aria-sort={ariaSortFor("fieldName")}
                  className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-text-soft-400"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("fieldName")}
                    className="inline-flex items-center gap-1 hover:text-text-strong-950 focus:outline-none focus-visible:underline"
                  >
                    Field
                    <SortGlyph active={sortKey === "fieldName"} dir={sortDir} />
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-text-soft-400"
                >
                  Sebelum
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-text-soft-400"
                >
                  Sesudah
                </th>
                <th
                  scope="col"
                  aria-sort={ariaSortFor("editorName")}
                  className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-text-soft-400"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("editorName")}
                    className="inline-flex items-center gap-1 hover:text-text-strong-950 focus:outline-none focus-visible:underline"
                  >
                    Editor
                    <SortGlyph
                      active={sortKey === "editorName"}
                      dir={sortDir}
                    />
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-text-soft-400"
                >
                  Alasan
                </th>
                <th
                  scope="col"
                  aria-sort={ariaSortFor("editedAt")}
                  className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-text-soft-400"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("editedAt")}
                    className="inline-flex items-center gap-1 hover:text-text-strong-950 focus:outline-none focus-visible:underline"
                  >
                    Edited
                    <SortGlyph active={sortKey === "editedAt"} dir={sortDir} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-10 text-center text-text-sub-600"
                  >
                    {emptyMessage ??
                      "Tidak ada riwayat yang cocok dengan filter saat ini."}
                  </td>
                </tr>
              ) : (
                pageEntries.map((entry) => {
                  const isOpen = expanded.has(entry.id)
                  const truncated =
                    entry.editReason.length > REASON_TRUNCATE
                      ? entry.editReason.slice(0, REASON_TRUNCATE).trimEnd() +
                        "..."
                      : entry.editReason
                  return (
                    <React.Fragment key={entry.id}>
                      <tr
                        onClick={() => toggleExpand(entry.id)}
                        className="border-t border-stroke-soft-200 cursor-pointer hover:bg-bg-weak-50/60 align-top"
                      >
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation()
                              toggleExpand(entry.id)
                            }}
                            aria-expanded={isOpen}
                            aria-label={
                              isOpen ? "Tutup detail" : "Buka detail"
                            }
                            className="inline-flex size-6 items-center justify-center rounded-md text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
                          >
                            {isOpen ? (
                              <RiArrowDownSLine className="size-4" />
                            ) : (
                              <RiArrowRightSLine className="size-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            appearance="lighter"
                            status="information"
                            className="font-medium"
                          >
                            {defaultLabel(entry.fieldName, fieldLabels)}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 max-w-[220px]">
                          <div className="line-clamp-2">
                            {renderValueCell(
                              entry.fieldName,
                              entry.originalValue,
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 max-w-[220px]">
                          <div className="line-clamp-2">
                            {renderValueCell(
                              entry.fieldName,
                              entry.editedValue,
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">{renderEditorCell(entry)}</td>
                        <td className="px-3 py-3 max-w-[260px]">
                          {entry.editReason.length > REASON_TRUNCATE ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm text-text-sub-600 cursor-help underline-offset-2 decoration-dotted hover:underline">
                                  {truncated}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm whitespace-pre-wrap">
                                {entry.editReason}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-sm text-text-sub-600">
                              {entry.editReason}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 text-xs text-text-sub-600 cursor-help">
                                <RiTimeLine
                                  aria-hidden
                                  className="size-3.5 text-text-soft-400"
                                />
                                <time dateTime={entry.editedAt}>
                                  {formatRelativeId(entry.editedAt)}
                                </time>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {formatAbsoluteId(entry.editedAt)}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      </tr>
                      {isOpen ? (
                        <tr className="border-t border-stroke-soft-200 bg-bg-weak-50/40">
                          <td />
                          <td
                            colSpan={6}
                            className="px-3 py-4 text-sm text-text-strong-950"
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <div className="text-[11px] uppercase tracking-wider text-text-soft-400 mb-1">
                                  Sebelum (lengkap)
                                </div>
                                <div className="rounded-md border border-stroke-soft-200 bg-bg-white-0 p-3">
                                  {renderValueCell(
                                    entry.fieldName,
                                    entry.originalValue,
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-[11px] uppercase tracking-wider text-text-soft-400 mb-1">
                                  Sesudah (lengkap)
                                </div>
                                <div className="rounded-md border border-stroke-soft-200 bg-bg-white-0 p-3">
                                  {renderValueCell(
                                    entry.fieldName,
                                    entry.editedValue,
                                  )}
                                </div>
                              </div>
                              <div className="sm:col-span-2">
                                <div className="text-[11px] uppercase tracking-wider text-text-soft-400 mb-1">
                                  Alasan edit
                                </div>
                                <p className="text-sm whitespace-pre-wrap text-text-strong-950">
                                  {entry.editReason}
                                </p>
                              </div>
                              <div className="sm:col-span-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-text-sub-600">
                                <span>
                                  <span className="text-text-soft-400">
                                    Editor ID ·{" "}
                                  </span>
                                  <span className="font-mono">
                                    {entry.editorId}
                                  </span>
                                </span>
                                <span>
                                  <span className="text-text-soft-400">
                                    Waktu ·{" "}
                                  </span>
                                  {formatAbsoluteId(entry.editedAt)}
                                </span>
                                {entry.ipHash ? (
                                  <span>
                                    <span className="text-text-soft-400">
                                      IP hash ·{" "}
                                    </span>
                                    <span className="font-mono">
                                      {entry.ipHash.slice(0, 12)}…
                                    </span>
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-stroke-soft-200">
            <span className="text-xs text-text-sub-600">
              Halaman {safePage} dari {totalPages}
            </span>
            <Pagination aria-label="Riwayat audit halaman">
              <PaginationList>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    aria-label="Halaman sebelumnya"
                  />
                </PaginationItem>
                {buildPageWindow(safePage, totalPages).map((p, idx) =>
                  p === "..." ? (
                    <PaginationItem
                      key={`gap-${idx}`}
                      className="px-2 text-text-soft-400"
                    >
                      …
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationButton
                        isActive={p === safePage}
                        onClick={() => setPage(p)}
                        aria-current={p === safePage ? "page" : undefined}
                      >
                        {p}
                      </PaginationButton>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={safePage === totalPages}
                    aria-label="Halaman berikutnya"
                  />
                </PaginationItem>
              </PaginationList>
            </Pagination>
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  )
}

// ---------------------------------------------------------------------------
// Sub-helpers
// ---------------------------------------------------------------------------

function SortGlyph({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <span aria-hidden className="text-text-soft-400 text-[10px]">
        ↕
      </span>
    )
  }
  return (
    <span aria-hidden className="text-text-strong-950 text-[10px]">
      {dir === "asc" ? "↑" : "↓"}
    </span>
  )
}

/**
 * Build the windowed page list: [1, …, prev, current, next, …, last].
 * Keeps the visible numbers under 7 for any total > 7.
 */
function buildPageWindow(
  current: number,
  total: number,
): Array<number | "..."> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const out: Array<number | "..."> = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push("...")
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push("...")
  out.push(total)
  return out
}
