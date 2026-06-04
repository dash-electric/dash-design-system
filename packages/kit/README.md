# @dash-electric/kit

Curated, ban-gated bundle of Dash Design System UI atoms (Button, Input, Modal,
Badge, …) — published as a **private** package to **GitHub Packages**, restricted
to the `dash-electric` org.

> Ships **raw `.tsx` source**, not pre-compiled JS. Your bundler transpiles it
> (Next.js, Vite, etc.). This is intentional — it keeps the atoms theme-able via
> the Dash token layer at build time.

---

## Consuming the package

### 1. Authenticate to GitHub Packages

The package is private, so npm/pnpm needs a token to read it. Create a GitHub
**Personal Access Token** with a single read scope:

- **Classic PAT:** scope `read:packages` — <https://github.com/settings/tokens/new?scopes=read:packages>
- **Fine-grained PAT:** repository access to `dash-electric/next-express-design-system`, permission **Packages: Read-only**

You do **not** need `write:packages` to install — read is enough. (Only the CI
release job needs write, and it uses the built-in `GITHUB_TOKEN`.)

Export it in your shell (`~/.zshrc`) or your CI secrets:

```bash
export GITHUB_PACKAGES_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

### 2. Add `.npmrc` to the consumer project

Create a `.npmrc` at the root of the repo that installs the package. **Reference
the token via env var — never hard-code it:**

```ini
@dash-electric:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

This routes only the `@dash-electric` scope to GitHub Packages; everything else
keeps coming from the public npm registry.

### 3. Install

```bash
pnpm add @dash-electric/kit          # pnpm
npm  install @dash-electric/kit      # npm
yarn add @dash-electric/kit          # yarn
```

### 4. Peer dependencies + token layer

Install the peers in the consumer app:

```bash
pnpm add react @remixicon/react
```

Because the atoms are raw `.tsx`:

- **Transpile the package.** In Next.js add it to `transpilePackages`:
  ```js
  // next.config.js
  module.exports = { transpilePackages: ["@dash-electric/kit"] }
  ```
- **Provide the Dash token layer.** The atoms use Tailwind utility classes bound
  to Dash Layer-0 tokens (`bg-primary-500`, `text-text-strong-950`, …). The
  consumer's Tailwind config must include the Dash foundation tokens, or the
  components render unstyled. See `design.md` / `ARCHITECTURE.md` in the DS repo
  for the foundation setup.

### 5. Use

```tsx
import { Button, Badge, Input } from "@dash-electric/kit"
import { cn } from "@dash-electric/kit/lib/utils"

export function Example() {
  return (
    <div className="flex gap-2">
      <Button>Kirim</Button>
      <Badge>Baru</Badge>
    </div>
  )
}
```

---

## Releasing a new version (maintainers)

CI publishes automatically when a `v*.*.*` tag is pushed (see
`.github/workflows/publish-kit.yml`). The published version comes from
`packages/kit/package.json` — **keep it in sync with the tag.**

> A `v*.*.*` tag also triggers `release.yml` (GitHub release + `dash` CLI
> publish). Both run as independent jobs on the same tag.

```bash
# 1. bump the version to match the tag you're about to push
cd packages/kit
npm version patch          # or: minor / major  → updates package.json

# 2. tag + push (tag is v<version>)
git commit -am "release: @dash-electric/kit $(node -p "require('./package.json').version")"
git tag v$(node -p "require('./package.json').version")
git push && git push --tags
```

The workflow rebuilds the bundle from the live registry source, then runs
`pnpm publish` against GitHub Packages using the Actions `GITHUB_TOKEN`. No PAT
or secret setup required for releases.

> Publishing a `v*.*.*` tag is a release action. Per the repo's deployment-safety
> rule, confirm intent before pushing the tag.

### What gets published

Only the generated bundle ships (see the `files` field): every atom `*.tsx`,
`lib/utils.tsx`, the `index.tsx` barrel, and `manifest.json`. The build script,
`tooling/`, and monorepo internals are excluded. Verify anytime with:

```bash
npm pack --dry-run
```

---

## Moving to a different registry later

The package **name** and the **registry** are decoupled. To migrate off GitHub
Packages (e.g. to a self-hosted Verdaccio or `ds.dash.com`), change two lines —
no source changes:

1. `publishConfig.registry` in `package.json`
2. the `@dash-electric:registry=` line in each consumer's `.npmrc`
