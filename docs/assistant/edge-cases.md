# Edge Cases and Extension Strategy

## Goal
Design v1 narrowly, but avoid architecture choices that force total rewrites later.

## 1. Source Changes
### Risk
Today the main meeting source is Google Meet aftermath. Later it may include:
- Slack huddles
- WhatsApp voice notes
- manual notes
- Teams/Zoom exports

### Rule
Use connector abstraction. Never bake Google Meet assumptions into core domain models.

## 2. Bad Transcript Quality
### Risk
Transcript may be:
- partial
- multilingual
- noisy
- speaker-unsure
- low-confidence

### Rule
Store raw + cleaned + quality flag. Surface uncertainty in outputs instead of faking confidence.

## 3. One Meeting, Many Topics
### Risk
A single meeting can affect Dash Build, dashboard, DS, and business priorities at once.

### Rule
Allow multiple decisions and multiple artifact outputs from a single meeting source.

## 4. Conflicting Documents
### Risk
New notes may conflict with older docs or DS rules.

### Rule
Track source links and surface conflicts explicitly. Do not silently overwrite truth.

## 5. Preference Drift
### Risk
Irfan’s design/business preferences can evolve.

### Rule
Memory items must support superseding and dating, not act like eternal truths.

## 6. Handoff Failure
### Risk
Generated Claude handoffs may be unused, revised, or abandoned.

### Rule
Track handoff lifecycle so the assistant can learn what actually worked.

## 7. Obsidian Noise
### Risk
If every raw artifact goes into the vault, the vault becomes cluttered.

### Rule
Sync curated outputs only. Keep raw/cache/runtime data outside Obsidian.

## 8. Multi-Project Future
### Risk
Today the assistant is Dash-only. Later other domains may be added.

### Rule
All core entities should support workspace/project identifiers from day one.

## 9. Multi-Role Future
### Risk
Today the role is senior Dash product operator. Later there may be a trading or Framer role.

### Rule
Use modular role prompts and role registry, not a single hardcoded persona.

## 10. Delivery Channel Expansion
### Risk
Later outputs may need to reach Telegram/Slack/WA.

### Rule
Keep delivery adapters separate from artifact generation.

## 11. Codebase Boundaries To Keep Stable
### Stable core
- entities
- storage contracts
- connector contracts
- artifact contracts
- memory contracts
- event contracts

### Flexible layer
- prompts
- templates
- UI layout
- retrieval heuristics

### Experimental layer
- live meeting
- proactive push behavior
- extra delivery channels
- advanced ranking

## 12. Non-Goals For v1
- full desktop app
- hosted SaaS architecture
- live call bot
- generic personal assistant platform
- multi-user support
- dozens of connectors
- auto-sending commands to Claude without review
