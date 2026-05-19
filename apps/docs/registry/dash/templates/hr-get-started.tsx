"use client"

import * as React from "react"
import { RiUserAddLine as UserPlus, RiMailLine as Mail, RiQuestionLine as HelpCircle, RiCloseLine as X } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { SocialButton } from "@/registry/dash/ui/social-button"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrGetStarted — ported 1:1 (structural parity) from AlignUI Pro Figma node 3903:28634.
 * Synergy HR onboarding step 0 — entry: social SSO row, OR divider, email field,
 * T&C checkbox, primary Get Started CTA, "Already have an account? Login" footer.
 *
 * Single-column centered layout (NOT split-screen), with sticky brand bar +
 * "Need help? Contact Us" link + close button + ENG selector + © footer.
 */

export type HrGetStartedProps = {
  brand?: React.ReactNode
  onSubmit?: (data: { email: string; agreed: boolean }) => void
  className?: string
}

export function HrGetStarted({ brand, onSubmit, className }: HrGetStartedProps) {
  const [email, setEmail] = React.useState("")
  const [agreed, setAgreed] = React.useState(false)

  return (
    <div className={cn("min-h-screen flex flex-col bg-bg-white-0", className)}>
      {/* Top bar — brand + help + close */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-5">
        {brand ?? (
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-(--primary-base) grid place-items-center text-text-white-0 font-semibold">
              S
            </div>
            <span className="text-base font-semibold tracking-tight">Synergy HR</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-text-sub-600">Need help?</span>
          <Button tone="neutral" style="stroke" size="sm">
            <HelpCircle className="size-3.5" /> Contact Us
          </Button>
          <Button tone="neutral" style="ghost" size="sm" aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>
      </header>

      {/* Centered form */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Custom icon + heading */}
          <div className="text-center mb-8">
            <div className="mx-auto size-14 rounded-full bg-bg-weak-50 border border-stroke-soft-200 grid place-items-center mb-4">
              <UserPlus className="size-6 text-icon-sub-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
              Join Synergy Team
            </h1>
            <p className="mt-1 text-sm text-text-sub-600">
              Get started by submitting email address.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit?.({ email, agreed })
            }}
            className="space-y-4"
          >
            {/* Social SSO row */}
            <div className="grid grid-cols-3 gap-2">
              <SocialButton brand="google" style="stroke">Google</SocialButton>
              <SocialButton brand="apple" style="stroke">Apple</SocialButton>
              <SocialButton brand="github" style="stroke">GitHub</SocialButton>
            </div>

            <div className="flex items-center gap-3 text-xs text-text-soft-400">
              <Divider className="flex-1" />
              OR
              <Divider className="flex-1" />
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <InputRoot>
                <InputIcon>
                  <Mail />
                </InputIcon>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@alignui.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputRoot>
            </div>

            {/* T&C */}
            <label className="flex items-start gap-2 text-sm text-text-sub-600 cursor-pointer">
              <Checkbox
                checked={agreed}
                onCheckedChange={(c) => setAgreed(c === true)}
                className="mt-0.5"
              />
              <span>
                I agree to the{" "}
                <LinkButton href="#" tone="primary" size="sm">Terms &amp; Conditions</LinkButton>{" "}
                and{" "}
                <LinkButton href="#" tone="primary" size="sm">Privacy Policy</LinkButton>.
              </span>
            </label>

            <Button
              tone="primary"
              style="filled"
              size="lg"
              type="submit"
              className="w-full"
              disabled={!agreed}
            >
              Get Started
            </Button>

            <p className="text-center text-sm text-text-sub-600">
              Already have an account?{" "}
              <LinkButton href="#" tone="primary">Login</LinkButton>
            </p>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 lg:px-10 py-5 text-xs text-text-soft-400">
        <span>© 2024 Synergy HR</span>
        <Button tone="neutral" style="ghost" size="sm">🌐 ENG</Button>
      </footer>
    </div>
  )
}
