"use client"

import * as React from "react"
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiInformationLine,
} from "@remixicon/react"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/dash/ui/select"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Marketing Widget — Shipping Tracking.
 * Ported from AlignUI Marketing Template (widget-shipping-tracking.tsx, 2026-05-18).
 *
 * Layout (top → bottom):
 *   1. Header — title + tooltip, total 3,844 + Badge "+1.8%", period Select (Daily/Weekly/Monthly).
 *   2. Tab pills — Delivered / In-transit / Returned (toggle-group, primary-alpha-10 active).
 *   3. Product row — product image + name + prev/next arrows.
 *   4. Step line chart — 152px h, 6×4 grid lines, animated step path.
 *   5. Weekday legend — Mon/Tue/Wed/Thu/Fri/Sat/Sun.
 *
 * Products: Apple Watch S5 GPS 40mm White / MacBook Pro M1 256GB Silver / iMac M1 24-inch Purple.
 */

type ChartPoint = { date: string; value: number }

const productsData: { id: string; name: string; data: ChartPoint[] }[] = [
  {
    id: "70d9",
    name: "Apple Watch S5 GPS 40mm White",
    data: [
      { date: "2024-12-02", value: 45 },
      { date: "2024-12-03", value: 65 },
      { date: "2024-12-04", value: 28 },
      { date: "2024-12-05", value: 85 },
      { date: "2024-12-06", value: 55 },
      { date: "2024-12-07", value: 35 },
      { date: "2024-12-08", value: 78 },
    ],
  },
  {
    id: "477b",
    name: "MacBook Pro M1 256GB Silver",
    data: [
      { date: "2024-12-02", value: 34 },
      { date: "2024-12-03", value: 68 },
      { date: "2024-12-04", value: 10 },
      { date: "2024-12-05", value: 35 },
      { date: "2024-12-06", value: 55 },
      { date: "2024-12-07", value: 15 },
      { date: "2024-12-08", value: 35 },
    ],
  },
  {
    id: "9cf3",
    name: "iMac M1 24-inch Purple",
    data: [
      { date: "2024-12-02", value: 65 },
      { date: "2024-12-03", value: 98 },
      { date: "2024-12-04", value: 15 },
      { date: "2024-12-05", value: 45 },
      { date: "2024-12-06", value: 75 },
      { date: "2024-12-07", value: 15 },
      { date: "2024-12-08", value: 80 },
    ],
  },
]

/** Step line — hand-rendered SVG mirror of recharts type="step". */
function StepLine({ data, width = 320, height = 76 }: { data: ChartPoint[]; width?: number; height?: number }) {
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const stepX = width / (data.length - 1 || 1)
  const yOf = (v: number) => height - ((v - min) / span) * height
  const parts: string[] = []
  data.forEach((p, i) => {
    const x = i * stepX
    const y = yOf(p.value)
    if (i === 0) {
      parts.push(`M ${x} ${y}`)
    } else {
      // step: horizontal first then vertical
      parts.push(`L ${x} ${yOf(data[i - 1].value)}`)
      parts.push(`L ${x} ${y}`)
    }
  })
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={parts.join(" ")} fill="none" stroke="var(--primary-base)" strokeWidth={2} />
    </svg>
  )
}

function ShippingTrackingWidget() {
  const [period, setPeriod] = React.useState("daily")
  const [tab, setTab] = React.useState<"delivered" | "in-transit" | "returned">("delivered")
  const [index, setIndex] = React.useState(0)
  const product = productsData[index]

  const prev = () => setIndex((i) => (i === 0 ? productsData.length - 1 : i - 1))
  const next = () => setIndex((i) => (i === productsData.length - 1 ? 0 : i + 1))

  return (
    <div className="relative flex w-full flex-col rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-text-sub-600">Shipping Tracking</span>
              <RiInformationLine className="size-5 text-text-disabled-300" />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold tracking-tight text-text-strong-950">3,844</span>
              <Badge status="success" appearance="lighter" size="md">
                +1.8%
              </Badge>
            </div>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger size="sm" className="h-7 w-auto gap-2 px-2.5 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {(["delivered", "in-transit", "returned"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setTab(v)}
              className={cn(
                "flex h-7 items-center justify-center rounded-lg bg-bg-weak-50 px-2.5 text-xs font-medium text-text-sub-600 transition-colors",
                tab === v && "bg-(--primary-alpha-10) text-(--primary-base)",
              )}
            >
              {v === "delivered" ? "Delivered" : v === "in-transit" ? "In-transit" : "Returned"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-12 items-center gap-2 border-y border-stroke-soft-200 px-6">
        <div className="flex flex-1 items-center gap-2">
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded bg-bg-weak-50 text-[10px] text-text-soft-400">
            {product.name[0]}
          </span>
          <span className="text-xs text-text-sub-600">{product.name}</span>
        </div>
        <div className="flex">
          <button
            type="button"
            onClick={prev}
            className="flex size-5 items-center justify-center rounded-l-md bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50"
            aria-label="Previous product"
          >
            <RiArrowLeftSLine className="size-[18px] text-text-sub-600" />
          </button>
          <button
            type="button"
            onClick={next}
            className="flex size-5 items-center justify-center rounded-r-md bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50"
            aria-label="Next product"
          >
            <RiArrowRightSLine className="size-[18px] text-text-sub-600" />
          </button>
        </div>
      </div>

      <div
        className="flex items-center px-[40px]"
        style={{
          height: 152,
          background: `
            linear-gradient(90deg, var(--stroke-soft-200) 1px, transparent 1px 100%) 38px 0 / calc((100% - 76px) / 6) 152px repeat no-repeat,
            linear-gradient(360deg, var(--stroke-soft-200) 1px, transparent 1px 100%) 0 0 / 100% calc(152px / 4) no-repeat repeat
          `,
        }}
      >
        <div className="w-full">
          <StepLine data={product.data} />
        </div>
      </div>

      <div className="grid grid-flow-col auto-cols-fr gap-0.5 px-4 py-3 text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d} className="text-[11px] text-text-soft-400">
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ShippingTrackingWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Shipping Tracking"
        description="Order-flow analytics — total shipments + period selector, status pills (Delivered / In-transit / Returned), a per-product step-line trend and weekday legend."
        status="shipped"
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Interactive — switch tab and product"
          preview={
            <div className="max-w-md mx-auto w-full">
              <ShippingTrackingWidget />
            </div>
          }
          code={`<ShippingTrackingWidget />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No shipments yet"
          preview={
            <div className="max-w-md mx-auto w-full rounded-2xl bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 text-center">
              <div className="text-sm font-medium text-text-strong-950">Shipping Tracking</div>
              <div className="mt-2 text-xs text-text-sub-600">No shipments yet — orders will appear here once dispatched.</div>
            </div>
          }
          code={`{count === 0 ? <EmptyState/> : <ShippingTrackingWidget/>}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "products", type: "{ id, name, data: { date, value }[] }[]", description: "Product list rotated via prev/next arrows; each carries a 7-point time-series for the step chart." },
            { name: "period", type: '"daily" | "weekly" | "monthly"', defaultValue: '"daily"', description: "Top-right Select. Drives the chart aggregation source upstream." },
            { name: "tab", type: '"delivered" | "in-transit" | "returned"', defaultValue: '"delivered"', description: "Status filter pills. Active pill uses primary-alpha-10 + primary-base text." },
            { name: "total", type: "number", description: "Header KPI (e.g. 3844)." },
            { name: "deltaBadge", type: "ReactNode", description: 'Header badge — e.g. <Badge status="success">+1.8%</Badge>.' },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Card: rounded-2xl, ring-1 stroke-soft-200, shadow-regular-xs.</li>
          <li>Header column: 14px label + info tooltip, 24px KPI + success badge, period Select.</li>
          <li>Pills: 28px h, bg-weak-50 default, primary-alpha-10 + primary-base active.</li>
          <li>Product row: 48px h, separated by stroke-soft-200 top/bottom borders.</li>
          <li>Chart pane: 152px h, 6 columns × 4 rows grid backdrop, step-line stroke primary-base.</li>
          <li>Footer: 7 weekday labels in text-soft-400, equal-width grid.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
