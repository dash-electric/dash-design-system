"use client"

import * as React from "react"
import {
  RiDoorLockLine,
  RiInformationFill,
  RiMailLine,
} from "@remixicon/react"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Divider } from "@/registry/dash/ui/divider"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { Button } from "@/registry/dash/ui/button"
import { Hint } from "@/registry/dash/ui/hint"
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
 * Marketing Auth — Reset Password page. Ported 1:1 from AlignUI Marketing
 * Template (`app/(auth)/reset-password/page.tsx`), Dash-skinned (2026-05-18).
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
        <div className="flex flex-1 flex-col rounded-2xl bg-bg-white-0 px-3.5 lg:px-12 lg:py-6">
          <div className="mx-auto flex w-full items-center justify-between gap-6 py-3.5 lg:py-0">
            <a href="/" className="shrink-0">
              <div className="flex size-8 items-center justify-center rounded-md bg-text-strong-950 text-static-white text-xs font-semibold">
                C
              </div>
            </a>
            <div className="flex items-center gap-3">
              {/* Path /reset-password → "Changed your mind?" + Go back CTA */}
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
          <section className="relative w-full max-w-[452px] select-none pb-12">
            <div className="px-6">
              <div className="flex w-full flex-col gap-10">
                <Avatar size="xl" className="bg-error-base text-static-white">
                  <AvatarFallback className="bg-error-base text-static-white">
                    SW
                  </AvatarFallback>
                </Avatar>
                <div className="flex w-full flex-col gap-8">
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
                className="size-1 shrink-0 rounded-full bg-(--dash-orange-800,#7a3a0d)"
              />
              <span
                aria-hidden
                className="size-1 shrink-0 rounded-full bg-(--dash-orange-800,#7a3a0d)"
              />
              <span
                aria-hidden
                className="h-1 w-4 rounded-full bg-static-white transition-all"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function ResetPasswordFormBody() {
  return (
    <>
      <div className="flex flex-col items-center space-y-2">
        <AuthIconBadge>
          <RiDoorLockLine className="size-6 text-warning-base lg:size-7" />
        </AuthIconBadge>
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold tracking-tight text-text-strong-950 lg:text-2xl">
            Reset Password
          </div>
          <div className="text-sm text-text-sub-600 lg:text-base">
            Enter your email to reset your password.
          </div>
        </div>
      </div>

      {/* Divider variant="line-spacing" — line + extra vertical breathing room */}
      <Divider />

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email" required>
            Email Address
          </Label>
          <InputRoot>
            <InputIcon>
              <RiMailLine className="size-5" />
            </InputIcon>
            <Input
              id="email"
              type="email"
              placeholder="hello@alignui.com"
              required
            />
          </InputRoot>
          <Hint hideIcon>
            <span className="inline-flex items-start gap-1">
              <RiInformationFill
                aria-hidden
                className="size-4 shrink-0 text-text-sub-600"
              />
              <span>Enter the email with which you&apos;ve registered.</span>
            </span>
          </Hint>
        </div>
      </div>

      <FancyButton tone="primary" size="md">
        Reset Password
      </FancyButton>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm text-text-sub-600">
          Don&rsquo;t have access anymore?
        </span>
        <LinkButton tone="neutral" size="md" underline="always">
          Try another method
        </LinkButton>
      </div>
    </>
  )
}

export default function MarketingAuthResetPasswordPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Auth"
        title="Auth · Reset Password"
        description="Catalyst-style reset-password page ported from AlignUI Marketing Template. Email-only single field, secondary 'Try another method' link at the bottom."
      />

      <DocsSection title="Live preview">
        <DocsExample
          bare
          title="Full page"
          description="Renders the entire auth shell. Header swaps to the 'Changed your mind? → Go back' variant, body is a single email input + reset CTA + recovery fallback."
          preview={
            <DocsTemplatePreview minWidth={1280}>
              <AuthShellPreview>
                <ResetPasswordFormBody />
              </AuthShellPreview>
            </DocsTemplatePreview>
          }
          code={`<AuthShellPreview>
  <AuthIconBadge>
    <RiDoorLockLine className="size-6 text-warning-base lg:size-7" />
  </AuthIconBadge>
  <div className="text-xl font-semibold lg:text-2xl">Reset Password</div>
  <div className="text-sm text-text-sub-600 lg:text-base">Enter your email to reset your password.</div>

  <Divider /> {/* Divider variant="line-spacing" */}

  <Label htmlFor="email" required>Email Address</Label>
  <InputRoot>
    <InputIcon><RiMailLine className="size-5" /></InputIcon>
    <Input id="email" type="email" placeholder="hello@alignui.com" required />
  </InputRoot>
  <Hint hideIcon>
    <RiInformationFill className="size-4 text-text-sub-600" />
    Enter the email with which you've registered.
  </Hint>

  <FancyButton tone="primary" size="md">Reset Password</FancyButton>

  <span className="text-sm text-text-sub-600">Don't have access anymore?</span>
  <LinkButton tone="neutral" size="md" underline="always">Try another method</LinkButton>
</AuthShellPreview>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>
            <strong>Header</strong> — &ldquo;Changed your mind?&rdquo; +
            lighter primary <code>Button</code> &ldquo;Go back&rdquo; linking to{" "}
            <code>/</code> (path-driven copy swap).
          </li>
          <li>
            <strong>Icon badge</strong> — door-lock glyph (<code>RiDoorLockLine</code>),
            same warning-orange tint and shadowed well.
          </li>
          <li>
            <strong>Heading</strong> — &ldquo;Reset Password&rdquo; +
            &ldquo;Enter your email to reset your password.&rdquo;
          </li>
          <li>
            <strong>Divider</strong> — <code>line-spacing</code> variant
            (horizontal hairline, no label). Used as a soft section break.
          </li>
          <li>
            <strong>Field</strong> — single email input (mail prefix, required,
            placeholder <code>hello@alignui.com</code>) +{" "}
            <code>Enter the email with which you&apos;ve registered.</code>{" "}
            hint underneath (info icon = <code>RiInformationFill</code>).
          </li>
          <li>
            <strong>Submit</strong> — primary <code>FancyButton</code>, label
            &ldquo;Reset Password&rdquo;.
          </li>
          <li>
            <strong>Fallback row</strong> — centered &ldquo;Don&rsquo;t have
            access anymore?&rdquo; copy + always-underlined neutral{" "}
            <code>LinkButton</code> &ldquo;Try another method&rdquo;.
          </li>
          <li>
            <strong>Footer + right pane</strong> — identical to Login.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Source map">
        <ul className="space-y-2 text-sm text-text-sub-600 list-disc pl-6">
          <li><code>app/(auth)/layout.tsx</code> → split shell.</li>
          <li>
            <code>app/(auth)/header.tsx</code> →{" "}
            <code>{`pathConfig['/reset-password']`}</code> → &ldquo;Changed
            your mind? Go back&rdquo;.
          </li>
          <li>
            <code>app/(auth)/reset-password/page.tsx</code> → form body.
          </li>
          <li><code>app/(auth)/auth-slider.tsx</code> → right pane.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Primitive deviations">
        <ul className="space-y-2 text-sm text-text-sub-600 list-disc pl-6">
          <li>
            <strong>Divider.Root variant=&quot;line-spacing&quot;</strong> →
            Dash <code>Divider</code>. The original variant adds extra Y-padding
            on the spacer; the surrounding <code>gap-6</code> already provides
            equivalent breathing room in Dash.
          </li>
          <li>
            <strong>LinkButton.Root variant=&quot;black&quot;</strong> → Dash{" "}
            <code>LinkButton tone=&quot;neutral&quot;</code> (alias).
          </li>
          <li>
            Hint icon inlined (see Register page note).
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
