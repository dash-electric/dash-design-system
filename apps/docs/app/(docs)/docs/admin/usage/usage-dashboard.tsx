"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"

export type UsageData = {
  totalInstalls: number
  byDay: Array<{ date: string; count: number }>
  byComponent: Array<{ name: string; count: number }>
  byHashedClient: Array<{ hashId: string; count: number }>
  window: { from: string | null; to: string | null; source: "file" | "empty" }
}

type SortKey = "name" | "count"

function filterLastNDays<T extends { date: string }>(rows: T[], days: number): T[] {
  if (rows.length === 0) return rows
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const iso = cutoff.toISOString().slice(0, 10)
  return rows.filter((r) => r.date >= iso)
}

export function UsageDashboard({
  data,
  error,
}: {
  data: UsageData
  error?: string
}) {
  const [windowDays, setWindowDays] = React.useState<7 | 30>(7)
  const [sortBy, setSortBy] = React.useState<SortKey>("count")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")

  // Top-installed slice respects the day window — re-tally from byDay is
  // not possible (we don't have per-day-per-component breakdown), so
  // we surface the all-time top list and label the window explicitly.
  const topComponents = React.useMemo(() => {
    const sorted = [...data.byComponent].sort((a, b) => {
      const cmp = sortBy === "name" ? a.name.localeCompare(b.name) : a.count - b.count
      return sortDir === "asc" ? cmp : -cmp
    })
    return sorted.slice(0, 25)
  }, [data.byComponent, sortBy, sortDir])

  const filteredByDay = React.useMemo(
    () => filterLastNDays(data.byDay, windowDays),
    [data.byDay, windowDays],
  )

  const toggleSort = (key: SortKey) => {
    if (key === sortBy) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortDir("desc")
    }
  }

  return (
    <DocsPageShell>
      <DocsHeader
        category="Admin / Adoption"
        title="Usage Dashboard"
        description="Per-PE Claude Max usage, registry install events, and top installed components. Aggregated from Bearer-gated /api/admin/usage. Anonymous — no PII, no emails, hashed clients only."
        status="wip"
      />

      {error ? (
        <div className="rounded-xl border border-warning-light bg-warning-lighter/50 px-4 py-3 text-sm text-warning-dark">
          <strong>Telemetry source unavailable:</strong> {error}. Showing
          empty state. Configure <code className="text-xs">DASH_REGISTRY_TOKEN</code>{" "}
          + a log drain to populate.
        </div>
      ) : null}

      <DocsSection
        title="Per-PE Claude Max usage"
        description="Aggregate Bearer client install volume. One hashed client ≈ one consumer repo (the @dash registry has no per-user identity)."
      >
        <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-weak-50">
              <tr className="text-left">
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  Hashed client
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  Installs
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {data.byHashedClient.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-text-sub-600">
                    No install events recorded yet.
                  </td>
                </tr>
              ) : (
                data.byHashedClient.slice(0, 20).map((row) => {
                  const share = data.totalInstalls
                    ? Math.round((row.count / data.totalInstalls) * 1000) / 10
                    : 0
                  return (
                    <tr key={row.hashId} className="border-t border-stroke-soft-200/60">
                      <td className="px-3 py-2.5 font-mono text-xs text-text-strong-950">
                        {row.hashId}
                      </td>
                      <td className="px-3 py-2.5 text-text-strong-950">{row.count}</td>
                      <td className="px-3 py-2.5 text-text-sub-600">{share}%</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-soft-400">
          Total installs: <strong className="text-text-strong-950">{data.totalInstalls}</strong>
          {data.window.from
            ? ` · Window ${data.window.from.slice(0, 10)} → ${data.window.to?.slice(0, 10) ?? "now"}`
            : ""}
          {" · "}
          Source: <code className="text-[11px]">{data.window.source}</code>
        </p>
      </DocsSection>

      <DocsSection
        title="Registry install events"
        description="Daily install volume from the @dash registry. Filter by 7 / 30 days."
      >
        <div className="flex items-center gap-2">
          {[7, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setWindowDays(d as 7 | 30)}
              className={
                windowDays === d
                  ? "rounded-md border border-stroke-strong-950 bg-bg-strong-950 px-3 py-1.5 text-xs font-medium text-text-white-0"
                  : "rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-xs font-medium text-text-sub-600 hover:bg-bg-weak-50"
              }
            >
              Last {d} days
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
          {filteredByDay.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-text-sub-600">
              No install events in the selected window.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke-soft-200, #e5e7eb)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid var(--stroke-soft-200, #e5e7eb)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--dash-purple-500, #7c3aed)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </DocsSection>

      <DocsSection
        title="Top components installed"
        description="Ranked by install count. Window filter labels the period; the table itself shows the all-time top 25."
      >
        <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-weak-50">
              <tr className="text-left">
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="hover:text-text-strong-950"
                  >
                    Component {sortBy === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
                  <button
                    type="button"
                    onClick={() => toggleSort("count")}
                    className="hover:text-text-strong-950"
                  >
                    Installs {sortBy === "count" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {topComponents.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-3 py-6 text-center text-text-sub-600">
                    No component installs recorded.
                  </td>
                </tr>
              ) : (
                topComponents.map((row) => (
                  <tr key={row.name} className="border-t border-stroke-soft-200/60">
                    <td className="px-3 py-2.5 font-mono text-xs text-text-strong-950">
                      {row.name}
                    </td>
                    <td className="px-3 py-2.5 text-text-strong-950">{row.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DocsSection>
    </DocsPageShell>
  )
}
