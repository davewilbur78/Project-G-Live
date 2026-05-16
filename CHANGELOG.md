# Changelog

## v2.15.0 -- 2026-05-15 UTC

### PersonExternal initiative -- COMPLETE
- Discovered PersonExternal table in .ftm is empty. Ancestry IDs live in
  Sync_Person.AmtId. All 1,576 persons have AmtId populated. FSIDs universally
  NULL (tree not linked to FamilySearch).
- Migration 019 live: person_external_ids join table with UNIQUE(provider, external_id)
  and two indexes. Option B (join table) chosen over flat column per existing AGENT.md
  spec. claude.ai initially proposed Option A; Claude Code correctly pushed back.
- Importer Phase 7 live: writes Ancestry IDs into person_external_ids, idempotent
  via ON CONFLICT DO NOTHING. FamilySearch slot wired but currently zero rows.
- Pagination fix (commit 9886492): existing-persons fetch in import-ftm.mjs was
  silently capped at 1000 rows. Now loops range() calls until all persons retrieved.
  Pre-existing latent bug; first triggered on 2nd+ run of a >1000-person tree.
- Families orphan cleanup: 1,088 double-NULL rows deleted. Root cause: partner1_id
  and partner2_id use ON DELETE SET NULL. 89 single-NULL families left intact.
- Final database state: 1,577 persons / 1,576 person_external_ids / 5,983
  timeline_events / 625 families / 2,204 family_members. All idempotent.
- Main branch at 24b0a0b (7 commits from Claude Code + migration + cleanup from claude.ai).

---

## v2.14.0 -- 2026-05-16 UTC

### Full synchronized FTM tree import -- COMPLETE
- Full synchronized tree live in Supabase: 1,576 persons, 625 families, 5,983 timeline
  events, 87.6% source-wired (5,237 events), 1,930 sources, 4 repositories.
- Replaced prior 144-person test tree. Tree: KLEIN-SINGER and WILBUR-DALIMORE 2025.
- Stats endpoint .in() chunking fix: 3 calls in route.ts chunked to 200 per batch.
- Dry-run sourceIdMap fix: placeholder UUIDs now populated in dry-run mode; wiring
  report is now meaningful in dry-run.
- Branch claude/keen-newton-3ef48d merged to main at 529d708.

### Architectural decisions locked
- Extractor Phase 3 scope: PersonExternal first, then MediaFile/MediaLink, then Marker.
- Migration 019 gated on extractor update confirming PersonExternal data present.
- Notes pipeline: new ftm_notes table, RTF stripped at import, source_id FK nullable,
  discrete entries not merged into person_research_notes.
- Media architecture: no bulk storage import. Selective on-demand pipeline.
  R2/B2 when the time comes. Future Module 18.
- Fact-type long tail: Category A tags added to TAG_TO_EVENT (ARVL/DPRT as
  arrival/departure, naturalization sub-tags kept granular). Category B regex
  normalizer to collapse ~140 narrative types to 6-8 pattern-based event types.
  Original fact name preserved in description field. .trim() on all tag fields.
- Media-as-unanalyzed-evidence principle named: every attached image is a dormant
  research opportunity for the Document Analysis pipeline.
- alt_names primary-name dedup: fix in next importer session.

---

## v2.13.1 -- 2026-05-15 UTC

### Session-start alignment
- AGENT.md lines 14-16 updated: two-step /sessions/ navigation now instructs Claude.ai
  to read SESSIONS-INDEX.md first, extract the filename from the first field of the first
  entry (most-recent-first), then read that snapshot file in full. Fallback to directory
  scan if index is missing or filename does not resolve.
- AGENT.md session close protocol step 5 updated: now specifies filename as first field
  in SESSIONS-INDEX entry format.
- AGENT.md SESSIONS-INDEX format definition updated: FILENAME | TIMESTAMP | Posture | AI | summary.
- SESSIONS-INDEX.md migrated: filename prepended to all 45 existing entries.
- Stub file SESSION-2026-05-14-CCREVIEW-UTC.md created on main.

---

## v2.13.0 -- 2026-05-14 UTC

### FTM Bridge Phase 3 UI -- COMPLETE
- Built `/ftm-import` page (Module 17 Phase 3). All three phases of Module 17 now complete.
- Bug fix: removed cancelled guard from post-import fetchStats() timeout.
- Dashboard updated: Module 17 FTM Bridge added as COMPLETE.
- tsc clean. Smoke test PASSED.

---

## v2.12.3 -- 2026-05-14 UTC
Cleanup pass: scaffold commit cherry-picked, dead icebreaker route deleted,
git add -A incident rolled back, .claude/ added to .gitignore.

---

## v2.12.0 -- 2026-05-13 UTC
Research Notes panel: migration 020 live, scaffold route, preview toggle.

---

## v2.11.0 -- 2026-05-14 UTC
Person detail page: 9 panels complete. Migration 020 live.

---

## v2.9.1 -- 2026-05-13 UTC
Module 16 bug fix: persons join used wrong column names.

---

## v2.8.6 -- 2026-05-13 UTC
Modules 12, 14, 13 complete and smoke tested. FTM Bridge Phase 1 + Phase 2 complete.

---

## v2.8.0 -- 2026-05-11 UTC
callWithEngine() complete. 15 prompt engines live. Module 16 built.

---

## Earlier versions
See /sessions/ archive for full history.
