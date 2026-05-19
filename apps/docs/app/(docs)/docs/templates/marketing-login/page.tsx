"use client"

import { MarketingLogin } from "@/registry/dash/templates/marketing-login"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingLoginDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing"
        title="Marketing Login"
        description="Split-screen login template — form column + testimonial column. Pre-wired with brand mark, social SSO, register/forgot-password links, and a swappable testimonial slot."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-login`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default split-screen"
          description="Brand mark + 'Welcome back' form on the left, testimonial card on the right."
          preview={
            <DocsTemplatePreview>
              <MarketingLogin />
            </DocsTemplatePreview>
          }
          code={`<MarketingLogin
  brand={/* BrandMark */}
  testimonial={{
    quote: "...",
    name: "Sophia",
    role: "Founder, Acme",
  }}
  registerHref="/register"
  forgotHref="/forgot-password"
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="Built from @dash primitives — Card + Input + PasswordInput + SocialButton + BrandMark."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Left column</strong> — <code>BrandMark</code> + heading + email/password fields + SSO buttons.</li>
          <li><strong>Right column</strong> — testimonial card with quote + author + role.</li>
          <li>Responsive collapse to single column under <code>lg</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "brand", type: "ReactNode", description: "Top-left brand slot. Defaults to <BrandMark />." },
            { name: "testimonial", type: "{ quote, name, role, initials? }", description: "Right-column quote card content." },
            { name: "registerHref", type: "string", defaultValue: '"/register"', description: "Footer 'Create account' link target." },
            { name: "forgotHref", type: "string", defaultValue: '"/forgot-password"', description: "Forgot-password link target." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
