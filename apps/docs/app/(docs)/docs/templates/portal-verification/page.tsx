"use client"

import * as React from "react"
import { RiLogoutBoxRLine } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { Hint } from "@/registry/dash/ui/hint"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { ContentDivider } from "@/registry/dash/ui/divider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/dash/ui/select"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/dash/ui/input-otp"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"

/**
 * Portal Verification. Ported from Dash Next Portal v2 source (2026-05-19).
 * Source: app/[locale]/(auth)/verification/{page,layout}.tsx + Step{1,2,3}.tsx
 * Layout: top header bar + left stepper sidebar (272px) + main content area (light bg).
 * 3 steps: Business Detail → Account Detail → Verification (OTP).
 */
export default function PortalVerificationPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Verification"
        description="Production post-signup verification flow. Top header + left vertical stepper sidebar with Business Detail → Account Detail → Verification (WhatsApp OTP). Card-based forms inside a max-w content well."
      />

      <DocsSection title="Step 1 — Business Detail">
        <DocsExample
          bare
          title="Business Identity card"
          description='Two-column row: Type of Business + Industry (selects). Conditional Business Name + Legal Name row appears once business type is selected. "Legal Name" is `(Optional)` only when business type is INDIVIDUAL.'
          preview={
            <DocsTemplatePreview>
              <VerificationShell activeStep={0}>
                <Step1Card />
              </VerificationShell>
            </DocsTemplatePreview>
          }
          code={`<WidgetBox>
  <Header>Business Detail</Header>
  <SolidDivider>Business Identity</SolidDivider>
  <div className="grid grid-cols-2 gap-3 p-6">
    <Field label="Type of Business"><Select placeholder="Select Type" /></Field>
    <Field label="Industry"><Select placeholder="Select Industry" /></Field>
    <Field label="Business Name"><Input placeholder="Business Name" /></Field>
    <Field label="Legal Name (Optional?)"><Input placeholder="Legal Name" /></Field>
  </div>
  <Footer><Button tone="primary">Continue</Button></Footer>
</WidgetBox>`}
        />
      </DocsSection>

      <DocsSection title="Step 2 — Account Detail">
        <DocsExample
          bare
          title="Profile Information card"
          description='Full Name + Email (disabled, from session) + Phone Number (with +62 prefix + Indonesian flag affix). Mobile regex requires leading 8, total ≥9 digits.'
          preview={
            <DocsTemplatePreview>
              <VerificationShell activeStep={1}>
                <Step2Card />
              </VerificationShell>
            </DocsTemplatePreview>
          }
          code={`<WidgetBox>
  <Header>Account Detail</Header>
  <SolidDivider>Profile Information</SolidDivider>
  <Field label="Full Name"><Input placeholder="Sophia Align" /></Field>
  <Field label="Email"><Input disabled value="..." placeholder="sophia@alignui.com" /></Field>
  <Field label="Phone Number">
    <InputRoot>
      <span className="px-3"><Flag /> +62</span>
      <Input placeholder="812-3456-7890" inputMode="numeric" />
    </InputRoot>
  </Field>
  <Footer>
    <Button style="stroke">Back</Button>
    <Button tone="primary">Create Account</Button>
  </Footer>
</WidgetBox>`}
        />
      </DocsSection>

      <DocsSection title="Step 3 — Verification (WhatsApp OTP)">
        <DocsExample
          bare
          title="Verify your phone number"
          description='Source: "We&apos;ve sent a 6-digit code to your WhatsApp number +{number}. Enter the code below to verify your account." 6-digit DigitInput, agreement checkbox (gates submit), resend countdown.'
          preview={
            <DocsTemplatePreview>
              <VerificationShell activeStep={2}>
                <Step3Card />
              </VerificationShell>
            </DocsTemplatePreview>
          }
          code={`<WidgetBox>
  <Header>Verification</Header>
  <SolidDivider>Let's confirm it's really you</SolidDivider>
  <div className="p-6 space-y-6">
    <h3>Verify your phone number</h3>
    <p>We've sent a 6-digit code to your WhatsApp number +62812... Enter the code below to verify your account.</p>
    <DigitInput numInputs={6} />
    <label>
      <Checkbox />
      By submitting this form, you agree to the Dash <a>Services Agreement</a> and confirm that all the information provided is true and accurate.
    </label>
  </div>
  <Footer>
    <p>Experiencing issues receiving the code? <LinkButton>Resend code</LinkButton></p>
    <Button style="stroke">Back</Button>
    <Button tone="primary">Verification</Button>
  </Footer>
</WidgetBox>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Top bar</strong> — `VerificationHeader` with Dash logo + language select.</li>
          <li><strong>Sidebar</strong> — fixed 272px, hidden under <code>lg</code>. “REGISTRATION” section title, vertical stepper, bottom “Log out” button (firebase signOut + localStorage cleanup).</li>
          <li><strong>Step labels</strong> — “Business Detail”, “Account Detail”, “Verification”.</li>
          <li><strong>Main area</strong> — light <code>bg-bg-weak-50</code> background, content centered with horizontal padding <code>lg:px-32</code> top <code>lg:pt-12</code>.</li>
          <li><strong>Cards</strong> — <code>WidgetBox.Root</code> with header row + solid-text divider section break + form body + bordered footer with action buttons.</li>
          <li><strong>OTP submit gate</strong> — disabled until 6 digits entered AND agreement checked.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><code>InputRoot</code> / <code>Input</code> — single + phone-with-affix.</li>
          <li><code>Checkbox</code> — agreement gate.</li>
          <li><code>Button</code> — Back / Continue / Create Account / Verification.</li>
          <li><code>LinkButton</code> — “Resend code” / countdown.</li>
          <li><code>ContentDivider</code> — section headers inside the card.</li>
          <li><code>Hint</code> — inline validation under each field.</li>
          <li>InputOTP / 6-digit input (substitute for source DigitInput).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Verification shell — top bar + left stepper sidebar                        */
/* -------------------------------------------------------------------------- */

const FLOW_STEPS = [
  { label: "Business Detail", indicator: "1" },
  { label: "Account Detail", indicator: "2" },
  { label: "Verification", indicator: "3" },
] as const

function VerificationShell({
  activeStep,
  children,
}: {
  activeStep: 0 | 1 | 2
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[820px] flex-col bg-bg-white-0">
      <VerificationHeader />
      <div className="flex flex-1 overflow-hidden">
        <FlowSidebar activeStep={activeStep} />
        <main className="flex-1 overflow-auto">
          <div className="flex min-h-full flex-col items-center bg-bg-weak-50 px-32 pt-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function VerificationHeader() {
  return (
    <div className="flex h-14 items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-6">
      <div className="flex items-center gap-2 text-label-md font-semibold tracking-tight text-text-strong-950">
        <span className="grid size-7 place-items-center rounded-md bg-(--dash-purple-600) text-white text-xs">D</span>
        dash
      </div>
      <div className="flex items-center gap-3 text-sm text-text-sub-600">
        <span>EN</span>
      </div>
    </div>
  )
}

function FlowSidebar({ activeStep }: { activeStep: 0 | 1 | 2 }) {
  return (
    <aside className="hidden h-full w-[272px] shrink-0 flex-col border-r border-stroke-soft-200 bg-bg-white-0 lg:flex">
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="flex flex-1 flex-col gap-6 px-6 pb-4 pt-6">
          <div>
            <div className="mb-3 p-1 text-subheading-xs uppercase text-text-soft-400">
              Registration
            </div>
            <ol className="space-y-1">
              {FLOW_STEPS.map((step, i) => {
                const state = activeStep > i ? "completed" : activeStep === i ? "active" : "default"
                return (
                  <li
                    key={step.indicator}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-label-sm ${
                      state === "active"
                        ? "bg-bg-weak-50 text-text-strong-950"
                        : state === "completed"
                          ? "text-text-sub-600"
                          : "text-text-soft-400"
                    }`}
                  >
                    <span
                      className={`grid size-6 place-items-center rounded-full border text-xs ${
                        state === "active"
                          ? "border-primary-base bg-primary-base text-white"
                          : state === "completed"
                            ? "border-primary-base bg-primary-base text-white"
                            : "border-stroke-soft-200"
                      }`}
                    >
                      {state === "completed" ? "✓" : step.indicator}
                    </span>
                    {step.label}
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
        <div className="px-6">
          <div className="h-px bg-stroke-soft-200" />
        </div>
        <div className="p-3">
          <button className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-label-sm text-text-sub-600 hover:bg-bg-weak-50">
            <RiLogoutBoxRLine className="size-5 shrink-0" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  )
}

/* -------------------------------------------------------------------------- */
/* Cards                                                                      */
/* -------------------------------------------------------------------------- */

function WidgetBoxRoot({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`w-full rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  )
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 text-label-xl font-medium">{children}</div>
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-stroke-soft-200 px-6 py-4">
      <div className="flex justify-end gap-3">{children}</div>
    </div>
  )
}

function Step1Card() {
  return (
    <WidgetBoxRoot className="max-w-[720px]">
      <CardHeader>Business Detail</CardHeader>
      <ContentDivider variant="solid">Business Identity</ContentDivider>

      <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label>Type of Business</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="non-profit">Non-Profit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Industry</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="fnb">Food &amp; Beverage</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="bizname">Business Name</Label>
          <InputRoot>
            <Input id="bizname" placeholder="Business Name" />
          </InputRoot>
          <Hint>&nbsp;</Hint>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="legalname">
            Legal Name <span className="text-text-sub-600">(Optional)</span>
          </Label>
          <InputRoot>
            <Input id="legalname" placeholder="Legal Name" />
          </InputRoot>
          <Hint>&nbsp;</Hint>
        </div>
      </div>

      <CardFooter>
        <Button tone="primary">Continue</Button>
      </CardFooter>
    </WidgetBoxRoot>
  )
}

function Step2Card() {
  return (
    <WidgetBoxRoot className="max-w-[720px]">
      <CardHeader>Account Detail</CardHeader>
      <ContentDivider variant="solid">Profile Information</ContentDivider>

      <div className="flex flex-col gap-3 p-6">
        <div className="flex flex-col gap-1">
          <Label htmlFor="fullname">Full Name</Label>
          <InputRoot>
            <Input id="fullname" placeholder="Sophia Align" />
          </InputRoot>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="vemail">Email</Label>
          <InputRoot>
            <Input id="vemail" disabled placeholder="sophia@alignui.com" />
          </InputRoot>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="vphone">Phone Number</Label>
          <InputRoot>
            <div className="flex items-center px-3">
              <span className="mr-2 grid size-5 place-items-center rounded-full bg-error-base text-[8px] text-white">ID</span>
              <span className="text-paragraph-sm text-text-strong-950">+62</span>
            </div>
            <Input id="vphone" type="tel" inputMode="numeric" placeholder="812-3456-7890" />
          </InputRoot>
        </div>
      </div>

      <CardFooter>
        <Button tone="neutral" style="stroke">
          Back
        </Button>
        <Button tone="primary">Create Account</Button>
      </CardFooter>
    </WidgetBoxRoot>
  )
}

function Step3Card() {
  return (
    <WidgetBoxRoot className="max-w-[720px]">
      <CardHeader>Verification</CardHeader>
      <ContentDivider variant="solid">Let&apos;s confirm it&apos;s really you</ContentDivider>

      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <p className="text-title-h6 text-text-strong-950">
            Verify your phone number
          </p>
          <p className="text-paragraph-md text-text-sub-600">
            We&apos;ve sent a 6-digit code to your WhatsApp number +62812****9412.
            Enter the code below to verify your account.
          </p>
        </div>

        <div className="h-px bg-stroke-soft-200" />

        <div className="flex justify-center">
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <label className="flex items-start gap-2 text-paragraph-sm text-text-strong-950">
          <Checkbox />
          <span>
            By submitting this form, you agree to the Dash{" "}
            <a className="text-primary-base">Services Agreement</a> and confirm
            that all the information provided is true and accurate.
          </span>
        </label>
      </div>

      <CardFooter>
        <div className="mr-auto flex items-center gap-1 text-paragraph-sm text-text-sub-600">
          <span>Experiencing issues receiving the code?</span>
          <LinkButton tone="primary" size="md">
            Resend code
          </LinkButton>
        </div>
        <Button tone="neutral" style="stroke">
          Back
        </Button>
        <Button tone="primary">Verification</Button>
      </CardFooter>
    </WidgetBoxRoot>
  )
}

