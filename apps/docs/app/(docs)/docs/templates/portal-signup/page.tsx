"use client"

import * as React from "react"
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Line,
  RiMailLine,
  RiSuitcaseLine,
  RiUserAddLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { Hint } from "@/registry/dash/ui/hint"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
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
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { PortalAuthShell, HaloIcon } from "../portal-signin/page"

/**
 * Portal Signup. Ported from Dash Next Portal v2 source (2026-05-19).
 * Source: app/[locale]/(auth)/signup/{page,layout}.tsx + signup/components/{Step1,Step3}.tsx
 * Multi-step: Step1 (account creation) → Step3 (business profile). Step2 was removed.
 * i18n strings inlined from messages/en.json under `auth.signup.*`.
 */
export default function PortalSignupPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Signup"
        description="Production signup flow for Dash Next Portal v2. Two screens: Step 1 collects email + password + optional referral code, Step 3 collects business profile (monthly deliveries, area, existing partners). Wrapped in the same 40/60 split shell as signin."
      />

      <DocsSection title="Step 1 — Create a new account">
        <DocsExample
          bare
          title="Step 1 — Email + password + referral"
          description='Source `t("title")` → "Create a new account". Hero icon `RiUserAddLine`. Password hint inline: "Must contain 1 uppercase letter, 1 number, min. 8 characters." Referral code optional (uppercased on input, validated on blur).'
          preview={
            <DocsTemplatePreview>
              <PortalAuthShell>
                <SignupStep1 />
              </PortalAuthShell>
            </DocsTemplatePreview>
          }
          code={`<HaloIcon icon={RiUserAddLine} />
<div className="text-center space-y-1">
  <div className="text-title-h5">Create a new account</div>
  <div className="text-paragraph-md text-text-sub-600">
    Enter your details to register.
  </div>
</div>
<Label>Email Address</Label>
<InputRoot><InputIcon><RiMailLine/></InputIcon>
  <Input type="email" placeholder="john.doe@example.com" /></InputRoot>
<Label>Password</Label>
<InputRoot><InputIcon><RiLock2Line/></InputIcon>
  <Input type="password" placeholder="••••••••••" /></InputRoot>
<Hint>Must contain 1 uppercase letter, 1 number, min. 8 characters.</Hint>
<Label>Confirm Password</Label>
{/* repeat */}
<Hint>Confirm your password correctly.</Hint>

<Divider />

<Label>Referral Code <span>(Optional)</span></Label>
<Input placeholder="Input referral code" />
<Hint>Input the code to get free delivery for the first order</Hint>

<FancyButton>Register</FancyButton>
<ContentDivider>Already have an account?</ContentDivider>
<Button style="stroke">Login</Button>`}
        />
      </DocsSection>

      <DocsSection title="Step 3 — Tell us more about your business">
        <DocsExample
          bare
          title="Step 3 — Business profile"
          description='Source `t("title")` → "Tell us more about your business". Hero icon `RiSuitcaseLine`. Three fields: Monthly Deliveries (select), Area (select w/ "Other" inline input), Existing Delivery Partners (4 fixed checkboxes + Others + textarea).'
          preview={
            <DocsTemplatePreview>
              <PortalAuthShell>
                <SignupStep3 />
              </PortalAuthShell>
            </DocsTemplatePreview>
          }
          code={`<HaloIcon icon={RiSuitcaseLine} />
<div className="text-center space-y-1">
  <div className="text-title-h5">Tell us more about your business</div>
  <div className="text-paragraph-md text-text-sub-600">
    We'll use this info to tailor the setup and recommend the best way to manage your deliveries.
  </div>
</div>

<Divider />

<Label>Monthly Deliveries</Label>
<Select placeholder="Select Range" />

<Label>Area</Label>
<Select placeholder="Select Area" />

<Label>Existing Delivery Partners</Label>
<Checkbox>Grab Express</Checkbox>
<Checkbox>Gojek/Gosend</Checkbox>
<Checkbox>Lalamove</Checkbox>
<Checkbox>Paxel</Checkbox>
<Checkbox>Others</Checkbox>

<FancyButton>Continue</FancyButton>
<p>Need more than 1000 deliveries? <LinkButton>Let's talk</LinkButton></p>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Shell</strong> — same 40/60 split as signin; auth carousel on the right.</li>
          <li><strong>Step 1</strong> halo icon = <code>RiUserAddLine</code>; Step 3 halo icon = <code>RiSuitcaseLine</code>.</li>
          <li><strong>Validation</strong> — email regex, password regex <code>/^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{`{8,}`}$/</code>, confirm password match.</li>
          <li><strong>Referral code</strong> — auto-uppercased on input, validated on blur via API.</li>
          <li><strong>Partner checkboxes</strong> — verbatim labels: Grab Express, Gojek/Gosend, Lalamove, Paxel, Others.</li>
          <li><strong>Footer link</strong> — “Need more than 1000 deliveries? Let&apos;s talk” opens Lark form in new tab.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>InputRoot</code> / <code>Input</code> / <code>InputIcon</code> — text fields.</li>
          <li><code>Label</code> / <code>Hint</code> — field labels and inline guidance / errors.</li>
          <li><code>Checkbox</code> — partner picks.</li>
          <li><code>FancyButton</code> — Register / Continue primary CTA.</li>
          <li><code>Button</code> tone=neutral style=stroke — secondary Login.</li>
          <li><code>LinkButton</code> — “Let&apos;s talk” enterprise contact.</li>
          <li><code>ContentDivider</code> — “Already have an account?” separator.</li>
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
/* Step 1                                                                     */
/* -------------------------------------------------------------------------- */

function SignupStep1() {
  const [showPwd, setShowPwd] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  return (
    <>
      <HaloIcon icon={RiUserAddLine} />
      <div className="space-y-1 text-center">
        <div className="text-title-h5 text-text-strong-950">Create a new account</div>
        <div className="text-paragraph-md text-text-sub-600">
          Enter your details to register.
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="signup-email">Email Address</Label>
          <InputRoot>
            <InputIcon><RiMailLine className="size-4" /></InputIcon>
            <Input id="signup-email" type="email" placeholder="john.doe@example.com" />
          </InputRoot>
        </div>
        <div className="space-y-1">
          <Label htmlFor="signup-password">Password</Label>
          <InputRoot>
            <InputIcon><RiLock2Line className="size-4" /></InputIcon>
            <Input
              id="signup-password"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••••"
            />
            <button type="button" onClick={() => setShowPwd((s) => !s)} className="text-text-soft-400">
              {showPwd ? <RiEyeOffLine className="size-5" /> : <RiEyeLine className="size-5" />}
            </button>
          </InputRoot>
          <Hint>Must contain 1 uppercase letter, 1 number, min. 8 characters.</Hint>
        </div>
        <div className="space-y-1">
          <Label htmlFor="signup-confirm">Confirm Password</Label>
          <InputRoot>
            <InputIcon><RiLock2Line className="size-4" /></InputIcon>
            <Input
              id="signup-confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••••"
            />
            <button type="button" onClick={() => setShowConfirm((s) => !s)} className="text-text-soft-400">
              {showConfirm ? <RiEyeOffLine className="size-5" /> : <RiEyeLine className="size-5" />}
            </button>
          </InputRoot>
          <Hint>Confirm your password correctly.</Hint>
        </div>
      </div>

      <div className="h-px bg-stroke-soft-200" />

      <div className="space-y-1">
        <Label htmlFor="signup-referral">
          Referral Code <span className="text-text-soft-400">(Optional)</span>
        </Label>
        <InputRoot>
          <Input id="signup-referral" placeholder="Input referral code" />
        </InputRoot>
        <Hint>Input the code to get free delivery for the first order</Hint>
      </div>

      <FancyButton tone="primary" size="md">
        Register
      </FancyButton>

      <ContentDivider>Already have an account?</ContentDivider>

      <Button tone="neutral" style="stroke">
        Login
      </Button>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 3                                                                     */
/* -------------------------------------------------------------------------- */

function SignupStep3() {
  return (
    <>
      <HaloIcon icon={RiSuitcaseLine} />
      <div className="space-y-1 text-center">
        <div className="text-title-h5 text-text-strong-950">
          Tell us more about your business
        </div>
        <div className="text-paragraph-md text-text-sub-600">
          We&apos;ll use this info to tailor the setup and recommend the best way
          to manage your deliveries.
        </div>
      </div>

      <div className="h-px bg-stroke-soft-200" />

      <div className="flex flex-col gap-1">
        <Label>Monthly Deliveries</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-100">1 – 100 deliveries</SelectItem>
            <SelectItem value="100-500">100 – 500 deliveries</SelectItem>
            <SelectItem value="500-1000">500 – 1,000 deliveries</SelectItem>
            <SelectItem value="1000+">More than 1,000</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label>Area</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jabodetabek">Jabodetabek</SelectItem>
            <SelectItem value="bandung">Bandung</SelectItem>
            <SelectItem value="surabaya">Surabaya</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Existing Delivery Partners</Label>
        {["Grab Express", "Gojek/Gosend", "Lalamove", "Paxel", "Others"].map(
          (label) => (
            <label key={label} className="flex items-center gap-2 text-paragraph-sm">
              <Checkbox /> {label}
            </label>
          ),
        )}
      </div>

      <FancyButton tone="primary" size="md">
        Continue
      </FancyButton>

      <div className="flex flex-wrap justify-center gap-x-1 text-center">
        <p className="text-paragraph-sm text-text-sub-600">
          Need more than 1000 deliveries?
        </p>
        <LinkButton tone="neutral" size="md">
          Let&apos;s talk
        </LinkButton>
      </div>
    </>
  )
}

