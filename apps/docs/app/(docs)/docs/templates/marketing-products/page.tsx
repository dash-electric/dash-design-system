"use client"

import * as React from "react"
import {
  RiShoppingBag2Line,
  RiSearch2Line,
  RiArrowDownSLine,
  RiArrowRightUpLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFilter3Line,
  RiLayoutGridLine,
  RiListUnordered,
  RiMore2Line,
  RiAddLine,
  RiCloseLine,
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
  FakeButton,
  SparkLine,
} from "../marketing-dashboard/page"

/**
 * Marketing Products. Ported from AlignUI Marketing template
 * (`app/(main)/products/page.tsx` + summary.tsx + filters.tsx + list.tsx +
 * product-card.tsx + product-card-slider.tsx + data.tsx). Header + summary +
 * grid/list toolbar + 12-product masonry grid (8 unique products from
 * data.tsx + 4 duplicates), with one card shown in its expanded edit state.
 */
export default function MarketingProductsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing"
        title="Marketing products"
        description="Catalyst Products page — KPI summary (248 / 186 / 8,944 / $8,944), search + view toggle + sort toolbar, and a masonry product card grid with collapsed and expanded (Sales/Views/Stock toggle + sparkline + Edit) states using actual product data verbatim from data.tsx."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Products page — masonry grid"
          description="Cards: Apple Watch S5 GPS 40mm White / MacBook Pro M1 256GB Silver / iMac M1 24-inch Purple / AirPods Max Green / HomePod Mini Orange / iPad Pro 12.9-inch with M2 chip / Apple Studio Display Standard Glass / Apple AirPods Pro 2nd Gen. First card expanded showing Price $948.00 · Stock 48 units · Sales sparkline + Edit Product CTA."
          preview={
            <DocsTemplatePreview padding="">
              <ProductsPreview />
            </DocsTemplatePreview>
          }
          code={`<MarketingProducts title="My Products" description="Manage and collaborate on your product listings." products={[/* Product[] */]} />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><b>Header</b> — Shopping bag icon disc + “My Products” + subtitle + New Product CTA.</li>
          <li><b>Summary</b> — 4 KPI tiles: Total Products 248 (+12 this week), Active Listings 186 (+2% of total), Total Sales 8,944 (+2.1% this week), Total Revenue $8,944 (-0.5% vs last week).</li>
          <li><b>Toolbar</b> — Search products… input + Grid/List RadioGroup + Last 7 days + Newest + Filter.</li>
          <li><b>Product card</b> — collapsed (258px): gradient bg-weak-50 + image slider + title + category + chevron. Expanded (540px): inner white card with Price/Stock + Sales/Views/Stock SegmentedControl + sparkline + Edit Product button.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>InputRoot / Input / InputIcon — Search.</li>
          <li>RadioGroup — Grid/List view toggle.</li>
          <li>CompactButton — card top-right more menu.</li>
          <li>SegmentedControl — Sales / Views / Stock inside expanded card.</li>
          <li>Button — Edit Product CTA.</li>
          <li>Drawer — edit-product-drawer (out of frame, triggered by More menu).</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "products", type: "ProductData[]", description: "{ images: string[], title, category }." },
            { name: "viewType", type: "'grid' | 'list'", description: "Default 'grid'. Toggled via radio toolbar." },
            { name: "expandedId", type: "string | null", description: "Card expansion state — only one card expanded at a time (or many independently in source impl)." },
            { name: "activeTab", type: "'sales' | 'views' | 'stock'", description: "Chart selector inside expanded card. Default 'sales'." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

const PRODUCTS: Array<{ title: string; category: string; expanded?: boolean }> = [
  { title: "Apple Watch S5 GPS 40mm White", category: "Technologhy", expanded: true },
  { title: "MacBook Pro M1 256GB Silver", category: "Technologhy" },
  { title: "iMac M1 24-inch Purple", category: "Technologhy" },
  { title: "AirPods Max Green", category: "Technologhy" },
  { title: "HomePod Mini Orange", category: "Technologhy" },
  { title: "iPad Pro 12.9-inch with M2 chip", category: "Technologhy" },
  { title: "Apple Studio Display Standard Glass", category: "Technologhy" },
  { title: "Apple AirPods Pro 2nd Gen", category: "Technologhy" },
  // duplicates (per source data.tsx)
  { title: "Apple Watch S5 GPS 40mm White", category: "Technologhy" },
  { title: "MacBook Pro M1 256GB Silver", category: "Technologhy" },
  { title: "iMac M1 24-inch Purple", category: "Technologhy" },
  { title: "AirPods Max Green", category: "Technologhy" },
]

function ProductsPreview() {
  return (
    <div className="flex min-h-[1400px] bg-bg-weak-50">
      <Sidebar activeHref="/products" />
      <div className="flex-1 self-stretch bg-bg-white-0">
        <PageHeader
          icon={
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
              <RiShoppingBag2Line className="size-6" />
            </span>
          }
          title="My Products"
          description="Manage and collaborate on your product listings."
          actions={<FakeButton tone="primary"><RiAddLine className="size-4" /> New Product</FakeButton>}
        />

        <div className="px-8 pb-6">
          <DashedDivider />

          <div className="grid grid-cols-4 divide-x divide-stroke-soft-200 py-6">
            <Tile label="Total Products" value="248" delta="+12" suffix="this week" up />
            <Tile label="Active Listings" value="186" delta="+2%" suffix="of total" up />
            <Tile label="Total Sales" value="8,944" delta="+2.1%" suffix="this week" up />
            <Tile label="Total Revenue" value="$8,944" delta="-0.5%" suffix="vs last week" />
          </div>

          <DashedDivider />

          <ProductsToolbar />

          <div className="grid grid-cols-4 gap-6 items-start">
            {PRODUCTS.map((p, i) => (p.expanded ? <ExpandedCard key={i} title={p.title} category={p.category} /> : <CollapsedCard key={i} title={p.title} category={p.category} />))}
          </div>

          {/* Edit drawer rendered inline at far right as overlay-style panel */}
          <div className="mt-10">
            <DashedDivider />
            <div className="mt-6 grid grid-cols-[1fr_400px] gap-6">
              <div className="rounded-2xl border border-dashed border-stroke-soft-200 p-6 text-sm text-text-soft-400">
                Catalog area — edit drawer renders as a right-side sheet over the products grid (shown to the right for documentation purposes).
              </div>
              <EditProductPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Tile({ label, value, delta, suffix, up }: { label: string; value: string; delta?: string; suffix: string; up?: boolean }) {
  return (
    <div className="px-7 first:pl-0 last:pr-0">
      <div className="text-xs text-text-sub-600">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <div className="text-xl font-semibold tracking-tight text-text-strong-950">{value}</div>
        <div className="text-[11px] text-text-sub-600">
          {delta ? <span className={up ? "text-success-base" : "text-error-base"}>{delta}</span> : null} {suffix}
        </div>
      </div>
    </div>
  )
}

function ProductsToolbar() {
  return (
    <div className="flex gap-3 py-6">
      <div className="inline-flex h-9 flex-1 items-center gap-2 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-2.5 shadow-regular-xs">
        <RiSearch2Line className="size-4 text-text-soft-400" />
        <input type="text" placeholder="Search products..." className="w-full bg-transparent text-sm text-text-strong-950 placeholder:text-text-soft-400 outline-none" />
      </div>
      <div className="flex h-9 items-center rounded-[10px] bg-bg-white-0 px-0.5 ring-1 ring-inset ring-stroke-soft-200">
        <button type="button" className="inline-flex h-7 items-center px-2 text-primary"><RiLayoutGridLine className="size-5" /></button>
        <span className="h-4 w-px bg-stroke-soft-200" />
        <button type="button" className="inline-flex h-7 items-center px-2 text-text-sub-600"><RiListUnordered className="size-5" /></button>
      </div>
      <FakeButton>Last 7 days <RiArrowDownSLine className="size-4" /></FakeButton>
      <FakeButton>Newest <RiArrowDownSLine className="size-4" /></FakeButton>
      <FakeButton><RiFilter3Line className="size-4" /> Filter</FakeButton>
    </div>
  )
}

function CollapsedCard({ title, category }: { title: string; category: string }) {
  return (
    <div className="relative flex h-[258px] flex-col overflow-hidden rounded-2xl bg-bg-weak-50 pt-8">
      <button type="button" className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-md text-text-soft-400 hover:bg-bg-soft-200 hover:text-text-strong-950">
        <RiMore2Line className="size-4" />
      </button>
      <ProductImage />
      <div className="mt-auto px-4 pb-4 pt-0">
        <div className="flex items-center gap-4">
          <div className="flex-1 truncate text-sm font-medium text-text-strong-950">{title}</div>
          <RiArrowDownSLine className="size-[18px] shrink-0 text-text-soft-400" />
        </div>
        <p className="mt-1 text-[11px] text-text-sub-600">{category}</p>
      </div>
    </div>
  )
}

function ExpandedCard({ title, category }: { title: string; category: string }) {
  return (
    <div
      className="relative flex h-[540px] flex-col overflow-hidden rounded-2xl bg-bg-weak-50 pt-8"
      style={{ transitionTimingFunction: "cubic-bezier(.6,.6,0,1)" }}
    >
      <button type="button" className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-md text-text-soft-400 hover:bg-bg-soft-200 hover:text-text-strong-950">
        <RiMore2Line className="size-4" />
      </button>
      <ProductImage />
      <div className="mt-auto p-1.5">
        <div className="w-full overflow-hidden rounded-xl bg-bg-white-0 p-4 shadow-regular-xs">
          <div className="flex items-center gap-4">
            <div className="flex-1 truncate text-sm font-medium text-text-strong-950">{title}</div>
            <RiArrowDownSLine className="size-[18px] shrink-0 -rotate-180 text-text-sub-600" />
          </div>
          <p className="mt-1 text-[11px] text-text-sub-600">{category}</p>

          <div className="my-4"><DashedDivider /></div>

          <div className="flex gap-8">
            <div>
              <div className="text-[11px] text-text-soft-400">Price</div>
              <div className="mt-1 text-sm font-medium text-text-sub-600">$948.00</div>
            </div>
            <div>
              <div className="text-[11px] text-text-soft-400">Stock</div>
              <div className="mt-1 flex items-center gap-0.5 text-sm font-medium text-text-sub-600">
                48 units
                <RiArrowRightUpLine className="size-4 text-success-base" />
              </div>
            </div>
          </div>

          <div className="my-4"><DashedDivider /></div>

          <div className="grid grid-cols-3 gap-2">
            <span className="flex h-6 items-center justify-center rounded-md bg-(--primary-alpha-10) text-[11px] font-medium text-primary">Sales</span>
            <span className="flex h-6 items-center justify-center rounded-md text-[11px] font-medium text-text-sub-600">Views</span>
            <span className="flex h-6 items-center justify-center rounded-md text-[11px] font-medium text-text-sub-600">Stock</span>
          </div>

          <div className="my-4 h-[84px]">
            <SparkLine />
          </div>

          <FakeButton>Edit Product</FakeButton>
        </div>
      </div>
    </div>
  )
}

function ProductImage() {
  return (
    <div className="flex h-[150px] items-center justify-center px-6">
      <div className="size-28 rounded-2xl bg-gradient-to-br from-bg-soft-200 to-bg-weak-50 shadow-inner" />
    </div>
  )
}

function EditProductPanel() {
  return (
    <aside className="flex h-fit flex-col self-start rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
      <header className="flex items-start gap-3 p-5">
        <div className="flex-1">
          <div className="text-base font-semibold text-text-strong-950">Edit Product</div>
          <div className="mt-1 text-sm text-text-sub-600">Apple Watch S5 GPS 40mm White</div>
        </div>
        <button type="button" className="inline-flex size-7 items-center justify-center rounded-md text-text-sub-600 hover:bg-bg-weak-50">
          <RiCloseLine className="size-4" />
        </button>
      </header>

      <div className="space-y-4 px-5 pb-5">
        <div>
          <div className="text-xs font-medium text-text-strong-950">Product name</div>
          <div className="mt-1.5 inline-flex h-9 w-full items-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 text-sm text-text-strong-950 shadow-regular-xs">
            Apple Watch S5 GPS 40mm White
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-medium text-text-strong-950">Price</div>
            <div className="mt-1.5 inline-flex h-9 w-full items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 text-sm shadow-regular-xs">
              <span className="text-text-soft-400">$</span>
              <span className="text-text-strong-950">948.00</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-text-strong-950">Stock</div>
            <div className="mt-1.5 inline-flex h-9 w-full items-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 text-sm text-text-strong-950 shadow-regular-xs">
              48
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-text-strong-950">Category</div>
          <div className="mt-1.5 inline-flex h-9 w-full items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 text-sm text-text-strong-950 shadow-regular-xs">
            Technology
            <RiArrowDownSLine className="size-4 text-text-soft-400" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-text-strong-950">Active</div>
            <span className="inline-flex h-5 w-9 items-center rounded-full bg-success-base px-0.5">
              <span className="ml-auto size-4 rounded-full bg-bg-white-0" />
            </span>
          </div>
          <div className="mt-1 text-[11px] text-text-sub-600">Visible in storefront and search.</div>
        </div>

        <DashedDivider />

        <div className="grid grid-cols-3 gap-2">
          <span className="flex h-7 items-center justify-center rounded-md bg-(--primary-alpha-10) text-xs font-medium text-primary">Sales</span>
          <span className="flex h-7 items-center justify-center rounded-md text-xs font-medium text-text-sub-600">Views</span>
          <span className="flex h-7 items-center justify-center rounded-md text-xs font-medium text-text-sub-600">Stock</span>
        </div>

        <div className="h-24"><SparkLine /></div>

        <div className="flex justify-between text-[10px] uppercase tracking-wider text-text-soft-400">
          <span><RiArrowLeftSLine className="size-3 inline" /> Prev product</span>
          <span>Next product <RiArrowRightSLine className="size-3 inline" /></span>
        </div>
      </div>

      <div className="mt-auto border-t border-stroke-soft-200">
        <div className="grid grid-cols-2 gap-4 p-5">
          <FakeButton>Cancel</FakeButton>
          <FakeButton tone="primary">Save Changes</FakeButton>
        </div>
      </div>
    </aside>
  )
}

function DashedDivider() {
  return (
    <svg width="100%" height="1" aria-hidden>
      <line x1="0" y1="0.5" x2="100%" y2="0.5" strokeDasharray="4 4" stroke="var(--stroke-soft-200)" />
    </svg>
  )
}
