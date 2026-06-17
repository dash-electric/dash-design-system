import { promises as fs } from "node:fs"
import path from "node:path"
import { notFound } from "next/navigation"
import {
  RiBookOpenLine as Book,
  RiFileTextLine as FileText,
} from "@remixicon/react"
import { DocsPageShell, DocsHeader, DocsSection } from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { CopySkillLink } from "@/components/docs/skill-link"
import { skills, skillBySlug, SKILLS_SITE_URL } from "@/lib/skills-manifest"

export function generateStaticParams() {
  return skills.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const skill = skillBySlug(slug)
  if (!skill) return {}
  return {
    title: `${skill.title} — Dash Skills`,
    description: skill.description,
  }
}

/** Strip YAML frontmatter for human-readable display of the SKILL body. */
function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\n[\s\S]*?\n---\n?/, "").trim()
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const skill = skillBySlug(slug)
  if (!skill) notFound()

  const skillMdPath = path.join(
    process.cwd(),
    "public",
    "skills",
    slug,
    "SKILL.md",
  )
  let body = ""
  try {
    body = stripFrontmatter(await fs.readFile(skillMdPath, "utf8"))
  } catch {
    body = "(skill content unavailable — re-run `node apps/docs/scripts/sync-skills.mjs`)"
  }

  const url = `${SKILLS_SITE_URL}${skill.rawPath}`
  const prompt = `Read this skill and follow it for the rest of our conversation: ${url}`
  const sizeKb = (skill.bytes / 1024).toFixed(0)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Library / Skills"
        title={skill.title}
        description={skill.description}
      />

      {/* Primary call to action — the public LLM link */}
      <section className="rounded-2xl border border-(--dash-purple-200) bg-(--dash-purple-50)/40 p-5 sm:p-6 mb-10">
        <p className="text-sm text-text-strong-950 font-medium mb-1">
          Use this skill in any AI assistant
        </p>
        <p className="text-sm text-text-sub-600 leading-relaxed mb-4">
          Copy the prompt and paste it into Claude, ChatGPT, or Gemini. The
          assistant reads the skill from the link and follows it — no install,
          no login, no CLI.
        </p>
        <CopySkillLink url={url} prompt={prompt} />
        <div className="mt-4 rounded-lg bg-bg-white-0 border border-stroke-soft-200 px-3.5 py-2.5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-text-soft-400 mb-1">
            Public link
          </p>
          <code className="text-xs text-text-strong-950 break-all">{url}</code>
        </div>
        <p className="text-[11px] text-text-soft-400 mt-3">
          Self-contained markdown · {sizeKb} KB · works with any web-capable AI.
          {skill.version ? ` Version ${skill.version}.` : ""}
        </p>
      </section>

      <DocsSection
        title="What it does"
        description="The full skill instructions below are exactly what the assistant reads from the link."
      >
        <div className="rounded-xl border border-stroke-soft-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stroke-soft-200 bg-bg-weak-50">
            <FileText className="size-4 text-text-sub-600" strokeWidth={1.5} />
            <span className="text-xs font-medium text-text-strong-950">SKILL.md</span>
          </div>
          <DocsCode language="md" code={body} />
        </div>
      </DocsSection>

      {skill.references.length > 0 ? (
        <DocsSection
          title="References"
          description="Supporting files the skill draws on. All are bundled into the single public link above; they are also browsable individually."
        >
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skill.references.map((ref) => (
              <li key={ref.path}>
                <a
                  href={ref.path}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-2.5 transition-colors hover:border-(--dash-purple-300) hover:bg-bg-weak-50"
                >
                  <Book className="size-4 text-text-sub-600 shrink-0" strokeWidth={1.5} />
                  <span className="text-sm text-text-strong-950 font-mono truncate">
                    {ref.label}
                  </span>
                  <span aria-hidden className="ml-auto text-text-soft-400 group-hover:text-(--dash-purple-500) text-sm">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </DocsSection>
      ) : null}
    </DocsPageShell>
  )
}
