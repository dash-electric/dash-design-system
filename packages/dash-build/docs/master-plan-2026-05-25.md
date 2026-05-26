# Dash Build — Master Plan & End-to-End Journey

> Stempel waktu: 2026-05-25. Dokumen ini = single source-of-truth untuk tujuan, arsitektur 3-surface, dan flow end-to-end Dash Build internal platform. Setiap surface SELALU punya AI co-pilot — bukan 1 manusia handle semua.

---

## 1. Tujuan

**Visi**: Setiap Dash team member (PM, designer, ops, eng) bisa improve real Dash product surface lewat prompt natural, output langsung jadi production-ready PR yang aman, sekaligus design system terus berkembang otomatis dari pattern yang sering muncul.

**3 outcome user-visible**:

1. **Speed** — feature/UI change dari ide → preview real → PR dalam < 30 menit.
2. **Safety** — semua perubahan punya audit trail, validate vs design.md, tidak break main, tidak leak preview-mode hack ke production.
3. **Self-improving DS** — gap component yang sering muncul otomatis surface jadi DS candidate, owner review + promote ke registry, library makin lengkap tiap minggu.

**Non-goals**:
- Ganti GitHub sebagai source of truth.
- Generic SaaS builder (Lovable-clone).
- AI tanpa human checkpoint untuk push to main.

---

## 2. 3-Surface Architecture (high-level)

```mermaid
flowchart LR
    subgraph DBT["Dash Build Platform (internal, online)"]
        direction TB
        S1["🗂 Surface 1<br/>Documentation"]:::doc
        S2["🛠 Surface 2<br/>Generate Workspace"]:::builder
        S3["⚙ Surface 3<br/>Owner Dashboard"]:::owner

        S1 -. "DS gap surfaces" .-> S3
        S2 -. "branch + run events" .-> S3
        S3 -. "approved DS update" .-> S1
        S3 -. "merge gate" .-> S2
    end

    REPOS[("Real Dash repos<br/>backoffice, portal-v2, BE")]
    DS[("Dash DS registry<br/>@dash/cli, components, blocks")]
    PROD[("Production deploy<br/>via existing CI/CD")]

    S2 <--> REPOS
    S2 --> DS
    S1 --> DS
    S3 --> REPOS
    S3 --> PROD
    DS --> S2

    classDef doc fill:#eef,stroke:#88a
    classDef builder fill:#fef,stroke:#a8a
    classDef owner fill:#ffe,stroke:#aa8
```

Setiap surface punya target user berbeda + AI co-pilot mandiri.

---

## 3. Persona × Surface × AI Co-pilot

```mermaid
flowchart TB
    subgraph U[Users]
        PM[PM / Designer]
        ENG[Engineer]
        OPS[Ops / HR / Finance]
        DSM[DS Maintainer]
        OWN[Owner / Lead]
    end

    subgraph AGENTS["AI Co-pilots (Hermes orchestration)"]
        DocAI["📚 Docs Curator AI<br/>(gap detector,<br/>library indexer)"]
        BuildAI["✨ Build AI<br/>(skill chain + Codex,<br/>introspector, validator)"]
        OwnerAI["🎯 Owner Co-pilot<br/>(merge triage, conflict resolver,<br/>cost monitor, push safety)"]
    end

    PM --> S2
    ENG --> S2
    OPS --> S2
    DSM --> S1
    OWN --> S3

    S1 -.- DocAI
    S2 -.- BuildAI
    S3 -.- OwnerAI

    DocAI <--> OwnerAI
    BuildAI <--> OwnerAI
```

**Kunci**: Owner dashboard BUKAN 1 manusia manage 10 hal. Owner Co-pilot bantu triage, surface ANOMALY, kasih recommendation. Manusia approve/override saja.

---

## 4. End-to-End Journey (typical feature)

```mermaid
sequenceDiagram
    autonumber
    actor PM as PM/Designer
    participant S2 as Surface 2<br/>Generate Workspace
    participant BAI as Build AI
    participant CLONE as Clone Sandbox<br/>(~/dash-build-clones/)
    participant ORIG as Original Repo<br/>(backoffice)
    participant S3 as Surface 3<br/>Owner Dashboard
    participant OAI as Owner AI
    participant OWN as Owner
    participant PROD as Production

    PM->>S2: "Tambahin filter mitra by status di /provider"
    S2->>BAI: intake + clarification gate
    BAI->>BAI: PRD → design → TRD<br/>load: design.md, registry, real schema
    BAI->>S2: 1 clarification (single-choice)
    PM->>S2: answer
    BAI->>CLONE: generate file ke clone (real backoffice + preview-mode patch)
    CLONE-->>S2: preview iframe (clone running)
    PM->>S2: review preview ✓
    PM->>S2: click "Publish"
    S2->>ORIG: extract generated-only files<br/>(strip preview-mode patches)
    S2->>ORIG: create branch dash-build/<runId>
    S2->>S3: emit event "new branch + PR"

    Note over S3,OWN: Owner inbox receives signal
    OAI->>OAI: auto-review diff vs cardinal rules<br/>check overlap vs preview-shim<br/>scan cost API budget
    OAI->>OWN: triage card "ready / needs review / blocked"
    OWN->>S3: approve merge
    S3->>ORIG: merge to main
    ORIG->>PROD: existing CI deploy
    PROD-->>PM: feature live

    Note over BAI: parallel: if BuildAI saw new component pattern
    BAI->>OAI: emit DS candidate signal
    OAI->>S3: surface candidate in DS lane
    OWN->>S3: approve candidate
    S3->>S1: push to docs/registry review queue
    S1-->>DocAI: index update
```

**12 steps end-to-end, dari prompt → production + DS update.**

---

## 5. Surface Deep-Dive

### Surface 1 — Documentation

```mermaid
flowchart LR
    subgraph S1["📚 Surface 1 — Documentation"]
        direction TB
        DocList[Component & Block List]
        DocGap[DS Gap Inbox]
        DocPromote[Promote Queue]
        DocDetail[Per-component Doc Page]
    end

    DocAI -.->|index existing| DocList
    DocAI -.->|detect missing pattern| DocGap
    DocAI -.->|render new doc| DocDetail

    DocGap -->|surface to Owner| OwnerDashboard["Surface 3 Owner"]
    OwnerDashboard -->|approved promotion| DocPromote
    DocPromote -.->|publish| DocList
```

**Fungsi**:
- Browse semua component/block Dash DS dgn preview live
- Lihat usage stats (di repo mana, frekuensi pakai)
- Inbox DS gap (component yang Build AI detect missing tapi dibutuhkan)
- Promote queue (gap yang sudah ada candidate impl, tunggu review DS Maintainer)

**AI role**:
- Auto-index registry tiap commit
- Detect duplicate components across repos → suggest extract to shared
- Generate doc draft dari component code (props, usage example, state coverage)

---

### Surface 2 — Generate Workspace (yang sedang kita kerjakan)

```mermaid
flowchart LR
    subgraph S2["🛠 Surface 2 — Generate Workspace"]
        direction TB
        TopBar["TopBar<br/>project · tabs · route · auth"]
        Rail["Conversation Rail<br/>chat + composer"]
        Canvas["Canvas<br/>Preview / Code"]
    end

    Prompt[User Prompt] --> Rail
    Rail --> BuildAI
    BuildAI -->|generate| Clone[Clone Sandbox]
    Clone -->|iframe| Canvas
    BuildAI -->|file diff| Canvas
    BuildAI -->|stage signal| Rail
    Canvas -->|Publish| S3Inbox[Surface 3 Branch Queue]
```

**Yang sudah jadi** (status sekarang):
- ✓ Canvas-first IA (Lovable-aligned)
- ✓ Single topbar dgn project pill + tabs + route
- ✓ Rail conversation (light theme)
- ✓ Tab Preview/Code working
- ✓ Online URL preview (staging fallback)
- ✓ Layer A schema introspector (real models/enums/endpoints injected ke prompt)
- ✓ CSS audit script + spec doc Layer C

**Yang masih perlu** (next slices):
- Clone sandbox setup + preview-shim patch system
- Extract-and-publish flow (strip preview patches)
- Run history + thread switcher
- Repo switcher visible di topbar (BUG sekarang hidden)
- Compose toolbar enrichment (attach, mode)

---

### Surface 3 — Owner Dashboard (AI-assisted)

```mermaid
flowchart TB
    subgraph S3["⚙ Surface 3 — Owner Dashboard"]
        direction TB
        BranchQ[Branch Merge Queue]
        DSQ[DS Candidate Queue]
        Activity[Activity Log<br/>multi-user runs]
        Cost[Cost Monitor<br/>OpenAI/Codex usage]
        Health[Repo Health<br/>preview-shim drift, sync status]
        Audit[Audit Trail]
    end

    S2 -.->|"branch + diff"| BranchQ
    S2 -.->|"DS gap candidate"| DSQ
    S2 -.->|"API call usage"| Cost
    S2 -.->|"run events"| Activity

    OwnerAI -.->|"auto-review<br/>conflict detection<br/>cost spike alert"| BranchQ
    OwnerAI -.->|"rank by reusability"| DSQ
    OwnerAI -.->|"anomaly flag"| Activity
    OwnerAI -.->|"budget warning"| Cost
    OwnerAI -.->|"drift alarm"| Health

    BranchQ -->|approve| Main[main branch]
    DSQ -->|approve| S1Push[Surface 1 docs push]
    Main --> Prod[production deploy]
```

**Fungsi**:
- **Branch Merge Queue**: list semua branch `dash-build/*` lintas repo, dgn AI auto-review (cardinal rules, overlap conflict, preview-shim leak detection). Owner klik 1 button approve / request change / reject.
- **DS Candidate Queue**: pattern baru yang Build AI detect → AI rank by reusability + impact → owner approve naik ke Surface 1 docs.
- **Activity Log**: who built what, when, status. AI flag anomaly (run gagal terus, prompt vague, output ditolak berulang).
- **Cost Monitor**: OpenAI/Codex token + API call per user/project. AI alert budget spike.
- **Repo Health**: status preview-shim patch (apply OK, drift, conflict). AI auto-sync attempt + flag manual review kalau gagal.
- **Audit Trail**: semua perubahan + decision history.

**AI role (Owner Co-pilot)**:
- Triage incoming branch — kasih "green / yellow / red" recommendation
- Suggest merge order (dependency analysis)
- Auto-resolve simple conflicts (formatting, lockfile)
- Cost anomaly alert
- DS candidate ranking + dedup
- Activity anomaly detection

**Bukan**: 1 manusia stare 10 dashboard manual. AI handle 80% triage, manusia decide critical 20%.

---

## 6. Cross-Surface Signals

```mermaid
flowchart LR
    subgraph Signals[Event Bus]
        E1[run.created]
        E2[run.published]
        E3[ds.candidate.detected]
        E4[branch.review.required]
        E5[cost.threshold.breached]
        E6[preview.shim.drift]
        E7[ds.promoted]
    end

    S2 --> E1
    S2 --> E2
    S2 --> E3
    BuildAI --> E3

    E2 --> S3
    E3 --> S3
    E4 --> S3
    E5 --> S3
    E6 --> S3

    S3 --> E7
    E7 --> S1

    OwnerAI -.- E1
    OwnerAI -.- E4
    OwnerAI -.- E5
    OwnerAI -.- E6
    DocAI -.- E7
```

Semua surface komunikasi via event bus. Hermes orchestrate AI agent subscribe ke event yang relevan.

---

## 7. Phasing

```mermaid
gantt
    title Dash Build Phasing
    dateFormat YYYY-MM-DD
    section Foundation
    Surface 2 shell + IA (P1.0-P1.2)       :done, 2026-05-15, 11d
    Layer A schema introspector            :done, 2026-05-25, 1d
    CSS audit + Layer C spec               :done, 2026-05-25, 1d
    Online URL preview                     :done, 2026-05-25, 1d
    section Surface 2 Polish
    Clone sandbox + preview-shim system    :p1, 2026-05-26, 3d
    Repo switcher visible + history drawer :p1, after p1, 2d
    Composer toolbar enrichment            :p1, after p1, 2d
    Extract-and-publish flow               :p1, after p1, 3d
    section Surface 1 Build
    Component list + DS gap inbox          :s1, 2026-06-05, 5d
    Doc Curator AI integration             :s1, after s1, 3d
    section Surface 3 Build
    Branch Merge Queue + Owner AI triage   :s3, 2026-06-13, 5d
    Cost monitor + Activity log            :s3, after s3, 3d
    DS candidate lane + promote flow       :s3, after s3, 3d
    Hermes orchestration wire              :s3, after s3, 5d
    section Productionize
    Multi-user auth + RBAC                 :prod, 2026-07-05, 5d
    Internal beta launch                   :milestone, after prod, 1d
```

**Sequence logic**:
1. Surface 2 truthful preview FIRST (without itu, sisanya cuma teori)
2. Surface 1 builds on Surface 2 generation events (DS gap signals)
3. Surface 3 builds on Surface 1 + 2 event streams (merge queue, candidate inbox, activity)
4. Hermes wire = final layer

---

## 8. AI Agents Inventory

| Agent | Surface | Tugas | Status |
|---|---|---|---|
| **Skill Chain** | S2 | intake → PRD → design → TRD → Codex → validate | ✓ exists |
| **Schema Introspector** | S2 | parse Prisma/enums/endpoints/components → inject ke prompt | ✓ landed Layer A |
| **Repo Context Pack** | S2 | resolve repo/theme/route/nav | ✓ exists |
| **Clarification Engine** | S2 | gate vague prompts | ✓ exists |
| **Doc Curator AI** | S1 | index registry, detect gap, generate doc draft | 🔲 P2 |
| **Owner Co-pilot** | S3 | branch triage, conflict resolve, cost alert, anomaly flag | 🔲 P2 |
| **Hermes Orchestrator** | cross | route events to right AI, manage agent lifecycle | 🔲 P3 |
| **CSS Audit** | tooling | grep hex violations | ✓ landed |
| **Preview-shim Sync** | S2 ops | re-apply patch on backoffice main update, flag drift | 🔲 P1 |

---

## 9. Open Decisions (need answer sebelum lanjut)

| # | Decision | Options | Blocker untuk |
|---|---|---|---|
| OD-1 | Preview-mode delivery | (a) Clone-and-patch (Dash Build owns), (b) BE add `NEXT_PUBLIC_PREVIEW_MODE` env (BE collab) | Surface 2 P1 clone slice |
| OD-2 | API data source preview | (a) Staging API public reachable, (b) Mock data per route, (c) Recorded fixtures | Clone preview useful-ness |
| OD-3 | Hermes orchestration timing | (a) Build per-surface AI first, wire Hermes P3, (b) Wire Hermes early P1 | Agent isolation vs integration speed |
| OD-4 | DS candidate auto-promote | (a) Always manual approve, (b) Auto-promote if 3+ repos use similar pattern | DS evolution velocity |
| OD-5 | Multi-user identity | (a) Google SSO via Firebase (same as backoffice), (b) GitHub OAuth, (c) None — local-only forever | RBAC + cost attribution |
| OD-6 | Owner-AI override authority | (a) AI suggest only, owner always approve, (b) AI auto-merge trivial PRs (formatting, deps bump) | Owner workload reduction |
| OD-7 | Diff view priority | P1 or P2? | Code tab evolution |
| OD-8 | Theme toggle (dark mode) | P2 or never? | builder-shell-brief consistency |

---

## 10. Cara visualisasi

Dokumen ini punya 7 mermaid diagram. Cara render:

**Online (paling cepat)**:
- Paste ke https://mermaid.live/ (mermaid live editor) per block
- Lihat render real-time, export PNG/SVG

**Obsidian (local + persistent)**:
- Install Obsidian + plugin Mermaid (built-in di v1.0+)
- Buka file ini di vault → auto render
- Plus: pakai "Excalidraw" plugin untuk sketch ulang kalau perlu tweak

**GitHub (kalau commit)**:
- GitHub native render mermaid di markdown
- PR review = bisa visual

**Local CLI**:
- `npx @mermaid-js/mermaid-cli -i master-plan-2026-05-25.md -o diagrams/`

**Recommendation**: pakai Obsidian untuk iterasi (lo bisa edit + auto render side-by-side). Export PNG diagram penting untuk share ke stakeholder.

---

## 11. Next steps konkret

Per status saat ini:

1. **Konfirmasi OD-1** (preview-mode delivery): clone-and-patch atau BE env? Gua recommend clone-and-patch SOLO bisa start sekarang, plan migrate ke BE env saat collab buka.

2. **Konfirmasi OD-2** (API data): kalau staging API public reachable, lo paste sample endpoint test result → gua proceed dgn baseURL override ke staging. Kalau ga, plan mock data per route.

3. **Konfirmasi OD-5** (multi-user identity): kalau lo OK local-only forever sampai Hermes ready, skip auth integration di Surface 2 sekarang.

4. **Approve plan ini** → gua mulai slice P1.0 clone sandbox + preview-shim system besok pagi.

5. **Bookmark dokumen** ini di repo `packages/dash-build/docs/master-plan-2026-05-25.md`. Setiap slice future = update Phasing section + AI Agents Inventory + Open Decisions.

---

## Appendix — File-level kanonik

| Concern | Path |
|---|---|
| Master plan ini | `packages/dash-build/docs/master-plan-2026-05-25.md` |
| Builder shell spec (Layer C) | `packages/dash-build/docs/builder-shell-brief.md` |
| Product model | `packages/dash-build/docs/product-model.md` |
| gstack adoption | `packages/dash-build/docs/gstack-adoption.md` |
| Open Design reference | `packages/dash-build/docs/open-design-reference.md` |
| Design contract (root) | `design.md` |
| Cardinal rules | `apps/docs/registry/rules/dash-ai-rules.md` |
| 3-surface memory | `~/.claude/projects/-Users-irfanprimaputra-b/memory/project_dash_build_three_surface_architecture.md` |
