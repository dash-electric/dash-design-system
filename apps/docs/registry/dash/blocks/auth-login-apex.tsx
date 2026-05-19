"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiFlashlightLine as Zap } from "@remixicon/react"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { SocialButton } from "@/registry/dash/ui/social-button"
import {
  InputRoot,
  Input,
  InputIcon,
} from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { ContentDivider } from "@/registry/dash/ui/divider"
import { PasswordInput } from "@/registry/dash/ui/password-input"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { BrandMark } from "@/registry/dash/ui/brand-mark"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Apex login — brand mark → 3 social (side-by-side) → divider → email +
 * password → remember + forgot → FancyCTA → footer. source auth block 4.
 */
export function AuthLoginApex({ className }: { className?: string }) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={cn("w-full max-w-[400px] space-y-6", className)}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <BrandMark
          size="md"
          shape="round"
          tone="custom"
          className="bg-warning-base text-static-white"
          aria-hidden
        >
          <Zap strokeWidth={2} className="fill-static-white" />
        </BrandMark>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Masuk Halo-dash
          </h1>
          <p className="text-sm text-text-sub-600">
            Pilih cara masuk yang paling cepat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SocialButton brand="google" block size="lg" label="" aria-label="Google" />
        <SocialButton brand="apple" block size="lg" label="" aria-label="Apple" />
        <SocialButton brand="microsoft" block size="lg" label="" aria-label="Microsoft" />
      </div>

      <ContentDivider>atau</ContentDivider>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="apex-email">Email</Label>
          <InputRoot>
            <InputIcon>
              <Mail className="size-4" strokeWidth={1.75} />
            </InputIcon>
            <Input
              id="apex-email"
              name="email"
              type="email"
              placeholder="nama@haloDash.id"
              autoComplete="email"
            />
          </InputRoot>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apex-password">Password</Label>
          <PasswordInput id="apex-password" name="password" />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-text-sub-600">
          <Checkbox id="apex-remember" />
          <span>Ingat saya</span>
        </label>
        <LinkButton
          asChild
          tone="primary"
          size="sm"
          underline="hover"
          className="text-xs"
        >
          <Link href="/forgot-password">Lupa password?</Link>
        </LinkButton>
      </div>

      <FancyButton tone="primary" size="lg" className="w-full" type="submit">
        Masuk
      </FancyButton>

      <p className="text-center text-sm text-text-sub-600">
        Belum punya akun?{" "}
        <LinkButton asChild tone="primary" size="sm" underline="hover">
          <Link href="/register">Daftar</Link>
        </LinkButton>
      </p>
    </form>
  )
}
