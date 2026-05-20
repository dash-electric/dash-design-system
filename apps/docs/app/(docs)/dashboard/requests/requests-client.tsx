"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/dash/ui/select"
import type { GapEntry } from "@/lib/dashboard-data"
import { RequestTable } from "./request-row"
import { ageBucket, type AgeBucket } from "./shared"

type Props = {
  entries: GapEntry[]
  apiBaseUrl: string | null
}

type SeverityFilter = "all" | "high" | "medium" | "low"
type StatusFilter = "all" | "pending" | "synced" | "vendored" | "declined"
type AgeFilter = "all" | AgeBucket
type FrequencyFilter = "all" | "unique" | "repeat"

/**
 * Top-level client view for /dashboard/requests.
 *
 * Owns four pieces of state:
 *   1. Filter dropdowns (severity / repo / age / status / frequency).
 *   2. Multi-select set for the merge action (bubbled from table).
 *   3. Derived metrics (pending count, weekly vendored, decline rate).
 *   4. The repo facet — derived from the entries themselves so the
 *      filter list scales with the queue and doesn't need maintenance.
 *
 * Frequency filter buckets duplicates by normalized description: any
 * description shared by ≥2 entries is a "repeat". This is the
 * pre-merge signal the CEO uses to decide whether to consolidate
 * requests before vendoring.
 */
export function RequestsClient({ entries, apiBaseUrl }: Props) {
  const [severity, setSeverity] = React.useState<SeverityFilter>("all")
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [age, setAge] = React.useState<AgeFilter>("all")
  const [repo, setRepo] = React.useState<string>("all")
  const [frequency, setFrequency] = React.useState<FrequencyFilter>("all")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  // Repo facet — distinct repo names sorted alphabetically; null/missing
  // collapsed into a single "(no repo)" sentinel value.
  const repoFacet = React.useMemo(() => {
    const set = new Set<string>()
    for (const e of entries) set.add(e.repo ?? "__none__")
    return Array.from(set).sort((a, b) => {
      if (a === "__none__") return 1
      if (b === "__none__") return -1
      return a.localeCompare(b)
    })
  }, [entries])

  // Description duplicate index: normalized desc → count.
  const dupIndex = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of entries) {
      const key = e.description.trim().toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [entries])

  const filtered = React.useMemo(() => {
    return entries.filter((e) => {
      if (severity !== "all" && e.severity !== severity) return false
      if (status !== "all" && e.status !== status) return false
      if (repo !== "all") {
        const value = e.repo ?? "__none__"
        if (value !== repo) return false
      }
      if (age !== "all") {
        const bucket = ageBucket(e.created_at)
        if (bucket !== age) return false
      }
      if (frequency !== "all") {
        const key = e.description.trim().toLowerCase()
        const isRepeat = (dupIndex.get(key) ?? 0) >= 2
        if (frequency === "unique" && isRepeat) return false
        if (frequency === "repeat" && !isRepeat) return false
      }
      return true
    })
  }, [entries, severity, status, age, repo, frequency, dupIndex])

  // Metrics use the unfiltered list — the header should always show the
  // backlog state, not the filtered slice (which would be confusing).
  const metrics = React.useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    let pending = 0
    let vendoredWeek = 0
    let resolved = 0
    let declined = 0
    for (const e of entries) {
      if (e.status === "pending") pending++
      if (e.status === "vendored") {
        resolved++
        const t = Date.parse(e.created_at)
        if (!Number.isNaN(t) && t >= oneWeekAgo) vendoredWeek++
      }
      if (e.status === "declined") {
        resolved++
        declined++
      }
    }
    const declineRate =
      resolved === 0 ? 0 : Math.round((declined / resolved) * 100)
    return { pending, vendoredWeek, declineRate, resolved }
  }, [entries])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          label="Pending"
          value={metrics.pending}
          hint="awaiting CEO review"
        />
        <MetricCard
          label="Vendored this week"
          value={metrics.vendoredWeek}
          hint="last 7 days"
        />
        <MetricCard
          label="Decline rate"
          value={`${metrics.declineRate}%`}
          hint={`${metrics.resolved} resolved total`}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3">
        <FilterField label="Severity">
          <Select value={severity} onValueChange={(v) => setSeverity(v as SeverityFilter)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Status">
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="synced">Synced</SelectItem>
              <SelectItem value="vendored">Vendored</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Age">
          <Select value={age} onValueChange={(v) => setAge(v as AgeFilter)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="older">8–30 days</SelectItem>
              <SelectItem value="stale">30 days+</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Repo">
          <Select value={repo} onValueChange={setRepo}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All repos</SelectItem>
              {repoFacet.map((r) => (
                <SelectItem key={r} value={r}>
                  {r === "__none__" ? "(no repo)" : r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Frequency">
          <Select
            value={frequency}
            onValueChange={(v) => setFrequency(v as FrequencyFilter)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="repeat">Repeats only</SelectItem>
              <SelectItem value="unique">Unique only</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </div>

      <RequestTable
        entries={filtered}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onClearSelection={() => setSelectedIds([])}
        apiBaseUrl={apiBaseUrl}
      />
    </div>
  )
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: React.ReactNode
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
        {label}
      </div>
      <div className="mt-1 text-3xl font-semibold tracking-tight text-text-strong-950">
        {value}
      </div>
      {hint ? (
        <div className="text-xs text-text-soft-400">{hint}</div>
      ) : null}
    </div>
  )
}

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
        {label}
      </span>
      {children}
    </label>
  )
}
