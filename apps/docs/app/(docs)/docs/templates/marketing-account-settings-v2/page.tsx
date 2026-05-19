"use client"

import { MarketingAccountSettingsV2 } from "@/registry/dash/templates/marketing-account-settings-v2"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingAccountSettingsV2DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Account Settings v2"
        description="Modal-style Store Settings panel with sidebar nav (Personal / General) + content header + inline tabs. Variant of the page-level marketing-account-settings. Source: Figma node `164843:39909`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-account-settings-v2`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingAccountSettingsV2 />
            </DocsTemplatePreview>
          }
          code={`<MarketingAccountSettingsV2 />`}
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
