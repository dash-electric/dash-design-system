import { describe, it, expect } from "vitest";
import {
  formatAiRules,
  formatAuditChecklist,
  formatCategoryList,
  formatComponentDetail,
  formatComponentList,
  formatError,
  formatTemplateList,
  formatTokenList,
} from "./markdown-response.js";

describe("formatComponentList", () => {
  it("renders 'No matches' block with CTAs when empty", () => {
    const out = formatComponentList([], { query: "xxx" });
    expect(out).toContain("## No matches");
    expect(out).toContain("`xxx`");
    expect(out).toContain("list_categories");
    expect(out).toContain("https://ds.dash.com/docs/components");
  });

  it("renders one row per item with install command and type", () => {
    const out = formatComponentList(
      [
        {
          name: "button",
          type: "ui",
          title: "Button",
          description: "Primary action.",
          categories: ["form"],
        },
        {
          name: "@dash/data-table",
          type: "block",
          description: "Sortable table.",
        },
      ],
      { query: "button" },
    );
    expect(out).toContain("## Found 2 components for `button`");
    expect(out).toContain("### `button` — Button");
    expect(out).toContain("**Install:** `dashkit add button`");
    expect(out).toContain("**Install:** `dashkit add data-table`"); // scope stripped
    expect(out).toContain("**Type:** `ui`");
    expect(out).toContain("**Type:** `block`");
    expect(out).toContain("```bash\ndashkit add <component-name>\n```");
    // Each row has an "Open in Dash Docs" link with the install-style name
    expect(out).toContain("[Open in Dash Docs](https://ds.dash.com/docs/components/button)");
    expect(out).toContain("[Open in Dash Docs](https://ds.dash.com/docs/components/data-table)");
  });

  it("includes type filter in heading", () => {
    const out = formatComponentList(
      [{ name: "a", type: "ui" }],
      { query: "a", type: "ui" },
    );
    expect(out).toContain("(type: `ui`)");
  });

  it("handles missing description gracefully", () => {
    const out = formatComponentList(
      [{ name: "x", type: "ui" }],
      { query: "x" },
    );
    expect(out).toContain("_No description_");
  });
});

describe("formatComponentDetail", () => {
  it("renders install, deps, files, cssVars sections", () => {
    const out = formatComponentDetail({
      name: "button",
      type: "ui",
      title: "Button",
      description: "A button.",
      dependencies: ["clsx"],
      devDependencies: ["@types/react"],
      registryDependencies: ["icon"],
      files: [{ path: "ui/button.tsx", type: "registry:ui" }],
      cssVars: { light: { "primary-500": "#5e2aac" } },
    });
    expect(out).toContain("# `button` — Button");
    expect(out).toContain("```bash\ndashkit add button\n```");
    expect(out).toContain("## npm dependencies");
    expect(out).toContain("`clsx`");
    expect(out).toContain("`@types/react`");
    expect(out).toContain("## Registry dependencies");
    expect(out).toContain("`icon`");
    expect(out).toContain("## Files");
    expect(out).toContain("`ui/button.tsx`");
    expect(out).toContain("## CSS Variables");
    expect(out).toContain("`--primary-500`: `#5e2aac`");
    expect(out).toContain("`dashkit audit --layer-only`");
  });

  it("hints at includeFiles when files have no content", () => {
    const out = formatComponentDetail({
      name: "button",
      type: "ui",
      files: [{ path: "ui/button.tsx" }],
    });
    expect(out).toContain('"includeFiles": true');
  });

  it("inlines file content with language-tagged code blocks", () => {
    const out = formatComponentDetail({
      name: "button",
      type: "ui",
      files: [{ path: "ui/button.tsx", content: "export const Button = () => null" }],
    });
    expect(out).toContain("```tsx\nexport const Button = () => null\n```");
  });
});

describe("formatCategoryList", () => {
  it("lists categories with counts and samples", () => {
    const out = formatCategoryList([
      { category: "form", itemCount: 3, sampleItems: ["input", "select", "button"] },
      { category: "layout", itemCount: 1, sampleItems: ["stack"] },
    ]);
    expect(out).toContain("## Dash Registry Categories (2)");
    expect(out).toContain("**form** — 3 items");
    expect(out).toContain("**layout** — 1 item");
    expect(out).toContain("`input`, `select`, `button`");
    expect(out).toContain("search_components");
  });

  it("handles empty registry", () => {
    const out = formatCategoryList([]);
    expect(out).toContain("No categories indexed yet");
    expect(out).toContain("`dashkit sync`");
  });
});

describe("formatTemplateList", () => {
  it("renders templates with vertical and install", () => {
    const out = formatTemplateList(
      [
        {
          name: "marketing-landing",
          type: "template",
          title: "Marketing Landing",
          description: "Hero + features.",
          vertical: "marketing",
        },
      ],
      { vertical: "marketing" },
    );
    expect(out).toContain("## 1 template (vertical: `marketing`)");
    expect(out).toContain("### `marketing-landing` — Marketing Landing");
    expect(out).toContain("_vertical: marketing_");
    expect(out).toContain("`dashkit add marketing-landing`");
  });

  it("empty state suggests dropping vertical", () => {
    const out = formatTemplateList([], { vertical: "hr" });
    expect(out).toContain("No templates found for vertical `hr`");
    expect(out).toContain("Drop the `vertical` filter");
  });
});

describe("formatTokenList", () => {
  it("groups tokens by group and shows usage CTA", () => {
    const out = formatTokenList(
      [
        { path: "cssVars.light.primary-500", value: "#5e2aac", group: "cssVars/light" },
        { path: "cssVars.dark.primary-500", value: "#7c4fc4", group: "cssVars/dark" },
      ],
      { query: "primary" },
    );
    expect(out).toContain("## 2 tokens matching `primary`");
    expect(out).toContain("### cssVars/light");
    expect(out).toContain("### cssVars/dark");
    expect(out).toContain("`cssVars.light.primary-500` → `#5e2aac`");
    expect(out).toContain("bg-primary-500");
  });

  it("empty state suggests partials", () => {
    const out = formatTokenList([], { query: "xxxxxx" });
    expect(out).toContain("No tokens matched `xxxxxx`");
  });
});

describe("formatAiRules", () => {
  it("wraps markdown with audit CTA", () => {
    const out = formatAiRules("# Some rules\n\ndo this");
    expect(out).toContain("## Dash AI Rules");
    expect(out).toContain("`dashkit audit --layer-only`");
    expect(out).toContain("# Some rules");
  });
});

describe("formatAuditChecklist", () => {
  it("wraps cardinal rules with verification CTAs and quick reference", () => {
    const out = formatAuditChecklist("## CR-1\nadditive only");
    expect(out).toContain("## Dash Cardinal Rules — Audit Checklist");
    expect(out).toContain("dashkit audit --layer-only"); // appears in fenced code block
    expect(out).toContain("dashkit info rules");
    expect(out).toContain("Banned imports");
    expect(out).toContain("Audit trail mandatory");
    expect(out).toContain("Voice");
    expect(out).toContain("`#5e2aac`");
    expect(out).toContain("## CR-1");
  });

  it("includes all six quick-reference rules", () => {
    const out = formatAuditChecklist("placeholder");
    expect(out).toMatch(/CR-3/);
    expect(out).toMatch(/CR-2/);
    expect(out).toMatch(/CR-4/);
    expect(out).toMatch(/CR-5/);
    expect(out).toMatch(/CR-6/);
  });
});

describe("formatError", () => {
  it("renders error block with optional suggestion", () => {
    const out = formatError("Bad input", "Try again");
    expect(out).toContain("## Error");
    expect(out).toContain("Bad input");
    expect(out).toContain("**Suggestion:** Try again");
  });
});
