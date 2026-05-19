"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiEyeLine,
  RiEyeOffLine,
  RiInformationFill,
  RiLock2Line,
  RiMailLine,
  RiUserAddFill,
} from "@remixicon/react"

import { cn } from "@/registry/dash/lib/utils"
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
 * Finance Auth — Register (deep). Ported from AlignUI Finance Template
 * `app/(auth)/register/page.tsx` (2026-05-19).
 *
 * Source verbatim copy:
 *   Header: "Already have an account?" → "Login" (LinkButton primary)
 *   Title : "Create a new account"
 *   Sub   : "Enter your details to register."
 *   Field : "Full Name *" placeholder "James Brown"
 *   Field : "Email Address *" placeholder "hello@alignui.com"
 *   Field : "Password *" placeholder "••••••••••"  +  hint:
 *           "Must contain 1 uppercase letter, 1 number, min. 8 characters."
 *   CTA   : FancyButton primary — "Register"
 *   Legal : "By clicking Register, you agree to accept Apex Financial's"
 *           + LinkButton black underlined "Terms of Service"
 */
export default function FinanceAuthRegisterDeepPage() {
  return (
    <TooltipProvider>
      <DocsPageShell>
        <DocsHeader
          category="Templates / Finance / Auth"
          title="Register (deep)"
          description="Centered-card sign-up screen — full name + email + password (with password rule hint), legal acceptance copy + Terms link. Verbatim copy from AlignUI Finance Template."
        />

        <DocsSection title="Full preview">
          <DocsExample
            bare
            title="Apex — register"
            preview={
              <DocsTemplatePreview>
                <AuthShell
                  text="Already have an account?"
                  linkLabel="Login"
                  linkHref="/login"
                >
                  <RegisterCard />
                </AuthShell>
              </DocsTemplatePreview>
            }
            code={REGISTER_SNIPPET}
          />
        </DocsSection>

        <DocsSection title="Anatomy">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
            <li>
              <code>AuthHeader</code> — "Already have an account?" / "Login".
            </li>
            <li>
              <code>IconBadge</code> — <code>RiUserAddFill</code> on halo.
            </li>
            <li>
              3 fields stacked: Full Name → Email → Password.
            </li>
            <li>
              Password rule <code>Hint</code> row uses{" "}
              <code>RiInformationFill</code> + paragraph-xs.
            </li>
            <li>
              <code>FancyButton</code> primary medium — "Register".
            </li>
            <li>
              Legal copy <em>"By clicking Register, you agree to accept Apex
              Financial&apos;s"</em> + inline <code>LinkButton</code> "Terms of Service".
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Verbatim copy">
          <DocsCode
            language="text"
            code={`Header link  : Already have an account?  →  Login
Title        : Create a new account
Sub          : Enter your details to register.
Field        : Full Name *               placeholder "James Brown"
Field        : Email Address *           placeholder "hello@alignui.com"
Field        : Password *                placeholder "••••••••••"
Hint         : (info icon) Must contain 1 uppercase letter, 1 number, min. 8 characters.
Submit       : Register
Legal        : By clicking Register, you agree to accept Apex Financial's
               [Terms of Service]
Footer       : © 2024 Apex Financial`}
          />
        </DocsSection>

        <DocsSection title="Primitive substitutions">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
            <li>
              <code>Input.Root</code>/<code>Input.Wrapper</code>/<code>Input.Icon</code> →{" "}
              <code>InputRoot</code> + <code>InputIcon</code> + <code>Input</code>.
            </li>
            <li>
              <code>Label.Asterisk</code> → <code>Label required</code>.
            </li>
            <li>
              <code>LinkButton variant="black"</code> →{" "}
              <code>LinkButton tone="neutral"</code>.
            </li>
            <li>
              Inline password-rule paragraph kept as raw flex row (Hint primitive
              also viable — source uses plain layout).
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
/* Shared auth shell                                                           */
/* -------------------------------------------------------------------------- */

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
    <div className="flex min-h-[860px] flex-col">
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

function RegisterCard() {
  return (
    <div className="w-full max-w-[472px] px-4">
      <div className="flex w-full flex-col gap-6 rounded-[20px] bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:p-8">
        <div className="flex flex-col items-center gap-2">
          <IconHalo>
            <RiUserAddFill className="size-6 text-text-sub-600 lg:size-8" />
          </IconHalo>

          <div className="space-y-1 text-center">
            <div className="text-lg font-semibold tracking-tight text-text-strong-950 lg:text-xl">
              Create a new account
            </div>
            <div className="text-sm text-text-sub-600 lg:text-base">
              Enter your details to register.
            </div>
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="reg-fullname" required>
              Full Name
            </Label>
            <InputRoot size="lg">
              <InputIcon>
                <RiMailLine className="size-5" />
              </InputIcon>
              <Input
                id="reg-fullname"
                type="text"
                placeholder="James Brown"
                required
              />
            </InputRoot>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="reg-email" required>
              Email Address
            </Label>
            <InputRoot size="lg">
              <InputIcon>
                <RiMailLine className="size-5" />
              </InputIcon>
              <Input
                id="reg-email"
                type="email"
                placeholder="hello@alignui.com"
                required
              />
            </InputRoot>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="reg-password" required>
              Password
            </Label>
            <PasswordField id="reg-password" />
            <div className="flex gap-1 text-xs text-text-sub-600">
              <RiInformationFill className="size-4 shrink-0 text-text-soft-400" />
              Must contain 1 uppercase letter, 1 number, min. 8 characters.
            </div>
          </div>
        </div>

        <FancyButton tone="primary" size="md" className="w-full">
          Register
        </FancyButton>

        <div className="text-center text-sm text-text-sub-600">
          By clicking Register, you agree to accept Apex Financial&apos;s
          <div className="inline-block pt-1 align-baseline">
            <LinkButton
              tone="neutral"
              size="md"
              underline="always"
              className="px-1"
            >
              Terms of Service
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}

const REGISTER_SNIPPET = `<AuthShell text="Already have an account?" linkLabel="Login">
  <Card>
    <IconHalo><RiUserAddFill /></IconHalo>
    <h1>Create a new account</h1>
    <p>Enter your details to register.</p>

    <Divider />

    <Label htmlFor="fullname" required>Full Name</Label>
    <Input placeholder="James Brown" required />

    <Label htmlFor="email" required>Email Address</Label>
    <Input type="email" placeholder="hello@alignui.com" required />

    <Label htmlFor="password" required>Password</Label>
    <PasswordField id="password" />
    <div className="flex gap-1 text-xs text-text-sub-600">
      <RiInformationFill className="size-4 text-text-soft-400" />
      Must contain 1 uppercase letter, 1 number, min. 8 characters.
    </div>

    <FancyButton tone="primary" className="w-full">Register</FancyButton>

    <p>
      By clicking Register, you agree to accept Apex Financial's
      <LinkButton tone="neutral" underline="always">Terms of Service</LinkButton>
    </p>
  </Card>
</AuthShell>`
