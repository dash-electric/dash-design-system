// vendor-brand-flags.mjs — vendor brand logos + region flags into the Dash DS
// as static multi-color SVG assets (no codemod — these are full-color, not
// currentColor-tintable). Idempotent. Zero npm deps.
//
// Usage:
//   node apps/docs/scripts/vendor-brand-flags.mjs \
//     --brand "/Users/<you>/Downloads/Brand" \
//     --flags "/Users/<you>/Downloads/Country Flags"
//
// Defaults point at the local Downloads folders (change here if needed).
import { readdir, readFile, writeFile, mkdir, copyFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import os from "node:os"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, "../../..") // dash-ds root
const PUBLIC = path.join(REPO, "apps/docs/public")

function arg(flag, dflt) {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt
}

const BRAND_SRC = arg("--brand", path.join(os.homedir(), "Downloads", "Brand"))
const FLAGS_SRC = arg("--flags", path.join(os.homedir(), "Downloads", "Country Flags"))

// slugify: lowercase, strip emoji + non-alnum, collapse spaces → hyphen.
function slugify(s) {
  return s
    .normalize("NFKD")
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "") // emoji/symbols
    .replace(/[^\w\s().-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// ── BRAND ──────────────────────────────────────────────────────────────────
// Names come in 3 shapes:
//   "GitHub.svg"                              → slug=github, variant=default
//   "Bitcoin (BTC).svg"                       → slug=bitcoin, alias=btc
//   "🏢 Company=Adobe, 🏵️ Style=Black.svg"    → slug=adobe, variant=black
//   "Stripe-1.svg"                            → dupe, drop if base exists
async function vendorBrand() {
  if (!existsSync(BRAND_SRC)) {
    console.log(`[brand] source missing: ${BRAND_SRC} — skipping`)
    return
  }
  const out = path.join(PUBLIC, "brand")
  await mkdir(out, { recursive: true })
  const files = (await readdir(BRAND_SRC)).filter((f) => f.toLowerCase().endsWith(".svg"))

  // slug -> { variants: Set, aliases: Set, files: { variant -> srcName } }
  const brands = new Map()
  const log = []

  for (const file of files) {
    const base = file.replace(/\.svg$/i, "")
    let slug, variant = "default", alias = null, isDupe = false

    const company = base.match(/Company\s*=\s*([^,]+?)\s*,\s*.*Style\s*=\s*(\w+)/i)
    const paren = base.match(/^(.+?)\s*\(([^)]+)\)\s*$/)

    if (company) {
      slug = slugify(company[1])
      variant = company[2].toLowerCase()
    } else if (paren) {
      slug = slugify(paren[1])
      alias = slugify(paren[2])
    } else {
      const dupe = base.match(/^(.+?)-1$/)
      if (dupe) { slug = slugify(dupe[1]); isDupe = true }
      else slug = slugify(base)
    }
    if (!slug) { log.push(`SKIP empty-slug: ${file}`); continue }

    if (!brands.has(slug)) brands.set(slug, { variants: new Set(), aliases: new Set(), files: {} })
    const entry = brands.get(slug)
    if (alias) entry.aliases.add(alias)
    // dupe -1: only keep if no base file already claimed this variant
    if (isDupe && entry.files[variant]) { log.push(`SKIP dupe: ${file} (base exists)`); continue }
    entry.variants.add(variant)
    entry.files[variant] = file
  }

  let written = 0
  for (const [slug, entry] of brands) {
    for (const [variant, srcName] of Object.entries(entry.files)) {
      const dest = variant === "default" ? `${slug}.svg` : `${slug}-${variant}.svg`
      await copyFile(path.join(BRAND_SRC, srcName), path.join(out, dest))
      written++
    }
  }

  const manifest = {
    count: brands.size,
    fileCount: written,
    generatedAt: "GENERATED_AT",
    brands: [...brands.entries()]
      .map(([slug, e]) => ({
        slug,
        variants: [...e.variants].sort(),
        aliases: [...e.aliases].sort(),
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug)),
  }
  await writeFile(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2))
  console.log(`[brand] ${brands.size} brands, ${written} files written → ${out}`)
  if (log.length) console.log(`[brand] notes:\n  ${log.join("\n  ")}`)
}

// ── FLAGS ────────────────────────────────────────────────────────────────────
// Region name → ISO-ish key. We do NOT hardcode a name list (keeps the script
// content-neutral); we slugify whatever filenames exist. The slug IS the key.
async function vendorFlags() {
  if (!existsSync(FLAGS_SRC)) {
    console.log(`[flags] source missing: ${FLAGS_SRC} — skipping`)
    return
  }
  const out = path.join(PUBLIC, "flags")
  await mkdir(out, { recursive: true })
  const files = (await readdir(FLAGS_SRC)).filter((f) => f.toLowerCase().endsWith(".svg"))

  const flags = []
  const seen = new Set()
  for (const file of files) {
    const base = file.replace(/\.svg$/i, "")
    let key = slugify(base)
    if (!key) continue
    // de-dupe "-1" suffixes
    const dupe = key.match(/^(.+?)-1$/)
    if (dupe && seen.has(dupe[1])) continue
    if (dupe) key = dupe[1]
    if (seen.has(key)) continue
    seen.add(key)
    await copyFile(path.join(FLAGS_SRC, file), path.join(out, `${key}.svg`))
    // store the display name as the original base (kept in manifest only)
    flags.push({ key, name: base })
  }

  const manifest = {
    count: flags.length,
    generatedAt: "GENERATED_AT",
    flags: flags.sort((a, b) => a.key.localeCompare(b.key)),
  }
  await writeFile(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2))
  console.log(`[flags] ${flags.length} flags written → ${out}`)
}

await vendorBrand()
await vendorFlags()
console.log("done.")
