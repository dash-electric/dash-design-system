"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function RegistryAuthPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Registry"
        title="Authentication"
        status="shipped"
        description="Every request to the @dash registry carries a Bearer token. Single shared secret (DASH_REGISTRY_TOKEN) gates both the /api/registry endpoints and the legacy /r/*.json static paths via Edge middleware. Constant-time compare. Dev-mode bypass when the env var is unset."
      />

      <DocsSection
        title="Why gated"
        description="Three reasons: licensed source assets, internal-only product code, and a low-effort first line of defense."
      >
        <ul className="text-base text-text-sub-600 leading-relaxed list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-text-strong-950">Licensed source</strong> — the Figma file Dash
            builds on is paid-tier. Distributing the resulting TSX to the open internet is a TOS
            violation.
          </li>
          <li>
            <strong className="text-text-strong-950">Internal-only by policy</strong> — templates like
            Halo-dash 3-pane, mitra-suspend-page, and the Phase 7 results dashboard bake in
            product-specific copy and tribe logic. Bearer gates these to the 10 internal PE Dash
            projects.
          </li>
          <li>
            <strong className="text-text-strong-950">Low-cost defense</strong> — single-secret Bearer
            is not a full IAM system, but it raises the cost of casual scraping by ~3 orders of
            magnitude. PE-grade good enough for v1.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="How the gate works">
        <ul className="text-base text-text-sub-600 leading-relaxed list-disc pl-5 space-y-1.5">
          <li><strong className="text-text-strong-950">Single env var</strong> — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">DASH_REGISTRY_TOKEN</code>. Set on Vercel + every consumer&apos;s <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">.env.local</code>.</li>
          <li><strong className="text-text-strong-950">Two endpoints gated</strong> — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">/api/registry/[name]</code> (preferred) and <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">/r/*.json</code> (legacy static path, gated via Edge middleware).</li>
          <li><strong className="text-text-strong-950">Constant-time compare</strong> — XOR loop, not <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">===</code>. Avoids leaking the token via timing side-channels.</li>
          <li><strong className="text-text-strong-950">Dev bypass</strong> — if the env var is unset AND <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">NODE_ENV !== &quot;production&quot;</code>, requests pass through without a header. Production fails closed.</li>
          <li><strong className="text-text-strong-950">Path traversal protection</strong> — item name must match <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">/^[a-z0-9][a-z0-9._-]*$/i</code>; resolved file path is verified to stay inside <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">public/r/</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection
        title="Generate a token"
        description="One-line OpenSSL command. Paste the output into 1Password / vault, then into the env var on every consumer."
      >
        <DocsCode
          language="bash"
          code={`# Generate a 32-byte base64-encoded token (one-time):
openssl rand -base64 32
# Example output: 8sJ3Lp/Zqy3v9XLm4Bz0wW8YqVqzNqRZ+Nx8Hk2pQbI=

# Then on the server (Vercel):
#   Project → Settings → Environment Variables → DASH_REGISTRY_TOKEN = <token>
#
# And on every consumer (.env.local in each Dash repo):
#   DASH_REGISTRY_TOKEN=<token>`}
        />
      </DocsSection>

      <DocsSection
        title="API route"
        description="Reads built JSON from public/r/, returns to authenticated consumers only."
      >
        <DocsCode
          language="ts"
          code={`// app/api/registry/[name]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { isAuthorized, unauthorized } from "../_auth"

const REGISTRY_DIR = path.join(process.cwd(), "public", "r")
const NAME_RE = /^[a-z0-9][a-z0-9._-]*$/i

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ name: string }> },
): Promise<NextResponse> {
  if (!isAuthorized(req)) return unauthorized()

  const { name: rawName } = await ctx.params
  const name = rawName.replace(/\\.json$/i, "")
  if (!NAME_RE.test(name)) {
    return NextResponse.json({ error: "Invalid item name" }, { status: 400 })
  }

  const filePath = path.join(REGISTRY_DIR, \`\${name}.json\`)
  if (!filePath.startsWith(REGISTRY_DIR + path.sep)) {
    return NextResponse.json({ error: "Path traversal blocked" }, { status: 400 })
  }

  try {
    const body = await fs.readFile(filePath, "utf-8")
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60",
      },
    })
  } catch {
    return NextResponse.json({ error: "Not Found", name }, { status: 404 })
  }
}`}
        />
      </DocsSection>

      <DocsSection
        title="Auth helper"
        description="Shared by the API route + middleware. Constant-time compare."
      >
        <DocsCode
          language="ts"
          code={`// app/api/registry/_auth.ts
import { NextRequest, NextResponse } from "next/server"

function getExpectedToken(): string | null {
  const t = process.env.DASH_REGISTRY_TOKEN
  return t && t.trim().length > 0 ? t.trim() : null
}

export function isAuthorized(req: NextRequest): boolean {
  const expected = getExpectedToken()
  if (!expected) return process.env.NODE_ENV !== "production"

  const header = req.headers.get("authorization") ?? ""
  const m = /^Bearer\\s+(.+)$/i.exec(header.trim())
  if (!m) return false

  const provided = m[1].trim()
  if (provided.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < provided.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return mismatch === 0
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: "Unauthorized" },
    {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="Dash Registry"' },
    },
  )
}`}
        />
      </DocsSection>

      <DocsSection
        title="Middleware (gates /r/*.json)"
        description="Without this, Next.js would serve public/r/*.json statically and bypass the API auth. The middleware matches the same paths and runs the same auth check."
      >
        <DocsCode
          language="ts"
          code={`// middleware.ts
import { NextRequest, NextResponse } from "next/server"

// ... isAuthorized() helper (mirrors app/api/registry/_auth.ts) ...

export function middleware(req: NextRequest): NextResponse {
  if (!isAuthorized(req)) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": 'Bearer realm="Dash Registry"',
        },
      },
    )
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/r/:path*"],
}`}
        />
      </DocsSection>

      <DocsSection
        title="Consumer setup"
        description="On the PE Dash repo side, three things: env var, components.json registry block, and the dash CLI does the rest."
      >
        <DocsCode
          language="bash"
          code={`# 1. Add the token to .env.local
echo "DASH_REGISTRY_TOKEN=<your-token>" >> .env.local`}
        />
        <DocsCode
          language="json"
          code={`// 2. Configure components.json
{
  "registries": {
    "@dash": {
      "url": "https://ds.dash.com/api/registry/{name}",
      "headers": {
        "Authorization": "Bearer \${DASH_REGISTRY_TOKEN}"
      }
    }
  }
}`}
        />
        <DocsCode
          language="bash"
          code={`# 3. Install something
dash add button
# → CLI interpolates env var, sends Bearer header, lands files`}
        />
        <p className="text-base text-text-sub-600 leading-relaxed">
          The <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`\${DASH_REGISTRY_TOKEN}`}</code> placeholder is interpolated from <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">process.env</code> at request time. Swap to <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`\${DASH_REGISTRY_TOKEN_CI}`}</code> for CI builds if you use a separate scope.
        </p>
      </DocsSection>

      <DocsSection title="Verify with curl">
        <DocsCode
          language="bash"
          code={`# 401 — no token (production)
curl -i https://ds.dash.com/api/registry/button

# 200 — valid token
curl -i \\
  -H "Authorization: Bearer $DASH_REGISTRY_TOKEN" \\
  https://ds.dash.com/api/registry/button

# 401 — direct static path also gated by middleware
curl -i https://ds.dash.com/r/button.json

# 404 — item not in registry
curl -i \\
  -H "Authorization: Bearer $DASH_REGISTRY_TOKEN" \\
  https://ds.dash.com/api/registry/nonexistent`}
        />
      </DocsSection>

      <DocsSection
        title="Token rotation runbook"
        description="Rotate quarterly by default, or immediately on a leak."
      >
        <ol className="text-base text-text-sub-600 leading-relaxed list-decimal pl-5 space-y-1.5">
          <li>Generate new token: <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">openssl rand -base64 32</code>.</li>
          <li>Update Vercel env var <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">DASH_REGISTRY_TOKEN</code>. Redeploy.</li>
          <li>Post new token to 1Password / vault. Notify <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">#design-system</code> Slack with rotation deadline.</li>
          <li>Each PE updates their <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">.env.local</code>. CI secrets updated by platform team.</li>
          <li>After deadline, old token returns 401. PE who missed the rotation: <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">dash add</code> fails fast, pings them to re-auth.</li>
        </ol>
        <p className="text-sm text-text-sub-600 leading-relaxed">
          Future versions will support per-project tokens with audit logs. The single-secret model is good enough for v1 (10 PE, internal-only).
        </p>
      </DocsSection>

      <DocsSection title="Failure modes">
        <ul className="text-base text-text-sub-600 leading-relaxed list-disc pl-5 space-y-1.5">
          <li><code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">401</code> — token missing, header malformed, or token mismatch.</li>
          <li><code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">400</code> — item name fails regex (path traversal, unsupported chars).</li>
          <li><code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">404</code> — item not in <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">public/r/</code>. Check the name; run <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">pnpm dash build</code> if it&apos;s a freshly added item.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
