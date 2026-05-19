"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style2Shell } from "../_hr-auth-shared"
import { RegisterForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 2 · Register. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth-style-2)/register2/page.tsx (re-exports app/(auth)/register).
 */
export default function HRAuthStyle2RegisterPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Register — Style 2"
        description="Split-shell register with right-side product-screenshot card. Identical form to Style 1."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 2 register"
          preview={
            <DocsTemplatePreview>
              <Style2Shell flow="register">
                <RegisterForm />
              </Style2Shell>
            </DocsTemplatePreview>
          }
          code={`<Style2Shell flow="register">
  <RegisterForm />
</Style2Shell>`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
