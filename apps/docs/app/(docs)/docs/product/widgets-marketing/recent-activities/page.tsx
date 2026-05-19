"use client"

import * as React from "react"
import {
  RiAddCircleLine,
  RiImageLine,
  RiPencilLine,
  RiPriceTagLine,
  RiSearch2Line,
  RiStackLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Marketing Widget — Recent Activities.
 * Ported from AlignUI Marketing Template (recent-activities.tsx, 2026-05-18).
 *
 * Two variants in source:
 *   - RecentActivities (no card chrome)
 *   - WidgetRecentActivities (rounded-2xl card + 48px embedded search with stroke-soft borders)
 *
 * Timeline activity types map to color + icon:
 *   inventory-update  → information-base + RiStackLine
 *   price-change      → success-base    + RiPriceTagLine
 *   new-product-add   → feature-base    + RiAddCircleLine
 *   image-update      → away-base       + RiImageLine
 *   description-update → faded-base     + RiPencilLine
 */

type Activity = "new-product-add" | "image-update" | "price-change" | "description-update" | "inventory-update"
type TimelineItem = {
  activity: Activity
  title: string
  description: string
  date: string
  action?: string
}

const TIMELINE: TimelineItem[] = [
  { activity: "inventory-update", title: "Inventory Updated", description: "Women's Summer Dress - Blue", date: "11:30 AM", action: "Stock: +150 units added" },
  { activity: "price-change", title: "Price Change", description: "Seasonal discount applied", date: "11:30 AM", action: "$89.99 → $69.99 (-22%)" },
  { activity: "new-product-add", title: "New Product Added", description: "Women's Summer Dress - Red", date: "11:30 AM", action: "Listed in Women's Fashion" },
  { activity: "image-update", title: "Product Images Updated", description: "Women's Summer Dress - Blue", date: "11:30 AM", action: "5 new images added" },
  { activity: "description-update", title: "Description Updated", description: "Women's Summer Dress - Blue", date: "11:30 AM", action: "Added size guide and materials" },
  { activity: "inventory-update", title: "Inventory Updated", description: "Women's Summer Dress - Blue", date: "11:30 AM", action: "Stock: +150 units added" },
  { activity: "price-change", title: "Price Change", description: "Seasonal discount applied", date: "11:30 AM", action: "$89.99 → $69.99 (-22%)" },
]

const ICON_MAP: Record<Activity, { color: string; Icon: React.ElementType }> = {
  "new-product-add": { color: "text-feature-base", Icon: RiAddCircleLine },
  "image-update": { color: "text-away-base", Icon: RiImageLine },
  "price-change": { color: "text-success-base", Icon: RiPriceTagLine },
  "description-update": { color: "text-(--state-faded-base)", Icon: RiPencilLine },
  "inventory-update": { color: "text-information-base", Icon: RiStackLine },
}

function Pills({
  active,
  onChange,
}: {
  active: "today" | "yesterday" | "week"
  onChange: (v: "today" | "yesterday" | "week") => void
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {(["today", "yesterday", "week"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "flex h-7 items-center justify-center rounded-lg bg-bg-weak-50 px-2.5 text-xs font-medium text-text-sub-600 transition-colors",
            active === v && "bg-(--primary-alpha-10) text-(--primary-base)",
          )}
        >
          {v === "today" ? "Today" : v === "yesterday" ? "Yesterday" : "This week"}
        </button>
      ))}
    </div>
  )
}

function Timeline() {
  return (
    <div className="flex flex-col gap-6">
      {TIMELINE.map((item, i, arr) => {
        const { Icon, color } = ICON_MAP[item.activity]
        return (
          <div key={i} className="relative flex items-start gap-4">
            {i < arr.length - 1 && (
              <div className="absolute -bottom-4 left-3.5 top-9 w-px bg-stroke-soft-200" />
            )}
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
              <Icon className={cn("size-4", color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-sm font-medium text-text-strong-950">{item.title}</span>
                <span className="text-[10px] uppercase tracking-wider text-text-soft-400">{item.date}</span>
              </div>
              <div className="mt-1 text-xs text-text-sub-600">{item.description}</div>
              {item.action && <div className="mt-1 text-xs text-text-sub-600">{item.action}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RecentActivitiesBare() {
  const [tab, setTab] = React.useState<"today" | "yesterday" | "week">("today")
  return (
    <div className="w-full">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-text-strong-950">Recent Activities</div>
          <div className="mt-1 text-xs text-text-sub-600">5 new activities today</div>
        </div>
        <Button size="xs" style="stroke" tone="neutral">
          Details
        </Button>
      </div>
      <div className="mt-4">
        <Pills active={tab} onChange={setTab} />
      </div>
      <div className="mt-4 flex h-9 items-center gap-2 rounded-[10px] border border-stroke-soft-200 px-3 text-xs text-text-soft-400">
        <RiSearch2Line className="size-4" />
        <input placeholder="Search..." className="flex-1 bg-transparent placeholder:text-text-soft-400 focus:outline-none" />
        <span className="inline-flex h-5 items-center gap-0.5 rounded bg-bg-weak-50 px-1.5 text-[10px] text-text-soft-400">⌘1</span>
      </div>
      <div className="mt-6">
        <Timeline />
      </div>
    </div>
  )
}

function RecentActivitiesCard() {
  const [tab, setTab] = React.useState<"today" | "yesterday" | "week">("today")
  return (
    <div className="w-full rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="text-sm font-semibold text-text-strong-950">Recent Activities</div>
            <div className="mt-1 text-xs text-text-sub-600">5 new activities today</div>
          </div>
          <Button size="xs" style="stroke" tone="neutral">
            Details
          </Button>
        </div>
        <div className="mt-4">
          <Pills active={tab} onChange={setTab} />
        </div>
      </div>
      <div className="relative">
        <RiSearch2Line className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-text-soft-400" />
        <input
          type="text"
          placeholder="Search for activities..."
          className="h-12 w-full border-y border-stroke-soft-200 bg-transparent pl-[50px] pr-5 text-sm text-text-strong-950 caret-(--primary-base) placeholder:text-text-soft-400 focus:outline-none"
        />
      </div>
      <div className="p-5">
        <Timeline />
      </div>
    </div>
  )
}

export default function RecentActivitiesWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Recent Activities"
        description="Vertical timeline of product changes — 5 activity types (inventory / price / new / image / description) with colored ring-stroke icon nodes and a hairline connector."
        status="shipped"
      />

      <DocsSection title="Card variant (WidgetRecentActivities)">
        <DocsExample
          title="Embedded 48px search"
          preview={
            <div className="max-w-md mx-auto w-full">
              <RecentActivitiesCard />
            </div>
          }
          code={`<WidgetRecentActivities />`}
        />
      </DocsSection>

      <DocsSection title="Bare variant (RecentActivities)">
        <DocsExample
          title="Standalone (no card chrome)"
          description="Inline search input with Kbd hint, plus an external pill row. Use inside larger composed sections."
          preview={
            <div className="max-w-md mx-auto w-full">
              <RecentActivitiesBare />
            </div>
          }
          code={`<RecentActivities />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No activity"
          preview={
            <div className="max-w-md mx-auto rounded-2xl bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 text-center">
              <div className="text-sm font-semibold text-text-strong-950">Recent Activities</div>
              <div className="mt-2 text-xs text-text-sub-600">Nothing to show — actions on products will appear here.</div>
            </div>
          }
          code={`{timeline.length === 0 ? <Empty/> : <RecentActivities/>}`}
        />
      </DocsSection>

      <DocsSection title="Activity colors / icons">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(ICON_MAP) as Activity[]).map((k) => {
            const { Icon, color } = ICON_MAP[k]
            return (
              <div key={k} className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3">
                <div className="flex size-7 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
                  <Icon className={cn("size-4", color)} />
                </div>
                <code className="text-xs text-text-strong-950">{k}</code>
              </div>
            )
          })}
        </div>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "timeline", type: "TimelineItem[]", description: "Activity rows in display order. Each carries an activity type, title, description, date, optional action sub-line." },
            { name: "variant", type: '"card" | "bare"', defaultValue: '"card"', description: 'Card embeds a 48px search row with stroke-soft borders; bare uses an inline Input + Kbd hint.' },
            { name: "tab", type: '"today" | "yesterday" | "week"', defaultValue: '"today"', description: "Active pill row above the search." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Header: 14px semibold title + 12px sub-line ("5 new activities today"), neutral-stroke Details button.</li>
          <li>Search: card variant uses a 48px h row with top/bottom stroke-soft borders; bare uses an inline Input with Kbd.</li>
          <li>Timeline icon node: 28px circle, bg-white + ring-stroke-soft, shadow-regular-xs.</li>
          <li>Connector: 1px stroke-soft-200, left-3.5 top-9 → -bottom-4, hidden on the last item.</li>
          <li>Row text: 14px title (right-aligned uppercase 10px date), 12px description + optional action.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
