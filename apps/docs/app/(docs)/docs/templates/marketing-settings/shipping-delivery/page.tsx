"use client"

import * as React from "react"
import { RiAddLine as Plus } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
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
  FormRow,
  ToggleRow,
  PreviewFrame,
} from "../_shared"

/**
 * Marketing Settings — Shipping & Delivery. Ported from settings-modal/shipping-delivery/
 *   {index, shipping-methods, delivery-options, shipping-zones}.tsx.
 */

const PROC_TIMES = [
  { v: "same-day", l: "Same day processing" },
  { v: "next-day", l: "Next business day" },
  { v: "1-2-days", l: "1-2 business days" },
  { v: "2-3-days", l: "2-3 business days" },
  { v: "3-5-days", l: "3-5 business days" },
  { v: "5-7-days", l: "5-7 business days" },
  { v: "7-10-days", l: "7-10 business days" },
  { v: "custom", l: "Custom handling time" },
] as const

function ShippingMethodsForm() {
  const methodRow = (label: string, sub: string, price: string, on: boolean) => (
    <div
      className="grid items-center gap-4 sm:gap-5"
      style={{ gridTemplateColumns: "minmax(0, 1fr) 312px" }}
    >
      <div className="flex items-center gap-5">
        <Switch defaultChecked={on} />
        <div>
          <div className="text-sm font-medium text-text-strong-950">{label}</div>
          <div className="mt-1 text-xs text-text-sub-600">{sub}</div>
        </div>
      </div>
      <InputRoot size="md" className="w-[312px]">
        <Input defaultValue={price} />
      </InputRoot>
    </div>
  )
  return (
    <SectionBody>
      {methodRow("Standard Shipping", "3-5 business days", "$29.90", true)}
      <DashedDivider />
      {methodRow("Express Shipping", "1-2 business days", "$49.90", true)}
      <DashedDivider />
      {methodRow("Free Shipping", "For orders above threshold", "$0", false)}
    </SectionBody>
  )
}

function DeliveryOptionsForm() {
  const procSelect = (def: string, placeholder: string) => (
    <Select defaultValue={def}>
      <SelectTrigger size="md" className="w-[256px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {PROC_TIMES.map((p) => (
          <SelectItem key={p.v} value={p.v}>
            {p.l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
  return (
    <SectionBody>
      <FormRow
        rightWidth="256px"
        label="Order Processing Time"
        hint="Set preparation time before shipping"
        control={procSelect("1-2-days", "Select processing time")}
      />
      <DashedDivider />
      <FormRow
        rightWidth="256px"
        label="Estimated Delivery Time"
        hint="Set expected delivery time frame"
        control={procSelect("3-5-days", "Select processing time")}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Order Tracking"
        hint="Enable order tracking for customers"
        control={<Checkbox defaultChecked />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Delivery Updates"
        hint="Send email updates about delivery status"
        control={<Checkbox defaultChecked />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Signature Required"
        hint="Require signature upon delivery"
        control={<Checkbox />}
      />
    </SectionBody>
  )
}

function ShippingZonesForm() {
  const zoneRow = (
    name: string,
    sub: string,
    rate: string,
    statusLabel: string,
    statusKind: "success" | "warning",
  ) => (
    <div className="flex items-center justify-between gap-3.5">
      <div className="flex-1">
        <div className="text-sm font-medium text-text-strong-950">{name}</div>
        <div className="mt-1 text-xs text-text-sub-600">{sub}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge status="neutral" appearance="lighter" size="md">
            Standard: {rate}
          </Badge>
          <Badge status={statusKind} appearance="lighter" size="md">
            {statusLabel}
          </Badge>
        </div>
      </div>
      <Button size="xs" tone="neutral" style="stroke">
        Edit Regions
      </Button>
    </div>
  )
  return (
    <SectionBody>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:gap-6">
        <div>
          <div className="text-sm font-medium text-text-strong-950">Shipping Zones</div>
          <div className="mt-1 text-xs text-text-sub-600">Configure shipping rates by region</div>
        </div>
        <Button
          size="xs"
          tone="primary"
          style="lighter"
          className="rounded-[10px]"
          leftIcon={<Plus />}
        >
          Add Zone
        </Button>
      </div>
      <DashedDivider />
      {zoneRow("Domestic", "Turkey (All regions)", "$29.90", "Active", "success")}
      <DashedDivider />
      {zoneRow("Europe", "European Union Countries", "$29.90", "Active", "success")}
      <DashedDivider />
      {zoneRow("International", "Rest of the World", "$29.90", "Limited", "warning")}
    </SectionBody>
  )
}

function ShippingDeliveryPreview({
  tab,
}: {
  tab: "Shipping Methods" | "Delivery Options" | "Shipping Zones"
}) {
  return (
    <PreviewFrame>
      <SectionHeader
        title="Shipping & Delivery"
        description="Configure your shipping and delivery settings"
      />
      <SubTabs current={tab} tabs={["Shipping Methods", "Delivery Options", "Shipping Zones"]} />
      {tab === "Shipping Methods" ? <ShippingMethodsForm /> : null}
      {tab === "Delivery Options" ? <DeliveryOptionsForm /> : null}
      {tab === "Shipping Zones" ? <ShippingZonesForm /> : null}
    </PreviewFrame>
  )
}

export default function MarketingSettingsShippingDeliveryPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Settings"
        title="Shipping & Delivery"
        description="Method rate inputs, delivery timing selects, and shipping zone rows with status badges. Three sub-tabs."
      />

      <DocsSection title="Shipping Methods">
        <DocsExample
          title="Enable / disable + price"
          description="Three method rows. Each: Switch + label/hint + editable price Input (312px). Standard $29.90, Express $49.90, Free $0 (off by default)."
          preview={<ShippingDeliveryPreview tab="Shipping Methods" />}
          code={`<div className="grid grid-cols-[minmax(0,1fr),312px]">
  <div className="flex items-center gap-5">
    <Switch defaultChecked />
    <div>
      <div>Standard Shipping</div>
      <div className="text-xs text-text-sub-600">3-5 business days</div>
    </div>
  </div>
  <InputRoot><Input defaultValue="$29.90" /></InputRoot>
</div>
{/* Express Shipping · 1-2 business days · $49.90 (on) */}
{/* Free Shipping · For orders above threshold · $0 (off) */}`}
        />
      </DocsSection>

      <DocsSection title="Delivery Options">
        <DocsExample
          title="Processing / delivery time + checkboxes"
          description="Two processing-time selects (8 options each) — defaults 1-2 days and 3-5 days — plus 3 checkboxes (Order Tracking, Delivery Updates, Signature Required)."
          preview={<ShippingDeliveryPreview tab="Delivery Options" />}
          code={`<FormRow label="Order Processing Time" hint="Set preparation time before shipping" rightWidth="256px"
  control={<Select defaultValue="1-2-days">{/* Same day / Next business day / 1-2 / 2-3 / 3-5 / 5-7 / 7-10 / Custom */}</Select>} />
<FormRow label="Estimated Delivery Time" hint="Set expected delivery time frame" rightWidth="256px"
  control={<Select defaultValue="3-5-days">{/* same options */}</Select>} />
<ToggleRow swap label="Order Tracking" hint="Enable order tracking for customers" control={<Checkbox defaultChecked />} />
<ToggleRow swap label="Delivery Updates" hint="Send email updates about delivery status" control={<Checkbox defaultChecked />} />
<ToggleRow swap label="Signature Required" hint="Require signature upon delivery" control={<Checkbox />} />`}
        />
      </DocsSection>

      <DocsSection title="Shipping Zones">
        <DocsExample
          title="Zones + Edit Regions"
          description="Header with 'Add Zone' filled lighter primary button. 3 zone rows (Domestic, Europe, International) each with rate + status badges + Edit Regions button."
          preview={<ShippingDeliveryPreview tab="Shipping Zones" />}
          code={`<Button size="xs" tone="primary" style="lighter" leftIcon={<Plus />}>Add Zone</Button>

<div className="flex justify-between">
  <div>
    <div>Domestic</div>
    <div className="text-xs text-text-sub-600">Turkey (All regions)</div>
    <Badge status="neutral" appearance="lighter">Standard: $29.90</Badge>
    <Badge status="success" appearance="lighter">Active</Badge>
  </div>
  <Button size="xs" tone="neutral" style="stroke">Edit Regions</Button>
</div>
{/* Europe — Active green */}
{/* International — Limited orange/warning */}`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
