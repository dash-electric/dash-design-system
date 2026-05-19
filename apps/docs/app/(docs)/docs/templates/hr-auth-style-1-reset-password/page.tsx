"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style1Shell } from "../_hr-auth-shared"
import { ResetPasswordForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 1 · Reset Password. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth)/{layout,header,footer}.tsx + app/(auth)/reset-password/page.tsx
 */
export default function HRAuthStyle1ResetPasswordPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Reset Password — Style 1"
        description="Split-shell reset: email input + hint + Reset CTA + 'Try another method' link. Marketing carousel on the right."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 1 reset password"
          description="Cross-flow CTA in header: 'Changed your mind? Go back'."
          preview={
            <DocsTemplatePreview>
              <Style1Shell flow="reset-password">
                <ResetPasswordForm />
              </Style1Shell>
            </DocsTemplatePreview>
          }
          code={`<Style1Shell flow="reset-password">
  <ResetPasswordForm />
</Style1Shell>`}
        />
      </DocsSection>
      <DocsSection title="Anatomy">
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-text-sub-600">
          <li><strong>HeroIcon</strong> — RiDoorLockLine glyph.</li>
          <li><strong>Field</strong> — Email Address with hint "Enter the email with which you&apos;ve registered."</li>
          <li><strong>Submit</strong> — FancyButton primary "Reset Password".</li>
          <li><strong>Footer</strong> — "Don&apos;t have access anymore?" + LinkButton "Try another method".</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
