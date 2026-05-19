"use client"

import * as React from "react"
import {
  RiLayoutGridLine,
  RiBarChartBoxLine,
  RiShoppingBag2Line,
  RiHistoryLine,
  RiPriceTag3Line,
  RiApps2Line,
  RiHeadphoneLine,
  RiSettings2Line,
  RiArrowRightSLine,
  RiSearch2Line,
  RiNotification3Line,
  RiCalendarLine,
  RiFilter3Line,
  RiAddLine,
  RiExpandUpDownLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiStore2Line,
  RiFacebookCircleLine,
  RiInstagramLine,
  RiMore2Line,
  RiArrowRightUpLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"

/**
 * Marketing Dashboard. Ported from AlignUI Marketing Template
 * (`app/(main)/(home)/page.tsx`). 19-widget grid: TotalSales / TotalVisitors /
 * ConversionRate / VisitorChannels / UserRetention / WeeklyVisitors /
 * Geography / MarketingChannels / RealTime / ShippingTracking /
 * SalesChannels / CampaignData / ProductPerformance / MyProducts /
 * SupportAnalytics / ProductCategories / CustomerSegments / RecentActivities.
 */
export default function MarketingDashboardDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing"
        title="Marketing dashboard"
        description="Full Catalyst overview page with sidebar + header + 19-widget grid. Ported from the AlignUI Marketing template (app/(main)/(home)/page.tsx)."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Overview page — 1360px content max-width"
          description="Sidebar (272px) + main column (max-w-1360) with sticky header, KPI row, mid-band, and 5-column block. Widgets render as `WidgetShell` placeholders with the actual headline data (numbers, deltas, channel names) from the source."
          preview={
            <DocsTemplatePreview padding="">
              <DashboardPreview />
            </DocsTemplatePreview>
          }
          code={`<MarketingDashboard userName="James Brown" />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><b>Sidebar</b> — CompanySwitch (Catalyst) + Main nav (Overview / Analytics / Products / Orders / Discounts / Apps) + Others (Settings / Support) + UserButton (James Brown).</li>
          <li><b>Header</b> — Avatar 48 + “James Brown” + “Welcome back to Catalyst 👋🏻” + Search + Notification + Date select + Filter + New Product CTA.</li>
          <li><b>KPI row</b> — WidgetTotalSales / WidgetTotalVisitors / WidgetConversionRate (3 cards, 344px each).</li>
          <li><b>Mid band</b> — VisitorChannels / UserRetention / WeeklyVisitors / Geography / MarketingChannels / RealTime (6 cards).</li>
          <li><b>5-col composite</b> — ShippingTracking · SalesChannels+CampaignData stack · ProductPerformance · MyProducts · SupportAnalytics (row-span-2).</li>
          <li><b>Bottom row</b> — ProductCategories+CustomerSegments stack · RecentActivities.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Avatar / AvatarImage / AvatarFallback — header user + sidebar UserButton.</li>
          <li>Button (size, style, tone) — Filter, Report, New Product CTA.</li>
          <li>Badge / StatusBadge — KPI deltas (+2%, -1.4%).</li>
          <li>InputRoot / Input / InputIcon — header Search.</li>
          <li>Select Trigger/Value/Content/Item — date range filter.</li>
          <li>SegmentedControl — 1D/1W/1M/3M/1Y inside WidgetTotalSales.</li>
          <li>Tabs (Line variant) — VisitorChannels Direct/Referral/Social.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "userName", type: "string", description: "Avatar fallback + greeting subject. Default 'James Brown'." },
            { name: "greeting", type: "string", description: "Headline copy. Default 'Welcome back to Catalyst 👋🏻'." },
            { name: "company", type: "'apex' | 'synergy' | 'catalyst'", description: "Sidebar company switcher initial value. Default 'catalyst'." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  PREVIEW — assembles sidebar + header + 19-widget grid                    */
/* ────────────────────────────────────────────────────────────────────────── */

function DashboardPreview() {
  return (
    <div className="flex min-h-[1100px] bg-bg-weak-50">
      <Sidebar activeHref="/" />
      <div className="flex-1 self-stretch bg-bg-white-0">
        <PageHeader
          icon={
            <span className="inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-bg-weak-50 text-sm font-semibold text-text-strong-950">
              JB
            </span>
          }
          title="James Brown"
          description="Welcome back to Catalyst 👋🏻"
          actions={
            <>
              <FakeSelect icon={<RiCalendarLine className="size-4" />} label="Last month" />
              <FakeButton><RiFilter3Line className="size-4" /> Filter by</FakeButton>
              <FakeButton tone="primary"><RiAddLine className="size-4" /> New Product</FakeButton>
            </>
          }
        />

        <div className="flex flex-col gap-6 px-8 pb-6 lg:pt-1">
          <div className="grid grid-cols-3 gap-6 items-start">
            <WidgetTotalSalesPreview />
            <WidgetTotalVisitorsPreview />
            <WidgetConversionRatePreview />

            <WidgetShell title="Visitor Channels">
              <ChannelRow icon={<span className="size-2 rounded-full bg-(--state-information-base)" />} label="Direct" value="3,251" delta="+12%" up />
              <ChannelRow icon={<span className="size-2 rounded-full bg-(--state-feature-base)" />} label="Referral" value="1,832" delta="+6%" up />
              <ChannelRow icon={<span className="size-2 rounded-full bg-(--state-success-base)" />} label="Social Media" value="942" delta="-3%" />
            </WidgetShell>

            <WidgetShell title="User Retention">
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-semibold tracking-tight text-text-strong-950">68%</div>
                <span className="text-xs text-success-base">+5.2%</span>
              </div>
              <SparkBars values={[40, 55, 62, 48, 70, 65, 80, 72, 68, 75]} />
              <div className="text-[10px] text-text-soft-400">10-week rolling</div>
            </WidgetShell>

            <WidgetShell title="Weekly Visitors">
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-semibold tracking-tight text-text-strong-950">16,008</div>
                <span className="text-xs text-text-sub-600">+8.4% vs last week</span>
              </div>
              <SparkArea />
            </WidgetShell>

            <WidgetShell title="Geography" headerExtra={<span className="text-xs text-text-soft-400">Last 7d</span>}>
              <RegionRow flag="US" label="United States" share={42} count="9,832" />
              <RegionRow flag="DE" label="Germany" share={18} count="4,210" />
              <RegionRow flag="GB" label="United Kingdom" share={14} count="3,245" />
              <RegionRow flag="JP" label="Japan" share={9} count="2,090" />
            </WidgetShell>

            <WidgetShell title="Marketing Channels" headerExtra={<span className="text-xs text-text-soft-400">See all</span>}>
              <ChannelBar label="Google Ads" value="$12,840" share={68} />
              <ChannelBar label="Meta" value="$8,213" share={48} />
              <ChannelBar label="TikTok" value="$4,532" share={28} />
              <ChannelBar label="Email" value="$2,108" share={14} />
            </WidgetShell>

            <WidgetShell title="Real Time" headerExtra={<span className="inline-flex items-center gap-1 text-xs text-success-base"><span className="size-1.5 rounded-full bg-success-base" />Live</span>}>
              <div className="text-2xl font-semibold tracking-tight text-text-strong-950">32.6M</div>
              <div className="text-[11px] text-text-sub-600">Active visitors right now</div>
              <div className="mt-2 grid grid-cols-3 gap-3 text-[11px]">
                <div className="text-text-soft-400">North America<br /><span className="text-text-strong-950 font-medium">6.6M</span></div>
                <div className="text-text-soft-400">Europe<br /><span className="text-text-strong-950 font-medium">12.1M</span></div>
                <div className="text-text-soft-400">Asia<br /><span className="text-text-strong-950 font-medium">13.9M</span></div>
              </div>
            </WidgetShell>

            <div className="col-span-3 grid grid-cols-[2fr_1fr_1fr_1fr_1.25fr] gap-6 items-start">
              <WidgetShell title="Shipping Tracking" headerExtra={<span className="text-xs text-text-soft-400">14 active</span>}>
                <ShipRow id="#TRK-9821" name="Apple Watch S5" status="In transit" location="Berlin → Hamburg" />
                <ShipRow id="#TRK-9742" name="iMac M1 Purple" status="Out for delivery" location="Munich" />
                <ShipRow id="#TRK-9683" name="AirPods Max" status="Delivered" location="Vienna" />
              </WidgetShell>

              <div className="flex flex-col gap-6">
                <WidgetShell title="Sales Channels">
                  <SmallRow icon={<RiStore2Line className="size-4 text-text-soft-400" />} label="Online" value="$52.12" delta="+4.5%" up />
                  <SmallRow icon={<RiFacebookCircleLine className="size-4 text-text-soft-400" />} label="Facebook" value="$38.45" delta="-2.8%" />
                  <SmallRow icon={<RiInstagramLine className="size-4 text-text-soft-400" />} label="Instagram" value="$37.75" delta="+3.2%" up />
                </WidgetShell>
                <WidgetShell title="Campaign Data">
                  <div className="text-2xl font-semibold tracking-tight text-text-strong-950">$24,392</div>
                  <div className="text-[11px] text-text-sub-600">12 active campaigns</div>
                  <SparkBars values={[20, 35, 28, 45, 38, 52, 48]} />
                </WidgetShell>
              </div>

              <WidgetShell title="Product Performance">
                <ProductRow name="Apple Watch S5" units="248" />
                <ProductRow name="MacBook Pro M1" units="142" />
                <ProductRow name="iMac M1 Purple" units="98" />
                <ProductRow name="AirPods Max" units="74" />
              </WidgetShell>

              <WidgetShell title="My Products" headerExtra={<span className="text-xs text-text-soft-400">12</span>}>
                <ProductCardMini name="Apple Watch S5" cat="Technology" />
                <ProductCardMini name="iMac M1 Purple" cat="Technology" />
              </WidgetShell>

              <WidgetShell title="Support Analytics" headerExtra={<span className="text-xs text-text-soft-400">7d</span>}>
                <div className="text-2xl font-semibold tracking-tight text-text-strong-950">142</div>
                <div className="text-[11px] text-text-sub-600">Open tickets · avg 2h 14m</div>
                <SparkBars values={[12, 18, 14, 22, 20, 16, 24, 19, 21]} />
                <div className="mt-2 space-y-1.5 text-[11px]">
                  <div className="flex justify-between"><span className="text-text-soft-400">Resolved</span><span className="text-success-base font-medium">+24%</span></div>
                  <div className="flex justify-between"><span className="text-text-soft-400">Escalated</span><span className="text-error-base font-medium">+8%</span></div>
                  <div className="flex justify-between"><span className="text-text-soft-400">Avg first reply</span><span className="text-text-strong-950 font-medium">4m</span></div>
                </div>
              </WidgetShell>
            </div>

            <div className="flex flex-col gap-6">
              <WidgetShell title="Product Categories">
                <CategoryRow label="Technology" share={48} />
                <CategoryRow label="Fashion" share={24} />
                <CategoryRow label="Home" share={16} />
                <CategoryRow label="Other" share={12} />
              </WidgetShell>
              <WidgetShell title="Customer Segments">
                <SegmentRow label="New" share={32} />
                <SegmentRow label="Returning" share={48} />
                <SegmentRow label="VIP" share={20} />
              </WidgetShell>
            </div>

            <div className="col-span-2">
              <WidgetShell title="Recent Activities" headerExtra={<span className="text-xs text-text-soft-400">See all</span>}>
                <ActivityRow title="New order #ORD-98745" subtitle="Sophia Williams placed an order" timestamp="2m ago" />
                <ActivityRow title="Stock low — AirPods Max Green" subtitle="Only 4 units left" timestamp="14m ago" />
                <ActivityRow title="Refund processed #ORD-46145" subtitle="$249.99 refunded to Ravi Patel" timestamp="1h ago" />
                <ActivityRow title="New product added" subtitle="iPad Pro 12.9-inch with M2 chip" timestamp="3h ago" />
              </WidgetShell>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  SHARED LAYOUT — exported for sibling pages (analytics, orders, products) */
/* ────────────────────────────────────────────────────────────────────────── */

type NavItem = { icon: React.ElementType; label: string; href: string; disabled?: boolean }
const NAV: NavItem[] = [
  { icon: RiLayoutGridLine, label: "Overview", href: "/" },
  { icon: RiBarChartBoxLine, label: "Analytics", href: "/analytics" },
  { icon: RiShoppingBag2Line, label: "Products", href: "/products" },
  { icon: RiHistoryLine, label: "Orders", href: "/orders" },
  { icon: RiPriceTag3Line, label: "Discounts", href: "#", disabled: true },
  { icon: RiApps2Line, label: "Apps", href: "#", disabled: true },
]

export function Sidebar({ activeHref }: { activeHref: string }) {
  return (
    <aside className="hidden lg:flex w-[272px] shrink-0 flex-col self-stretch border-r border-stroke-soft-200 bg-bg-white-0">
      {/* Company switch */}
      <div className="p-3">
        <button type="button" className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-bg-weak-50">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-(--dash-purple-100) text-xs font-semibold text-(--dash-purple-700)">CA</span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-text-strong-950">Catalyst</span>
            <span className="block text-xs text-text-sub-600">Marketing &amp; Sales</span>
          </span>
          <span className="inline-flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 shadow-regular-xs">
            <RiExpandUpDownLine className="size-4 text-text-sub-600" />
          </span>
        </button>
      </div>
      <div className="px-5"><div className="h-px bg-stroke-soft-200" /></div>

      {/* Nav */}
      <div className="flex flex-1 flex-col gap-5 px-5 pb-4 pt-5">
        <div>
          <div className="p-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">Main</div>
          <div className="space-y-1">
            {NAV.map(({ icon: Icon, label, href, disabled }) => {
              const active = href === activeHref
              return (
                <a
                  key={label}
                  href="#"
                  aria-disabled={disabled}
                  className={
                    "group relative flex items-center gap-2 rounded-lg py-2 pl-3 text-sm transition-colors " +
                    (active ? "bg-bg-weak-50 text-text-strong-950" : "text-text-sub-600 hover:bg-bg-weak-50") +
                    (disabled ? " pointer-events-none opacity-50" : "")
                  }
                >
                  {active ? <span className="absolute -left-5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" /> : null}
                  <Icon className={"size-5 shrink-0 " + (active ? "text-primary" : "text-text-sub-600")} />
                  <span className="flex-1">{label}</span>
                  {active ? <RiArrowRightSLine className="size-5 text-text-sub-600" /> : null}
                </a>
              )
            })}
          </div>
        </div>
        <div>
          <div className="p-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">Others</div>
          <div className="space-y-1">
            <button type="button" className="flex w-full items-center gap-2 rounded-lg py-2 pl-3 text-left text-sm text-text-sub-600 hover:bg-bg-weak-50">
              <RiSettings2Line className="size-5 shrink-0 text-text-sub-600" />
              <span className="flex-1">Settings</span>
            </button>
            <a href="#" aria-disabled className="flex pointer-events-none opacity-50 items-center gap-2 rounded-lg py-2 pl-3 text-sm text-text-sub-600">
              <RiHeadphoneLine className="size-5 shrink-0 text-text-sub-600" />
              <span className="flex-1">Support</span>
            </a>
          </div>
        </div>
      </div>

      <div className="px-5"><div className="h-px bg-stroke-soft-200" /></div>

      {/* User profile */}
      <div className="p-3">
        <button type="button" className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-bg-weak-50">
          <span className="inline-flex size-10 items-center justify-center overflow-hidden rounded-full bg-bg-weak-50 text-sm font-semibold text-text-strong-950">JB</span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-text-strong-950">James Brown</span>
            <span className="block text-xs text-text-sub-600">james@alignui.com</span>
          </span>
          <RiArrowRightSLine className="size-5 text-text-sub-600" />
        </button>
      </div>
    </aside>
  )
}

export function PageHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon: React.ReactNode
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <header className="flex min-h-[88px] items-center gap-3 px-8 py-5">
      <div className="flex flex-1 items-center gap-3.5">
        {icon}
        <div className="space-y-0.5">
          <div className="text-base font-medium text-text-strong-950">{title}</div>
          <div className="text-sm text-text-sub-600">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-xs">
          <RiSearch2Line className="size-4" />
        </button>
        <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-regular-xs">
          <RiNotification3Line className="size-4" />
        </button>
        {actions}
      </div>
    </header>
  )
}

export function FakeButton({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "primary"
}) {
  const cls =
    tone === "primary"
      ? "bg-primary text-static-white"
      : "bg-bg-white-0 border border-stroke-soft-200 text-text-sub-600 shadow-regular-xs"
  return (
    <button
      type="button"
      className={"inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium " + cls}
    >
      {children}
    </button>
  )
}

export function FakeSelect({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-sm font-medium text-text-sub-600 shadow-regular-xs"
    >
      {icon}
      {label}
    </button>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  WIDGET PRIMITIVES — used across all 4 marketing pages                    */
/* ────────────────────────────────────────────────────────────────────────── */

export function WidgetShell({
  title,
  headerExtra,
  children,
  className,
}: {
  title: React.ReactNode
  headerExtra?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={
        "relative flex w-full flex-col gap-3 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 " +
        (className ?? "")
      }
    >
      <div className="flex items-start gap-2">
        <div className="text-xs font-medium text-text-sub-600 flex-1">{title}</div>
        {headerExtra}
      </div>
      {children}
    </div>
  )
}

function WidgetTotalSalesPreview() {
  return (
    <WidgetShell title="Total Sales" headerExtra={<FakeButton>Report</FakeButton>}>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight text-text-strong-950">$128.32</div>
        <span className="rounded-full bg-(--state-success-lighter) px-1.5 py-0.5 text-[11px] font-medium text-(--state-success-base)">+2%</span>
      </div>
      <div className="grid grid-cols-5 gap-1 text-[11px] font-medium">
        {["1D", "1W", "1M", "3M", "1Y"].map((r) => (
          <button
            key={r}
            type="button"
            className={
              "h-6 rounded-md border " +
              (r === "1W"
                ? "border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 shadow-regular-xs"
                : "border-transparent text-text-sub-600")
            }
          >
            {r}
          </button>
        ))}
      </div>
      <SparkLine />
      <div className="space-y-3">
        <SmallRow icon={<RiStore2Line className="size-4 text-text-soft-400" />} label="Online Store" value="$52.12" delta="+4.5%" up />
        <SmallRow icon={<RiFacebookCircleLine className="size-4 text-text-soft-400" />} label="Facebook" value="$38.45" delta="-2.8%" />
        <SmallRow icon={<RiInstagramLine className="size-4 text-text-soft-400" />} label="Instagram" value="$37.75" delta="+3.2%" up />
      </div>
    </WidgetShell>
  )
}

function WidgetTotalVisitorsPreview() {
  return (
    <WidgetShell title="Total Visitors" headerExtra={<FakeButton>Report</FakeButton>}>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight text-text-strong-950">237,456</div>
        <span className="rounded-full bg-(--state-error-lighter) px-1.5 py-0.5 text-[11px] font-medium text-(--state-error-base)">-1.4%</span>
      </div>
      <SparkArea />
      <div className="grid grid-cols-3 gap-3 pt-2">
        <DeviceCol label="Desktop" pct="27%" delta="-3.2%" />
        <DeviceCol label="Tablet" pct="12%" delta="-6.4%" />
        <DeviceCol label="Mobile" pct="61%" delta="+0.8%" up />
      </div>
    </WidgetShell>
  )
}

function WidgetConversionRatePreview() {
  return (
    <WidgetShell title="Conversion Rate" headerExtra={<FakeButton>Report</FakeButton>}>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight text-text-strong-950">16.9%</div>
        <span className="rounded-full bg-(--state-success-lighter) px-1.5 py-0.5 text-[11px] font-medium text-(--state-success-base)">+0.3%</span>
      </div>
      <FunnelRow label="Added to Cart" value="32,840" pct={100} />
      <FunnelRow label="Reached Checkout" value="12,402" pct={48} />
      <FunnelRow label="Purchased" value="5,553" pct={22} />
    </WidgetShell>
  )
}

function DeviceCol({ label, pct, delta, up }: { label: string; pct: string; delta: string; up?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-text-soft-400">{label}</div>
      <div className="text-lg font-semibold text-text-strong-950">{pct}</div>
      <div className={"text-[11px] " + (up ? "text-success-base" : "text-error-base")}>{delta}</div>
    </div>
  )
}

function FunnelRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="text-text-sub-600">{label}</span>
        <span className="font-medium text-text-strong-950 tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-weak-50">
        <div className="h-full bg-primary" style={{ width: pct + "%" }} />
      </div>
    </div>
  )
}

export function SmallRow({
  icon,
  label,
  value,
  delta,
  up,
}: {
  icon: React.ReactNode
  label: string
  value: string
  delta: string
  up?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex flex-1 items-center gap-1.5">
        {icon}
        <div className="text-xs text-text-sub-600">{label}</div>
      </div>
      <div className="text-xs tabular-nums text-text-sub-600">{value}</div>
      <div className={"flex items-center gap-0.5 text-[11px] tabular-nums " + (up ? "text-success-base" : "text-error-base")}>
        {up ? <RiArrowUpLine className="size-3.5" /> : <RiArrowDownLine className="size-3.5" />}
        {delta}
      </div>
    </div>
  )
}

function ChannelRow({ icon, label, value, delta, up }: { icon: React.ReactNode; label: string; value: string; delta: string; up?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex-1 text-xs text-text-sub-600">{label}</div>
      <div className="text-xs tabular-nums text-text-strong-950">{value}</div>
      <div className={"text-[11px] tabular-nums " + (up ? "text-success-base" : "text-error-base")}>{delta}</div>
    </div>
  )
}

function RegionRow({ flag, label, share, count }: { flag: string; label: string; share: number; count: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-flex size-5 items-center justify-center rounded-sm bg-bg-weak-50 text-[10px] font-semibold text-text-strong-950">{flag}</span>
        <span className="flex-1 text-text-sub-600">{label}</span>
        <span className="tabular-nums text-text-strong-950">{count}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-weak-50">
        <div className="h-full bg-(--state-information-base)" style={{ width: share + "%" }} />
      </div>
    </div>
  )
}

function ChannelBar({ label, value, share }: { label: string; value: string; share: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-text-sub-600">{label}</span>
        <span className="tabular-nums text-text-strong-950">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-weak-50">
        <div className="h-full bg-primary" style={{ width: share + "%" }} />
      </div>
    </div>
  )
}

function ShipRow({ id, name, status, location }: { id: string; name: string; status: string; location: string }) {
  return (
    <div className="flex items-start gap-2 border-b border-stroke-soft-200 pb-2 last:border-0 last:pb-0">
      <div className="flex-1 space-y-0.5">
        <div className="text-xs font-medium text-text-strong-950">{name}</div>
        <div className="text-[11px] text-text-soft-400">{id} · {location}</div>
      </div>
      <span className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 text-[10px] font-medium text-text-sub-600">{status}</span>
    </div>
  )
}

function ProductRow({ name, units }: { name: string; units: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="size-7 rounded-md bg-bg-weak-50" />
      <div className="flex-1 text-xs text-text-strong-950">{name}</div>
      <div className="text-xs tabular-nums text-text-sub-600">{units}</div>
    </div>
  )
}

function ProductCardMini({ name, cat }: { name: string; cat: string }) {
  return (
    <div className="space-y-1.5 rounded-xl bg-bg-weak-50 p-2.5">
      <div className="h-14 rounded-md bg-bg-soft-200" />
      <div className="text-[11px] font-medium text-text-strong-950">{name}</div>
      <div className="text-[10px] text-text-sub-600">{cat}</div>
    </div>
  )
}

function CategoryRow({ label, share }: { label: string; share: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-text-sub-600">{label}</span>
        <span className="tabular-nums text-text-strong-950">{share}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-weak-50">
        <div className="h-full bg-(--state-feature-base)" style={{ width: share + "%" }} />
      </div>
    </div>
  )
}

function SegmentRow({ label, share }: { label: string; share: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-text-sub-600">{label}</span>
        <span className="tabular-nums text-text-strong-950">{share}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-weak-50">
        <div className="h-full bg-(--state-success-base)" style={{ width: share + "%" }} />
      </div>
    </div>
  )
}

export function ActivityRow({ title, subtitle, timestamp }: { title: string; subtitle: string; timestamp: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-stroke-soft-200 pb-3 last:border-0 last:pb-0">
      <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50">
        <RiArrowRightUpLine className="size-4 text-text-sub-600" />
      </div>
      <div className="flex-1 space-y-0.5">
        <div className="text-xs font-medium text-text-strong-950">{title}</div>
        <div className="text-[11px] text-text-sub-600">{subtitle}</div>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-text-soft-400">{timestamp}</div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  CHART STUBS (inline SVG approximation)                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export function SparkLine() {
  return (
    <svg viewBox="0 0 200 60" className="h-16 w-full" aria-hidden>
      <path
        d="M 0 40 L 20 36 L 40 42 L 60 28 L 80 30 L 100 22 L 120 26 L 140 18 L 160 24 L 180 12 L 200 16"
        fill="none"
        stroke="var(--primary-base)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SparkArea() {
  return (
    <svg viewBox="0 0 200 60" className="h-12 w-full" aria-hidden>
      <defs>
        <linearGradient id="spark-area-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary-base)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--primary-base)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 0 45 L 20 38 L 40 42 L 60 30 L 80 34 L 100 22 L 120 28 L 140 18 L 160 22 L 180 14 L 200 18 L 200 60 L 0 60 Z" fill="url(#spark-area-grad)" />
      <path d="M 0 45 L 20 38 L 40 42 L 60 30 L 80 34 L 100 22 L 120 28 L 140 18 L 160 22 L 180 14 L 200 18" fill="none" stroke="var(--primary-base)" strokeWidth="1.5" />
    </svg>
  )
}

export function SparkBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  return (
    <svg viewBox={`0 0 ${values.length * 14} 60`} className="h-12 w-full" aria-hidden>
      {values.map((v, i) => {
        const h = (v / max) * 50
        return (
          <rect
            key={i}
            x={i * 14 + 2}
            y={60 - h}
            width={8}
            height={h}
            rx={2}
            fill="var(--primary-base)"
            opacity={0.6 + (i / values.length) * 0.4}
          />
        )
      })}
    </svg>
  )
}
