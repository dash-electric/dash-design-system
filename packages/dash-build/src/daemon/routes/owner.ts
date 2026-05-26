import type { ServerResponse } from "node:http"
import type { Store } from "../state/store.js"
import { renderOwnerDashboard } from "../templates/owner-dashboard.js"
import { sendHtml } from "./_helpers.js"
import {
  buildOwnerActivityRows,
  buildOwnerBranchRows,
  buildOwnerCostFixture,
  buildOwnerDsCandidatesFixture,
} from "./api/owner.js"

/**
 * GET /owner — Surface 3 (Sprint 3A).
 *
 * Renders the read-mostly Owner Dashboard. All payloads are produced by
 * `routes/api/owner.ts` so the same data contract powers both server-side
 * render and the JSON `/api/owner/*` endpoints.
 *
 * Sprint 3B will layer Owner AI triage on top — for now this is a pure
 * read view backed by Store + small mock fixtures.
 */
export async function handleOwner(
  res: ServerResponse,
  store: Store,
): Promise<void> {
  const auth = store.getAuth()
  const [branches, activity] = await Promise.all([
    buildOwnerBranchRows(store),
    Promise.resolve(buildOwnerActivityRows(store, 100)),
  ])
  const cost = buildOwnerCostFixture()
  const dsCandidates = buildOwnerDsCandidatesFixture()

  sendHtml(
    res,
    200,
    renderOwnerDashboard(store, {
      data: { branches, activity, cost, dsCandidates },
      openAIConnected: auth.openai.connected,
      openAIUser: auth.openai.user ?? null,
      githubConnected: auth.github.connected,
      githubRepoCount: auth.github.repos.length,
    }),
  )
}
