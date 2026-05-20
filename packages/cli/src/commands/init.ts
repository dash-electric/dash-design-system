/**
 * `dash init` — interactive setup for consumer projects.
 *
 * Multi-stack aware: detects Next.js (App/Pages), Vite, Remix, Astro, CRA/CRACO,
 * and plain React. Each variant gets framework-specific globals.css path, alias
 * style (`@/` vs `~/` for Remix), and components.json shape pulled from
 * `../templates/<framework>/components.json`.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import prompts from "prompts"
import kleur from "kleur"
import ora from "ora"
import {
  COMPONENTS_JSON,
  DEFAULT_REGISTRY_URL,
  readComponentsJson,
  writeComponentsJson,
} from "../lib/components-json.js"
import { resolveItemTree } from "../lib/registry-fetch.js"
import { installDeps, dedupeDeps } from "../lib/deps-installer.js"
import { writeRegistryFile, collectCssVars, mergeCssVars } from "../lib/file-writer.js"
import { resolveTargetPath } from "../lib/components-json.js"
import {
  detectFramework as detectFrameworkFull,
  scaffoldFor,
  type Framework,
} from "../lib/framework-detector.js"
import type { ComponentsJson } from "../lib/schema.js"
import {
  startBackup,
  backupFile,
  commitBackup,
  restoreBackup,
} from "../lib/backup.js"

export type InitOpts = {
  yes?: boolean
  token?: string
  /** Accept legacy short names (next/vite/remix/astro) or full variants. */
  framework?:
    | "next"
    | "next-app"
    | "next-pages"
    | "vite"
    | "remix"
    | "astro"
    | "cra"
    | "react"
  registryUrl?: string
  cwd?: string
  /**
   * v3-additive: Layer-2 tenant theme. Validated against known internal
   * tenants (ride/logistic/travel/marketplace) or trellis-<id> dynamic ids.
   * When set, written to components.json.dashTheme for Skill v3 to pick up.
   */
  theme?: string
}

const TRELLIS_PATTERN = /^trellis-[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/
const KNOWN_INTERNAL_THEMES = ["ride", "logistic", "travel", "marketplace"] as const

function normalizeTheme(input: string | undefined): string | undefined {
  if (!input) return undefined
  const v = input.trim().toLowerCase()
  if (!v) return undefined
  if ((KNOWN_INTERNAL_THEMES as readonly string[]).includes(v)) return v
  if (v === "trellis-tenant") return v
  if (TRELLIS_PATTERN.test(v)) return v
  return undefined
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Resolve the templates dir. Works in both dev (src/) and built (dist/) layout
 * because templates live as a sibling of `commands/` in both.
 */
function templatesDir(): string {
  // dist/commands/init.js → ../templates ; src/commands/init.ts → ../templates
  const candidate = path.resolve(__dirname, "..", "templates")
  if (fs.existsSync(candidate)) return candidate
  // Fallback for unusual build layouts
  return path.resolve(__dirname, "..", "..", "src", "templates")
}

function normalizeFramework(input: InitOpts["framework"], cwd: string): Framework {
  if (!input) return detectFrameworkFull(cwd)
  if (input === "next") {
    // Legacy short name — re-detect router variant if possible
    const fw = detectFrameworkFull(cwd)
    return fw === "next-pages" ? "next-pages" : "next-app"
  }
  return input as Framework
}

function loadComponentsJsonTemplate(framework: Framework): ComponentsJson {
  const file = path.join(templatesDir(), framework, "components.json")
  if (!fs.existsSync(file)) {
    // unknown / missing template → fall back to next-app
    const fallback = path.join(templatesDir(), "next-app", "components.json")
    return JSON.parse(fs.readFileSync(fallback, "utf-8")) as ComponentsJson
  }
  return JSON.parse(fs.readFileSync(file, "utf-8")) as ComponentsJson
}

const DASH_BASE_CSS = `@import "tailwindcss";

@theme {
  --color-background: oklch(var(--background));
  --color-foreground: oklch(var(--foreground));
  --color-primary: oklch(var(--primary));
  --color-primary-foreground: oklch(var(--primary-foreground));
  --color-secondary: oklch(var(--secondary));
  --color-secondary-foreground: oklch(var(--secondary-foreground));
  --color-muted: oklch(var(--muted));
  --color-muted-foreground: oklch(var(--muted-foreground));
  --color-accent: oklch(var(--accent));
  --color-accent-foreground: oklch(var(--accent-foreground));
  --color-border: oklch(var(--border));
  --color-input: oklch(var(--input));
  --color-ring: oklch(var(--ring));
}

:root {
  --background: 1 0 0;
  --foreground: 0.145 0 0;
  --primary: 0.205 0 0;
  --primary-foreground: 0.985 0 0;
  --secondary: 0.97 0 0;
  --secondary-foreground: 0.205 0 0;
  --muted: 0.97 0 0;
  --muted-foreground: 0.556 0 0;
  --accent: 0.97 0 0;
  --accent-foreground: 0.205 0 0;
  --border: 0.922 0 0;
  --input: 0.922 0 0;
  --ring: 0.708 0 0;
}

.dark {
  --background: 0.145 0 0;
  --foreground: 0.985 0 0;
  --primary: 0.985 0 0;
  --primary-foreground: 0.205 0 0;
  --secondary: 0.269 0 0;
  --secondary-foreground: 0.985 0 0;
  --muted: 0.269 0 0;
  --muted-foreground: 0.708 0 0;
  --accent: 0.269 0 0;
  --accent-foreground: 0.985 0 0;
  --border: 0.269 0 0;
  --input: 0.269 0 0;
  --ring: 0.556 0 0;
}
`

export async function runInit(opts: InitOpts): Promise<void> {
  const cwd = opts.cwd ?? process.cwd()
  const registryUrl = opts.registryUrl ?? DEFAULT_REGISTRY_URL

  if (readComponentsJson(cwd)) {
    console.log(kleur.yellow(`components.json already exists in ${cwd}`))
    if (!opts.yes) {
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        message: "Overwrite existing components.json?",
        initial: false,
      })
      if (!proceed) {
        console.log(kleur.dim("init aborted"))
        return
      }
    }
  }

  let framework: Framework = normalizeFramework(opts.framework, cwd)

  let tsx = true
  let token = opts.token ?? process.env.DASH_REGISTRY_TOKEN

  if (!opts.yes) {
    const detectedLabel = scaffoldFor(framework).label
    const answers = await prompts([
      {
        type: opts.framework ? null : "select",
        name: "framework",
        message: `Framework? (detected: ${detectedLabel})`,
        choices: [
          { title: "Next.js (App Router)", value: "next-app" },
          { title: "Next.js (Pages Router)", value: "next-pages" },
          { title: "Vite (React)", value: "vite" },
          { title: "Remix", value: "remix" },
          { title: "Astro", value: "astro" },
          { title: "Create React App / CRACO", value: "cra" },
          { title: "Plain React", value: "react" },
        ],
        initial: ([
          "next-app",
          "next-pages",
          "vite",
          "remix",
          "astro",
          "cra",
          "react",
        ] as Framework[]).indexOf(framework) >= 0
          ? ([
              "next-app",
              "next-pages",
              "vite",
              "remix",
              "astro",
              "cra",
              "react",
            ] as Framework[]).indexOf(framework)
          : 0,
      },
      {
        type: "confirm",
        name: "tsx",
        message: "Use TypeScript?",
        initial: true,
      },
      {
        type: token ? null : "password",
        name: "token",
        message: "Dash registry Bearer token? (leave blank to skip)",
      },
    ])
    framework = (answers.framework as Framework) ?? framework
    tsx = answers.tsx ?? true
    token = token ?? answers.token
  }

  const scaffold = scaffoldFor(framework)
  console.log(kleur.dim(`Framework: ${scaffold.label}`))

  // Backup safety net: any existing files we're about to write are copied to
  // `.dash-backup/<ISO-ts>/`. On unexpected exit, they're auto-restored. On
  // success, the backup tree is cleaned up.
  const backup = startBackup(cwd)
  let initSucceeded = false
  try {

  // 1. Write components.json from per-framework template
  console.log(kleur.bold("\n→ Writing components.json"))
  const template = loadComponentsJsonTemplate(framework)
  const themeValue = normalizeTheme(opts.theme)
  if (opts.theme && !themeValue) {
    console.log(
      kleur.yellow(
        `  ! --theme="${opts.theme}" is not a known tenant — ignoring. ` +
          `Valid: ${KNOWN_INTERNAL_THEMES.join(", ")} or trellis-<id>.`,
      ),
    )
  }
  const config: ComponentsJson = {
    ...template,
    rsc: scaffold.rsc,
    tsx,
    ...(themeValue ? { dashTheme: themeValue } : {}),
    registries: {
      ...(template.registries ?? {}),
      "@dash": {
        url: registryUrl,
        headers: {
          Authorization: "Bearer ${DASH_REGISTRY_TOKEN}",
        },
      },
    },
  }
  backupFile(backup, path.join(cwd, COMPONENTS_JSON))
  writeComponentsJson(config, cwd)
  console.log(kleur.green(`  + ${COMPONENTS_JSON}`))

  // 2. Token to .env.local
  if (token) {
    const envFile = path.join(cwd, ".env.local")
    const line = `DASH_REGISTRY_TOKEN=${token}\n`
    if (fs.existsSync(envFile)) {
      const cur = fs.readFileSync(envFile, "utf-8")
      if (!/^DASH_REGISTRY_TOKEN=/m.test(cur)) {
        backupFile(backup, envFile)
        fs.writeFileSync(envFile, cur + (cur.endsWith("\n") ? "" : "\n") + line)
        console.log(kleur.green(`  ↻ .env.local (appended DASH_REGISTRY_TOKEN)`))
      } else {
        console.log(kleur.dim(`  · .env.local already has DASH_REGISTRY_TOKEN, skipping`))
      }
    } else {
      fs.writeFileSync(envFile, line)
      console.log(kleur.green(`  + .env.local`))
    }
  }

  // 3. globals.css w/ base tokens (path is framework-specific)
  console.log(kleur.bold("\n→ Writing globals.css"))
  const cssPath = path.join(cwd, scaffold.globalsCss)
  if (!fs.existsSync(cssPath)) {
    fs.mkdirSync(path.dirname(cssPath), { recursive: true })
    fs.writeFileSync(cssPath, DASH_BASE_CSS, "utf-8")
    console.log(kleur.green(`  + ${path.relative(cwd, cssPath)}`))
  } else {
    backupFile(backup, cssPath)
    console.log(kleur.dim(`  · ${path.relative(cwd, cssPath)} exists (preserved)`))
  }

  // 4. Try @dash/base-theme + @dash/ai-rules (optional, best effort)
  const spinner = ora("Installing @dash/base-theme + @dash/ai-rules").start()
  try {
    const tree = await resolveItemTree("base-theme", { registryUrl, token }).catch(() => [])
    if (tree.length > 0) {
      const { deps, devDeps } = dedupeDeps(tree)
      for (const item of tree) {
        if (!item.files) continue
        for (const f of item.files) {
          const target = resolveTargetPath(f, config, cwd)
          await writeRegistryFile(f, target, { cwd, yes: true, overwrite: false })
        }
      }
      if (deps.length) await installDeps(deps, { cwd, dev: false })
      if (devDeps.length) await installDeps(devDeps, { cwd, dev: true })
      const cssVars = collectCssVars(tree)
      if (Object.keys(cssVars).length > 0) {
        mergeCssVars(cssPath, cssVars, { cwd })
      }
      spinner.succeed("Installed @dash/base-theme")
    } else {
      spinner.warn("@dash/base-theme not found in registry — skipped")
    }
  } catch (err) {
    spinner.warn(`base-theme install skipped: ${(err as Error).message}`)
  }

  // 5. AI rules → CLAUDE.md
  const aiRulesSpinner = ora("Installing @dash/ai-rules to ./CLAUDE.md").start()
  try {
    const aiRules = await resolveItemTree("ai-rules", { registryUrl, token }).catch(() => [])
    if (aiRules.length > 0) {
      const item = aiRules[aiRules.length - 1]
      const content = item.files?.[0]?.content
      if (content) {
        const claudeMd = path.join(cwd, "CLAUDE.md")
        if (!fs.existsSync(claudeMd)) {
          fs.writeFileSync(claudeMd, content, "utf-8")
          aiRulesSpinner.succeed("Wrote CLAUDE.md")
        } else {
          aiRulesSpinner.info("CLAUDE.md exists (preserved)")
        }
      } else {
        aiRulesSpinner.warn("ai-rules has no content")
      }
    } else {
      aiRulesSpinner.warn("@dash/ai-rules not found in registry — skipped")
    }
  } catch (err) {
    aiRulesSpinner.warn(`ai-rules install skipped: ${(err as Error).message}`)
  }

  console.log(kleur.bold().green("\n✓ Dash initialized"))
  console.log(kleur.dim(`Next: ${kleur.cyan("dash add button")}`))
    initSucceeded = true
  } catch (err) {
    // Any failure mid-init → roll back to pre-init state.
    console.error(kleur.red(`\n✗ Init failed — restoring backup`))
    restoreBackup(backup)
    throw err
  } finally {
    if (initSucceeded) {
      commitBackup(backup, true)
    }
  }
}
