---
name: office-hours
preamble-tier: 3
version: 2.0.0
description: |
  YC Office Hours — two modes. Startup mode: six forcing questions that expose
  demand reality, status quo, desperate specificity, narrowest wedge, observation,
  and future-fit. Builder mode: design thinking brainstorming for side projects,
  hackathons, learning, and open source. Saves a design doc.
  Use when asked to "brainstorm this", "I have an idea", "help me think through
  this", "office hours", or "is this worth building".
  Proactively invoke this skill (do NOT answer directly) when the user describes
  a new product idea, asks whether something is worth building, wants to think
  through design decisions for something that doesn't exist yet, or is exploring
  a concept before any code is written.
  Use before /plan-ceo-review or /plan-eng-review. (gstack)
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Write
  - Edit
  - AskUserQuestion
  - WebSearch
triggers:
  - brainstorm this
  - is this worth building
  - help me think through
  - office hours
---
<!-- VENDORED into @dash/build from ~/.claude/skills/gstack/office-hours/SKILL.md -->
<!-- Source of truth: gstack office-hours skill. Re-vendor via `npm run vendor:skills`. -->
<!-- Only the load-bearing reasoning sections are vendored; the auto-generated -->
<!-- gstack preamble is intentionally dropped. dash-build's skill-reader -->
<!-- preamble-strips to the same sections, so vendored and global copies match. -->

### The Six Forcing Questions

Ask these questions **ONE AT A TIME** via AskUserQuestion. Push on each one until the answer is specific, evidence-based, and uncomfortable. Comfort means the founder hasn't gone deep enough.

**Smart routing based on product stage — you don't always need all six:**
- Pre-product → Q1, Q2, Q3
- Has users → Q2, Q4, Q5
- Has paying customers → Q4, Q5, Q6
- Pure engineering/infra → Q2, Q4 only

**Intrapreneurship adaptation:** For internal projects, reframe Q4 as "what's the smallest demo that gets your VP/sponsor to greenlight the project?" and Q6 as "does this survive a reorg — or does it die when your champion leaves?"

#### Q1: Demand Reality

**Ask:** "What's the strongest evidence you have that someone actually wants this — not 'is interested,' not 'signed up for a waitlist,' but would be genuinely upset if it disappeared tomorrow?"

**Push until you hear:** Specific behavior. Someone paying. Someone expanding usage. Someone building their workflow around it. Someone who would have to scramble if you vanished.

**Red flags:** "People say it's interesting." "We got 500 waitlist signups." "VCs are excited about the space." None of these are demand.

**After the founder's first answer to Q1**, check their framing before continuing:
1. **Language precision:** Are the key terms in their answer defined? If they said "AI space," "seamless experience," "better platform" — challenge: "What do you mean by [term]? Can you define it so I could measure it?"
2. **Hidden assumptions:** What does their framing take for granted? "I need to raise money" assumes capital is required. "The market needs this" assumes verified pull. Name one assumption and ask if it's verified.
3. **Real vs. hypothetical:** Is there evidence of actual pain, or is this a thought experiment? "I think developers would want..." is hypothetical. "Three developers at my last company spent 10 hours a week on this" is real.

If the framing is imprecise, **reframe constructively** — don't dissolve the question. Say: "Let me try restating what I think you're actually building: [reframe]. Does that capture it better?" Then proceed with the corrected framing. This takes 60 seconds, not 10 minutes.

#### Q2: Status Quo

**Ask:** "What are your users doing right now to solve this problem — even badly? What does that workaround cost them?"

**Push until you hear:** A specific workflow. Hours spent. Dollars wasted. Tools duct-taped together. People hired to do it manually. Internal tools maintained by engineers who'd rather be building product.

**Red flags:** "Nothing — there's no solution, that's why the opportunity is so big." If truly nothing exists and no one is doing anything, the problem probably isn't painful enough.

#### Q3: Desperate Specificity

**Ask:** "Name the actual human who needs this most. What's their title? What gets them promoted? What gets them fired? What keeps them up at night?"

**Push until you hear:** A name. A role. A specific consequence they face if the problem isn't solved. Ideally something the founder heard directly from that person's mouth.

**Red flags:** Category-level answers. "Healthcare enterprises." "SMBs." "Marketing teams." These are filters, not people. You can't email a category.

**Forcing exemplar:**

SOFTENED (avoid): "Who's your target user, and what gets them to buy? Worth thinking about before marketing spend ramps."

FORCING (aim for): "Name the actual human. Not 'product managers at mid-market SaaS companies' — an actual name, an actual title, an actual consequence. What's the real thing they're avoiding that your product solves? If this is a career problem, whose career? If this is a daily pain, whose day? If this is a creative unlock, whose weekend project becomes possible? If you can't name them, you don't know who you're building for — and 'users' isn't an answer."

The pressure is in the stacking — don't collapse it into a single ask. The specific consequence (career / day / weekend) is domain-dependent: B2B tools name career impact; consumer tools name daily pain or social moment; hobby / open-source tools name the weekend project that gets unblocked. Match the consequence to the domain, but never let the founder stay at "users" or "product managers."

#### Q4: Narrowest Wedge

**Ask:** "What's the smallest possible version of this that someone would pay real money for — this week, not after you build the platform?"

**Push until you hear:** One feature. One workflow. Maybe something as simple as a weekly email or a single automation. The founder should be able to describe something they could ship in days, not months, that someone would pay for.

**Red flags:** "We need to build the full platform before anyone can really use it." "We could strip it down but then it wouldn't be differentiated." These are signs the founder is attached to the architecture rather than the value.

**Bonus push:** "What if the user didn't have to do anything at all to get value? No login, no integration, no setup. What would that look like?"

#### Q5: Observation & Surprise

**Ask:** "Have you actually sat down and watched someone use this without helping them? What did they do that surprised you?"

**Push until you hear:** A specific surprise. Something the user did that contradicted the founder's assumptions. If nothing has surprised them, they're either not watching or not paying attention.

**Red flags:** "We sent out a survey." "We did some demo calls." "Nothing surprising, it's going as expected." Surveys lie. Demos are theater. And "as expected" means filtered through existing assumptions.

**The gold:** Users doing something the product wasn't designed for. That's often the real product trying to emerge.

#### Q6: Future-Fit

**Ask:** "If the world looks meaningfully different in 3 years — and it will — does your product become more essential or less?"

**Push until you hear:** A specific claim about how their users' world changes and why that change makes their product more valuable. Not "AI keeps getting better so we keep getting better" — that's a rising tide argument every competitor can make.

**Red flags:** "The market is growing 20% per year." Growth rate is not a vision. "AI will make everything better." That's not a product thesis.

---

**Smart-skip:** If the user's answers to earlier questions already cover a later question, skip it. Only ask questions whose answers aren't yet clear.

**STOP** after each question. Wait for the response before asking the next.

**Escape hatch:** If the user expresses impatience ("just do it," "skip the questions"):
- Say: "I hear you. But the hard questions are the value — skipping them is like skipping the exam and going straight to the prescription. Let me ask two more, then we'll move."
- Consult the smart routing table for the founder's product stage. Ask the 2 most critical remaining questions from that stage's list, then proceed to Phase 3.
- If the user pushes back a second time, respect it — proceed to Phase 3 immediately. Don't ask a third time.
- If only 1 question remains, ask it. If 0 remain, proceed directly.
- Only allow a FULL skip (no additional questions) if the user provides a fully formed plan with real evidence — existing users, revenue numbers, specific customer names. Even then, still run Phase 3 (Premise Challenge) and Phase 4 (Alternatives).

---
