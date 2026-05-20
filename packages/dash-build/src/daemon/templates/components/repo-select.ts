import { escapeHtml } from "../layout.js"

export interface Repo {
  full_name: string
}

export interface RepoSelectOptions {
  repos: Repo[]
  active: string | null
  disabled?: boolean
}

export function renderRepoSelect(opts: RepoSelectOptions): string {
  const disabled = opts.disabled ? " disabled" : ""
  if (opts.repos.length === 0) {
    return `<select id="db-repo-select" class="db-select db-select-empty" disabled aria-label="Target repository">
      <option>No repos connected</option>
    </select>`
  }
  const options = opts.repos
    .map((r) => {
      const selected = r.full_name === opts.active ? " selected" : ""
      return `<option value="${escapeHtml(r.full_name)}"${selected}>${escapeHtml(r.full_name)}</option>`
    })
    .join("")
  return `<select id="db-repo-select" class="db-select" aria-label="Target repository"${disabled}>
    ${options}
  </select>`
}
