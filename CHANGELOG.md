## 2026-05-11 20:00 UTC -- Session: EXPLORE->BUILD (Steve Little Integration + Prompt Engine Library + Assertions Architecture)

EXPLORE session that transitioned to BUILD at 2026-05-11 18:45 UTC.

### EXPLORE work

Full 30,000-foot project review. Assessment covered:
- What is working well (architecture sound, schema solid, session memory holding)
- What has changed since the original plan (schema outpacing UI, Module 16 complexity)
- What is missing (assertions table, person/family management UI, prompt engine wiring)
- What is genuinely original and remarkable (Address-as-Evidence, GPS-as-architecture,
  flywheel vision, session memory architecture, prototype-first schema approach)

Full deep-dive of Steve Little's Open-Genealogy GitHub repo and Vibe Genealogy Substack.
Key findings:
- Steve is AI Program Director at the National Genealogical Society. Co-hosts
  Family History AI Show. 2000+ Substack subscribers. Background in computational
  linguistics and NLP.
- Repo contains 120+ files / 16,500+ lines: research prompts (v6-v8.5), transcription
  tools (general + Jewish-specialized), image analysis (9-layer forensic), Hebrew
  headstone analysis (10-phase with gematria), writing tools (fact extractor/narrator,
  narrative assistant, linguistic profiler, conversation abstractor, etc.), GRA skill,
  benchmark framework, and a 100KB PRD for GPS-grade AI record analysis.
- The PRD (January 2026, co-authored with Claude Opus 4.5) describes assertion
  atomization as the core architectural move. Steve's prompts are the AI engine layer;
  Project-G-Live is the application and persistence layer; the assertions table is
  where they meet.
- Steve's plan to link his workflow to a MySQL database (documented in Vibe Genealogy
  blog) is the same architectural vision as Project-G-Live.

Integration architecture decided: near-total integration approved. License: CC BY-NC-SA 4.0.
Project-G-Live is personal and non-commercial -- use is fully within license terms.

Exclusions (with reasoning):
- Photo restoration prompts: Claude should be evaluated directly first. Dave has
  achieved strong restoration results using Claude + good prompts. Do not default
  to a third-party API without testing.
- News hound, event materials synthesizer, quick editor/cleanup: too generic,
  not genealogically specific, or redundant with other engines.
- GPT configs, media folder: platform-specific or educational only.

Steve collaboration: held, not closed. Dave has interfaced with Steve online. Not
ready to approach formally yet. Revisit when the platform is further along.

Voice profile discussion: identified as important, scheduled for a future session.
The linguistic profiler + narrative assistant combo is what powers the Layer 2
narrative flywheel and researcher voice matching across Module 9 output.

### BUILD work

All committed to main. No wip/ branch.

- prompts/README.md -- engine library overview, module-engine mapping, attribution
- prompts/research/gra-v8.5.2c.md -- GPS enforcement base layer
- prompts/research/research-agent-assignment-v2.1.md -- Research Plan Builder engine
- prompts/transcription/ocr-htr-v08.md -- general diplomatic transcription
- prompts/transcription/jewish-transcription-v2.md -- Jewish document transcription
- prompts/image-analysis/deep-look-v2.md -- 9-layer forensic image analysis
- prompts/image-analysis/hebrew-headstone-helper-v9.md -- 10-phase headstone analysis
- prompts/writing/fact-extractor-v4.md -- LABEL: Value extraction
- prompts/writing/fact-narrator-v4.md -- assertions to narrative prose
- prompts/writing/narrative-assistant-v3.md -- GPS-informed narrative (3 modes)
- prompts/writing/linguistic-profiler-v3.md -- writer voice fingerprinting
- prompts/writing/conversation-abstractor-v2.md -- session/interview summarization
- prompts/writing/document-distiller-v2.md -- document summarization
- prompts/writing/image-citation-builder-v2.md -- image provenance citation
- docs/architecture/assertions-table.md -- full assertions schema spec

Still to fetch from upstream and commit:
- research-assistant-v8.md (700-line full version)
- lingua-maven-v9.md

### Key architectural decisions made this session

Assertions table (migration 015):
- Three tables: assertions, assertion_case_study_links, assertion_conflict_links
- Forward-only: no retrofitting existing data
- Evidence type stored as default; overridable per case study via join table
- Extraction method + engine version fields track AI vs. human provenance
- Sits between sources and conclusions; enables cross-module fact queries,
  Address-as-Search-Key engine, GPS-compliant proof arguments, conflict detection

Engine registry:
- callWithEngine(engineName, content, context) in src/lib/ai.ts
- No inline prompt approximations in API routes
- GRA is base layer -- composed into all research-facing routes
- All prompts load from /prompts/ directory

Revised build sequence:
1. DONE: /prompts/ directory + assertions spec
2. NEXT: callWithEngine() engine registry in src/lib/ai.ts
3. Replace inline approximations (Research Plan Builder gets real research-agent-assignment-v2.1)
4. sql/015-assertions.sql + Supabase run via Claude in Chrome
5. Module 16 (now builds on assertions foundation)
6. Module 5 upgrade (full input pipeline)
7. Module 9 Research Report Writer

- sessions/SESSION-2026-05-11-2000-UTC.md -- session snapshot
- sessions/SESSIONS-INDEX.md -- updated
- AGENT.md v2.7.7 (next)
