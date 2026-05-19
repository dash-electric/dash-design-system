"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function InstallationCliPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started / Installation"
        title="CLI install"
        description="Every install method for the dash CLI — pnpm/npm/yarn/bun, GitHub mirror, Verdaccio, and a brew tap roadmap entry. Pick the one that fits your distribution constraints."
      />

      <DocsSection title="Package managers">
        <p className="text-sm text-text-sub-600 mb-3">
          The dash CLI publishes a single <code className="text-xs">dash</code> binary. Pick
          your package manager — all four work identically.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-text-soft-400">pnpm</div>
            <DocsCode
              language="bash"
              code={`# one-shot
pnpm dlx dash@latest init

# project-local
pnpm add -D dash

# global
pnpm add -g dash`}
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-text-soft-400">npm</div>
            <DocsCode
              language="bash"
              code={`# one-shot
npx dash@latest init

# project-local
npm i -D dash

# global
npm i -g dash`}
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-text-soft-400">yarn</div>
            <DocsCode
              language="bash"
              code={`# one-shot
yarn dlx dash init

# project-local
yarn add -D dash

# global
yarn global add dash`}
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-text-soft-400">bun</div>
            <DocsCode
              language="bash"
              code={`# one-shot
bunx dash init

# project-local
bun add -D dash

# global
bun add -g dash`}
            />
          </div>
        </div>
      </DocsSection>

      <DocsSection
        title="Homebrew (planned)"
        description="Roadmap Day 14+. Will publish dash as a brew tap so platform engineers can manage it like any other CLI."
      >
        <DocsCode
          language="bash"
          code={`# planned syntax — not yet live
brew tap dash-id/tap
brew install dash`}
        />
      </DocsSection>

      <DocsSection
        title="Verdaccio (internal mirror)"
        description="For air-gapped enterprise consumers. Mirror dash to your internal Verdaccio, then install from the mirror."
      >
        <DocsCode
          language="bash"
          code={`# 1. on your internal Verdaccio
npm publish --registry https://verdaccio.internal.dash.com

# 2. on the consumer machine
npm config set @dash:registry https://verdaccio.internal.dash.com
pnpm add -D dash`}
        />
      </DocsSection>

      <DocsSection title="CLI usage examples" description="The 5 commands you&apos;ll run day-to-day.">
        <DocsCode
          language="bash"
          code={`# scaffold consumer (writes components.json + .env.local)
dash init --token sk-dash-xxxx

# add components (resolves registryDependencies recursively)
dash add button card data-table

# list everything in the registry
dash list --type component

# search by name / title / description
dash search "mitra suspend"

# rebuild distribution JSON (in the design-system repo, not consumers)
dash build`}
        />
      </DocsSection>

      <DocsSection
        title="Bearer token setup"
        description="Every request to the @dash registry is auth-gated. Configure the token once per machine."
      >
        <p className="text-sm text-text-sub-600 mb-3">Set it in <code className="text-xs">.env.local</code>:</p>
        <DocsCode language="bash" code={`DASH_REGISTRY_TOKEN=sk-dash-xxxx`} />
        <p className="text-sm text-text-sub-600 mt-4 mb-3">Or export it in your shell profile:</p>
        <DocsCode language="bash" code={`echo 'export DASH_REGISTRY_TOKEN=sk-dash-xxxx' >> ~/.zshrc
source ~/.zshrc`} />
        <p className="text-sm text-text-sub-600 mt-3">
          The CLI also accepts <code className="text-xs">--token</code> as a one-off
          override. Avoid pasting tokens into shared scripts or CI logs.
        </p>
      </DocsSection>

      <DocsSection title="Troubleshooting">
        <div className="space-y-4 text-sm text-text-sub-600">
          <div>
            <div className="font-semibold text-text-strong-950">401 Unauthorized on every command</div>
            Token is missing, expired, or URL-encoded. Run <code className="text-xs">curl -H &quot;Authorization: Bearer $DASH_REGISTRY_TOKEN&quot; https://ds.dash.com/r/button.json</code>{" "}
            to verify. Ping #design-system on Slack for a fresh token.
          </div>
          <div>
            <div className="font-semibold text-text-strong-950">command not found: dash</div>
            Global install path isn&apos;t on <code className="text-xs">$PATH</code>. Run{" "}
            <code className="text-xs">pnpm bin -g</code> and add the printed path to your shell rc.
          </div>
          <div>
            <div className="font-semibold text-text-strong-950">cssVars not merging into globals.css</div>
            CLI looks for <code className="text-xs">{`/* @dash:start <name> */`}</code> marker comments. If they were manually edited, run{" "}
            <code className="text-xs">dash add --overwrite base-theme</code>.
          </div>
          <div>
            <div className="font-semibold text-text-strong-950">Tailwind v4 not picking up tokens</div>
            Make sure <code className="text-xs">app/globals.css</code> has{" "}
            <code className="text-xs">@import &quot;tailwindcss&quot;;</code> at the top and{" "}
            <code className="text-xs">@theme inline</code> block referencing the Dash variables.
          </div>
          <div>
            <div className="font-semibold text-text-strong-950">Behind a corporate proxy</div>
            Export <code className="text-xs">HTTPS_PROXY</code> before running CLI commands;
            the CLI uses undici&apos;s default proxy resolution.
          </div>
        </div>
      </DocsSection>
    </DocsPageShell>
  )
}
