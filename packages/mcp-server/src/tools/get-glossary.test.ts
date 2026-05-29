import { describe, it, expect, vi } from "vitest";
import {
  GET_GLOSSARY_TOOL,
  DEFAULT_GLOSSARY_CHAR_BUDGET,
  runGetGlossary,
  truncateGlossary,
} from "./get-glossary.js";
import type { RegistryClient } from "../lib/registry-client.js";
import type { RegistryItem } from "../lib/schema.js";

function mockClient(content: string): RegistryClient {
  return {
    getItem: vi.fn(async (): Promise<RegistryItem> => ({
      name: "dash-domain-glossary",
      type: "registry:file",
      files: [{ path: "registry/rules/dash-domain-glossary.md", content }],
    })),
    getRawFile: vi.fn(async () => {
      throw new Error("not used");
    }),
  } as unknown as RegistryClient;
}

describe("get_glossary tool registration", () => {
  it("exposes charBudget input", () => {
    expect(GET_GLOSSARY_TOOL.name).toBe("get_glossary");
    expect(GET_GLOSSARY_TOOL.inputSchema.properties).toHaveProperty("charBudget");
  });
});

describe("truncateGlossary", () => {
  it("returns full text under budget", () => {
    expect(truncateGlossary("short", 100)).toBe("short");
  });

  it("truncates and appends a marker over budget", () => {
    const text = "a".repeat(50) + "\n\n" + "b".repeat(50);
    const out = truncateGlossary(text, 60);
    expect(out.length).toBeLessThan(text.length);
    expect(out).toMatch(/glossary truncated/);
  });

  it("returns empty string for empty input", () => {
    expect(truncateGlossary("", 100)).toBe("");
  });
});

describe("runGetGlossary", () => {
  it("uses the default budget when none is supplied", async () => {
    const big = "x".repeat(DEFAULT_GLOSSARY_CHAR_BUDGET + 5000);
    const client = mockClient(big);
    const out = await runGetGlossary(client);
    expect(out.glossary.length).toBeLessThanOrEqual(
      DEFAULT_GLOSSARY_CHAR_BUDGET + 100,
    );
    expect(out.glossary).toMatch(/glossary truncated/);
  });

  it("honours an explicit charBudget", async () => {
    const big = "y".repeat(10_000);
    const client = mockClient(big);
    const out = await runGetGlossary(client, { charBudget: 500 });
    expect(out.glossary.length).toBeLessThan(700);
  });

  it("returns the full glossary when it fits the budget", async () => {
    const client = mockClient("# Glossary\n\nmitra = driver");
    const out = await runGetGlossary(client, { charBudget: 12_000 });
    expect(out.glossary).toBe("# Glossary\n\nmitra = driver");
  });
});
