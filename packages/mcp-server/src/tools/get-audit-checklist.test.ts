import { describe, it, expect, vi } from "vitest";
import { runGetAuditChecklist } from "./get-audit-checklist.js";
import type { RegistryClient } from "../lib/registry-client.js";

function mockClient(opts: {
  rawFiles?: Record<string, string>;
  item?: { name: string; files?: Array<{ path: string; content?: string }> } | null;
}): RegistryClient {
  return {
    getRawFile: vi.fn(async (path: string) => {
      const v = opts.rawFiles?.[path];
      if (v == null) throw new Error(`404: ${path}`);
      return v;
    }),
    getItem: vi.fn(async (name: string) => {
      if (opts.item && opts.item.name === name) return opts.item as never;
      throw new Error(`not found: ${name}`);
    }),
  } as unknown as RegistryClient;
}

describe("runGetAuditChecklist", () => {
  it("returns raw file content from preferred path", async () => {
    const client = mockClient({
      rawFiles: {
        "dash/foundation/rules/cardinal-rules.md": "# Cardinal Rules\n\nCR-1 additive only.",
      },
    });
    const out = await runGetAuditChecklist(client);
    expect(out).toContain("CR-1 additive only");
  });

  it("falls back through candidate paths", async () => {
    const client = mockClient({
      rawFiles: {
        "cardinal-rules.md": "fallback rules content",
      },
    });
    const out = await runGetAuditChecklist(client);
    expect(out).toBe("fallback rules content");
  });

  it("falls back to registry item lookup", async () => {
    const client = mockClient({
      item: {
        name: "cardinal-rules",
        files: [{ path: "cardinal-rules.md", content: "from registry item" }],
      },
    });
    const out = await runGetAuditChecklist(client);
    expect(out).toBe("from registry item");
  });

  it("throws a useful error when nothing found", async () => {
    const client = mockClient({});
    await expect(runGetAuditChecklist(client)).rejects.toThrow(
      /Could not locate cardinal-rules\.md/,
    );
  });
});
