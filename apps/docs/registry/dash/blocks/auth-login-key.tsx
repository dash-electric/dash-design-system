"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiKey2Line as KeyRound } from "@remixicon/react"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import {
  InputRoot,
  Input,
  InputIcon,
} from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { PasswordInput } from "@/registry/dash/ui/password-input"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { BrandMark } from "@/registry/dash/ui/brand-mark"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Login Key — 96×96 key-icon header → email + password → remember + forgot →
 * FancyCTA. Minimal no-SSO variant. source auth block 5.
 */
export function AuthLoginKey({ className }: { className?: string }) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={cn("w-full max-w-[440px] space-y-6", className)}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <BrandMark size="lg" shape="square" tone="neutral" aria-hidden>
          <KeyRound strokeWidth={1.5} />
        </BrandMark>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Masuk ke akun Anda
          </h1>
          <p className="text-sm text-text-sub-600">
            Masukkan email dan password untuk lanjut.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="key-login-email">Email</Label>
          <InputRoot>
            <InputIcon>
              <Mail className="size-4" strokeWidth={1.75} />
            </InputIcon>
            <Input
              id="key-login-email"
              name="email"
              type="email"
              placeholder="nama@dash.id"
              autoComplete="email"
            />
          </InputRoot>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="key-login-password">Password</Label>
          <PasswordInput id="key-login-password" name="password" />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-text-sub-600">
          <Checkbox id="key-login-remember" />
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
    </form>
  )
}
