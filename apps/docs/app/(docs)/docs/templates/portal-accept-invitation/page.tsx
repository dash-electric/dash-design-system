"use client"

import * as React from "react"
import { RiEyeLine, RiEyeOffLine, RiLock2Line } from "@remixicon/react"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { Hint } from "@/registry/dash/ui/hint"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"

/**
 * Portal Accept Invitation. Ported from Dash Next Portal v2 source (2026-05-19).
 * Source: app/[locale]/(auth)/accept-invitation/{page,layout}.tsx
 * Layout: VerificationHeader top + content well (no footer, no sidebar). Single card.
 * Form: pre-filled email + phone (from temp token), new password + confirm.
 */
export default function PortalAcceptInvitationPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Accept Invitation"
        description="Single-screen card for accepting a team invitation. URL carries a temp token, profile pre-fills email + phone (disabled), user creates a new password. On success: redirect to /signin."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Accept invitation card"
          description='Source title "Create a new account" · "Enter your details to register." Email + Phone fields are disabled and pre-filled via `getUserProfileTempToken(token)`. Password validators inline.'
          preview={
            <DocsTemplatePreview>
              <AcceptShell>
                <AcceptCard />
              </AcceptShell>
            </DocsTemplatePreview>
          }
          code={`<WidgetBox className="max-w-[560px] p-5">
  <Image src={ResetPasswordIcon} width={88} height={88} />
  <h1>Create a new account</h1>
  <p>Enter your details to register.</p>
  <Divider />

  <Field label="Email">
    <Input disabled value={data?.email} placeholder="Enter user email" />
  </Field>

  <Field label="Phone Number">
    <InputRoot>
      <span><Flag /> +62</span>
      <Input disabled value={data?.phoneNumber} placeholder="-" />
    </InputRoot>
  </Field>

  <Field label="New Password">
    <InputRoot><InputIcon><RiLock2Line/></InputIcon><Input type="password" placeholder="••••••••••" /></InputRoot>
    <Hint>Must contain 1 uppercase letter, 1 number, min. 8 characters.</Hint>
  </Field>

  <Field label="Confirm Password">
    <InputRoot><InputIcon><RiLock2Line/></InputIcon><Input type="password" /></InputRoot>
    <Hint>Confirm your password correctly.</Hint>
  </Field>

  <FancyButton>Register</FancyButton>
</WidgetBox>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Header</strong> — <code>VerificationHeader</code> (Dash logo + language). NO footer (unlike reset-password).</li>
          <li><strong>Main</strong> — <code>bg-bg-weak-50</code> + <code>px-32 pt-12</code>.</li>
          <li><strong>Card</strong> — max-w-[560px] <code>WidgetBox.Root</code> p-5, 88×88 illustration (same SVG as reset-password Step 1).</li>
          <li><strong>Email field</strong> — disabled, value sourced from temp-token API; placeholder “Enter user email” (this hardcoded source string, not i18n).</li>
          <li><strong>Phone field</strong> — disabled, Indonesian flag + +62 prefix, placeholder “-”.</li>
          <li><strong>Validation</strong> — minLength 8, uppercase, lowercase, number, match. Messages from <code>auth.acceptInvitation.validation.*</code>.</li>
          <li><strong>Success</strong> — toast “Password created successfully. Use your new password to log in.” then redirect <code>/signin</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>InputRoot</code> / <code>Input</code> / <code>InputIcon</code> — fields.</li>
          <li><code>Label</code> / <code>Hint</code> — labels + inline validation.</li>
          <li><code>FancyButton</code> — Register primary CTA.</li>
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

function AcceptShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[820px] flex-col bg-bg-white-0">
      <div className="flex h-14 items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-5">
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
    </div>
  )
}

function AcceptCard() {
  const [showPwd, setShowPwd] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  return (
    <div className="w-full max-w-[560px] rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="grid size-[88px] place-items-center rounded-full bg-(--primary-alpha-10) text-4xl">
          🔑
        </div>
        <div className="flex flex-col gap-1 text-center">
          <p className="text-title-h5 text-text-strong-950">Create a new account</p>
          <p className="text-paragraph-md text-text-sub-600">
            Enter your details to register.
          </p>
        </div>
        <div className="h-px w-full bg-stroke-soft-200" />

        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full flex-col gap-1">
            <Label className="text-label-sm text-text-strong-950">Email</Label>
            <InputRoot>
              <Input placeholder="Enter user email" disabled />
            </InputRoot>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="invite-phone">Phone Number</Label>
            <InputRoot>
              <div className="flex items-center px-3">
                <span className="mr-2 grid size-5 place-items-center rounded-full bg-error-base text-[8px] text-white">ID</span>
                <span className="text-paragraph-sm text-text-strong-950">+62</span>
              </div>
              <Input id="invite-phone" type="tel" inputMode="numeric" placeholder="-" disabled />
            </InputRoot>
          </div>
          <div className="space-y-1">
            <Label htmlFor="invite-password">New Password</Label>
            <InputRoot>
              <InputIcon><RiLock2Line className="size-4" /></InputIcon>
              <Input
                id="invite-password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••••"
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)} className="text-text-soft-400">
                {showPwd ? <RiEyeOffLine className="size-5" /> : <RiEyeLine className="size-5" />}
              </button>
            </InputRoot>
            <Hint>Must contain 1 uppercase letter, 1 number, min. 8 characters.</Hint>
          </div>
          <div className="space-y-1">
            <Label htmlFor="invite-confirm">Confirm Password</Label>
            <InputRoot>
              <InputIcon><RiLock2Line className="size-4" /></InputIcon>
              <Input
                id="invite-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••••"
              />
              <button type="button" onClick={() => setShowConfirm((s) => !s)} className="text-text-soft-400">
                {showConfirm ? <RiEyeOffLine className="size-5" /> : <RiEyeLine className="size-5" />}
              </button>
            </InputRoot>
            <Hint>Confirm your password correctly.</Hint>
          </div>
        </div>

        <FancyButton tone="primary" size="md" className="w-full">
          Register
        </FancyButton>
      </div>
    </div>
  )
}
