"use client"

import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"

/**
 * Shared shell + helpers for HR Auth template docs pages (Styles 1/2/3).
 * Internal to /app/(docs)/docs/templates/ — not part of the public Dash registry.
 * Ported from AlignUI HR Template (app/(auth*)/layout.tsx + header/footer).
 */

export function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

export type AuthFlow = "login" | "register" | "reset-password" | "verification"

const CROSS_FLOW_COPY: Record<AuthFlow, { message: string; linkText: string }> = {
  login: { message: "Don't have an account?", linkText: "Register" },
  register: { message: "Already have an account?", linkText: "Login" },
  "reset-password": { message: "Changed your mind?", linkText: "Go back" },
  verification: { message: "Changed your mind?", linkText: "Go back" },
}

export function AuthHeader({ flow }: { flow: AuthFlow }) {
  const { message, linkText } = CROSS_FLOW_COPY[flow]
  return (
    <div className="mx-auto flex w-full items-center justify-between gap-6 pb-3.5 pt-2.5 lg:py-0">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-static-white text-xs font-bold">
        S
      </span>
      <div className="flex items-center gap-3">
        <span className="text-right text-sm text-text-sub-600">{message}</span>
        <Button tone="neutral" style="stroke" size="xs">
          {linkText}
        </Button>
      </div>
    </div>
  )
}

export function AuthFooter() {
  return (
    <div className="-mx-2 mt-auto flex items-center justify-between gap-4 pb-4 lg:mx-0 lg:pb-0">
      <div className="text-sm text-text-sub-600">© 2024 Synergy HR</div>
      <div className="text-sm text-text-sub-600">English (UK)</div>
    </div>
  )
}

export function HeroIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div
      className={cn(
        "relative flex size-24 shrink-0 items-center justify-center rounded-full",
        "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-neutral-500/10 before:to-transparent",
        "after:absolute after:inset-0 after:rounded-full after:ring-1 after:ring-stroke-soft-200",
      )}
    >
      <div className="relative z-10 flex size-16 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
        <Icon className="size-8 text-text-sub-600" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shells per style                                                           */
/* -------------------------------------------------------------------------- */

export function Style1Shell({
  flow,
  children,
}: {
  flow: AuthFlow
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-[860px] lg:grid-cols-[608px,minmax(0,1fr)] bg-bg-white-0">
      <div className="flex h-full flex-col px-6 lg:px-11 lg:py-6">
        <AuthHeader flow={flow} />
        <div className="flex flex-1 flex-col py-6 lg:py-24">
          <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6">{children}</div>
        </div>
        <AuthFooter />
      </div>
      <div className="hidden p-2 pl-0 lg:block">
        <div className="relative size-full rounded-2xl bg-bg-weak-50">
          <SliderPreview />
        </div>
      </div>
    </div>
  )
}

export function Style2Shell({
  flow,
  children,
}: {
  flow: AuthFlow
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-[860px] lg:grid-cols-[608px,minmax(0,1fr)] bg-bg-white-0">
      <div className="flex h-full flex-col px-6 lg:px-11 lg:py-6">
        <AuthHeader flow={flow} />
        <div className="flex flex-1 flex-col py-6 lg:py-24">
          <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6">{children}</div>
        </div>
        <AuthFooter />
      </div>
      <div className="hidden p-2 pl-0 lg:block">
        <div className="flex size-full items-center justify-center rounded-2xl bg-bg-weak-50 py-[72px] pl-[76px]">
          <div className="mt-2 h-fit overflow-hidden rounded-l-[20px] shadow-regular-md ring-4 ring-stroke-white-0">
            <Style2ImagePlaceholder />
          </div>
        </div>
      </div>
    </div>
  )
}

export function Style3Shell({
  flow,
  children,
}: {
  flow: AuthFlow
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-[860px] lg:grid-cols-[608px,minmax(0,1fr)] bg-bg-white-0">
      <div className="flex h-full flex-col px-6 lg:px-11 lg:py-6">
        <AuthHeader flow={flow} />
        <div className="flex flex-1 flex-col py-6 lg:py-24">
          <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6">{children}</div>
        </div>
        <AuthFooter />
      </div>
      <div className="hidden p-2 pl-0 lg:block">
        <div className="grid size-full justify-center overflow-hidden rounded-2xl bg-bg-weak-50 pl-20 pt-20 2xl:pl-40 2xl:pt-32 content-center">
          <div className="pr-20 2xl:pr-40">
            <div className="text-xl text-text-sub-600">
              The <span className="text-text-strong-950">HR Management</span> app has
              transformed how we handle HR tasks. It&apos;s incredibly efficient and
              user-friendly, simplifying everything from.
            </div>
            <div className="mt-10 flex items-center gap-4">
              <Avatar size="xl" className="bg-(--dash-purple-100)">
                <AvatarImage src="/images/placeholder/avatar.svg" alt="" />
                <AvatarFallback>MJ</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="text-sm font-medium text-text-strong-950">Matthew Johnson</div>
                <div className="text-sm text-text-sub-600">Data Software Engineer · Freelancer</div>
              </div>
            </div>
          </div>
          <div className="mr-auto mt-14 h-fit overflow-hidden rounded-l-[20px] bg-bg-white-0 shadow-regular-md">
            <Style3ImagePlaceholder />
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Static placeholders for marketing illustrations                            */
/* -------------------------------------------------------------------------- */

export function SliderPreview() {
  return (
    <div className="flex size-full flex-col items-center justify-center pb-10 pt-20">
      <div className="relative flex w-full justify-center py-[120px]">
        <div className="relative h-[380px] w-[352px]">
          <div className="absolute inset-0 rounded-2xl bg-bg-white-0 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200" />
          <div className="absolute inset-6 flex flex-col items-center justify-center gap-4 text-center">
            <div className="size-20 rounded-full bg-(--primary-alpha-10)" />
            <div className="text-sm font-semibold text-text-strong-950">Time Off Widget</div>
            <div className="text-xs text-text-sub-600">5 days remaining</div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[624px] px-5 text-center">
        <h3 className="text-xl font-semibold">Stay in Control of Your Time Off</h3>
        <p className="mt-2 min-h-12 text-base text-text-sub-600">
          Track your time off balance and manage requests with the Time Off widget, ensuring a stress-free experience.
        </p>
      </div>
      <div className="mt-12 flex gap-2">
        <span className="h-2 w-6 rounded-full bg-text-strong-950" />
        <span className="size-2 rounded-full bg-stroke-soft-200" />
        <span className="size-2 rounded-full bg-stroke-soft-200" />
      </div>
    </div>
  )
}

export function Style2ImagePlaceholder() {
  return (
    <div className="grid h-[626px] w-[700px] grid-cols-2 gap-4 bg-bg-white-0 p-6">
      <div className="space-y-4">
        <div className="h-32 rounded-xl bg-(--primary-alpha-10)" />
        <div className="h-40 rounded-xl bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200" />
        <div className="h-24 rounded-xl bg-(--primary-alpha-10)" />
      </div>
      <div className="space-y-4">
        <div className="h-40 rounded-xl bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200" />
        <div className="h-32 rounded-xl bg-(--primary-alpha-10)" />
        <div className="h-24 rounded-xl bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200" />
      </div>
    </div>
  )
}

export function Style3ImagePlaceholder() {
  return (
    <div className="h-[626px] w-[900px] bg-bg-white-0">
      <div className="grid h-full grid-cols-3 gap-3 p-6">
        <div className="rounded-xl bg-(--primary-alpha-10)" />
        <div className="rounded-xl bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200" />
        <div className="rounded-xl bg-(--primary-alpha-10)" />
        <div className="rounded-xl bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200 col-span-2" />
        <div className="rounded-xl bg-(--primary-alpha-10)" />
      </div>
    </div>
  )
}
