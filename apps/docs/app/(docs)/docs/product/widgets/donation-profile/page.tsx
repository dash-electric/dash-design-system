"use client"

import * as React from "react"
import {
  RiAddLine as Plus,
  RiMoneyDollarCircleLine as Dollar,
  RiCalendarLine as Cal,
  RiCheckLine as Check,
  RiUserLine as User,
  RiSpyLine as Spy,
} from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Donation Profile widget — Figma 1:1 (verified 2026-05-19).
 *
 *   3962:4437   Overview tab — avatar (w/ verified badge) + name + 2-up icon cards
 *   3962:4436   Goal tab — red heart progress + numerator/denominator + remainder line
 *   3962:4435   Statistic tab — Public/Anonymous chips + dual bell-curve + tooltip
 */

const ORANGE = "#F97316"
const BLUE = "#3F6FFF"
const RED = "#EF4444"

export default function DonationProfileWidgetPage() {
  const [tab, setTab] = React.useState<"overview" | "goal" | "statistic">("overview")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Donation Profile"
        description="Three-tab donor widget — Overview (identity + totals), Goal (heart progress toward target), Statistic (dual-line monthly chart with tooltip)."
      />

      <DocsSection title="Default">
        <DocsExample
          title="Live tab switcher"
          preview={
            <WidgetShell title="Donation Profile" donateCta className="max-w-md">
              <SegmentedControl size="sm" value={tab} onValueChange={(v: string) => setTab(v as typeof tab)} className="w-full">
                <SegmentedItem size="sm" value="overview" className="flex-1">Overview</SegmentedItem>
                <SegmentedItem size="sm" value="goal" className="flex-1">Goal</SegmentedItem>
                <SegmentedItem size="sm" value="statistic" className="flex-1">Statistic</SegmentedItem>
              </SegmentedControl>
              {tab === "overview" ? <OverviewPanel /> : tab === "goal" ? <GoalPanel /> : <StatisticPanel />}
            </WidgetShell>
          }
          code={`<WidgetShell title="Donation Profile" donateCta>
  <SegmentedControl value={tab} onValueChange={setTab}>
    <SegmentedItem value="overview">Overview</SegmentedItem>
    <SegmentedItem value="goal">Goal</SegmentedItem>
    <SegmentedItem value="statistic">Statistic</SegmentedItem>
  </SegmentedControl>
  {tab === "overview" && <OverviewPanel />}
  {tab === "goal" && <GoalPanel />}
  {tab === "statistic" && <StatisticPanel />}
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Tab variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          All three panels share the segmented header. Body content swaps with no shift in card height.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <WidgetShell title="Overview" donateCta>
            <SegmentedControl size="sm" value="overview" className="w-full">
              <SegmentedItem size="sm" value="overview" className="flex-1">Overview</SegmentedItem>
              <SegmentedItem size="sm" value="goal" className="flex-1">Goal</SegmentedItem>
              <SegmentedItem size="sm" value="statistic" className="flex-1">Statistic</SegmentedItem>
            </SegmentedControl>
            <OverviewPanel />
          </WidgetShell>
          <WidgetShell title="Goal" donateCta>
            <SegmentedControl size="sm" value="goal" className="w-full">
              <SegmentedItem size="sm" value="overview" className="flex-1">Overview</SegmentedItem>
              <SegmentedItem size="sm" value="goal" className="flex-1">Goal</SegmentedItem>
              <SegmentedItem size="sm" value="statistic" className="flex-1">Statistic</SegmentedItem>
            </SegmentedControl>
            <GoalPanel />
          </WidgetShell>
          <WidgetShell title="Statistic" donateCta>
            <SegmentedControl size="sm" value="statistic" className="w-full">
              <SegmentedItem size="sm" value="overview" className="flex-1">Overview</SegmentedItem>
              <SegmentedItem size="sm" value="goal" className="flex-1">Goal</SegmentedItem>
              <SegmentedItem size="sm" value="statistic" className="flex-1">Statistic</SegmentedItem>
            </SegmentedControl>
            <StatisticPanel />
          </WidgetShell>
        </div>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "tab", type: '"overview" | "goal" | "statistic"', defaultValue: '"overview"', description: "Active tab." },
            { name: "donor.name", type: "string", description: "Donor display name." },
            { name: "donor.avatar", type: "string", description: "Avatar image URL." },
            { name: "donor.total", type: "string", description: "Lifetime donation total ($12,000)." },
            { name: "donor.streak", type: "string", description: "Donation streak ('14-month')." },
            { name: "goal.value / goal.target", type: "number", description: "Progress numerator + denominator in cents." },
            { name: "series", type: "{label: string; data: number[]}[]", description: "Statistic chart dual-line series." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Card shell with title + Donate CTA in the header.</li>
          <li>3-segment SegmentedControl below header.</li>
          <li>Overview: centered avatar + name + caption + 2-up metric cards.</li>
          <li>Goal: large heart-shaped progress with % numeric label + caption.</li>
          <li>Statistic: dual-line SVG chart, tooltip at apex, optional range chip below.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function WidgetShell({
  title,
  donateCta,
  children,
  className,
}: {
  title: React.ReactNode
  donateCta?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-3", className)}>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {donateCta ? (
          <Button style="stroke" tone="neutral" size="xs">
            <Plus className="size-3" />
            Donate
          </Button>
        ) : (
          <LinkButton size="sm">See All</LinkButton>
        )}
      </div>
      {children}
    </div>
  )
}

function OverviewPanel() {
  return (
    <div className="text-center space-y-2">
      <div className="relative inline-block">
        <Avatar size="lg" className="mx-auto">
          <AvatarImage src="https://i.pravatar.cc/80?u=arthur" />
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
        <span className="absolute -right-0.5 -top-0.5 inline-flex size-4 items-center justify-center rounded-full bg-success-base text-white ring-2 ring-bg-white-0">
          <Check className="size-2.5" />
        </span>
      </div>
      <div>
        <div className="text-sm font-medium text-text-strong-950">Arthur Taylor</div>
        <div className="text-[11px] text-text-sub-600">48 donations in the last year</div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        <div className="rounded-lg border border-stroke-soft-200 p-2 text-center space-y-1">
          <Dollar className="size-4 mx-auto text-text-sub-600" />
          <div className="text-sm font-medium tabular-nums">$12,000.00</div>
          <div className="text-[10px] text-text-soft-400">Total Donation</div>
        </div>
        <div className="rounded-lg border border-stroke-soft-200 p-2 text-center space-y-1">
          <Cal className="size-4 mx-auto text-text-sub-600" />
          <div className="text-sm font-medium">14-month</div>
          <div className="text-[10px] text-text-soft-400">Donation Streak</div>
        </div>
      </div>
    </div>
  )
}

function GoalPanel() {
  const pct = 75
  return (
    <div className="flex flex-col items-center gap-2 py-1">
      <div className="text-center">
        <div className="text-sm font-medium text-text-strong-950">Donation Goal for 2023</div>
        <div className="text-[11px] text-text-sub-600 tabular-nums">$12,000 / $16,000</div>
      </div>
      <div className="relative size-28">
        <svg viewBox="0 0 100 90" className="w-full h-full">
          <defs>
            <clipPath id="donation-heart-clip">
              <path d="M50 85 C20 65 5 45 5 28 C5 14 16 5 28 5 C36 5 45 10 50 18 C55 10 64 5 72 5 C84 5 95 14 95 28 C95 45 80 65 50 85 Z" />
            </clipPath>
            <linearGradient id="donation-heart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="100%" stopColor={RED} />
            </linearGradient>
          </defs>
          <path
            d="M50 85 C20 65 5 45 5 28 C5 14 16 5 28 5 C36 5 45 10 50 18 C55 10 64 5 72 5 C84 5 95 14 95 28 C95 45 80 65 50 85 Z"
            fill="#FEE2E2"
          />
          <rect
            x="0"
            y={90 - (pct / 100) * 90}
            width="100"
            height="90"
            fill="url(#donation-heart-fill)"
            clipPath="url(#donation-heart-clip)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold tabular-nums text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
            {pct}%
          </span>
        </div>
      </div>
      <div className="text-center text-[11px] text-text-sub-600">
        Donate <span className="font-medium text-text-strong-950 tabular-nums">$4,000</span> to reach your target.
      </div>
    </div>
  )
}

function StatisticPanel() {
  const months = ["feB", "MAR", "APR", "MAY", "JUN", "JUL"]
  // Bell-curve-ish series for Public (orange) + Anonymous (blue)
  const pub = [10, 25, 55, 68, 50, 22]
  const anon = [22, 50, 60, 45, 30, 14]
  const w = 220
  const h = 70
  const smooth = (vals: number[]) => {
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - (v / 80) * h] as const)
    return pts
      .map((p, i, arr) => {
        if (i === 0) return `M ${p[0]} ${p[1]}`
        const prev = arr[i - 1]
        const cx = (prev[0] + p[0]) / 2
        return `Q ${prev[0]} ${prev[1]} ${cx} ${(prev[1] + p[1]) / 2} T ${p[0]} ${p[1]}`
      })
      .join(" ")
  }
  // tooltip at month index 4 (JUN), orange series
  const ttX = (4 / (pub.length - 1)) * w
  const ttY = h - (pub[4] / 80) * h
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded-lg border border-stroke-soft-200 p-2 flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#FED7AA]">
            <User className="size-3.5 text-[#C2410C]" />
          </span>
          <div>
            <div className="text-[10px] text-text-soft-400">Public</div>
            <div className="text-sm font-medium tabular-nums">$8,000</div>
          </div>
        </div>
        <div className="rounded-lg border border-stroke-soft-200 p-2 flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#DBEAFE]">
            <Spy className="size-3.5 text-[#1D4ED8]" />
          </span>
          <div>
            <div className="text-[10px] text-text-soft-400">Anonymous</div>
            <div className="text-sm font-medium tabular-nums">$4,000</div>
          </div>
        </div>
      </div>
      <div className="relative rounded-md border border-stroke-soft-200 p-1">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
          {/* grid */}
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1={0} y1={h * g} x2={w} y2={h * g} stroke="#F3F4F6" strokeWidth="0.5" />
          ))}
          <path d={smooth(anon)} fill="none" stroke={BLUE} strokeWidth="2" />
          <path d={smooth(pub)} fill="none" stroke={ORANGE} strokeWidth="2" />
          <circle cx={ttX} cy={ttY} r="3" fill={ORANGE} stroke="#fff" strokeWidth="1.5" />
        </svg>
        <div
          className="absolute rounded-md bg-bg-strong-950 text-white text-[10px] px-2 py-1 leading-tight"
          style={{ left: `${(ttX / w) * 100 - 18}%`, top: `${(ttY / h) * 100 - 25}%` }}
        >
          <span className="font-medium tabular-nums">$1,000.00</span>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-1 text-[9px] text-text-soft-400">
        {months.map((m) => (
          <span key={m} className="text-center uppercase tracking-wide">{m}</span>
        ))}
      </div>
      <div className="rounded-md border border-stroke-soft-200 px-2 py-1.5 text-[11px] text-text-sub-600">
        You have donated <span className="font-medium text-text-strong-950 tabular-nums">$12,000</span> in total.
      </div>
    </div>
  )
}
