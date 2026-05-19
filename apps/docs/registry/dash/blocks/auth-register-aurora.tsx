"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiUserLine as User, RiStarLine as Star } from "@remixicon/react"
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
 * Aurora register — brand mark → single social → divider → 4-field form
 * (first/last/email/password) → FancyButton CTA → footer link. source auth
 * block 1.
 */
export function AuthRegisterAurora({ className }: { className?: string }) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={cn("w-full max-w-[400px] space-y-6", className)}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <BrandMark size="md" shape="round" tone="primary" aria-hidden>
          <Star strokeWidth={2} className="fill-static-white" />
        </BrandMark>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Buat akun mitra
          </h1>
          <p className="text-sm text-text-sub-600">
            Mulai jalankan operasi Dash dalam hitungan menit.
          </p>
        </div>
      </div>

      <SocialButton brand="google" block size="lg" label="Daftar dengan Google" />

      <ContentDivider>atau</ContentDivider>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="aurora-first">Nama depan</Label>
            <InputRoot>
              <InputIcon>
                <User className="size-4" strokeWidth={1.75} />
              </InputIcon>
              <Input
                id="aurora-first"
                name="firstName"
                placeholder="Irfan"
                autoComplete="given-name"
              />
            </InputRoot>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aurora-last">Nama belakang</Label>
            <InputRoot>
              <Input
                id="aurora-last"
                name="lastName"
                placeholder="Prima"
                autoComplete="family-name"
              />
            </InputRoot>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="aurora-email">Email</Label>
          <InputRoot>
            <InputIcon>
              <Mail className="size-4" strokeWidth={1.75} />
            </InputIcon>
            <Input
              id="aurora-email"
              name="email"
              type="email"
              placeholder="nama@dash.id"
              autoComplete="email"
            />
          </InputRoot>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="aurora-password">Password</Label>
          <PasswordInput
            id="aurora-password"
            name="password"
            autoComplete="new-password"
          />
        </div>
      </div>

      <FancyButton tone="primary" size="lg" className="w-full" type="submit">
        Daftar
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
