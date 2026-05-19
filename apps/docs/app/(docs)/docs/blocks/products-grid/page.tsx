"use client"

import { ProductsGrid } from "@/registry/dash/blocks/products-grid"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Each card uses <code>Card</code> + <code>CardContent</code> with custom hero swatch on top.</li>
          <li>Hero shows <code>Package</code> icon over Dash gradient.</li>
          <li>Body — name + region + active mitra count + status <code>Badge</code>.</li>
          <li>Footer — primary <code>Button</code> + <code>IconButton</code> overflow menu.</li>
          <li>Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
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
    </DocsPageShell>
  )
}
