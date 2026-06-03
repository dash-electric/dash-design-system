"use client"

import * as React from "react"
import { RiInformationLine, RiSearch2Line } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { ScrollArea } from "@/registry/dash/ui/scroll-area"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Marketing Widget — My Products.
 * Ported from AlignUI Marketing Template (widget-my-products.tsx, 2026-05-18).
 *
 * Structure:
 *   - Header (p-6 pb-4): "My Products" label + tooltip, "468" + "+2.1% vs last week", "See All" button.
 *   - Search row (h-11, border-y stroke-soft-200): inline search icon + input.
 *   - Scrollable product list (243px h, ScrollArea):
 *       40px image · name · "N units sold to date" description.
 */

type Product = { id: string; name: string; image?: string; description: string }

const PRODUCTS: Product[] = [
  { id: "fd5b", name: "Apple Watch S5 GPS 40mm White", description: "500 units sold to date" },
  { id: "8245", name: "MacBook Pro M1 256GB Silver", description: "960 units sold to date" },
  { id: "ad8a", name: "iMac M1 24-inch Purple", description: "648 units sold to date" },
  { id: "0c5d", name: "AirPods Max Green", description: "243 units sold to date" },
  { id: "2dcc", name: "HomePod Mini Orange", description: "56 units sold to date" },
  { id: "f25f", name: "iPad Pro 12.9-inch with M2 chip", description: "405 units sold to date" },
  { id: "799d", name: "Apple Studio Display Standard Glass", description: "44 units sold to date" },
  { id: "9f95", name: "Apple AirPods Pro 2nd Gen", description: "120 units sold to date" },
]

function MyProductsWidget() {
  const [q, setQ] = React.useState("")
  const filtered = PRODUCTS.filter(
    (p) => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex items-start gap-2 p-6 pb-4">
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-text-sub-600">My Products</span>
            <RiInformationLine className="size-5 text-text-disabled-300" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight text-text-strong-950">468</span>
            <span className="text-xs text-text-sub-600">
              <span className="text-success-base">+2.1%</span> vs last week
            </span>
          </div>
        </div>
        <Button size="xs" style="stroke" tone="neutral">
          See All
        </Button>
      </div>

      <div className="h-11 w-full border-y border-stroke-soft-200 px-6">
        <div className="group relative flex h-full w-full items-center">
          <RiSearch2Line className="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-text-soft-400 transition group-focus-within:text-text-sub-600" />
          <input
            type="text"
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-transparent pl-[32px] text-sm text-text-strong-950 caret-(--primary-base) placeholder:text-text-soft-400 focus:outline-none"
          />
        </div>
      </div>

      <ScrollArea size="x-small" className="h-[243px] rounded-br-2xl">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-soft-400">No products match "{q}"</div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3.5 border-b border-stroke-soft-200 px-4 py-3 last:border-b-0"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-bg-weak-50 text-xs text-text-soft-400">
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-text-strong-950">{p.name}</div>
                <div className="mt-1 text-xs text-text-sub-600">{p.description}</div>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  )
}

export default function MyProductsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="My Products"
        description="Searchable product list — KPI header (468 / +2.1%), a 44px search row separated by stroke-soft borders, and a 243px ScrollArea of 56px product rows."
        status="shipped"
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="With search"
          preview={
            <div className="max-w-md mx-auto w-full">
              <MyProductsWidget />
            </div>
          }
          code={`<MyProductsWidget />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No products yet"
          preview={
            <div className="max-w-md mx-auto rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
              <div className="p-6 pb-4">
                <div className="text-sm font-medium text-text-sub-600">My Products</div>
                <div className="mt-1 text-xs text-text-soft-400">No products yet — add one to start tracking sales.</div>
              </div>
              <div className="h-11 border-y border-stroke-soft-200 px-6 flex items-center text-xs text-text-soft-400">
                Search products…
              </div>
              <div className="h-[160px] flex items-center justify-center text-xs text-text-soft-400">No data</div>
            </div>
          }
          code={`{products.length === 0 ? <Empty/> : <MyProductsWidget/>}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "products", type: "{ id, name, image?, description }[]", description: "Rendered as 56px rows. image is rendered when supplied; falls back to first-letter tile." },
            { name: "total", type: "number", defaultValue: "468", description: "Header KPI." },
            { name: "delta", type: "string", defaultValue: '"+2.1%"', description: "Header sub-line." },
            { name: "onSeeAll", type: "() => void", description: "Top-right See All click handler." },
            { name: "filterFn", type: "(product, query) => boolean", description: "Optional override of the default name/description substring search." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Card: rounded-2xl + overflow-hidden so the scroll area corners clip cleanly.</li>
          <li>Header: 14px label + tooltip, 24px KPI + 12px delta, neutral-stroke "See All" 28px button.</li>
          <li>Search row: 44px tall, stroke-soft top + bottom borders, inline icon at left.</li>
          <li>Row: 40px image / first-letter tile + 14px name + 12px description, 56px row height with bottom-border.</li>
          <li>ScrollArea: 243px h, rounded-br-2xl, x-small scrollbar variant.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
