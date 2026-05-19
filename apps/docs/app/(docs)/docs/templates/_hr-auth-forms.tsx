"use client"

import * as React from "react"
import {
  RiDoorLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiInformationFill,
  RiLock2Line,
  RiMailCheckLine,
  RiMailLine,
  RiUserAddLine,
  RiUserLine,
} from "@remixicon/react"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { ContentDivider, Divider } from "@/registry/dash/ui/divider"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { SocialButton } from "@/registry/dash/ui/social-button"
import { Hint } from "@/registry/dash/ui/hint"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/registry/dash/ui/input-otp"
import { HeroIcon } from "./_hr-auth-shared"

/**
 * Shared forms for HR Auth template docs pages (login / register / reset-password /
 * verification). Style 2 + Style 3 reuse these forms verbatim — only the layout
 * shell differs. Ported from app/(auth)/{login,register,reset-password,verification}/page.tsx.
 */

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
        className="inline-flex size-7 items-center justify-center text-text-soft-400 mr-0.5"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <RiEyeOffLine className="size-5" />
        ) : (
          <RiEyeLine className="size-5" />
        )}
      </button>
    </InputRoot>
  )
}

function SocialRow() {
  return (
    <div className="grid w-full auto-cols-fr grid-flow-col gap-3">
      <SocialButton brand="apple" style="stroke" onlyIcon />
      <SocialButton brand="google" style="stroke" onlyIcon />
      <SocialButton brand="linkedin" style="stroke" onlyIcon />
    </div>
  )
}

export function LoginForm() {
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <HeroIcon icon={RiUserLine} />
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold text-text-strong-950">
            Login to your account
          </div>
          <div className="text-base text-text-sub-600">
            Enter your details to login.
          </div>
        </div>
      </div>

      <SocialRow />

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
            <Input id="email" type="email" placeholder="hello@alignui.com" required />
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
        <LinkButton tone="muted" size="md" underline="always">
          Forgot password?
        </LinkButton>
      </div>

      <FancyButton tone="primary" size="md">
        Login
      </FancyButton>
    </>
  )
}

export function RegisterForm() {
  return (
    <>
      <div className="flex flex-col items-center space-y-2">
        <HeroIcon icon={RiUserAddLine} />
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold text-text-strong-950">
            Create a new account
          </div>
          <div className="text-base text-text-sub-600">
            Enter your details to register.
          </div>
        </div>
      </div>

      <SocialRow />

      <ContentDivider>OR</ContentDivider>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="fullname" required>
            Full Name
          </Label>
          <InputRoot>
            <Input id="fullname" type="text" placeholder="James Brown" required />
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
            <Input id="email" type="email" placeholder="hello@alignui.com" required />
          </InputRoot>
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" required>
            Password
          </Label>
          <PasswordField id="password" required />
          <Hint>
            Must contain 1 uppercase letter, 1 number, min. 8 characters.
          </Hint>
        </div>
      </div>

      <FancyButton tone="primary" size="md">
        Register
      </FancyButton>
    </>
  )
}

export function ResetPasswordForm() {
  return (
    <>
      <div className="flex flex-col items-center space-y-2">
        <HeroIcon icon={RiDoorLockLine} />
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold text-text-strong-950">Reset Password</div>
          <div className="text-base text-text-sub-600">
            Enter your email to reset your password.
          </div>
        </div>
      </div>

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
            <Input id="email" type="email" placeholder="hello@alignui.com" required />
          </InputRoot>
          <Hint>Enter the email with which you&apos;ve registered.</Hint>
        </div>
      </div>

      <FancyButton tone="primary" size="md">
        Reset Password
      </FancyButton>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm text-text-sub-600">Don&apos;t have access anymore?</span>
        <LinkButton tone="neutral" size="md" underline="always">
          Try another method
        </LinkButton>
      </div>
    </>
  )
}

export function VerificationForm() {
  const [value, setValue] = React.useState("")
  return (
    <>
      <div className="flex flex-col items-center space-y-2">
        <HeroIcon icon={RiMailCheckLine} />
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold text-text-strong-950">
            Enter Verification Code
          </div>
          <div className="text-base text-text-sub-600">
            We&apos;ve sent a code to{" "}
            <span className="text-sm font-medium text-text-strong-950">
              james@alignui.com
            </span>
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex justify-center">
        <InputOTP maxLength={4} value={value} onChange={setValue}>
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

// Re-export for convenience
export { HeroIcon }
