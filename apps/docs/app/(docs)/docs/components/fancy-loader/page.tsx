"use client"

import * as React from "react"
import { FancyLoader } from "@/registry/dash/ui/fancy-loader"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * FancyLoader — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/loader/FancyLoader.tsx
 *
 * Full-screen branded "securing access" loader for auth/SSO redirect flows. Heavy
 * animation budget (shield-pulse + float + bouncing dots) — only use when the user
 * has to wait for something the system needs to make trustworthy (auth, payment,
 * KYC). For inline work, prefer Spinner or Shimmer.
 */

export default function FancyLoaderDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Loaders"
        title="Fancy Loader"
        description="Full-screen branded loader for auth and trust-critical transitions. Stack: floating SVG shield + pulsing rings + three bouncing dots. Use sparingly — reserved for high-anxiety waits like login redirects, payment processing, KYC."
        status="beta"
        kind="specialized"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add fancy-loader`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`{loading && <FancyLoader title="Verifying" description="Just a moment..." />}`}
        />
      </DocsSection>

      <DocsSection title="Live (inline)">
        <DocsExample
          title="Inline preview"
          description="Production usage is fixed-inset. We pass inline so the docs page can host it without escaping the article."
          preview={<FancyLoader inline />}
          code={`<FancyLoader />  // fixed inset-0 z-50, full-screen
// or
<FancyLoader inline />  // sized container, for docs / storybook`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          FancyLoader = trust-critical wait. Auth callback, payment processing, KYC verification. Bukan untuk fetch list mitra atau filter table — itu Spinner atau Shimmer.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6 text-center space-y-3">
                <div className="size-12 rounded-full bg-primary-base mx-auto animate-pulse" />
                <div className="text-sm font-semibold text-text-strong-950">Verifikasi pembayaran payroll</div>
                <div className="text-xs text-text-sub-600">Memproses Rp 48.5jt ke 12 mitra...</div>
              </div>
            ),
            caption: "Payment processing untuk payroll mitra = wait critical. User butuh reassurance bahwa duit lagi diproses, bukan halaman freeze. FancyLoader tepat.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6 text-center space-y-3">
                <div className="size-12 rounded-full bg-primary-base mx-auto animate-pulse" />
                <div className="text-sm font-semibold text-text-strong-950">Loading mitra list...</div>
                <div className="text-xs text-text-sub-600">Filter Express Bekasi</div>
              </div>
            ),
            caption: "Loading table list 200ms pakai FancyLoader = overkill. Animation budget berlebihan untuk wait pendek. Pakai Spinner inline.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6 text-center space-y-2">
                <div className="size-10 rounded-full bg-primary-alpha-16 mx-auto animate-pulse" />
                <div className="text-sm font-semibold text-text-strong-950">Authenticating SSO</div>
                <div className="text-xs text-text-sub-600">Connecting to Google Workspace...</div>
              </div>
            ),
            caption: "Title spesifik ('Authenticating SSO') + description ('Connecting to Google Workspace'). User tahu apa yang ditunggu, bukan generic 'Loading...'.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6 text-center space-y-2">
                <div className="size-10 rounded-full bg-primary-alpha-16 mx-auto animate-pulse" />
                <div className="text-sm font-semibold text-text-strong-950">Loading...</div>
                <div className="text-xs text-text-sub-600">Please wait</div>
              </div>
            ),
            caption: "'Loading... Please wait' generic = user kira app stuck. Title hero loader WAJIB kasih konteks apa yang sedang berjalan.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "title", type: "ReactNode", defaultValue: '"Securing your access"', description: "Heading line below the SVG." },
            { name: "description", type: "ReactNode", defaultValue: '"Verifying credentials..."', description: "Sub-line for context." },
            { name: "inline", type: "boolean", defaultValue: "false", description: "When true, renders in an h-[480px] container instead of fixed-inset. Use for tests/docs." },
          ]}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Auth flows: SSO callback, MFA verification, token refresh.</li>
          <li>Payment / KYC processing where users need reassurance.</li>
          <li>Initial app boot when a hard gate must complete before showing UI.</li>
          <li>Do NOT use for general data fetching — Spinner / Shimmer are cheaper.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
