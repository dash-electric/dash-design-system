"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import {
  DocsStep,
  DocsStepList,
  DocsWorkflowDiagram,
} from "@/components/docs/docs-step"

export default function PackageInstallPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started"
        title="Install as an npm package"
        description="Consume the Dash UI atoms as a versioned dependency — @dash-electric/kit — published privately to GitHub Packages. Add a token, a one-line .npmrc, install, and import. Updates arrive as version bumps; you never copy source into your repo."
      />

      {/* Which model do I want? */}
      <div
        role="note"
        className="rounded-xl border border-information-light bg-information-lighter px-4 py-3 text-sm text-text-strong-950"
      >
        <span className="font-semibold">Two ways to consume Dash.</span> This page
        covers the <span className="font-semibold">npm package</span> path. If you
        want to own + edit component source in your repo (shadcn-style), use the{" "}
        <Link
          href="/docs/installation"
          className="text-(--dash-purple-600) underline underline-offset-4"
        >
          CLI / registry install
        </Link>{" "}
        instead. See the comparison below to pick.
      </div>

      <DocsSection
        title="Package vs. CLI — which should I use?"
        description="Both ship the same Dash atoms. They differ in who owns the source and how updates flow."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stroke-soft-200 text-left text-text-sub-600">
                <th className="py-2 pr-4 font-medium"> </th>
                <th className="py-2 pr-4 font-medium">npm package <span className="text-xs text-text-soft-400">(this page)</span></th>
                <th className="py-2 pr-4 font-medium">CLI / registry</th>
              </tr>
            </thead>
            <tbody className="text-text-sub-600">
              <tr className="border-b border-stroke-soft-200">
                <td className="py-2 pr-4 font-medium text-text-strong-950">Install</td>
                <td className="py-2 pr-4"><code className="text-xs">pnpm add @dash-electric/kit</code></td>
                <td className="py-2 pr-4"><code className="text-xs">dashkit add button</code></td>
              </tr>
              <tr className="border-b border-stroke-soft-200">
                <td className="py-2 pr-4 font-medium text-text-strong-950">Source lives</td>
                <td className="py-2 pr-4">in <code className="text-xs">node_modules</code> (read-only dep)</td>
                <td className="py-2 pr-4">copied into your repo — you own + edit it</td>
              </tr>
              <tr className="border-b border-stroke-soft-200">
                <td className="py-2 pr-4 font-medium text-text-strong-950">Updates</td>
                <td className="py-2 pr-4">bump the version, reinstall</td>
                <td className="py-2 pr-4">re-run <code className="text-xs">dashkit diff</code> / <code className="text-xs">add</code></td>
              </tr>
              <tr className="border-b border-stroke-soft-200">
                <td className="py-2 pr-4 font-medium text-text-strong-950">Customize a component</td>
                <td className="py-2 pr-4">wrap / compose (can&apos;t edit in place)</td>
                <td className="py-2 pr-4">edit the file directly</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium text-text-strong-950">Best for</td>
                <td className="py-2 pr-4">apps that want managed, consistent atoms</td>
                <td className="py-2 pr-4">apps that need to fork / heavily theme</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection
        title="Prerequisites"
        description="The kit ships raw .tsx source (it is theme-compiled at your build step, not pre-bundled). Confirm these before installing."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-6 space-y-1">
          <li>Node 20+ and pnpm 9+ (npm / yarn also work)</li>
          <li>A bundler that transpiles dependencies — Next.js, Vite, Remix</li>
          <li>
            React 18.3+ or 19, and <code className="text-xs">@remixicon/react</code> (peer deps)
          </li>
          <li>The Dash Tailwind token layer in your app (Layer 0 — see step 4)</li>
          <li>
            A GitHub <code className="text-xs">read:packages</code> token (membership in the{" "}
            <code className="text-xs">dash-electric</code> org)
          </li>
        </ul>
      </DocsSection>

      <DocsWorkflowDiagram
        steps={[
          { label: "Create a token", sub: "read:packages PAT" },
          { label: "Add .npmrc", sub: "route @dash-electric scope" },
          { label: "Install", sub: "pnpm add @dash-electric/kit" },
          { label: "Wire peers + tokens", sub: "transpile + Layer 0" },
          { label: "Import", sub: "use the atoms" },
        ]}
      />

      <DocsSection
        title="Step-by-step"
        description="From zero to a rendered Dash button as an installed dependency."
      >
        <DocsStepList>
          <DocsStep
            number={1}
            title="Create a read-only GitHub token"
            description="The package is private. npm/pnpm needs a token to read it. A read:packages scope is enough — you do NOT need write access to install."
            code={`# Classic PAT (scope: read:packages):
#   https://github.com/settings/tokens/new?scopes=read:packages
# Then export it in your shell rc or CI secrets:
export GITHUB_PACKAGES_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx`}
            imagePlaceholder="GitHub token creation screen with the read:packages scope checkbox ticked."
          />

          <DocsStep
            number={2}
            title="Add .npmrc to your project root"
            description="Routes only the @dash-electric scope to GitHub Packages; everything else still comes from the public npm registry. Reference the token via env var — never commit the literal token."
            codeLanguage="ini"
            code={`# .npmrc
@dash-electric:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_PACKAGES_TOKEN}`}
            imagePlaceholder=".npmrc file showing the two scoped-registry lines."
            imageHeight="sm"
          />

          <DocsStep
            number={3}
            title="Install the package + peers"
            description="Install the kit and its React + icon peer dependencies. Works the same with npm or yarn."
            code={`pnpm add @dash-electric/kit
pnpm add react @remixicon/react`}
            output={`+ @dash-electric/kit 0.0.2
+ react ...
+ @remixicon/react ...`}
            imagePlaceholder="Terminal output confirming @dash-electric/kit installed from npm.pkg.github.com."
          />

          <DocsStep
            number={4}
            title="Transpile the package + provide the token layer"
            description="The atoms are raw .tsx using Tailwind classes bound to Dash Layer-0 tokens. Your bundler must transpile the package, and your Tailwind config must include the Dash foundation tokens — or components render unstyled."
            codeLanguage="js"
            code={`// next.config.js
module.exports = {
  transpilePackages: ["@dash-electric/kit"],
}

// Tailwind: include the Dash token layer (Layer 0).
// See Foundations → Color / Theming → Tokens for the setup.`}
            imagePlaceholder="next.config.js with transpilePackages including @dash-electric/kit."
            imageHeight="sm"
          />

          <DocsStep
            number={5}
            title="Import and use"
            description="Import atoms from the barrel, and the cn() helper from the lib subpath. You're shipping Dash-correct UI as a managed dependency."
            codeLanguage="tsx"
            code={`import { Button, Badge, Input } from "@dash-electric/kit"
import { cn } from "@dash-electric/kit/lib/utils"

export function Example() {
  return (
    <div className="flex gap-2">
      <Button>Kirim</Button>
      <Badge>Baru</Badge>
    </div>
  )
}`}
            imagePlaceholder="Browser preview rendering a Dash primary button and a badge."
          />
        </DocsStepList>
      </DocsSection>

      <DocsSection
        title="CI setup"
        description="In GitHub Actions, you don't need a personal token — the built-in GITHUB_TOKEN can read packages in the same org. Wire it into the install step."
      >
        <pre className="mt-2 overflow-x-auto rounded-lg bg-bg-soft-200 p-3 text-xs">
{`- uses: actions/setup-node@v4
  with:
    node-version: 20
    registry-url: https://npm.pkg.github.com
    scope: "@dash-electric"
- run: pnpm install --frozen-lockfile
  env:
    NODE_AUTH_TOKEN: \${{ secrets.GITHUB_TOKEN }}`}
        </pre>
      </DocsSection>

      <DocsSection
        title="Troubleshooting"
        description="The two failure modes are auth (401/403) and styling (unstyled components)."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-6 space-y-1">
          <li>
            <span className="font-medium text-text-strong-950">401 / 403 on install</span> — token missing{" "}
            <code className="text-xs">read:packages</code>, not exported in the shell, or you&apos;re not a member of the{" "}
            <code className="text-xs">dash-electric</code> org. Check with{" "}
            <code className="text-xs">echo $GITHUB_PACKAGES_TOKEN</code>.
          </li>
          <li>
            <span className="font-medium text-text-strong-950">404 Not Found</span> — the{" "}
            <code className="text-xs">@dash-electric:registry</code> line is missing from{" "}
            <code className="text-xs">.npmrc</code>, so it&apos;s looking on public npm.
          </li>
          <li>
            <span className="font-medium text-text-strong-950">Components render unstyled</span> — the Dash token layer isn&apos;t in your Tailwind config. See{" "}
            <Link href="/docs/theming/tokens" className="text-(--dash-purple-600) underline underline-offset-4">Theming → Tokens</Link>.
          </li>
          <li>
            <span className="font-medium text-text-strong-950">Type / JSX errors from node_modules</span> — add the package to{" "}
            <code className="text-xs">transpilePackages</code> (Next) or your bundler&apos;s transpile allowlist.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Next steps">
        <ul className="text-sm text-text-sub-600 list-disc pl-6 space-y-1">
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/components/button">
              Components → Button
            </Link>{" "}
            — every atom in the kit, with props
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/installation">
              CLI / registry install
            </Link>{" "}
            — the own-the-source alternative
          </li>
          <li>
            <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/theming/tokens">
              Theming → Tokens
            </Link>{" "}
            — wire the Layer-0 foundation so atoms render on-brand
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
