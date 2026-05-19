"use client"

import { PasswordInput } from "@/registry/dash/ui/password-input"
import { Label } from "@/registry/dash/ui/label"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function PasswordInputDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Form"
        title="Password Input"
        description="Password field with a leading lock icon and an eye / eye-off visibility toggle. Wraps InputRoot + Input + InputIcon so it inherits all sizing, focus, and invalid states."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add password-input`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default"
          description="Leading lock icon + trailing eye toggle. Click the eye to reveal."
          preview={
            <div className="w-full max-w-sm space-y-1.5">
              <Label htmlFor="pw-demo">Password</Label>
              <PasswordInput id="pw-demo" defaultValue="rahasia123" />
            </div>
          }
          code={`<PasswordInput id="password" />`}
        />
        <DocsExample
          title="Without leading icon"
          description="Drop the lock icon when label context is enough."
          preview={
            <div className="w-full max-w-sm space-y-1.5">
              <Label htmlFor="pw-demo-2">Password baru</Label>
              <PasswordInput
                id="pw-demo-2"
                showLeadingIcon={false}
                autoComplete="new-password"
              />
            </div>
          }
          code={`<PasswordInput showLeadingIcon={false} autoComplete="new-password" />`}
        />
        <DocsExample
          title="Invalid state"
          description="Pair with form validation to highlight password errors."
          preview={
            <div className="w-full max-w-sm space-y-1.5">
              <Label htmlFor="pw-demo-3">Password</Label>
              <PasswordInput
                id="pw-demo-3"
                invalid
                defaultValue="short"
                aria-describedby="pw-demo-3-error"
              />
              <p id="pw-demo-3-error" className="text-xs text-error-base">
                Minimal 8 karakter.
              </p>
            </div>
          }
          code={`<PasswordInput invalid />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          A thin wrapper over the Input primitive — composes <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">InputRoot</code>, an optional leading <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">InputIcon</code> (lock), the masked <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">Input</code> itself, and a trailing icon button that flips <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">type</code> between <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">password</code> and <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">text</code>. Use it anywhere you would use <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">Input</code> for credentials so reveal behaviour stays consistent.
        </p>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "size",
              type: `"sm" | "md" | "lg" | "xl"`,
              defaultValue: `"md"`,
              description: "Forwarded to underlying InputRoot.",
            },
            {
              name: "invalid",
              type: "boolean",
              defaultValue: "false",
              description: "Marks the field as invalid (red border + ring).",
            },
            {
              name: "showLeadingIcon",
              type: "boolean",
              defaultValue: "true",
              description: "Toggle the leading lock icon.",
            },
            {
              name: "autoComplete",
              type: "string",
              defaultValue: `"current-password"`,
              description:
                "Override to \"new-password\" inside signup / change-password.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-3 text-base text-text-sub-600 leading-relaxed">
          <li><strong className="text-text-strong-950">Role</strong> — Renders a native <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<input type="password" />`}</code>. The reveal toggle is a real <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<button type="button" />`}</code> so it never submits the surrounding form.</li>
          <li><strong className="text-text-strong-950">Reveal toggle label</strong> — carries <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-label</code> that flips between <em>Show password</em> and <em>Hide password</em>, plus <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-pressed</code> for screen-reader state.</li>
          <li><strong className="text-text-strong-950">Labels</strong> — always pair with a <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<Label htmlFor>`}</code>. The leading lock icon is decorative (<code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-hidden</code>) and never replaces a label.</li>
          <li><strong className="text-text-strong-950">Errors</strong> — when <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">invalid</code>, set <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-describedby</code> to the inline error message&apos;s id so AT users hear the reason.</li>
          <li><strong className="text-text-strong-950">Autocomplete</strong> — defaults to <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">current-password</code> for sign-in. Switch to <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">new-password</code> on sign-up / change-password so password managers behave correctly.</li>
          <li><strong className="text-text-strong-950">Keyboard</strong> — Tab focuses the field, a second Tab moves to the reveal toggle. Enter / Space activates the toggle without submitting the form.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
