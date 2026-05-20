import { headers } from "next/headers"
import { PilotDashboard, type PilotData } from "./pilot-dashboard"

/**
 * /docs/admin/pilot — Wave 5 pilot dashboard.
 *
 * Server component. Fetches `/api/admin/pilot` at request time using
 * DASH_REGISTRY_TOKEN from server env so the token never reaches the
 * browser. Mirrors the /docs/admin/usage pattern.
 *
 * Bearer auth on the API only — the URL itself is not route-gated.
 * Without a configured token the dashboard renders an empty cohort
 * state and a configure-token hint rather than crashing.
 */

export const dynamic = "force-dynamic"

const EMPTY: PilotData = {
  pilot: { name: "wave-5", day: 0, status: "active", startedAt: null },
  cohort: [
    { pe: "[PE-A]", components: 0, gaps: 0, daysActive: 0, onboardingStep: 0, status: "not-started" },
    { pe: "[PE-B]", components: 0, gaps: 0, daysActive: 0, onboardingStep: 0, status: "not-started" },
    { pe: "[PE-C]", components: 0, gaps: 0, daysActive: 0, onboardingStep: 0, status: "not-started" },
  ],
  thresholds: {
    t11: { target: 3, actual: 0, label: "PE onboarded" },
    t12: { target: 30, actual: 0, label: "% PE with ≥3 components (PR proxy)" },
    t13: { target: 20, actual: 0, label: "% drift reduction (placeholder)" },
  },
  feedback: [],
}

async function fetchPilot(): Promise<{ data: PilotData; error?: string }> {
  const token = process.env.DASH_REGISTRY_TOKEN
  const h = await headers()
  const host = h.get("host") ?? "localhost:3000"
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  const url = `${proto}://${host}/api/admin/pilot`

  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    })
    if (!res.ok) return { data: EMPTY, error: `API returned ${res.status}` }
    const data = (await res.json()) as PilotData
    return { data }
  } catch (e) {
    return { data: EMPTY, error: e instanceof Error ? e.message : "fetch failed" }
  }
}

export default async function PilotPage() {
  const { data, error } = await fetchPilot()
  return <PilotDashboard data={data} error={error} />
}
