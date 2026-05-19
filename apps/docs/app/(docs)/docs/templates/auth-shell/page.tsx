"use client"

import { AuthShell } from "@/registry/dash/templates/auth-shell"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { SocialButton } from "@/registry/dash/ui/social-button"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { RiMailLine as Mail, RiLockLine as Lock, RiKey2Line as KeyRound } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function AuthShellDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Generic"
        title="Auth Shell"
        description="Page-level layout for login, signup, password reset, and OTP verification flows. Two variants — centered card and split-screen with hero panel — both share the same prop API."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add auth-shell`} />
      </DocsSection>

      <DocsSection
        title="Examples"
        description="Three Dash auth flows composed on top of the same shell. Swap the children to change the form, swap variant to change the page layout."
      >
        <DocsExample
          bare
          title="Centered — Masuk Dash"
          description="Default centered card. Used for internal PE + Ops + mitra leadership login."
          preview={
            <DocsTemplatePreview>
              <AuthShell
                title="Masuk Dash"
                description="Akun internal hanya untuk PE + Ops + mitra leadership."
                footer={
                  <>
                    Belum punya akun? <LinkButton href="#">Daftar sekarang</LinkButton>
                  </>
                }
              >
                <form className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email-c">Email</Label>
                    <InputRoot>
                      <InputIcon><Mail className="size-4" strokeWidth={1.75} /></InputIcon>
                      <Input id="email-c" type="email" placeholder="nama@dash.id" />
                    </InputRoot>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pass-c">Password</Label>
                    <InputRoot>
                      <InputIcon><Lock className="size-4" strokeWidth={1.75} /></InputIcon>
                      <Input id="pass-c" type="password" placeholder="••••••••" />
                    </InputRoot>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-text-sub-600">
                    <Checkbox /> Ingat saya selama 30 hari
                  </label>
                  <Button type="submit" className="w-full">Masuk</Button>
                </form>
              </AuthShell>
            </DocsTemplatePreview>
          }
          code={`<AuthShell
  title="Masuk Dash"
  description="Akun internal hanya untuk PE + Ops + mitra leadership."
  footer={<>Belum punya akun? <LinkButton href="/signup">Daftar</LinkButton></>}
>
  <form>{/* email, password, remember, submit */}</form>
</AuthShell>`}
        />

        <DocsExample
          bare
          title="Split — Daftar Dash"
          description="Hero panel kiri untuk branding + testimoni tribe lead, form kanan. Cocok untuk signup public."
          preview={
            <DocsTemplatePreview>
              <AuthShell
                variant="split"
                title="Daftar Dash"
                description="3 menit. Auto-link ke tribe yang ditugaskan ke email Anda."
              >
                <form className="space-y-4">
                  <SocialButton brand="google" block />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stroke-soft-200" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-bg-weak-50 px-2 text-text-soft-400">atau</span></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email-s">Email kerja</Label>
                    <InputRoot>
                      <Input id="email-s" type="email" placeholder="nama@dash.id" />
                    </InputRoot>
                  </div>
                  <Button type="submit" className="w-full">Buat akun</Button>
                </form>
              </AuthShell>
            </DocsTemplatePreview>
          }
          code={`<AuthShell variant="split" title="Daftar Dash" description="3 menit. Auto-link ke tribe…">
  <form>{/* SSO + email + submit */}</form>
</AuthShell>`}
        />

        <DocsExample
          bare
          title="Centered — OTP verifikasi mitra"
          description="Short-lived flow. Brand-led copy + 6-digit input + resend link in footer."
          preview={
            <DocsTemplatePreview>
              <AuthShell
                title="Verifikasi nomor"
                description="Kode 6 digit dikirim ke +62 812-****-9412 via SMS."
                footer={
                  <>
                    Tidak dapat kode? <LinkButton href="#">Kirim ulang dalam 30 detik</LinkButton>
                  </>
                }
              >
                <form className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="otp-c">Kode OTP</Label>
                    <InputRoot>
                      <InputIcon><KeyRound className="size-4" strokeWidth={1.75} /></InputIcon>
                      <Input id="otp-c" inputMode="numeric" maxLength={6} placeholder="123456" />
                    </InputRoot>
                  </div>
                  <Button type="submit" className="w-full">Verifikasi & lanjutkan</Button>
                </form>
              </AuthShell>
            </DocsTemplatePreview>
          }
          code={`<AuthShell title="Verifikasi nomor" description="Kode 6 digit dikirim ke +62 812…" footer={<ResendLink />}>
  <form>{/* OTP input + verify */}</form>
</AuthShell>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="AuthShell is a pure layout — no business logic. You compose your own form inside, then swap variant for the page-level look."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>variant="centered"</code> wraps children in a max-w-md card on neutral background.</li>
          <li><code>variant="split"</code> renders a 50/50 grid with branded hero panel + form panel.</li>
          <li><code>brand</code>, <code>title</code>, <code>description</code>, and <code>footer</code> are all <code>ReactNode</code> — pass anything from text to <code>&lt;LinkButton&gt;</code> nodes.</li>
          <li>For split variant, override the <code>illustration</code> prop to swap the hero panel for a custom branded scene.</li>
          <li>Children area accepts any form — login, signup, OTP, forgot-password, magic-link, MFA challenge.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for any unauthenticated route — <code>/login</code>, <code>/signup</code>, <code>/forgot-password</code>, <code>/verify</code>.</li>
          <li><strong>Use</strong> centered variant for internal tools where speed-to-form matters (Halo-dash, PE backoffice).</li>
          <li><strong>Use</strong> split variant for public-facing signup where brand storytelling helps conversion (Tribe-Express mitra recruitment).</li>
          <li><strong>Don't</strong> use for in-app re-auth modals — use a <code>Modal</code> with the same form inside instead.</li>
          <li><strong>Don't</strong> use for multi-step onboarding — reach for <code>FormStepperPage</code> which carries a step indicator.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "variant", type: '"centered" | "split"', defaultValue: '"centered"', description: "Centered card or split-screen with hero." },
            { name: "title", type: "ReactNode", description: "Heading rendered above children." },
            { name: "description", type: "ReactNode", description: "Subhead under the title." },
            { name: "brand", type: "ReactNode", description: "Logo or wordmark slot above the title." },
            { name: "illustration", type: "ReactNode", description: "Override the hero panel content (split variant only)." },
            { name: "footer", type: "ReactNode", description: "Bottom helper link / legal copy under the form." },
            { name: "children", type: "ReactNode", description: "The form itself." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
