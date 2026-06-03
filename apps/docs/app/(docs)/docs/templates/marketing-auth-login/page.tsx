"use client"

import * as React from "react"
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
  RiUserLine,
} from "@remixicon/react"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { SocialButton } from "@/registry/dash/ui/social-button"
import { ContentDivider } from "@/registry/dash/ui/divider"
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
 * Marketing Auth — Login page. Ported 1:1 from AlignUI Marketing Template
 * (`app/(auth)/login/page.tsx` + layout + header + footer + auth-slider),
 * re-skinned with Dash DS primitives (2026-05-18).
 *
 * Source (verbatim copy preserved):
 *   marketing-template-master/app/(auth)/layout.tsx       — split shell
 *   marketing-template-master/app/(auth)/header.tsx       — Catalyst logo + register CTA
 *   marketing-template-master/app/(auth)/footer.tsx       — © 2024 Catalyst + language select
 *   marketing-template-master/app/(auth)/login/page.tsx   — form body
 *   marketing-template-master/app/(auth)/auth-slider.tsx  — testimonial carousel
 *
 * Note: dash-ds doesn't ship the original `Divider.Root variant="line-text"`
 * with center label — `ContentDivider` is the closest match (label sandwiched
 * between two hairlines). Functionally identical.
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

function PasswordField({
  id,
  required,
}: {
  id: string
  required?: boolean
}) {
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
  // 1:1 port of marketing-template (auth)/layout.tsx — split shell with brand
  // gradient bg behind the right pane and a rounded white card on the left.
  return (
    <div
      className="grid w-full min-h-[860px] lg:grid-cols-[minmax(0,1fr),500px] xl:grid-cols-[minmax(0,1fr),596px]"
      style={{
        background:
          "linear-gradient(180deg, #CA5F16 0%, #DC6818 25%, #E97D35 50%, #F1AC7E 75%, #F9DCC8 100%), #FFFFFF",
      }}
    >
      {/* Left: form card */}
      <div className="flex h-full flex-col p-1.5 lg:p-2 lg:pr-0">
        <div className="flex flex-1 flex-col rounded-2xl bg-bg-white-0 px-3.5 lg:px-12 lg:py-6">
          {/* Header */}
          <div className="mx-auto flex w-full items-center justify-between gap-6 py-3.5 lg:py-0">
            <a href="/" className="shrink-0">
              {/* Catalyst placeholder logo — original uses /images/placeholder/catalyst.svg */}
              <div className="flex size-8 items-center justify-center rounded-md bg-text-strong-950 text-static-white text-xs font-semibold">
                C
              </div>
            </a>
            <div className="flex items-center gap-3">
              <span className="text-right text-sm text-text-sub-600">
                Don&apos;t have an account?
              </span>
              <Button asChild style="lighter" tone="primary" size="xs">
                <a href="/register">Register</a>
              </Button>
            </div>
          </div>

          {/* Form body */}
          <div className="flex flex-1 flex-col py-6 lg:py-[100px]">
            <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6 md:translate-x-1.5">
              {children}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-4 pb-4 lg:pb-0">
            <div className="text-sm text-text-sub-600">© 2024 Catalyst</div>
            {/* LanguageSelect placeholder — original uses LanguageSelect component */}
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

      {/* Right: testimonial slider */}
      <div className="hidden lg:block">
        <div className="relative flex h-full flex-col items-center justify-center">
          {/* Decorative bg pattern slot (original: /images/auth-bg-pattern.svg) */}
          <div className="absolute right-0 top-0 size-full opacity-20" aria-hidden>
            <div className="size-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />
          </div>

          <section className="relative w-full max-w-[452px] select-none pb-12">
            <div className="px-6">
              <div className="flex w-full flex-col gap-10">
                <Avatar size="xl" className="bg-warning-base text-static-white">
                  <AvatarFallback className="bg-warning-base text-static-white">
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

function LoginFormBody() {
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <AuthIconBadge>
          <RiUserLine className="size-6 text-warning-base lg:size-7" />
        </AuthIconBadge>

        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold tracking-tight text-text-strong-950 lg:text-2xl">
            Login to your account
          </div>
          <div className="text-sm text-text-sub-600 lg:text-base">
            Enter your details to login.
          </div>
        </div>
      </div>

      {/* Social row — Apple, Google, LinkedIn (order matches source) */}
      <div className="grid w-full auto-cols-fr grid-flow-col gap-3">
        <SocialButton brand="apple" style="stroke" onlyIcon />
        <SocialButton brand="google" style="stroke" onlyIcon />
        <SocialButton brand="linkedin" style="stroke" onlyIcon />
      </div>

      <ContentDivider>OR</ContentDivider>

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
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" required>
            Password
          </Label>
          <PasswordField id="password" required />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-2">
          <Checkbox id="agree" />
          <label htmlFor="agree" className="block cursor-pointer text-sm">
            Keep me logged in
          </label>
        </div>
        <LinkButton tone="muted" size="md" underline="always" asChild>
          <a href="/reset-password">Forgot password?</a>
        </LinkButton>
      </div>

      <FancyButton tone="primary" size="md">
        Login
      </FancyButton>
    </>
  )
}

export default function MarketingAuthLoginPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Auth"
        title="Auth · Login"
        description="Catalyst-style login page ported from AlignUI Marketing Template. Split shell with form card on the left and a testimonial carousel on the right, brand gradient backdrop."
      />

      <DocsSection title="Live preview">
        <DocsExample
          bare
          title="Full page"
          description="Renders the entire auth shell — header (logo + register CTA), centered form, footer (© + language select), and right-pane testimonial slider — using Dash DS primitives."
          preview={
            <DocsTemplatePreview minWidth={1280}>
              <AuthShellPreview>
                <LoginFormBody />
              </AuthShellPreview>
            </DocsTemplatePreview>
          }
          code={`<AuthShellPreview>
  {/* Heading */}
  <AuthIconBadge>
    <RiUserLine className="size-6 text-warning-base lg:size-7" />
  </AuthIconBadge>
  <div className="text-xl font-semibold lg:text-2xl">Login to your account</div>
  <div className="text-sm text-text-sub-600 lg:text-base">Enter your details to login.</div>

  {/* Social row — Apple, Google, LinkedIn */}
  <div className="grid w-full auto-cols-fr grid-flow-col gap-3">
    <SocialButton brand="apple" style="stroke" onlyIcon />
    <SocialButton brand="google" style="stroke" onlyIcon />
    <SocialButton brand="linkedin" style="stroke" onlyIcon />
  </div>

  <ContentDivider>OR</ContentDivider>

  {/* Fields */}
  <Label htmlFor="email" required>Email Address</Label>
  <InputRoot>
    <InputIcon><RiMailLine className="size-5" /></InputIcon>
    <Input id="email" type="email" placeholder="hello@alignui.com" required />
  </InputRoot>

  <Label htmlFor="password" required>Password</Label>
  <PasswordField id="password" required />

  {/* Remember + forgot */}
  <Checkbox id="agree" />
  <label htmlFor="agree">Keep me logged in</label>
  <LinkButton tone="muted" size="md" underline="always" asChild>
    <a href="/reset-password">Forgot password?</a>
  </LinkButton>

  <FancyButton tone="primary" size="md">Login</FancyButton>
</AuthShellPreview>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>
            <strong>Shell</strong> — full-bleed orange brand gradient backdrop
            (<code>#CA5F16 → #F9DCC8</code>), rounded-2xl white form card on
            the left, full-height testimonial pane on the right (
            <code>lg:grid-cols-[1fr,500px]</code>,{" "}
            <code>xl:grid-cols-[1fr,596px]</code>).
          </li>
          <li>
            <strong>Header</strong> — Catalyst logo at left, secondary copy
            (&quot;Don&apos;t have an account?&quot;) + lighter primary
            <code>Button</code> linking to <code>/register</code> at right.
          </li>
          <li>
            <strong>Icon badge</strong> — 68/80px round well with a brand-tinted
            gradient halo (<code>before:</code> pseudo) wrapping a smaller
            48/56px white circle with a custom soft drop-shadow stack. Icon
            inside is <code>warning-base</code> orange.
          </li>
          <li>
            <strong>Form heading</strong> — &ldquo;Login to your account&rdquo;
            (h6/h5) + &ldquo;Enter your details to login.&rdquo; sub-copy.
          </li>
          <li>
            <strong>Social row</strong> — 3 stroke <code>SocialButton</code>{" "}
            icon-only: Apple → Google → LinkedIn (order verbatim from source).
          </li>
          <li>
            <strong>Divider</strong> — <code>ContentDivider</code> with{" "}
            <code>OR</code> label (original is{" "}
            <code>Divider.Root variant=&quot;line-text&quot;</code>).
          </li>
          <li>
            <strong>Fields</strong> — Email (mail icon prefix, type=email,
            required, placeholder <code>hello@alignui.com</code>) → Password
            (lock prefix, eye-toggle suffix, placeholder{" "}
            <code>••••••••••</code>).
          </li>
          <li>
            <strong>Row</strong> — &ldquo;Keep me logged in&rdquo; checkbox left,{" "}
            <code>Forgot password?</code> muted underline LinkButton right (→{" "}
            <code>/reset-password</code>).
          </li>
          <li>
            <strong>Submit</strong> — primary <code>FancyButton</code>, label
            &ldquo;Login&rdquo;.
          </li>
          <li>
            <strong>Footer</strong> — &ldquo;© 2024 Catalyst&rdquo; +
            language select.
          </li>
          <li>
            <strong>Right pane</strong> — Embla carousel (3 slides, all same
            Sophia Williams quote, only avatar tint differs:{" "}
            <code>yellow / blue / red</code>); decorative pattern svg in
            top-right, dot-stepper bottom-left.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Source map">
        <ul className="space-y-2 text-sm text-text-sub-600 list-disc pl-6">
          <li>
            <code>app/(auth)/layout.tsx</code> → <code>AuthShellPreview</code>{" "}
            (gradient + grid).
          </li>
          <li>
            <code>app/(auth)/header.tsx</code> → top row inside shell
            (logo + register CTA copy is path-driven in source; login route
            shows &quot;Register&quot; CTA).
          </li>
          <li>
            <code>app/(auth)/footer.tsx</code> → bottom row (© + language).
          </li>
          <li>
            <code>app/(auth)/login/page.tsx</code> → <code>LoginFormBody</code>.
          </li>
          <li>
            <code>app/(auth)/auth-slider.tsx</code> → right-pane testimonial
            (rendered as a single static slide in the docs preview — the
            original uses <code>embla-carousel-react</code> with 3 slides).
          </li>
          <li>
            Brand icons: <code>~/icons/brands/{`{apple,google,linkedin}`}.svg</code>{" "}
            → mapped to <code>SocialButton brand=&quot;apple|google|linkedin&quot;</code>{" "}
            in Dash DS (built-in vector glyphs).
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Primitive deviations">
        <ul className="space-y-2 text-sm text-text-sub-600 list-disc pl-6">
          <li>
            <strong>Divider.Root variant=&quot;line-text&quot;</strong> →{" "}
            <code>ContentDivider</code>. Same visual.
          </li>
          <li>
            <strong>FancyButton.Root variant=&quot;primary&quot;</strong> →{" "}
            <code>FancyButton tone=&quot;primary&quot;</code>. API rename only.
          </li>
          <li>
            <strong>LinkButton.Root variant=&quot;gray&quot;</strong> →{" "}
            <code>LinkButton tone=&quot;muted&quot;</code> (Dash semantic alias).
          </li>
          <li>
            <strong>Label.Root + Label.Asterisk</strong> → Dash{" "}
            <code>Label required</code> prop.
          </li>
          <li>
            <strong>SocialButton.Root + SocialButton.Icon</strong> → single
            <code>SocialButton</code> with built-in brand glyphs.
          </li>
          <li>
            <strong>LanguageSelect</strong> — not in Dash DS yet; rendered as
            a stub button (🌐 English) in the preview.
          </li>
          <li>
            <strong>Embla carousel</strong> — preview shows static first slide
            (Sophia Williams) with dot-stepper. Wire <code>embla-carousel-react</code>{" "}
            for production use.
          </li>
          <li>
            <strong>Catalyst logo</strong> — stand-in `C` tile (original uses{" "}
            <code>/images/placeholder/catalyst.svg</code>).
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
