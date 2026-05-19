"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style3Shell } from "../_hr-auth-shared"
import { LoginForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 3 · Login. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth-style-3)/{layout,auth-image}.tsx + app/(auth-style-3)/login3/page.tsx
 *
 * Style 3 = split shell, identical form on the left, testimonial copy +
 * Matthew Johnson avatar + cropped product screenshot that overflows the
 * right edge of the right column. Form is unchanged from Style 1/2.
 */
export default function HRAuthStyle3LoginPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Login — Style 3"
        description="Split-shell login with right-side testimonial copy + Matthew Johnson avatar + cropped product screenshot."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 3 login"
          description={`Right column quote: "The HR Management app has transformed how we handle HR tasks…" — Matthew Johnson, Data Software Engineer · Freelancer.`}
          preview={
            <DocsTemplatePreview>
              <Style3Shell flow="login">
                <LoginForm />
              </Style3Shell>
            </DocsTemplatePreview>
          }
          code={`<Style3Shell flow="login">
  <LoginForm />
</Style3Shell>`}
        />
      </DocsSection>
      <DocsSection title="Anatomy">
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-text-sub-600">
          <li><strong>Testimonial</strong> — title-h5 paragraph with "HR Management" bolded.</li>
          <li><strong>Author block</strong> — 48px purple avatar (Matthew Johnson) + name + role line.</li>
          <li><strong>Cropped image</strong> — rounded-l-20 product screenshot that bleeds off the right edge.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
