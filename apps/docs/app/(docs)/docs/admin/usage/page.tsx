import { headers } from "next/headers"
import { UsageDashboard, type UsageData } from "./usage-dashboard"

/**
 * /docs/admin/usage — Adoption monitoring dashboard.
 *
 * Server component. Fetches `/api/admin/usage` at request time using
 * DASH_REGISTRY_TOKEN from server env so the token never reaches the
 * browser. Falls back to an empty payload when the endpoint can't be
 * reached or auth fails — the dashboard renders empty states rather
 * than crashing the page.
 *
 * This page itself is NOT route-gated (any docs visitor can hit
 * /docs/admin/usage). The data API is — without DASH_REGISTRY_TOKEN
 * the page will render with zero counts and a "configure token" hint.
 * Wire route-level auth via middleware.ts when there's appetite to
 * lock the URL itself.
 */

export const dynamic = "force-dynamic"

async function fetchUsage(): Promise<{ data: UsageData; error?: string }> {
  const empty: UsageData = {
    totalInstalls: 0,
    byDay: [],
    byComponent: [],
    byHashedClient: [],
    window: { from: null, to: null, source: "empty" },
  }

  const token = process.env.DASH_REGISTRY_TOKEN
  const h = await headers()
  const host = h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  const url = `${proto}://${host}/api/admin/usage`

  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    })
    if (!res.ok) {
      return { data: empty, error: `API returned ${res.status}` }
    }
    const data = (await res.json()) as UsageData
    return { data }
  } catch (e) {
    return { data: empty, error: e instanceof Error ? e.message : "fetch failed" }
  }
}

export default async function UsagePage() {
  const { data, error } = await fetchUsage()
  return <UsageDashboard data={data} error={error} />
}
