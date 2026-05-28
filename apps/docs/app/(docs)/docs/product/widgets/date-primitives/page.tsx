"use client"

import * as React from "react"
import {
  RiArrowLeftSLine as ChevronLeft,
  RiArrowRightSLine as ChevronRight,
} from "@remixicon/react"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Date primitives — Figma 1:1 (6 nodes verified 2026-05-18).
 *   3520:2544    DateChip — default (48×48)
 *   3520:2549    DateChip — hover (bg-weak)
 *   3520:2551    DateChip — active (filled primary)
 *   3520:2557    DateChip variant trio (default / hover / active)
 *   3520:2568    DateStrip — 5-chip week selector
 *   3520:2578    DateStrip — 7-chip week selector w/ chevron nav
 */
export default function DatePrimitivesWidgetPage() {
  const [active, setActive] = React.useState("Sun-02")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Date primitives"
        description="Small fixed-size date tiles (48×48) and a horizontal week strip with chevron paging. Used inside Schedule, Time Off, and any widget that needs lightweight day-picking."
      />

      <DocsSection title="Date chip — 3 states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Single tile = weekday (top) + date number (bottom). Three states: default, hover (bg-weak-50), active (filled primary). Figma nodes 3520:2544 / 3520:2549 / 3520:2551 / 3520:2557.
        </p>
        <DocsExample
          title="default · hover · active"
          preview={
            <div className="flex items-center gap-3">
              <DateChip day="Fri" date="31" state="default" />
              <DateChip day="Fri" date="31" state="hover" />
              <DateChip day="Fri" date="31" state="active" />
            </div>
          }
          code={`<DateChip day="Fri" date="31" state="default" />
<DateChip day="Fri" date="31" state="hover" />
<DateChip day="Fri" date="31" state="active" />`}
        />
      </DocsSection>

      <DocsSection title="Week strip — 5 chips">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Chevron-prev + 5 chips + chevron-next. Used inside Schedule widget header. Figma node 3520:2568.
        </p>
        <DocsExample
          title="5-day strip"
          preview={
            <DateStrip
              items={[
                { day: "Fri", date: "31" },
                { day: "Sat", date: "01" },
                { day: "Sun", date: "02" },
                { day: "Mon", date: "03" },
                { day: "Tue", date: "04" },
              ]}
              activeKey={active}
              onChange={setActive}
            />
          }
          code={`<DateStrip
  items={[
    { day: "Fri", date: "31" },
    { day: "Sat", date: "01" },
    { day: "Sun", date: "02" },
    { day: "Mon", date: "03" },
    { day: "Tue", date: "04" },
  ]}
  activeKey={active}
  onChange={setActive}
/>`}
        />
      </DocsSection>

      <DocsSection title="Week strip — 7 chips">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Full-week variant for standalone date-picker contexts. Figma node 3520:2578.
        </p>
        <DocsExample
          title="7-day strip"
          preview={
            <DateStrip
              items={[
                { day: "Mon", date: "27" },
                { day: "Tue", date: "28" },
                { day: "Wed", date: "29" },
                { day: "Thu", date: "30" },
                { day: "Fri", date: "31" },
                { day: "Sat", date: "01" },
                { day: "Sun", date: "02" },
              ]}
              activeKey="Wed-29"
            />
          }
          code={`<DateStrip items={[...7 days]} activeKey="Wed-29" />`}
        />
      </DocsSection>

      <DocsSection title="In context — Schedule header">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The strip is most often docked as the widget header sub-row.
        </p>
        <DocsExample
          title="Inside WidgetShell"
          preview={
            <div className="max-w-md">
              <WidgetShell title="Schedule" seeAll>
                <DateStrip
                  items={[
                    { day: "Fri", date: "31" },
                    { day: "Sat", date: "01" },
                    { day: "Sun", date: "02" },
                    { day: "Mon", date: "03" },
                    { day: "Tue", date: "04" },
                  ]}
                  activeKey="Sun-02"
                />
                <div className="flex flex-col items-center gap-2 py-6 text-center text-xs text-text-sub-600">
                  Pick a day to see scheduled items.
                </div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title="Schedule" seeAll>
  <DateStrip items={[...]} activeKey="Sun-02" />
  ...
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "DateChip.day", type: "string", description: "Top label — 3-letter weekday (Mon, Tue, …)." },
            { name: "DateChip.date", type: "string", description: "Bottom label — zero-padded date number (01–31)." },
            { name: "DateChip.state", type: '"default" | "hover" | "active"', defaultValue: '"default"', description: "Visual state." },
            { name: "DateChip.onClick", type: "() => void", description: "Optional click handler." },
            { name: "DateStrip.items", type: "{ day, date }[]", description: "Ordered list of chips, 5–7 items typical." },
            { name: "DateStrip.activeKey", type: "string", description: '"<day>-<date>" of the selected chip.' },
            { name: "DateStrip.onChange", type: "(key: string) => void", description: "Fires when a chip is clicked." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><span className="font-medium">Chip box</span> — 48×48, `rounded-lg border`, stacked weekday + date number, centered.</li>
          <li><span className="font-medium">Default</span> — `border-stroke-soft-200 bg-bg-white-0`, day `text-text-sub-600`, date `text-text-strong-950`.</li>
          <li><span className="font-medium">Hover</span> — `bg-bg-weak-50`, border unchanged. Transition `transition-colors`.</li>
          <li><span className="font-medium">Active</span> — `bg-(--primary-base) border-(--primary-base)`, day `text-white/80`, date `text-white`.</li>
          <li><span className="font-medium">Strip</span> — `inline-flex items-center gap-1`, chevrons rendered as `CompactButton variant="ghost" size="sm"` w/ aria-label `Prev` / `Next`.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* helpers */
function WidgetShell({ title, seeAll, children, className }: { title: React.ReactNode; seeAll?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {seeAll && <LinkButton size="sm">See All</LinkButton>}
      </div>
      {children}
    </div>
  )
}

function DateChip({
  day,
  date,
  state = "default",
  onClick,
}: {
  day: string
  date: string
  state?: "default" | "hover" | "active"
  onClick?: () => void
}) {
  const Comp: React.ElementType = onClick ? "button" : "div"
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex flex-col items-center rounded-lg border h-12 w-12 justify-center transition-colors",
        state === "default" && "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50",
        state === "hover" && "border-stroke-soft-200 bg-bg-weak-50",
        state === "active" && "bg-(--primary-base) border-(--primary-base) text-white",
      )}
    >
      <span className={cn("text-[10px] leading-none mb-0.5", state === "active" ? "text-white/80" : "text-text-sub-600")}>{day}</span>
      <span className={cn("text-sm font-medium tabular-nums leading-none", state === "active" ? "text-white" : "text-text-strong-950")}>{date}</span>
    </Comp>
  )
}

function DateStrip({
  items,
  activeKey,
  onChange,
}: {
  items: { day: string; date: string }[]
  activeKey?: string
  onChange?: (key: string) => void
}) {
  return (
    <div className="inline-flex items-center gap-1">
      <CompactButton variant="ghost" size="sm" aria-label="Prev">
        <ChevronLeft />
      </CompactButton>
      {items.map((it) => {
        const key = `${it.day}-${it.date}`
        const active = key === activeKey
        return (
          <DateChip
            key={key}
            day={it.day}
            date={it.date}
            state={active ? "active" : "default"}
            onClick={onChange ? () => onChange(key) : undefined}
          />
        )
      })}
      <CompactButton variant="ghost" size="sm" aria-label="Next">
        <ChevronRight />
      </CompactButton>
    </div>
  )
}
