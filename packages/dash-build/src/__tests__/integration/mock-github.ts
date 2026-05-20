/**
 * Faux Octokit/GitHub App client. Returns a canned PR URL on submitChanges.
 * Records calls for assertion.
 */

export interface MockSubmitInput {
  repo: string
  branch: string
  title: string
  body: string
  files: Array<{ path: string; content: string }>
}

export interface MockSubmitResult {
  prUrl: string
  prNumber: number
}

export class MockGithub {
  shouldFail: boolean
  calls: MockSubmitInput[] = []

  constructor(opts: { shouldFail?: boolean } = {}) {
    this.shouldFail = opts.shouldFail ?? false
  }

  async submitChanges(input: MockSubmitInput): Promise<MockSubmitResult> {
    this.calls.push(input)
    if (this.shouldFail) {
      throw new Error("mock_github_pr_create_failed")
    }
    const n = 1000 + this.calls.length
    return {
      prUrl: `https://github.com/${input.repo}/pull/${n}`,
      prNumber: n,
    }
  }

  async listRepos(): Promise<Array<{ full_name: string }>> {
    return [
      { full_name: "dash/halo-dash-fe" },
      { full_name: "dash/portal-v2" },
      { full_name: "dash/backoffice" },
    ]
  }
}
