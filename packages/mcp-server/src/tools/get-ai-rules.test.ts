import { describe, it, expect, vi } from "vitest";
import {
  GET_AI_RULES_TOOL,
  GET_RULES_TOOL,
  runGetAiRules,
} from "./get-ai-rules.js";
import type { RegistryClient } from "../lib/registry-client.js";

function mockClient(opts: {
  rawFiles?: Record<string, string>;
}): RegistryClient {
  return {
    getRawFile: vi.fn(async (path: string) => {
      const v = opts.rawFiles?.[path];
      if (v == null) throw new Error(`404: ${path}`);
      return v;
    }),
    getItem: vi.fn(async () => {
      throw new Error("not found");
    }),
  } as unknown as RegistryClient;
}

describe("get_rules tool registration", () => {
  it("exposes canonical `get_rules` name", () => {
    expect(GET_RULES_TOOL.name).toBe("get_rules");
    expect(GET_RULES_TOOL.description).not.toMatch(/DEPRECATED/);
  });

  it("keeps `get_ai_rules` as a deprecation alias", () => {
    expect(GET_AI_RULES_TOOL.name).toBe("get_ai_rules");
    expect(GET_AI_RULES_TOOL.description).toMatch(/DEPRECATED/);
    // Per JSON-Schema / MCP convention we mark the legacy tool with
    // `deprecated: true` so clients can hide / warn on it.
    expect((GET_AI_RULES_TOOL as { deprecated?: boolean }).deprecated).toBe(
      true,
    );
  });

  it("both tools share the same handler (runGetAiRules)", async () => {
    const client = mockClient({
      rawFiles: { "dash-ai-rules.md": "# rules body" },
    });
    const a = await runGetAiRules(client);
    const b = await runGetAiRules(client);
    expect(a).toBe("# rules body");
    expect(b).toBe(a);
  });

  it("declares the `variant` enum (full | compressed)", () => {
    const variant = GET_RULES_TOOL.inputSchema.properties.variant;
    expect(variant.enum).toEqual(["full", "compressed"]);
    expect(variant.default).toBe("full");
  });
});

describe("get_rules variant", () => {
  it("defaults to the full dash-ai-rules.md", async () => {
    const client = mockClient({
      rawFiles: {
        "dash-ai-rules.md": "# full rules",
        "dash-ai-rules.compressed.md": "# compressed rules",
      },
    });
    expect(await runGetAiRules(client)).toBe("# full rules");
    expect(await runGetAiRules(client, { variant: "full" })).toBe("# full rules");
  });

  it("variant:compressed reads dash-ai-rules.compressed.md", async () => {
    const client = mockClient({
      rawFiles: {
        "dash-ai-rules.md": "# full rules",
        "dash-ai-rules.compressed.md": "# compressed rules",
      },
    });
    expect(await runGetAiRules(client, { variant: "compressed" })).toBe(
      "# compressed rules",
    );
  });
});
