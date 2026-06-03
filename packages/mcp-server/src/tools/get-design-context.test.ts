import { describe, it, expect, vi } from "vitest";
import {
  GET_DESIGN_CONTEXT_TOOL,
  runGetDesignContext,
} from "./get-design-context.js";
import type { RegistryClient } from "../lib/registry-client.js";
import type { RegistryItem } from "../lib/schema.js";

function mockClient(item: Partial<RegistryItem> | Error): RegistryClient {
  return {
    getItem: vi.fn(async () => {
      if (item instanceof Error) throw item;
      return item as RegistryItem;
    }),
    getRawFile: vi.fn(async () => {
      throw new Error("not used");
    }),
  } as unknown as RegistryClient;
}

const FULL_ITEM: Partial<RegistryItem> = {
  name: "design-context",
  type: "registry:file",
  files: [
    { path: "../../design.md", content: "# Design Contract body" },
    { path: "../../LAYERED-ARCHITECTURE.md", content: "# Layered body" },
    {
      path: "registry/dash/foundation/rules/cardinal-rules.md",
      content: "# Cardinal body",
    },
    {
      path: "registry/dash/foundation/voice/voice-rules.md",
      content: "# Voice body",
    },
    {
      path: "registry/dash/foundation/manifest.json",
      content: '{"name":"@dash/foundation","locked":true}',
    },
  ],
};

describe("get_design_context tool registration", () => {
  it("exposes the canonical name with empty input schema", () => {
    expect(GET_DESIGN_CONTEXT_TOOL.name).toBe("get_design_context");
    expect(GET_DESIGN_CONTEXT_TOOL.inputSchema.properties).toEqual({});
  });
});

describe("runGetDesignContext", () => {
  it("maps each bundled file to the matching output field", async () => {
    const client = mockClient(FULL_ITEM);
    const out = await runGetDesignContext(client);
    expect(out.designContract).toBe("# Design Contract body");
    expect(out.layeredArchitecture).toBe("# Layered body");
    expect(out.cardinalRules).toBe("# Cardinal body");
    expect(out.voiceRules).toBe("# Voice body");
    expect(out.manifest).toEqual({ name: "@dash/foundation", locked: true });
  });

  it("applies FALLBACK_LAYERED when LAYERED-ARCHITECTURE.md is missing", async () => {
    const client = mockClient({
      name: "design-context",
      type: "registry:file",
      files: [{ path: "../../design.md", content: "# Design only" }],
    });
    const out = await runGetDesignContext(client);
    expect(out.layeredArchitecture).toMatch(/Layered Architecture \(fallback summary\)/);
    expect(out.cardinalRules).toBe("");
    expect(out.manifest).toBeNull();
  });

  it("returns null manifest on malformed JSON", async () => {
    const client = mockClient({
      name: "design-context",
      type: "registry:file",
      files: [
        {
          path: "registry/dash/foundation/manifest.json",
          content: "{not valid json",
        },
      ],
    });
    const out = await runGetDesignContext(client);
    expect(out.manifest).toBeNull();
  });
});
