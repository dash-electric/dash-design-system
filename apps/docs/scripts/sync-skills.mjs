// sync-skills.mjs — vendor the public-facing skills from the sibling
// `dash-skills` repo into the docs site so they ship with the deploy and are
// reachable as plain-markdown URLs (https://ds.dash.com/skills/<slug>.md).
//
// WHY this exists: `dash-skills` is a separate, PRIVATE repo. The docs deploy
// (Cloud Run) only ever sees THIS repo, so the skill content must be copied in
// and committed. End users never run this — they just open the public .md URL
// and paste it into any AI assistant (Claude / ChatGPT / Gemini). This script
// is a MAINTAINER tool: re-run it whenever skills change in dash-skills.
//
// Zero npm deps. Pure node.
//
// Usage:
//   node apps/docs/scripts/sync-skills.mjs
//   node apps/docs/scripts/sync-skills.mjs --src /path/to/dash-skills
//
// Outputs (all committed):
//   apps/docs/public/skills/<slug>.md            self-contained bundle (the LLM link)
//   apps/docs/public/skills/<slug>/SKILL.md      raw skill
//   apps/docs/public/skills/<slug>/references/*  raw references + examples
//   apps/docs/lib/skills-manifest.ts             generated metadata for the pages
import { readdir, readFile, writeFile, mkdir, rm, stat } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, "../../..") // dash-ds root (express-design-system)
const PUBLIC_SKILLS = path.join(REPO, "apps/docs/public/skills")
const MANIFEST = path.join(REPO, "apps/docs/lib/skills-manifest.ts")

function arg(flag, dflt) {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt
}

const SKILLS_SRC = path.resolve(
  arg("--src", path.resolve(REPO, "../dash-skills")),
  "skills",
)

// Parse the YAML frontmatter block (--- ... ---) without a yaml dep.
// Only handles the simple `key: value` shape these skills use.
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { meta: {}, body: raw.trim() }
  const meta = {}
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/)
    if (kv) meta[kv[1]] = kv[2].trim()
  }
  return { meta, body: raw.slice(m[0].length).trim() }
}

function fence(filename) {
  const ext = path.extname(filename).slice(1).toLowerCase()
  if (ext === "css") return "css"
  if (ext === "html" || ext === "htm") return "html"
  if (ext === "json") return "json"
  if (ext === "ts" || ext === "tsx") return "tsx"
  if (ext === "js" || ext === "mjs") return "js"
  return "" // md and everything else → plain fence / inline
}

// Recursively list files under dir, returned as paths relative to dir.
async function walk(dir, base = dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(abs, base)))
    else out.push(path.relative(base, abs))
  }
  return out
}

function titleize(slug) {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

async function main() {
  if (!existsSync(SKILLS_SRC)) {
    console.error(`✗ skills source not found: ${SKILLS_SRC}`)
    console.error(`  Clone dash-electric/dash-skills next to this repo, or pass --src <path>.`)
    process.exit(1)
  }

  // Fresh start so removed references/skills don't linger.
  await rm(PUBLIC_SKILLS, { recursive: true, force: true })
  await mkdir(PUBLIC_SKILLS, { recursive: true })

  const slugs = (await readdir(SKILLS_SRC, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .sort()

  const manifest = []

  for (const slug of slugs) {
    const srcDir = path.join(SKILLS_SRC, slug)
    const skillPath = path.join(srcDir, "SKILL.md")
    if (!existsSync(skillPath)) {
      console.warn(`  ⚠ skipping ${slug} — no SKILL.md`)
      continue
    }

    const rawSkill = await readFile(skillPath, "utf8")
    const { meta, body } = parseFrontmatter(rawSkill)

    // Collect reference files (md/css/html/...). Examples included.
    const refsDir = path.join(srcDir, "references")
    let refFiles = []
    if (existsSync(refsDir)) {
      refFiles = (await walk(refsDir)).sort()
    }

    // --- copy raw files into public/skills/<slug>/ -------------------------
    const outDir = path.join(PUBLIC_SKILLS, slug)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, "SKILL.md"), rawSkill)
    for (const rel of refFiles) {
      const dest = path.join(outDir, "references", rel)
      await mkdir(path.dirname(dest), { recursive: true })
      await copyFileText(path.join(refsDir, rel), dest)
    }

    // --- build the self-contained bundle (the LLM link) -------------------
    // Inline text references (md/css) so a single URL is fully usable. Large
    // binary-ish examples (html) are linked, not inlined, to keep the bundle
    // fetch-friendly for assistants that truncate huge pages.
    const inlineExts = new Set(["md", "css"])
    const bundle = []
    bundle.push(`# Dash Skill — ${meta.name ?? titleize(slug)}`)
    bundle.push("")
    bundle.push(
      `> Public skill from **Dash Electric**. To use it: paste this file's URL`,
    )
    bundle.push(
      `> into any AI assistant (Claude, ChatGPT, Gemini) and ask it to read and`,
    )
    bundle.push(`> follow the instructions below. No install, no login required.`)
    bundle.push(">")
    bundle.push(
      `> Source of truth: \`dash-electric/dash-skills · skills/${slug}\`` +
        (meta.version ? ` · v${meta.version}` : ""),
    )
    if (meta.description) {
      bundle.push(">")
      bundle.push(`> ${meta.description}`)
    }
    bundle.push("")
    bundle.push("---")
    bundle.push("")
    bundle.push(body)

    const linkedRefs = []
    for (const rel of refFiles) {
      const ext = path.extname(rel).slice(1).toLowerCase()
      // Relative to the deployment origin so the bundle works on any host
      // (staging vs prod). An assistant resolves these against the .md URL
      // it was given.
      const refUrl = `/skills/${slug}/references/${rel.split(path.sep).join("/")}`
      if (inlineExts.has(ext)) {
        const content = await readFile(path.join(refsDir, rel), "utf8")
        bundle.push("")
        bundle.push("---")
        bundle.push("")
        bundle.push(`## Reference — \`${rel}\``)
        bundle.push("")
        if (ext === "md") {
          bundle.push(content.trim())
        } else {
          bundle.push("```" + fence(rel))
          bundle.push(content.replace(/\n$/, ""))
          bundle.push("```")
        }
      } else {
        linkedRefs.push({ rel, refUrl })
      }
    }

    if (linkedRefs.length) {
      bundle.push("")
      bundle.push("---")
      bundle.push("")
      bundle.push("## Additional references")
      bundle.push("")
      for (const { rel, refUrl } of linkedRefs) {
        bundle.push(`- \`${rel}\` — ${refUrl}`)
      }
    }
    bundle.push("")

    const bundleText = bundle.join("\n")
    await writeFile(path.join(PUBLIC_SKILLS, `${slug}.md`), bundleText)

    manifest.push({
      slug,
      name: meta.name ?? slug,
      title: titleize(slug),
      description: meta.description ?? "",
      version: meta.version ?? "",
      owner: meta.owner ?? "",
      rawPath: `/skills/${slug}.md`,
      bytes: Buffer.byteLength(bundleText, "utf8"),
      references: refFiles.map((rel) => ({
        label: rel.split(path.sep).join("/"),
        path: `/skills/${slug}/references/${rel.split(path.sep).join("/")}`,
      })),
    })

    console.log(
      `  ✓ ${slug} — bundle ${(Buffer.byteLength(bundleText, "utf8") / 1024).toFixed(1)}KB, ${refFiles.length} refs`,
    )
  }

  // --- write the generated manifest ----------------------------------------
  const header = `// AUTO-GENERATED by apps/docs/scripts/sync-skills.mjs — DO NOT EDIT BY HAND.
// Re-run: node apps/docs/scripts/sync-skills.mjs
// Source of truth: dash-electric/dash-skills (private sibling repo).

export type SkillReference = {
  label: string
  path: string
}

export type SkillMeta = {
  /** Folder slug — also the public URL stem (/skills/<slug>.md). */
  slug: string
  /** Skill name from frontmatter. */
  name: string
  /** Human title for cards/headings. */
  title: string
  description: string
  version: string
  owner: string
  /** Public path to the self-contained markdown bundle (the LLM link). */
  rawPath: string
  /** Bundle size in bytes. */
  bytes: number
  references: SkillReference[]
}

// Note: the public origin (staging vs prod) is NOT baked in here — it is
// resolved at runtime from env via lib/site-url.ts (getSiteUrl), so the same
// build serves correct links on any deployment.

export const skills: SkillMeta[] = ${JSON.stringify(manifest, null, 2)}

export const skillBySlug = (slug: string): SkillMeta | undefined =>
  skills.find((s) => s.slug === slug)
`
  await writeFile(MANIFEST, header)

  console.log(`\n✓ wrote ${manifest.length} skill(s) → public/skills/ + lib/skills-manifest.ts`)
}

async function copyFileText(src, dest) {
  // Plain copy that works for text + small binaries alike.
  const buf = await readFile(src)
  await writeFile(dest, buf)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
