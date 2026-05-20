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
 *
 * Response format: markdown (per shadcn MCP convention). Each tool returns
 * a single MCP TextContent with markdown including section headers, install
 * commands, and CTAs. See `lib/markdown-response.ts` for formatters.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";

import { RegistryClient } from "./lib/registry-client.js";
import {
  formatAiRules,
  formatAuditChecklist,
  formatCategoryList,
  formatComponentDetail,
  formatComponentList,
  formatError,
  formatTemplateList,
  formatTokenList,
} from "./lib/markdown-response.js";
import { SERVER_NAME, VERSION } from "./version.js";

import {
  GET_AI_RULES_TOOL,
  GET_RULES_TOOL,
  runGetAiRules,
} from "./tools/get-ai-rules.js";
import {
  GET_AUDIT_CHECKLIST_TOOL,
  runGetAuditChecklist,
} from "./tools/get-audit-checklist.js";
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
  GET_RULES_TOOL,
  // Deprecated alias — same handler. Remove in v0.3.
  GET_AI_RULES_TOOL,
  GET_AUDIT_CHECKLIST_TOOL,
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
      const markdown = await dispatch(client, name, args);
      return {
        content: [{ type: "text", text: markdown }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: formatError(`Tool \`${name}\` failed: ${message}`),
          },
        ],
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

/**
 * Dispatch a tool call and return a markdown string. Each branch wires the
 * tool runner's raw result through the matching formatter from
 * `lib/markdown-response.ts`.
 */
async function dispatch(
  client: RegistryClient,
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case "search_components": {
      const input = args as unknown as SearchComponentsInput;
      const result = await runSearchComponents(client, input);
      return formatComponentList(result, { query: input.query, type: input.type });
    }
    case "get_component": {
      const input = args as unknown as GetComponentInput;
      const result = await runGetComponent(client, input);
      return formatComponentDetail(result);
    }
    case "list_categories": {
      const result = await runListCategories(client);
      return formatCategoryList(result);
    }
    case "list_templates": {
      const input = args as unknown as ListTemplatesInput;
      const result = await runListTemplates(client, input);
      return formatTemplateList(result, { vertical: input.vertical });
    }
    case "search_tokens": {
      const input = args as unknown as SearchTokensInput;
      const result = await runSearchTokens(client, input);
      return formatTokenList(result, { query: input.query });
    }
    case "get_ai_rules": {
      // Deprecated alias for `get_rules`. Logs a one-line warning to stderr
      // (stdout is reserved for MCP protocol traffic). Remove in v0.3.
      process.stderr.write(
        `[${SERVER_NAME}] DEPRECATED: tool "get_ai_rules" renamed to "get_rules" — will be removed in v0.3\n`,
      );
      const markdown = await runGetAiRules(client);
      return formatAiRules(markdown);
    }
    case "get_rules": {
      const markdown = await runGetAiRules(client);
      return formatAiRules(markdown);
    }
    case "get_audit_checklist": {
      const markdown = await runGetAuditChecklist(client);
      return formatAuditChecklist(markdown);
    }
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
