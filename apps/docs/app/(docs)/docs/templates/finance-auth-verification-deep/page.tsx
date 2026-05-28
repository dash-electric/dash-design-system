"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailCheckFill } from "@remixicon/react"

import { cn } from "@/registry/dash/lib/utils"
import { Divider } from "@/registry/dash/ui/divider"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/dash/ui/input-otp"
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
 * Finance Auth — Verification (deep). Ported from AlignUI Finance Template
 * `app/(auth)/verification/page.tsx` (2026-05-19).
 *
 * Source verbatim copy:
 *   Header: "Changed your mind?" → "Go Back"
 *   Title : "Enter Verification Code"
 *   Sub   : "We’ve sent a code to <strong>arthur@alignui.com</strong>"
 *   Input : 4-digit DigitInput (Dash → InputOTP, maxLength=4)
 *   CTA   : FancyButton primary — "Submit Code"
 *   Foot  : "Experiencing issues receiving the code?" + LinkButton black
 *           underlined "Resend code"
 */
export default function FinanceAuthVerificationDeepPage() {
  return (
    <TooltipProvider>
      <DocsPageShell>
        <DocsHeader
          category="Templates / Finance / Auth"
          title="Verification (deep)"
          description="4-digit one-time-code entry — recipient email called out, Submit Code FancyButton, Resend code link. Verbatim copy from AlignUI Finance Template."
        />

        <DocsSection title="Full preview">
          <DocsExample
            bare
            title="Apex — verification"
            preview={
              <DocsTemplatePreview>
                <AuthShell
                  text="Changed your mind?"
                  linkLabel="Go Back"
                  linkHref="/login"
                >
                  <VerificationCard />
                </AuthShell>
              </DocsTemplatePreview>
            }
            code={VERIFY_SNIPPET}
          />
        </DocsSection>

        <DocsSection title="Anatomy">
          <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
            <li>
              <code>AuthHeader</code> — "Changed your mind?" / "Go Back".
            </li>
            <li>
              <code>IconBadge</code> — <code>RiMailCheckFill</code>.
            </li>
            <li>
              Title "Enter Verification Code" + descriptor sentence with{" "}
              <em>arthur@alignui.com</em> bolded in strong-950.
            </li>
            <li>
              <code>InputOTP maxLength=4</code> with 4{" "}
              <code>InputOTPSlot</code> children (Figma DigitInput 80×64).
            </li>
            <li>
              <code>FancyButton</code> primary medium — "Submit Code".
            </li>
            <li>
              Recovery: "Experiencing issues receiving the code?" +{" "}
              <code>LinkButton</code> "Resend code".
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Verbatim copy">
          <DocsCode
            language="text"
            code={`Header link  : Changed your mind?  →  Go Back
Title        : Enter Verification Code
Sub          : We've sent a code to arthur@alignui.com
OTP          : 4 digit slots
Submit       : Submit Code
Recover link : Experiencing issues receiving the code?
               [Resend code]
Footer       : © 2024 Apex Financial`}
          />
        </DocsSection>

        <DocsSection title="Primitive substitutions">
          <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
            <li>
              <code>@/components/ui/digit-input</code> Root numInputs=4 →{" "}
              <code>@/registry/dash/ui/input-otp</code> InputOTP maxLength=4 +
              InputOTPGroup + 4× InputOTPSlot.
            </li>
            <li>
              FancyButton + LinkButton sub map identical to Login.
            </li>
          </ul>
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

function VerificationCard() {
  const [code, setCode] = React.useState("")
  return (
    <div className="w-full max-w-[472px] px-4">
      <div className="flex w-full flex-col gap-6 rounded-[20px] bg-bg-white-0 p-6 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8">
        <div className="flex flex-col items-center gap-2">
          <IconHalo>
            <RiMailCheckFill className="size-6 text-text-sub-600 lg:size-8" />
          </IconHalo>

          <div className="space-y-1 text-center">
            <div className="text-lg font-semibold tracking-tight text-text-strong-950 lg:text-xl">
              Enter Verification Code
            </div>
            <div className="text-sm text-text-sub-600 lg:text-base">
              We&rsquo;ve sent a code to{" "}
              <span className="font-medium text-text-strong-950">
                arthur@alignui.com
              </span>
            </div>
          </div>
        </div>

        <Divider />

        <div className="flex justify-center">
          <InputOTP maxLength={4} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <FancyButton tone="primary" size="md" className="w-full">
          Submit Code
        </FancyButton>

        <div className="flex flex-col items-center gap-1 text-center text-sm text-text-sub-600">
          Experiencing issues receiving the code?
          <LinkButton tone="neutral" size="md" underline="always">
            Resend code
          </LinkButton>
        </div>
      </div>
    </div>
  )
}

const VERIFY_SNIPPET = `<AuthShell text="Changed your mind?" linkLabel="Go Back">
  <Card>
    <IconHalo><RiMailCheckFill /></IconHalo>
    <h1>Enter Verification Code</h1>
    <p>We've sent a code to <strong>arthur@alignui.com</strong></p>

    <Divider />

    <InputOTP maxLength={4} value={code} onChange={setCode}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>

    <FancyButton tone="primary" className="w-full">Submit Code</FancyButton>

    <p>
      Experiencing issues receiving the code?
      <LinkButton tone="neutral" underline="always">Resend code</LinkButton>
    </p>
  </Card>
</AuthShell>`
