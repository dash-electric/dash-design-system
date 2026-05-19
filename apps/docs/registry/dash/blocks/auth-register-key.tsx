"use client"

import * as React from "react"
import Link from "next/link"
import { RiMailLine as Mail, RiUserLine as User, RiKey2Line as KeyRound } from "@remixicon/react"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import {
  InputRoot,
  Input,
  InputIcon,
} from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { PasswordInput } from "@/registry/dash/ui/password-input"
import { BrandMark } from "@/registry/dash/ui/brand-mark"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Register Key — 96×96 key-icon header → first/last/email/password →
 * FancyCTA → legal copy. Minimal no-SSO register. source auth block 6.
 */
export function AuthRegisterKey({ className }: { className?: string }) {
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
            Buat akun baru
          </h1>
          <p className="text-sm text-text-sub-600">
            Cuma butuh nama, email, dan password.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="key-reg-first">Nama depan</Label>
            <InputRoot>
              <InputIcon>
                <User className="size-4" strokeWidth={1.75} />
              </InputIcon>
              <Input
                id="key-reg-first"
                name="firstName"
                placeholder="Irfan"
                autoComplete="given-name"
              />
            </InputRoot>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="key-reg-last">Nama belakang</Label>
            <InputRoot>
              <Input
                id="key-reg-last"
                name="lastName"
                placeholder="Prima"
                autoComplete="family-name"
              />
            </InputRoot>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="key-reg-email">Email</Label>
          <InputRoot>
            <InputIcon>
              <Mail className="size-4" strokeWidth={1.75} />
            </InputIcon>
            <Input
              id="key-reg-email"
              name="email"
              type="email"
              placeholder="nama@dash.id"
              autoComplete="email"
            />
          </InputRoot>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="key-reg-password">Password</Label>
          <PasswordInput
            id="key-reg-password"
            name="password"
            autoComplete="new-password"
          />
        </div>
      </div>

      <FancyButton tone="primary" size="lg" className="w-full" type="submit">
        Daftar
      </FancyButton>

      <p className="text-center text-xs text-text-soft-400 leading-relaxed">
        Dengan mendaftar, Anda menyetujui{" "}
        <LinkButton asChild tone="muted" size="sm" underline="always" className="text-xs">
          <Link href="/terms">Syarat &amp; Ketentuan</Link>
        </LinkButton>{" "}
        dan{" "}
        <LinkButton asChild tone="muted" size="sm" underline="always" className="text-xs">
          <Link href="/privacy">Kebijakan Privasi</Link>
        </LinkButton>{" "}
        Dash.
      </p>
    </form>
  )
}
