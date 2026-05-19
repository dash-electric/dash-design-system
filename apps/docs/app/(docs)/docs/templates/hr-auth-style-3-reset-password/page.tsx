"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style3Shell } from "../_hr-auth-shared"
import { ResetPasswordForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 3 · Reset Password. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth-style-3)/reset-password3/page.tsx (re-exports app/(auth)/reset-password).
 */
export default function HRAuthStyle3ResetPasswordPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Reset Password — Style 3"
        description="Split-shell reset with right-side testimonial copy + Matthew Johnson avatar + cropped product screenshot."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 3 reset password"
          preview={
            <DocsTemplatePreview>
              <Style3Shell flow="reset-password">
                <ResetPasswordForm />
              </Style3Shell>
            </DocsTemplatePreview>
          }
          code={`<Style3Shell flow="reset-password">
  <ResetPasswordForm />
</Style3Shell>`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
