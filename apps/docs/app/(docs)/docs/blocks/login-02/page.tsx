"use client"

import { LoginBlock02 } from "@/registry/dash/blocks/login-02"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function LoginBlock02DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Login 02"
        description="SSO-first login — Google + Apple social buttons above the email/password fallback. The recommended Dash login for any team using Google Workspace."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add login-02`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="With SSO"
          description="Lanjut dengan Google / Apple di atas form email+password."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[480px]">
              <LoginBlock02 />
            </div>
          }
          code={`<LoginBlock02 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Uses <code>SocialButton</code> for Google + Apple brand-correct CTAs.</li>
          <li><code>Divider</code> with absolute-positioned "atau" caption separates SSO from credentials.</li>
          <li>Same <code>InputRoot</code> + <code>Label</code> + <code>Button</code> stack as Login 01 for the fallback.</li>
          <li>Swap <code>brand</code> prop on <code>SocialButton</code> to add Microsoft, GitHub, Slack as needed.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> when Dash users are on Google Workspace (default for PE + Ops).</li>
          <li><strong>Use</strong> when password fatigue is a known support issue — SSO cuts password reset tickets.</li>
          <li><strong>Don't</strong> use when SSO infra isn't yet wired — show only what works.</li>
          <li><strong>Don't</strong> use for public mitra recruitment — they don't have <code>@dash.id</code> Google accounts.</li>
        </ul>
      </DocsSection>
      <DocsSection title="SSO ordering">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          When SSO is the primary path, social buttons go on top — divider — then email fallback. Don't bury SSO below the fold.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-10 rounded-lg border border-stroke-strong-950 text-xs font-medium flex items-center justify-center">Lanjut dengan Google</div>
                <div className="h-10 rounded-lg border border-stroke-strong-950 text-xs font-medium flex items-center justify-center">Lanjut dengan Apple</div>
                <div className="flex items-center gap-2 py-1"><div className="h-px flex-1 bg-stroke-soft-200" /><span className="text-[10px] text-text-soft-400">atau</span><div className="h-px flex-1 bg-stroke-soft-200" /></div>
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Email</div>
                <div className="h-9 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Masuk</div>
              </div>
            ),
            caption: "SSO buttons sit above the divider. Email/password is the labelled fallback for users without a Workspace account.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Email</div>
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Password</div>
                <div className="h-9 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Masuk</div>
                <div className="text-center text-[10px] text-text-soft-400">— or sign in with —</div>
                <div className="h-7 rounded border border-stroke-soft-200 text-[10px] flex items-center justify-center">G</div>
              </div>
            ),
            caption: "Don't bury SSO at the bottom as an afterthought. Workspace users will scroll past it and waste time typing passwords.",
          }}
        />
      </DocsSection>

      <DocsSection title="Brand-correct SSO buttons">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Use the SocialButton primitive — brand colors, official iconography, correct spacing. Never re-skin SSO buttons to match your theme.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs font-medium flex items-center justify-center gap-2"><span className="size-4 rounded-sm bg-[conic-gradient(from_0deg,#EA4335,#FBBC05,#34A853,#4285F4)]" />Lanjut dengan Google</div>
                <div className="h-10 rounded-lg bg-static-black text-static-white text-xs font-medium flex items-center justify-center gap-2"><span className="text-sm"></span>Lanjut dengan Apple</div>
              </div>
            ),
            caption: "Google = white surface with multicolor mark. Apple = black surface with white logo. Matches official brand guidelines and triggers user recognition.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-10 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Lanjut dengan Google</div>
                <div className="h-10 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Lanjut dengan Apple</div>
              </div>
            ),
            caption: "Don't re-skin SSO buttons in Dash purple. Users scan for the Google/Apple mark — re-coloring it breaks the recognition contract and erodes trust.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
