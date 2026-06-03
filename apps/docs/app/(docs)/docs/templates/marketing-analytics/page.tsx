"use client"

import * as React from "react"
import {
  RiCalendarLine,
  RiArrowDownSLine,
  RiArrowRightUpLine,
  RiArchiveLine,
  RiPriceTag3Line,
  RiTruckLine,
  RiErrorWarningLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import {
  Sidebar,
  PageHeader,
  WidgetShell,
  SparkArea,
  SparkBars,
  ActivityRow,
  FakeButton,
} from "../marketing-dashboard/page"

/**
 * Marketing Analytics. Ported from AlignUI Marketing template
 * (`app/(main)/analytics/page.tsx` + summary.tsx + total-sales.tsx +
 * total-sales-chart.tsx + total-sales-data.ts). Header + summary + Total
 * Sales chart + categories/segments/channels mini-grid + Recent Activities
 * right rail.
 */
export default function MarketingAnalyticsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing"
        title="Marketing analytics"
        description="Catalyst Analytics deep-dive — summary KPIs, Total Sales area chart with daily/weekly/monthly toggle, product categories + customer segments + marketing channels block, and Recent Activities feed."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Analytics page"
          description="Sidebar + header with date-range chip + summary (Current Sales 3,484 / Daily Average 486 / Conversion Rate 3.8%) + Total Sales 8,944 +2.1% with weekly area chart + 3-up mini grid + right-rail Recent Activities."
          preview={
            <DocsTemplatePreview padding="">
              <AnalyticsPreview />
            </DocsTemplatePreview>
          }
          code={`<MarketingAnalytics userName="James Brown" />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><b>Header</b> — Avatar + greeting + Last 7 days dropdown + Feb 04 - Feb 11, 2024 date chip (ButtonGroup pair).</li>
          <li><b>Summary</b> — 3-col KPI row separated by 1px dividers: Current Sales 3,484 (+7.1%), Daily Average 486 (+2%), Conversion Rate 3.8% (-0.5%).</li>
          <li><b>Total Sales</b> — 8,944 + Badge +2.1% + period Select (Daily/Weekly/Monthly) + All Products dropdown, weekly area chart.</li>
          <li><b>Mid block</b> — left column: ProductCategories + CustomerSegments stack; right column: MarketingChannels.</li>
          <li><b>Right rail</b> — Recent Activities feed (328px).</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Avatar / AvatarImage / AvatarFallback.</li>
          <li>ButtonGroup — date range pair (Last 7 days · Feb 04 - Feb 11, 2024).</li>
          <li>Badge — +2.1% green lighter.</li>
          <li>Select — Daily / Weekly / Monthly.</li>
          <li>Recharts AreaChart — Total Sales weekly trend.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "userName", type: "string", description: "Avatar fallback + greeting subject." },
            { name: "dateRange", type: "'7d' | '30d' | 'custom'", description: "Header date selector." },
            { name: "period", type: "'daily' | 'weekly' | 'monthly'", description: "Total Sales chart period. Default 'weekly'." },
            { name: "activities", type: "ActivityItem[]", description: "{ icon: 'inventory' | 'price' | 'shipping' | 'alert', title, subtitle, timestamp }." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

function AnalyticsPreview() {
  return (
    <div className="flex min-h-[1000px] bg-bg-weak-50">
      <Sidebar activeHref="/analytics" />
      <div className="flex-1 self-stretch bg-bg-white-0">
        <PageHeader
          icon={<span className="inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-bg-weak-50 text-sm font-semibold text-text-strong-950">JB</span>}
          title="James Brown"
          description="Welcome back to Catalyst 👋🏻"
          actions={
            <div className="inline-flex h-9 items-stretch overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
              <button type="button" className="inline-flex items-center gap-1 px-3 text-sm text-text-sub-600">
                Last 7 days
                <RiArrowDownSLine className="size-4 text-text-soft-400" />
              </button>
              <span className="w-px self-stretch bg-stroke-soft-200" />
              <button type="button" className="inline-flex items-center gap-1.5 px-3 text-sm text-text-sub-600">
                <RiCalendarLine className="size-4 text-text-soft-400" />
                Feb 04 - Feb 11, 2024
              </button>
            </div>
          }
        />

        <div className="px-8">
          <div className="h-px bg-stroke-soft-200" />
        </div>

        <div className="flex flex-1 gap-6 px-8 py-6">
          <div className="min-w-0 flex-1 space-y-6">
            {/* Summary */}
            <div className="flex divide-x divide-stroke-soft-200">
              {[
                { label: "Current Sales", value: "3,484", delta: "+7.1%", up: true, suffix: "vs prev" },
                { label: "Daily Average", value: "486", delta: "+2%", up: true, suffix: "vs last week" },
                { label: "Conversion Rate", value: "3.8%", delta: "-0.5%", up: false, suffix: "vs last week" },
              ].map((s, i) => (
                <div key={s.label} className={"flex-1 " + (i === 0 ? "pr-8" : i === 2 ? "pl-8" : "px-8")}>
                  <div className="text-xs text-text-sub-600">{s.label}</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <div className="text-xl font-semibold tracking-tight text-text-strong-950">{s.value}</div>
                    <div className="text-[11px] text-text-sub-600">
                      <span className={s.up ? "text-success-base" : "text-error-base"}>{s.delta}</span> {s.suffix}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DashedDivider />

            {/* Total Sales */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-text-sub-600">Total Sales</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="text-xl font-semibold tracking-tight text-text-strong-950">8,944</div>
                    <span className="rounded-full bg-(--state-success-lighter) px-1.5 py-0.5 text-[11px] font-medium text-(--state-success-base)">+2.1%</span>
                    <span className="text-[11px] text-text-sub-600">vs last week</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <FakeButton>Weekly <RiArrowDownSLine className="size-4" /></FakeButton>
                  <FakeButton>All Products <RiArrowDownSLine className="size-4" /></FakeButton>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6">
                <TotalSalesAreaChart />
              </div>
            </div>

            <DashedDivider />

            {/* Mid grid */}
            <div className="grid grid-cols-[324px_1fr] gap-8">
              <div className="space-y-6">
                <WidgetShell title="Product Categories" headerExtra={<span className="text-xs text-text-soft-400">See all</span>}>
                  <CategoryStack label="Technology" pct={48} count="$24,512" />
                  <CategoryStack label="Fashion" pct={24} count="$12,148" />
                  <CategoryStack label="Home" pct={16} count="$8,210" />
                  <CategoryStack label="Other" pct={12} count="$6,012" />
                </WidgetShell>
                <DashedDivider />
                <WidgetShell title="Customer Segments" headerExtra={<span className="text-xs text-text-soft-400">7d</span>}>
                  <SegmentBar label="New" pct={32} delta="+12%" />
                  <SegmentBar label="Returning" pct={48} delta="+4%" />
                  <SegmentBar label="VIP" pct={20} delta="-2%" down />
                </WidgetShell>
              </div>

              <WidgetShell title="Marketing Channels" headerExtra={<FakeButton>Compare <RiArrowDownSLine className="size-4" /></FakeButton>}>
                <ChannelLargeRow brand="Google Ads" spend="$12,840" roas="3.2x" share={68} />
                <ChannelLargeRow brand="Meta" spend="$8,213" roas="2.1x" share={48} />
                <ChannelLargeRow brand="TikTok" spend="$4,532" roas="1.6x" share={28} />
                <ChannelLargeRow brand="Email" spend="$2,108" roas="4.4x" share={14} />
              </WidgetShell>
            </div>
          </div>

          <div className="w-px bg-stroke-soft-200" />

          {/* Right rail */}
          <div className="w-[328px] shrink-0">
            <WidgetShell title="Recent Activities" headerExtra={<span className="text-xs text-text-soft-400">See all</span>}>
              <ActRow icon={<RiArchiveLine className="size-4 text-text-sub-600" />} title="Inventory updated" subtitle="AirPods Max Green +24 units" timestamp="2m" />
              <ActRow icon={<RiPriceTag3Line className="size-4 text-text-sub-600" />} title="Price changed" subtitle="iMac M1 24-inch Purple → $1,299" timestamp="14m" />
              <ActRow icon={<RiTruckLine className="size-4 text-text-sub-600" />} title="Shipment dispatched" subtitle="3 packages → DHL Express" timestamp="1h" />
              <ActRow icon={<RiErrorWarningLine className="size-4 text-warning-base" />} title="Low stock alert" subtitle="Apple Studio Display — 4 left" timestamp="3h" />
              <ActRow icon={<RiArchiveLine className="size-4 text-text-sub-600" />} title="New product added" subtitle="iPad Pro 12.9-inch with M2 chip" timestamp="6h" />
              <ActRow icon={<RiPriceTag3Line className="size-4 text-text-sub-600" />} title="Discount campaign live" subtitle="Spring Sale — 15% off select items" timestamp="1d" />
            </WidgetShell>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashedDivider() {
  return (
    <svg width="100%" height="1" aria-hidden>
      <line x1="0" y1="0.5" x2="100%" y2="0.5" strokeDasharray="4 4" stroke="var(--stroke-soft-200)" />
    </svg>
  )
}

function CategoryStack({ label, pct, count }: { label: string; pct: number; count: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-text-sub-600">{label}</span>
        <span className="tabular-nums text-text-strong-950">{count} <span className="text-text-soft-400">({pct}%)</span></span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-weak-50">
        <div className="h-full bg-(--state-feature-base)" style={{ width: pct + "%" }} />
      </div>
    </div>
  )
}

function SegmentBar({ label, pct, delta, down }: { label: string; pct: number; delta: string; down?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-text-sub-600">{label}</span>
        <span className="tabular-nums">
          <span className="text-text-strong-950">{pct}%</span>{" "}
          <span className={down ? "text-error-base" : "text-success-base"}>{delta}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-weak-50">
        <div className="h-full bg-(--state-success-base)" style={{ width: pct + "%" }} />
      </div>
    </div>
  )
}

function ChannelLargeRow({ brand, spend, roas, share }: { brand: string; spend: string; roas: string; share: number }) {
  return (
    <div className="space-y-1.5 border-b border-stroke-soft-200 pb-3 last:border-0 last:pb-0">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium text-text-strong-950">{brand}</div>
        <div className="text-xs tabular-nums text-text-sub-600">
          <span className="text-text-strong-950 font-medium">{spend}</span> · ROAS {roas}
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-weak-50">
        <div className="h-full bg-primary" style={{ width: share + "%" }} />
      </div>
    </div>
  )
}

function ActRow({ icon, title, subtitle, timestamp }: { icon: React.ReactNode; title: string; subtitle: string; timestamp: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-stroke-soft-200 pb-3 last:border-0 last:pb-0">
      <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50">{icon}</div>
      <div className="flex-1 space-y-0.5">
        <div className="text-xs font-medium text-text-strong-950">{title}</div>
        <div className="text-[11px] text-text-sub-600">{subtitle}</div>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-text-soft-400">{timestamp}</div>
    </div>
  )
}

/* Approximated 12-week weekly Total Sales area chart. Values lifted from
 * total-sales-data.ts (weeklySalesData range 8,000–12,000). */
function TotalSalesAreaChart() {
  const data = [9200, 8800, 10500, 9800, 11200, 10100, 9600, 10800, 11500, 10300, 9900, 10700, 11900, 10200, 8944]
  const max = Math.max(...data)
  const min = Math.min(...data) * 0.9
  const W = 800
  const H = 220
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / (max - min)) * (H - 20) - 10
    return [x, y]
  })
  const pathD = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ")
  const areaD = pathD + ` L ${W} ${H} L 0 ${H} Z`

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-full" aria-hidden>
        <defs>
          <linearGradient id="ts-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-base)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary-base)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1="0" y1={H * p} x2={W} y2={H * p} stroke="var(--stroke-soft-200)" strokeDasharray="4 4" />
        ))}
        <path d={areaD} fill="url(#ts-area)" />
        <path d={pathD} fill="none" stroke="var(--primary-base)" strokeWidth="2" />
        {points.map(([x, y], i) =>
          i === points.length - 1 ? (
            <circle key={i} cx={x} cy={y} r={4} fill="var(--primary-base)" stroke="white" strokeWidth="2" />
          ) : null,
        )}
      </svg>
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-text-soft-400">
        {["W40", "W41", "W42", "W43", "W44", "W45", "W46", "W47"].map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
    </div>
  )
}
