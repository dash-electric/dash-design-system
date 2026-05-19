"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiFireLine as Flame } from "@remixicon/react"
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
import { BrandMark } from "@/registry/dash/ui/brand-mark"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Phoenix login — brand mark → email + password (inline forgot) → FancyCTA →
 * OR divider → 2 social (side-by-side) → footer. source auth block 3.
 */
export function AuthLoginPhoenix({ className }: { className?: string }) {
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
          className="bg-error-base text-static-white"
          aria-hidden
        >
          <Flame strokeWidth={2} className="fill-static-white" />
        </BrandMark>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Selamat datang kembali
          </h1>
          <p className="text-sm text-text-sub-600">
            Masuk untuk lanjut operasi Anda.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="phoenix-email">Email</Label>
          <InputRoot>
            <InputIcon>
              <Mail className="size-4" strokeWidth={1.75} />
            </InputIcon>
            <Input
              id="phoenix-email"
              name="email"
              type="email"
              placeholder="nama@dash.id"
              autoComplete="email"
            />
          </InputRoot>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="phoenix-password">Password</Label>
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
          <PasswordInput id="phoenix-password" name="password" />
        </div>
      </div>

      <FancyButton tone="primary" size="lg" className="w-full" type="submit">
        Masuk
      </FancyButton>

      <ContentDivider>atau</ContentDivider>

      <div className="grid grid-cols-2 gap-3">
        <SocialButton brand="google" block size="lg" label="Google" />
        <SocialButton brand="apple" block size="lg" label="Apple" />
      </div>

      <p className="text-center text-sm text-text-sub-600">
        Belum punya akun?{" "}
        <LinkButton asChild tone="primary" size="sm" underline="hover">
          <Link href="/register">Daftar</Link>
        </LinkButton>
      </p>
    </form>
  )
}
