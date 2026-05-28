"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview, Style2Shell } from "../_hr-auth-shared"
import { LoginForm } from "../_hr-auth-forms"

/**
 * HR Auth — Style 2 · Login. Ported from AlignUI HR Template (2026-05-18).
 * Source: app/(auth-style-2)/{layout,auth-image}.tsx + app/(auth-style-2)/login2/page.tsx
 *
 * Style 2 = split shell, identical form on the left, large product-screenshot
 * image on the right (rounded-left card with 4px white ring + shadow).
 */
export default function HRAuthStyle2LoginPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Auth"
        title="Login — Style 2"
        description="Split-shell login with right-side product-screenshot card (no carousel). Same form as Style 1."
      />
      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Style 2 login"
          description="Form (608px) + large screenshot card on right with rounded-left edge, shadow + 4px white ring."
          preview={
            <DocsTemplatePreview>
              <Style2Shell flow="login">
                <LoginForm />
              </Style2Shell>
            </DocsTemplatePreview>
          }
          code={`<Style2Shell flow="login">
  <LoginForm />
</Style2Shell>`}
        />
      </DocsSection>
      <DocsSection title="Anatomy">
        <ul className="list-disc pl-6 space-y-1.5 text-sm text-text-sub-600">
          <li><strong>Layout</strong> — same 608px form column, right column hosts a static product image card.</li>
          <li><strong>Image card</strong> — rounded-l-20 + ring-4 stroke-white-0 + shadow-regular-md, image clipped to the right edge.</li>
          <li><strong>Form</strong> — identical to Style 1 login.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
