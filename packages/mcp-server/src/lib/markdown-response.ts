/**
 * Markdown response formatters for MCP tool output.
 *
 * Shadcn MCP wraps tool responses in markdown with copy-paste CTAs
 * (install commands, links). This gives AI clients (Claude / Cursor / Codex)
 * a much better signal than raw JSON dumps — sections are scannable,
 * actions are explicit, and install commands are ready to copy.
 *
 * Why no `dedent` dep: a 10-line helper is enough for our needs and
 * avoids a new install step.
 */

/**
 * Strip a uniform leading-indent block (template-literal friendly).
 *
 * Computes the minimum indent from the RAW template strings (excluding
 * interpolated values). This avoids the trap where an interpolated
 * multi-line value at column 0 collapses the detected indent to 0
 * and leaves the outer template's indentation in the output.
 */
function dedent(strings: TemplateStringsArray, ...values: unknown[]): string {
  // Only "post-newline" lines from raw template parts count for indent
  // detection. Continuation segments after `${...}` (no leading newline)
  // are mid-line and must not contribute their indent.
  const indents: number[] = [];
  for (const s of strings) {
    const parts = s.split("\n");
    // parts[0] is mid-line continuation (skip for indent)
    for (let i = 1; i < parts.length; i++) {
      const line = parts[i];
      if (line.trim().length === 0) continue;
      indents.push(line.match(/^[ \t]*/)?.[0].length ?? 0);
    }
  }
  const minIndent = indents.length ? Math.min(...indents) : 0;

  // Strip that indent from each raw string's post-newline lines, then
  // interleave the interpolated values verbatim.
  const stripped = strings.map((s) =>
    s
      .split("\n")
      .map((l, i) => (i === 0 ? l : l.slice(minIndent)))
      .join("\n"),
  );

  let out = "";
  stripped.forEach((s, i) => {
    out += s + (i < values.length ? String(values[i] ?? "") : "");
  });

  // Drop a single leading newline if present, then trim trailing whitespace
  return out.replace(/^\n/, "").trimEnd();
}

// ---------------------------------------------------------------------------
// Types (kept loose so tool result shapes drop straight in)
// ---------------------------------------------------------------------------

export interface ComponentSummary {
  name: string;
  type: string;
  title?: string;
  description?: string;
  categories?: string[];
  vertical?: string;
}

export interface ComponentDetail extends ComponentSummary {
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files?: Array<{ path: string; type?: string; target?: string; content?: string }>;
  cssVars?: Record<string, Record<string, string>>;
}

export interface CategorySummary {
  category: string;
  itemCount: number;
  sampleItems: string[];
}

export interface TokenHit {
  path: string;
  value: string;
  group: string;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

export function formatComponentList(
  items: ComponentSummary[],
  ctx: { query: string; type?: string },
): string {
  if (items.length === 0) {
    return dedent`
      ## No matches

      No Dash registry items matched \`${ctx.query}\`${ctx.type ? ` (type: \`${ctx.type}\`)` : ""}.

      **Try:**
      - Broaden the query (e.g. "table" instead of "data-table-paginated").
      - List all categories first: call \`list_categories\`.
      - Browse docs: https://ds.dash.com/docs/components
    `;
  }

  const rows = items.map(formatComponentRow).join("\n\n");
  const filter = ctx.type ? ` (type: \`${ctx.type}\`)` : "";

  return dedent`
    ## Found ${items.length} component${items.length === 1 ? "" : "s"} for \`${ctx.query}\`${filter}

    ${rows}

    **To install one:**
    \`\`\`bash
    dash add <component-name>
    \`\`\`

    **To see the full schema (files, deps, cssVars) for any of these:**
    Call \`get_component\` with \`{ "name": "<component-name>" }\`.
  `;
}

function formatComponentRow(item: ComponentSummary): string {
  const title = item.title ?? item.name;
  const cats = item.categories?.length ? ` _(${item.categories.join(", ")})_` : "";
  const desc = item.description?.trim() || "_No description_";
  const installName = stripScope(item.name);
  return dedent`
    ### \`${item.name}\` — ${title}${cats}
    ${desc}

    **Type:** \`${item.type}\` · **Install:** \`dash add ${installName}\`
    [Open in Dash Docs](https://ds.dash.com/docs/components/${installName})
  `;
}

export function formatComponentDetail(item: ComponentDetail): string {
  const title = item.title ?? item.name;
  const desc = item.description?.trim() || "_No description_";
  const installName = stripScope(item.name);

  const sections: string[] = [];

  sections.push(dedent`
    # \`${item.name}\` — ${title}

    ${desc}

    **Type:** \`${item.type}\`${item.vertical ? ` · **Vertical:** \`${item.vertical}\`` : ""}${
      item.categories?.length ? ` · **Categories:** ${item.categories.join(", ")}` : ""
    }

    ## Install

    \`\`\`bash
    dash add ${installName}
    \`\`\`
  `);

  const allDeps = [
    ...(item.dependencies ?? []),
    ...(item.devDependencies ?? []),
  ];
  if (allDeps.length) {
    sections.push(dedent`
      ## npm dependencies

      ${allDeps.map((d) => `- \`${d}\``).join("\n")}
    `);
  }

  if (item.registryDependencies?.length) {
    sections.push(dedent`
      ## Registry dependencies (Dash siblings)

      ${item.registryDependencies.map((d) => `- \`${d}\``).join("\n")}

      _These are pulled automatically when you run \`dash add ${installName}\`._
    `);
  }

  if (item.files?.length) {
    const rows = item.files
      .map((f) => {
        const target = f.target ? ` → \`${f.target}\`` : "";
        const kind = f.type ? ` _(${f.type})_` : "";
        return `- \`${f.path}\`${target}${kind}`;
      })
      .join("\n");
    sections.push(dedent`
      ## Files

      ${rows}
    `);

    const inlined = item.files.filter((f) => f.content);
    if (inlined.length) {
      sections.push(dedent`
        ## File contents

        ${inlined
          .map(
            (f) =>
              `### \`${f.path}\`\n\n\`\`\`${guessLang(f.path)}\n${f.content}\n\`\`\``,
          )
          .join("\n\n")}
      `);
    } else {
      sections.push(dedent`
        > File contents not inlined. Re-call \`get_component\` with \`{ "name": "${item.name}", "includeFiles": true }\` to retrieve source.
      `);
    }
  }

  if (item.cssVars && Object.keys(item.cssVars).length) {
    const modes = Object.entries(item.cssVars)
      .map(([mode, vars]) => {
        const entries = Object.entries(vars)
          .map(([k, v]) => `- \`--${k}\`: \`${v}\``)
          .join("\n");
        return `### \`${mode}\`\n\n${entries}`;
      })
      .join("\n\n");
    sections.push(dedent`
      ## CSS Variables

      ${modes}
    `);
  }

  sections.push(dedent`
    **Next:**
    - Install: \`dash add ${installName}\`
    - Audit your repo afterwards: \`dash audit --layer-only\`
    - Docs: https://ds.dash.com/docs/components/${installName}
  `);

  return sections.join("\n\n");
}

export function formatCategoryList(cats: CategorySummary[]): string {
  if (cats.length === 0) {
    return dedent`
      ## No categories indexed yet

      The registry is empty or the index failed to load. Try \`dash sync\` or check the registry URL.
    `;
  }

  const rows = cats
    .map((c) => {
      const samples = c.sampleItems.map((s) => `\`${s}\``).join(", ");
      return `- **${c.category}** — ${c.itemCount} item${c.itemCount === 1 ? "" : "s"} (e.g. ${samples})`;
    })
    .join("\n");

  return dedent`
    ## Dash Registry Categories (${cats.length})

    ${rows}

    **Next:**
    - Search a category: \`search_components\` with \`{ "query": "<category-or-keyword>" }\`
    - Inspect one item: \`get_component\` with \`{ "name": "<name>" }\`
  `;
}

export interface TemplateSummary {
  name: string;
  title?: string;
  description?: string;
  vertical?: string;
  categories?: string[];
  type?: string;
}

export function formatTemplateList(
  items: TemplateSummary[],
  ctx: { vertical?: string },
): string {
  if (items.length === 0) {
    return dedent`
      ## No templates found${ctx.vertical ? ` for vertical \`${ctx.vertical}\`` : ""}

      **Try:**
      - Drop the \`vertical\` filter to see all templates.
      - Browse: https://ds.dash.com/docs/templates
    `;
  }

  const rows = items
    .map((t) => {
      const v = t.vertical ? ` · _vertical: ${t.vertical}_` : "";
      const desc = t.description?.trim() || "_No description_";
      return dedent`
        ### \`${t.name}\` — ${t.title ?? t.name}${v}
        ${desc}

        **Install:** \`dash add ${stripScope(t.name)}\`
      `;
    })
    .join("\n\n");

  return dedent`
    ## ${items.length} template${items.length === 1 ? "" : "s"}${ctx.vertical ? ` (vertical: \`${ctx.vertical}\`)` : ""}

    ${rows}

    **To scaffold a page from a template:**
    \`\`\`bash
    dash add <template-name>
    \`\`\`
  `;
}

export function formatTokenList(
  results: TokenHit[],
  ctx: { query: string },
): string {
  if (results.length === 0) {
    return dedent`
      ## No tokens matched \`${ctx.query}\`

      **Try:**
      - Search a partial: \`primary\`, \`spacing\`, \`#5e\`.
      - Check the theme is loaded: call \`get_component\` with \`{ "name": "base-theme" }\`.
    `;
  }

  const grouped = new Map<string, TokenHit[]>();
  for (const r of results) {
    const arr = grouped.get(r.group) ?? [];
    arr.push(r);
    grouped.set(r.group, arr);
  }

  const groups = [...grouped.entries()]
    .map(([group, hits]) => {
      const rows = hits
        .map((h) => `- \`${h.path}\` → \`${h.value}\``)
        .join("\n");
      return `### ${group}\n\n${rows}`;
    })
    .join("\n\n");

  return dedent`
    ## ${results.length} token${results.length === 1 ? "" : "s"} matching \`${ctx.query}\`

    ${groups}

    **Usage:** Tailwind classes like \`bg-primary-500\`, \`text-text-strong-950\`. Never hard-code hex.
  `;
}

export function formatAiRules(markdown: string): string {
  return dedent`
    ## Dash AI Rules

    The canonical convention guide. Read first when working in a Dash repo.

    **Verify your code with:** \`dash audit --layer-only\`

    ---

    ${markdown}
  `;
}

export function formatAuditChecklist(markdown: string): string {
  return dedent`
    ## Dash Cardinal Rules — Audit Checklist

    Layer 0 non-negotiables. Every Dash repo must comply.

    **Verify your code locally:**
    \`\`\`bash
    dash audit --layer-only
    \`\`\`

    **Full rule set:**
    \`\`\`bash
    # Inside any Dash repo
    dash info rules
    \`\`\`

    ---

    ${markdown}

    ---

    **Quick reference:**
    - Banned imports → refuse on sight (CR-3)
    - Audit trail mandatory for legal/financial fields (CR-2, CR-8)
    - Voice: formal "Anda" mitra-facing (CR-4)
    - Tokens only, no raw hex; Dash Purple = \`#5e2aac\` (CR-5)
    - Use \`dash add\`, never copy-paste components (CR-6)
  `;
}

export interface DesignContextView {
  designContract: string;
  layeredArchitecture: string;
  cardinalRules: string;
  voiceRules: string;
  manifest: Record<string, unknown> | null;
}

export function formatDesignContext(ctx: DesignContextView): string {
  const manifestBlock = ctx.manifest
    ? `\`\`\`json\n${JSON.stringify(ctx.manifest, null, 2)}\n\`\`\``
    : "_No foundation manifest available._";

  return dedent`
    ## Dash Design Context

    The full cross-repo design contract in one bundle. Honour this when
    generating or reviewing Dash UI. Verify with \`dash audit --layer-only\`.

    ---

    ## Design Contract (\`design.md\`)

    ${ctx.designContract || "_Not available._"}

    ---

    ## Layered Architecture

    ${ctx.layeredArchitecture || "_Not available._"}

    ---

    ## Cardinal Rules (Layer 0)

    ${ctx.cardinalRules || "_Not available._"}

    ---

    ## Voice Rules (Layer 0)

    ${ctx.voiceRules || "_Not available._"}

    ---

    ## Foundation Manifest

    ${manifestBlock}
  `;
}

export function formatGlossary(glossary: string): string {
  return dedent`
    ## Dash Domain Glossary

    Canonical entity shapes, table names, state machines, and endpoint
    conventions across all Dash repos. Use these names verbatim in generated
    code; do not invent entity or field names.

    ---

    ${glossary || "_Glossary not available._"}
  `;
}

export function formatError(message: string, suggestion?: string): string {
  return dedent`
    ## Error

    ${message}
    ${suggestion ? `\n**Suggestion:** ${suggestion}` : ""}
  `;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripScope(name: string): string {
  return name.replace(/^@dash\//, "");
}

function guessLang(path: string): string {
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".ts")) return "ts";
  if (path.endsWith(".jsx")) return "jsx";
  if (path.endsWith(".js")) return "js";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "md";
  return "";
}
