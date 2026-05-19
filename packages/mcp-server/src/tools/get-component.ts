/**
 * Tool: get_component
 *
 * Returns the full registry-item JSON for a single component. By default,
 * file `content` is stripped to keep payloads small. Pass
 * `includeFiles: true` to get inline source.
 */

import type { RegistryClient } from "../lib/registry-client.js";
import type { RegistryItem } from "../lib/schema.js";

export const GET_COMPONENT_TOOL = {
  name: "get_component",
  description:
    "Fetch a single Dash registry item by name (e.g. 'button' or '@dash/button'). Returns schema, dependencies, cssVars, and optionally inline file contents.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description:
          "Component name. Scope prefix '@dash/' is optional and stripped automatically.",
      },
      includeFiles: {
        type: "boolean",
        description:
          "If true, returns inline file contents. Default false (metadata only).",
        default: false,
      },
    },
    required: ["name"],
    additionalProperties: false,
  },
} as const;

export interface GetComponentInput {
  name: string;
  includeFiles?: boolean;
}

export async function runGetComponent(
  client: RegistryClient,
  input: GetComponentInput,
): Promise<RegistryItem> {
  const item = await client.getItem(input.name);
  if (!input.includeFiles && item.files) {
    return {
      ...item,
      files: item.files.map((f) => ({
        path: f.path,
        type: f.type,
        target: f.target,
      })),
    };
  }
  return item;
}
