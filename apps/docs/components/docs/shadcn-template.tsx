"use client"

import * as React from "react"
import { DocsSection } from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { DocsPreviewCodeTabs } from "@/components/docs/preview-code-tabs"
import { DocsInstallTabs } from "@/components/docs/install-tabs"
import { DocsCursorConfig } from "@/components/docs/cursor-config"

type ShadcnTemplateProps = {
  /** Component slug — drives the CLI command in InstallTabs. */
  name: string
  /** Hero preview node — the canonical "default" example. */
  heroPreview: React.ReactNode
  /** Hero code snippet matching the preview. */
  heroCode: string
  /** Single-line import statement, e.g. `import { Button } from "@/registry/dash/ui/button"`. */
  usageImport: string
  /** Single-line JSX example, e.g. `<Button tone="primary">Click me</Button>`. */
  usageJsx: string
  /**
   * RTL note — short line describing right-to-left support. Defaults to a
   * generic "logical properties" line that fits most Dash atoms.
   */
  rtlNote?: React.ReactNode
  /** Optional manual install block forwarded to DocsInstallTabs. */
  manual?: React.ComponentProps<typeof DocsInstallTabs>["manual"]
}

const DEFAULT_RTL =
  "Layout is built with logical properties (start/end), so the component flips correctly when its container has dir=\"rtl\". Icon placement, spacing, and focus ring all mirror without extra config."

/**
 * DocsShadcnTemplate — unified shadcn-parity block of 5 sections every
 * top-10 component page renders:
 *
 *   1. Preview / Code tabs (hero example)
 *   2. Installation (CLI + Manual)
 *   3. Usage (import + JSX)
 *   4. Cursor config (MCP wiring)
 *   5. RTL (right-to-left support note)
 *
 * Components keep their own Principles / Anatomy / Examples / API /
 * Accessibility sections below — this block slots in right after the
 * DocsHeader to give every page a consistent on-ramp.
 */
export const DocsShadcnTemplate = ({
  name,
  heroPreview,
  heroCode,
  usageImport,
  usageJsx,
  rtlNote = DEFAULT_RTL,
  manual,
}: ShadcnTemplateProps) => (
  <>
    <DocsSection title="Preview" id="preview">
      <DocsPreviewCodeTabs preview={heroPreview} code={heroCode} />
    </DocsSection>

    <DocsSection title="Installation" id="installation">
      <DocsInstallTabs name={name} manual={manual} />
    </DocsSection>

    <DocsSection title="Usage" id="usage">
      <DocsCode language="tsx" code={usageImport} />
      <DocsCode language="tsx" code={usageJsx} />
    </DocsSection>

    <DocsSection title="Cursor" id="cursor">
      <DocsCursorConfig />
    </DocsSection>

    <DocsSection title="RTL" id="rtl">
      <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
        {rtlNote}
      </p>
    </DocsSection>
  </>
)
