"use client"

import * as React from "react"
import {
  RiAddLine as Plus,
  RiBankCardLine as Card,
  RiBankLine as Bank,
  RiArrowDownSLine as ChevronDown,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
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
 * Marketing Settings — Payment & Billing. Ported from settings-modal/payment-billing/
 *   {index, payment-method, currency-settings, tax-settings}.tsx.
 */

function PaymentMethodForm() {
  return (
    <SectionBody>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:gap-6">
        <div>
          <div className="text-sm font-medium text-text-strong-950">Payment Methods</div>
          <div className="mt-1 text-xs text-text-sub-600">Configure available payment options</div>
        </div>
        <Button size="xs" tone="primary" style="lighter" className="rounded-[10px]" leftIcon={<Plus />}>
          Add Payment Method
        </Button>
      </div>
      <DashedDivider />
      <label className="flex cursor-pointer items-center justify-between gap-3.5">
        <div className="flex flex-1 items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-stroke-soft-200">
            <Card className="size-5 text-text-sub-600" />
          </span>
          <div className="flex-1">
            <div className="text-sm font-medium text-text-strong-950">Credit Card</div>
            <div className="mt-1 text-xs text-text-sub-600">Accept Visa, Mastercard, American Express</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge status="neutral" appearance="lighter" size="md">2.9% + €0.30</Badge>
              <Badge status="success" appearance="lighter" size="md">Active</Badge>
            </div>
          </div>
        </div>
        <Switch defaultChecked />
      </label>
      <DashedDivider />
      <label className="flex cursor-pointer items-center justify-between gap-3.5">
        <div className="flex flex-1 items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-stroke-soft-200">
            <Bank className="size-5 text-text-sub-600" />
          </span>
          <div className="flex-1">
            <div className="text-sm font-medium text-text-strong-950">Bank Transfer</div>
            <div className="mt-1 text-xs text-text-sub-600">Manual bank transfer payments</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge status="neutral" appearance="lighter" size="md">No fee</Badge>
              <Badge status="success" appearance="lighter" size="md">Active</Badge>
            </div>
          </div>
        </div>
        <Switch defaultChecked />
      </label>
    </SectionBody>
  )
}

function CurrencySettingsForm() {
  return (
    <SectionBody>
      <FormRow
        rightWidth="256px"
        label="Store Currency"
        hint="Set your store's primary currency"
        control={
          <Select defaultValue="usd">
            <SelectTrigger size="md" className="w-[256px]">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">US Dollar (USD)</SelectItem>
              <SelectItem value="eur">Euro (EUR)</SelectItem>
              <SelectItem value="gbp">British Pound (GBP)</SelectItem>
              <SelectItem value="jpy">Japanese Yen (JPY)</SelectItem>
              <SelectItem value="aud">Australian Dollar (AUD)</SelectItem>
              <SelectItem value="cad">Canadian Dollar (CAD)</SelectItem>
              <SelectItem value="chf">Swiss Franc (CHF)</SelectItem>
              <SelectItem value="cny">Chinese Yuan (CNY)</SelectItem>
              <SelectItem value="inr">Indian Rupee (INR)</SelectItem>
              <SelectItem value="sgd">Singapore Dollar (SGD)</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <DashedDivider />
      <FormRow
        rightWidth="256px"
        label="Currency Format"
        hint="Choose how currency values are displayed"
        control={
          <Select defaultValue="symbol-before-space">
            <SelectTrigger size="md" className="w-[256px]">
              <SelectValue placeholder="Select currency format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="symbol-before">$1,234.56</SelectItem>
              <SelectItem value="symbol-before-space">$ 1,234.56</SelectItem>
              <SelectItem value="symbol-after">1,234.56 $</SelectItem>
              <SelectItem value="code-before">USD 1,234.56</SelectItem>
              <SelectItem value="code-after">1,234.56 USD</SelectItem>
              <SelectItem value="european-comma">1.234,56 €</SelectItem>
              <SelectItem value="european-space">1 234,56 €</SelectItem>
              <SelectItem value="indian">₹ 1,23,456.00</SelectItem>
              <SelectItem value="japanese">¥1,234</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </SectionBody>
  )
}

function TaxSettingsForm() {
  return (
    <SectionBody>
      <ToggleRow
        swap
        label="Tax Rate"
        hint="Set default tax rate for all products"
        control={
          <Select defaultValue="18">
            <SelectTrigger size="sm" className="w-auto rounded-[10px] border-stroke-soft-200 px-2.5">
              <SelectValue />
              <ChevronDown className="size-4 text-icon-soft-400" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0%</SelectItem>
              <SelectItem value="5">5%</SelectItem>
              <SelectItem value="8">8%</SelectItem>
              <SelectItem value="10">10%</SelectItem>
              <SelectItem value="13">13%</SelectItem>
              <SelectItem value="15">15%</SelectItem>
              <SelectItem value="18">18%</SelectItem>
              <SelectItem value="20">20%</SelectItem>
              <SelectItem value="25">25%</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Include Tax in Prices"
        hint="Show product prices with tax included"
        control={<Checkbox defaultChecked />}
      />
      <DashedDivider />
      <ToggleRow
        swap
        label="Show Tax Details"
        hint="Display tax breakdown in cart"
        control={<Checkbox defaultChecked />}
      />
    </SectionBody>
  )
}

function PaymentBillingPreview({
  tab,
}: {
  tab: "Payment Method" | "Currency Settings" | "Tax Settings"
}) {
  return (
    <PreviewFrame>
      <SectionHeader
        title="Payment & Billing"
        description="Configure your payment methods and billing preferences"
      />
      <SubTabs current={tab} tabs={["Payment Method", "Currency Settings", "Tax Settings"]} />
      {tab === "Payment Method" ? <PaymentMethodForm /> : null}
      {tab === "Currency Settings" ? <CurrencySettingsForm /> : null}
      {tab === "Tax Settings" ? <TaxSettingsForm /> : null}
    </PreviewFrame>
  )
}

export default function MarketingSettingsPaymentBillingPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Settings"
        title="Payment & Billing"
        description="Payment methods, currency display format, and tax rate. Three sub-tabs."
      />

      <DocsSection title="Payment Method">
        <DocsExample
          title="Payment methods + fee badges"
          description="Header with 'Add Payment Method' filled lighter primary button, then 2 method rows. Each shows icon in 40px ring circle, label, hint, fee + status badges, trailing Switch."
          preview={<PaymentBillingPreview tab="Payment Method" />}
          code={`<div className="flex justify-between">
  <div>
    <div className="text-sm font-medium">Payment Methods</div>
    <div className="text-xs text-text-sub-600">Configure available payment options</div>
  </div>
  <Button size="xs" tone="primary" style="lighter" leftIcon={<Plus />}>Add Payment Method</Button>
</div>

<label>
  <Card className="size-5" />
  <div>
    <div>Credit Card</div>
    <div className="text-xs text-text-sub-600">Accept Visa, Mastercard, American Express</div>
    <Badge status="neutral" appearance="lighter">2.9% + €0.30</Badge>
    <Badge status="success" appearance="lighter">Active</Badge>
  </div>
  <Switch defaultChecked />
</label>

{/* Bank Transfer · No fee · Active */}`}
        />
      </DocsSection>

      <DocsSection title="Currency Settings">
        <DocsExample
          title="Store currency + display format"
          description="Two selects — Store Currency (10 options) and Currency Format (9 display shapes: symbol/code position, European comma, Indian, Japanese)."
          preview={<PaymentBillingPreview tab="Currency Settings" />}
          code={`<FormRow label="Store Currency" hint="Set your store's primary currency" rightWidth="256px"
  control={
    <Select defaultValue="usd">
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="usd">US Dollar (USD)</SelectItem>
        {/* EUR GBP JPY AUD CAD CHF CNY INR SGD */}
      </SelectContent>
    </Select>
  }
/>
<FormRow label="Currency Format" hint="Choose how currency values are displayed" rightWidth="256px"
  control={
    <Select defaultValue="symbol-before-space">
      {/* $1,234.56 · $ 1,234.56 · 1,234.56 $ · USD 1,234.56 · 1,234.56 USD · 1.234,56 € · 1 234,56 € · ₹ 1,23,456.00 · ¥1,234 */}
    </Select>
  }
/>`}
        />
      </DocsSection>

      <DocsSection title="Tax Settings">
        <DocsExample
          title="Tax rate + tax display options"
          description="Tax Rate select (button-trigger style, 9 percentages 0-25%) + 2 checkboxes — Include Tax in Prices, Show Tax Details."
          preview={<PaymentBillingPreview tab="Tax Settings" />}
          code={`<ToggleRow swap label="Tax Rate" hint="Set default tax rate for all products"
  control={
    <Select defaultValue="18">
      <SelectTrigger size="sm" className="rounded-[10px]"><SelectValue /><ChevronDown /></SelectTrigger>
      <SelectContent>
        {[0, 5, 8, 10, 13, 15, 18, 20, 25].map(v => <SelectItem value={String(v)}>{v}%</SelectItem>)}
      </SelectContent>
    </Select>
  } />
<ToggleRow swap label="Include Tax in Prices" hint="Show product prices with tax included" control={<Checkbox defaultChecked />} />
<ToggleRow swap label="Show Tax Details" hint="Display tax breakdown in cart" control={<Checkbox defaultChecked />} />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
