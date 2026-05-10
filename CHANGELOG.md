# Changelog

> **Single source of truth:** AGENT.md is the only active instruction set for this project.
> This changelog is a historical record only. Nothing here overrides AGENT.md.

## v2.1.0 -- 2026-05-10 02:55 UTC [Claude]

### Phase 3 begins: schema formalized, Next.js scaffold committed

This session opened as EXPLORE and pivoted to BUILD after reading the v2
prototype in full and confirming it is far more complete than any previous
session had acknowledged.

### Key finding

The Case Study Builder v2 prototype (prototypes/case_study_builder_v2.html)
is a fully functional HTML application with 17 real sources, full EE
citations, complete proof argument with footnotes, and live conflict
analysis UI. Its JavaScript data structures (SOURCES, EVIDENCE, CONFLICTS,
PROOF_PARAGRAPHS, FOOTNOTE_DEFS) are the database schema design in disguise.
Previous sessions were treating schema design as a blocker to Phase 3.
It was not a blocker -- the prototype had already answered it.

### Changes committed this session

docs/architecture.md (commit a6e0ebab):
- Expanded from table-names-only to full column-level schema
- Tables fully defined with SQL: persons, sources, case_studies,
  case_study_sources, evidence_chain_links, conflicts, proof_paragraphs,
  footnote_definitions, citations
- Key design decision documented: triage_status lives on case_study_sources
  (junction table), not on sources -- because triage is case-study-specific
- Supporting module tables (research_sessions, documents, etc.) named;
  columns TBD before those modules are built
- Directory structure for src/ formally documented

Next.js App Router scaffold (commit f4ab7127):
- package.json: Next.js 15, React 19, Supabase JS v2, Tailwind CSS
- next.config.ts, tsconfig.json, tailwind.config.ts, postcss.config.js
- .env.local.example with Supabase and Anthropic key slots
- .gitignore (correct for Next.js, env files excluded)
- src/app/globals.css: full CSS variable design system matching prototype
  (parchment, ink, gold, triage color system, Google Fonts import)
- src/app/layout.tsx: root layout with metadata
- src/app/page.tsx: dashboard showing all 15 modules in build order
- src/app/case-study/page.tsx: Case Study Builder list (stub)
- src/app/case-study/[id]/page.tsx: 5-stage builder detail (stub)
- src/lib/supabase.ts: browser and server Supabase clients,
  GPS type aliases (TriageStatus, SourceType, InfoType, EvidenceType,
  EvidenceWeight, CaseStudyStatus)
- src/lib/ai.ts: Claude API wrapper with GRA v8.5c GPS enforcement
  system prompt baked in; engine router stub for Steve Little engines

AGENT.md v2.1.0 (commit e5399f73):
- Phase 3 marked ACTIVE
- Prototype described accurately: fully functional, not a wireframe
- New section added: "The Case Study Builder Prototype -- What It Actually Is"
- Schema-as-blocker framing removed from build order
- Case Study Builder status: BUILD READY (not just PROTOTYPE COMPLETE)
- Tech stack updated: Next.js 15, React 19, model string specified
- Build Path: Phase 2 marked COMPLETE, Phase 3 ACTIVE
- Repository Structure: src/ subdirectories documented
- Project State: reflects committed scaffold and what still needs doing
- Backlog: pruned of completed items, new items added

### Design decisions made this session

TIMESTAMP: 2026-05-10 02:40 UTC -- Schema-as-separate-session rejected.
The prototype already designed the schema. Formalizing it takes 20 minutes
at the start of a BUILD session, not a dedicated EXPLORE session.

TIMESTAMP: 2026-05-10 02:40 UTC -- Scaffold via GitHub connector, not npm.
All Next.js scaffold files are just files. Push them via connector;
user runs npm install locally. No local execution needed for file creation.

TIMESTAMP: 2026-05-10 02:50 UTC -- Triage status on junction table.
triage_status lives on case_study_sources, not sources. A source's
Green/Yellow/Red status is relative to a specific case study, not global.

### What still needs doing

1. User runs: cd /Users/dave/Project-G-Live && npm install
2. Supabase project provisioned; SQL from architecture.md run to create tables
3. Singer/Springer data seeded as first test case
4. Citation Builder (Module 4) -- first module build
5. Case Study Builder production components -- Stage 1-5 React components

---

## v2.0.0 -- 2026-05-10 00:24 UTC [Claude]

### AGENT.md rewritten: lean Claude-native operating model

This was a cleanup and restructuring session. No application code was written.

### What changed

AGENT.md completely replaced. Previous version (v1.3.1, 30,464 bytes) was
built to serve two AI platforms (Claude and Perplexity) with dual boot paths,
a security-triggering verbatim handshake string, CDN workaround instructions,
and significant overhead for platform-switching that is no longer needed.

Decision made: one-tool model going forward. Claude is the single AI platform
for this project. The GitHub connector now gives Claude direct read/write
access to the repo, eliminating the need for Claude Code for any repo
operation. Claude Code is reserved for tasks that require local execution
(running the app, npm, testing).

New AGENT.md (v2.0.0, 17,379 bytes):
- Stripped all two-platform complexity
- Stripped all CDN/raw URL workarounds
- Stripped verbatim handshake string
- Retained: session posture system, signal vocabulary, session memory
  architecture, context window pulse, snapshot format, restoration prompt
  format, session close protocol
- Retained: all project content
- Size reduction: 43% smaller

Prototype fixed:
- case_study_builder_v2.html was truncated (43,191 bytes)
- Replaced with full verified version (48,917 bytes)

### Design decisions made this session

TIMESTAMP: 2026-05-10 00:00 UTC -- One-tool model confirmed.
TIMESTAMP: 2026-05-10 00:10 UTC -- Project-G-Live confirmed as canonical repo.
TIMESTAMP: 2026-05-10 00:24 UTC -- AGENT.md v2.0.0 committed.
TIMESTAMP: 2026-05-10 00:28 UTC -- Prototype fix committed.

---

## v1.2.0 -- 2026-05-08 23:54 UTC [Perplexity]

### Operating model redesign

Deep EXPLORE session. Session posture system, signal vocabulary,
session memory architecture, restoration prompt format all designed.
No application code written.

---

## v1.1.0 -- 2026-05-08 23:29 UTC [Perplexity]

### Operating model upgrades

---

## v1.0.0 -- 2026-05-08 22:30 UTC [Perplexity]

### Project-G-Live established

---

## [INHERITED FROM PROJECT-G]

## 2026-05-07 -- Case Study Builder Prototype, Singer/Springer Session [Claude]

- Module 10 prototype v1 and v2 complete
- Jacob Singer / Yankel Springer identity proof research session
- Seven-link evidence chain constructed
- Singer_Springer_Research_Record.docx produced
