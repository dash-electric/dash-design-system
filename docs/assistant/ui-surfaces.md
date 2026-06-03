# UI Surfaces — Dash Solo Designer Operating Assistant

## 1. Home / Inbox
Primary daily operating surface.

### Shows
- newly processed meetings
- pending decision briefs
- ready Claude handoffs
- unresolved risks
- stale-context warnings
- recommended next actions

### Why it exists
The user should be able to open one page and immediately understand what changed and what matters.

## 2. Meetings
Meeting aftermath workspace.

### Per meeting
- title
- source
- transcript / source link
- summary
- decision brief
- unresolved questions
- product/business/design implications
- linked artifacts
- status

### Actions
- approve
- revise
- mark important
- generate or refresh Claude handoff
- save selected conclusions to memory

## 3. Context
Transparency surface for source-of-truth inspection.

### Shows
- Dash docs ingested
- DS docs ingested
- notes ingested
- repo summaries ingested
- last sync status
- changed recently
- which artifacts used which context

### Why it exists
User should be able to inspect what the assistant knows and where it came from.

## 4. Artifacts
Warehouse of generated outputs.

### Artifact types
- meeting summary
- decision brief
- prioritization note
- critique report
- Claude handoff
- weekly digest
- DS gap note

### Per artifact
- status
- sources used
- context used
- created time
- last updated
- approval state

## 5. Memory
Visible working memory and judgment store.

### Shows
- approved decisions
- rejected directions
- design heuristics
- business heuristics
- anti-patterns
- Dash-specific strategic rules

### Why it exists
The assistant’s "brain" must be inspectable and editable, not hidden magic.

## 6. Claude Handoff
Execution-support surface.

### Shows
- prompt pack title
- objective
- why it matters
- included context
- constraints
- desired output
- export path
- status (`draft`, `used`, `revised`, `abandoned`)

### Actions
- copy prompt
- export markdown pack
- mark used
- attach result notes

## 7. Settings / Connections
Configuration for sources and behavior.

### Includes
- source paths
- connector enable/disable
- transcript handling rules
- Obsidian export settings
- LLM provider settings
- artifact generation defaults
- local processing options

## 8. UX Principles
The UI should feel:
- dense but readable
- operational, not playful
- transparent, not mystical
- optimized for triage and follow-through

The UI is not a chat-first toy. It is a **control panel for judgment + artifacts**.
