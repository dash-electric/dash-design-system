"use client"

import * as React from "react"
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiInformationLine,
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
 * Marketing Widget — Product Categories.
 * Ported from AlignUI Marketing Template (product-categories.tsx, 2026-05-18).
 *
 * Categories rotated via prev/next:
 *   Accessories (58%, 45 products, +3.2% / +2.1%w)
 *   Wearables   (40%, 32 products, +2.8% / +1.5%w)
 *   Smart Home  (15%, 18 products, +4.5% / +3.2%w)
 *
 * Layout:
 *   1. Header: "Product Categories" label + tooltip, "{value}%" + "+{weeklyGrowth}% vs last week", Details button.
 *   2. ProgressChart (32px tall, 9px-step striped segmented bar).
 *   3. Footer: category label + prev/next arrows, products count · growth %.
 *
 * Two variants exist in source:
 *   - ProductCategories (bare, no card chrome) — used inside larger layouts.
 *   - WidgetProductCategories (rounded-2xl + p-5 + ring + shadow) — standalone widget.
 */

type Category = {
  id: string
  label: string
  value: number
  products: number
  growth: number
  weeklyGrowth: number
}

const CATEGORIES: Category[] = [
  { id: "70d9", label: "Accessories", value: 58, products: 45, growth: 3.2, weeklyGrowth: 2.1 },
  { id: "477b", label: "Wearables", value: 40, products: 32, growth: 2.8, weeklyGrowth: 1.5 },
  { id: "9cf3", label: "Smart Home", value: 15, products: 18, growth: 4.5, weeklyGrowth: 3.2 },
]

function ProgressStriped({ value }: { value: number }) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [w, setW] = React.useState(0)
  React.useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const obs = new ResizeObserver((e) => {
      for (const entry of e) setW(entry.contentRect.width)
    })
    obs.observe(el)
    setW(el.getBoundingClientRect().width)
    return () => obs.disconnect()
  }, [])
  const trackW = w ? Math.round(w / 9) * 9 : 0
  const progW = w ? Math.round(((value / 100) * w) / 9) * 9 : 0
  return (
    <div ref={ref} className="w-full">
      <div
        className="relative h-8 w-full bg-bg-soft-200"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, #000 6px, transparent 6px)",
          maskImage: "linear-gradient(90deg, #000 6px, transparent 6px)",
          WebkitMaskSize: "9px 100%",
          maskSize: "9px 100%",
          WebkitMaskRepeat: "space",
          maskRepeat: "space",
          width: trackW || undefined,
        }}
      >
        <div className="h-full" style={{ width: `${progW}px`, clipPath: "inset(0)" }}>
          <div className="absolute inset-0 bg-(--primary-base)" />
        </div>
      </div>
    </div>
  )
}

function ProductCategoriesBody({ withCard }: { withCard: boolean }) {
  const [i, setI] = React.useState(0)
  const cat = CATEGORIES[i]
  const prev = () => setI((p) => (p === 0 ? CATEGORIES.length - 1 : p - 1))
  const next = () => setI((p) => (p === CATEGORIES.length - 1 ? 0 : p + 1))

  return (
    <div
      className={cn(
        "relative flex w-full flex-col",
        withCard && "rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-text-sub-600">Product Categories</span>
            <RiInformationLine className="size-5 text-text-disabled-300" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight text-text-strong-950 tabular-nums">
              {cat.value}%
            </span>
            <span className="text-xs text-text-sub-600">
              <span className="text-success-base">+{cat.weeklyGrowth}%</span> vs last week
            </span>
          </div>
        </div>
        <Button size="xs" style="stroke" tone="neutral">
          Details
        </Button>
      </div>

      <div className="mt-3.5">
        <ProgressStriped value={cat.value} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-text-sub-600">{cat.label}</span>
          <div className="flex">
            <button
              type="button"
              onClick={prev}
              className="flex size-5 items-center justify-center rounded-l-md bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50"
              aria-label="Previous"
            >
              <RiArrowLeftSLine className="size-[18px] text-text-sub-600" />
            </button>
            <button
              type="button"
              onClick={next}
              className="flex size-5 items-center justify-center rounded-r-md bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50"
              aria-label="Next"
            >
              <RiArrowRightSLine className="size-[18px] text-text-sub-600" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-sub-600">{cat.products} products</span>
          <span className="text-[11px] text-text-soft-400">·</span>
          <span className="text-sm text-success-base">+{cat.growth}%</span>
        </div>
      </div>
    </div>
  )
}

export default function ProductCategoriesWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Marketing"
        title="Product Categories"
        description="Inventory-mix rotator — header KPI, a 32px striped progress chart and a footer pairing the current category label + prev/next arrows with product count and growth %."
        status="shipped"
      />

      <DocsSection title="Card variant (WidgetProductCategories)">
        <DocsExample
          title="Standalone widget"
          preview={
            <div className="max-w-sm mx-auto w-full">
              <ProductCategoriesBody withCard />
            </div>
          }
          code={`<WidgetProductCategories />`}
        />
      </DocsSection>

      <DocsSection title="Bare variant (ProductCategories)">
        <DocsExample
          title="No card chrome"
          description="Used inside larger composed layouts where the surrounding container already provides padding/border."
          preview={
            <div className="max-w-sm mx-auto w-full">
              <ProductCategoriesBody withCard={false} />
            </div>
          }
          code={`<ProductCategories />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No categories"
          preview={
            <div className="max-w-sm mx-auto rounded-2xl bg-bg-white-0 p-5 ring-1 ring-inset ring-stroke-soft-200 space-y-3">
              <div className="text-sm font-medium text-text-sub-600">Product Categories</div>
              <div className="h-8 w-full rounded-sm bg-bg-soft-200" />
              <div className="text-xs text-text-soft-400">Add products to populate categories.</div>
            </div>
          }
          code={`{categories.length === 0 ? <Empty/> : <WidgetProductCategories/>}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "categories", type: "{ id, label, value, products, growth, weeklyGrowth }[]", description: "Rotated via prev/next arrows. value drives the ProgressChart fill." },
            { name: "variant", type: '"card" | "bare"', defaultValue: '"card"', description: 'Card adds rounded-2xl + p-5 + ring + shadow. Bare omits all chrome.' },
            { name: "onDetails", type: "() => void", description: "Click handler for the top-right Details button." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Header: 14px label + tooltip, 24px KPI + 12px sub-line "+X% vs last week", Details button right.</li>
          <li>Progress: 32px striped bar, 6px pegs every 9px (matches Progress chart Variant A).</li>
          <li>Footer left: category label + paired prev/next arrows (5×5 buttons, stroke-soft ring).</li>
          <li>Footer right: "N products · +X.X%" growth, success-base for the % token.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
