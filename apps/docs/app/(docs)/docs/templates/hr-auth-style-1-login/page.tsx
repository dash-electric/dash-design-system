"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style1Shell } from "../_hr-auth-shared"
import { LoginForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 1 · Login. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth)/{layout,header,footer}.tsx + app/(auth)/login/page.tsx
 *
 * Style 1 = split shell, form column (608px) on the left with auth header
 * + footer, full-bleed marketing slider on the right (rendered here as a
 * static deck preview).
 */
export default function HRAuthStyle1LoginPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Login — Style 1"
        description="Split-shell login: form column with social SSO + email/password, marketing carousel on the right."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 1 login"
          description="Form (608px) + slider deck. Cross-flow CTA in header: 'Don't have an account? Register'."
          preview={
            <DocsTemplatePreview>
              <Style1Shell flow="login">
                <LoginForm />
              </Style1Shell>
            </DocsTemplatePreview>
          }
          code={`<Style1Shell flow="login">
  <LoginForm />
</Style1Shell>`}
        />
      </DocsSection>
      <DocsSection title="Anatomy">
        <ul className="list-disc pl-6 space-y-1.5 text-sm text-text-sub-600">
          <li><strong>AuthHeader</strong> — brand mark + cross-flow CTA "Don&apos;t have an account? Register".</li>
          <li><strong>HeroIcon</strong> — 96px concentric ring + RiUserLine glyph.</li>
          <li><strong>Social row</strong> — Apple / Google / LinkedIn stroke-style icon-only SocialButtons.</li>
          <li><strong>ContentDivider</strong> — "OR" separator between SSO and email fields.</li>
          <li><strong>Email + Password</strong> — InputRoot with leading icon; password field has eye toggle.</li>
          <li><strong>Footer row</strong> — "Keep me logged in" Checkbox + "Forgot password?" LinkButton.</li>
          <li><strong>Submit</strong> — FancyButton primary "Login".</li>
          <li><strong>AuthFooter</strong> — © 2024 Synergy HR + language picker placeholder.</li>
          <li><strong>Slider</strong> — right-rail 3-slide deck ("Stay in Control of Your Time Off" / "Boost Your Productivity" / "Collaborate with Your Team").</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
