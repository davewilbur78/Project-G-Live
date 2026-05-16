--- SESSION SNAPSHOT ---
TIMESTAMP: 2026-05-16 UTC
Captured by: Claude (claude.ai)
Posture at capture: BUILD
Trigger: session close

WHAT THIS SESSION WAS DOING
Opened with BUILD posture declared by Dave. Authored and refined the full tree import brief
for Claude Code (Opus), incorporating a round of Claude Code review feedback before handoff.
Supervised the import run, received the 10-question analysis back from Claude Code, read the
full session snapshot, and locked in all architectural decisions for the next phase of FTM
Bridge work. Coordinated the branch merge and repo cleanup.

STATE AT CAPTURE -- TIMESTAMP: 2026-05-16 UTC
All work committed. Repo clean at 529d708 (merge commit) plus this session close commit.
No wip/ branch.

Full synchronized tree is live in Supabase:
  1,576 persons (1,577 total including 1 pre-existing)
  625 families (721 total including prior)
  5,983 timeline events
  87.6% source-wired (5,237 events)
  1,930 sources, 4 repositories

Two code fixes committed by Claude Code (commit e4e064c):
  - Stats endpoint .in() chunking: 3 calls chunked to 200 per batch
  - Dry-run sourceIdMap: now populates with placeholder UUIDs, wiring report meaningful

Merge of claude/keen-newton-3ef48d to main: clean at 529d708.
One comment-only conflict in ftm-import/page.tsx resolved cleanly.

DECISIONS MADE THIS SESSION
TIMESTAMP: 2026-05-16 UTC -- Extractor update before migration 019. Confirm PersonExternal
  data exists in synced .ftm before designing schema. Claude Code job.
TIMESTAMP: 2026-05-16 UTC -- Extractor Phase 3 scope: PersonExternal first, then
  MediaFile/MediaLink, then Marker.
TIMESTAMP: 2026-05-16 UTC -- Notes pipeline: new ftm_notes table, RTF stripped at import,
  source_id FK nullable, discrete entries not merged into person_research_notes.
TIMESTAMP: 2026-05-16 UTC -- No bulk media storage import. Selective on-demand pipeline
  is the architecture. R2/B2 when the time comes. Flag as future Module 18.
TIMESTAMP: 2026-05-16 UTC -- Fact-type long tail: Category A tags added to TAG_TO_EVENT
  (ARVL/DPRT as arrival/departure, naturalization sub-tags kept granular, _MILT, ADDR,
  CHR, PROB, DIVF, whitespace-caused IMMI/OCCU duplicates). Category B collapsed via
  regex normalizer to ~6-8 pattern types (obituary, marriage_announcement,
  marriage_license, birth_announcement, wedding_announcement, newspaper_mention).
  Original fact name preserved in description field.
TIMESTAMP: 2026-05-16 UTC -- .trim() on all factTypeTag and factTypeName fields.
  Non-negotiable cleanup.
TIMESTAMP: 2026-05-16 UTC -- alt_names primary-name dedup: fix in next importer session,
  not standalone.
TIMESTAMP: 2026-05-16 UTC -- Media-as-unanalyzed-evidence principle named and locked.
  Every attached image is a dormant research opportunity. Import run inventory is the
  basis for deciding which files to run through the AI pipeline. Census images, ship
  manifests, draft cards, death certificates, photographs -- all candidates for
  Document Analysis Worksheet pipeline when selective import is built.

OPEN THREADS -- TIMESTAMP: 2026-05-16 UTC
- Extractor update: PersonExternal pull. Claude Code next session.
- ftm_notes table design and importer extension: decisions locked, build pending.
- Fact-type normalizer pass: decisions locked, build pending.
- Untracked files on main left untouched: package-lock.json, prototypes/dashboard-mockup-v1.html,
  scripts/import-gedcom.js, sessions/SESSION-2026-05-14-REVIEW-CLAUDECODE-UTC.md.
  Dave to decide what to do with these separately.
- Migration 019 (person_external_ids): gated on extractor update.
- Vercel deployment: still pending, priority 2 per AGENT.md.
- Voice profile discussion: still pending, gates Module 9.

PARTIALLY BUILT WORK
None.

DO NOT DO THIS
- Do not design migration 019 before extractor confirms PersonExternal data exists.
- Do not bulk import all 3.4GB of media. That is not the architecture.
- Do not reopen the Category A/B fact-type decisions. They are closed.

NEXT IMMEDIATE ACTION
TIMESTAMP: 2026-05-16 UTC
Clause Code: update ftm-extractor.c to pull PersonExternal table. Recompile.
Run against synced .ftm. Confirm Ancestry IDs and FSIDs are present. Report to claude.ai.
Then design migration 019 together.
--- END SNAPSHOT ---
