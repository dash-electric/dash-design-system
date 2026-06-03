"use client"

import * as React from "react"
import {
  RiEyeLine,
  RiEyeOffLine,
  RiInformationFill,
  RiLock2Line,
  RiMailLine,
  RiUserAddLine,
} from "@remixicon/react"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { SocialButton } from "@/registry/dash/ui/social-button"
import { ContentDivider } from "@/registry/dash/ui/divider"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
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
 * Marketing Auth — Register page. Ported 1:1 from AlignUI Marketing Template
 * (`app/(auth)/register/page.tsx`), re-skinned with Dash DS primitives
 * (2026-05-18).
 *
 * Source: marketing-template-master/app/(auth)/register/page.tsx
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

function PasswordField({ id, required }: { id: string; required?: boolean }) {
  const [showPassword, setShowPassword] = React.useState(false)
  return (
    <InputRoot>
      <InputIcon>
        <RiLock2Line className="size-5" />
      </InputIcon>
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder="••••••••••"
        required={required}
      />
      <button
        type="button"
        onClick={() => setShowPassword((s) => !s)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <RiEyeOffLine className="size-5 text-text-soft-400" />
        ) : (
          <RiEyeLine className="size-5 text-text-soft-400" />
        )}
      </button>
    </InputRoot>
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
              {/* Path /register → "Already have an account?" + Login CTA */}
              <span className="text-right text-sm text-text-sub-600">
                Already have an account?
              </span>
              <Button asChild style="lighter" tone="primary" size="xs">
                <a href="/login">Login</a>
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
                <Avatar size="xl" className="bg-information-base text-static-white">
                  <AvatarFallback className="bg-information-base text-static-white">
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
                className="h-1 w-4 rounded-full bg-static-white transition-all"
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

function RegisterFormBody() {
  return (
    <>
      <div className="flex flex-col items-center space-y-2">
        <AuthIconBadge>
          <RiUserAddLine className="size-6 text-warning-base lg:size-7" />
        </AuthIconBadge>
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold tracking-tight text-text-strong-950 lg:text-2xl">
            Create a new account
          </div>
          <div className="text-sm text-text-sub-600 lg:text-base">
            Enter your details to register.
          </div>
        </div>
      </div>

      {/* Social row — Apple, Google, LinkedIn */}
      <div className="grid w-full auto-cols-fr grid-flow-col gap-3">
        <SocialButton brand="apple" style="stroke" onlyIcon />
        <SocialButton brand="google" style="stroke" onlyIcon />
        <SocialButton brand="linkedin" style="stroke" onlyIcon />
      </div>

      <ContentDivider>OR</ContentDivider>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="fullname" required>
            Full Name
          </Label>
          <InputRoot>
            {/* Source has NO leading icon on Full Name input */}
            <Input
              id="fullname"
              type="text"
              placeholder="James Brown"
              required
            />
          </InputRoot>
        </div>

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
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" required>
            Password
          </Label>
          <PasswordField id="password" required />
          <Hint hideIcon>
            <span className="inline-flex items-start gap-1">
              <RiInformationFill
                aria-hidden
                className="size-4 shrink-0 text-text-sub-600"
              />
              <span>
                Must contain 1 uppercase letter, 1 number, min. 8 characters.
              </span>
            </span>
          </Hint>
        </div>
      </div>

      <FancyButton tone="primary" size="md">
        Register
      </FancyButton>
    </>
  )
}

export default function MarketingAuthRegisterPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Auth"
        title="Auth · Register"
        description="Catalyst-style registration page ported from AlignUI Marketing Template. Same split shell as Login; adds Full Name field and a password-rules hint."
      />

      <DocsSection title="Live preview">
        <DocsExample
          bare
          title="Full page"
          description="Full auth shell — header (logo + login CTA), full-name + email + password form, password rules hint, primary fancy submit, right-pane testimonial."
          preview={
            <DocsTemplatePreview minWidth={1280}>
              <AuthShellPreview>
                <RegisterFormBody />
              </AuthShellPreview>
            </DocsTemplatePreview>
          }
          code={`<AuthShellPreview>
  <AuthIconBadge>
    <RiUserAddLine className="size-6 text-warning-base lg:size-7" />
  </AuthIconBadge>
  <div className="text-xl font-semibold lg:text-2xl">Create a new account</div>
  <div className="text-sm text-text-sub-600 lg:text-base">Enter your details to register.</div>

  <div className="grid w-full auto-cols-fr grid-flow-col gap-3">
    <SocialButton brand="apple" style="stroke" onlyIcon />
    <SocialButton brand="google" style="stroke" onlyIcon />
    <SocialButton brand="linkedin" style="stroke" onlyIcon />
  </div>

  <ContentDivider>OR</ContentDivider>

  {/* Full Name — no leading icon, per source */}
  <Label htmlFor="fullname" required>Full Name</Label>
  <InputRoot>
    <Input id="fullname" type="text" placeholder="James Brown" required />
  </InputRoot>

  <Label htmlFor="email" required>Email Address</Label>
  <InputRoot>
    <InputIcon><RiMailLine className="size-5" /></InputIcon>
    <Input id="email" type="email" placeholder="hello@alignui.com" required />
  </InputRoot>

  <Label htmlFor="password" required>Password</Label>
  <PasswordField id="password" required />
  <Hint hideIcon>
    <RiInformationFill className="size-4 text-text-sub-600" />
    Must contain 1 uppercase letter, 1 number, min. 8 characters.
  </Hint>

  <FancyButton tone="primary" size="md">Register</FancyButton>
</AuthShellPreview>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>
            <strong>Header</strong> — &ldquo;Already have an account?&rdquo; +
            lighter primary <code>Button</code> linking to <code>/login</code>
            (path-driven swap, see <code>(auth)/header.tsx</code>).
          </li>
          <li>
            <strong>Icon badge</strong> — same well as Login, glyph is{" "}
            <code>RiUserAddLine</code>.
          </li>
          <li>
            <strong>Heading</strong> — &ldquo;Create a new account&rdquo; +
            &ldquo;Enter your details to register.&rdquo;
          </li>
          <li>
            <strong>Social row</strong> — Apple → Google → LinkedIn, stroke,
            icon-only.
          </li>
          <li>
            <strong>Fields</strong> — <code>Full Name</code> (no leading icon,
            placeholder &ldquo;James Brown&rdquo;) → <code>Email Address</code>{" "}
            (mail prefix) → <code>Password</code> (lock prefix, eye toggle).
          </li>
          <li>
            <strong>Hint</strong> — under password input:{" "}
            <code>Must contain 1 uppercase letter, 1 number, min. 8 characters.</code>{" "}
            (info icon = <code>RiInformationFill</code>).
          </li>
          <li>
            <strong>Submit</strong> — primary <code>FancyButton</code>, label
            &ldquo;Register&rdquo;.
          </li>
          <li>
            <strong>Footer</strong> — &ldquo;© 2024 Catalyst&rdquo; + language
            select.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Source map">
        <ul className="space-y-2 text-sm text-text-sub-600 list-disc pl-6">
          <li><code>app/(auth)/layout.tsx</code> → split shell.</li>
          <li>
            <code>app/(auth)/header.tsx</code> →{" "}
            <code>{`pathConfig['/register']`}</code> → &ldquo;Already have an
            account? Login&rdquo;.
          </li>
          <li><code>app/(auth)/register/page.tsx</code> → form body.</li>
          <li><code>app/(auth)/auth-slider.tsx</code> → right pane.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Primitive deviations">
        <ul className="space-y-2 text-sm text-text-sub-600 list-disc pl-6">
          <li>
            <strong>Hint.Root + Hint.Icon as=&#123;RiInformationFill&#125;</strong>{" "}
            → Dash <code>Hint hideIcon</code> + inline icon
            (Dash <code>Hint</code> ships its own neutral info icon; the
            template uses a filled variant, so we inline it).
          </li>
          <li>
            Other deviations same as Login (Divider → ContentDivider, Label
            asterisk → <code>required</code> prop, etc.).
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
