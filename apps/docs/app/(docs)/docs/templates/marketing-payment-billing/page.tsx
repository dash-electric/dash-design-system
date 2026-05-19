"use client"

import { MarketingPaymentBilling } from "@/registry/dash/templates/marketing-payment-billing"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingPaymentBillingDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Payment & Billing"
        description="Payment methods list (Credit Card, Bank Transfer, Digital Wallet) with active toggles + fee badges. Source: Figma node `164843:41278`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-payment-billing`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingPaymentBilling />
            </DocsTemplatePreview>
          }
          code={`<MarketingPaymentBilling />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "className", type: "string", description: "Optional className to merge with the root wrapper." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
