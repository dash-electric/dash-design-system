# Architecture — Dash Solo Designer Operating Assistant

## 1. System Overview

The assistant has 4 major layers:

1. **Collectors**
   - ingest docs, notes, transcripts, optional audio/transcript exports
2. **Context Brain**
   - normalize, link, tag, cache, and retrieve relevant context
3. **Operator Brain**
   - senior/staff-level reasoning across design, product, business, and execution
4. **Artifact + Delivery Layer**
   - generate outputs, save them locally, sync curated results, and prepare handoffs

## 2. Main Runtime Flow

### Event-driven pipeline
1. source changes or new source arrives
2. source connector discovers item
3. item is normalized into internal records
4. pipeline determines what downstream processing is needed
5. artifact(s) are generated if required
6. output is saved and surfaced in UI
7. user approves/revises/rejects
8. memory updates

This is **event-driven**, not always-on reasoning.

## 3. Core Domain Entities

### SourceRecord
Represents an ingested source item.

Suggested fields:
- `id`
- `sourceType` (`google_meet_transcript`, `obsidian_note`, `dash_doc`, `repo_summary`, etc.)
- `externalPath`
- `title`
- `workspaceId`
- `projectId`
- `createdAt`
- `updatedAt`
- `hash`
- `status`
- `metadataJson`

### ContextItem
Normalized context extracted from sources.

Suggested fields:
- `id`
- `kind` (`document`, `design_rule`, `meeting`, `decision_candidate`, `note`, `repo_summary`)
- `title`
- `contentMd`
- `contentJson`
- `tags`
- `sourceRecordId`
- `qualityScore`

### Artifact
Generated output the user can consume.

Suggested fields:
- `id`
- `type` (`meeting_summary`, `decision_brief`, `claude_handoff`, `critique_report`, `prioritization_note`)
- `title`
- `contentMd`
- `contentJson`
- `status` (`draft`, `approved`, `revised`, `abandoned`)
- `sourceRefs`
- `contextRefs`
- `createdAt`

### MemoryItem
Persistent working judgment / rules.

Suggested fields:
- `id`
- `memoryType` (`decision`, `preference`, `heuristic`, `anti_pattern`, `business_rule`)
- `scope` (`global`, `dash`, `dash-ds`, `dash-build`, `dashboard`)
- `title`
- `contentMd`
- `status` (`active`, `superseded`, `deprecated`)
- `validFrom`
- `supersedesMemoryId`
- `confidence`

### RunRecord
A processing run for observability.

Suggested fields:
- `id`
- `pipelineType`
- `triggerType`
- `status`
- `startedAt`
- `completedAt`
- `inputRefs`
- `outputRefs`
- `errorSummary`

## 4. Connectors

Connectors must be replaceable. Do not hardcode source-specific logic into the core.

### v1 connectors
- `google-meet-transcript`
- `obsidian-notes`
- `local-markdown-folder`
- `dash-docs-folder`
- `repo-summary-folder` (optional)

### Connector contract
Each connector should support:
- discover new items
- read source content
- normalize into SourceRecord + ContextItem(s)
- report sync status/errors

## 5. Operator Brain Composition

Do **not** use one giant prompt blob.

Use modular prompt sections:
- `identity.md`
- `dash-context.md`
- `design-lens.md`
- `product-lens.md`
- `business-lens.md`
- `revenue-lens.md`
- `execution-lens.md`
- `meeting-processor.md`
- `handoff-generator.md`

This makes future role extension possible without rewriting everything.

## 6. Storage Model

### Filesystem
Use local files for transparency and portability.

Suggested tree:

```txt
assistant-data/
  artifacts/
    meetings/
    decisions/
    handoffs/
    critiques/
  prompts/
  exports/
  cache/
```

### Database
Use SQLite or equivalent local DB for:
- indexing
- links
- memory retrieval
- processing run logs
- source state
- artifact state

### Obsidian sync
Curated outputs only:
- approved decision briefs
- approved strategic notes
- selected critiques / summaries

Do not dump raw transcripts or noisy cache into vault.

## 7. UI Surfaces

The UI is a **local web app** with 7 main surfaces:
- Home / Inbox
- Meetings
- Context
- Artifacts
- Memory
- Claude Handoff
- Settings / Connections

Full breakdown lives in `ui-surfaces.md`.

## 8. Voice / Transcript Strategy

### v1 default
Prefer transcript-first ingestion:
- Google Meet transcript exports
- local transcript files
- typed notes

### optional v1.5
Add local STT with `faster-whisper` or equivalent for audio files dropped into watched folders.

### not v1
Live meeting companion.

## 9. Delivery Strategy

The assistant generates artifacts first, then delivers them.

### v1 delivery modes
- local UI
- markdown/json files
- curated Obsidian export

### later delivery modes
- Telegram digest
- Slack summary
- WhatsApp summary

Keep delivery adapters separate from artifact generation.

## 10. LLM Boundaries

### Deterministic / non-LLM
- source watching
- parsing metadata
- hashing/diffing
- indexing
- state tracking
- cache reads/writes
- artifact persistence

### LLM-driven
- meeting decision extraction
- strategic implication synthesis
- prioritization reasoning
- critique
- Claude handoff generation
- memory candidate synthesis

## 11. First-End-to-End Flow to Build

### Meeting aftermath flow
1. transcript file appears in watched location
2. connector normalizes it into meeting source/context
3. meeting processor creates:
   - summary
   - decision brief
   - unresolved questions
4. context builder pulls relevant Dash docs/DS rules/notes
5. operator brain adds product/business/design priority reasoning
6. Claude handoff pack is generated if needed
7. artifacts saved to files + DB
8. UI inbox updates
9. user approves/revises/rejects
10. memory updates

## 12. Extension Strategy

The codebase must allow later addition of:
- more sources
- more projects
- more roles
- more artifact types
- more delivery channels

How we avoid rewrites:
- typed entities
- connector abstraction
- modular prompts
- event-driven pipelines
- artifact abstraction
- delivery adapters
