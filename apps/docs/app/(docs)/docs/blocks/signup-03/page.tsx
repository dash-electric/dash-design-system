"use client"

import { SignupBlock03 } from "@/registry/dash/blocks/signup-03"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SignupBlock03DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Signup 03"
        description="Split-screen signup with a branded hero — Dash purple gradient on the left, form on the right. Designed for public Daftar Dash landings where social proof matters."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add signup-03`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Split — branded"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 flex items-center justify-center min-h-[640px]">
              <SignupBlock03 />
            </div>
          }
          code={`<SignupBlock03 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Self-contained rounded card with a 50/50 grid on <code>lg</code>.</li>
          <li>Hero panel: Dash purple gradient + benefit list + tribe-lead testimonial.</li>
          <li>Form panel: SSO + email/password + terms + submit.</li>
          <li>Mobile: form only, hero hidden.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> for public mitra/partner signup landing pages.</li>
          <li><strong>Use</strong> when conversion benefits from social proof + brand storytelling.</li>
          <li><strong>Don't</strong> use for internal-only signup — <code>Signup 01</code> ships faster.</li>
          <li><strong>Don't</strong> use inside dialogs — too tall.</li>
        </ul>
      </DocsSection>
      <DocsSection title="Split-form proof">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The split-shell signup pairs the form with a value-prop column. Use the right column for proof — testimonial, logo wall, stat — not decorative imagery.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                <div className="space-y-2"><div className="h-7 rounded-lg border border-stroke-soft-200 bg-bg-white-0" /><div className="h-7 rounded-lg border border-stroke-soft-200 bg-bg-white-0" /><div className="h-7 rounded-lg bg-primary-base" /></div>
                <div className="rounded-lg bg-bg-weak-50 p-3 text-[10px] text-text-sub-600">"Dash Express kami pakai untuk antar produk Kopi Kenangan ke 200 outlet/hari. Operational team 80% lebih cepat." — Ops Lead, KopKen</div>
              </div>
            ),
            caption: "Right column carries a named customer quote. Specific (200 outlets, 80% faster) and attributed (KopKen Ops Lead).",
          }}
          dont={{
            preview: (
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                <div className="space-y-2"><div className="h-7 rounded-lg border border-stroke-soft-200 bg-bg-white-0" /><div className="h-7 rounded-lg border border-stroke-soft-200 bg-bg-white-0" /><div className="h-7 rounded-lg bg-primary-base" /></div>
                <div className="rounded-lg bg-[linear-gradient(135deg,var(--dash-purple-500),#FF6B9D)] h-24" />
              </div>
            ),
            caption: "Don't fill the right column with a decorative gradient. The user paid attention with their eyes — give them a reason to sign up.",
          }}
        />
      </DocsSection>

      <DocsSection title="Single-column collapse">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          On mobile, the right column drops below the form, not behind it. The user scrolls past the form to proof — never the other way around.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-3">
                <div className="space-y-2"><div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0" /><div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0" /><div className="h-9 rounded-lg bg-primary-base" /></div>
                <div className="rounded-lg bg-bg-weak-50 p-3 text-[10px] text-text-sub-600">"Dash Express bantu 60% biaya logistik turun." — Sayurbox</div>
              </div>
            ),
            caption: "Form on top, proof below. Mobile users start the signup flow within the first viewport.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-3">
                <div className="rounded-lg bg-bg-weak-50 p-3 text-[10px] text-text-sub-600">"Dash Express bantu 60% biaya logistik turun." — Sayurbox</div>
                <div className="rounded-lg bg-bg-weak-50 p-3 text-[10px] text-text-sub-600">"On-time rate 98%." — Chagee</div>
                <div className="rounded-lg bg-bg-weak-50 p-3 text-[10px] text-text-sub-600">"Tim operasional 80% lebih cepat." — KopKen</div>
                <div className="space-y-1.5"><div className="h-7 rounded-lg border border-stroke-soft-200 bg-bg-white-0" /></div>
              </div>
            ),
            caption: "Don't push form below three testimonials on mobile. The user has to scroll an extra screen before they can type anything.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
