"use client"

import { useState } from "react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/registry/dash/ui/input-otp"
import { Label } from "@/registry/dash/ui/label"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function InputOtpDocsPage() {
  const [value, setValue] = useState("")

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Form"
        title="Input OTP"
        description="Single-character segmented input for one-time codes — mitra KYC OTP verification, login MFA, payout dispute approval. Built on input-otp."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add input-otp`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Built on <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">input-otp</code>. Compose <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">InputOTP</code> (root, owns value + maxLength) with one or more <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">InputOTPGroup</code> regions, each containing the per-digit <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">InputOTPSlot</code> elements. Use <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">InputOTPSeparator</code> between groups for the “3-dash-3” style (e.g. <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">123-456</code>). Caret position and paste-spreading are handled internally.
        </p>
      </DocsSection>

      <DocsSection title="Example">
        <DocsExample
          title="6-digit KYC OTP"
          preview={
            <div className="space-y-3">
              <Label>Masukkan kode OTP</Label>
              <InputOTP maxLength={6} value={value} onChange={setValue}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-text-sub-600">
                Code dikirim ke 0812-xxxx-9412. Berlaku 5 menit.
              </p>
            </div>
          }
          code={`<InputOTP maxLength={6} value={value} onChange={setValue}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`}
        />

        <DocsExample
          title="4-digit MFA"
          preview={
            <div className="space-y-2">
              <Label>MFA code</Label>
              <InputOTP maxLength={4}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          }
          code={`<InputOTP maxLength={4}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
  </InputOTPGroup>
</InputOTP>`}
        />

        <DocsExample
          title="Numeric only pattern"
          preview={
            <div className="space-y-2">
              <Label>Kode 6 digit</Label>
              <InputOTP maxLength={6} pattern="\d*">
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          }
          code={`<InputOTP maxLength={6} pattern="\\d*">  {/* only digits */}
  …
</InputOTP>`}
        />

        <DocsExample
          title="On complete callback"
          preview={
            <div className="text-sm text-text-sub-600">
              <code className="text-xs">onComplete</code> fires when value length equals maxLength — great for auto-submit.
            </div>
          }
          code={`<InputOTP
  maxLength={6}
  onComplete={(value) => {
    verifyOtp(value).then(navigate)
  }}
>…</InputOTP>`}
        />

        <DocsExample
          title="Disabled state"
          preview={
            <InputOTP maxLength={6} disabled>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          }
          code={`<InputOTP maxLength={6} disabled>…</InputOTP>`}
        />

        <DocsExample
          title="Error state"
          preview={
            <div className="space-y-2">
              <Label>Kode OTP</Label>
              <InputOTP maxLength={6} value="123456">
                <InputOTPGroup className="[&_[data-slot=input-otp-slot]]:border-error-base [&_[data-slot=input-otp-slot]]:text-error-base">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-error-base">Kode tidak cocok. Sisa 2 percobaan.</p>
            </div>
          }
          code={`<InputOTP maxLength={6} value={value}>
  <InputOTPGroup className="…border-error-base">
    …
  </InputOTPGroup>
</InputOTP>
<p className="text-xs text-error-base">Kode tidak cocok.</p>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          OTP input untuk short numeric/alpha code (4-6 digit). Bukan untuk referral code 6-digit case-sensitive — itu plain Input.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex gap-1.5">
                {["1","2","3","4","5","6"].map(d => (
                  <div key={d} className="size-9 rounded border border-stroke-soft-200 bg-bg-white-0 flex items-center justify-center text-sm font-semibold">{d}</div>
                ))}
              </div>
            ),
            caption: "OTP SMS 6-digit numeric, auto-advance per slot, auto-submit di slot terakhir. Verifikasi nomor handphone mitra <30 detik.",
          }}
          dont={{
            preview: (
              <div className="flex gap-1.5">
                {["D","A","s","H","4","2"].map(d => (
                  <div key={d} className="size-9 rounded border border-stroke-soft-200 bg-bg-white-0 flex items-center justify-center text-sm font-semibold">{d}</div>
                ))}
              </div>
            ),
            caption: "Jangan pakai OTP untuk referral code DASH42 case-sensitive. Mitra paste full code; OTP slot bikin paste 1-per-slot.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Tampilkan timer resend (\"Kirim ulang 0:47\"). Mitra tahu kapan boleh request OTP baru, mengurangi support call.",
          }}
          dont={{
            caption: "Jangan reset semua slot saat 1 digit salah. Cukup highlight slot terakhir, biarkan mitra koreksi 1 digit saja.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "maxLength", type: "number", description: "Total slot count." },
            { name: "value", type: "string", description: "Controlled OTP value." },
            { name: "onChange", type: "(value: string) => void", description: "Fires per keystroke." },
            { name: "onComplete", type: "(value: string) => void", description: "Fires when length === maxLength." },
            { name: "pattern", type: "RegExp | string", description: "Restrict allowed characters." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Disable the whole control." },
            { name: "index", type: "number", description: "Required on InputOTPSlot — slot position." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <p className="text-sm text-text-sub-600">Built on <a href="https://input-otp.rodz.dev/" target="_blank" rel="noreferrer" className="underline">input-otp</a>.</p>
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — renders a hidden <code className="text-xs">input</code> spanning all slots; visible slots are presentational. SR reads it as a single text field.</li>
          <li>• <strong>Keyboard</strong>
            <ul className="ml-6 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li>Typing fills the next slot automatically.</li>
              <li><code className="text-xs">Backspace</code> clears the current slot and moves back.</li>
              <li><code className="text-xs">←</code> / <code className="text-xs">→</code> navigates slots.</li>
              <li>Paste pastes the entire code across slots.</li>
            </ul>
          </li>
          <li>• <strong>Autofill</strong> — input-otp supports SMS one-time-code autofill on iOS / Android via <code className="text-xs">autoComplete=&quot;one-time-code&quot;</code> (passed automatically).</li>
          <li>• <strong>Label wiring</strong> — pair with a visible <code className="text-xs">{`<Label>`}</code> describing the purpose (&quot;MFA code&quot;, &quot;KYC OTP&quot;).</li>
          <li>• <strong>Reduced motion</strong> — slot focus indicator (caret blink) respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
