import Link from "next/link"
import { RiSparkling2Line as Sparkle, RiRobot2Line as Robot } from "@remixicon/react"
import { DocsPageShell, DocsHeader } from "@/components/docs/page-shell"
import { skills } from "@/lib/skills-manifest"
import { getSiteHost } from "@/lib/site-url"

export const metadata = {
  title: "Skills — Dash Design System",
  description:
    "Public AI skills from Dash Electric. Paste one markdown link into Claude, ChatGPT, or Gemini and the assistant works the Dash way — no install, no login.",
}

export default function SkillsOverviewPage() {
  const host = getSiteHost()
  return (
    <DocsPageShell className="max-w-5xl">
      <DocsHeader
        category="Library / Skills"
        title="Skills"
        description={`${skills.length} public AI skill${skills.length === 1 ? "" : "s"} — each is a single markdown link you paste into any AI assistant (Claude, ChatGPT, Gemini). No install, no login, no CLI.`}
      />

      {/* How it works — for non-technical readers */}
      <section className="mb-12 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-lg flex items-center justify-center bg-(--dash-purple-50) text-(--dash-purple-600) [&_svg]:size-4">
            <Robot strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-text-strong-950">
            How to use a skill (no setup)
          </h2>
        </div>
        <ol className="space-y-2.5 text-sm text-text-sub-600 leading-relaxed">
          <li className="flex gap-3">
            <span className="shrink-0 size-5 rounded-full bg-bg-white-0 border border-stroke-soft-200 text-[11px] font-semibold text-text-strong-950 flex items-center justify-center">1</span>
            <span>Open a skill below and press <strong className="text-text-strong-950 font-medium">Copy AI prompt</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 size-5 rounded-full bg-bg-white-0 border border-stroke-soft-200 text-[11px] font-semibold text-text-strong-950 flex items-center justify-center">2</span>
            <span>Paste it into Claude, ChatGPT, or Gemini and send.</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 size-5 rounded-full bg-bg-white-0 border border-stroke-soft-200 text-[11px] font-semibold text-text-strong-950 flex items-center justify-center">3</span>
            <span>The assistant reads the skill from the link and follows it for the rest of your chat. Then just ask for what you need.</span>
          </li>
        </ol>
      </section>

      <ul className="grid grid-cols-1 gap-4">
        {skills.map((skill) => (
          <li key={skill.slug}>
            <Link
              href={`/docs/skills/${skill.slug}`}
              className="group block h-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 transition-[border-color,box-shadow] duration-150 ease-out hover:border-(--dash-purple-300) hover:shadow-custom-xs"
            >
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg flex items-center justify-center bg-bg-weak-50 text-(--dash-purple-600) [&_svg]:size-4 shrink-0">
                  <Sparkle strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-text-strong-950 tracking-tight truncate">
                      {skill.title}
                    </span>
                    {skill.version ? (
                      <span className="text-[10px] uppercase tracking-[0.16em] text-text-soft-400">
                        v{skill.version}
                      </span>
                    ) : null}
                    <span
                      aria-hidden
                      className="ml-auto text-text-soft-400 group-hover:text-(--dash-purple-500) transition-colors text-sm leading-none"
                    >
                      →
                    </span>
                  </div>
                  <p className="text-sm text-text-sub-600 leading-relaxed mt-1 line-clamp-3">
                    {skill.description}
                  </p>
                  <div className="text-[11px] text-text-soft-400 mt-2 font-mono truncate">
                    {host}{skill.rawPath}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </DocsPageShell>
  )
}
