"use client"

import { useState } from "react"
import { RiAddLine as Plus, RiTruckLine as Truck, RiDeleteBinLine as Trash2, RiArrowRightLine as ArrowRight, RiDownloadLine as Download } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsPrinciples,
  DocsDoDont,
  DocsVariantTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const TONES = ["primary", "neutral", "destructive"] as const
const STYLES = ["filled", "stroke", "lighter", "ghost"] as const
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const

export default function ButtonDocsPage() {
  const [submitting, setSubmitting] = useState(false)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Actions"
        title="Button"
        status="stable"
        kind="atom"
        description="The most-reached-for primitive. Three tones, six styles, five sizes, plus icon-only variants. Use it for every action trigger across Dash — dispatch confirms, mitra suspensions, settings saves, navigation jumps."
        tabs={[
          { label: "Usage", active: true },
          { label: "Spec" },
          { label: "Status" },
        ]}
      />

      <DocsSection title="Principles">
        <DocsPrinciples
          items={[
            {
              title: "Actionable",
              body: "A button label states what happens when activated. Use verbs like Save, Confirm, Suspend — never vague labels like OK or Submit.",
            },
            {
              title: "Contextual",
              body: "Buttons sit alongside the content they act on. The primary action is the one the user most likely needs to take in that screen, not the safest fallback.",
            },
            {
              title: "Decisive",
              body: "One filled primary per surface. Pair it with a stroke neutral for the alternate path. Destructive only for permanent removal.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          A Dash <strong>Button</strong> consists of an optional leading icon, a required label, and an optional trailing icon. Icon-only variants drop the label entirely and require an <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-label</code>.
        </p>
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-10 flex items-center justify-center gap-12">
          <div className="flex flex-col items-center gap-3">
            <Button leftIcon={<Plus />} rightIcon={<ArrowRight />}>
              Label
            </Button>
            <span className="text-[11px] uppercase tracking-widest text-text-soft-400">
              withLabel
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Button size="icon-md" aria-label="Track">
              <Truck />
            </Button>
            <span className="text-[11px] uppercase tracking-widest text-text-soft-400">
              iconOnly
            </span>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Tones">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Tone defines the intent of the button. Pick by what the action does, not by visual preference.
        </p>
        <DocsVariantTable
          nameHeader="Tone"
          rows={[
            { name: "primary", description: "The main action on a screen — save, confirm, submit. Use one filled primary per surface." },
            { name: "neutral", description: "Secondary actions, alternates to the primary. Most buttons in dense UI use stroke neutral." },
            { name: "destructive", description: "Permanently removes data — suspend mitra, delete trip, revoke access. Always pair with a confirmation step." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Styles">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Style controls visual weight. Same tone, different emphasis level.
        </p>
        <DocsVariantTable
          nameHeader="Style"
          rows={[
            { name: "filled", description: "Highest emphasis. Solid background. One per surface." },
            { name: "stroke", description: "Medium emphasis. Outlined. Default for Cancel and most secondary actions." },
            { name: "lighter", description: "Soft tinted background — primary-alpha-10 / state-X-alpha-10 overlay. Use when filled is too loud (inline rows, table actions, dense UI)." },
            { name: "ghost", description: "Lowest emphasis. Transparent until hover. Use sparingly." },
            { name: "link", description: "Inline text-style. Only when embedded in body copy." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Match button size to row density and surrounding type scale.
        </p>
        <DocsVariantTable
          nameHeader="Size"
          rows={[
            { name: "xs", description: "Inline or supporting actions. Min touch target 32px (web-only)." },
            { name: "sm", description: "Compact rows, table actions, tight layouts." },
            { name: "md", description: "Default. Use for most buttons." },
            { name: "lg", description: "Prominent CTAs, dense toolbars, mobile prominent actions." },
            { name: "xl", description: "Hero-level emphasis. Landing pages, empty-state primary." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Primary buttons">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Use one filled primary per context. It guides the user toward the most likely next action.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-col gap-3">
                <Button size="lg">Save changes</Button>
                <Button tone="neutral" style="stroke" size="lg">
                  Cancel
                </Button>
              </div>
            ),
            caption: "Use one filled primary to highlight the action the user will most likely take. Pair with stroke neutral for the alternate path.",
          }}
          dont={{
            preview: (
              <div className="flex flex-col gap-3">
                <Button size="lg">Save changes</Button>
                <Button size="lg">Cancel</Button>
              </div>
            ),
            caption: "Avoid two filled primaries on the same surface. The user loses the visual hierarchy and can't tell which action is recommended.",
          }}
        />
      </DocsSection>

      <DocsSection title="Destructive actions">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Destructive buttons remove data. Always pair them with a confirmation step before finalizing the action.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-col gap-3">
                <Button tone="neutral" style="stroke">Keep mitra active</Button>
                <Button tone="destructive">Suspend permanently</Button>
              </div>
            ),
            caption: "Show a confirmation dialog before the destructive action. Use a filled destructive button only for the final confirm step.",
          }}
          dont={{
            preview: (
              <div className="flex flex-col gap-3">
                <Button tone="destructive">Sign out</Button>
              </div>
            ),
            caption: "Don't use destructive styling for actions that don't cause data loss, like signing out or canceling a task.",
          }}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Tone × style matrix"
          description="Three tones × five styles. The full surface vocabulary."
          preview={
            <div className="w-full space-y-2">
              {TONES.map((tone) => (
                <div key={tone} className="grid grid-cols-[80px_repeat(5,_1fr)] items-center gap-2">
                  <code className="text-[10px] text-text-sub-600">{tone}</code>
                  {STYLES.map((style) => (
                    <Button key={style} tone={tone} style={style} size="sm">
                      Action
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          }
          code={`<Button tone="primary" style="filled">Action</Button>
<Button tone="neutral" style="stroke">Action</Button>
<Button tone="destructive" style="lighter">Action</Button>`}
        />

        <DocsExample
          title="Sizes"
          description="Five sizes for label buttons, five for icon-only."
          preview={
            <div className="flex flex-wrap items-end gap-3">
              {SIZES.map((s) => (
                <Button key={s} size={s}>size={s}</Button>
              ))}
            </div>
          }
          code={`<Button size="xs">xs</Button>
<Button size="sm">sm</Button>
<Button size="md">md</Button>
<Button size="lg">lg</Button>
<Button size="xl">xl</Button>`}
        />

        <DocsExample
          title="With icons"
          description="Leading icons reinforce the label. Trailing icons signal next-step or expand."
          preview={
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Button leftIcon={<Plus />}>New dispatch</Button>
                <Button tone="neutral" style="stroke" leftIcon={<Download />}>Export CSV</Button>
                <Button tone="primary" style="lighter" rightIcon={<ArrowRight />}>Open Halo-dash</Button>
                <Button tone="destructive" leftIcon={<Trash2 />}>Suspend</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="icon-sm" aria-label="Add"><Plus /></Button>
                <Button size="icon-md" tone="neutral" style="stroke" aria-label="Track"><Truck /></Button>
                <Button size="icon-lg" tone="destructive" style="lighter" aria-label="Delete"><Trash2 /></Button>
                <Button size="icon-xl" tone="primary" style="ghost" aria-label="Continue"><ArrowRight /></Button>
              </div>
            </div>
          }
          code={`<Button leftIcon={<Plus />}>New dispatch</Button>
<Button rightIcon={<ArrowRight />}>Open Halo-dash</Button>

<Button size="icon-md" aria-label="Track"><Truck /></Button>`}
        />

        <DocsExample
          title="States"
          description="Default, disabled, loading. Loading swaps the leading icon for an animated spinner and marks the button busy."
          preview={
            <div className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button
                loading={submitting}
                onClick={() => {
                  setSubmitting(true)
                  setTimeout(() => setSubmitting(false), 1600)
                }}
                leftIcon={<Plus />}
              >
                {submitting ? "Saving…" : "Save mitra"}
              </Button>
              <Button tone="destructive" loading>Suspending…</Button>
            </div>
          }
          code={`<Button loading={isSaving}>Saving…</Button>
<Button disabled>Disabled</Button>`}
        />

        <DocsExample
          title="asChild for router links"
          description="Forward Button styles to a Next.js Link without wrapping the anchor in a button element."
          preview={
            <div className="text-sm text-text-sub-600">
              Forward Button styles to Next.js <code className="text-xs">Link</code> without wrapping.
            </div>
          }
          code={`import Link from "next/link"

<Button asChild>
  <Link href="/halo-dash/dispatch">Open dispatch queue</Link>
</Button>`}
        />
      </DocsSection>

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add button`} />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "tone", type: '"primary" | "neutral" | "destructive"', defaultValue: '"primary"', description: "Semantic intent." },
            { name: "style", type: '"filled" | "stroke" | "lighter" | "ghost" | "link"', defaultValue: '"filled"', description: "Surface treatment." },
            { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl" | "icon-xs" | "icon-sm" | "icon-md" | "icon-lg" | "icon-xl"', defaultValue: '"md"', description: "Height + padding preset." },
            { name: "asChild", type: "boolean", defaultValue: "false", description: "Render as the child element (Radix Slot)." },
            { name: "loading", type: "boolean", defaultValue: "false", description: "Swap icons for animated Loader2." },
            { name: "leftIcon", type: "ReactNode", description: "Icon before children." },
            { name: "rightIcon", type: "ReactNode", description: "Icon after children." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Disable + drop opacity." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-3 text-base text-text-sub-600 leading-relaxed">
          <li><strong className="text-text-strong-950">Role</strong> — renders a native <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<button>`}</code> by default. With <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">asChild</code>, the consumer element provides the role.</li>
          <li><strong className="text-text-strong-950">Keyboard</strong> — Tab moves focus, Enter and Space activate. Disabled removes from tab order; loading keeps it focusable but blocks activation.</li>
          <li><strong className="text-text-strong-950">Icon-only</strong> — REQUIRED to pass <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-label</code>. The icon itself is <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-hidden</code>.</li>
          <li><strong className="text-text-strong-950">Loading</strong> — auto-adds <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-busy=&quot;true&quot;</code> and swaps the leading icon for an animated spinner.</li>
          <li><strong className="text-text-strong-950">Color contrast</strong> — all 3 × 6 tone × style combinations pass WCAG AA.</li>
          <li><strong className="text-text-strong-950">Reduced motion</strong> — loader spin respects <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Related button variants">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl mb-4">
          Same trigger element, different visual language. Pick by use-case — they all share the same tone × size system underneath.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Button Group", href: "/docs/components/button-group", desc: "Joined buttons sharing a single visual unit." },
            { title: "Icon Button", href: "/docs/components/icon-button", desc: "Square-format icon-only — 28-44px." },
            { title: "Compact Button", href: "/docs/components/compact-button", desc: "Mini close X — 20-24px." },
            { title: "Link Button", href: "/docs/components/link-button", desc: "Inline anchor styled as a button-like link." },
            { title: "Social Button", href: "/docs/components/social-button", desc: "OAuth / SSO with brand logo + label." },
            { title: "Fancy Button", href: "/docs/components/fancy-button", desc: "Hero CTA — gradient sheen + lifted shadow." },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 transition-colors hover:border-(--dash-purple-300) hover:bg-bg-weak-50"
            >
              <div className="text-sm font-semibold text-text-strong-950 mb-1">{item.title}</div>
              <div className="text-xs text-text-sub-600 leading-relaxed">{item.desc}</div>
            </a>
          ))}
        </div>
      </DocsSection>
    </DocsPageShell>
  )
}
