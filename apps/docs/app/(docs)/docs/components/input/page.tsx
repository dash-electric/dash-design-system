"use client"

import * as React from "react"
import {
  RiSearchLine as Search,
  RiMailLine as Mail,
  RiUser3Line as User,
  RiPhoneLine as Phone,
  RiBankCardLine as Card,
  RiGlobalLine as Globe,
  RiLinkM as Link,
  RiCalendarLine as Calendar,
  RiLockLine as Lock,
  RiEyeLine as Eye,
  RiEyeOffLine as EyeOff,
  RiFileCopyLine as Copy,
  RiCloseLine as X,
  RiCheckLine as Check,
  RiEditLine as Pencil,
  RiAddLine as Plus,
  RiSubtractLine as Minus,
  RiArrowDownSLine as ChevronDown,
  RiEmotionHappyLine as Smiley,
  RiInformationLine as Info,
  RiAccountCircleLine as AccountIcon,
  RiContactsBook2Line as Contacts,
  RiLink as SocialLinks,
} from "@remixicon/react"
import { InputRoot, Input, InputIcon, InputAffix } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Field, FieldDescription } from "@/registry/dash/ui/field"
import { Hint } from "@/registry/dash/ui/hint"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Kbd } from "@/registry/dash/ui/kbd"
import { Textarea } from "@/registry/dash/ui/textarea"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { DocsApiTable } from "@/components/docs/api-table"
import { DocsShadcnTemplate } from "@/components/docs/shadcn-template"

/**
 * Text Input — Figma 1:1 (11 nodes verified 2026-05-18).
 *
 *   266:5251        Master spec — 3 sizes × 6 states × full compositions
 *   428:4860        Tag Input composition (cross-link: /docs/components/tag)
 *   428:5656        Counter Input composition (− value +)
 *   429:5172        State keystroke matrix
 *   429:5195        Icon + trailing affordances (X clear, ✓ confirm, pencil edit)
 *   167413:49614    Account Setup modal — Required Information accordion
 *   167413:49675    Invite to Project modal — Invite Members composite
 *   167413:49712    Contact Information modal — Email + Phone(country) + Address
 *   167413:49724    Social Links modal — domain prefix + URL
 *   167413:49734    Change Password modal — lock + eye toggle + strength meter
 *   3668:7747       Use cases gallery (Email/Phone/Card/Website/Amount/Date/Search/Password/Share/Invite/Emoji/Tag/Counter)
 */

function ClearConfirmTrailing({ onClear }: { onClear?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      <CompactButton
        variant="ghost"
        size="sm"
        aria-label="Clear"
        type="button"
        onClick={onClear}
      >
        <X />
      </CompactButton>
      <CompactButton
        variant="ghost"
        size="sm"
        aria-label="Confirm"
        type="button"
      >
        <Check />
      </CompactButton>
    </span>
  )
}

function StrengthMeter({ score }: { score: 0 | 1 | 2 | 3 }) {
  const tones = [
    "bg-error-base",
    "bg-warning-base",
    "bg-warning-base",
    "bg-success-base",
  ] as const
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-1 rounded-full ${i < score ? tones[score - 1] : "bg-bg-soft-200"}`}
        />
      ))}
    </div>
  )
}

export default function InputDocsPage() {
  const [pwdVisible, setPwdVisible] = React.useState(false)
  const [pwd, setPwd] = React.useState("Untilm@thHe@rt")
  const [pwd2, setPwd2] = React.useState("")
  const [pwd3, setPwd3] = React.useState("")
  const [count, setCount] = React.useState(16)
  const [amount, setAmount] = React.useState("")

  const pwdScore: 0 | 1 | 2 | 3 = pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) ? 3 : pwd.length >= 6 ? 2 : pwd.length > 0 ? 1 : 0

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Form"
        title="Text Input"
        description="Single-line text field. Composable parts (Root, Icon, Affix) so you can slot leading icons, prefixes, suffixes, country codes, currency selectors, copy buttons, and inline action affordances without rebuilding the trigger box."
      />

      <DocsShadcnTemplate
        name="input"
        heroPreview={
          <div className="w-full max-w-md space-y-3">
            <InputRoot>
              <InputIcon><Search className="size-4" /></InputIcon>
              <Input placeholder="Search mitra, trip, or driver…" />
            </InputRoot>
            <InputRoot>
              <InputIcon><Mail className="size-4" /></InputIcon>
              <Input type="email" placeholder="you@dash.id" />
            </InputRoot>
          </div>
        }
        heroCode={`<InputRoot>
  <InputIcon><Search className="size-4" /></InputIcon>
  <Input placeholder="Search mitra, trip, or driver…" />
</InputRoot>`}
        usageImport={`import { InputRoot, Input, InputIcon, InputAffix } from "@/registry/dash/ui/input"`}
        usageJsx={`<InputRoot>
  <InputIcon><Search className="size-4" /></InputIcon>
  <Input placeholder="Search…" />
</InputRoot>`}
        manual={{
          sourcePath: "registry/dash/ui/input.tsx",
          dependencies: ["@radix-ui/react-slot"],
        }}
      />

      <DocsSection title="State matrix">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          6 visual states — <strong>default · hover · focus · filled · disabled · error</strong>. Hover + focus driven by CSS (no prop). Filled = user typed. Disabled + invalid wired via Root.
        </p>
        <DocsExample
          title="6 states stacked"
          preview={
            <div className="w-full max-w-md space-y-3">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400">default</div>
                <InputRoot><Input placeholder="Placeholder text…" /></InputRoot>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400">hover (try hovering)</div>
                <InputRoot className="hover:bg-bg-weak-50"><Input placeholder="Placeholder text…" /></InputRoot>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400">focus</div>
                <InputRoot className="border-stroke-strong-950 ring-2 ring-ring ring-offset-2"><Input autoFocus={false} placeholder="Type to see cursor" /></InputRoot>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400">filled</div>
                <InputRoot><Input defaultValue="James Brown" /></InputRoot>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400">disabled</div>
                <InputRoot><Input disabled defaultValue="James Brown" /></InputRoot>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400">error</div>
                <InputRoot invalid><Input defaultValue="not-an-email" /></InputRoot>
              </div>
            </div>
          }
          code={`<InputRoot><Input placeholder="..." /></InputRoot>
<InputRoot><Input disabled defaultValue="..." /></InputRoot>
<InputRoot invalid><Input defaultValue="..." /></InputRoot>`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          4 sizes — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm</code> (32 / X-Small Figma), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">md</code> (36 / Small Figma), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">lg</code> (40 / Medium Figma, default), and Dash extension <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">xl</code> (44 / used in auth flows).
        </p>
        <DocsExample
          title="sm / md / lg / xl"
          preview={
            <div className="w-full max-w-md space-y-3">
              <InputRoot size="sm"><InputIcon><User className="size-3.5" /></InputIcon><Input placeholder="sm (32px)" /></InputRoot>
              <InputRoot size="md"><InputIcon><User className="size-4" /></InputIcon><Input placeholder="md (36px)" /></InputRoot>
              <InputRoot size="lg"><InputIcon><User className="size-4" /></InputIcon><Input placeholder="lg (40px) — default" /></InputRoot>
              <InputRoot size="xl"><InputIcon><User className="size-4" /></InputIcon><Input placeholder="xl (44px) — Dash extension" /></InputRoot>
            </div>
          }
          code={`<InputRoot size="sm"><Input /></InputRoot>
<InputRoot size="md"><Input /></InputRoot>
<InputRoot size="lg"><Input /></InputRoot>
<InputRoot size="xl"><Input /></InputRoot>`}
        />
      </DocsSection>

      <DocsSection title="Icons & inline affordances">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Slot icons via <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">InputIcon</code>. For row-cell editing patterns (Account Setup): use leading icon + trailing pencil. On focus, swap pencil with X-clear + ✓-confirm via <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">CompactButton</code>.
        </p>
        <DocsExample
          title="Edit row patterns (Figma node 429:5195)"
          preview={
            <div className="w-full max-w-md space-y-3">
              <InputRoot>
                <InputIcon><User className="size-4" /></InputIcon>
                <Input placeholder="Placeholder text…" />
                <InputIcon><Pencil className="size-4" /></InputIcon>
              </InputRoot>
              <InputRoot className="bg-bg-weak-50">
                <InputIcon><User className="size-4" /></InputIcon>
                <Input placeholder="Placeholder text…" />
                <InputIcon><Pencil className="size-4" /></InputIcon>
              </InputRoot>
              <InputRoot className="border-stroke-strong-950 ring-2 ring-ring ring-offset-2">
                <InputIcon><User className="size-4" /></InputIcon>
                <Input defaultValue="Marketing Man" />
                <ClearConfirmTrailing />
              </InputRoot>
              <InputRoot>
                <InputIcon><User className="size-4" /></InputIcon>
                <Input defaultValue="James Brown" />
                <InputIcon><Pencil className="size-4" /></InputIcon>
              </InputRoot>
              <InputRoot>
                <InputIcon><User className="size-4" /></InputIcon>
                <Input disabled placeholder="Placeholder text…" />
                <InputIcon><Pencil className="size-4" /></InputIcon>
              </InputRoot>
              <InputRoot invalid>
                <InputIcon><User className="size-4" /></InputIcon>
                <Input defaultValue="Marketing Man" />
                <ClearConfirmTrailing />
              </InputRoot>
            </div>
          }
          code={`<InputRoot>
  <InputIcon><User className="size-4" /></InputIcon>
  <Input defaultValue="Marketing Man" />
  <CompactButton variant="ghost" size="sm" aria-label="Clear"><X /></CompactButton>
  <CompactButton variant="ghost" size="sm" aria-label="Confirm"><Check /></CompactButton>
</InputRoot>`}
        />
      </DocsSection>

      <DocsSection title="Affixes (prefix / suffix)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">InputAffix</code> slots a text fragment before or after the field. Use for static prefixes (https://), domains (facebook.com), or fixed unit suffixes (@dash.id, /200).
        </p>
        <DocsExample
          title="Common affix patterns"
          preview={
            <div className="w-full max-w-md space-y-3">
              <InputRoot>
                <InputAffix>https://</InputAffix>
                <Input placeholder="www.example.com" />
              </InputRoot>
              <InputRoot>
                <InputAffix>facebook.com</InputAffix>
                <Input placeholder="www.example.com" />
              </InputRoot>
              <InputRoot>
                <InputIcon><Mail className="size-4" /></InputIcon>
                <Input type="email" placeholder="nama@dash.id" />
                <InputAffix>@dash.id</InputAffix>
              </InputRoot>
            </div>
          }
          code={`<InputRoot>
  <InputAffix>https://</InputAffix>
  <Input placeholder="www.example.com" />
</InputRoot>`}
        />
      </DocsSection>

      <DocsSection title="Counter Input">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Numeric stepper. Compose with <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">CompactButton</code> on both sides + centered <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">Input</code> (Figma node 428:5656).
        </p>
        <DocsExample
          title="− value +"
          preview={
            <div className="w-full max-w-md space-y-2">
              <Field>
                <Label optional>Counter Input</Label>
                <InputRoot className="pl-1 pr-1">
                  <CompactButton variant="ghost" size="sm" aria-label="Decrement" onClick={() => setCount((c) => Math.max(0, c - 1))}>
                    <Minus />
                  </CompactButton>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value) || 0)}
                    className="text-center"
                  />
                  <CompactButton variant="ghost" size="sm" aria-label="Increment" onClick={() => setCount((c) => c + 1)}>
                    <Plus />
                  </CompactButton>
                </InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
            </div>
          }
          code={`<InputRoot className="pl-1 pr-1">
  <CompactButton variant="ghost" size="sm" aria-label="Decrement"
    onClick={() => setCount(c => Math.max(0, c - 1))}><Minus /></CompactButton>
  <Input type="number" value={count}
    onChange={(e) => setCount(Number(e.target.value))} className="text-center" />
  <CompactButton variant="ghost" size="sm" aria-label="Increment"
    onClick={() => setCount(c => c + 1)}><Plus /></CompactButton>
</InputRoot>`}
        />
      </DocsSection>

      <DocsSection title="Use cases gallery">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          14 production field compositions from Figma (node 3668:7747). All wrap the same <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">InputRoot</code> primitive — only the slotted parts differ.
        </p>
        <DocsExample
          title="Production field patterns"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Field>
                <Label optional>Change Label</Label>
                <InputRoot><InputIcon><User className="size-4" /></InputIcon><Input placeholder="Placeholder text…" /></InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>Email Address</Label>
                <InputRoot><InputIcon><Mail className="size-4" /></InputIcon><Input type="email" placeholder="hello@alignui.com" /></InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>Phone Number</Label>
                <InputRoot className="pl-1">
                  <button type="button" className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-bg-weak-50 shrink-0">
                    <span className="text-lg leading-none">🇺🇸</span>
                    <span className="text-sm">+1</span>
                    <ChevronDown className="size-3.5 text-icon-soft-400" />
                  </button>
                  <div className="w-px h-5 bg-stroke-soft-200" />
                  <Input type="tel" placeholder="(555) 000-0000" />
                </InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>Card Number</Label>
                <InputRoot><InputIcon><Card className="size-4" /></InputIcon><Input inputMode="numeric" placeholder="0000 0000 0000 0000" /><InputIcon><Card className="size-4" /></InputIcon></InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>Website</Label>
                <InputRoot><InputAffix>https://</InputAffix><Input placeholder="www.example.com" /></InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>Amount</Label>
                <InputRoot>
                  <InputAffix>€</InputAffix>
                  <Input inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <div className="w-px h-5 bg-stroke-soft-200" />
                  <button type="button" className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-bg-weak-50 shrink-0">
                    <span className="inline-flex size-4 items-center justify-center rounded-full bg-primary-base text-white text-[8px] font-bold">€</span>
                    <span className="text-sm">EUR</span>
                    <ChevronDown className="size-3.5 text-icon-soft-400" />
                  </button>
                </InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>Date</Label>
                <InputRoot><InputIcon><Calendar className="size-4" /></InputIcon><Input placeholder="DD / MM / YYYY" /></InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>Search</Label>
                <InputRoot><InputIcon><Search className="size-4" /></InputIcon><Input placeholder="Search…" /><Kbd>⌘1</Kbd></InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>Password</Label>
                <InputRoot>
                  <InputIcon><Lock className="size-4" /></InputIcon>
                  <Input type={pwdVisible ? "text" : "password"} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••••" />
                  <CompactButton variant="ghost" size="sm" aria-label={pwdVisible ? "Hide" : "Show"} onClick={() => setPwdVisible((v) => !v)}>
                    {pwdVisible ? <EyeOff /> : <Eye />}
                  </CompactButton>
                </InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>Share Link</Label>
                <InputRoot><InputIcon><Link className="size-4" /></InputIcon><Input placeholder="www.example.com" /><CompactButton variant="stroke" size="sm" aria-label="Copy"><Copy /></CompactButton></InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>Invite Members</Label>
                <InputRoot>
                  <InputIcon><User className="size-4" /></InputIcon>
                  <Input placeholder="Placeholder text…" />
                  <div className="w-px h-5 bg-stroke-soft-200" />
                  <button type="button" className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-bg-weak-50 shrink-0 text-sm">
                    can view
                    <ChevronDown className="size-3.5 text-icon-soft-400" />
                  </button>
                </InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
              <Field>
                <Label required>How do you feel today?</Label>
                <InputRoot><InputIcon><Smiley className="size-4" /></InputIcon><Input placeholder="Type or select an emoji…" /></InputRoot>
                <Hint tone="neutral">This is a hint text to help user.</Hint>
              </Field>
            </div>
          }
          code={`// Email
<InputRoot><InputIcon><Mail /></InputIcon><Input type="email" /></InputRoot>

// Phone w/ country selector
<InputRoot><button>🇺🇸 +1 ▾</button><Input type="tel" /></InputRoot>

// Amount w/ currency selector
<InputRoot><InputAffix>€</InputAffix><Input inputMode="decimal" /><button>EUR ▾</button></InputRoot>

// Search w/ keyboard shortcut
<InputRoot><InputIcon><Search /></InputIcon><Input /><Kbd>⌘1</Kbd></InputRoot>

// Password w/ visibility toggle
<InputRoot><InputIcon><Lock /></InputIcon><Input type="password" /><CompactButton><Eye /></CompactButton></InputRoot>

// Share Link w/ copy
<InputRoot><InputIcon><Link /></InputIcon><Input /><CompactButton><Copy /></CompactButton></InputRoot>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Account Setup">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Modal pattern — vertical list of borderless edit rows. Active row gets full <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">InputRoot</code> border + X-clear + ✓-confirm trailing (Figma node 167413:49614).
        </p>
        <DocsExample
          title="Required Information accordion"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm">
              <div className="flex items-start gap-3 p-4 border-b border-stroke-soft-200">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50">
                  <AccountIcon className="size-4 text-icon-sub-600" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-strong-950">Account Setup</div>
                  <div className="text-xs text-text-sub-600">Complete simple steps to get started.</div>
                </div>
                <CompactButton variant="ghost" size="sm" aria-label="Close"><X /></CompactButton>
              </div>
              <div className="px-4 py-3 border-b border-stroke-soft-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50">
                    <Contacts className="size-4 text-icon-sub-600" />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-strong-950 inline-flex items-center gap-1">Required Information <Info className="size-3.5 text-icon-soft-400" /></div>
                    <div className="text-xs text-text-sub-600">Provide required information.</div>
                  </div>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warning-lighter text-warning-darker">In Progress</span>
                </div>
                <ul className="rounded-xl border border-stroke-soft-200 divide-y divide-stroke-soft-200">
                  {[
                    { icon: User, label: "Full Name", value: "James Brown" },
                    { icon: Phone, label: "Phone", value: "(385) 154-1736" },
                    { icon: Calendar, label: "Date of Birth", value: "04/09/1991" },
                  ].map((row) => (
                    <li key={row.label} className="grid grid-cols-[110px_1fr] items-center px-3 py-2 gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-sub-600"><row.icon className="size-4 text-icon-soft-400" />{row.label}</span>
                      <span className="text-sm text-text-strong-950">{row.value}</span>
                    </li>
                  ))}
                  <li className="grid grid-cols-[110px_1fr] items-center px-3 py-2 gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-text-sub-600"><User className="size-4 text-icon-soft-400" />Occupation</span>
                    <InputRoot size="md" className="border-stroke-strong-950 ring-2 ring-ring ring-offset-2">
                      <Input defaultValue="Marketing Man" />
                      <ClearConfirmTrailing />
                    </InputRoot>
                  </li>
                  {[
                    { icon: Mail, label: "Email", placeholder: "Enter email address…" },
                    { icon: Phone, label: "Address", placeholder: "Enter address…" },
                  ].map((row) => (
                    <li key={row.label} className="grid grid-cols-[110px_1fr] items-center px-3 py-2 gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-sub-600"><row.icon className="size-4 text-icon-soft-400" />{row.label}</span>
                      <span className="text-sm text-text-soft-400">{row.placeholder}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-end gap-2 p-3">
                <Button style="stroke" tone="neutral">Skip</Button>
                <Button>Proceed</Button>
              </div>
            </div>
          }
          code={`// Active row pattern (rest of rows are read-only)
<li className="grid grid-cols-[110px_1fr] items-center px-3 py-2 gap-2">
  <span className="text-xs text-text-sub-600">Occupation</span>
  <InputRoot size="md" className="border-stroke-strong-950 ring-2 ring-ring">
    <Input defaultValue="Marketing Man" />
    <CompactButton aria-label="Clear"><X /></CompactButton>
    <CompactButton aria-label="Confirm"><Check /></CompactButton>
  </InputRoot>
</li>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Contact Information">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Email + Phone (country code prefix) + Address (Textarea w/ counter). Figma node 167413:49712.
        </p>
        <DocsExample
          title="Modal form"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm p-4 space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-stroke-soft-200">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50">
                  <Contacts className="size-4 text-icon-sub-600" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-strong-950">Contact Information</div>
                  <div className="text-xs text-text-sub-600">Enter your contact details for communication.</div>
                </div>
              </div>
              <Field>
                <Label required>Email Address</Label>
                <InputRoot><Input type="email" defaultValue="sophia@alignui.com" /></InputRoot>
              </Field>
              <Field>
                <Label required>Phone Number</Label>
                <InputRoot className="pl-1">
                  <button type="button" className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-bg-weak-50 shrink-0">
                    <span className="text-lg leading-none">🇺🇸</span>
                    <span className="text-sm">+1</span>
                    <ChevronDown className="size-3.5 text-icon-soft-400" />
                  </button>
                  <div className="w-px h-5 bg-stroke-soft-200" />
                  <Input type="tel" placeholder="(555) 000-0000" />
                </InputRoot>
              </Field>
              <Field>
                <Label required>Address</Label>
                <div className="relative">
                  <Textarea placeholder="Enter your full address here…" maxLength={200} className="min-h-[80px] pb-8" />
                  <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-text-soft-400">0/200</span>
                </div>
                <Hint tone="neutral">Input your residential address for HR records.</Hint>
              </Field>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button style="stroke" tone="neutral">Discard</Button>
                <Button>Apply Changes</Button>
              </div>
            </div>
          }
          code={`<Field>
  <Label required>Phone Number</Label>
  <InputRoot className="pl-1">
    <button>🇺🇸 +1 ▾</button>
    <div className="w-px h-5 bg-stroke-soft-200" />
    <Input type="tel" placeholder="(555) 000-0000" />
  </InputRoot>
</Field>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Social Links">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Split input — fixed domain prefix on left, free-form URL on right. Connected via shared visual divider, but kept as separate <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">InputRoot</code> + <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">Input</code> internally (Figma node 167413:49724).
        </p>
        <DocsExample
          title="Domain prefix pattern"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm p-4 space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-stroke-soft-200">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50">
                  <SocialLinks className="size-4 text-icon-sub-600" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-strong-950">Social Links</div>
                  <div className="text-xs text-text-sub-600">Manage your social media connections.</div>
                </div>
              </div>
              {[
                { name: "Facebook", domain: "facebook.com" },
                { name: "Instagram", domain: "instagram.com" },
                { name: "Twitter", domain: "twitter.com" },
              ].map((s) => (
                <Field key={s.name}>
                  <Label optional>{s.name}</Label>
                  <div className="flex">
                    <InputRoot className="flex-1 rounded-r-none border-r-0">
                      <Input placeholder={s.domain} className="text-text-soft-400" readOnly />
                    </InputRoot>
                    <InputRoot className="flex-1 rounded-l-none">
                      <Input placeholder="www.example.com" />
                    </InputRoot>
                  </div>
                </Field>
              ))}
              <Button style="stroke" tone="neutral" className="w-full"><Plus className="size-4" /> Add Social Link</Button>
            </div>
          }
          code={`<Field>
  <Label optional>Facebook</Label>
  <div className="flex">
    <InputRoot className="flex-1 rounded-r-none border-r-0">
      <Input placeholder="facebook.com" readOnly />
    </InputRoot>
    <InputRoot className="flex-1 rounded-l-none">
      <Input placeholder="www.example.com" />
    </InputRoot>
  </div>
</Field>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Change Password">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Password trio + eye toggle + strength meter + rule checklist. Figma node 167413:49734. (For a dedicated stand-alone password field with bundled toggle + rules, see <a href="/docs/components/password-input" className="text-primary-base underline">Password Input</a>.)
        </p>
        <DocsExample
          title="Change Password modal"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm p-4 space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-stroke-soft-200">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50">
                  <Lock className="size-4 text-icon-sub-600" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-strong-950">Change Password</div>
                  <div className="text-xs text-text-sub-600">Update password for enhanced account security.</div>
                </div>
              </div>
              <Field>
                <Label required>Current Password</Label>
                <InputRoot>
                  <InputIcon><Lock className="size-4" /></InputIcon>
                  <Input type="password" defaultValue="••••••••••" />
                  <CompactButton variant="ghost" size="sm" aria-label="Show"><Eye /></CompactButton>
                </InputRoot>
              </Field>
              <Field>
                <Label required>New Password</Label>
                <InputRoot>
                  <InputIcon><Lock className="size-4" /></InputIcon>
                  <Input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} placeholder="••••••••••" />
                  <CompactButton variant="ghost" size="sm" aria-label="Show"><Eye /></CompactButton>
                </InputRoot>
              </Field>
              <Field>
                <Label required>Confirm New Password</Label>
                <InputRoot>
                  <InputIcon><Lock className="size-4" /></InputIcon>
                  <Input type="password" value={pwd3} onChange={(e) => setPwd3(e.target.value)} placeholder="••••••••••" />
                  <CompactButton variant="ghost" size="sm" aria-label="Show"><Eye /></CompactButton>
                </InputRoot>
              </Field>
              <div className="space-y-2 pt-1">
                <StrengthMeter score={pwdScore} />
                <div className="text-xs text-text-sub-600">Must contain at least:</div>
                <ul className="space-y-1 text-xs">
                  {[
                    { label: "At least 1 uppercase", ok: /[A-Z]/.test(pwd2) },
                    { label: "At least 1 number", ok: /[0-9]/.test(pwd2) },
                    { label: "At least 8 characters", ok: pwd2.length >= 8 },
                  ].map((r) => (
                    <li key={r.label} className="inline-flex items-center gap-1.5">
                      <span className={`inline-flex size-3.5 items-center justify-center rounded-full ${r.ok ? "bg-success-base text-white" : "bg-bg-soft-200 text-text-soft-400"}`}>
                        {r.ok ? <Check className="size-2.5" /> : <X className="size-2.5" />}
                      </span>
                      <span className={r.ok ? "text-text-strong-950" : "text-text-sub-600"}>{r.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button style="stroke" tone="neutral">Discard</Button>
                <Button>Apply Changes</Button>
              </div>
            </div>
          }
          code={`<InputRoot>
  <InputIcon><Lock /></InputIcon>
  <Input type={visible ? "text" : "password"} value={pwd}
    onChange={(e) => setPwd(e.target.value)} />
  <CompactButton aria-label="Toggle"
    onClick={() => setVisible(v => !v)}>
    {visible ? <EyeOff /> : <Eye />}
  </CompactButton>
</InputRoot>
<StrengthMeter score={pwdScore} />
<ul>{rules.map(r => <li>{r.ok ? '✓' : '✗'} {r.label}</li>)}</ul>`}
        />
      </DocsSection>

      <DocsSection title="With Field + Label + Hint">
        <DocsExample
          title="Full form field"
          preview={
            <div className="w-full max-w-md">
              <Field>
                <Label htmlFor="email-full" required>
                  Email Address
                </Label>
                <InputRoot>
                  <InputIcon><Mail className="size-4" /></InputIcon>
                  <Input id="email-full" type="email" placeholder="hello@alignui.com" />
                </InputRoot>
                <FieldDescription>We'll send order confirmations here.</FieldDescription>
              </Field>
            </div>
          }
          code={`<Field>
  <Label htmlFor="email" required>Email Address</Label>
  <InputRoot>
    <InputIcon><Mail /></InputIcon>
    <Input id="email" type="email" />
  </InputRoot>
  <FieldDescription>We'll send order confirmations here.</FieldDescription>
</Field>`}
        />
      </DocsSection>

      <DocsSection title="Label, don't lean on placeholder">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The placeholder disappears once the user types. A visible Label keeps the field self-explanatory at every stage of the form.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm">
                <Field>
                  <Label required>Nomor handphone mitra</Label>
                  <InputRoot>
                    <InputIcon><Phone className="size-4" /></InputIcon>
                    <Input type="tel" placeholder="0812 3456 7890" />
                  </InputRoot>
                  <Hint tone="neutral">Kami kirim use-code ke nomor ini.</Hint>
                </Field>
              </div>
            ),
            caption: "Pair a visible Label and Hint so the field stays understandable after typing — and tells the mitra what the number is for.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm">
                <InputRoot>
                  <Input placeholder="Nomor handphone mitra" />
                </InputRoot>
              </div>
            ),
            caption: "Placeholder-only labels disappear on focus, leaving partners staring at a blank field and unsure what they typed.",
          }}
        />
      </DocsSection>

      <DocsSection title="Surface errors next to the field">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          When validation fails, switch the field to <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">invalid</code> and attach a Hint that says exactly how to fix it.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm">
                <Field>
                  <Label required>Use-code mitra</Label>
                  <InputRoot invalid>
                    <Input defaultValue="49213" />
                  </InputRoot>
                  <Hint tone="error">Use-code harus 6 digit. Kurang 1 digit.</Hint>
                </Field>
              </div>
            ),
            caption: "Show the invalid border plus a Hint that names the rule. The mitra fixes it without retrying blind.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm">
                <Field>
                  <Label required>Use-code mitra</Label>
                  <InputRoot invalid>
                    <Input defaultValue="49213" />
                  </InputRoot>
                </Field>
              </div>
            ),
            caption: "A red border alone tells the mitra something is wrong but not what — they retry the same value and stay stuck.",
          }}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Nomor mitra search"
          description="Halo-dash quick search bar. Leading icon search, ⌘K shortcut hint, clear button setelah ada value."
          preview={
            <div className="w-full max-w-md">
              <InputRoot>
                <InputIcon><Search /></InputIcon>
                <Input placeholder="Cari mitra · mtr-9412, nama, atau plat" defaultValue="mtr-94" />
                <InputAffix><Kbd>⌘K</Kbd></InputAffix>
              </InputRoot>
            </div>
          }
          code={`<InputRoot>
  <InputIcon><Search /></InputIcon>
  <Input placeholder="Cari mitra · mtr-9412, nama, atau plat" />
  <InputAffix><Kbd>⌘K</Kbd></InputAffix>
</InputRoot>`}
        />

        <DocsExample
          title="Payout amount — Rupiah prefix"
          description="Ops input nominal payout manual. Affix 'Rp' kiri + tabular-nums alignment di angka."
          preview={
            <Field className="w-full max-w-xs">
              <Label>Nominal payout</Label>
              <InputRoot>
                <InputAffix>Rp</InputAffix>
                <Input
                  type="text"
                  inputMode="numeric"
                  className="tabular-nums"
                  defaultValue="2.450.000"
                />
              </InputRoot>
              <FieldDescription>Maksimum Rp 25.000.000 per transfer manual.</FieldDescription>
            </Field>
          }
          code={`<Field>
  <Label>Nominal payout</Label>
  <InputRoot>
    <InputAffix>Rp</InputAffix>
    <Input
      type="text"
      inputMode="numeric"
      className="tabular-nums"
      value={amount}
      onChange={(e) => setAmount(formatRupiah(e.target.value))}
    />
  </InputRoot>
  <FieldDescription>Maksimum Rp 25.000.000 per transfer manual.</FieldDescription>
</Field>`}
        />

        <DocsExample
          title="Nomor plat kendaraan — validation"
          description="Mitra input plat saat onboarding. Pattern validation untuk format Indonesia (B 1234 ABC). Error state inline."
          preview={
            <Field className="w-full max-w-xs">
              <Label>Nomor plat</Label>
              <InputRoot invalid>
                <Input defaultValue="B1234" />
              </InputRoot>
              <Hint tone="error">Format harus B 1234 ABC (huruf area + 4 digit + huruf area).</Hint>
            </Field>
          }
          code={`<Field>
  <Label>Nomor plat</Label>
  <InputRoot invalid={!isValidPlat(plat)}>
    <Input
      value={plat}
      onChange={(e) => setPlat(e.target.value.toUpperCase())}
      placeholder="B 1234 ABC"
    />
  </InputRoot>
  {!isValidPlat(plat) && (
    <Hint tone="error">
      Format harus B 1234 ABC (huruf area + 4 digit + huruf area).
    </Hint>
  )}
</Field>`}
        />
      </DocsSection>

      <DocsSection title="API" id="api">
        <DocsApiTable
          idPrefix="input-prop"
          rows={[
            { name: "size", type: '"sm" | "md" | "lg" | "xl"', defaultValue: '"lg"', description: "Field height (32/36/40/44px). sm/md/lg = Figma X-Small/Small/Medium · xl = Dash extension." },
            { name: "invalid", type: "boolean", defaultValue: "false", description: "Destructive border + ring. On InputRoot." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Disable. Forwarded to Input." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>InputRoot</strong> — outer container. Owns size, invalid, disabled state + focus ring.</li>
          <li className="pl-4">├ <strong>InputIcon</strong> — leading or trailing icon. Mute color, sized to match text.</li>
          <li className="pl-4">├ <strong>Input</strong> — raw <code className="text-xs">{`<input>`}</code>. Drops outer border/ring (lives on Root).</li>
          <li className="pl-4">├ <strong>InputAffix</strong> — leading or trailing text affix (currency, domain).</li>
          <li className="pl-4">└ <strong>CompactButton</strong> — for inline X-clear / ✓-confirm / 👁-toggle / 📋-copy affordances.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Label wiring</strong> — pass <code className="text-xs">id</code> on Input + <code className="text-xs">htmlFor</code> on Label. Field auto-handles this.</li>
          <li>• <strong>Description / Error wiring</strong> — pair Input <code className="text-xs">aria-describedby</code> with the Hint / FieldDescription <code className="text-xs">id</code>.</li>
          <li>• <strong>Invalid state</strong> — set <code className="text-xs">invalid</code> on InputRoot; pair with a Hint <code className="text-xs">tone=&quot;error&quot;</code>.</li>
          <li>• <strong>Icons + affixes</strong> — purely decorative; rendered with <code className="text-xs">aria-hidden</code>. The visible Label carries meaning.</li>
          <li>• <strong>Inline affordances</strong> — every CompactButton needs <code className="text-xs">aria-label</code> (Clear, Confirm, Show password, Copy).</li>
          <li>• <strong>Keyboard</strong> — native input. <code className="text-xs">Tab</code> moves focus, focus ring appears on InputRoot via <code className="text-xs">:has(input:focus)</code>.</li>
          <li>• <strong>Required fields</strong> — pass <code className="text-xs">required</code> on Input + <code className="text-xs">required</code> on Label (renders <code className="text-xs">*</code>).</li>
          <li>• <strong>Color contrast</strong> — placeholder text uses <code className="text-xs">text-text-soft-400</code>, AA against <code className="text-xs">bg-white-0</code>.</li>
          <li>• <strong>Reduced motion</strong> — focus ring transition respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
