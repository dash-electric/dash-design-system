"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style1Shell } from "../_hr-auth-shared"
import { VerificationForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 1 · Verification. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth)/{layout,header,footer}.tsx + app/(auth)/verification/page.tsx
 */
export default function HRAuthStyle1VerificationPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Verification — Style 1"
        description="Split-shell verification: 4-digit InputOTP + Verify CTA + Resend code link. Marketing carousel on the right."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 1 verification"
          description="Cross-flow CTA in header: 'Changed your mind? Go back'."
          preview={
            <DocsTemplatePreview>
              <Style1Shell flow="verification">
                <VerificationForm />
              </Style1Shell>
            </DocsTemplatePreview>
          }
          code={`<Style1Shell flow="verification">
  <VerificationForm />
</Style1Shell>`}
        />
      </DocsSection>
      <DocsSection title="Anatomy">
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-text-sub-600">
          <li><strong>HeroIcon</strong> — RiMailCheckLine glyph.</li>
          <li><strong>Copy</strong> — "We&apos;ve sent a code to james@alignui.com".</li>
          <li><strong>InputOTP</strong> — 4-slot one-time code input.</li>
          <li><strong>Submit</strong> — FancyButton primary "Verify".</li>
          <li><strong>Footer</strong> — "Experiencing issues receiving the code?" + LinkButton "Resend code".</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
