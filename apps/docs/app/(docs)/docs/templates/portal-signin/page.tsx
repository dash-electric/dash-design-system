"use client"

import * as React from "react"
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
  RiUserLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { ContentDivider } from "@/registry/dash/ui/divider"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Portal Signin. Ported from Dash Next Portal v2 source (2026-05-19).
 * Source: app/[locale]/(auth)/signin/page.tsx + signin/layout.tsx
 * Layout: 40/60 split, white form panel + neutral hero panel with testimonial carousel.
 * i18n strings inlined from messages/en.json under `auth.signin.*`.
 */
export default function PortalSigninPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Signin"
        description="Production sign-in page for Dash Next Portal v2. Email + password, optional forgot-password link, divider, and signup CTA. Wrapped in the standard 40/60 split shell with a testimonial carousel hero on the right."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Sign In — 40/60 split shell"
          description='Source `t("title")` → "Sign In". Email validates via regex, password toggles via eye icon, Enter submits when both valid. Forgot-password link is gated by feature flag `portal_reset_forgot_password_activation`.'
          preview={
            <DocsTemplatePreview>
              <PortalAuthShell>
                <SigninForm />
              </PortalAuthShell>
            </DocsTemplatePreview>
          }
          code={`<div className="grid lg:grid-cols-[40%,60%] min-h-screen bg-bg-weak-50">
  <div className="p-2 pr-0">
    <div className="rounded-2xl bg-bg-white-0 px-12 py-6 flex flex-col flex-1">
      <AuthHeader />
      <div className="mx-auto w-full max-w-[392px] flex flex-col gap-6 flex-1 justify-center">
        {/* Icon halo */}
        <div className="size-20 rounded-full grid place-items-center">
          <RiUserLine className="size-7 text-text-sub-600" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-title-h5">Sign In</div>
          <div className="text-paragraph-md text-text-sub-600">
            Welcome back! Please sign in to continue.
          </div>
        </div>
        <div className="space-y-3">
          <Label>Email</Label>
          <InputRoot>
            <InputIcon><RiMailLine /></InputIcon>
            <Input type="email" placeholder="john.doe@example.com" />
          </InputRoot>
          <Label>Password</Label>
          <InputRoot>
            <InputIcon><RiLock2Line /></InputIcon>
            <Input type="password" placeholder="••••••••••" />
          </InputRoot>
        </div>
        <LinkButton variant="gray" underline href="/reset-password">
          Forgot Password?
        </LinkButton>
        <FancyButton variant="primary">Sign In</FancyButton>
        <ContentDivider>Don't have an account?</ContentDivider>
        <Button variant="neutral" mode="stroke">Sign Up</Button>
      </div>
      <AuthFooter />
    </div>
  </div>
  <AuthCarousel />
</div>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Shell</strong> — 40/60 grid; left = white panel <code>rounded-2xl</code> with header/footer + form column max-w-[392px]; right = testimonial carousel.</li>
          <li><strong>Header</strong> — Dash full logo on the left, <code>LanguageSelect</code> on the right.</li>
          <li><strong>Hero icon</strong> — 80px halo with gradient pseudo-element ring, inner 56px tile, <code>RiUserLine</code> 28px.</li>
          <li><strong>Title</strong> — “Sign In” / subtitle “Welcome back! Please sign in to continue.”</li>
          <li><strong>Fields</strong> — Email (with <code>RiMailLine</code> icon) + Password (with <code>RiLock2Line</code> icon and eye toggle).</li>
          <li><strong>Forgot Password</strong> — right-aligned <code>LinkButton</code> variant=&quot;gray&quot; underline (feature-flagged).</li>
          <li><strong>Primary CTA</strong> — <code>FancyButton</code> labelled “Sign In”, disabled until email valid + password present.</li>
          <li><strong>Divider</strong> — “Don&apos;t have an account?” inline content divider.</li>
          <li><strong>Secondary CTA</strong> — neutral stroke <code>Button</code> labelled “Sign Up”, routes to <code>/signup</code>.</li>
          <li><strong>Footer</strong> — © 2025 Dash Electric copyright + Instagram + LinkedIn social buttons.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><code>InputRoot</code>, <code>Input</code>, <code>InputIcon</code> — email + password fields.</li>
          <li><code>Label</code> — field labels.</li>
          <li><code>LinkButton</code> — forgot-password link.</li>
          <li><code>FancyButton</code> — primary submit.</li>
          <li><code>Button</code> — secondary “Sign Up” outline.</li>
          <li><code>ContentDivider</code> — “Don&apos;t have an account?” separator.</li>
          <li>Icons: <code>RiUserLine</code>, <code>RiMailLine</code>, <code>RiLock2Line</code>, <code>RiEyeLine</code>, <code>RiEyeOffLine</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* -------------------------------------------------------------------------- */
/* Shell + carousel hero — shared shape for all auth pages                    */
/* -------------------------------------------------------------------------- */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

export function PortalAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[820px] flex-col bg-bg-weak-50">
      <div className="grid flex-1 lg:grid-cols-[40%,60%]">
        <div className="flex flex-col p-2 lg:pr-0">
          <div className="flex flex-1 flex-col rounded-2xl bg-bg-white-0 px-12 py-6">
            <AuthHeader />
            <div className="mx-auto flex w-full max-w-[392px] flex-1 flex-col justify-center gap-6 py-10">
              {children}
            </div>
            <AuthFooter />
          </div>
        </div>
        <AuthCarousel />
      </div>
      <AuthFooterBar />
    </div>
  )
}

function AuthHeader() {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5">
      <div className="flex items-center gap-2 text-label-md font-semibold tracking-tight text-text-strong-950">
        <span className="grid size-7 place-items-center rounded-md bg-(--dash-purple-600) text-white text-xs">D</span>
        dash
      </div>
      <div className="flex items-center gap-3 text-sm text-text-sub-600">
        <span>EN</span>
      </div>
    </div>
  )
}

function AuthFooter() {
  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pb-4 pt-6">
      <div className="text-paragraph-xs text-text-sub-600">
        © 2025 Dash Electric. All rights reserved
      </div>
      <div className="flex items-center gap-2 text-text-sub-600">
        <span className="grid size-7 place-items-center rounded-full border border-stroke-soft-200 text-xs">IG</span>
        <span className="grid size-7 place-items-center rounded-full border border-stroke-soft-200 text-xs">in</span>
      </div>
    </div>
  )
}

function AuthCarousel() {
  return (
    <div className="hidden lg:block">
      <div className="relative flex h-full flex-col items-center justify-center gap-10 px-12 py-10">
        <div className="rounded-2xl bg-bg-white-0 p-2 shadow-lg">
          <div className="grid h-[360px] w-[460px] place-items-center rounded-xl bg-bg-weak-50 text-text-soft-400">
            Product illustration
          </div>
        </div>
        <p className="max-w-[520px] text-center text-title-h6 leading-[1.4] text-text-strong-950">
          “We appreciate DASH&apos;s reliable service and dedicated courier
          support that ensures efficient deliveries across Jabodetabek. They&apos;re
          responsive, flexible, and always solution-oriented, making them a
          trusted logistics partner.”
        </p>
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-(--dash-purple-100)" />
          <div>
            <div className="text-label-md font-medium">Rendy Mandhadri</div>
            <div className="text-paragraph-sm text-text-sub-600">
              Logistic &amp; Inventory Manager at SATURDAYS
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-primary-base" />
          <span className="size-2 rounded-full bg-bg-soft-200" />
          <span className="size-2 rounded-full bg-bg-soft-200" />
        </div>
      </div>
    </div>
  )
}

function AuthFooterBar() {
  return (
    <div className="flex w-full flex-col gap-4 bg-bg-surface-800 px-8 py-4 text-white lg:flex-row lg:items-center lg:gap-3">
      <div className="flex w-full flex-col gap-1">
        <p className="text-label-sm">Layanan Pengaduan Konsumen</p>
        <p className="text-paragraph-xs">PT Dash Platform Indonesia</p>
      </div>
      <div className="flex w-full flex-col gap-1">
        <p className="text-paragraph-xs">Email: info@dashelectric.co</p>
        <p className="text-paragraph-xs">Whatsapp: +62 813 1388 4737</p>
      </div>
      <div className="flex w-full flex-col gap-1">
        <p className="text-paragraph-xs">Kementerian Perdagangan Republik Indonesia</p>
        <p className="text-paragraph-xs">Whatsapp: +62 853-1111-1010</p>
      </div>
      <div className="flex w-full flex-col gap-1">
        <p className="text-paragraph-xs">
          Direktorat Jenderal Perlindungan Konsumen dan Tertib Niaga
        </p>
      </div>
    </div>
  )
}

export function HaloIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative flex size-20 shrink-0 items-center justify-center rounded-full",
          "before:absolute before:inset-0 before:rounded-full",
          "before:bg-gradient-to-b before:from-primary-base before:to-transparent before:opacity-10",
        )}
      >
        <div className="relative z-10 grid size-14 place-items-center rounded-full bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 shadow-sm">
          <Icon className="size-7 text-text-sub-600" />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Signin form                                                                */
/* -------------------------------------------------------------------------- */

function SigninForm() {
  const [show, setShow] = React.useState(false)
  return (
    <>
      <HaloIcon icon={RiUserLine} />
      <div className="space-y-1 text-center">
        <div className="text-title-h5 text-text-strong-950">Sign In</div>
        <div className="text-paragraph-md text-text-sub-600">
          Welcome back! Please sign in to continue.
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="signin-email">Email</Label>
          <InputRoot>
            <InputIcon><RiMailLine className="size-4" /></InputIcon>
            <Input id="signin-email" type="email" placeholder="john.doe@example.com" />
          </InputRoot>
        </div>
        <div className="space-y-1">
          <Label htmlFor="signin-password">Password</Label>
          <InputRoot>
            <InputIcon><RiLock2Line className="size-4" /></InputIcon>
            <Input
              id="signin-password"
              type={show ? "text" : "password"}
              placeholder="••••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="text-text-soft-400"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <RiEyeOffLine className="size-5" /> : <RiEyeLine className="size-5" />}
            </button>
          </InputRoot>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <LinkButton tone="muted" size="md" underline="always">
          Forgot Password?
        </LinkButton>
      </div>

      <FancyButton tone="primary" size="md">
        Sign In
      </FancyButton>
      <ContentDivider>Don&apos;t have an account?</ContentDivider>
      <Button tone="neutral" style="stroke">
        Sign Up
      </Button>
    </>
  )
}
