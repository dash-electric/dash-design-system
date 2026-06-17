import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site-url"
import { skills } from "@/lib/skills-manifest"

/**
 * Render at request time so absolute URLs use the runtime SITE_URL, not the
 * build-time ds.dash.com fallback. Same reasoning as the skill pages.
 */
export const dynamic = "force-dynamic"

/**
 * Sitemap focused on the public, crawlable surface — the docs entry points and
 * every published Skill (both the human-facing page and the raw .md bundle an
 * LLM actually reads). Gated paths (/r, /api, /dashboard) are intentionally
 * absent and are also Disallowed in robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()

  const staticPages = [
    "/",
    "/docs",
    "/docs/getting-started",
    "/docs/skills",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "/docs/skills" ? 0.9 : 0.7,
  }))

  const skillPages = skills.flatMap((s) => [
    {
      url: `${base}/docs/skills/${s.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      // The raw markdown bundle — the link LLMs are meant to read.
      url: `${base}${s.rawPath}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ])

  return [...staticPages, ...skillPages]
}
