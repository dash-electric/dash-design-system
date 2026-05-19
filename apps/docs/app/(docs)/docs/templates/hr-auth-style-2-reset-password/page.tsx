"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style2Shell } from "../_hr-auth-shared"
import { ResetPasswordForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 2 · Reset Password. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth-style-2)/reset-password2/page.tsx (re-exports app/(auth)/reset-password).
 */
export default function HRAuthStyle2ResetPasswordPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Reset Password — Style 2"
        description="Split-shell reset with right-side product-screenshot card. Identical form to Style 1."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 2 reset password"
          preview={
            <DocsTemplatePreview>
              <Style2Shell flow="reset-password">
                <ResetPasswordForm />
              </Style2Shell>
            </DocsTemplatePreview>
          }
          code={`<Style2Shell flow="reset-password">
  <ResetPasswordForm />
</Style2Shell>`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
