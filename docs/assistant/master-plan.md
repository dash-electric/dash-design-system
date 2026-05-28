# Master Plan — Dash Solo Designer Operating Assistant

> Objective: build a local-first assistant that reduces solo-designer load at Dash by automatically ingesting work context, processing meeting aftermath, generating strategic/product/design artifacts, and preparing execution handoffs.

## 1. North Star

Build an assistant that can outperform **Irfan-now** on:
- consistency
- recall
- prioritization discipline
- context stitching across docs/meetings/build outputs
- handoff quality to Claude / Dash Build

It should think like a **senior/staff-level product design operator**, not a junior UI copilot.

That means every important output should consider:
- design quality
- product intent
- business implications
- leverage / priority
- revenue or growth implications when relevant
- execution constraints

## 2. Problem This Solves

Current solo-designer pain at Dash:
- meeting decisions get fragmented
- context lives across docs, notes, transcripts, and repo artifacts
- manual synthesis is expensive
- handoffs to Claude/Build lose business and product nuance
- fatigue causes drops in prioritization quality and recall

The assistant exists to become a second operating layer, not a fancy chatbot.

## 3. Product Shape

The product is a **local-first web application** with background processing.

### It must:
1. ingest Dash docs, DS docs, notes, and meeting artifacts automatically
2. normalize those into structured context
3. generate useful artifacts from new events
4. store approved/rejected decisions into memory
5. prepare Claude-ready context packs and prompts
6. remain transparent: user can inspect sources, reasoning basis, and outputs

### It must not:
- depend on constant manual context pasting
- act like a generic personal AI companion
- require a full hosted backend for v1
- start with live-meeting bot complexity
- overfit to one giant hardcoded prompt

## 4. Core Inputs

### P0 inputs
- Dash docs
- Dash design system docs
- Obsidian working notes
- Google Meet transcript exports / notes / local transcript files
- optional local voice-note transcript files

### P1 inputs
- repo summaries
- Dash Build artifacts
- QA / PRD / TRD outputs

### P2 inputs
- calendar metadata
- direct meeting platform integrations
- other domain sources outside Dash

## 5. Core Outputs

### P0 outputs
1. **Decision Brief**
   - what changed
   - why it matters
   - business / product / design implications
   - recommended priority
   - risks / open questions

2. **Claude Handoff Pack**
   - objective
   - business context
   - relevant docs / decisions / constraints
   - implementation request
   - what to avoid

3. **Next Actions**
   - P0 / P1 / P2 suggestions
   - unresolved blockers
   - recommended follow-up

### P1 outputs
- critique report
- DS conflict note
- weekly digest
- stale-context warning

## 6. Usage Model

### Daily flow
- source files change or new meeting transcript arrives
- assistant detects event automatically
- assistant processes event into artifacts
- assistant surfaces result in local inbox
- user reviews / approves / revises
- approved learnings update memory
- Claude handoff can be copied/exported immediately

### Meeting flow
- transcript or notes land in watched source
- assistant generates meeting summary + decision brief
- assistant links implications to Dash context
- assistant prepares follow-up prompt/context pack for execution

## 7. Milestones

## M1 — Automation Spine
### Goal
Assistant can see work without manual pasting.

### Deliver
- source watchers
- ingestion registry
- file hashing / diff tracking
- normalized source records
- processing run logs

### Success
New files and updates are discovered, tracked, and queryable.

---

## M2 — Meeting Aftermath Brain
### Goal
Assistant becomes useful immediately after meetings.

### Deliver
- transcript ingestion
- meeting normalization
- summary generation
- decision extraction
- unresolved questions
- implication extraction

### Success
A meeting artifact appears automatically with meaningful structure.

---

## M3 — Dash Context Brain
### Goal
Assistant becomes Dash-specific instead of summary-generic.

### Deliver
- docs ingestion
- DS rules ingestion
- notes ingestion
- context tagging and linking
- context-pack builder

### Success
For a meeting/task, assistant can fetch relevant Dash context automatically.

---

## M4 — Senior Product Operator Brain
### Goal
Outputs reflect senior/staff-level reasoning.

### Deliver
- role modules for:
  - design lens
  - product lens
  - business lens
  - revenue/leverage lens
  - execution lens
- structured output templates

### Success
Outputs are not merely descriptive; they prioritize and challenge.

---

## M5 — Claude / Build Handoff
### Goal
Assistant supports execution, not just reflection.

### Deliver
- Claude prompt pack generation
- context export files
- constraints + objective inclusion
- prompt history/status

### Success
User can move from processed context to execution handoff with minimal manual work.

---

## M6 — Memory Loop
### Goal
Assistant improves over time and gets closer to Irfan’s working judgment.

### Deliver
- approve/reject/revise loop
- decision memory
- preference memory
- anti-pattern memory
- retrieval into future outputs

### Success
Repeated patterns improve; prior decisions are consistently reused.

---

## M7 — Daily Surface
### Goal
Make the assistant comfortable to use as an operating tool.

### Deliver
- Inbox
- Meetings
- Context
- Artifacts
- Memory
- Claude Handoff
- Settings

### Success
The assistant can be opened daily as a control surface.

---

## M8 — Proactive Layer
### Goal
Assistant starts feeling alive, not just reactive.

### Deliver
- daily digest
- stale decision warnings
- DS conflict alerts
- suggested next actions

### Success
Assistant nudges strategically without becoming noisy.

## 8. Cost Discipline

### Non-LLM by default
Use deterministic/local logic for:
- file watching
- metadata parsing
- diffing
- indexing
- linking
- caching
- run tracking
- storage

### LLM only where it matters
Use LLM for:
- decision extraction
- strategic synthesis
- business/product/design implications
- prioritization
- critique
- Claude handoff generation

### Cost rules
- small context packs only
- cache summaries aggressively
- reprocess only on change
- tier models if needed (cheap routing, stronger reasoning)

## 9. Storage Strategy

### Raw sources stay at source
- docs stay in repo/vault
- transcripts stay in local source folders
- audio stays local

### Assistant storage
- local DB index for records/links/status/cache/memory
- local file artifacts for transparency and portability
- curated outputs optionally synced into Obsidian

### Commit policy
Commit:
- plans/docs
- prompt modules
- schemas
- example artifacts (curated)

Do not commit:
- raw transcripts
- caches
- live DB
- secrets
- large audio

## 10. Success Criteria

The system is successful when:
1. Irfan no longer needs to manually repaste core Dash context repeatedly
2. a new meeting reliably produces usable artifacts with minimal manual touch
3. Claude handoffs carry enough product/business context to reduce execution drift
4. the assistant catches conflicts, stale assumptions, or priority mistakes that Irfan might miss while overloaded
5. outputs become visibly more aligned over time via memory

## 11. Default v1 Build Decisions
- product form: **local web app**
- scope: **Dash only**
- source priority: **Google Meet aftermath first**
- storage: **local files + Obsidian curated output + DB index**
- handoff: **context pack + prompt file, not direct auto-send**
- role level: **senior/staff product design + business + revenue lens**

## 12. What to Read Next
- `architecture.md`
- `ui-surfaces.md`
- `edge-cases.md`
