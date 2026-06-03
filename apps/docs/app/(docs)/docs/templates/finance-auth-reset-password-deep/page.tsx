"use client"

import * as React from "react"
import Link from "next/link"
import { RiDoorLockFill, RiMailLine } from "@remixicon/react"

import { cn } from "@/registry/dash/lib/utils"
import { Divider } from "@/registry/dash/ui/divider"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { TooltipProvider } from "@/registry/dash/ui/tooltip"

/**
 * Finance Auth — Reset Password (deep). Ported from AlignUI Finance Template
 * `app/(auth)/reset-password/page.tsx` (2026-05-19).
 *
 * Source verbatim copy:
 *   Header: "Changed your mind?" → "Go Back" (to /login)
 *   Title : "Reset Password"
 *   Sub   : "Enter your email to reset your password."
 *   Field : "Email Address *" placeholder "hello@alignui.com"
 *   CTA   : FancyButton primary — "Reset Password"
 *   Foot  : "Don’t have access anymore?" + LinkButton black underlined
 *           "Try another method"
 */
export default function FinanceAuthResetPasswordDeepPage() {
  return (
    <TooltipProvider>
      <DocsPageShell>
        <DocsHeader
          category="Templates / Finance / Auth"
          title="Reset password (deep)"
          description="Same chrome as Login — single email field + Reset Password FancyButton + Try-another-method footer link. Verbatim copy from AlignUI Finance Template."
        />

        <DocsSection title="Full preview">
          <DocsExample
            bare
            title="Apex — reset password"
            preview={
              <DocsTemplatePreview>
                <AuthShell
                  text="Changed your mind?"
                  linkLabel="Go Back"
                  linkHref="/login"
                >
                  <ResetPasswordCard />
                </AuthShell>
              </DocsTemplatePreview>
            }
            code={RESET_SNIPPET}
          />
        </DocsSection>

        <DocsSection title="Anatomy">
          <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
            <li>
              <code>AuthHeader</code> — "Changed your mind?" / "Go Back" (LinkButton primary).
            </li>
            <li>
              <code>IconBadge</code> — <code>RiDoorLockFill</code>.
            </li>
            <li>
              Single field: Email Address (required, mail icon).
            </li>
            <li>
              <code>FancyButton</code> primary medium — "Reset Password".
            </li>
            <li>
              Recovery escape hatch — "Don&apos;t have access anymore?" +
              <code>LinkButton tone="neutral"</code> "Try another method".
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Verbatim copy">
          <DocsCode
            language="text"
            code={`Header link  : Changed your mind?  →  Go Back
Title        : Reset Password
Sub          : Enter your email to reset your password.
Field        : Email Address *           placeholder "hello@alignui.com"
Submit       : Reset Password
Recover link : Don't have access anymore?
               [Try another method]
Footer       : © 2024 Apex Financial`}
          />
        </DocsSection>
      </DocsPageShell>
    </TooltipProvider>
  )
}

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

function AuthShell({
  text,
  linkLabel,
  linkHref,
  children,
}: {
  text: string
  linkLabel: string
  linkHref: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[760px] flex-col">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between p-6">
        <div
          aria-hidden
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-base) text-static-white text-base font-bold"
        >
          A
        </div>
        <div className="flex items-center gap-1.5">
          <div className="text-sm text-text-sub-600">{text}</div>
          <LinkButton tone="primary" size="md" underline="always" asChild>
            <Link href={linkHref}>{linkLabel}</Link>
          </LinkButton>
        </div>
      </div>

      <div className="relative isolate flex w-full flex-1 flex-col items-center justify-center py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[318px] w-full max-w-[1140px] -translate-x-1/2 -translate-y-1/2 rounded-[40px] bg-gradient-to-br from-(--dash-purple-100)/40 via-(--dash-purple-50)/30 to-transparent opacity-70"
        />
        {children}
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between p-6">
        <div className="text-sm text-text-sub-600">© 2024 Apex Financial</div>
        <div className="text-sm text-text-sub-600">ENG</div>
      </div>
    </div>
  )
}

function IconHalo({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24",
        "before:absolute before:inset-0 before:rounded-full",
        "before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10",
      )}
    >
      <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 lg:size-16">
        {children}
      </div>
    </div>
  )
}

function ResetPasswordCard() {
  return (
    <div className="w-full max-w-[472px] px-4">
      <div className="flex w-full flex-col gap-6 rounded-[20px] bg-bg-white-0 p-6 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8">
        <div className="flex flex-col items-center gap-2">
          <IconHalo>
            <RiDoorLockFill className="size-6 text-text-sub-600 lg:size-8" />
          </IconHalo>

          <div className="space-y-1 text-center">
            <div className="text-lg font-semibold tracking-tight text-text-strong-950 lg:text-xl">
              Reset Password
            </div>
            <div className="text-sm text-text-sub-600 lg:text-base">
              Enter your email to reset your password.
            </div>
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="reset-email" required>
              Email Address
            </Label>
            <InputRoot size="lg">
              <InputIcon>
                <RiMailLine className="size-5" />
              </InputIcon>
              <Input
                id="reset-email"
                type="email"
                placeholder="hello@alignui.com"
                required
              />
            </InputRoot>
          </div>
        </div>

        <FancyButton tone="primary" size="md" className="w-full">
          Reset Password
        </FancyButton>

        <div className="flex flex-col items-center gap-1 text-center text-sm text-text-sub-600">
          Don&rsquo;t have access anymore?
          <LinkButton tone="neutral" size="md" underline="always">
            Try another method
          </LinkButton>
        </div>
      </div>
    </div>
  )
}

const RESET_SNIPPET = `<AuthShell text="Changed your mind?" linkLabel="Go Back">
  <Card>
    <IconHalo><RiDoorLockFill /></IconHalo>
    <h1>Reset Password</h1>
    <p>Enter your email to reset your password.</p>

    <Divider />

    <Label htmlFor="email" required>Email Address</Label>
    <InputRoot size="lg">
      <InputIcon><RiMailLine /></InputIcon>
      <Input type="email" placeholder="hello@alignui.com" required />
    </InputRoot>

    <FancyButton tone="primary" className="w-full">Reset Password</FancyButton>

    <p>
      Don't have access anymore?
      <LinkButton tone="neutral" underline="always">Try another method</LinkButton>
    </p>
  </Card>
</AuthShell>`
