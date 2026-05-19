"use client"

import * as React from "react"
import { RiDoubleQuotesL as Quote } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { PasswordInput } from "@/registry/dash/ui/password-input"
import { Label } from "@/registry/dash/ui/label"
import { Field, FieldGroup } from "@/registry/dash/ui/field"
import { CheckboxField } from "@/registry/dash/ui/checkbox"
import { SocialButton } from "@/registry/dash/ui/social-button"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type MarketingLoginProps = {
  brand?: React.ReactNode
  testimonial?: {
    quote: string
    name: string
    role: string
    initials?: string
  }
  registerHref?: string
  forgotHref?: string
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * MarketingLogin — Catalyst-style split-screen login page ported from AlignUI Pro Figma.
 * Left = login form (email + password + remember + social), right = testimonial hero panel.
 *
 * Source: Figma node `164861:38588` ("Login [Marketing & Sales]").
 */
export function MarketingLogin({
  brand = <span className="text-2xl font-semibold tracking-tight">Catalyst</span>,
  testimonial = {
    quote: "The Marketing Management app has revolutionized our tasks. It's efficient and user-friendly, streamlining planning to tracking.",
    name: "Wei Chen",
    role: "CEO / Catalyst",
    initials: "WC",
  },
  registerHref = "#register",
  forgotHref = "#forgot",
  className,
}: MarketingLoginProps) {
  return (
    <div className={cn("min-h-screen grid lg:grid-cols-2 bg-bg-white-0", className)}>
      {/* Form pane */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <div>{brand}</div>
          <div className="text-sm text-text-sub-600">
            Don&apos;t have an account?{" "}
            <a href={registerHref} className="text-(--dash-purple-700) font-medium hover:underline">
              Register
            </a>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-text-strong-950">
              Login to your account
            </h1>
            <p className="mt-2 text-sm text-text-sub-600">Enter your details to login.</p>
          </div>

          <form className="space-y-5">
            <FieldGroup>
              <Field>
                <Label htmlFor="email">Email Address</Label>
                <InputRoot>
                  <Input id="email" type="email" placeholder="hello@alignui.com" />
                </InputRoot>
              </Field>
              <Field>
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" placeholder="••••••••" />
              </Field>
            </FieldGroup>

            <div className="flex items-center justify-between">
              <CheckboxField label="Keep me logged in" />
              <a href={forgotHref} className="text-sm text-(--dash-purple-700) font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            <Button tone="primary" style="filled" className="w-full">Login</Button>

            <div className="flex items-center gap-3">
              <Divider className="flex-1" />
              <span className="text-xs text-text-soft-400">OR</span>
              <Divider className="flex-1" />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <SocialButton brand="google" style="stroke">Google</SocialButton>
              <SocialButton brand="apple" style="stroke">Apple</SocialButton>
              <SocialButton brand="facebook" style="stroke">Facebook</SocialButton>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between text-xs text-text-soft-400 mt-8">
          <span>© 2024 Catalyst</span>
          <span>ENG</span>
        </div>
      </div>

      {/* Testimonial pane */}
      <div className="hidden lg:flex bg-(--dash-purple-50) items-center justify-center p-12">
        <div className="relative max-w-md rounded-2xl bg-gradient-to-br from-(--dash-purple-600) to-(--dash-purple-900) text-static-white p-8 shadow-custom-lg">
          <Quote className="size-8 opacity-40 mb-4" aria-hidden />
          <p className="text-lg leading-relaxed">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Avatar size="md">
              <AvatarFallback>{testimonial.initials ?? "?"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{testimonial.name}</div>
              <div className="text-xs opacity-70">{testimonial.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
