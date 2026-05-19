"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
  RiUserFill,
} from "@remixicon/react"

import { cn } from "@/registry/dash/lib/utils"
import { Button } from "@/registry/dash/ui/button"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { Divider } from "@/registry/dash/ui/divider"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import {
  InputRoot,
  Input,
  InputIcon,
} from "@/registry/dash/ui/input"
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
 * Finance Auth — Login (deep). Ported from AlignUI Finance Template
 * `app/(auth)/login/page.tsx` + shared layout/header/footer (2026-05-19).
 *
 * Source verbatim copy:
 *   Header: "Don't have an account?" → "Register" (LinkButton primary, underlined)
 *   Title : "Login to your account"
 *   Sub   : "Enter your details to login."
 *   Field : "Email Address *" placeholder "hello@alignui.com"
 *   Field : "Password *" placeholder "••••••••••" (eye/eye-off toggle)
 *   Row   : "Keep me logged in" + "Forgot password?" (LinkButton gray, underlined)
 *   CTA   : FancyButton primary medium — "Login"
 *   Footer: "© 2024 Apex Financial"
 */
export default function FinanceAuthLoginDeepPage() {
  return (
    <TooltipProvider>
      <DocsPageShell>
        <DocsHeader
          category="Templates / Finance / Auth"
          title="Login (deep)"
          description="Centered-card login screen on a soft-pattern background. Apex brand + email/password + Keep-me-logged-in + forgot-password link + FancyButton submit. Verbatim copy from AlignUI Finance Template."
        />

        <DocsSection title="Full preview">
          <DocsExample
            bare
            title="Apex — login"
            preview={
              <DocsTemplatePreview>
                <AuthShellLogin>
                  <LoginCard />
                </AuthShellLogin>
              </DocsTemplatePreview>
            }
            code={LOGIN_SNIPPET}
          />
        </DocsSection>

        <DocsSection title="Anatomy">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
            <li>
              <code>AuthHeader</code> — Apex 40×40 logo + "Don&apos;t have an account?" /
              "Register" <code>LinkButton</code>.
            </li>
            <li>
              <code>pattern</code> — soft auth-pattern.svg, absolutely positioned
              -z-10 max-w-[1140px], translate-center.
            </li>
            <li>
              <code>Card</code> — 472px max-w, radius-20, ring-stroke-soft-200,
              shadow-regular-xs, padding 5/8.
            </li>
            <li>
              <code>IconBadge</code> — 68/96 outer halo + 48/64 inner ring filled
              with bg-white-0; <code>RiUserFill</code> glyph.
            </li>
            <li>
              <code>Form</code> — Email + Password (with show/hide eye), gap-3.
            </li>
            <li>
              <code>SupportRow</code> — checkbox "Keep me logged in" + "Forgot password?".
            </li>
            <li>
              <code>FancyButton</code> primary medium — "Login".
            </li>
            <li>
              <code>AuthFooter</code> — "© 2024 Apex Financial" + LanguageSelect.
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Verbatim copy">
          <DocsCode
            language="text"
            code={`Header link  : Don't have an account?  →  Register
Title        : Login to your account
Sub          : Enter your details to login.
Field        : Email Address *           placeholder "hello@alignui.com"
Field        : Password *                placeholder "••••••••••"
Checkbox     : Keep me logged in
Link         : Forgot password?
Submit       : Login
Footer       : © 2024 Apex Financial`}
          />
        </DocsSection>

        <DocsSection title="Primitive substitutions">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
            <li>
              <code>@/components/ui/input</code> Root/Wrapper/Icon/Input →{" "}
              <code>@/registry/dash/ui/input</code> InputRoot/InputIcon/Input.
            </li>
            <li>
              <code>@/components/ui/label</code> Root/Asterisk →{" "}
              <code>@/registry/dash/ui/label</code> Label with{" "}
              <code>required</code>.
            </li>
            <li>
              <code>@/components/ui/checkbox</code> Root →{" "}
              <code>@/registry/dash/ui/checkbox</code> Checkbox.
            </li>
            <li>
              <code>@/components/ui/fancy-button</code> Root →{" "}
              <code>@/registry/dash/ui/fancy-button</code> FancyButton.
            </li>
            <li>
              <code>@/components/ui/link-button</code> Root variant=&quot;primary&quot;/&quot;gray&quot;
              → <code>@/registry/dash/ui/link-button</code> LinkButton tone=&quot;primary&quot;/&quot;muted&quot;.
            </li>
            <li>
              <code>@/components/ui/divider</code> Root →{" "}
              <code>@/registry/dash/ui/divider</code> Divider.
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

/* -------------------------------------------------------------------------- */
/* Shared auth shell — header bar + patterned bg + footer                      */
/* -------------------------------------------------------------------------- */

function AuthShellLogin({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[820px] flex-col">
      <AuthHeader
        text="Don't have an account?"
        linkLabel="Register"
        linkHref="/register"
      />
      <div className="relative isolate flex w-full flex-1 flex-col items-center justify-center py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[318px] w-full max-w-[1140px] -translate-x-1/2 -translate-y-1/2 rounded-[40px] bg-gradient-to-br from-(--dash-purple-100)/40 via-(--dash-purple-50)/30 to-transparent opacity-70"
        />
        {children}
      </div>
      <AuthFooter />
    </div>
  )
}

function AuthHeader({
  text,
  linkLabel,
  linkHref,
}: {
  text: string
  linkLabel: string
  linkHref: string
}) {
  return (
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
  )
}

function AuthFooter() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between p-6">
      <div className="text-sm text-text-sub-600">© 2024 Apex Financial</div>
      <div className="text-sm text-text-sub-600">ENG</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Login card                                                                  */
/* -------------------------------------------------------------------------- */

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

function PasswordField({ id }: { id: string }) {
  const [show, setShow] = React.useState(false)
  return (
    <InputRoot size="lg">
      <InputIcon>
        <RiLock2Line className="size-5" />
      </InputIcon>
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder="••••••••••"
        required
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((s) => !s)}
        className="text-text-soft-400"
      >
        {show ? (
          <RiEyeOffLine className="size-5" />
        ) : (
          <RiEyeLine className="size-5" />
        )}
      </button>
    </InputRoot>
  )
}

function LoginCard() {
  return (
    <div className="w-full max-w-[472px] px-4">
      <div className="flex w-full flex-col gap-6 rounded-[20px] bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8">
        <div className="flex flex-col items-center gap-2">
          <IconHalo>
            <RiUserFill className="size-6 text-text-sub-600 lg:size-8" />
          </IconHalo>

          <div className="space-y-1 text-center">
            <div className="text-lg font-semibold tracking-tight text-text-strong-950 lg:text-xl">
              Login to your account
            </div>
            <div className="text-sm text-text-sub-600 lg:text-base">
              Enter your details to login.
            </div>
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="login-email" required>
              Email Address
            </Label>
            <InputRoot size="lg">
              <InputIcon>
                <RiMailLine className="size-5" />
              </InputIcon>
              <Input
                id="login-email"
                type="email"
                placeholder="hello@alignui.com"
                required
              />
            </InputRoot>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="login-password" required>
              Password
            </Label>
            <PasswordField id="login-password" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-2">
            <Checkbox id="agree" />
            <label
              htmlFor="agree"
              className="block cursor-pointer text-sm text-text-strong-950"
            >
              Keep me logged in
            </label>
          </div>
          <LinkButton tone="muted" size="md" underline="always" asChild>
            <Link href="/reset-password">Forgot password?</Link>
          </LinkButton>
        </div>

        <FancyButton tone="primary" size="md" className="w-full">
          Login
        </FancyButton>
      </div>
    </div>
  )
}

const LOGIN_SNIPPET = `<AuthShell> {/* Apex header + pattern + footer */}
  <Card className="rounded-[20px] ring-1 ring-stroke-soft-200 p-8">
    <IconHalo><RiUserFill /></IconHalo>
    <h1>Login to your account</h1>
    <p>Enter your details to login.</p>

    <Divider />

    <Label htmlFor="email" required>Email Address</Label>
    <InputRoot size="lg">
      <InputIcon><RiMailLine /></InputIcon>
      <Input id="email" type="email" placeholder="hello@alignui.com" required />
    </InputRoot>

    <Label htmlFor="password" required>Password</Label>
    <PasswordField id="password" /> {/* RiLock2Line + eye toggle */}

    <div className="flex justify-between">
      <label><Checkbox id="agree" /> Keep me logged in</label>
      <LinkButton tone="muted" underline="always">Forgot password?</LinkButton>
    </div>

    <FancyButton tone="primary" size="md" className="w-full">Login</FancyButton>
  </Card>
</AuthShell>`
