/**
 * Test fixtures — including the spec's sample run trace verbatim.
 */

import type { AOPEvent } from "../src/types.js";

export const SAMPLE_RUN_ID = "01JBXAA000000000000000000Z";

/** Sample run from the spec, lightly normalized (ULID expanded to 26 chars). */
export const sampleRun: AOPEvent[] = [
  {
    v: "1.0.0",
    type: "run.start",
    runId: SAMPLE_RUN_ID,
    seq: 0,
    ts: "2026-05-28T03:11:00.000Z",
    payload: {
      prompt: "Build a refund request page in the support area, follow Dash DS, link from Settings.",
      targetRepo: {
        url: "github.com/dash/web",
        branch: "main",
        commit: "a1b2c3d",
      },
      model: { provider: "openai", name: "gpt-5" },
      budget: { maxUsd: 2, maxDurationMs: 300000, maxTokens: 80000 },
      initiator: "cli",
    },
  },
  {
    v: "1.0.0",
    type: "thinking",
    runId: SAMPLE_RUN_ID,
    seq: 1,
    ts: "2026-05-28T03:11:00.420Z",
    payload: {
      kind: "reason",
      md: "Need to find the existing support area to slot a new page next to it.",
    },
  },
  {
    v: "1.0.0",
    type: "scan",
    runId: SAMPLE_RUN_ID,
    seq: 2,
    ts: "2026-05-28T03:11:01.110Z",
    payload: {
      kind: "file",
      paths: [
        "apps/web/src/pages/support/index.tsx",
        "apps/web/src/pages/settings/index.tsx",
      ],
      snippet: "export default function SupportHome() {...}",
      bytesRead: 2811,
    },
  },
  {
    v: "1.0.0",
    type: "scan",
    runId: SAMPLE_RUN_ID,
    seq: 3,
    ts: "2026-05-28T03:11:01.900Z",
    payload: {
      kind: "registry",
      paths: ["dash/Button", "dash/FormField", "dash/PageHeader"],
      bytesRead: 4422,
    },
  },
  {
    v: "1.0.0",
    type: "decision",
    runId: SAMPLE_RUN_ID,
    seq: 4,
    ts: "2026-05-28T03:11:03.140Z",
    payload: {
      step: "pick-layout",
      node: "page.refund",
      candidates: [
        {
          name: "PageHeader+Form",
          score: 0.92,
          reason: "matches 4 sibling pages",
        },
        { name: "Modal", score: 0.31, reason: "prompt says 'page', not 'modal'" },
      ],
      picked: "PageHeader+Form",
      rationale:
        "Sibling pages use PageHeader+Form; prompt explicitly says page.",
      reversible: true,
    },
  },
  {
    v: "1.0.0",
    type: "cost",
    runId: SAMPLE_RUN_ID,
    seq: 5,
    ts: "2026-05-28T03:11:03.150Z",
    payload: {
      provider: "openai",
      model: "gpt-5",
      call: "completion",
      tokens_in: 2104,
      tokens_out: 312,
      usd: 0.018,
      cumulativeUsd: 0.018,
    },
  },
  {
    v: "1.0.0",
    type: "artifact",
    runId: SAMPLE_RUN_ID,
    seq: 6,
    ts: "2026-05-28T03:11:05.770Z",
    payload: {
      path: "apps/web/src/pages/support/refund.tsx",
      op: "create",
      diff: "+ import { PageHeader, FormField, Button } from '@dash/ui'...",
      loc: { added: 74, removed: 0 },
      language: "tsx",
      registryRef: "dash/PageHeader@1.4.0",
    },
  },
  {
    v: "1.0.0",
    type: "artifact",
    runId: SAMPLE_RUN_ID,
    seq: 7,
    ts: "2026-05-28T03:11:06.220Z",
    payload: {
      path: "apps/web/src/pages/settings/index.tsx",
      op: "edit",
      diff: "@@ ...\n+ <Link href='/support/refund'>Request refund</Link>",
      loc: { added: 1, removed: 0 },
      language: "tsx",
    },
  },
  {
    v: "1.0.0",
    type: "validate",
    runId: SAMPLE_RUN_ID,
    seq: 8,
    ts: "2026-05-28T03:11:11.500Z",
    payload: {
      checks: [
        { name: "tsc", status: "pass", durationMs: 3120 },
        { name: "eslint", status: "pass", durationMs: 840 },
        { name: "registry-conformance", status: "pass", durationMs: 210 },
      ],
      overall: "pass",
      scope: "package",
      target: "apps/web",
    },
  },
  {
    v: "1.0.0",
    type: "run.end",
    runId: SAMPLE_RUN_ID,
    seq: 9,
    ts: "2026-05-28T03:11:17.010Z",
    payload: {
      status: "success",
      durationMs: 17010,
      pr: {
        url: "https://github.com/dash/web/pull/812",
        number: 812,
        title: "feat(support): refund request page",
      },
      summary: {
        artifacts: 2,
        decisions: 1,
        validations: { pass: 1, fail: 0 },
        totalUsd: 0.018,
        totalTokens: 2416,
      },
    },
  },
];
