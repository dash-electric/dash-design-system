"use client"

import { ProductsGrid } from "@/registry/dash/blocks/products-grid"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ProductsGridDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Lists"
        title="Products Grid"
        description="Card-grid for browsable resource collections — dispatch pools, tribe initiatives, campaign templates. Each card is hero + meta + price/state + overflow menu."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add products-grid`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Dispatch pools — by region"
          description="6 cards: Jakarta Express / Bekasi Reservasi / Surabaya Bulk / Bandung Express / Tangerang Reservasi / Medan Bulk."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <ProductsGrid />
            </div>
          }
          code={`<ProductsGrid pools={[/* DispatchPool[] */]} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Each card uses <code>Card</code> + <code>CardContent</code> with custom hero swatch on top.</li>
          <li>Hero shows <code>Package</code> icon over Dash gradient.</li>
          <li>Body — name + region + active mitra count + status <code>Badge</code>.</li>
          <li>Footer — primary <code>Button</code> + <code>IconButton</code> overflow menu.</li>
          <li>Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> for resource browse with strong visual identity per item.</li>
          <li><strong>Use</strong> for dispatch pool selection, campaign templates, initiative gallery.</li>
          <li><strong>Don't</strong> use for dense data review — reach for <code>OrdersTable</code> instead.</li>
          <li><strong>Don't</strong> use when you have 50+ items — paginate or filter first.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "pools", type: "DispatchPool[]", description: "{ id, name, region, tribe, activeMitra, status }." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
      <DocsSection title="Price + status pairing">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Each product card shows price prominently and a stock/availability badge. Don't leave the user guessing whether 'Lili Mineral Water 600ml' is in stock.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 space-y-1"><div className="aspect-square rounded-md bg-bg-weak-50" /><p className="text-xs font-medium">Lili 600ml</p><p className="text-xs text-text-strong-950 font-semibold">Rp 4.500</p><span className="inline-block rounded-full bg-success-lighter text-success-dark px-2 py-0.5 text-[9px]">Stok 124</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 space-y-1"><div className="aspect-square rounded-md bg-bg-weak-50" /><p className="text-xs font-medium">Spun coffee</p><p className="text-xs text-text-strong-950 font-semibold">Rp 28.000</p><span className="inline-block rounded-full bg-warning-lighter text-warning-dark px-2 py-0.5 text-[9px]">Stok 4</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 space-y-1"><div className="aspect-square rounded-md bg-bg-weak-50" /><p className="text-xs font-medium">Chagee tea</p><p className="text-xs text-text-strong-950 font-semibold">Rp 35.000</p><span className="inline-block rounded-full bg-error-lighter text-error-dark px-2 py-0.5 text-[9px]">Habis</span></div>
              </div>
            ),
            caption: "Price + stock state on every card. Ops can scan the grid and spot what's out of stock without clicking.",
          }}
          dont={{
            preview: (
              <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 space-y-1"><div className="aspect-square rounded-md bg-bg-weak-50" /><p className="text-xs font-medium">Lili 600ml</p></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 space-y-1"><div className="aspect-square rounded-md bg-bg-weak-50" /><p className="text-xs font-medium">Spun coffee</p></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 space-y-1"><div className="aspect-square rounded-md bg-bg-weak-50" /><p className="text-xs font-medium">Chagee tea</p></div>
              </div>
            ),
            caption: "Don't show product name alone. Reader needs price for decision and stock state for action.",
          }}
        />
      </DocsSection>

      <DocsSection title="Image aspect ratio consistency">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          All product images render at the same aspect ratio. Mixed 1:1, 4:3, and 16:9 inside one grid creates visual chaos.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                <div className="rounded-lg bg-bg-weak-50 aspect-square" />
                <div className="rounded-lg bg-bg-weak-50 aspect-square" />
                <div className="rounded-lg bg-bg-weak-50 aspect-square" />
              </div>
            ),
            caption: "Uniform 1:1 thumbnails. Grid rows align, product names sit at the same Y position, scan is clean.",
          }}
          dont={{
            preview: (
              <div className="grid grid-cols-3 gap-2 w-full max-w-md items-end">
                <div className="rounded-lg bg-bg-weak-50 aspect-square" />
                <div className="rounded-lg bg-bg-weak-50 aspect-[4/3]" />
                <div className="rounded-lg bg-bg-weak-50 aspect-[16/9]" />
              </div>
            ),
            caption: "Don't mix aspect ratios across product cards. Names hop around vertically and the grid feels broken.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
