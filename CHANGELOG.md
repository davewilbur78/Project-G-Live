# Changelog

## v2.17.1 -- 2026-05-16 20:50 UTC

### App design exploration -- EXPLORE session

- Committed docs/architecture/app-design-exploration.md as a living design document.
  Captures module taxonomy problem, draft navigation groupings, Person Hub gap,
  open threads (Ancestry tree sources, Connie Knox), and build priority order.
- Module taxonomy clarified: infrastructure components (File Naming System, FTM Bridge,
  Citation Builder) do not belong in main navigation. Working nav is ~8-10 destinations.
- Person Detail Page identified as having no front door. People section (search + browse)
  named as next build target.
- Vercel deployment correctly deferred: gated on navigation restructure + People hub.
  Deploy when the app is coherent enough to use daily, not before.
- Connie Knox Ancestry playlist session established as the required next EXPLORE step
  before any navigation or person-page design work begins.
- AGENT.md: new "App Design and Navigation" section added. Build priority order updated.
  Deployment note in tech stack and build path updated to reflect gating.
  Ancestry tree sources technical debt entry added.

---

## v2.17.0 -- 2026-05-16 19:30 UTC

### Fact-type normalizer -- COMPLETE
- Category A: ARVL, DPRT, CHR, ADDR, PROB, DIVF, _MILT added to TAG_TO_EVENT.
  .trim() applied to all factTypeTag/factTypeName fields.
- Category B: regex normalizer collapses ~140 unique custom FTM fact names.
  Naturalization sub-events kept granular. Media/newspaper types discrete.
  All others collapse to "other". Original fact name preserved in description.
- Migration 022: timeline_events check constraint expanded to include all new types.
  Run via Supabase Management API. Returned []. Live.
- Migration 021 (ftm_notes): also run this session. Live.
- Full live import completed: 1,576 persons, 625 families, 5,980 timeline events, 44 notes.
- Parallel-sessions git conflict resolved via merge (not rebase). Rebase tangles
  old commits on this repo -- confirmed again.

---

## v2.16.0 -- 2026-05-16 UTC

### Notes pipeline -- COMPLETE
- Migration 021 (sql/021-ftm-notes.sql): ftm_notes table with UNIQUE(person_id, ftm_note_id),
  cascade delete on persons, nullable source_id for future source linking.
- Importer Phase 8: filters LinkTableID=5 (person notes only), strips RTF via existing
  stripRTF(), upserts in batches of 200 on UNIQUE constraint. Idempotent across re-runs.
- persons.notes (concatenated blob) preserved for backward compatibility alongside discrete rows.
- Migration 021 committed and ready; must be run in Supabase before Phase 8 activates.

### PostgREST schema cache warmup -- canonical pattern established
- Phase 8 polls up to 10 x 2 seconds before upsert into ftm_notes. If table is not
  visible after 10 attempts, throws a clear error directing user to run migration 021.
- Pattern documented in AGENT.md as the reference implementation for all future phases
  that write to freshly-migrated tables.

### Operational platform knowledge added to AGENT.md
- Supabase Management API (localStorage token + /v1/projects/.../database/query) adopted
  as the primary DDL mechanism for Claude Code. CodeMirror form_input deprecated permanently.
- PostgREST cache lag pattern: poll 10 x 2s, throw clear error. Phase 8 is canonical ref.
- SESSIONS-INDEX.md git rebase conflicts: always keep-both-sides, most-recent-first.
- Tab group hygiene: create fresh tab group at start of each Claude in Chrome session.

---

## v2.15.0 -- 2026-05-15 UTC

### PersonExternal initiative -- COMPLETE
- Discovered PersonExternal table in .ftm is empty. Ancestry IDs live in
  Sync_Person.AmtId. All 1,576 persons have AmtId populated. FSIDs universally
  NULL (tree not linked to FamilySearch).
- Migration 019 live: person_external_ids join table with UNIQUE(provider, external_id)
  and two indexes.
- Importer Phase 7 live: writes Ancestry IDs into person_external_ids, idempotent
  via ON CONFLICT DO NOTHING.
- Pagination fix (commit 9886492): existing-persons fetch silently capped at 1000 rows.
  Now loops range() calls until all persons retrieved.
- Families orphan cleanup: 1,088 double-NULL rows deleted.
- Final database state: 1,577 persons / 1,576 person_external_ids / 5,983
  timeline_events / 625 families / 2,204 family_members. All idempotent.

---

## v2.14.0 -- 2026-05-16 UTC

### Full synchronized FTM tree import -- COMPLETE
- Full synchronized tree live in Supabase: 1,576 persons, 625 families, 5,983 timeline
  events, 87.6% source-wired, 1,930 sources, 4 repositories.
- Replaced prior 144-person test tree.
- Stats endpoint .in() chunking fix and dry-run sourceIdMap fix applied.

---

## v2.13.1 -- 2026-05-15 UTC
Session-start alignment: SESSIONS-INDEX.md navigation protocol updated, filename
prepended to all 45 existing entries.

## v2.13.0 -- 2026-05-14 UTC
FTM Bridge Phase 3 UI complete. Module 17 all phases done.

## v2.12.3 -- 2026-05-14 UTC
Cleanup pass: scaffold commit cherry-picked, dead icebreaker route deleted,
git add -A incident rolled back.

## v2.12.0 -- 2026-05-13 UTC
Research Notes panel: migration 020 live, scaffold route, preview toggle.

## v2.11.0 -- 2026-05-14 UTC
Person detail page: 9 panels complete. Migration 020 live.

## v2.9.1 -- 2026-05-13 UTC
Module 16 bug fix: persons join used wrong column names.

## v2.8.6 -- 2026-05-13 UTC
Modules 12, 14, 13 complete and smoke tested. FTM Bridge Phase 1 + Phase 2 complete.

## v2.8.0 -- 2026-05-11 UTC
callWithEngine() complete. 15 prompt engines live. Module 16 built.

---

## Earlier versions
See /sessions/ archive for full history.
