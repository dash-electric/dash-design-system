import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"

/**
 * GET /api/schema/[name]
 *
 * Public JSON-Schema host so external editors (VS Code, JetBrains, ajv, etc.)
 * can reference `https://ds.dash.com/schema/registry-item.json` from their
 * `$schema` field and validate consumer `registry.json` / item manifests
 * against the canonical Dash schema.
 *
 * NOT Bearer-gated — schemas are public on purpose; the value is to let
 * any downstream Dash consumer get instant editor validation without
 * needing a registry token.
 *
 * Backed by `packages/registry-schema/schemas/<name>.json`.
 * Available names: `registry-item`, `registry` (with or without `.json` suffix).
 */

const SCHEMA_DIR = path.join(
  process.cwd(),
  "..",
  "..",
  "packages",
  "registry-schema",
  "schemas",
)

// Allow only lowercase-id style names (matches the file naming convention).
const NAME_RE = /^[a-z0-9][a-z0-9._-]*$/i

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ name: string }> },
): Promise<NextResponse> {
  const { name: rawName } = await ctx.params
  const name = rawName.replace(/\.json$/i, "")

  if (!NAME_RE.test(name)) {
    return NextResponse.json(
      { error: "invalid schema name" },
      { status: 400, headers: corsHeaders() },
    )
  }

  const filePath = path.join(SCHEMA_DIR, `${name}.json`)
  // Defence-in-depth: ensure the resolved path stays inside SCHEMA_DIR.
  if (!path.resolve(filePath).startsWith(path.resolve(SCHEMA_DIR))) {
    return NextResponse.json(
      { error: "invalid schema path" },
      { status: 400, headers: corsHeaders() },
    )
  }

  let body: string
  try {
    body = await fs.readFile(filePath, "utf8")
  } catch {
    return NextResponse.json(
      { error: `schema not found: ${name}` },
      { status: 404, headers: corsHeaders() },
    )
  }

  // Validate it's parseable JSON before serving — better to 500 here than
  // hand an editor a broken schema.
  try {
    JSON.parse(body)
  } catch {
    return NextResponse.json(
      { error: "schema is not valid JSON" },
      { status: 500, headers: corsHeaders() },
    )
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/schema+json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  })
}
