/**
 * Faux Anthropic client for integration tests.
 *
 * Returns a canned response that satisfies the skill-chain's response-parser
 * contract — one tsx file with a trivial named export. Honors the scripted
 * `scenario` parameter so a single test file can flip behavior per case.
 */

export type MockScenario =
  | "success" // returns a clean file
  | "clarify" // signals clarification needed
  | "fail" // throws

export interface MockAnthropicOptions {
  scenario?: MockScenario
  delayMs?: number
}

export interface MockMessageResponse {
  content: Array<{ type: "text"; text: string }>
  stop_reason: string
}

export class MockAnthropic {
  scenario: MockScenario
  delayMs: number
  calls: number = 0

  constructor(opts: MockAnthropicOptions = {}) {
    this.scenario = opts.scenario ?? "success"
    this.delayMs = opts.delayMs ?? 0
  }

  messages = {
    create: async (): Promise<MockMessageResponse> => {
      this.calls += 1
      if (this.delayMs > 0) {
        await new Promise((r) => setTimeout(r, this.delayMs))
      }
      if (this.scenario === "fail") {
        throw new Error("mock_anthropic_failure")
      }
      if (this.scenario === "clarify") {
        return {
          content: [
            {
              type: "text",
              text: "CLARIFY: Which mitra level should the chart group by? Lvl 1 only, all levels, or per region?",
            },
          ],
          stop_reason: "end_turn",
        }
      }
      return {
        content: [
          {
            type: "text",
            text: [
              "```tsx",
              '// File: src/components/payroll-chart.tsx',
              "export function PayrollChart() {",
              '  return <div className="db-card">Payroll chart</div>',
              "}",
              "```",
              "",
              "Adds a payroll chart component grouped by mitra Lvl.",
            ].join("\n"),
          },
        ],
        stop_reason: "end_turn",
      }
    },
  }
}
