"use client"

import * as React from "react"
import { RiMailCheckLine } from "@remixicon/react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/dash/ui/input-otp"
import { Divider } from "@/registry/dash/ui/divider"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"

/**
 * Marketing Auth — Verification page. Ported 1:1 from AlignUI Marketing
 * Template (`app/(auth)/verification/page.tsx`), Dash-skinned (2026-05-18).
 *
 * Note: original uses 4-digit `DigitInput` — Dash maps this to `InputOTP`
 * with 4 slots (no separator). Numeric-only via the OTP component's pattern.
 */

function AuthIconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-20",
        "before:absolute before:inset-0 before:rounded-full",
        "before:bg-gradient-to-b before:from-primary-base before:to-transparent before:opacity-10",
      )}
    >
      <div
        className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 lg:size-14"
        style={{
          boxShadow:
            "0 0 0 1px rgba(183, 83, 16, 0.04), 0 1px 1px 0.5px rgba(183, 83, 16, 0.04), 0 3px 3px -1.5px rgba(183, 83, 16, 0.02), 0 6px 6px -3px rgba(183, 83, 16, 0.04), 0 12px 12px -6px rgba(183, 83, 16, 0.04), 0px 24px 24px -12px rgba(183, 83, 16, 0.04), 0px 48px 48px -24px rgba(183, 83, 16, 0.04), inset 0px -1px 1px -0.5px rgba(183, 83, 16, 0.06)",
        }}
      >
        {children}
      </div>
    </div>
  )
}

function AuthShellPreview({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid w-full min-h-[860px] lg:grid-cols-[minmax(0,1fr),500px] xl:grid-cols-[minmax(0,1fr),596px]"
      style={{
        background:
          "linear-gradient(180deg, #CA5F16 0%, #DC6818 25%, #E97D35 50%, #F1AC7E 75%, #F9DCC8 100%), #FFFFFF",
      }}
    >
      <div className="flex h-full flex-col p-1.5 lg:p-2 lg:pr-0">
        <div className="flex flex-1 flex-col rounded-2xl bg-bg-white-0 px-3.5 lg:px-11 lg:py-6">
          <div className="mx-auto flex w-full items-center justify-between gap-6 py-3.5 lg:py-0">
            <a href="/" className="shrink-0">
              <div className="flex size-8 items-center justify-center rounded-md bg-text-strong-950 text-static-white text-xs font-semibold">
                C
              </div>
            </a>
            <div className="flex items-center gap-3">
              {/* /verification has no entry in pathConfig → defaultConfig */}
              <span className="text-right text-sm text-text-sub-600">
                Changed your mind?
              </span>
              <Button asChild style="lighter" tone="primary" size="xs">
                <a href="/">Go back</a>
              </Button>
            </div>
          </div>

          <div className="flex flex-1 flex-col py-6 lg:py-[100px]">
            <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6 md:translate-x-1.5">
              {children}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 pb-4 lg:pb-0">
            <div className="text-sm text-text-sub-600">© 2024 Catalyst</div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-sub-600 hover:bg-bg-weak-50"
            >
              <span aria-hidden>🌐</span>
              English
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="absolute right-0 top-0 size-full opacity-20" aria-hidden>
            <div className="size-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />
          </div>
          <section className="relative w-full max-w-[452px] select-none pb-11">
            <div className="px-6">
              <div className="flex w-full flex-col gap-10">
                <Avatar size="xl" className="bg-warning-base text-static-white">
                  <AvatarFallback className="bg-warning-base text-static-white">
                    SW
                  </AvatarFallback>
                </Avatar>
                <div className="flex w-full flex-col gap-7">
                  <div className="text-xl leading-snug text-static-white/[.72]">
                    <span className="text-static-white">
                      The Marketing Management app has revolutionized our tasks.
                    </span>{" "}
                    It&apos;s efficient and user-friendly, streamlining planning
                    to tracking.
                  </div>
                  <div>
                    <div className="text-sm font-medium text-static-white">
                      Sophia Williams
                    </div>
                    <div className="mt-1 text-xs text-static-white/[.72]">
                      CEO / Catalyst
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-6 flex gap-1.5">
              <span
                aria-hidden
                className="h-1 w-4 rounded-full bg-static-white transition-all"
              />
              <span
                aria-hidden
                className="size-1 shrink-0 rounded-full bg-(--dash-orange-800,#7a3a0d)"
              />
              <span
                aria-hidden
                className="size-1 shrink-0 rounded-full bg-(--dash-orange-800,#7a3a0d)"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function VerificationFormBody() {
  const [otp, setOtp] = React.useState("")
  return (
    <>
      <div className="flex flex-col items-center space-y-2">
        <AuthIconBadge>
          <RiMailCheckLine className="size-6 text-warning-base lg:size-7" />
        </AuthIconBadge>
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold tracking-tight text-text-strong-950 lg:text-2xl">
            Enter Verification Code
          </div>
          <div className="text-sm text-text-sub-600 lg:text-base">
            We&rsquo;ve sent a code to{" "}
            <span className="text-sm font-medium text-text-strong-950">
              james@alignui.com
            </span>
          </div>
        </div>
      </div>

      <Divider />

      {/* 4-digit OTP — auto-focus first slot, numeric pattern */}
      <div className="flex justify-center">
        <InputOTP
          maxLength={4}
          value={otp}
          onChange={(v) => setOtp(v)}
          autoFocus
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <FancyButton tone="primary">Verify</FancyButton>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm text-text-sub-600">
          Experiencing issues receiving the code?
        </span>
        <LinkButton tone="neutral" underline="always">
          Resend code
        </LinkButton>
      </div>
    </>
  )
}

export default function MarketingAuthVerificationPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Auth"
        title="Auth · Verification"
        description="Catalyst-style 4-digit code verification page ported from AlignUI Marketing Template. Auto-focus, numeric digit input, primary Verify CTA and a resend-code fallback."
      />

      <DocsSection title="Live preview">
        <DocsExample
          bare
          title="Full page"
          description="Renders the full shell with the OTP digit input. The right-pane testimonial uses the warning-tinted avatar (first slide of the carousel)."
          preview={
            <DocsTemplatePreview minWidth={1280}>
              <AuthShellPreview>
                <VerificationFormBody />
              </AuthShellPreview>
            </DocsTemplatePreview>
          }
          code={`<AuthShellPreview>
  <AuthIconBadge>
    <RiMailCheckLine className="size-6 text-warning-base lg:size-7" />
  </AuthIconBadge>
  <div className="text-xl font-semibold lg:text-2xl">Enter Verification Code</div>
  <div className="text-sm text-text-sub-600 lg:text-base">
    We've sent a code to <span className="font-medium text-text-strong-950">james@alignui.com</span>
  </div>

  <Divider />

  <InputOTP maxLength={4} value={otp} onChange={setOtp} autoFocus>
    <InputOTPGroup>
      <InputOTPSlot index={0} />
      <InputOTPSlot index={1} />
      <InputOTPSlot index={2} />
      <InputOTPSlot index={3} />
    </InputOTPGroup>
  </InputOTP>

  <FancyButton tone="primary">Verify</FancyButton>

  <span className="text-sm text-text-sub-600">Experiencing issues receiving the code?</span>
  <LinkButton tone="neutral" underline="always">Resend code</LinkButton>
</AuthShellPreview>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>
            <strong>Header</strong> — defaults to &ldquo;Changed your mind? Go
            back&rdquo; (the <code>/verification</code> route falls through to{" "}
            <code>defaultConfig</code> in <code>(auth)/header.tsx</code>).
          </li>
          <li>
            <strong>Icon badge</strong> — mail-check glyph (
            <code>RiMailCheckLine</code>) inside the standard shadowed well.
          </li>
          <li>
            <strong>Heading</strong> — &ldquo;Enter Verification Code&rdquo; +
            sub-copy:{" "}
            <code>
              We&rsquo;ve sent a code to{" "}
              <em>james@alignui.com</em>
            </code>{" "}
            (the email is rendered in <code>text-strong-950</code> label
            weight).
          </li>
          <li>
            <strong>Divider</strong> — <code>line-spacing</code> variant (soft
            section break before the input grid).
          </li>
          <li>
            <strong>Digit input</strong> — 4 OTP slots, auto-focus on mount,
            numeric input. Uses Dash <code>InputOTP</code> (built on{" "}
            <code>input-otp</code>) which mirrors the original{" "}
            <code>DigitInput.Root numInputs={`{4}`} shouldAutoFocus</code>.
          </li>
          <li>
            <strong>Submit</strong> — primary <code>FancyButton</code>, label
            &ldquo;Verify&rdquo; (no explicit size — defaults to{" "}
            <code>md</code>).
          </li>
          <li>
            <strong>Resend row</strong> — centered &ldquo;Experiencing issues
            receiving the code?&rdquo; + always-underlined neutral{" "}
            <code>LinkButton</code> &ldquo;Resend code&rdquo;.
          </li>
          <li>
            <strong>Footer + right pane</strong> — identical to Login.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Source map">
        <ul className="space-y-2 text-sm text-text-sub-600 list-disc pl-5">
          <li><code>app/(auth)/layout.tsx</code> → split shell.</li>
          <li>
            <code>app/(auth)/header.tsx</code> →{" "}
            <code>defaultConfig</code> (route not in <code>pathConfig</code>).
          </li>
          <li>
            <code>app/(auth)/verification/page.tsx</code> → form body.
          </li>
          <li>
            <code>components/ui/digit-input.tsx</code> →{" "}
            <code>@/registry/dash/ui/input-otp</code> (Dash equivalent).
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Primitive deviations">
        <ul className="space-y-2 text-sm text-text-sub-600 list-disc pl-5">
          <li>
            <strong>DigitInput.Root</strong> → Dash <code>InputOTP</code>{" "}
            (built on <code>input-otp</code>). <code>numInputs</code> →{" "}
            <code>maxLength</code>; <code>shouldAutoFocus</code> →{" "}
            <code>autoFocus</code>; rendered with explicit <code>InputOTPSlot</code>{" "}
            per index.
          </li>
          <li>
            Dash <code>InputOTPSlot</code> ships at{" "}
            <code>h-12 w-10 rounded-[10px]</code>. The original DigitInput uses
            a larger 80×64 slot — visual is similar but slightly more compact.
          </li>
          <li>
            <strong>LinkButton.Root variant=&quot;black&quot;</strong> → Dash{" "}
            <code>LinkButton tone=&quot;neutral&quot;</code>.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
