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
import { BrandMark } from "@/registry/dash/ui/brand-mark"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Reset Password Key — 96×96 key-icon header → email → FancyCTA → support
 * link. Single-step "send reset link" pattern. source auth block 7.
 */
export function AuthResetPasswordKey({ className }: { className?: string }) {
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
            Reset password
          </h1>
          <p className="text-sm text-text-sub-600">
            Masukkan email Anda — kami akan kirim link reset.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reset-key-email">Email</Label>
        <InputRoot>
          <InputIcon>
            <Mail className="size-4" strokeWidth={1.75} />
          </InputIcon>
          <Input
            id="reset-key-email"
            name="email"
            type="email"
            placeholder="nama@dash.id"
            autoComplete="email"
          />
        </InputRoot>
      </div>

      <FancyButton tone="primary" size="lg" className="w-full" type="submit">
        Kirim link reset
      </FancyButton>

      <p className="text-center text-sm text-text-sub-600">
        Butuh bantuan?{" "}
        <LinkButton asChild tone="primary" size="sm" underline="hover">
          <Link href="/support">Hubungi support</Link>
        </LinkButton>
      </p>
    </form>
  )
}
