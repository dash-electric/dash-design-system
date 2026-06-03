"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style1Shell } from "../_hr-auth-shared"
import { RegisterForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 1 · Register. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth)/{layout,header,footer}.tsx + app/(auth)/register/page.tsx
 */
export default function HRAuthStyle1RegisterPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Register — Style 1"
        description="Split-shell register: full-name + email + password (with strength hint) + social SSO. Marketing carousel on the right."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 1 register"
          description="Cross-flow CTA in header: 'Already have an account? Login'."
          preview={
            <DocsTemplatePreview>
              <Style1Shell flow="register">
                <RegisterForm />
              </Style1Shell>
            </DocsTemplatePreview>
          }
          code={`<Style1Shell flow="register">
  <RegisterForm />
</Style1Shell>`}
        />
      </DocsSection>
      <DocsSection title="Anatomy">
        <ul className="list-disc pl-6 space-y-1.5 text-sm text-text-sub-600">
          <li><strong>HeroIcon</strong> — RiUserAddLine glyph.</li>
          <li><strong>Fields</strong> — Full Name, Email Address, Password.</li>
          <li><strong>Hint</strong> — "Must contain 1 uppercase letter, 1 number, min. 8 characters."</li>
          <li><strong>Submit</strong> — FancyButton primary "Register".</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
