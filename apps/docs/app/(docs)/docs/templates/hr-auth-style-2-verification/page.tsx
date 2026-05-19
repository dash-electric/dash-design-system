"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style2Shell } from "../_hr-auth-shared"
import { VerificationForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 2 · Verification. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth-style-2)/verification2/page.tsx (re-exports app/(auth)/verification).
 */
export default function HRAuthStyle2VerificationPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Verification — Style 2"
        description="Split-shell verification with right-side product-screenshot card. Identical 4-digit OTP form to Style 1."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 2 verification"
          preview={
            <DocsTemplatePreview>
              <Style2Shell flow="verification">
                <VerificationForm />
              </Style2Shell>
            </DocsTemplatePreview>
          }
          code={`<Style2Shell flow="verification">
  <VerificationForm />
</Style2Shell>`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
