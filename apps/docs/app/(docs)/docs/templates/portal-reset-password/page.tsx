"use client"

import * as React from "react"
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { Hint } from "@/registry/dash/ui/hint"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"

/**
 * Portal Reset Password. Ported from Dash Next Portal v2 source (2026-05-19).
 * Source: app/[locale]/(auth)/reset-password/{page,layout}.tsx + Step{1,2,3}.tsx
 * Layout: top header bar + main content area (no sidebar). 3-step flow:
 * Step 1 phone, Step 2 OTP verify, Step 3 new password.
 */
export default function PortalResetPasswordPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Reset Password"
        description="Production phone-based forgot-password flow. Three sequential cards (max-w-[560px]) in a centered content well: phone entry → WhatsApp OTP verify → new password set. Uses VerificationHeader and full-width footer bar."
      />

      <DocsSection title="Step 1 — Reset Password (phone)">
        <DocsExample
          bare
          title="Phone entry card"
          description='Source title "Reset Password" · subtitle "Enter your phone number to reset your password." Phone input prefixes with +62 + Indonesian flag affix, maxLength 13, numeric-only via regex strip.'
          preview={
            <DocsTemplatePreview>
              <ResetShell>
                <ResetStep1 />
              </ResetShell>
            </DocsTemplatePreview>
          }
          code={`<WidgetBox className="max-w-[560px] p-6">
  <Image src={ResetPasswordIcon} width={88} height={88} />
  <h1>Reset Password</h1>
  <p>Enter your phone number to reset your password.</p>
  <Divider />
  <Label>Phone Number</Label>
  <InputRoot>
    <span><Flag /> +62</span>
    <Input inputMode="numeric" maxLength={13} placeholder="81234567890" />
  </InputRoot>
  <Hint>We'll send a verification code to this number.</Hint>
  <FancyButton>Reset Password</FancyButton>
</WidgetBox>`}
        />
      </DocsSection>

      <DocsSection title="Step 2 — Enter Verification Code">
        <DocsExample
          bare
          title="6-digit OTP entry"
          description='Source title "Enter Verification Code" · "We&apos;ve sent a 6-digit code to +{phone}." Resend countdown shows "Resend in 1m 30s" format when disabled, otherwise "Resend Code".'
          preview={
            <DocsTemplatePreview>
              <ResetShell>
                <ResetStep2 />
              </ResetShell>
            </DocsTemplatePreview>
          }
          code={`<WidgetBox>
  <Image src={VerificationIcon} />
  <h1>Enter Verification Code</h1>
  <p>We've sent a 6-digit code to +62812****9412.</p>
  <DigitInput numInputs={6} />
  <FancyButton>Verify</FancyButton>
  <p>Didn't receive the code? <LinkButton>Resend Code</LinkButton></p>
</WidgetBox>`}
        />
      </DocsSection>

      <DocsSection title="Step 3 — Create New Password">
        <DocsExample
          bare
          title="New password entry"
          description='Source title "Create New Password" · "Enter your new password below." Validation hints: minLength, uppercase, lowercase, number, match — all from `auth.resetPassword.step3.validation.*`.'
          preview={
            <DocsTemplatePreview>
              <ResetShell>
                <ResetStep3 />
              </ResetShell>
            </DocsTemplatePreview>
          }
          code={`<WidgetBox className="max-w-[560px] p-6">
  <Image src={ForgotPasswordIcon} />
  <h1>Create New Password</h1>
  <p>Enter your new password below.</p>
  <Label>New Password</Label>
  <InputRoot><InputIcon><RiLock2Line/></InputIcon><Input type="password" placeholder="Enter your password" /></InputRoot>
  <Hint>Must contain 1 uppercase letter, 1 number, min. 8 characters.</Hint>
  <Label>Confirm Password</Label>
  <InputRoot><InputIcon><RiLock2Line/></InputIcon><Input type="password" /></InputRoot>
  <Hint>Confirm your password correctly.</Hint>
  <FancyButton>Reset Password</FancyButton>
</WidgetBox>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Header</strong> — same <code>VerificationHeader</code> as verification flow (Dash logo + language select).</li>
          <li><strong>Main</strong> — light <code>bg-bg-weak-50</code>, content centered with <code>px-32 pt-12</code>.</li>
          <li><strong>Card</strong> — <code>WidgetBox.Root</code> max-w-[560px] with p-6, centered illustration (88×88 SVG), title, subtitle, line-spacing divider, then form body.</li>
          <li><strong>Step illustrations</strong> — <code>reset-password-icon.svg</code> (step 1), <code>verification-icon.svg</code> (step 2), <code>forgot-password-icon.svg</code> (step 3).</li>
          <li><strong>Footer</strong> — full-width consumer-protection contact bar with PT Dash Platform Indonesia info.</li>
          <li><strong>Persistence</strong> — phone number cached in <code>localStorage.phoneNumber</code>, retry timestamp in <code>localStorage.nextAttemptAt</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><code>InputRoot</code> / <code>Input</code> / <code>InputIcon</code> — phone + password fields.</li>
          <li><code>Hint</code> — inline validation messages.</li>
          <li><code>FancyButton</code> — primary submit per step (Reset Password / Verify / Reset Password).</li>
          <li><code>LinkButton</code> — resend code link with disabled state during countdown.</li>
          <li>InputOTP (substitute for source DigitInput).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

function ResetShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[820px] flex-col bg-bg-white-0">
      <div className="flex h-14 items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-6">
        <div className="flex items-center gap-2 text-label-md font-semibold text-text-strong-950">
          <span className="grid size-7 place-items-center rounded-md bg-(--dash-purple-600) text-white text-xs">D</span>
          dash
        </div>
        <span className="text-sm text-text-sub-600">EN</span>
      </div>
      <main className="flex flex-1 overflow-auto">
        <div className="flex min-h-full w-full flex-col items-center bg-bg-weak-50 px-32 pt-12">
          {children}
        </div>
      </main>
      <div className="flex w-full flex-col gap-4 bg-bg-surface-800 px-8 py-4 text-white lg:flex-row">
        <div className="flex w-full flex-col gap-1">
          <p className="text-label-sm">Layanan Pengaduan Konsumen</p>
          <p className="text-paragraph-xs">PT Dash Platform Indonesia</p>
        </div>
        <div className="flex w-full flex-col gap-1">
          <p className="text-paragraph-xs">Email: info@dashelectric.co</p>
          <p className="text-paragraph-xs">Whatsapp: +62 813 1388 4737</p>
        </div>
      </div>
    </div>
  )
}

function ResetCardShell({
  illustration,
  title,
  subtitle,
  children,
}: {
  illustration: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="w-full max-w-[560px] rounded-2xl bg-bg-white-0 p-6 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex flex-col items-center justify-center gap-6">
        {illustration}
        <div className="flex flex-col gap-1 text-center">
          <p className="text-title-h5 text-text-strong-950">{title}</p>
          <p className="text-paragraph-md text-text-sub-600">{subtitle}</p>
        </div>
        <div className="h-px w-full bg-stroke-soft-200" />
        {children}
      </div>
    </div>
  )
}

function ResetStep1() {
  return (
    <ResetCardShell
      illustration={<IllustrationBubble emoji="🔑" />}
      title="Reset Password"
      subtitle="Enter your phone number to reset your password."
    >
      <div className="flex w-full flex-col gap-3">
        <div className="space-y-1">
          <Label htmlFor="reset-phone">Phone Number</Label>
          <InputRoot>
            <div className="flex items-center px-3">
              <span className="mr-2 grid size-5 place-items-center rounded-full bg-error-base text-[8px] text-white">ID</span>
              <span className="text-paragraph-sm text-text-strong-950">+62</span>
            </div>
            <Input id="reset-phone" type="tel" inputMode="numeric" maxLength={13} placeholder="81234567890" />
          </InputRoot>
          <Hint>We&apos;ll send a verification code to this number.</Hint>
        </div>
      </div>
      <FancyButton tone="primary" size="md" className="w-full">
        Reset Password
      </FancyButton>
    </ResetCardShell>
  )
}

function ResetStep2() {
  return (
    <ResetCardShell
      illustration={<IllustrationBubble emoji="📨" />}
      title="Enter Verification Code"
      subtitle="We've sent a 6-digit code to +62812****9412."
    >
      <div className="flex w-full justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid size-12 place-items-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-paragraph-md text-text-soft-400 shadow-regular-xs"
          >
            –
          </div>
        ))}
      </div>
      <FancyButton tone="primary" size="md" className="w-full">
        Verify
      </FancyButton>
      <div className="flex justify-center gap-1">
        <p className="text-paragraph-sm text-text-sub-600">
          Didn&apos;t receive the code?
        </p>
        <LinkButton tone="primary" size="md">
          Resend Code
        </LinkButton>
      </div>
    </ResetCardShell>
  )
}

function ResetStep3() {
  const [showPwd, setShowPwd] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  return (
    <ResetCardShell
      illustration={<IllustrationBubble emoji="🔒" />}
      title="Create New Password"
      subtitle="Enter your new password below."
    >
      <div className="flex w-full flex-col gap-3">
        <div className="space-y-1">
          <Label htmlFor="reset-new">New Password</Label>
          <InputRoot>
            <InputIcon><RiLock2Line className="size-4" /></InputIcon>
            <Input
              id="reset-new"
              type={showPwd ? "text" : "password"}
              placeholder="Enter your password"
            />
            <button type="button" onClick={() => setShowPwd((s) => !s)} className="text-text-soft-400">
              {showPwd ? <RiEyeOffLine className="size-5" /> : <RiEyeLine className="size-5" />}
            </button>
          </InputRoot>
          <Hint>Must contain 1 uppercase letter, 1 number, min. 8 characters.</Hint>
        </div>
        <div className="space-y-1">
          <Label htmlFor="reset-confirm">Confirm Password</Label>
          <InputRoot>
            <InputIcon><RiLock2Line className="size-4" /></InputIcon>
            <Input
              id="reset-confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Enter your password"
            />
            <button type="button" onClick={() => setShowConfirm((s) => !s)} className="text-text-soft-400">
              {showConfirm ? <RiEyeOffLine className="size-5" /> : <RiEyeLine className="size-5" />}
            </button>
          </InputRoot>
          <Hint>Confirm your password correctly.</Hint>
        </div>
      </div>
      <FancyButton tone="primary" size="md" className="w-full">
        Reset Password
      </FancyButton>
    </ResetCardShell>
  )
}

function IllustrationBubble({ emoji }: { emoji: string }) {
  return (
    <div className="grid size-[88px] place-items-center rounded-full bg-(--primary-alpha-10) text-4xl">
      {emoji}
    </div>
  )
}
