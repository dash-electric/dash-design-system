import type { Octokit } from "@octokit/rest"
import { GitHubAppClient, splitFullName, type RepoSummary } from "./client.js"

/**
 * Fetch the list of repositories accessible to the installed App.
 * Convenience wrapper around `client.listRepos()`.
 */
export async function listAccessibleRepos(client: GitHubAppClient): Promise<RepoSummary[]> {
  return client.listRepos()
}

export type GetFileOptions = {
  octokit: Octokit
  owner: string
  repo: string
  path: string
  ref?: string
}

export type FileResult = {
  content: string
  sha: string
  encoding: "utf-8"
}

/**
 * Fetch a file at `path` on the given ref. Decodes base64 content from the
 * GitHub contents API into a UTF-8 string. Throws if the path is a directory.
 */
export async function getFile(opts: GetFileOptions): Promise<FileResult> {
  const { data } = await opts.octokit.rest.repos.getContent({
    owner: opts.owner,
    repo: opts.repo,
    path: opts.path,
    ref: opts.ref,
  })
  if (Array.isArray(data)) {
    throw new Error(`Path "${opts.path}" is a directory, not a file`)
  }
  if (data.type !== "file" || typeof data.content !== "string") {
    throw new Error(`Path "${opts.path}" is not a regular file (type=${data.type})`)
  }
  const content = Buffer.from(data.content, "base64").toString("utf8")
  return { content, sha: data.sha, encoding: "utf-8" }
}

export type CreateBranchOptions = {
  octokit: Octokit
  owner: string
  repo: string
  baseBranch: string
  newBranch: string
  /** If true, do not throw when branch already exists. */
  allowExisting?: boolean
}

/**
 * Create a new branch by reading the SHA of `baseBranch` and posting a new
 * git ref. When `allowExisting` is true, a 422 "already exists" response is
 * swallowed.
 */
export async function createBranch(opts: CreateBranchOptions): Promise<{ sha: string }> {
  const baseRef = await opts.octokit.rest.git.getRef({
    owner: opts.owner,
    repo: opts.repo,
    ref: `heads/${opts.baseBranch}`,
  })
  const sha = baseRef.data.object.sha
  try {
    await opts.octokit.rest.git.createRef({
      owner: opts.owner,
      repo: opts.repo,
      ref: `refs/heads/${opts.newBranch}`,
      sha,
    })
  } catch (err: unknown) {
    if (opts.allowExisting && isRefExistsError(err)) {
      return { sha }
    }
    throw err
  }
  return { sha }
}

function isRefExistsError(err: unknown): boolean {
  const e = err as { status?: number; message?: string }
  return e?.status === 422 && typeof e.message === "string" && /already exists/i.test(e.message)
}

export type CommitFile = {
  path: string
  content: string
  /** SHA of the previous blob — optional, only used to detect drift on retries. */
  sha?: string
}

export type CommitFilesOptions = {
  octokit: Octokit
  owner: string
  repo: string
  branch: string
  message: string
  files: CommitFile[]
}

/**
 * Create a single commit on `branch` containing all `files`.
 *
 * Uses the low-level git data API (blobs + trees + commits + update-ref)
 * rather than the contents API so we can write multiple files atomically.
 */
export async function commitFiles(
  opts: CommitFilesOptions,
): Promise<{ commitSha: string; treeSha: string }> {
  if (opts.files.length === 0) {
    throw new Error("commitFiles: files must be non-empty")
  }
  const { octokit, owner, repo, branch, message, files } = opts

  // 1. Resolve current branch tip.
  const ref = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` })
  const parentSha = ref.data.object.sha

  const parentCommit = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: parentSha,
  })

  // 2. Upload each file as a blob.
  const blobs = await Promise.all(
    files.map(async (file) => {
      const blob = await octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(file.content, "utf8").toString("base64"),
        encoding: "base64",
      })
      return { path: file.path, sha: blob.data.sha }
    }),
  )

  // 3. Build tree.
  const tree = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: parentCommit.data.tree.sha,
    tree: blobs.map((b) => ({
      path: b.path,
      mode: "100644",
      type: "blob",
      sha: b.sha,
    })),
  })

  // 4. Create commit.
  const commit = await octokit.rest.git.createCommit({
    owner,
    repo,
    message,
    tree: tree.data.sha,
    parents: [parentSha],
  })

  // 5. Move branch ref.
  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: commit.data.sha,
  })

  return { commitSha: commit.data.sha, treeSha: tree.data.sha }
}

export type CreatePullRequestOptions = {
  octokit: Octokit
  owner: string
  repo: string
  base: string
  head: string
  title: string
  body: string
  /** If true, open as a draft PR. */
  draft?: boolean
}

export async function createPullRequest(
  opts: CreatePullRequestOptions,
): Promise<{ prNumber: number; prUrl: string }> {
  const { data } = await opts.octokit.rest.pulls.create({
    owner: opts.owner,
    repo: opts.repo,
    base: opts.base,
    head: opts.head,
    title: opts.title,
    body: opts.body,
    draft: opts.draft ?? false,
  })
  return { prNumber: data.number, prUrl: data.html_url }
}

/**
 * Convenience: createBranch + commitFiles + createPullRequest in one call.
 * Day 2 (Agent H) will use this for the end-to-end "completion → PR" flow.
 */
export type SubmitChangesOptions = {
  client: GitHubAppClient
  fullName: string
  baseBranch: string
  newBranch: string
  files: CommitFile[]
  commitMessage: string
  prTitle: string
  prBody: string
  draft?: boolean
}

export type SubmitChangesResult = {
  prNumber: number
  prUrl: string
  commitSha: string
  branch: string
}

export async function submitChanges(
  opts: SubmitChangesOptions,
): Promise<SubmitChangesResult> {
  const [owner, repo] = splitFullName(opts.fullName)
  const octokit = await opts.client.getOctokitForRepo(opts.fullName)

  await createBranch({
    octokit,
    owner,
    repo,
    baseBranch: opts.baseBranch,
    newBranch: opts.newBranch,
    allowExisting: true,
  })

  const { commitSha } = await commitFiles({
    octokit,
    owner,
    repo,
    branch: opts.newBranch,
    message: opts.commitMessage,
    files: opts.files,
  })

  const { prNumber, prUrl } = await createPullRequest({
    octokit,
    owner,
    repo,
    base: opts.baseBranch,
    head: opts.newBranch,
    title: opts.prTitle,
    body: opts.prBody,
    draft: opts.draft,
  })

  return { prNumber, prUrl, commitSha, branch: opts.newBranch }
}
