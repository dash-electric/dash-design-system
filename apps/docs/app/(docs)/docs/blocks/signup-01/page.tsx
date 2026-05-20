"use client"

import { SignupBlock01 } from "@/registry/dash/blocks/signup-01"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SignupBlock01DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Signup 01"
        description="Classic signup — name, email, password, terms agreement. The minimum-friction Daftar Dash form for internal account creation."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add signup-01`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Daftar Dash"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[480px]">
              <SignupBlock01 />
            </div>
          }
          code={`<SignupBlock01 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Standard <code>InputRoot</code> + <code>Label</code> stack: nama, email kerja, password.</li>
          <li>Terms agreement uses <code>Checkbox</code> with inline <code>LinkButton</code> for ToS + Privacy.</li>
          <li>Submit <code>Button</code> is full width, primary tone.</li>
          <li>Pair with <code>AuthShell variant="centered"</code> for the page chrome.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for internal Dash account creation (developer invitations).</li>
          <li><strong>Use</strong> when KYC is handled later in a separate flow.</li>
          <li><strong>Don't</strong> use for mitra signup — they need tribe selection inline; reach for <code>FormStepperPage</code>.</li>
          <li><strong>Don't</strong> use when SSO covers 100% of signups — go straight to <code>Signup 02</code>.</li>
        </ul>
      </DocsSection>
      <DocsSection title="Required fields only">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Mitra signup on Dash Express needs: nama, email, nomor HP. Phone tier survey, KTP scan, motorcycle photo — all live in the next step.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Nama lengkap</div>
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Email</div>
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Nomor HP</div>
                <div className="h-9 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Daftar</div>
              </div>
            ),
            caption: "Three fields, one CTA. Get the user across the line, collect the rest after they're committed.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-1.5">
                <div className="h-7 rounded border border-stroke-soft-200 text-[10px] flex items-center px-2 text-text-sub-600">Nama</div>
                <div className="h-7 rounded border border-stroke-soft-200 text-[10px] flex items-center px-2 text-text-sub-600">Email</div>
                <div className="h-7 rounded border border-stroke-soft-200 text-[10px] flex items-center px-2 text-text-sub-600">Nomor HP</div>
                <div className="h-7 rounded border border-stroke-soft-200 text-[10px] flex items-center px-2 text-text-sub-600">KTP</div>
                <div className="h-7 rounded border border-stroke-soft-200 text-[10px] flex items-center px-2 text-text-sub-600">Plat motor</div>
                <div className="h-7 rounded border border-stroke-soft-200 text-[10px] flex items-center px-2 text-text-sub-600">Foto SIM</div>
                <div className="h-7 rounded-lg bg-primary-base text-static-white text-[10px] flex items-center justify-center">Daftar</div>
              </div>
            ),
            caption: "Don't cram KTP, SIM, plat motor into the signup block. Form length kills conversion — break onboarding into a stepper after account creation.",
          }}
        />
      </DocsSection>

      <DocsSection title="Password strength feedback">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          When you ask for a password at signup, show inline strength feedback. Don't make the user submit just to learn it's too weak.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">••••••••••</div>
                <div className="flex gap-1"><div className="h-1 flex-1 rounded bg-success-base" /><div className="h-1 flex-1 rounded bg-success-base" /><div className="h-1 flex-1 rounded bg-success-base" /><div className="h-1 flex-1 rounded bg-bg-soft-200" /></div>
                <p className="text-[10px] text-text-sub-600">Bagus — tambah satu karakter spesial untuk maksimal.</p>
              </div>
            ),
            caption: "Live meter + plain-language tip. User knows the bar passes before clicking submit.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-9 rounded-lg border border-error-base bg-bg-white-0 text-xs text-error-base flex items-center px-3">••••••</div>
                <p className="text-[10px] text-error-base">Password terlalu lemah. Minimal 8 karakter, 1 angka, 1 huruf besar, 1 simbol.</p>
              </div>
            ),
            caption: "Don't surface password rules only as a post-submit error. The user has already invested effort — make rules visible while they type.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
