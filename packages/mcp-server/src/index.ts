#!/usr/bin/env node
/**
 * @dash/mcp-server — Model Context Protocol server exposing the Dash Design
 * System registry as native AI tools (Claude Code / Cursor / Codex).
 *
 * Transport: stdio (MCP standard for local CLI clients).
 *
 * Env:
 *   DASH_REGISTRY_URL   — registry base URL (default: https://ds.dash.com)
 *   DASH_REGISTRY_TOKEN — optional bearer token
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";

import { RegistryClient } from "./lib/registry-client.js";
import { SERVER_NAME, VERSION } from "./version.js";

import {
  GET_AI_RULES_TOOL,
  runGetAiRules,
} from "./tools/get-ai-rules.js";
import {
  GET_COMPONENT_TOOL,
  runGetComponent,
  type GetComponentInput,
} from "./tools/get-component.js";
import {
  LIST_CATEGORIES_TOOL,
  runListCategories,
} from "./tools/list-categories.js";
import {
  LIST_TEMPLATES_TOOL,
  runListTemplates,
  type ListTemplatesInput,
} from "./tools/list-templates.js";
import {
  SEARCH_COMPONENTS_TOOL,
  runSearchComponents,
  type SearchComponentsInput,
} from "./tools/search-components.js";
import {
  SEARCH_TOKENS_TOOL,
  runSearchTokens,
  type SearchTokensInput,
} from "./tools/search-tokens.js";

const TOOLS = [
  SEARCH_COMPONENTS_TOOL,
  GET_COMPONENT_TOOL,
  LIST_CATEGORIES_TOOL,
  LIST_TEMPLATES_TOOL,
  SEARCH_TOKENS_TOOL,
  GET_AI_RULES_TOOL,
];

async function main(): Promise<void> {
  const client = new RegistryClient();
  const server = new Server(
    { name: SERVER_NAME, version: VERSION },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (req: CallToolRequest) => {
    const { name, arguments: rawArgs } = req.params;
    const args = (rawArgs ?? {}) as Record<string, unknown>;

    try {
      const result = await dispatch(client, name, args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text", text: `Error in ${name}: ${message}` }],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr only — stdout is reserved for MCP protocol traffic.
  process.stderr.write(
    `[${SERVER_NAME}@${VERSION}] listening on stdio · registry=${client.baseUrl}\n`,
  );
}

async function dispatch(
  client: RegistryClient,
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "search_components":
      return runSearchComponents(client, args as unknown as SearchComponentsInput);
    case "get_component":
      return runGetComponent(client, args as unknown as GetComponentInput);
    case "list_categories":
      return runListCategories(client);
    case "list_templates":
      return runListTemplates(client, args as unknown as ListTemplatesInput);
    case "search_tokens":
      return runSearchTokens(client, args as unknown as SearchTokensInput);
    case "get_ai_rules":
      return runGetAiRules(client);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

main().catch((err) => {
  process.stderr.write(
    `[${SERVER_NAME}] fatal: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`,
  );
  process.exit(1);
});
