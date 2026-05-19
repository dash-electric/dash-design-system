"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style3Shell } from "../_hr-auth-shared"
import { VerificationForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 3 · Verification. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth-style-3)/verification3/page.tsx (re-exports app/(auth)/verification).
 */
export default function HRAuthStyle3VerificationPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Verification — Style 3"
        description="Split-shell verification with right-side testimonial copy + Matthew Johnson avatar + cropped product screenshot."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 3 verification"
          preview={
            <DocsTemplatePreview>
              <Style3Shell flow="verification">
                <VerificationForm />
              </Style3Shell>
            </DocsTemplatePreview>
          }
          code={`<Style3Shell flow="verification">
  <VerificationForm />
</Style3Shell>`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
