"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style3Shell } from "../_hr-auth-shared"
import { RegisterForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 3 · Register. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth-style-3)/register3/page.tsx (re-exports app/(auth)/register).
 */
export default function HRAuthStyle3RegisterPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Register — Style 3"
        description="Split-shell register with right-side testimonial copy + Matthew Johnson avatar + cropped product screenshot."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 3 register"
          preview={
            <DocsTemplatePreview>
              <Style3Shell flow="register">
                <RegisterForm />
              </Style3Shell>
            </DocsTemplatePreview>
          }
          code={`<Style3Shell flow="register">
  <RegisterForm />
</Style3Shell>`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
