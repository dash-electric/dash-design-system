"use client"

import * as React from "react"
import { RiArrowDownSLine as ChevronDown } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { Switch } from "@/registry/dash/ui/switch"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import {
  SectionHeader,
  SubTabs,
  SectionBody,
  DashedDivider,
  ToggleRow,
  PreviewFrame,
} from "../_shared"

/**
 * Marketing Settings — Product Settings. Ported from settings-modal/product-settings/
 *   {index, default, categories, inventory}.tsx.
 */

const QTY = ["0", "10", "50", "100"] as const

const QtySelect = ({ value }: { value: string }) => (
  <Select defaultValue={value}>
    <SelectTrigger size="sm" className="w-auto rounded-[10px] border-stroke-soft-200 px-2.5">
      <SelectValue />
      <ChevronDown className="size-4 text-icon-soft-400" />
    </SelectTrigger>
    <SelectContent>
      {QTY.map((q) => (
        <SelectItem key={q} value={q}>
          {q} quantity
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const STATUS = [
  { v: "active", label: "Active" },
  { v: "draft", label: "Draft" },
  { v: "hidden", label: "Hidden" },
  { v: "archived", label: "Archived" },
  { v: "scheduled", label: "Scheduled" },
] as const

const StatusSelect = () => (
  <Select defaultValue="active">
    <SelectTrigger size="sm" className="w-auto rounded-[10px] border-stroke-soft-200 px-2.5">
      <SelectValue />
      <ChevronDown className="size-4 text-icon-soft-400" />
    </SelectTrigger>
    <SelectContent>
      {STATUS.map((s) => (
        <SelectItem key={s.v} value={s.v}>
          {s.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

function DefaultForm() {
  return (
    <SectionBody>
      <ToggleRow
        swap
        label="Track Inventory"
        hint="Enable inventory tracking for all products"
        control={<Switch defaultChecked />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Show Out of Stock Products"
        hint="Display products with zero inventory on your store"
        control={<Switch defaultChecked />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Show Compare at Price"
        hint="Enable price comparison display for discounted products"
        control={<Switch defaultChecked />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Default Stock Threshold"
        hint="Set minimum stock level for inventory alerts"
        control={<QtySelect value="10" />}
      />
    </SectionBody>
  )
}

function CategoriesForm() {
  return (
    <SectionBody>
      <ToggleRow
        swap
        label="Electronics"
        hint="Electronic devices, gadgets and accessories"
        control={<StatusSelect />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Clothing"
        hint="Fashion items and accessories"
        control={<StatusSelect />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Home & Garden"
        hint="Home decoration and garden supplies"
        control={<StatusSelect />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Show Category Description"
        hint="Show descriptions in category listings"
        control={<Switch defaultChecked />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Show Product Count"
        hint="Show number of items in categories"
        control={<Switch defaultChecked />}
      />
      <DashedDivider />
    </SectionBody>
  )
}

function InventoryForm() {
  return (
    <SectionBody>
      <ToggleRow
        swap
        label="Low Stock Alert"
        hint="Set threshold for low inventory notifications"
        control={<QtySelect value="10" />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Out of Stock Alert"
        hint="Set alert when products become unavailable"
        control={<QtySelect value="0" />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Allow Backorders"
        hint="Enable ordering for out of stock products"
        control={<Checkbox defaultChecked />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Auto Update Stock"
        hint="Enable automatic inventory adjustments"
        control={<Checkbox defaultChecked />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Show Stock Quantity"
        hint="Display available inventory on products"
        control={<Checkbox />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Show Out of Stock Badge"
        hint="Display unavailable product indicators"
        control={<Checkbox />}
      />
    </SectionBody>
  )
}

function ProductPreview({ tab }: { tab: "Default" | "Categories" | "Inventory" }) {
  return (
    <PreviewFrame>
      <SectionHeader
        title="Product Settings"
        description="Manage your product display and inventory settings"
      />
      <SubTabs current={tab} tabs={["Default", "Categories", "Inventory"]} />
      {tab === "Default" ? <DefaultForm /> : null}
      {tab === "Categories" ? <CategoriesForm /> : null}
      {tab === "Inventory" ? <InventoryForm /> : null}
    </PreviewFrame>
  )
}

export default function MarketingSettingsProductPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Settings"
        title="Product"
        description="Default product display, category status, and inventory rules. Three sub-tabs."
      />

      <DocsSection title="Default">
        <DocsExample
          title="Inventory + display toggles"
          description="Three Switches — Track Inventory, Show Out of Stock Products, Show Compare at Price — plus Default Stock Threshold quantity select (0/10/50/100)."
          preview={<ProductPreview tab="Default" />}
          code={`<ToggleRow swap label="Track Inventory" hint="Enable inventory tracking for all products" control={<Switch defaultChecked />} />
<ToggleRow swap label="Show Out of Stock Products" hint="Display products with zero inventory on your store" control={<Switch defaultChecked />} />
<ToggleRow swap label="Show Compare at Price" hint="Enable price comparison display for discounted products" control={<Switch defaultChecked />} />
<ToggleRow swap label="Default Stock Threshold" hint="Set minimum stock level for inventory alerts"
  control={<Select defaultValue="10">...{[0,10,50,100]} quantity</Select>} />`}
        />
      </DocsSection>

      <DocsSection title="Categories">
        <DocsExample
          title="Category status + display"
          description="3 category rows (Electronics, Clothing, Home & Garden) with status select (Active / Draft / Hidden / Archived / Scheduled) + 2 display Switches."
          preview={<ProductPreview tab="Categories" />}
          code={`<ToggleRow swap label="Electronics" hint="Electronic devices, gadgets and accessories"
  control={<Select defaultValue="active">...</Select>} />
<ToggleRow swap label="Clothing" hint="Fashion items and accessories"
  control={<StatusSelect />} />
<ToggleRow swap label="Home & Garden" hint="Home decoration and garden supplies"
  control={<StatusSelect />} />
<ToggleRow swap label="Show Category Description" hint="Show descriptions in category listings" control={<Switch defaultChecked />} />
<ToggleRow swap label="Show Product Count" hint="Show number of items in categories" control={<Switch defaultChecked />} />`}
        />
      </DocsSection>

      <DocsSection title="Inventory">
        <DocsExample
          title="Stock thresholds + restock rules"
          description="2 quantity selects (Low Stock Alert / Out of Stock Alert) + 4 checkboxes (Allow Backorders, Auto Update Stock, Show Stock Quantity, Show Out of Stock Badge)."
          preview={<ProductPreview tab="Inventory" />}
          code={`<ToggleRow swap label="Low Stock Alert" hint="Set threshold for low inventory notifications"
  control={<QtySelect value="10" />} />
<ToggleRow swap label="Out of Stock Alert" hint="Set alert when products become unavailable"
  control={<QtySelect value="0" />} />
<ToggleRow swap label="Allow Backorders" hint="Enable ordering for out of stock products" control={<Checkbox defaultChecked />} />
<ToggleRow swap label="Auto Update Stock" hint="Enable automatic inventory adjustments" control={<Checkbox defaultChecked />} />
<ToggleRow swap label="Show Stock Quantity" hint="Display available inventory on products" control={<Checkbox />} />
<ToggleRow swap label="Show Out of Stock Badge" hint="Display unavailable product indicators" control={<Checkbox />} />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
