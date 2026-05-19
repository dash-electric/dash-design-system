"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiSunLine as Sun } from "@remixicon/react"
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
import { BrandMark } from "@/registry/dash/ui/brand-mark"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Solaris register — brand mark → 2 social SSO (stacked) → divider → email →
 * FancyButton CTA → footer. source auth block 2.
 */
export function AuthRegisterSolaris({ className }: { className?: string }) {
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
          <Sun strokeWidth={2} className="fill-static-white" />
        </BrandMark>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Daftar Dash
          </h1>
          <p className="text-sm text-text-sub-600">
            Pilih cara tercepat untuk mulai.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <SocialButton brand="google" block size="lg" label="Lanjut dengan Google" />
        <SocialButton brand="apple" block size="lg" label="Lanjut dengan Apple" />
      </div>

      <ContentDivider>atau</ContentDivider>

      <div className="space-y-1.5">
        <Label htmlFor="solaris-email">Email</Label>
        <InputRoot>
          <InputIcon>
            <Mail className="size-4" strokeWidth={1.75} />
          </InputIcon>
          <Input
            id="solaris-email"
            name="email"
            type="email"
            placeholder="nama@dash.id"
            autoComplete="email"
          />
        </InputRoot>
      </div>

      <FancyButton tone="primary" size="lg" className="w-full" type="submit">
        Lanjutkan
      </FancyButton>

      <p className="text-center text-sm text-text-sub-600">
        Sudah punya akun?{" "}
        <LinkButton asChild tone="primary" size="sm" underline="hover">
          <Link href="/login">Masuk</Link>
        </LinkButton>
      </p>
    </form>
  )
}
