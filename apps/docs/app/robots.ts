import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site-url"

/**
 * Render at request time so the Sitemap URL uses the runtime SITE_URL
 * (the per-environment Cloud Run origin), not the build-time ds.dash.com
 * fallback. Same reasoning as the skill pages.
 */
export const dynamic = "force-dynamic"

/**
 * Explicitly welcome AI assistant crawlers so the public Skills pages and the
 * self-contained /skills/*.md bundles get discovered and indexed. Without a
 * robots.txt at all, /robots.txt 404s and some crawlers treat that as
 * ambiguous; an explicit allow-list removes the doubt.
 *
 * Gated / non-content paths stay disallowed: the Bearer-gated registry (/r,
 * /api/registry), the CEO dashboard (/dashboard), and other API routes have no
 * value to a crawler and some are auth-walled.
 */
const AI_AND_SEARCH_BOTS = [
  // OpenAI
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Google (Gemini / AI Overviews opt-in) + classic Googlebot
  "Google-Extended",
  "Googlebot",
  // Anthropic
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  // Apple Intelligence
  "Applebot",
  "Applebot-Extended",
  // Perplexity, Microsoft
  "PerplexityBot",
  "Bingbot",
]

const DISALLOWED = ["/api/", "/r/", "/dashboard", "/docs/admin"]

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  return {
    rules: [
      // Everyone (including the AI bots above) may read public content;
      // gated/non-content paths are off-limits.
      { userAgent: "*", allow: "/", disallow: DISALLOWED },
      // Spell out the AI/search crawlers explicitly so the intent to allow
      // them is unambiguous even if defaults change.
      { userAgent: AI_AND_SEARCH_BOTS, allow: "/", disallow: DISALLOWED },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
