# Sessions Index

Format: FILENAME | TIMESTAMP | Posture | AI | one-sentence summary

---

SESSION-2026-05-16-0450-UTC.md | 2026-05-16 04:50 UTC | BUILD | Claude Code (claude-sonnet-4-6) | PersonExternal initiative complete and merged to main: migration 019 LIVE, person_external_ids = 1,576 ancestry rows, importer Phase 7 wired, pagination fix landed, orphan families cleaned -- final state persons=1,577, pei=1,576, events=5,983, families=625.
SESSION-2026-05-16-0446-UTC.md | 2026-05-16 04:46 UTC | BUILD | Claude Code (claude-sonnet-4-6) | Pagination fix landed (commit 9886492); cleanup SQL run by claude.ai; clean re-import verified -- persons=1,577, person_external_ids=1,576, timeline_events=5,983, all idempotent; one collateral finding: 1,088 orphan families (NULL partners) need follow-up DELETE.
SESSION-2026-05-16-0428-UTC.md | 2026-05-16 04:28 UTC | BUILD | Claude Code (claude-sonnet-4-6) | Migration 019 live; importer Phase 7 wired; person_external_ids = 1,576 ancestry rows (idempotency confirmed); BUT exposed pre-existing 1000-row select cap bug in persons-dedup -- 1,152 duplicate persons created across two runs; persons table needs cleanup before any further re-import.
SESSION-2026-05-16-0354-UTC.md | 2026-05-16 03:54 UTC | BUILD | Claude Code (claude-sonnet-4-6) | ftm-extractor.c updated with PersonExternal + Sync_Person; schema confirmed; Ancestry IDs (AmtId) present for all 1,576 persons in Sync_Person; FSIDs absent; PersonExternal empty; fresh extract complete.
SESSION-2026-05-16-0053-UTC.md | 2026-05-16 00:53 UTC | BUILD | Claude Code (claude-opus-4-7) | Full synced FTM tree imported (1,576 persons, 5,983 timeline events, 87.6% sourced); 10 analytical questions answered; PersonExternal & MediaFile not yet extracted; 44 research notes not imported; dry-run source-wiring report flagged as misleading.
SESSION-2026-05-15-2240-UTC.md | 2026-05-15 22:40 UTC | BUILD | Claude (claude.ai) | Session-start alignment complete: AGENT.md v2.13.1, SESSIONS-INDEX.md migrated (45 entries with filename field), stub file created for orphaned Claude Code review entry.
SESSION-2026-05-14-FTMUI-CLAUDEAI-UTC.md | 2026-05-14 15:00 UTC | BUILD | Claude (claude.ai) | FTM Bridge Phase 3 UI complete: /ftm-import page built, bug fixed, smoke tested -- Module 17 all phases done, AGENT.md v2.13.0.
SESSION-2026-05-14-CCREVIEW-UTC.md | 2026-05-14 UTC | BUILD | Claude Code (claude-sonnet-4-6) | FTM Bridge Phase 3 UI design review: architecture confirmed sound, one bug found and fixed, tsc clean, 4/4 smoke tests pass.
SESSION-2026-05-14-CLOSE-CLAUDEAI-UTC.md | 2026-05-14 UTC | BUILD | Claude (claude.ai) | Session close: triage of unclosed sessions, AGENT.md contradiction fixed, scaffold commit cherry-picked, dead icebreaker route deleted, git add -A rule added, repo clean at v2.12.3.
SESSION-2026-05-14-CLEANUP2-UTC.md | 2026-05-14 UTC | BUILD | Claude Code (claude-sonnet-4-6) | Cleanup pass 2: cherry-pick ed2402e (scaffold route + page.tsx fixes), delete dead icebreaker route, fix accidental git add -A, smoke test PASS -- all cleanup tasks closed.
SESSION-2026-05-14-CLEANUP-UTC.md | 2026-05-14 UTC | BUILD | Claude Code (claude-sonnet-4-6) | Cleanup pass 1: git pull, smoke test -- icebreaker broken (stale columns), scaffold route missing from main (stranded on worktree branch), Task 2 blocked; findings documented.
SESSION-2026-05-14-BUILD-CLAUDEAI-UTC.md | 2026-05-14 UTC | BUILD | Claude (claude.ai) | Administrative session: Known Technical Debt added, migration 020 committed, person detail page confirmed COMPLETE via Claude Code parallel session, mandatory re-read rule restored after merge loss, v2.12.1.
SESSION-2026-05-14-0400-UTC.md | 2026-05-14 04:00 UTC | BUILD | Claude (claude.ai) | v2.11.0 cleanup; migration 020 live; person detail page 9 panels built and committed
SESSION-2026-05-14-0115-UTC.md | 2026-05-14 01:15 UTC | EXPLORE | Claude (claude.ai) | AI icebreaker and maps added as first-class person detail page features; session close.
SESSION-2026-05-14-0100-UTC.md | 2026-05-14 01:00 UTC | BUILD | Claude Code (claude-sonnet-4-6) | FTM Bridge Phase 2 complete: full idempotency (delete-then-reinsert), SourceLink wiring (1117/1189 events sourced), alternate names with GEDCOM cleaning, IsLiving not importable (no column in schema 20200615).
SESSION-2026-05-13-2215-UTC.md | 2026-05-13 22:15 UTC | EXPLORE->BUILD | Claude (claude.ai) + Claude Code | Research Notes panel: migration 020, scaffold, preview toggle, has_conflicts fix; smoke test passed on Aaron Jacob Klein; v2.12.0.
SESSION-2026-05-13-2212-UTC.md | 2026-05-13 22:12 UTC | BUILD | Claude Code (claude-opus-4-7) | FTM SQLite import pipeline complete: SEE encryption cracked, scripts/ftm-extractor.c + scripts/import-ftm.mjs built and run; 143 persons, 96 families, 1189 timeline events live in Supabase.
SESSION-2026-05-13-UTC.md | 2026-05-13 UTC | BUILD | Claude Code (claude-sonnet-4-6) | AGENT.md v2.8.6 complete: Modules 12+14+13 smoke tests PASSED, 12/16 modules done, 4 remaining; session snapshot written and committed.
SESSION-2026-05-11-1430-UTC.md | 2026-05-11 14:30 UTC | BUILD | Claude (claude-sonnet-4-6) | Module 14 (DNA Evidence Tracker) complete: sql/018 live, 2 API routes, 3 pages, GPS note enforced; dashboard fixed (Module 12 now shows COMPLETE); AGENT.md v2.8.5.
SESSION-2026-05-12-POSTDINNER-UTC.md | 2026-05-12 (post-dinner close) UTC | BUILD | Claude (claude-sonnet-4-6) | Module 12 complete + MCP migrated to NPX + Dual-AI workflow + AGENT.md v2.8.4; Module 14 deferred to fresh session.
SESSION-2026-05-12-DINNER-UTC.md | 2026-05-12 (dinner session) UTC | BUILD | Claude (claude-sonnet-4-6) | Module 12 (Correspondence Log) built complete: sql/017, 2 API routes, 3 pages; migration live in Supabase.
SESSION-2026-05-12-0110-UTC.md | 2026-05-12 01:10 UTC | FIX | Claude Code | Stale .next cache diagnosed and cleared; dev server cold-started clean; all routes 200; Module 16 functional smoke test still requires human in browser.
SESSION-2026-05-12-0045-UTC.md | 2026-05-12 00:45 UTC | BUILD | Claude (claude-sonnet-4-6) | sql/015+016 run in Supabase; research-assistant-v8 + lingua-maven-v9 fetched and committed; ai.ts ENGINE_FILES complete (15 engines live); prompt library fully synced.
SESSION-2026-05-11-2200-UTC.md | 2026-05-11 22:00 UTC | BUILD (override) | Claude (claude-sonnet-4-6) | callWithEngine() complete + sql/015+016 written + Module 16 Research Investigation built + Steve Little sync system (UPSTREAM-SYNC.md) + AGENT.md v2.8.0.
SESSION-2026-05-11-2000-UTC.md | 2026-05-11 20:00 UTC | EXPLORE->BUILD | Claude (claude-sonnet-4-6) | Full 30,000-ft project review + Steve Little deep-dive + integration architecture decided + /prompts/ directory committed + assertions table spec written.
SESSION-2026-05-11-1700-UTC.md | 2026-05-11 17:00 UTC | BUILD | Claude (claude-sonnet-4-6) | Updated src/types/index.ts for migrations 009-014; smoke test confirmed no breakage from migration 011.
SESSION-2026-05-11-1030-UTC.md | 2026-05-11 10:30 UTC | FIX | Claude (claude-sonnet-4-6) | Ran migrations 009-014 in Supabase via Claude in Chrome; genealogical data foundation now live.
SESSION-2026-05-11-0940-UTC.md | 2026-05-11 09:40 UTC | FIX | Claude (claude-sonnet-4-6) | Genealogical data foundation: migrations 009-014 (persons updated, families, family_members, repositories, associations, event_types created; dual-date audit complete).
SESSION-2026-05-11-0830-UTC.md | 2026-05-11 08:30 UTC | EXPLORE | Claude (claude-sonnet-4-6) | TNG deep-dive (web research + direct DB inspection of 37 tables); decision made to rebuild genealogical data foundation before continuing module builds.
SESSION-2026-05-11-0630-UTC.md | 2026-05-11 06:30 UTC | EXPLORE | Claude (claude-sonnet-4-6) | TNG reference architecture research (v1.0 web-sourced thesis produced and committed).
SESSION-2026-05-11-0100-UTC.md | 2026-05-11 01:00 UTC | EXPLORE | Claude (claude-sonnet-4-6) | Reviewed Module 7 and Module 16 status; discussed build order and open threads.
SESSION-2026-05-11-0025-UTC.md | 2026-05-11 00:25 UTC | BUILD | Claude (claude-sonnet-4-6) | Module 7 (Timeline Builder) built complete: addresses table, timeline_events table, 4 API routes, 3 pages, AI Normalize.
SESSION-2026-05-10-2300-UTC.md | 2026-05-10 23:00 UTC | EXPLORE | Claude (claude-sonnet-4-6) | Module 7 design and sql/008; Address-as-Evidence and Address-as-Search-Key named as spine-level principles; Module 16 design doc committed.
SESSION-2026-05-10-2145-UTC.md | 2026-05-10 21:45 UTC | EXPLORE | Claude (claude-sonnet-4-6) | Module 16 design deep-dive (Research Investigation workspace; Barnholtz disambiguation use case).
SESSION-2026-05-10-2040-UTC.md | 2026-05-10 20:40 UTC | EXPLORE | Claude (claude-sonnet-4-6) | Research Investigation Module 16 scoping; standalone product vision named.
SESSION-2026-05-10-2000-UTC.md | 2026-05-10 20:00 UTC | EXPLORE | Claude (claude-sonnet-4-6) | Source Conflict Resolver smoke test results; open threads review.
SESSION-2026-05-10-1845-UTC.md | 2026-05-10 19:00 UTC | FIX->BUILD | Claude (claude-sonnet-4-6) | Supabase alias bug fixed; Module 6 (Source Conflict Resolver) built complete.
SESSION-2026-05-10-1700-UTC.md | 2026-05-10 17:00 UTC | BUILD | Claude (claude-sonnet-4-6) | Module 2 (Research Plan Builder) built complete.
SESSION-2026-05-10-0600-UTC.md | 2026-05-10 06:00 UTC | FIX->BUILD | Claude (claude-sonnet-4-6) | CSS variable bug fixed; Module 5 (Document Analysis Worksheet) built complete.
SESSION-2026-05-10-0515-UTC.md | 2026-05-10 05:15 UTC | FIX | Claude (claude-sonnet-4-6) | Citation Builder GPS radio button bug diagnosed and fixed.
SESSION-2026-05-10-0330-UTC.md | 2026-05-10 03:30 UTC | BUILD | Claude (claude-sonnet-4-6) | Citation Builder detail page and full module integration complete.
SESSION-2026-05-10-0255-UTC.md | 2026-05-10 02:55 UTC | BUILD | Claude (claude-sonnet-4-6) | Citation Builder initial build (Module 4).
SESSION-2026-05-10-0130-UTC.md | 2026-05-10 01:30 UTC | BUILD | Claude (claude-sonnet-4-6) | Supabase infrastructure setup and initial schema.
SESSION-2026-05-10-0057-UTC.md | 2026-05-10 00:57 UTC | EXPLORE | Claude (claude-sonnet-4-6) | Phase 3 planning and architecture decisions.
SESSION-2026-05-09-1835-UTC.md | 2026-05-09 18:35 UTC | BUILD | Claude (claude-sonnet-4-6) | Case Study Builder final stages and integration.
SESSION-2026-05-09-1745-UTC.md | 2026-05-09 17:45 UTC | BUILD | Claude (claude-sonnet-4-6) | Case Study Builder mid-build (stages 3-5).
SESSION-2026-05-09-1615-UTC.md | 2026-05-09 16:15 UTC | BUILD | Claude (claude-sonnet-4-6) | Module 15 (Research To-Do Tracker) built complete.
SESSION-2026-05-09-1555-UTC.md | 2026-05-09 15:55 UTC | BUILD | Claude (claude-sonnet-4-6) | Module 3 (Research Log) built complete.
SESSION-2026-05-09-0700-UTC.md | 2026-05-09 07:00 UTC | EXPLORE | Claude (claude-sonnet-4-6) | Phase 3 architecture review and module build order finalized.
SESSION-2026-05-08-2356-UTC.md | 2026-05-08 23:56 UTC | EXPLORE | Claude (claude-sonnet-4-6) | Case Study Builder prototype v2 review and schema derivation.
SESSION-2026-05-08-2335-UTC.md | 2026-05-08 23:35 UTC | EXPLORE | Claude (claude-sonnet-4-6) | Phase 2 prototype review; prototype v1 and v2 evaluated.
